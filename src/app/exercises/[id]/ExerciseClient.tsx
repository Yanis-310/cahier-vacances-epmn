"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import FeedbackMessage from "@/components/FeedbackMessage";

interface QcmOption {
  label: string;
  text: string;
}

interface Question {
  id: number;
  text: string;
  options?: QcmOption[];
}

interface ExerciseData {
  id: string;
  number: number;
  title: string;
  type: string;
  content: {
    instruction?: string;
    legend?: string;
    scenario?: string;
    options?: string[];
    questions?: Question[];
    columns?: { left: string; right: string };
  };
  answers: Record<string, unknown> | null;
}

interface Props {
  exercise: ExerciseData;
  savedAnswers: Record<string, string>;
  isCompleted: boolean;
  prevId: string | null;
  nextId: string | null;
}

export default function ExerciseClient({
  exercise,
  savedAnswers,
  isCompleted,
  prevId,
  nextId,
}: Props) {
  const [userAnswers, setUserAnswers] =
    useState<Record<string, string>>(savedAnswers);
  const [exerciseAnswers, setExerciseAnswers] = useState<Record<string, unknown> | null>(
    exercise.answers
  );
  const [showCorrection, setShowCorrection] = useState(isCompleted);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const saveSuccessTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [pageTransition, setPageTransition] = useState<"enter" | "exit" | null>("enter");
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const router = useRouter();

  // Fade-in on mount
  useEffect(() => {
    const t = setTimeout(() => setPageTransition(null), 350);
    return () => clearTimeout(t);
  }, []);

  function navigateToExercise(href: string) {
    setPageTransition("exit");
    setTimeout(() => {
      router.push(href);
    }, 250);
  }

  const questions = exercise.content.questions || [];
  const options = exercise.content.options || [];
  const isLabyrinth = exercise.type === "labyrinth";
  const totalQuestions = questions.length;
  const currentQuestion = questions[currentIndex];

  // Labyrinth helpers (kept as-is)
  function isLabStepCorrect(questionId: number): boolean {
    const userAnswer = userAnswers[questionId];
    const correctAnswer = exerciseAnswers?.[questionId] as string;
    return !!userAnswer && userAnswer === correctAnswer;
  }

  function isLabStepUnlocked(stepIndex: number): boolean {
    if (stepIndex === 0) return true;
    for (let i = 0; i < stepIndex; i++) {
      if (!isLabStepCorrect(questions[i].id)) return false;
    }
    return true;
  }

  const allLabStepsCorrect =
    isLabyrinth && questions.length > 0 && questions.every((q) => isLabStepCorrect(q.id));

  const saveAnswers = useCallback(
    async (answers: Record<string, string>, completed = false): Promise<boolean> => {
      setSaving(true);
      setSaveError(null);
      setSaveSuccess(false);
      try {
        const res = await fetch("/api/progress", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            exerciseId: exercise.id,
            userAnswers: answers,
            completed,
          }),
        });
        if (!res.ok) {
          setSaveError("Échec de la sauvegarde.");
          return false;
        }
        // When completing, the API returns the exercise answers for correction
        if (completed) {
          const data = await res.json();
          if (data.answers) {
            setExerciseAnswers(data.answers);
          }
        }
        setSaveSuccess(true);
        if (saveSuccessTimerRef.current) clearTimeout(saveSuccessTimerRef.current);
        saveSuccessTimerRef.current = setTimeout(() => setSaveSuccess(false), 1500);
        return true;
      } catch {
        setSaveError("Échec de la sauvegarde.");
        return false;
      } finally {
        setSaving(false);
      }
    },
    [exercise.id]
  );

  const scheduleSave = useCallback(
    (answers: Record<string, string>, completed = false) => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        saveAnswers(answers, completed);
      }, 600);
    },
    [saveAnswers]
  );

  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      if (saveSuccessTimerRef.current) clearTimeout(saveSuccessTimerRef.current);
    };
  }, []);

  const navigateTo = useCallback((index: number, direction: "left" | "right") => {
    if (isAnimating || index === currentIndex) return;
    setSlideDirection(direction);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setSlideDirection(null);
      setIsAnimating(false);
    }, 200);
  }, [currentIndex, isAnimating]);

  // Keyboard navigation
  useEffect(() => {
    if (isLabyrinth) return;
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (e.key === "ArrowRight" && currentIndex < totalQuestions - 1) {
        navigateTo(currentIndex + 1, "left");
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        navigateTo(currentIndex - 1, "right");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, isLabyrinth, navigateTo, totalQuestions]);

  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    };
  }, []);

  const autoAdvanceTypes = ["single_choice", "qcm", "true_false"];

  function handleAnswer(questionId: number, value: string) {
    const updated = { ...userAnswers, [questionId]: value };
    setUserAnswers(updated);
    setShowCorrection(false);

    if (isLabyrinth) {
      const willBeComplete = questions.every((q) => {
        const ans = q.id === questionId ? value : (updated as Record<number, string>)[q.id];
        const correct = (exerciseAnswers as Record<number, string>)?.[q.id];
        return !!ans && ans === correct;
      });
      saveAnswers(updated, willBeComplete);
    } else if (exercise.type === "free_text") {
      scheduleSave(updated);
    } else {
      saveAnswers(updated);
    }

    // Auto-advance to next question for single-selection types
    if (autoAdvanceTypes.includes(exercise.type) && !isLabyrinth && currentIndex < totalQuestions - 1) {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = setTimeout(() => {
        navigateTo(currentIndex + 1, "left");
      }, 350);
    }
  }

  function handleMultiSelectToggle(questionId: number) {
    const current = userAnswers[questionId] === "true";
    const updated = { ...userAnswers, [questionId]: current ? "" : "true" };
    setUserAnswers(updated);
    setShowCorrection(false);
    saveAnswers(updated);
  }

  async function handleCheck() {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    const success = await saveAnswers(userAnswers, true);
    if (success) {
      setShowCorrection(true);
    }
  }

  function getStatus(questionId: number): "correct" | "incorrect" | null {
    if (!showCorrection) return null;
    if (exercise.type === "free_text") return null;

    if (exercise.type === "multi_select") {
      const correctIds = (exerciseAnswers as { correctIds: number[] })?.correctIds ?? [];
      const isSelected = userAnswers[questionId] === "true";
      const shouldBeSelected = correctIds.includes(questionId);
      return isSelected === shouldBeSelected ? "correct" : "incorrect";
    }

    const userAnswer = userAnswers[questionId];
    const correctAnswer = exerciseAnswers?.[questionId] as string;
    if (!userAnswer) return "incorrect";
    return userAnswer === correctAnswer ? "correct" : "incorrect";
  }

  const answeredCount = Object.keys(userAnswers).filter(
    (k) => userAnswers[k]?.trim()
  ).length;

  // ─── LABYRINTH RENDERING (preserved as-is) ───
  if (isLabyrinth) {
    return (
      <div className={`exercise-page-transition ${pageTransition === "enter" ? "exercise-page-enter" : pageTransition === "exit" ? "exercise-page-exit" : ""}`}>
        <div className="mb-8">
          <Link
            href="/exercises"
            className="text-sm text-foreground/40 hover:text-primary transition-colors"
          >
            ← Retour aux exercices
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold mt-3">
            <span className="text-primary">Exercice {exercise.number}</span> —{" "}
            {exercise.title}
          </h1>
          {exercise.content.instruction && (
            <p className="text-foreground/60 mt-2">
              {exercise.content.instruction}
            </p>
          )}
        </div>

        {exercise.content.scenario && (
          <div className="bg-primary-pale/50 rounded-lg p-4 mb-6">
            <p className="text-sm text-foreground/70">
              {exercise.content.scenario}
            </p>
          </div>
        )}

        <div className="flex items-center gap-3 mb-6">
          <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-500"
              style={{
                width:
                  questions.length > 0
                    ? `${(questions.filter((q) => isLabStepCorrect(q.id)).length / questions.length) * 100}%`
                    : "0%",
              }}
            />
          </div>
          <span className="text-sm text-foreground/40">
            {questions.filter((q) => isLabStepCorrect(q.id)).length}/{questions.length}
          </span>
          {saving && (
            <span className="text-xs text-foreground/40 animate-pulse">Sauvegarde...</span>
          )}
          {!saving && saveSuccess && (
            <span className="text-xs text-success flex items-center gap-1">
              <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Enregistré
            </span>
          )}
        </div>

        <div className="space-y-4">
          {questions.map((q, qIndex) => {
            const unlocked = isLabStepUnlocked(qIndex);
            const answered = !!userAnswers[q.id];
            const correct = isLabStepCorrect(q.id);

            return (
              <div key={q.id}>
                {qIndex > 0 && (
                  <div className="flex justify-center my-2">
                    <div
                      className={`w-0.5 h-6 ${isLabStepCorrect(questions[qIndex - 1].id)
                        ? "bg-success/50"
                        : "bg-foreground/10"
                        }`}
                    />
                  </div>
                )}
                <div
                  className={`bg-white rounded-lg p-5 shadow-sm border-2 transition-all duration-300 ${!unlocked
                    ? "opacity-40 pointer-events-none border-foreground/5"
                    : correct
                      ? "border-success/50"
                      : answered
                        ? "border-error/50"
                        : "border-transparent"
                    }`}
                >
                  <div className="flex items-start gap-3 mb-3">
                    <span
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${correct
                        ? "bg-success text-white"
                        : unlocked
                          ? "bg-primary text-white"
                          : "bg-foreground/10 text-foreground/40"
                        }`}
                    >
                      {correct ? "\u2713" : qIndex + 1}
                    </span>
                    <p className="font-medium mt-0.5">{q.text}</p>
                  </div>

                  {q.options && (
                    <div className="space-y-2 ml-10">
                      {q.options.map((opt) => {
                        const isSelected = userAnswers[q.id] === opt.label;
                        const isCorrectOpt = (exerciseAnswers?.[q.id] as string) === opt.label;

                        let btnClass =
                          "border-foreground/10 hover:border-primary/50";
                        if (isSelected && correct) {
                          btnClass = "border-success bg-success/10";
                        } else if (isSelected && answered && !correct) {
                          btnClass = "border-error bg-error/10";
                        } else if (correct && isCorrectOpt) {
                          btnClass = "border-success/30";
                        }

                        return (
                          <button
                            key={opt.label}
                            onClick={() => handleAnswer(q.id, opt.label)}
                            disabled={correct}
                            className={`w-full text-left p-3 rounded-lg border-2 transition-colors disabled:cursor-default ${btnClass}`}
                          >
                            <span className="font-medium">{opt.label}.</span>{" "}
                            {opt.text}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {answered && correct && (
                    <p className="text-sm text-success font-medium mt-3 ml-10">
                      Bon chemin !
                    </p>
                  )}
                  {answered && !correct && (
                    <p className="text-sm text-error mt-3 ml-10">
                      Impasse ! Essayez un autre chemin.
                    </p>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {allLabStepsCorrect && (
          <div className="mt-6 bg-success/10 rounded-lg p-6 text-center">
            <p className="text-success font-bold text-lg">
              Bravo ! Vous avez trouvé le bon chemin !
            </p>
          </div>
        )}

        <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex gap-3">
            {prevId && (
              <button
                onClick={() => navigateToExercise(`/exercises/${prevId}`)}
                className="px-5 py-2.5 border border-foreground/20 rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                ← Précédent
              </button>
            )}
            {nextId && (
              <button
                onClick={() => navigateToExercise(`/exercises/${nextId}`)}
                className="px-5 py-2.5 border border-foreground/20 rounded-lg hover:bg-white transition-colors cursor-pointer"
              >
                Suivant →
              </button>
            )}
          </div>
        </div>
      </div>
    );
  }

  // ─── NON-LABYRINTH: ONE QUESTION AT A TIME ───

  // Compute score for correction mode
  const computeScore = () => {
    let correct = 0;
    let incorrect = 0;
    questions.forEach((q) => {
      if (exercise.type === "free_text") {
        // free_text: don't count as correct/incorrect
        return;
      }
      if (exercise.type === "multi_select") {
        const correctIds = (exerciseAnswers as { correctIds: number[] })?.correctIds ?? [];
        const isSelected = userAnswers[q.id] === "true";
        const shouldBeSelected = correctIds.includes(q.id);
        if (isSelected === shouldBeSelected) correct++;
        else incorrect++;
      } else {
        const userAnswer = userAnswers[q.id];
        const correctAnswer = exerciseAnswers?.[q.id] as string;
        if (userAnswer && userAnswer === correctAnswer) correct++;
        else incorrect++;
      }
    });
    return { correct, incorrect, total: correct + incorrect };
  };

  async function handleRestart() {
    if (!confirm("Recommencer cet exercice ? Toutes vos réponses seront effacées.")) return;
    setUserAnswers({});
    setShowCorrection(false);
    setExerciseAnswers(null);
    setCurrentIndex(0);
    await saveAnswers({}, false);
  }

  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === totalQuestions - 1;
  const score = showCorrection ? computeScore() : null;

  // ─── CORRECTION MODE: Show all questions with results ───
  if (showCorrection) {
    return (
      <div className={`exercise-container exercise-page-transition ${pageTransition === "enter" ? "exercise-page-enter" : pageTransition === "exit" ? "exercise-page-exit" : ""}`}>
        {/* Back link */}
        <Link
          href="/exercises"
          className="inline-flex items-center gap-1.5 text-sm text-foreground/40 hover:text-primary transition-colors mb-6"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Retour aux exercices
        </Link>

        {/* Exercise header */}
        <div className="mb-6">
          <h1 className="text-2xl font-semibold tracking-tight">
            <span className="text-primary">Exercice {exercise.number}</span>
            <span className="text-foreground/20 mx-2">—</span>
            <span className="text-foreground/80">{exercise.title}</span>
          </h1>
        </div>

        {/* Score card */}
        {score && exercise.type !== "free_text" && (
          <div className="exercise-card mb-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-foreground/40 font-medium mb-1">Résultat</p>
                <p className="text-3xl font-bold tabular-nums">
                  <span className="text-success">{score.correct}</span>
                  <span className="text-foreground/15 mx-1">/</span>
                  <span className="text-foreground/40">{score.total}</span>
                </p>
              </div>
              <div className="text-right">
                {score.incorrect === 0 ? (
                  <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-success/10 text-success text-sm font-medium">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Parfait !
                  </div>
                ) : (
                  <p className="text-sm text-foreground/40">
                    {score.incorrect} erreur{score.incorrect > 1 ? "s" : ""}
                  </p>
                )}
              </div>
            </div>
            {/* Score bar */}
            <div className="mt-4 h-1.5 bg-foreground/[0.06] rounded-full overflow-hidden">
              <div
                className="h-full bg-success rounded-full transition-all duration-700 ease-out"
                style={{ width: score.total > 0 ? `${(score.correct / score.total) * 100}%` : "0%" }}
              />
            </div>
          </div>
        )}

        {exercise.type === "free_text" && (
          <div className="exercise-card mb-6">
            <p className="text-sm text-foreground/50">
              Comparez vos réponses avec les réponses attendues ci-dessous.
            </p>
          </div>
        )}

        {/* All questions with corrections */}
        <div className="space-y-3">
          {questions.map((q, qIndex) => {
            const qStatus = getStatus(q.id);
            const userAnswer = userAnswers[q.id];

            return (
              <div
                key={q.id}
                className={`exercise-card exercise-slide-in ${qStatus === "correct"
                  ? "ring-1 ring-success/25"
                  : qStatus === "incorrect"
                    ? "ring-1 ring-error/25"
                    : ""
                  }`}
                style={{ animationDelay: `${qIndex * 40}ms` }}
              >
                {/* Question header */}
                <div className="flex items-start gap-3 mb-3">
                  <span className={`inline-flex items-center justify-center w-6 h-6 rounded-full text-xs font-semibold shrink-0 ${qStatus === "correct"
                    ? "bg-success text-white"
                    : qStatus === "incorrect"
                      ? "bg-error text-white"
                      : "bg-primary text-white"
                    }`}>
                    {qStatus === "correct" ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                        <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : qStatus === "incorrect" ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 2L8 8M8 2L2 8" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    ) : (
                      qIndex + 1
                    )}
                  </span>
                  <p className="text-[15px] font-medium leading-relaxed text-foreground/85 pt-0.5">
                    {q.text}
                  </p>
                </div>

                {/* User's answer */}
                {exercise.type !== "free_text" && (
                  <div className="ml-9">
                    <p className="text-sm text-foreground/50">
                      Votre réponse :{" "}
                      <span className={`font-medium ${qStatus === "correct" ? "text-success" : qStatus === "incorrect" ? "text-error" : "text-foreground/70"
                        }`}>
                        {userAnswer || "—"}
                      </span>
                    </p>

                    {/* Show expected answer if incorrect */}
                    {qStatus === "incorrect" && exercise.type !== "multi_select" && (
                      <div className="exercise-correction mt-2">
                        <span className="text-foreground/40 text-xs uppercase tracking-wide font-medium">Réponse attendue</span>
                        <p className="text-sm font-medium text-foreground/70 mt-0.5">
                          {exerciseAnswers?.[q.id] as string}
                        </p>
                      </div>
                    )}

                    {qStatus === "incorrect" && exercise.type === "multi_select" && (
                      <div className="exercise-correction mt-2">
                        <p className="text-sm text-foreground/70">
                          {((exerciseAnswers as { correctIds: number[] })?.correctIds ?? []).includes(q.id)
                            ? "Cette proposition est une bonne posture."
                            : "Cette proposition n'est pas une bonne posture."}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Free text: show user answer + expected */}
                {exercise.type === "free_text" && (
                  <div className="ml-9 space-y-2">
                    <div className="px-3 py-2 rounded-lg bg-foreground/[0.03] border border-foreground/[0.06]">
                      <p className="text-xs text-foreground/35 font-medium uppercase tracking-wide mb-1">Votre réponse</p>
                      <p className="text-sm text-foreground/70">{userAnswer || "—"}</p>
                    </div>
                    <div className="exercise-correction">
                      <span className="text-foreground/40 text-xs uppercase tracking-wide font-medium">Réponse attendue</span>
                      <p className="text-sm text-foreground/70 mt-0.5">
                        {exerciseAnswers?.[q.id] as string}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Save error */}
        {saveError && (
          <FeedbackMessage message={saveError} variant="error" className="mt-3" />
        )}

        {/* Action buttons */}
        <div className="mt-8 flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={handleRestart}
            className="exercise-nav-btn w-full sm:w-auto justify-center"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 8C2 4.686 4.686 2 8 2C11.314 2 14 4.686 14 8C14 11.314 11.314 14 8 14C5.5 14 3.4 12.5 2.5 10.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              <path d="M2 4V8H6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Recommencer
          </button>

          {nextId && (
            <button
              onClick={() => navigateToExercise(`/exercises/${nextId}`)}
              className="exercise-nav-btn exercise-nav-btn-primary w-full sm:w-auto justify-center cursor-pointer"
            >
              Exercice suivant
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          )}
        </div>

        {/* Exercise navigation */}
        <div className="mt-10 pt-6 border-t border-foreground/[0.06] flex justify-between items-center">
          {prevId ? (
            <button
              onClick={() => navigateToExercise(`/exercises/${prevId}`)}
              className="exercise-exnav-btn cursor-pointer"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              Exercice précédent
            </button>
          ) : <span />}
          {nextId ? (
            <button
              onClick={() => navigateToExercise(`/exercises/${nextId}`)}
              className="exercise-exnav-btn cursor-pointer"
            >
              Exercice suivant
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
                <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          ) : <span />}
        </div>
      </div>
    );
  }

  // ─── NORMAL QUIZ MODE: One question at a time ───
  return (
    <div className={`exercise-container exercise-page-transition ${pageTransition === "enter" ? "exercise-page-enter" : pageTransition === "exit" ? "exercise-page-exit" : ""}`}>
      {/* Back link */}
      <Link
        href="/exercises"
        className="inline-flex items-center gap-1.5 text-sm text-foreground/40 hover:text-primary transition-colors mb-6"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Retour aux exercices
      </Link>

      {/* Exercise header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          <span className="text-primary">Exercice {exercise.number}</span>
          <span className="text-foreground/20 mx-2">—</span>
          <span className="text-foreground/80">{exercise.title}</span>
        </h1>

        {exercise.content.instruction && (
          <p className="text-foreground/50 mt-2 text-[15px] leading-relaxed">
            {exercise.content.instruction}
          </p>
        )}

        {exercise.content.legend && (
          <div className="mt-3 px-3 py-2 bg-foreground/[0.03] rounded-lg border border-foreground/[0.06]">
            <p className="text-xs text-foreground/40 leading-relaxed">
              {exercise.content.legend}
            </p>
          </div>
        )}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-1 bg-foreground/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-primary/80 rounded-full transition-all duration-500 ease-out"
            style={{
              width: totalQuestions > 0
                ? `${(answeredCount / totalQuestions) * 100}%`
                : "0%",
            }}
          />
        </div>
        <span className="text-xs text-foreground/30 tabular-nums shrink-0">
          {answeredCount}/{totalQuestions}
        </span>
        {saving && (
          <span className="text-xs text-foreground/40 animate-pulse">Sauvegarde...</span>
        )}
        {!saving && saveSuccess && (
          <span className="text-xs text-success flex items-center gap-1 transition-opacity">
            <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
              <path d="M2.5 6L5 8.5L9.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Enregistré
          </span>
        )}
      </div>

      {/* Question card */}
      {currentQuestion && (
        <div
          className={`exercise-card ${slideDirection === "left"
            ? "exercise-slide-out-left"
            : slideDirection === "right"
              ? "exercise-slide-out-right"
              : "exercise-slide-in"
            }`}
        >
          {/* Question number badge */}
          <div className="flex items-center gap-2.5 mb-5">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-semibold">
              {currentIndex + 1}
            </span>
            <span className="text-xs text-foreground/35 font-medium">
              Question {currentIndex + 1} sur {totalQuestions}
            </span>
          </div>

          {/* Question text */}
          <p className="text-[16px] font-medium leading-relaxed text-foreground/90 mb-6">
            {currentQuestion.text}
          </p>

          {/* ─── SINGLE CHOICE: Pills ─── */}
          {exercise.type === "single_choice" && (
            <div className="grid grid-cols-1 min-[400px]:grid-cols-2 sm:grid-cols-3 gap-2">
              {options.map((opt) => {
                const isSelected = userAnswers[currentQuestion.id] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(currentQuestion.id, opt)}
                    className={`exercise-pill ${isSelected ? "exercise-pill-active" : ""}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* ─── QCM: Option cards ─── */}
          {exercise.type === "qcm" && currentQuestion.options && (
            <div className="space-y-2">
              {currentQuestion.options.map((opt) => {
                const isSelected = userAnswers[currentQuestion.id] === opt.label;
                return (
                  <button
                    key={opt.label}
                    onClick={() => handleAnswer(currentQuestion.id, opt.label)}
                    className={`exercise-option-card ${isSelected ? "exercise-option-card-active" : ""}`}
                  >
                    <span className="exercise-option-label">{opt.label}</span>
                    <span className="text-[14px] leading-snug">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ─── MULTI SELECT: Checkbox cards ─── */}
          {exercise.type === "multi_select" && (
            <button
              onClick={() => handleMultiSelectToggle(currentQuestion.id)}
              className={`exercise-option-card ${userAnswers[currentQuestion.id] === "true" ? "exercise-option-card-active" : ""
                }`}
            >
              <span className={`exercise-checkbox ${userAnswers[currentQuestion.id] === "true" ? "exercise-checkbox-active" : ""
                }`}>
                {userAnswers[currentQuestion.id] === "true" && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="text-[14px] leading-snug">Bonne posture pour le MP</span>
            </button>
          )}

          {/* ─── TRUE / FALSE: Two large cards ─── */}
          {exercise.type === "true_false" && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAnswer(currentQuestion.id, "Vrai")}
                className={`exercise-tf-card ${userAnswers[currentQuestion.id] === "Vrai" ? "exercise-tf-card-active" : ""
                  }`}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mb-1">
                  <path d="M4 10L8.5 14.5L16 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Vrai
              </button>
              <button
                onClick={() => handleAnswer(currentQuestion.id, "Faux")}
                className={`exercise-tf-card ${userAnswers[currentQuestion.id] === "Faux" ? "exercise-tf-card-active" : ""
                  }`}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mb-1">
                  <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Faux
              </button>
            </div>
          )}

          {/* ─── FREE TEXT: Textarea ─── */}
          {exercise.type === "free_text" && (
            <div>
              {exercise.content.columns && (
                <p className="text-xs text-foreground/35 mb-2 font-medium uppercase tracking-wide">
                  {exercise.content.columns.right}
                </p>
              )}
              <textarea
                value={userAnswers[currentQuestion.id] || ""}
                onChange={(e) => handleAnswer(currentQuestion.id, e.target.value)}
                onBlur={() => saveAnswers(userAnswers)}
                onKeyDown={(e) => {
                  if ((e.ctrlKey || e.metaKey) && e.key === "Enter" && currentIndex < totalQuestions - 1) {
                    e.preventDefault();
                    saveAnswers(userAnswers);
                    navigateTo(currentIndex + 1, "left");
                  }
                }}
                rows={4}
                placeholder="Votre réponse..."
                className="exercise-textarea"
              />
              {currentIndex < totalQuestions - 1 && (
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-foreground/30 hidden sm:inline">
                    Ctrl+Entrée pour passer à la suite
                  </span>
                  <button
                    onClick={() => {
                      saveAnswers(userAnswers);
                      navigateTo(currentIndex + 1, "left");
                    }}
                    className="text-xs text-primary/70 hover:text-primary font-medium flex items-center gap-1 transition-colors ml-auto cursor-pointer"
                  >
                    Question suivante
                    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
                      <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Save error */}
      {saveError && (
        <FeedbackMessage message={saveError} variant="error" className="mt-3" />
      )}

      {/* Navigation footer */}
      <div className="mt-6 flex items-center justify-between">
        {/* Previous button */}
        <button
          onClick={() => navigateTo(currentIndex - 1, "right")}
          disabled={isFirstQuestion}
          className="exercise-nav-btn"
          aria-label="Question précédente"
        >
          <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
            <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="hidden sm:inline">Précédent</span>
        </button>

        {/* Dots */}
        <div className="exercise-dots-container">
          {questions.map((q, i) => {
            const isAnswered = !!userAnswers[q.id]?.trim();
            const isCurrent = i === currentIndex;
            return (
              <button
                key={q.id}
                onClick={() => navigateTo(i, i > currentIndex ? "left" : "right")}
                className={`exercise-dot ${isCurrent
                  ? "exercise-dot-current"
                  : isAnswered
                    ? "exercise-dot-answered"
                    : "exercise-dot-empty"
                  }`}
                aria-label={`Question ${i + 1}`}
              />
            );
          })}
        </div>

        {/* Next / Vérifier button */}
        {isLastQuestion ? (
          <button
            onClick={handleCheck}
            className="exercise-nav-btn exercise-nav-btn-primary"
          >
            <span>Vérifier</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => navigateTo(currentIndex + 1, "left")}
            disabled={isLastQuestion}
            className="exercise-nav-btn"
            aria-label="Question suivante"
          >
            <span className="hidden sm:inline">Suivant</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        )}
      </div>

      {/* Exercise navigation (prev/next exercise) */}
      <div className="mt-10 pt-6 border-t border-foreground/[0.06] flex justify-between items-center">
        {prevId ? (
          <button
            onClick={() => navigateToExercise(`/exercises/${prevId}`)}
            className="exercise-exnav-btn cursor-pointer"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            Exercice précédent
          </button>
        ) : <span />}
        {nextId ? (
          <button
            onClick={() => navigateToExercise(`/exercises/${nextId}`)}
            className="exercise-exnav-btn cursor-pointer"
          >
            Exercice suivant
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
              <path d="M6 4L10 8L6 12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : <span />}
      </div>
    </div>
  );
}
