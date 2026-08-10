const RIME_ENDPOINT = "https://users.rime.ai/v1/rime-tts";
const DEFAULT_MODEL = "mist";
const DEFAULT_SPEAKER = "cove";
const DEFAULT_LANG = "eng";

export function isRimeConfigured(): boolean {
  return Boolean(process.env.RIME_API_KEY);
}

export interface SpeakOptions {
  speaker?: string;
  lang?: string;
  modelId?: string;
}

/** Calls Rime's streaming TTS endpoint and returns the raw audio ReadableStream (MP3). */
export async function synthesizeSpeech(text: string, options: SpeakOptions = {}): Promise<ReadableStream<Uint8Array>> {
  if (!isRimeConfigured()) {
    throw new Error("Rime is not configured: missing RIME_API_KEY");
  }

  const res = await fetch(RIME_ENDPOINT, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.RIME_API_KEY}`,
      "Content-Type": "application/json",
      Accept: "audio/mpeg",
    },
    body: JSON.stringify({
      text,
      modelId: options.modelId ?? DEFAULT_MODEL,
      speaker: options.speaker ?? DEFAULT_SPEAKER,
      lang: options.lang ?? DEFAULT_LANG,
    }),
  });

  if (!res.ok || !res.body) {
    const errText = await res.text().catch(() => "");
    throw new Error(`Rime TTS failed (${res.status}): ${errText.slice(0, 300)}`);
  }

  return res.body;
}
