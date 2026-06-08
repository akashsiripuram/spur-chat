import express from "express";
import { sendMessage } from "../controllers/chat.controller.js";


const chatRouter = express.Router();

chatRouter.post("/", sendMessage);



export default chatRouter;