import Groq from "groq-sdk";
import dotenv from 'dotenv';

dotenv.config();  // This will load variables from your .env file

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export async function main() {
  try {
    console.log('Loaded API Key:', process.env.GROQ_API_KEY);
    const chatCompletion = await getGroqChatCompletion();
    console.log(chatCompletion.choices[0]?.message?.content || "No content returned");
  } catch (error) {
    console.error("Error in main:", error);
  }
}

export async function getGroqChatCompletion() {
  try {
    return await groq.chat.completions.create({
      messages: [
        {
          role: "user",
          content: "give me a short poem",
        },
      ],
      model: "llama3-8b-8192",
    });
  } catch (error) {
    console.error("Error in getGroqChatCompletion:", error);
  }
}