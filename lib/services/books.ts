import { getQdrantClient, BOOKS_COLLECTION, isQdrantConfigured } from "./qdrant";
import { embedText, isGeminiConfigured } from "./gemini";
import { allBooks, demoSearchBooks, demoGetBook } from "../demoData";
import type { Book, BookResult } from "../types";

export function isLiveRetrievalConfigured(): boolean {
  return isQdrantConfigured() && isGeminiConfigured();
}

export interface SearchFilters {
  category?: string;
  author?: string;
  available?: boolean;
  maxPages?: number;
  minYear?: number;
}

function buildQdrantFilter(filters?: SearchFilters) {
  if (!filters) return undefined;
  const must: Record<string, unknown>[] = [];
  if (filters.category) {
    must.push({ key: "categories", match: { any: [filters.category] } });
  }
  if (filters.author) {
    must.push({ key: "author", match: { text: filters.author } });
  }
  if (typeof filters.available === "boolean") {
    must.push({ key: "available", match: { value: filters.available } });
  }
  if (filters.maxPages) {
    must.push({ key: "pages", range: { lte: filters.maxPages } });
  }
  if (filters.minYear) {
    must.push({ key: "year", range: { gte: filters.minYear } });
  }
  return must.length ? { must } : undefined;
}

export async function searchBooks(
  query: string,
  filters?: SearchFilters,
  limit = 6
): Promise<{ results: BookResult[]; mode: "live" | "demo" }> {
  if (!isLiveRetrievalConfigured()) {
    let results = demoSearchBooks(query, limit * 2);
    results = applyDemoFilters(results, filters).slice(0, limit);
    return { results, mode: "demo" };
  }

  try {
    const vector = await embedText(query);
    const client = getQdrantClient();
    const result = await client.query(BOOKS_COLLECTION, {
      query: vector,
      filter: buildQdrantFilter(filters),
      limit,
      with_payload: true,
    });
    const results: BookResult[] = result.points.map((p) => ({
      ...(p.payload as unknown as Book),
      score: p.score,
    }));
    return { results, mode: "live" };
  } catch {
    let results = demoSearchBooks(query, limit * 2);
    results = applyDemoFilters(results, filters).slice(0, limit);
    return { results, mode: "demo" };
  }
}

function applyDemoFilters(books: BookResult[], filters?: SearchFilters): BookResult[] {
  if (!filters) return books;
  return books.filter((b) => {
    if (filters.category && !b.categories.includes(filters.category)) return false;
    if (filters.author && !b.author.toLowerCase().includes(filters.author.toLowerCase())) return false;
    if (typeof filters.available === "boolean" && b.available !== filters.available) return false;
    if (filters.maxPages && b.pages > filters.maxPages) return false;
    if (filters.minYear && b.year < filters.minYear) return false;
    return true;
  });
}

export async function getBookById(id: string): Promise<Book | undefined> {
  if (!isLiveRetrievalConfigured()) {
    return demoGetBook(id);
  }
  try {
    const client = getQdrantClient();
    const points = await client.retrieve(BOOKS_COLLECTION, {
      ids: [pointIdFor(id)],
      with_payload: true,
    });
    if (points.length === 0) return demoGetBook(id);
    return points[0].payload as unknown as Book;
  } catch {
    return demoGetBook(id);
  }
}

export async function recommendSimilarBooks(
  bookId: string,
  limit = 4
): Promise<{ results: BookResult[]; mode: "live" | "demo" }> {
  const book = await getBookById(bookId);
  if (!book) return { results: [], mode: "demo" };
  const query = `${book.title} ${book.categories.join(" ")} ${book.subjects.join(" ")}`;
  const { results, mode } = await searchBooks(query, undefined, limit + 1);
  return { results: results.filter((b) => b.id !== bookId).slice(0, limit), mode };
}

function pointIdFor(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

export function listAllCategories(): string[] {
  return Array.from(new Set(allBooks.flatMap((b) => b.categories))).sort();
}
