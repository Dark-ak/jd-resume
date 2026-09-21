import { GoogleGenAI, type Schema } from "@google/genai";
import type { ProviderGenerateArgs } from "@/lib/aiProvider";

const GEMINI_MODEL = "gemini-3.6-flash";

export async function generateWithGemini(
  args: ProviderGenerateArgs,
): Promise<string> {
  const ai = new GoogleGenAI({ apiKey: args.apiKey });

  const response = await ai.models.generateContent({
    model: GEMINI_MODEL,
    contents: [
      {
        role: "user",
        parts: [{ text: `${args.systemPrompt}\n\n${args.userPrompt}` }],
      },
    ],
    config: {
      responseMimeType: "application/json",
      responseSchema: args.responseSchema as Schema,
    },
  });
  const text = response.text || "";
  if (!text.trim()) {
    throw new Error("Empty response received from AI model");
  }
  return text;
}
