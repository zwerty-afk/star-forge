"use client";

import type { VoiceState } from "@/lib/types";

const stateColor: Record<VoiceState, string> = {
  idle: "var(--accent)",
  listening: "var(--orb-listening)",
  thinking: "var(--orb-thinking)",
  retrieving: "var(--orb-thinking)",
  speaking: "var(--orb-speaking)",
  interrupted: "var(--orb-listening)",
  error: "var(--danger)",
};

interface VoiceOrbProps {
  state: VoiceState;
  level?: number; // 0-1 audio level, drives pulse intensity while listening/speaking
  onClick?: () => void;
  disabled?: boolean;
}

export function VoiceOrb({ state, level = 0, onClick, disabled }: VoiceOrbProps) {
  const color = stateColor[state];
  const isActive = state === "listening" || state === "speaking";
  const scale = isActive ? 1 + Math.min(level, 1) * 0.12 : 1;

  const label =
    state === "idle"
      ? "Start talking to your library"
      : state === "listening"
        ? "Listening — tap to stop"
        : state === "thinking"
          ? "Thinking"
          : state === "retrieving"
            ? "Searching the library"
            : state === "speaking"
              ? "Speaking — tap to interrupt"
              : state === "interrupted"
                ? "Listening"
                : "Something went wrong — tap to try again";

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={label}
      aria-pressed={state === "listening"}
      className="relative flex items-center justify-center w-40 h-40 sm:w-48 sm:h-48 rounded-full outline-none disabled:opacity-60 disabled:cursor-not-allowed"
      style={{ ["--orb-color" as string]: color }}
    >
      {(state === "listening" || state === "speaking") && (
        <>
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: color,
              opacity: 0.25,
              animation: "pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite",
            }}
          />
          <span
            className="absolute inset-0 rounded-full"
            style={{
              background: color,
              opacity: 0.25,
              animation: "pulse-ring 1.8s cubic-bezier(0.4,0,0.6,1) infinite 0.6s",
            }}
          />
        </>
      )}

      {(state === "thinking" || state === "retrieving") && (
        <span
          className="absolute -inset-3 rounded-full border-2 border-dashed"
          style={{ borderColor: color, opacity: 0.5, animation: "orbit 3s linear infinite" }}
        />
      )}

      <span
        className="relative w-full h-full rounded-full flex items-center justify-center transition-transform duration-150 ease-out shadow-[0_8px_30px_-6px_rgb(0_0_0/0.25)]"
        style={{
          background: `radial-gradient(circle at 35% 30%, color-mix(in srgb, ${color} 55%, white), ${color})`,
          transform: `scale(${scale})`,
        }}
      >
        <OrbIcon state={state} />
      </span>
    </button>
  );
}

function OrbIcon({ state }: { state: VoiceState }) {
  if (state === "speaking") {
    return (
      <svg width="40" height="40" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path
          d="M4 10v4M8 6v12M12 3v18M16 6v12M20 10v4"
          stroke="white"
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }
  if (state === "thinking" || state === "retrieving") {
    return (
      <svg width="36" height="36" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <circle cx="6" cy="12" r="1.6" fill="white" />
        <circle cx="12" cy="12" r="1.6" fill="white" />
        <circle cx="18" cy="12" r="1.6" fill="white" />
      </svg>
    );
  }
  if (state === "error") {
    return (
      <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
        <path d="M12 8v5M12 16h.01" stroke="white" strokeWidth="2" strokeLinecap="round" />
        <circle cx="12" cy="12" r="9" stroke="white" strokeWidth="2" />
      </svg>
    );
  }
  return (
    <svg width="34" height="34" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <rect x="9" y="3" width="6" height="11" rx="3" fill="white" />
      <path
        d="M5 11a7 7 0 0 0 14 0M12 18v3"
        stroke="white"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}
