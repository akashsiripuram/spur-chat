import express from "express";
import {
  createConversation,
  getConversation,
} from "../controllers/conversation.controller.js";

const conversationRouter = express.Router();

conversationRouter.post("/createConversation", createConversation);
conversationRouter.get("/:conversationId", getConversation);

export default conversationRouter;
