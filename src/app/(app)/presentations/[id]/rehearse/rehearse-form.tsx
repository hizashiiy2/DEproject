"use client";

import { useActionState, useCallback, useEffect, useLayoutEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { createRehearsalRunAction, type ActionState } from "@/app/actions";
import { FieldErrors } from "@/app/components/FieldErrors";
import { MaterialIcon } from "@/app/components/MaterialIcon";
import {
  getSpeechRecognitionConstructor,
  pickVideoRecorderMime,
  type SpeechRecInstance,
} from "@/lib/rehearsal-capture";
import { buildRehearsalSuggestions } from "@/lib/rehearsal-suggestions";

type Props = { presentationId: string; targetDurationMinutes: number };

type Phase = "ready" | "recording" | "reflect";

const label = "text-xs font-bold uppercase tracking-wider text-on-surface-variant";

const SESSION_TYPES = ["Full run-through", "Technical check"] as const;

const moodOptions = [
  { value: 1, icon: "sentiment_very_dissatisfied", title: "Shaky", hover: "group-hover:text-error" },
  { value: 2, icon: "sentiment_dissatisfied", title: "Uncertain", hover: "group-hover:text-tertiary" },
  { value: 3, icon: "sentiment_satisfied", title: "Solid", hover: "" },
  { value: 4, icon: "sentiment_satisfied_alt", title: "Strong", hover: "group-hover:text-primary" },
  {
    value: 5,
    icon: "sentiment_very_satisfied",
    title: "Mastered",
    hover: "group-hover:text-primary-container",
  },
] as const;

function formatElapsed(totalSeconds: number): string {
  const s = Math.max(0, Math.floor(totalSeconds));
  const m = Math.floor(s / 60);
  const r = s % 60;
  return `${String(m).padStart(2, "0")}:${String(r).padStart(2, "0")}`;
}

export function RehearseForm({ presentationId, targetDurationMinutes }: Props) {
  const router = useRouter();
  const [phase, setPhase] = useState<Phase>("ready");
  const [confidence, setConfidence] = useState(3);
  const [sessionType, setSessionType] = useState<string>(SESSION_TYPES[0]);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [captureError, setCaptureError] = useState<string | null>(null);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [recordingDownloadUrl, setRecordingDownloadUrl] = useState<string | null>(null);
  const [recordingLabel, setRecordingLabel] = useState<string | null>(null);
  const [hasVideoTrack, setHasVideoTrack] = useState(true);
  const [durationInput, setDurationInput] = useState(String(Math.max(1, targetDurationMinutes)));

  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const transcriptRef = useRef("");
  const recognitionRef = useRef<SpeechRecInstance | null>(null);
  const recordingActiveRef = useRef(false);
  const hadSpeechRecognitionRef = useRef(false);
  const skippedRecordingRef = useRef(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startWallClockRef = useRef<number>(0);

  const clearTimer = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
  }, []);

  const stopMedia = useCallback(() => {
    recordingActiveRef.current = false;
    clearTimer();
    const r = recognitionRef.current;
    recognitionRef.current = null;
    if (r) {
      try {
        r.stop();
      } catch {
        /* already stopped */
      }
    }
    const mr = mediaRecorderRef.current;
    mediaRecorderRef.current = null;
    if (mr && mr.state !== "inactive") {
      try {
        mr.stop();
      } catch {
        /* ignore */
      }
    }
    streamRef.current?.getTracks().forEach((t) => t.stop());
    streamRef.current = null;
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
  }, [clearTimer]);

  useEffect(() => {
    return () => {
      stopMedia();
      if (recordingDownloadUrl) {
        URL.revokeObjectURL(recordingDownloadUrl);
      }
    };
  }, [stopMedia, recordingDownloadUrl]);

  /** `<video>` only exists in the "recording" phase; bind the stream after React mounts it. */
  useLayoutEffect(() => {
    if (phase !== "recording") {
      return;
    }
    const video = videoRef.current;
    const stream = streamRef.current;
    if (!video || !stream) {
      return;
    }
    video.srcObject = stream;
    video.playsInline = true;
    void video.play().catch(() => {
      /* autoplay / transient track timing */
    });
  }, [phase]);

  const [state, formAction, pending] = useActionState(
    createRehearsalRunAction,
    null as ActionState,
  );

  const today = new Date().toISOString().slice(0, 10);

  const startRecording = async () => {
    setCaptureError(null);
    skippedRecordingRef.current = false;
    transcriptRef.current = "";
    hadSpeechRecognitionRef.current = false;
    setElapsedSeconds(0);
    chunksRef.current = [];

    let stream: MediaStream;
    try {
      stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user" },
        audio: true,
      });
    } catch {
      try {
        /* Desktop webcams often reject facingMode; grab any default video device (e.g. Arch + pipewire). */
        stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
      } catch {
        try {
          stream = await navigator.mediaDevices.getUserMedia({ video: false, audio: true });
          setHasVideoTrack(false);
        } catch {
          setCaptureError(
            "We need at least microphone access to record a rehearsal. Check browser permissions and try again.",
          );
          return;
        }
      }
    }

    setHasVideoTrack(stream.getVideoTracks().length > 0);
    streamRef.current = stream;

    const mime = pickVideoRecorderMime();
    let recorder: MediaRecorder;
    try {
      recorder = new MediaRecorder(stream, { mimeType: mime });
    } catch {
      recorder = new MediaRecorder(stream);
    }

    recorder.ondataavailable = (ev) => {
      if (ev.data.size > 0) {
        chunksRef.current.push(ev.data);
      }
    };

    mediaRecorderRef.current = recorder;
    try {
      recorder.start(1000);
    } catch {
      setCaptureError("Recording could not start in this browser.");
      stream.getTracks().forEach((t) => t.stop());
      return;
    }

    const SpeechRec = getSpeechRecognitionConstructor();
    if (SpeechRec) {
      const recognition = new SpeechRec();
      recognition.continuous = true;
      recognition.interimResults = false;
      recognition.lang = typeof navigator !== "undefined" ? navigator.language || "en-US" : "en-US";
      recognition.onresult = (ev) => {
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          if (ev.results[i].isFinal) {
            transcriptRef.current += ev.results[i][0].transcript + " ";
          }
        }
      };
      recognition.onend = () => {
        if (recordingActiveRef.current && recognitionRef.current === recognition) {
          try {
            recognition.start();
          } catch {
            /* ignore */
          }
        }
      };
      recognitionRef.current = recognition;
      try {
        recognition.start();
        hadSpeechRecognitionRef.current = true;
      } catch {
        recognitionRef.current = null;
      }
    }

    recordingActiveRef.current = true;
    startWallClockRef.current = Date.now();
    timerRef.current = setInterval(() => {
      setElapsedSeconds((Date.now() - startWallClockRef.current) / 1000);
    }, 250);

    setPhase("recording");
  };

  const skipToLogOnly = () => {
    skippedRecordingRef.current = true;
    stopMedia();
    const sug = buildRehearsalSuggestions({
      transcript: "",
      durationSeconds: 0,
      targetMinutes: targetDurationMinutes,
      hadSpeechRecognition: false,
      skippedRecording: true,
    });
    setSuggestions(sug);
    setDurationInput(String(Math.max(1, targetDurationMinutes)));
    setRecordingDownloadUrl((prev) => {
      if (prev) {
        URL.revokeObjectURL(prev);
      }
      return null;
    });
    setRecordingLabel(null);
    setPhase("reflect");
  };

  const finishRecording = () => {
    const elapsed = (Date.now() - startWallClockRef.current) / 1000;
    recordingActiveRef.current = false;
    clearTimer();

    const recognition = recognitionRef.current;
    recognitionRef.current = null;
    if (recognition) {
      try {
        recognition.stop();
      } catch {
        /* ignore */
      }
    }

    const recorder = mediaRecorderRef.current;
    const stream = streamRef.current;
    if (!recorder || recorder.state === "inactive") {
      stopMedia();
      setElapsedSeconds(elapsed);
      const roundedMin = Math.max(1, Math.round(elapsed / 60));
      setDurationInput(String(roundedMin));
      const sug = buildRehearsalSuggestions({
        transcript: transcriptRef.current,
        durationSeconds: elapsed,
        targetMinutes: targetDurationMinutes,
        hadSpeechRecognition: hadSpeechRecognitionRef.current,
        skippedRecording: false,
      });
      setSuggestions(sug);
      setPhase("reflect");
      return;
    }

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "video/webm" });
      setRecordingDownloadUrl((prev) => {
        if (prev) {
          URL.revokeObjectURL(prev);
        }
        return URL.createObjectURL(blob);
      });
      const ext = blob.type.includes("webm") ? "webm" : "bin";
      setRecordingLabel(`rehearsal-take-${new Date().toISOString().slice(0, 10)}.${ext}`);

      stream?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      mediaRecorderRef.current = null;
      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      setElapsedSeconds(elapsed);
      const roundedMin = Math.max(1, Math.round(elapsed / 60));
      setDurationInput(String(roundedMin));
      const sug = buildRehearsalSuggestions({
        transcript: transcriptRef.current,
        durationSeconds: elapsed,
        targetMinutes: targetDurationMinutes,
        hadSpeechRecognition: hadSpeechRecognitionRef.current,
        skippedRecording: false,
      });
      setSuggestions(sug);
      setPhase("reflect");
    };

    try {
      recorder.stop();
    } catch {
      const done = recorder.onstop;
      if (done) {
        done.call(recorder, new Event("stop"));
      }
    }
  };

  if (phase === "ready") {
    return (
      <div className="space-y-8">
        {captureError ? (
          <p
            className="rounded-xl border border-error/30 bg-error-container/40 px-4 py-3 text-sm text-on-error-container"
            role="alert"
          >
            {captureError}
          </p>
        ) : null}
        <div className="rounded-xl border border-outline-variant/25 bg-surface-container-low p-6">
          <h2 className="mb-2 font-headline text-lg font-bold text-on-surface">Capture your run</h2>
          <p className="text-sm leading-relaxed text-on-surface-variant">
            We&apos;ll roll camera and microphone in the browser, time your take, and when you stop you&apos;ll get
            quick delivery suggestions. Video never leaves your device unless you download it.
          </p>
        </div>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 font-headline text-sm font-semibold text-on-surface-variant transition hover:text-on-surface"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={skipToLogOnly}
            className="rounded-xl border border-outline-variant/40 px-6 py-3 font-headline text-sm font-semibold text-on-surface transition hover:bg-surface-container"
          >
            Skip recording
          </button>
          <button
            type="button"
            onClick={() => void startRecording()}
            className="academic-gradient tonal-shadow flex items-center justify-center gap-2 rounded-xl px-8 py-3 font-headline text-sm font-bold text-on-primary transition hover:opacity-95 active:scale-[0.98]"
          >
            <MaterialIcon name="play_circle" filled className="text-base" />
            Start rehearsal recording
          </button>
        </div>
      </div>
    );
  }

  if (phase === "recording") {
    return (
      <div className="space-y-6">
        <div className="relative overflow-hidden rounded-xl bg-black">
          {hasVideoTrack ? (
            <video ref={videoRef} className="aspect-video w-full object-cover" playsInline muted autoPlay />
          ) : (
            <div className="flex aspect-video w-full flex-col items-center justify-center gap-2 bg-surface-container-highest">
              <MaterialIcon name="mic" className="text-4xl text-on-surface-variant" />
              <p className="text-sm text-on-surface-variant">Audio-only capture (no camera)</p>
            </div>
          )}
          <div className="absolute left-4 top-4 flex items-center gap-2 rounded-full bg-black/60 px-3 py-1.5 text-xs font-bold text-white backdrop-blur-sm">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-red-500" aria-hidden />
            REC
          </div>
          <div className="absolute bottom-4 right-4 rounded-lg bg-black/60 px-3 py-2 font-mono text-lg text-white backdrop-blur-sm">
            {formatElapsed(elapsedSeconds)}
          </div>
        </div>
        <p className="text-sm text-on-surface-variant">
          Speak at a natural volume. Live captions (when supported) power the tips at the end. Chromium browsers work
          best.
        </p>
        <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            onClick={() => {
              stopMedia();
              setPhase("ready");
            }}
            className="px-6 py-3 font-headline text-sm font-semibold text-on-surface-variant transition hover:text-on-surface"
          >
            Discard
          </button>
          <button
            type="button"
            onClick={finishRecording}
            className="academic-gradient tonal-shadow rounded-xl px-8 py-3 font-headline text-sm font-bold text-on-primary transition hover:opacity-95 active:scale-[0.98]"
          >
            End rehearsal &amp; see suggestions
          </button>
        </div>
      </div>
    );
  }

  const suggestionsBlock =
    suggestions.length > 0 ? (
      <div className="rounded-xl border border-primary/20 bg-primary-fixed/25 p-6">
        <h2 className="mb-3 flex items-center gap-2 font-headline text-lg font-bold text-on-primary-fixed-variant">
          <MaterialIcon name="lightbulb" className="text-primary" />
          Suggestions from this take
        </h2>
        <ul className="list-inside list-disc space-y-2 text-sm leading-relaxed text-on-surface">
          {suggestions.map((s) => (
            <li key={s}>{s}</li>
          ))}
        </ul>
        {recordingDownloadUrl && recordingLabel ? (
          <a
            href={recordingDownloadUrl}
            download={recordingLabel}
            className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary hover:underline"
          >
            <MaterialIcon name="download" className="text-base" />
            Download this take ({recordingLabel})
          </a>
        ) : null}
      </div>
    ) : null;

  return (
    <div className="space-y-10">
      {suggestionsBlock}

      <form action={formAction} className="space-y-10">
        <input type="hidden" name="presentationId" value={presentationId} />
        <input type="hidden" name="confidenceRating" value={String(confidence)} />
        <input type="hidden" name="sessionType" value={sessionType} />

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
          <div className="flex flex-col justify-between rounded-xl bg-surface-container-low p-6">
            <label htmlFor="actualDurationMinutes" className={`${label} mb-4 flex items-center gap-2`}>
              <MaterialIcon name="timer" className="text-sm" />
              Total duration
            </label>
            <div className="flex items-baseline gap-2">
              <input
                id="actualDurationMinutes"
                name="actualDurationMinutes"
                type="number"
                min={1}
                required
                value={durationInput}
                onChange={(e) => setDurationInput(e.target.value)}
                className="w-full max-w-[7rem] border-0 bg-transparent p-0 font-headline text-5xl font-light text-primary outline-none focus:ring-0"
              />
              <span className="font-medium text-on-surface-variant">minutes</span>
            </div>
            {elapsedSeconds > 0 ? (
              <p className="mt-2 text-xs text-on-surface-variant">
                Timer showed {formatElapsed(elapsedSeconds)}. Adjust if you went longer off-camera.
              </p>
            ) : null}
            <FieldErrors errors={state?.errors} name="actualDurationMinutes" />
          </div>
          <div className="flex flex-col justify-between rounded-xl bg-surface-container-low p-6">
            <span className={`${label} mb-4 flex items-center gap-2`}>
              <MaterialIcon name="auto_graph" className="text-sm" />
              Session type
            </span>
            <div className="flex flex-wrap gap-2">
              {SESSION_TYPES.map((t) => {
                const on = sessionType === t;
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setSessionType(t)}
                    className={
                      on
                        ? "rounded-full border border-outline-variant/20 bg-surface-container-lowest px-3 py-1 text-xs font-semibold text-primary"
                        : "rounded-full border border-outline-variant/20 bg-transparent px-3 py-1 text-xs font-medium text-on-surface-variant transition hover:bg-surface-container-lowest"
                    }
                  >
                    {t}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-surface-container-low p-6">
          <label htmlFor="runDate" className={`${label} mb-4 flex items-center gap-2`}>
            <MaterialIcon name="calendar_today" className="text-sm" />
            Rehearsal date
          </label>
          <input
            id="runDate"
            name="runDate"
            type="date"
            required
            defaultValue={today}
            className="w-full max-w-sm rounded-xl border-0 border-b-2 border-outline-variant/30 bg-surface-container-lowest px-4 py-3 text-on-surface outline-none focus:border-primary"
          />
          <FieldErrors errors={state?.errors} name="runDate" />
        </div>

        <div className="space-y-4">
          <label className={`${label} block`}>How did you feel about your delivery?</label>
          <div className="flex max-w-full flex-wrap justify-center gap-2 sm:max-w-2xl sm:justify-between md:max-w-none">
            {moodOptions.map((m) => {
              const selected = confidence === m.value;
              return (
                <button
                  key={m.value}
                  type="button"
                  onClick={() => setConfidence(m.value)}
                  className={`group flex min-w-[4.75rem] flex-1 flex-col items-center gap-2 rounded-lg p-3 transition active:scale-95 sm:min-w-[4rem] sm:flex-1 sm:p-4 ${
                    selected
                      ? "bg-secondary-container/40 ring-1 ring-secondary/25"
                      : `hover:bg-surface-container-low ${m.hover}`
                  }`}
                >
                  <MaterialIcon
                    name={m.icon}
                    className={`text-2xl sm:text-3xl ${
                      selected ? "text-secondary" : `text-outline-variant ${m.hover}`
                    }`}
                    filled={selected}
                  />
                  <span
                    className={`text-[9px] font-bold uppercase sm:text-[10px] ${selected ? "text-secondary" : "text-on-surface-variant"}`}
                  >
                    {m.title}
                  </span>
                </button>
              );
            })}
          </div>
          <FieldErrors errors={state?.errors} name="confidenceRating" />
        </div>

        <div className="space-y-3">
          <label htmlFor="notes" className={`${label} block`}>
            Observations &amp; adjustments
          </label>
          <div className="group relative">
            <textarea
              id="notes"
              name="notes"
              rows={4}
              placeholder="What went well? Where did you stumble?"
              defaultValue={
                suggestions.length > 0
                  ? `${suggestions.map((s) => `• ${s}`).join("\n")}\n\n`
                  : undefined
              }
              className="w-full resize-none rounded-xl border-none bg-surface-container-low p-5 text-on-surface outline-none transition focus:ring-2 focus:ring-primary/20"
            />
            <div className="pointer-events-none absolute bottom-0 left-5 right-5 h-0.5 bg-outline-variant/30 transition group-focus-within:bg-primary" />
          </div>
          <FieldErrors errors={state?.errors} name="notes" />
        </div>

        <div className="flex flex-col-reverse items-stretch justify-end gap-3 border-t border-surface-container pt-6 sm:flex-row sm:items-center sm:gap-4">
          <button
            type="button"
            onClick={() => router.back()}
            className="px-6 py-3 font-headline text-sm font-semibold text-on-surface-variant transition hover:text-on-surface"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={pending}
            className="academic-gradient tonal-shadow rounded-xl px-8 py-3 font-headline text-sm font-bold text-on-primary transition hover:opacity-95 active:scale-[0.98] disabled:opacity-50"
          >
            {pending ? "Saving…" : "Save rehearsal"}
          </button>
        </div>
      </form>
    </div>
  );
}
