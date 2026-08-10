import { NextRequest, NextResponse } from "next/server";
import { getBookById, recommendSimilarBooks } from "@/lib/services/books";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  try {
    const book = await getBookById(id);
    if (!book) {
      return NextResponse.json({ error: "Book not found." }, { status: 404 });
    }
    const { results: related } = await recommendSimilarBooks(id, 4);
    return NextResponse.json({ book, related });
  } catch (err) {
    console.error("[api/books/[id]] error:", err);
    return NextResponse.json(
      { error: "I couldn't reach the library catalog right now. Try again in a moment." },
      { status: 502 }
    );
  }
}
