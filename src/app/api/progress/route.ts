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

  if (!exerciseId) {
    return NextResponse.json(
      { error: "exerciseId requis" },
      { status: 400 }
    );
  }

  const exercise = await prisma.exercise.findUnique({
    where: { id: exerciseId },
    select: { id: true },
  });

  if (!exercise) {
    return NextResponse.json({ error: "Exercice introuvable." }, { status: 404 });
  }

  try {
    await prisma.userProgress.upsert({
      where: {
        userId_exerciseId: {
          userId: session.user.id,
          exerciseId,
        },
      },
      update: {
        userAnswers,
        completed: completed ?? false,
      },
      create: {
        userId: session.user.id,
        exerciseId,
        userAnswers,
        completed: completed ?? false,
      },
    });
  } catch (err) {
    console.error("Progress save error:", err);
    return NextResponse.json(
      { error: "Erreur serveur lors de la sauvegarde." },
      { status: 500 }
    );
  }

  revalidatePath("/exercises");

  return NextResponse.json({ success: true });
}
