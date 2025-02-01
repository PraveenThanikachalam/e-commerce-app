import { drizzle } from "drizzle-orm/neon-http";
import { OAuthUser } from "../../_types/OAuthUser";
import * as schema from "../../_db/schema";
import { CreateUserValidation } from "../../lib/z.validation";

const createUser = async (
  db: ReturnType<typeof drizzle>,
  userInfo: OAuthUser
) => {
  //Validating the user information
  const validatedData = CreateUserValidation.parse(userInfo);
  try {
    const [user] = await db
      .insert(schema.users)
      .values(userInfo)
      .returning({ name: schema.users.name, email: schema.users.email });

    console.log("Database: User Created Successfully");
    return user;
  } catch (error) {
    console.error("Error creating user:", error);
    throw new Error("Failed to create user");
  }
};

export default createUser;
