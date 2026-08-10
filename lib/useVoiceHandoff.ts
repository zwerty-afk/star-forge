"use client";

import { useRouter } from "next/navigation";
import type { Book } from "./types";

const HANDOFF_KEY = "athenaeum-voice-handoff";

export function useVoiceHandoff() {
  const router = useRouter();

  function askAboutBook(book: Book) {
    if (typeof window !== "undefined") {
      window.sessionStorage.setItem(
        HANDOFF_KEY,
        `Tell me more about "${book.title}" by ${book.author}.`
      );
    }
    router.push("/");
  }

  return { askAboutBook };
}

export function consumePendingVoiceMessage(): string | null {
  if (typeof window === "undefined") return null;
  const msg = window.sessionStorage.getItem(HANDOFF_KEY);
  if (msg) window.sessionStorage.removeItem(HANDOFF_KEY);
  return msg;
}
