"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { GitBranch, Search, Shield, FileCode, Layers, AlertTriangle, CheckCircle, Loader2 } from "lucide-react";

export default function GitHubPage() {
  const [url, setUrl] = useState("");
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [repos, setRepos] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/github/repos").then(r => r.json()).then(setRepos);
  }, []);

  async function analyze(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim()) return;
    setAnalyzing(true);
    setResult(null);
    const res = await fetch("/api/github/analyze", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url, workspaceId: 1 }),
    });
    const data = await res.json();
    setResult(data);
    setAnalyzing(false);
    fetch("/api/github/repos").then(r => r.json()).then(setRepos);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">GitHub Intelligence</h1>
        <p className="text-nexus-400">Analyze repositories for architecture, security, and improvements.</p>
      </div>

      <form onSubmit={analyze} className="flex gap-3 mb-8">
        <div className="relative flex-1 max-w-xl">
          <GitBranch className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-500" />
          <input
            type="text"
            placeholder="https://github.com/owner/repo"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-nexus-800 border border-nexus-700 rounded-lg text-sm text-nexus-100 placeholder:text-nexus-500 focus:outline-none focus:border-accent-violet/50"
          />
        </div>
        <button
          type="submit"
          disabled={analyzing}
          className="px-6 py-2.5 bg-accent-violet hover:bg-accent-violet/90 text-white rounded-lg font-medium text-sm transition-all flex items-center gap-2"
        >
          {analyzing && <Loader2 className="w-4 h-4 animate-spin" />}
          {analyzing ? "Analyzing..." : "Analyze"}
        </button>
      </form>

      {result && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-8 space-y-6">
          <div className="glass-panel rounded-xl p-6 border border-nexus-700/50">
            <div className="flex items-center gap-2 mb-4">
              <Layers className="w-5 h-5 text-accent-violet" />
              <h2 className="text-lg font-semibold text-white">Architecture</h2>
            </div>
            <pre className="text-sm text-nexus-300 whitespace-pre-wrap font-mono bg-nexus-900/50 p-4 rounded-lg overflow-auto max-h-96">{result.analysis.architecture}</pre>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="glass-panel rounded-xl p-6 border border-nexus-700/50">
              <div className="flex items-center gap-2 mb-4">
                <Shield className="w-5 h-5 text-accent-rose" />
                <h2 className="text-lg font-semibold text-white">Security Audit</h2>
              </div>
              <div className="space-y-2">
                {result.analysis.securityIssues.map((issue: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded bg-nexus-800/50">
                    <AlertTriangle className={`w-4 h-4 mt-0.5 ${
                      issue.severity === "high" ? "text-accent-rose" :
                      issue.severity === "medium" ? "text-accent-amber" : "text-nexus-400"
                    }`} />
                    <div>
                      <div className="text-sm text-nexus-200">{issue.issue}</div>
                      <div className="text-xs text-nexus-500">{issue.file}{issue.line ? `:${issue.line}` : ""}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="glass-panel rounded-xl p-6 border border-nexus-700/50">
              <div className="flex items-center gap-2 mb-4">
                <CheckCircle className="w-5 h-5 text-accent-emerald" />
                <h2 className="text-lg font-semibold text-white">Recommendations</h2>
              </div>
              <div className="space-y-2">
                {result.analysis.recommendations.map((rec: any, i: number) => (
                  <div key={i} className="flex items-start gap-2 p-2 rounded bg-nexus-800/50">
                    <span className={`text-[10px] px-1.5 py-0.5 rounded mt-0.5 ${
                      rec.priority === "high" ? "bg-accent-rose/10 text-accent-rose" :
                      rec.priority === "medium" ? "bg-accent-amber/10 text-accent-amber" :
                      "bg-nexus-700 text-nexus-400"
                    }`}>{rec.priority}</span>
                    <div>
                      <div className="text-sm text-nexus-200">{rec.suggestion}</div>
                      <div className="text-xs text-nexus-500">{rec.category}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-panel rounded-xl p-6 border border-nexus-700/50">
            <div className="flex items-center gap-2 mb-4">
              <FileCode className="w-5 h-5 text-accent-cyan" />
              <h2 className="text-lg font-semibold text-white">API Endpoints</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              {result.analysis.apiEndpoints.map((ep: any, i: number) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded bg-nexus-800/50 text-sm">
                  <span className="text-xs font-mono text-accent-violet">{ep.method}</span>
                  <span className="text-nexus-300">{ep.path}</span>
                  <span className="text-xs text-nexus-500 ml-auto">{ep.file}</span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      )}

      <div className="glass-panel rounded-xl p-6 border border-nexus-700/50">
        <h2 className="text-lg font-semibold text-white mb-4">Analyzed Repositories</h2>
        <div className="space-y-2">
          {repos.map((repo) => (
            <div key={repo.id} className="flex items-center justify-between p-3 rounded-lg bg-nexus-800/50 border border-nexus-700/30">
              <div className="flex items-center gap-3">
                <GitBranch className="w-4 h-4 text-nexus-400" />
                <div>
                  <div className="text-sm text-nexus-200">{repo.owner}/{repo.repo}</div>
                  <div className="text-xs text-nexus-500">{repo.language} • {repo.fileCount} files</div>
                </div>
              </div>
              <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                repo.status === "completed" ? "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20" :
                "bg-accent-amber/10 text-accent-amber border-accent-amber/20"
              }`}>{repo.status}</span>
            </div>
          ))}
          {repos.length === 0 && (
            <div className="text-sm text-nexus-500 text-center py-8">No repositories analyzed yet</div>
          )}
        </div>
      </div>
    </div>
  );
}
