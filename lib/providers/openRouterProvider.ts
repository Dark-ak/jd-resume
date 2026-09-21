import { OpenRouter } from "@openrouter/sdk";
import type { ProviderGenerateArgs } from "@/lib/aiProvider";

const MODELS = [
  "qwen/qwen3.8-27b:free",
  "nvidia/nemotron-3-ultra-550b-a55b:free",
  "z-ai/glm-5.2:free",
];

/**
 * Convert our shared Gemini-dialect schema objects (`Type.OBJECT`, ...)
 * into standard JSON Schema for `strict: true` mode:
 * - UPPERCASE enum values → lowercase (`"OBJECT"` → `"object"`, ...)
 * - every object level gets `required: [...all keys]` + `additionalProperties: false`
 *   (strict mode rejects partial `required` lists)
 */
function toJsonSchema(node: unknown): unknown {
  const TYPE_MAP: Record<string, string> = {
    OBJECT: "object",
    STRING: "string",
    ARRAY: "array",
    BOOLEAN: "boolean",
    NUMBER: "number",
    INTEGER: "integer",
  };
  if (Array.isArray(node)) return node.map(toJsonSchema);
  if (node && typeof node === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(node)) {
      if (key === "type" && typeof value === "string") {
        out[key] = TYPE_MAP[value] ?? value;
      } else {
        out[key] = toJsonSchema(value);
      }
    }
    if (out.type === "object") {
      const props =
        out.properties && typeof out.properties === "object"
          ? out.properties
          : {};
      out.required = Object.keys(props);
      out.additionalProperties = false;
    }
    return out;
  }
  return node;
}

function contentToText(content: unknown): string {
  if (typeof content === "string") return content;
  if (Array.isArray(content)) {
    return content
      .map((part) => {
        if (typeof part === "string") return part;
        if (
          part &&
          typeof part === "object" &&
          "text" in part &&
          typeof (part as { text: unknown }).text === "string"
        ) {
          return (part as { text: string }).text;
        }
        return "";
      })
      .join("");
  }
  return "";
}

export async function generateWithOpenRouter(
  args: ProviderGenerateArgs,
): Promise<string> {
  const client = new OpenRouter({
    apiKey: args.apiKey,
    appTitle: "JD Resume",
  });

  const completion = await client.chat.send({
    chatRequest: {
      models: MODELS,
      messages: [
        { role: "system", content: args.systemPrompt },
        { role: "user", content: args.userPrompt },
      ],
      responseFormat: {
        type: "json_schema",
        jsonSchema: {
          name: args.schemaName,
          strict: true,
          schema: toJsonSchema(args.responseSchema) as { [k: string]: unknown },
        },
      },
    },
  });

  if (completion instanceof ReadableStream) {
    throw new Error("Expected a non-streaming response");
  }

  const text = contentToText(completion.choices[0]?.message?.content);
  if (!text.trim()) {
    throw new Error("Empty response received from AI model");
  }
  return text;
}
