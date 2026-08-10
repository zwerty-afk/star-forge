import { NextRequest, NextResponse } from "next/server";
import { synthesizeSpeech, isRimeConfigured } from "@/lib/services/rime";

const MAX_TEXT_LENGTH = 2000;

export async function POST(req: NextRequest) {
  let body: { text?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Malformed request body." }, { status: 400 });
  }

  const text = body.text?.trim();
  if (!text) {
    return NextResponse.json({ error: "A non-empty 'text' is required." }, { status: 400 });
  }
  if (!isRimeConfigured()) {
    return NextResponse.json(
      { error: "Voice synthesis is not configured. Add RIME_API_KEY to enable spoken responses." },
      { status: 503 }
    );
  }

  try {
    const audioStream = await synthesizeSpeech(text.slice(0, MAX_TEXT_LENGTH));
    return new Response(audioStream, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("[api/speak] Rime synthesis failed:", err);
    return NextResponse.json(
      { error: "I couldn't generate speech right now. Try again in a moment." },
      { status: 502 }
    );
  }
}
