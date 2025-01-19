// Create a new user if not already exists in the database
import { drizzle } from "drizzle-orm/neon-http";
import { OAuthUser } from "../../_types/OAuthUser";
import { Users } from "../../_db/schema";

const createUser = async (
  db: ReturnType<typeof drizzle>,
  userInfo: OAuthUser,
  userSchema: typeof Users
) => {
  try {
    const [user] = await db
      .insert(userSchema)
      .values({
        name: userInfo.name || "",
        userId: userInfo.userId || "",
        avatar: userInfo.image || "",
        email: userInfo.email || "",
        mobileNumber: userInfo.mobileNumber || 0,
      })
      .returning({ name: userSchema.name, email: userSchema.email });

    console.log("Database: User Created Successfully");
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
};

export default createUser;
