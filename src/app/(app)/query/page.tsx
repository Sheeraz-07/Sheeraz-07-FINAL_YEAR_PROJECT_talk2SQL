"use client";

import { QueryInterface } from '@/components/query/QueryInterface';
import { Sparkles, Mic, Languages } from 'lucide-react';

export default function QueryPage() {
  return (
    <div className="max-w-5xl mx-auto animate-fade-in">
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-3">
          <div className="p-2.5 rounded-xl bg-accent/10">
            <Sparkles className="h-6 w-6 text-accent" />
          </div>
          <div>
            <h2 className="text-3xl font-bold tracking-tight">Ask Your Data</h2>
            <p className="text-muted-foreground text-sm mt-1">
              Natural language queries powered by AI
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-3 mt-4">
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-xs font-medium">
            <Languages className="h-3.5 w-3.5 text-accent" />
            <span>English & Roman Urdu supported</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-muted/50 text-xs font-medium">
            <Mic className="h-3.5 w-3.5 text-accent" />
            <span>Voice input available</span>
          </div>
        </div>
      </div>
      <QueryInterface />
    </div>
  );
}
