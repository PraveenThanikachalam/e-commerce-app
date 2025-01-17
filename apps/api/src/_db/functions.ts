import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Context } from "hono";
import * as schema from "../_db/schema";
import { eq } from "drizzle-orm";
import { OAuthUser } from "../_types/OAuthUser";

// Check and create a new user if the user is not already exists in the db
const CreateUser = async (
  c: Context,
  userInfo: OAuthUser
): Promise<boolean> => {
  // Connect to database
  const sql = neon(c.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });
  console.log("Database connected successfully");

  try {
    // Check if the user already exists
    const user = await db
      .select()
      .from(schema.Users)
      .where(eq(schema.Users.email, userInfo.email));

    // console.log("user found:", user);

    if (user.length > 0) {
      // User exists, return true
      return true;
    } else {
      // Insert new user if not exists
      await db.insert(schema.Users).values({
        name: userInfo.name,
        userId: userInfo.userId,
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

// Update the existing user information
const UpdateUser = async (c: Context, values: any) => {
  //Connect to database
};

// Export the function
export { CreateUser, UpdateUser };
