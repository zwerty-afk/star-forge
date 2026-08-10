import { FunctionDeclaration } from "@google/genai";
import { searchBooks, getBookById, recommendSimilarBooks, SearchFilters } from "../services/books";
import { getMemories, saveMemory, searchMemories } from "../services/memory";
import type { BookResult, Memory, MemoryType } from "../types";

export const toolDeclarations: FunctionDeclaration[] = [
  {
    name: "search_books",
    description:
      "Search the library catalog by natural-language meaning (topic, theme, difficulty level), optionally narrowed by filters. Use for open-ended discovery queries like 'beginner-friendly AI book' or 'books about Indian history'.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        query: { type: "string", description: "Natural language description of what the user wants" },
        category: { type: "string", description: "Exact category to filter by, e.g. Fiction, Artificial Intelligence" },
        author: { type: "string", description: "Filter by author name" },
        available: { type: "boolean", description: "Filter to only currently available books" },
        maxPages: { type: "number", description: "Maximum page count" },
        minYear: { type: "number", description: "Earliest publication year" },
      },
      required: ["query"],
    },
  },
  {
    name: "get_book",
    description: "Retrieve full details for a specific book by its id, e.g. after search_books returned candidates.",
    parametersJsonSchema: {
      type: "object",
      properties: { bookId: { type: "string" } },
      required: ["bookId"],
    },
  },
  {
    name: "recommend_books",
    description:
      "Recommend books similar to a given book, or personalized to the user based on their stored memories/preferences. Provide bookId for 'similar to X', or omit it and rely on memory for 'recommend something for me'.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        bookId: { type: "string", description: "Optional book id to find similar books to" },
        basedOnMemory: { type: "boolean", description: "Whether to personalize using stored user preferences" },
      },
    },
  },
  {
    name: "check_availability",
    description: "Check whether a specific book is currently available to borrow.",
    parametersJsonSchema: {
      type: "object",
      properties: { bookId: { type: "string" } },
      required: ["bookId"],
    },
  },
  {
    name: "get_user_memory",
    description: "Retrieve the user's stored preferences and conversation memory, e.g. to personalize a recommendation.",
    parametersJsonSchema: {
      type: "object",
      properties: { query: { type: "string", description: "Optional topic to search memories for" } },
    },
  },
  {
    name: "save_user_memory",
    description:
      "Store a durable user preference or fact for future personalization, e.g. 'user likes science fiction' or 'user prefers books under 300 pages'. Only call when the user explicitly asks you to remember something or states a clear lasting preference.",
    parametersJsonSchema: {
      type: "object",
      properties: {
        text: { type: "string", description: "The preference/fact to remember, written in third person" },
        type: { type: "string", enum: ["preference", "history"] },
      },
      required: ["text"],
    },
  },
];

export interface ToolContext {
  userId: string;
}

export interface ToolResult {
  data: unknown;
  books?: BookResult[];
  mode?: "live" | "demo";
}

export async function executeTool(
  name: string,
  args: Record<string, unknown>,
  ctx: ToolContext
): Promise<ToolResult> {
  switch (name) {
    case "search_books": {
      const filters: SearchFilters = {
        category: args.category as string | undefined,
        author: args.author as string | undefined,
        available: args.available as boolean | undefined,
        maxPages: args.maxPages as number | undefined,
        minYear: args.minYear as number | undefined,
      };
      const { results, mode } = await searchBooks(String(args.query ?? ""), filters);
      return { data: results, books: results, mode };
    }
    case "get_book": {
      const book = await getBookById(String(args.bookId ?? ""));
      return { data: book ?? null, books: book ? [book] : [] };
    }
    case "recommend_books": {
      if (args.bookId) {
        const { results, mode } = await recommendSimilarBooks(String(args.bookId));
        return { data: results, books: results, mode };
      }
      const memories = await getMemories(ctx.userId);
      const preferenceText = memories.map((m: Memory) => m.text).join(". ") || "popular well-rounded books";
      const { results, mode } = await searchBooks(preferenceText);
      return { data: results, books: results, mode };
    }
    case "check_availability": {
      const book = await getBookById(String(args.bookId ?? ""));
      return { data: { available: book?.available ?? false, location: book?.location } };
    }
    case "get_user_memory": {
      const memories = args.query
        ? await searchMemories(ctx.userId, String(args.query))
        : await getMemories(ctx.userId);
      return { data: memories };
    }
    case "save_user_memory": {
      const memory = await saveMemory(
        ctx.userId,
        (args.type as MemoryType) ?? "preference",
        String(args.text ?? "")
      );
      return { data: memory };
    }
    default:
      return { data: { error: `Unknown tool: ${name}` } };
  }
}
