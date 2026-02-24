"use client";

import { QueryInterface } from '@/components/query/QueryInterface';
import { Sparkles, Mic, Languages, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function QueryPage() {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in relative">
      {/* Mesh Gradient Background */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-indigo-100/40 via-transparent to-purple-100/40 dark:from-indigo-950/20 dark:via-transparent dark:to-purple-950/20 opacity-60" />
      
      <div className="mb-6 bg-gradient-to-br from-white/60 to-indigo-50/40 dark:from-slate-900/60 dark:to-indigo-950/30 backdrop-blur-xl rounded-2xl p-5 border border-[#edf2f7] dark:border-slate-700/60 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)]">
        <div className="flex items-start justify-between gap-4 mb-4">
          <div className="flex items-center gap-3">
            <div className="relative p-2.5 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-md">
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 blur-md opacity-30" />
              <Sparkles className="h-5 w-5 text-white relative z-10" />
            </div>
            <div>
              <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-slate-50">Ask Your Data</h2>
              <p className="text-slate-500 dark:text-slate-400 text-sm mt-0.5 font-medium">
                Natural language queries powered by AI — just ask in plain English or Urdu
              </p>
            </div>
          </div>
          <Badge className="gap-1 rounded-full px-3 py-1 font-semibold text-xs shadow-sm bg-gradient-to-r from-amber-100 via-yellow-100 to-amber-100 dark:from-amber-900/40 dark:via-yellow-900/40 dark:to-amber-900/40 border border-amber-200/60 dark:border-amber-800/30 hover:scale-105 transition-transform">
            <Zap className="h-3 w-3 text-amber-700 dark:text-amber-400" />
            <span className="bg-gradient-to-r from-amber-700 to-yellow-700 dark:from-amber-400 dark:to-yellow-400 bg-clip-text text-transparent font-bold">AI Powered</span>
          </Badge>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-md text-xs font-semibold shadow-sm border border-green-200/60 dark:border-green-800/30 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all">
            <Languages className="h-3.5 w-3.5 text-green-600 dark:text-green-400" />
            <span className="text-slate-700 dark:text-slate-300">English & Roman Urdu</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/40 dark:bg-slate-800/40 backdrop-blur-md text-xs font-semibold shadow-sm border border-purple-200/60 dark:border-purple-800/30 hover:bg-white/60 dark:hover:bg-slate-800/60 transition-all">
            <Mic className="h-3.5 w-3.5 text-purple-600 dark:text-purple-400" />
            <span className="text-slate-700 dark:text-slate-300">Voice Input</span>
          </div>
        </div>
      </div>
      <QueryInterface />
    </div>
  );
}
