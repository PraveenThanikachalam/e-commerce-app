import { Context } from "hono";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../../_db/schema";
import { eq } from "drizzle-orm";
import { isUserAlreadyExists } from "../../_db/functions";
import { UpdateUserVlidation } from "../../lib/z.validation";

const UpdateUser = async (c: Context): Promise<Response> => {
  const sql = neon(c.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  if (c.req.method === "PATCH") {
    try {
      const UserData = await c.req.json();

      // Zod validation
      const validatedData = UpdateUserVlidation.parse(UserData);

      // Check the user is already existed or not
      const User = await isUserAlreadyExists(db, validatedData.email);

      if (User?.isExists) {
        //   Update user logic here
        const response = await db
          .update(schema.Users)
          .set({
            name: validatedData.name,
            avatar: validatedData.avatar,
            mobileNumber: validatedData.mobileNumber,
          })
          .where(eq(schema.Users.id, User.userId)); // Checks for the unique userId to update the fields
        console.log("User updated successfully");
      } else {
        console.log("User not exists");
      }

      // if (!userId)
      //   return c.json({ message: "Body doesn't contains userId" }, 400);

      return c.json({ message: "User updated successfully" }, 200);
    } catch (error) {
      console.error("Error updating user:", error);
      return c.json({ error: "Failed to update user" }, 500);
    }
  }

  return c.json({ error: "Method not allowed" }, 405); // Handle unsupported methods
};

export default UpdateUser;
