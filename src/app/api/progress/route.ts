import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { z } from "zod";

const progressSchema = z.object({
  exerciseId: z.string().uuid(),
  userAnswers: z.record(z.string(), z.string()).default({}),
  completed: z.boolean().optional(),
});

export async function POST(request: Request) {
  const session = await auth();

  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Requête invalide." },
      { status: 400 }
    );
  }

  const parsed = progressSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Données invalides." },
      { status: 400 }
    );
  }

  const { exerciseId, userAnswers, completed } = parsed.data;

  try {
    const exercise = await prisma.exercise.findUnique({
      where: { id: exerciseId },
      select: { id: true, answers: true },
    });

    if (!exercise) {
      return NextResponse.json({ error: "Exercice introuvable." }, { status: 404 });
    }

    // Don't allow completed to regress back to false
    const existingProgress = completed
      ? null
      : await prisma.userProgress.findUnique({
          where: {
            userId_exerciseId: { userId: session.user.id, exerciseId },
          },
          select: { completed: true },
        });

    const finalCompleted = completed || (existingProgress?.completed ?? false);

    await prisma.userProgress.upsert({
      where: {
        userId_exerciseId: {
          userId: session.user.id,
          exerciseId,
        },
      },
      update: {
        userAnswers,
        completed: finalCompleted,
      },
      create: {
        userId: session.user.id,
        exerciseId,
        userAnswers,
        completed: finalCompleted,
      },
    });

    revalidatePath("/exercises");

    // Return answers only when marking as completed (for correction display)
    if (completed) {
      return NextResponse.json({ success: true, answers: exercise.answers });
    }

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error("Progress save error:", err);
    return NextResponse.json(
      { error: "Erreur serveur lors de la sauvegarde." },
      { status: 500 }
    );
  }
}
