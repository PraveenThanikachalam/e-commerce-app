import { Hono } from "hono";
import UpdateUser from "../_controllers/User/updateUser";
import { verifyAuth } from "@hono/auth-js";

const UserRouter = new Hono();

UserRouter.patch("update-user", verifyAuth(), UpdateUser);

export default UserRouter;
