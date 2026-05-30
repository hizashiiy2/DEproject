import { initDatabase } from "../src/lib/db";
import { seedDemoData } from "../src/lib/demo-seed";
import { listPresentations } from "../src/lib/repository";

async function main() {
  await initDatabase();
  const { getDb } = await import("../src/lib/db");
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
