import { HTMLAttributes } from "react";

type Tone = "neutral" | "accent" | "warning" | "danger";

const toneClasses: Record<Tone, string> = {
  neutral: "bg-black/5 text-muted",
  accent: "bg-accent-soft text-accent-strong",
  warning: "bg-gold/15 text-gold",
  danger: "bg-danger-soft text-danger",
};

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: Tone;
}

export function Badge({ tone = "neutral", className = "", children, ...props }: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${toneClasses[tone]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
