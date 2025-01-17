import { Context } from "hono";
import { verify } from "hono/jwt";

const CheckAuthentication = async (c: Context) => {
  const access_token = c.req.header("access_token");

  if (!access_token) return c.json({ error: "Access Token Required" });

  const decodedPaylaod = await verify(access_token, "asdfasdgasfdasdfa");
};

export default CheckAuthentication;
