import fs from "fs";
import os from "os";
import path from "path";
import initSqlJs, { type Database, type Statement } from "sql.js";
import { seedDemoData } from "@/lib/demo-seed";

/**
 * Minimal sync SQL surface used by the repository.
 *
 * Backed by sql.js (pure WASM) so the exact same code runs locally and on
 * Vercel. We intentionally do NOT use node:sqlite: it is experimental and is
 * not available on Vercel's Node runtime, which made every server action 500.
 */
export type SqlStatement = {
  all(...params: unknown[]): unknown[];
  get(...params: unknown[]): unknown;
  run(...params: unknown[]): unknown;
};

export type SqlDatabase = {
  exec(sql: string): void;
  prepare(sql: string): SqlStatement;
};

// --- sql.js engine ----------------------------------------------------------

let sqlJsModule: Awaited<ReturnType<typeof initSqlJs>> | null = null;

async function loadSqlJs() {
  if (sqlJsModule) {
    return sqlJsModule;
  }
  const wasmPath = path.join(
    process.cwd(),
    "node_modules",
    "sql.js",
    "dist",
    "sql-wasm.wasm",
  );
  const wasmBinary = fs.readFileSync(wasmPath);
  sqlJsModule = await initSqlJs({ wasmBinary });
  return sqlJsModule;
}

class WasmStatement implements SqlStatement {
  constructor(
    private readonly stmt: Statement,
    private readonly persist: () => void,
  ) {}

  all(...params: unknown[]): unknown[] {
    if (params.length > 0) {
      this.stmt.bind(params);
    }
    const rows: unknown[] = [];
    while (this.stmt.step()) {
      rows.push(this.stmt.getAsObject());
    }
    this.stmt.reset();
    return rows;
  }

  get(...params: unknown[]): unknown {
    return this.all(...params)[0];
  }

  run(...params: unknown[]): unknown {
    if (params.length > 0) {
      this.stmt.run(params);
    } else {
      this.stmt.step();
    }
    this.stmt.reset();
    this.persist();
    return {};
  }
}

class WasmDatabase implements SqlDatabase {
  constructor(
    private readonly database: Database,
    private readonly filePath: string,
  ) {}

  exec(sql: string): void {
    this.database.exec(sql);
    this.persist();
  }

  prepare(sql: string): SqlStatement {
    return new WasmStatement(this.database.prepare(sql), () => this.persist());
  }

  private persist(): void {
    fs.mkdirSync(path.dirname(this.filePath), { recursive: true });
    fs.writeFileSync(this.filePath, Buffer.from(this.database.export()));
  }
}

async function createDatabase(filePath: string): Promise<SqlDatabase> {
  const SQL = await loadSqlJs();
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  const database = fs.existsSync(filePath)
    ? new SQL.Database(fs.readFileSync(filePath))
    : new SQL.Database();
  return new WasmDatabase(database, filePath);
}

// --- public API -------------------------------------------------------------

let db: SqlDatabase | null = null;
let initPromise: Promise<void> | null = null;

/** Vercel serverless only allows writes under /tmp; local dev uses ./data/app.db. */
export function resolveDbPath(): string {
  if (process.env.VERCEL) {
    return path.join(os.tmpdir(), "deproject.db");
  }
  if (process.env.DATABASE_PATH) {
    return path.resolve(process.env.DATABASE_PATH);
  }
  return path.join(process.cwd(), "data", "app.db");
}

function runMigrations(database: SqlDatabase) {
  database.exec("PRAGMA foreign_keys = ON");
  database.exec(`
    CREATE TABLE IF NOT EXISTS presentations (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      topic TEXT NOT NULL,
      audience TEXT NOT NULL,
      targetDurationMinutes INTEGER NOT NULL,
      notes TEXT NOT NULL DEFAULT '',
      createdAt TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'active'
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
}

function seedIfEmpty(database: SqlDatabase) {
  const row = database
    .prepare("SELECT COUNT(*) AS c FROM presentations")
    .get() as { c: number };
  if (row.c === 0) {
    seedDemoData();
  }
}

/** Call once per request (via ensureDynamicDb) before sync repository access. */
export async function initDatabase(): Promise<void> {
  if (db) {
    return;
  }
  if (!initPromise) {
    initPromise = (async () => {
      const instance = await createDatabase(resolveDbPath());
      runMigrations(instance);
      db = instance;
      seedIfEmpty(instance);
    })();
  }
  await initPromise;
}

export function getDb(): SqlDatabase {
  if (!db) {
    throw new Error("Database not initialized. Call initDatabase() first.");
  }
  return db;
}
