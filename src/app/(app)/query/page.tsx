"use client";

import { QueryInterface } from '@/components/query/QueryInterface';

export default function QueryPage() {
  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-2">Ask Your Data</h2>
        <p className="text-muted-foreground">
          Type your question in plain English or Roman Urdu, or use voice input
        </p>
      </div>
      <QueryInterface />
    </div>
  );
}
