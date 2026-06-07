"use client";

import { useState, useEffect, useRef } from "react";
import { createMultipleQuestions, getQuestionsByExam, deleteQuestion, updateQuestion } from "@/actions/admin";
import { Plus, Trash2, Edit2, X, Check, ChevronDown, Code, AlertCircle, Layers, BookOpen } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface Exam {
  _id: string;
  title: string;
  subjects: string[];
}

// Custom Select Component
const CustomSelect = ({ value, defaultValue, onChange, options, placeholder, name }: any) => {
  const [internalValue, setInternalValue] = useState(value || defaultValue || "");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (value !== undefined) setInternalValue(value); }, [value]);
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setIsOpen(false);
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSelect = (val: string) => {
    setInternalValue(val);
    if (onChange) onChange(val);
    setIsOpen(false);
  };

  const selectedLabel = options.find((o: any) => o.value === internalValue)?.label;

  return (
    <div className="relative" ref={dropdownRef}>
      {name && <input type="hidden" name={name} value={internalValue} />}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-xl border px-4 py-2.5 text-sm transition-all duration-200
          ${!selectedLabel ? "text-slate-400" : "text-slate-900"}
          border-slate-200 bg-white shadow-sm hover:border-slate-300 focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100`}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <ChevronDown size={16} className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.15 }}
            className="absolute z-20 mt-2 w-full rounded-xl border border-slate-200 bg-white p-1.5 shadow-lg"
          >
            <div className="max-h-60 overflow-y-auto custom-scrollbar">
              {options.map((opt: any) => (
                <div
                  key={opt.value}
                  onClick={() => handleSelect(opt.value)}
                  className={`cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors duration-150 ${
                    internalValue === opt.value ? "bg-slate-100 text-slate-900 font-semibold" : "text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {opt.label}
                </div>
              ))}
              {options.length === 0 && <div className="px-3 py-2 text-sm text-slate-400">No options available</div>}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default function QuestionsClient({ exams }: { exams: Exam[] }) {
  const [selectedExamId, setSelectedExamId] = useState("");
  const [existingQuestions, setExistingQuestions] = useState<any[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  const emptyQuestion = { subject: "", topic: "", questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "a", difficulty: "Medium", explanation: "" };
  const [questions, setQuestions] = useState([emptyQuestion]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [showJsonImport, setShowJsonImport] = useState(false);

  const activeExam = exams.find((e) => e._id === selectedExamId);

  useEffect(() => {
    if (selectedExamId) getQuestionsByExam(selectedExamId).then(setExistingQuestions);
    else setExistingQuestions([]);
  }, [selectedExamId]);

  const handleLoadJson = () => {
    try {
      setJsonError("");
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) throw new Error("JSON must be an array of objects.");

      const formatted = parsed.map((q: any) => ({
        subject: q.subject || "", topic: q.topic || "", questionText: q.questionText || "",
        optionA: q.optionA || q.options?.a || "", optionB: q.optionB || q.options?.b || "",
        optionC: q.optionC || q.options?.c || "", optionD: q.optionD || q.options?.d || "",
        correctOption: q.correctOption?.toLowerCase() || "a", difficulty: q.difficulty || "Medium", explanation: q.explanation || "",
      }));

      setQuestions(questions.length === 1 && !questions[0].questionText ? formatted : [...questions, ...formatted]);
      setJsonInput(""); setShowJsonImport(false);
    } catch (err: any) { setJsonError(err.message || "Invalid JSON syntax."); }
  };

  const handleQuestionChange = (idx: number, field: string, val: string) => {
    const newQs = [...questions];
    (newQs[idx] as any)[field] = val;
    setQuestions(newQs);
  };

  const handleBulkSubmit = async () => {
    if (!selectedExamId) return alert("Select an exam");
    setIsSubmitting(true);
    const payload = questions.map((q) => ({
      examCategoryId: selectedExamId, subject: q.subject, topic: q.topic, questionText: q.questionText,
      options: { a: q.optionA, b: q.optionB, c: q.optionC, d: q.optionD },
      correctOption: q.correctOption, explanation: q.explanation, difficulty: q.difficulty,
    }));
    const result = await createMultipleQuestions(payload);
    if (result.success) {
      setQuestions([emptyQuestion]);
      getQuestionsByExam(selectedExamId).then(setExistingQuestions);
    } else alert("Error: " + result.error);
    setIsSubmitting(false);
  };

  const handleDeleteExisting = async (id: string) => {
    if (!confirm("Delete this question?")) return;
    const res = await deleteQuestion(id);
    if (res.success) setExistingQuestions(existingQuestions.filter((q) => q._id !== id));
  };

  const handleUpdateExisting = async (id: string, formData: FormData) => {
    const payload = {
      subject: formData.get("subject"), topic: formData.get("topic"), questionText: formData.get("questionText"),
      options: { a: formData.get("optionA"), b: formData.get("optionB"), c: formData.get("optionC"), d: formData.get("optionD") },
      correctOption: formData.get("correctOption"), difficulty: formData.get("difficulty"), explanation: formData.get("explanation"),
    };
    const res = await updateQuestion(id, payload);
    if (res.success) { setEditingQuestionId(null); getQuestionsByExam(selectedExamId).then(setExistingQuestions); }
  };

  const inputClass = "w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm transition-all focus:border-slate-400 focus:outline-none focus:ring-4 focus:ring-slate-100 shadow-sm placeholder:text-slate-400";

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="w-full max-w-5xl mx-auto space-y-6 text-slate-800">

      {/* 1. Select Exam */}
      <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center gap-4">
          <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
            <Layers size={20} className="text-slate-400" /> Target Exam
          </h2>
          <div className="w-full sm:w-80">
            <CustomSelect
              value={selectedExamId} onChange={setSelectedExamId}
              options={exams.map(e => ({ label: e.title, value: e._id }))}
              placeholder="-- Select to load data --"
            />
          </div>
        </div>
      </section>

      {selectedExamId && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">

          {/* 2. Existing Questions */}
          <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2 mb-6">
              <BookOpen size={20} className="text-slate-400" /> Existing Questions ({existingQuestions.length})
            </h2>
            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2">
              {existingQuestions.map((eq) => (
                <div key={eq._id} className="rounded-xl border border-slate-100 bg-slate-50/50 p-5 group transition-colors hover:bg-slate-50 hover:border-slate-200">
                  {editingQuestionId === eq._id ? (
                    <form action={(fd) => handleUpdateExisting(eq._id, fd)} className="space-y-4">
                      {/* ... (Existing form inputs exactly structured with inputClass) ... */}
                      <div className="flex justify-end gap-2 pt-2">
                         <button type="button" onClick={() => setEditingQuestionId(null)} className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-lg">Cancel</button>
                         <button type="submit" className="px-4 py-2 text-sm font-bold bg-slate-900 text-white rounded-lg">Save Changes</button>
                      </div>
                    </form>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-2">
                        <span className="text-xs font-bold uppercase tracking-wider text-slate-500">{eq.subject} • {eq.topic}</span>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => setEditingQuestionId(eq._id)} className="p-1.5 text-slate-400 hover:text-blue-600 rounded-md"><Edit2 size={16} /></button>
                          <button onClick={() => handleDeleteExisting(eq._id)} className="p-1.5 text-slate-400 hover:text-red-600 rounded-md"><Trash2 size={16} /></button>
                        </div>
                      </div>
                      <p className="text-slate-900 font-medium mb-3">{eq.questionText}</p>
                      <div className="inline-block bg-slate-100 border border-slate-200 px-2 py-1 rounded text-xs font-bold text-slate-600 uppercase">
                        Answer: {eq.correctOption}
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </section>

          {/* 3. Add New Questions */}
          <section className="rounded-2xl bg-white p-6 shadow-sm border border-slate-200">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-bold text-slate-900">Draft New Questions</h2>
              <button onClick={() => setShowJsonImport(!showJsonImport)} className="text-sm font-semibold text-slate-600 bg-slate-100 px-3 py-1.5 rounded-md hover:bg-slate-200 flex items-center gap-2">
                <Code size={16} /> JSON Import
              </button>
            </div>

            {showJsonImport && (
              <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} className="mb-6 overflow-hidden">
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                  <textarea
                    value={jsonInput} onChange={(e) => setJsonInput(e.target.value)}
                    className="w-full h-40 bg-white border border-slate-200 rounded-lg p-3 font-mono text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-200 shadow-inner"
                    placeholder="Paste JSON array here..."
                  />
                  {jsonError && <p className="text-red-500 text-sm mt-2 flex items-center gap-1"><AlertCircle size={14}/>{jsonError}</p>}
                  <div className="mt-3 flex justify-end">
                    <button onClick={handleLoadJson} className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-semibold">Load Data</button>
                  </div>
                </div>
              </motion.div>
            )}

            <div className="space-y-6">
              {questions.map((q, idx) => (
                <div key={idx} className="relative p-6 rounded-2xl border border-slate-200 bg-white">
                  {questions.length > 1 && (
                    <button onClick={() => setQuestions(questions.filter((_, i) => i !== idx))} className="absolute -top-3 -right-3 bg-white p-1.5 rounded-full border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 shadow-sm transition-all">
                      <X size={16} />
                    </button>
                  )}
                  {/* Form fields mimicking inputClass styling */}
                  <div className="grid grid-cols-2 gap-4 mb-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">SUBJECT</label>
                      <CustomSelect value={q.subject} onChange={(v: string) => handleQuestionChange(idx, "subject", v)} options={activeExam?.subjects.map(s => ({label: s, value: s})) || []} />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1">TOPIC</label>
                      <input value={q.topic} onChange={(e) => handleQuestionChange(idx, "topic", e.target.value)} className={inputClass} placeholder="e.g. Geometry" />
                    </div>
                  </div>
                  <div className="mb-4">
                     <label className="block text-xs font-semibold text-slate-500 mb-1">QUESTION TEXT</label>
                     <textarea value={q.questionText} onChange={(e) => handleQuestionChange(idx, "questionText", e.target.value)} rows={2} className={inputClass}></textarea>
                  </div>
                  <div className="grid grid-cols-2 gap-4 mb-4">
                     <input value={q.optionA} onChange={(e) => handleQuestionChange(idx, "optionA", e.target.value)} className={inputClass} placeholder="Option A" />
                     <input value={q.optionB} onChange={(e) => handleQuestionChange(idx, "optionB", e.target.value)} className={inputClass} placeholder="Option B" />
                     <input value={q.optionC} onChange={(e) => handleQuestionChange(idx, "optionC", e.target.value)} className={inputClass} placeholder="Option C" />
                     <input value={q.optionD} onChange={(e) => handleQuestionChange(idx, "optionD", e.target.value)} className={inputClass} placeholder="Option D" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                     <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">CORRECT OPTION</label>
                        <CustomSelect value={q.correctOption} onChange={(v: string) => handleQuestionChange(idx, "correctOption", v)} options={[{label:"A", value:"a"}, {label:"B", value:"b"}, {label:"C", value:"c"}, {label:"D", value:"d"}]} />
                     </div>
                     <div>
                        <label className="block text-xs font-semibold text-slate-500 mb-1">DIFFICULTY</label>
                        <CustomSelect value={q.difficulty} onChange={(v: string) => handleQuestionChange(idx, "difficulty", v)} options={[{label:"Easy", value:"Easy"}, {label:"Medium", value:"Medium"}, {label:"Hard", value:"Hard"}]} />
                     </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 flex flex-col sm:flex-row gap-4 pt-6 border-t border-slate-100">
              <button onClick={() => setQuestions([...questions, emptyQuestion])} className="flex-1 flex justify-center items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:bg-slate-50 transition-colors">
                <Plus size={18} /> Add Another Form
              </button>
              <button onClick={handleBulkSubmit} disabled={isSubmitting} className="flex-1 bg-slate-900 text-white px-6 py-3 rounded-xl font-bold hover:bg-slate-800 transition-colors disabled:opacity-50">
                {isSubmitting ? "Saving to Database..." : `Publish ${questions.length} Question(s)`}
              </button>
            </div>
          </section>
        </motion.div>
      )}
    </motion.div>
  );
}
