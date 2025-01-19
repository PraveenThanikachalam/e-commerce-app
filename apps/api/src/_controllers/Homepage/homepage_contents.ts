import { Context } from "hono";
import { z } from "zod";
import { HomePageContentsTable } from "../../_db/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../../_db/schema";
import { HomepageContentValidation } from "../../lib/z.validation";

const GetHomePageContents = async (c: Context) => {
  if (!c.env.DATABASE_URL) {
    return c.json(
      {
        error: "Configuration error",
        message: "DATABASE_URL is not set",
      },
      500
    );
  }
  const sql = neon(c.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  if (c.req.method === "GET") {
    try {
      const Response = await db.query.HomePageContentsTable.findMany();
      return c.json({ Response }, 200);
    } catch (error) {
      console.error("Error in HomePageContents:", error);
      return c.json(
        {
          error: "Internal server error",
          message: "Failed to fetch homepage contents",
        },
        500
      );
    }
  }
};

const AddHomePageContents = async (c: Context) => {
  if (!c.env.DATABASE_URL) {
    return c.json(
      {
        error: "Configuration error",
        message: "DATABASE_URL is not set",
      },
      500
    );
  }
  const sql = neon(c.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  if (c.req.method === "POST") {
    try {
      const body = await c.req.json();

      // Zod validation
      const validatedData = HomepageContentValidation.parse(body);

      await db.insert(HomePageContentsTable).values(validatedData);

      return c.json(
        {
          message: "Homepage contents updated successfully",
          data: validatedData,
        },
        201
      );
    } catch (error) {
      console.error("Error in HomePageContents POST:", error);
      if (error instanceof z.ZodError) {
        return c.json(
          {
            error: "Validation error",
            message: error.errors,
          },
          400
        );
      }
      return c.json(
        {
          error: "Internal server error",
          message: "Failed to update homepage contents",
        },
        500
      );
    }
  }
};

export { GetHomePageContents, AddHomePageContents };
