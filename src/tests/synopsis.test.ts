import { describe, expect, it } from "vitest";
import { synopsisSchema } from "@/domain/validation";
import { buildSynopsisMarkdown } from "@/domain/synopsis";

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

describe("buildSynopsisMarkdown", () => {
  it("renders the title, both topics and feature bullets", () => {
    const md = buildSynopsisMarkdown(synopsisSchema.parse(validInput));
    expect(md).toContain("# DEproject — Exam rehearsal app");
    expect(md).toContain("1. Web frameworks");
    expect(md).toContain("2. Quality Assurance");
    expect(md).toContain("- Exam Mode");
    expect(md).toContain("- Synopsis Builder");
  });

  it("omits optional sections when empty", () => {
    const md = buildSynopsisMarkdown(
      synopsisSchema.parse({ ...validInput, githubUrl: "", reflection: "" }),
    );
    expect(md).not.toContain("## Reflection");
    expect(md).not.toContain("## Source & deployment");
  });

  it("splits comma-separated technologies into bullets", () => {
    const md = buildSynopsisMarkdown(synopsisSchema.parse(validInput));
    expect(md).toContain("- Next.js");
    expect(md).toContain("- Vitest");
  });
});
