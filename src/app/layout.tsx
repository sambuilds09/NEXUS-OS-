import type { Metadata } from "next";
import type { ReactNode } from "react";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";

export const metadata: Metadata = {
  title: "NEXUS OS — AI Operating System",
  description: "Autonomous digital workforce for startups, agencies, and engineering teams.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="antialiased min-h-screen bg-nexus-950 text-nexus-100">
        <div className="flex min-h-screen">
          <Sidebar />
          <main className="flex-1 ml-64 overflow-auto">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
