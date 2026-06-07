"use client";

import { useState } from "react";
import { CheckCircle2, XCircle, ArrowLeft, BookOpen, BarChart, Tag } from "lucide-react";
import Link from "next/link";

interface QuestionType {
  _id: string;
  questionText: string;
  options: string[];
  correctAnswer: string;
  explanation?: string;
  difficulty?: string;
  topic?: string; // Added topic
}

interface PracticeProps {
  exam: {
    title: string;
    slug: string;
    selectedSubject?: string;
  };
  questions: QuestionType[];
}

export default function PracticeClient({ exam, questions }: PracticeProps) {
  // State to toggle between Practice Mode and Study Mode
  const [isStudyMode, setIsStudyMode] = useState(false);
  // State to track which options the user has clicked during practice
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});

  const handleOptionClick = (questionId: string, selectedOption: string) => {
    // If in study mode or already answered, do nothing
    if (isStudyMode || userAnswers[questionId]) return;

    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: selectedOption,
    }));
  };

  const getDifficultyColor = (diff?: string) => {
    switch (diff?.toLowerCase()) {
      case "easy": return "bg-green-100 text-green-700 border-green-200";
      case "hard": return "bg-red-100 text-red-700 border-red-200";
      case "medium":
      default: return "bg-amber-100 text-amber-700 border-amber-200";
    }
  };

  if (!questions || questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4">
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200 text-center max-w-md">
          <h2 className="text-xl font-bold text-slate-900 mb-2">No Questions Found</h2>
          <p className="text-slate-600 mb-6">We are still adding questions for {exam.title}.</p>
          <Link
            href={`/exams/${exam.slug}`}
            className="inline-block bg-slate-900 text-white px-6 py-3 rounded-full font-medium hover:bg-slate-800 transition-colors"
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
        <div className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
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
                <span className="text-sm font-semibold bg-white text-blue-700 px-3 py-1.5 rounded-lg border border-blue-200 mt-1 sm:mt-0 shadow-sm">
                  {exam.selectedSubject}
                </span>
              )}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Mode Toggle Switch */}
            <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm">
              <span className={`text-sm font-bold transition-colors ${!isStudyMode ? 'text-blue-600' : 'text-slate-400'}`}>
                Practice
              </span>
              <button
                onClick={() => setIsStudyMode(!isStudyMode)}
                className={`relative inline-flex h-6 w-12 items-center rounded-full transition-colors focus:outline-none ${isStudyMode ? 'bg-indigo-500' : 'bg-slate-300'}`}
              >
                <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isStudyMode ? 'translate-x-7' : 'translate-x-1'}`} />
              </button>
              <span className={`text-sm font-bold transition-colors ${isStudyMode ? 'text-indigo-600' : 'text-slate-400'}`}>
                Study
              </span>
            </div>

            <div className="text-sm font-semibold text-slate-600 bg-white px-5 py-2.5 rounded-full border border-slate-200 shadow-sm">
              {questions.length} Questions
            </div>
          </div>
        </div>

        {/* Study Layout: Book-like 2 Columns */}
        <div className="columns-1 xl:columns-2 gap-8">
          {questions.map((q, index) => {
            const isRevealed = isStudyMode || !!userAnswers[q._id];
            const selectedOpt = userAnswers[q._id];

            return (
              <div
                key={q._id}
                className="break-inside-avoid mb-8 bg-white rounded-2xl shadow-sm border border-slate-200 p-6 sm:p-8 w-full inline-block hover:shadow-md transition-shadow duration-200"
              >
                <div className="flex gap-4">
                  {/* Question Number Badge */}
                  <span className="shrink-0 flex items-center justify-center w-10 h-10 rounded-full bg-slate-100 text-slate-700 font-bold text-sm border border-slate-200">
                    {index + 1}
                  </span>

                  <div className="flex-1">
                    {/* Tags & Question Text */}
                    <div className="mb-5">
                      <div className="flex flex-wrap items-center gap-2 mb-3">
                        {/* Difficulty Badge */}
                        <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border uppercase tracking-wider ${getDifficultyColor(q.difficulty)}`}>
                          <BarChart className="w-3 h-3" />
                          {q.difficulty || "Medium"}
                        </span>

                        {/* Topic Badge */}
                        {q.topic && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md text-xs font-bold border border-slate-200 bg-slate-100 text-slate-600 uppercase tracking-wider">
                            <Tag className="w-3 h-3" />
                            {q.topic}
                          </span>
                        )}
                      </div>
                      <h3 className="text-lg font-semibold text-slate-900 leading-relaxed">
                        {q.questionText}
                      </h3>
                    </div>

                    {/* Options List */}
                    <div className="space-y-3 mb-6">
                      {q.options.map((opt, i) => {
                        const isCorrect = opt === q.correctAnswer;
                        const isSelected = selectedOpt === opt;

                        // Determine styles based on state
                        let optionStyle = "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 cursor-pointer";
                        let icon = (
                          <div className="w-5 h-5 rounded-full border-2 border-slate-300 shrink-0 mt-0.5 flex items-center justify-center bg-white group-hover:border-blue-400 transition-colors">
                            <span className="text-[10px] text-slate-400 font-bold">
                              {String.fromCharCode(65 + i)}
                            </span>
                          </div>
                        );

                        if (isRevealed) {
                          optionStyle = "border-slate-100 bg-slate-50 text-slate-500 cursor-default opacity-70"; // default faded state for unselected wrong options
                          icon = (
                            <div className="w-5 h-5 rounded-full border-2 border-slate-200 shrink-0 mt-0.5 flex items-center justify-center bg-slate-100">
                              <span className="text-[10px] text-slate-400 font-bold">{String.fromCharCode(65 + i)}</span>
                            </div>
                          );

                          if (isCorrect) {
                            optionStyle = "border-green-300 bg-green-50/80 text-green-900 font-bold opacity-100";
                            icon = <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />;
                          } else if (isSelected && !isCorrect) {
                            optionStyle = "border-red-300 bg-red-50/80 text-red-900 font-bold opacity-100";
                            icon = <XCircle className="w-5 h-5 text-red-500 shrink-0 mt-0.5" />;
                          }
                        }

                        return (
                          <button
                            key={i}
                            disabled={isRevealed}
                            onClick={() => handleOptionClick(q._id, opt)}
                            className={`w-full text-left p-3.5 rounded-xl border flex items-start gap-3 transition-all duration-200 group ${optionStyle}`}
                          >
                            {icon}
                            <span className="text-[15px] leading-snug">
                              {opt}
                            </span>
                          </button>
                        );
                      })}
                    </div>

                    {/* Explanation Section */}
                    {isRevealed && q.explanation && (
                      <div className="bg-blue-50/50 rounded-xl p-5 border border-blue-100 relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
                        <div className="absolute left-0 top-0 bottom-0 w-1 bg-blue-400"></div>
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-2">
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
            );
          })}
        </div>
      </div>
    </div>
  );
}
