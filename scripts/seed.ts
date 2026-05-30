import { getDb } from "../src/lib/db";
import { seedDemoData } from "../src/lib/demo-seed";
import { listPresentations } from "../src/lib/repository";

function clearAll() {
  const database = getDb();
  database.exec(`
    DELETE FROM rehearsal_runs;
    DELETE FROM presentation_sections;
    DELETE FROM presentations;
  `);
}

clearAll();
seedDemoData();

const count = listPresentations().length;
console.log(`Seed complete: ${count} presentations.`);
