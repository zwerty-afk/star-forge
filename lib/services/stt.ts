export type SpeechRecognitionErrorCode =
  | "no-speech"
  | "audio-capture"
  | "not-allowed"
  | "network"
  | "aborted"
  | "unsupported"
  | "unknown";

export interface SttEvents {
  onInterim?: (transcript: string) => void;
  onFinal?: (transcript: string) => void;
  /** Fires on ANY detected speech energy, including while a final result is pending — used for barge-in. */
  onSpeechStart?: () => void;
  onSpeechEnd?: () => void;
  onError?: (code: SpeechRecognitionErrorCode, message: string) => void;
  onEnd?: () => void;
}

/**
 * Thin wrapper around the browser's SpeechRecognition API (Web Speech API).
 * Chosen over a hosted STT provider to avoid an additional API key/service —
 * works well in Chromium-based browsers (Chrome, Edge).
 */
export class SpeechToTextService {
  private recognition: SpeechRecognition | null = null;
  private events: SttEvents = {};
  private active = false;

  static isSupported(): boolean {
    if (typeof window === "undefined") return false;
    return Boolean(
      (window as unknown as { SpeechRecognition?: unknown; webkitSpeechRecognition?: unknown })
        .SpeechRecognition ||
        (window as unknown as { webkitSpeechRecognition?: unknown }).webkitSpeechRecognition
    );
  }

  constructor(events: SttEvents = {}) {
    this.events = events;
  }

  start(lang = "en-US"): void {
    if (typeof window === "undefined") return;
    const Ctor =
      (window as unknown as { SpeechRecognition?: new () => SpeechRecognition }).SpeechRecognition ||
      (window as unknown as { webkitSpeechRecognition?: new () => SpeechRecognition }).webkitSpeechRecognition;

    if (!Ctor) {
      this.events.onError?.("unsupported", "Speech recognition isn't supported in this browser.");
      return;
    }

    if (this.active) this.stop();

    const recognition = new Ctor();
    recognition.lang = lang;
    recognition.continuous = true;
    recognition.interimResults = true;

    recognition.onresult = (event: SpeechRecognitionEvent) => {
      let interim = "";
      let final = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        const transcript = result[0].transcript;
        if (result.isFinal) {
          final += transcript;
        } else {
          interim += transcript;
        }
      }
      if (interim) this.events.onInterim?.(interim);
      if (final) this.events.onFinal?.(final.trim());
    };

    recognition.onspeechstart = () => this.events.onSpeechStart?.();
    recognition.onspeechend = () => this.events.onSpeechEnd?.();

    recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
      const code = (event.error as SpeechRecognitionErrorCode) ?? "unknown";
      if (code === "no-speech" || code === "aborted") return;
      this.events.onError?.(code, `Speech recognition error: ${event.error}`);
    };

    recognition.onend = () => {
      this.active = false;
      this.events.onEnd?.();
    };

    this.recognition = recognition;
    this.active = true;
    try {
      recognition.start();
    } catch {
      this.active = false;
    }
  }

  stop(): void {
    this.active = false;
    this.recognition?.stop();
    this.recognition = null;
  }

  abort(): void {
    this.active = false;
    this.recognition?.abort();
    this.recognition = null;
  }

  isActive(): boolean {
    return this.active;
  }
}
