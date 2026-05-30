import { cache } from "react";
import { connection } from "next/server";
import { initDatabase } from "@/db";

/** Ensures the sql.js database is opened at request time before sync repository access. */
export const ensureDynamicDb = cache(async () => {
  await connection();
  await initDatabase();
});
