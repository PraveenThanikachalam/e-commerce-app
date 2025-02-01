import { Context, Hono, Next } from "hono";
import CheckAdmin from "../_middlewares/checkAdmin";
import {
  GetHomePageContents,
  AddHomePageContents,
} from "../_controllers/Homepage/homepage_contents";
import { getAuthUser, verifyAuth } from "@hono/auth-js";

const HomepageRouter = new Hono();

// Get Homepage Contents
HomepageRouter.get("get-data", CheckAdmin, GetHomePageContents);

// Add Homepage Contents
HomepageRouter.post("add-data", verifyAuth(), AddHomePageContents);

export default HomepageRouter;
