import { GoogleGenAI } from '@google/genai';
import { env } from '../config/env.js';

let ai: GoogleGenAI | null = null;

export const geminiService = {
  initialize() {
    if (env.GEMINI_API_KEY) {
      ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });
      console.log("[Gemini] Service initialized.");
    } else {
      console.warn("[Gemini] GEMINI_API_KEY is not set. AI analysis will be skipped or mocked.");
    }
  },

  async analyzeCodeDiff(diff: string, prompt: string): Promise<string> {
    if (!ai) {
      return JSON.stringify({ error: "Gemini AI not initialized. Missing API key." });
    }
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `${prompt}\n\nHere is the pull request diff:\n\`\`\`diff\n${diff}\n\`\`\`` }]
          }
        ],
        config: {
          temperature: 0.2,
          responseMimeType: "application/json"
        }
      });
      return response.text || "{}";
    } catch (error: any) {
      console.error("[Gemini] Analysis error:", error);
      throw error;
    }
  },

  async generateSummary(context: any, prompt: string): Promise<string> {
    if (!ai) return "Summary unavailable due to missing API key.";
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: [
          {
            role: 'user',
            parts: [{ text: `${prompt}\n\nContext Data:\n${JSON.stringify(context, null, 2)}` }]
          }
        ],
        config: {
          temperature: 0.5,
        }
      });
      return response.text || "";
    } catch (error: any) {
      console.error("[Gemini] Summary error:", error);
      throw error;
    }
  }
};
