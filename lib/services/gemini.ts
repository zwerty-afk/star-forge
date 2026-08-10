import { GoogleGenAI, FunctionDeclaration, Content } from "@google/genai";

export const EMBEDDING_DIMS = 768;
const CHAT_MODEL = "gemini-flash-latest";
const EMBED_MODEL = "gemini-embedding-001";

let client: GoogleGenAI | null = null;

export function isGeminiConfigured(): boolean {
  return Boolean(process.env.GEMINI_API_KEY);
}

function getClient(): GoogleGenAI {
  if (!isGeminiConfigured()) {
    throw new Error("Gemini is not configured: missing GEMINI_API_KEY");
  }
  if (!client) {
    client = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY! });
  }
  return client;
}

export async function embedText(text: string): Promise<number[]> {
  const ai = getClient();
  const res = await ai.models.embedContent({
    model: EMBED_MODEL,
    contents: text,
    config: { outputDimensionality: EMBEDDING_DIMS },
  });
  const values = res.embeddings?.[0]?.values;
  if (!values) throw new Error("Gemini returned no embedding");
  return l2Normalize(values);
}

function l2Normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  if (norm === 0) return vec;
  return vec.map((v) => v / norm);
}

export interface GenerateWithToolsResult {
  functionCalls: { name: string; args: Record<string, unknown> }[];
  text: string;
  /** The model's raw response content (including thought_signature parts), to replay verbatim into the next turn's contents. */
  modelContent: Content | undefined;
}

export async function generateWithTools(
  contents: Content[],
  tools: FunctionDeclaration[]
): Promise<GenerateWithToolsResult> {
  const ai = getClient();
  const response = await ai.models.generateContent({
    model: CHAT_MODEL,
    contents,
    config: {
      tools: [{ functionDeclarations: tools }],
      systemInstruction:
        "You are a warm, knowledgeable library assistant speaking to a patron by voice. " +
        "Keep spoken responses concise (2-4 sentences) and conversational, never use markdown or bullet points since this is spoken aloud. " +
        "Always ground book claims in tool results, never invent books. When recommending, briefly explain why.",
    },
  });
  const functionCalls = (response.functionCalls ?? []).map((fc) => ({
    name: fc.name ?? "",
    args: (fc.args ?? {}) as Record<string, unknown>,
  }));
  return { functionCalls, text: response.text ?? "", modelContent: response.candidates?.[0]?.content };
}
