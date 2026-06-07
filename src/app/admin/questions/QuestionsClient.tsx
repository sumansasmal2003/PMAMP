"use client";

import { useState, useEffect, useRef } from "react";
import { createMultipleQuestions, getQuestionsByExam, deleteQuestion, updateQuestion } from "@/actions/admin";
import { FiPlus, FiTrash2, FiEdit2, FiX, FiCheck, FiChevronDown, FiCode, FiAlertCircle, FiDatabase, FiFileText } from "react-icons/fi";

interface Exam {
  _id: string;
  title: string;
  subjects: string[];
}

// --- Premium Custom Dropdown Component ---
const CustomSelect = ({ value, defaultValue, onChange, options, placeholder, name }: any) => {
  const [internalValue, setInternalValue] = useState(value || defaultValue || "");
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value !== undefined) setInternalValue(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) setIsOpen(false);
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
    <div className="relative w-full" ref={dropdownRef}>
      {name && <input type="hidden" name={name} value={internalValue} />}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={`flex w-full items-center justify-between rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm font-medium transition-all hover:bg-slate-50 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10 ${!selectedLabel ? "text-slate-400" : "text-slate-900"}`}
      >
        <span className="truncate">{selectedLabel || placeholder}</span>
        <FiChevronDown className={`text-slate-400 transition-transform duration-300 ${isOpen ? "rotate-180" : ""}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full animate-in fade-in slide-in-from-top-2 rounded-xl border border-slate-100 bg-white/95 p-1.5 shadow-xl shadow-slate-200/50 backdrop-blur-xl">
          <div className="max-h-64 overflow-y-auto custom-scrollbar pr-1">
            {options.map((opt: any) => (
              <div
                key={opt.value}
                onClick={() => handleSelect(opt.value)}
                className={`mb-1 cursor-pointer rounded-lg px-3 py-2.5 text-sm transition-all last:mb-0 ${internalValue === opt.value ? "bg-blue-50 text-blue-700 font-semibold" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
              >
                {opt.label}
              </div>
            ))}
            {options.length === 0 && <div className="px-3 py-3 text-center text-sm text-slate-400">No options available</div>}
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

  const [questions, setQuestions] = useState([
    { subject: "", topic: "", questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "a", difficulty: "Medium", explanation: "" }
  ]);
  const [isSubmitting, setIsSubmitting] = useState(false);

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

  const handleLoadJson = () => {
    try {
      setJsonError("");
      const parsed = JSON.parse(jsonInput);
      if (!Array.isArray(parsed)) throw new Error("Invalid format: JSON must be an array of objects.");

      const formattedQuestions = parsed.map((q: any) => ({
        subject: q.subject || "",
        topic: q.topic || "",
        questionText: q.questionText || "",
        optionA: q.optionA || q.options?.a || "",
        optionB: q.optionB || q.options?.b || "",
        optionC: q.optionC || q.options?.c || "",
        optionD: q.optionD || q.options?.d || "",
        correctOption: q.correctOption?.toLowerCase() || "a",
        difficulty: q.difficulty || "Medium",
        explanation: q.explanation || ""
      }));

      if (questions.length === 1 && !questions[0].questionText) {
        setQuestions(formattedQuestions);
      } else {
        setQuestions([...questions, ...formattedQuestions]);
      }

      setJsonInput("");
      setShowJsonImport(false);
      alert(`Loaded ${formattedQuestions.length} questions into the editor!`);
    } catch (err: any) {
      setJsonError(err.message || "Invalid JSON syntax.");
    }
  };

  const handleQuestionChange = (index: number, field: string, value: string) => {
    const newQuestions = [...questions];
    (newQuestions[index] as any)[field] = value;
    setQuestions(newQuestions);
  };

  const addQuestion = () => setQuestions([...questions, { subject: "", topic: "", questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "a", difficulty: "Medium", explanation: "" }]);
  const removeQuestion = (index: number) => setQuestions(questions.filter((_, i) => i !== index));

  const handleBulkSubmit = async () => {
    if (!selectedExamId) return;
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
      setQuestions([{ subject: "", topic: "", questionText: "", optionA: "", optionB: "", optionC: "", optionD: "", correctOption: "a", difficulty: "Medium", explanation: "" }]);
      getQuestionsByExam(selectedExamId).then(setExistingQuestions);
    }
    setIsSubmitting(false);
  };

  const handleDeleteExisting = async (id: string) => {
    if (!confirm("Are you sure you want to permanently delete this question?")) return;
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
    }
  };

  const examOptions = exams.map(e => ({ label: e.title, value: e._id }));
  const subjectOptions = activeExam?.subjects.map(s => ({ label: s, value: s })) || [];
  const correctOptionOptions = [{ label: "Option A", value: "a" }, { label: "Option B", value: "b" }, { label: "Option C", value: "c" }, { label: "Option D", value: "d" }];
  const difficultyOptions = [{ label: "Easy", value: "Easy" }, { label: "Medium", value: "Medium" }, { label: "Hard", value: "Hard" }];

  // Reusable strict styling
  const inputClass = "w-full rounded-xl border border-slate-200/80 bg-slate-50/50 px-4 py-3 text-sm text-slate-900 transition-all placeholder:text-slate-400 hover:bg-slate-50 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-4 focus:ring-blue-500/10";
  const labelClass = "mb-1.5 block text-[11px] font-bold uppercase tracking-widest text-slate-500";
  const cardClass = "overflow-visible rounded-3xl border border-slate-200/60 bg-white shadow-sm p-8";

  return (
    <div className="mx-auto max-w-5xl space-y-8 font-sans pb-10">

      {/* 1. Select Exam Card */}
      <div className={cardClass}>
        <div className="mb-6 flex items-center gap-4 border-b border-slate-100 pb-5">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
            <FiDatabase size={22} />
          </div>
          <div>
            <h2 className="text-xl font-bold tracking-tight text-slate-900">1. Select Examination</h2>
            <p className="text-sm text-slate-500">Choose the exam context before managing questions.</p>
          </div>
        </div>

        <div className="w-full md:w-1/2">
          <CustomSelect
            value={selectedExamId}
            onChange={setSelectedExamId}
            options={examOptions}
            placeholder="Search or select an exam..."
          />
        </div>
      </div>

      {selectedExamId && (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 space-y-8">

          {/* 2. Existing Questions */}
          <div className={cardClass}>
            <div className="mb-8 flex items-center justify-between border-b border-slate-100 pb-5">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-50 text-indigo-600">
                  <FiFileText size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">2. Existing Database</h2>
                  <p className="text-sm text-slate-500">Live questions for {activeExam?.title}</p>
                </div>
              </div>
              <span className="flex h-8 items-center justify-center rounded-full bg-slate-100 px-4 text-sm font-bold text-slate-600">
                {existingQuestions.length} Total
              </span>
            </div>

            {/* Removed the max-h-[600px] overflow-y-auto to fix the double scrollbar! */}
            <div className="space-y-5">
              {existingQuestions.map((eq) => (
                <div key={eq._id} className="group relative rounded-2xl border border-slate-200/60 bg-white p-6 transition-all hover:border-blue-300 hover:shadow-md hover:shadow-blue-900/5">
                  {editingQuestionId === eq._id ? (
                    <form action={(formData) => handleUpdateExisting(eq._id, formData)} className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                       <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                         <span className="flex items-center gap-2 text-sm font-bold text-blue-600">
                           <FiEdit2 /> Editing Question Mode
                         </span>
                         <button type="button" onClick={() => setEditingQuestionId(null)} className="rounded-full p-2 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700">
                           <FiX size={18}/>
                         </button>
                       </div>

                       <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                         <div><label className={labelClass}>Subject</label><CustomSelect name="subject" defaultValue={eq.subject} options={subjectOptions} /></div>
                         <div><label className={labelClass}>Topic</label><input name="topic" defaultValue={eq.topic} className={inputClass} /></div>
                       </div>
                       <div><label className={labelClass}>Question</label><textarea name="questionText" defaultValue={eq.questionText} className={inputClass} rows={2} /></div>

                       <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                         <input name="optionA" defaultValue={eq.options.a} className={inputClass} placeholder="Option A" />
                         <input name="optionB" defaultValue={eq.options.b} className={inputClass} placeholder="Option B" />
                         <input name="optionC" defaultValue={eq.options.c} className={inputClass} placeholder="Option C" />
                         <input name="optionD" defaultValue={eq.options.d} className={inputClass} placeholder="Option D" />
                       </div>

                       <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                          <div><label className={labelClass}>Correct Answer</label><CustomSelect name="correctOption" defaultValue={eq.correctOption} options={correctOptionOptions} /></div>
                          <div><label className={labelClass}>Difficulty</label><CustomSelect name="difficulty" defaultValue={eq.difficulty} options={difficultyOptions} /></div>
                       </div>

                       <div><label className={labelClass}>Explanation</label><textarea name="explanation" defaultValue={eq.explanation} className={inputClass} rows={2} /></div>

                       <div className="flex justify-end pt-2">
                         <button type="submit" className="flex items-center gap-2 rounded-xl bg-blue-600 px-6 py-2.5 text-sm font-bold text-white shadow-sm transition-all hover:bg-blue-700 active:scale-95">
                           <FiCheck size={16} /> Save Changes
                         </button>
                       </div>
                    </form>
                  ) : (
                    <div>
                      <div className="mb-4 flex items-start justify-between">
                        <span className="inline-flex items-center gap-2 rounded-lg bg-slate-100 px-3 py-1.5 text-[11px] font-bold uppercase tracking-wider text-slate-600">
                          {eq.subject} <span className="text-slate-300">•</span> {eq.topic}
                        </span>
                        <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                          <button onClick={() => setEditingQuestionId(eq._id)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-blue-50 hover:text-blue-600">
                            <FiEdit2 size={16} />
                          </button>
                          <button onClick={() => handleDeleteExisting(eq._id)} className="rounded-lg p-2 text-slate-400 transition-colors hover:bg-red-50 hover:text-red-600">
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      </div>
                      <p className="mb-5 text-base font-semibold leading-relaxed text-slate-900">{eq.questionText}</p>
                      <div className="flex items-center gap-3">
                        <span className="rounded bg-emerald-50 px-2 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-600 border border-emerald-200/50">
                          Answer: {eq.correctOption}
                        </span>
                        <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                          {eq.difficulty}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}

              {existingQuestions.length === 0 && (
                <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-slate-300 bg-slate-50 py-16">
                  <div className="mb-3 rounded-full bg-slate-200/50 p-4 text-slate-400">
                    <FiDatabase size={24} />
                  </div>
                  <p className="font-medium text-slate-500">No questions saved yet.</p>
                </div>
              )}
            </div>
          </div>

          {/* 3. Add New Questions */}
          <div className={cardClass}>
            <div className="mb-8 flex flex-col items-start justify-between gap-4 border-b border-slate-100 pb-5 sm:flex-row sm:items-center">
              <div className="flex items-center gap-4">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600">
                  <FiPlus size={22} />
                </div>
                <div>
                  <h2 className="text-xl font-bold tracking-tight text-slate-900">3. Add New Questions</h2>
                  <p className="text-sm text-slate-500">Add manually or import via JSON array</p>
                </div>
              </div>
              <button
                onClick={() => setShowJsonImport(!showJsonImport)}
                className={`flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-bold transition-all active:scale-95 ${showJsonImport ? "bg-slate-900 text-white shadow-md" : "bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"}`}
              >
                <FiCode size={16} /> {showJsonImport ? "Close JSON Editor" : "Import JSON"}
              </button>
            </div>

            {/* JSON Importer */}
            {showJsonImport && (
              <div className="mb-8 animate-in fade-in slide-in-from-top-4 overflow-hidden rounded-2xl border border-slate-800 bg-[#0f172a] shadow-2xl">
                <div className="flex items-center justify-between border-b border-slate-800 bg-slate-900/50 px-5 py-3">
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-rose-500/80"></div>
                    <div className="h-3 w-3 rounded-full bg-amber-500/80"></div>
                    <div className="h-3 w-3 rounded-full bg-emerald-500/80"></div>
                  </div>
                  <span className="font-mono text-xs font-medium text-slate-500">questions.json</span>
                </div>
                <div className="p-5">
                  <textarea
                    value={jsonInput}
                    onChange={(e) => setJsonInput(e.target.value)}
                    className="h-56 w-full resize-y bg-transparent font-mono text-sm leading-relaxed text-blue-300 placeholder-slate-600 focus:outline-none custom-scrollbar"
                    placeholder='[\n  {\n    "subject": "General Knowledge",\n    "topic": "History",\n    "questionText": "Sample Question?",\n    "optionA": "Opt 1",\n    "optionB": "Opt 2",\n    "optionC": "Opt 3",\n    "optionD": "Opt 4",\n    "correctOption": "a",\n    "explanation": "Because..."\n  }\n]'
                  />
                  {jsonError && (
                    <div className="mt-4 flex items-center gap-2 rounded-lg border border-red-900/30 bg-red-500/10 p-3 text-sm text-red-400">
                      <FiAlertCircle size={16} /> {jsonError}
                    </div>
                  )}
                  <div className="mt-5 flex justify-end border-t border-slate-800 pt-5">
                    <button onClick={handleLoadJson} className="rounded-lg bg-blue-600 px-6 py-2 text-sm font-bold text-white transition-all hover:bg-blue-500 active:scale-95">
                      Compile & Add to Form
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* Manual Entry Forms */}
            <div className="space-y-8">
              {questions.map((q, index) => (
                <div key={index} className="group relative rounded-2xl border border-slate-200/80 bg-slate-50/30 p-7 transition-all hover:border-blue-300 hover:bg-white hover:shadow-lg hover:shadow-blue-900/5">

                  {questions.length > 1 && (
                    <button
                      onClick={() => removeQuestion(index)}
                      className="absolute -right-3 -top-3 rounded-full border border-slate-200 bg-white p-2.5 text-slate-400 shadow-sm transition-all hover:border-red-200 hover:bg-red-50 hover:text-red-500 focus:opacity-100 group-hover:opacity-100 md:opacity-0"
                    >
                      <FiX size={16} />
                    </button>
                  )}

                  <div className="mb-6 flex items-center gap-3">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full bg-slate-200/80 text-[11px] font-bold text-slate-600">
                      {index + 1}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 uppercase tracking-widest opacity-50">Draft Question</h3>
                  </div>

                  <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div><label className={labelClass}>Subject</label><CustomSelect value={q.subject} onChange={(val: string) => handleQuestionChange(index, "subject", val)} options={subjectOptions} placeholder="Select Subject" /></div>
                    <div><label className={labelClass}>Topic</label><input type="text" value={q.topic} onChange={(e) => handleQuestionChange(index, "topic", e.target.value)} placeholder="e.g. Modern History" className={inputClass} /></div>
                  </div>

                  <div className="mb-6">
                    <label className={labelClass}>Question Text</label>
                    <textarea rows={2} value={q.questionText} onChange={(e) => handleQuestionChange(index, "questionText", e.target.value)} className={inputClass} placeholder="Enter the complete question..."></textarea>
                  </div>

                  <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-2">
                    <input type="text" placeholder="Option A" value={q.optionA} onChange={(e) => handleQuestionChange(index, "optionA", e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Option B" value={q.optionB} onChange={(e) => handleQuestionChange(index, "optionB", e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Option C" value={q.optionC} onChange={(e) => handleQuestionChange(index, "optionC", e.target.value)} className={inputClass} />
                    <input type="text" placeholder="Option D" value={q.optionD} onChange={(e) => handleQuestionChange(index, "optionD", e.target.value)} className={inputClass} />
                  </div>

                  <div className="mb-6 grid grid-cols-1 gap-5 md:grid-cols-2">
                    <div><label className={labelClass}>Correct Option</label><CustomSelect value={q.correctOption} onChange={(val: string) => handleQuestionChange(index, "correctOption", val)} options={correctOptionOptions} /></div>
                    <div><label className={labelClass}>Difficulty</label><CustomSelect value={q.difficulty} onChange={(val: string) => handleQuestionChange(index, "difficulty", val)} options={difficultyOptions} /></div>
                  </div>

                  <div>
                    <label className={labelClass}>Explanation <span className="font-normal lowercase text-slate-400">(Optional)</span></label>
                    <textarea rows={2} value={q.explanation} onChange={(e) => handleQuestionChange(index, "explanation", e.target.value)} className={inputClass} placeholder="Provide logic or formula..."></textarea>
                  </div>
                </div>
              ))}
            </div>

            {/* Actions Footer */}
            <div className="mt-8 flex flex-col items-center gap-4 border-t border-slate-100 pt-8 sm:flex-row">
              <button onClick={addQuestion} className="flex w-full items-center justify-center gap-2 rounded-xl border-2 border-dashed border-slate-300 bg-white px-6 py-3.5 text-sm font-bold text-slate-600 transition-all hover:border-slate-400 hover:text-slate-900 active:scale-95 sm:w-auto">
                <FiPlus size={18} /> Add Form Row
              </button>
              <button
                onClick={handleBulkSubmit}
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-900 px-8 py-3.5 text-sm font-bold text-white shadow-xl shadow-slate-900/10 transition-all hover:bg-blue-600 hover:shadow-blue-600/20 active:scale-95 disabled:pointer-events-none disabled:opacity-60 sm:flex-1"
              >
                {isSubmitting ? "Publishing to DB..." : `Publish ${questions.length} Question${questions.length > 1 ? 's' : ''} to Live Database`}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
