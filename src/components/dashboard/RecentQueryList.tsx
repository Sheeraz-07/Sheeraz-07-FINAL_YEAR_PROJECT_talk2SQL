"use client";

import { useRouter } from 'next/navigation';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, Play, Star, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryStore } from '@/stores/queryStore';

interface RecentQueryListProps {
  className?: string;
  limit?: number;
}

export function RecentQueryList({ className, limit = 5 }: RecentQueryListProps) {
  const router = useRouter();
  const { history, toggleFavorite, setQuery } = useQueryStore();
  const recentQueries = history.slice(0, limit);

  const handleRunQuery = (query: string) => {
    setQuery(query);
    router.push('/query');
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - new Date(date).getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return `${days}d ago`;
  };

  return (
    <Card className={cn('p-6', className)}>
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Clock className="h-5 w-5 text-primary" />
          <h3 className="font-semibold">Recent Queries</h3>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/history')}>
          View all
        </Button>
      </div>
      <div className="space-y-2">
        {recentQueries.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-8">
            No queries yet. Start asking questions!
          </p>
        ) : (
          recentQueries.map((query) => (
            <div
              key={query.id}
              className="group flex items-center gap-3 p-3 rounded-lg hover:bg-secondary/50 transition-colors"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium truncate">{query.naturalQuery}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1">
                  <span>{query.rowCount} rows</span>
                  <span>•</span>
                  <span>{query.executionTime.toFixed(2)}s</span>
                  <span>•</span>
                  <span>{formatTime(query.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => toggleFavorite(query.id)}
                >
                  <Star
                    className={cn(
                      'h-4 w-4',
                      query.isFavorite && 'fill-warning text-warning'
                    )}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => handleRunQuery(query.naturalQuery)}
                >
                  <Play className="h-4 w-4" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </Card>
  );
}
