import { connectToDatabase } from "@/lib/mongodb";
import { ExamCategory } from "@/models/ExamCategory";
import HomeClient from "@/components/HomeClient";

// Revalidate the home page every hour to keep exams fresh without hitting DB on every load
export const revalidate = 3600;

export default async function Home() {
  // Connect to database
  await connectToDatabase();

  // Fetch up to 5 active exam categories to display on the home page
  const categoriesDocs = await ExamCategory.find({ isActive: true })
    .limit(5)
    .sort({ createdAt: -1 })
    .lean();

  // Map Mongoose documents to plain JavaScript objects to pass to Client Component
  const popularExams = categoriesDocs.map((doc: any) => ({
    _id: doc._id.toString(),
    name: doc.title,
    slug: doc.slug,
    iconName: doc.iconName,
  }));

  return <HomeClient popularExams={popularExams} />;
}
