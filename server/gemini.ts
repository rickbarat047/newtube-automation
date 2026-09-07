import { GoogleGenAI } from '@google/genai';

let geminiClient: GoogleGenAI | null = null;

export function getGemini(): GoogleGenAI | null {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return null;
  }
  if (!geminiClient) {
    geminiClient = new GoogleGenAI({
      apiKey,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        },
      },
    });
  }
  return geminiClient;
}

export async function generateStructuredJson<T>(
  prompt: string,
  systemInstruction?: string
): Promise<T | null> {
  const ai = getGemini();
  if (!ai) {
    return null;
  }

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
      config: {
        systemInstruction:
          systemInstruction ||
          'You are AutoTube AI, an expert children animation director and YouTube automation architect. Output valid JSON only, without markdown code fences.',
        responseMimeType: 'application/json',
      },
    });

    const text = response.text?.trim();
    if (!text) return null;

    // Handle potential markdown fence if present
    const cleanText = text.replace(/^```json\s*/i, '').replace(/\s*```$/, '').trim();
    return JSON.parse(cleanText) as T;
  } catch (err) {
    console.error('Gemini generateContent error:', err);
    return null;
  }
}
