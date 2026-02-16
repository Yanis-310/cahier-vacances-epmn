"use client";

import { useState } from "react";

type AnalyticsData = {
  users: { total: number; active: number };
  evaluations: { total: number; averageScore: number | null };
  exercises: Array<{
    id: string;
    number: number;
    title: string;
    type: string;
    completedCount: number;
    averageScore: number | null;
  }>;
  activity: Array<{ date: string; count: number }>;
  totalUsers: number;
};

function formatDate(dateStr: string) {
  const d = new Date(dateStr + "T00:00:00");
  return `${String(d.getDate()).padStart(2, "0")}/${String(d.getMonth() + 1).padStart(2, "0")}`;
}

function typeBadgeLabel(type: string) {
  const labels: Record<string, string> = {
    single_choice: "Choix unique",
    qcm: "QCM",
    multi_select: "Multi-choix",
    true_false: "Vrai/Faux",
    free_text: "Texte libre",
    labyrinth: "Labyrinthe",
  };
  return labels[type] ?? type;
}

function ScoreBadge({ score }: { score: number | null }) {
  if (score === null) {
    return (
      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-500">
        --
      </span>
    );
  }
  let colorClass = "bg-red-100 text-red-700";
  if (score >= 70) colorClass = "bg-green-100 text-green-700";
  else if (score >= 40) colorClass = "bg-amber-100 text-amber-700";

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${colorClass}`}
    >
      {score}%
    </span>
  );
}

export default function AnalyticsClient({ data }: { data: AnalyticsData }) {
  const [period, setPeriod] = useState<7 | 30>(30);

  const activityData =
    period === 7 ? data.activity.slice(-7) : data.activity;
  const maxActivity = Math.max(...activityData.map((d) => d.count), 1);

  const kpis = [
    {
      label: "Apprenants inscrits",
      value: data.users.total,
      color: "bg-primary/10 text-primary",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      label: "Actifs (30 jours)",
      value: data.users.active,
      color: "bg-success/10 text-success",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
    },
    {
      label: "Evaluations passees",
      value: data.evaluations.total,
      color: "bg-primary-light/10 text-primary-light",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
    },
    {
      label: "Score moyen eval.",
      value:
        data.evaluations.averageScore !== null
          ? `${data.evaluations.averageScore}%`
          : "--",
      color: "bg-warning/10 text-warning",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">Statistiques</h1>
        <p className="mt-0.5 text-sm text-slate-500">
          Vue d&apos;ensemble de l&apos;activite des apprenants
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-xl border border-slate-200 bg-white p-4"
          >
            <div className="flex items-center gap-3">
              <div
                className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${kpi.color}`}
              >
                {kpi.icon}
              </div>
              <div>
                <div className="text-xl font-bold text-slate-900">
                  {kpi.value}
                </div>
                <div className="text-xs text-foreground/50">{kpi.label}</div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Chart */}
      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold text-slate-900">
            Activite
          </h2>
          <div className="flex gap-1 rounded-lg bg-slate-100 p-0.5">
            <button
              onClick={() => setPeriod(7)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                period === 7
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              7 jours
            </button>
            <button
              onClick={() => setPeriod(30)}
              className={`rounded-md px-3 py-1 text-xs font-medium transition-colors ${
                period === 30
                  ? "bg-white text-slate-900 shadow-sm"
                  : "text-slate-500 hover:text-slate-700"
              }`}
            >
              30 jours
            </button>
          </div>
        </div>

        {maxActivity === 1 && activityData.every((d) => d.count === 0) ? (
          <div className="flex h-40 items-center justify-center text-sm text-slate-400">
            Aucune activite sur cette periode
          </div>
        ) : (
          <div className="relative">
            <svg
              viewBox={`0 0 ${activityData.length * 28 + 10} 200`}
              className="w-full"
              preserveAspectRatio="xMidYMid meet"
              style={{ height: 220, maxHeight: 220 }}
            >
              {/* Grid lines */}
              {[0, 0.25, 0.5, 0.75, 1].map((frac) => (
                <line
                  key={frac}
                  x1="0"
                  y1={170 - frac * 150}
                  x2={activityData.length * 28 + 10}
                  y2={170 - frac * 150}
                  stroke="#e2e8f0"
                  strokeWidth="0.5"
                />
              ))}
              {/* Bars */}
              {activityData.map((d, i) => {
                const barHeight = (d.count / maxActivity) * 150;
                const x = i * 28 + 8;
                return (
                  <g key={d.date}>
                    <rect
                      x={x}
                      y={170 - barHeight}
                      width="18"
                      height={Math.max(barHeight, 0)}
                      rx="3"
                      fill="#930137"
                      opacity="0.85"
                    >
                      <title>
                        {formatDate(d.date)} : {d.count} action{d.count !== 1 ? "s" : ""}
                      </title>
                    </rect>
                    {/* X labels - show every nth */}
                    {(period === 7 ||
                      i % (period === 30 ? 5 : 3) === 0 ||
                      i === activityData.length - 1) && (
                      <text
                        x={x + 9}
                        y="190"
                        textAnchor="middle"
                        fontSize="8"
                        fill="#94a3b8"
                      >
                        {formatDate(d.date)}
                      </text>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>
        )}
      </div>

      {/* Exercises Table */}
      <div className="rounded-xl border border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">
            Completion par exercice
          </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 text-left text-xs font-medium uppercase tracking-wider text-slate-400">
                <th className="px-4 py-2.5 w-10">#</th>
                <th className="px-4 py-2.5">Titre</th>
                <th className="px-4 py-2.5 w-28">Type</th>
                <th className="px-4 py-2.5 w-48">Completion</th>
                <th className="px-4 py-2.5 w-24 text-center">Score moy.</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {data.exercises.map((ex) => {
                const pct =
                  data.totalUsers > 0
                    ? Math.round((ex.completedCount / data.totalUsers) * 100)
                    : 0;
                return (
                  <tr key={ex.id} className="hover:bg-slate-50">
                    <td className="px-4 py-2 font-medium text-slate-500">
                      {ex.number}
                    </td>
                    <td className="px-4 py-2 font-medium text-slate-900">
                      {ex.title}
                    </td>
                    <td className="px-4 py-2">
                      <span className="inline-flex items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-medium text-slate-600">
                        {typeBadgeLabel(ex.type)}
                      </span>
                    </td>
                    <td className="px-4 py-2">
                      <div className="flex items-center gap-2.5">
                        <div className="h-2 flex-1 rounded-full bg-primary-pale">
                          <div
                            className="h-2 rounded-full bg-primary transition-all"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="w-12 text-right text-xs text-slate-500">
                          {ex.completedCount}/{data.totalUsers}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-2 text-center">
                      <ScoreBadge score={ex.averageScore} />
                    </td>
                  </tr>
                );
              })}
              {data.exercises.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    Aucun exercice actif
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
