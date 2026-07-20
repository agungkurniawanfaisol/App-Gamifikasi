import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { QuestionFormat, QuestionSkill } from "@prisma/client";
import {
  getMcqCorrectLetter,
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

describe("getMcqCorrectLetter", () => {
  it("returns empty when correctAnswer is blank", () => {
    assert.equal(getMcqCorrectLetter(["", "", "", ""], ""), "");
    assert.equal(getMcqCorrectLetter(["a", "", "", ""], null), "");
    assert.equal(getMcqCorrectLetter(["a", "b"], "   "), "");
  });

  it("does not falsely match empty option slots", () => {
    assert.equal(getMcqCorrectLetter(["cat", "", "", ""], ""), "");
  });

  it("maps matching option text to A–D", () => {
    assert.equal(getMcqCorrectLetter(["a", "b", "c", "d"], "c"), "C");
    assert.equal(getMcqCorrectLetter(["  apple ", "b"], "apple"), "A");
  });

  it("returns empty when answer is not among options", () => {
    assert.equal(getMcqCorrectLetter(["a", "b"], "z"), "");
  });
});

describe("syncMcqCorrectAnswer", () => {
  it("keeps a matching correct answer", () => {
    assert.equal(syncMcqCorrectAnswer(["a", "b"], "b"), "b");
  });

  it("does not invent an answer when empty", () => {
    assert.equal(syncMcqCorrectAnswer(["a", "b"], ""), "");
  });

  it("follows renamed option text via previousOptions", () => {
    assert.equal(
      syncMcqCorrectAnswer(["a", "banana", "c"], "b", {
        previousOptions: ["a", "b", "c"],
      }),
      "banana"
    );
  });

  it("matches case-insensitively", () => {
    assert.equal(syncMcqCorrectAnswer(["Apple", "b"], "apple"), "Apple");
  });

  it("can fall back to the first option for AI drafts", () => {
    assert.equal(
      syncMcqCorrectAnswer(["a", "b"], "", { fallbackToFirst: true }),
      "a"
    );
  });
});

describe("syncYesNoCorrectAnswer", () => {
  it("keeps empty values empty unless fallback requested", () => {
    assert.equal(syncYesNoCorrectAnswer(undefined), "");
    assert.equal(syncYesNoCorrectAnswer(""), "");
    assert.equal(syncYesNoCorrectAnswer("", { fallbackToYes: true }), "Yes");
  });

  it("preserves No", () => {
    assert.equal(syncYesNoCorrectAnswer("No"), "No");
  });
});

describe("normalizeSubQuestionsForSave + validateSubQuestions", () => {
  it("keeps empty MCQ correctAnswer empty so validation can fail", () => {
    const normalized = normalizeSubQuestionsForSave([
      baseSub({ correctAnswer: "" }),
    ]);
    assert.equal(normalized[0]?.correctAnswer, "");
    assert.match(
      String(validateSubQuestions(normalized)),
      /correct answer is required/
    );
  });

  it("rejects MCQ correctAnswer that is not one of the options", () => {
    const error = validateSubQuestions([baseSub({ correctAnswer: "z" })]);
    assert.match(String(error), /must match one of the options/);
  });

  it("keeps empty YES_NO correctAnswer empty so validation can fail", () => {
    const normalized = normalizeSubQuestionsForSave([
      baseSub({
        format: QuestionFormat.YES_NO,
        options: ["Yes", "No"],
        correctAnswer: "",
      }),
    ]);
    assert.equal(normalized[0]?.correctAnswer, "");
    assert.match(
      String(validateSubQuestions(normalized)),
      /correct answer is required/
    );
  });
});
