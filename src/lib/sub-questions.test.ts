import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { QuestionFormat, QuestionSkill } from "@prisma/client";
import {
  normalizeSubQuestionsForSave,
  syncMcqCorrectAnswer,
  syncYesNoCorrectAnswer,
  validateSubQuestions,
  type SubQuestion,
} from "./sub-questions";

function baseSub(overrides: Partial<SubQuestion> = {}): SubQuestion {
  return {
    id: "sub-1",
    order: 0,
    skill: QuestionSkill.READING,
    format: QuestionFormat.MULTIPLE_CHOICE,
    weightPercent: 100,
    questionText: "Sample?",
    options: ["a", "b", "c", "d"],
    correctAnswer: "a",
    ...overrides,
  };
}

describe("syncMcqCorrectAnswer", () => {
  it("keeps a matching correct answer", () => {
    assert.equal(syncMcqCorrectAnswer(["a", "b"], "b"), "b");
  });

  it("falls back to the first non-empty option when empty", () => {
    assert.equal(syncMcqCorrectAnswer(["a", "b"], ""), "a");
  });
});

describe("syncYesNoCorrectAnswer", () => {
  it("defaults empty values to Yes", () => {
    assert.equal(syncYesNoCorrectAnswer(undefined), "Yes");
    assert.equal(syncYesNoCorrectAnswer(""), "Yes");
  });

  it("preserves No", () => {
    assert.equal(syncYesNoCorrectAnswer("No"), "No");
  });
});

describe("normalizeSubQuestionsForSave + validateSubQuestions", () => {
  it("repairs empty MCQ correctAnswer before validation passes", () => {
    const normalized = normalizeSubQuestionsForSave([
      baseSub({ correctAnswer: "" }),
    ]);
    assert.equal(normalized[0]?.correctAnswer, "a");
    assert.equal(validateSubQuestions(normalized), null);
  });

  it("rejects MCQ correctAnswer that is not one of the options", () => {
    const error = validateSubQuestions([
      baseSub({ correctAnswer: "z" }),
    ]);
    assert.match(String(error), /must match one of the options/);
  });

  it("repairs empty YES_NO correctAnswer to Yes", () => {
    const normalized = normalizeSubQuestionsForSave([
      baseSub({
        format: QuestionFormat.YES_NO,
        options: ["Yes", "No"],
        correctAnswer: "",
      }),
    ]);
    assert.equal(normalized[0]?.correctAnswer, "Yes");
    assert.equal(validateSubQuestions(normalized), null);
  });
});
