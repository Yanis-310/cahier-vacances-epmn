import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import ExerciseClient from "./ExerciseClient";

export default async function ExercisePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const exercise = await prisma.exercise.findFirst({
    where: { id, isActive: true },
  });
  if (!exercise) notFound();

  const progress = await prisma.userProgress.findUnique({
    where: {
      userId_exerciseId: {
        userId: session.user.id!,
        exerciseId: exercise.id,
      },
    },
  });

  // Get prev/next exercise IDs for navigation
  const allExercises = await prisma.exercise.findMany({
    where: { isActive: true },
    orderBy: { number: "asc" },
    select: { id: true, number: true },
  });
  const currentIndex = allExercises.findIndex((e) => e.id === exercise.id);
  const prevExercise = currentIndex > 0 ? allExercises[currentIndex - 1] : null;
  const nextExercise =
    currentIndex < allExercises.length - 1
      ? allExercises[currentIndex + 1]
      : null;

  return (
    <>
      <Navbar />
      <main className="min-h-screen relative" style={{ backgroundColor: "#FCF4E8" }}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 relative z-10">
          <img
            src="/icons/solar/palmiersurf 1.png"
            alt=""
            className="hidden lg:block absolute pointer-events-none z-10"
            style={{ top: "240px", right: "-190px", width: "220px" }}
          />
          <img
            src="/icons/solar/palmiersurf 1.png"
            alt=""
            className="hidden lg:block absolute pointer-events-none z-10"
            style={{ top: "320px", left: "-200px", width: "210px", transform: "scaleX(-1)" }}
          />
          <img
            src="/icons/solar/fleur 1.png"
            alt=""
            className="absolute object-contain pointer-events-none z-20"
            style={{ top: "-46px", right: "-34px", width: "130px", height: "130px" }}
          />

          <section className="exercise-solar">
            <ExerciseClient
              key={exercise.id}
              exercise={{
                id: exercise.id,
                number: exercise.number,
                title: exercise.title,
                type: exercise.type,
                content: exercise.content as Record<string, unknown>,
                answers:
                  progress?.completed || exercise.type === "labyrinth"
                    ? (exercise.answers as Record<string, string>)
                    : null,
              }}
              savedAnswers={
                (progress?.userAnswers as Record<string, string>) || {}
              }
              isCompleted={progress?.completed ?? false}
              prevId={prevExercise?.id || null}
              nextId={nextExercise?.id || null}
            />
          </section>
        </div>
      </main>
    </>
  );
}
