"use client";

import Link from "next/link";
import { useState } from "react";
import { FiMenu, FiX, FiBookOpen } from "react-icons/fi";
import { motion, AnimatePresence } from "framer-motion";

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 w-full border-b border-sky-100 bg-white/80 backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <Link href="/" className="flex items-center gap-2 text-blue-600">
          <FiBookOpen className="text-2xl" />
          <span className="text-2xl font-bold tracking-tight">PrepMaster</span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex gap-8 font-medium text-slate-600">
          <Link href="/exams" className="hover:text-blue-600 transition-colors">Exams</Link>
          <Link href="/mock-tests" className="hover:text-blue-600 transition-colors">Mock Tests</Link>
          <Link href="/materials" className="hover:text-blue-600 transition-colors">Study Materials</Link>
        </nav>

        <div className="hidden md:flex items-center gap-4">
          <Link href="/mock-tests" className="rounded-md bg-blue-600 px-5 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 transition-all">
            Start Practicing Free
          </Link>
        </div>

        {/* Mobile Menu Toggle */}
        <button
          className="md:hidden text-slate-600 text-2xl"
          onClick={() => setIsOpen(!isOpen)}
        >
          {isOpen ? <FiX /> : <FiMenu />}
        </button>
      </div>

      {/* Mobile Nav Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden border-t border-sky-50 bg-white px-4 py-4 shadow-lg overflow-hidden"
          >
            <nav className="flex flex-col gap-4 font-medium text-slate-600">
              <Link href="/exams" onClick={() => setIsOpen(false)}>Exams</Link>
              <Link href="/mock-tests" onClick={() => setIsOpen(false)}>Mock Tests</Link>
              <Link href="/materials" onClick={() => setIsOpen(false)}>Study Materials</Link>
              <hr className="border-sky-50 my-2" />
              <Link href="/mock-tests" onClick={() => setIsOpen(false)} className="text-blue-600 font-semibold">
                Start Practicing Free
              </Link>
            </nav>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
