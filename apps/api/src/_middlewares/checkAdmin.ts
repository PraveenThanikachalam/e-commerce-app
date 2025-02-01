import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Context, Next } from "hono";
import * as schema from "../_db/schema";
import { eq } from "drizzle-orm";
import { getAuthUser } from "@hono/auth-js";

const CheckAdmin = async (c: Context, next: Next) => {
  const authUser = await getAuthUser(c);

  const token = authUser?.token;

  console.log(token?.email);
  if (!token?.email) return c.json({ error: "Email field is empty" }, 400);

  try {
    const sql = neon(c.env.DATABASE_URL!);
    const db = drizzle(sql, { schema });
    const user = await db
      .select({
        email: schema.users.email,
        role: schema.users.role,
      })
      .from(schema.users)
      .where(eq(schema.users.email, token.email));

    if (!user.length) return c.json({ error: "User not found" }, 404);

    if (user[0].role !== "ADMIN") {
      return c.json({ error: "Unauthorized - Admin access required" }, 403);
    }

    // If user is admin, continue to the next middleware/handler
    await next();
  } catch (error) {
    console.error("Error checking admin:", error);
    return c.json({ error }, 500);
  }
};

export default CheckAdmin;
