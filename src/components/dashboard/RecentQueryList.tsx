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
    <Card className={cn('border hover:border-accent/50 hover:shadow-xl transition-all duration-300', className)}>
      <div className="flex items-center justify-between p-5 pb-4 border-b bg-gradient-to-br from-accent/5 to-transparent">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-gradient-to-br from-accent/20 to-accent/10 shadow-sm">
            <Clock className="h-5 w-5 text-accent" />
          </div>
          <div>
            <h3 className="font-bold text-base">Recent Queries</h3>
            <p className="text-xs text-muted-foreground font-semibold">Your latest activity</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/history')} className="rounded-full font-bold text-xs hover:bg-accent/25 dark:hover:bg-accent/35 hover:scale-105 hover:shadow-md transition-all">
          View all
        </Button>
      </div>
      <div className="p-5 pt-4">
      <div className="space-y-2">
        {recentQueries.length === 0 ? (
          <div className="text-center py-8">
            <div className="w-16 h-16 rounded-full bg-muted/30 flex items-center justify-center mx-auto mb-3">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-medium text-muted-foreground">
              No queries yet
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Start asking questions to see them here!
            </p>
          </div>
        ) : (
          recentQueries.map((query, index) => (
            <div
              key={query.id}
              className="group flex items-center gap-3 p-3.5 rounded-2xl hover:bg-gradient-to-r hover:from-accent/20 hover:to-accent/10 dark:hover:from-accent/30 dark:hover:to-accent/15 border-2 border-transparent hover:border-accent/50 dark:hover:border-accent/60 hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate">{query.naturalQuery}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5 font-semibold">
                  <span>{query.rowCount} rows</span>
                  <span>•</span>
                  <span>{query.executionTime.toFixed(2)}s</span>
                  <span>•</span>
                  <span>{formatTime(query.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 hover:bg-accent/10 transition-colors"
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
                  className="h-8 w-8 hover:bg-accent/10 transition-colors"
                  onClick={() => handleRunQuery(query.naturalQuery)}
                >
                  <Play className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    </Card>
  );
}
