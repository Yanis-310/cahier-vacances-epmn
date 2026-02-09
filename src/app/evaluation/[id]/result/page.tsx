import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";

interface QuestionRef {
  exerciseId: string;
  questionId: number;
}

export default async function EvaluationResultPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session?.user) redirect("/login");

  const { id } = await params;

  const evaluation = await prisma.evaluation.findUnique({ where: { id } });
  if (!evaluation || evaluation.userId !== session.user.id) notFound();

  // If not completed, redirect to take it
  if (!evaluation.completedAt) {
    redirect(`/evaluation/${id}`);
  }

  // Load exercises for question details
  const questionIds = evaluation.questionIds as QuestionRef[];
  const exerciseIds = [...new Set(questionIds.map((q) => q.exerciseId))];
  const exercises = await prisma.exercise.findMany({
    where: { id: { in: exerciseIds } },
  });
  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));
  const userAnswers = evaluation.userAnswers as Record<string, string>;

  const score = evaluation.score ?? 0;
  const total = evaluation.total;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;

  const scoreColor =
    pct >= 75 ? "text-success" : pct >= 50 ? "text-warning" : "text-error";
  const scoreBg =
    pct >= 75 ? "bg-success/10" : pct >= 50 ? "bg-warning/10" : "bg-error/10";

  // Build detailed results
  const details = questionIds.map((qRef, index) => {
    const exercise = exerciseMap.get(qRef.exerciseId)!;
    const content = exercise.content as {
      options?: string[];
      questions?: {
        id: number;
        text: string;
        options?: { label: string; text: string }[];
      }[];
    };
    const question = content.questions?.find((q) => q.id === qRef.questionId);
    const key = `${qRef.exerciseId}_${qRef.questionId}`;
    const userAnswer = userAnswers[key] || "";

    let correctAnswer = "";
    let isCorrect = false;

    if (exercise.type === "multi_select") {
      const correctIds = (exercise.answers as { correctIds: number[] })
        .correctIds;
      const shouldBeSelected = correctIds.includes(qRef.questionId);
      const isSelected = userAnswer === "true";
      isCorrect = isSelected === shouldBeSelected;
      correctAnswer = shouldBeSelected ? "Bonne posture" : "Pas une bonne posture";
    } else {
      correctAnswer = (exercise.answers as Record<string, string>)[
        String(qRef.questionId)
      ];
      isCorrect = userAnswer === correctAnswer;
    }

    return {
      index: index + 1,
      exerciseNumber: exercise.number,
      exerciseTitle: exercise.title,
      exerciseType: exercise.type,
      questionText: question?.text || "",
      userAnswer,
      correctAnswer,
      isCorrect,
    };
  });

  return (
    <>
      <Navbar />
      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Score card */}
        <div className={`${scoreBg} rounded-2xl p-8 text-center mb-8`}>
          <p className="text-sm text-foreground/50 mb-2">Votre score</p>
          <p className={`text-5xl font-bold ${scoreColor}`}>
            {score}/{total}
          </p>
          <p className={`text-2xl font-medium mt-1 ${scoreColor}`}>{pct}%</p>
          <p className="text-foreground/50 text-sm mt-3">
            {pct >= 75
              ? "Excellent travail !"
              : pct >= 50
              ? "Bon effort, continuez !"
              : "Continuez vos révisions."}
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <Link
            href="/evaluation"
            className="flex-1 text-center px-5 py-2.5 border border-foreground/20 rounded-lg hover:bg-white transition-colors"
          >
            Retour aux évaluations
          </Link>
          <Link
            href="/exercises"
            className="flex-1 text-center px-5 py-2.5 border border-foreground/20 rounded-lg hover:bg-white transition-colors"
          >
            Revoir les exercices
          </Link>
        </div>

        {/* Detailed results */}
        <h2 className="text-lg font-semibold mb-4">Détail des réponses</h2>
        <div className="space-y-3">
          {details.map((d) => (
            <div
              key={d.index}
              className={`bg-white rounded-lg p-4 shadow-sm border-l-4 ${
                d.isCorrect ? "border-l-success" : "border-l-error"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <span className="text-xs text-primary/60 font-medium">
                    Q{d.index} — Ex. {d.exerciseNumber} — {d.exerciseTitle}
                  </span>
                  <p className="font-medium mt-1">{d.questionText}</p>
                  <div className="mt-2 text-sm">
                    <p>
                      <span className="text-foreground/50">
                        Votre réponse :
                      </span>{" "}
                      <span
                        className={
                          d.isCorrect
                            ? "text-success font-medium"
                            : "text-error font-medium"
                        }
                      >
                        {d.exerciseType === "multi_select"
                          ? d.userAnswer === "true"
                            ? "Bonne posture"
                            : "Pas une bonne posture"
                          : d.userAnswer || "—"}
                      </span>
                    </p>
                    {!d.isCorrect && (
                      <p className="mt-1">
                        <span className="text-foreground/50">
                          Réponse attendue :
                        </span>{" "}
                        <span className="text-success font-medium">
                          {d.correctAnswer}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <span className="text-lg mt-1">
                  {d.isCorrect ? (
                    <span className="text-success">&#10003;</span>
                  ) : (
                    <span className="text-error">&#10007;</span>
                  )}
                </span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}
