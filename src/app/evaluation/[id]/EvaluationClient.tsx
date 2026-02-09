"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

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
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  function handleAnswer(key: string, value: string) {
    setAnswers((prev) => ({ ...prev, [key]: value }));
  }

  function handleMultiSelectToggle(key: string) {
    const current = answers[key] === "true";
    setAnswers((prev) => ({ ...prev, [key]: current ? "" : "true" }));
  }

  const answeredCount = Object.keys(answers).filter(
    (k) => answers[k]?.trim()
  ).length;

  async function handleSubmit() {
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
      router.push(`/evaluation/${evaluationId}/result`);
    } catch {
      setError("Erreur de connexion. Veuillez réessayer.");
      setSubmitting(false);
    }
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/evaluation"
          className="text-sm text-foreground/40 hover:text-primary transition-colors"
        >
          ← Retour
        </Link>
        <h1 className="text-2xl sm:text-3xl font-bold mt-3">
          <span className="text-primary">Évaluation</span> — {total} questions
        </h1>
        <div className="flex items-center gap-3 mt-3">
          <span className="text-sm text-foreground/40">
            {answeredCount}/{total} répondue{answeredCount > 1 ? "s" : ""}
          </span>
          {/* Progress bar */}
          <div className="flex-1 h-2 bg-foreground/10 rounded-full overflow-hidden">
            <div
              className="h-full bg-primary rounded-full transition-all duration-300"
              style={{
                width: total > 0 ? `${(answeredCount / total) * 100}%` : "0%",
              }}
            />
          </div>
        </div>
      </div>

      {/* Questions */}
      <div className="space-y-4">
        {questions.map((q) => (
          <div
            key={q.key}
            className="bg-white rounded-lg p-5 shadow-sm border-2 border-transparent"
          >
            <div className="flex items-start gap-3 mb-1">
              <span className="text-sm font-medium text-foreground/40 mt-0.5">
                {q.index}.
              </span>
              <div>
                <span className="text-xs text-primary/60 font-medium">
                  Ex. {q.exerciseNumber} — {q.exerciseTitle}
                </span>
                <p className="font-medium mt-1">{q.questionText}</p>
              </div>
            </div>

            <div className="ml-8 mt-3">
              {/* Single choice - dropdown */}
              {q.exerciseType === "single_choice" && (
                <select
                  value={answers[q.key] || ""}
                  onChange={(e) => handleAnswer(q.key, e.target.value)}
                  className="w-full sm:w-auto px-4 py-2 border border-foreground/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary bg-white"
                >
                  <option value="">— Choisir —</option>
                  {q.options.map((opt) => (
                    <option key={opt} value={opt}>
                      {opt}
                    </option>
                  ))}
                </select>
              )}

              {/* QCM - radio buttons */}
              {q.exerciseType === "qcm" && (
                <div className="space-y-2">
                  {q.qcmOptions.map((opt) => (
                    <label
                      key={opt.label}
                      className={`flex items-start gap-3 p-3 rounded-lg cursor-pointer transition-colors ${
                        answers[q.key] === opt.label
                          ? "bg-primary-pale"
                          : "hover:bg-foreground/5"
                      }`}
                    >
                      <input
                        type="radio"
                        name={`eval-${q.key}`}
                        value={opt.label}
                        checked={answers[q.key] === opt.label}
                        onChange={() => handleAnswer(q.key, opt.label)}
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

              {/* Multi select - checkbox */}
              {q.exerciseType === "multi_select" && (
                <label className="flex items-center gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={answers[q.key] === "true"}
                    onChange={() => handleMultiSelectToggle(q.key)}
                    className="w-5 h-5 accent-primary rounded"
                  />
                  <span className="text-sm">Bonne posture pour le MP</span>
                </label>
              )}

              {/* True / False */}
              {q.exerciseType === "true_false" && (
                <div className="flex gap-3">
                  <button
                    onClick={() => handleAnswer(q.key, "Vrai")}
                    className={`px-5 py-2 rounded-lg border-2 font-medium transition-colors ${
                      answers[q.key] === "Vrai"
                        ? "border-primary bg-primary text-white"
                        : "border-foreground/20 hover:border-primary/50"
                    }`}
                  >
                    Vrai
                  </button>
                  <button
                    onClick={() => handleAnswer(q.key, "Faux")}
                    className={`px-5 py-2 rounded-lg border-2 font-medium transition-colors ${
                      answers[q.key] === "Faux"
                        ? "border-primary bg-primary text-white"
                        : "border-foreground/20 hover:border-primary/50"
                    }`}
                  >
                    Faux
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Submit */}
      <div className="mt-8 flex flex-col items-end gap-3">
        {error && (
          <p className="text-error text-sm font-medium">{error}</p>
        )}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="bg-primary text-white px-8 py-3 rounded-lg font-medium hover:bg-primary-light transition-colors disabled:opacity-50"
        >
          {submitting ? "Envoi en cours..." : "Soumettre mes réponses"}
        </button>
      </div>
    </div>
  );
}
