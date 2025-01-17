import { Context, Hono } from "hono";
import HomepageRouter from "./_routes/homepage";
import notFound from "./pages/404";
import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import Google from "@auth/core/providers/google";
import { cors } from "hono/cors";
import { CreateUser } from "./_db/functions";
import UserRouter from "./_routes/user";
import { OAuthUser } from "./_types/OAuthUser";
import { getCookie, setCookie } from "hono/cookie";
import CheckAuthentication from "./lib/authenticateToken";
import Credentials from "@auth/core/providers/credentials";
export interface Bindings {
  AUTH_SECRET: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  DATABASE_URL: string;
}

const app = new Hono<{ Bindings: Bindings }>();

// CORS middleware
app.use(
  "*",
  cors({
    origin: "http://localhost:3000",
    allowHeaders: ["X-Custom-Header", "Upgrade-Insecure-Requests"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    exposeHeaders: ["Content-Length", "X-Kuma-Revision"],
    maxAge: 600,
    credentials: true,
  })
);

app.get("/", (c) => {
  return c.text("Hello Praveen!");
});

app.use(
  initAuthConfig((c: Context) => ({
    basePath: "/api/auth", // This matches the base path for authentication routes
    secret: c.env.AUTH_SECRET || process.env.AUTH_SECRET,
    // pages: {
    //   signIn: "http://localhost:3000/auth/login", // to not showup the default authjs screen
    // },
    providers: [
      Credentials({
        credentials: {
          username: { label: "Username" },
          password: { label: "Password", type: "password" },
        },
        async authorize({ username, password }) {
          // Implement your user validation logic here
          // For example, check against a database or a hardcoded user
          if (username === "praveen" && password === "praveen") {
            const User = { name: "praveen" };
            return User; // Return a user object
          }
          return null; // Return null if credentials are invalid
        },
      }),
      Google({
        clientId: c.env.CLIENT_ID || process.env.CLIENT_ID,
        clientSecret: c.env.CLIENT_SECRET || process.env.CLIENT_SECRET,
      }),
    ],
    callbacks: {
      async signIn({ user, account, profile }) {
        const OauthUser: OAuthUser = {
          name: user.name!,
          image: user?.image!,
          email: user.email!,
          userId: user.id!,
          mobileNumber: parseInt(profile?.phone_number!, 10),
          provider: account?.provider!,
        };

        const findUser = await CreateUser(c, OauthUser);

        if (findUser) {
          console.log("User Already exists");
        }

        console.log("User Logged in Successfully");
        return true;
      },
    },
  }))
);

app.route("/api/homepage", HomepageRouter);

app.route("/api/user-info", UserRouter);

app.use("/api/auth/*", authHandler());

app.use("/api/*", verifyAuth());

// route is protected or not
app.use("/api/protected", async (c) => {
  const authInfo = c.get("authUser");
  console.log("Context Keys and Values:", c.req.raw);
  return c.json(authInfo, 200);
});

// incase of not-found 404 pages
app.notFound((c) => {
  return c.html(notFound);
});

export default {
  port: 8080,
  fetch: app.fetch,
};
