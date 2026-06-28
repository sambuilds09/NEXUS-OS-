"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Plus, Briefcase, Search, MoreHorizontal, Rocket, FlaskConical, Users, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

const typeIcons: Record<string, any> = {
  startup: Rocket,
  saas: Building2,
  client_project: Users,
  research: FlaskConical,
};

const typeColors: Record<string, string> = {
  startup: "from-accent-amber/20 to-accent-amber/5 border-accent-amber/20",
  saas: "from-accent-cyan/20 to-accent-cyan/5 border-accent-cyan/20",
  client_project: "from-accent-emerald/20 to-accent-emerald/5 border-accent-emerald/20",
  research: "from-accent-violet/20 to-accent-violet/5 border-accent-violet/20",
};

const typeLabels: Record<string, string> = {
  startup: "Startup",
  saas: "SaaS Product",
  client_project: "Client Project",
  research: "Research",
};

export default function WorkspacesPage() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ name: "", description: "", type: "startup", goal: "" });

  useEffect(() => {
    fetch("/api/workspaces").then((r) => r.json()).then(setWorkspaces);
  }, []);

  const filtered = workspaces.filter((w) =>
    w.name.toLowerCase().includes(search.toLowerCase()) ||
    w.description?.toLowerCase().includes(search.toLowerCase())
  );

  async function createWorkspace(e: React.FormEvent) {
    e.preventDefault();
    const res = await fetch("/api/workspaces", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const newWs = await res.json();
      setWorkspaces([newWs, ...workspaces]);
      setShowModal(false);
      setForm({ name: "", description: "", type: "startup", goal: "" });
    }
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Workspaces</h1>
          <p className="text-nexus-400">Manage your startups, products, and projects.</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent-violet hover:bg-accent-violet/90 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-accent-violet/20"
        >
          <Plus className="w-4 h-4" />
          New Workspace
        </button>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-500" />
        <input
          type="text"
          placeholder="Search workspaces..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md pl-10 pr-4 py-2.5 bg-nexus-800 border border-nexus-700 rounded-lg text-sm text-nexus-100 placeholder:text-nexus-500 focus:outline-none focus:border-accent-violet/50 focus:ring-1 focus:ring-accent-violet/20"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <AnimatePresence>
          {filtered.map((ws, i) => {
            const Icon = typeIcons[ws.type] || Briefcase;
            return (
              <motion.a
                key={ws.id}
                href={`/workspaces/${ws.id}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: i * 0.05, duration: 0.3 }}
                className={cn(
                  "glass-panel rounded-xl p-5 border bg-gradient-to-br hover:scale-[1.02] transition-all duration-200 group",
                  typeColors[ws.type] || "from-nexus-800 to-nexus-900 border-nexus-700/50"
                )}
              >
                <div className="flex items-start justify-between mb-4">
                  <div className="w-10 h-10 rounded-lg bg-nexus-800 border border-nexus-700/50 flex items-center justify-center">
                    <Icon className="w-5 h-5 text-nexus-300" />
                  </div>
                  <span className="text-[10px] uppercase tracking-wider font-medium text-nexus-400 bg-nexus-800 px-2 py-1 rounded-full border border-nexus-700/50">
                    {typeLabels[ws.type] || ws.type}
                  </span>
                </div>
                <h3 className="text-lg font-semibold text-white mb-1 group-hover:text-accent-violet transition-colors">{ws.name}</h3>
                <p className="text-sm text-nexus-400 line-clamp-2 mb-4">{ws.description || "No description"}</p>
                <div className="flex items-center gap-3 text-xs text-nexus-500">
                  <span className="flex items-center gap-1">
                    <div className={`w-1.5 h-1.5 rounded-full ${ws.status === "active" ? "bg-accent-emerald" : "bg-nexus-500"}`} />
                    {ws.status}
                  </span>
                  <span>•</span>
                  <span>{new Date(ws.createdAt).toLocaleDateString()}</span>
                </div>
              </motion.a>
            );
          })}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {showModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setShowModal(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-nexus-900 border border-nexus-700 rounded-xl p-6 w-full max-w-lg shadow-2xl"
            >
              <h2 className="text-xl font-bold text-white mb-4">Create Workspace</h2>
              <form onSubmit={createWorkspace} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-nexus-300 mb-1">Name</label>
                  <input
                    required
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="w-full px-3 py-2 bg-nexus-800 border border-nexus-700 rounded-lg text-sm text-nexus-100 focus:outline-none focus:border-accent-violet/50"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-300 mb-1">Type</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value })}
                    className="w-full px-3 py-2 bg-nexus-800 border border-nexus-700 rounded-lg text-sm text-nexus-100 focus:outline-none focus:border-accent-violet/50"
                  >
                    <option value="startup">Startup</option>
                    <option value="saas">SaaS Product</option>
                    <option value="client_project">Client Project</option>
                    <option value="research">Research</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-300 mb-1">Description</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    className="w-full px-3 py-2 bg-nexus-800 border border-nexus-700 rounded-lg text-sm text-nexus-100 focus:outline-none focus:border-accent-violet/50 resize-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-nexus-300 mb-1">Goal</label>
                  <textarea
                    value={form.goal}
                    onChange={(e) => setForm({ ...form, goal: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 bg-nexus-800 border border-nexus-700 rounded-lg text-sm text-nexus-100 focus:outline-none focus:border-accent-violet/50 resize-none"
                  />
                </div>
                <div className="flex gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowModal(false)}
                    className="flex-1 px-4 py-2 bg-nexus-800 hover:bg-nexus-700 text-nexus-200 rounded-lg text-sm font-medium transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-accent-violet hover:bg-accent-violet/90 text-white rounded-lg text-sm font-medium transition-colors"
                  >
                    Create
                  </button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
