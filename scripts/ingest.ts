import { config } from "dotenv";
config({ path: ".env.local" });
import { QdrantClient } from "@qdrant/js-client-rest";
import { GoogleGenAI } from "@google/genai";
import booksData from "../data/books.json";
import type { Book } from "../lib/types";

const VECTOR_SIZE = 768;
const BOOKS_COLLECTION = "library_books";
const MEMORY_COLLECTION = "user_memory";
const EMBED_MODEL = "gemini-embedding-001";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) {
    console.error(`Missing required env var: ${name}. Set it in .env.local.`);
    process.exit(1);
  }
  return v;
}

function l2Normalize(vec: number[]): number[] {
  const norm = Math.sqrt(vec.reduce((sum, v) => sum + v * v, 0));
  return norm === 0 ? vec : vec.map((v) => v / norm);
}

function bookToEmbeddingText(book: Book): string {
  return [
    book.title,
    `by ${book.author}`,
    book.description,
    `Categories: ${book.categories.join(", ")}`,
    `Subjects: ${book.subjects.join(", ")}`,
  ].join(". ");
}

function idToPointId(id: string): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h << 5) - h + id.charCodeAt(i);
    h |= 0;
  }
  return Math.abs(h);
}

async function main() {
  const qdrantUrl = requireEnv("QDRANT_URL");
  const qdrantApiKey = requireEnv("QDRANT_API_KEY");
  const geminiApiKey = requireEnv("GEMINI_API_KEY");

  const qdrant = new QdrantClient({ url: qdrantUrl, apiKey: qdrantApiKey });
  const ai = new GoogleGenAI({ apiKey: geminiApiKey });

  for (const name of [BOOKS_COLLECTION, MEMORY_COLLECTION]) {
    const { exists } = await qdrant.collectionExists(name);
    if (!exists) {
      console.log(`Creating collection "${name}"...`);
      await qdrant.createCollection(name, {
        vectors: { size: VECTOR_SIZE, distance: "Cosine" },
      });
    } else {
      console.log(`Collection "${name}" already exists.`);
    }
  }

  console.log(`Ensuring "userId" payload index on "${MEMORY_COLLECTION}"...`);
  try {
    await qdrant.createPayloadIndex(MEMORY_COLLECTION, { field_name: "userId", field_schema: "keyword" });
  } catch {
    // Already exists — safe to ignore.
  }

  const books = booksData as Book[];
  console.log(`Embedding and upserting ${books.length} books into "${BOOKS_COLLECTION}"...`);

  const BATCH_SIZE = 10;
  for (let i = 0; i < books.length; i += BATCH_SIZE) {
    const batch = books.slice(i, i + BATCH_SIZE);
    const points = await Promise.all(
      batch.map(async (book) => {
        const res = await ai.models.embedContent({
          model: EMBED_MODEL,
          contents: bookToEmbeddingText(book),
          config: { outputDimensionality: VECTOR_SIZE },
        });
        const values = res.embeddings?.[0]?.values;
        if (!values) throw new Error(`No embedding returned for book ${book.id}`);
        return {
          id: idToPointId(book.id),
          vector: l2Normalize(values),
          payload: { ...book },
        };
      })
    );
    await qdrant.upsert(BOOKS_COLLECTION, { points, wait: true });
    console.log(`  Upserted ${Math.min(i + BATCH_SIZE, books.length)}/${books.length}`);
  }

  const collectionInfo = await qdrant.getCollection(BOOKS_COLLECTION);
  console.log(`Done. "${BOOKS_COLLECTION}" now has ${collectionInfo.points_count} points.`);
}

main().catch((err) => {
  console.error("Ingestion failed:", err);
  process.exit(1);
});
