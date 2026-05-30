import fs from "fs";
import os from "os";
import path from "path";
import { DatabaseSync } from "node:sqlite";

let db: DatabaseSync | null = null;

/** Vercel serverless only allows writes under /tmp; local dev uses ./data/app.db. */
function resolveDbPath(): string {
  if (process.env.DATABASE_PATH) {
    return path.resolve(process.env.DATABASE_PATH);
  }
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), "deproject.db");
  }
  return path.join(process.cwd(), "data", "app.db");
}

function runMigrations(database: DatabaseSync) {
  database.exec("PRAGMA foreign_keys = ON");
  database.exec(`
    CREATE TABLE IF NOT EXISTS presentations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      topic TEXT NOT NULL,
      audience TEXT NOT NULL,
      targetDurationMinutes INTEGER NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS presentation_sections (
      id TEXT PRIMARY KEY,
      presentationId TEXT NOT NULL,
      title TEXT NOT NULL,
      targetDurationMinutes INTEGER NOT NULL,
      "order" INTEGER NOT NULL,
      FOREIGN KEY (presentationId) REFERENCES presentations(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS rehearsal_runs (
      id TEXT PRIMARY KEY,
      presentationId TEXT NOT NULL,
      runDate TEXT NOT NULL,
      actualDurationMinutes INTEGER NOT NULL,
      confidenceRating INTEGER NOT NULL CHECK (confidenceRating >= 1 AND confidenceRating <= 5),
      notes TEXT NOT NULL DEFAULT '',
      FOREIGN KEY (presentationId) REFERENCES presentations(id) ON DELETE CASCADE
    );

    CREATE INDEX IF NOT EXISTS idx_sections_presentation ON presentation_sections(presentationId);
    CREATE INDEX IF NOT EXISTS idx_runs_presentation ON rehearsal_runs(presentationId);

    CREATE TABLE IF NOT EXISTS synopsis (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      description TEXT NOT NULL,
      topicOne TEXT NOT NULL,
      topicTwo TEXT NOT NULL,
      features TEXT NOT NULL,
      technologies TEXT NOT NULL,
      githubUrl TEXT NOT NULL DEFAULT '',
      reflection TEXT NOT NULL DEFAULT '',
      updatedAt TEXT NOT NULL
    );
  `);
  const cols = database
    .prepare(`PRAGMA table_info(presentations)`)
    .all() as { name: string }[];
  if (!cols.some((c) => c.name === "status")) {
    database.exec(
      `ALTER TABLE presentations ADD COLUMN status TEXT NOT NULL DEFAULT 'active'`,
    );
  }
}

function maybeSeedOnVercel(instance: DatabaseSync) {
  if (!process.env.VERCEL) {
    return;
  }
  const row = instance
    .prepare("SELECT COUNT(*) AS c FROM presentations")
    .get() as { c: number };
  if (row.c > 0) {
    return;
  }
  // Deferred require avoids a circular import with repository → db.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { seedDemoData } = require("@/lib/demo-seed") as typeof import("@/lib/demo-seed");
  seedDemoData();
}

export function getDb(): DatabaseSync {
  if (db) {
    return db;
  }
  const dbPath = resolveDbPath();
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const instance = new DatabaseSync(dbPath);
  runMigrations(instance);
  db = instance;
  maybeSeedOnVercel(instance);
  return instance;
}
