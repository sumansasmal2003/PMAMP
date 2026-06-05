import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

const googleSans = localFont({
  src: [
    {
      path: "../fonts/GoogleSans-VariableFont_GRAD,opsz,wght.ttf",
      style: "normal",
      weight: "100 900", // Explicitly define the variable weight range
    },
    {
      path: "../fonts/GoogleSans-Italic-VariableFont_GRAD,opsz,wght.ttf",
      style: "italic",
      weight: "100 900", // Explicitly define the variable weight range
    },
  ],
  variable: "--font-google-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "PrepMaster India | Competitive Exam Portal",
  description: "Comprehensive study materials and mock tests for UPSC, SSC, Banking, and State PSCs.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${googleSans.variable} font-sans h-full antialiased`}>
      <body className="min-h-full flex flex-col bg-slate-50 text-slate-900">
        <Navbar />
        <main className="flex-1 w-full">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
