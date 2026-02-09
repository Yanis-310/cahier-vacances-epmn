import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import EvaluationClient from "./EvaluationClient";

interface QuestionRef {
  exerciseId: string;
  questionId: number;
}

export default async function EvaluationTakePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const evaluation = await prisma.evaluation.findUnique({ where: { id } });
  if (!evaluation || evaluation.userId !== session.user.id) notFound();

  // If already completed, redirect to result
  if (evaluation.completedAt) {
    redirect(`/evaluation/${id}/result`);
  }

  // Load all referenced exercises
  const questionIds = evaluation.questionIds as unknown as QuestionRef[];
  const exerciseIds = [...new Set(questionIds.map((q) => q.exerciseId))];
  const exercises = await prisma.exercise.findMany({
    where: { id: { in: exerciseIds } },
  });
  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));

  // Build structured questions for the client
  const questions = questionIds.map((qRef, index) => {
    const exercise = exerciseMap.get(qRef.exerciseId)!;
    const content = exercise.content as {
      instruction?: string;
      options?: string[];
      questions?: {
        id: number;
        text: string;
        options?: { label: string; text: string }[];
      }[];
    };
    const question = content.questions?.find((q) => q.id === qRef.questionId);

    return {
      index: index + 1,
      key: `${qRef.exerciseId}_${qRef.questionId}`,
      exerciseNumber: exercise.number,
      exerciseTitle: exercise.title,
      exerciseType: exercise.type,
      questionId: qRef.questionId,
      questionText: question?.text || "",
      options: content.options || [],
      qcmOptions: question?.options || [],
    };
  });

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <EvaluationClient
          evaluationId={evaluation.id}
          questions={questions}
          total={evaluation.total}
        />
      </main>
    </>
  );
}
