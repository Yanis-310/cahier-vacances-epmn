import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const typeConfig: Record<string, { label: string; bg: string; text: string }> = {
  single_choice: {
    label: "Choix unique",
    bg: "bg-primary-pale/70",
    text: "text-primary",
  },
  qcm: { label: "QCM", bg: "bg-primary-pale/70", text: "text-primary" },
  multi_select: {
    label: "Selection multiple",
    bg: "bg-primary-pale/70",
    text: "text-primary",
  },
  true_false: {
    label: "Vrai / Faux",
    bg: "bg-primary-pale/70",
    text: "text-primary",
  },
  free_text: { label: "Redaction", bg: "bg-amber-50", text: "text-amber-700" },
  labyrinth: {
    label: "Labyrinthe",
    bg: "bg-foreground/5",
    text: "text-foreground/60",
  },
};

function getMotivation(percent: number): string {
  if (percent === 0) return "Commencez votre premier exercice.";
  if (percent < 25) return "Bon debut, continuez sur cette lancee.";
  if (percent < 50) return "Vous avancez bien.";
  if (percent < 75) return "Plus de la moitie, bravo.";
  if (percent < 100) return "La ligne d'arrivee est proche.";
  return "Parcours complete, felicitations.";
}

function MetricCard({
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
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/35">
        {label}
      </p>
      <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
      {hint && <p className="mt-1 text-sm text-foreground/45">{hint}</p>}
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

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <section className="overflow-hidden rounded-2xl border border-foreground/8 bg-white shadow-sm">
          <div className="h-1.5 w-full bg-primary/80" />
          <div className="bg-primary-pale/25 p-6 sm:p-8">
            <div className="mb-8 flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-5">
                <div>
                  <p className="inline-flex items-center rounded-full border border-primary/20 bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-primary">
                    Session de niveau
                  </p>
                  <h1 className="mt-4 text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
                    Exercices
                  </h1>
                  <p className="mt-3 text-base leading-relaxed text-foreground/60 sm:text-lg">
                    Revisez a votre rythme les fondamentaux de la mediation professionnelle.
                  </p>
                  <p className="mt-2 text-sm text-foreground/40">{getMotivation(progressPercent)}</p>
                </div>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <MetricCard
                label="Progression"
                value={`${progressPercent}%`}
                hint="Part des exercices termines"
              />
              <MetricCard
                label="Termines"
                value={`${completedCount}`}
                hint="Exercices valides"
              />
              <MetricCard
                label="En cours"
                value={`${startedCount}`}
                hint="Exercices commences"
              />
              <MetricCard
                label="Restants"
                value={`${notStartedCount}`}
                hint="A demarrer"
              />
            </div>
          </div>
        </section>

        <div className="mt-10 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {exercises.map((exercise, index) => {
            const status = progressMap.get(exercise.id);
            const isCompleted = status === true;
            const isStarted = status !== undefined && !isCompleted;
            const type = typeConfig[exercise.type] || {
              label: exercise.type,
              bg: "bg-gray-50",
              text: "text-gray-500",
            };

            const actionLabel = isCompleted
              ? "Revoir"
              : isStarted
                ? "Continuer"
                : "Commencer";

            return (
              <Link
                key={exercise.id}
                href={`/exercises/${exercise.id}`}
                className={`grid-card-enter group relative flex min-h-[164px] flex-col rounded-xl border border-foreground/8 bg-white p-5 transition-all duration-200 hover:-translate-y-1 hover:border-primary/20 hover:shadow-lg ${
                  isCompleted
                    ? "bg-gradient-to-br from-white to-success/[0.04] ring-1 ring-success/15"
                    : isStarted
                      ? "ring-1 ring-warning/20 shadow-sm"
                      : "shadow-sm"
                }`}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                <div className="mb-3 flex items-start justify-between">
                  <span className="text-xs font-semibold uppercase tracking-[0.16em] text-foreground/35 transition-colors group-hover:text-primary/70">
                    {String(exercise.number).padStart(2, "0")}
                  </span>
                  {isCompleted && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-success/10">
                      <svg
                        className="h-3.5 w-3.5 text-success"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  )}
                  {isStarted && (
                    <span className="flex h-6 w-6 items-center justify-center rounded-full bg-warning/10">
                      <span className="h-2.5 w-2.5 rounded-full bg-warning" />
                    </span>
                  )}
                </div>

                <h3 className="mb-auto leading-snug font-medium text-foreground transition-colors group-hover:text-primary">
                  {exercise.title}
                </h3>

                <div className="mt-4 flex items-center justify-between border-t border-foreground/8 pt-3">
                  <span
                    className={`inline-block rounded-md px-2.5 py-1 text-xs font-medium ${type.bg} ${type.text}`}
                  >
                    {type.label}
                  </span>

                  <span className="flex items-center gap-1 text-xs font-semibold text-primary/30 transition-colors group-hover:text-primary">
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
          <div className="mt-10 rounded-3xl border border-dashed border-foreground/15 bg-white/70 px-6 py-14 text-center shadow-sm">
            <p className="text-foreground/45">Les exercices seront bientot disponibles.</p>
          </div>
        )}
      </main>
    </>
  );
}
