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
