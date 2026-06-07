"use client";

import { useState } from "react";
import { createExam, updateExam, deleteExam } from "@/actions/admin";
import { Edit2, Trash2, X, Plus } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export default function ExamsClient({ initialExams }: { initialExams: any[] }) {
  const [exams, setExams] = useState(initialExams);
  const [editingExam, setEditingExam] = useState<any>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const openForm = (exam = null) => {
    setEditingExam(exam);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setEditingExam(null);
    setIsFormOpen(false);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);
    const formData = new FormData(e.currentTarget);

    let result = editingExam
      ? await updateExam(editingExam._id, formData)
      : await createExam(formData);

    if (result.success) {
      window.location.reload();
    } else {
      alert("Error: " + result.error);
    }
    setIsSubmitting(false);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure? This will delete all questions associated with this exam.")) return;
    const result = await deleteExam(id);
    if (result.success) {
      setExams(exams.filter(exam => exam._id !== id));
    } else {
      alert("Error deleting exam");
    }
  };

  const inputClasses = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100 shadow-sm placeholder:text-slate-400";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto space-y-6"
    >
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Exam Categories</h1>
          <p className="text-slate-500 mt-1">Organize and manage your examination segments.</p>
        </div>
        {!isFormOpen && (
          <button
            onClick={() => openForm()}
            className="flex items-center gap-2 bg-slate-900 text-white px-5 py-2.5 rounded-lg font-medium hover:bg-slate-800 transition-all active:scale-95 shadow-sm"
          >
            <Plus size={18} /> Add Exam
          </button>
        )}
      </div>

      <AnimatePresence>
        {isFormOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-white p-6 md:p-8 rounded-2xl shadow-sm border border-slate-200 relative mb-6">
              <button
                onClick={closeForm}
                className="absolute top-6 right-6 p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              <h2 className="text-xl font-bold text-slate-800 mb-6">
                {editingExam ? "Edit Category" : "New Category"}
              </h2>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Title</label>
                    <input type="text" name="title" defaultValue={editingExam?.title || ""} required className={inputClasses} placeholder="e.g. UPSC Civil Services" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Slug</label>
                    <input type="text" name="slug" defaultValue={editingExam?.slug || ""} required className={inputClasses} placeholder="e.g. upsc-cse" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Description</label>
                  <textarea name="description" defaultValue={editingExam?.description || ""} required rows={3} className={inputClasses} placeholder="Brief details about this exam..."></textarea>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">React Icon Name</label>
                    <input type="text" name="iconName" defaultValue={editingExam?.iconName || "FaLandmark"} className={inputClasses} />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Subjects (Comma Separated)</label>
                    <input type="text" name="subjects" defaultValue={editingExam?.subjects?.join(", ") || ""} placeholder="History, Polity, Geography" required className={inputClasses} />
                  </div>
                </div>
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-semibold hover:bg-blue-700 transition-all disabled:opacity-50 active:scale-95 w-full sm:w-auto"
                  >
                    {isSubmitting ? "Saving..." : (editingExam ? "Update Category" : "Create Category")}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Data Table */}
      <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-50 border-b border-slate-200">
              <tr>
                <th className="px-6 py-4 font-semibold text-slate-600">Exam Title</th>
                <th className="px-6 py-4 font-semibold text-slate-600">URL Slug</th>
                <th className="px-6 py-4 font-semibold text-slate-600">Subjects Linked</th>
                <th className="px-6 py-4 font-semibold text-slate-600 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {exams.map((exam) => (
                <tr key={exam._id} className="hover:bg-slate-50 transition-colors group">
                  <td className="px-6 py-4 font-medium text-slate-900">{exam.title}</td>
                  <td className="px-6 py-4 text-slate-500">{exam.slug}</td>
                  <td className="px-6 py-4 text-slate-600 truncate max-w-xs">{exam.subjects?.join(", ") || "None"}</td>
                  <td className="px-6 py-4 flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={() => openForm(exam)}
                      className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Edit Exam"
                    >
                      <Edit2 size={18} />
                    </button>
                    <button
                      onClick={() => handleDelete(exam._id)}
                      className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Delete Exam"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
              {exams.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500">
                    No examination categories found. Create one to get started.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </motion.div>
  );
}
