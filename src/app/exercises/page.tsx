import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import SwimmingFish from "@/components/SwimmingFish";

const typeConfig: Record<string, { label: string; color: string }> = {
  single_choice: {
    label: "choix unique",
    color: "#F2C073",
  },
  qcm: { label: "QCM", color: "#F2C073" },
  multi_select: {
    label: "sélection multiple",
    color: "#F2C073",
  },
  true_false: {
    label: "vrai / faux",
    color: "#F2C073",
  },
  free_text: { label: "rédaction", color: "#F2C073" },
  labyrinth: {
    label: "labyrinthe",
    color: "#F2C073",
  },
};

function getMotivation(percent: number): string {
  if (percent === 0) return "Commencez votre premier exercice.";
  if (percent < 25) return "Bon début, continuez sur cette lancée.";
  if (percent < 50) return "Vous avancez bien.";
  if (percent < 75) return "Plus de la moitié, bravo.";
  if (percent < 100) return "La ligne d'arrivée est proche.";
  return "Parcours complété, félicitations.";
}

const metricCards = [
  { icon: "/icons/solar/soleil2 1.png", bg: "rgba(252, 219, 80, 0.73)" },
  { icon: "/icons/solar/sablepelle 1.png", bg: "rgba(242, 193, 116, 0.77)" },
  { icon: "/icons/solar/ballon 4.png", bg: "rgba(255, 152, 120, 0.67)" },
  { icon: "/icons/solar/tongue2 1.png", bg: "rgba(30, 207, 207, 0.46)" },
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
        className="absolute top-3 right-3 w-12 h-12 object-contain pointer-events-none"
      />
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/60">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-sm text-foreground/60">{hint}</p>}
    </div>
  );
}

export default async function ExercisesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const [exercises, progress] = await Promise.all([
    prisma.exercise.findMany({
      where: { isActive: true },
      orderBy: { number: "asc" },
      select: { id: true, number: true, title: true, type: true },
    }),
    prisma.userProgress.findMany({
      where: { userId: session.user.id },
      select: { exerciseId: true, completed: true },
    }),
  ]);

  const progressMap = new Map(progress.map((p) => [p.exerciseId, p.completed]));

  const completedCount = progress.filter((p) => p.completed).length;
  const startedCount = progress.filter((p) => !p.completed).length;
  const notStartedCount = exercises.length - completedCount - startedCount;
  const progressPercent =
    exercises.length > 0
      ? Math.round((completedCount / exercises.length) * 100)
      : 0;

  const metricData = [
    { label: "Progression", value: `${progressPercent}%`, hint: "Part des exercices terminés" },
    { label: "Terminés", value: `${completedCount}`, hint: "Exercices validés" },
    { label: "En cours", value: `${startedCount}`, hint: "Exercices commencés" },
    { label: "Restants", value: `${notStartedCount}`, hint: "À démarrer" },
  ];

  return (
    <>
      <Navbar />
      <main className="min-h-screen relative overflow-hidden" style={{ backgroundColor: '#FCF4E8' }}>
        <SwimmingFish />
        <SwimmingFish />
        {/* Decorative palm tree — right side, near card bottom */}
        <img
          src="/icons/solar/palmiersurf 1.png"
          alt=""
          className="hidden lg:block absolute pointer-events-none z-0"
          style={{ top: '280px', right: '0px', width: '220px' }}
        />
        {/* Decorative palm tree — bottom right */}
        <img
          src="/icons/solar/palmiersurf 1.png"
          alt=""
          className="hidden lg:block absolute bottom-0 right-0 w-44 pointer-events-none z-0"
          style={{ transform: 'scaleX(-1)' }}
        />
        {/* Decorative palm tree — bottom left */}
        <img
          src="/icons/solar/palmiersurf 1.png"
          alt=""
          className="hidden lg:block absolute bottom-0 left-0 w-40 pointer-events-none z-0"
        />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12 relative z-10">
          {/* Section wrapper for hibiscus overflow */}
          <div className="relative">
            {/* Decorative hibiscus — centered on top-right corner of the card */}
            <img
              src="/icons/solar/fleur 1.png"
              alt=""
              className="absolute object-contain pointer-events-none z-30"
              style={{ top: '-70px', right: '-50px', width: '180px', height: '180px' }}
            />

            <section className="rounded-2xl border-2 bg-white shadow-sm relative overflow-hidden" style={{ borderColor: '#F2C073' }}>
              <div className="p-6 sm:p-8">
                <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex items-center gap-5">
                    <div>
                      <p className="inline-flex items-center rounded-full border bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]" style={{ borderColor: '#F2C073', color: '#333' }}>
                        Session de niveau
                      </p>
                      <h1 className="mt-4 text-3xl font-bold tracking-tight sm:text-4xl" style={{ color: '#F2C073' }}>
                        Exercices
                      </h1>
                      <p className="mt-3 text-base leading-relaxed text-foreground/60 sm:text-lg">
                        Révisez à votre rythme les fondamentaux de la médiation professionnelle.
                      </p>
                      <p className="mt-2 text-sm text-foreground/40">{getMotivation(progressPercent)}</p>
                    </div>
                  </div>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
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

          <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {exercises.map((exercise, index) => {
              const status = progressMap.get(exercise.id);
              const isCompleted = status === true;
              const isStarted = status !== undefined && !isCompleted;
              const type = typeConfig[exercise.type] || {
                label: exercise.type,
                color: "#F2C073",
              };

              const actionLabel = isCompleted
                ? "revoir"
                : isStarted
                  ? "continuer"
                  : "commencer";

              return (
                <Link
                  key={exercise.id}
                  href={`/exercises/${exercise.id}`}
                  className={`grid-card-enter group relative flex min-h-[164px] flex-col rounded-xl bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:shadow-lg shadow-sm`}
                  style={{
                    animationDelay: `${index * 0.03}s`,
                    border: `1.5px solid #F2C073`,
                  }}
                >
                  <div className="mb-3 flex items-start justify-between">
                    <span className="text-xs font-semibold uppercase tracking-[0.16em] transition-colors" style={{ color: '#F2C073' }}>
                      {String(exercise.number).padStart(2, "0")}
                    </span>
                    {isCompleted && (
                      <img
                        src="/icons/solar/crabe content valide.png"
                        alt="Validé"
                        className="w-8 h-8 object-contain"
                      />
                    )}
                    {isStarted && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/10">
                        <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                      </span>
                    )}
                  </div>

                  <h3 className="mb-auto leading-snug font-medium text-foreground transition-colors group-hover:text-foreground/80">
                    {exercise.title}
                  </h3>

                  <div className="mt-4 flex items-center justify-between border-t pt-3" style={{ borderColor: '#F2C07340' }}>
                    <span
                      className="inline-block rounded-md px-2.5 py-1 text-xs font-medium"
                      style={{ color: '#F2C073' }}
                    >
                      {type.label}
                    </span>

                    <span className="flex items-center gap-1 text-xs font-semibold transition-colors" style={{ color: '#F2C073' }}>
                      {actionLabel}
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

          {exercises.length === 0 && (
            <div className="mt-10 rounded-3xl border border-dashed bg-white/70 px-6 py-14 text-center shadow-sm" style={{ borderColor: '#F2C07360' }}>
              <p className="text-foreground/45">Les exercices seront bientôt disponibles.</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}
