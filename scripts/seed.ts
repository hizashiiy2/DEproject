import { initDatabase } from "../src/db";
import { seedDemoData } from "../src/db/seed";
import { listPresentations } from "../src/db/repository";

async function main() {
  await initDatabase();
  const { getDb } = await import("../src/db");
  const database = getDb();
  database.exec(`
    DELETE FROM rehearsal_runs;
    DELETE FROM presentation_sections;
    DELETE FROM presentations;
  `);
  seedDemoData();
  const count = listPresentations().length;
  console.log(`Seed complete: ${count} presentations.`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
