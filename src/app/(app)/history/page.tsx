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
    <Card className="p-4 hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-2">
            {query.status === 'success' ? (
              <CheckCircle className="h-4 w-4 text-success flex-shrink-0" />
            ) : (
              <XCircle className="h-4 w-4 text-destructive flex-shrink-0" />
            )}
            <p className="font-medium truncate">{query.naturalQuery}</p>
          </div>
          <div className="bg-secondary/30 rounded-lg p-3 mb-3">
            <code className="text-xs font-mono text-muted-foreground line-clamp-2">
              {query.generatedSQL}
            </code>
          </div>
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            <span className="flex items-center gap-1">
              <Calendar className="h-3 w-3" />
              {formatDate(query.createdAt)}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="h-3 w-3" />
              {query.executionTime.toFixed(2)}s
            </span>
            <Badge variant="secondary" className="text-xs">
              {query.rowCount} rows
            </Badge>
          </div>
        </div>
        <div className="flex items-center gap-1">
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
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handleRunQuery(query.naturalQuery)}>
                <Play className="h-4 w-4 mr-2" />
                Run Again
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => toggleFavorite(query.id)}>
                <Star className="h-4 w-4 mr-2" />
                {query.isFavorite ? 'Remove from Favorites' : 'Add to Favorites'}
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-destructive"
                onClick={() => handleDelete(query.id)}
              >
                <Trash2 className="h-4 w-4 mr-2" />
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
      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search queries..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="success">Success</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sortBy} onValueChange={setSortBy}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Sort by" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Most Recent</SelectItem>
                <SelectItem value="oldest">Oldest First</SelectItem>
                <SelectItem value="fastest">Fastest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="all" className="w-full">
        <TabsList>
          <TabsTrigger value="all">All Queries ({history.length})</TabsTrigger>
          <TabsTrigger value="favorites">
            <Star className="h-4 w-4 mr-2" />
            Favorites ({savedQueries.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="all" className="mt-4">
          <div className="space-y-4">
            {sortedHistory.length === 0 ? (
              <Card className="p-12 text-center">
                <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No queries yet</h3>
                <p className="text-muted-foreground mb-4">
                  Your query history will appear here
                </p>
                <Button onClick={() => router.push('/query')}>
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
          <div className="space-y-4">
            {savedQueries.length === 0 ? (
              <Card className="p-12 text-center">
                <Star className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No favorites yet</h3>
                <p className="text-muted-foreground">
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
