import { Hono } from "hono";
import CheckAdmin from "../_middlewares/checkAdmin";
import {
  GetHomePageContents,
  AddHomePageContents,
} from "../_controllers/Homepage/homepage_contents";
import { verifyAuth } from "@hono/auth-js";

const HomepageRouter = new Hono();

// Get Homepage Contents
HomepageRouter.get("get-data", GetHomePageContents);

// Add Homepage Contents
HomepageRouter.post("add-data", verifyAuth(), CheckAdmin, AddHomePageContents);

export default HomepageRouter;
