"use client";

import Link from "next/link";
import { useState } from "react";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;

    try {
      const res = await fetch("/api/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (!res.ok) {
        const data = await res.json();
        setError(data.error || "Une erreur est survenue.");
        setLoading(false);
        return;
      }

      setSent(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    }

    setLoading(false);
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary">
            EPMN
          </Link>
          <h1 className="text-xl font-semibold mt-4">Mot de passe oublié</h1>
          <p className="text-foreground/60 mt-1">
            Entrez votre email pour recevoir un lien de réinitialisation
          </p>
        </div>

        {sent ? (
          <div className="text-center">
            <div className="bg-success/10 text-success text-sm p-4 rounded-lg mb-6">
              Si un compte existe avec cette adresse email, un lien de
              réinitialisation vous a été envoyé. Vérifiez votre boîte de
              réception.
            </div>
            <Link
              href="/login"
              className="text-primary hover:underline text-sm"
            >
              Retour à la connexion
            </Link>
          </div>
        ) : (
          <>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="bg-error/10 text-error text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium mb-1"
                >
                  Email
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  required
                  className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
              >
                {loading ? "Envoi..." : "Envoyer le lien"}
              </button>
            </form>

            <p className="text-center text-sm text-foreground/60 mt-6">
              <Link
                href="/login"
                className="text-primary hover:underline"
              >
                Retour à la connexion
              </Link>
            </p>
          </>
        )}
      </div>
    </div>
  );
}
