import dotenv from "dotenv";
dotenv.config();

import express from "express";
import { connectDB } from "./db/db.js";
import chatRouter from "./routes/chatRoutes.js";
import conversationRouter from "./routes/conversationRoutes.js";

const app = express();
const port = process.env.PORT || 3000;

const CLIENT_URL =
  process.env.CLIENT_URL || "http://localhost:5173";

app.use(express.json());

app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", CLIENT_URL);
  res.header("Access-Control-Allow-Headers", "Content-Type");
  res.header("Access-Control-Allow-Methods", "GET,POST,OPTIONS");

  if (_req.method === "OPTIONS") {
    return res.sendStatus(204);
  }

  next();
});

app.use("/chat", conversationRouter);
app.use("/chat/message", chatRouter);

app.get("/", (_req, res) => {
  res.send("API is running");
});

app.get("/health", (_req, res) => {
  res.json({ status: "ok" });
});

async function start() {
  try {
    await connectDB();

    app.listen(port, () => {
      console.log(`Server running on port ${port}`);
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
}

start();