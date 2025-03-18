import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL environment variable is not set");
}

// Create postgres connection with SSL enabled
const client = postgres(process.env.DATABASE_URL, { 
  max: 10,
  idle_timeout: 30,
  ssl: "require"  // Add SSL requirement
});

// Create drizzle instance
export const db = drizzle(client);
