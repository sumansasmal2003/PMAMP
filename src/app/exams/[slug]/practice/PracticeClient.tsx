"use client";

import { CheckCircle2, ArrowLeft, BookOpen } from "lucide-react";
import Link from "next/link";

interface QuestionType {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
}

interface PracticeProps {
  exam: {
    title: string;
    slug: string;
    selectedSubject?: string; // নতুন যোগ করা হলো
  };
  questions: QuestionType[];
}

export default function PracticeClient({ exam, questions }: PracticeProps) {
  // যদি কোনো প্রশ্ন না থাকে
  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Questions Found</h2>
          <p className="text-slate-600 mb-6">We are still adding questions for {exam.title}.</p>
          <Link
            href={`/exams/${exam.slug}`}
            className="inline-block bg-slate-900 text-white px-6 py-3 rounded-full font-medium"
          >
            Go Back
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-7xl mx-auto">

        {/* Header Section */}
        <div className="mb-10 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <Link
              href={`/exams/${exam.slug}`}
              className="inline-flex items-center text-slate-500 hover:text-slate-900 transition-colors mb-3 text-sm font-medium"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Exam Details
            </Link>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 flex flex-wrap items-center gap-3">
              <BookOpen className="w-7 h-7 text-slate-700" />
              {exam.title}
              {exam.selectedSubject && exam.selectedSubject !== "All Subjects" && (
                <span className="text-sm font-semibold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200 mt-1 sm:mt-0">
                  {exam.selectedSubject}
                </span>
              )}
            </h1>
          </div>
          <div className="text-sm font-semibold text-slate-600 bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm">
            Total Questions: {questions.length}
          </div>
        </div>

        {/* Study Layout: Book-like 2 Columns */}
        <div className="columns-1 xl:columns-2 gap-8">
          {questions.map((q, index) => (
            <div
              key={q._id}
              // break-inside-avoid নিশ্চিত করে যে একটি কার্ড অর্ধেক হয়ে পরের কলামে যাবে না
              className="break-inside-avoid mb-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 w-full inline-block hover:shadow-md transition-shadow duration-200"
            >
              <div className="flex gap-4">
                {/* Question Number Badge */}
                <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200">
                  {index + 1}
                </span>

                <div className="flex-1">
                  {/* Question Text */}
                  <h3 className="text-lg font-semibold text-slate-900 mb-5 leading-relaxed">
                    {q.questionText}
                  </h3>

                  {/* Options List */}
                  <div className="space-y-3 mb-6">
                    {q.options.map((opt, i) => {
                      const isCorrect = opt === q.correctAnswer;
                      return (
                        <div
                          key={i}
                          className={`p-3.5 rounded-xl border flex items-start gap-3 ${
                            isCorrect
                              ? "border-green-300 bg-green-50/80" // সঠিক উত্তরটি সবুজ রঙে হাইলাইট হবে
                              : "border-slate-100 bg-slate-50 text-slate-600"
                          }`}
                        >
                          {isCorrect ? (
                            <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
                          ) : (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0 mt-0.5 flex items-center justify-center bg-white">
                              <span className="text-[10px] text-slate-400 font-bold">
                                {String.fromCharCode(65 + i)}
                              </span>
                            </div>
                          )}
                          <span
                            className={`text-[15px] ${
                              isCorrect ? "font-bold text-green-900" : "font-medium"
                            }`}
                          >
                            {opt}
                          </span>
                        </div>
                      );
                    })}
                  </div>

                  {/* Explanation Section */}
                  {q.explanation && (
                    <div className="bg-slate-50 rounded-xl p-5 border border-slate-200 relative overflow-hidden">
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-slate-300"></div>
                      <p className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                        Explanation
                      </p>
                      <p className="text-sm text-slate-700 leading-relaxed font-medium">
                        {q.explanation}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
