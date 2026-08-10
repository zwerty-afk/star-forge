import booksJson from "@/data/books.json";
import type { Book, BookResult } from "./types";

export const allBooks: Book[] = booksJson as Book[];

const STOPWORDS = new Set([
  "a", "an", "the", "about", "for", "of", "in", "on", "me", "find", "something",
  "book", "books", "i", "want", "like", "need", "please", "recommend", "give",
  "beginner", "friendly", "is", "that", "this", "with", "to", "and",
]);

function tokenize(text: string): string[] {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

/** Deterministic keyword-overlap "semantic-ish" search used when Qdrant/Gemini are unavailable. */
export function demoSearchBooks(query: string, limit = 6): BookResult[] {
  const queryTokens = tokenize(query);
  const scored = allBooks.map((book) => {
    const haystack = tokenize(
      [book.title, book.author, book.description, ...book.categories, ...book.subjects].join(" ")
    );
    const overlap = queryTokens.filter((t) => haystack.some((h) => h.includes(t) || t.includes(h)));
    const score = queryTokens.length ? overlap.length / queryTokens.length : 0;
    return { book, score };
  });
  scored.sort((a, b) => b.score - a.score);
  return scored
    .filter((s) => s.score > 0)
    .slice(0, limit)
    .map((s) => ({
      ...s.book,
      score: s.score,
      reason: `Matches your interest in ${s.book.categories[0].toLowerCase()}.`,
    }));
}

export function demoGetBook(id: string): Book | undefined {
  return allBooks.find((b) => b.id === id);
}
