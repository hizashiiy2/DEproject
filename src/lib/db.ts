import fs from "fs";
import path from "path";
import Database from "better-sqlite3";

let db: Database.Database | null = null;

function runMigrations(database: Database.Database) {
  database.pragma("foreign_keys = ON");
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
  `);
}

export function getDb(): Database.Database {
  if (db) {
    return db;
  }
  const dbPath =
    process.env.DATABASE_PATH ?? path.join(process.cwd(), "data", "app.db");
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const instance = new Database(dbPath);
  runMigrations(instance);
  db = instance;
  return instance;
}
