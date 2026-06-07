import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

// Initialize the Gemini SDK
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Note: Generating 50 questions might take time. If hosting on Vercel,
// you may need to increase the max duration of this function in your next.config.
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const { examName, subjects } = await req.json();

    const prompt = `
      You are an expert exam setter for the ${examName} exam.
      Generate a mock test consisting of exactly 50 best multiple-choice questions.
      The questions must be evenly distributed across these subjects: ${subjects.join(', ')}.

      Return ONLY a valid JSON array of objects with the following exact structure, with no markdown formatting or extra text:
      [
        {
          "subject": "Name of subject",
          "topic": "Specific topic",
          "questionText": "The question string",
          "options": { "a": "Option A", "b": "Option B", "c": "Option C", "d": "Option D" },
          "correctOption": "a" // must be a, b, c, or d
        }
      ]
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
      }
    });

    const responseText = response.text;
    const questions = JSON.parse(responseText || "[]");
    return NextResponse.json({ questions });

  } catch (error) {
    console.error("Test generation failed:", error);
    return NextResponse.json({ error: "Failed to generate test" }, { status: 500 });
  }
}
