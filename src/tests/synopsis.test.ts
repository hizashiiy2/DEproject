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
