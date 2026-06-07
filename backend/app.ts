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

app.post("/chat/createConversation", async (req, res) => {
  const createdTime = new Date();
  const created = await client.query(
    `INSERT INTO conversations (id,created_at) VALUES (gen_random_uuid(), $1)`,
    [createdTime],
  );
  return res.json({
    created,
  });
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
