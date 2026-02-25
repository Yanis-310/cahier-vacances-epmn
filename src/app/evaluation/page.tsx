import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import StartButton from "./StartButton";

function ScoreRing({
  percent,
  size = 56,
  strokeWidth = 4,
}: {
  percent: number;
  size?: number;
  strokeWidth?: number;
}) {
  const r = (size - strokeWidth) / 2;
  const c = 2 * Math.PI * r;
  const color =
    percent >= 75
      ? "text-success"
      : percent >= 50
        ? "text-warning"
        : "text-error";

  return (
    <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
      <svg className="-rotate-90" width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className="text-foreground/10"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          className={color}
          strokeDasharray={c}
          strokeDashoffset={c * (1 - percent / 100)}
        />
      </svg>
      <span
        className={`absolute inset-0 flex items-center justify-center font-bold ${color}`}
        style={{ fontSize: size * 0.24 }}
      >
        {percent}%
      </span>
    </div>
  );
}

function Sparkline({ scores }: { scores: number[] }) {
  if (scores.length < 2) return null;

  const data = scores.slice(0, 8).reverse();
  const w = 120;
  const h = 36;
  const pad = 4;
  const stepX = (w - pad * 2) / (data.length - 1);

  const points = data
    .map((s, i) => {
      const x = pad + i * stepX;
      const y = h - pad - (s / 100) * (h - pad * 2);
      return `${x},${y}`;
    })
    .join(" ");

  const last = data[data.length - 1];
  const color =
    last >= 75
      ? "rgb(22, 163, 74)"
      : last >= 50
        ? "rgb(245, 158, 11)"
        : "rgb(220, 38, 38)";

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="flex-shrink-0">
      <defs>
        <linearGradient id="sparkFill" x1="0" y1="0" x2="0" y2={h}>
          <stop offset="0%" stopColor={color} stopOpacity="0.35" />
          <stop offset="100%" stopColor={color} stopOpacity="0" />
        </linearGradient>
      </defs>
      <polyline
        points={`${pad},${h - pad} ${points} ${w - pad},${h - pad}`}
        fill="url(#sparkFill)"
        stroke="none"
        opacity="0.28"
      />
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.8"
      />
      {(() => {
        const lastX = pad + (data.length - 1) * stepX;
        const lastY = h - pad - (last / 100) * (h - pad * 2);
        return <circle cx={lastX} cy={lastY} r="3" fill={color} />;
      })()}
    </svg>
  );
}

function getMotivation(count: number, avg: number): string {
  if (count === 0) return "Lancez votre première évaluation.";
  if (avg >= 90) return "Niveau excellent, continuez.";
  if (avg >= 75) return "Très bon niveau, bravo.";
  if (avg >= 50) return "Vous êtes en bonne voie.";
  return "Continuez vos révisions.";
}

const metricCards = [
  { icon: "/icons/solar/bateau2 1.png", bg: "rgba(252, 219, 80, 0.73)" },
  { icon: "/icons/solar/glaciere3.png", bg: "rgba(242, 193, 116, 0.77)" },
  { icon: "/icons/solar/bateausable 1.png", bg: "rgba(255, 152, 120, 0.67)" },
  { icon: "/icons/solar/cocktail 1.png", bg: "rgba(30, 207, 207, 0.46)" },
];

function MetricCard({
  label,
  value,
  hint,
  icon,
  bg,
}: {
  label: string;
  value: string;
  hint?: string;
  icon: string;
  bg: string;
}) {
  return (
    <div
      className="rounded-xl p-5 relative overflow-hidden"
      style={{ backgroundColor: bg }}
    >
      <img
        src={icon}
        alt=""
        className="absolute top-1/2 -translate-y-1/2 right-3 w-16 h-16 object-contain pointer-events-none"
      />
      <div className="pr-[72px]">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/60">{label}</p>
        <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
        {hint && <p className="mt-1 text-sm text-foreground/60">{hint}</p>}
      </div>
    </div>
  );
}

