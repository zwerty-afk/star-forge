import { QdrantClient } from "@qdrant/js-client-rest";

export const BOOKS_COLLECTION = "library_books";
export const MEMORY_COLLECTION = "user_memory";
export const VECTOR_SIZE = 768;

let client: QdrantClient | null = null;

export function isQdrantConfigured(): boolean {
  return Boolean(process.env.QDRANT_URL && process.env.QDRANT_API_KEY);
}

export function getQdrantClient(): QdrantClient {
  if (!isQdrantConfigured()) {
    throw new Error("Qdrant is not configured: missing QDRANT_URL or QDRANT_API_KEY");
  }
  if (!client) {
    client = new QdrantClient({
      url: process.env.QDRANT_URL!,
      apiKey: process.env.QDRANT_API_KEY!,
    });
  }
  return client;
}

export async function ensureCollection(name: string, vectorSize = VECTOR_SIZE): Promise<void> {
  const c = getQdrantClient();
  const { exists } = await c.collectionExists(name);
  if (!exists) {
    await c.createCollection(name, {
      vectors: { size: vectorSize, distance: "Cosine" },
    });
  }
}

let memoryIndexEnsured = false;

/** The user_memory collection requires a keyword index on "userId" to filter by it. Idempotent. */
export async function ensureMemoryUserIdIndex(): Promise<void> {
  if (memoryIndexEnsured) return;
  const c = getQdrantClient();
  try {
    await c.createPayloadIndex(MEMORY_COLLECTION, { field_name: "userId", field_schema: "keyword" });
  } catch {
    // Already exists or collection not yet created — safe to ignore.
  }
  memoryIndexEnsured = true;
}
