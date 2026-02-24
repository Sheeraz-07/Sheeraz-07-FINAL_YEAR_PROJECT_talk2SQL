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
    <Card className={cn('border border-[#E5E7EB] dark:border-slate-700 shadow-sm hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700/50 transition-all duration-300 bg-white dark:bg-slate-900 rounded-xl overflow-hidden', className)}>
      <div className="flex items-center justify-between p-5 pb-3 border-b border-[#E5E7EB] dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800/30">
        <div className="flex items-center gap-2.5">
          <div className="relative p-2 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 shadow-md">
            <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-indigo-600 to-blue-600 blur-md opacity-30" />
            <Clock className="h-4 w-4 text-white relative z-10" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-slate-50">Recent Queries</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">Your latest activity</p>
          </div>
        </div>
        <Button variant="ghost" size="sm" onClick={() => router.push('/history')} className="rounded-full font-bold text-xs hover:bg-indigo-100 dark:hover:bg-indigo-900/50 hover:scale-105 hover:shadow-sm transition-all px-3 py-1.5">
          View all
        </Button>
      </div>
      <div className="p-5">
      <div className="space-y-2.5">
        {recentQueries.length === 0 ? (
          <div className="text-center py-10">
            <div className="w-16 h-16 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mx-auto mb-3 shadow-sm">
              <Clock className="h-8 w-8 text-muted-foreground" />
            </div>
            <p className="text-sm font-semibold text-muted-foreground">
              No queries yet
            </p>
            <p className="text-xs text-muted-foreground mt-1.5">
              Start asking questions to see them here!
            </p>
          </div>
        ) : (
          recentQueries.map((query, index) => (
            <div
              key={query.id}
              className="group flex items-center gap-3 p-3.5 rounded-xl hover:bg-gradient-to-r hover:from-indigo-100 hover:to-blue-100 dark:hover:from-indigo-900/30 dark:hover:to-blue-900/30 border-2 border-transparent hover:border-indigo-200 dark:hover:border-indigo-800 hover:shadow-md transition-all duration-300 cursor-pointer"
            >
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold truncate text-slate-900 dark:text-white">{query.naturalQuery}</p>
                <div className="flex items-center gap-2 text-xs text-muted-foreground mt-1.5 font-medium">
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
                  className="h-8 w-8 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
                  onClick={() => toggleFavorite(query.id)}
                >
                  <Star
                    className={cn(
                      'h-3.5 w-3.5',
                      query.isFavorite && 'fill-yellow-500 text-yellow-500'
                    )}
                  />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-lg hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-colors"
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
