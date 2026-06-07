import dotenv from "dotenv";
dotenv.config();
import express from "express";
import { getLlmResponse } from "./utils/getLlmResponse.js";

const app = express();
const port = process.env.PORT || 3000;

app.use(express.json())

app.post("/chat/message",async (req,res)=>{
    let reply:string=await getLlmResponse(req.body.userPrompt);
    let sessionId:string="";
    return res.json({
        reply,sessionId
    });
})
app.get("/", (_req, res) => {
  res.send("Running at port 3000000");
});
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
