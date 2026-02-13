"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { useState, Suspense } from "react";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [password, setPassword] = useState("");

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasSpecial;

  if (!token) {
    return (
      <div className="text-center">
        <div className="bg-error/10 text-error text-sm p-4 rounded-lg mb-6">
          Lien de réinitialisation invalide. Veuillez refaire une demande.
        </div>
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
      setError(
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial."
      );
      return;
    }

    if (password !== confirmPassword) {
      setError("Les mots de passe ne correspondent pas.");
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
        setError(data.error || "Une erreur est survenue.");
        setLoading(false);
        return;
      }

      setSuccess(true);
    } catch {
      setError("Une erreur est survenue. Veuillez réessayer.");
    }

    setLoading(false);
  }

  if (success) {
    return (
      <div className="text-center">
        <div className="bg-success/10 text-success text-sm p-4 rounded-lg mb-6">
          Votre mot de passe a été réinitialisé avec succès.
        </div>
        <Link
          href="/login"
          className="inline-block bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-light transition-colors"
        >
          Se connecter
        </Link>
      </div>
    );
  }

  return (
    <>
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="bg-error/10 text-error text-sm p-3 rounded-lg">
            {error}
          </div>
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
            className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
          {password.length > 0 && (
            <ul className="text-xs mt-1.5 space-y-0.5">
              <li className={hasMinLength ? "text-success" : "text-foreground/40"}>
                {hasMinLength ? "\u2713" : "\u2717"} 8 caractères minimum
              </li>
              <li className={hasUppercase ? "text-success" : "text-foreground/40"}>
                {hasUppercase ? "\u2713" : "\u2717"} Une majuscule
              </li>
              <li className={hasSpecial ? "text-success" : "text-foreground/40"}>
                {hasSpecial ? "\u2713" : "\u2717"} Un caractère spécial
              </li>
            </ul>
          )}
          {password.length === 0 && (
            <p className="text-xs text-foreground/40 mt-1">
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
            className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
        >
          {loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"}
        </button>
      </form>

      <p className="text-center text-sm text-foreground/60 mt-6">
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
          <p className="text-foreground/60 mt-1">
            Choisissez votre nouveau mot de passe
          </p>
        </div>

        <Suspense
          fallback={
            <div className="text-center text-foreground/60">Chargement...</div>
          }
        >
          <ResetPasswordForm />
        </Suspense>
      </div>
    </div>
  );
}
