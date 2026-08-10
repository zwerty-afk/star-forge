import { HTMLAttributes } from "react";

export function Card({ className = "", children, ...props }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`bg-surface border border-border rounded-2xl shadow-[0_1px_2px_rgb(var(--shadow-color)/0.04),0_8px_24px_-8px_rgb(var(--shadow-color)/0.08)] ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
