import { Context } from "hono";
import { z } from "zod";
import db from "../../_db";
import { HomePageContentsTable } from "../../_db/schema";

const AllObject = z.object({
  image_url: z.string().url(),
  image_alt: z.string(),
});

const HomepageContentsSchema = z.object({
  popular_categories: z.array(AllObject),
  recent_deals: AllObject,
  popular_products: z.array(AllObject),
  slides: z.array(AllObject),
  popular_with_men: z.array(AllObject),
  popular_with_women: z.array(AllObject),
});

const GetHomePageContents = async (c: Context) => {
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
  if (c.req.method === "POST") {
    try {
      const body = await c.req.json();
      const validatedData = HomepageContentsSchema.parse(body);

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
