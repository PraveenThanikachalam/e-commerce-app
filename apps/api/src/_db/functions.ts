import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { Context } from "hono";
import * as schema from "../_db/schema";
import { eq } from "drizzle-orm";
import { OAuthUser } from "../_types/OAuthUser";
import { CredValidation } from "../lib/z.validation";

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
      .from(schema.Users)
      .where(eq(schema.Users.email, email));

    console.log(userData);

    const user = {
      isExists: userData.length > 0,
      name: userData[0]?.name,
      email: userData[0]?.email,
    };

    return user;
  } catch (error) {
    console.error("Error checking user existence:", error);
  }
};

// Create a new user if not already exists in the database
const createUser = async (
  db: ReturnType<typeof drizzle>,
  userInfo: OAuthUser
) => {
  try {
    const [user] = await db
      .insert(schema.Users)
      .values({
        name: userInfo.name || "",
        userId: userInfo.userId || "",
        avatar: userInfo.image || "",
        email: userInfo.email || "",
        mobileNumber: userInfo.mobileNumber || 0,
      })
      .returning({ name: schema.Users.name, email: schema.Users.email });

    console.log("Database: User Created Successfully");
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
};

// Update the existing user information (placeholder for implementation)
const updateUser = async (
  db: ReturnType<typeof drizzle>,
  userId: string,
  updateValues: Partial<OAuthUser>
) => {
  try {
    await db
      .update(schema.Users)
      .set(updateValues)
      .where(eq(schema.Users.userId, userId));
    console.log("Database: User Updated Successfully");
  } catch (error) {
    console.error("Error updating user:", error);
    throw new Error("Failed to update user");
  }
};

// Validate and handle user credentials
const credDBValidator = async (c: Context, email: string) => {
  try {
    // Validate user input using Zod
    CredValidation.parse(email);

    // Connect to the database
    const db = connectToDB(c.env.DATABASE_URL!);

    // Check if user already exists
    const userExists = await isUserAlreadyExists(db, email);
    if (userExists) {
      console.log("User already exists");
      return null;
    }

    // Create a new user
    const newUser = await createUser(db, {
      email: email,
      name: "",
      userId: "",
      image: "",
      provider: "",
      mobileNumber: 0,
    });

    // Returns the new created user
    return newUser;
  } catch (error) {
    console.error("Error in credential validation:", error);
    return null;
  }
};

export { createUser, updateUser, credDBValidator, isUserAlreadyExists };
