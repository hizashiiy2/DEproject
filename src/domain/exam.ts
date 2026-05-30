/** Single source of truth for the DE oral exam date. */
export const EXAM_DATE_ISO = "2026-06-03";

export const EXAM_QUESTIONS = [
  "What problem does your project solve, and who benefits most from it?",
  "Which part of the implementation best demonstrates your technical learning?",
  "How did you validate that the user flow works for the target audience?",
  "What tradeoff did you make during development, and why was it acceptable?",
  "How would you improve the project if you had one more week?",
  "Which course concept is most visible in the final prototype?",
  "What was the hardest bug or design issue, and how did you resolve it?",
  "How does your data model support the core user workflow?",
  "What would you monitor or test before releasing this to real users?",
  "How would you explain the project architecture to a non-technical examiner?",
] as const;

export type ExamQuestion = (typeof EXAM_QUESTIONS)[number] | string;

/** Whole days from `from` (midnight) until the target ISO date; never negative. */
export function daysUntil(targetIso: string, from: Date = new Date()): number {
  const target = new Date(`${targetIso}T00:00:00`);
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const ms = target.getTime() - start.getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}

export function pickExamQuestion(
  questions: readonly ExamQuestion[] = EXAM_QUESTIONS,
  random: () => number = Math.random,
): ExamQuestion {
  if (questions.length === 0) {
    return "";
  }
  const index = Math.min(questions.length - 1, Math.floor(random() * questions.length));
  return questions[index];
}
