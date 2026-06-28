"use client";

import { motion } from "framer-motion";
import { Settings, Shield, Key, Bell, Database, Globe, Server } from "lucide-react";

export default function SettingsPage() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-1">Settings</h1>
        <p className="text-nexus-400">Configure your NEXUS OS instance.</p>
      </div>

      <div className="space-y-6">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-panel rounded-xl p-6 border border-nexus-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent-violet/10 flex items-center justify-center">
              <Key className="w-5 h-5 text-accent-violet" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">API Keys</h2>
              <p className="text-xs text-nexus-400">Manage LLM provider API keys</p>
            </div>
          </div>
          <div className="space-y-3">
            {["OpenAI", "Anthropic", "Gemini"].map((provider) => (
              <div key={provider} className="flex items-center justify-between p-3 rounded-lg bg-nexus-800/50 border border-nexus-700/30">
                <span className="text-sm text-nexus-200">{provider}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-accent-emerald">Configured</span>
                  <button className="text-xs text-accent-violet hover:underline">Edit</button>
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="glass-panel rounded-xl p-6 border border-nexus-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent-cyan/10 flex items-center justify-center">
              <Shield className="w-5 h-5 text-accent-cyan" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Security</h2>
              <p className="text-xs text-nexus-400">Authentication and access control</p>
            </div>
          </div>
          <div className="space-y-3">
            {[
              { label: "OAuth 2.0", status: "Enabled" },
              { label: "JWT Authentication", status: "Enabled" },
              { label: "RBAC", status: "Enabled" },
              { label: "Audit Logging", status: "Enabled" },
              { label: "Rate Limiting", status: "Enabled" },
            ].map((item) => (
              <div key={item.label} className="flex items-center justify-between p-3 rounded-lg bg-nexus-800/50 border border-nexus-700/30">
                <span className="text-sm text-nexus-200">{item.label}</span>
                <span className="text-xs text-accent-emerald bg-accent-emerald/10 px-2 py-0.5 rounded-full border border-accent-emerald/20">{item.status}</span>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="glass-panel rounded-xl p-6 border border-nexus-700/50">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-lg bg-accent-emerald/10 flex items-center justify-center">
              <Server className="w-5 h-5 text-accent-emerald" />
            </div>
            <div>
              <h2 className="text-lg font-semibold text-white">Infrastructure</h2>
              <p className="text-xs text-nexus-400">Deployment and scaling configuration</p>
            </div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {[
              { label: "Database", value: "PostgreSQL 16", icon: Database },
              { label: "Cache", value: "Redis 7", icon: Database },
              { label: "Vector DB", value: "ChromaDB", icon: Database },
              { label: "Region", value: "us-east-1", icon: Globe },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-3 p-3 rounded-lg bg-nexus-800/50 border border-nexus-700/30">
                <item.icon className="w-4 h-4 text-nexus-400" />
                <div>
                  <div className="text-xs text-nexus-500">{item.label}</div>
                  <div className="text-sm text-nexus-200 font-medium">{item.value}</div>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
