import { getDb } from "@/lib/db";

export type PresentationRow = {
  id: string;
  title: string;
  topic: string;
  audience: string;
  targetDurationMinutes: number;
  notes: string;
  createdAt: string;
};

export type SectionRow = {
  id: string;
  presentationId: string;
  title: string;
  targetDurationMinutes: number;
  order: number;
};

export type RehearsalRunRow = {
  id: string;
  presentationId: string;
  runDate: string;
  actualDurationMinutes: number;
  confidenceRating: number;
  notes: string;
};

export type DashboardStats = {
  presentationCount: number;
  runCount: number;
  averageConfidence: number | null;
};

export function listPresentations(): PresentationRow[] {
  const database = getDb();
  return database
    .prepare(
      `SELECT id, title, topic, audience, targetDurationMinutes, notes, createdAt
       FROM presentations ORDER BY createdAt DESC`,
    )
    .all() as PresentationRow[];
}

export function getPresentationById(id: string): PresentationRow | undefined {
  const database = getDb();
  return database
    .prepare(
      `SELECT id, title, topic, audience, targetDurationMinutes, notes, createdAt
       FROM presentations WHERE id = ?`,
    )
    .get(id) as PresentationRow | undefined;
}

export function insertPresentation(row: PresentationRow): void {
  const database = getDb();
  database
    .prepare(
      `INSERT INTO presentations (id, title, topic, audience, targetDurationMinutes, notes, createdAt)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      row.id,
      row.title,
      row.topic,
      row.audience,
      row.targetDurationMinutes,
      row.notes,
      row.createdAt,
    );
}

export function updatePresentation(row: Omit<PresentationRow, "createdAt">): void {
  const database = getDb();
  database
    .prepare(
      `UPDATE presentations SET title = ?, topic = ?, audience = ?, targetDurationMinutes = ?, notes = ?
       WHERE id = ?`,
    )
    .run(
      row.title,
      row.topic,
      row.audience,
      row.targetDurationMinutes,
      row.notes,
      row.id,
    );
}

export function deletePresentation(id: string): void {
  const database = getDb();
  database.prepare(`DELETE FROM presentations WHERE id = ?`).run(id);
}

export function listSections(presentationId: string): SectionRow[] {
  const database = getDb();
  return database
    .prepare(
      `SELECT id, presentationId, title, targetDurationMinutes, "order"
       FROM presentation_sections WHERE presentationId = ? ORDER BY "order" ASC`,
    )
    .all(presentationId) as SectionRow[];
}

export function nextSectionOrder(presentationId: string): number {
  const database = getDb();
  const row = database
    .prepare(
      `SELECT COALESCE(MAX("order"), 0) + 1 AS nextOrder FROM presentation_sections WHERE presentationId = ?`,
    )
    .get(presentationId) as { nextOrder: number };
  return row.nextOrder;
}

export function insertSection(row: SectionRow): void {
  const database = getDb();
  database
    .prepare(
      `INSERT INTO presentation_sections (id, presentationId, title, targetDurationMinutes, "order")
       VALUES (?, ?, ?, ?, ?)`,
    )
    .run(
      row.id,
      row.presentationId,
      row.title,
      row.targetDurationMinutes,
      row.order,
    );
}

export function deleteSection(id: string, presentationId: string): void {
  const database = getDb();
  database
    .prepare(
      `DELETE FROM presentation_sections WHERE id = ? AND presentationId = ?`,
    )
    .run(id, presentationId);
}

export function listRehearsalRuns(presentationId: string): RehearsalRunRow[] {
  const database = getDb();
  return database
    .prepare(
      `SELECT id, presentationId, runDate, actualDurationMinutes, confidenceRating, notes
       FROM rehearsal_runs WHERE presentationId = ? ORDER BY runDate DESC`,
    )
    .all(presentationId) as RehearsalRunRow[];
}

export function insertRehearsalRun(row: RehearsalRunRow): void {
  const database = getDb();
  database
    .prepare(
      `INSERT INTO rehearsal_runs (id, presentationId, runDate, actualDurationMinutes, confidenceRating, notes)
       VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .run(
      row.id,
      row.presentationId,
      row.runDate,
      row.actualDurationMinutes,
      row.confidenceRating,
      row.notes,
    );
}

export function getDashboardStats(): DashboardStats {
  const database = getDb();
  const presentationCount = (
    database.prepare(`SELECT COUNT(*) AS c FROM presentations`).get() as {
      c: number;
    }
  ).c;
  const runCount = (
    database.prepare(`SELECT COUNT(*) AS c FROM rehearsal_runs`).get() as {
      c: number;
    }
  ).c;
  const avgRow = database
    .prepare(`SELECT AVG(confidenceRating) AS avg FROM rehearsal_runs`)
    .get() as { avg: number | null };
  const averageConfidence =
    avgRow.avg === null || Number.isNaN(avgRow.avg) ? null : Math.round(avgRow.avg * 10) / 10;
  return { presentationCount, runCount, averageConfidence };
}
