"use client";

import { type ReactNode, useMemo, useState } from "react";

type ExerciseType =
  | "single_choice"
  | "qcm"
  | "multi_select"
  | "true_false"
  | "free_text"
  | "labyrinth";

type AdminExercise = {
  id: string;
  number: number;
  title: string;
  type: ExerciseType;
  isActive: boolean;
  content: unknown;
  answers: unknown;
};

type DraftQuestion = {
  text: string;
  options: string[];
  answer: string;
  expected: string;
  isCorrect: boolean;
};

const svgProps = {
  className: "h-6 w-6",
  fill: "none",
  stroke: "currentColor",
  viewBox: "0 0 24 24",
  strokeWidth: 1.5,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
};

const TYPE_OPTIONS: Array<{
  value: ExerciseType;
  label: string;
  icon: ReactNode;
  help: string;
}> = [
  {
    value: "single_choice",
    label: "Choix unique",
    icon: (
      <svg {...svgProps}>
        <circle cx="12" cy="12" r="9" />
        <circle cx="12" cy="12" r="4" fill="currentColor" stroke="none" />
      </svg>
    ),
    help: "Une bonne réponse parmi des options communes",
  },
  {
    value: "qcm",
    label: "QCM",
    icon: (
      <svg {...svgProps}>
        <rect x="3" y="3" width="18" height="18" rx="3" />
        <path d="M8 12l2.5 2.5L16 9" />
      </svg>
    ),
    help: "Chaque question a ses propres options",
  },
  {
    value: "multi_select",
    label: "Sélection multiple",
    icon: (
      <svg {...svgProps}>
        <rect x="2" y="2" width="13" height="13" rx="2.5" />
        <path d="M6 8.5l2 2L12 6" />
        <rect x="9" y="9" width="13" height="13" rx="2.5" />
        <path d="M13 15.5l2 2L19 13" />
      </svg>
    ),
    help: "Plusieurs propositions peuvent être correctes",
  },
  {
    value: "true_false",
    label: "Vrai / Faux",
    icon: (
      <svg {...svgProps}>
        <path d="M2 12l5 5L14 7" />
        <path d="M16 8l6 6M22 8l-6 6" />
      </svg>
    ),
    help: "Chaque question attend Vrai ou Faux",
  },
  {
    value: "free_text",
    label: "Rédaction",
    icon: (
      <svg {...svgProps}>
        <path d="M16.862 4.487l2.651 2.651M18.549 3.515a1.875 1.875 0 112.651 2.651L8.775 18.591l-4.2 1.05 1.05-4.2L18.549 3.515z" />
      </svg>
    ),
    help: "Réponse libre comparée à une réponse attendue",
  },
  {
    value: "labyrinth",
    label: "Labyrinthe",
    icon: (
      <svg {...svgProps}>
        <path d="M3 12h4l3-8 4 16 3-8h4" />
      </svg>
    ),
    help: "Parcours avec options à chaque étape",
  },
];

function letter(index: number) {
  return String.fromCharCode(65 + index);
}

function defaultQuestion(): DraftQuestion {
  return {
    text: "",
    options: ["Option A", "Option B"],
    answer: "",
    expected: "",
    isCorrect: false,
  };
}

/* ---------- Component ---------- */

