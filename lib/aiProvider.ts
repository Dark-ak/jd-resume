/**
 * Shared AI-provider plumbing for the resume API routes.
 *
 * No provider gets special treatment: every provider in `lib/providers/`
 * implements the same `ProviderAdapter` contract
 * `({ apiKey, systemPrompt, userPrompt, responseSchema, schemaName }) => raw JSON string`.
 * Routes call `runResumeAI()` — they contain no provider branches and no SDK imports.
 * Throw on failure — routes translate it into a 500 `{ error }` response.
 */

import { generateWithGemini } from "@/lib/providers/geminiProvider";
import { generateWithMuseSpark } from "@/lib/providers/museSparkProvider";
import { generateWithOpenRouter } from "@/lib/providers/openRouterProvider";

export type AiProvider = "gemini" | "muse-spark" | "openrouter";

export const DEFAULT_PROVIDER: AiProvider = "gemini";

export function parseProvider(value: unknown): AiProvider {
  if (value === "muse-spark" || value === "openrouter" || value === "gemini") {
    return value;
  }
  return DEFAULT_PROVIDER;
}

/** Display metadata for the key-modal provider selector. */
export const PROVIDER_META: Record<
  AiProvider,
  { label: string; envName: string; keyUrl: string; keyUrlLabel: string }
> = {
  gemini: {
    label: "Gemini",
    envName: "GEMINI_API_KEY",
    keyUrl: "https://aistudio.google.com/app/apikey",
    keyUrlLabel: "AI Studio",
  },
  "muse-spark": {
    label: "Muse Spark",
    envName: "MUSE_SPARK_API_KEY",
    keyUrl: "#",
    keyUrlLabel: "Muse Spark console",
  },
  openrouter: {
    label: "OpenRouter",
    envName: "OPENROUTER_API_KEY",
    keyUrl: "https://openrouter.ai/keys",
    keyUrlLabel: "OpenRouter keys",
  },
};

/** Server-side env fallback per provider (after the client-supplied key). */
export function providerEnvKey(provider: AiProvider): string | undefined {
  if (provider === "muse-spark") return process.env.MUSE_SPARK_API_KEY;
  if (provider === "openrouter") return process.env.OPENROUTER_API_KEY;
  return undefined;
}

/**
 * BYOK key resolution: visitor's per-request key first (request-scoped, never
 * logged/persisted), then server env (local dev / keyless-deploy fallback).
 */
export function resolveApiKey(
  provider: AiProvider,
  clientKey: unknown,
): string | undefined {
  const fromClient =
    typeof clientKey === "string" && clientKey ? clientKey : undefined;
  return (
    fromClient ||
    providerEnvKey(provider) ||
    process.env.AI_API_KEY ||
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_GENAI_API_KEY ||
    undefined
  );
}

export interface ProviderGenerateArgs {
  apiKey: string;
  /** Instruction prompt (parser role, tailoring guidelines, ...). */
  systemPrompt: string;
  /** Payload prompt (resume text or resume JSON + JD). */
  userPrompt: string;
  /**
   * Native shared schema object from `lib/schema/resume.ts` (Gemini dialect).
   * Adapters translate it as needed (e.g. OpenRouter maps it to strict JSON Schema).
   */
  responseSchema: unknown;
  /** Structured-output name, e.g. "resume_extraction" | "resume_tailoring". */
  schemaName: string;
}

export type ProviderAdapter = (args: ProviderGenerateArgs) => Promise<string>;

const ADAPTERS: Record<AiProvider, ProviderAdapter> = {
  gemini: generateWithGemini,
  "muse-spark": generateWithMuseSpark,
  openrouter: generateWithOpenRouter,
};

export async function runResumeAI(
  args: ProviderGenerateArgs & { provider: AiProvider },
): Promise<string> {
  return ADAPTERS[args.provider](args);
}
