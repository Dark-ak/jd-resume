import { NextRequest, NextResponse } from "next/server";
import { parseProvider, resolveApiKey, runResumeAI } from "@/lib/aiProvider";
import { type Resume, resumeExtractionSchema } from "@/lib/schema/resume";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // BYOK: the visitor's own key arrives per-request (used once, never
    // logged or persisted). Server env is the fallback for local dev.
    const { rawText, apiKey: clientApiKey, provider: rawProvider } = body;
    const provider = parseProvider(rawProvider);

    if (
      !rawText ||
      typeof rawText !== "string" ||
      rawText.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Missing rawText in request body" },
        { status: 400 },
      );
    }

    const apiKey = resolveApiKey(provider, clientApiKey);

    if (!apiKey) {
      return NextResponse.json(
        {
          error:
            "No AI API key found. Paste your key in the UI or set it in your .env.local file.",
          needsApiKey: true,
        },
        { status: 400 },
      );
    }

    const systemPrompt =
      "You are an expert ATS resume parser. Extract every piece of information accurately from the following raw resume text into the requested structured format. Ensure company names, job titles, start and end dates, locations, bullet points with numbers and metrics, education details, and skills are completely preserved.";
    const userPrompt = `--- RAW RESUME TEXT ---\n${rawText}`;

    const responseText = await runResumeAI({
      provider,
      apiKey,
      systemPrompt,
      userPrompt,
      responseSchema: resumeExtractionSchema,
      schemaName: "resume_extraction",
    });

    if (!responseText) {
      throw new Error("Empty response returned by AI model");
    }

    const parsed: Resume = JSON.parse(responseText);

    // Guarantee unique IDs for mapped items
    if (parsed.experience) {
      parsed.experience = parsed.experience.map((exp, idx) => ({
        ...exp,
        id:
          exp.id || `exp-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        location: exp.location || "",
        current: exp.current || exp.endDate?.toLowerCase() === "present",
        bullets: exp.bullets || [],
      }));
    }

    if (parsed.education) {
      parsed.education = parsed.education.map((edu, idx) => ({
        ...edu,
        id:
          edu.id || `edu-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        field: edu.field || "",
        gpa: edu.gpa || "",
      }));
    }

    if (parsed.skills) {
      parsed.skills = parsed.skills.map((s) => ({
        category: s.category || "General Skills",
        items: s.items || [],
      }));
    }

    if (!parsed.projects) parsed.projects = [];
    if (!parsed.certifications) parsed.certifications = [];

    return NextResponse.json({
      success: true,
      resume: parsed,
    });
  } catch (error: unknown) {
    console.error("Resume Extraction API Error:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
