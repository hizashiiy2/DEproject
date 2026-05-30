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
