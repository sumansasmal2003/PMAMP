"use server";

import { connectToDatabase } from "@/lib/mongodb";
import { ExamCategory } from "@/models/ExamCategory";
import { Question } from "@/models/Question";
import { revalidatePath } from "next/cache";

// --- EXISTING EXAM ACTIONS ---
export async function createExam(formData: FormData) {
  try {
    await connectToDatabase();
    const subjectsRaw = formData.get("subjects") as string;
    const subjectsArray = subjectsRaw ? subjectsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];

    const newExam = new ExamCategory({
      title: formData.get("title"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      iconName: formData.get("iconName") || "FaLandmark",
      subjects: subjectsArray,
      isActive: true,
    });

    await newExam.save();
    revalidatePath("/admin/exams");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- NEW EXAM ACTIONS ---
export async function updateExam(id: string, formData: FormData) {
  try {
    await connectToDatabase();
    const subjectsRaw = formData.get("subjects") as string;
    const subjectsArray = subjectsRaw ? subjectsRaw.split(",").map(s => s.trim()).filter(Boolean) : [];

    await ExamCategory.findByIdAndUpdate(id, {
      title: formData.get("title"),
      slug: formData.get("slug"),
      description: formData.get("description"),
      iconName: formData.get("iconName"),
      subjects: subjectsArray,
    });
    revalidatePath("/admin/exams");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteExam(id: string) {
  try {
    await connectToDatabase();
    await ExamCategory.findByIdAndDelete(id);
    // Cascade delete associated questions to keep database clean
    await Question.deleteMany({ examCategoryId: id });
    revalidatePath("/admin/exams");
    revalidatePath("/admin/questions");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- EXISTING QUESTION ACTIONS ---
export async function createMultipleQuestions(questions: any[]) {
  try {
    await connectToDatabase();
    await Question.insertMany(questions);
    revalidatePath("/admin/questions");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

// --- NEW QUESTION ACTIONS ---
export async function getQuestionsByExam(examId: string) {
  try {
    await connectToDatabase();
    const questions = await Question.find({ examCategoryId: examId }).sort({ createdAt: -1 }).lean();
    return JSON.parse(JSON.stringify(questions)); // Safe serialization for Client Components
  } catch (error) {
    return [];
  }
}

export async function updateQuestion(id: string, payload: any) {
  try {
    await connectToDatabase();
    await Question.findByIdAndUpdate(id, payload);
    revalidatePath("/admin/questions");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

export async function deleteQuestion(id: string) {
  try {
    await connectToDatabase();
    await Question.findByIdAndDelete(id);
    revalidatePath("/admin/questions");
    return { success: true };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}
