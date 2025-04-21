import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { config } from "../config";
import * as schema from "./schema.ts";

export const db = drizzle({
  connection: {
    connectionString: config.DB_URL,
  },
  schema,
});
