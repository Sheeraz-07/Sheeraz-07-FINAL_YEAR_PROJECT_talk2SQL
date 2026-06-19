"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ArrowRight, TrendingUp, Star, Calendar, Users } from 'lucide-react';
import { useQueryStore } from '@/stores/queryStore';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

const popularQueries = [
  { text: 'Sales today', icon: TrendingUp },
  { text: 'Top products', icon: Star },
  { text: 'Monthly revenue', icon: Calendar },
  { text: 'Customer count', icon: Users },
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
    <Card className={cn('w-full', className)}>
      <CardHeader className="py-4 pb-0">
        <CardTitle className="text-[14px] font-[600] text-foreground flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          Quick Query
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group flex items-center gap-3">
            <Input
              value={query}
              onChange={(e) => setLocalQuery(e.target.value)}
              placeholder="Ask a question about your data..."
              className="h-10 text-[14px]"
            />
            <Button
              type="submit"
              disabled={!query.trim()}
            >
              Ask
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-[12px] font-[500] text-muted-foreground mr-1">Suggestions:</span>
            {popularQueries.map((q) => {
              const Icon = q.icon;
              return (
                <Badge
                  key={q.text}
                  variant="secondary"
                  className="cursor-pointer bg-secondary hover:bg-secondary/80 text-secondary-foreground font-[500] rounded-[6px] py-1 px-2.5 transition-colors"
                  onClick={() => handleQuickQuery(q.text)}
                >
                  <Icon className="mr-1.5 h-3 w-3" />
                  {q.text}
                </Badge>
              );
            })}
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