export default function AdminExercisesClient({
  initialExercises,
}: {
  initialExercises: AdminExercise[];
}) {
  const [exercises, setExercises] = useState(initialExercises);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  const [number, setNumber] = useState("");
  const [title, setTitle] = useState("");
  const [type, setType] = useState<ExerciseType>("single_choice");
  const [isActive, setIsActive] = useState(true);
  const [instruction, setInstruction] = useState("");
  const [legend, setLegend] = useState("");
  const [scenario, setScenario] = useState("");
  const [globalOptions, setGlobalOptions] = useState<string[]>(["A", "B", "C"]);
  const [questions, setQuestions] = useState<DraftQuestion[]>([defaultQuestion()]);
  const [search, setSearch] = useState("");
  const [showContext, setShowContext] = useState(false);
  const [showForm, setShowForm] = useState(false);

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return exercises;
    return exercises.filter(
      (ex) =>
        ex.title.toLowerCase().includes(term) || String(ex.number).includes(term)
    );
  }, [exercises, search]);

  /* --- helpers --- */

  function resetForm() {
    setEditingId(null);
    setNumber("");
    setTitle("");
    setType("single_choice");
    setIsActive(true);
    setInstruction("");
    setLegend("");
    setScenario("");
    setGlobalOptions(["A", "B", "C"]);
    setQuestions([defaultQuestion()]);
    setShowContext(false);
  }

  function updateQuestion(index: number, patch: Partial<DraftQuestion>) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...patch } : q))
    );
  }

  function removeQuestion(index: number) {
    if (questions.length <= 1) return;
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function addQuestionOption(qIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qIndex
          ? { ...q, options: [...q.options, `Option ${letter(q.options.length)}`] }
          : q
      )
    );
  }

  function removeQuestionOption(qIndex: number, optIndex: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex || q.options.length <= 2) return q;
        const newOptions = q.options.filter((_, j) => j !== optIndex);
        let newAnswer = q.answer;
        if (q.answer.length === 1 && q.answer >= "A" && q.answer <= "Z") {
          const answerIdx = q.answer.charCodeAt(0) - 65;
          if (answerIdx === optIndex) newAnswer = "";
          else if (answerIdx > optIndex) newAnswer = letter(answerIdx - 1);
        }
        return { ...q, options: newOptions, answer: newAnswer };
      })
    );
  }

  function updateQuestionOption(qIndex: number, optIndex: number, value: string) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qIndex) return q;
        const newOptions = [...q.options];
        newOptions[optIndex] = value;
        return { ...q, options: newOptions };
      })
    );
  }

  /* global options (single_choice) */

  function addGlobalOption() {
    setGlobalOptions((prev) => [...prev, `Option ${prev.length + 1}`]);
  }

  function removeGlobalOption(index: number) {
    if (globalOptions.length <= 2) return;
    const removed = globalOptions[index];
    setGlobalOptions((prev) => prev.filter((_, i) => i !== index));
    setQuestions((prev) =>
      prev.map((q) => (q.answer === removed ? { ...q, answer: "" } : q))
    );
  }

  function updateGlobalOption(index: number, value: string) {
    const oldValue = globalOptions[index];
    setGlobalOptions((prev) => {
      const next = [...prev];
      next[index] = value;
      return next;
    });
    setQuestions((prev) =>
      prev.map((q) => (q.answer === oldValue ? { ...q, answer: value } : q))
    );
  }

  /* --- payload (same JSON output as before) --- */

  function buildPayload() {
    const normalizedQuestions = questions.map((q, i) => ({
      id: i + 1,
      text: q.text.trim() || `Question ${i + 1}`,
      options: q.options.map((o) => o.trim()).filter(Boolean),
      answer: q.answer.trim(),
      expected: q.expected.trim(),
      isCorrect: q.isCorrect,
    }));

    if (type === "single_choice") {
      const options = globalOptions.map((o) => o.trim()).filter(Boolean);
      const finalOptions = options.length >= 2 ? options : ["A", "B", "C"];
      const answers = Object.fromEntries(
        normalizedQuestions.map((q) => [
          String(q.id),
          finalOptions.includes(q.answer) ? q.answer : finalOptions[0],
        ])
      );
      return {
        content: {
          ...(instruction ? { instruction } : {}),
          ...(legend ? { legend } : {}),
          options: finalOptions,
          questions: normalizedQuestions.map((q) => ({ id: q.id, text: q.text })),
        },
        answers,
      };
    }

    if (type === "qcm" || type === "labyrinth") {
      const answers: Record<string, string> = {};
      const questionsWithOptions = normalizedQuestions.map((q) => {
        const opts =
          q.options.length > 0
            ? q.options.map((text, j) => ({ label: letter(j), text }))
            : [
                { label: "A", text: "Option A" },
                { label: "B", text: "Option B" },
              ];
        const labels = opts.map((o) => o.label);
        answers[String(q.id)] = labels.includes(q.answer) ? q.answer : labels[0];
        return { id: q.id, text: q.text, options: opts };
      });
      return {
        content: {
          ...(type === "labyrinth"
            ? { ...(scenario ? { scenario } : {}) }
            : {
                ...(instruction ? { instruction } : {}),
                ...(legend ? { legend } : {}),
              }),
          questions: questionsWithOptions,
        },
        answers,
      };
    }

    if (type === "true_false") {
      const answers = Object.fromEntries(
        normalizedQuestions.map((q) => [
          String(q.id),
          q.answer === "Faux" ? "Faux" : "Vrai",
        ])
      );
      return {
        content: {
          ...(instruction ? { instruction } : {}),
          ...(legend ? { legend } : {}),
          questions: normalizedQuestions.map((q) => ({ id: q.id, text: q.text })),
        },
        answers,
      };
    }

    if (type === "multi_select") {
      return {
        content: {
          ...(instruction ? { instruction } : {}),
          ...(legend ? { legend } : {}),
          questions: normalizedQuestions.map((q) => ({ id: q.id, text: q.text })),
        },
        answers: {
          correctIds: normalizedQuestions.filter((q) => q.isCorrect).map((q) => q.id),
        },
      };
    }

    /* free_text */
    return {
      content: {
        ...(instruction ? { instruction } : {}),
        ...(legend ? { legend } : {}),
        columns: { left: "Propos", right: "Reformulation" },
        questions: normalizedQuestions.map((q) => ({ id: q.id, text: q.text })),
      },
      answers: Object.fromEntries(
        normalizedQuestions.map((q) => [
          String(q.id),
          q.expected || "Reponse attendue",
        ])
      ),
    };
  }

  /* --- async actions --- */

  async function refresh() {
    const response = await fetch("/api/admin/exercises");
    const data = (await response.json()) as {
      exercises?: AdminExercise[];
      error?: string;
    };
    if (!response.ok || !data.exercises)
      throw new Error(data.error ?? "Chargement impossible.");
    setExercises(data.exercises);
  }

  async function save() {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const payload = buildPayload();
      const response = await fetch(
        editingId ? `/api/admin/exercises/${editingId}` : "/api/admin/exercises",
        {
          method: editingId ? "PATCH" : "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            number: Number(number),
            title,
            type,
            isActive,
            content: payload.content,
            answers: payload.answers,
          }),
        }
      );
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Enregistrement impossible.");
      await refresh();
      setSuccess(editingId ? "Exercice mis a jour." : "Exercice cree.");
      resetForm();
      setShowForm(false);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setLoading(false);
    }
  }

  function startEditing(exercise: AdminExercise) {
    setEditingId(exercise.id);
    setNumber(String(exercise.number));
    setTitle(exercise.title);
    setType(exercise.type);
    setIsActive(exercise.isActive);

    const parsed = parseExistingExercise(exercise.type, exercise.content, exercise.answers);
    setInstruction(parsed.instruction);
    setLegend(parsed.legend);
    setScenario(parsed.scenario);
    setGlobalOptions(parsed.globalOptions);
    setQuestions(parsed.questions);
    setShowContext(!!(parsed.instruction || parsed.legend || parsed.scenario));
    setShowForm(true);
  }

  async function duplicateExercise(exercise: AdminExercise) {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/exercises/${exercise.id}`, {
        method: "POST",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Duplication impossible.");
      await refresh();
      setSuccess("Exercice duplique.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setLoading(false);
    }
  }

  async function toggleVisibility(exercise: AdminExercise) {
    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/exercises/${exercise.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !exercise.isActive }),
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Mise a jour impossible.");
      await refresh();
      setSuccess(exercise.isActive ? "Exercice masque." : "Exercice reactive.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setLoading(false);
    }
  }

  async function deleteExercise(exercise: AdminExercise) {
    const confirmed = window.confirm(
      `Supprimer l'exercice #${exercise.number} - ${exercise.title} ? Cette action est irreversible.`
    );
    if (!confirmed) return;

    setError(null);
    setSuccess(null);
    setLoading(true);
    try {
      const response = await fetch(`/api/admin/exercises/${exercise.id}`, {
        method: "DELETE",
      });
      const data = (await response.json()) as { error?: string };
      if (!response.ok) throw new Error(data.error ?? "Suppression impossible.");
      await refresh();
      if (editingId === exercise.id) resetForm();
      setSuccess("Exercice supprime.");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur.");
    } finally {
      setLoading(false);
    }
  }

  /* ---------- Render ---------- */

  return (
    <div className="space-y-8">
      {/* ---- Messages (always visible) ---- */}
      {error && (
        <div className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}
      {success && (
        <div className="rounded-xl border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          {success}
        </div>
      )}

      {showForm ? (
        /* ================================================================
         *  FORM VIEW (create / edit)
         * ================================================================ */
        <>
          {/* ---- Header ---- */}
          <section className="rounded-2xl border border-foreground/8 bg-white p-6 shadow-sm">
            <button
              type="button"
              onClick={() => { resetForm(); setShowForm(false); }}
              className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-primary hover:underline"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M19 12H5M12 19l-7-7 7-7" />
              </svg>
              Retour à la liste
            </button>
            <h1 className="text-2xl font-bold">
              {editingId ? "Modifier l'exercice" : "Créer un exercice"}
            </h1>
            <p className="mt-1 text-sm text-foreground/60">
              Configurez le type, ajoutez les questions et définissez les réponses.
            </p>
          </section>

          {/* ---- Section 1 : Metadata ---- */}
          <section className="rounded-2xl border border-foreground/8 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/45">
              Métadonnées
            </h2>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium">
                  N&deg; de l&apos;exercice
                </label>
                <input
                  type="number"
                  value={number}
                  onChange={(e) => setNumber(e.target.value)}
                  placeholder="1"
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Titre</label>
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Titre de l'exercice"
                  className="mt-1 w-full rounded-lg border px-3 py-2"
                />
              </div>
            </div>

            {/* toggle actif */}
            <div className="mt-4 flex items-center gap-3">
              <button
                type="button"
                role="switch"
                aria-checked={isActive}
                onClick={() => setIsActive(!isActive)}
                className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors ${
                  isActive ? "bg-primary" : "bg-foreground/20"
                }`}
              >
                <span
                  className={`pointer-events-none inline-block h-5 w-5 rounded-full bg-white shadow ring-0 transition-transform ${
                    isActive ? "translate-x-5" : "translate-x-0"
                  }`}
                />
              </button>
              <span className="text-sm">
                {isActive ? "Actif" : "Masqué"}{" "}
                <span className="text-foreground/50">
                  {isActive
                    ? "(visible pour les apprenants)"
                    : "(non visible)"}
                </span>
              </span>
            </div>
          </section>

          {/* ---- Section 2 : Type selector ---- */}
          <section className="rounded-2xl border border-foreground/8 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/45">
              Type d&apos;exercice
            </h2>
            <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
              {TYPE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setType(opt.value)}
                  className={`flex flex-col items-center gap-2 rounded-xl border-2 p-4 text-center transition-all ${
                    type === opt.value
                      ? "border-primary bg-primary-pale shadow-sm"
                      : "border-foreground/10 hover:border-foreground/25"
                  }`}
                >
                  <span className="flex items-center justify-center">{opt.icon}</span>
                  <span className="text-sm font-medium">{opt.label}</span>
                  <span className="text-[11px] leading-tight text-foreground/50">
                    {opt.help}
                  </span>
                </button>
              ))}
            </div>
          </section>

          {/* ---- Section 3 : Context (collapsible) ---- */}
          <section className="rounded-2xl border border-foreground/8 bg-white shadow-sm">
            <button
              type="button"
              onClick={() => setShowContext(!showContext)}
              className="flex w-full items-center justify-between p-6"
            >
              <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/45">
                Contexte (optionnel)
              </h2>
              <span
                className={`text-foreground/40 transition-transform ${
                  showContext ? "rotate-180" : ""
                }`}
              >
                &#x25BC;
              </span>
            </button>

            {showContext && (
              <div className="border-t px-6 pb-6 pt-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-sm font-medium">Instruction</label>
                    <input
                      value={instruction}
                      onChange={(e) => setInstruction(e.target.value)}
                      placeholder="Consigne de l'exercice"
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium">Légende</label>
                    <input
                      value={legend}
                      onChange={(e) => setLegend(e.target.value)}
                      placeholder="Légende ou note"
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                  </div>
                </div>
                {type === "labyrinth" && (
                  <div className="mt-4">
                    <label className="text-sm font-medium">Scénario</label>
                    <textarea
                      value={scenario}
                      onChange={(e) => setScenario(e.target.value)}
                      rows={3}
                      placeholder="Décrivez le scénario du labyrinthe…"
                      className="mt-1 w-full rounded-lg border px-3 py-2"
                    />
                  </div>
                )}
              </div>
            )}
          </section>

          {/* ---- Section 4 : Question builder ---- */}
          <section className="rounded-2xl border border-foreground/8 bg-white p-6 shadow-sm">
            <h2 className="text-xs font-semibold uppercase tracking-wide text-foreground/45">
              Questions
            </h2>

            {/* Global options for single_choice */}
            {type === "single_choice" && (
              <div className="mt-4 rounded-xl border border-dashed border-foreground/20 p-4">
                <p className="text-sm font-medium">
                  Options de réponse (communes à toutes les questions)
                </p>
                <div className="mt-3 space-y-2">
                  {globalOptions.map((opt, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <span className="w-6 shrink-0 text-center text-sm font-medium text-foreground/50">
                        {letter(i)}
                      </span>
                      <input
                        value={opt}
                        onChange={(e) => updateGlobalOption(i, e.target.value)}
                        className="flex-1 rounded-lg border px-3 py-1.5 text-sm"
                        placeholder={`Option ${letter(i)}`}
                      />
                      {globalOptions.length > 2 && (
                        <button
                          type="button"
                          onClick={() => removeGlobalOption(i)}
                          className="flex h-7 w-7 items-center justify-center rounded-full text-lg text-foreground/40 hover:bg-red-50 hover:text-red-600"
                        >
                          &times;
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addGlobalOption}
                  className="mt-3 text-sm font-medium text-primary hover:underline"
                >
                  + Ajouter une option
                </button>
              </div>
            )}

            {/* Question cards */}
            <div className="mt-4 space-y-4">
              {questions.map((q, qi) => (
                <div
                  key={qi}
                  className="group relative rounded-xl border border-foreground/10 bg-foreground/[0.02] p-4 transition-shadow hover:shadow-sm"
                >
                  {/* header: number badge + delete */}
                  <div className="flex items-center justify-between">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-xs font-bold text-white">
                      {qi + 1}
                    </span>
                    {questions.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeQuestion(qi)}
                        className="flex h-7 w-7 items-center justify-center rounded-full text-lg text-foreground/30 transition-colors hover:bg-red-50 hover:text-red-600"
                        title="Supprimer cette question"
                      >
                        &times;
                      </button>
                    )}
                  </div>

                  {/* question text */}
                  <div className="mt-3">
                    <input
                      value={q.text}
                      onChange={(e) => updateQuestion(qi, { text: e.target.value })}
                      placeholder={
                        type === "multi_select"
                          ? `Proposition ${qi + 1}`
                          : `Texte de la question ${qi + 1}`
                      }
                      className="w-full rounded-lg border px-3 py-2"
                    />
                  </div>

                  {/* ---- single_choice : radio on global options ---- */}
                  {type === "single_choice" && (
                    <div className="mt-3">
                      <p className="mb-2 text-xs font-medium text-foreground/50">
                        Bonne réponse :
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {globalOptions.map((opt) => (
                          <label
                            key={opt}
                            className={`flex cursor-pointer items-center gap-1.5 rounded-lg border px-3 py-1.5 text-sm transition-colors ${
                              q.answer === opt
                                ? "border-primary bg-primary-pale font-medium text-primary"
                                : "border-foreground/15 hover:border-foreground/30"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`sc-answer-${qi}`}
                              value={opt}
                              checked={q.answer === opt}
                              onChange={() => updateQuestion(qi, { answer: opt })}
                              className="sr-only"
                            />
                            {opt}
                          </label>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* ---- qcm / labyrinth : per-question options + radio ---- */}
                  {(type === "qcm" || type === "labyrinth") && (
                    <div className="mt-3 space-y-2">
                      <p className="text-xs font-medium text-foreground/50">
                        Options (sélectionnez la bonne réponse) :
                      </p>
                      {q.options.map((opt, oi) => (
                        <div key={oi} className="flex items-center gap-2">
                          <label
                            className={`flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-full border-2 text-xs font-bold transition-colors ${
                              q.answer === letter(oi)
                                ? "border-primary bg-primary text-white"
                                : "border-foreground/20 text-foreground/40 hover:border-foreground/40"
                            }`}
                          >
                            <input
                              type="radio"
                              name={`qcm-answer-${qi}`}
                              value={letter(oi)}
                              checked={q.answer === letter(oi)}
                              onChange={() => updateQuestion(qi, { answer: letter(oi) })}
                              className="sr-only"
                            />
                            {letter(oi)}
                          </label>
                          <input
                            value={opt}
                            onChange={(e) => updateQuestionOption(qi, oi, e.target.value)}
                            placeholder={`Option ${letter(oi)}`}
                            className="flex-1 rounded-lg border px-3 py-1.5 text-sm"
                          />
                          {q.options.length > 2 && (
                            <button
                              type="button"
                              onClick={() => removeQuestionOption(qi, oi)}
                              className="flex h-7 w-7 items-center justify-center rounded-full text-lg text-foreground/30 hover:bg-red-50 hover:text-red-600"
                            >
                              &times;
                            </button>
                          )}
                        </div>
                      ))}
                      <button
                        type="button"
                        onClick={() => addQuestionOption(qi)}
                        className="text-sm font-medium text-primary hover:underline"
                      >
                        + Ajouter une option
                      </button>
                    </div>
                  )}

                  {/* ---- true_false : visual toggle buttons ---- */}
                  {type === "true_false" && (
                    <div className="mt-3 flex gap-2">
                      {(["Vrai", "Faux"] as const).map((val) => {
                        const selected = q.answer === val || (!q.answer && val === "Vrai");
                        return (
                          <button
                            key={val}
                            type="button"
                            onClick={() => updateQuestion(qi, { answer: val })}
                            className={`flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-colors ${
                              selected
                                ? val === "Vrai"
                                  ? "border-green-500 bg-green-50 text-green-700"
                                  : "border-red-400 bg-red-50 text-red-700"
                                : "border-foreground/15 text-foreground/50 hover:border-foreground/30"
                            }`}
                          >
                            {val}
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* ---- multi_select : checkbox "bonne réponse" ---- */}
                  {type === "multi_select" && (
                    <label
                      className={`mt-3 inline-flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                        q.isCorrect
                          ? "border-green-400 bg-green-50 text-green-700"
                          : "border-foreground/15 hover:border-foreground/30"
                      }`}
                    >
                      <input
                        type="checkbox"
                        checked={q.isCorrect}
                        onChange={(e) =>
                          updateQuestion(qi, { isCorrect: e.target.checked })
                        }
                        className="sr-only"
                      />
                      <span
                        className={`flex h-5 w-5 items-center justify-center rounded border-2 text-xs ${
                          q.isCorrect
                            ? "border-green-500 bg-green-500 text-white"
                            : "border-foreground/25"
                        }`}
                      >
                        {q.isCorrect && "✓"}
                      </span>
                      Bonne réponse
                    </label>
                  )}

                  {/* ---- free_text : expected answer textarea ---- */}
                  {type === "free_text" && (
                    <div className="mt-3">
                      <label className="text-xs font-medium text-foreground/50">
                        Réponse attendue
                      </label>
                      <textarea
                        value={q.expected}
                        onChange={(e) => updateQuestion(qi, { expected: e.target.value })}
                        rows={2}
                        placeholder="Saisissez la réponse attendue…"
                        className="mt-1 w-full rounded-lg border px-3 py-2 text-sm"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Add question button */}
            <button
              type="button"
              onClick={() => setQuestions((prev) => [...prev, defaultQuestion()])}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-foreground/15 py-3 text-sm font-medium text-foreground/50 transition-colors hover:border-primary hover:text-primary"
            >
              <span className="text-lg leading-none">+</span>
              {type === "multi_select" ? "Ajouter une proposition" : "Ajouter une question"}
            </button>
          </section>

          {/* ---- Save / Reset ---- */}
          <section className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={save}
              disabled={loading}
              className="rounded-xl bg-primary px-6 py-3 font-medium text-white shadow-sm transition-opacity disabled:opacity-50"
            >
              {loading
                ? "En cours…"
                : editingId
                  ? "Enregistrer les modifications"
                  : "Créer l'exercice"}
            </button>
            <button
              type="button"
              onClick={resetForm}
              className="rounded-xl border px-6 py-3 font-medium transition-colors hover:bg-foreground/5"
            >
              Réinitialiser
            </button>
          </section>
        </>
      ) : (
        /* ================================================================
         *  LIST VIEW (default)
         * ================================================================ */
        <>
          {/* ---- Header with create button ---- */}
          <section className="flex flex-col gap-4 rounded-2xl border border-foreground/8 bg-white p-6 shadow-sm sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold">Gestion des exercices</h1>
              <p className="mt-1 text-sm text-foreground/60">
                {exercises.length} exercice{exercises.length !== 1 ? "s" : ""} au total
              </p>
            </div>
            <button
              type="button"
              onClick={() => { resetForm(); setShowForm(true); }}
              className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 font-medium text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Créer un exercice
            </button>
          </section>

          {/* ---- Exercise list ---- */}
          <section className="rounded-2xl border border-foreground/8 bg-white p-6 shadow-sm">
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Recherche par titre ou numéro"
              className="w-full rounded-lg border px-3 py-2 sm:w-80"
            />
            <div className="mt-4 space-y-3">
              {filtered.map((exercise) => (
                <article
                  key={exercise.id}
                  className="flex flex-col gap-3 rounded-xl border p-4 sm:flex-row sm:items-center sm:justify-between"
                >
                  <div>
                    <p className="text-sm text-foreground/45">
                      #{exercise.number} &mdash;{" "}
                      {TYPE_OPTIONS.find((t) => t.value === exercise.type)?.label ??
                        exercise.type}
                    </p>
                    <h3 className="font-medium">{exercise.title}</h3>
                    <p className="text-xs text-foreground/45">
                      Statut :{" "}
                      <span
                        className={
                          exercise.isActive ? "text-green-600" : "text-foreground/40"
                        }
                      >
                        {exercise.isActive ? "actif" : "masqué"}
                      </span>
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <button
                      type="button"
                      onClick={() => startEditing(exercise)}
                      className="rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-foreground/5"
                    >
                      Modifier
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateExercise(exercise)}
                      className="rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-foreground/5"
                    >
                      Dupliquer
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleVisibility(exercise)}
                      className="rounded-lg border px-3 py-2 text-sm transition-colors hover:bg-foreground/5"
                    >
                      {exercise.isActive ? "Masquer" : "Réactiver"}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteExercise(exercise)}
                      className="rounded-lg border border-red-300 px-3 py-2 text-sm text-red-700 transition-colors hover:bg-red-50"
                    >
                      Supprimer
                    </button>
                  </div>
                </article>
              ))}
              {filtered.length === 0 && (
                <p className="text-sm text-foreground/45">
                  Aucun exercice correspondant.
                </p>
              )}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

/* ---------- Parse existing exercise data into draft format ---------- */

function parseExistingExercise(
  type: ExerciseType,
  content: unknown,
  answers: unknown
): {
  instruction: string;
  legend: string;
  scenario: string;
  globalOptions: string[];
  questions: DraftQuestion[];
} {
  const contentObj =
    content && typeof content === "object"
      ? (content as Record<string, unknown>)
      : {};
  const answersObj =
    answers && typeof answers === "object"
      ? (answers as Record<string, unknown>)
      : {};

  const rawQuestions = Array.isArray(contentObj.questions)
    ? contentObj.questions
    : [];

  const questions: DraftQuestion[] = rawQuestions
    .map((raw) => {
      if (!raw || typeof raw !== "object") return null;
      const id = (raw as { id?: unknown }).id;
      const text = (raw as { text?: unknown }).text;
      if (typeof id !== "number" || typeof text !== "string") return null;

      /* per-question options (qcm / labyrinth) */
      const rawOptions = Array.isArray((raw as { options?: unknown }).options)
        ? ((raw as { options: unknown[] }).options as unknown[])
        : [];
      const options = rawOptions
        .map((item) =>
          item &&
          typeof item === "object" &&
          typeof (item as { text?: unknown }).text === "string"
            ? (item as { text: string }).text
            : ""
        )
        .filter((item) => item.length > 0);

      const answer =
        typeof answersObj[String(id)] === "string"
          ? String(answersObj[String(id)])
          : "";

      return {
        text,
        options: options.length > 0 ? options : ["Option A", "Option B"],
        answer,
        expected: answer,
        isCorrect: false,
      };
    })
    .filter((item): item is DraftQuestion => !!item);

  if (questions.length === 0) questions.push(defaultQuestion());

  /* multi_select: mark correct propositions */
  if (type === "multi_select") {
    const correctIds = Array.isArray(
      (answersObj as { correctIds?: unknown }).correctIds
    )
      ? (
          (answersObj as { correctIds: unknown[] }).correctIds as unknown[]
        ).filter((id): id is number => typeof id === "number")
      : [];
    for (let i = 0; i < questions.length; i++) {
      questions[i].isCorrect = correctIds.includes(i + 1);
    }
    if (!questions.some((q) => q.isCorrect)) questions[0].isCorrect = true;
  }

  /* global options (single_choice) */
  const globalOptions = Array.isArray(contentObj.options)
    ? (contentObj.options as unknown[]).filter(
        (opt): opt is string => typeof opt === "string" && opt.trim().length > 0
      )
    : [];

  return {
    instruction:
      typeof contentObj.instruction === "string" ? contentObj.instruction : "",
    legend: typeof contentObj.legend === "string" ? contentObj.legend : "",
    scenario:
      typeof contentObj.scenario === "string" ? contentObj.scenario : "",
    globalOptions: globalOptions.length > 1 ? globalOptions : ["A", "B", "C"],
    questions,
  };
}
