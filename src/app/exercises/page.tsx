import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

export default async function ExercisesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/login");
  }

  const exercises = await prisma.exercise.findMany({
    orderBy: { number: "asc" },
    select: { id: true, number: true, title: true, type: true },
  });

  const progress = await prisma.userProgress.findMany({
    where: { userId: session.user.id },
    select: { exerciseId: true, completed: true },
  });

  const progressMap = new Map(
    progress.map((p) => [p.exerciseId, p.completed])
  );

  const completedCount = progress.filter((p) => p.completed).length;

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10">
          <h1 className="text-3xl font-bold">Exercices</h1>
          <p className="text-foreground/60 mt-2">
            {completedCount} sur {exercises.length} exercices complétés
          </p>
          {/* Progress bar */}
          <div className="mt-3 h-2 bg-foreground/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{
                width:
                  exercises.length > 0
                    ? `${(completedCount / exercises.length) * 100}%`
                    : "0%",
              }}
            />
          </div>
        </div>

        <div className="space-y-2">
          {exercises.map((exercise) => {
            const status = progressMap.get(exercise.id);
            const isCompleted = status === true;
            const isStarted = status !== undefined && !isCompleted;

            return (
              <Link
                key={exercise.id}
                href={`/exercises/${exercise.id}`}
                className="flex items-center justify-between bg-white rounded-lg px-5 py-4 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="flex items-center gap-4">
                  <span className="text-sm font-medium text-foreground/40 w-8">
                    {String(exercise.number).padStart(2, "0")}
                  </span>
                  <span className="font-medium group-hover:text-primary transition-colors">
                    {exercise.title}
                  </span>
                </div>
                <div>
                  {isCompleted && (
                    <span className="w-3 h-3 rounded-full bg-success inline-block" />
                  )}
                  {isStarted && (
                    <span className="w-3 h-3 rounded-full bg-warning inline-block" />
                  )}
                  {status === undefined && (
                    <span className="w-3 h-3 rounded-full bg-foreground/10 inline-block" />
                  )}
                </div>
              </Link>
            );
          })}

          {exercises.length === 0 && (
            <div className="text-center py-12 text-foreground/40">
              Les exercices seront bientôt disponibles.
            </div>
          )}
        </div>
      </main>
    </>
  );
}
