"use client";

import { ReactNode } from "react";

type FeedbackVariant = "error" | "success" | "info";

const variantClasses: Record<FeedbackVariant, string> = {
  error: "bg-error/10 text-error border-error/30",
  success: "bg-success/10 text-success border-success/30",
  info: "bg-primary-pale text-primary border-primary/20",
};

interface FeedbackMessageProps {
  message: string;
  variant?: FeedbackVariant;
  className?: string;
  id?: string;
  icon?: ReactNode;
}

export default function FeedbackMessage({
  message,
  variant = "info",
  className = "",
  id,
  icon,
}: FeedbackMessageProps) {
  return (
    <div
      id={id}
      role={variant === "error" ? "alert" : "status"}
      aria-live={variant === "error" ? "assertive" : "polite"}
      className={`rounded-lg border px-3 py-2.5 text-sm ${variantClasses[variant]} ${className}`}
    >
      <div className="flex items-start gap-2">
        {icon ? <span className="mt-0.5">{icon}</span> : null}
        <p>{message}</p>
      </div>
    </div>
  );
}
