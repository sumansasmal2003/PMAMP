import Link from "next/link";
import { FiBookOpen, FiSettings, FiDatabase, FiGrid } from "react-icons/fi";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-slate-50">
      {/* Admin Sidebar */}
      <aside className="w-64 bg-white border-r border-sky-100 flex flex-col hidden md:flex">
        <div className="h-16 flex items-center px-6 border-b border-sky-100">
          <Link href="/admin" className="flex items-center gap-2 text-blue-600">
            <FiSettings className="text-xl" />
            <span className="font-bold tracking-tight text-lg">Admin Panel</span>
          </Link>
        </div>
        <nav className="flex-1 p-4 flex flex-col gap-2">
          <Link href="/admin" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-sky-50 hover:text-blue-600 transition-colors">
            <FiGrid /> Dashboard
          </Link>
          <Link href="/admin/exams" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-sky-50 hover:text-blue-600 transition-colors">
            <FiBookOpen /> Manage Exams
          </Link>
          <Link href="/admin/questions" className="flex items-center gap-3 px-3 py-2 rounded-lg text-slate-600 hover:bg-sky-50 hover:text-blue-600 transition-colors">
            <FiDatabase /> Manage Questions
          </Link>
        </nav>
        <div className="p-4 border-t border-sky-100">
          <Link href="/" className="text-sm text-blue-600 hover:underline">
            &larr; Back to Main Site
          </Link>
        </div>
      </aside>

      {/* Admin Main Content */}
      <main className="flex-1 p-8 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
