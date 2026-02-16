import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  try {
    // Get all auto-gradable exercises (exclude free_text and labyrinth)
    const exercises = await prisma.exercise.findMany({
      where: {
        isActive: true,
        type: { notIn: ["free_text", "labyrinth"] },
      },
      select: { id: true, content: true, type: true },
    });

    // Collect all individual questions
    type QuestionRef = { exerciseId: string; questionId: number };
    const allQuestions: QuestionRef[] = [];

    for (const ex of exercises) {
      const content = ex.content as { questions?: { id: number }[] };
      if (content.questions) {
        for (const q of content.questions) {
          allQuestions.push({ exerciseId: ex.id, questionId: q.id });
        }
      }
    }

    if (allQuestions.length === 0) {
      return NextResponse.json(
        { error: "Aucune question disponible." },
        { status: 400 }
      );
    }

    // Fisher-Yates shuffle
    const shuffled = [...allQuestions];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }

    const count = Math.min(20, shuffled.length);
    const selected = shuffled.slice(0, count);

    const evaluation = await prisma.evaluation.create({
      data: {
        userId: session.user.id,
        questionIds: selected,
        total: count,
      },
    });

    return NextResponse.json({ id: evaluation.id });
  } catch (err) {
    console.error("Evaluation create error:", err);
    return NextResponse.json(
      { error: "Erreur serveur lors de la création." },
      { status: 500 }
    );
  }
}
