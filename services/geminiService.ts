import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateSmartMessage = async (context: string, senderName: string): Promise<string> => {
  if (!apiKey) {
    console.warn("No API Key provided, returning fallback.");
    return `Hey everyone, ${context}!`;
  }

  try {
    const model = 'gemini-3-flash-preview';
    const prompt = `
      You are an assistant for a group notification app. 
      User "${senderName}" wants to send a notification to their group.
      Context/Intent: "${context}".
      
      Task: Generate a short, punchy, and engaging notification message (max 12 words). 
      If the context implies urgency, make it urgent. If it's fun, make it fun.
      Do not use quotes in the output. Just the message.
    `;

    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    return response.text?.trim() || context;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return context; // Fallback to original text on error
  }
};