import { describe, expect, it } from "vitest";
import { buildRehearsalSuggestions } from "@/lib/rehearsal-suggestions";
describe("buildRehearsalSuggestions", () => {
  it("returns skip message when user skipped recording", () => {
    const s = buildRehearsalSuggestions({
      transcript: "",
      durationSeconds: 0,
      targetMinutes: 10,
      hadSpeechRecognition: false,
      skippedRecording: true,
    });
    expect(s).toHaveLength(1);
    expect(s[0]).toContain("skipped");
  });

  it("warns when over target", () => {
    const s = buildRehearsalSuggestions({
      transcript: "",
      durationSeconds: 15 * 60,
      targetMinutes: 10,
      hadSpeechRecognition: false,
      skippedRecording: false,
    });
    expect(s.some((x: string) => x.includes("past"))).toBe(true);
  });

  it("notes missing speech recognition support", () => {
    const s = buildRehearsalSuggestions({
      transcript: "",
      durationSeconds: 120,
      targetMinutes: 10,
      hadSpeechRecognition: false,
      skippedRecording: false,
    });
    expect(s.some((x: string) => x.toLowerCase().includes("caption"))).toBe(true);
  });

  it("flags high filler rate when transcript available", () => {
    const s = buildRehearsalSuggestions({
      transcript:
        "um so like basically um you know the thesis is um uh like very clear um sort of um",
      durationSeconds: 60,
      targetMinutes: 10,
      hadSpeechRecognition: true,
      skippedRecording: false,
    });
    expect(s.some((x: string) => x.toLowerCase().includes("filler"))).toBe(true);
  });
});
