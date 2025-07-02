import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";
import { serverEnv } from "@/env/server";

let db = null;
if (
  serverEnv.DATABASE_URL &&
  (serverEnv.DATABASE_URL.startsWith('postgres://') || serverEnv.DATABASE_URL.startsWith('postgresql://'))
) {
const sql = neon(serverEnv.DATABASE_URL);
  db = drizzle(sql, { schema });
}
export { db };