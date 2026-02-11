import { auth } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { redirect, notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import StartButton from "../../StartButton";

interface QuestionRef {
  exerciseId: string;
  questionId: number;
}

const typeLabels: Record<string, string> = {
  single_choice: "Choix unique",
  qcm: "QCM",
  multi_select: "Sélection multiple",
  true_false: "Vrai / Faux",
};

function getMessage(pct: number): string {
  if (pct >= 90) return "Excellent travail !";
  if (pct >= 75) return "Très bon résultat, bravo !";
  if (pct >= 50) return "Bon effort, continuez !";
  if (pct >= 25) return "Des progrès à faire, persévérez.";
  return "Continuez vos révisions.";
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

  if (!evaluation.completedAt) {
    redirect(`/evaluation/${id}`);
  }

  // Load exercises for question details
  const questionIds = evaluation.questionIds as unknown as QuestionRef[];
  const exerciseIds = [...new Set(questionIds.map((q) => q.exerciseId))];
  const exercises = await prisma.exercise.findMany({
    where: { id: { in: exerciseIds } },
  });
  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));
  const userAnswers = evaluation.userAnswers as Record<string, string>;

  const score = evaluation.score ?? 0;
  const total = evaluation.total;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const incorrect = total - score;

  const scoreColor =
    pct >= 75 ? "text-success" : pct >= 50 ? "text-warning" : "text-error";
  const scoreBgRing =
    pct >= 75
      ? "text-success/15"
      : pct >= 50
        ? "text-warning/15"
        : "text-error/15";

  const circumference = 2 * Math.PI * 54;

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
      correctAnswer = shouldBeSelected
        ? "Bonne posture"
        : "Pas une bonne posture";
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

  // Breakdown by exercise type
  const typeBreakdown = new Map<
    string,
    { correct: number; total: number }
  >();
  for (const d of details) {
    const entry = typeBreakdown.get(d.exerciseType) || {
      correct: 0,
      total: 0,
    };
    entry.total++;
    if (d.isCorrect) entry.correct++;
    typeBreakdown.set(d.exerciseType, entry);
  }

  return (
    <>
      <Navbar />
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Score hero */}
        <div className="bg-white rounded-2xl p-8 sm:p-10 shadow-sm mb-6">
          <div className="flex flex-col sm:flex-row items-center gap-8">
            {/* Large score ring */}
            <div
              className="relative flex-shrink-0"
              style={{ width: 128, height: 128 }}
            >
              <svg
                className="-rotate-90"
                width={128}
                height={128}
                viewBox="0 0 128 128"
              >
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  className={scoreBgRing}
                />
                <circle
                  cx="64"
                  cy="64"
                  r="54"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="8"
                  strokeLinecap="round"
                  className={scoreColor}
                  strokeDasharray={circumference}
                  strokeDashoffset={circumference * (1 - pct / 100)}
                  style={{ transition: "stroke-dashoffset 0.8s ease" }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className={`text-3xl font-bold ${scoreColor}`}>
                  {pct}%
                </span>
              </div>
            </div>

            {/* Score details */}
            <div className="text-center sm:text-left flex-1">
              <p className="text-sm text-foreground/40 uppercase tracking-wider font-medium mb-2">
                Votre résultat
              </p>
              <p className="text-4xl font-bold text-foreground">
                {score}
                <span className="text-foreground/25 font-normal text-2xl">
                  /{total}
                </span>
              </p>
              <p className="text-foreground/50 mt-2">{getMessage(pct)}</p>

              {/* Breakdown bar */}
              <div className="mt-4 flex items-center gap-3">
                <div className="flex-1 h-2.5 rounded-full bg-foreground/5 overflow-hidden flex">
                  <div
                    className="h-full bg-success rounded-l-full transition-all"
                    style={{
                      width: total > 0 ? `${(score / total) * 100}%` : "0%",
                    }}
                  />
                  <div
                    className="h-full bg-error/70 rounded-r-full transition-all"
                    style={{
                      width:
                        total > 0 ? `${(incorrect / total) * 100}%` : "0%",
                    }}
                  />
                </div>
              </div>
              <div className="flex gap-4 mt-2 justify-center sm:justify-start">
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-success" />
                  <span className="text-foreground/60">
                    {score} correcte{score !== 1 ? "s" : ""}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 text-sm">
                  <span className="w-2.5 h-2.5 rounded-full bg-error/70" />
                  <span className="text-foreground/60">
                    {incorrect} incorrecte{incorrect !== 1 ? "s" : ""}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Type breakdown */}
        {typeBreakdown.size > 1 && (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
            {Array.from(typeBreakdown.entries()).map(([type, data]) => {
              const typePct =
                data.total > 0
                  ? Math.round((data.correct / data.total) * 100)
                  : 0;
              const typeColor =
                typePct >= 75
                  ? "text-success"
                  : typePct >= 50
                    ? "text-warning"
                    : "text-error";
              return (
                <div
                  key={type}
                  className="bg-white rounded-xl p-4 shadow-sm text-center"
                >
                  <p className={`text-xl font-bold ${typeColor}`}>
                    {data.correct}/{data.total}
                  </p>
                  <p className="text-xs text-foreground/40 mt-1">
                    {typeLabels[type] || type}
                  </p>
                </div>
              );
            })}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 mb-10">
          <Link
            href="/evaluation"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white rounded-xl shadow-sm font-medium text-foreground/70 hover:text-primary hover:shadow-md transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M10 19l-7-7m0 0l7-7m-7 7h18"
              />
            </svg>
            Évaluations
          </Link>
          <Link
            href="/exercises"
            className="flex-1 flex items-center justify-center gap-2 px-5 py-3 bg-white rounded-xl shadow-sm font-medium text-foreground/70 hover:text-primary hover:shadow-md transition-all"
          >
            <svg
              className="w-4 h-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
              />
            </svg>
            Exercices
          </Link>
          <div className="flex-1 flex items-center justify-center">
            <StartButton />
          </div>
        </div>

        {/* Detailed results */}
        <h2 className="text-lg font-semibold mb-5">Détail des réponses</h2>
        <div className="space-y-3">
          {details.map((d, index) => (
            <div
              key={d.index}
              className={`grid-card-enter bg-white rounded-xl p-5 shadow-sm border-l-4 ${
                d.isCorrect ? "border-l-success" : "border-l-error"
              }`}
              style={{ animationDelay: `${index * 0.02}s` }}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1.5">
                    <span
                      className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold text-white ${
                        d.isCorrect ? "bg-success" : "bg-error"
                      }`}
                    >
                      {d.index}
                    </span>
                    <span className="text-xs text-foreground/35 font-medium">
                      Ex. {d.exerciseNumber} — {d.exerciseTitle}
                    </span>
                    <span className="text-xs text-foreground/20 font-medium">
                      · {typeLabels[d.exerciseType] || d.exerciseType}
                    </span>
                  </div>
                  <p className="font-medium text-foreground/90 mt-1">
                    {d.questionText}
                  </p>
                  <div className="mt-3 text-sm space-y-1">
                    <p>
                      <span className="text-foreground/45">
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
                      <p>
                        <span className="text-foreground/45">
                          Réponse attendue :
                        </span>{" "}
                        <span className="text-success font-medium">
                          {d.correctAnswer}
                        </span>
                      </p>
                    )}
                  </div>
                </div>
                <span className="mt-1 flex-shrink-0">
                  {d.isCorrect ? (
                    <span className="w-7 h-7 rounded-full bg-success/10 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-success"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M5 13l4 4L19 7"
                        />
                      </svg>
                    </span>
                  ) : (
                    <span className="w-7 h-7 rounded-full bg-error/10 flex items-center justify-center">
                      <svg
                        className="w-4 h-4 text-error"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2.5}
                          d="M6 18L18 6M6 6l12 12"
                        />
                      </svg>
                    </span>
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
