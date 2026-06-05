"use client";

import { useState, useEffect, useRef } from "react";
import { createMultipleQuestions, getQuestionsByExam, deleteQuestion, updateQuestion } from "@/actions/admin";
import { FiPlus, FiTrash2, FiEdit2, FiX, FiCheck, FiChevronDown, FiCode, FiAlertCircle } from "react-icons/fi";

interface Exam {
  _id: string;
  title: string;
  subjects: string[];
}

// --- Custom Professional Dropdown Component ---
const CustomSelect = ({ value, defaultValue, onChange, options, placeholder, name, required }: any) => {
  const [internalValue, setInternalValue] = useState(value || defaultValue || "");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
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
        className={`flex w-full items-center justify-between rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition-all focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 hover:bg-slate-50 ${!selectedLabel ? "text-slate-400" : "text-slate-800"}`}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <FiChevronDown className={`text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-20 mt-2 w-full animate-in fade-in zoom-in-95 rounded-xl border border-slate-100 bg-white p-1 shadow-lg shadow-slate-200/50">
          <div className="max-h-60 overflow-y-auto custom-scrollbar">
            {options.map((opt: any) => (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`cursor-pointer rounded-lg px-3 py-2 text-sm transition-colors ${internalValue === opt.value ? "bg-blue-50 text-blue-700 font-medium" : "text-slate-700 hover:bg-slate-50"}`}
              >
                {opt.label}
              </div>
            ))}
            {options.length === 0 && <div className="px-3 py-2 text-sm text-slate-400">No options available</div>}
          </div>
        </div>
      )}
    </div>
  );
};

// --- Main Client Component ---
export default function QuestionsClient({ exams }: { exams: Exam[] }) {
  const [selectedExamId, setSelectedExamId] = useState("");
  const [existingQuestions, setExistingQuestions] = useState<any[]>([]);
  const [editingQuestionId, setEditingQuestionId] = useState<string | null>(null);

  // Form State
  const [questions, setQuestions] = useState([
    { subject: "", topic: "", questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "a", difficulty: "Medium", explanation: "" }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // JSON Import State
  const [jsonInput, setJsonInput] = useState("");
  const [jsonError, setJsonError] = useState("");
  const [showJsonImport, setShowJsonImport] = useState(false);

  const activeExam = exams.find((e) => e._id === selectedExamId);

  useEffect(() => {
    if (selectedExamId) {
      getQuestionsByExam(selectedExamId).then(setExistingQuestions);
    } else {
      setExistingQuestions([]);
    }
  }, [selectedExamId]);

  // --- JSON Import Handler ---
  const handleLoadJson = () => {
    try {
      setJsonError("");
      const parsed = JSON.parse(jsonInput);

      if (!Array.isArray(parsed)) {
        throw new Error("Invalid format: JSON must be an array of objects [{}, {}].");
      }

      const formattedQuestions = parsed.map((q: any) => ({
        subject: q.subject || "",
        topic: q.topic || "",
        questionText: q.questionText || "",
        // Supports flat JSON (optionA) or nested JSON (options.a)
        optionA: q.optionA || q.options?.a || "",
        optionB: q.optionB || q.options?.b || "",
        optionC: q.optionC || q.options?.c || "",
        optionD: q.optionD || q.options?.d || "",
        correctOption: q.correctOption?.toLowerCase() || "a",
        difficulty: q.difficulty || "Medium",
        explanation: q.explanation || ""
      }));

      // If existing array has only 1 empty question, replace it. Otherwise append.
      if (questions.length === 1 && !questions[0].questionText) {
        setQuestions(formattedQuestions);
      } else {
        setQuestions([...questions, ...formattedQuestions]);
      }

      setJsonInput("");
      setShowJsonImport(false);
      alert(`Successfully loaded ${formattedQuestions.length} questions into the form! Review and click Publish.`);
    } catch (err: any) {
      setJsonError(err.message || "Invalid JSON syntax. Please check your formatting.");
    }
  };

  // --- Standard Form Handlers ---
  const handleQuestionChange = (index: number, field: string, value: string) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => setQuestions([...questions, { subject: "", topic: "", questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "a", difficulty: "Medium", explanation: "" }]);
  const removeQuestion = (index: number) => setQuestions(questions.filter((_, i) => i !== index));

  const handleBulkSubmit = async () => {
    if (!selectedExamId) return alert("Select an exam");
    setIsSubmitting(true);
    const payload = questions.map((q) => ({
      examCategoryId: selectedExamId,
      subject: q.subject,
      topic: q.topic,
      questionText: q.questionText,
      options: { a: q.optionA, b: q.optionB, c: q.optionC, d: q.optionD },
      correctOption: q.correctOption,
      explanation: q.explanation,
      difficulty: q.difficulty,
    }));

    const result = await createMultipleQuestions(payload);
    if (result.success) {
      alert("Questions published successfully!");
      setQuestions([{ subject: "", topic: "", questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "a", difficulty: "Medium", explanation: "" }]);
      getQuestionsByExam(selectedExamId).then(setExistingQuestions);
    } else {
      alert("Error: " + result.error);
    }
    setIsSubmitting(false);
  };

  const handleDeleteExisting = async (id: string) => {
    if (!confirm("Delete this question forever?")) return;
    const res = await deleteQuestion(id);
    if (res.success) setExistingQuestions(existingQuestions.filter(q => q._id !== id));
  };

  const handleUpdateExisting = async (id: string, formData: FormData) => {
    const payload = {
      subject: formData.get("subject"),
      topic: formData.get("topic"),
      questionText: formData.get("questionText"),
      options: {
        a: formData.get("optionA"),
        b: formData.get("optionB"),
        c: formData.get("optionC"),
        d: formData.get("optionD"),
      },
      correctOption: formData.get("correctOption"),
      difficulty: formData.get("difficulty"),
      explanation: formData.get("explanation"),
    };

    const res = await updateQuestion(id, payload);
    if (res.success) {
      setEditingQuestionId(null);
      getQuestionsByExam(selectedExamId).then(setExistingQuestions);
    } else {
      alert("Update failed: " + res.error);
    }
  };

  const examOptions = exams.map(e => ({ label: e.title, value: e._id }));
  const subjectOptions = activeExam?.subjects.map(s => ({ label: s, value: s })) || [];
  const correctOptionOptions = [
    { label: "Option A", value: "a" },
    { label: "Option B", value: "b" },
    { label: "Option C", value: "c" },
    { label: "Option D", value: "d" }
  ];
  const difficultyOptions = [
    { label: "Easy", value: "Easy" },
    { label: "Medium", value: "Medium" },
    { label: "Hard", value: "Hard" }
  ];

  const inputClass = "w-full rounded-xl border border-slate-200 bg-slate-50/50 px-4 py-2.5 text-sm transition-all focus:border-blue-600 focus:outline-none focus:ring-4 focus:ring-blue-600/10 placeholder:text-slate-400";

  return (
    <div className="space-y-6 text-slate-800" style={{ fontFamily: "'Google Sans', 'Open Sans', sans-serif" }}>

      {/* 1. Select Exam */}
      <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
        <label className="block text-lg font-bold tracking-tight mb-4 text-slate-900">1. Select Examination</label>
        <div className="w-full md:w-1/2">
          <CustomSelect
            value={selectedExamId}
            onChange={setSelectedExamId}
            options={examOptions}
            placeholder="-- Choose Exam --"
          />
        </div>
      </div>

      {selectedExamId && (
        <>
          {/* 2. Existing Questions List */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <h2 className="text-lg font-bold tracking-tight mb-6 flex justify-between items-center text-slate-900">
              <span>Existing Questions <span className="text-slate-400 font-medium ml-2 text-sm">({existingQuestions.length})</span></span>
            </h2>

            <div className="space-y-4 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {existingQuestions.map((eq) => (
                <div key={eq._id} className="border border-slate-100 rounded-2xl p-5 bg-white shadow-sm hover:shadow-md transition-shadow duration-200">
                  {editingQuestionId === eq._id ? (
                    <form action={(formData) => handleUpdateExisting(eq._id, formData)} className="space-y-5">
                       <div className="flex justify-between items-center mb-2 border-b border-slate-100 pb-4">
                         <span className="font-bold text-blue-600 flex items-center gap-2">
                           <FiEdit2 /> Editing Question
                         </span>
                         <button type="button" onClick={() => setEditingQuestionId(null)} className="p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors">
                           <FiX size={20}/>
                         </button>
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                         <div>
                           <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Subject</label>
                           <CustomSelect name="subject" defaultValue={eq.subject} options={subjectOptions} placeholder="Select Subject" />
                         </div>
                         <div>
                           <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Topic</label>
                           <input name="topic" defaultValue={eq.topic} className={inputClass} placeholder="e.g. Algebra" />
                         </div>
                       </div>

                       <div>
                         <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Question Text</label>
                         <textarea name="questionText" defaultValue={eq.questionText} className={inputClass} rows={2} />
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                         <input name="optionA" defaultValue={eq.options.a} className={inputClass} placeholder="Option A" />
                         <input name="optionB" defaultValue={eq.options.b} className={inputClass} placeholder="Option B" />
                         <input name="optionC" defaultValue={eq.options.c} className={inputClass} placeholder="Option C" />
                         <input name="optionD" defaultValue={eq.options.d} className={inputClass} placeholder="Option D" />
                       </div>

                       <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Correct Option</label>
                            <CustomSelect name="correctOption" defaultValue={eq.correctOption} options={correctOptionOptions} />
                          </div>
                          <div>
                            <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Difficulty</label>
                            <CustomSelect name="difficulty" defaultValue={eq.difficulty} options={difficultyOptions} />
                          </div>
                       </div>

                       <div>
                         <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Explanation</label>
                         <textarea name="explanation" defaultValue={eq.explanation} className={inputClass} rows={2} />
                       </div>

                       <div className="pt-2">
                         <button type="submit" className="bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-semibold hover:bg-blue-700 hover:shadow-lg hover:shadow-blue-600/20 active:scale-95 transition-all flex items-center gap-2">
                           <FiCheck /> Save Changes
                         </button>
                       </div>
                    </form>
                  ) : (
                    <div>
                      <div className="flex justify-between items-start mb-3">
                        <span className="text-xs font-bold bg-slate-100 text-slate-600 px-3 py-1.5 rounded-lg border border-slate-200">
                          {eq.subject} <span className="text-slate-400 mx-1">•</span> {eq.topic}
                        </span>
                        <div className="flex gap-1">
                          <button onClick={() => setEditingQuestionId(eq._id)} className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors">
                            <FiEdit2 size={18} />
                          </button>
                          <button onClick={() => handleDeleteExisting(eq._id)} className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                            <FiTrash2 size={18} />
                          </button>
                        </div>
                      </div>
                      <p className="font-semibold text-slate-900 mb-4 text-lg leading-snug">{eq.questionText}</p>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-semibold uppercase tracking-wider text-slate-500">Answer:</span>
                        <span className="font-bold uppercase text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded text-sm border border-emerald-100">
                          {eq.correctOption}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
              {existingQuestions.length === 0 && (
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <p className="text-slate-500 font-medium">No questions added to this exam yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. Bulk Add / JSON Upload Form */}
          <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center border-b border-slate-100 pb-4 mb-6 gap-4">
              <h2 className="text-lg font-bold tracking-tight text-slate-900">
                3. Add New Questions
              </h2>
              <button
                onClick={() => setShowJsonImport(!showJsonImport)}
                className="flex items-center gap-2 text-sm font-semibold text-blue-600 bg-blue-50 px-4 py-2 rounded-lg hover:bg-blue-100 transition-colors"
              >
                <FiCode /> {showJsonImport ? "Close JSON Importer" : "Import from JSON"}
              </button>
            </div>

            {/* JSON Importer Block */}
            {showJsonImport && (
              <div className="mb-8 p-5 rounded-2xl bg-slate-900 shadow-inner">
                <div className="flex items-center justify-between mb-3 text-slate-300">
                  <label className="text-sm font-semibold uppercase tracking-wider">Paste JSON Array Here</label>
                </div>
                <textarea
                  value={jsonInput}
                  onChange={(e) => setJsonInput(e.target.value)}
                  className="w-full h-48 rounded-xl bg-slate-800 text-emerald-400 font-mono text-sm p-4 focus:ring-2 focus:ring-blue-500 focus:outline-none border border-slate-700 placeholder:text-slate-600"
                  placeholder='[&#10;  {&#10;    "subject": "General Knowledge",&#10;    "topic": "History",&#10;    "questionText": "Sample Question?",&#10;    "optionA": "Op 1",&#10;    "optionB": "Op 2",&#10;    "optionC": "Op 3",&#10;    "optionD": "Op 4",&#10;    "correctOption": "a"&#10;  }&#10;]'
                />
                {jsonError && (
                  <div className="mt-3 text-red-400 text-sm flex items-center gap-2 bg-red-950/50 p-3 rounded-lg border border-red-900/50">
                    <FiAlertCircle /> {jsonError}
                  </div>
                )}
                <div className="mt-4 flex justify-end">
                  <button
                    onClick={handleLoadJson}
                    className="bg-blue-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-blue-500 transition-colors"
                  >
                    Parse & Load to Form
                  </button>
                </div>
              </div>
            )}

            {/* Manual Entry Cards Map */}
            <div className="space-y-6">
              {questions.map((q, index) => (
                <div key={index} className="p-6 rounded-2xl border border-slate-200 bg-slate-50/30 relative group transition-all hover:border-blue-200">

                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(index)}
                      className="absolute -top-3 -right-3 bg-white p-2 rounded-full border border-slate-200 text-slate-400 hover:text-red-500 hover:border-red-200 hover:bg-red-50 shadow-sm transition-all opacity-0 group-hover:opacity-100 focus:opacity-100"
                      title="Remove Question"
                    >
                      <FiX size={16} />
                    </button>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Subject</label>
                      <CustomSelect
                        value={q.subject}
                        onChange={(val: string) => handleQuestionChange(index, "subject", val)}
                        options={subjectOptions}
                        placeholder="Select Subject"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Topic</label>
                      <input type="text" value={q.topic} onChange={(e) => handleQuestionChange(index, "topic", e.target.value)} placeholder="e.g. Modern History" className={inputClass} />
                    </div>
                  </div>

                  <div className="mb-5">
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Question Text</label>
                    <textarea rows={2} value={q.questionText} onChange={(e) => handleQuestionChange(index, "questionText", e.target.value)} className={inputClass} placeholder="Enter the question here..."></textarea>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
                    <input type="text" placeholder="Option A" value={q.optionA} onChange={(e) => handleQuestionChange(index, "optionA", e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Option B" value={q.optionB} onChange={(e) => handleQuestionChange(index, "optionB", e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Option C" value={q.optionC} onChange={(e) => handleQuestionChange(index, "optionC", e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Option D" value={q.optionD} onChange={(e) => handleQuestionChange(index, "optionD", e.target.value)} className={inputClass} />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Correct Option</label>
                      <CustomSelect
                        value={q.correctOption}
                        onChange={(val: string) => handleQuestionChange(index, "correctOption", val)}
                        options={correctOptionOptions}
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Difficulty</label>
                      <CustomSelect
                        value={q.difficulty}
                        onChange={(val: string) => handleQuestionChange(index, "difficulty", val)}
                        options={difficultyOptions}
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-500 mb-1.5 uppercase tracking-wider">Explanation (Optional)</label>
                    <textarea rows={2} value={q.explanation} onChange={(e) => handleQuestionChange(index, "explanation", e.target.value)} className={inputClass} placeholder="Explain the correct answer..."></textarea>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions Footer */}
            <div className="flex flex-col sm:flex-row items-center gap-4 pt-6 mt-6 border-t border-slate-100">
              <button onClick={addQuestion} className="w-full sm:w-auto flex justify-center items-center gap-2 px-6 py-3 rounded-xl border-2 border-slate-200 text-slate-600 font-bold hover:border-slate-300 hover:bg-slate-50 hover:text-slate-900 transition-all">
                <FiPlus size={18} /> Add Blank Question
              </button>
              <button
                onClick={handleBulkSubmit}
                disabled={isSubmitting}
                className="w-full sm:flex-1 bg-slate-900 text-white px-8 py-3 rounded-xl font-bold hover:bg-blue-600 transition-all disabled:opacity-50 hover:shadow-lg hover:shadow-blue-600/20 disabled:hover:shadow-none"
              >
                {isSubmitting ? "Publishing..." : `Publish ${questions.length} Question(s) to DB`}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
