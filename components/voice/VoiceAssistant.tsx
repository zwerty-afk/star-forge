"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { VoiceOrb } from "./VoiceOrb";
import { Waveform } from "./Waveform";
import { ChatInput } from "./ChatInput";
import { Transcript } from "@/components/transcript/Transcript";
import { BookGrid } from "@/components/books/BookGrid";
import { Badge } from "@/components/ui/Badge";
import { useToast } from "@/components/ui/Toast";
import { SpeechToTextService } from "@/lib/services/stt";
import { getOrCreateUserId } from "@/lib/userId";
import { consumePendingVoiceMessage } from "@/lib/useVoiceHandoff";
import type { AgentResponse, BookResult, ChatMessage, VoiceState } from "@/lib/types";

const stateCopy: Record<VoiceState, string> = {
  idle: "Ask your library anything.",
  listening: "I'm listening…",
  thinking: "Finding the right books…",
  retrieving: "Searching the library…",
  speaking: "Here's what I found…",
  interrupted: "Go ahead — I'm listening.",
  error: "Something went wrong. Let's try that again.",
};

export function VoiceAssistant() {
  const [voiceState, setVoiceState] = useState<VoiceState>("idle");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [interim, setInterim] = useState("");
  const [books, setBooks] = useState<BookResult[]>([]);
  const [mode, setMode] = useState<"live" | "demo" | null>(null);
  const [sttSupported, setSttSupported] = useState(false);

  const sttRef = useRef<SpeechToTextService | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const stateRef = useRef<VoiceState>("idle");
  const userIdRef = useRef<string>("");
  const historyRef = useRef<ChatMessage[]>([]);
  const submitMessageRef = useRef<(text: string) => Promise<void>>(async () => {});
  const { showToast } = useToast();

  useEffect(() => {
    stateRef.current = voiceState;
  }, [voiceState]);

  useEffect(() => {
    historyRef.current = messages;
  }, [messages]);

  useEffect(() => {
    userIdRef.current = getOrCreateUserId();
    // Browser-capability check: must run post-mount to avoid an SSR/client hydration mismatch.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setSttSupported(SpeechToTextService.isSupported());
    if (typeof window !== "undefined") {
      audioRef.current = new Audio();
      audioRef.current.addEventListener("ended", () => {
        if (stateRef.current === "speaking") setVoiceState("idle");
      });
    }
    return () => {
      sttRef.current?.abort();
      audioRef.current?.pause();
    };
  }, []);

  const stopSpeaking = useCallback(() => {
    audioRef.current?.pause();
    if (audioRef.current) audioRef.current.currentTime = 0;
    abortRef.current?.abort();
  }, []);

  const speak = useCallback(async (text: string) => {
    setVoiceState("speaking");
    const controller = new AbortController();
    abortRef.current = controller;
    try {
      const res = await fetch("/api/speak", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
        signal: controller.signal,
      });
      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? "Voice synthesis failed.");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      if (audioRef.current) {
        audioRef.current.src = url;
        await audioRef.current.play();
      }
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      console.error(err);
      showToast("I couldn't speak that response, but here's the text.", { tone: "info" });
      setVoiceState("idle");
    }
  }, [showToast]);

  const submitMessage = useCallback(
    async (text: string) => {
      if (!text.trim()) return;
      setInterim("");
      const userMsg: ChatMessage = { role: "user", text, createdAt: new Date().toISOString() };
      setMessages((prev) => [...prev, userMsg]);
      setVoiceState("thinking");

      try {
        const res = await fetch("/api/agent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            message: text,
            userId: userIdRef.current,
            conversationId: "default",
            history: historyRef.current.slice(-10),
          }),
        });

        if (!res.ok) {
          const body = await res.json().catch(() => ({}));
          throw new Error(body.error ?? "The library catalog didn't respond.");
        }

        const data: AgentResponse = await res.json();
        setMode(data.mode);
        setBooks(data.books);
        const assistantMsg: ChatMessage = {
          role: "assistant",
          text: data.text,
          books: data.books,
          createdAt: new Date().toISOString(),
        };
        setMessages((prev) => [...prev, assistantMsg]);
        await speak(data.text);
      } catch (err) {
        console.error(err);
        setVoiceState("error");
        showToast((err as Error).message || "I couldn't reach the library catalog right now. Try again in a moment.", {
          tone: "error",
          action: { label: "Retry", onClick: () => submitMessageRef.current(text) },
        });
      }
    },
    [speak, showToast]
  );

  useEffect(() => {
    submitMessageRef.current = submitMessage;
  }, [submitMessage]);

  useEffect(() => {
    const pending = consumePendingVoiceMessage();
    if (pending) submitMessageRef.current(pending);
  }, []);

  const startListening = useCallback(() => {
    if (!SpeechToTextService.isSupported()) {
      showToast("Voice input isn't supported in this browser. Try Chrome or Edge.", { tone: "error" });
      return;
    }

    if (stateRef.current === "speaking") {
      stopSpeaking();
      setVoiceState("interrupted");
    }

    const stt = new SpeechToTextService({
      onInterim: (t) => setInterim(t),
      onFinal: (t) => {
        setInterim("");
        stt.stop();
        submitMessage(t);
      },
      onSpeechStart: () => {
        if (stateRef.current === "speaking") {
          stopSpeaking();
          setVoiceState("listening");
        }
      },
      onError: (code, msg) => {
        if (code === "not-allowed") {
          showToast("Microphone access was denied. Enable it in your browser settings to talk to the library.", {
            tone: "error",
          });
        } else {
          showToast("I had trouble hearing that. Try again?", { tone: "error" });
        }
        console.warn(msg);
        setVoiceState("idle");
      },
      onEnd: () => {
        if (stateRef.current === "listening") setVoiceState("idle");
      },
    });

    sttRef.current = stt;
    stt.start();
    setVoiceState("listening");
  }, [showToast, stopSpeaking, submitMessage]);

  const stopListening = useCallback(() => {
    sttRef.current?.stop();
    setVoiceState("idle");
  }, []);

  const handleChatSubmit = useCallback(
    (text: string) => {
      if (stateRef.current === "speaking") {
        stopSpeaking();
      }
      if (stateRef.current === "listening") {
        sttRef.current?.stop();
      }
      submitMessage(text);
    },
    [stopSpeaking, submitMessage]
  );

  const handleOrbClick = useCallback(() => {
    if (voiceState === "listening") {
      stopListening();
    } else if (voiceState === "speaking") {
      stopSpeaking();
      setVoiceState("idle");
    } else if (voiceState === "error" || voiceState === "idle") {
      startListening();
    }
  }, [voiceState, startListening, stopListening, stopSpeaking]);

  return (
    <div className="flex flex-col items-center gap-8 w-full">
      <div className="flex flex-col items-center gap-4">
        <VoiceOrb state={voiceState} onClick={handleOrbClick} disabled={!sttSupported && voiceState === "idle"} />
        <div className="flex flex-col items-center gap-1 text-center">
          <p className="text-foreground font-medium">{stateCopy[voiceState]}</p>
          {!sttSupported && (
            <p className="text-xs text-danger">Voice input needs Chrome or Edge on this device.</p>
          )}
          {mode === "demo" && (
            <Badge tone="warning" className="mt-1">
              Demo mode — add API keys for live retrieval &amp; speech
            </Badge>
          )}
        </div>
        <Waveform
          active={voiceState === "listening" || voiceState === "speaking"}
          color={voiceState === "speaking" ? "var(--gold)" : "var(--accent)"}
        />
      </div>

      <ChatInput
        onSubmit={handleChatSubmit}
        disabled={voiceState === "thinking" || voiceState === "retrieving"}
      />

      <div className="w-full max-w-2xl">
        <Transcript messages={messages} interim={interim} />
      </div>

      {books.length > 0 && (
        <div className="w-full max-w-5xl">
          <h2 className="font-serif text-lg mb-3 text-foreground">Books for you</h2>
          <BookGrid books={books} />
        </div>
      )}
    </div>
  );
}
