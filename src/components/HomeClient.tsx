"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { FaLandmark, FaUsersCog, FaMoneyCheckAlt, FaTrain, FaMapMarkedAlt, FaGraduationCap } from "react-icons/fa";
import { FiArrowRight } from "react-icons/fi";

// Map database string names to actual React Icons
const IconMap: Record<string, React.ElementType> = {
  FaLandmark,
  FaUsersCog,
  FaMoneyCheckAlt,
  FaTrain,
  FaMapMarkedAlt,
};

// Color palettes to dynamically apply to the fetched exams
const colorPalettes = [
  { color: "text-amber-600", bg: "bg-amber-100" },
  { color: "text-blue-600", bg: "bg-blue-100" },
  { color: "text-emerald-600", bg: "bg-emerald-100" },
  { color: "text-rose-600", bg: "bg-rose-100" },
  { color: "text-purple-600", bg: "bg-purple-100" },
];

const containerVariants: Variants = = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 }
  }
};

const itemVariants: Variants = = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

interface ExamProp {
  _id: string;
  name: string;
  slug: string;
  iconName: string;
}

export default function HomeClient({ popularExams }: { popularExams: ExamProp[] }) {
  return (
    <div className="flex flex-col w-full">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-sky-50 to-white px-6 py-24 sm:py-32 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut" }}
          className="mx-auto max-w-4xl text-center"
        >
          <div className="mb-6 inline-flex rounded-full bg-blue-100 px-3 py-1 text-sm font-semibold text-blue-700 ring-1 ring-inset ring-blue-600/20">
            India's Most Trusted Learning Platform
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 sm:text-6xl leading-tight">
            Crack your dream exam with <span className="text-blue-600">confidence</span>
          </h1>
          <p className="mt-6 text-lg leading-8 text-slate-600 max-w-2xl mx-auto">
            Access premium mock tests, structured daily routines, and comprehensive study materials designed specifically for Indian competitive examinations.
          </p>
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <Link
              href="/exams"
              className="rounded-md bg-blue-600 px-6 py-3 text-lg font-semibold text-white shadow-sm hover:bg-blue-500 transition-transform hover:scale-105 active:scale-95"
            >
              Take a Free Mock Test
            </Link>
            <Link href="/materials" className="group flex items-center gap-2 text-lg font-semibold leading-6 text-slate-900 hover:text-blue-600 transition-colors">
              Browse Materials <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>
          </div>
        </motion.div>
      </section>

      {/* Exam Categories Section */}
      <section className="py-16 bg-white">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="mx-auto max-w-2xl text-center"
          >
            <h2 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">Popular Examinations</h2>
            <p className="mt-4 text-slate-600">Select your target exam to get a personalized study plan.</p>
          </motion.div>

          <motion.div
            variants={containerVariants}
            initial="hidden"
            whileInView="show"
            viewport={{ once: true, margin: "-100px" }}
            className="mx-auto mt-12 grid max-w-lg grid-cols-1 gap-4 sm:max-w-xl sm:grid-cols-2 lg:max-w-none lg:grid-cols-5"
          >
            {popularExams.map((exam, index) => {
              const IconComponent = IconMap[exam.iconName] || FaGraduationCap;
              const palette = colorPalettes[index % colorPalettes.length];

              return (
                <motion.div
                  variants={itemVariants}
                  key={exam._id}
                  whileHover={{ y: -5 }}
                  className="flex flex-col items-center justify-center gap-3 rounded-2xl bg-slate-50 border border-slate-100 p-8 text-center shadow-sm hover:shadow-md hover:border-blue-200 transition-all cursor-pointer relative group"
                >
                  <div className={`p-4 rounded-full ${palette.bg}`}>
                    <IconComponent className={`text-3xl ${palette.color}`} />
                  </div>
                  <span className="font-bold text-slate-800">{exam.name}</span>

                  {/* Makes the card clickable directly to that specific exam */}
                  <Link href={`/exams/${exam.slug}`} className="absolute inset-0 z-10">
                    <span className="sr-only">View {exam.name}</span>
                  </Link>
                </motion.div>
              );
            })}

            {popularExams.length === 0 && (
              <div className="col-span-full text-center text-slate-500 py-8">
                No exams published yet. Check back soon!
              </div>
            )}
          </motion.div>
        </div>
      </section>
    </div>
  );
}
