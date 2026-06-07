import { GoogleGenAI } from '@google/genai';
import { NextResponse } from 'next/server';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(req: Request) {
  try {
    const { questions, answers, score } = await req.json();

    const prompt = `
      A student just completed a 50-question mock test. They scored ${score} out of 50.
      Here is the raw data of the questions and their specific answers:
      Questions: ${JSON.stringify(questions)}
      Student Answers (mapped by question index): ${JSON.stringify(answers)}

      Analyze their performance based on the subjects and topics provided in the question data.
      Act as an encouraging but realistic mentor. Tell the user:
      1. Their strongest subjects.
      2. Their weakest subjects/topics based on the ones they got wrong.
      3. A specific 3-step actionable plan on what they need to do to crack the exam better next time.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
    });

    return NextResponse.json({ feedback: response.text });

  } catch (error) {
    console.error("Analysis failed:", error);
    return NextResponse.json({ error: "Failed to analyze results" }, { status: 500 });
  }
}
