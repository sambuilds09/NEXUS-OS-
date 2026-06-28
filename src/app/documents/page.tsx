"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FileText, Search, FileCode, Database, Map, Presentation, BookOpen, Globe, Shield, PenTool, Layers } from "lucide-react";

const typeIcons: Record<string, any> = {
  prd: FileCode,
  architecture: Layers,
  database_schema: Database,
  api_spec: FileCode,
  roadmap: Map,
  pitch: Presentation,
  tech_doc: BookOpen,
  marketing_plan: Globe,
  deployment_guide: Globe,
  other: FileText,
};

const typeColors: Record<string, string> = {
  prd: "text-accent-violet bg-accent-violet/10 border-accent-violet/20",
  architecture: "text-accent-cyan bg-accent-cyan/10 border-accent-cyan/20",
  database_schema: "text-accent-emerald bg-accent-emerald/10 border-accent-emerald/20",
  api_spec: "text-blue-400 bg-blue-400/10 border-blue-400/20",
  roadmap: "text-accent-amber bg-accent-amber/10 border-accent-amber/20",
  pitch: "text-accent-rose bg-accent-rose/10 border-accent-rose/20",
  tech_doc: "text-nexus-300 bg-nexus-700/30 border-nexus-600/30",
  marketing_plan: "text-purple-400 bg-purple-400/10 border-purple-400/20",
  deployment_guide: "text-teal-400 bg-teal-400/10 border-teal-400/20",
  other: "text-nexus-400 bg-nexus-800 border-nexus-700/50",
};

const typeLabels: Record<string, string> = {
  prd: "PRD",
  architecture: "Architecture",
  database_schema: "Database Schema",
  api_spec: "API Spec",
  roadmap: "Roadmap",
  pitch: "Pitch Deck",
  tech_doc: "Technical Doc",
  marketing_plan: "Marketing Plan",
  deployment_guide: "Deployment Guide",
  other: "Other",
};

export default function DocumentsPage() {
  const [documents, setDocuments] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState("");

  useEffect(() => {
    fetch("/api/documents").then((r) => r.json()).then(setDocuments);
  }, []);

  const filtered = documents.filter((d) => {
    const matchesSearch = d.title.toLowerCase().includes(search.toLowerCase());
    const matchesType = !filterType || d.type === filterType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="p-8 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-white mb-1">Documents</h1>
          <p className="text-nexus-400">Generated artifacts from your AI workforce.</p>
        </div>
      </div>

      <div className="flex items-center gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-nexus-500" />
          <input
            type="text"
            placeholder="Search documents..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-nexus-800 border border-nexus-700 rounded-lg text-sm text-nexus-100 placeholder:text-nexus-500 focus:outline-none focus:border-accent-violet/50"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2.5 bg-nexus-800 border border-nexus-700 rounded-lg text-sm text-nexus-100 focus:outline-none focus:border-accent-violet/50"
        >
          <option value="">All Types</option>
          {Object.entries(typeLabels).map(([key, label]) => (
            <option key={key} value={key}>{label}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((doc, i) => {
          const Icon = typeIcons[doc.type] || FileText;
          const style = typeColors[doc.type] || typeColors.other;
          return (
            <motion.div
              key={doc.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass-panel rounded-xl p-5 border border-nexus-700/50 hover:border-accent-violet/30 transition-all group cursor-pointer"
            >
              <div className="flex items-start justify-between mb-4">
                <div className={`w-10 h-10 rounded-lg flex items-center justify-center border ${style}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-[10px] text-nexus-500">v{doc.version}</span>
              </div>
              <h3 className="text-base font-semibold text-white mb-1 group-hover:text-accent-violet transition-colors">{doc.title}</h3>
              <p className="text-xs text-nexus-400 mb-4">{typeLabels[doc.type] || doc.type}</p>
              <div className="flex items-center justify-between text-xs text-nexus-500">
                <span>{doc.author || "Unknown"}</span>
                <span>{new Date(doc.updatedAt).toLocaleDateString()}</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
