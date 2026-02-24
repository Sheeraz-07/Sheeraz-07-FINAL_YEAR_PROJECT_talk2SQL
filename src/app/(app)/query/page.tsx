"use client";

import { QueryInterface } from '@/components/query/QueryInterface';
import { Sparkles, Mic, Languages, Zap } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function QueryPage() {
  return (
    <div className="max-w-6xl mx-auto animate-fade-in">
      <div className="mb-8 bg-gradient-to-br from-white/80 via-white/60 to-indigo-50/80 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-indigo-950/40 backdrop-blur-sm rounded-3xl p-8 border-0 shadow-xl">
        <div className="flex items-start justify-between gap-4 mb-6">
          <div className="flex items-center gap-4">
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-lg">
              <Sparkles className="h-8 w-8 text-white" />
            </div>
            <div>
              <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Ask Your Data</h2>
              <p className="text-muted-foreground text-base mt-2 font-medium">
                Natural language queries powered by AI — just ask in plain English or Urdu
              </p>
            </div>
          </div>
          <Badge className="gap-1.5 rounded-full px-4 py-2 font-bold text-sm shadow-md bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50 border-0 hover:scale-105 transition-transform">
            <Zap className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
            <span className="text-indigo-900 dark:text-indigo-200">AI Powered</span>
          </Badge>
        </div>
        <div className="flex flex-wrap gap-3">
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-green-100 to-emerald-100 dark:from-green-900/30 dark:to-emerald-900/30 text-sm font-semibold shadow-sm border-2 border-green-200 dark:border-green-800">
            <Languages className="h-4 w-4 text-green-700 dark:text-green-400" />
            <span className="text-green-900 dark:text-green-200">English & Roman Urdu</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-purple-100 to-pink-100 dark:from-purple-900/30 dark:to-pink-900/30 text-sm font-semibold shadow-sm border-2 border-purple-200 dark:border-purple-800">
            <Mic className="h-4 w-4 text-purple-700 dark:text-purple-400" />
            <span className="text-purple-900 dark:text-purple-200">Voice Input</span>
          </div>
        </div>
      </div>
      <QueryInterface />
    </div>
  );
}
