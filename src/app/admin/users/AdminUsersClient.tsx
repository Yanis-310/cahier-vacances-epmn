"use client";

import { useMemo, useState } from "react";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "USER";
  createdAt: string;
};

export default function AdminUsersClient({
  initialUsers,
}: {
  initialUsers: AdminUser[];
}) {
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "OWNER" | "ADMIN" | "USER">(
    "all"
  );

  const filteredUsers = useMemo(() => {
    const term = search.trim().toLowerCase();
    return users.filter((user) => {
      if (roleFilter !== "all" && user.role !== roleFilter) return false;
      if (!term) return true;
      return (
        user.name.toLowerCase().includes(term) ||
        user.email.toLowerCase().includes(term)
      );
    });
  }, [users, search, roleFilter]);

  async function reloadUsers() {
    const response = await fetch("/api/admin/users");
    const data = (await response.json()) as { users?: AdminUser[]; error?: string };
    if (!response.ok || !data.users) {
      throw new Error(data.error ?? "Impossible de charger les utilisateurs.");
    }
    setUsers(data.users);
  }

  async function updateRole(user: AdminUser, nextRole: "ADMIN" | "USER") {
    setLoading(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ role: nextRole }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Mise a jour impossible.");
      }
      await reloadUsers();
      setSuccess(
        nextRole === "ADMIN"
          ? `${user.email} promu admin.`
          : `${user.email} retrograde utilisateur.`
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Erreur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-xl border border-foreground/10 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Admin - Utilisateurs</h1>
        <p className="mt-2 text-sm text-foreground/60">
          Owner uniquement: promotion et retrogradation des admins.
        </p>
      </section>

      <section className="rounded-xl border border-foreground/10 bg-white p-6 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Recherche nom ou email"
            className="rounded border border-foreground/20 px-3 py-2 text-sm"
          />
          <select
            value={roleFilter}
            onChange={(event) =>
              setRoleFilter(
                event.target.value as "all" | "OWNER" | "ADMIN" | "USER"
              )
            }
            className="rounded border border-foreground/20 px-3 py-2 text-sm"
          >
            <option value="all">Tous roles</option>
            <option value="OWNER">OWNER</option>
            <option value="ADMIN">ADMIN</option>
            <option value="USER">USER</option>
          </select>
        </div>
      </section>

      <section className="rounded-xl border border-foreground/10 bg-white p-6 shadow-sm">
        <div className="space-y-3">
          {filteredUsers.map((user) => (
            <article
              key={user.id}
              className="flex flex-col gap-3 rounded-lg border border-foreground/10 p-4 sm:flex-row sm:items-center sm:justify-between"
            >
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-sm text-foreground/55">{user.email}</p>
                <p className="text-xs text-foreground/45">
                  Role: {user.role} | Cree le{" "}
                  {new Date(user.createdAt).toLocaleDateString("fr-FR")}
                </p>
              </div>
              <div className="flex flex-wrap gap-2">
                {user.role !== "OWNER" && user.role !== "ADMIN" && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => updateRole(user, "ADMIN")}
                    className="rounded border border-foreground/20 px-3 py-2 text-sm hover:bg-foreground/5 disabled:opacity-50"
                  >
                    Promouvoir admin
                  </button>
                )}
                {user.role === "ADMIN" && (
                  <button
                    type="button"
                    disabled={loading}
                    onClick={() => updateRole(user, "USER")}
                    className="rounded border border-foreground/20 px-3 py-2 text-sm hover:bg-foreground/5 disabled:opacity-50"
                  >
                    Retrograder user
                  </button>
                )}
              </div>
            </article>
          ))}
          {filteredUsers.length === 0 && (
            <p className="text-sm text-foreground/45">Aucun utilisateur.</p>
          )}
        </div>
      </section>

      {error && <p className="text-sm text-error">{error}</p>}
      {success && <p className="text-sm text-success">{success}</p>}
    </div>
  );
}
