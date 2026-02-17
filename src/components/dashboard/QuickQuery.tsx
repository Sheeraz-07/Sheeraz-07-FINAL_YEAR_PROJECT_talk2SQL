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
    <Card className={cn('border-2 hover:border-accent/60 dark:hover:border-accent/70 hover:shadow-2xl transition-all duration-300 overflow-hidden hover:scale-[1.01]', className)}>
      <CardHeader className="pb-3 bg-gradient-to-br from-accent/5 to-transparent">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="p-2.5 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 shadow-sm">
              <Sparkles className="h-5 w-5 text-accent" />
            </div>
            <div>
              <CardTitle className="text-lg font-bold bg-gradient-to-r from-foreground to-foreground/70 bg-clip-text">Quick Query</CardTitle>
              <CardDescription className="text-xs mt-0.5 font-semibold">Ask about your data</CardDescription>
            </div>
          </div>
          <Badge variant="secondary" className="gap-1.5 rounded-full px-3 py-1 font-bold text-xs shadow-sm">
            <Zap className="h-3.5 w-3.5" />
            AI-Powered
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-all duration-200 group-focus-within:text-accent" />
            <Input
              value={query}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Ask a question in natural language..."
              className="pl-11 pr-28 h-12 rounded-full border-2 bg-muted/30 font-semibold text-sm shadow-sm hover:shadow-md hover:border-accent/60 dark:hover:border-accent/70 focus:shadow-xl transition-all duration-300"
            />
            <Button
              type="submit"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2 h-8 rounded-full font-bold text-xs shadow-md hover:shadow-lg"
              disabled={!query.trim()}
            >
              Ask
              <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Button>
          </div>
          <div>
            <p className="text-xs font-bold text-muted-foreground mb-2.5 tracking-wide">Popular queries:</p>
            <div className="flex flex-wrap gap-2">
              {popularQueries.map((q) => (
                <Badge
                  key={q.text}
                  variant="outline"
                  className="cursor-pointer hover:bg-gradient-to-r hover:from-accent/25 hover:to-accent/15 dark:hover:from-accent/35 dark:hover:to-accent/20 hover:border-accent/70 dark:hover:border-accent/80 hover:text-accent hover:scale-105 transition-all duration-200 rounded-full py-1.5 px-3.5 font-semibold text-xs shadow-sm hover:shadow-md"
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
