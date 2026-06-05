import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import { ExamCategory } from "@/models/ExamCategory";
import { Question } from "@/models/Question";
import { FiBookOpen, FiDatabase, FiPlusCircle, FiArrowRight } from "react-icons/fi";

// Revalidate this page every 60 seconds so stats stay relatively fresh
export const revalidate = 60;

export default async function AdminDashboard() {
  await connectToDatabase();

  // Fetch quick stats from the database
  const totalExams = await ExamCategory.countDocuments();
  const totalQuestions = await Question.countDocuments();
  const activeExams = await ExamCategory.countDocuments({ isActive: true });

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900">Dashboard Overview</h1>
        <p className="text-slate-600 mt-2">Manage your open-access practice platform and track your content.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sky-100 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-blue-50 text-blue-600">
            <FiBookOpen className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Exams</p>
            <p className="text-2xl font-bold text-slate-900">{totalExams}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sky-100 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600">
            <FiDatabase className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Total Questions</p>
            <p className="text-2xl font-bold text-slate-900">{totalQuestions}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-sky-100 flex items-center gap-4">
          <div className="p-4 rounded-xl bg-amber-50 text-amber-600">
            <FiPlusCircle className="text-2xl" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Active Categories</p>
            <p className="text-2xl font-bold text-slate-900">{activeExams}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-sky-100">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Manage Exams</h2>
          <p className="text-slate-600 mb-6 h-12">
            Create new examination categories like UPSC, SSC, or Banking, and manage existing ones.
          </p>
          <Link
            href="/admin/exams"
            className="inline-flex items-center gap-2 bg-blue-600 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-blue-700 transition-colors"
          >
            Go to Exams <FiArrowRight />
          </Link>
        </div>

        <div className="bg-white p-8 rounded-2xl shadow-sm border border-sky-100">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Manage Questions</h2>
          <p className="text-slate-600 mb-6 h-12">
            Add practice questions, multiple-choice options, and detailed explanations for subjects.
          </p>
          <Link
            href="/admin/questions"
            className="inline-flex items-center gap-2 bg-white text-blue-600 border border-blue-200 px-5 py-2.5 rounded-lg font-medium hover:bg-blue-50 transition-colors"
          >
            Go to Questions <FiArrowRight />
          </Link>
        </div>
      </div>
    </div>
  );
}
