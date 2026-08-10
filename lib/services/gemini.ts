import { GoogleGenAI, FunctionDeclaration, Content } from "@google/genai";

export const EMBEDDING_DIMS = 768;
const CHAT_MODEL = "gemini-flash-latest";
const EMBED_MODEL = "gemini-embedding-001";

/**
 * Gemini's free tier caps requests per project per day, so we support a pool of keys
 * (each ideally from a separate project) and rotate to the next one when the current
 * key is rate-limited or exhausted. Keys are read from GEMINI_API_KEY and
 * GEMINI_API_KEY_2..N.
 */
function getApiKeys(): string[] {
  const keys = [process.env.GEMINI_API_KEY];
  for (let i = 2; i <= 5; i++) {
    keys.push(process.env[`GEMINI_API_KEY_${i}`]);
  }
  return keys.filter((k): k is string => Boolean(k && k.trim()));
}

const clients = new Map<string, GoogleGenAI>();
/** Index of the key we start from; advances permanently once a key is exhausted. */
let activeKeyIndex = 0;

export function isGeminiConfigured(): boolean {
  return getApiKeys().length > 0;
}

function getClientForKey(key: string): GoogleGenAI {
  let client = clients.get(key);
  if (!client) {
    client = new GoogleGenAI({ apiKey: key });
    clients.set(key, client);
  }
  return client;
}

/**
 * True for errors where retrying with a *different* key is likely to succeed:
 * quota exhaustion (429), permission problems (403), and auth failures (401,
 * e.g. a key that was revoked or expired). Anything else — a malformed request,
 * an unknown model — would fail identically on every key, so we surface it.
 */
function isKeyExhaustedError(err: unknown): boolean {
  const status = (err as { status?: number })?.status;
  if (status === 429 || status === 403 || status === 401) return true;
  const message = (err as Error)?.message ?? "";
  return /RESOURCE_EXHAUSTED|quota|rate limit|too many requests|invalid authentication/i.test(message);
}

/**
 * Runs `fn` against each configured key in turn, moving on when a key is exhausted.
 * The first key that works becomes the new starting point for subsequent calls.
 */
async function withKeyFailover<T>(fn: (ai: GoogleGenAI) => Promise<T>): Promise<T> {
  const keys = getApiKeys();
  if (keys.length === 0) {
    throw new Error("Gemini is not configured: set GEMINI_API_KEY");
  }

  let lastError: unknown;
  for (let attempt = 0; attempt < keys.length; attempt++) {
    const index = (activeKeyIndex + attempt) % keys.length;
    try {
      const result = await fn(getClientForKey(keys[index]));
      activeKeyIndex = index;
      return result;
    } catch (err) {
      lastError = err;
      if (!isKeyExhaustedError(err)) throw err;
      console.warn(
        `[gemini] key #${index + 1} of ${keys.length} exhausted or rate-limited; trying next key.`
      );
    }
  }
  throw lastError;
}

export async function embedText(text: string): Promise<number[]> {
  const res = await withKeyFailover((ai) =>
    ai.models.embedContent({
      model: EMBED_MODEL,
      contents: text,
      config: { outputDimensionality: EMBEDDING_DIMS },
    })
  );
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
  const response = await withKeyFailover((ai) =>
    ai.models.generateContent({
      model: CHAT_MODEL,
      contents,
      config: {
        tools: [{ functionDeclarations: tools }],
        systemInstruction:
          "You are a warm, knowledgeable library assistant speaking to a patron by voice. " +
          "Keep spoken responses concise (2-4 sentences) and conversational, never use markdown or bullet points since this is spoken aloud. " +
          "Always ground book claims in tool results, never invent books. When recommending, briefly explain why.",
      },
    })
  );
  const functionCalls = (response.functionCalls ?? []).map((fc) => ({
    name: fc.name ?? "",
    args: (fc.args ?? {}) as Record<string, unknown>,
  }));
  return { functionCalls, text: response.text ?? "", modelContent: response.candidates?.[0]?.content };
}
