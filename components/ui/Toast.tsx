"use client";

import { createContext, useCallback, useContext, useRef, useState } from "react";

export interface ToastMessage {
  id: string;
  text: string;
  tone: "error" | "info";
  action?: { label: string; onClick: () => void };
}

interface ToastContextValue {
  showToast: (text: string, opts?: { tone?: "error" | "info"; action?: ToastMessage["action"] }) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

export function useToast(): ToastContextValue {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const counter = useRef(0);

  const showToast = useCallback<ToastContextValue["showToast"]>((text, opts) => {
    const id = `toast-${counter.current++}`;
    setToasts((prev) => [...prev, { id, text, tone: opts?.tone ?? "error", action: opts?.action }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 6000);
  }, []);

  const dismiss = (id: string) => setToasts((prev) => prev.filter((t) => t.id !== id));

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 flex flex-col gap-2 w-[calc(100%-2rem)] max-w-sm"
        role="region"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((toast) => (
          <div
            key={toast.id}
            className={`animate-fade-in-up flex items-center justify-between gap-3 rounded-xl border px-4 py-3 text-sm shadow-lg backdrop-blur ${
              toast.tone === "error"
                ? "bg-danger-soft border-danger/20 text-danger"
                : "bg-surface border-border text-foreground"
            }`}
          >
            <span>{toast.text}</span>
            <div className="flex items-center gap-2 shrink-0">
              {toast.action && (
                <button
                  onClick={() => {
                    toast.action?.onClick();
                    dismiss(toast.id);
                  }}
                  className="font-medium underline underline-offset-2"
                >
                  {toast.action.label}
                </button>
              )}
              <button onClick={() => dismiss(toast.id)} aria-label="Dismiss notification" className="opacity-60 hover:opacity-100">
                ✕
              </button>
            </div>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}
