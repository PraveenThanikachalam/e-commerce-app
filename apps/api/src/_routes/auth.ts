import { Hono } from "hono";
import { Context } from "hono";

const AuthRouter = new Hono();

AuthRouter.get("/login", (c: Context) => {
  return c.json({ message: "Login successful" }, 200);
});

export default AuthRouter;
