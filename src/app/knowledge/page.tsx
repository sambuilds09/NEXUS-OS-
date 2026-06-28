"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { BookOpen, Search, Upload, FileText, Globe, GitBranch, Video, Loader2 } from "lucide-react";

const typeIcons: Record<string, any> = {
  pdf: FileText,
  docx: FileText,
  pptx: FileText,
  txt: FileText,
  website: Globe,
  github: GitBranch,
  youtube: Video,
  markdown: FileText,
};

export default function KnowledgePage() {
  const [sources, setSources] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<any[]>([]);
  const [showUpload, setShowUpload] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: "", type: "txt", content: "", workspaceId: 1 });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetch("/api/knowledge?workspaceId=1").then(r => r.json()).then(setSources);
  }, []);

  async function handleSearch(e: React.FormEvent) {
    e.preventDefault();
    if (!query.trim()) return;
    const res = await fetch(`/api/knowledge?workspaceId=1&query=${encodeURIComponent(query)}`);
    const data = await res.json();
    setResults(data);
  }

  async function handleUpload(e: React.FormEvent) {
    e.preventDefault();
    setUploading(true);
    const res = await fetch("/api/knowledge", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(uploadForm),
    });
    if (res.ok) {
      const data = await res.json();
      setSources(prev => [data, ...prev]);
      setShowUpload(false);
      setUploadForm({ name: "", type: "txt", content: "", workspaceId: 1 });
    }
    setUploading(false);
  }

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Knowledge Base</h1>
          <p className="text-nexus-400">RAG-powered document ingestion and semantic retrieval.</p>
        </div>
        <button
          onClick={() => setShowUpload(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-accent-violet hover:bg-accent-violet/90 text-white rounded-lg font-medium text-sm transition-all"
        >
          <Upload className="w-4 h-4" />
          Ingest Document
        </button>
      </div>

      <form onSubmit={handleSearch} className="relative mb-6">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-500" />
        <input
          type="text"
          placeholder="Semantic search across knowledge base..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-nexus-800 border border-nexus-700 rounded-lg text-sm text-nexus-100 placeholder:text-nexus-500 focus:outline-none focus:border-accent-violet/50"
        />
      </form>

      {results.length > 0 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mb-6 glass-panel rounded-xl p-4 border border-accent-violet/20">
          <h3 className="text-sm font-semibold text-white mb-3">Search Results</h3>
          <div className="space-y-2">
            {results.map((r, i) => (
              <div key={i} className="p-3 rounded-lg bg-nexus-800/50 border border-nexus-700/30">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-xs text-accent-violet">{r.source}</span>
                  <span className="text-xs text-nexus-500">Similarity: {r.similarity}</span>
                </div>
                <p className="text-sm text-nexus-300 line-clamp-3">{r.content}</p>
              </div>
            ))}
          </div>
        </motion.div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {sources.map((s, i) => {
          const Icon = typeIcons[s.type] || FileText;
          return (
            <motion.div
              key={s.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel rounded-xl p-5 border border-nexus-700/50 hover:border-accent-violet/30 transition-all"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
                  <Icon className="w-5 h-5 text-accent-cyan" />
                </div>
                <span className={`text-[10px] px-2 py-0.5 rounded-full border ${
                  s.status === "ready" ? "bg-accent-emerald/10 text-accent-emerald border-accent-emerald/20" :
                  "bg-accent-amber/10 text-accent-amber border-accent-amber/20"
                }`}>{s.status}</span>
              </div>
              <h3 className="text-base font-semibold text-white mb-1">{s.name}</h3>
              <div className="text-xs text-nexus-400 mb-3">{s.chunkCount} chunks • {s.fileSize?.toLocaleString()} chars</div>
              <div className="text-xs text-nexus-500">{new Date(s.createdAt).toLocaleDateString()}</div>
            </motion.div>
          );
        })}
      </div>

      {showUpload && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
          onClick={() => setShowUpload(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-nexus-900 border border-nexus-700 rounded-xl p-6 w-full max-w-lg"
          >
            <h2 className="text-xl font-bold text-white mb-4">Ingest Knowledge</h2>
            <form onSubmit={handleUpload} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-nexus-300 mb-1">Name</label>
                <input required value={uploadForm.name} onChange={e => setUploadForm({...uploadForm, name: e.target.value})}
                  className="w-full px-3 py-2 bg-nexus-800 border border-nexus-700 rounded-lg text-sm text-nexus-100 focus:outline-none focus:border-accent-violet/50" />
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-300 mb-1">Type</label>
                <select value={uploadForm.type} onChange={e => setUploadForm({...uploadForm, type: e.target.value})}
                  className="w-full px-3 py-2 bg-nexus-800 border border-nexus-700 rounded-lg text-sm text-nexus-100 focus:outline-none focus:border-accent-violet/50">
                  <option value="txt">Text</option>
                  <option value="pdf">PDF</option>
                  <option value="docx">DOCX</option>
                  <option value="website">Website</option>
                  <option value="github">GitHub</option>
                  <option value="youtube">YouTube</option>
                  <option value="markdown">Markdown</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-nexus-300 mb-1">Content</label>
                <textarea required value={uploadForm.content} onChange={e => setUploadForm({...uploadForm, content: e.target.value})}
                  rows={6} className="w-full px-3 py-2 bg-nexus-800 border border-nexus-700 rounded-lg text-sm text-nexus-100 focus:outline-none focus:border-accent-violet/50 resize-none" />
              </div>
              <div className="flex gap-3">
                <button type="button" onClick={() => setShowUpload(false)}
                  className="flex-1 px-4 py-2 bg-nexus-800 hover:bg-nexus-700 text-nexus-200 rounded-lg text-sm font-medium">Cancel</button>
                <button type="submit" disabled={uploading}
                  className="flex-1 px-4 py-2 bg-accent-violet hover:bg-accent-violet/90 text-white rounded-lg text-sm font-medium flex items-center justify-center gap-2">
                  {uploading && <Loader2 className="w-4 h-4 animate-spin" />}
                  Ingest
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </div>
  );
}
