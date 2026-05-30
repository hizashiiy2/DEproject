"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import {
  EXAM_CHECKLIST,
  EXAM_PHASE_LABELS,
  computeRemaining,
  formatClock,
  isWarning,
  nextPhase,
  phaseDurationSeconds,
  type ExamPhase,
} from "@/lib/exam-mode";

const TIMED_PHASES = ["presentation", "dialogue", "evaluation"] as const;
type TimedPhase = (typeof TIMED_PHASES)[number];

const PHASE_ICON: Record<TimedPhase, string> = {
  presentation: "present_to_all",
  dialogue: "psychology",
  evaluation: "reviews",
};

export function ExamModeClient() {
  const [phase, setPhase] = useState<ExamPhase>("checklist");
  const [checked, setChecked] = useState<boolean[]>(() =>
    EXAM_CHECKLIST.map(() => false),
  );
  const [elapsed, setElapsed] = useState(0);
  const [running, setRunning] = useState(false);
  const [actuals, setActuals] = useState<Record<TimedPhase, number>>({
    presentation: 0,
    dialogue: 0,
    evaluation: 0,
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const phaseStartRef = useRef(0);
  const baseElapsedRef = useRef(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  useEffect(() => clearTimer, [clearTimer]);

  const startTicking = useCallback(() => {
    clearTimer();
    phaseStartRef.current = Date.now();
    timerRef.current = setInterval(() => {
      const sinceStart = (Date.now() - phaseStartRef.current) / 1000;
      setElapsed(baseElapsedRef.current + sinceStart);
    }, 250);
  }, [clearTimer]);

  const enterPhase = useCallback(
    (next: ExamPhase) => {
      clearTimer();
      baseElapsedRef.current = 0;
      setElapsed(0);
      setPhase(next);
      if (next === "complete") {
        setRunning(false);
        return;
      }
      setRunning(true);
      phaseStartRef.current = Date.now();
      timerRef.current = setInterval(() => {
        const sinceStart = (Date.now() - phaseStartRef.current) / 1000;
        setElapsed(sinceStart);
      }, 250);
    },
    [clearTimer],
  );

  const togglePause = useCallback(() => {
    if (running) {
      clearTimer();
      baseElapsedRef.current = elapsed;
      setRunning(false);
    } else {
      setRunning(true);
      startTicking();
    }
  }, [running, elapsed, clearTimer, startTicking]);

  const advance = useCallback(() => {
    if (phase === "presentation" || phase === "dialogue" || phase === "evaluation") {
      const recorded = Math.round(elapsed);
      setActuals((prev) => ({ ...prev, [phase]: recorded }));
    }
    enterPhase(nextPhase(phase));
  }, [phase, elapsed, enterPhase]);

  const restart = useCallback(() => {
    clearTimer();
    baseElapsedRef.current = 0;
    setElapsed(0);
    setRunning(false);
    setActuals({ presentation: 0, dialogue: 0, evaluation: 0 });
    setChecked(EXAM_CHECKLIST.map(() => false));
    setPhase("checklist");
  }, [clearTimer]);

  // ---- Checklist phase ---------------------------------------------------
  if (phase === "checklist") {
    const allChecked = checked.every(Boolean);
    return (
      <div className="space-y-8">
        <div className="rounded-xl border border-outline-variant/25 bg-surface-container-low p-6">
          <h2 className="mb-2 font-headline text-lg font-bold text-on-surface">
            Before you start
          </h2>
          <p className="text-sm leading-relaxed text-on-surface-variant">
            Exam Mode mirrors the DE oral exam: a 10-minute presentation, 5 minutes of
            dialogue, then 5 minutes of evaluation. Confirm you are ready, then run the
            timed rehearsal end to end.
          </p>
        </div>

        <ul className="space-y-3">
          {EXAM_CHECKLIST.map((item, i) => (
            <li key={item}>
              <label className="flex cursor-pointer items-center gap-3 rounded-xl bg-surface-container-low px-4 py-3 transition hover:bg-surface-container">
                <input
                  type="checkbox"
                  checked={checked[i]}
                  onChange={(e) =>
                    setChecked((prev) =>
                      prev.map((v, idx) => (idx === i ? e.target.checked : v)),
                    )
                  }
                  className="h-5 w-5 accent-primary"
                />
                <span className="text-sm font-medium text-on-surface">{item}</span>
              </label>
            </li>
          ))}
        </ul>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={() => enterPhase("presentation")}
            disabled={!allChecked}
            className="academic-gradient tonal-shadow flex items-center gap-2 rounded-xl px-8 py-3 font-headline text-sm font-bold text-on-primary transition hover:opacity-95 active:scale-[0.98] disabled:opacity-40"
          >
            <MaterialIcon name="play_circle" filled className="text-base" />
            Start Exam Mode
          </button>
        </div>
      </div>
    );
  }

  // ---- Summary phase -----------------------------------------------------
  if (phase === "complete") {
    return (
      <div className="space-y-8">
        <div className="tonal-depth rounded-xl bg-gradient-to-br from-primary to-primary-container p-8 text-on-primary">
          <MaterialIcon name="reviews" filled className="text-3xl text-on-primary" />
          <h2 className="mt-3 font-headline text-2xl font-extrabold">Rehearsal complete</h2>
          <p className="mt-1 text-sm font-medium opacity-90">
            Here is how your timing compared to the official exam allocation.
          </p>
        </div>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
          {TIMED_PHASES.map((p) => {
            const target = phaseDurationSeconds(p);
            const actual = actuals[p];
            const delta = actual - target;
            const tone =
              Math.abs(delta) <= 30
                ? "text-tertiary"
                : delta > 0
                  ? "text-error"
                  : "text-on-surface-variant";
            return (
              <div
                key={p}
                className="tonal-depth rounded-xl bg-surface-container-lowest p-6"
              >
                <div className="flex items-center gap-2 text-primary">
                  <MaterialIcon name={PHASE_ICON[p]} />
                  <span className="text-sm font-bold text-on-surface">
                    {EXAM_PHASE_LABELS[p]}
                  </span>
                </div>
                <div className="font-headline mt-3 text-3xl font-black text-on-surface">
                  {formatClock(actual)}
                </div>
                <div className="mt-1 text-xs text-on-surface-variant">
                  Target {formatClock(target)}
                </div>
                <div className={`mt-2 text-xs font-bold ${tone}`}>
                  {delta === 0
                    ? "On time"
                    : delta > 0
                      ? `${formatClock(Math.abs(delta))} over`
                      : `${formatClock(Math.abs(delta))} under`}
                </div>
              </div>
            );
          })}
        </div>

        <div className="flex justify-end">
          <button
            type="button"
            onClick={restart}
            className="flex items-center gap-2 rounded-xl border border-outline-variant/40 px-6 py-3 font-headline text-sm font-semibold text-on-surface transition hover:bg-surface-container"
          >
            <MaterialIcon name="history" className="text-base" />
            Run again
          </button>
        </div>
      </div>
    );
  }

  // ---- Timed phases ------------------------------------------------------
  const timed = phase as TimedPhase;
  const total = phaseDurationSeconds(timed);
  const remaining = computeRemaining(total, elapsed);
  const overtime = Math.max(0, Math.round(elapsed) - total);
  const warning = isWarning(remaining, total);
  const progressPct = total === 0 ? 0 : Math.min(100, (elapsed / total) * 100);
  const isLast = nextPhase(phase) === "complete";

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {TIMED_PHASES.map((p) => {
          const active = p === timed;
          const done = TIMED_PHASES.indexOf(p) < TIMED_PHASES.indexOf(timed);
          return (
            <span
              key={p}
              className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold ${
                active
                  ? "bg-primary text-on-primary"
                  : done
                    ? "bg-secondary-container text-on-secondary-container"
                    : "bg-surface-container text-on-surface-variant"
              }`}
            >
              {done ? <MaterialIcon name="play_circle" className="text-sm" filled /> : null}
              {EXAM_PHASE_LABELS[p]}
            </span>
          );
        })}
      </div>

      <div
        className={`tonal-depth rounded-2xl border-2 p-10 text-center transition-colors ${
          overtime > 0
            ? "border-error bg-error-container/30"
            : warning
              ? "border-tertiary bg-tertiary/5"
              : "border-transparent bg-surface-container-lowest"
        }`}
      >
        <div className="flex items-center justify-center gap-2 text-on-surface-variant">
          <MaterialIcon name={PHASE_ICON[timed]} className="text-primary" />
          <span className="text-sm font-bold uppercase tracking-widest">
            {EXAM_PHASE_LABELS[timed]}
          </span>
        </div>

        <div
          className={`font-headline mt-4 text-7xl font-black tabular-nums sm:text-8xl ${
            overtime > 0 ? "text-error" : warning ? "text-tertiary" : "text-on-surface"
          }`}
        >
          {overtime > 0 ? `+${formatClock(overtime)}` : formatClock(remaining)}
        </div>

        <p className="mt-2 text-sm font-medium text-on-surface-variant" role="status">
          {overtime > 0
            ? "Time is up — wrap up and move on."
            : warning
              ? "Almost out of time — start concluding."
              : `Target ${formatClock(total)} for this phase`}
        </p>

        <div className="mx-auto mt-6 h-2 max-w-md overflow-hidden rounded-full bg-surface-container-highest">
          <div
            className={`h-full rounded-full transition-all ${
              overtime > 0 ? "bg-error" : warning ? "bg-tertiary" : "bg-primary"
            }`}
            style={{ width: `${progressPct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-col items-stretch justify-center gap-3 sm:flex-row">
        <button
          type="button"
          onClick={togglePause}
          className="flex items-center justify-center gap-2 rounded-xl border border-outline-variant/40 px-6 py-3 font-headline text-sm font-semibold text-on-surface transition hover:bg-surface-container"
        >
          <MaterialIcon name={running ? "schedule" : "play_circle"} className="text-base" />
          {running ? "Pause" : "Resume"}
        </button>
        <button
          type="button"
          onClick={advance}
          className="academic-gradient tonal-shadow flex items-center justify-center gap-2 rounded-xl px-8 py-3 font-headline text-sm font-bold text-on-primary transition hover:opacity-95 active:scale-[0.98]"
        >
          <MaterialIcon name="arrow_right_alt" className="text-base" />
          {isLast ? "Finish & see summary" : `Next: ${EXAM_PHASE_LABELS[nextPhase(phase)]}`}
        </button>
      </div>
    </div>
  );
}
