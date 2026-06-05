import mongoose, { Schema, Document } from "mongoose";

export interface IQuestion extends Document {
  examCategoryId: mongoose.Types.ObjectId;
  subject: string;        // e.g., "Indian Polity", "Quantitative Aptitude"
  topic: string;          // e.g., "Fundamental Rights", "Time & Work"
  questionText: string;
  options: {
    a: string;
    b: string;
    c: string;
    d: string;
  };
  correctOption: "a" | "b" | "c" | "d";
  explanation: string;    // Crucial for learning
  difficulty: "Easy" | "Medium" | "Hard";
}

const QuestionSchema = new Schema<IQuestion>(
  {
    examCategoryId: { type: Schema.Types.ObjectId, ref: "ExamCategory", required: true },
    subject: { type: String, required: true },
    topic: { type: String, required: true },
    questionText: { type: String, required: true },
    options: {
      a: { type: String, required: true },
      b: { type: String, required: true },
      c: { type: String, required: true },
      d: { type: String, required: true },
    },
    correctOption: { type: String, enum: ["a", "b", "c", "d"], required: true },
    explanation: { type: String, required: true },
    difficulty: { type: String, enum: ["Easy", "Medium", "Hard"], default: "Medium" },
  },
  { timestamps: true }
);

export const Question = mongoose.models.Question || mongoose.model<IQuestion>("Question", QuestionSchema);
