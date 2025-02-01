import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Context } from "hono";
import * as schema from "../_db/schema";
import { eq } from "drizzle-orm";
import { OAuthUser } from "../_types/OAuthUser";

// Utility function to connect to the database
const connectToDB = (databaseUrl: string) => {
  const sql = neon(databaseUrl);
  return drizzle(sql, { schema });
};

// Check if the user already exists
const isUserAlreadyExists = async (
  db: ReturnType<typeof drizzle>,
  email: string
) => {
  try {
    const userData = await db
      .select()
      .from(schema.users)
      .where(eq(schema.users.email, email));

    console.log(userData);

    const user = {
      isExists: userData.length > 0,
      name: userData[0]?.name,
      userId: userData[0]?.userId,
      role: userData[0]?.role,
      email: userData[0]?.email,
    };

    return user;
  } catch (error) {
    console.error("Error checking user existence:", error);
  }
};

// Update the existing user information (placeholder for implementation)
const updateUser = async (
  db: ReturnType<typeof drizzle>,
  userId: number,
  updateValues: Partial<OAuthUser>
) => {
  try {
    await db
      .update(schema.users)
      .set(updateValues)
      .where(eq(schema.users.userId, userId));
    console.log("Database: User Updated Successfully");
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
};

export { updateUser, isUserAlreadyExists };
