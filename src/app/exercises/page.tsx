import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

const typeConfig: Record<
  string,
  { label: string; bg: string; text: string }
> = {
  single_choice: { label: "Choix unique", bg: "bg-sky-50", text: "text-sky-600" },
  qcm: { label: "QCM", bg: "bg-violet-50", text: "text-violet-600" },
  multi_select: { label: "Sélection multiple", bg: "bg-indigo-50", text: "text-indigo-600" },
  true_false: { label: "Vrai / Faux", bg: "bg-teal-50", text: "text-teal-600" },
  free_text: { label: "Rédaction", bg: "bg-amber-50", text: "text-amber-700" },
  labyrinth: { label: "Labyrinthe", bg: "bg-rose-50", text: "text-rose-600" },
};

function getMotivation(percent: number): string {
  if (percent === 0) return "Commencez votre premier exercice !";
  if (percent < 25) return "Bon début, continuez sur cette lancée.";
  if (percent < 50) return "Vous avancez bien !";
  if (percent < 75) return "Plus de la moitié, bravo !";
  if (percent < 100) return "La ligne d'arrivée est proche !";
  return "Parcours complété, félicitations !";
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

  const progressMap = new Map(
    progress.map((p) => [p.exerciseId, p.completed])
  );

  const completedCount = progress.filter((p) => p.completed).length;
  const startedCount = progress.filter((p) => !p.completed).length;
  const notStartedCount = exercises.length - completedCount - startedCount;
  const progressPercent =
    exercises.length > 0
      ? Math.round((completedCount / exercises.length) * 100)
      : 0;

  const circumference = 2 * Math.PI * 28;

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold text-foreground">
            Exercices
          </h1>
          <p className="text-foreground/50 mt-2 text-lg">
            Révisez à votre rythme les fondamentaux de la médiation
            professionnelle.
          </p>

          {/* Progress summary card */}
          <div className="mt-8 bg-white rounded-2xl p-6 sm:p-8 shadow-sm">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6">
              <div className="flex items-center gap-5">
                {/* Circular progress */}
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
                        circumference * (1 - progressPercent / 100)
                      }
                      style={{ transition: "stroke-dashoffset 0.5s ease" }}
                    />
                  </svg>
                  <span className="absolute inset-0 flex items-center justify-center text-sm font-bold text-foreground">
                    {progressPercent}%
                  </span>
                </div>

                <div>
                  <p className="text-2xl font-bold text-foreground">
                    {completedCount}{" "}
                    <span className="text-foreground/30 font-normal text-base">
                      / {exercises.length}
                    </span>
                  </p>
                  <p className="text-sm text-foreground/40 mt-0.5">
                    {getMotivation(progressPercent)}
                  </p>
                </div>
              </div>

              {/* Stats pills */}
              <div className="flex flex-wrap gap-2.5">
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-sm font-medium text-success">
                  <span className="w-2 h-2 rounded-full bg-success" />
                  {completedCount} terminé{completedCount !== 1 ? "s" : ""}
                </div>
                {startedCount > 0 && (
                  <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-warning/10 text-sm font-medium text-warning">
                    <span className="w-2 h-2 rounded-full bg-warning" />
                    {startedCount} en cours
                  </div>
                )}
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-foreground/5 text-sm font-medium text-foreground/40">
                  <span className="w-2 h-2 rounded-full bg-foreground/20" />
                  {notStartedCount} restant{notStartedCount !== 1 ? "s" : ""}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Exercise Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
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
                className={`grid-card-enter group relative flex flex-col bg-white rounded-xl p-5 min-h-[152px] transition-all duration-200 hover:shadow-lg hover:-translate-y-1 ${
                  isCompleted
                    ? "bg-gradient-to-br from-white to-success/[0.04] ring-1 ring-success/15"
                    : isStarted
                      ? "ring-1 ring-warning/20 shadow-sm"
                      : "shadow-sm"
                }`}
                style={{ animationDelay: `${index * 0.03}s` }}
              >
                {/* Top row: number + status */}
                <div className="flex items-start justify-between mb-3">
                  <span className="text-2xl font-bold text-foreground/10 group-hover:text-primary/20 transition-colors">
                    {String(exercise.number).padStart(2, "0")}
                  </span>
                  {isCompleted && (
                    <span className="w-6 h-6 rounded-full bg-success/10 flex items-center justify-center">
                      <svg
                        className="w-3.5 h-3.5 text-success"
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
                    <span className="w-6 h-6 rounded-full bg-warning/10 flex items-center justify-center">
                      <span className="w-2.5 h-2.5 rounded-full bg-warning" />
                    </span>
                  )}
                </div>

                {/* Title — grows to fill space */}
                <h3 className="font-medium text-foreground group-hover:text-primary transition-colors leading-snug mb-auto">
                  {exercise.title}
                </h3>

                {/* Bottom row: type badge + hover action */}
                <div className="flex items-center justify-between mt-4">
                  <span
                    className={`inline-block px-2.5 py-1 rounded-md text-xs font-medium ${type.bg} ${type.text}`}
                  >
                    {type.label}
                  </span>

                  {/* Hover action arrow */}
                  <span className="flex items-center gap-1 text-xs font-medium text-foreground/0 group-hover:text-primary transition-colors">
                    {actionLabel}
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

        {exercises.length === 0 && (
          <div className="text-center py-20 text-foreground/40">
            Les exercices seront bientôt disponibles.
          </div>
        )}
      </main>
    </>
  );
}
