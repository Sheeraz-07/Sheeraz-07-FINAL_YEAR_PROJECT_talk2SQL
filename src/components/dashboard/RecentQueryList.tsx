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
    <Card className={cn('border-0 shadow-xl hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl overflow-hidden', className)}>
      <div className="flex items-center justify-between p-6 pb-4 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-br from-indigo-50 to-blue-50/50 dark:from-indigo-950/50 dark:to-blue-950/30">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-2xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-lg">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Recent Queries</h3>
            <p className="text-sm text-muted-foreground font-medium">Your latest activity</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/history')} className="rounded-full font-bold text-sm hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:scale-105 hover:shadow-md transition-all px-4 py-2">
          View all
        </Button>
      </div>
      <div className="p-6">
      <div className="space-y-3">
        {recentQueries.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mx-auto mb-4 shadow-md">
              <Clock className="h-10 w-10 text-muted-foreground" />
            </div>
            <p className="text-base font-semibold text-muted-foreground">
              No queries yet
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Start asking questions to see them here!
            </p>
          </div>
        ) : (
          recentQueries.map((query, index) => (
            <div
              key={query.id}
              className="group flex items-center gap-4 p-4 rounded-2xl hover:bg-gradient-to-r hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-900/30 dark:hover:to-blue-900/30 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-lg transition-all duration-300 cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{query.naturalQuery}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-2 font-medium">
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{query.rowCount} rows</span>
                  <span>•</span>
                  <span className="bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">{query.executionTime.toFixed(2)}s</span>
                  <span>•</span>
                  <span>{formatTime(query.createdAt)}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                  onClick={() => toggleFavorite(query.id)}
                >
                  <Star
                    className={cn(
                      'h-4 w-4',
                      query.isFavorite && 'fill-yellow-500 text-yellow-500'
                    )}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-9 w-9 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                  onClick={() => handleRunQuery(query.naturalQuery)}
                >
                  <Play className="h-4 w-4" />
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
