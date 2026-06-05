import mongoose, { Schema, Document } from "mongoose";

export interface IExamCategory extends Document {
  title: string;
  slug: string;
  description: string;
  iconName: string;
  subjects: string[]; // <-- New field added
  isActive: boolean;
}

const ExamCategorySchema = new Schema<IExamCategory>(
  {
    title: { type: String, required: true, unique: true },
    slug: { type: String, required: true, unique: true },
    description: { type: String, required: true },
    iconName: { type: String, default: "FaLandmark" },
    subjects: [{ type: String }], // <-- New field added
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const ExamCategory = mongoose.models.ExamCategory || mongoose.model<IExamCategory>("ExamCategory", ExamCategorySchema);
