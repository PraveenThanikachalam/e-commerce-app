import { Context, Hono } from "hono";
import HomepageRouter from "./_routes/homepage";
import notFound from "./pages/404";
import { authHandler, initAuthConfig, verifyAuth } from "@hono/auth-js";
import Google from "@auth/core/providers/google";
import { cors } from "hono/cors";
import {
  createUser,
  credDBValidator,
  isUserAlreadyExists,
  updateUser,
} from "./_db/functions";
import UserRouter from "./_routes/user";
import { OAuthUser } from "./_types/OAuthUser";
import Credentials from "@auth/core/providers/credentials";
import * as schema from "./_db/schema";
import { string, z } from "zod";
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { password } from "bun";

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
        },
        async authorize({ email }) {
          //Connect to Database
          const sql = neon(c.env.DATABASE_URL!);
          const db = drizzle(sql, { schema });

          // Email validation
          if (!email) {
            return Error("Email field is empty");
          }

          // Checks the user is already exists not not
          const User = await isUserAlreadyExists(db, email.toString());

          // If user doesn't exists, it will create the new user with email
          if (!User?.isExists) {
            return await createUser(db, {
              name: "",
              email: email.toString(),
              userId: "",
              image: "",
              provider: "",
              mobileNumber: 0,
            });
          }

          // If the user is already exsits, it will let the user to login
          return User;
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
            email: user.email || "",
            userId: user.id || "",
            mobileNumber: parseInt(profile?.phone_number || "0", 10),
            provider: account?.provider || "",
          };

          const userExists = await isUserAlreadyExists(db, oauthUser.email);

          if (!userExists) {
            await createUser(db, oauthUser);
          }

          console.log("User logged in successfully");
          return true;
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
app.route("/api/user-info", UserRouter);

// Authentication Routes
app.use("/api/auth/*", authHandler());
app.use("/api/*", verifyAuth());

// Protected Route
app.use("/api/protected", async (c) => {
  const authInfo = c.get("authUser");
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
