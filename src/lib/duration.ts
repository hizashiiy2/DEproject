export type DurationCompareStatus = "under" | "on" | "over";

export type DurationComparison = {
  deltaMinutes: number;
  status: DurationCompareStatus;
};

/**
 * Compares actual rehearsal length to target. Within tolerance (default ±1 min) counts as "on".
 */
export function compareTargetVsActual(
  targetMinutes: number,
  actualMinutes: number,
  toleranceMinutes = 1,
): DurationComparison {
  const deltaMinutes = actualMinutes - targetMinutes;
  if (Math.abs(deltaMinutes) <= toleranceMinutes) {
    return { deltaMinutes, status: "on" };
  }
  return deltaMinutes < 0
    ? { deltaMinutes, status: "under" }
    : { deltaMinutes, status: "over" };
}
