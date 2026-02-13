"use client";

import { signIn } from "next-auth/react";
import Link from "next/link";
import { useState } from "react";
import FeedbackMessage from "@/components/FeedbackMessage";
import Toast from "@/components/Toast";

export default function RegisterPage() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const hasMinLength = password.length >= 8;
  const hasUppercase = /[A-Z]/.test(password);
  const hasSpecial = /[^A-Za-z0-9]/.test(password);
  const isPasswordValid = hasMinLength && hasUppercase && hasSpecial;

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setStatus("");
    setLoading(true);

    const formData = new FormData(e.currentTarget);
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const passwordValue = formData.get("password") as string;
    const confirmPassword = formData.get("confirmPassword") as string;

    if (!isPasswordValid) {
      const message = "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial.";
      setError(message);
      setToastMessage(message);
      setLoading(false);
      return;
    }

    if (passwordValue !== confirmPassword) {
      const message = "Les mots de passe ne correspondent pas.";
      setError(message);
      setToastMessage(message);
      setLoading(false);
      return;
    }

    const res = await fetch("/api/register", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, email, password: passwordValue }),
    });

    if (!res.ok) {
      const data = await res.json();
      const message = data.error || "Une erreur est survenue.";
      setError(message);
      setToastMessage(message);
      setLoading(false);
      return;
    }

    setStatus("Compte créé. Connexion en cours...");
    await signIn("credentials", {
      email,
      password: passwordValue,
      callbackUrl: "/exercises",
    });
  }

  return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <Toast
        message={toastMessage}
        variant="error"
        onClose={() => setToastMessage(null)}
      />

      <div className="bg-white rounded-xl shadow-sm p-8 w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="text-2xl font-bold text-primary">
            EPMN
          </Link>
          <h1 className="text-xl font-semibold mt-4">Créer un compte</h1>
          <p className="text-foreground/70 mt-1">
            Rejoignez le cahier de vacances des MP
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4" aria-busy={loading}>
          {error && (
            <FeedbackMessage
              id="register-feedback"
              message={error}
              variant="error"
            />
          )}

          {status && !error && (
            <FeedbackMessage
              id="register-status"
              message={status}
              variant="info"
            />
          )}

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nom complet
            </label>
            <input
              id="name"
              name="name"
              type="text"
              autoComplete="name"
              required
              aria-invalid={!!error}
              aria-describedby={error ? "register-feedback" : undefined}
              className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              aria-invalid={!!error}
              aria-describedby={error ? "register-feedback" : undefined}
              className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium mb-1"
            >
              Mot de passe
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="new-password"
              required
              minLength={8}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              aria-invalid={!!error}
              aria-describedby={error ? "register-feedback" : undefined}
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
              autoComplete="new-password"
              required
              minLength={8}
              aria-invalid={!!error}
              aria-describedby={error ? "register-feedback" : undefined}
              className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/70 focus-visible:ring-offset-2 cursor-pointer disabled:cursor-not-allowed"
          >
            {loading ? "Création..." : "Créer mon compte"}
          </button>
        </form>

        <p className="text-center text-sm text-foreground/70 mt-6">
          Déjà un compte ?{" "}
          <Link href="/login" className="text-primary hover:underline">
            Se connecter
          </Link>
        </p>
      </div>
    </div>
  );
}
