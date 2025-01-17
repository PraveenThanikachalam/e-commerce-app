import { Hono } from "hono";
import UpdateUser from "../_controllers/UserInfo/updateUser";
import CheckAuthentication from "../lib/authenticateToken";

const UserRouter = new Hono();

UserRouter.patch("update-user", CheckAuthentication, UpdateUser);

export default UserRouter;
