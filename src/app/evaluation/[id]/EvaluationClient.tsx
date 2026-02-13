"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

const STORAGE_KEY_PREFIX = "eval_answers_";

interface EvalQuestion {
  index: number;
  key: string;
  exerciseNumber: number;
  exerciseTitle: string;
  exerciseType: string;
  questionId: number;
  questionText: string;
  options: string[];
  qcmOptions: { label: string; text: string }[];
}

interface Props {
  evaluationId: string;
  questions: EvalQuestion[];
  total: number;
}

export default function EvaluationClient({
  evaluationId,
  questions,
  total,
}: Props) {
  const router = useRouter();
  const storageKey = STORAGE_KEY_PREFIX + evaluationId;

  // Load saved answers from localStorage on mount
  const [answers, setAnswers] = useState<Record<string, string>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [slideDirection, setSlideDirection] = useState<"left" | "right" | null>(null);
  const [isAnimating, setIsAnimating] = useState(false);
  const [restored, setRestored] = useState(false);
  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Persist answers to localStorage on every change (debounced)
  const persistToStorage = useCallback(
    (data: Record<string, string>) => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      saveTimerRef.current = setTimeout(() => {
        try {
          localStorage.setItem(storageKey, JSON.stringify(data));
        } catch { /* storage full — ignore */ }
      }, 300);
    },
    [storageKey]
  );

  // Detect if answers were restored from a previous session
  useEffect(() => {
    if (Object.keys(answers).length > 0) {
      setRestored(true);
      const t = setTimeout(() => setRestored(false), 3000);
      return () => clearTimeout(t);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const autoAdvanceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Cleanup timers on unmount
  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
    };
  }, []);

  const currentQuestion = questions[currentIndex];
  const isFirstQuestion = currentIndex === 0;
  const isLastQuestion = currentIndex === total - 1;

  const autoAdvanceTypes = ["single_choice", "qcm", "true_false"];

  function handleAnswer(key: string, value: string) {
    setAnswers((prev) => {
      const updated = { ...prev, [key]: value };
      persistToStorage(updated);
      return updated;
    });

    // Auto-advance to next question for single-selection types
    if (autoAdvanceTypes.includes(currentQuestion?.exerciseType) && currentIndex < total - 1) {
      if (autoAdvanceRef.current) clearTimeout(autoAdvanceRef.current);
      autoAdvanceRef.current = setTimeout(() => {
        navigateTo(currentIndex + 1, "left");
      }, 350);
    }
  }

  function handleMultiSelectToggle(key: string) {
    const current = answers[key] === "true";
    setAnswers((prev) => {
      const updated = { ...prev, [key]: current ? "" : "true" };
      persistToStorage(updated);
      return updated;
    });
  }

  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k]?.trim()
  ).length;

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "TEXTAREA" || tag === "INPUT") return;
      if (e.key === "ArrowRight" && currentIndex < total - 1) {
        navigateTo(currentIndex + 1, "left");
      } else if (e.key === "ArrowLeft" && currentIndex > 0) {
        navigateTo(currentIndex - 1, "right");
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [currentIndex, total]);

  function navigateTo(index: number, direction: "left" | "right") {
    if (isAnimating || index === currentIndex) return;
    setSlideDirection(direction);
    setIsAnimating(true);
    setTimeout(() => {
      setCurrentIndex(index);
      setSlideDirection(null);
      setIsAnimating(false);
    }, 200);
  }

  async function handleSubmit() {
    const unanswered = total - answeredCount;
    if (unanswered > 0) {
      if (!confirm(`Vous avez ${unanswered} question${unanswered > 1 ? "s" : ""} sans réponse. Soumettre quand même ?`)) return;
    } else {
      if (!confirm("Soumettre vos réponses ? Cette action est définitive.")) return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/evaluation/${evaluationId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userAnswers: answers }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError(data.error || "Erreur lors de la soumission. Veuillez réessayer.");
        setSubmitting(false);
        return;
      }
      try { localStorage.removeItem(storageKey); } catch { /* ignore */ }
      router.push(`/evaluation/${evaluationId}/result`);
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.");
      setSubmitting(false);
    }
  }

  return (
    <div className="exercise-container">
      {/* Back link */}
      <Link
        href="/evaluation"
        className="inline-flex items-center gap-1.5 text-sm text-foreground/40 hover:text-primary transition-colors mb-6"
      >
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0">
          <path d="M10 12L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Retour
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-semibold tracking-tight">
          <span className="text-primary">Évaluation</span>
          <span className="text-foreground/20 mx-2">—</span>
          <span className="text-foreground/80">{total} questions</span>
        </h1>
      </div>

      {/* Restored banner */}
      {restored && (
        <div className="mb-4 flex items-center gap-2 px-3 py-2 rounded-lg bg-primary-pale/60 text-primary text-xs font-medium transition-opacity">
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" className="shrink-0">
            <path d="M1.5 7a5.5 5.5 0 1 1 11 0 5.5 5.5 0 0 1-11 0Z" stroke="currentColor" strokeWidth="1.2" />
            <path d="M7 4.5V7.5L9 9" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Vos réponses précédentes ont été restaurées.
        </div>
      )}

      {/* Progress bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-1 bg-foreground/[0.06] rounded-full overflow-hidden">
          <div
            className="h-full bg-primary/80 rounded-full transition-all duration-500 ease-out"
            style={{
              width: total > 0 ? `${(answeredCount / total) * 100}%` : "0%",
            }}
          />
        </div>
        <span className="text-xs text-foreground/30 tabular-nums shrink-0">
          {answeredCount}/{total}
        </span>
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
          {/* Question number badge + source */}
          <div className="flex items-center gap-2.5 mb-2">
            <span className="inline-flex items-center justify-center w-6 h-6 rounded-full bg-primary text-white text-xs font-semibold">
              {currentIndex + 1}
            </span>
            <span className="text-xs text-foreground/35 font-medium">
              Question {currentIndex + 1} sur {total}
            </span>
          </div>

          {/* Exercise source */}
          <p className="text-xs text-primary/50 font-medium ml-[34px] mb-4">
            Ex. {currentQuestion.exerciseNumber} — {currentQuestion.exerciseTitle}
          </p>

          {/* Question text */}
          <p className="text-[16px] font-medium leading-relaxed text-foreground/90 mb-6">
            {currentQuestion.questionText}
          </p>

          {/* ─── SINGLE CHOICE: Pills ─── */}
          {currentQuestion.exerciseType === "single_choice" && (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {currentQuestion.options.map((opt) => {
                const isSelected = answers[currentQuestion.key] === opt;
                return (
                  <button
                    key={opt}
                    onClick={() => handleAnswer(currentQuestion.key, opt)}
                    className={`exercise-pill ${isSelected ? "exercise-pill-active" : ""}`}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>
          )}

          {/* ─── QCM: Option cards ─── */}
          {currentQuestion.exerciseType === "qcm" && (
            <div className="space-y-2">
              {currentQuestion.qcmOptions.map((opt) => {
                const isSelected = answers[currentQuestion.key] === opt.label;
                return (
                  <button
                    key={opt.label}
                    onClick={() => handleAnswer(currentQuestion.key, opt.label)}
                    className={`exercise-option-card ${isSelected ? "exercise-option-card-active" : ""}`}
                  >
                    <span className="exercise-option-label">{opt.label}</span>
                    <span className="text-[14px] leading-snug">{opt.text}</span>
                  </button>
                );
              })}
            </div>
          )}

          {/* ─── MULTI SELECT: Checkbox card ─── */}
          {currentQuestion.exerciseType === "multi_select" && (
            <button
              onClick={() => handleMultiSelectToggle(currentQuestion.key)}
              className={`exercise-option-card ${answers[currentQuestion.key] === "true" ? "exercise-option-card-active" : ""
                }`}
            >
              <span className={`exercise-checkbox ${answers[currentQuestion.key] === "true" ? "exercise-checkbox-active" : ""
                }`}>
                {answers[currentQuestion.key] === "true" && (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path d="M2.5 6L5 8.5L9.5 3.5" stroke="white" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                )}
              </span>
              <span className="text-[14px] leading-snug">Bonne posture pour le MP</span>
            </button>
          )}

          {/* ─── TRUE / FALSE: Two large cards ─── */}
          {currentQuestion.exerciseType === "true_false" && (
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => handleAnswer(currentQuestion.key, "Vrai")}
                className={`exercise-tf-card ${answers[currentQuestion.key] === "Vrai" ? "exercise-tf-card-active" : ""
                  }`}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mb-1">
                  <path d="M4 10L8.5 14.5L16 5.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                Vrai
              </button>
              <button
                onClick={() => handleAnswer(currentQuestion.key, "Faux")}
                className={`exercise-tf-card ${answers[currentQuestion.key] === "Faux" ? "exercise-tf-card-active" : ""
                  }`}
              >
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" className="mb-1">
                  <path d="M5 5L15 15M15 5L5 15" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
                Faux
              </button>
            </div>
          )}
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="mt-3 text-xs text-error text-center">{error}</div>
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
        <div className="flex items-center gap-1 flex-wrap justify-center max-w-[60%]">
          {questions.map((q, i) => {
            const isAnswered = !!answers[q.key]?.trim();
            const isCurrent = i === currentIndex;
            return (
              <button
                key={q.key}
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

        {/* Next / Submit button */}
        {isLastQuestion ? (
          <button
            onClick={handleSubmit}
            disabled={submitting}
            className="exercise-nav-btn exercise-nav-btn-primary"
          >
            <span>{submitting ? "Envoi..." : "Soumettre"}</span>
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M3 8L6.5 11.5L13 4.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        ) : (
          <button
            onClick={() => navigateTo(currentIndex + 1, "left")}
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
    </div>
  );
}
