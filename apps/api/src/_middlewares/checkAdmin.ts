import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Context, Next } from "hono";
import * as schema from "../_db/schema";
import { eq } from "drizzle-orm";

const CheckAdmin = async (c: Context, next: Next) => {
  const { token } = c.get("authUser");

  console.log(token.email);
  if (!token.email) return c.json({ error: "Email field is empty" }, 400);

  try {
    const sql = neon(c.env.DATABASE_URL!);
    const db = drizzle(sql, { schema });
    const user = await db
      .select({
        email: schema.Users.email,
        role: schema.Users.role,
      })
      .from(schema.Users)
      .where(eq(schema.Users.email, token.email));

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
