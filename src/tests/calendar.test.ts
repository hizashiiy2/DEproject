import { describe, expect, it } from "vitest";
import {
  isoDate,
  monthMatrix,
  parseMonthParam,
  shiftMonth,
} from "../domain/calendar";

describe("monthMatrix", () => {
  it("starts a Monday-first month with no leading padding", () => {
    // 1 Jan 2024 is a Monday.
    const weeks = monthMatrix(2024, 0);
    expect(weeks[0][0]).toBe("2024-01-01");
    const days = weeks.flat().filter(Boolean);
    expect(days).toHaveLength(31);
  });

  it("pads leading days when the month starts mid-week", () => {
    // 1 Sep 2024 is a Sunday → 6 leading blanks (Mon-first).
    const weeks = monthMatrix(2024, 8);
    expect(weeks[0].slice(0, 6).every((c) => c === null)).toBe(true);
    expect(weeks[0][6]).toBe("2024-09-01");
  });

  it("always returns full weeks of 7", () => {
    for (const week of monthMatrix(2026, 5)) {
      expect(week).toHaveLength(7);
    }
  });
});

describe("parseMonthParam", () => {
  it("parses a valid YYYY-MM", () => {
    expect(parseMonthParam("2026-06")).toEqual({ year: 2026, month0: 5 });
  });

  it("falls back for invalid input", () => {
    const fallback = new Date(2025, 2, 15);
    expect(parseMonthParam("nope", fallback)).toEqual({ year: 2025, month0: 2 });
    expect(parseMonthParam("2026-13", fallback)).toEqual({ year: 2025, month0: 2 });
  });
});

describe("shiftMonth", () => {
  it("wraps across year boundaries", () => {
    expect(shiftMonth(2026, 0, -1)).toEqual({ year: 2025, month0: 11 });
    expect(shiftMonth(2026, 11, 1)).toEqual({ year: 2027, month0: 0 });
  });
});

describe("isoDate", () => {
  it("zero-pads month and day", () => {
    expect(isoDate(2026, 5, 3)).toBe("2026-06-03");
  });
});
