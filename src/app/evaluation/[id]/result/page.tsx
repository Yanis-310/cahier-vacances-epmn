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
  multi_select: "Selection multiple",
  true_false: "Vrai / Faux",
};

function getMessage(pct: number): string {
  if (pct >= 90) return "Excellent travail.";
  if (pct >= 75) return "Tres bon resultat, bravo.";
  if (pct >= 50) return "Bon effort, continuez.";
  if (pct >= 25) return "Des progres a faire, perseverez.";
  return "Continuez vos revisions.";
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

  const questionIds = evaluation.questionIds as unknown as QuestionRef[];
  const exerciseIds = [...new Set(questionIds.map((q) => q.exerciseId))];
  const exercises = await prisma.exercise.findMany({
    where: { id: { in: exerciseIds } },
  });
  const exerciseMap = new Map(exercises.map((e) => [e.id, e]));
  const userAnswers = evaluation.userAnswers as Record<string, string>;

  const details = questionIds
    .filter((qRef) => exerciseMap.has(qRef.exerciseId))
    .map((qRef, index) => {
      const exercise = exerciseMap.get(qRef.exerciseId)!;
      const content = exercise.content as {
        questions?: {
          id: number;
          text: string;
        }[];
      };
      const question = content.questions?.find((q) => q.id === qRef.questionId);
      const key = `${qRef.exerciseId}_${qRef.questionId}`;
      const userAnswer = userAnswers[key] || "";

      let correctAnswer = "";
      let isCorrect = false;

      if (exercise.type === "multi_select") {
        const correctIds = (exercise.answers as { correctIds: number[] }).correctIds;
        const shouldBeSelected = correctIds.includes(qRef.questionId);
        const isSelected = userAnswer === "true";
        isCorrect = isSelected === shouldBeSelected;
        correctAnswer = shouldBeSelected ? "Bonne posture" : "Pas une bonne posture";
      } else {
        correctAnswer = (exercise.answers as Record<string, string>)[String(qRef.questionId)];
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

  const score = details.filter((d) => d.isCorrect).length;
  const total = details.length;
  const pct = total > 0 ? Math.round((score / total) * 100) : 0;
  const incorrect = total - score;

  const scoreColor =
    pct >= 75 ? "text-success" : pct >= 50 ? "text-warning" : "text-error";
  const scoreBgRing =
    pct >= 75 ? "text-success/15" : pct >= 50 ? "text-warning/15" : "text-error/15";

  const circumference = 2 * Math.PI * 54;

  const typeBreakdown = new Map<string, { correct: number; total: number }>();
  for (const d of details) {
    const entry = typeBreakdown.get(d.exerciseType) || { correct: 0, total: 0 };
    entry.total++;
    if (d.isCorrect) entry.correct++;
    typeBreakdown.set(d.exerciseType, entry);
  }

  return (
    <>
      <Navbar />
      <main className="min-h-screen relative" style={{ backgroundColor: "#FCF4E8" }}>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12 relative">
          <img
            src="/icons/solar/fleur 1.png"
            alt=""
            className="absolute object-contain pointer-events-none z-20"
            style={{ top: "-62px", right: "-44px", width: "170px", height: "170px" }}
          />

          <section
            className="rounded-2xl border-2 bg-white shadow-sm relative overflow-hidden"
            style={{ borderColor: "#F2C073" }}
          >
            <div className="p-6 sm:p-8">
              <div className="flex flex-col lg:flex-row lg:items-center gap-8">
                <div className="relative flex-shrink-0 mx-auto lg:mx-0" style={{ width: 128, height: 128 }}>
                  <svg className="-rotate-90" width={128} height={128} viewBox="0 0 128 128">
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
                    <span className={`text-3xl font-bold ${scoreColor}`}>{pct}%</span>
                  </div>
                </div>

                <div className="flex-1 text-center lg:text-left">
                  <p
                    className="inline-flex items-center rounded-full border bg-white px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em]"
                    style={{ borderColor: "#F2C073", color: "#8b6a3f" }}
                  >
                    Resultat de l&apos;evaluation
                  </p>
                  <h1 className="mt-4 text-3xl sm:text-4xl font-bold tracking-tight" style={{ color: "#F2C073" }}>
                    {score}
                    <span className="text-foreground/25 font-normal text-2xl">/{total}</span>
                  </h1>
                  <p className="mt-2 text-foreground/60">{getMessage(pct)}</p>

                  <div className="mt-4 flex items-center gap-3">
                    <div className="flex-1 h-2.5 rounded-full bg-foreground/5 overflow-hidden flex">
                      <div
                        className="h-full bg-success rounded-l-full transition-all"
                        style={{ width: total > 0 ? `${(score / total) * 100}%` : "0%" }}
                      />
                      <div
                        className="h-full bg-error/70 rounded-r-full transition-all"
                        style={{ width: total > 0 ? `${(incorrect / total) * 100}%` : "0%" }}
                      />
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-4 mt-2 justify-center lg:justify-start">
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-success" />
                      <span className="text-foreground/60">{score} correcte{score !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm">
                      <span className="w-2.5 h-2.5 rounded-full bg-error/70" />
                      <span className="text-foreground/60">{incorrect} incorrecte{incorrect !== 1 ? "s" : ""}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {typeBreakdown.size > 1 && (
            <section className="mt-6 grid grid-cols-2 sm:grid-cols-4 gap-3">
              {Array.from(typeBreakdown.entries()).map(([type, data]) => {
                const typePct = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
                const typeColor = typePct >= 75 ? "text-success" : typePct >= 50 ? "text-warning" : "text-error";
                return (
                  <div key={type} className="rounded-xl p-4 text-center bg-white shadow-sm" style={{ border: "1.5px solid #F2C073" }}>
                    <p className={`text-xl font-bold ${typeColor}`}>{data.correct}/{data.total}</p>
                    <p className="text-xs text-foreground/45 mt-1">{typeLabels[type] || type}</p>
                  </div>
                );
              })}
            </section>
          )}

          <section className="mt-6 flex flex-col sm:flex-row gap-3">
            <Link
              href="/evaluation"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-all bg-white"
              style={{ border: "1.5px solid #F2C073", color: "#8b6a3f" }}
            >
              Evaluations
            </Link>
            <Link
              href="/exercises"
              className="flex-1 flex items-center justify-center gap-2 px-5 py-3 rounded-xl font-medium transition-all bg-white"
              style={{ border: "1.5px solid #F2C073", color: "#8b6a3f" }}
            >
              Exercices
            </Link>
            <div className="flex-1 flex items-center justify-center">
              <StartButton />
            </div>
          </section>

          <section className="mt-10">
            <h2 className="text-xl font-semibold mb-5" style={{ color: "#F2C073" }}>
              Detail des reponses
            </h2>

            <div className="space-y-3">
              {details.map((d, index) => (
                <div
                  key={d.index}
                  className={`grid-card-enter bg-white rounded-xl p-5 shadow-sm border-l-4 ${
                    d.isCorrect ? "border-l-success" : "border-l-error"
                  }`}
                  style={{ animationDelay: `${index * 0.02}s`, borderTop: "1.5px solid #F2C07320", borderRight: "1.5px solid #F2C07320", borderBottom: "1.5px solid #F2C07320" }}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span
                          className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold text-white ${
                            d.isCorrect ? "bg-success" : "bg-error"
                          }`}
                        >
                          {d.index}
                        </span>
                        <span className="text-xs text-foreground/45 font-medium">
                          Ex. {d.exerciseNumber} - {d.exerciseTitle}
                        </span>
                        <span className="text-xs text-foreground/30 font-medium">
                          · {typeLabels[d.exerciseType] || d.exerciseType}
                        </span>
                      </div>

                      <p className="font-medium text-foreground/90 mt-1">{d.questionText}</p>

                      <div className="mt-3 text-sm space-y-1">
                        <p>
                          <span className="text-foreground/50">Votre reponse :</span>{" "}
                          <span className={d.isCorrect ? "text-success font-medium" : "text-error font-medium"}>
                            {d.exerciseType === "multi_select"
                              ? d.userAnswer === "true"
                                ? "Bonne posture"
                                : "Pas une bonne posture"
                              : d.userAnswer || "-"}
                          </span>
                        </p>
                        {!d.isCorrect && (
                          <p>
                            <span className="text-foreground/50">Reponse attendue :</span>{" "}
                            <span className="text-success font-medium">{d.correctAnswer}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
    </>
  );
}
