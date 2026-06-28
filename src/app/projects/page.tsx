"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FolderKanban, Search, Plus, TrendingUp, Clock } from "lucide-react";

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([]);
  const [workspaces, setWorkspaces] = useState<Record<number, string>>({});
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/projects").then((r) => r.json()).then(setProjects);
    fetch("/api/workspaces").then((r) => r.json()).then((wss) => {
      const map: Record<number, string> = {};
      wss.forEach((w: any) => (map[w.id] = w.name));
      setWorkspaces(map);
    });
  }, []);

  const filtered = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Projects</h1>
          <p className="text-nexus-400">Track progress across all workspaces.</p>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-500" />
        <input
          type="text"
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md pl-10 pr-4 py-2.5 bg-nexus-800 border border-nexus-700 rounded-lg text-sm text-nexus-100 placeholder:text-nexus-500 focus:outline-none focus:border-accent-violet/50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p, i) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel rounded-xl p-5 border border-nexus-700/50 hover:border-accent-violet/30 transition-all"
          >
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
                <FolderKanban className="w-5 h-5 text-accent-cyan" />
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                p.status === "in_progress" ? "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20" :
                p.status === "planning" ? "bg-accent-amber/10 text-accent-amber border-accent-amber/20" :
                "bg-nexus-700 text-nexus-300 border-nexus-600"
              }`}>
                {p.status}
              </span>
            </div>
            <h3 className="text-lg font-semibold text-white mb-1">{p.name}</h3>
            <p className="text-sm text-nexus-400 mb-4 line-clamp-2">{p.description}</p>
            <div className="mb-3">
              <div className="flex items-center justify-between text-xs text-nexus-400 mb-1">
                <span>Progress</span>
                <span>{p.progress}%</span>
              </div>
              <div className="h-2 bg-nexus-700 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-accent-violet to-accent-cyan rounded-full transition-all"
                  style={{ width: `${p.progress}%` }}
                />
              </div>
            </div>
            <div className="flex items-center justify-between text-xs text-nexus-500">
              <span>{workspaces[p.workspaceId] || "Unknown workspace"}</span>
              <span className="flex items-center gap-1">
                <Clock className="w-3 h-3" />
                {new Date(p.createdAt).toLocaleDateString()}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
