"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, ArrowRight, Zap } from 'lucide-react';
import { useQueryStore } from '@/stores/queryStore';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const popularQueries = [
  { text: 'Sales today', icon: '💰' },
  { text: 'Top products', icon: '🏆' },
  { text: 'Monthly revenue', icon: '📊' },
  { text: 'Customer count', icon: '👥' },
];

interface QuickQueryProps {
  className?: string;
}

export function QuickQuery({ className }: QuickQueryProps) {
  const router = useRouter();
  const { setQuery } = useQueryStore();
  const [query, setLocalQuery] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      setQuery(query);
      router.push('/query');
    }
  };

  const handleQuickQuery = (q: string) => {
    setQuery(q);
    router.push('/query');
  };

  return (
    <Card className={cn('border border-[#E5E7EB] dark:border-slate-700 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden bg-white dark:bg-slate-900 rounded-xl hover:scale-[1.005] hover:border-blue-300 dark:hover:border-blue-700/50', className)}>
      <CardHeader className="pb-3 bg-gradient-to-br from-indigo-50/50 to-blue-50/30 dark:from-indigo-950/30 dark:to-blue-950/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="relative p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-md">
              {/* Icon glow effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 blur-md opacity-30" />
              <Sparkles className="h-4 w-4 text-white relative z-10" />
            </div>
            <div>
              <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-50">Quick Query</CardTitle>
              <CardDescription className="text-xs mt-0.5 font-medium">Ask about your data in natural language</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1 rounded-full px-3 py-1 font-bold text-xs shadow-sm bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/50 dark:to-blue-900/50 border border-indigo-100 dark:border-indigo-800/30">
            <Zap className="h-3 w-3 text-indigo-600 dark:text-indigo-400" />
            <span className="text-indigo-900 dark:text-indigo-200">AI-Powered</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-all duration-200 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400" />
            <Input
              value={query}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Ask a question in natural language..."
              className="pl-11 pr-28 h-10 rounded-lg border border-[#E5E7EB] dark:border-slate-700 bg-white dark:bg-slate-800 font-medium text-sm hover:border-slate-300 dark:hover:border-slate-600 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-1.5 top-1/2 -translate-y-1/2 h-8 rounded-lg font-bold text-sm shadow-md hover:shadow-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 border-0 px-4 hover:scale-105 transition-all duration-200"
              disabled={!query.trim()}
            >
              Ask
              <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
            </Button>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-2.5 tracking-wide uppercase">Popular queries:</p>
            <div className="flex flex-wrap gap-2">
              {popularQueries.map((q) => (
                <Badge
                  key={q.text}
                  variant="outline"
                  className="cursor-pointer hover:bg-gradient-to-r hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-900/50 dark:hover:to-blue-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-900 dark:hover:text-indigo-200 hover:scale-105 transition-all duration-200 rounded-full py-1.5 px-3 font-semibold text-xs shadow-sm hover:shadow-md border-2"
                  onClick={() => handleQuickQuery(q.text)}
                >
                  <span className="mr-1.5 text-sm">{q.icon}</span>
                  {q.text}
                </Badge>
              ))}
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
