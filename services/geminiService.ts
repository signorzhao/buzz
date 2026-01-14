
import { GoogleGenAI } from "@google/genai";

// Fix: Correctly initialize GoogleGenAI with process.env.API_KEY as per instructions
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export const generateSmartMessage = async (context: string, senderName: string): Promise<string> => {
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

    // Fix: Using correct direct model and prompt call
    const response = await ai.models.generateContent({
      model,
      contents: prompt,
    });

    // Fix: Access response.text property directly
    return response.text?.trim() || context;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return context; // Fallback to original text on error
  }
};
