import { getDb } from "@/db";
import type { PresentationStatus } from "@/domain/presentation-status";

export type PresentationRow = {
  id: string;
  title: string;
  topic: string;
  audience: string;
  targetDurationMinutes: number;
  notes: string;
  createdAt: string;
  status: PresentationStatus;
  /** Optional ISO date (YYYY-MM-DD) the presentation is due / scheduled; "" if unset. */
  dueDate: string;
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
  startedAt: string;
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
      `SELECT id, title, topic, audience, targetDurationMinutes, notes, createdAt, status, dueDate
       FROM presentations ORDER BY createdAt DESC`,
    )
    .all() as PresentationRow[];
}

export function getPresentationById(id: string): PresentationRow | undefined {
  const database = getDb();
  return database
    .prepare(
      `SELECT id, title, topic, audience, targetDurationMinutes, notes, createdAt, status, dueDate
       FROM presentations WHERE id = ?`,
    )
    .get(id) as PresentationRow | undefined;
}

export function insertPresentation(row: PresentationRow): void {
  const database = getDb();
  database
    .prepare(
      `INSERT INTO presentations (id, title, topic, audience, targetDurationMinutes, notes, createdAt, status, dueDate)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      row.id,
      row.title,
      row.topic,
      row.audience,
      row.targetDurationMinutes,
      row.notes,
      row.createdAt,
      row.status,
      row.dueDate,
    );
}

export function updatePresentation(row: Omit<PresentationRow, "createdAt">): void {
  const database = getDb();
  database
    .prepare(
      `UPDATE presentations SET title = ?, topic = ?, audience = ?, targetDurationMinutes = ?, notes = ?, status = ?, dueDate = ?
       WHERE id = ?`,
    )
    .run(
      row.title,
      row.topic,
      row.audience,
      row.targetDurationMinutes,
      row.notes,
      row.status,
      row.dueDate,
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
      `SELECT id, presentationId, runDate, startedAt, actualDurationMinutes, confidenceRating, notes
       FROM rehearsal_runs WHERE presentationId = ? ORDER BY runDate DESC, startedAt DESC, id DESC`,
    )
    .all(presentationId) as RehearsalRunRow[];
}

export function insertRehearsalRun(row: RehearsalRunRow): void {
  const database = getDb();
  database
    .prepare(
      `INSERT INTO rehearsal_runs (id, presentationId, runDate, startedAt, actualDurationMinutes, confidenceRating, notes)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
    )
    .run(
      row.id,
      row.presentationId,
      row.runDate,
      row.startedAt,
      row.actualDurationMinutes,
      row.confidenceRating,
      row.notes,
    );
}

export function deleteRehearsalRun(id: string, presentationId: string): void {
  const database = getDb();
  database
    .prepare(`DELETE FROM rehearsal_runs WHERE id = ? AND presentationId = ?`)
    .run(id, presentationId);
}

export type SynopsisRow = {
  title: string;
  description: string;
  topicOne: string;
  topicTwo: string;
  features: string;
  technologies: string;
  githubUrl: string;
  reflection: string;
  updatedAt: string;
};

/** The synopsis is a singleton: the app tracks one exam synopsis at a time. */
const SYNOPSIS_ID = "singleton";

export function getSynopsis(): SynopsisRow | undefined {
  const database = getDb();
  const row = database
    .prepare(
      `SELECT title, description, topicOne, topicTwo, features, technologies, githubUrl, reflection, updatedAt
       FROM synopsis WHERE id = ?`,
    )
    .get(SYNOPSIS_ID) as SynopsisRow | undefined;
  if (!row) return undefined;
  return {
    title: String(row.title),
    description: String(row.description),
    topicOne: String(row.topicOne),
    topicTwo: String(row.topicTwo),
    features: String(row.features),
    technologies: String(row.technologies),
    githubUrl: String(row.githubUrl),
    reflection: String(row.reflection),
    updatedAt: String(row.updatedAt),
  };
}

