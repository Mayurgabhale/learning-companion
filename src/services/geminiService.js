import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'DUMMY_KEY_TO_PREVENT_CRASH';
const ai = new GoogleGenAI(apiKey);

const SOCRATIC_SYSTEM_INSTRUCTION = `You are an expert Socratic Tutor. Your goal is to help users learn deeply by guiding them through a topic in small, interactive steps.

Rules:
1. Explain in small steps (max 2-3 sentences per step).
2. After each step, ask exactly ONE conversational question to check understanding.
3. If the user is correct, congratulate them briefly and go slightly deeper into the concept.
4. If the user is wrong, be encouraging and simplify the explanation using a relatable analogy.
5. Keep the tone conversational, engaging, and professional.
6. You must return your response in strict JSON format.

JSON Structure:
{
  "explanation": "Your concise explanation or feedback.",
  "question": "Your follow-up question to check understanding.",
  "options": [
    {"id": "a", "text": "Option A"},
    {"id": "b", "text": "Option B"},
    {"id": "c", "text": "Option C"},
    {"id": "d", "text": "Option D"}
  ],
  "correctAnswer": "a", // must be a, b, c, or d
  "isTopicComplete": false // set to true only when the topic is fully covered
}`;

export const startSocraticSession = async (topic) => {
  const model = ai.getGenerativeModel({ 
    model: 'gemini-3-flash-preview',
    systemInstruction: SOCRATIC_SYSTEM_INSTRUCTION
  });

  const chat = model.startChat({
    history: [],
    generationConfig: {
      responseMimeType: "application/json",
    },
  });

  const result = await chat.sendMessage(`I want to learn about: ${topic}. Start with the first basic concept.`);
  const response = await result.response;
  return {
    chat,
    data: JSON.parse(response.text())
  };
};

export const continueSocraticSession = async (chat, userResponse) => {
  const result = await chat.sendMessage(userResponse);
  const response = await result.response;
  return JSON.parse(response.text());
};
