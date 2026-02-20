"use client";

import { useState } from 'react';
import {
  Plus,
  Calendar,
  Download,
  Eye,
  Trash2,
  MoreVertical,
  Clock,
  BarChart2,
  PieChart,
  LineChart,
  Grid,
  List,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface Report {
  id: string;
  title: string;
  description: string;
  type: 'sales' | 'inventory' | 'analytics' | 'custom';
  chartType: 'bar' | 'line' | 'pie';
  createdAt: Date;
  status: 'draft' | 'generated' | 'scheduled';
  schedule?: string;
}

const mockReports: Report[] = [
  {
    id: '1',
    title: 'Weekly Sales Report',
    description: 'Sales overview for the past week',
    type: 'sales',
    chartType: 'bar',
    createdAt: new Date(Date.now() - 86400000),
    status: 'generated',
  },
  {
    id: '2',
    title: 'Monthly Inventory Analysis',
    description: 'Stock levels and movement analysis',
    type: 'inventory',
    chartType: 'line',
    createdAt: new Date(Date.now() - 172800000),
    status: 'scheduled',
    schedule: 'Monthly',
  },
  {
    id: '3',
    title: 'Customer Analytics',
    description: 'Customer segmentation and behavior',
    type: 'analytics',
    chartType: 'pie',
    createdAt: new Date(Date.now() - 259200000),
    status: 'generated',
  },
];

const reportTemplates = [
  { id: 'daily-sales', title: 'Daily Sales Report', icon: BarChart2 },
  { id: 'weekly-inventory', title: 'Weekly Inventory', icon: LineChart },
  { id: 'monthly-analytics', title: 'Monthly Analytics', icon: PieChart },
];

export default function ReportsPage() {
  const [reports, setReports] = useState<Report[]>(mockReports);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newReport, setNewReport] = useState({
    title: '',
    description: '',
    chartType: 'bar',
  });

  const handleCreateReport = () => {
    const report: Report = {
      id: crypto.randomUUID(),
      title: newReport.title,
      description: newReport.description,
      type: 'custom',
      chartType: newReport.chartType as 'bar' | 'line' | 'pie',
      createdAt: new Date(),
      status: 'draft',
    };
    setReports([report, ...reports]);
    setIsCreateOpen(false);
    setNewReport({ title: '', description: '', chartType: 'bar' });
    toast.success('Report created successfully');
  };

  const handleDeleteReport = (id: string) => {
    setReports(reports.filter((r) => r.id !== id));
    toast.success('Report deleted');
  };

  const getChartIcon = (type: string) => {
    switch (type) {
      case 'bar':
        return BarChart2;
      case 'line':
        return LineChart;
      case 'pie':
        return PieChart;
      default:
        return BarChart2;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated':
        return 'bg-emerald-500/20 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30 backdrop-blur-sm';
      case 'scheduled':
        return 'bg-blue-500/20 dark:bg-blue-500/30 text-blue-700 dark:text-blue-300 border border-blue-500/30 backdrop-blur-sm';
      case 'draft':
        return 'bg-slate-500/20 dark:bg-slate-500/30 text-slate-700 dark:text-slate-300 border border-slate-500/30 backdrop-blur-sm';
      default:
        return 'bg-slate-500/20 dark:bg-slate-500/30 text-slate-700 dark:text-slate-300 border border-slate-500/30 backdrop-blur-sm';
    }
  };

  const getStatusDotColor = (status: string) => {
    switch (status) {
      case 'generated':
        return 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]';
      case 'scheduled':
        return 'bg-blue-500 shadow-[0_0_8px_rgba(59,130,246,0.6)]';
      case 'draft':
        return 'bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.6)]';
      default:
        return 'bg-slate-500 shadow-[0_0_8px_rgba(100,116,139,0.6)]';
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    }).format(date);
  };

  return (
    <div className="space-y-6 font-['Inter',_system-ui,_sans-serif]">
      {/* Header with Glassmorphism */}
      <div className="relative overflow-hidden rounded-3xl bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border border-white/20 dark:border-slate-700/50 shadow-2xl p-6">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 via-purple-500/10 to-pink-500/10 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20"></div>
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 shadow-xl">
                <BarChart2 className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-slate-900 via-indigo-900 to-purple-900 dark:from-white dark:via-indigo-200 dark:to-purple-200 bg-clip-text text-transparent">Reports</h2>
                <p className="text-slate-600 dark:text-slate-400 text-sm mt-1 font-medium">
                  Generate and manage your data reports
                </p>
              </div>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
              <DialogTrigger asChild>
                <Button className="rounded-full px-6 py-6 font-bold text-white shadow-[0_8px_30px_rgb(79,70,229,0.5)] hover:shadow-[0_8px_40px_rgb(79,70,229,0.7)] bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-700 hover:via-indigo-700 hover:to-purple-700 border-0 hover:scale-105 transition-all duration-300 relative overflow-hidden group">
                  <span className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></span>
                  <Plus className="h-5 w-5 mr-2 relative z-10" />
                  <span className="relative z-10">Create Report</span>
                </Button>
              </DialogTrigger>
          <DialogContent className="rounded-2xl border border-slate-200 dark:border-slate-800">
            <DialogHeader>
              <DialogTitle className="text-xl font-bold">Create New Report</DialogTitle>
              <DialogDescription className="text-slate-600 dark:text-slate-400">
                Configure your custom report settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title" className="text-sm font-medium text-slate-700 dark:text-slate-300">Report Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Weekly Sales Report"
                  value={newReport.title}
                  onChange={(e) =>
                    setNewReport({ ...newReport, title: e.target.value })
                  }
                  className="rounded-xl border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description" className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What does this report show?"
                  value={newReport.description}
                  onChange={(e) =>
                    setNewReport({ ...newReport, description: e.target.value })
                  }
                  className="rounded-xl border-slate-300 dark:border-slate-700 focus:border-indigo-500 dark:focus:border-indigo-500 min-h-[80px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chartType" className="text-sm font-medium text-slate-700 dark:text-slate-300">Chart Type</Label>
                <Select
                  value={newReport.chartType}
                  onValueChange={(v) =>
                    setNewReport({ ...newReport, chartType: v })
                  }
                >
                  <SelectTrigger className="rounded-xl border-slate-300 dark:border-slate-700">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="rounded-xl border-slate-200 dark:border-slate-800">
                    <SelectItem value="bar" className="rounded-lg">Bar Chart</SelectItem>
                    <SelectItem value="line" className="rounded-lg">Line Chart</SelectItem>
                    <SelectItem value="pie" className="rounded-lg">Pie Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-full font-medium hover:bg-slate-100 dark:hover:bg-slate-800">
                Cancel
              </Button>
              <Button onClick={handleCreateReport} disabled={!newReport.title} className="rounded-full font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 shadow-md hover:shadow-lg hover:scale-105 transition-all duration-200">
                Create Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
        </div>
        
        {/* Quick Insights */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-blue-50/80 to-indigo-50/80 dark:from-blue-950/30 dark:to-indigo-950/30 backdrop-blur-sm border border-blue-200/50 dark:border-blue-800/30 p-4 hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-blue-600 dark:text-blue-400 uppercase tracking-wider">Total Reports</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{reports.length}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 shadow-lg">
                <BarChart2 className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-50/80 to-teal-50/80 dark:from-emerald-950/30 dark:to-teal-950/30 backdrop-blur-sm border border-emerald-200/50 dark:border-emerald-800/30 p-4 hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 uppercase tracking-wider">Recently Generated</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{reports.filter(r => r.status === 'generated').length}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg">
                <Eye className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
          
          <div className="group relative overflow-hidden rounded-2xl bg-gradient-to-br from-purple-50/80 to-pink-50/80 dark:from-purple-950/30 dark:to-pink-950/30 backdrop-blur-sm border border-purple-200/50 dark:border-purple-800/30 p-4 hover:scale-[1.02] transition-all duration-300">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Scheduled</p>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{reports.filter(r => r.status === 'scheduled').length}</p>
              </div>
              <div className="p-3 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 shadow-lg">
                <Clock className="h-5 w-5 text-white" />
              </div>
            </div>
          </div>
        </div>
        </div>
      </div>

      {/* Templates */}
      <Card className="p-6 border-0 shadow-2xl bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5"></div>
        <div className="relative z-10">
          <div className="flex items-center gap-3 mb-6">
            <div className="h-2 w-2 rounded-full bg-gradient-to-r from-indigo-600 to-purple-600 animate-pulse"></div>
            <h3 className="font-bold text-xl text-slate-900 dark:text-white">Quick Templates</h3>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
            <button
              className="group relative overflow-hidden flex items-center gap-4 p-5 rounded-2xl border-2 border-blue-200/50 dark:border-blue-800/30 bg-gradient-to-br from-blue-50 via-sky-50 to-cyan-50 dark:from-blue-950/40 dark:via-sky-950/40 dark:to-cyan-950/40 hover:shadow-[0_0_30px_rgba(59,130,246,0.3)] hover:border-blue-400 dark:hover:border-blue-600 transition-all duration-300 hover:scale-[1.02] text-left"
              onClick={() => {
                setNewReport({ title: reportTemplates[0].title, description: '', chartType: 'bar' });
                setIsCreateOpen(true);
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-blue-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 p-3 rounded-xl bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg group-hover:shadow-blue-500/50 transition-all duration-300">
                <BarChart2 className="h-6 w-6 text-white" />
              </div>
              <span className="relative z-10 font-semibold text-base text-slate-900 dark:text-white">Daily Sales Report</span>
            </button>
            
            <button
              className="group relative overflow-hidden flex items-center gap-4 p-5 rounded-2xl border-2 border-purple-200/50 dark:border-purple-800/30 bg-gradient-to-br from-purple-50 via-violet-50 to-fuchsia-50 dark:from-purple-950/40 dark:via-violet-950/40 dark:to-fuchsia-950/40 hover:shadow-[0_0_30px_rgba(168,85,247,0.3)] hover:border-purple-400 dark:hover:border-purple-600 transition-all duration-300 hover:scale-[1.02] text-left"
              onClick={() => {
                setNewReport({ title: reportTemplates[1].title, description: '', chartType: 'bar' });
                setIsCreateOpen(true);
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-purple-400/10 to-fuchsia-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 p-3 rounded-xl bg-gradient-to-br from-purple-500 to-fuchsia-600 shadow-lg group-hover:shadow-purple-500/50 transition-all duration-300">
                <LineChart className="h-6 w-6 text-white" />
              </div>
              <span className="relative z-10 font-semibold text-base text-slate-900 dark:text-white">Weekly Inventory</span>
            </button>
            
            <button
              className="group relative overflow-hidden flex items-center gap-4 p-5 rounded-2xl border-2 border-emerald-200/50 dark:border-emerald-800/30 bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-50 dark:from-emerald-950/40 dark:via-teal-950/40 dark:to-cyan-950/40 hover:shadow-[0_0_30px_rgba(16,185,129,0.3)] hover:border-emerald-400 dark:hover:border-emerald-600 transition-all duration-300 hover:scale-[1.02] text-left"
              onClick={() => {
                setNewReport({ title: reportTemplates[2].title, description: '', chartType: 'bar' });
                setIsCreateOpen(true);
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/10 to-cyan-400/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative z-10 p-3 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 shadow-lg group-hover:shadow-emerald-500/50 transition-all duration-300">
                <PieChart className="h-6 w-6 text-white" />
              </div>
              <span className="relative z-10 font-semibold text-base text-slate-900 dark:text-white">Monthly Analytics</span>
            </button>
          </div>
        </div>
      </Card>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 rounded-xl bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center text-white font-bold text-lg shadow-lg shadow-indigo-500/50">
            <span className="relative z-10">{reports.length}</span>
            <div className="absolute inset-0 bg-gradient-to-br from-white/20 to-transparent rounded-xl"></div>
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900 dark:text-white">
              {reports.length === 1 ? 'Report' : 'Reports'}
            </p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Total available</p>
          </div>
        </div>
        <div className="flex items-center gap-2 p-1.5 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/50 dark:border-slate-700/50 shadow-lg">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'ghost'}
            size="icon"
            className={cn(
              "h-10 w-10 rounded-xl transition-all duration-300",
              viewMode === 'grid' && "bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/50 hover:from-indigo-700 hover:to-purple-700"
            )}
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'ghost'}
            size="icon"
            className={cn(
              "h-10 w-10 rounded-xl transition-all duration-300",
              viewMode === 'list' && "bg-gradient-to-br from-indigo-600 to-purple-600 shadow-lg shadow-indigo-500/50 hover:from-indigo-700 hover:to-purple-700"
            )}
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Reports Grid/List */}
      <div
        className={cn(
          'grid gap-5',
          viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
        )}
      >
        {reports.map((report) => {
          const ChartIcon = getChartIcon(report.chartType);
          return (
            <Card
              key={report.id}
              className={cn(
                'group relative p-6 hover:shadow-2xl transition-all duration-300 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl border-2 rounded-3xl overflow-hidden hover:scale-[1.02]',
                'before:absolute before:inset-0 before:rounded-3xl before:p-[2px] before:bg-gradient-to-br before:from-indigo-500 before:via-purple-500 before:to-pink-500 before:opacity-0 hover:before:opacity-100 before:transition-opacity before:duration-300 before:-z-10',
                viewMode === 'list' && 'flex items-center gap-6'
              )}
              style={{
                borderColor: 'rgba(203, 213, 225, 0.3)'
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/5 via-purple-500/5 to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
              <div
                className={cn(
                  'relative z-10 flex items-center justify-center rounded-2xl bg-gradient-to-br from-slate-100/50 to-slate-200/50 dark:from-slate-800/50 dark:to-slate-700/50 backdrop-blur-sm border border-slate-200/50 dark:border-slate-600/50 group-hover:from-indigo-100/50 group-hover:via-purple-100/50 group-hover:to-pink-100/50 dark:group-hover:from-indigo-900/50 dark:group-hover:via-purple-900/50 dark:group-hover:to-pink-900/50 transition-all duration-300 shadow-lg',
                  viewMode === 'grid' ? 'h-36 mb-5' : 'w-20 h-20 flex-shrink-0'
                )}
              >
                <ChartIcon className={cn('text-slate-600 dark:text-slate-300 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors drop-shadow-lg', viewMode === 'grid' ? 'h-16 w-16' : 'h-8 w-8')} />
              </div>
              <div className={cn('relative z-10 flex-1', viewMode === 'list' && 'flex items-center justify-between gap-4')}>
                <div className={cn(viewMode === 'list' && 'flex-1')}>
                  <div className="flex items-center gap-2.5 mb-2">
                    <h4 className="font-bold text-lg text-slate-900 dark:text-white">{report.title}</h4>
                    <Badge className={cn('text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5', getStatusColor(report.status))}>
                      <span className={cn('h-1.5 w-1.5 rounded-full animate-pulse', getStatusDotColor(report.status))}></span>
                      {report.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
                    {report.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs">
                    <span className="flex items-center gap-1.5 bg-slate-100/80 dark:bg-slate-800/80 backdrop-blur-sm px-3 py-1.5 rounded-full border border-slate-200/50 dark:border-slate-700/50">
                      <Calendar className="h-3.5 w-3.5" />
                      <span className="font-medium">{formatDate(report.createdAt)}</span>
                    </span>
                    {report.schedule && (
                      <span className="flex items-center gap-1.5 bg-indigo-100/80 dark:bg-indigo-950/80 backdrop-blur-sm text-indigo-700 dark:text-indigo-300 px-3 py-1.5 rounded-full border border-indigo-200/50 dark:border-indigo-800/50">
                        <Clock className="h-3.5 w-3.5" />
                        <span className="font-medium">{report.schedule}</span>
                      </span>
                    )}
                  </div>
                </div>
                <div className={cn('relative z-10 flex items-center gap-2', viewMode === 'grid' && 'mt-5')}>
                  <Button variant="outline" size="sm" className="rounded-xl font-semibold hover:bg-indigo-50 dark:hover:bg-indigo-950/50 hover:border-indigo-400 dark:hover:border-indigo-600 hover:scale-105 transition-all duration-200 text-xs backdrop-blur-sm">
                    <Eye className="h-4 w-4 mr-1.5" />
                    View
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-xl font-semibold hover:bg-emerald-50 dark:hover:bg-emerald-950/50 hover:border-emerald-400 dark:hover:border-emerald-600 hover:text-emerald-700 dark:hover:text-emerald-300 hover:scale-105 transition-all duration-200 text-xs backdrop-blur-sm">
                    <Download className="h-4 w-4 mr-1.5" />
                    Export
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="rounded-xl border-slate-200 dark:border-slate-800 shadow-lg">
                      <DropdownMenuItem className="rounded-lg cursor-pointer hover:bg-indigo-50 dark:hover:bg-indigo-900/20 text-sm">Edit</DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 text-sm">Duplicate</DropdownMenuItem>
                      <DropdownMenuItem className="rounded-lg cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-900/20 text-sm">Schedule</DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-red-600 dark:text-red-400 rounded-lg cursor-pointer hover:bg-red-50 dark:hover:bg-red-900/20 text-sm"
                        onClick={() => handleDeleteReport(report.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 mr-2" />
                        Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

