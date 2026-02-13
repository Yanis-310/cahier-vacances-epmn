"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FeedbackMessage from "@/components/FeedbackMessage";
import Toast from "@/components/Toast";

export default function StartButton({
  variant = "primary",
}: {
  variant?: "primary" | "outline";
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  async function handleStart() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/evaluation", { method: "POST" });
      const data = await res.json();

      if (data.id) {
        router.push(`/evaluation/${data.id}`);
      } else {
        const message = data.error || "Erreur lors de la création.";
        setError(message);
        setToastMessage(message);
        setLoading(false);
      }
    } catch {
      const message = "Erreur de connexion.";
      setError(message);
      setToastMessage(message);
      setLoading(false);
    }
  }

  return (
    <div>
      <Toast
        message={toastMessage}
        variant="error"
        onClose={() => setToastMessage(null)}
      />

      <button
        onClick={handleStart}
        disabled={loading}
        aria-busy={loading}
        className={`px-6 py-3 rounded-xl font-medium transition-colors disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 ${
          variant === "outline"
            ? "border border-foreground/20 text-foreground/70 hover:text-primary hover:border-primary/40 bg-white"
            : "bg-primary text-white hover:bg-primary-light"
        }`}
      >
        {loading ? "Préparation..." : "Nouvelle évaluation"}
      </button>

      {loading && (
        <p className="text-xs text-foreground/70 mt-2" role="status" aria-live="polite">
          Création de votre évaluation en cours...
        </p>
      )}

      {error && (
        <FeedbackMessage
          message={error}
          variant="error"
          className="mt-2"
        />
      )}
    </div>
  );
}
