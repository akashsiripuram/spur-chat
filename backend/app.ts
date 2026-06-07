import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { getLlmResponse } from "./utils/getLlmResponse.js";
import { Client } from "pg";
const app = express();
const port = process.env.PORT || 3000;
const client = await new Client(process.env.DATABASE_URL);
client
  .connect()
  .then(() => console.log("Connected to DB"))
  .catch(() => console.log("Error connecting to DB"));

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

app.post("/chat/createConversation", async (req, res) => {
   const created = await client.query(
    `
    INSERT INTO conversations (id, created_at)
    VALUES (gen_random_uuid(), NOW())
    RETURNING id  
    `
  );

  return res.json({
    conversation_id: created.rows[0].id,
  
  });
});
app.get("/chat/:conversationId", async (req, res) => {
  try {
    const conversationId = req.params.conversationId;

    const messages = await client.query(
      `
      SELECT *
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      `,
      [conversationId]
    );

    return res.json({
      conversation_id: conversationId,
      messages: messages.rows,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      error: "Failed to fetch messages",
    });
  }
});
app.post("/chat/message", async (req, res) => {
  const userPrompt: string = req.body.userPrompt;
  const conversation_id: string = req.body.conversation_id;
  await client.query(
    `INSERT INTO MESSAGES(id,conversation_id,role,content) values (gen_random_uuid(),$1,$2,$3)`,
    [conversation_id, "USER", userPrompt],
  );

  const aiResponse: string = await getLlmResponse(req.body.userPrompt);

  await client.query(
    `INSERT INTO MESSAGES(id,conversation_id,role,content) values (gen_random_uuid(),$1,$2,$3)`,
    [conversation_id, "AI", aiResponse],
  );

  return res.json({
    aiResponse,
    conversation_id,
  });
});
app.get("/", (_req, res) => {
  res.send("Running at port 3000000");
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
