"use client";

import { useMemo, useState } from "react";

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
  id: number;
  text: string;
  optionsCsv: string;
  answer: string;
  expected: string;
  isCorrect: boolean;
};

const TYPE_OPTIONS: Array<{ value: ExerciseType; label: string; help: string }> = [
  { value: "single_choice", label: "Choix unique", help: "Une reponse correcte parmi des options communes." },
  { value: "qcm", label: "QCM", help: "Chaque question a ses options A/B/C/..." },
  { value: "multi_select", label: "Selection multiple", help: "Plusieurs propositions peuvent etre correctes." },
  { value: "true_false", label: "Vrai/Faux", help: "Chaque question attend Vrai ou Faux." },
  { value: "free_text", label: "Redaction", help: "Reponse libre comparee a une reponse attendue." },
  { value: "labyrinth", label: "Labyrinthe", help: "Parcours avec options a chaque etape." },
];

function findTypeHelp(type: ExerciseType) {
  return TYPE_OPTIONS.find((option) => option.value === type)?.help ?? "";
}

function defaultQuestion(id = 1): DraftQuestion {
  return {
    id,
    text: `Question ${id}`,
    optionsCsv: "Option A, Option B",
    answer: "",
    expected: "",
    isCorrect: id === 1,
  };
}

function letter(index: number) {
  return String.fromCharCode(65 + index);
}

