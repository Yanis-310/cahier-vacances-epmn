"use client";

import { useState, useCallback, useEffect, useRef } from "react";
import Link from "next/link";

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
  answers: Record<string, unknown>;
}

interface Props {
  exercise: ExerciseData;
  savedAnswers: Record<string, string>;
  prevId: string | null;
  nextId: string | null;
}

export default function ExerciseClient({
  exercise,
  savedAnswers,
  prevId,
  nextId,
}: Props) {
  const [userAnswers, setUserAnswers] =
    useState<Record<string, string>>(savedAnswers);
  const [showCorrection, setShowCorrection] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const questions = exercise.content.questions || [];
  const options = exercise.content.options || [];
  const isLabyrinth = exercise.type === "labyrinth";

  // Labyrinth helpers
  function isLabStepCorrect(questionId: number): boolean {
    const userAnswer = userAnswers[questionId];
    const correctAnswer = exercise.answers[questionId] as string;
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
    async (answers: Record<string, string>, completed = false) => {
      setSaving(true);
      setSaveError(null);
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
        }
      } catch {
        setSaveError("Échec de la sauvegarde.");
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
    };
  }, []);

  function handleAnswer(questionId: number, value: string) {
    const updated = { ...userAnswers, [questionId]: value };
    setUserAnswers(updated);
    setShowCorrection(false);

    // For labyrinth, auto-complete when all steps are correct
    if (isLabyrinth) {
      const willBeComplete =
        questions.every((q) => {
          const ans = q.id === questionId ? value : updated[q.id];
          const correct = exercise.answers[q.id] as string;
          return !!ans && ans === correct;
        });
      saveAnswers(updated, willBeComplete);
    } else if (exercise.type === "free_text") {
      scheduleSave(updated);
    } else {
      saveAnswers(updated);
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
    await saveAnswers(userAnswers, true);
    setShowCorrection(true);
  }

  function getStatus(questionId: number): "correct" | "incorrect" | null {
    if (!showCorrection) return null;

    if (exercise.type === "free_text") return null;

    if (exercise.type === "multi_select") {
      const correctIds = (exercise.answers as { correctIds: number[] }).correctIds;
      const isSelected = userAnswers[questionId] === "true";
      const shouldBeSelected = correctIds.includes(questionId);
      return isSelected === shouldBeSelected ? "correct" : "incorrect";
    }

    const userAnswer = userAnswers[questionId];
    const correctAnswer = exercise.answers[questionId] as string;
    if (!userAnswer) return "incorrect";
    return userAnswer === correctAnswer ? "correct" : "incorrect";
  }

  const answeredCount = Object.keys(userAnswers).filter(
    (k) => userAnswers[k]?.trim()
  ).length;

  return (
    <div>
      {/* Header */}
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
        {exercise.content.legend && (
          <p className="text-sm text-foreground/40 mt-1 italic">
            {exercise.content.legend}
          </p>
        )}
        {!isLabyrinth && (
          <div className="flex items-center gap-3 mt-3">
            <span className="text-sm text-foreground/40">
              {answeredCount}/{questions.length} répondu
              {answeredCount > 1 ? "es" : ""}
            </span>
            {saving && (
              <span className="text-xs text-foreground/30">Sauvegarde...</span>
            )}
            {saveError && (
              <span className="text-xs text-error">{saveError}</span>
            )}
          </div>
        )}
      </div>

      {/* Labyrinth scenario */}
      {isLabyrinth && exercise.content.scenario && (
        <div className="bg-primary-pale/50 rounded-lg p-4 mb-6">
          <p className="text-sm text-foreground/70">
            {exercise.content.scenario}
          </p>
        </div>
      )}

      {/* Labyrinth progress */}
      {isLabyrinth && (
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
            <span className="text-xs text-foreground/30">Sauvegarde...</span>
          )}
        </div>
      )}

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q, qIndex) => {
          const status = getStatus(q.id);

          // Labyrinth rendering
          if (isLabyrinth) {
            const unlocked = isLabStepUnlocked(qIndex);
            const answered = !!userAnswers[q.id];
            const correct = isLabStepCorrect(q.id);

            return (
              <div key={q.id}>
                {/* Connector line */}
                {qIndex > 0 && (
                  <div className="flex justify-center my-2">
                    <div
                      className={`w-0.5 h-6 ${
                        isLabStepCorrect(questions[qIndex - 1].id)
                          ? "bg-success/50"
                          : "bg-foreground/10"
                      }`}
                    />
                  </div>
                )}
                <div
                  className={`bg-white rounded-lg p-5 shadow-sm border-2 transition-all duration-300 ${
                    !unlocked
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
                      className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold shrink-0 ${
                        correct
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
                        const isCorrectOpt = (exercise.answers[q.id] as string) === opt.label;

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
          }

          // Standard rendering for other types
          return (
            <div
              key={q.id}
              className={`bg-white rounded-lg p-5 shadow-sm border-2 transition-colors ${
                status === "correct"
                  ? "border-success/50"
                  : status === "incorrect"
                  ? "border-error/50"
                  : "border-transparent"
              }`}
            >
              <div className="flex items-start gap-3 mb-3">
                <span className="text-sm font-medium text-foreground/40 mt-0.5">
                  {q.id}.
                </span>
                <p className="font-medium">{q.text}</p>
              </div>

              {/* Single choice with dropdown */}
              {exercise.type === "single_choice" && (
                <select
                  value={userAnswers[q.id] || ""}
                  onChange={(e) => handleAnswer(q.id, e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white"
                >
                  <option value="">— Choisir —</option>
                  {options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {/* QCM with radio buttons */}
              {exercise.type === "qcm" && q.options && (
                <div className="space-y-2">
                  {q.options.map((opt) => (
                    <label
                      key={opt.label}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        userAnswers[q.id] === opt.label
                          ? "bg-primary-pale"
                          : "hover:bg-foreground/5"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`q-${q.id}`}
                        value={opt.label}
                        checked={userAnswers[q.id] === opt.label}
                        onChange={() => handleAnswer(q.id, opt.label)}
                        className="mt-1 accent-primary"
                      />
                      <span>
                        <span className="font-medium">{opt.label}.</span>{" "}
                        {opt.text}
                      </span>
                    </label>
                  ))}
                </div>
              )}

              {/* Multi select with checkboxes */}
              {exercise.type === "multi_select" && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={userAnswers[q.id] === "true"}
                    onChange={() => handleMultiSelectToggle(q.id)}
                    className="w-5 h-5 accent-primary rounded"
                  />
                  <span className="text-sm">Bonne posture pour le MP</span>
                </label>
              )}

              {/* True / False */}
              {exercise.type === "true_false" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAnswer(q.id, "Vrai")}
                    className={`px-5 py-2 rounded-lg border-2 font-medium transition-colors ${
                      userAnswers[q.id] === "Vrai"
                        ? "border-primary bg-primary text-white"
                        : "border-foreground/20 hover:border-primary/50"
                    }`}
                  >
                    Vrai
                  </button>
                  <button
                    onClick={() => handleAnswer(q.id, "Faux")}
                    className={`px-5 py-2 rounded-lg border-2 font-medium transition-colors ${
                      userAnswers[q.id] === "Faux"
                        ? "border-primary bg-primary text-white"
                        : "border-foreground/20 hover:border-primary/50"
                    }`}
                  >
                    Faux
                  </button>
                </div>
              )}

              {/* Free text */}
              {exercise.type === "free_text" && (
                <textarea
                  value={userAnswers[q.id] || ""}
                  onChange={(e) => handleAnswer(q.id, e.target.value)}
                  onBlur={() => saveAnswers(userAnswers)}
                  rows={2}
                  placeholder="Votre réponse..."
                  className="w-full px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary resize-y"
                />
              )}

              {/* Show correction */}
              {showCorrection && (
                <div className="mt-3">
                  {status === "correct" && (
                    <p className="text-sm text-success font-medium">
                      Bonne réponse !
                    </p>
                  )}
                  {status === "incorrect" && exercise.type !== "multi_select" && (
                    <p className="text-sm text-error">
                      Réponse attendue :{" "}
                      <span className="font-medium">
                        {exercise.answers[q.id] as string}
                      </span>
                    </p>
                  )}
                  {status === "incorrect" && exercise.type === "multi_select" && (
                    <p className="text-sm text-error">
                      {(exercise.answers as { correctIds: number[] }).correctIds.includes(q.id)
                        ? "Cette proposition est une bonne posture."
                        : "Cette proposition n'est pas une bonne posture."}
                    </p>
                  )}
                  {exercise.type === "free_text" && (
                    <div className="text-sm bg-primary-pale/50 rounded-lg p-3 mt-1">
                      <span className="font-medium text-primary">
                        Réponse attendue :
                      </span>{" "}
                      {exercise.answers[q.id] as string}
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Labyrinth success */}
      {isLabyrinth && allLabStepsCorrect && (
        <div className="mt-6 bg-success/10 rounded-lg p-6 text-center">
          <p className="text-success font-bold text-lg">
            Bravo ! Vous avez trouvé le bon chemin !
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="mt-8 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex gap-3">
          {prevId && (
            <Link
              href={`/exercises/${prevId}`}
              className="px-5 py-2.5 border border-foreground/20 rounded-lg hover:bg-white transition-colors"
            >
              ← Précédent
            </Link>
          )}
          {nextId && (
            <Link
              href={`/exercises/${nextId}`}
              className="px-5 py-2.5 border border-foreground/20 rounded-lg hover:bg-white transition-colors"
            >
              Suivant →
            </Link>
          )}
        </div>

        {!isLabyrinth && (
          <button
            onClick={handleCheck}
            className="bg-primary text-white px-6 py-2.5 rounded-lg font-medium hover:bg-primary-light transition-colors"
          >
            Vérifier mes réponses
          </button>
        )}
      </div>
    </div>
  );
}
