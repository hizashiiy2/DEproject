import { describe, expect, it } from "vitest";
import { summariseTiming } from "../domain/progress";

describe("summariseTiming", () => {
  it("returns zeros for no runs", () => {
    expect(summariseTiming([])).toEqual({
      under: 0,
      on: 0,
      over: 0,
      total: 0,
      onTargetPct: 0,
    });
  });

  it("classifies under / on / over against target with ±1 tolerance", () => {
    const rows = [
      { targetDurationMinutes: 20, actualDurationMinutes: 20 }, // on
      { targetDurationMinutes: 20, actualDurationMinutes: 23 }, // over
      { targetDurationMinutes: 20, actualDurationMinutes: 17 }, // under
      { targetDurationMinutes: 20, actualDurationMinutes: 21 }, // on (within tolerance)
    ];
    const summary = summariseTiming(rows);
    expect(summary).toEqual({ under: 1, on: 2, over: 1, total: 4, onTargetPct: 50 });
  });
});
