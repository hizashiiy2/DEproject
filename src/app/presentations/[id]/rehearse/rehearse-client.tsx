"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { createRehearsalRunAction } from "@/actions/rehearsals";
import type { ActionState } from "@/actions/types";
import { FieldErrors } from "@/components/FieldErrors";
import { MaterialIcon } from "@/components/MaterialIcon";

type Props = { presentationId: string; targetDurationMinutes: number };

type Phase = "idle" | "active" | "done";
type TimedNote = { at: number; text: string };

/** Prefer Opus-in-WebM; fall back across browsers. Empty string lets the UA decide. */
function pickAudioMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  for (const m of ["audio/webm;codecs=opus", "audio/webm", "audio/mp4"]) {
    if (MediaRecorder.isTypeSupported(m)) return m;
  }
  return "";
}

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

export function RehearseClient({ presentationId, targetDurationMinutes }: Props) {
  const [state, formAction, pending] = useActionState(
    createRehearsalRunAction,
    null as ActionState,
  );

  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [notes, setNotes] = useState<TimedNote[]>([]);
  const [draft, setDraft] = useState("");
  const [confidence, setConfidence] = useState(3);
  const [audioUrl, setAudioUrl] = useState<string | null>(null);
  const [micError, setMicError] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const elapsedRef = useRef(0);

  useEffect(() => {
    if (phase !== "active") return;
    const id = setInterval(() => {
      setElapsed((s) => {
        elapsedRef.current = s + 1;
        return s + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((t) => t.stop());
      if (audioUrl) URL.revokeObjectURL(audioUrl);
    };
  }, [audioUrl]);

  async function start() {
    setMicError(null);
    setElapsed(0);
    elapsedRef.current = 0;
    setNotes([]);
    if (audioUrl) {
      URL.revokeObjectURL(audioUrl);
      setAudioUrl(null);
    }
    // Recording is best-effort: if the mic is blocked we still run the timer.
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      const mime = pickAudioMime();
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const blob = new Blob(chunksRef.current, {
          type: chunksRef.current[0]?.type || "audio/webm",
        });
        setAudioUrl(URL.createObjectURL(blob));
        streamRef.current?.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      };
      recorder.start();
      recorderRef.current = recorder;
    } catch {
      setMicError(
        "Microphone unavailable — running the timer only. You can still add notes and save.",
      );
    }
    setPhase("active");
  }

  function stop() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    }
    recorderRef.current = null;
    setPhase("done");
  }

  function addNote() {
    const text = draft.trim();
    if (!text) return;
    setNotes((prev) => [...prev, { at: elapsed, text }]);
    setDraft("");
  }

  const minutes = Math.max(1, Math.round(elapsed / 60));
  const notesText = notes.map((n) => `[${formatClock(n.at)}] ${n.text}`).join("\n");
  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-8">
      <div className="rounded-xl bg-surface-container-low p-8 text-center">
        <div className="font-mono text-6xl font-bold tracking-tight text-on-surface tabular-nums">
          {formatClock(elapsed)}
        </div>
        <p className="mt-2 text-sm text-on-surface-variant">
          Target {targetDurationMinutes} min
          {phase !== "idle" && ` · about ${minutes} min so far`}
        </p>

        <div className="mt-6 flex justify-center gap-3">
          {phase === "idle" && (
            <button
              type="button"
              onClick={start}
              className="academic-gradient tonal-depth flex items-center gap-2 rounded-xl px-8 py-3 font-headline text-sm font-bold text-on-primary transition hover:opacity-95"
            >
              <MaterialIcon name="mic" filled className="text-on-primary" />
              Start rehearsal
            </button>
          )}
          {phase === "active" && (
            <button
              type="button"
              onClick={stop}
              className="flex items-center gap-2 rounded-xl bg-error px-8 py-3 font-headline text-sm font-bold text-on-error transition hover:opacity-95"
            >
              <MaterialIcon name="stop" filled className="text-on-error" />
              Stop &amp; review
            </button>
          )}
          {phase === "done" && (
            <button
              type="button"
              onClick={start}
              className="flex items-center gap-2 rounded-xl bg-surface-container-high px-6 py-3 font-headline text-sm font-bold text-on-surface transition hover:opacity-90"
            >
              <MaterialIcon name="refresh" />
              Redo take
            </button>
          )}
        </div>
        {micError && <p className="mt-4 text-xs text-on-surface-variant">{micError}</p>}
      </div>

      {phase !== "idle" && (
        <div className="rounded-xl bg-surface-container-lowest p-6 tonal-depth">
          <h2 className="mb-3 font-headline text-sm font-bold uppercase tracking-wider text-on-surface-variant">
            Notes while you practice
          </h2>
          {phase === "active" && (
            <div className="flex gap-2">
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    addNote();
                  }
                }}
                placeholder="Jot a note — it gets stamped with the current time"
                className="flex-1 rounded-lg border-b-2 border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary"
              />
              <button
                type="button"
                onClick={addNote}
                className="rounded-lg bg-primary px-4 py-2.5 text-sm font-bold text-on-primary transition hover:opacity-95"
              >
                Add
              </button>
            </div>
          )}
          {notes.length > 0 ? (
            <ul className="mt-4 space-y-2">
              {notes.map((n, i) => (
                <li key={i} className="flex gap-3 text-sm text-on-surface">
                  <span className="font-mono font-bold text-primary tabular-nums">
                    {formatClock(n.at)}
                  </span>
                  <span>{n.text}</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="mt-3 text-sm text-on-surface-variant">
              No notes yet — capture stumbles or good moments as they happen.
            </p>
          )}
        </div>
      )}

      {phase === "done" && audioUrl && (
        <div className="rounded-xl bg-surface-container-lowest p-6 tonal-depth">
          <h2 className="mb-3 font-headline text-sm font-bold uppercase tracking-wider text-on-surface-variant">
            Your recording
          </h2>
          <audio src={audioUrl} controls className="w-full" />
          <a
            href={audioUrl}
            download={`rehearsal-${today}.webm`}
            className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
          >
            <MaterialIcon name="download" className="text-sm" />
            Download audio
          </a>
          <p className="mt-2 text-xs text-on-surface-variant">
            The recording stays on your device and is not uploaded or saved to the database.
          </p>
        </div>
      )}

      {phase === "done" && (
        <form action={formAction} className="rounded-xl bg-surface-container-lowest p-6 tonal-depth">
          <input type="hidden" name="presentationId" value={presentationId} />
          <input type="hidden" name="runDate" value={today} />
          <input type="hidden" name="actualDurationMinutes" value={minutes} />
          <input type="hidden" name="confidenceRating" value={confidence} />

          <h2 className="font-headline text-lg font-bold text-on-surface">Log this run</h2>
          <p className="mt-1 text-sm text-on-surface-variant">
            Duration {minutes} min · {today}
          </p>

          <div className="mt-5">
            <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              How confident did it feel?
            </span>
            <div className="mt-2 flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => setConfidence(n)}
                  aria-pressed={confidence === n}
                  className={`h-11 w-11 rounded-lg font-bold transition ${
                    confidence === n
                      ? "academic-gradient text-on-primary"
                      : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
            <FieldErrors errors={state?.errors} name="confidenceRating" />
          </div>

          <div className="mt-5">
            <label htmlFor="notes" className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
              Notes
            </label>
            <textarea
              id="notes"
              name="notes"
              rows={5}
              defaultValue={notesText}
              placeholder="Timestamped notes appear here — edit or add a summary before saving."
              className="mt-2 w-full resize-none rounded-xl border-b-2 border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"
            />
            <FieldErrors errors={state?.errors} name="notes" />
          </div>

          <button
            type="submit"
            disabled={pending}
            className="academic-gradient tonal-depth mt-6 rounded-xl px-8 py-3 font-headline text-sm font-bold text-on-primary transition hover:opacity-95 disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save rehearsal"}
          </button>
        </form>
      )}
    </div>
  );
}
