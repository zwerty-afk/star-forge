"use client";

const BAR_COUNT = 24;

interface WaveformProps {
  active: boolean;
  color?: string;
}

export function Waveform({ active, color = "var(--accent)" }: WaveformProps) {
  return (
    <div
      className="flex items-center justify-center gap-[3px] h-10"
      aria-hidden="true"
    >
      {Array.from({ length: BAR_COUNT }).map((_, i) => {
        const delay = (i % 8) * 0.09;
        const baseHeight = 20 + ((i * 37) % 60);
        return (
          <span
            key={i}
            className="w-[3px] rounded-full origin-center"
            style={{
              height: `${baseHeight}%`,
              maxHeight: 40,
              background: color,
              opacity: active ? 0.85 : 0.25,
              animationName: active ? "wave-bar" : "none",
              animationDuration: `${0.7 + (i % 5) * 0.08}s`,
              animationTimingFunction: "ease-in-out",
              animationIterationCount: "infinite",
              animationDelay: `${delay}s`,
              transition: "opacity 300ms ease",
            }}
          />
        );
      })}
    </div>
  );
}
