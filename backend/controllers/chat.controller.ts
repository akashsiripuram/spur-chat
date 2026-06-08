import { client } from "../db/db.js";
import { getLlmResponse } from "../utils/getLlmResponse.js";
import { getMessages } from "../utils/getMessages.js";
import type { Request,Response } from "express";

export async function sendMessage(req: Request, res: Response) {
  try {
    const { userPrompt, conversation_id } = req.body;

    const context = await getMessages(conversation_id);

    await client.query(
      `INSERT INTO messages(id,conversation_id,role,content)
       VALUES(gen_random_uuid(),$1,$2,$3)`,
      [conversation_id, "USER", userPrompt]
    );

    const aiResponse = await getLlmResponse(userPrompt, context);

    await client.query(
      `INSERT INTO messages(id,conversation_id,role,content)
       VALUES(gen_random_uuid(),$1,$2,$3)`,
      [conversation_id, "AI", aiResponse]
    );

    return res.json({
      aiResponse,
      conversation_id,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      error: "Failed to send message",
    });
  }
}