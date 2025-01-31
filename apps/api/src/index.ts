import { Context, Hono } from "hono";
import HomepageRouter from "./_routes/homepage";
import notFound from "./pages/404";
import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import Google from "@auth/core/providers/google";
import { cors } from "hono/cors";
import { isUserAlreadyExists } from "./_db/functions";
import createUser from "./_controllers/User/createUser";
import UserRouter from "./_routes/user";
import { OAuthUser } from "./_types/OAuthUser";
import Credentials from "@auth/core/providers/credentials";
import * as schema from "./_db/schema";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { CredValidation } from "./lib/z.validation";
import { v4 } from "uuid";
import ProductRouter from "./_routes/product";
export interface Bindings {
  AUTH_SECRET: string;
  CLIENT_ID: string;
  CLIENT_SECRET: string;
  DATABASE_URL: string;
}

const app = new Hono<{ Bindings: Bindings }>();

// CORS Middleware
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

// Home Route
app.get("/", (c) => {
  return c.text("Hello Praveen!");
});

// Initialize Authentication Configuration
app.use(
  initAuthConfig((c: Context) => ({
    basePath: "/api/auth",
    secret: c.env.AUTH_SECRET || process.env.AUTH_SECRET,
    providers: [
      Credentials({
        credentials: {
          email: { label: "Email" },
          userName: { label: "Name" },
        },
        async authorize({ email, userName }) {
          //Connect to Database
          const sql = neon(c.env.DATABASE_URL!);
          const db = drizzle(sql, { schema });

          // Email validation
          if (!email) {
            return Error("Email field is empty");
          }

          // Zod validation
          const validatedData = CredValidation.parse({ email, userName });

          // Checks the user is already exists not not
          const User = await isUserAlreadyExists(db, validatedData.email);

          // If user doesn't exists, it will create the new user with email
          if (!User?.isExists) {
            return await createUser(
              db,
              {
                name: validatedData.userName,
                email: validatedData.email,
                userId: v4(),
                image: "",
                role: "USER",
                provider: "Credentails",
                mobileNumber: 0,
              },
              schema.Users
            );
          }

          console.log("User already exists");
          throw new Error("User already exists");
        },
      }),
      Google({
        clientId: c.env.CLIENT_ID || process.env.CLIENT_ID,
        clientSecret: c.env.CLIENT_SECRET || process.env.CLIENT_SECRET,
      }),
    ],
    callbacks: {
      async signIn({ user, account, profile }) {
        //Connect to Database
        const sql = neon(c.env.DATABASE_URL!);
        const db = drizzle(sql, { schema });

        // Creating based on the uniqueness of the EmailId
        if (user && "email" in user) {
          const oauthUser: OAuthUser = {
            name: user.name || "",
            image: user.image || "",
            role: "USER",
            email: user.email || "",
            userId: user.id || "",
            mobileNumber: parseInt(profile?.phone_number || "0", 10),
            provider: account?.provider || "",
          };

          const userExists = await isUserAlreadyExists(db, oauthUser.email);

          if (!userExists?.isExists) {
            await createUser(db, oauthUser, schema.Users);
          }

          if (userExists?.role === "USER") {
            console.log("User already exists", userExists);
            console.log("User logged in successfully");
            return true;
          }

          console.log("User not allowed to login");
          return false;
        } else {
          console.error("Invalid user object during sign-in", user);
          return false;
        }
      },
    },
  }))
);

// API Routes
app.route("/api/homepage", HomepageRouter);

// Authentication Routes
app.use("/api/auth/*", authHandler());

// Protect the `/api/user-info` route
app.use("/api/user-info", verifyAuth());
app.route("/api/user-info", UserRouter);

// Product Route '/api/product'
app.route("/api/product", ProductRouter);

// Protect all other /api routes except /api/homepage and /api/auth
app.use("/api/*", async (c, next) => {
  if (
    c.req.path.startsWith("/api/homepage") ||
    c.req.path.startsWith("/api/product")
  ) {
    return next();
  }
  return verifyAuth()(c, next);
});

// Protected Route
app.use("/api/protected", async (c) => {
  const authInfo = c.get("authUser");
  console.log(authInfo);
  return c.json(authInfo);
});

// 404 Not Found
app.notFound((c) => {
  return c.html(notFound);
});

export default {
  port: 8080,
  fetch: app.fetch,
};
