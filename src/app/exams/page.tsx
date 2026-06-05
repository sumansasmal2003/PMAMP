import { connectToDatabase } from "@/lib/mongodb";
import { ExamCategory } from "@/models/ExamCategory";
import ExamListClient from "./ExamListClient";

export const revalidate = 3600; // Cache for an hour

export default async function ExamsPage() {
  await connectToDatabase();

  const categoriesDocs = await ExamCategory.find({ isActive: true }).sort({ createdAt: -1 }).lean();

  const categories = categoriesDocs.map((doc: any) => ({
    _id: doc._id.toString(),
    title: doc.title,
    slug: doc.slug,
    description: doc.description,
    iconName: doc.iconName,
    subjects: doc.subjects || [],
  }));

  return (
    <div className="flex flex-col w-full min-h-screen bg-slate-50 py-16">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full">
        <div className="max-w-3xl mb-12">
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-5xl mb-4">
            Browse All <span className="text-blue-600">Examinations</span>
          </h1>
          <p className="text-lg text-slate-600">
            Select your target examination to access open mock tests and daily practice questions.
          </p>
        </div>

        <ExamListClient categories={categories} />
      </div>
    </div>
  );
}
