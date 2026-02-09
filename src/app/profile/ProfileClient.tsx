"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";
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
    <div className="bg-white rounded-xl shadow-sm p-8">
      <h1 className="text-2xl font-bold text-foreground mb-1">Mon profil</h1>
      <p className="text-sm text-foreground/50 mb-8">
        Membre depuis le {memberSince}
      </p>

      <form onSubmit={handleSubmit} className="space-y-8">
        {error && (
          <div className="bg-error/10 text-error text-sm p-3 rounded-lg">
            {error}
          </div>
        )}
        {success && (
          <div className="bg-success/10 text-success text-sm p-3 rounded-lg">
            {success}
          </div>
        )}

        {/* Informations section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Informations
          </h2>

          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Nom
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>
        </div>

        {/* Password section */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-foreground">
            Mot de passe
          </h2>

          <div>
            <label
              htmlFor="currentPassword"
              className="block text-sm font-medium mb-1"
            >
              Mot de passe actuel <span className="text-error">*</span>
            </label>
            <input
              id="currentPassword"
              type="password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
              className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
            <p className="text-xs text-foreground/50 mt-1">
              Requis pour valider toute modification
            </p>
          </div>

          <div>
            <label
              htmlFor="newPassword"
              className="block text-sm font-medium mb-1"
            >
              Nouveau mot de passe{" "}
              <span className="text-foreground/40">(optionnel)</span>
            </label>
            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
            />
          </div>

          {newPassword && (
            <div>
              <label
                htmlFor="confirmPassword"
                className="block text-sm font-medium mb-1"
              >
                Confirmer le nouveau mot de passe
              </label>
              <input
                id="confirmPassword"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary"
              />
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-primary text-white py-2.5 rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
        >
          {loading ? "Enregistrement..." : "Enregistrer les modifications"}
        </button>
      </form>
    </div>
  );
}
