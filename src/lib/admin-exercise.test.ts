import assert from "node:assert/strict";
import test from "node:test";
import { parseCreateExercisePayload, parseUpdateExercisePayload } from "./admin-exercise";

test("parseCreateExercisePayload accepts valid single_choice payload", () => {
  const payload = parseCreateExercisePayload({
    number: 999,
    title: "Test single",
    type: "single_choice",
    isActive: true,
    content: {
      instruction: "Choisissez",
      options: ["A", "B"],
      questions: [{ id: 1, text: "Q1" }],
    },
    answers: { "1": "A" },
  });

  assert.equal(payload.number, 999);
  assert.equal(payload.type, "single_choice");
});

test("parseCreateExercisePayload rejects invalid true_false answer", () => {
  assert.throws(() =>
    parseCreateExercisePayload({
      number: 1000,
      title: "Test tf",
      type: "true_false",
      content: {
        questions: [{ id: 1, text: "Q1" }],
      },
      answers: { "1": "Maybe" },
    })
  );
});

test("parseUpdateExercisePayload allows visibility only update", () => {
  const payload = parseUpdateExercisePayload(
    { isActive: false },
    {
      type: "single_choice",
      content: {
        options: ["A", "B"],
        questions: [{ id: 1, text: "Q1" }],
      },
      answers: { "1": "A" },
    }
  );

  assert.equal(payload.isActive, false);
  assert.equal(payload.content, undefined);
  assert.equal(payload.answers, undefined);
});
