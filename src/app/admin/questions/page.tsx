import { connectToDatabase } from "@/lib/mongodb";
import { ExamCategory } from "@/models/ExamCategory";
import QuestionsClient from "./QuestionsClient";

export default async function ManageQuestions() {
  await connectToDatabase();

  // Fetch active exams and their subjects to pass to the client component
  const examsDocs = await ExamCategory.find({ isActive: true }).lean();
  const exams = examsDocs.map((doc: any) => ({
    _id: doc._id.toString(),
    title: doc.title,
    subjects: doc.subjects || [],
  }));

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-900">Manage Questions</h1>
        <p className="text-slate-600">Select an exam, choose a subject, and batch upload practice questions.</p>
      </div>

      <QuestionsClient exams={exams} />
    </div>
  );
}
