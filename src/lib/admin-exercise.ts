import { ExerciseType } from "@prisma/client";
import { z } from "zod";

const questionSchema = z.object({
  id: z.number().int().positive(),
  text: z.string().min(1),
});

const qcmOptionSchema = z.object({
  label: z.string().min(1),
  text: z.string().min(1),
});

const qcmQuestionSchema = questionSchema.extend({
  options: z.array(qcmOptionSchema).min(2),
});

const basePayloadSchema = z.object({
  number: z.number().int().positive(),
  title: z.string().min(3),
  type: z.nativeEnum(ExerciseType),
  isActive: z.boolean().optional().default(true),
  content: z.unknown(),
  answers: z.unknown(),
});

function normalizeRecordOfStrings(value: unknown) {
  return z.record(z.string(), z.string()).parse(value);
}

function getQuestionIds(content: { questions: { id: number }[] }) {
  return new Set(content.questions.map((q) => String(q.id)));
}

function validateSingleChoice(content: unknown, answers: unknown) {
  const contentSchema = z.object({
    instruction: z.string().optional(),
    legend: z.string().optional(),
    options: z.array(z.string().min(1)).min(2),
    questions: z.array(questionSchema).min(1),
  });
  const parsedContent = contentSchema.parse(content);
  const parsedAnswers = normalizeRecordOfStrings(answers);
  const questionIds = getQuestionIds(parsedContent);
  const optionSet = new Set(parsedContent.options);

  for (const [key, value] of Object.entries(parsedAnswers)) {
    if (!questionIds.has(key)) {
      throw new Error("Answers contain unknown question ids.");
    }
    if (!optionSet.has(value)) {
      throw new Error("Answers must match one of content.options.");
    }
  }

  return { content: parsedContent, answers: parsedAnswers };
}

function validateQcm(content: unknown, answers: unknown) {
  const contentSchema = z.object({
    instruction: z.string().optional(),
    legend: z.string().optional(),
    questions: z.array(qcmQuestionSchema).min(1),
  });
  const parsedContent = contentSchema.parse(content);
  const parsedAnswers = normalizeRecordOfStrings(answers);

  for (const question of parsedContent.questions) {
    const expected = parsedAnswers[String(question.id)];
    if (!expected) continue;
    const labels = new Set(question.options.map((opt) => opt.label));
    if (!labels.has(expected)) {
      throw new Error("QCM answers must match an option label for each question.");
    }
  }

  return { content: parsedContent, answers: parsedAnswers };
}

function validateTrueFalse(content: unknown, answers: unknown) {
  const contentSchema = z.object({
    instruction: z.string().optional(),
    legend: z.string().optional(),
    questions: z.array(questionSchema).min(1),
  });
  const parsedContent = contentSchema.parse(content);
  const parsedAnswers = normalizeRecordOfStrings(answers);
  const questionIds = getQuestionIds(parsedContent);

  for (const [key, value] of Object.entries(parsedAnswers)) {
    if (!questionIds.has(key)) {
      throw new Error("Answers contain unknown question ids.");
    }
    if (value !== "Vrai" && value !== "Faux") {
      throw new Error("True/false answers must be Vrai or Faux.");
    }
  }

  return { content: parsedContent, answers: parsedAnswers };
}

function validateFreeText(content: unknown, answers: unknown) {
  const contentSchema = z.object({
    instruction: z.string().optional(),
    legend: z.string().optional(),
    columns: z
      .object({
        left: z.string().min(1),
        right: z.string().min(1),
      })
      .optional(),
    questions: z.array(questionSchema).min(1),
  });
  const parsedContent = contentSchema.parse(content);
  const parsedAnswers = normalizeRecordOfStrings(answers);
  const questionIds = getQuestionIds(parsedContent);

  for (const key of Object.keys(parsedAnswers)) {
    if (!questionIds.has(key)) {
      throw new Error("Answers contain unknown question ids.");
    }
  }

  return { content: parsedContent, answers: parsedAnswers };
}

function validateMultiSelect(content: unknown, answers: unknown) {
  const contentSchema = z.object({
    instruction: z.string().optional(),
    legend: z.string().optional(),
    questions: z.array(questionSchema).min(1),
  });
  const answersSchema = z.object({
    correctIds: z.array(z.number().int().positive()).min(1),
  });
  const parsedContent = contentSchema.parse(content);
  const parsedAnswers = answersSchema.parse(answers);
  const questionIds = new Set(parsedContent.questions.map((q) => q.id));

  for (const id of parsedAnswers.correctIds) {
    if (!questionIds.has(id)) {
      throw new Error("correctIds contain unknown question ids.");
    }
  }

  return { content: parsedContent, answers: parsedAnswers };
}

function validateLabyrinth(content: unknown, answers: unknown) {
  const contentSchema = z.object({
    instruction: z.string().optional(),
    scenario: z.string().optional(),
    questions: z.array(qcmQuestionSchema).min(1),
  });
  const parsedContent = contentSchema.parse(content);
  const parsedAnswers = normalizeRecordOfStrings(answers);

  for (const question of parsedContent.questions) {
    const expected = parsedAnswers[String(question.id)];
    if (!expected) continue;
    const labels = new Set(question.options.map((opt) => opt.label));
    if (!labels.has(expected)) {
      throw new Error("Labyrinth answers must match an option label.");
    }
  }

  return { content: parsedContent, answers: parsedAnswers };
}

function validateByType(type: ExerciseType, content: unknown, answers: unknown) {
  switch (type) {
    case ExerciseType.single_choice:
      return validateSingleChoice(content, answers);
    case ExerciseType.qcm:
      return validateQcm(content, answers);
    case ExerciseType.true_false:
      return validateTrueFalse(content, answers);
    case ExerciseType.free_text:
      return validateFreeText(content, answers);
    case ExerciseType.multi_select:
      return validateMultiSelect(content, answers);
    case ExerciseType.labyrinth:
      return validateLabyrinth(content, answers);
    default:
      throw new Error("Unsupported exercise type.");
  }
}

export function parseCreateExercisePayload(input: unknown) {
  const parsed = basePayloadSchema.parse(input);
  const validated = validateByType(parsed.type, parsed.content, parsed.answers);
  return {
    number: parsed.number,
    title: parsed.title.trim(),
    type: parsed.type,
    isActive: parsed.isActive,
    content: validated.content,
    answers: validated.answers,
  };
}

const updatePayloadSchema = z.object({
  number: z.number().int().positive().optional(),
  title: z.string().min(3).optional(),
  type: z.nativeEnum(ExerciseType).optional(),
  isActive: z.boolean().optional(),
  content: z.unknown().optional(),
  answers: z.unknown().optional(),
});

export function parseUpdateExercisePayload(
  input: unknown,
  current: { type: ExerciseType; content: unknown; answers: unknown }
) {
  const parsed = updatePayloadSchema.parse(input);
  const nextType = parsed.type ?? current.type;
  const nextContent = parsed.content ?? current.content;
  const nextAnswers = parsed.answers ?? current.answers;

  const validated = validateByType(nextType, nextContent, nextAnswers);

  return {
    number: parsed.number,
    title: parsed.title?.trim(),
    type: parsed.type,
    isActive: parsed.isActive,
    content: parsed.content ? validated.content : undefined,
    answers: parsed.answers ? validated.answers : undefined,
  };
}
