"use client";

import { useActionState, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createRehearsalRunAction } from "@/actions/rehearsals";
import type { ActionState } from "@/actions/types";
import { FieldErrors } from "@/components/FieldErrors";
import { MaterialIcon } from "@/components/MaterialIcon";
import { EXAM_QUESTIONS, pickExamQuestion } from "@/domain/exam";

type SectionPlan = { title: string; targetDurationMinutes: number };
type HistoryRun = {
  id: string;
  runDate: string;
  startedAt: string;
  actualDurationMinutes: number;
  confidenceRating: number;
  notes: string;
};

type Props = {
  presentationId: string;
  title: string;
  targetDurationMinutes: number;
  sections: SectionPlan[];
  history: HistoryRun[];
};

type Phase = "idle" | "active" | "done";
type TimedNote = { at: number; text: string };

type StoredRecording = {
  id: string;
  presentationId: string;
  createdAt: string;
  durationSeconds: number;
  mimeType: string;
  blob: Blob;
};

type SavedRecording = StoredRecording & {
  url: string;
  fileName: string;
};

const RECORDING_DB_NAME = "deproject-rehearsal-media";
const RECORDING_STORE = "recordings";

function pickVideoMime(): string {
  if (typeof MediaRecorder === "undefined") return "";
  for (const mime of [
    "video/webm;codecs=vp9,opus",
    "video/webm;codecs=vp8,opus",
    "video/webm",
    "video/mp4",
  ]) {
    if (MediaRecorder.isTypeSupported(mime)) return mime;
  }
  return "";
}

