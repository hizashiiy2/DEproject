import { describe, expect, it } from "vitest";
import { daysUntil } from "../domain/exam";

describe("daysUntil", () => {
  it("counts whole days to a future date", () => {
    expect(daysUntil("2026-06-03", new Date("2026-05-30T12:00:00"))).toBe(4);
  });

  it("is zero on the day and never negative", () => {
    expect(daysUntil("2026-06-03", new Date("2026-06-03T08:00:00"))).toBe(0);
    expect(daysUntil("2026-06-03", new Date("2026-07-01T00:00:00"))).toBe(0);
  });
});
