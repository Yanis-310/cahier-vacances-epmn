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

  const exercise = await prisma.exercise.findUnique({ where: { id } });
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
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <ExerciseClient
          exercise={{
            id: exercise.id,
            number: exercise.number,
            title: exercise.title,
            type: exercise.type,
            content: exercise.content as Record<string, unknown>,
            answers: exercise.answers as Record<string, string>,
          }}
          savedAnswers={
            (progress?.userAnswers as Record<string, string>) || {}
          }
          isCompleted={progress?.completed ?? false}
          prevId={prevExercise?.id || null}
          nextId={nextExercise?.id || null}
        />
      </main>
    </>
  );
}
