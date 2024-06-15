import express from "express";
import cors from "cors";
import { OpenAI } from "openai";

const app = express();
const port = process.env.PORT || 3005;
const apiKey = process.env.VITE_OPEN_AI_KEY;
const openai = new OpenAI({ apiKey: apiKey });

app.use(cors());
app.use(express.json()); 
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});

let conversationHistory = [];

// Here, we define the '/chatbot' route to handle questions from our frontend React application
app.post("/chatbot", async (req, res) => {
  const { question } = req.body;
  console.log("Received question:", question);
  console.log("Conversation history before:", conversationHistory);

  conversationHistory.push({ role: "user", content: question });

  const response = await openai.chat.completions.create({
    messages: [
      {
        role: "system",
        content: "You are the best friend ever, asking questions and wanting to help.",
      },
      ...conversationHistory,
    ],
    model: "gpt-3.5-turbo", // Ensure this is the correct model name
    max_tokens: 300,
  });

  const chatbotResponse = response.choices[0].message.content;
  conversationHistory.push({ role: "assistant", content: chatbotResponse });
  
  console.log("Chatbot response:", chatbotResponse);
  console.log("Conversation history after:", conversationHistory);

  res.send(chatbotResponse);
});
