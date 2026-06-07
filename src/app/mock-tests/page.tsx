"use client";

import { useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Clock, BookOpen, AlertCircle, FileText } from "lucide-react";

interface Exam {
  _id: string;
  title: string;
  description: string;
  subjects: string[];
}

interface Question {
  subject: string;
  topic: string;
  questionText: string;
  options: { a: string; b: string; c: string; d: string };
  correctOption: "a" | "b" | "c" | "d";
}

export default function MockTestPage() {
  const router = useRouter();

  // Selection State
  const [availableExams, setAvailableExams] = useState<Exam[]>([]);
  const [selectedExam, setSelectedExam] = useState<Exam | null>(null);
  const [isLoadingExams, setIsLoadingExams] = useState(true);

  // Test State
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [isTestActive, setIsTestActive] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);

  // Results & Analysis State
  const [isTestCompleted, setIsTestCompleted] = useState(false);
  const [score, setScore] = useState(0);
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  // Proctoring & Timer State
  const [timeLeft, setTimeLeft] = useState(60 * 60); // 60 minutes
  const [warningCount, setWarningCount] = useState(0);
  const MAX_WARNINGS = 3;
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch available exams on mount
  useEffect(() => {
    const fetchExams = async () => {
      try {
        const res = await fetch("/api/exams");
        const data = await res.json();
        setAvailableExams(data);
      } catch (error) {
        console.error("Failed to load exams", error);
      } finally {
        setIsLoadingExams(false);
      }
    };
    fetchExams();
  }, []);

  // 2. Start Test (Triggered by selecting an exam)
  const handleExamSelection = async (exam: Exam) => {
    setSelectedExam(exam);
    setIsGenerating(true);

    try {
      const res = await fetch("/api/generate-test", {
        method: "POST",
        body: JSON.stringify({
          examName: exam.title,
          subjects: exam.subjects
        })
      });

      const data = await res.json();

      // Check if the response failed or if questions are missing
      if (!res.ok || !data.questions) {
        throw new Error(data.error || "Invalid response from server");
      }

      setQuestions(data.questions);
      setIsTestActive(true);
    } catch (error) {
      console.error("Failed to generate test", error);
      alert("Something went wrong generating the test. Please try again.");
      setSelectedExam(null); // Reset selection so the user can try again
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. Timer Logic
  useEffect(() => {
    if (isTestActive && timeLeft > 0) {
      timerRef.current = setInterval(() => setTimeLeft((prev) => prev - 1), 1000);
    } else if (timeLeft === 0 && isTestActive) {
      submitTest("Time is up! Auto-submitting your test.");
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [isTestActive, timeLeft]);

  // 4. Anti-Cheat: Tab Visibility Tracking
  useEffect(() => {
    if (!isTestActive) return;

    const handleVisibilityChange = () => {
      if (document.hidden) {
        setWarningCount((prev) => {
          const newCount = prev + 1;
          if (newCount >= MAX_WARNINGS) {
            submitTest("Test terminated. You switched tabs too many times.");
          } else {
            alert(`Warning ${newCount}/${MAX_WARNINGS}: Please do not switch tabs during the test.`);
          }
          return newCount;
        });
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    return () => document.removeEventListener("visibilitychange", handleVisibilityChange);
  }, [isTestActive]);

  // 5. Submit Test & Get AI Analysis
  const submitTest = async (reason = "Test submitted successfully.") => {
    setIsTestActive(false);
    setIsTestCompleted(true); // Transition UI to the results screen
    if (timerRef.current) clearInterval(timerRef.current);

    // Only show alert if it was auto-submitted due to warnings or time
    if (reason !== "Test submitted successfully.") {
      alert(reason);
    }

    // Calculate score locally
    let calculatedScore = 0;
    questions.forEach((q, index) => {
      if (answers[index] === q.correctOption) calculatedScore++;
    });

    setScore(calculatedScore);
    setIsAnalyzing(true);

    try {
      // Call the Analysis API
      const res = await fetch("/api/analyze-result", {
        method: "POST",
        body: JSON.stringify({ questions, answers, score: calculatedScore })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Failed to analyze results");
      }

      setAnalysis(data.feedback);
    } catch (error) {
      console.error("Analysis failed:", error);
      setAnalysis("Sorry, we couldn't generate your AI analysis at this time.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, "0");
    const s = (seconds % 60).toString().padStart(2, "0");
    return `${m}:${s}`;
  };

  // --- UI: State 1 - Loading Exams ---
  if (isLoadingExams) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="text-gray-500 animate-pulse text-lg font-medium">Loading available exams...</div>
      </div>
    );
  }

  // --- UI: State 2 - Exam Selection Screen ---
  if (!selectedExam && !isTestActive && !isTestCompleted) {
    return (
      <div className="mx-auto max-w-6xl p-6">
        <div className="mb-10 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">Select Your Mock Test</h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Choose an exam below to generate a dynamic 50-question mock test. You will have 60 minutes to complete it. Tab switching is strictly monitored.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {availableExams.map((exam) => (
            <div
              key={exam._id}
              onClick={() => handleExamSelection(exam)}
              className="group cursor-pointer rounded-xl border border-gray-200 bg-white p-6 shadow-sm transition hover:border-blue-500 hover:shadow-md"
            >
              <div className="mb-4 inline-flex rounded-lg bg-blue-50 p-3 text-blue-600">
                <FileText className="h-6 w-6" />
              </div>
              <h2 className="mb-2 text-xl font-semibold text-gray-800 group-hover:text-blue-600">
                {exam.title}
              </h2>
              <p className="mb-4 text-sm text-gray-600 line-clamp-2">
                {exam.description}
              </p>
              <div className="flex flex-wrap gap-2">
                {exam.subjects.slice(0, 3).map((sub, i) => (
                  <span key={i} className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    {sub}
                  </span>
                ))}
                {exam.subjects.length > 3 && (
                  <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-600">
                    +{exam.subjects.length - 3} more
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // --- UI: State 3 - Generating Questions ---
  if (isGenerating) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-gray-50 p-4 text-center">
        <BookOpen className="mb-6 h-12 w-12 animate-bounce text-blue-600" />
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Preparing your {selectedExam?.title} Test</h2>
        <p className="text-gray-500 max-w-md">
          Our AI is currently curating 50 unique questions across {selectedExam?.subjects.length} subjects. This may take up to a minute...
        </p>
      </div>
    );
  }

  // --- UI: State 4 - Results & Analysis Screen ---
  if (isTestCompleted) {
    return (
      <div className="mx-auto max-w-4xl p-6">
        <div className="mb-8 text-center">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">Test Completed</h1>
          <div className="inline-flex items-center justify-center rounded-2xl bg-blue-50 px-8 py-6 border border-blue-100">
            <div className="text-center">
              <p className="text-sm font-semibold text-blue-600 uppercase tracking-widest mb-1">Your Score</p>
              <p className="text-6xl font-extrabold text-blue-900">
                {score} <span className="text-3xl text-blue-400">/ 50</span>
              </p>
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <h2 className="mb-6 flex items-center gap-3 text-2xl font-bold text-gray-800 border-b pb-4">
            ✨ AI Performance Analysis
          </h2>

          {isAnalyzing ? (
            <div className="flex flex-col items-center justify-center py-12">
              <div className="mb-4 h-10 w-10 animate-spin rounded-full border-4 border-blue-200 border-t-blue-600"></div>
              <p className="text-gray-600 font-medium text-lg">Gemini AI is analyzing your performance...</p>
              <p className="text-sm text-gray-400 mt-2">Evaluating strengths and identifying weak topics.</p>
            </div>
          ) : (
            <div className="prose max-w-none text-gray-700">
              <div className="whitespace-pre-wrap leading-relaxed text-lg bg-gray-50 p-6 rounded-lg border border-gray-100">
                {analysis}
              </div>
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => window.location.reload()}
            className="rounded-lg bg-gray-900 px-8 py-3 font-semibold text-white transition hover:bg-gray-800 shadow-md hover:shadow-lg"
          >
            Take Another Test
          </button>
        </div>
      </div>
    );
  }

  // --- UI: State 5 - Active Test Screen ---
  return (
    <div className="mx-auto max-w-4xl p-6">
      <div className="sticky top-0 z-10 mb-8 flex items-center justify-between rounded-xl bg-white p-4 shadow-sm border border-gray-200">
        <div className="flex items-center gap-3">
          <Clock className="h-6 w-6 text-red-600" />
          <span className="text-xl font-bold text-red-600">{formatTime(timeLeft)}</span>
        </div>

        <div className="flex items-center gap-2 rounded-full bg-orange-50 px-4 py-2 text-sm font-medium text-orange-600 border border-orange-100">
          <AlertCircle className="h-4 w-4" />
          Warnings: {warningCount} / {MAX_WARNINGS}
        </div>

        <button
          onClick={() => submitTest("Test submitted successfully.")}
          className="rounded-lg bg-blue-600 px-6 py-2.5 font-medium text-white transition hover:bg-blue-700"
        >
          Submit Test
        </button>
      </div>

      <div className="space-y-6">
        {questions.map((q, qIndex) => (
          <div key={qIndex} className="rounded-xl bg-white p-6 md:p-8 shadow-sm border border-gray-100">
            <div className="mb-4 flex items-center justify-between border-b pb-4">
               <span className="rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-600 uppercase tracking-wider">
                 {q.subject}
               </span>
               <span className="text-xs text-gray-400 font-medium">{q.topic}</span>
            </div>

            <h3 className="mb-6 text-lg font-medium text-gray-800 leading-relaxed">
              <span className="mr-3 font-bold text-gray-400">{qIndex + 1}.</span>
              {q.questionText}
            </h3>

            <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
              {Object.entries(q.options).map(([key, value]) => (
                <label
                  key={key}
                  className={`flex cursor-pointer items-center rounded-lg border p-4 transition duration-200 ${
                    answers[qIndex] === key ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500' : 'border-gray-200 hover:bg-gray-50 hover:border-gray-300'
                  }`}
                >
                  <input
                    type="radio"
                    name={`question-${qIndex}`}
                    value={key}
                    checked={answers[qIndex] === key}
                    onChange={() => setAnswers(prev => ({ ...prev, [qIndex]: key }))}
                    className="h-4 w-4 border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="ml-4 text-gray-700 font-medium">{value}</span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
