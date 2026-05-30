/** Pure helpers for the month calendar — no React or DB, so they unit-test cleanly. */

export const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"] as const;

function pad2(n: number): string {
  return String(n).padStart(2, "0");
}

export function isoDate(year: number, month0: number, day: number): string {
  return `${year}-${pad2(month0 + 1)}-${pad2(day)}`;
}

export function monthParam(year: number, month0: number): string {
  return `${year}-${pad2(month0 + 1)}`;
}

/** Parse "YYYY-MM" → {year, month0}; falls back to the month of `fallback`. */
export function parseMonthParam(
  value: string | undefined,
  fallback: Date = new Date(),
): { year: number; month0: number } {
  const m = value?.match(/^(\d{4})-(\d{2})$/);
  if (m) {
    const year = Number(m[1]);
    const month0 = Number(m[2]) - 1;
    if (month0 >= 0 && month0 <= 11) {
      return { year, month0 };
    }
  }
  return { year: fallback.getFullYear(), month0: fallback.getMonth() };
}

export function shiftMonth(
  year: number,
  month0: number,
  delta: number,
): { year: number; month0: number } {
  const d = new Date(year, month0 + delta, 1);
  return { year: d.getFullYear(), month0: d.getMonth() };
}

export function monthLabel(year: number, month0: number): string {
  return new Date(year, month0, 1).toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });
}

/** Calendar grid (Monday-first) as weeks of ISO date strings; null pads other days. */
export function monthMatrix(year: number, month0: number): (string | null)[][] {
  const lead = (new Date(year, month0, 1).getDay() + 6) % 7; // Monday = 0
  const daysInMonth = new Date(year, month0 + 1, 0).getDate();
  const cells: (string | null)[] = [];
  for (let i = 0; i < lead; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(isoDate(year, month0, d));
  while (cells.length % 7 !== 0) cells.push(null);
  const weeks: (string | null)[][] = [];
  for (let i = 0; i < cells.length; i += 7) {
    weeks.push(cells.slice(i, i + 7));
  }
  return weeks;
}
