"use client";

import { type ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";

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
  stats,
}: {
  initialExercises: AdminExercise[];
  stats: { total: number; active: number; inactive: number };
}) {
  const [exercises, setExercises] = useState(initialExercises);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [successVariant, setSuccessVariant] = useState<"green" | "red" | "orange" | "blue">("green");
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
  const [typeFilter, setTypeFilter] = useState<ExerciseType | "all">("all");
  const [page, setPage] = useState(1);
  const [showContext, setShowContext] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const successRef = useRef<HTMLDivElement>(null);
  const successTimerRef = useRef<ReturnType<typeof setTimeout>>(null);

  /* Auto-dismiss success after 6s and scroll to it */
  useEffect(() => {
    if (!success) return;
    successRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    if (successTimerRef.current) clearTimeout(successTimerRef.current);
    successTimerRef.current = setTimeout(() => setSuccess(null), 6000);
    return () => { if (successTimerRef.current) clearTimeout(successTimerRef.current); };
  }, [success]);

  const PER_PAGE = 10;

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    let result = exercises;
    if (term) {
      result = result.filter(
        (ex) =>
          ex.title.toLowerCase().includes(term) ||
          String(ex.number).includes(term) ||
          ex.type.toLowerCase().includes(term)
      );
    }
    if (typeFilter !== "all") {
      result = result.filter((ex) => ex.type === typeFilter);
    }
    return result;
  }, [exercises, search, typeFilter]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PER_PAGE));
  const paginated = filtered.slice((page - 1) * PER_PAGE, page * PER_PAGE);

  const resetFilters = useCallback(() => {
    setSearch("");
    setTypeFilter("all");
    setPage(1);
  }, []);

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
      const label = title.trim() ? `« ${title.trim()} »` : `#${number}`;
      setSuccessVariant("green");
      setSuccess(
        editingId
          ? `Exercice ${label} mis à jour avec succès !`
          : `Nouvel exercice ${label} créé avec succès !`
      );
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
      setSuccessVariant("blue");
      setSuccess(`Exercice #${exercise.number} « ${exercise.title} » dupliqué avec succès !`);
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
      setSuccessVariant(exercise.isActive ? "orange" : "green");
      setSuccess(exercise.isActive ? `Exercice « ${exercise.title} » masqué.` : `Exercice « ${exercise.title} » réactivé !`);
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
      setSuccessVariant("red");
      setSuccess(`Exercice #${exercise.number} « ${exercise.title} » supprimé.`);
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
      {success && (() => {
        const v = successVariant;
        const borderClass = v === "red" ? "border-red-300 bg-gradient-to-r from-red-50 to-rose-50"
          : v === "orange" ? "border-amber-300 bg-gradient-to-r from-amber-50 to-orange-50"
          : v === "blue" ? "border-blue-300 bg-gradient-to-r from-blue-50 to-indigo-50"
          : "border-green-300 bg-gradient-to-r from-green-50 to-emerald-50";
        const iconBg = v === "red" ? "bg-red-500" : v === "orange" ? "bg-amber-500" : v === "blue" ? "bg-blue-500" : "bg-green-500";
        const textMain = v === "red" ? "text-red-800" : v === "orange" ? "text-amber-800" : v === "blue" ? "text-blue-800" : "text-green-800";
        const textSub = v === "red" ? "text-red-600" : v === "orange" ? "text-amber-600" : v === "blue" ? "text-blue-600" : "text-green-600";
        const btnClass = v === "red" ? "text-red-400 hover:bg-red-100 hover:text-red-600"
          : v === "orange" ? "text-amber-400 hover:bg-amber-100 hover:text-amber-600"
          : v === "blue" ? "text-blue-400 hover:bg-blue-100 hover:text-blue-600"
          : "text-green-400 hover:bg-green-100 hover:text-green-600";
        const subtitle = v === "red"
          ? "L'exercice a été définitivement supprimé."
          : v === "orange"
            ? "L'exercice n'est plus visible pour les apprenants."
            : v === "blue"
              ? "Une copie identique a été ajoutée à la liste."
              : "Les modifications sont enregistrées et disponibles immédiatement.";
        return (
          <div
            ref={successRef}
            className={`animate-[slideDown_0.35s_ease-out] rounded-2xl border-2 px-6 py-5 shadow-lg ${borderClass}`}
          >
            <div className="flex items-center gap-4">
              <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-full text-white shadow-sm ${iconBg}`}>
                {v === "red" ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21A48.108 48.108 0 0015.75 5.79m-12 .562a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                  </svg>
                ) : v === "orange" ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                  </svg>
                ) : v === "blue" ? (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m0 0a2.625 2.625 0 115.25 0H15" />
                  </svg>
                ) : (
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
                    <path d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1">
                <p className={`text-base font-bold ${textMain}`}>{success}</p>
                <p className={`mt-0.5 text-sm ${textSub}`}>{subtitle}</p>
              </div>
              <button
                type="button"
                onClick={() => setSuccess(null)}
                className={`shrink-0 rounded-lg p-1.5 transition-colors ${btnClass}`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          </div>
        );
      })()}

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
          {/* ---- Header ---- */}
          <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Gestion des exercices</h1>
              <p className="mt-1 text-sm text-slate-500">
                Gérez et organisez vos {exercises.length} exercice{exercises.length !== 1 ? "s" : ""} pédagogiques
              </p>
            </div>
            <button
              type="button"
              onClick={() => { resetForm(); setShowForm(true); }}
              className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-5 py-2.5 text-sm font-medium text-white shadow-sm transition-opacity hover:opacity-90"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 5v14M5 12h14" />
              </svg>
              Créer un exercice
            </button>
          </div>

          {/* ---- Stats cards ---- */}
          {(() => {
            const total = exercises.length;
            const active = exercises.filter((e) => e.isActive).length;
            const inactive = total - active;
            return (
              <div className="grid grid-cols-3 gap-4">
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Total</p>
                  <p className="mt-1 text-2xl font-bold text-slate-900">{total}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-green-500">Actifs</p>
                  <p className="mt-1 text-2xl font-bold text-green-600">{active}</p>
                </div>
                <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Masqués</p>
                  <p className="mt-1 text-2xl font-bold text-slate-400">{inactive}</p>
                </div>
              </div>
            );
          })()}

          {/* ---- Filter bar ---- */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="relative flex-1 sm:max-w-md">
              <svg className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input
                value={search}
                onChange={(e) => { setSearch(e.target.value); setPage(1); }}
                placeholder="Rechercher par ID, titre, type..."
                className="w-full rounded-full border border-slate-200 bg-white py-2 pl-9 pr-4 text-sm outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
            <div className="flex flex-wrap items-center gap-2">
              {([
                { value: "all" as const, label: "Tous" },
                { value: "single_choice" as const, label: "Choix unique" },
                { value: "qcm" as const, label: "QCM" },
                { value: "multi_select" as const, label: "Sélection multiple" },
                { value: "true_false" as const, label: "Vrai / Faux" },
                { value: "free_text" as const, label: "Rédac" },
                { value: "labyrinth" as const, label: "Labyrinthe" },
              ] as const).map((f) => (
                <button
                  key={f.value}
                  type="button"
                  onClick={() => { setTypeFilter(f.value); setPage(1); }}
                  className={`rounded-full border px-4 py-1.5 text-xs font-medium transition-colors ${
                    typeFilter === f.value
                      ? "border-primary bg-primary text-white"
                      : "border-slate-200 bg-white text-slate-600 hover:border-slate-300"
                  }`}
                >
                  {f.label}
                </button>
              ))}
              {typeFilter !== "all" && (
                <button
                  type="button"
                  onClick={resetFilters}
                  className="text-xs text-slate-400 hover:text-slate-600"
                >
                  Effacer
                </button>
              )}
            </div>
          </div>

          {/* ---- Exercise cards ---- */}
          <div className="space-y-4">
            {paginated.map((exercise) => {
              const typeLabel = TYPE_OPTIONS.find((t) => t.value === exercise.type)?.label ?? exercise.type;
              const description = getExerciseDescription(exercise.content);
              return (
                <article
                  key={exercise.id}
                  className={`flex items-center gap-5 rounded-2xl border bg-white p-5 transition-shadow hover:shadow-sm ${
                    !exercise.isActive ? "opacity-50" : ""
                  }`}
                >
                  {/* ID Badge */}
                  <div className="hidden shrink-0 sm:block">
                    <div className={`flex h-16 w-16 flex-col items-center justify-center rounded-xl ${
                      exercise.isActive ? "bg-primary-pale text-primary" : "bg-slate-100 text-slate-400"
                    }`}>
                      <span className="text-[9px] font-semibold uppercase tracking-wider opacity-60">ID</span>
                      <span className="text-lg font-bold leading-tight">
                        {String(exercise.number).padStart(3, "0")}
                      </span>
                    </div>
                  </div>

                  {/* Content */}
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase ${
                        exercise.isActive
                          ? "bg-green-100 text-green-700"
                          : "bg-slate-100 text-slate-500"
                      }`}>
                        <span className={`inline-block h-1.5 w-1.5 rounded-full ${
                          exercise.isActive ? "bg-green-500" : "bg-slate-400"
                        }`} />
                        {exercise.isActive ? "Actif" : "Masqué"}
                      </span>
                      <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">
                        Type: {typeLabel}
                      </span>
                    </div>
                    <h3 className="mt-1 font-semibold text-slate-900">{exercise.title}</h3>
                    {description && (
                      <p className="mt-0.5 truncate text-sm text-slate-500">{description}</p>
                    )}
                  </div>

                  {/* Action icons */}
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      type="button"
                      onClick={() => startEditing(exercise)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      title="Modifier"
                    >
                      <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M16.862 4.487l2.651 2.651M18.549 3.515a1.875 1.875 0 112.651 2.651L8.775 18.591l-4.2 1.05 1.05-4.2L18.549 3.515z" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => duplicateExercise(exercise)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      title="Dupliquer"
                    >
                      <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M15.75 17.25v3.375c0 .621-.504 1.125-1.125 1.125h-9.75a1.125 1.125 0 01-1.125-1.125V7.875c0-.621.504-1.125 1.125-1.125H6.75a9.06 9.06 0 011.5.124m7.5 10.376h3.375c.621 0 1.125-.504 1.125-1.125V11.25c0-4.46-3.243-8.161-7.5-8.876a9.06 9.06 0 00-1.5-.124H9.375c-.621 0-1.125.504-1.125 1.125v3.5m7.5 10.375H9.375a1.125 1.125 0 01-1.125-1.125v-9.25m0 0a2.625 2.625 0 115.25 0H15" />
                      </svg>
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleVisibility(exercise)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700"
                      title={exercise.isActive ? "Masquer" : "Réactiver"}
                    >
                      {exercise.isActive ? (
                        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88" />
                        </svg>
                      ) : (
                        <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                          <path d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z" />
                          <path d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        </svg>
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={() => deleteExercise(exercise)}
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-300 transition-colors hover:bg-red-50 hover:text-red-500"
                      title="Supprimer"
                    >
                      <svg className="h-[18px] w-[18px]" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5} strokeLinecap="round" strokeLinejoin="round">
                        <path d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                      </svg>
                    </button>
                  </div>
                </article>
              );
            })}
            {filtered.length === 0 && (
              <p className="py-12 text-center text-sm text-slate-400">
                Aucun exercice correspondant.
              </p>
            )}
          </div>

          {/* ---- Pagination ---- */}
          {filtered.length > PER_PAGE && (
            <div className="flex flex-col items-center justify-between gap-3 sm:flex-row">
              <p className="text-sm text-slate-500">
                Affichage de {(page - 1) * PER_PAGE + 1}-{Math.min(page * PER_PAGE, filtered.length)} sur {filtered.length} exercices
              </p>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  disabled={page <= 1}
                  onClick={() => setPage(page - 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border text-sm text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-30"
                >
                  &lsaquo;
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setPage(p)}
                    className={`flex h-8 w-8 items-center justify-center rounded-lg border text-sm font-medium transition-colors ${
                      page === p
                        ? "border-primary bg-white text-primary"
                        : "text-slate-500 hover:bg-slate-50"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  type="button"
                  disabled={page >= totalPages}
                  onClick={() => setPage(page + 1)}
                  className="flex h-8 w-8 items-center justify-center rounded-lg border text-sm text-slate-500 transition-colors hover:bg-slate-50 disabled:opacity-30"
                >
                  &rsaquo;
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

/* ---------- Extract exercise description from content ---------- */

function getExerciseDescription(content: unknown): string | null {
  if (!content || typeof content !== "object") return null;
  const obj = content as Record<string, unknown>;
  if (typeof obj.instruction === "string" && obj.instruction.trim()) {
    return obj.instruction;
  }
  if (typeof obj.legend === "string" && obj.legend.trim()) {
    return obj.legend;
  }
  if (typeof obj.scenario === "string" && obj.scenario.trim()) {
    return obj.scenario;
  }
  // Fallback: show first question text
  if (Array.isArray(obj.questions) && obj.questions.length > 0) {
    const first = obj.questions[0];
    if (first && typeof first === "object" && typeof (first as { text?: unknown }).text === "string") {
      return (first as { text: string }).text;
    }
  }
  return null;
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
