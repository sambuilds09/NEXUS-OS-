"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  Briefcase,
  FolderKanban,
  CheckSquare,
  Bot,
  FileText,
  Activity,
  TrendingUp,
  Clock,
  Zap,
  ArrowUpRight,
} from "lucide-react";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const statsCards = [
  { label: "Workspaces", value: 0, icon: Briefcase, color: "text-accent-violet", bg: "bg-accent-violet/10", border: "border-accent-violet/20" },
  { label: "Projects", value: 0, icon: FolderKanban, color: "text-accent-cyan", bg: "bg-accent-cyan/10", border: "border-accent-cyan/20" },
  { label: "Tasks", value: 0, icon: CheckSquare, color: "text-accent-emerald", bg: "bg-accent-emerald/10", border: "border-accent-emerald/20" },
  { label: "Agents", value: 0, icon: Bot, color: "text-accent-amber", bg: "bg-accent-amber/10", border: "border-accent-amber/20" },
  { label: "Documents", value: 0, icon: FileText, color: "text-accent-rose", bg: "bg-accent-rose/10", border: "border-accent-rose/20" },
  { label: "Executions", value: 0, icon: Activity, color: "text-blue-400", bg: "bg-blue-400/10", border: "border-blue-400/20" },
];

const executionData = [
  { name: "Mon", executions: 12, tokens: 8400 },
  { name: "Tue", executions: 18, tokens: 12200 },
  { name: "Wed", executions: 15, tokens: 9800 },
  { name: "Thu", executions: 22, tokens: 15600 },
  { name: "Fri", executions: 28, tokens: 18900 },
  { name: "Sat", executions: 8, tokens: 5200 },
  { name: "Sun", executions: 14, tokens: 9600 },
];

const taskStatusData = [
  { name: "Todo", value: 0, color: "#6a6a7a" },
  { name: "In Progress", value: 0, color: "#3b82f6" },
  { name: "Review", value: 0, color: "#f59e0b" },
  { name: "Done", value: 0, color: "#10b981" },
  { name: "Blocked", value: 0, color: "#ef4444" },
];

