import { NextRequest, NextResponse } from "next/server";
import { parseProvider, resolveApiKey, runResumeAI } from "@/lib/aiProvider";
import { type Resume, resumeTailoringSchema } from "@/lib/schema/resume";

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    // BYOK: the visitor's own key arrives per-request (used once, never
    // logged or persisted). Server env is the fallback for local dev.
    const {
      resume,
      jobDescription,
      apiKey: clientApiKey,
      provider: rawProvider,
    } = body;
    const provider = parseProvider(rawProvider);

    if (!resume) {
      return NextResponse.json(
        { error: "Missing resume data in request body" },
        { status: 400 },
      );
    }

    if (
      !jobDescription ||
      typeof jobDescription !== "string" ||
      jobDescription.trim().length === 0
    ) {
      return NextResponse.json(
        { error: "Missing or empty jobDescription in request body" },
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

    const systemPrompt = `You are an elite Career Coach and ATS Resume Optimization Expert.
Your mission is to tailor the candidate's current resume to best match the target Job Description while preserving truthfulness.

CRITICAL GUIDELINES:
1. SUMMARY:
    - Rewrite the professional summary into 2-3 punchy, compelling sentences tailored specifically to the target role.
    - Highlight the candidate's most relevant years of experience, core technical competencies, and value proposition matching the JD requirements.

2. WORK EXPERIENCE BULLET POINTS:
    - Rewrite each bullet point using the Google XYZ formula: "Accomplished [X] as measured by [Y], by doing [Z]".
    - Weave in high-priority keywords, frameworks, libraries, and methodologies mentioned in the Job Description where they naturally fit the candidate's background.
    - Use strong, diverse action verbs (e.g., "Orchestrated", "Architected", "Spearheaded", "Optimized", "Engineered").
    - DO NOT fabricate entirely fake companies or job titles. Keep the candidate's real history intact while elevating the relevance of their work.

3. SKILLS:
    - Re-group and prioritize technical skills: place skills most sought after in the Job Description at the very front of each category.
    - Add relevant industry terminology, tools, or methodologies from the JD that align with the candidate's experience.

4. ATS FORMATTING:
    - Maintain clean, concise language with zero fluff or passive voice.
    - Retain all personal contact info, education institutions, degrees, and dates.`;

    const userPrompt = `--- TARGET JOB DESCRIPTION ---\n${jobDescription}\n\n--- CURRENT RESUME (JSON) ---\n${JSON.stringify(resume, null, 2)}`;

    const responseText = await runResumeAI({
      provider,
      apiKey,
      systemPrompt,
      userPrompt,
      responseSchema: resumeTailoringSchema,
      schemaName: "resume_tailoring",
    });

    if (!responseText) {
      throw new Error("Empty response received from AI model");
    }

    const tailored: Resume = JSON.parse(responseText);

    // Keep and normalize IDs
    if (tailored.experience) {
      tailored.experience = tailored.experience.map((exp, idx) => ({
        ...exp,
        id:
          exp.id ||
          resume.experience?.[idx]?.id ||
          `exp-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        location: exp.location || resume.experience?.[idx]?.location || "",
        current: exp.current ?? resume.experience?.[idx]?.current ?? false,
        bullets: exp.bullets || [],
      }));
    }

    if (tailored.education) {
      tailored.education = tailored.education.map((edu, idx) => ({
        ...edu,
        id:
          edu.id ||
          resume.education?.[idx]?.id ||
          `edu-${idx}-${Math.random().toString(36).substring(2, 7)}`,
        field: edu.field || "",
        gpa: edu.gpa || "",
      }));
    }

    if (!tailored.projects) tailored.projects = resume.projects || [];
    if (!tailored.certifications)
      tailored.certifications = resume.certifications || [];

    return NextResponse.json({
      success: true,
      resume: tailored,
    });
  } catch (error: unknown) {
    console.error("Resume Tailoring API Error:", error);
    const message =
      error instanceof Error ? error.message : "Internal Server Error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
