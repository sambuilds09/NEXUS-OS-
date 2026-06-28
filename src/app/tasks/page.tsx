"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { CheckSquare, Search, Filter, Clock, AlertCircle, ArrowRight, ArrowLeft } from "lucide-react";

const columns = [
  { id: "todo", label: "To Do", color: "border-nexus-600", headerBg: "bg-nexus-800/50", dot: "bg-nexus-500" },
  { id: "in_progress", label: "In Progress", color: "border-blue-500/30", headerBg: "bg-blue-500/5", dot: "bg-blue-500" },
  { id: "review", label: "Review", color: "border-amber-500/30", headerBg: "bg-amber-500/5", dot: "bg-amber-500" },
  { id: "done", label: "Done", color: "border-emerald-500/30", headerBg: "bg-emerald-500/5", dot: "bg-emerald-500" },
];

const priorityColors: Record<string, string> = {
  low: "text-nexus-400 bg-nexus-800",
  medium: "text-blue-400 bg-blue-500/10",
  high: "text-amber-400 bg-amber-500/10",
  critical: "text-rose-400 bg-rose-500/10",
};

export default function TasksPage() {
  const [tasks, setTasks] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterPriority, setFilterPriority] = useState<string>("");

  useEffect(() => {
    fetch("/api/tasks").then((r) => r.json()).then(setTasks);
  }, []);

  const filtered = tasks.filter((t) => {
    const matchesSearch = t.title.toLowerCase().includes(search.toLowerCase());
    const matchesPriority = !filterPriority || t.priority === filterPriority;
    return matchesSearch && matchesPriority;
  });

  async function moveTask(taskId: number, newStatus: string) {
    await fetch(`/api/tasks/${taskId}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus }),
    });
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status: newStatus } : t)));
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Tasks</h1>
          <p className="text-nexus-400">Kanban board for agent task management.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-nexus-800 border border-nexus-700 rounded-lg text-sm text-nexus-100 placeholder:text-nexus-500 focus:outline-none focus:border-accent-violet/50"
          />
        </div>
        <select
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value)}
          className="px-3 py-2.5 bg-nexus-800 border border-nexus-700 rounded-lg text-sm text-nexus-100 focus:outline-none focus:border-accent-violet/50"
        >
          <option value="">All Priorities</option>
          <option value="low">Low</option>
          <option value="medium">Medium</option>
          <option value="high">High</option>
          <option value="critical">Critical</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {columns.map((col) => {
          const colTasks = filtered.filter((t) => t.status === col.id);
          return (
            <div key={col.id} className={`rounded-xl border ${col.color} bg-nexus-900/50`}>
              <div className={`flex items-center justify-between px-4 py-3 ${col.headerBg} rounded-t-xl border-b ${col.color}`}>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${col.dot}`} />
                  <span className="text-sm font-medium text-nexus-200">{col.label}</span>
                </div>
                <span className="text-xs text-nexus-500 bg-nexus-800 px-2 py-0.5 rounded-full">{colTasks.length}</span>
              </div>
              <div className="p-3 space-y-3 min-h-[200px]">
                {colTasks.map((task) => (
                  <motion.div
                    key={task.id}
                    layout
                    className="glass-panel rounded-lg p-3 border border-nexus-700/50 hover:border-accent-violet/30 transition-all group"
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="text-sm font-medium text-nexus-100">{task.title}</h4>
                    </div>
                    <p className="text-xs text-nexus-400 line-clamp-2 mb-3">{task.description}</p>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`text-[10px] px-1.5 py-0.5 rounded ${priorityColors[task.priority] || priorityColors.low}`}>
                          {task.priority}
                        </span>
                        {task.assignedAgent && (
                          <span className="text-[10px] text-nexus-500">{task.assignedAgent}</span>
                        )}
                      </div>
                      <div className="flex gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
                        {col.id !== "todo" && (
                          <button
                            onClick={() => moveTask(task.id, columns[columns.findIndex((c) => c.id === col.id) - 1].id)}
                            className="p-1 rounded hover:bg-nexus-700 text-nexus-400"
                          >
                            <ArrowLeft className="w-3 h-3" />
                          </button>
                        )}
                        {col.id !== "done" && (
                          <button
                            onClick={() => moveTask(task.id, columns[columns.findIndex((c) => c.id === col.id) + 1].id)}
                            className="p-1 rounded hover:bg-nexus-700 text-nexus-400"
                          >
                            <ArrowRight className="w-3 h-3" />
                          </button>
                        )}
                      </div>
                    </div>
                    {(task.estimatedHours || task.actualHours) && (
                      <div className="flex items-center gap-3 mt-2 text-[10px] text-nexus-500">
                        {task.estimatedHours && (
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            Est: {task.estimatedHours}h
                          </span>
                        )}
                        {task.actualHours && (
                          <span className="flex items-center gap-1">
                            <AlertCircle className="w-3 h-3" />
                            Actual: {task.actualHours}h
                          </span>
                        )}
                      </div>
                    )}
                  </motion.div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