export default function DashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/stats")
      .then((r) => r.json())
      .then((data) => {
        setStats(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const taskData = stats?.taskStatusCounts
    ? taskStatusData.map((d) => {
        const found = stats.taskStatusCounts.find((s: any) => s.status === d.name.toLowerCase().replace(" ", "_"));
        return { ...d, value: found ? found.count : 0 };
      })
    : taskStatusData;

  const cardValues = stats
    ? [
        stats.workspaces,
        stats.projects,
        stats.tasks,
        stats.agents,
        stats.documents,
        stats.executions,
      ]
    : [0, 0, 0, 0, 0, 0];

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
          <h1 className="text-3xl font-bold text-white mb-1">Dashboard</h1>
          <p className="text-nexus-400">Overview of your AI workforce and active operations.</p>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
        {statsCards.map((card, i) => (
          <motion.div
            key={card.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05, duration: 0.4 }}
            className={`glass-panel rounded-xl p-4 border ${card.border} hover:border-opacity-40 transition-all`}
          >
            <div className="flex items-center justify-between mb-3">
              <div className={`w-9 h-9 rounded-lg ${card.bg} flex items-center justify-center`}>
                <card.icon className={`w-4.5 h-4.5 ${card.color}`} />
              </div>
              <TrendingUp className="w-3.5 h-3.5 text-nexus-500" />
            </div>
            <div className="text-2xl font-bold text-white mb-0.5">
              {loading ? "—" : cardValues[i]}
            </div>
            <div className="text-xs text-nexus-400">{card.label}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
          className="lg:col-span-2 glass-panel rounded-xl p-6 border border-nexus-700/50"
        >
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-lg font-semibold text-white">Agent Executions</h2>
              <p className="text-xs text-nexus-400">Token usage and execution count over the last 7 days</p>
            </div>
            <div className="flex items-center gap-2 text-xs text-nexus-400">
              <Zap className="w-3.5 h-3.5 text-accent-violet" />
              <span>Live</span>
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={executionData}>
                <defs>
                  <linearGradient id="colorExec" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorTokens" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#06b6d4" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#252535" />
                <XAxis dataKey="name" stroke="#4a4a5a" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="#4a4a5a" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1a25", border: "1px solid #353545", borderRadius: "8px", fontSize: "12px" }}
                  itemStyle={{ color: "#eaeaef" }}
                />
                <Area type="monotone" dataKey="executions" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorExec)" />
                <Area type="monotone" dataKey="tokens" stroke="#06b6d4" strokeWidth={2} fillOpacity={1} fill="url(#colorTokens)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.4 }}
          className="glass-panel rounded-xl p-6 border border-nexus-700/50"
        >
          <h2 className="text-lg font-semibold text-white mb-1">Task Distribution</h2>
          <p className="text-xs text-nexus-400 mb-6">Current task status breakdown</p>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {taskData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: "#1a1a25", border: "1px solid #353545", borderRadius: "8px", fontSize: "12px" }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="grid grid-cols-2 gap-2 mt-4">
            {taskData.map((d) => (
              <div key={d.name} className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full" style={{ backgroundColor: d.color }} />
                <span className="text-xs text-nexus-300">{d.name}</span>
                <span className="text-xs text-nexus-500 ml-auto">{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5, duration: 0.4 }}
          className="glass-panel rounded-xl p-6 border border-nexus-700/50"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Recent Agent Activity</h2>
          <div className="space-y-3">
            {stats?.recentExecutions?.map((exec: any, i: number) => (
              <div key={exec.id} className="flex items-center gap-3 p-3 rounded-lg bg-nexus-800/50 border border-nexus-700/30">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                  exec.status === "completed" ? "bg-accent-emerald/20 text-accent-emerald" : "bg-accent-violet/20 text-accent-violet"
                }`}>
                  {exec.status === "completed" ? "✓" : "◌"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-nexus-200 truncate">{exec.input}</div>
                  <div className="text-xs text-nexus-400 flex items-center gap-2 mt-0.5">
                    <span>{exec.tokensUsed?.toLocaleString()} tokens</span>
                    <span>•</span>
                    <span>${(exec.cost / 100).toFixed(2)}</span>
                  </div>
                </div>
                <div className="text-xs text-nexus-500 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {Math.round(exec.latency / 1000)}s
                </div>
              </div>
            )) || (
              <div className="text-sm text-nexus-500 text-center py-8">No recent activity</div>
            )}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6, duration: 0.4 }}
          className="glass-panel rounded-xl p-6 border border-nexus-700/50"
        >
          <h2 className="text-lg font-semibold text-white mb-4">Active Workspaces</h2>
          <div className="space-y-3">
            {loading ? (
              <div className="text-sm text-nexus-500 text-center py-8">Loading...</div>
            ) : (
              <WorkspaceList />
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function WorkspaceList() {
  const [workspaces, setWorkspaces] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/workspaces")
      .then((r) => r.json())
      .then(setWorkspaces);
  }, []);

  return (
    <>
      {workspaces.map((ws) => (
        <a
          key={ws.id}
          href={`/workspaces/${ws.id}`}
          className="flex items-center gap-3 p-3 rounded-lg bg-nexus-800/50 border border-nexus-700/30 hover:border-accent-violet/30 transition-all group"
        >
          <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-accent-violet/20 to-accent-cyan/20 flex items-center justify-center text-sm font-bold text-accent-violet">
            {ws.name.slice(0, 2).toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-nexus-200 truncate">{ws.name}</div>
            <div className="text-xs text-nexus-400 truncate">{ws.description || "No description"}</div>
          </div>
          <ArrowUpRight className="w-4 h-4 text-nexus-500 group-hover:text-accent-violet transition-colors" />
        </a>
      ))}
    </>
  );
}
