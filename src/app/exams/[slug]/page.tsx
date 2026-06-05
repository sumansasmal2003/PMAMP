import { connectToDatabase } from "@/lib/mongodb";
import { ExamCategory } from "@/models/ExamCategory";
import { notFound } from "next/navigation";
import ExamDetailsClient from "./ExamDetailsClient";

export default async function SpecificExamPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  // Decode the URL-encoded Bengali characters back into readable text
  const decodedSlug = decodeURIComponent(slug);

  // Connect to the database and find the matching exam using the decoded slug
  await connectToDatabase();
  const examDoc = await ExamCategory.findOne({
    slug: decodedSlug,
    isActive: true
  }).lean();

  // Show a 404 page if the exam does not exist
  if (!examDoc) {
    notFound();
  }

  // Change the MongoDB ID to a regular string so it safely passes to the client
  const exam = {
    ...examDoc,
    _id: examDoc._id.toString(),
  };

  return <ExamDetailsClient exam={exam} />;
}
