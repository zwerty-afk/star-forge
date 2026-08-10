import { NextRequest, NextResponse } from "next/server";
import { searchBooks, listAllCategories } from "@/lib/services/books";
import { allBooks } from "@/lib/demoData";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get("q");
  const category = searchParams.get("category") ?? undefined;

  try {
    if (q) {
      const { results, mode } = await searchBooks(q, { category });
      return NextResponse.json({ books: results, mode });
    }
    const books = category ? allBooks.filter((b) => b.categories.includes(category)) : allBooks;
    return NextResponse.json({ books, categories: listAllCategories(), mode: "static" });
  } catch (err) {
    console.error("[api/books] error:", err);
    return NextResponse.json(
      { error: "I couldn't reach the library catalog right now. Try again in a moment." },
      { status: 502 }
    );
  }
}
