import { NextResponse } from "next/server";
import { connectToDatabase } from "@/lib/mongodb";
import { ExamCategory } from "@/models/ExamCategory";

export async function GET() {
  try {
    await connectToDatabase();

    // Fetch only active exams
    const exams = await ExamCategory.find({ isActive: true }).lean();

    return NextResponse.json(exams);
  } catch (error) {
    console.error("Failed to fetch exams:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
