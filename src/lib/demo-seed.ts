import { randomUUID } from "crypto";
import type { PresentationRow, RehearsalRunRow, SectionRow } from "@/lib/repository";
import {
  insertPresentation,
  insertRehearsalRun,
  insertSection,
} from "@/lib/repository";

/** Inserts demo presentations when the database is empty (e.g. fresh Vercel /tmp). */
export function seedDemoData(): void {
  const p1Id = randomUUID();
  const p2Id = randomUUID();
  const now = new Date().toISOString();

  const pres1: PresentationRow = {
    id: p1Id,
    title: "Teaching with AI Assistants",
    topic: "AI in Education",
    audience: "University faculty and TAs",
    targetDurationMinutes: 20,
    notes: "Focus on responsible use and classroom activities.",
    createdAt: now,
    status: "active",
  };

  const pres2: PresentationRow = {
    id: p2Id,
    title: "From Intern to Team Contributor",
    topic: "My Internship Experience",
    audience: "Career fair attendees",
    targetDurationMinutes: 15,
    notes: "End with lessons learned and advice for applicants.",
    createdAt: now,
    status: "draft",
  };

  insertPresentation(pres1);
  insertPresentation(pres2);

  const sections1: Omit<SectionRow, "id">[] = [
    { presentationId: p1Id, title: "Hook and learning goals", targetDurationMinutes: 3, order: 1 },
    { presentationId: p1Id, title: "What large language models can (and cannot) do", targetDurationMinutes: 7, order: 2 },
    { presentationId: p1Id, title: "Demo: drafting feedback with guardrails", targetDurationMinutes: 6, order: 3 },
    { presentationId: p1Id, title: "Q&A and takeaways", targetDurationMinutes: 4, order: 4 },
  ];

  const sections2: Omit<SectionRow, "id">[] = [
    { presentationId: p2Id, title: "Company and role overview", targetDurationMinutes: 4, order: 1 },
    { presentationId: p2Id, title: "Project I owned end-to-end", targetDurationMinutes: 5, order: 2 },
    { presentationId: p2Id, title: "Collaboration and code review culture", targetDurationMinutes: 4, order: 3 },
    { presentationId: p2Id, title: "What I would do differently", targetDurationMinutes: 2, order: 4 },
  ];

  for (const s of sections1) {
    insertSection({ ...s, id: randomUUID() });
  }
  for (const s of sections2) {
    insertSection({ ...s, id: randomUUID() });
  }

  const runs1: Omit<RehearsalRunRow, "id">[] = [
    {
      presentationId: p1Id,
      runDate: "2026-03-20",
      actualDurationMinutes: 22,
      confidenceRating: 3,
      notes: "Ran long on the demo; tighten transitions.",
    },
    {
      presentationId: p1Id,
      runDate: "2026-03-22",
      actualDurationMinutes: 19,
      confidenceRating: 4,
      notes: "Better pacing; still rushed the Q&A slide.",
    },
    {
      presentationId: p1Id,
      runDate: "2026-03-25",
      actualDurationMinutes: 20,
      confidenceRating: 5,
      notes: "Hit time target; felt confident on questions.",
    },
  ];

  const runs2: Omit<RehearsalRunRow, "id">[] = [
    {
      presentationId: p2Id,
      runDate: "2026-03-18",
      actualDurationMinutes: 17,
      confidenceRating: 2,
      notes: "Forgot one bullet on collaboration.",
    },
    {
      presentationId: p2Id,
      runDate: "2026-03-21",
      actualDurationMinutes: 14,
      confidenceRating: 4,
      notes: "Good energy; practice the closing line once more.",
    },
    {
      presentationId: p2Id,
      runDate: "2026-03-26",
      actualDurationMinutes: 15,
      confidenceRating: 4,
      notes: "Smooth run; minor stumble on metrics.",
    },
  ];

  for (const r of runs1) {
    insertRehearsalRun({ ...r, id: randomUUID() });
  }
  for (const r of runs2) {
    insertRehearsalRun({ ...r, id: randomUUID() });
  }
}
