import { z } from "zod";

export const progressSchema = z.object({
  exerciseId: z.string().uuid(),
  userAnswers: z.record(z.string(), z.string()).default({}),
  completed: z.boolean().optional(),
});

interface ExerciseRecord {
  answers: unknown;
}

interface ExistingProgress {
  completed: boolean;
}

interface ProgressDeps {
  findExercise: (exerciseId: string) => Promise<ExerciseRecord | null>;
  findExistingProgress: (
    userId: string,
    exerciseId: string
  ) => Promise<ExistingProgress | null>;
  saveProgress: (
    userId: string,
    exerciseId: string,
    userAnswers: Record<string, string>,
    completed: boolean
  ) => Promise<void>;
  revalidateExercises: () => void;
}

interface ApiResult {
  status: number;
  body: Record<string, unknown>;
}

export async function handleProgressUpdate(
  body: unknown,
  userId: string,
  deps: ProgressDeps
): Promise<ApiResult> {
  const parsed = progressSchema.safeParse(body);
  if (!parsed.success) {
    return { status: 400, body: { error: "Données invalides." } };
  }

  const { exerciseId, userAnswers } = parsed.data;
  const completed = parsed.data.completed ?? false;

  try {
    const exercise = await deps.findExercise(exerciseId);
    if (!exercise) {
      return { status: 404, body: { error: "Exercice introuvable." } };
    }

    const existingProgress = completed
      ? null
      : await deps.findExistingProgress(userId, exerciseId);

    const finalCompleted = completed || (existingProgress?.completed ?? false);

    await deps.saveProgress(userId, exerciseId, userAnswers, finalCompleted);
    deps.revalidateExercises();

    if (completed) {
      return { status: 200, body: { success: true, answers: exercise.answers } };
    }
    return { status: 200, body: { success: true } };
  } catch {
    return { status: 500, body: { error: "Erreur serveur lors de la sauvegarde." } };
  }
}
