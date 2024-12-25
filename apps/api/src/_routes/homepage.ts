import { Hono } from "hono";
import {
  GetHomePageContents,
  AddHomePageContents,
} from "../_controllers/Homepage/homepage_contents";

const HomepageRouter = new Hono();

HomepageRouter.get("get-data", GetHomePageContents);
HomepageRouter.post("add-data", AddHomePageContents);

export default HomepageRouter;
