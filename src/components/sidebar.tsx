"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "framer-motion";
import {
  LayoutDashboard,
  Briefcase,
  FolderKanban,
  Bot,
  CheckSquare,
  FileText,
  Settings,
  Zap,
  ChevronRight,
  Terminal,
  BookOpen,
  GitBranch,
  Rocket,
  Shield,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/builder", label: "Startup Builder", icon: Rocket },
  { href: "/console", label: "Live Console", icon: Terminal },
  { href: "/workspaces", label: "Workspaces", icon: Briefcase },
  { href: "/projects", label: "Projects", icon: FolderKanban },
  { href: "/agents", label: "Agents", icon: Bot },
  { href: "/tasks", label: "Tasks", icon: CheckSquare },
  { href: "/documents", label: "Documents", icon: FileText },
  { href: "/knowledge", label: "Knowledge Base", icon: BookOpen },
  { href: "/github", label: "GitHub Intelligence", icon: GitBranch },
  { href: "/settings", label: "Settings", icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 h-screen w-64 bg-nexus-900 border-r border-nexus-700/50 z-50 flex flex-col">
      <div className="p-6 border-b border-nexus-700/50">
        <Link href="/" className="flex items-center gap-3 group">
          <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-accent-violet to-accent-cyan flex items-center justify-center shadow-lg shadow-accent-violet/20">
            <Zap className="w-5 h-5 text-white" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight text-white">NEXUS OS</h1>
            <p className="text-[10px] text-nexus-400 uppercase tracking-widest">AI Operating System</p>
          </div>
        </Link>
      </div>

      <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-all duration-200 group relative",
                isActive
                  ? "text-white bg-accent-violet/10 border border-accent-violet/20"
                  : "text-nexus-300 hover:text-white hover:bg-nexus-800"
              )}
            >
              {isActive && (
                <motion.div
                  layoutId="activeNav"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-0.5 h-5 bg-accent-violet rounded-r-full"
                  transition={{ type: "spring", stiffness: 300, damping: 30 }}
                />
              )}
              <Icon className={cn("w-4 h-4 shrink-0", isActive ? "text-accent-violet" : "text-nexus-400 group-hover:text-nexus-200")} />
              <span className="truncate">{item.label}</span>
              {isActive && <ChevronRight className="w-3.5 h-3.5 ml-auto text-accent-violet shrink-0" />}
            </Link>
          );
        })}
      </nav>

      <div className="p-4 border-t border-nexus-700/50 space-y-2">
        <div className="glass-panel rounded-lg p-3">
          <div className="flex items-center gap-2 mb-2">
            <div className="w-2 h-2 rounded-full bg-accent-emerald animate-pulse" />
            <span className="text-xs font-medium text-nexus-200">System Online</span>
          </div>
          <div className="text-[10px] text-nexus-400">14 agents • SSE active • v2.0</div>
        </div>
        <Link href="/settings" className="flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-nexus-400 hover:text-white hover:bg-nexus-800 transition-all">
          <Shield className="w-3.5 h-3.5" />
          Security & Compliance
        </Link>
      </div>
    </aside>
  );
}
