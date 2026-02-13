"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";
import FeedbackMessage from "@/components/FeedbackMessage";
import Toast from "@/components/Toast";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasSpecial;

  if (!token) {
    return (
      <div className="text-center space-y-4">
        <FeedbackMessage
          message="Lien de réinitialisation invalide. Veuillez refaire une demande."
          variant="error"
          className="mb-2"
        />
        <Link href="/forgot-password" className="text-primary hover:underline text-sm">
          Demander un nouveau lien
        </Link>
      </div>
    );
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");

    const formData = new FormData(e.currentTarget);
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!isPasswordValid) {
      const message =
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial.";
      setError(message);
      setToastMessage(message);
      return;
    }

    if (password !== confirmPassword) {
      const message = "Les mots de passe ne correspondent pas.";
      setError(message);
      setToastMessage(message);
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        const message = data.error || "Une erreur est survenue.";
        setError(message);
        setToastMessage(message);
        setLoading(false);
        return;
      }

      setSuccess(true);
      setToastMessage("Mot de passe réinitialisé avec succès.");
    } catch {
      const message = "Une erreur est survenue. Veuillez réessayer.";
      setError(message);
      setToastMessage(message);
    }

    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center space-y-4">
        <Toast
          message={toastMessage}
          variant="success"
          onClose={() => setToastMessage(null)}
        />
        <FeedbackMessage
          message="Votre mot de passe a été réinitialisé avec succès."
          variant="success"
        />
        <Link
          href="/login"
          className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-light transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <>
      <Toast
        message={toastMessage}
        variant={error ? "error" : "success"}
        onClose={() => setToastMessage(null)}
      />

      <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
        {error && (
          <FeedbackMessage
            id="reset-feedback"
            message={error}
            variant="error"
          />
        )}

        <div>
          <label
            htmlFor="password"
            className="block text-sm font-medium mb-1"
          >
            Nouveau mot de passe
          </label>
          <input
            id="password"
            name="password"
            type="password"
            required
            minLength={8}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            aria-invalid={!!error}
            aria-describedby={error ? "reset-feedback" : undefined}
            className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
          {password.length > 0 && (
            <ul className="text-xs mt-1.5 space-y-0.5">
              <li className={hasMinLength ? "text-success" : "text-foreground/60"}>
                {hasMinLength ? "\u2713" : "\u2717"} 8 caractères minimum
              </li>
              <li className={hasUppercase ? "text-success" : "text-foreground/60"}>
                {hasUppercase ? "\u2713" : "\u2717"} Une majuscule
              </li>
              <li className={hasSpecial ? "text-success" : "text-foreground/60"}>
                {hasSpecial ? "\u2713" : "\u2717"} Un caractère spécial
              </li>
            </ul>
          )}
          {password.length === 0 && (
            <p className="text-xs text-foreground/60 mt-1">
                Minimum 8 caractères, une majuscule et un caractère spécial
            </p>
          )}
        </div>

        <div>
          <label
            htmlFor="confirmPassword"
            className="block text-sm font-medium mb-1"
          >
            Confirmer le mot de passe
          </label>
          <input
            id="confirmPassword"
            name="confirmPassword"
            type="password"
            required
            minLength={8}
            aria-invalid={!!error}
            aria-describedby={error ? "reset-feedback" : undefined}
            className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
        >
          {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
        </button>
      </form>

      <p className="text-center text-sm text-foreground/70 mt-6">
        <Link href="/login" className="text-primary hover:underline">
          Retour à la connexion
        </Link>
      </p>
    </>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary">
            EPMN
          </Link>
          <h1 className="text-xl font-semibold mt-4">
            Nouveau mot de passe
          </h1>
          <p className="text-foreground/70 mt-1">
            Choisissez votre nouveau mot de passe
          </p>
        </div>

        <Suspense
          fallback={
            <div className="text-center" role="status" aria-live="polite">
              <div className="mx-auto mb-3 h-8 w-8 animate-spin rounded-full border-2 border-primary/25 border-t-primary" />
              <span className="text-foreground/70">Chargement en cours...</span>
            </div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
