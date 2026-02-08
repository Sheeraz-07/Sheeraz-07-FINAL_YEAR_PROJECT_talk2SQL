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
        return 'bg-success/10 text-success';
      case 'scheduled':
        return 'bg-primary/10 text-primary';
      case 'draft':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
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
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold mb-1">Reports</h2>
          <p className="text-muted-foreground">
            Generate and manage your data reports
          </p>
        </div>
        <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Report
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Report</DialogTitle>
              <DialogDescription>
                Configure your custom report settings
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="title">Report Title</Label>
                <Input
                  id="title"
                  placeholder="e.g., Weekly Sales Report"
                  value={newReport.title}
                  onChange={(e) =>
                    setNewReport({ ...newReport, title: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  placeholder="What does this report show?"
                  value={newReport.description}
                  onChange={(e) =>
                    setNewReport({ ...newReport, description: e.target.value })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="chartType">Chart Type</Label>
                <Select
                  value={newReport.chartType}
                  onValueChange={(v) =>
                    setNewReport({ ...newReport, chartType: v })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="bar">Bar Chart</SelectItem>
                    <SelectItem value="line">Line Chart</SelectItem>
                    <SelectItem value="pie">Pie Chart</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsCreateOpen(false)}>
                Cancel
              </Button>
              <Button onClick={handleCreateReport} disabled={!newReport.title}>
                Create Report
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Templates */}
      <Card className="p-6">
        <h3 className="font-semibold mb-4">Quick Templates</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {reportTemplates.map((template) => (
            <button
              key={template.id}
              className="flex items-center gap-3 p-4 rounded-lg border border-border hover:border-primary hover:bg-accent transition-all text-left"
              onClick={() => {
                setNewReport({ title: template.title, description: '', chartType: 'bar' });
                setIsCreateOpen(true);
              }}
            >
              <div className="p-2 rounded-lg bg-primary/10">
                <template.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="font-medium">{template.title}</span>
            </button>
          ))}
        </div>
      </Card>

      {/* View Toggle */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {reports.length} reports
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('grid')}
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="icon"
            className="h-8 w-8"
            onClick={() => setViewMode('list')}
          >
            <List className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Reports Grid/List */}
      <div
        className={cn(
          'grid gap-4',
          viewMode === 'grid' ? 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3' : 'grid-cols-1'
        )}
      >
        {reports.map((report) => {
          const ChartIcon = getChartIcon(report.chartType);
          return (
            <Card
              key={report.id}
              className={cn(
                'p-6 hover:shadow-lg transition-shadow',
                viewMode === 'list' && 'flex items-center gap-6'
              )}
            >
              <div
                className={cn(
                  'flex items-center justify-center rounded-xl bg-secondary/50',
                  viewMode === 'grid' ? 'h-32 mb-4' : 'w-16 h-16 flex-shrink-0'
                )}
              >
                <ChartIcon className={cn('text-muted-foreground', viewMode === 'grid' ? 'h-12 w-12' : 'h-6 w-6')} />
              </div>
              <div className={cn('flex-1', viewMode === 'list' && 'flex items-center justify-between gap-4')}>
                <div className={cn(viewMode === 'list' && 'flex-1')}>
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="font-semibold">{report.title}</h4>
                    <Badge className={cn('text-xs', getStatusColor(report.status))}>
                      {report.status}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {report.description}
                  </p>
                  <div className="flex items-center gap-3 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(report.createdAt)}
                    </span>
                    {report.schedule && (
                      <span className="flex items-center gap-1">
                        <Clock className="h-3 w-3" />
                        {report.schedule}
                      </span>
                    )}
                  </div>
                </div>
                <div className={cn('flex items-center gap-2', viewMode === 'grid' && 'mt-4')}>
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    View
                  </Button>
                  <Button variant="outline" size="sm">
                    <Download className="h-4 w-4 mr-2" />
                    Export
                  </Button>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem>Edit</DropdownMenuItem>
                      <DropdownMenuItem>Duplicate</DropdownMenuItem>
                      <DropdownMenuItem>Schedule</DropdownMenuItem>
                      <DropdownMenuItem
                        className="text-destructive"
                        onClick={() => handleDeleteReport(report.id)}
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
        })}
      </div>
    </div>
  );
}
