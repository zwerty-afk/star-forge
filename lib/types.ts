export interface Book {
  id: string;
  title: string;
  author: string;
  description: string;
  categories: string[];
  subjects: string[];
  year: number;
  pages: number;
  available: boolean;
  location: string;
  coverColor: string;
}

export interface BookResult extends Book {
  score?: number;
  reason?: string;
}

export type MemoryType = "preference" | "history";

export interface Memory {
  id: string;
  userId: string;
  type: MemoryType;
  text: string;
  createdAt: string;
}

export type VoiceState =
  | "idle"
  | "listening"
  | "thinking"
  | "retrieving"
  | "speaking"
  | "interrupted"
  | "error";

export type ChatRole = "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  text: string;
  books?: BookResult[];
  createdAt: string;
}

export interface ToolTrace {
  name: string;
  args: Record<string, unknown>;
  durationMs: number;
}

export interface AgentResponse {
  text: string;
  books: BookResult[];
  toolTrace: ToolTrace[];
  mode: "live" | "demo";
  timings: {
    totalMs: number;
    retrievalMs?: number;
    llmMs?: number;
  };
}

export interface AgentRequest {
  message: string;
  userId: string;
  conversationId: string;
  history: ChatMessage[];
}
