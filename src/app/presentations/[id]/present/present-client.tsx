"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { MaterialIcon } from "@/components/MaterialIcon";

type Slide = { title: string; targetDurationMinutes: number };

type Props = {
  presentationId: string;
  title: string;
  targetDurationMinutes: number;
  sections: Slide[];
};

function clock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function PresentClient({
  presentationId,
  title,
  targetDurationMinutes,
  sections,
}: Props) {
  // Presentations without an outline still get one full-talk slide.
  const slides: Slide[] =
    sections.length > 0
      ? sections
      : [{ title, targetDurationMinutes }];
  const totalTarget = slides.reduce((sum, s) => sum + s.targetDurationMinutes, 0);

  const [index, setIndex] = useState(0);
  const [total, setTotal] = useState(0);
  const [inSection, setInSection] = useState(0);
  const [running, setRunning] = useState(false);

  const current = slides[index];
  const sectionTargetSeconds = current.targetDurationMinutes * 60;
  const sectionOver = inSection > sectionTargetSeconds;
  const totalOver = total > totalTarget * 60;

  const next = useCallback(() => {
    setIndex((i) => {
      if (i >= slides.length - 1) return i;
      setInSection(0);
      return i + 1;
    });
  }, [slides.length]);

  const prev = useCallback(() => {
    setIndex((i) => {
      if (i <= 0) return i;
      setInSection(0);
      return i - 1;
    });
  }, []);

  useEffect(() => {
    if (!running) return;
    const id = setInterval(() => {
      setTotal((t) => t + 1);
      setInSection((s) => s + 1);
    }, 1000);
    return () => clearInterval(id);
  }, [running]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight" || e.key === " ") {
        e.preventDefault();
        next();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        prev();
      } else if (e.key.toLowerCase() === "p") {
        setRunning((r) => !r);
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [next, prev]);

  return (
    <div className="flex min-h-screen flex-col bg-surface text-on-surface">
      <div className="flex items-center justify-between gap-4 px-6 py-4 sm:px-10">
        <div className="min-w-0">
          <div className="truncate font-headline text-sm font-bold text-on-surface-variant">
            {title}
          </div>
          <div className="text-xs text-on-surface-variant/70">
            Section {index + 1} of {slides.length}
          </div>
        </div>
        <Link
          href={`/presentations/${presentationId}`}
          className="flex shrink-0 items-center gap-1.5 rounded-lg bg-surface-container-low px-3 py-2 text-xs font-bold text-on-surface-variant transition hover:bg-surface-container-high"
        >
          <MaterialIcon name="close" className="text-sm" />
          Exit
        </Link>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center px-6 text-center">
        <div className="text-sm font-bold uppercase tracking-[0.3em] text-primary">
          Now presenting
        </div>
        <h1 className="mt-6 max-w-4xl font-headline text-5xl font-extrabold leading-tight tracking-tight sm:text-7xl">
          {current.title}
        </h1>
        <div
          className={`mt-10 font-mono text-7xl font-bold tabular-nums sm:text-8xl ${
            sectionOver ? "text-error" : "text-on-surface"
          }`}
        >
          {clock(inSection)}
        </div>
        <div className="mt-3 text-sm text-on-surface-variant">
          Section target {current.targetDurationMinutes} min
          {sectionOver && " · over time"}
        </div>

        {index < slides.length - 1 && (
          <div className="mt-10 text-sm text-on-surface-variant">
            <span className="font-bold uppercase tracking-wider">Next:</span>{" "}
            {slides[index + 1].title}
          </div>
        )}
      </div>

      <div className="flex justify-center gap-2 px-6 pb-2">
        {slides.map((s, i) => (
          <span
            key={i}
            title={s.title}
            className={`h-1.5 rounded-full transition-all ${
              i === index ? "w-8 bg-primary" : "w-1.5 bg-outline-variant/40"
            }`}
          />
        ))}
      </div>

      <div className="flex items-center justify-between gap-4 border-t border-outline-variant/10 px-6 py-4 sm:px-10">
        <div className="text-sm tabular-nums">
          <span className={totalOver ? "font-bold text-error" : "font-bold text-on-surface"}>
            {clock(total)}
          </span>
          <span className="text-on-surface-variant"> / {totalTarget} min total</span>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={prev}
            disabled={index === 0}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-low text-on-surface transition hover:bg-surface-container-high disabled:opacity-30"
            aria-label="Previous section"
          >
            <MaterialIcon name="chevron_left" />
          </button>
          <button
            type="button"
            onClick={() => setRunning((r) => !r)}
            className="academic-gradient flex h-12 w-12 items-center justify-center rounded-full text-on-primary transition hover:opacity-95"
            aria-label={running ? "Pause timer" : "Start timer"}
          >
            <MaterialIcon name={running ? "pause" : "play_arrow"} filled className="text-on-primary" />
          </button>
          <button
            type="button"
            onClick={next}
            disabled={index >= slides.length - 1}
            className="flex h-11 w-11 items-center justify-center rounded-full bg-surface-container-low text-on-surface transition hover:bg-surface-container-high disabled:opacity-30"
            aria-label="Next section"
          >
            <MaterialIcon name="chevron_right" />
          </button>
        </div>
      </div>

      <p className="pb-4 text-center text-xs text-on-surface-variant/60">
        Space / → next · ← previous · P play-pause
      </p>
    </div>
  );
}
