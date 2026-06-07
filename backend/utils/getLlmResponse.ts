import Groq from "groq-sdk";
import dotenv from "dotenv";
dotenv.config();
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY});

export async function getLlmResponse(userPrompt:string) : Promise<string>{
  const completion = await getGroqChatCompletion(userPrompt);
  return completion.choices[0]?.message.content || "";
}

const getGroqChatCompletion = async (msg:string) => {
  return groq.chat.completions.create({
    messages: [
    
      {
        role: "system",
        content: "You are a helpful assistant.",
      },
      {
        role: "user",
        content: msg,
      },
    ],
    model: "openai/gpt-oss-20b",
  });
};

