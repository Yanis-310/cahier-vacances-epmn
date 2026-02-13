"use client";

import { useEffect } from "react";

type ToastVariant = "error" | "success" | "info";

const variantClasses: Record<ToastVariant, string> = {
  error: "border-error/30 bg-error text-white",
  success: "border-success/30 bg-success text-white",
  info: "border-primary/30 bg-primary text-white",
};

interface ToastProps {
  message: string | null;
  variant?: ToastVariant;
  onClose: () => void;
  duration?: number;
}

export default function Toast({
  message,
  variant = "info",
  onClose,
  duration = 3500,
}: ToastProps) {
  useEffect(() => {
    if (!message) return;
    const timeout = setTimeout(onClose, duration);
    return () => clearTimeout(timeout);
  }, [duration, message, onClose]);

  if (!message) return null;

  return (
    <div className="fixed top-4 right-4 z-50 max-w-sm w-[calc(100%-2rem)]">
      <div
        role={variant === "error" ? "alert" : "status"}
        aria-live={variant === "error" ? "assertive" : "polite"}
        className={`rounded-lg border px-4 py-3 shadow-lg ${variantClasses[variant]}`}
      >
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm leading-5">{message}</p>
          <button
            type="button"
            onClick={onClose}
            className="cursor-pointer rounded p-0.5 text-white/90 transition-colors hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80"
            aria-label="Fermer la notification"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path
                d="M4 4L12 12M12 4L4 12"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
}
