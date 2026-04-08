import { compareTargetVsActual } from "./duration";

export type RehearsalSuggestionInput = {
  transcript: string;
  durationSeconds: number;
  targetMinutes: number;
  /** True when the browser exposed speech recognition during the session */
  hadSpeechRecognition: boolean;
  /** User chose manual logging without recording */
  skippedRecording: boolean;
};

const FILLER_PATTERN = /\b(um|uh|erm|uhm|like|you know|sort of|kind of|basically|actually|literally)\b/gi;

/**
 * Lightweight, on-device coaching hints from timing + optional transcript.
 * No network or model—suitable for coursework and privacy-first demos.
 */
export function buildRehearsalSuggestions(input: RehearsalSuggestionInput): string[] {
  const { transcript, durationSeconds, targetMinutes, hadSpeechRecognition, skippedRecording } =
    input;
  const suggestions: string[] = [];

  if (skippedRecording) {
    suggestions.push(
      "You skipped the live take—when you're ready, try a recorded run for pacing and filler tips.",
    );
    return suggestions;
  }

  const minutes = Math.max(durationSeconds / 60, 1 / 60);
  const actualMinutesRounded = Math.max(1, Math.round(durationSeconds / 60));
  const cmp = compareTargetVsActual(targetMinutes, actualMinutesRounded);

  if (cmp.status === "under") {
    suggestions.push(
      `You stopped around ${Math.abs(cmp.deltaMinutes)} minute(s) short of your ${targetMinutes} min target—check whether key sections need more development.`,
    );
  } else if (cmp.status === "over") {
    suggestions.push(
      `You ran about ${cmp.deltaMinutes} minute(s) past your ${targetMinutes} min target—look for a section to trim or summarise aloud.`,
    );
  } else {
    suggestions.push(
      `Your stop time is close to your ${targetMinutes} min target—solid match between plan and delivery.`,
    );
  }

  if (!hadSpeechRecognition) {
    suggestions.push(
      "Live captioning wasn't available (try Chromium-based browsers)—we could only score timing, not wording.",
    );
    return suggestions;
  }

  const trimmed = transcript.trim();
  const words = trimmed.length > 0 ? trimmed.split(/\s+/).filter(Boolean) : [];
  const wordCount = words.length;

  if (wordCount === 0 && durationSeconds > 45) {
    suggestions.push(
      "We didn't pick up speech—confirm the mic isn't muted and that you granted microphone access.",
    );
    return suggestions;
  }

  if (wordCount === 0) {
    return suggestions;
  }

  const wpm = wordCount / minutes;
  if (wpm > 165) {
    suggestions.push(
      `Estimated pace is fairly fast (~${Math.round(wpm)} words/min). Pause briefly after main claims so they land.`,
    );
  } else if (wpm < 85 && wordCount > 30) {
    suggestions.push(
      `Pace is relaxed (~${Math.round(wpm)} words/min). If it felt sluggish, add one crisp signpost sentence per section.`,
    );
  }

  const fillerMatches = transcript.match(FILLER_PATTERN);
  const fillerCount = fillerMatches?.length ?? 0;
  const fillerRate = (fillerCount / wordCount) * 100;
  if (fillerCount >= 10 || fillerRate > 5) {
    suggestions.push(
      `Several filler words showed up (${fillerCount}). Practice tricky transitions once more with silent beats instead.`,
    );
  } else if (fillerCount >= 3) {
    suggestions.push(
      "Filler usage is noticeable but workable—mark the spots in your notes and rehearse those bridges.",
    );
  }

  return suggestions;
}
