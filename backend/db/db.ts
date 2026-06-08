import { Client } from "pg";
import dotenv from "dotenv";
dotenv.config();
export const client = new Client(process.env.DATABASE_URL);

export async function connectDB() {
  await client.connect();
  console.log("Connected to DB");
}