function parseCsv(value: string) {
  const items = value.split(",").map((item) => item.trim()).filter(Boolean);
  return items.length > 0 ? items : ["Option A", "Option B"];
}

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
  const [globalOptionsCsv, setGlobalOptionsCsv] = useState("A, B, C");
  const [questions, setQuestions] = useState<DraftQuestion[]>([defaultQuestion(1)]);
  const [search, setSearch] = useState("");

  const filtered = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return exercises;
    return exercises.filter(
      (exercise) =>
        exercise.title.toLowerCase().includes(term) ||
        String(exercise.number).includes(term)
    );
  }, [exercises, search]);

  function resetForm() {
    setEditingId(null);
    setNumber("");
    setTitle("");
    setType("single_choice");
    setIsActive(true);
    setInstruction("");
    setLegend("");
    setScenario("");
    setGlobalOptionsCsv("A, B, C");
    setQuestions([defaultQuestion(1)]);
  }

  function setQuestion(index: number, patch: Partial<DraftQuestion>) {
    setQuestions((prev) =>
      prev.map((question, i) => (i === index ? { ...question, ...patch } : question))
    );
  }

  function buildPayload() {
    const normalizedQuestions = questions.map((question, i) => ({
      id: question.id > 0 ? question.id : i + 1,
      text: question.text.trim() || `Question ${i + 1}`,
      options: parseCsv(question.optionsCsv),
      answer: question.answer.trim(),
      expected: question.expected.trim(),
      isCorrect: question.isCorrect,
    }));

    if (type === "single_choice") {
      const options = parseCsv(globalOptionsCsv);
      const answers = Object.fromEntries(
        normalizedQuestions.map((q) => [String(q.id), options.includes(q.answer) ? q.answer : options[0]])
      );
      return {
        content: {
          ...(instruction ? { instruction } : {}),
          ...(legend ? { legend } : {}),
          options,
          questions: normalizedQuestions.map((q) => ({ id: q.id, text: q.text })),
        },
        answers,
      };
    }

    if (type === "qcm" || type === "labyrinth") {
      const answers: Record<string, string> = {};
      const questionsWithOptions = normalizedQuestions.map((q) => {
        const opts = q.options.map((text, i) => ({ label: letter(i), text }));
        const labels = opts.map((o) => o.label);
        answers[String(q.id)] = labels.includes(q.answer) ? q.answer : labels[0];
        return { id: q.id, text: q.text, options: opts };
      });
      return {
        content: {
          ...(type === "labyrinth"
            ? { ...(scenario ? { scenario } : {}) }
            : { ...(instruction ? { instruction } : {}), ...(legend ? { legend } : {}) }),
          questions: questionsWithOptions,
        },
        answers,
      };
    }

    if (type === "true_false") {
      const answers = Object.fromEntries(
        normalizedQuestions.map((q) => [String(q.id), q.answer === "Faux" ? "Faux" : "Vrai"])
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

    return {
      content: {
        ...(instruction ? { instruction } : {}),
        ...(legend ? { legend } : {}),
        columns: { left: "Propos", right: "Reformulation" },
        questions: normalizedQuestions.map((q) => ({ id: q.id, text: q.text })),
      },
      answers: Object.fromEntries(
        normalizedQuestions.map((q) => [String(q.id), q.expected || "Reponse attendue"])
      ),
    };
  }

  async function refresh() {
    const response = await fetch("/api/admin/exercises");
    const data = (await response.json()) as { exercises?: AdminExercise[]; error?: string };
    if (!response.ok || !data.exercises) throw new Error(data.error ?? "Chargement impossible.");
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
    setGlobalOptionsCsv(parsed.globalOptions.join(", "));
    setQuestions(parsed.questions);
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

  return (
    <div className="space-y-8">
      <section className="rounded-2xl border border-foreground/8 bg-white p-6 shadow-sm">
        <h1 className="text-2xl font-bold">Assistant creation d&apos;exercice</h1>
        <p className="mt-2 text-sm text-foreground/60">
          1. Choisissez le type. 2. Ajoutez les questions. 3. Definissez les reponses. 4. Enregistrez.
        </p>
      </section>

      <section className="rounded-2xl border border-foreground/8 bg-white p-6 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-2">
          <input value={number} onChange={(e) => setNumber(e.target.value)} placeholder="1) Numero" className="rounded border px-3 py-2" />
          <select value={type} onChange={(e) => setType(e.target.value as ExerciseType)} className="rounded border px-3 py-2">
            {TYPE_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </div>
        <input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="2) Titre de l'exercice" className="mt-3 w-full rounded border px-3 py-2" />
        <p className="mt-2 text-xs text-foreground/50">{findTypeHelp(type)}</p>
        <label className="mt-2 inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} /> Actif (visible pour les apprenants)</label>

        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input value={instruction} onChange={(e) => setInstruction(e.target.value)} placeholder="Instruction (optionnel)" className="rounded border px-3 py-2" />
          <input value={legend} onChange={(e) => setLegend(e.target.value)} placeholder="Legende (optionnel)" className="rounded border px-3 py-2" />
        </div>
        {type === "labyrinth" && <textarea value={scenario} onChange={(e) => setScenario(e.target.value)} rows={2} placeholder="Scenario" className="mt-3 w-full rounded border px-3 py-2" />}
        {type === "single_choice" && <input value={globalOptionsCsv} onChange={(e) => setGlobalOptionsCsv(e.target.value)} placeholder="Options communes: A, B, C" className="mt-3 w-full rounded border px-3 py-2" />}

        <div className="mt-4 space-y-3">
          {questions.map((q, i) => (
            <div key={`${q.id}-${i}`} className="rounded border p-3">
              <div className="grid gap-2 sm:grid-cols-[90px_1fr]">
                <input type="number" value={q.id} onChange={(e) => setQuestion(i, { id: Number(e.target.value) || q.id })} className="rounded border px-2 py-2" />
                <input value={q.text} onChange={(e) => setQuestion(i, { text: e.target.value })} placeholder={`Question ${i + 1}`} className="rounded border px-3 py-2" />
              </div>
              {(type === "qcm" || type === "labyrinth") && (
                <input value={q.optionsCsv} onChange={(e) => setQuestion(i, { optionsCsv: e.target.value })} placeholder="Options: Option A, Option B, Option C" className="mt-2 w-full rounded border px-3 py-2" />
              )}
              {(type === "single_choice" || type === "qcm" || type === "labyrinth") && (
                <input value={q.answer} onChange={(e) => setQuestion(i, { answer: e.target.value })} placeholder={type === "single_choice" ? "Bonne reponse (ex: A)" : "Bonne reponse (label: A/B/C)"} className="mt-2 w-full rounded border px-3 py-2" />
              )}
              {type === "true_false" && (
                <select value={q.answer || "Vrai"} onChange={(e) => setQuestion(i, { answer: e.target.value })} className="mt-2 w-full rounded border px-3 py-2">
                  <option value="Vrai">Vrai</option>
                  <option value="Faux">Faux</option>
                </select>
              )}
              {type === "free_text" && (
                <textarea value={q.expected} onChange={(e) => setQuestion(i, { expected: e.target.value })} rows={2} placeholder="Reponse attendue" className="mt-2 w-full rounded border px-3 py-2" />
              )}
              {type === "multi_select" && (
                <label className="mt-2 inline-flex items-center gap-2 text-sm"><input type="checkbox" checked={q.isCorrect} onChange={(e) => setQuestion(i, { isCorrect: e.target.checked })} /> Proposition correcte</label>
              )}
            </div>
          ))}
          <div className="flex gap-2">
            <button type="button" onClick={() => setQuestions((prev) => [...prev, defaultQuestion(prev.length + 1)])} className="rounded border px-3 py-2 text-sm">Ajouter question</button>
            <button type="button" onClick={() => setQuestions((prev) => (prev.length > 1 ? prev.slice(0, -1) : prev))} className="rounded border px-3 py-2 text-sm">Retirer derniere</button>
          </div>
        </div>

        <div className="mt-4 flex gap-2">
          <button type="button" onClick={save} disabled={loading} className="rounded bg-primary px-4 py-2 text-white disabled:opacity-50">{loading ? "En cours..." : editingId ? "Enregistrer" : "Creer exercice"}</button>
          <button type="button" onClick={resetForm} className="rounded border px-4 py-2">Reinitialiser</button>
        </div>
        {error && <p className="mt-2 text-sm text-error">{error}</p>}
        {success && <p className="mt-2 text-sm text-success">{success}</p>}
      </section>

      <section className="rounded-2xl border border-foreground/8 bg-white p-6 shadow-sm">
        <h2 className="text-lg font-semibold">Exercices existants</h2>
        <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Recherche par titre ou numero" className="mt-3 w-full rounded border px-3 py-2 sm:w-80" />
        <div className="mt-4 space-y-3">
          {filtered.map((exercise) => (
            <article key={exercise.id} className="flex flex-col gap-3 rounded border p-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-foreground/45">#{exercise.number} - {exercise.type}</p>
                <h3 className="font-medium">{exercise.title}</h3>
                <p className="text-xs text-foreground/45">Statut: {exercise.isActive ? "actif" : "masque"}</p>
              </div>
              <div className="flex flex-wrap gap-2">
                <button type="button" onClick={() => startEditing(exercise)} className="rounded border px-3 py-2 text-sm">Modifier</button>
                <button type="button" onClick={() => duplicateExercise(exercise)} className="rounded border px-3 py-2 text-sm">Dupliquer</button>
                <button type="button" onClick={() => toggleVisibility(exercise)} className="rounded border px-3 py-2 text-sm">{exercise.isActive ? "Masquer" : "Reactiver"}</button>
              </div>
            </article>
          ))}
          {filtered.length === 0 && <p className="text-sm text-foreground/45">Aucun exercice correspondant.</p>}
        </div>
      </section>
    </div>
  );
}

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
    content && typeof content === "object" ? (content as Record<string, unknown>) : {};
  const answersObj =
    answers && typeof answers === "object" ? (answers as Record<string, unknown>) : {};

  const rawQuestions = Array.isArray(contentObj.questions) ? contentObj.questions : [];
  const questions: DraftQuestion[] = rawQuestions
    .map((raw) => {
      if (!raw || typeof raw !== "object") return null;
      const id = (raw as { id?: unknown }).id;
      const text = (raw as { text?: unknown }).text;
      if (typeof id !== "number" || typeof text !== "string") return null;

      const rawOptions = Array.isArray((raw as { options?: unknown }).options)
        ? ((raw as { options: unknown[] }).options as unknown[])
        : [];
      const options = rawOptions
        .map((item) =>
          item && typeof item === "object" && typeof (item as { text?: unknown }).text === "string"
            ? (item as { text: string }).text
            : ""
        )
        .filter((item) => item.length > 0);

      const answer =
        typeof answersObj[String(id)] === "string" ? String(answersObj[String(id)]) : "";
      return {
        id,
        text,
        optionsCsv: options.length > 0 ? options.join(", ") : "Option A, Option B",
        answer,
        expected: answer,
        isCorrect: false,
      };
    })
    .filter((item): item is DraftQuestion => !!item);

  if (questions.length === 0) questions.push(defaultQuestion(1));

  if (type === "multi_select") {
    const correctIds = Array.isArray((answersObj as { correctIds?: unknown }).correctIds)
      ? ((answersObj as { correctIds: unknown[] }).correctIds as unknown[]).filter(
          (id): id is number => typeof id === "number"
        )
      : [];
    for (const q of questions) q.isCorrect = correctIds.includes(q.id);
    if (!questions.some((q) => q.isCorrect)) questions[0].isCorrect = true;
  }

  const globalOptions = Array.isArray(contentObj.options)
    ? (contentObj.options as unknown[]).filter(
        (opt): opt is string => typeof opt === "string" && opt.trim().length > 0
      )
    : [];

  return {
    instruction: typeof contentObj.instruction === "string" ? contentObj.instruction : "",
    legend: typeof contentObj.legend === "string" ? contentObj.legend : "",
    scenario: typeof contentObj.scenario === "string" ? contentObj.scenario : "",
    globalOptions: globalOptions.length > 1 ? globalOptions : ["A", "B", "C"],
    questions,
  };
}
