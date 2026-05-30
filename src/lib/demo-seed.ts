import { randomUUID } from "crypto";
import type { PresentationRow, RehearsalRunRow, SectionRow } from "@/lib/repository";
import {
  insertPresentation,
  insertRehearsalRun,
  insertSection,
} from "@/lib/repository";

/** Inserts a single demo presentation when the database is empty. */
export function seedDemoData(): void {
  const presentationId = randomUUID();
  const now = new Date().toISOString();

  const presentation: PresentationRow = {
    id: presentationId,
    title: "Teaching with AI Assistants",
    topic: "AI in Education",
    audience: "University faculty and TAs",
    targetDurationMinutes: 20,
    notes: "Focus on responsible use and classroom activities.",
    createdAt: now,
    status: "active",
  };

  insertPresentation(presentation);

  const sections: Omit<SectionRow, "id">[] = [
    { presentationId, title: "Hook and learning goals", targetDurationMinutes: 3, order: 1 },
    { presentationId, title: "What large language models can (and cannot) do", targetDurationMinutes: 7, order: 2 },
    { presentationId, title: "Demo: drafting feedback with guardrails", targetDurationMinutes: 6, order: 3 },
    { presentationId, title: "Q&A and takeaways", targetDurationMinutes: 4, order: 4 },
  ];

  for (const section of sections) {
    insertSection({ ...section, id: randomUUID() });
  }

  const runs: Omit<RehearsalRunRow, "id">[] = [
    {
      presentationId,
      runDate: "2026-03-20",
      actualDurationMinutes: 22,
      confidenceRating: 3,
      notes: "Ran long on the demo; tighten transitions.",
    },
    {
      presentationId,
      runDate: "2026-03-25",
      actualDurationMinutes: 20,
      confidenceRating: 5,
      notes: "Hit time target; felt confident on questions.",
    },
  ];

  for (const run of runs) {
    insertRehearsalRun({ ...run, id: randomUUID() });
  }
}
