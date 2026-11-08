import "server-only";
import { drizzle } from "drizzle-orm/d1";
import { getBindings } from "@/lib/env";
import * as schema from "./schema";

export async function getDb() {
  const env = await getBindings();
  return drizzle(env.DB, { schema });
}

export type Db = Awaited<ReturnType<typeof getDb>>;
