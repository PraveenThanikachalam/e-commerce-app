import { Hono } from "hono";
import UpdateUser from "../_controllers/UserInfo/updateUser";

const UserRouter = new Hono();

UserRouter.patch("update-user", UpdateUser);

export default UserRouter;
