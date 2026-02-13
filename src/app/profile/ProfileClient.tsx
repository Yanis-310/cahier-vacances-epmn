"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";
import FeedbackMessage from "@/components/FeedbackMessage";

interface ProfileClientProps {
  user: {
    name: string;
    email: string;
    createdAt: string;
  };
}

function InfoCard({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-foreground/8 bg-white p-5 shadow-sm">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/35">{label}</p>
      <p className="mt-2 text-lg font-semibold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-sm text-foreground/45">{hint}</p>}
    </div>
  );
}

export default function ProfileClient({ user }: ProfileClientProps) {
  const { update: updateSession } = useSession();
  const router = useRouter();

  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasSpecial = /[^A-Za-z0-9]/.test(newPassword);
  const isNewPasswordValid = hasMinLength && hasUppercase && hasSpecial;

  const memberSince = new Date(user.createdAt).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const initials = user.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (newPassword && newPassword !== confirmPassword) {
      setError("Les nouveaux mots de passe ne correspondent pas.");
      return;
    }

    if (newPassword && !isNewPasswordValid) {
      setError(
        "Le mot de passe doit contenir au moins 8 caractères, une majuscule et un caractère spécial."
      );
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          currentPassword,
          newPassword: newPassword || undefined,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Erreur lors de la mise à jour.");
        setLoading(false);
        return;
      }

      await updateSession({ name: data.name, email: data.email });
      router.refresh();

      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      setSuccess("Profil mis à jour avec succès.");
    } catch {
      setError("Erreur de connexion au serveur.");
    }

    setLoading(false);
  }

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
      <aside className="space-y-4 lg:col-span-1">
        <div className="rounded-2xl border border-foreground/8 bg-white p-6 shadow-sm">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary">
              <span className="text-lg font-bold leading-none text-white">{initials}</span>
            </div>
            <div>
              <p className="text-lg font-bold text-foreground">{user.name}</p>
              <p className="text-sm text-foreground/45">{user.email}</p>
            </div>
          </div>
          <p className="mt-4 border-t border-foreground/8 pt-3 text-xs text-foreground/35">
            Membre depuis le {memberSince}
          </p>
        </div>

        <InfoCard label="Nom" value={name} hint="Affiché dans la navigation" />
        <InfoCard label="Email" value={email} hint="Adresse de connexion" />

        <div className="rounded-2xl border border-foreground/8 bg-white p-4 shadow-sm">
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-foreground/10 px-4 py-2.5 text-sm font-medium text-foreground/60 transition hover:border-error/30 hover:text-error cursor-pointer"
          >
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.7}
                d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
              />
            </svg>
            Se déconnecter
          </button>
        </div>
      </aside>

      <section className="lg:col-span-2">
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <FeedbackMessage id="profile-feedback" message={error} variant="error" />
          )}
          {success && (
            <FeedbackMessage message={success} variant="success" />
          )}

          <div className="rounded-2xl border border-foreground/8 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-foreground">Informations personnelles</h2>
            <p className="mt-1 text-sm text-foreground/45">Mettez à jour vos informations de base.</p>

            <div className="mt-6 space-y-5">
              <div>
                <label htmlFor="name" className="mb-1.5 block text-sm font-medium text-foreground/70">
                  Nom complet
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-foreground/12 bg-white px-4 py-2.5 text-foreground transition-colors focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>

              <div>
                <label htmlFor="email" className="mb-1.5 block text-sm font-medium text-foreground/70">
                  Adresse email
                </label>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full rounded-xl border border-foreground/12 bg-white px-4 py-2.5 text-foreground transition-colors focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
              </div>
            </div>
          </div>

          <div className="rounded-2xl border border-foreground/8 bg-white p-6 shadow-sm sm:p-8">
            <h2 className="text-lg font-semibold text-foreground">Sécurité</h2>
            <p className="mt-1 text-sm text-foreground/45">Changez votre mot de passe si nécessaire.</p>

            <div className="mt-6 space-y-5">
              <div>
                <label
                  htmlFor="currentPassword"
                  className="mb-1.5 block text-sm font-medium text-foreground/70"
                >
                  Mot de passe actuel
                </label>
                <input
                  id="currentPassword"
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  required
                  className="w-full rounded-xl border border-foreground/12 bg-white px-4 py-2.5 text-foreground transition-colors focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />
                <p className="mt-1.5 text-xs text-foreground/35">Requis pour valider toute modification.</p>
              </div>

              <div>
                <label htmlFor="newPassword" className="mb-1.5 block text-sm font-medium text-foreground/70">
                  Nouveau mot de passe
                  <span className="ml-1.5 font-normal text-foreground/35">optionnel</span>
                </label>
                <input
                  id="newPassword"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  minLength={8}
                  className="w-full rounded-xl border border-foreground/12 bg-white px-4 py-2.5 text-foreground transition-colors focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                />

                {newPassword.length > 0 && (
                  <ul className="mt-1.5 space-y-0.5 text-xs">
                    <li className={hasMinLength ? "text-success" : "text-foreground/45"}>
                      {hasMinLength ? "✓" : "✗"} 8 caractères minimum
                    </li>
                    <li className={hasUppercase ? "text-success" : "text-foreground/45"}>
                      {hasUppercase ? "✓" : "✗"} Une majuscule
                    </li>
                    <li className={hasSpecial ? "text-success" : "text-foreground/45"}>
                      {hasSpecial ? "✓" : "✗"} Un caractère spécial
                    </li>
                  </ul>
                )}
              </div>

              {newPassword && (
                <div>
                  <label
                    htmlFor="confirmPassword"
                    className="mb-1.5 block text-sm font-medium text-foreground/70"
                  >
                    Confirmer le nouveau mot de passe
                  </label>
                  <input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                    className="w-full rounded-xl border border-foreground/12 bg-white px-4 py-2.5 text-foreground transition-colors focus:border-primary/40 focus:outline-none focus:ring-2 focus:ring-primary/20"
                  />
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-primary py-3 font-medium text-white transition-colors hover:bg-primary-light disabled:cursor-not-allowed disabled:opacity-50 cursor-pointer"
          >
            {loading ? "Enregistrement..." : "Enregistrer les modifications"}
          </button>
        </form>
      </section>
    </div>
  );
}
