"use client";

import { motion } from "framer-motion";
import { BookOpen, CheckCircle, ArrowLeft, ArrowRight } from "lucide-react";
import Link from "next/link";

interface ExamProps {
  exam: {
    _id: string;
    title: string;
    slug: string;
    description: string;
    iconName: string;
    subjects: string[];
    isActive: boolean;
  };
}

export default function ExamDetailsClient({ exam }: ExamProps) {
  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-4xl mx-auto"
      >
        {/* Top Navigation Link */}
        <div className="mb-6">
          <Link
            href="/exams"
            className="inline-flex items-center text-slate-500 hover:text-slate-800 transition-colors font-medium"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Exams
          </Link>
        </div>

        {/* Main Content Card */}
        <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">

          {/* Header Area */}
          <div className="bg-slate-100/50 p-8 sm:p-12 text-center border-b border-slate-200">
            <motion.h1
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
              className="text-4xl font-bold text-slate-900 tracking-tight mb-4"
            >
              {exam.title}
            </motion.h1>
            <p className="text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
              {exam.description}
            </p>
          </div>

          {/* Subjects Selection Area */}
          <div className="p-8 sm:p-12">
            <div className="flex flex-col items-center justify-center text-center mb-10">
              <BookOpen className="w-8 h-8 text-slate-800 mb-3" />
              <h2 className="text-2xl font-bold text-slate-900 mb-2">
                Choose a Subject to Study
              </h2>
              <p className="text-slate-500">Select any subject below to read its questions and explanations.</p>
            </div>

            {exam.subjects && exam.subjects.length > 0 ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {exam.subjects.map((subject, index) => (
                  <Link
                    href={`/exams/${exam.slug}/practice?subject=${encodeURIComponent(subject)}`}
                    key={index}
                  >
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: 0.3 + index * 0.1 }}
                      className="flex items-center justify-between p-5 rounded-xl bg-white border-2 border-slate-100 hover:border-slate-800 hover:shadow-md transition-all duration-200 cursor-pointer group"
                    >
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-slate-300 group-hover:text-slate-800 transition-colors" />
                        <span className="text-slate-700 font-semibold group-hover:text-slate-900 transition-colors">
                          {subject}
                        </span>
                      </div>
                      <ArrowRight className="w-5 h-5 text-slate-300 group-hover:text-slate-800 transition-transform group-hover:translate-x-1" />
                    </motion.div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="text-center py-8">
                <p className="text-slate-500">No subjects listed for this exam yet.</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </div>
  );
}
