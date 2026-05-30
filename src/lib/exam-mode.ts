/**
 * Domain logic for Exam Mode — a rehearsal flow modelled on the DE oral exam:
 * 10 min presentation → 5 min dialogue → 5 min evaluation.
 *
 * Pure and framework-free so the timer/phase rules can be unit-tested with Vitest
 * without rendering React.
 */

export type ExamPhase =
  | "checklist"
  | "presentation"
  | "dialogue"
  | "evaluation"
  | "complete";

/** Timed phases and their official DE exam allocation, in seconds. */
export const EXAM_PHASE_SECONDS: Record<
  "presentation" | "dialogue" | "evaluation",
  number
> = {
  presentation: 10 * 60,
  dialogue: 5 * 60,
  evaluation: 5 * 60,
};

export const EXAM_PHASE_LABELS: Record<ExamPhase, string> = {
  checklist: "Pre-exam checklist",
  presentation: "Presentation",
  dialogue: "Dialogue",
  evaluation: "Evaluation",
  complete: "Summary",
};

/** Items a student confirms before the timed run begins. */
export const EXAM_CHECKLIST: readonly string[] = [
  "Synopsis handed in (1 page)",
  "Two course topics chosen and rehearsed",
  "Prototype web app builds and runs",
  "Presentation plan / sections ready",
  "Laptop, charger and GitHub link available",
] as const;

const PHASE_ORDER: ExamPhase[] = [
  "checklist",
  "presentation",
  "dialogue",
  "evaluation",
  "complete",
];

/** Returns the phase that follows `phase`; `complete` is terminal. */
export function nextPhase(phase: ExamPhase): ExamPhase {
  const index = PHASE_ORDER.indexOf(phase);
  if (index < 0 || index >= PHASE_ORDER.length - 1) {
    return "complete";
  }
  return PHASE_ORDER[index + 1]!;
}

/** Total seconds allotted to a phase (0 for the untimed checklist/summary). */
export function phaseDurationSeconds(phase: ExamPhase): number {
  if (phase === "presentation" || phase === "dialogue" || phase === "evaluation") {
    return EXAM_PHASE_SECONDS[phase];
  }
  return 0;
}

/** Remaining seconds, clamped to [0, total]. */
export function computeRemaining(totalSeconds: number, elapsedSeconds: number): number {
  const remaining = totalSeconds - elapsedSeconds;
  if (remaining < 0) return 0;
  if (remaining > totalSeconds) return totalSeconds;
  return remaining;
}

/**
 * True when the phase is in its final stretch and the student should wrap up.
 * Triggers in the last 60 seconds, or the last 10% for short phases.
 */
export function isWarning(remainingSeconds: number, totalSeconds: number): boolean {
  if (totalSeconds <= 0 || remainingSeconds <= 0) return false;
  const threshold = Math.min(60, Math.ceil(totalSeconds * 0.1));
  return remainingSeconds <= threshold;
}
