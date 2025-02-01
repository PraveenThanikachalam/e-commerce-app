import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Context } from "hono";
import * as schema from "../../_db/schema";
import { AddProductValidation } from "../../lib/z.validation";

export default async function AddProduct(c: Context): Promise<Response> {
  try {
    if (c.req.method !== "POST")
      return c.json({ error: "Invalid Method" }, 405);

    // Connect to Database
    const sql = neon(c.env.DATABASE_URL!);
    const db = drizzle(sql, { schema });

    const body = await c.req.json();

    // Zod validation
    const validatedData = AddProductValidation.parse(body);

    const [product] = await db
      .insert(schema.Products)
      .values({
        title: validatedData.title,
        brand: validatedData.brand,
        price: validatedData.price,
        description: validatedData.description,
        imageUrls: validatedData.imageUrls,
      })
      .returning({
        title: schema.Products.title,
        brand: schema.Products.brand,
        price: schema.Products.price,
      });

    return c.json({ message: "Added product successfully", product }, 200);
  } catch (error) {
    return c.json({ error }, 500);
  }
}
