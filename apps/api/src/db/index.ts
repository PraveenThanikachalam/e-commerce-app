import { drizzle } from "drizzle-orm/neon-http";

const DB_URL = process.env.DATABASE_URL!;

const db = drizzle(DB_URL);

