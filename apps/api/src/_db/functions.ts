import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Context } from "hono";
import * as schema from "../_db/schema";
import { Users as users } from "../_db/schema";
import { eq } from "drizzle-orm";

const CreateUser = async (c: Context, userInfo: any): Promise<boolean> => {
  const sql = neon(c.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  try {
    // Check if the user already exists
    const user = await db
      .select()
      .from(users)
      .where(eq(users.email, userInfo.email));

    // console.log("user found:", user);

    if (user.length > 0) {
      // User exists, return true
      return true;
    } else {
      // Insert new user if not exists
      await db.insert(users).values({
        name: userInfo.name,
        userId: userInfo.id || null,
        avatar: userInfo.image,
        email: userInfo.email,
      });
      console.log("Database: User Created Successfully");
      return false; // User did not exist, now created
    }
  } catch (error) {
    console.error("Database error:", error);
    return false; // Return false in case of error
  }
};

// Export the function
export default CreateUser;
