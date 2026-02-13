import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const submitSchema = z.object({
  userAnswers: z.record(z.string(), z.string()),
});

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  const { id } = await params;
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Requête invalide." },
      { status: 400 }
    );
  }

  const parsed = submitSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides." },
      { status: 400 }
    );
  }

  const { userAnswers } = parsed.data;

  try {
    const evaluation = await prisma.evaluation.findUnique({ where: { id } });
    if (!evaluation || evaluation.userId !== session.user.id) {
      return NextResponse.json({ error: "Non trouvé" }, { status: 404 });
    }

    if (evaluation.completedAt) {
      return NextResponse.json({ error: "Déjà soumise" }, { status: 400 });
    }

    // Calculate score
    const questionIds = evaluation.questionIds as {
      exerciseId: string;
      questionId: number;
    }[];
    const exerciseIds = [...new Set(questionIds.map((q) => q.exerciseId))];
    const exercises = await prisma.exercise.findMany({
      where: { id: { in: exerciseIds } },
    });
    const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

    let score = 0;
    for (const qRef of questionIds) {
      const exercise = exerciseMap.get(qRef.exerciseId);
      if (!exercise) continue;

      const key = `${qRef.exerciseId}_${qRef.questionId}`;
      const userAnswer = (userAnswers as Record<string, string>)[key];

      if (exercise.type === "multi_select") {
        const correctIds = (exercise.answers as { correctIds: number[] })
          .correctIds;
        const isSelected = userAnswer === "true";
        const shouldBeSelected = correctIds.includes(qRef.questionId);
        if (isSelected === shouldBeSelected) score++;
      } else {
        const correctAnswer = (
          exercise.answers as Record<string, string>
        )[String(qRef.questionId)];
        if (userAnswer === correctAnswer) score++;
      }
    }

    await prisma.evaluation.update({
      where: { id },
      data: {
        userAnswers,
        score,
        completedAt: new Date(),
      },
    });

    revalidatePath("/evaluation");
    revalidatePath(`/evaluation/${id}/result`);

    return NextResponse.json({ score, total: evaluation.total });
  } catch (err) {
    console.error("Evaluation submit error:", err);
    return NextResponse.json(
      { error: "Erreur serveur lors de la sauvegarde." },
      { status: 500 }
    );
  }
}
