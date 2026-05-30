import { describe, expect, it } from "vitest";
import { synopsisSchema } from "@/lib/schemas";
import { buildSynopsisMarkdown } from "@/lib/synopsis";

const validInput = {
  title: "DEproject — Exam rehearsal app",
  description: "A prototype that helps students rehearse for the DE oral exam.",
  topicOne: "Web frameworks",
  topicTwo: "Quality Assurance",
  features: "Exam Mode\nSynopsis Builder\nReadiness dashboard",
  technologies: "Next.js, React, TypeScript, Zod, Vitest",
  githubUrl: "https://github.com/example/deproject",
  reflection: "Limitations and next steps.",
};

describe("synopsisSchema", () => {
  it("accepts a complete synopsis", () => {
    const r = synopsisSchema.safeParse(validInput);
    expect(r.success).toBe(true);
  });

  it("rejects empty required fields", () => {
    const r = synopsisSchema.safeParse({
      ...validInput,
      title: "",
      topicOne: "",
    });
    expect(r.success).toBe(false);
    if (!r.success) {
      const fields = r.error.flatten().fieldErrors;
      expect(fields.title).toBeTruthy();
      expect(fields.topicOne).toBeTruthy();
    }
  });

  it("rejects a description that is too short", () => {
    const r = synopsisSchema.safeParse({ ...validInput, description: "too short" });
    expect(r.success).toBe(false);
  });

  it("rejects an invalid GitHub URL but allows an empty one", () => {
    expect(synopsisSchema.safeParse({ ...validInput, githubUrl: "not-a-url" }).success).toBe(
      false,
    );
    expect(synopsisSchema.safeParse({ ...validInput, githubUrl: "" }).success).toBe(true);
  });
});
