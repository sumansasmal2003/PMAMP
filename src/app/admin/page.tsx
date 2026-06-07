import Link from "next/link";
import { connectToDatabase } from "@/lib/mongodb";
import { ExamCategory } from "@/models/ExamCategory";
import { Question } from "@/models/Question";
import { BookOpen, Database, Target, ArrowRight } from "lucide-react";

export const revalidate = 60;

export default async function AdminDashboard() {
  await connectToDatabase();

  const totalExams = await ExamCategory.countDocuments();
  const totalQuestions = await Question.countDocuments();
  const activeExams = await ExamCategory.countDocuments({ isActive: true });

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      <div>
        <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Dashboard Overview</h1>
        <p className="text-slate-500 mt-2 text-lg">Manage your practice platform and track your content.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="p-4 rounded-xl bg-slate-100 text-slate-800">
            <BookOpen size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Total Exams</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{totalExams}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="p-4 rounded-xl bg-blue-50 text-blue-600">
            <Database size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Questions</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{totalQuestions}</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex items-center gap-5">
          <div className="p-4 rounded-xl bg-emerald-50 text-emerald-600">
            <Target size={24} />
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 uppercase tracking-wider">Active Categories</p>
            <p className="text-3xl font-bold text-slate-900 mt-1">{activeExams}</p>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition-colors">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Manage Exams</h2>
          <p className="text-slate-500 mb-8 line-clamp-2">
            Create new examination categories, configure their active statuses, and organize subjects.
          </p>
          <Link
            href="/admin/exams"
            className="inline-flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
          >
            Go to Exams <ArrowRight size={16} />
          </Link>
        </div>

        <div className="group bg-white p-8 rounded-2xl shadow-sm border border-slate-200 hover:border-slate-300 transition-colors">
          <h2 className="text-xl font-bold text-slate-900 mb-2">Manage Questions</h2>
          <p className="text-slate-500 mb-8 line-clamp-2">
            Batch upload practice questions, format multiple-choice options, and write detailed explanations.
          </p>
          <Link
            href="/admin/questions"
            className="inline-flex items-center gap-2 bg-white text-slate-900 border border-slate-200 px-5 py-2.5 rounded-lg font-medium hover:bg-slate-50 transition-all active:scale-95 shadow-sm"
          >
            Go to Questions <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </div>
  );
}
