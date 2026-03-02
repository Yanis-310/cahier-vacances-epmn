"use client";

import { useId, useState } from "react";

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

function formatPercent(value: number) {
  return `${Math.max(0, Math.min(100, Math.round(value)))}%`;
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
  const gradientId = useId();

  const activityData = period === 7 ? data.activity.slice(-7) : data.activity;
  const maxActivity = Math.max(...activityData.map((d) => d.count), 1);
  const totalActions = activityData.reduce((sum, item) => sum + item.count, 0);
  const avgActions = activityData.length > 0 ? totalActions / activityData.length : 0;
  const peakDay = activityData.reduce(
    (best, day) => (day.count > best.count ? day : best),
    activityData[0] ?? { date: "", count: 0 }
  );
  const completionAverage =
    data.exercises.length > 0 && data.totalUsers > 0
      ? data.exercises.reduce((sum, ex) => sum + (ex.completedCount / data.totalUsers) * 100, 0) /
        data.exercises.length
      : 0;
  const engagementRate =
    data.users.total > 0 ? (data.users.active / data.users.total) * 100 : 0;

  const chartWidth = Math.max(420, activityData.length * 34);
  const chartHeight = 240;
  const chartPadding = { top: 18, right: 16, bottom: 38, left: 38 };
  const chartPlotWidth = chartWidth - chartPadding.left - chartPadding.right;
  const chartPlotHeight = chartHeight - chartPadding.top - chartPadding.bottom;
  const chartStepX =
    activityData.length > 1 ? chartPlotWidth / (activityData.length - 1) : chartPlotWidth;
  const yFor = (value: number) =>
    chartPadding.top + chartPlotHeight - (value / maxActivity) * chartPlotHeight;
  const xFor = (index: number) => chartPadding.left + index * chartStepX;
  const chartPoints = activityData.map((point, index) => ({
    x: xFor(index),
    y: yFor(point.count),
    date: point.date,
    count: point.count,
  }));
  const chartLinePath =
    chartPoints.length > 0
      ? `M ${chartPoints.map((p) => `${p.x} ${p.y}`).join(" L ")}`
      : "";
  const chartAreaPath =
    chartPoints.length > 1
      ? `${chartLinePath} L ${chartPoints[chartPoints.length - 1].x} ${chartPadding.top + chartPlotHeight} L ${chartPoints[0].x} ${chartPadding.top + chartPlotHeight} Z`
      : "";
  const yTicks = [0, 0.25, 0.5, 0.75, 1];

  const kpis = [
    {
      label: "Apprenants inscrits",
      value: data.users.total,
      helper: `${formatPercent(engagementRate)} actifs`,
      color: "from-primary/15 to-primary/5 text-primary",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
        </svg>
      ),
    },
    {
      label: "Actifs (30 jours)",
      value: data.users.active,
      helper: `${Math.round(avgActions)} actions/jour`,
      color: "from-success/15 to-success/5 text-success",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M3.75 13.5l10.5-11.25L12 10.5h8.25L9.75 21.75 12 13.5H3.75z" />
        </svg>
      ),
    },
    {
      label: "Evaluations passees",
      value: data.evaluations.total,
      helper: `${data.exercises.length} exercices actifs`,
      color: "from-primary-light/15 to-primary-light/5 text-primary-light",
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
      helper: `${formatPercent(completionAverage)} completion moyenne`,
      color: "from-warning/15 to-warning/5 text-warning",
      icon: (
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
          <path d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="rounded-2xl border border-slate-200 bg-white/95 p-5 shadow-sm">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">Tableau de bord</h1>
            <p className="mt-0.5 text-sm text-slate-500">
              Vue rapide des performances et de l&apos;engagement
            </p>
          </div>
          <div className="inline-flex items-center rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-xs font-medium text-slate-600">
            Periode affichee: {period} jours
          </div>
        </div>
        <p className="mt-3 text-sm text-slate-500">
          Vue d&apos;ensemble de l&apos;activite des apprenants
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map((kpi) => (
          <div
            key={kpi.label}
            className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
          >
            <div className="flex items-start gap-3">
              <div
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br ${kpi.color}`}
              >
                {kpi.icon}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-medium uppercase tracking-wide text-slate-500">
                  {kpi.label}
                </p>
                <div className="mt-1 text-2xl font-bold text-slate-900">
                  {kpi.value}
                </div>
                <p className="mt-0.5 truncate text-xs text-slate-500">{kpi.helper}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Activity Chart */}
      <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <div>
            <h2 className="text-sm font-semibold text-slate-900">Activite quotidienne</h2>
            <p className="text-xs text-slate-500">
              Total: {totalActions} actions | Pic: {peakDay.count} le {peakDay.date ? formatDate(peakDay.date) : "--"}
            </p>
          </div>
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
          <div className="relative overflow-x-auto">
            <svg
              viewBox={`0 0 ${chartWidth} ${chartHeight}`}
              className="min-w-full"
              preserveAspectRatio="none"
              style={{ height: 240, minWidth: chartWidth }}
            >
              <defs>
                <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#930137" stopOpacity="0.35" />
                  <stop offset="100%" stopColor="#930137" stopOpacity="0.02" />
                </linearGradient>
              </defs>
              {yTicks.map((frac) => (
                <line
                  key={frac}
                  x1={chartPadding.left}
                  y1={chartPadding.top + chartPlotHeight - frac * chartPlotHeight}
                  x2={chartWidth - chartPadding.right}
                  y2={chartPadding.top + chartPlotHeight - frac * chartPlotHeight}
                  stroke="#e2e8f0"
                  strokeWidth="1"
                />
              ))}
              {yTicks.map((frac) => (
                <text
                  key={`label-${frac}`}
                  x={chartPadding.left - 8}
                  y={chartPadding.top + chartPlotHeight - frac * chartPlotHeight + 3}
                  textAnchor="end"
                  fontSize="10"
                  fill="#94a3b8"
                >
                  {Math.round(maxActivity * frac)}
                </text>
              ))}
              {chartAreaPath ? (
                <path d={chartAreaPath} fill={`url(#${gradientId})`} />
              ) : null}
              {chartLinePath ? (
                <path
                  d={chartLinePath}
                  fill="none"
                  stroke="#930137"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              ) : null}
              {chartPoints.map((point, index) => (
                <g key={point.date}>
                  <circle cx={point.x} cy={point.y} r="3.5" fill="#930137">
                    <title>
                      {formatDate(point.date)} : {point.count} action
                      {point.count > 1 ? "s" : ""}
                    </title>
                  </circle>
                  {(period === 7 ||
                    index % (period === 30 ? 5 : 3) === 0 ||
                    index === chartPoints.length - 1) && (
                    <text
                      x={point.x}
                      y={chartHeight - 12}
                      textAnchor="middle"
                      fontSize="10"
                      fill="#94a3b8"
                    >
                      {formatDate(point.date)}
                    </text>
                  )}
                </g>
              ))}
            </svg>
          </div>
        )}
      </div>

      {/* Exercises Table */}
      <div className="rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Completion par exercice</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            Progression moyenne: {formatPercent(completionAverage)}
          </p>
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
                  <tr key={ex.id} className="transition-colors hover:bg-slate-50">
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
                        <div className="h-2 flex-1 overflow-hidden rounded-full bg-primary-pale">
                          <div
                            className="h-2 rounded-full bg-primary transition-all"
                            style={{ width: `${Math.min(pct, 100)}%` }}
                          />
                        </div>
                        <span className="w-14 text-right text-xs font-medium text-slate-600">
                          {pct}%
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
