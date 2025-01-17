import { Context } from "hono";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "../../_db/schema";
import { eq } from "drizzle-orm";

const UpdateUser = async (c: Context): Promise<Response> => {
  const sql = neon(c.env.DATABASE_URL!);
  const db = drizzle(sql, { schema });

  if (c.req.method === "PATCH") {
    try {
      const UserData = await c.req.json(); // Assuming you're sending user data in the request body
      const { userId, name, email, avatar, mobileNumber } = UserData;

      if (!userId)
        return c.json({ message: "Body doesn't contains userId" }, 400);

      //   Update user logic here
      await db
        .update(schema.Users)
        .set({
          name,
          avatar,
          mobileNumber,
        })
        .where(eq(schema.Users.userId, userId)); // Checks for the unique userId to update the fields

      console.log("User updated successfully");

      return c.json({ message: "User updated successfully" }, 200);
    } catch (error) {
      console.error("Error updating user:", error);
      return c.json({ error: "Failed to update user" }, 500);
    }
  }

  return c.json({ error: "Method not allowed" }, 405); // Handle unsupported methods
};

export default UpdateUser;
