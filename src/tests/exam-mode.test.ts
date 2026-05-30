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

describe("nextPhase", () => {
  it("changes phase from presentation to dialogue", () => {
    expect(nextPhase("presentation")).toBe("dialogue");
  });

  it("walks the full exam flow", () => {
    expect(nextPhase("checklist")).toBe("presentation");
    expect(nextPhase("dialogue")).toBe("evaluation");
    expect(nextPhase("evaluation")).toBe("complete");
    expect(nextPhase("complete")).toBe("complete");
  });
});

describe("phaseDurationSeconds", () => {
  it("uses the official DE allocation for timed phases", () => {
    expect(phaseDurationSeconds("presentation")).toBe(EXAM_PHASE_SECONDS.presentation);
    expect(phaseDurationSeconds("presentation")).toBe(600);
    expect(phaseDurationSeconds("dialogue")).toBe(300);
    expect(phaseDurationSeconds("evaluation")).toBe(300);
  });

  it("returns 0 for untimed phases", () => {
    expect(phaseDurationSeconds("checklist")).toBe(0);
    expect(phaseDurationSeconds("complete")).toBe(0);
  });
});

describe("isWarning", () => {
  it("warns in the final stretch but not before", () => {
    expect(isWarning(120, 600)).toBe(false);
    expect(isWarning(45, 600)).toBe(true);
    expect(isWarning(0, 600)).toBe(false);
  });
});

describe("formatClock", () => {
  it("formats seconds as mm:ss", () => {
    expect(formatClock(0)).toBe("00:00");
    expect(formatClock(65)).toBe("01:05");
    expect(formatClock(600)).toBe("10:00");
  });
});
