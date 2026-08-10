import { NextRequest, NextResponse } from "next/server";
import { runAgent } from "@/lib/agent/orchestrator";
import type { AgentRequest } from "@/lib/types";

export async function POST(req: NextRequest) {
  let body: Partial<AgentRequest>;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  if (!body.message || typeof body.message !== "string" || !body.message.trim()) {
    return NextResponse.json({ error: "A non-empty 'message' is required." }, { status: 400 });
  }
  if (!body.userId || typeof body.userId !== "string") {
    return NextResponse.json({ error: "A 'userId' is required." }, { status: 400 });
  }

  try {
    const response = await runAgent({
      message: body.message,
      userId: body.userId,
      conversationId: body.conversationId ?? "default",
      history: Array.isArray(body.history) ? body.history : [],
    });
    return NextResponse.json(response);
  } catch (err) {
    console.error("[api/agent] unhandled error:", err);
    return NextResponse.json(
      { error: "I couldn't reach the library catalog right now. Try again in a moment." },
      { status: 502 }
    );
  }
}
