import { GoogleGenAI } from '@google/genai';

const apiKey = import.meta.env.VITE_GEMINI_API_KEY || 'DUMMY_KEY_TO_PREVENT_CRASH';
console.log('Gemini API Key loaded (first 5):', apiKey.substring(0, 5) + '...');
const ai = new GoogleGenAI({ apiKey });

const SYSTEM_INSTRUCTION = `You are an AI-powered Learning Companion. 
Your goal is to help the user learn new concepts effectively.
Personalize the content, adapt to the user's pace, and break down complex topics into easy-to-understand chunks.
You must return the response in strict JSON format. 
The JSON must have this exact structure:
{
  "explanation": "A clear, engaging explanation of the topic. Use markdown if helpful.",
  "questions": [
    {
      "id": 1,
      "text": "A multiple-choice question to test understanding.",
      "options": [
        { "id": "a", "text": "Option A text" },
        { "id": "b", "text": "Option B text" },
        { "id": "c", "text": "Option C text" },
        { "id": "d", "text": "Option D text" }
      ],
      "correctAnswer": "a" // must be a, b, c, or d
    }
  ]
}
Provide exactly 2 questions. Do not include any text outside the JSON object. Do not wrap in markdown code blocks.`;

export const generateLesson = async (topic, previousScore = null) => {
  try {
    let prompt = `Teach me about: ${topic}.`;
    if (previousScore !== null) {
      if (previousScore === 2) {
        prompt += ` I scored perfectly on the last quiz. Give me more advanced concepts and harder questions on this topic.`;
      } else {
        prompt += ` I struggled with the last quiz. Please explain it more simply, use analogies, and give easier questions to check my understanding.`;
      }
    }

    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview', // Using standard model id
      contents: [
        { role: 'user', parts: [{ text: SYSTEM_INSTRUCTION }] },
        { role: 'model', parts: [{ text: '{"explanation": "Understood.", "questions": []}' }] },
        { role: 'user', parts: [{ text: prompt }] }
      ]
    });

    let text = response.text.trim();
    // In case model wraps in markdown
    if (text.startsWith('```json')) {
      text = text.replace(/^```json/, '').replace(/```$/, '').trim();
    }
    
    return JSON.parse(text);
  } catch (error) {
    console.error('Error generating lesson from Gemini:', error);
    throw error;
  }
};
