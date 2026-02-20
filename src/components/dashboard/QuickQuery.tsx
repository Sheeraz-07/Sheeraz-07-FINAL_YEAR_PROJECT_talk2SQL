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
    <Card className={cn('border-0 shadow-xl hover:shadow-2xl transition-all duration-300 overflow-hidden bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl hover:scale-[1.01]', className)}>
      <CardHeader className="pb-4 bg-gradient-to-br from-indigo-50 to-blue-50/50 dark:from-indigo-950/50 dark:to-blue-950/30">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-lg">
              <Sparkles className="h-6 w-6 text-white" />
            </div>
            <div>
              <CardTitle className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Quick Query</CardTitle>
              <CardDescription className="text-sm mt-1 font-medium">Ask about your data in natural language</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1.5 rounded-full px-4 py-1.5 font-bold text-xs shadow-sm bg-gradient-to-r from-indigo-100 to-blue-100 dark:from-indigo-900/50 dark:to-blue-900/50 border-0">
            <Zap className="h-3.5 w-3.5 text-indigo-600 dark:text-indigo-400" />
            <span className="text-indigo-900 dark:text-indigo-200">AI-Powered</span>
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="pt-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="relative group">
            <Search className="absolute left-5 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground transition-all duration-200 group-focus-within:text-indigo-600 dark:group-focus-within:text-indigo-400" />
            <Input
              value={query}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Ask a question in natural language..."
              className="pl-14 pr-32 h-14 rounded-2xl border-2 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 font-medium text-sm shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 focus:shadow-lg focus:border-indigo-500 dark:focus:border-indigo-500 transition-all duration-300"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-10 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 border-0 px-5 hover:scale-105 transition-all duration-200"
              disabled={!query.trim()}
            >
              Ask
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-3 tracking-wide uppercase">Popular queries:</p>
            <div className="flex flex-wrap gap-2">
              {popularQueries.map((q) => (
                <Badge
                  key={q.text}
                  variant="outline"
                  className="cursor-pointer hover:bg-gradient-to-r hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-900/50 dark:hover:to-blue-900/50 hover:border-indigo-300 dark:hover:border-indigo-700 hover:text-indigo-900 dark:hover:text-indigo-200 hover:scale-105 transition-all duration-200 rounded-full py-2 px-4 font-semibold text-xs shadow-sm hover:shadow-md border-2"
                  onClick={() => handleQuickQuery(q.text)}
                >
                  <span className="mr-2 text-base">{q.icon}</span>
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
