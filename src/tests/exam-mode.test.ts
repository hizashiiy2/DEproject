import { describe, expect, it } from "vitest";
import {
  EXAM_PHASE_SECONDS,
  computeRemaining,
  formatClock,
  isWarning,
  nextPhase,
  phaseDurationSeconds,
} from "@/lib/exam-mode";

describe("computeRemaining", () => {
  it("calculates remaining time correctly", () => {
    expect(computeRemaining(600, 0)).toBe(600);
    expect(computeRemaining(600, 150)).toBe(450);
    expect(computeRemaining(600, 600)).toBe(0);
  });

  it("clamps below zero and above total", () => {
    expect(computeRemaining(600, 700)).toBe(0);
    expect(computeRemaining(600, -10)).toBe(600);
  });
});
