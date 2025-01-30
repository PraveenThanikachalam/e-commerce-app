import { drizzle } from "drizzle-orm/neon-http";
import { OAuthUser } from "../../_types/OAuthUser";
import { Users } from "../../_db/schema";
import { CreateUserValidation } from "../../lib/z.validation";

const createUser = async (
  db: ReturnType<typeof drizzle>,
  userInfo: OAuthUser,
  userSchema: typeof Users
) => {
  //Validating the user information
  const validatedData = CreateUserValidation.parse(userInfo);
  try {
    const [user] = await db
      .insert(userSchema)
      .values({
        name: validatedData.name || "",
        userId: validatedData.userId || "",
        role: validatedData.role || "USER",
        avatar: validatedData.avatar || "",
        email: validatedData.email || "",
        mobileNumber: validatedData.mobileNumber || 0,
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
