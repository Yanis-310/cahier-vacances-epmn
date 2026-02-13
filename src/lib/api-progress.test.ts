import assert from "node:assert/strict";
import test from "node:test";
import { handleProgressUpdate } from "./api-progress";

test("handleProgressUpdate returns 400 for invalid payload", async () => {
  const result = await handleProgressUpdate(
    { exerciseId: "bad-id", userAnswers: {} },
    "u1",
    {
      findExercise: async () => null,
      findExistingProgress: async () => null,
      saveProgress: async () => undefined,
      revalidateExercises: () => undefined,
    }
  );

  assert.equal(result.status, 400);
  assert.equal(result.body.error, "Données invalides.");
});

test("handleProgressUpdate returns 404 when exercise does not exist", async () => {
  const result = await handleProgressUpdate(
    {
      exerciseId: "123e4567-e89b-42d3-a456-426614174000",
      userAnswers: {},
      completed: false,
    },
    "u1",
    {
      findExercise: async () => null,
      findExistingProgress: async () => null,
      saveProgress: async () => undefined,
      revalidateExercises: () => undefined,
    }
  );

  assert.equal(result.status, 404);
  assert.equal(result.body.error, "Exercice introuvable.");
});

test("handleProgressUpdate does not regress completed=true back to false", async () => {
  let saved:
    | {
        userId: string;
        exerciseId: string;
        userAnswers: Record<string, string>;
        completed: boolean;
      }
    | undefined;
  let revalidated = false;

  const result = await handleProgressUpdate(
    {
      exerciseId: "123e4567-e89b-42d3-a456-426614174000",
      userAnswers: { "1": "A" },
      completed: false,
    },
    "u1",
    {
      findExercise: async () => ({ answers: { "1": "A" } }),
      findExistingProgress: async () => ({ completed: true }),
      saveProgress: async (userId, exerciseId, userAnswers, completed) => {
        saved = { userId, exerciseId, userAnswers, completed };
      },
      revalidateExercises: () => {
        revalidated = true;
      },
    }
  );

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { success: true });
  assert.equal(revalidated, true);
  assert.deepEqual(saved, {
    userId: "u1",
    exerciseId: "123e4567-e89b-42d3-a456-426614174000",
    userAnswers: { "1": "A" },
    completed: true,
  });
});

test("handleProgressUpdate returns answers when completed is true", async () => {
  const result = await handleProgressUpdate(
    {
      exerciseId: "123e4567-e89b-42d3-a456-426614174000",
      userAnswers: { "1": "A" },
      completed: true,
    },
    "u1",
    {
      findExercise: async () => ({ answers: { "1": "A" } }),
      findExistingProgress: async () => null,
      saveProgress: async () => undefined,
      revalidateExercises: () => undefined,
    }
  );

  assert.equal(result.status, 200);
  assert.deepEqual(result.body, { success: true, answers: { "1": "A" } });
});
