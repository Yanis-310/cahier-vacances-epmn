import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { handleProgressUpdate } from "@/lib/api-progress";

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }

  const result = await handleProgressUpdate(body, session.user.id, {
    findExercise: (exerciseId) =>
      prisma.exercise.findUnique({
        where: { id: exerciseId },
        select: { answers: true },
      }),
    findExistingProgress: (userId, exerciseId) =>
      prisma.userProgress.findUnique({
        where: { userId_exerciseId: { userId, exerciseId } },
        select: { completed: true },
      }),
    saveProgress: async (userId, exerciseId, userAnswers, completed) => {
      await prisma.userProgress.upsert({
        where: {
          userId_exerciseId: {
            userId,
            exerciseId,
          },
        },
        update: {
          userAnswers,
          completed,
        },
        create: {
          userId,
          exerciseId,
          userAnswers,
          completed,
        },
      });
    },
    revalidateExercises: () => revalidatePath("/exercises"),
  });

  return NextResponse.json(result.body, { status: result.status });
}
