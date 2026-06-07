import Link from "next/link";
import { LayoutDashboard, BookOpen, Database, LogOut, Settings } from "lucide-react";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex h-screen w-full bg-slate-50 text-slate-900 overflow-hidden font-sans">
      {/* Admin Sidebar */}
      <aside className="hidden md:flex flex-col w-64 h-full flex-shrink-0 bg-white border-r border-slate-200 z-10 shadow-sm">

        {/* Header */}
        <div className="h-16 flex-shrink-0 flex items-center px-6 border-b border-slate-100">
          <Link href="/admin" className="flex items-center gap-3 text-slate-900">
            <div className="bg-slate-900 p-1.5 rounded-lg text-white">
              <Settings size={18} />
            </div>
            <span className="font-bold tracking-wide text-lg">Admin Portal</span>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 flex flex-col gap-1.5 overflow-y-auto">
          <Link
            href="/admin"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <LayoutDashboard size={18} /> Dashboard
          </Link>
          <Link
            href="/admin/exams"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <BookOpen size={18} /> Manage Exams
          </Link>
          <Link
            href="/admin/questions"
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-slate-100 hover:text-slate-900 transition-colors"
          >
            <Database size={18} /> Manage Questions
          </Link>
        </nav>

        {/* Footer / Logout */}
        <div className="p-4 border-t border-slate-100 flex-shrink-0 bg-slate-50/50 space-y-2">
          <Link
            href="/login"
            className="flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-slate-600 font-medium hover:bg-red-50 hover:text-red-600 transition-colors"
          >
            <LogOut size={18} /> Log Out
          </Link>
        </div>
      </aside>

      {/* Admin Main Content */}
      <main className="flex-1 h-full overflow-y-auto p-4 md:p-8 relative">
        <div className="max-w-6xl mx-auto pb-12">
          {children}
        </div>
      </main>
    </div>
  );
}
