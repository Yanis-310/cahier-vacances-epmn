import { NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export async function POST() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Non autorisé" }, { status: 401 });
  }

  // Get all auto-gradable exercises (exclude free_text and labyrinth)
  const exercises = await prisma.exercise.findMany({
    where: { type: { notIn: ["free_text", "labyrinth"] } },
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

  // Randomly pick 20 questions (or fewer if not enough)
  const count = Math.min(20, allQuestions.length);
  const shuffled = [...allQuestions].sort(() => Math.random() - 0.5);
  const selected = shuffled.slice(0, count);

  try {
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
