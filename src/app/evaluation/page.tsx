import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import StartButton from "./StartButton";

function ScoreRing({
  percent,
  size = 48,
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
  const trackColor =
    percent >= 75
      ? "text-success/10"
      : percent >= 50
        ? "text-warning/10"
        : "text-error/10";

  return (
    <div
      className="relative flex-shrink-0"
      style={{ width: size, height: size }}
    >
      <svg
        className="-rotate-90"
        width={size}
        height={size}
        viewBox={`0 0 ${size} ${size}`}
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          stroke="currentColor"
          strokeWidth={strokeWidth}
          className={trackColor}
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
    <svg
      width={w}
      height={h}
      viewBox={`0 0 ${w} ${h}`}
      className="flex-shrink-0"
    >
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        opacity="0.6"
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
  if (count === 0) return "Lancez votre première évaluation !";
  if (avg >= 90) return "Niveau excellent, continuez !";
  if (avg >= 75) return "Très bon niveau, bravo !";
  if (avg >= 50) return "En bonne voie, persévérez.";
  return "Continuez vos révisions.";
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

  const circumference = 2 * Math.PI * 28;

  const bestEvalId =
    completed.length > 1
      ? completed.reduce((best, ev) => {
          const evPct =
            ev.total > 0
              ? Math.round(((ev.score ?? 0) / ev.total) * 100)
              : 0;
          const bestPct =
            best.total > 0
              ? Math.round(((best.score ?? 0) / best.total) * 100)
              : 0;
          return evPct > bestPct ? ev : best;
        }).id
      : null;

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Évaluation
          </h1>
          <p className="text-foreground/50 mt-2 text-lg">
            Testez vos connaissances avec 20 questions tirées aléatoirement.
          </p>

          {/* Summary card — same pattern as exercises page */}
          <div className="mt-8 bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Circular progress — avg score */}
                <div className="relative w-16 h-16 flex-shrink-0">
                  <svg
                    className="w-16 h-16 -rotate-90"
                    viewBox="0 0 64 64"
                  >
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      className="text-foreground/5"
                    />
                    <circle
                      cx="32"
                      cy="32"
                      r="28"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="4"
                      strokeLinecap="round"
                      className="text-primary"
                      strokeDasharray={circumference}
                      strokeDashoffset={
                        circumference * (1 - avgScore / 100)
                      }
                      style={{ transition: "stroke-dashoffset 0.5s ease" }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
                    {avgScore}%
                  </span>
                </div>

                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {completed.length}{" "}
                    <span className="text-foreground/30 font-normal text-base">
                      évaluation{completed.length !== 1 ? "s" : ""}
                    </span>
                  </p>
                  <p className="text-sm text-foreground/40 mt-0.5">
                    {getMotivation(completed.length, avgScore)}
                  </p>
                </div>
              </div>

              {/* Stats pills */}
              <div className="flex flex-wrap items-center gap-2.5">
                {completed.length > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-sm font-medium text-amber-600">
                    <span className="w-2 h-2 rounded-full bg-amber-400" />
                    Meilleur : {bestScore}%
                  </div>
                )}
                {trend !== null && trend !== 0 && (
                  <div
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-medium ${
                      trend > 0
                        ? "bg-success/10 text-success"
                        : "bg-error/10 text-error"
                    }`}
                  >
                    <span
                      className={`w-2 h-2 rounded-full ${
                        trend > 0 ? "bg-success" : "bg-error"
                      }`}
                    />
                    {trend > 0 ? "+" : ""}
                    {trend} pts
                  </div>
                )}
                {scores.length >= 2 && <Sparkline scores={scores} />}
              </div>
            </div>
          </div>
        </div>

        {/* Action area — clean, outside the card */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-10">
          {inProgress && (
            <Link
              href={`/evaluation/${inProgress.id}`}
              className="flex-1 flex items-center gap-4 bg-white rounded-xl px-5 py-4 shadow-sm hover:shadow-md transition-all group"
            >
              <span className="relative flex-shrink-0 w-3 h-3">
                <span className="absolute inset-0 w-3 h-3 rounded-full bg-warning" />
                <span className="absolute inset-0 w-3 h-3 rounded-full bg-warning animate-ping opacity-40" />
              </span>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground group-hover:text-primary transition-colors">
                  Reprendre l&apos;évaluation en cours
                </p>
                <p className="text-xs text-foreground/35 mt-0.5">
                  Commencée le{" "}
                  {new Date(inProgress.createdAt).toLocaleDateString("fr-FR", {
                    day: "numeric",
                    month: "long",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <svg
                className="w-4 h-4 text-foreground/15 group-hover:text-primary/50 transition-colors flex-shrink-0"
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
          <div
            className={
              inProgress
                ? "flex-shrink-0"
                : "w-full flex justify-center"
            }
          >
            <StartButton variant={inProgress ? "outline" : "primary"} />
          </div>
        </div>

        {/* History grid */}
        {completed.length > 0 && (
          <>
            <h2 className="text-lg font-semibold text-foreground mb-5">
              Historique
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {completed.map((ev, index) => {
                const pct =
                  ev.total > 0
                    ? Math.round(((ev.score ?? 0) / ev.total) * 100)
                    : 0;
                const isBest = ev.id === bestEvalId;

                return (
                  <Link
                    key={ev.id}
                    href={`/evaluation/${ev.id}/result`}
                    className={`grid-card-enter group relative flex flex-col bg-white rounded-xl p-5 min-h-[152px] transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                      isBest
                        ? "bg-gradient-to-br from-white to-amber-50/50 ring-1 ring-amber-200"
                        : "shadow-sm"
                    }`}
                    style={{ animationDelay: `${index * 0.04}s` }}
                  >
                    {/* Top row: attempt number + badge */}
                    <div className="flex items-start justify-between mb-3">
                      <span className="text-2xl font-bold text-foreground/10 group-hover:text-primary/20 transition-colors">
                        {String(index + 1).padStart(2, "0")}
                      </span>
                      {isBest && (
                        <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 text-amber-600">
                          <svg
                            className="w-3 h-3"
                            fill="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
                          </svg>
                          <span className="text-[10px] font-semibold">
                            Meilleur
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Score + date */}
                    <div className="flex items-center gap-3 mb-auto">
                      <ScoreRing percent={pct} size={44} strokeWidth={3.5} />
                      <div>
                        <p className="font-medium text-foreground group-hover:text-primary transition-colors">
                          {ev.score}/{ev.total} correcte
                          {(ev.score ?? 0) !== 1 ? "s" : ""}
                        </p>
                        <p className="text-sm text-foreground/40 mt-0.5">
                          {new Date(ev.createdAt).toLocaleDateString("fr-FR", {
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </div>

                    {/* Bottom row: time + hover action */}
                    <div className="flex items-center justify-between mt-4">
                      <span className="text-xs text-foreground/25">
                        {new Date(ev.createdAt).toLocaleTimeString("fr-FR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </span>
                      <span className="flex items-center gap-1 text-xs font-medium text-foreground/0 group-hover:text-primary transition-colors">
                        Voir le détail
                        <svg
                          className="w-3.5 h-3.5 translate-x-0 group-hover:translate-x-0.5 transition-transform"
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
          </>
        )}

        {completed.length === 0 && !inProgress && (
          <div className="text-center py-16">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-foreground/5 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-foreground/20"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <p className="text-foreground/40">
              Aucune évaluation terminée pour le moment.
            </p>
            <p className="text-foreground/25 text-sm mt-1">
              Lancez votre première évaluation pour voir vos résultats ici.
            </p>
          </div>
        )}
      </main>
    </>
  );
}
