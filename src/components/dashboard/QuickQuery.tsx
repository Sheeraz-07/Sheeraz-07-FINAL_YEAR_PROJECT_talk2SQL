"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Sparkles, ArrowRight } from 'lucide-react';
import { useQueryStore } from '@/stores/queryStore';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const popularQueries = [
  'Sales today',
  'Top products',
  'Monthly revenue',
  'Customer count',
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
    <Card className={cn('p-6', className)}>
      <div className="flex items-center gap-2 mb-4">
        <Sparkles className="h-5 w-5 text-primary" />
        <h3 className="font-semibold">Quick Query</h3>
      </div>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setLocalQuery(e.target.value)}
            placeholder="Ask a quick question..."
            className="pl-10 pr-24"
          />
          <Button
            type="submit"
            size="sm"
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8"
            disabled={!query.trim()}
          >
            Ask
            <ArrowRight className="ml-1 h-3 w-3" />
          </Button>
        </div>
        <div className="flex flex-wrap gap-2">
          {popularQueries.map((q) => (
            <Badge
              key={q}
              variant="secondary"
              className="cursor-pointer hover:bg-primary hover:text-primary-foreground transition-colors"
              onClick={() => handleQuickQuery(q)}
            >
              {q}
            </Badge>
          ))}
        </div>
      </form>
    </Card>
  );
}
