import { connectToDatabase } from "@/lib/mongodb";
import { ExamCategory } from "@/models/ExamCategory";
import { Question } from "@/models/Question";
import { notFound } from "next/navigation";
import PracticeClient from "./PracticeClient";

export default async function PracticePage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ subject?: string }>;
}) {
  const { slug } = await params;
  const { subject } = await searchParams; // URL থেকে সাবজেক্টের নাম নেওয়া হচ্ছে

  const decodedSlug = decodeURIComponent(slug);
  const decodedSubject = subject ? decodeURIComponent(subject) : null;

  await connectToDatabase();

  const examDoc = await ExamCategory.findOne({
    slug: decodedSlug,
    isActive: true
  }).lean();

  if (!examDoc) {
    notFound();
  }

  // ডাটাবেস কোয়েরি তৈরি করা হচ্ছে
  const query: any = { examCategoryId: examDoc._id };

  // যদি কোনো নির্দিষ্ট সাবজেক্ট সিলেক্ট করা থাকে, তাহলে কোয়েরিতে সেটি যোগ করা হবে
  if (decodedSubject) {
    query.subject = decodedSubject;
  }

  const questionsDoc = await Question.find(query).lean();

  const exam = {
    ...examDoc,
    _id: examDoc._id.toString(),
    // Client component-এ দেখানোর জন্য সাবজেক্টের নামটি পাঠানো হচ্ছে
    selectedSubject: decodedSubject || "All Subjects",
  };

  const questions = questionsDoc.map((q: any) => ({
    _id: q._id.toString(),
    questionText: q.questionText,
    options: [q.options.a, q.options.b, q.options.c, q.options.d],
    correctAnswer: q.options[q.correctOption],
    explanation: q.explanation,
    difficulty: q.difficulty,
    topic: q.topic,
  }));

  return <PracticeClient exam={exam} questions={questions} />;
}
