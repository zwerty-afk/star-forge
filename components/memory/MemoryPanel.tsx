"use client";

import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { useToast } from "@/components/ui/Toast";
import { getOrCreateUserId } from "@/lib/userId";
import type { Memory } from "@/lib/types";

export function MemoryPanel() {
  const [memories, setMemories] = useState<Memory[] | null>(null);
  const [error, setError] = useState(false);
  const [userId] = useState<string | null>(() =>
    typeof window === "undefined" ? null : getOrCreateUserId()
  );
  const { showToast } = useToast();

  useEffect(() => {
    if (!userId) return;
    void load(userId);
  }, [userId]);

  async function load(uid: string) {
    setError(false);
    try {
      const res = await fetch(`/api/memory?userId=${encodeURIComponent(uid)}`);
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMemories(data.memories);
    } catch {
      setError(true);
    }
  }

  async function handleDelete(memoryId: string) {
    if (!userId) return;
    setMemories((prev) => prev?.filter((m) => m.id !== memoryId) ?? null);
    try {
      const res = await fetch(`/api/memory?userId=${encodeURIComponent(userId)}&memoryId=${encodeURIComponent(memoryId)}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error();
    } catch {
      showToast("Couldn't delete that memory. Try again.", { tone: "error" });
      void load(userId);
    }
  }

  async function handleClearAll() {
    if (!userId) return;
    const previous = memories;
    setMemories([]);
    try {
      const res = await fetch(`/api/memory?userId=${encodeURIComponent(userId)}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
    } catch {
      showToast("Couldn't clear memories. Try again.", { tone: "error" });
      setMemories(previous ?? null);
    }
  }

  if (error) {
    return (
      <Card className="p-6 text-center">
        <p className="text-sm text-danger">I couldn&apos;t load your memories right now.</p>
        <Button variant="secondary" size="sm" className="mt-3" onClick={() => userId && load(userId)}>
          Try again
        </Button>
      </Card>
    );
  }

  if (memories === null) {
    return (
      <div className="flex flex-col gap-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 rounded-xl bg-black/5 animate-pulse" />
        ))}
      </div>
    );
  }

  if (memories.length === 0) {
    return (
      <Card className="p-6 text-center text-sm text-muted">
        Nothing remembered yet. Try saying &ldquo;Remember that I like science fiction&rdquo; on the home
        screen.
      </Card>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {memories.map((m) => (
        <Card key={m.id} className="p-4 flex items-center justify-between gap-4">
          <p className="text-sm text-foreground">{m.text}</p>
          <button
            onClick={() => handleDelete(m.id)}
            aria-label={`Forget: ${m.text}`}
            className="text-muted hover:text-danger shrink-0 text-sm"
          >
            Forget
          </button>
        </Card>
      ))}
      <Button variant="ghost" size="sm" className="self-start mt-2" onClick={handleClearAll}>
        Clear all memories
      </Button>
    </div>
  );
}