export default async function EvaluationPage() {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const evaluations = await prisma.evaluation.findMany({
    where: { userId: session.user.id },
    orderBy: { createdAt: "desc" },
  });

  const completed = evaluations.filter((e) => e.completedAt);
  const inProgress = evaluations.find((e) => !e.completedAt);

  const scores = completed.map((e) =>
    e.total > 0 ? Math.round(((e.score ?? 0) / e.total) * 100) : 0
  );
  const bestScore = scores.length > 0 ? Math.max(...scores) : 0;
  const avgScore =
    scores.length > 0
      ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
      : 0;

  const latestScore = scores.length > 0 ? scores[0] : null;
  const previousScore = scores.length > 1 ? scores[1] : null;
  const trend =
    latestScore !== null && previousScore !== null
      ? latestScore - previousScore
      : null;

  const bestEvalId =
    completed.length > 1
      ? completed.reduce((best, ev) => {
        const evPct =
          ev.total > 0 ? Math.round(((ev.score ?? 0) / ev.total) * 100) : 0;
        const bestPct =
          best.total > 0
            ? Math.round(((best.score ?? 0) / best.total) * 100)
            : 0;
        return evPct > bestPct ? ev : best;
      }).id
      : null;

  const metricData = [
    { label: "Évaluations terminées", value: `${completed.length}`, hint: getMotivation(completed.length, avgScore) },
    { label: "Score Moyen", value: `${avgScore}%`, hint: "Moyenne de toutes vos évaluations terminées" },
    { label: "Meilleur performances", value: `${bestScore}%`, hint: completed.length > 0 ? "Votre record personnel actuel" : "Pas encore de score enregistré" },
    { label: "Tendances récentes", value: trend === null ? "--" : `${trend > 0 ? "+" : ""}${trend} pts`, hint: trend === null ? "Complétez 2 évaluations pour voir la tendance" : trend > 0 ? "Progression sur la dernière session" : trend < 0 ? "Légère baisse, continuez" : "Niveau stable" },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen relative" style={{ backgroundColor: '#FCF4E8' }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 relative">
          {/* Section wrapper for hibiscus overflow */}
          <div className="relative">
            {/* Decorative hibiscus — top-right corner */}
            <img
              src="/icons/solar/fleur 1.png"
              alt=""
              className="absolute object-contain pointer-events-none z-30"
              style={{ top: '-70px', right: '-50px', width: '180px', height: '180px' }}
            />

            <section className="rounded-2xl border-2 bg-white shadow-sm relative overflow-hidden" style={{ borderColor: '#F2C073' }}>
              <div className="p-6 sm:p-8">
                <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
                  <div className="max-w-2xl">
                    <p className="inline-flex items-center rounded-full border bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]" style={{ borderColor: '#F2C073', color: '#333' }}>
                      Session de niveau
                    </p>
                    <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: '#F2C073' }}>
                      Évaluez votre progression
                    </h1>
                    <p className="mt-3 text-base leading-relaxed text-foreground/60 sm:text-lg">
                      20 questions mélangées pour mesurer votre niveau réel, puis revoir vos résultats de manière claire.
                    </p>
                  </div>

                  <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center lg:w-auto">
                    {inProgress && (
                      <Link
                        href={`/evaluation/${inProgress.id}`}
                        className="group flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium text-white shadow-sm transition hover:shadow"
                        style={{ backgroundColor: '#F2C073' }}
                      >
                        <span className="relative flex h-2.5 w-2.5">
                          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-white opacity-40" />
                          <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-white" />
                        </span>
                        <span>reprendre l&apos;evaluation en cours</span>
                        <svg
                          className="h-4 w-4 text-white/70 transition group-hover:translate-x-0.5"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 5l7 7-7 7"
                          />
                        </svg>
                      </Link>
                    )}
                    <div className={inProgress ? "" : "sm:min-w-[220px]"}>
                      <StartButton variant={inProgress ? "outline" : "primary"} />
                    </div>
                  </div>
                </div>

                <div className="mt-7 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                  {metricData.map((m, i) => (
                    <MetricCard
                      key={m.label}
                      label={m.label}
                      value={m.value}
                      hint={m.hint}
                      icon={metricCards[i].icon}
                      bg={metricCards[i].bg}
                    />
                  ))}
                </div>
              </div>
            </section>
          </div>

          <section className="mt-10">
            <div className="mb-5">
              <h2 className="text-xl font-semibold" style={{ color: '#F2C073' }}>Historique</h2>
            </div>

            {completed.length > 0 && (
              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {completed.map((ev, index) => {
                  const pct =
                    ev.total > 0 ? Math.round(((ev.score ?? 0) / ev.total) * 100) : 0;
                  const isBest = ev.id === bestEvalId;
                  const badgeClasses =
                    pct >= 75
                      ? "bg-success/10 text-success"
                      : pct >= 50
                        ? "bg-warning/10 text-warning"
                        : "bg-error/10 text-error";

                  const crabIcon = pct >= 50
                    ? "/icons/solar/crabe heureux.png"
                    : "/icons/solar/crabe pas content 1.png";

                  return (
                    <Link
                      key={ev.id}
                      href={`/evaluation/${ev.id}/result`}
                      className={`grid-card-enter group relative flex min-h-[174px] flex-col rounded-xl bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg ${isBest
                        ? "bg-gradient-to-br from-white to-amber-50/60 ring-1 ring-amber-200/80"
                        : "shadow-sm"
                        }`}
                      style={{
                        animationDelay: `${index * 0.04}s`,
                        border: `1.5px solid #F2C073`,
                      }}
                    >
                      <div className="mb-4 flex items-start justify-between">
                        <span className="text-xs font-semibold uppercase tracking-[0.16em]" style={{ color: '#F2C073' }}>
                          Session {String(index + 1).padStart(2, "0")}
                        </span>
                        <div className="flex flex-col items-end gap-1">
                          {isBest && (
                            <span className="rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold uppercase tracking-[0.12em] text-amber-700">
                              Best
                            </span>
                          )}
                          <div className="flex items-center gap-2">
                            <img
                              src={crabIcon}
                              alt={pct >= 50 ? "Bon score" : "Score à améliorer"}
                              className="w-8 h-8 object-contain"
                            />
                            <span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClasses}`}>
                              {pct}%
                            </span>
                          </div>
                        </div>
                      </div>

                      <div className="mb-auto flex items-center gap-3">
                        <ScoreRing percent={pct} size={52} strokeWidth={4} />
                        <div>
                          <p className="font-medium text-foreground transition-colors group-hover:text-foreground/80">
                            {ev.score}/{ev.total} bonne{(ev.score ?? 0) !== 1 ? "s" : ""}
                          </p>
                          <p className="mt-0.5 text-sm text-foreground/45">
                            {new Date(ev.createdAt).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                            })}
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 flex items-center justify-between border-t pt-3" style={{ borderColor: '#F2C07340' }}>
                        <span className="text-xs text-foreground/30">
                          {new Date(ev.createdAt).toLocaleTimeString("fr-FR", {
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </span>
                        <span className="flex items-center gap-1 text-xs font-semibold transition" style={{ color: '#F2C073' }}>
                          Voir le détail
                          <svg
                            className="h-3.5 w-3.5 translate-x-0 transition-transform group-hover:translate-x-0.5"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M9 5l7 7-7 7"
                            />
                          </svg>
                        </span>
                      </div>


                    </Link>
                  );
                })}
              </div>
            )}

            {completed.length === 0 && !inProgress && (
              <div className="rounded-3xl border border-dashed bg-white/70 px-6 py-14 text-center shadow-sm" style={{ borderColor: '#F2C07360' }}>
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ backgroundColor: '#F2C07315', color: '#F2C073' }}>
                  <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-foreground">Aucune évaluation terminée</h3>
                <p className="mx-auto mt-2 max-w-md text-sm text-foreground/50">
                  Lancez votre première session pour obtenir un score global et un historique détaillé.
                </p>
              </div>
            )}
          </section>
        </div>
      </main>
    </>
  );
}
