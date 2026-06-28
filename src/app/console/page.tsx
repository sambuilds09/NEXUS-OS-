"use client";

import { useEffect, useState, useRef } from "react";
import { motion } from "framer-motion";
import { Terminal, Activity, Cpu, Clock, Zap, AlertCircle, CheckCircle, Loader2 } from "lucide-react";

export default function ConsolePage() {
  const [connected, setConnected] = useState(false);
  const [activeWorkflows, setActiveWorkflows] = useState(0);
  const [recentExecutions, setRecentExecutions] = useState<any[]>([]);
  const [recentWorkflows, setRecentWorkflows] = useState<any[]>([]);
  const [logs, setLogs] = useState<Array<{timestamp: string; level: string; message: string}>>([]);
  const logsEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const eventSource = new EventSource("/api/console/stream");

    eventSource.onopen = () => {
      setConnected(true);
      addLog("info", "Console stream connected");
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "update") {
        setActiveWorkflows(data.activeWorkflows);
        setRecentExecutions(data.recentExecutions || []);
        setRecentWorkflows(data.recentWorkflows || []);
      } else if (data.type === "connected") {
        addLog("info", data.message);
      } else if (data.type === "error") {
        addLog("error", data.message);
      }
    };

    eventSource.onerror = () => {
      setConnected(false);
      addLog("error", "Console stream disconnected");
    };

    return () => eventSource.close();
  }, []);

  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [logs]);

  function addLog(level: string, message: string) {
    setLogs(prev => [...prev.slice(-200), { timestamp: new Date().toISOString(), level, message }]);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Live Agent Console</h1>
          <p className="text-nexus-400">Real-time execution monitoring and agent telemetry.</p>
        </div>
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${connected ? "bg-accent-emerald animate-pulse" : "bg-accent-rose"}`} />
          <span className="text-sm text-nexus-400">{connected ? "Live" : "Disconnected"}</span>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[
          { label: "Active Workflows", value: activeWorkflows, icon: Activity, color: "text-accent-violet" },
          { label: "Total Executions", value: recentExecutions.length, icon: Cpu, color: "text-accent-cyan" },
          { label: "Avg Latency", value: "2.3s", icon: Clock, color: "text-accent-amber" },
          { label: "System Health", value: "99.9%", icon: Zap, color: "text-accent-emerald" },
        ].map((stat, i) => (
          <motion.div
            key={stat.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass-panel rounded-xl p-4 border border-nexus-700/50"
          >
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`w-4 h-4 ${stat.color}`} />
              <span className="text-xs text-nexus-400">{stat.label}</span>
            </div>
            <div className="text-2xl font-bold text-white">{stat.value}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-panel rounded-xl border border-nexus-700/50 overflow-hidden"
        >
          <div className="flex items-center gap-2 p-4 border-b border-nexus-700/50">
            <Terminal className="w-4 h-4 text-accent-violet" />
            <h2 className="text-sm font-semibold text-white">Execution Logs</h2>
          </div>
          <div className="h-96 overflow-y-auto p-4 font-mono text-xs space-y-1">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-2">
                <span className="text-nexus-500 shrink-0">{new Date(log.timestamp).toLocaleTimeString()}</span>
                <span className={`shrink-0 ${
                  log.level === "error" ? "text-accent-rose" :
                  log.level === "warn" ? "text-accent-amber" :
                  "text-accent-emerald"
                }`}>[{log.level.toUpperCase()}]</span>
                <span className="text-nexus-300">{log.message}</span>
              </div>
            ))}
            <div ref={logsEndRef} />
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel rounded-xl border border-nexus-700/50 overflow-hidden"
        >
          <div className="flex items-center justify-between p-4 border-b border-nexus-700/50">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-accent-cyan" />
              <h2 className="text-sm font-semibold text-white">Recent Workflows</h2>
            </div>
          </div>
          <div className="p-4 space-y-3">
            {recentWorkflows.map((wf) => (
              <div key={wf.id} className="flex items-center gap-3 p-3 rounded-lg bg-nexus-800/50 border border-nexus-700/30">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  wf.status === "running" ? "bg-accent-violet/20 text-accent-violet" :
                  wf.status === "completed" ? "bg-accent-emerald/20 text-accent-emerald" :
                  "bg-accent-rose/20 text-accent-rose"
                }`}>
                  {wf.status === "running" ? <Loader2 className="w-4 h-4 animate-spin" /> :
                   wf.status === "completed" ? <CheckCircle className="w-4 h-4" /> :
                   <AlertCircle className="w-4 h-4" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm text-nexus-200 truncate">{wf.goal?.slice(0, 60) || "Workflow"}</div>
                  <div className="text-xs text-nexus-500">{wf.status} • {wf.progress}%</div>
                </div>
                <div className="text-xs text-nexus-500">{wf.tokensUsed?.toLocaleString()} tokens</div>
              </div>
            ))}
            {recentWorkflows.length === 0 && (
              <div className="text-sm text-nexus-500 text-center py-8">No recent workflows</div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
