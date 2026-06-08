import { client } from "../db/db.js";
export async function getMessages(conversationId: string) {
  const messages = await client.query(
    `
      SELECT *
      FROM messages
      WHERE conversation_id = $1
      ORDER BY created_at ASC
      `,
    [conversationId],
  );
  return messages.rows;
}