export function upsertSynopsis(row: Omit<SynopsisRow, "updatedAt">): void {
  const database = getDb();
  const updatedAt = new Date().toISOString();
  database
    .prepare(
      `INSERT INTO synopsis (id, title, description, topicOne, topicTwo, features, technologies, githubUrl, reflection, updatedAt)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
       ON CONFLICT(id) DO UPDATE SET
         title = excluded.title,
         description = excluded.description,
         topicOne = excluded.topicOne,
         topicTwo = excluded.topicTwo,
         features = excluded.features,
         technologies = excluded.technologies,
         githubUrl = excluded.githubUrl,
         reflection = excluded.reflection,
         updatedAt = excluded.updatedAt`,
    )
    .run(
      SYNOPSIS_ID,
      row.title,
      row.description,
      row.topicOne,
      row.topicTwo,
      row.features,
      row.technologies,
      row.githubUrl,
      row.reflection,
      updatedAt,
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

export type RecentActivityRow = {
  runId: string;
  presentationId: string;
  presentationTitle: string;
  runDate: string;
  startedAt: string;
  actualDurationMinutes: number;
  confidenceRating: number;
};

export function listRecentActivity(limit: number): RecentActivityRow[] {
  const database = getDb();
  return database
    .prepare(
      `SELECT r.id AS runId, r.presentationId, p.title AS presentationTitle, r.runDate, r.startedAt,
              r.actualDurationMinutes, r.confidenceRating
       FROM rehearsal_runs r
       JOIN presentations p ON p.id = r.presentationId
       ORDER BY r.runDate DESC, r.startedAt DESC, r.id DESC
       LIMIT ?`,
    )
    .all(limit) as RecentActivityRow[];
}

export function getTotalSectionCount(): number {
  const database = getDb();
  const row = database
    .prepare(`SELECT COUNT(*) AS c FROM presentation_sections`)
    .get() as { c: number };
  return row.c;
}

export function getTotalPracticeMinutes(): number {
  const database = getDb();
  const row = database
    .prepare(`SELECT COALESCE(SUM(actualDurationMinutes), 0) AS t FROM rehearsal_runs`)
    .get() as { t: number };
  return row.t;
}

export type PresentationListExtras = PresentationRow & {
  sectionCount: number;
  lastPracticed: string | null;
};

/** SQLite rows use null prototypes; spread into a plain object for Server → Client props. */
function plainPresentationListExtras(row: PresentationListExtras): PresentationListExtras {
  return {
    id: String(row.id),
    title: String(row.title),
    topic: String(row.topic),
    audience: String(row.audience),
    targetDurationMinutes: Number(row.targetDurationMinutes),
    notes: String(row.notes),
    createdAt: String(row.createdAt),
    status: row.status,
    dueDate: String(row.dueDate ?? ""),
    sectionCount: Number(row.sectionCount),
    lastPracticed: row.lastPracticed == null ? null : String(row.lastPracticed),
  };
}

export type PresentationListQuery = {
  status?: PresentationStatus;
  q?: string;
  sort?: "modified" | "title" | "duration";
};

export function listPresentationsWithMeta(query?: PresentationListQuery): PresentationListExtras[] {
  const database = getDb();
  const sort = query?.sort ?? "modified";
  const status = query?.status;
  const qRaw = query?.q?.trim() ?? "";
  const q =
    qRaw.length > 0
      ? `%${qRaw.toLowerCase().replace(/%/g, "").replace(/_/g, "")}%`
      : null;

  const where: string[] = [];
  const params: (string | PresentationStatus)[] = [];
  if (status) {
    where.push("p.status = ?");
    params.push(status);
  }
  if (q) {
    where.push("(LOWER(p.title) LIKE ? OR LOWER(p.topic) LIKE ?)");
    params.push(q, q);
  }
  const whereSql = where.length > 0 ? `WHERE ${where.join(" AND ")}` : "";

  let orderBy =
    "ORDER BY CASE WHEN r.lastPracticed IS NULL THEN 1 ELSE 0 END, r.lastPracticed DESC, p.createdAt DESC";
  if (sort === "title") {
    orderBy = "ORDER BY p.title COLLATE NOCASE ASC";
  } else if (sort === "duration") {
    orderBy = "ORDER BY p.targetDurationMinutes DESC, p.title COLLATE NOCASE ASC";
  }

  const stmt = database.prepare(
    `SELECT p.id, p.title, p.topic, p.audience, p.targetDurationMinutes, p.notes, p.createdAt, p.status, p.dueDate,
            COALESCE(s.cnt, 0) AS sectionCount,
            r.lastPracticed AS lastPracticed
     FROM presentations p
     LEFT JOIN (
       SELECT presentationId, COUNT(*) AS cnt
       FROM presentation_sections
       GROUP BY presentationId
     ) s ON s.presentationId = p.id
     LEFT JOIN (
       SELECT presentationId, MAX(runDate) AS lastPracticed
       FROM rehearsal_runs
       GROUP BY presentationId
     ) r ON r.presentationId = p.id
     ${whereSql}
     ${orderBy}`,
  );
  const rows = stmt.all(...params) as PresentationListExtras[];
  return rows.map(plainPresentationListExtras);
}

export type PresentationStatusCounts = {
  all: number;
  draft: number;
  active: number;
  completed: number;
};

export function getPresentationStatusCounts(): PresentationStatusCounts {
  const database = getDb();
  const all = (database.prepare(`SELECT COUNT(*) AS c FROM presentations`).get() as { c: number }).c;
  const rows = database
    .prepare(`SELECT status, COUNT(*) AS c FROM presentations GROUP BY status`)
    .all() as { status: string; c: number }[];
  const draft = rows.find((r) => r.status === "draft")?.c ?? 0;
  const active = rows.find((r) => r.status === "active")?.c ?? 0;
  const completed = rows.find((r) => r.status === "completed")?.c ?? 0;
  return { all, draft, active, completed };
}

// --- Calendar -------------------------------------------------------------

export type DuePresentation = { id: string; title: string; dueDate: string };

/** Presentations that have a due date set, earliest first. */
export function listPresentationDueDates(): DuePresentation[] {
  const database = getDb();
  return database
    .prepare(
      `SELECT id, title, dueDate FROM presentations
       WHERE dueDate <> '' ORDER BY dueDate ASC`,
    )
    .all() as DuePresentation[];
}

/** Every rehearsal run date (ISO YYYY-MM-DD); duplicates kept for per-day counts. */
export function listRehearsalRunDates(): string[] {
  const database = getDb();
  const rows = database
    .prepare(`SELECT runDate FROM rehearsal_runs`)
    .all() as { runDate: string }[];
  return rows.map((r) => String(r.runDate));
}

// --- Progress -------------------------------------------------------------

export type RehearsalDetail = {
  id: string;
  presentationId: string;
  presentationTitle: string;
  runDate: string;
  startedAt: string;
  actualDurationMinutes: number;
  confidenceRating: number;
  targetDurationMinutes: number;
  notes: string;
};

/** Rehearsal runs joined with their presentation, newest first, optional text filter. */
export function listRehearsalsDetailed(q?: string): RehearsalDetail[] {
  const database = getDb();
  const raw = q?.trim().toLowerCase().replace(/[%_]/g, "") ?? "";
  const like = raw.length > 0 ? `%${raw}%` : null;
  const sql = `SELECT r.id, r.presentationId, p.title AS presentationTitle, r.runDate,
                      r.startedAt, r.actualDurationMinutes, r.confidenceRating, p.targetDurationMinutes, r.notes
               FROM rehearsal_runs r
               JOIN presentations p ON p.id = r.presentationId
               ${like ? "WHERE LOWER(p.title) LIKE ? OR LOWER(r.notes) LIKE ?" : ""}
               ORDER BY r.runDate DESC, r.startedAt DESC, r.id DESC`;
  const stmt = database.prepare(sql);
  const rows = (like ? stmt.all(like, like) : stmt.all()) as RehearsalDetail[];
  return rows;
}

export type PresentationProgress = {
  presentationId: string;
  title: string;
  targetDurationMinutes: number;
  runCount: number;
  avgConfidence: number | null;
  avgActual: number | null;
  lastPracticed: string | null;
};

/** Per-presentation rehearsal aggregates, most-practiced first. */
export function getPerPresentationProgress(): PresentationProgress[] {
  const database = getDb();
  const rows = database
    .prepare(
      `SELECT p.id AS presentationId, p.title, p.targetDurationMinutes,
              COUNT(r.id) AS runCount,
              AVG(r.confidenceRating) AS avgConfidence,
              AVG(r.actualDurationMinutes) AS avgActual,
              MAX(r.runDate) AS lastPracticed
       FROM presentations p
       LEFT JOIN rehearsal_runs r ON r.presentationId = p.id
       GROUP BY p.id
       ORDER BY runCount DESC, p.title COLLATE NOCASE ASC`,
    )
    .all() as {
    presentationId: string;
    title: string;
    targetDurationMinutes: number;
    runCount: number;
    avgConfidence: number | null;
    avgActual: number | null;
    lastPracticed: string | null;
  }[];
  return rows.map((r) => ({
    presentationId: String(r.presentationId),
    title: String(r.title),
    targetDurationMinutes: Number(r.targetDurationMinutes),
    runCount: Number(r.runCount),
    avgConfidence:
      r.avgConfidence == null ? null : Math.round(Number(r.avgConfidence) * 10) / 10,
    avgActual: r.avgActual == null ? null : Math.round(Number(r.avgActual)),
    lastPracticed: r.lastPracticed == null ? null : String(r.lastPracticed),
  }));
}
