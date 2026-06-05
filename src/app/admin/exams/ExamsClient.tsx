"use client";

import { useState } from "react";
import { createExam, updateExam, deleteExam } from "@/actions/admin";
import { FiEdit2, FiTrash2, FiX } from "react-icons/fi";

export default function ExamsClient({ initialExams }: { initialExams: any[] }) {
  const [exams, setExams] = useState(initialExams);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    let result;
    if (editingExam) {
      result = await updateExam(editingExam._id, formData);
    } else {
      result = await createExam(formData);
    }

    if (result.success) {
      alert(editingExam ? "Exam updated!" : "Exam created!");
      window.location.reload(); // Refresh to get fresh server data
    } else {
      alert("Error: " + result.error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will also delete all questions associated with this exam.")) return;
    const result = await deleteExam(id);
    if (result.success) {
      setExams(exams.filter(exam => exam._id !== id));
    } else {
      alert("Error deleting exam");
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold text-slate-900 mb-6">Manage Exam Categories</h1>

      {/* Form Section */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-sky-100 mb-8 relative">
        {editingExam && (
          <button onClick={() => setEditingExam(null)} className="absolute top-6 right-6 text-slate-400 hover:text-slate-600">
            <FiX className="text-xl" />
          </button>
        )}
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          {editingExam ? "Edit Exam" : "Add New Exam"}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Title</label>
              <input type="text" name="title" defaultValue={editingExam?.title || ""} required className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Slug</label>
              <input type="text" name="slug" defaultValue={editingExam?.slug || ""} required className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none" />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Description</label>
            <textarea name="description" defaultValue={editingExam?.description || ""} required rows={3} className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none"></textarea>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">React Icon Name</label>
              <input type="text" name="iconName" defaultValue={editingExam?.iconName || "FaLandmark"} className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Subjects (Comma Separated)</label>
              <input type="text" name="subjects" defaultValue={editingExam?.subjects?.join(", ") || ""} placeholder="History, Polity, Geography" required className="w-full rounded-lg border-slate-200 bg-slate-50 px-4 py-2 focus:ring-2 focus:ring-blue-600 focus:outline-none" />
            </div>
          </div>
          <button type="submit" disabled={isSubmitting} className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50">
            {isSubmitting ? "Saving..." : (editingExam ? "Update Exam" : "Save Exam")}
          </button>
        </form>
      </div>

      {/* List Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-sky-100 overflow-hidden">
        <table className="w-full text-left text-sm text-slate-600">
          <thead className="bg-sky-50 text-slate-700">
            <tr>
              <th className="px-6 py-4 font-semibold">Title</th>
              <th className="px-6 py-4 font-semibold">Subjects</th>
              <th className="px-6 py-4 font-semibold text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-sky-100">
            {exams.map((exam) => (
              <tr key={exam._id}>
                <td className="px-6 py-4 font-medium text-slate-900">{exam.title}</td>
                <td className="px-6 py-4">{exam.subjects?.join(", ") || "None"}</td>
                <td className="px-6 py-4 flex items-center justify-end gap-3">
                  <button onClick={() => setEditingExam(exam)} className="text-blue-600 hover:text-blue-800"><FiEdit2 size={18} /></button>
                  <button onClick={() => handleDelete(exam._id)} className="text-red-500 hover:text-red-700"><FiTrash2 size={18} /></button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
