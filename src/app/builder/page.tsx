"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Rocket, Loader2, CheckCircle, AlertCircle, Sparkles, ArrowRight } from "lucide-react";

const STEPS = [
  { id: "founder_analysis", agent: "Founder Agent", label: "Market Analysis", color: "bg-accent-amber" },
  { id: "research_competitors", agent: "Research Agent", label: "Competitor Research", color: "bg-accent-cyan" },
  { id: "product_prd", agent: "Product Manager", label: "PRD Creation", color: "bg-accent-emerald" },
  { id: "cto_techstack", agent: "CTO Agent", label: "Tech Stack", color: "bg-accent-rose" },
  { id: "architect_design", agent: "Software Architect", label: "System Design", color: "bg-accent-violet" },
  { id: "cloud_infrastructure", agent: "Cloud Architect", label: "Cloud Design", color: "bg-blue-500" },
  { id: "devops_pipeline", agent: "DevOps Agent", label: "CI/CD Pipeline", color: "bg-accent-emerald" },
  { id: "security_audit", agent: "Security Agent", label: "Security Audit", color: "bg-accent-rose" },
  { id: "documentation", agent: "Technical Writer", label: "Documentation", color: "bg-nexus-400" },
  { id: "qa_plan", agent: "QA Agent", label: "Testing Plan", color: "bg-accent-amber" },
];

export default function BuilderPage() {
  const [goal, setGoal] = useState("");
  const [workspaceId, setWorkspaceId] = useState(1);
  const [loading, setLoading] = useState(false);
  const [executionId, setExecutionId] = useState<number | null>(null);
  const [progress, setProgress] = useState(0);
  const [currentStep, setCurrentStep] = useState(0);
  const [status, setStatus] = useState<"idle" | "running" | "completed" | "failed">("idle");
  const [results, setResults] = useState<Record<string, string>>({});

  async function startBuild(e: React.FormEvent) {
    e.preventDefault();
    if (!goal.trim()) return;

    setLoading(true);
    setStatus("running");
    setProgress(0);
    setCurrentStep(0);
    setResults({});

    const res = await fetch("/api/workflows/execute", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ goal, workspaceId, workflowType: "startup_builder" }),
    });

    const data = await res.json();
    if (data.executionId) {
      setExecutionId(data.executionId);
      pollExecution(data.executionId);
    } else {
      setStatus("failed");
      setLoading(false);
    }
  }

  async function pollExecution(id: number) {
    const interval = setInterval(async () => {
      const res = await fetch(`/api/workflow-executions/${id}`);
      const data = await res.json();

      setProgress(data.progress || 0);
      setCurrentStep(data.currentStep || 0);
      setStatus(data.status);

      if (data.steps) {
        const stepResults: Record<string, string> = {};
        data.steps.forEach((s: any) => {
          if (s.output) stepResults[s.name] = s.output;
        });
        setResults(stepResults);
      }

      if (data.status === "completed" || data.status === "failed") {
        clearInterval(interval);
        setLoading(false);
      }
    }, 2000);
  }

  return (
    <div className="p-8 max-w-5xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Startup Builder</h1>
        <p className="text-nexus-400">Transform an idea into a complete project dossier using 10 specialized agents.</p>
      </div>

      <form onSubmit={startBuild} className="mb-8">
        <div className="glass-panel rounded-xl p-6 border border-nexus-700/50">
          <label className="block text-sm font-medium text-nexus-300 mb-2">What do you want to build?</label>
          <div className="flex gap-3">
            <input
              type="text"
              placeholder="e.g., Build an AI-powered inventory management SaaS for SMBs"
              value={goal}
              onChange={(e) => setGoal(e.target.value)}
              disabled={loading}
              className="flex-1 px-4 py-3 bg-nexus-800 border border-nexus-700 rounded-lg text-sm text-nexus-100 placeholder:text-nexus-500 focus:outline-none focus:border-accent-violet/50 disabled:opacity-50"
            />
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-3 bg-gradient-to-r from-accent-violet to-accent-cyan hover:opacity-90 text-white rounded-lg font-medium text-sm transition-all flex items-center gap-2 disabled:opacity-50"
            >
              {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Sparkles className="w-4 h-4" />}
              {loading ? "Building..." : "Start Build"}
            </button>
          </div>
        </div>
      </form>

      {status !== "idle" && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
          <div className="glass-panel rounded-xl p-6 border border-nexus-700/50">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                {status === "running" ? <Loader2 className="w-5 h-5 text-accent-violet animate-spin" /> :
                 status === "completed" ? <CheckCircle className="w-5 h-5 text-accent-emerald" /> :
                 <AlertCircle className="w-5 h-5 text-accent-rose" />}
                <span className="text-sm font-medium text-white">
                  {status === "running" ? `Step ${currentStep} of ${STEPS.length}` :
                   status === "completed" ? "Build Complete" : "Build Failed"}
                </span>
              </div>
              <span className="text-sm text-nexus-400">{progress}%</span>
            </div>
            <div className="h-2 bg-nexus-700 rounded-full overflow-hidden mb-6">
              <motion.div
                className="h-full bg-gradient-to-r from-accent-violet to-accent-cyan rounded-full"
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.5 }}
              />
            </div>

            <div className="space-y-2">
              {STEPS.map((step, i) => {
                const isActive = i + 1 === currentStep && status === "running";
                const isDone = i + 1 < currentStep || (status === "completed" && i + 1 <= currentStep);
                const hasOutput = results[step.id];

                return (
                  <motion.div
                    key={step.id}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.03 }}
                    className={`flex items-center gap-3 p-3 rounded-lg border transition-all ${
                      isActive ? "border-accent-violet/30 bg-accent-violet/5" :
                      isDone ? "border-accent-emerald/20 bg-accent-emerald/5" :
                      "border-nexus-700/30 bg-nexus-800/30"
                    }`}
                  >
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                      isActive ? "bg-accent-violet text-white" :
                      isDone ? "bg-accent-emerald text-white" :
                      "bg-nexus-700 text-nexus-400"
                    }`}>
                      {isDone ? "✓" : i + 1}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-medium text-nexus-200">{step.label}</div>
                      <div className="text-xs text-nexus-500">{step.agent}</div>
                    </div>
                    {hasOutput && (
                      <button
                        onClick={() => {
                          const el = document.getElementById(`output-${step.id}`);
                          el?.scrollIntoView({ behavior: "smooth" });
                        }}
                        className="text-xs text-accent-violet hover:underline flex items-center gap-1"
                      >
                        View <ArrowRight className="w-3 h-3" />
                      </button>
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </motion.div>
      )}

      <AnimatePresence>
        {Object.entries(results).length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            <h2 className="text-xl font-bold text-white">Generated Artifacts</h2>
            {Object.entries(results).map(([key, output]) => {
              const step = STEPS.find(s => s.id === key);
              return (
                <motion.div
                  key={key}
                  id={`output-${key}`}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="glass-panel rounded-xl p-6 border border-nexus-700/50"
                >
                  <div className="flex items-center gap-2 mb-4">
                    <div className={`w-3 h-3 rounded-full ${step?.color || "bg-nexus-500"}`} />
                    <h3 className="text-lg font-semibold text-white">{step?.label || key}</h3>
                    <span className="text-xs text-nexus-500 ml-2">{step?.agent}</span>
                  </div>
                  <pre className="text-sm text-nexus-300 whitespace-pre-wrap font-mono bg-nexus-900/50 p-4 rounded-lg overflow-auto max-h-96">{output as string}</pre>
                </motion.div>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