function formatClock(totalSeconds: number): string {
  const m = Math.floor(totalSeconds / 60);
  const s = totalSeconds % 60;
  return `${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}

function formatDuration(totalSeconds: number): string {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes === 0) {
    return `${seconds}s`;
  }
  return `${minutes}m ${String(seconds).padStart(2, "0")}s`;
}

function sectionDeltaText(actualSeconds: number, targetSeconds: number): string {
  const delta = actualSeconds - targetSeconds;
  if (Math.abs(delta) < 60) {
    return "On time";
  }
  return delta < 0
    ? `Ahead by ${formatDuration(Math.abs(delta))}`
    : `Behind by ${formatDuration(delta)}`;
}

function recordingId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

function recordingFileName(createdAt: string, mimeType: string): string {
  const extension = mimeType.includes("mp4") ? "mp4" : "webm";
  const safeDate = createdAt.replace(/[:.]/g, "-");
  return `rehearsal-${safeDate}.${extension}`;
}

function formatHistoryDate(runDate: string, startedAt: string): string {
  const source = startedAt || `${runDate}T12:00:00`;
  const d = new Date(source);
  if (Number.isNaN(d.getTime())) {
    return runDate;
  }
  return d.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function openRecordingDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof indexedDB === "undefined") {
      reject(new Error("IndexedDB is not available"));
      return;
    }

    const request = indexedDB.open(RECORDING_DB_NAME, 1);
    request.onupgradeneeded = () => {
      const db = request.result;
      const store = db.objectStoreNames.contains(RECORDING_STORE)
        ? request.transaction?.objectStore(RECORDING_STORE)
        : db.createObjectStore(RECORDING_STORE, { keyPath: "id" });

      if (store && !store.indexNames.contains("presentationId")) {
        store.createIndex("presentationId", "presentationId", { unique: false });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("Could not open recordings"));
  });
}

async function saveLocalRecording(recording: StoredRecording): Promise<void> {
  const db = await openRecordingDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RECORDING_STORE, "readwrite");
    tx.objectStore(RECORDING_STORE).put(recording);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("Could not save recording"));
    };
  });
}

async function loadLocalRecordings(presentationId: string): Promise<StoredRecording[]> {
  const db = await openRecordingDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RECORDING_STORE, "readonly");
    const request = tx.objectStore(RECORDING_STORE).index("presentationId").getAll(presentationId);
    let rows: StoredRecording[] = [];

    request.onsuccess = () => {
      rows = request.result as StoredRecording[];
    };
    tx.oncomplete = () => {
      db.close();
      resolve(
        rows
          .sort((a, b) => b.createdAt.localeCompare(a.createdAt))
          .slice(0, 6),
      );
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("Could not load recordings"));
    };
  });
}

async function deleteLocalRecording(id: string): Promise<void> {
  const db = await openRecordingDb();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(RECORDING_STORE, "readwrite");
    tx.objectStore(RECORDING_STORE).delete(id);
    tx.oncomplete = () => {
      db.close();
      resolve();
    };
    tx.onerror = () => {
      db.close();
      reject(tx.error ?? new Error("Could not delete recording"));
    };
  });
}

export function RehearseClient({
  presentationId,
  title,
  targetDurationMinutes,
  sections,
  history,
}: Props) {
  const [state, formAction, pending] = useActionState(
    createRehearsalRunAction,
    null as ActionState,
  );

  const sectionPlan = useMemo(
    () => (sections.length > 0 ? sections : [{ title, targetDurationMinutes }]),
    [sections, targetDurationMinutes, title],
  );

  const [phase, setPhase] = useState<Phase>("idle");
  const [elapsed, setElapsed] = useState(0);
  const [notes, setNotes] = useState<TimedNote[]>([]);
  const [draft, setDraft] = useState("");
  const [confidence, setConfidence] = useState(3);
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [videoMime, setVideoMime] = useState("video/webm");
  const [mediaError, setMediaError] = useState<string | null>(null);
  const [storageError, setStorageError] = useState<string | null>(null);
  const [savedVideoName, setSavedVideoName] = useState<string | null>(null);
  const [savedRecordings, setSavedRecordings] = useState<SavedRecording[]>([]);
  const [cameraReady, setCameraReady] = useState(false);
  const [startedAt, setStartedAt] = useState("");
  const [currentSectionIndex, setCurrentSectionIndex] = useState(0);
  const [completedSectionSeconds, setCompletedSectionSeconds] = useState<number[]>([]);
  const [randomQuestion, setRandomQuestion] = useState<string | null>(null);

  const recorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const elapsedRef = useRef(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const startedAtRef = useRef("");
  const savedRecordingUrlsRef = useRef<string[]>([]);

  const replaceSavedRecordings = useCallback((rows: StoredRecording[]) => {
    savedRecordingUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    const next = rows.map((row) => {
      const url = URL.createObjectURL(row.blob);
      return {
        ...row,
        url,
        fileName: recordingFileName(row.createdAt, row.mimeType),
      };
    });
    savedRecordingUrlsRef.current = next.map((row) => row.url);
    setSavedRecordings(next);
  }, []);

  const refreshSavedRecordings = useCallback(async () => {
    try {
      const rows = await loadLocalRecordings(presentationId);
      replaceSavedRecordings(rows);
      setStorageError(null);
    } catch {
      setStorageError("Saved videos are unavailable in this browser.");
    }
  }, [presentationId, replaceSavedRecordings]);

  useEffect(() => {
    const id = window.setTimeout(() => {
      void refreshSavedRecordings();
    }, 0);
    return () => window.clearTimeout(id);
  }, [refreshSavedRecordings]);

  useEffect(() => {
    if (phase !== "active") return;
    const id = setInterval(() => {
      setElapsed((seconds) => {
        elapsedRef.current = seconds + 1;
        return seconds + 1;
      });
    }, 1000);
    return () => clearInterval(id);
  }, [phase]);

  useEffect(() => {
    if (phase !== "active" || !cameraReady || !videoRef.current || !streamRef.current) {
      return;
    }
    videoRef.current.srcObject = streamRef.current;
    void videoRef.current.play().catch(() => undefined);
  }, [cameraReady, phase]);

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      savedRecordingUrlsRef.current.forEach((url) => URL.revokeObjectURL(url));
    };
  }, []);

  useEffect(() => {
    return () => {
      if (videoUrl) {
        URL.revokeObjectURL(videoUrl);
      }
    };
  }, [videoUrl]);

  function stopActiveStream() {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    setCameraReady(false);
  }

  async function start() {
    setMediaError(null);
    setStorageError(null);
    setSavedVideoName(null);
    setRandomQuestion(null);
    setElapsed(0);
    elapsedRef.current = 0;
    setNotes([]);
    setDraft("");
    setCompletedSectionSeconds([]);
    setCurrentSectionIndex(0);
    setVideoUrl(null);
    stopActiveStream();

    const started = new Date().toISOString();
    setStartedAt(started);
    startedAtRef.current = started;
    chunksRef.current = [];

    if (
      typeof navigator === "undefined" ||
      !navigator.mediaDevices?.getUserMedia ||
      typeof MediaRecorder === "undefined"
    ) {
      setMediaError(
        "Camera recording is unavailable in this browser. The timer and notes still work.",
      );
      setPhase("active");
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: { echoCancellation: true, noiseSuppression: true },
        video: {
          width: { ideal: 1280 },
          height: { ideal: 720 },
          facingMode: "user",
        },
      });
      streamRef.current = stream;
      setCameraReady(true);

      const mime = pickVideoMime();
      const recorder = new MediaRecorder(stream, mime ? { mimeType: mime } : undefined);
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = () => {
        const type = chunksRef.current[0]?.type || mime || "video/webm";
        const blob = new Blob(chunksRef.current, { type });
        stopActiveStream();

        if (blob.size === 0) {
          setMediaError("No video data was captured for this take.");
          return;
        }

        setVideoMime(type);
        setVideoUrl(URL.createObjectURL(blob));

        const recording: StoredRecording = {
          id: recordingId(),
          presentationId,
          createdAt: startedAtRef.current || new Date().toISOString(),
          durationSeconds: elapsedRef.current,
          mimeType: type,
          blob,
        };

        void saveLocalRecording(recording)
          .then(async () => {
            setSavedVideoName(recordingFileName(recording.createdAt, recording.mimeType));
            await refreshSavedRecordings();
          })
          .catch(() => {
            setStorageError(
              "The video is ready to download, but this browser could not save it locally.",
            );
          });
      };
      recorder.start(1000);
      recorderRef.current = recorder;
    } catch {
      setMediaError(
        "Camera or microphone unavailable - running the timer only. Check browser permissions to record video.",
      );
    }

    setPhase("active");
  }

  function stop() {
    const recorder = recorderRef.current;
    if (recorder && recorder.state !== "inactive") {
      recorder.stop();
    } else {
      stopActiveStream();
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

  function nextSection() {
    if (phase !== "active" || currentSectionIndex >= sectionPlan.length - 1) {
      return;
    }
    const completedTotal = completedSectionSeconds.reduce((sum, seconds) => sum + seconds, 0);
    const currentSeconds = Math.max(0, elapsedRef.current - completedTotal);
    setCompletedSectionSeconds((prev) => [...prev, currentSeconds]);
    setCurrentSectionIndex((index) => Math.min(index + 1, sectionPlan.length - 1));
  }

  async function removeSavedRecording(id: string) {
    try {
      await deleteLocalRecording(id);
      await refreshSavedRecordings();
    } catch {
      setStorageError("Could not delete that saved video.");
    }
  }

  const completedTotalSeconds = completedSectionSeconds.reduce(
    (sum, seconds) => sum + seconds,
    0,
  );
  const currentSectionElapsed =
    phase === "idle" ? 0 : Math.max(0, elapsed - completedTotalSeconds);
  const currentSection = sectionPlan[currentSectionIndex];
  const currentSectionTargetSeconds = currentSection.targetDurationMinutes * 60;
  const sectionRows = sectionPlan.map((section, index) => {
    let actualSeconds: number | null = null;
    if (index < completedSectionSeconds.length) {
      actualSeconds = completedSectionSeconds[index];
    } else if (index === currentSectionIndex && phase !== "idle") {
      actualSeconds = currentSectionElapsed;
    }
    return {
      ...section,
      actualSeconds,
      targetSeconds: section.targetDurationMinutes * 60,
    };
  });

  const notesText = notes.map((note) => `[${formatClock(note.at)}] ${note.text}`).join("\n");
  const sectionSummaryText = sectionRows
    .filter((section) => section.actualSeconds !== null)
    .map((section, index) => {
      const actualSeconds = section.actualSeconds ?? 0;
      return `[Section ${index + 1}] ${section.title}: ${formatClock(actualSeconds)} / ${
        section.targetDurationMinutes
      } min (${sectionDeltaText(actualSeconds, section.targetSeconds)})`;
    })
    .join("\n");
  const combinedNotesText = [notesText, sectionSummaryText].filter(Boolean).join("\n\n");

  const minutes = Math.max(1, Math.round(elapsed / 60));
  const runStartedAt = startedAt || new Date().toISOString();
  const runDate = runStartedAt.slice(0, 10);
  const downloadName = recordingFileName(runStartedAt, videoMime);

  const improvementText = useMemo(() => {
    if (history.length < 2) {
      return null;
    }
    const [latest, previous] = history;
    const latestDistance = Math.abs(latest.actualDurationMinutes - targetDurationMinutes);
    const previousDistance = Math.abs(previous.actualDurationMinutes - targetDurationMinutes);
    const timingDelta = previousDistance - latestDistance;
    const confidenceDelta = latest.confidenceRating - previous.confidenceRating;
    if (timingDelta === 0 && confidenceDelta === 0) {
      return "Latest run held steady against the previous attempt.";
    }
    const parts: string[] = [];
    if (timingDelta > 0) parts.push(`${timingDelta} min closer to target`);
    if (timingDelta < 0) parts.push(`${Math.abs(timingDelta)} min farther from target`);
    if (confidenceDelta > 0) parts.push(`confidence +${confidenceDelta}`);
    if (confidenceDelta < 0) parts.push(`confidence ${confidenceDelta}`);
    return `Latest run: ${parts.join(", ")}.`;
  }, [history, targetDurationMinutes]);

  return (
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_20rem]">
      <div className="space-y-8">
        <div className="rounded-xl bg-surface-container-low p-6 sm:p-8">
          <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_18rem] lg:items-center">
            <div className="text-center lg:text-left">
              <div className="font-mono text-6xl font-bold tracking-tight text-on-surface tabular-nums">
                {formatClock(elapsed)}
              </div>
              <p className="mt-2 text-sm text-on-surface-variant">
                Target {targetDurationMinutes} min
                {phase !== "idle" && ` - about ${minutes} min so far`}
              </p>

              <div className="mt-6 flex flex-wrap justify-center gap-3 lg:justify-start">
                {phase === "idle" && (
                  <button
                    type="button"
                    onClick={start}
                    className="academic-gradient tonal-depth flex items-center gap-2 rounded-xl px-8 py-3 font-headline text-sm font-bold text-on-primary transition hover:opacity-95"
                  >
                  <MaterialIcon name="videocam" filled className="text-on-primary" />
                    Start camera rehearsal
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
              {mediaError && <p className="mt-4 text-xs text-on-surface-variant">{mediaError}</p>}
            </div>

            <div className="overflow-hidden rounded-xl bg-on-surface shadow-sm">
              {phase === "active" && cameraReady ? (
                <video
                  ref={videoRef}
                  autoPlay
                  muted
                  playsInline
                  className="aspect-video w-full object-cover"
                />
              ) : (
                <div className="flex aspect-video flex-col items-center justify-center gap-2 bg-on-surface text-center text-on-primary">
                  <MaterialIcon name="videocam" className="text-3xl opacity-80" />
                  <p className="px-4 text-xs font-semibold uppercase tracking-wider opacity-80">
                    Camera preview
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="rounded-xl bg-surface-container-lowest p-6 tonal-depth">
          <div className="mb-5 flex flex-wrap items-start justify-between gap-3">
            <div>
              <h2 className="font-headline text-lg font-bold text-on-surface">
                Slide/section timer
              </h2>
              <p className="mt-1 text-sm text-on-surface-variant">
                {currentSection.title} - target {currentSection.targetDurationMinutes} min
              </p>
            </div>
            {phase === "active" && (
              <button
                type="button"
                onClick={nextSection}
                disabled={currentSectionIndex >= sectionPlan.length - 1}
                className="flex items-center gap-1.5 rounded-lg bg-primary px-4 py-2 text-sm font-bold text-on-primary transition hover:opacity-95 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Next section
                <MaterialIcon name="chevron_right" className="text-sm" />
              </button>
            )}
          </div>

          <div className="mb-4 grid gap-3 sm:grid-cols-3">
            <div className="rounded-lg bg-surface-container-low p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Current section
              </div>
              <div className="mt-1 font-mono text-2xl font-bold text-on-surface tabular-nums">
                {formatClock(currentSectionElapsed)}
              </div>
            </div>
            <div className="rounded-lg bg-surface-container-low p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Section pace
              </div>
              <div className="mt-1 text-sm font-bold text-on-surface">
                {phase === "idle"
                  ? "Not started"
                  : sectionDeltaText(currentSectionElapsed, currentSectionTargetSeconds)}
              </div>
            </div>
            <div className="rounded-lg bg-surface-container-low p-4">
              <div className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                Section
              </div>
              <div className="mt-1 font-headline text-2xl font-black text-on-surface">
                {currentSectionIndex + 1}/{sectionPlan.length}
              </div>
            </div>
          </div>

          <div className="space-y-2">
            {sectionRows.map((section, index) => {
              const active = index === currentSectionIndex && phase === "active";
              const complete = index < completedSectionSeconds.length;
              const status =
                section.actualSeconds === null
                  ? "Waiting"
                  : sectionDeltaText(section.actualSeconds, section.targetSeconds);
              return (
                <div
                  key={`${section.title}-${index}`}
                  className={`grid gap-3 rounded-lg px-4 py-3 text-sm sm:grid-cols-[2rem_minmax(0,1fr)_8rem_9rem] sm:items-center ${
                    active
                      ? "bg-primary/10 text-on-surface"
                      : complete
                        ? "bg-surface-container-low text-on-surface"
                        : "bg-surface-container-low/50 text-on-surface-variant"
                  }`}
                >
                  <span className="font-mono text-xs font-bold tabular-nums">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <span className="font-semibold">{section.title}</span>
                  <span className="font-mono tabular-nums">
                    {section.actualSeconds === null ? "--:--" : formatClock(section.actualSeconds)}
                  </span>
                  <span
                    className={
                      status.startsWith("Behind")
                        ? "font-bold text-error"
                        : status.startsWith("Ahead")
                          ? "font-bold text-primary"
                          : "font-bold text-on-surface-variant"
                    }
                  >
                    {status}
                  </span>
                </div>
              );
            })}
          </div>
        </section>

        {phase !== "idle" && (
          <section className="rounded-xl bg-surface-container-lowest p-6 tonal-depth">
            <h2 className="mb-3 font-headline text-sm font-bold uppercase tracking-wider text-on-surface-variant">
              Notes while you practice
            </h2>
            {phase === "active" && (
              <div className="flex gap-2">
                <input
                  value={draft}
                  onChange={(event) => setDraft(event.target.value)}
                  onKeyDown={(event) => {
                    if (event.key === "Enter") {
                      event.preventDefault();
                      addNote();
                    }
                  }}
                  placeholder="Jot a note - it gets stamped with the current time"
                  className="min-w-0 flex-1 rounded-lg border-b-2 border-outline-variant/40 bg-surface-container-low px-4 py-2.5 text-sm text-on-surface outline-none focus:border-primary"
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
                {notes.map((note, index) => (
                  <li key={index} className="flex gap-3 text-sm text-on-surface">
                    <span className="font-mono font-bold text-primary tabular-nums">
                      {formatClock(note.at)}
                    </span>
                    <span>{note.text}</span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="mt-3 text-sm text-on-surface-variant">
                No notes yet - capture stumbles or good moments as they happen.
              </p>
            )}
          </section>
        )}

        {phase === "done" && (
          <section className="rounded-xl bg-surface-container-lowest p-6 tonal-depth">
            <h2 className="mb-3 font-headline text-sm font-bold uppercase tracking-wider text-on-surface-variant">
              Your recording
            </h2>
            {videoUrl ? (
              <>
                <video src={videoUrl} controls className="aspect-video w-full rounded-lg bg-black" />
                <a
                  href={videoUrl}
                  download={downloadName}
                  className="mt-3 inline-flex items-center gap-2 text-sm font-bold text-primary hover:underline"
                >
                  <MaterialIcon name="download" className="text-sm" />
                  Download video with sound
                </a>
                <p className="mt-2 text-xs text-on-surface-variant">
                  {savedVideoName
                    ? `Saved on this device as ${savedVideoName}.`
                    : "The video is ready to download from this page."}
                </p>
              </>
            ) : (
              <p className="text-sm text-on-surface-variant">
                No video was captured for this take. The rehearsal can still be saved with timing and
                notes.
              </p>
            )}
          </section>
        )}

        {phase === "done" && (
          <section className="rounded-xl bg-surface-container-lowest p-6 tonal-depth">
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="font-headline text-lg font-bold text-on-surface">
                  Random question card
                </h2>
                <p className="mt-1 text-sm text-on-surface-variant">
                  Draw a mini oral-exam prompt after reviewing the run.
                </p>
              </div>
              <button
                type="button"
                onClick={() => setRandomQuestion(String(pickExamQuestion(EXAM_QUESTIONS)))}
                className="flex items-center gap-2 rounded-lg bg-surface-container-high px-4 py-2 text-sm font-bold text-primary transition hover:bg-surface-container"
              >
                <MaterialIcon name="auto_awesome" />
                Random question
              </button>
            </div>
            <p className="rounded-lg bg-surface-container-low p-4 text-sm font-semibold leading-relaxed text-on-surface">
              {randomQuestion ?? "Click random question when you are ready."}
            </p>
          </section>
        )}

        {phase === "done" && (
          <form action={formAction} className="rounded-xl bg-surface-container-lowest p-6 tonal-depth">
            <input type="hidden" name="presentationId" value={presentationId} />
            <input type="hidden" name="runDate" value={runDate} />
            <input type="hidden" name="startedAt" value={runStartedAt} />
            <input type="hidden" name="actualDurationMinutes" value={minutes} />
            <input type="hidden" name="confidenceRating" value={confidence} />

            <h2 className="font-headline text-lg font-bold text-on-surface">Log this run</h2>
            <p className="mt-1 text-sm text-on-surface-variant">
              Duration {minutes} min - {formatHistoryDate(runDate, runStartedAt)}
            </p>

            <div className="mt-5">
              <span className="text-xs font-bold uppercase tracking-wider text-on-surface-variant">
                How confident did it feel?
              </span>
              <div className="mt-2 flex gap-2">
                {[1, 2, 3, 4, 5].map((rating) => (
                  <button
                    key={rating}
                    type="button"
                    onClick={() => setConfidence(rating)}
                    aria-pressed={confidence === rating}
                    className={`h-11 w-11 rounded-lg font-bold transition ${
                      confidence === rating
                        ? "academic-gradient text-on-primary"
                        : "bg-surface-container-low text-on-surface-variant hover:bg-surface-container-high"
                    }`}
                  >
                    {rating}
                  </button>
                ))}
              </div>
              <FieldErrors errors={state?.errors} name="confidenceRating" />
            </div>

            <div className="mt-5">
              <label
                htmlFor="notes"
                className="text-xs font-bold uppercase tracking-wider text-on-surface-variant"
              >
                Notes
              </label>
              <textarea
                id="notes"
                name="notes"
                rows={7}
                defaultValue={combinedNotesText}
                placeholder="Timestamped notes and section timing appear here - edit or add a summary before saving."
                className="mt-2 w-full resize-none rounded-xl border-b-2 border-outline-variant/40 bg-surface-container-low px-4 py-3 text-sm text-on-surface outline-none focus:border-primary"
              />
              <FieldErrors errors={state?.errors} name="notes" />
            </div>

            <button
              type="submit"
              disabled={pending}
              className="academic-gradient tonal-depth mt-6 rounded-xl px-8 py-3 font-headline text-sm font-bold text-on-primary transition hover:opacity-95 disabled:opacity-50"
            >
              {pending ? "Saving..." : "Save rehearsal"}
            </button>
          </form>
        )}
      </div>

      <aside className="space-y-6">
        <section className="rounded-xl bg-surface-container-low p-5">
          <div className="mb-4 flex items-center gap-2">
            <MaterialIcon name="history" className="text-tertiary" />
            <h2 className="font-headline text-lg font-bold text-on-surface">Practice history</h2>
          </div>
          {improvementText && (
            <p className="mb-4 rounded-lg bg-surface-container-lowest p-3 text-xs font-semibold text-on-surface-variant">
              {improvementText}
            </p>
          )}
          {history.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              No saved rehearsals yet. Save this run to start tracking improvement.
            </p>
          ) : (
            <div className="space-y-3">
              {history.slice(0, 5).map((run) => (
                <div key={run.id} className="rounded-lg bg-surface-container-lowest p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-bold text-on-surface">
                        {formatHistoryDate(run.runDate, run.startedAt)}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {run.actualDurationMinutes} min - confidence {run.confidenceRating}/5
                      </p>
                    </div>
                    <span className="rounded-full bg-primary/10 px-2 py-1 text-xs font-bold text-primary">
                      {Math.abs(run.actualDurationMinutes - targetDurationMinutes)}m off
                    </span>
                  </div>
                  {run.notes.trim() && (
                    <p className="mt-2 line-clamp-3 text-xs text-on-surface-variant">{run.notes}</p>
                  )}
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="rounded-xl bg-surface-container-low p-5">
          <div className="mb-4 flex items-center gap-2">
            <MaterialIcon name="download" className="text-primary" />
            <h2 className="font-headline text-lg font-bold text-on-surface">Saved videos</h2>
          </div>
          {savedRecordings.length === 0 ? (
            <p className="text-sm text-on-surface-variant">
              Camera takes are saved locally in this browser after recording.
            </p>
          ) : (
            <div className="space-y-3">
              {savedRecordings.map((recording) => (
                <div key={recording.id} className="rounded-lg bg-surface-container-lowest p-4">
                  <p className="text-sm font-bold text-on-surface">
                    {formatHistoryDate(recording.createdAt.slice(0, 10), recording.createdAt)}
                  </p>
                  <p className="text-xs text-on-surface-variant">
                    {formatDuration(recording.durationSeconds)}
                  </p>
                  <div className="mt-3 flex flex-wrap gap-3 text-xs font-bold">
                    <a href={recording.url} download={recording.fileName} className="text-primary">
                      Download
                    </a>
                    <button
                      type="button"
                      onClick={() => void removeSavedRecording(recording.id)}
                      className="text-error"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
          {storageError && <p className="mt-3 text-xs text-on-surface-variant">{storageError}</p>}
        </section>
      </aside>
    </div>
  );
}
