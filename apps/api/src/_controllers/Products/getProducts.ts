import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Context } from "hono";
import * as schema from "../../_db/schema";

export default async function GetProducts(c: Context): Promise<Response> {
  // Connect to Database
  const sql = neon(c.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  try {
    return c.json({ message: "data" }, 200);
  } catch (error) {
    console.log(error);
    return c.json({ error }, 500);
  }
}
