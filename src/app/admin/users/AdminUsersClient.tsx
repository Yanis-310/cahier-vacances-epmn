"use client";

import { useMemo, useState } from "react";

type AdminUser = {
  id: string;
  name: string;
  email: string;
  role: "OWNER" | "ADMIN" | "USER";
  createdAt: string;
};

type Stats = {
  total: number;
  admins: number;
  newThisMonth: number;
};

function shortId(id: string, name: string) {
  const hash = id.slice(0, 4).toUpperCase();
  const initials = name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
  return `#${hash}-${initials}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0] ?? "")
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

function formatDate(iso: string) {
  const d = new Date(iso);
  const months = [
    "Jan", "Fév", "Mar", "Avr", "Mai", "Juin",
    "Juil", "Août", "Sep", "Oct", "Nov", "Déc",
  ];
  return `${String(d.getDate()).padStart(2, "0")} ${months[d.getMonth()]} ${d.getFullYear()}`;
}

const AVATAR_COLORS = [
  "bg-slate-200 text-slate-600",
  "bg-blue-100 text-blue-600",
  "bg-amber-100 text-amber-600",
  "bg-emerald-100 text-emerald-600",
  "bg-purple-100 text-purple-600",
  "bg-pink-100 text-pink-600",
];

function avatarColor(id: string) {
  let hash = 0;
  for (let i = 0; i < id.length; i++) {
    hash = id.charCodeAt(i) + ((hash << 5) - hash);
  }
  return AVATAR_COLORS[Math.abs(hash) % AVATAR_COLORS.length];
}

const PER_PAGE = 10;

export default function AdminUsersClient({
  initialUsers,
  stats,
}: {
  initialUsers: AdminUser[];
  stats: Stats;
}) {
  const [users, setUsers] = useState(initialUsers);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "OWNER" | "ADMIN" | "USER">("all");
  const [page, setPage] = useState(1);

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

  const totalPages = Math.max(1, Math.ceil(filteredUsers.length / PER_PAGE));
  const paginated = filteredUsers.slice((page - 1) * PER_PAGE, page * PER_PAGE);

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
          : `${user.email} rétrogradé utilisateur.`
      );
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Erreur.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Messages */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Admin - Utilisateurs</h1>
        <p className="mt-1 text-sm text-slate-500">
          Gérez les rôles et les accès des membres de la plateforme.
        </p>
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative flex-1 sm:max-w-md">
          <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="Rechercher par nom ou email..."
            className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
          />
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500">Filtrer par rôle:</span>
          {(["all", "OWNER", "USER"] as const).map((f) => (
            <button
              key={f}
              type="button"
              onClick={() => { setRoleFilter(f); setPage(1); }}
              className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                roleFilter === f
                  ? "border-primary bg-primary text-white"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
              }`}
            >
              {f === "all" ? "Tous" : f}
            </button>
          ))}
        </div>
      </div>

      {/* Users table */}
      <div className="rounded-2xl border border-slate-200 bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                <th className="px-5 py-3">Utilisateur</th>
                <th className="px-5 py-3">Email</th>
                <th className="px-5 py-3">Rôle</th>
                <th className="px-5 py-3">Date de création</th>
                <th className="px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginated.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/50">
                  {/* Avatar + Name + ID */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor(user.id)}`}>
                        {initials(user.name)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900">{user.name}</div>
                        <div className="text-[11px] text-slate-400">ID: {shortId(user.id, user.name)}</div>
                      </div>
                    </div>
                  </td>
                  {/* Email */}
                  <td className="px-5 py-4 text-slate-600">{user.email}</td>
                  {/* Role badge */}
                  <td className="px-5 py-4">
                    {user.role === "OWNER" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-primary px-2.5 py-1 text-[10px] font-bold uppercase text-white">
                        <svg className="h-3 w-3" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 1l3.22 6.636 7.28.962-5.25 5.214 1.25 7.188L12 17.77 5.5 21l1.25-7.188L1.5 8.598l7.28-.962L12 1z" />
                        </svg>
                        OWNER
                      </span>
                    ) : user.role === "ADMIN" ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase text-amber-700">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                          <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        ADMIN
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 px-2.5 py-1 text-[10px] font-bold uppercase text-slate-500">
                        <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                        </svg>
                        USER
                      </span>
                    )}
                  </td>
                  {/* Date */}
                  <td className="px-5 py-4 text-slate-500">{formatDate(user.createdAt)}</td>
                  {/* Actions */}
                  <td className="px-5 py-4">
                    {user.role === "USER" && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => updateRole(user, "ADMIN")}
                        className="rounded-full border border-primary px-4 py-1.5 text-xs font-medium text-primary transition-colors hover:bg-primary-pale disabled:opacity-50"
                      >
                        Promouvoir admin
                      </button>
                    )}
                    {user.role === "ADMIN" && (
                      <button
                        type="button"
                        disabled={loading}
                        onClick={() => updateRole(user, "USER")}
                        className="rounded-full border border-slate-300 px-4 py-1.5 text-xs font-medium text-slate-600 transition-colors hover:bg-slate-50 disabled:opacity-50"
                      >
                        Rétrograder user
                      </button>
                    )}
                  </td>
                </tr>
              ))}
              {filteredUsers.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-5 py-12 text-center text-sm text-slate-400">
                    Aucun utilisateur correspondant.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {filteredUsers.length > PER_PAGE && (
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-100 px-5 py-3 sm:flex-row">
            <p className="text-sm text-slate-500">
              Affichage de {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filteredUsers.length)} sur {filteredUsers.length} utilisateurs
            </p>
            <div className="flex items-center gap-1">
              <button
                type="button"
                disabled={page <= 1}
                onClick={() => setPage(page - 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border text-sm text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-30"
              >
                &lsaquo;
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                    page === p
                      ? "border-primary bg-primary text-white"
                      : "text-slate-500 hover:bg-slate-50"
                  }`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                disabled={page >= totalPages}
                onClick={() => setPage(page + 1)}
                className="flex h-8 w-8 items-center justify-center rounded-lg border text-sm text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-30"
              >
                &rsaquo;
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Total utilisateurs
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.total.toLocaleString("fr-FR")}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary-pale text-primary">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Administrateurs
            </div>
            <div className="text-2xl font-bold text-slate-900">{stats.admins}</div>
          </div>
        </div>

        <div className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-50 text-emerald-500">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
              <path d="M19 21v-2a4 4 0 00-4-4H9a4 4 0 00-4 4v2" />
              <circle cx="12" cy="7" r="4" />
              <path d="M19 8v6M22 11h-6" />
            </svg>
          </div>
          <div>
            <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
              Nouveaux ce mois
            </div>
            <div className="text-2xl font-bold text-slate-900">+{stats.newThisMonth}</div>
          </div>
        </div>
      </div>
    </div>
  );
}
