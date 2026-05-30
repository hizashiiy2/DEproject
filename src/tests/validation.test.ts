import { describe, expect, it } from "vitest";
import {
  presentationCreateSchema,
  rehearsalRunCreateSchema,
} from "@/domain/validation";
describe("presentationCreateSchema", () => {
  it("accepts valid payload", () => {
    const r = presentationCreateSchema.safeParse({
      title: "Talk",
      topic: "Topic",
      audience: "Class",
      targetDurationMinutes: 10,
      notes: "",
    });
    expect(r.success).toBe(true);
    if (r.success) {
      expect(r.data.title).toBe("Talk");
    }
  });

  it("rejects missing title", () => {
    const r = presentationCreateSchema.safeParse({
      title: "",
      topic: "T",
      audience: "A",
      targetDurationMinutes: 5,
    });
    expect(r.success).toBe(false);
  });
});

describe("rehearsalRunCreateSchema", () => {
  it("rejects confidence below 1", () => {
    const r = rehearsalRunCreateSchema.safeParse({
      presentationId: "550e8400-e29b-41d4-a716-446655440000",
      runDate: "2026-03-01",
      actualDurationMinutes: 10,
      confidenceRating: 0,
    });
    expect(r.success).toBe(false);
  });

  it("rejects confidence above 5", () => {
    const r = rehearsalRunCreateSchema.safeParse({
      presentationId: "550e8400-e29b-41d4-a716-446655440000",
      runDate: "2026-03-01",
      actualDurationMinutes: 10,
      confidenceRating: 6,
    });
    expect(r.success).toBe(false);
  });

  it("accepts confidence 1–5", () => {
    const r = rehearsalRunCreateSchema.safeParse({
      presentationId: "550e8400-e29b-41d4-a716-446655440000",
      runDate: "2026-03-01",
      actualDurationMinutes: 12,
      confidenceRating: 4,
      notes: "ok",
    });
    expect(r.success).toBe(true);
  });
});
