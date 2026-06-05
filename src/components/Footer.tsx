import Link from "next/link";
import { FaYoutube, FaTelegram, FaTwitter } from "react-icons/fa";
import { FiBookOpen } from "react-icons/fi";

export default function Footer() {
  return (
    <footer className="border-t border-sky-100 bg-white py-12 mt-auto">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="flex flex-col gap-4">
          <Link href="/" className="flex items-center gap-2 text-blue-600">
             <FiBookOpen className="text-xl" />
             <span className="text-xl font-bold tracking-tight">PrepMaster</span>
          </Link>
          <p className="text-sm text-slate-500">
            Empowering Indian aspirants with premium study materials and realistic mock tests.
          </p>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Quick Links</h3>
          <ul className="flex flex-col gap-2 text-sm text-slate-600">
            <li><Link href="/about" className="hover:text-blue-600">About Us</Link></li>
            <li><Link href="/contact" className="hover:text-blue-600">Contact Support</Link></li>
            <li><Link href="/pricing" className="hover:text-blue-600">Pricing Plans</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Legal</h3>
          <ul className="flex flex-col gap-2 text-sm text-slate-600">
            <li><Link href="/privacy" className="hover:text-blue-600">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-blue-600">Terms of Service</Link></li>
            <li><Link href="/refund" className="hover:text-blue-600">Refund Policy</Link></li>
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-slate-900 mb-4">Connect</h3>
          <div className="flex gap-4 text-slate-400">
            <a href="#" className="hover:text-blue-600 text-xl transition-colors"><FaYoutube /></a>
            <a href="#" className="hover:text-blue-500 text-xl transition-colors"><FaTelegram /></a>
            <a href="#" className="hover:text-blue-400 text-xl transition-colors"><FaTwitter /></a>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 mt-12 pt-8 border-t border-slate-100 text-center text-sm text-slate-500">
        © {new Date().getFullYear()} PrepMaster India. All rights reserved.
      </div>
    </footer>
  );
}
