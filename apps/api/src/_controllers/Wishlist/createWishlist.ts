import { Context } from "hono";
import { WishlistValidation } from "../../lib/z.validation";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "../../_db/schema";
import { isUserAlreadyExists } from "../../_db/functions";

const CreateWishlist = async (c: Context) => {
  if (c.req.method === "POST") {
    // Connect to Database
    const sql = neon(c.env.DATABASE_URL!);
    const db = drizzle(sql, { schema });

    try {
      const Wishlist_Data: {
        wishlistName: string;
        email: string;
      } = await c.req.json();

      // Zod Validation
      const validatedData = WishlistValidation.parse(Wishlist_Data);

      // Get User
      const User = await isUserAlreadyExists(db, validatedData.email);

      // Create Wishlist
      const [response] = await db
        .insert(schema.wishlists)
        .values({
          userId: User?.userId || 0,
          wishlistName: validatedData.wishlistName,
        })
        .returning({
          wishlistId: schema.wishlists.wishlistId,
          wishlistName: schema.wishlists.wishlistName,
        });

      console.log(`Wishlist ${response.wishlistName} created successfully`);
      return c.json(response, 200);
    } catch (error) {
      console.error(error);
      return c.json({ error: error }, 500);
    }
  } else {
    console.error("Bad Request");
    return c.json({ error: "Method not allowed" }, 500);
  }
};

export default CreateWishlist;
