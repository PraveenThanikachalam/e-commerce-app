import { Context, Hono } from "hono";
import CheckAdmin from "../_middlewares/checkAdmin";
import { getAuthUser } from "@hono/auth-js";
import {
  GetHomePageContents,
  AddHomePageContents,
} from "../_controllers/Homepage/homepage_contents";
import { verifyAuth } from "@hono/auth-js";

const HomepageRouter = new Hono();

// Get Homepage Contents
HomepageRouter.get("get-data", GetHomePageContents);

// Add Homepage Contents
HomepageRouter.post(
  "add-data",
  async (c: Context) => {
    const res = await getAuthUser(c);
    console.log("user", res);
  },
  AddHomePageContents
);

export default HomepageRouter;
