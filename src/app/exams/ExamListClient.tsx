"use client";

import Link from "next/link";
import { motion, Variants } from "framer-motion";
import { FiArrowRight } from "react-icons/fi";
import { FaLandmark, FaUsersCog, FaMoneyCheckAlt, FaTrain, FaMapMarkedAlt, FaGraduationCap } from "react-icons/fa";

const IconMap: Record<string, React.ElementType> = {
  FaLandmark, FaUsersCog, FaMoneyCheckAlt, FaTrain, FaMapMarkedAlt,
};

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.1 } }
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: "spring", stiffness: 300, damping: 24 } }
};

interface CategoryProps {
  _id: string;
  title: string;
  slug: string;
  description: string;
  iconName: string;
  subjects: string[];
}

export default function ExamListClient({ categories }: { categories: CategoryProps[] }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
    >
      {categories.map((category) => {
        const IconComponent = IconMap[category.iconName] || FaGraduationCap;

        return (
          <motion.div
            key={category._id}
            variants={itemVariants}
            whileHover={{ y: -4 }}
            className="group relative flex flex-col bg-white rounded-2xl border border-sky-100 p-8 shadow-sm hover:shadow-md hover:border-blue-300 transition-all"
          >
            <div className="flex items-center gap-4 mb-4">
              <div className="p-3 rounded-xl bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white transition-colors">
                <IconComponent className="text-2xl" />
              </div>
              <h3 className="text-xl font-bold text-slate-900">{category.title}</h3>
            </div>

            <p className="text-slate-600 mb-6 flex-grow">
              {category.description}
            </p>

            {/* Subject Tags */}
            <div className="flex flex-wrap gap-2 mb-8">
              {category.subjects.slice(0, 3).map(sub => (
                <span key={sub} className="px-2.5 py-1 rounded-md bg-sky-50 text-blue-700 text-xs font-medium">
                  {sub}
                </span>
              ))}
              {category.subjects.length > 3 && (
                <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-medium">
                  +{category.subjects.length - 3} more
                </span>
              )}
            </div>

            <Link
              href={`/exams/${category.slug}`}
              className="mt-auto inline-flex items-center gap-2 text-sm font-semibold text-blue-600 hover:text-blue-800"
            >
              Start Practicing
              <FiArrowRight className="transition-transform group-hover:translate-x-1" />
            </Link>

            <Link href={`/exams/${category.slug}`} className="absolute inset-0 z-10">
              <span className="sr-only">Start {category.title}</span>
            </Link>
          </motion.div>
        );
      })}
    </motion.div>
  );
}
