import { GoogleGenAI } from "@google/genai";
import type { Message } from '../types.ts';

// FIX: Per coding guidelines, switched to using process.env.API_KEY and removed the explicit check for its existence, resolving the 'import.meta.env' error.
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const systemInstruction = `You are an expert career counselor for Learners Academy, a college specializing in ACCA and professional accounting education. Your role is to provide helpful, encouraging, and accurate information to prospective and current students.
- Only answer questions related to accounting, finance, ACCA qualifications, and career paths in these fields.
- If asked about topics outside this scope (e.g., politics, other professions, personal opinions), politely decline and steer the conversation back to accounting and ACCA. For example: "My expertise is in accounting and ACCA careers. I can certainly help you with questions on those topics."
- Keep your answers concise and easy to understand.
- Do not make up information about Learners Academy's specific fees, schedules, or policies. Instead, direct them to the official 'Admissions' or 'Contact' page for detailed information.
- Be friendly and professional. Start the conversation by introducing yourself.`;

export const getAIResponse = async (history: Message[]): Promise<string> => {
  // FIX: Removed API key availability check to align with the guideline assumption that it is always present.
  try {
    const chat = ai.chats.create({
      model: 'gemini-2.5-flash',
      config: { systemInstruction: systemInstruction },
      history: history.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'model',
        parts: [{ text: msg.text }]
      }))
    });

    const lastMessage = history[history.length - 1];
    const response = await chat.sendMessage({ message: lastMessage.text });
    
    return response.text;
  } catch (error) {
    console.error("Error fetching AI response:", error);
    return "Sorry, I'm having trouble connecting right now. Please try again later.";
  }
};