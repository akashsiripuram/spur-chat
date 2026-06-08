import { client } from "../db/db.js";
import type { Request, Response } from "express";
import { getMessages } from "../utils/getMessages.js";

export async function getConversation(req: Request, res: Response) {
  try {
    const conversationId = req.params.conversationId as string;

    if (!conversationId) {
      return res.status(400).json({
        success: false,
        error: "conversationId is required",
      });
    }

    const messages = await getMessages(conversationId);

    return res.status(200).json({
      success: true,
      conversation_id: conversationId,
      messages,
    });
  } catch (error) {
    console.error("Error fetching conversation:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to fetch conversation",
    });
  }
}
export async function createConversation(req: Request, res: Response) {
  try {
    const created = await client.query(
      `
      INSERT INTO conversations (id, created_at)
      VALUES (gen_random_uuid(), NOW())
      RETURNING id
      `
    );

    return res.status(201).json({
      success: true,
      conversation_id: created.rows[0].id,
    });
  } catch (error) {
    console.error("Error creating conversation:", error);

    return res.status(500).json({
      success: false,
      error: "Failed to create conversation",
    });
  }
}