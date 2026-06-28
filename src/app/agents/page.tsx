"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Bot, Search, Activity, CheckCircle, AlertCircle, PauseCircle, Zap } from "lucide-react";

const statusConfig: Record<string, { icon: any; color: string; bg: string; label: string }> = {
  idle: { icon: PauseCircle, color: "text-nexus-400", bg: "bg-nexus-700/30", label: "Idle" },
  working: { icon: Activity, color: "text-accent-emerald", bg: "bg-accent-emerald/10", label: "Working" },
  paused: { icon: PauseCircle, color: "text-accent-amber", bg: "bg-accent-amber/10", label: "Paused" },
  error: { icon: AlertCircle, color: "text-accent-rose", bg: "bg-accent-rose/10", label: "Error" },
};

export default function AgentsPage() {
  const [agents, setAgents] = useState<any[]>([]);
  const [search, setSearch] = useState("");

  useEffect(() => {
    fetch("/api/agents").then((r) => r.json()).then(setAgents);
  }, []);

  const filtered = agents.filter((a) =>
    a.name.toLowerCase().includes(search.toLowerCase()) ||
    a.role.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Agent Fleet</h1>
          <p className="text-nexus-400">Your autonomous digital workforce.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-nexus-400">
          <Zap className="w-4 h-4 text-accent-violet" />
          <span>{agents.filter((a) => a.status === "working").length} active</span>
        </div>
      </div>

      <div className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-500" />
        <input
          type="text"
          placeholder="Search agents..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full max-w-md pl-10 pr-4 py-2.5 bg-nexus-800 border border-nexus-700 rounded-lg text-sm text-nexus-100 placeholder:text-nexus-500 focus:outline-none focus:border-accent-violet/50"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filtered.map((agent, i) => {
          const status = statusConfig[agent.status] || statusConfig.idle;
          const StatusIcon = status.icon;
          return (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel rounded-xl p-5 border border-nexus-700/50 hover:border-accent-violet/30 transition-all group"
            >
              <div className="flex items-start justify-between mb-4">
                <div
                  className="w-12 h-12 rounded-xl flex items-center justify-center text-sm font-bold text-white shadow-lg"
                  style={{ backgroundColor: agent.color || "#6a6a7a" }}
                >
                  {agent.avatar}
                </div>
                <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-medium ${status.bg} ${status.color} border border-current border-opacity-20`}>
                  <StatusIcon className="w-3 h-3" />
                  {status.label}
                </div>
              </div>

              <h3 className="text-base font-semibold text-white mb-0.5">{agent.name}</h3>
              <p className="text-xs text-nexus-400 mb-3 uppercase tracking-wider">{agent.role.replace("_", " ")}</p>
              <p className="text-sm text-nexus-400 line-clamp-2 mb-4">{agent.description}</p>

              <div className="flex flex-wrap gap-1.5 mb-4">
                {(agent.capabilities || []).slice(0, 3).map((cap: string) => (
                  <span key={cap} className="text-[10px] px-2 py-0.5 rounded-full bg-nexus-800 text-nexus-300 border border-nexus-700/50">
                    {cap}
                  </span>
                ))}
              </div>

              <div className="grid grid-cols-2 gap-3 pt-3 border-t border-nexus-700/30">
                <div>
                  <div className="text-lg font-bold text-white">{agent.totalTasksCompleted}</div>
                  <div className="text-[10px] text-nexus-500">Tasks Done</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-white">{agent.successRate}%</div>
                  <div className="text-[10px] text-nexus-500">Success Rate</div>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
