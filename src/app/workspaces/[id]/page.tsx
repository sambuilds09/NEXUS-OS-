"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { motion } from "framer-motion";
import { ArrowLeft, FolderKanban, FileText, MessageSquare, Activity, Target, Calendar } from "lucide-react";
import Link from "next/link";

export default function WorkspaceDetailPage() {
  const { id } = useParams();
  const [workspace, setWorkspace] = useState<any>(null);
  const [projects, setProjects] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  useEffect(() => {
    fetch(`/api/workspaces/${id}`).then((r) => r.json()).then(setWorkspace);
    fetch(`/api/projects?workspaceId=${id}`).then((r) => r.json()).then(setProjects);
    fetch(`/api/documents?workspaceId=${id}`).then((r) => r.json()).then(setDocuments);
  }, [id]);

  if (!workspace) {
    return (
      <div className="p-8 max-w-7xl mx-auto">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-nexus-800 rounded w-1/3" />
          <div className="h-4 bg-nexus-800 rounded w-1/2" />
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <Link href="/workspaces" className="inline-flex items-center gap-2 text-sm text-nexus-400 hover:text-white mb-6 transition-colors">
        <ArrowLeft className="w-4 h-4" />
        Back to Workspaces
      </Link>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <h1 className="text-3xl font-bold text-white">{workspace.name}</h1>
          <span className="text-[10px] uppercase tracking-wider font-medium text-nexus-400 bg-nexus-800 px-2 py-1 rounded-full border border-nexus-700/50">
            {workspace.type}
          </span>
        </div>
        <p className="text-nexus-400 max-w-2xl">{workspace.description}</p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel rounded-xl p-6 border border-nexus-700/50"
          >
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-4 h-4 text-accent-violet" />
              <h2 className="text-lg font-semibold text-white">Goal</h2>
            </div>
            <p className="text-sm text-nexus-300 leading-relaxed">{workspace.goal || "No goal defined yet."}</p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel rounded-xl p-6 border border-nexus-700/50"
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FolderKanban className="w-4 h-4 text-accent-cyan" />
                <h2 className="text-lg font-semibold text-white">Projects</h2>
              </div>
              <span className="text-xs text-nexus-500">{projects.length} projects</span>
            </div>
            <div className="space-y-3">
              {projects.map((p) => (
                <div key={p.id} className="flex items-center gap-4 p-3 rounded-lg bg-nexus-800/50 border border-nexus-700/30">
                  <div className="flex-1">
                    <div className="text-sm font-medium text-nexus-200">{p.name}</div>
                    <div className="text-xs text-nexus-400">{p.description}</div>
                  </div>
                  <div className="w-24">
                    <div className="flex items-center justify-between text-xs text-nexus-400 mb-1">
                      <span>{p.progress}%</span>
                    </div>
                    <div className="h-1.5 bg-nexus-700 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-accent-violet to-accent-cyan rounded-full transition-all"
                        style={{ width: `${p.progress}%` }}
                      />
                    </div>
                  </div>
                  <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                    p.status === "in_progress" ? "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20" :
                    p.status === "planning" ? "bg-accent-amber/10 text-accent-amber border-accent-amber/20" :
                    "bg-nexus-700 text-nexus-300 border-nexus-600"
                  }`}>
                    {p.status}
                  </span>
                </div>
              ))}
              {projects.length === 0 && (
                <div className="text-sm text-nexus-500 text-center py-8">No projects yet</div>
              )}
            </div>
          </motion.div>
        </div>

        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel rounded-xl p-6 border border-nexus-700/50"
          >
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-4 h-4 text-accent-emerald" />
              <h2 className="text-lg font-semibold text-white">Documents</h2>
            </div>
            <div className="space-y-2">
              {documents.map((d) => (
                <div key={d.id} className="flex items-center gap-3 p-2.5 rounded-lg bg-nexus-800/50 border border-nexus-700/30 hover:border-accent-violet/20 transition-all cursor-pointer">
                  <FileText className="w-4 h-4 text-nexus-400" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm text-nexus-200 truncate">{d.title}</div>
                    <div className="text-[10px] text-nexus-500 uppercase">{d.type}</div>
                  </div>
                </div>
              ))}
              {documents.length === 0 && (
                <div className="text-sm text-nexus-500 text-center py-4">No documents</div>
              )}
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel rounded-xl p-6 border border-nexus-700/50"
          >
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-4 h-4 text-accent-rose" />
              <h2 className="text-lg font-semibold text-white">Activity</h2>
            </div>
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-accent-violet mt-1.5" />
                <div>
                  <div className="text-sm text-nexus-200">Workspace created</div>
                  <div className="text-xs text-nexus-500 flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {new Date(workspace.createdAt).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <div className="w-2 h-2 rounded-full bg-accent-cyan mt-1.5" />
                <div>
                  <div className="text-sm text-nexus-200">Goal defined</div>
                  <div className="text-xs text-nexus-500">By Manager Agent</div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
