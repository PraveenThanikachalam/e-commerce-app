import { createMiddleware } from "hono/factory";

import { Context, Next } from "hono";
import { verifyAuth } from "@hono/auth-js";

export const GetUser = createMiddleware(async (c: Context, next: Next) => {
  try {
    const user = c.get("authUser");
    const authuser = verifyAuth();
    console.log("authUser", authuser);
    console.log("auth user", user);
    await next();
  } catch (error) {
    console.log(error);
    return c.json({ error }, 500);
  }
});
