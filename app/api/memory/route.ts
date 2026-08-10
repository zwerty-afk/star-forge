import { NextRequest, NextResponse } from "next/server";
import { getMemories, saveMemory, deleteMemory, clearMemories } from "@/lib/services/memory";

export async function GET(req: NextRequest) {
  const userId = new URL(req.url).searchParams.get("userId");
  if (!userId) {
    return NextResponse.json({ error: "A 'userId' query param is required." }, { status: 400 });
  }
  try {
    const memories = await getMemories(userId);
    return NextResponse.json({ memories });
  } catch (err) {
    console.error("[api/memory] GET error:", err);
    return NextResponse.json({ error: "Couldn't load your memories right now." }, { status: 502 });
  }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => ({}));
  const { userId, text, type } = body as { userId?: string; text?: string; type?: "preference" | "history" };
  if (!userId || !text) {
    return NextResponse.json({ error: "'userId' and 'text' are required." }, { status: 400 });
  }
  try {
    const memory = await saveMemory(userId, type ?? "preference", text);
    return NextResponse.json({ memory });
  } catch (err) {
    console.error("[api/memory] POST error:", err);
    return NextResponse.json({ error: "Couldn't save that memory right now." }, { status: 502 });
  }
}

export async function DELETE(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get("userId");
  const memoryId = searchParams.get("memoryId");
  if (!userId) {
    return NextResponse.json({ error: "A 'userId' query param is required." }, { status: 400 });
  }
  try {
    if (memoryId) {
      await deleteMemory(userId, memoryId);
    } else {
      await clearMemories(userId);
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("[api/memory] DELETE error:", err);
    return NextResponse.json({ error: "Couldn't delete that memory right now." }, { status: 502 });
  }
}
