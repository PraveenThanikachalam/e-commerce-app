import { Hono } from "hono";
import CheckAdmin from "../_middlewares/checkAdmin";
import {
  GetHomePageContents,
  AddHomePageContents,
} from "../_controllers/Homepage/homepage_contents";

const HomepageRouter = new Hono();

// Get Homepage Contents
HomepageRouter.get("get-data", GetHomePageContents);

// Add Homepage Contents
HomepageRouter.post("add-data", CheckAdmin, AddHomePageContents);

export default HomepageRouter;
