import { compareTargetVsActual } from "./duration";

export type TimingRow = {
  actualDurationMinutes: number;
  targetDurationMinutes: number;
};

export type TimingSummary = {
  under: number;
  on: number;
  over: number;
  total: number;
  onTargetPct: number;
};

/** Classifies rehearsal runs as under / on / over their target and scores accuracy. */
export function summariseTiming(rows: TimingRow[]): TimingSummary {
  let under = 0;
  let on = 0;
  let over = 0;
  for (const row of rows) {
    const { status } = compareTargetVsActual(
      row.targetDurationMinutes,
      row.actualDurationMinutes,
    );
    if (status === "under") under += 1;
    else if (status === "over") over += 1;
    else on += 1;
  }
  const total = rows.length;
  const onTargetPct = total === 0 ? 0 : Math.round((on / total) * 100);
  return { under, on, over, total, onTargetPct };
}
