/** Single source of truth for the DE oral exam date. */
export const EXAM_DATE_ISO = "2026-06-03";

/** Whole days from `from` (midnight) until the target ISO date; never negative. */
export function daysUntil(targetIso: string, from: Date = new Date()): number {
  const target = new Date(`${targetIso}T00:00:00`);
  const start = new Date(from);
  start.setHours(0, 0, 0, 0);
  const ms = target.getTime() - start.getTime();
  return Math.max(0, Math.ceil(ms / 86_400_000));
}
