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
    <Card className="group p-5 hover:shadow-lg transition-all duration-200 bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md rounded-2xl hover:-translate-y-1">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2.5 mb-3">
            {query.status === 'success' ? (
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-green-500 to-emerald-600">
                <CheckCircle className="h-3.5 w-3.5 text-white flex-shrink-0" />
              </div>
            ) : (
              <div className="p-1.5 rounded-lg bg-gradient-to-br from-red-500 to-rose-600">
                <XCircle className="h-3.5 w-3.5 text-white flex-shrink-0" />
              </div>
            )}
            <p className="font-semibold text-sm truncate text-slate-900 dark:text-white">{query.naturalQuery}</p>
          </div>
          <div className="bg-indigo-50/60 dark:bg-indigo-950/30 backdrop-blur-md rounded-xl p-3 mb-3 border border-indigo-200/50 dark:border-indigo-700/50 max-h-24 overflow-auto shadow-sm">
            <code className="text-xs font-mono text-purple-700 dark:text-purple-300 block whitespace-pre-wrap break-all">
              {query.generatedSQL}
            </code>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full">
              <Calendar className="h-3 w-3" />
              {formatDate(query.createdAt)}
            </span>
            <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2.5 py-1 rounded-full">
              <Clock className="h-3 w-3" />
              {query.executionTime.toFixed(2)}s
            </span>
            <Badge variant="secondary" className="text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 dark:bg-indigo-950 text-indigo-700 dark:text-indigo-300 border-0">
              {query.rowCount} rows
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1.5">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 rounded-full hover:bg-indigo-50 dark:hover:bg-indigo-950 transition-all duration-200 shadow-sm hover:shadow"
            onClick={() => toggleFavorite(query.id)}
          >
            <Star
              className={cn(
                'h-4 w-4',
                query.isFavorite && 'fill-yellow-500 text-yellow-500'
              )}
            />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-50 dark:hover:bg-slate-800 transition-all duration-200 shadow-sm hover:shadow">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl border-slate-200 dark:border-slate-800 shadow-lg">
              <DropdownMenuItem onClick={() => handleRunQuery(query.naturalQuery)} className="rounded-lg cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 p-2.5">
                <Play className="h-3.5 w-3.5 mr-2" />
                <span className="text-sm font-medium">Run Again</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleFavorite(query.id)} className="rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 p-2.5">
                <Star className="h-3.5 w-3.5 mr-2" />
                <span className="text-sm font-medium">{query.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}</span>
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 dark:text-red-400 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 p-2.5"
                onClick={() => handleDelete(query.id)}
              >
                <Trash2 className="h-3.5 w-3.5 mr-2" />
                <span className="text-sm font-medium">Delete</span>
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
      <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 border border-slate-200 dark:border-slate-800 shadow-md">
        <div className="flex items-center gap-3">
          <div className="p-3 rounded-xl bg-gradient-to-br from-purple-600 to-pink-600 shadow-md">
            <Clock className="h-6 w-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Query History</h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm mt-0.5">
              Browse, search, and manage all your previous queries
            </p>
          </div>
        </div>
      </div>

      {/* Filters */}
      <Card className="p-4 border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 rounded-2xl">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input
              placeholder="Search queries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 rounded-xl border border-slate-300 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all duration-200 bg-white dark:bg-slate-900 text-sm"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-10 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-lg">
                <SelectItem value="all" className="rounded-lg text-sm">All Status</SelectItem>
                <SelectItem value="success" className="rounded-lg text-sm">Success</SelectItem>
                <SelectItem value="failed" className="rounded-lg text-sm">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-40 h-10 rounded-xl border border-slate-300 dark:border-slate-700 text-sm font-medium">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800 shadow-lg">
                <SelectItem value="recent" className="rounded-lg text-sm">Most Recent</SelectItem>
                <SelectItem value="oldest" className="rounded-lg text-sm">Oldest First</SelectItem>
                <SelectItem value="fastest" className="rounded-lg text-sm">Fastest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-md rounded-xl p-1">
          <TabsTrigger value="all" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md font-medium px-4 py-2 text-sm">All Queries ({history.length})</TabsTrigger>
          <TabsTrigger value="favorites" className="rounded-lg data-[state=active]:bg-gradient-to-r data-[state=active]:from-indigo-600 data-[state=active]:to-blue-600 data-[state=active]:text-white data-[state=active]:shadow-md font-medium px-4 py-2 text-sm">
            <Star className="h-3.5 w-3.5 mr-1.5" />
            Favorites ({savedQueries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="space-y-3">
            {sortedHistory.length === 0 ? (
              <Card className="p-12 text-center border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto mb-4">
                  <Clock className="h-8 w-8 text-slate-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">No queries yet</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm">
                  Your query history will appear here
                </p>
                <Button onClick={() => router.push('/query')} className="rounded-full px-5 py-2.5 font-semibold shadow-md hover:shadow-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 border-0 hover:scale-105 transition-all duration-200 text-sm">
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

        <TabsContent value="favorites" className="mt-4">
          <div className="space-y-3">
            {savedQueries.length === 0 ? (
              <Card className="p-12 text-center border border-slate-200 dark:border-slate-800 shadow-md bg-white dark:bg-slate-900 rounded-2xl">
                <div className="w-16 h-16 rounded-full bg-yellow-50 dark:bg-yellow-950 flex items-center justify-center mx-auto mb-4">
                  <Star className="h-8 w-8 text-yellow-600 dark:text-yellow-400" />
                </div>
                <h3 className="font-semibold text-lg mb-2 text-slate-900 dark:text-white">No favorites yet</h3>
                <p className="text-slate-600 dark:text-slate-400 text-sm">
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
