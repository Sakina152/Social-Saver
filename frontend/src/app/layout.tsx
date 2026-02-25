import { Suspense } from "react";
import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

import Sidebar from "@/components/layout/Sidebar";
import Header from "@/components/layout/Header";
import Providers from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Social Saver | Your Digital Brain",
  description: "A premium, AI-powered dashboard for all your saved content.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-slate-50`}
      >
        <Providers>
          <div className="flex min-h-screen">
            <Sidebar />

            <div className="flex-1 transition-all duration-300 ease-in-out pl-20 lg:pl-[260px]">
              <Suspense fallback={<div className="h-16 border-b border-border bg-background animate-pulse" />}>
                <Header />
              </Suspense>
              <main className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
                {children}
              </main>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}