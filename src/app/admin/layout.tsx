import Link from "next/link";
import { FiBookOpen, FiSettings, FiDatabase, FiGrid } from "react-icons/fi";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    // 1. Changed min-h-screen to h-screen and added overflow-hidden
    <div className="flex h-screen w-full bg-slate-50 overflow-hidden font-sans">

      {/* Admin Sidebar */}
      {/* 2. Added h-full and flex-shrink-0 so the sidebar stretches top-to-bottom and never gets compressed */}
      <aside className="hidden md:flex flex-col w-64 h-full flex-shrink-0 bg-white border-r border-sky-100 z-10">

        {/* Header - flex-shrink-0 keeps it from collapsing */}
        <div className="h-16 flex-shrink-0 flex items-center px-6 border-b border-sky-100">
          <Link href="/admin" className="flex items-center gap-2 text-blue-600">
            <FiSettings className="text-xl" />
            <span className="font-bold tracking-tight text-lg">Admin Panel</span>
          </Link>
        </div>

        {/* Navigation - flex-1 allows it to take available space, overflow-y-auto allows it to scroll if too many links are added */}
        <nav className="flex-1 p-4 flex flex-col gap-2 overflow-y-auto">
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

        {/* Footer - flex-shrink-0 keeps it pinned to the bottom */}
        <div className="p-4 border-t border-sky-100 flex-shrink-0 bg-slate-50/50">
          <Link href="/" className="text-sm font-medium text-blue-600 hover:underline">
            &larr; Back to Main Site
          </Link>
        </div>
      </aside>

      {/* Admin Main Content */}
      {/* 3. Added h-full. The overflow-y-auto here means ONLY this section will get a scrollbar when the content gets long */}
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 relative">
        <div className="max-w-6xl mx-auto pb-12">
          {children}
        </div>
      </main>

    </div>
  );
}
