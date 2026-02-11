"use client";

import { useState } from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/navigation";

interface ProfileClientProps {
  user: {
    name: string;
    email: string;
    createdAt: string;
  };
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

    if (newPassword && newPassword.length < 6) {
      setError("Le nouveau mot de passe doit faire au moins 6 caractères.");
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
    <div className="space-y-6">
      {/* User identity card */}
      <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
        <div className="flex items-center gap-5">
          <div className="w-14 h-14 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
            <span className="text-white text-lg font-bold leading-none">
              {initials}
            </span>
          </div>
          <div>
            <p className="text-xl font-bold text-foreground">{user.name}</p>
            <p className="text-sm text-foreground/45 mt-0.5">{user.email}</p>
            <p className="text-xs text-foreground/25 mt-1">
              Membre depuis le {memberSince}
            </p>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Messages */}
        {error && (
          <div className="bg-error/10 text-error text-sm px-4 py-3 rounded-xl">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-success/10 text-success text-sm px-4 py-3 rounded-xl">
            {success}
          </div>
        )}

        {/* Informations card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Informations personnelles
          </h2>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="name"
                className="block text-sm font-medium text-foreground/70 mb-1.5"
              >
                Nom complet
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-foreground/10 rounded-xl bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
              />
            </div>

            <div>
              <label
                htmlFor="email"
                className="block text-sm font-medium text-foreground/70 mb-1.5"
              >
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-foreground/10 rounded-xl bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
              />
            </div>
          </div>
        </div>

        {/* Security card */}
        <div className="bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
          <h2 className="text-lg font-semibold text-foreground mb-6">
            Sécurité
          </h2>

          <div className="space-y-5">
            <div>
              <label
                htmlFor="currentPassword"
                className="block text-sm font-medium text-foreground/70 mb-1.5"
              >
                Mot de passe actuel
              </label>
              <input
                id="currentPassword"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                required
                className="w-full px-4 py-2.5 border border-foreground/10 rounded-xl bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
              />
              <p className="text-xs text-foreground/30 mt-1.5">
                Requis pour valider toute modification
              </p>
            </div>

            <div>
              <label
                htmlFor="newPassword"
                className="block text-sm font-medium text-foreground/70 mb-1.5"
              >
                Nouveau mot de passe
                <span className="text-foreground/30 font-normal ml-1.5">
                  optionnel
                </span>
              </label>
              <input
                id="newPassword"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                className="w-full px-4 py-2.5 border border-foreground/10 rounded-xl bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
              />
            </div>

            {newPassword && (
              <div>
                <label
                  htmlFor="confirmPassword"
                  className="block text-sm font-medium text-foreground/70 mb-1.5"
                >
                  Confirmer le nouveau mot de passe
                </label>
                <input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  className="w-full px-4 py-2.5 border border-foreground/10 rounded-xl bg-transparent text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary/40 transition-colors"
                />
              </div>
            )}
          </div>
        </div>

        {/* Save button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-3 rounded-xl font-medium hover:bg-primary-light transition-colors disabled:opacity-50 cursor-pointer"
        >
          {loading ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>

      {/* Logout — subtle, at the bottom */}
      <div className="pt-4 border-t border-foreground/[0.06]">
        <button
          onClick={() => signOut({ callbackUrl: "/" })}
          className="flex items-center gap-2 text-sm text-foreground/35 hover:text-error transition-colors cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"
            />
          </svg>
          Se déconnecter
        </button>
      </div>
    </div>
  );
}
