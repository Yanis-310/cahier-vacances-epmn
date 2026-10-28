"use client";

import { useState } from "react";
import FeedbackMessage from "@/components/FeedbackMessage";

export default function CheckoutButton() {
  const [accepted, setAccepted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCheckout() {
    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ waiveWithdrawal: accepted }),
      });
      const data = await res.json();

      if (data.url) {
        window.location.href = data.url;
        return;
      }
      setError(data.error || "Erreur lors de la création du paiement.");
    } catch {
      setError("Erreur de connexion.");
    }
    setLoading(false);
  }

  return (
    <div className="mt-6 space-y-4">
      <label className="flex items-start gap-2 text-sm text-foreground/80 cursor-pointer">
        <input
          type="checkbox"
          checked={accepted}
          onChange={(e) => setAccepted(e.target.checked)}
          className="mt-1"
        />
        <span>
          Je demande l&apos;accès immédiat au contenu après le paiement et je
          reconnais renoncer à mon droit de rétractation de 14 jours.
        </span>
      </label>

      <button
        onClick={handleCheckout}
        disabled={!accepted || loading}
        aria-busy={loading}
        className="w-full px-6 py-3 rounded-xl font-medium text-white transition-colors hover:opacity-90 disabled:opacity-50 cursor-pointer disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
        style={{ backgroundColor: "#F2C073" }}
      >
        {loading ? "Redirection vers le paiement..." : "Payer et accéder"}
      </button>

      {error && <FeedbackMessage message={error} variant="error" />}
    </div>
  );
}
