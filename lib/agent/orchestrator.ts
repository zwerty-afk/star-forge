import { Content, Part } from "@google/genai";
import { generateWithTools, isGeminiConfigured } from "../services/gemini";
import { executeTool, toolDeclarations } from "./tools";
import { searchBooks } from "../services/books";
import { saveMemory } from "../services/memory";
import type { AgentRequest, AgentResponse, BookResult, ToolTrace } from "../types";

const MAX_TOOL_ROUNDS = 4;

export async function runAgent(request: AgentRequest): Promise<AgentResponse> {
  const start = Date.now();

  if (!isGeminiConfigured()) {
    return runDemoAgent(request, start);
  }

  try {
    return await runLiveAgent(request, start);
  } catch (err) {
    console.error("[agent] live run failed, falling back to demo:", err);
    return runDemoAgent(request, start, true);
  }
}

async function runLiveAgent(request: AgentRequest, start: number): Promise<AgentResponse> {
  const contents: Content[] = [
    ...request.history.map((m) => ({
      role: m.role === "user" ? "user" : "model",
      parts: [{ text: m.text }] as Part[],
    })),
    { role: "user", parts: [{ text: request.message }] },
  ];

  const toolTrace: ToolTrace[] = [];
  const collectedBooks: BookResult[] = [];
  let mode: "live" | "demo" = "live";

  for (let round = 0; round < MAX_TOOL_ROUNDS; round++) {
    const llmStart = Date.now();
    const { functionCalls, text, modelContent } = await generateWithTools(contents, toolDeclarations);
    const llmMs = Date.now() - llmStart;

    if (functionCalls.length === 0) {
      return {
        text: text || "I'm not sure how to help with that yet — could you rephrase?",
        books: dedupeBooks(collectedBooks),
        toolTrace,
        mode,
        timings: { totalMs: Date.now() - start, llmMs },
      };
    }

    // Replay the model's turn verbatim (preserves thought_signature parts Gemini requires on function calls).
    contents.push(modelContent ?? { role: "model", parts: functionCalls.map((fc) => ({ functionCall: { name: fc.name, args: fc.args } })) });

    const responseParts: Part[] = [];
    for (const call of functionCalls) {
      const toolStart = Date.now();
      const result = await executeTool(call.name, call.args, { userId: request.userId });
      toolTrace.push({ name: call.name, args: call.args, durationMs: Date.now() - toolStart });
      if (result.books) collectedBooks.push(...result.books);
      if (result.mode === "demo") mode = "demo";
      responseParts.push({
        functionResponse: { name: call.name, response: { result: result.data } },
      });
    }
    contents.push({ role: "user", parts: responseParts });
  }

  return {
    text: "I found some options but I'm having trouble summarizing them — here's what I retrieved.",
    books: dedupeBooks(collectedBooks),
    toolTrace,
    mode,
    timings: { totalMs: Date.now() - start },
  };
}

/** Deterministic rule-based fallback so the app is fully demoable without a Gemini key. */
async function runDemoAgent(
  request: AgentRequest,
  start: number,
  wasLiveFailure = false
): Promise<AgentResponse> {
  const msg = request.message.toLowerCase();
  const toolTrace: ToolTrace[] = [];
  let books: BookResult[] = [];
  let text: string;

  const retrievalStart = Date.now();

  if (msg.includes("remember") && (msg.includes("like") || msg.includes("prefer") || msg.includes("enjoy"))) {
    const memory = await saveMemory(request.userId, "preference", request.message.replace(/^remember (that )?/i, ""));
    toolTrace.push({ name: "save_user_memory", args: { text: memory.text }, durationMs: Date.now() - retrievalStart });
    text = `Got it — I'll remember that. I'll use it to personalize your recommendations.`;
  } else {
    const { results } = await searchBooks(request.message);
    books = results;
    toolTrace.push({ name: "search_books", args: { query: request.message }, durationMs: Date.now() - retrievalStart });

    if (books.length === 0) {
      text = "I couldn't find an exact match in the catalog. Want me to broaden the search?";
    } else {
      const top = books[0];
      text =
        books.length === 1
          ? `I found "${top.title}" by ${top.author}. ${top.reason ?? ""}`
          : `I found ${books.length} books that match, including "${top.title}" by ${top.author} and "${books[1].title}" by ${books[1].author}. Want more detail on any of them?`;
    }
  }

  if (wasLiveFailure) {
    text = `${text} (Note: the live AI agent hit an error, so I've switched to demo mode for this response.)`;
  }

  return {
    text,
    books: dedupeBooks(books),
    toolTrace,
    mode: "demo",
    timings: { totalMs: Date.now() - start, retrievalMs: Date.now() - retrievalStart },
  };
}

function dedupeBooks(books: BookResult[]): BookResult[] {
  const seen = new Set<string>();
  const out: BookResult[] = [];
  for (const b of books) {
    if (!seen.has(b.id)) {
      seen.add(b.id);
      out.push(b);
    }
  }
  return out;
}
