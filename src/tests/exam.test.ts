import { describe, expect, it } from "vitest";
import { EXAM_QUESTIONS, daysUntil, pickExamQuestion } from "../domain/exam";

describe("daysUntil", () => {
  it("counts whole days to a future date", () => {
    expect(daysUntil("2026-06-03", new Date("2026-05-30T12:00:00"))).toBe(4);
  });

  it("is zero on the day and never negative", () => {
    expect(daysUntil("2026-06-03", new Date("2026-06-03T08:00:00"))).toBe(0);
    expect(daysUntil("2026-06-03", new Date("2026-07-01T00:00:00"))).toBe(0);
  });
});

describe("pickExamQuestion", () => {
  it("returns a prepared exam question by random index", () => {
    expect(pickExamQuestion(["first", "second", "third"], () => 0.5)).toBe("second");
  });

  it("ships with prepared oral-exam prompts", () => {
    expect(EXAM_QUESTIONS.length).toBeGreaterThanOrEqual(8);
  });
});
