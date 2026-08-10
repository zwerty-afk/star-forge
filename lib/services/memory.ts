import { randomUUID } from "crypto";
import { getQdrantClient, MEMORY_COLLECTION, isQdrantConfigured, ensureMemoryUserIdIndex } from "./qdrant";
import { embedText, isGeminiConfigured } from "./gemini";
import type { Memory, MemoryType } from "../types";

const demoMemoryStore = new Map<string, Memory[]>();

function isLiveConfigured(): boolean {
  return isQdrantConfigured() && isGeminiConfigured();
}

export async function saveMemory(
  userId: string,
  type: MemoryType,
  text: string
): Promise<Memory> {
  const memory: Memory = {
    id: randomUUID(),
    userId,
    type,
    text,
    createdAt: new Date().toISOString(),
  };

  if (!isLiveConfigured()) {
    const existing = demoMemoryStore.get(userId) ?? [];
    existing.push(memory);
    demoMemoryStore.set(userId, existing);
    return memory;
  }

  const vector = await embedText(text);
  await ensureMemoryUserIdIndex();
  const client = getQdrantClient();
  await client.upsert(MEMORY_COLLECTION, {
    points: [
      {
        id: memory.id,
        vector,
        payload: { ...memory },
      },
    ],
    wait: true,
  });
  return memory;
}

export async function getMemories(userId: string, limit = 20): Promise<Memory[]> {
  if (!isLiveConfigured()) {
    return demoMemoryStore.get(userId) ?? [];
  }

  await ensureMemoryUserIdIndex();
  const client = getQdrantClient();
  const result = await client.scroll(MEMORY_COLLECTION, {
    filter: { must: [{ key: "userId", match: { value: userId } }] },
    limit,
    with_payload: true,
  });
  return result.points.map((p) => p.payload as unknown as Memory);
}

export async function searchMemories(
  userId: string,
  query: string,
  limit = 5
): Promise<Memory[]> {
  if (!isLiveConfigured()) {
    const all = demoMemoryStore.get(userId) ?? [];
    return all.slice(-limit);
  }

  const vector = await embedText(query);
  await ensureMemoryUserIdIndex();
  const client = getQdrantClient();
  const result = await client.query(MEMORY_COLLECTION, {
    query: vector,
    filter: { must: [{ key: "userId", match: { value: userId } }] },
    limit,
    with_payload: true,
  });
  return result.points.map((p) => p.payload as unknown as Memory);
}

export async function deleteMemory(userId: string, memoryId: string): Promise<void> {
  if (!isLiveConfigured()) {
    const existing = demoMemoryStore.get(userId) ?? [];
    demoMemoryStore.set(userId, existing.filter((m) => m.id !== memoryId));
    return;
  }
  const client = getQdrantClient();
  await client.delete(MEMORY_COLLECTION, { points: [memoryId] });
}

export async function clearMemories(userId: string): Promise<void> {
  if (!isLiveConfigured()) {
    demoMemoryStore.delete(userId);
    return;
  }
  await ensureMemoryUserIdIndex();
  const client = getQdrantClient();
  await client.delete(MEMORY_COLLECTION, {
    filter: { must: [{ key: "userId", match: { value: userId } }] },
  });
}
