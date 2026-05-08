"use client";

import { useState, useMemo } from 'react';
import {
  Calendar,
  Download,
  Eye,
  Trash2,
  MoreVertical,
  BarChart2,
  FileText,
  Grid,
  List,
  SearchX,
  Filter,
} from 'lucide-react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { useLocalStorage } from '@/hooks/useLocalStorage';
import { useQueryStore } from '@/stores/queryStore';
import { useAuthStore } from '@/stores/authStore';
import { Report, ReportType } from '@/types';
import { ReportGenerator } from '@/components/reports/ReportGenerator';
import { ReportPreview } from '@/components/reports/ReportPreview';
import { ReportGenerationProgressBar } from '@/components/reports/ReportGenerationProgressBar';
import { exportReportToPDF } from '@/lib/report-pdf-export';

export default function ReportsPage() {
  const selectedDatabase = useQueryStore((state) => state.selectedDatabase);
  const authUser = useAuthStore((state) => state.user);
  const [reports, setReports] = useLocalStorage<Report[]>('report-storage', []);
  const [reportCache, setReportCache] = useState<Record<string, Report>>({});
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [isViewOpen, setIsViewOpen] = useState(false);
  const [activeReport, setActiveReport] = useState<Report | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationStatus, setGenerationStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedType, setSelectedType] = useState<ReportType | 'all'>('all');

  const reportTypes: Array<{ value: ReportType | 'all'; label: string }> = [
    { value: 'all', label: 'All Reports' },
    { value: 'sales', label: 'Sales' },
    { value: 'attendance', label: 'Attendance' },
    { value: 'inventory', label: 'Inventory' },
    { value: 'production', label: 'Production' },
    { value: 'hr_analytics', label: 'HR Analytics' },
    { value: 'financial', label: 'Financial' },
    { value: 'custom', label: 'Custom' },
  ];

  const filteredReports = useMemo(() => {
    return reports.filter((report) => {
      const matchesSearch =
        report.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (report.description?.toLowerCase().includes(searchQuery.toLowerCase()) ?? false);
      const matchesType = selectedType === 'all' || report.reportType === selectedType;
      return matchesSearch && matchesType;
    });
  }, [reports, searchQuery, selectedType]);

  const toStoredReport = (report: Report): Report => {
    const lightweightSections = report.sections.map((section) => {
      if (section.type !== 'table') return section;
      return {
        ...section,
        data: [],
        description: `${section.description || 'Table data'} (stored as lightweight history item)`,
      };
    });

    return {
      ...report,
      sections: lightweightSections,
      rawData: [],
    };
  };

  const resolveFullReport = (report: Report): Report => {
    return reportCache[report.id] || report;
  };

  const handleReportGenerated = (newReport: Report) => {
    if (!newReport || !newReport.id) {
      console.error('Invalid report:', newReport);
      setGenerationStatus('error');
      setIsGenerating(false);
      toast.error('Report generation failed: Invalid report data');
      return;
    }

    setReportCache((prev) => ({ ...prev, [newReport.id]: newReport }));
    setReports([toStoredReport(newReport), ...reports]);
    setIsGenerating(false);
    setGenerationStatus('success');
    
    // Reset status after 2 seconds
    setTimeout(() => {
      setGenerationStatus('idle');
    }, 2000);
  };

  const handleDeleteReport = (id: string) => {
    setReports(reports.filter((r) => r.id !== id));
    toast.success('Report deleted');
  };

  const handleViewReport = (report: Report) => {
    const fullReport = resolveFullReport(report);
    setActiveReport(fullReport);
    setIsViewOpen(true);
  };

  const handleExportReport = (report: Report, format: 'csv' = 'csv') => {
    const fullReport = resolveFullReport(report);

    if (!fullReport.rawData || !fullReport.rawData.length) {
      toast.error('This report has no data to export');
      return;
    }

    const columns = fullReport.columns || Object.keys(fullReport.rawData[0]);

    if (format === 'csv') {
      const escapeCSV = (value: unknown) => {
        const str = String(value ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
          return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
      };

      const metadataRows = [
        ['Report Title', fullReport.title],
        ['Description', fullReport.description || ''],
        ['Report Type', fullReport.reportType.replace(/_/g, ' ')],
        ['Generated At', fullReport.createdAt],
        ['Database', fullReport.metadata?.database || ''],
        ['Generated By', fullReport.metadata?.generatedBy || 'System'],
        ['Total Records', String(fullReport.rowCount || fullReport.rawData.length)],
        ['Query Time (s)', String(fullReport.executionTime || 0)],
      ];

      const lines = [
        'REPORT METADATA',
        ...metadataRows.map(([label, value]) => `${escapeCSV(label)},${escapeCSV(value)}`),
        '',
        'DATA',
        columns.join(','),
        ...fullReport.rawData.map((row) => columns.map((col) => escapeCSV(row[col])).join(',')),
      ];

      const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${fullReport.title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.csv`;
      link.click();
      URL.revokeObjectURL(url);
      toast.success('Report exported as CSV');
    }
  };

  const handleExportReportPDF = async (report: Report) => {
    try {
      const fullReport = resolveFullReport(report);
      toast.loading('Generating PDF... This may take a moment.');
      await exportReportToPDF(fullReport, fullReport.metadata?.suggestedLayout || 'modern');
      toast.dismiss();
      toast.success('Report exported as PDF successfully!');
    } catch (error) {
      console.error('PDF export error:', error);
      toast.dismiss();
      toast.error('PDF export failed. Please try another format.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'generated':
        return 'bg-emerald-500/20 dark:bg-emerald-500/30 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30';
      case 'draft':
        return 'bg-slate-500/20 dark:bg-slate-500/30 text-slate-700 dark:text-slate-300 border border-slate-500/30';
      case 'error':
        return 'bg-red-500/20 dark:bg-red-500/30 text-red-700 dark:text-red-300 border border-red-500/30';
      default:
        return 'bg-slate-500/20 dark:bg-slate-500/30 text-slate-700 dark:text-slate-300 border border-slate-500/30';
    }
  };

  const getTypeColor = (type: ReportType) => {
    switch (type) {
      case 'sales':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'attendance':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'inventory':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300';
      case 'production':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900/30 dark:text-orange-300';
      case 'hr_analytics':
        return 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300';
      case 'financial':
        return 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300';
      default:
        return 'bg-slate-100 text-slate-800 dark:bg-slate-900/30 dark:text-slate-300';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    }).format(new Date(dateStr));
  };

  return (
    <>
      <ReportGenerationProgressBar
        isGenerating={isGenerating}
        status={generationStatus}
        message={
          generationStatus === 'success'
            ? '✅ Report generated successfully!'
            : generationStatus === 'error'
              ? '❌ Report generation failed'
              : 'Generating report with visualizations and analysis...'
        }
      />

      <div className="space-y-6">
      {/* Header */}
      <div className="relative overflow-hidden rounded-[2rem] bg-white dark:bg-slate-950 text-slate-900 dark:text-white shadow-2xl border border-slate-200/60 dark:border-white/10 p-8 md:p-10">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/6 to-cyan-400/6 dark:from-indigo-500/20 dark:via-purple-500/20 dark:to-pink-500/20"></div>
        <div className="relative z-10">
          <div className="flex flex-col xl:flex-row xl:items-start xl:justify-between gap-6 mb-6">
            <div className="flex items-start gap-4">
              <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-500 to-cyan-500 dark:from-cyan-500 dark:via-blue-600 dark:to-indigo-600 shadow-xl">
                <FileText className="h-7 w-7 text-white" />
              </div>
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight text-slate-900 dark:text-white">
                  Reports
                </h2>
                <p className="text-slate-700 dark:text-slate-300 text-sm mt-2 font-medium max-w-2xl">
                  Generate professional reports with visualizations, insights, and detailed analysis
                </p>
              </div>
            </div>
            <div className="flex-shrink-0">
              <ReportGenerator onReportGenerated={handleReportGenerated} isGenerating={isGenerating} />
            </div>
          </div>

          {/* Quick Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-6">
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/50 shadow">
              <p className="text-xs font-semibold text-cyan-600 dark:text-cyan-300 uppercase tracking-[0.2em]">Total Reports</p>
              <p className="text-3xl font-bold text-foreground mt-2">{reports.length}</p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/50 shadow">
              <p className="text-xs font-semibold text-emerald-600 dark:text-emerald-300 uppercase tracking-[0.2em]">Generated</p>
              <p className="text-3xl font-bold text-foreground mt-2">
                {reports.filter((r) => r.status === 'generated').length}
              </p>
            </div>
            <div className="p-5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/60 dark:border-slate-700/50 shadow">
              <p className="text-xs font-semibold text-violet-600 dark:text-violet-300 uppercase tracking-[0.2em]">Database</p>
              <p className="text-3xl font-bold text-foreground mt-2 capitalize">
                {selectedDatabase === 'sql_server' ? 'SQL Server' : 'Supabase'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Filters and Search */}
      <div className="space-y-4 rounded-2xl border border-slate-200/70 dark:border-slate-700/70 bg-white/80 dark:bg-slate-900/70 backdrop-blur-xl p-4 md:p-5 shadow-lg">
        <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          <div className="flex-1 relative">
            <Input
              placeholder="Search reports by title or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 rounded-xl border-slate-200 dark:border-slate-700 bg-white/90 dark:bg-slate-950/60"
            />
            <SearchX className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="gap-2 rounded-xl bg-white/80 dark:bg-slate-950/60">
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">
                  {selectedType === 'all' ? 'All Types' : selectedType.replace('_', ' ')}
                </span>
                <span className="sm:hidden">Filter</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-xl">
              {reportTypes.map((type) => (
                <DropdownMenuItem
                  key={type.value}
                  onClick={() => setSelectedType(type.value)}
                  className={cn(
                    'rounded-lg cursor-pointer',
                    selectedType === type.value && 'bg-indigo-50 dark:bg-indigo-900/30'
                  )}
                >
                  <span className="flex items-center gap-2">
                    {selectedType === type.value && <div className="h-2 w-2 rounded-full bg-indigo-600" />}
                    {type.label}
                  </span>
                </DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>

          <div className="flex items-center gap-2 p-1.5 bg-slate-100/90 dark:bg-slate-900/80 backdrop-blur-xl rounded-xl border border-slate-200/70 dark:border-slate-700/50">
            <Button
              variant={viewMode === 'grid' ? 'default' : 'ghost'}
              size="icon"
              className={cn(
                'h-9 w-9 rounded-md transition-all',
                viewMode === 'grid' && 'bg-indigo-600 text-white'
              )}
              onClick={() => setViewMode('grid')}
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'default' : 'ghost'}
              size="icon"
              className={cn(
                'h-9 w-9 rounded-md transition-all',
                viewMode === 'list' && 'bg-indigo-600 text-white'
              )}
              onClick={() => setViewMode('list')}
            >
              <List className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>

      {/* Reports Grid/List */}
      {filteredReports.length > 0 ? (
        <div
          className={cn(
            'gap-5',
            viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3' : 'space-y-4'
          )}
        >
          {filteredReports.map((report) => {
            const displayType = (report.reportType || 'custom') as ReportType;
            
            return (
            <Card
              key={report.id}
              className={cn(
                'group relative overflow-hidden hover:shadow-2xl transition-all duration-300 bg-white/85 dark:bg-slate-900/80 backdrop-blur-sm border-slate-200 dark:border-slate-700 rounded-xl p-3',
                viewMode === 'list' && 'flex items-center gap-3 p-3'
              )}
            >
              <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-indigo-500 via-cyan-500 to-emerald-500 opacity-80" />
              <div
                className={cn(
                  'rounded-lg bg-gradient-to-br p-2 text-white shadow-md group-hover:shadow-lg transition-shadow flex items-center justify-center',
                  displayType === 'sales' && 'from-blue-500 to-blue-600',
                  displayType === 'attendance' && 'from-green-500 to-emerald-600',
                  displayType === 'inventory' && 'from-purple-500 to-purple-600',
                  displayType === 'production' && 'from-orange-500 to-orange-600',
                  displayType === 'hr_analytics' && 'from-pink-500 to-pink-600',
                  displayType === 'financial' && 'from-indigo-500 to-indigo-600',
                  displayType === 'custom' && 'from-slate-500 to-slate-600',
                  viewMode === 'list' && 'h-10 w-10 flex-shrink-0'
                )}
              >
                <BarChart2 className="h-5 w-5" />
              </div>

              <div className={cn('flex-1', viewMode === 'list' && 'min-w-0')}>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-semibold text-lg text-foreground line-clamp-2">{report.title}</h3>
                    {report.description && (
                      <p className="text-xs text-muted-foreground line-clamp-2 mt-1 leading-5">
                        {report.description}
                      </p>
                    )}
                  </div>
                  <Badge className={cn('text-[11px] font-semibold py-0.5 px-2 flex-shrink-0', getTypeColor(displayType))}>
                    {displayType.replace('_', ' ')}
                  </Badge>
                </div>

                <div className="flex items-center gap-2 mt-3 flex-wrap">
                  <Badge
                    variant="outline"
                    className={cn('text-[11px] font-semibold capitalize px-2 py-0.5', getStatusColor(report.status))}
                  >
                    {report.status}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(report.createdAt)}
                  </span>
                  {report.rowCount && (
                    <span className="text-xs text-muted-foreground">{report.rowCount} rows</span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-1 flex-shrink-0">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleViewReport(report)}
                  className="h-7 px-2 rounded-md hover:bg-indigo-50 dark:hover:bg-indigo-950/50"
                  title="View Report"
                >
                  <Eye className="h-4 w-4" />
                </Button>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 px-2 rounded-md hover:bg-emerald-50 dark:hover:bg-emerald-950/50"
                      title="Export Report"
                    >
                      <Download className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start" className="rounded-lg">
                    <DropdownMenuItem
                      onClick={() => handleExportReportPDF(report)}
                      className="rounded-md cursor-pointer text-sm"
                    >
                      <Download className="h-3.5 w-3.5 mr-2" />
                      Export as PDF
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={() => handleExportReport(report, 'csv')}
                      className="rounded-md cursor-pointer text-sm"
                    >
                      <Download className="h-3.5 w-3.5 mr-2" />
                      Export as CSV
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-7 w-7 rounded-md hover:bg-slate-100 dark:hover:bg-slate-800"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-lg">
                    <DropdownMenuItem
                      onClick={() => handleDeleteReport(report.id)}
                      className="text-red-600 dark:text-red-400 rounded-md cursor-pointer text-sm"
                    >
                      <Trash2 className="h-3.5 w-3.5 mr-2" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </Card>
            );
          })}
        </div>
      ) : (
        <Card className="p-12 text-center bg-white/80 dark:bg-slate-900/70 border-slate-200 dark:border-slate-700 rounded-2xl shadow-lg">
          <div className="space-y-4 max-w-md mx-auto">
              <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-md">
                <FileText className="h-6 w-6" />
              </div>
            <div>
              <p className="font-semibold text-foreground text-lg">No reports found</p>
              <p className="text-sm text-muted-foreground mt-2 leading-6">
                {searchQuery || selectedType !== 'all'
                  ? 'Try adjusting your search or filters to surface more reports.'
                  : 'Create your first report to start building a searchable report history.'}
              </p>
            </div>
          </div>
        </Card>
      )}

      {/* Report Preview Modal */}
      <Dialog open={isViewOpen} onOpenChange={setIsViewOpen}>
        <DialogContent className="max-w-6xl max-h-[92vh] overflow-y-auto rounded-2xl border-slate-200 dark:border-slate-700 p-0">
          <DialogHeader className="px-6 pt-6 pb-0">
            <DialogTitle className="text-2xl">Report Preview</DialogTitle>
          </DialogHeader>

          {activeReport && (
            <div className="mt-4 px-6 pb-6">
              <ReportPreview
                report={activeReport}
                onClose={() => setIsViewOpen(false)}
                onExport={(format) => {
                  if (format === 'pdf') {
                    handleExportReportPDF(activeReport);
                  } else if (format === 'csv') {
                    handleExportReport(activeReport, 'csv');
                  }
                }}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
    </>
  );
}
