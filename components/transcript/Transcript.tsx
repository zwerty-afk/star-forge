"use client";

import { useEffect, useRef } from "react";
import type { ChatMessage } from "@/lib/types";

interface TranscriptProps {
  messages: ChatMessage[];
  interim?: string;
}

export function Transcript({ messages, interim }: TranscriptProps) {
  const endRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [messages, interim]);

  if (messages.length === 0 && !interim) {
    return (
      <div className="text-center text-muted text-sm py-10 px-4">
        Try asking, &ldquo;Find me a beginner-friendly book about artificial intelligence&rdquo; or
        &ldquo;Where can I find The Alchemist?&rdquo;
      </div>
    );
  }

  return (
    <div
      className="flex flex-col gap-4 overflow-y-auto scrollbar-thin px-1 py-2 max-h-[40vh]"
      role="log"
      aria-live="polite"
      aria-label="Conversation transcript"
    >
      {messages.map((m, i) => (
        <MessageBubble key={i} message={m} />
      ))}
      {interim && (
        <div className="flex justify-end">
          <div className="max-w-[85%] rounded-2xl rounded-br-sm bg-accent-soft text-accent-strong px-4 py-2.5 text-sm italic opacity-70">
            {interim}
          </div>
        </div>
      )}
      <div ref={endRef} />
    </div>
  );
}

function MessageBubble({ message }: { message: ChatMessage }) {
  const isUser = message.role === "user";
  return (
    <div className={`flex flex-col animate-fade-in-up ${isUser ? "items-end" : "items-start"}`}>
      <span className="text-xs text-muted mb-1 px-1">{isUser ? "You" : "Athenaeum"}</span>
      <div
        className={`max-w-[85%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed ${
          isUser
            ? "bg-accent text-white rounded-br-sm"
            : "bg-surface border border-border text-foreground rounded-bl-sm"
        }`}
      >
        {message.text}
      </div>
    </div>
  );
}
