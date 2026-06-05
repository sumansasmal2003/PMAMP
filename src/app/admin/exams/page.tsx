import { connectToDatabase } from "@/lib/mongodb";
import { ExamCategory } from "@/models/ExamCategory";
import ExamsClient from "./ExamsClient";

export default async function ManageExams() {
  await connectToDatabase();
  const examsDocs = await ExamCategory.find().sort({ createdAt: -1 }).lean();

  const exams = examsDocs.map((doc: any) => ({
    ...doc,
    _id: doc._id.toString(),
  }));

  return <ExamsClient initialExams={exams} />;
}
