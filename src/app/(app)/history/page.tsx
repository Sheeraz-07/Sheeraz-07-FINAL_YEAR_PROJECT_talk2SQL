"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  Search,
  Star,
  Trash2,
  Play,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  MoreVertical,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useQueryStore } from '@/stores/queryStore';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

export default function HistoryPage() {
  const router = useRouter();
  const { history, savedQueries, toggleFavorite, deleteFromHistory, setQuery } = useQueryStore();
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [statusFilter, setStatusFilter] = useState('all');

  const filteredHistory = history.filter((query) => {
    const matchesSearch = query.naturalQuery.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' ||
      (statusFilter === 'success' && query.status === 'success') ||
      (statusFilter === 'failed' && query.status === 'error');
    return matchesSearch && matchesStatus;
  });

  const sortedHistory = [...filteredHistory].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      case 'oldest':
        return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      case 'fastest':
        return a.executionTime - b.executionTime;
      default:
        return 0;
    }
  });

  const handleRunQuery = (query: string) => {
    setQuery(query);
    router.push('/query');
  };

  const handleDelete = (id: string) => {
    deleteFromHistory(id);
    toast.success('Query deleted from history');
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(date));
  };

  const QueryCard = ({ query }: { query: typeof history[0] }) => (
    <Card className="group p-6 hover:shadow-2xl transition-all duration-300 bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-3 mb-3">
            {query.status === 'success' ? (
              <div className="p-2 rounded-xl bg-gradient-to-br from-green-500 to-emerald-600 shadow-md">
                <CheckCircle className="h-4 w-4 text-white flex-shrink-0" />
              </div>
            ) : (
              <div className="p-2 rounded-xl bg-gradient-to-br from-red-500 to-rose-600 shadow-md">
                <XCircle className="h-4 w-4 text-white flex-shrink-0" />
              </div>
            )}
            <p className="font-bold text-base truncate text-slate-900 dark:text-white">{query.naturalQuery}</p>
          </div>
          <div className="bg-gradient-to-br from-slate-100 to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl p-4 mb-4 border-2 border-slate-200 dark:border-slate-700 shadow-sm">
            <code className="text-xs font-mono text-slate-700 dark:text-slate-300 line-clamp-2 font-semibold">
              {query.generatedSQL}
            </code>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-sm">
            <span className="flex items-center gap-2 text-muted-foreground font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              <Calendar className="h-3.5 w-3.5" />
              {formatDate(query.createdAt)}
            </span>
            <span className="flex items-center gap-2 text-muted-foreground font-medium bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-full">
              <Clock className="h-3.5 w-3.5" />
              {query.executionTime.toFixed(2)}s
            </span>
            <Badge variant="secondary" className="text-sm font-bold px-3 py-1 rounded-full shadow-sm">
              {query.rowCount} rows
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            className="h-10 w-10 rounded-xl hover:bg-indigo-100 dark:hover:bg-indigo-900/50 transition-all duration-200 hover:scale-110"
            onClick={() => toggleFavorite(query.id)}
          >
            <Star
              className={cn(
                'h-5 w-5',
                query.isFavorite && 'fill-yellow-500 text-yellow-500'
              )}
            />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 hover:scale-110">
                <MoreVertical className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
              <DropdownMenuItem onClick={() => handleRunQuery(query.naturalQuery)} className="rounded-lg cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 p-3">
                <Play className="h-4 w-4 mr-3" />
                <span className="font-semibold">Run Again</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleFavorite(query.id)} className="rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-3">
                <Star className="h-4 w-4 mr-3" />
                <span className="font-semibold">{query.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 p-3"
                onClick={() => handleDelete(query.id)}
              >
                <Trash2 className="h-4 w-4 mr-3" />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </Card>
  );

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="bg-gradient-to-br from-white/80 via-white/60 to-purple-50/80 dark:from-slate-900/80 dark:via-slate-900/60 dark:to-purple-950/40 backdrop-blur-sm rounded-3xl p-8 border-0 shadow-xl mb-6">
        <div className="flex items-center gap-4">
          <div className="p-4 rounded-2xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-lg">
            <Clock className="h-8 w-8 text-white" />
          </div>
          <div>
            <h2 className="text-4xl font-bold tracking-tight bg-gradient-to-r from-slate-900 to-slate-600 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">Query History</h2>
            <p className="text-muted-foreground text-base mt-2 font-medium">
              Browse, search, and manage all your previous queries
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-6 border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Search queries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-12 rounded-2xl border-2 border-slate-200 dark:border-slate-700 shadow-sm hover:border-indigo-300 dark:hover:border-indigo-700 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all duration-200 bg-white dark:bg-slate-900 text-base"
            />
          </div>
          <div className="flex gap-3">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40 h-12 rounded-2xl border-2 shadow-sm font-semibold">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
                <SelectItem value="all" className="rounded-lg font-semibold">All Status</SelectItem>
                <SelectItem value="success" className="rounded-lg font-semibold">Success</SelectItem>
                <SelectItem value="failed" className="rounded-lg font-semibold">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-44 h-12 rounded-2xl border-2 shadow-sm font-semibold">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-xl">
                <SelectItem value="recent" className="rounded-lg font-semibold">Most Recent</SelectItem>
                <SelectItem value="oldest" className="rounded-lg font-semibold">Oldest First</SelectItem>
                <SelectItem value="fastest" className="rounded-lg font-semibold">Fastest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm border-0 shadow-lg rounded-2xl p-2">
          <TabsTrigger value="all" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md font-semibold px-6 py-2.5 text-base">All Queries ({history.length})</TabsTrigger>
          <TabsTrigger value="favorites" className="rounded-xl data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md font-semibold px-6 py-2.5 text-base">
            <Star className="h-4 w-4 mr-2" />
            Favorites ({savedQueries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-6">
          <div className="space-y-4">
            {sortedHistory.length === 0 ? (
              <Card className="p-16 text-center border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-700 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Clock className="h-12 w-12 text-muted-foreground" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-white">No queries yet</h3>
                <p className="text-muted-foreground mb-6 text-base">
                  Your query history will appear here
                </p>
                <Button onClick={() => router.push('/query')} className="rounded-full px-6 py-6 font-bold shadow-lg hover:shadow-xl bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 border-0 hover:scale-105 transition-all duration-200">
                  Run Your First Query
                </Button>
              </Card>
            ) : (
              sortedHistory.map((query) => (
                <QueryCard key={query.id} query={query} />
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="favorites" className="mt-6">
          <div className="space-y-4">
            {savedQueries.length === 0 ? (
              <Card className="p-16 text-center border-0 shadow-xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-sm rounded-2xl">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-yellow-100 to-orange-100 dark:from-yellow-900/30 dark:to-orange-900/30 flex items-center justify-center mx-auto mb-6 shadow-lg">
                  <Star className="h-12 w-12 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="font-bold text-xl mb-3 text-slate-900 dark:text-white">No favorites yet</h3>
                <p className="text-muted-foreground text-base">
                  Star queries to save them here for quick access
                </p>
              </Card>
            ) : (
              savedQueries.map((query) => (
                <QueryCard key={query.id} query={query} />
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
