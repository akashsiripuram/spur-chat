import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { connectDB } from "./db/db.js";
import chatRouter from "./routes/chatRoutes.js";
import conversationRouter from "./routes/conversationRoutes.js";
const app = express();
const port = process.env.PORT || 3000;
await connectDB();

app.use(express.json());
app.use((_req, res, next) => {
  res.header("Access-Control-Allow-Origin", "http://localhost:5173");
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
  res.send("Running at port 3000000");
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
