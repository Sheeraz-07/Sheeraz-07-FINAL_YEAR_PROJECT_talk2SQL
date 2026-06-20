'use client';

import React, { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Download, Printer, X, FileDown, DownloadCloud } from 'lucide-react';
import { Report, ReportSection, ChartType } from '@/types';
import { ReportVisualization } from './ReportVisualization';
import { exportReportToPDF } from '@/lib/report-pdf-export';
import { toast } from 'sonner';

interface ReportPreviewProps {
  report: Report;
  onClose?: () => void;
  onExport?: (format: 'pdf' | 'csv') => void;
}

interface ExportDialogState {
  isOpen: boolean;
  format: 'pdf' | null;
}

function renderMetrics(metrics: ReportSection['metrics']) {
  if (!metrics) return null;
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {metrics.map((metric, idx) => (
        <Card key={idx} className="p-3 border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/20">
          <p className="text-xs text-muted-foreground font-medium mb-1">{metric.label}</p>
          <div className="flex items-end justify-between gap-2">
            <p className="text-xl font-bold text-foreground">{metric.value}</p>
            {metric.trend && (
              <Badge
                variant="outline"
                className={`text-xs font-semibold ${
                  metric.trend === 'up'
                    ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400 border-green-300'
                    : metric.trend === 'down'
                      ? 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400 border-red-300'
                      : 'bg-slate-100 text-slate-800 dark:bg-slate-800 dark:text-slate-300'
                }`}
              >
                {metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'}{' '}
                {metric.trendValue ? `${Math.abs(metric.trendValue)}%` : 'No change'}
              </Badge>
            )}
          </div>
        </Card>
      ))}
    </div>
  );
}

function renderTableData(columns: string[] | undefined, data: Record<string, unknown>[]) {
  if (!columns || !data || data.length === 0) return null;
  const displayColumns = columns;

  const formatValue = (val: unknown) => {
    if (val === null || val === undefined) return '-';
    const str = String(val);
    // If it looks like a full timestamp (ISO or SQL), extract just the date part YYYY-MM-DD
    if (/^\d{4}-\d{2}-\d{2}[T ]\d{2}:\d{2}:\d{2}/.test(str)) {
      return str.substring(0, 10);
    }
    return str;
  };

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-950/50">
      <table className="w-full text-xs table-fixed">
        <thead>
          <tr className="bg-slate-100 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700">
            {displayColumns.map((col) => (
              <th key={col} className="px-3 py-2 text-left font-semibold text-foreground whitespace-normal break-words align-top">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {data.map((row, idx) => (
            <tr
              key={idx}
              className="border-b border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
            >
              {displayColumns.map((col) => (
                <td key={col} className="px-3 py-2 text-foreground whitespace-normal break-words align-top">
                  {formatValue(row[col])}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {data.length > 10 && (
        <div className="px-3 py-2 bg-slate-50 dark:bg-slate-900 text-xs text-muted-foreground border-t border-slate-200 dark:border-slate-700">
          Showing all {data.length} records
        </div>
      )}
    </div>
  );
}

/**
 * Export Dialog Component
 * Allows user to select layout style before exporting
 */
function ExportLayoutDialog({
  isOpen,
  format,
  report,
  onClose,
  onExport,
}: {
  isOpen: boolean;
  format: 'pdf' | null;
  report: Report;
  onClose: () => void;
  onExport: (layout: 'modern' | 'minimal') => Promise<void>;
}) {
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async (layout: 'modern' | 'minimal') => {
    setIsExporting(true);
    try {
      await onExport(layout);
      onClose();
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileDown className="h-5 w-5" />
            Choose Export Layout
          </DialogTitle>
          <DialogDescription>
            Select a layout style for your PDF export. You can choose between a modern professional design or a minimal tabular format.
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 py-3">
          {/* Modern Layout */}
          <button
            onClick={() => handleExport('modern')}
            disabled={isExporting}
            className="p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-600 hover:bg-indigo-50 dark:hover:bg-indigo-950/30 transition-all text-left group"
          >
            <div className="space-y-1.5">
              <h3 className="font-semibold text-foreground group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                Modern Professional
              </h3>
              <p className="text-sm text-muted-foreground">
                Clean enterprise dashboard styling with:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✓ Colored headers & metrics cards</li>
                <li>✓ Professional typography</li>
                <li>✓ Analytics-friendly layout</li>
              </ul>
            </div>
          </button>

          {/* Minimal Layout */}
          <button
            onClick={() => handleExport('minimal')}
            disabled={isExporting}
            className="p-3 rounded-lg border-2 border-slate-200 dark:border-slate-700 hover:border-green-400 dark:hover:border-green-600 hover:bg-green-50 dark:hover:bg-green-950/30 transition-all text-left group"
          >
            <div className="space-y-1.5">
              <h3 className="font-semibold text-foreground group-hover:text-green-600 dark:group-hover:text-green-400">
                Minimal Tabular
              </h3>
              <p className="text-sm text-muted-foreground">
                Compact, printer-friendly format:
              </p>
              <ul className="text-xs text-muted-foreground space-y-1">
                <li>✓ Simple table-based layout</li>
                <li>✓ Lightweight & compact</li>
                <li>✓ Dense tabular presentation</li>
              </ul>
            </div>
          </button>
        </div>

        <div className="flex justify-end gap-2 pt-3 border-t border-slate-200 dark:border-slate-700">
          <Button variant="outline" onClick={onClose} disabled={isExporting}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export function ReportPreview({ report, onClose, onExport }: ReportPreviewProps) {
  const reportDate = new Date(report.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const [exportDialog, setExportDialog] = useState<ExportDialogState>({ isOpen: false, format: null });

  const handleExportClick = (format: 'pdf') => {
    setExportDialog({ isOpen: true, format });
  };

  const handleExportWithLayout = async (layout: 'modern' | 'minimal') => {
    if (!exportDialog.format) return;

    const toastId = toast.loading('📄 Generating PDF...');
    try {
      await exportReportToPDF(report, layout);
      toast.dismiss(toastId);
      toast.success('✅ PDF exported successfully');
    } catch (error) {
      toast.dismiss(toastId);
      const message = error instanceof Error ? error.message : 'Export failed';
      toast.error(`❌ Export failed: ${message}`);
      console.error('Export error:', error);
    }
  };

  const handleDownloadFullData = async () => {
    if (!report.rawData || report.rawData.length === 0) {
      toast.error('Data is no longer available. Please generate a new report to download.');
      return;
    }

    const toastId = toast.loading('Preparing CSV download...');
    try {
      const rawData = report.rawData;

      // Convert to CSV
      const columns = Object.keys(rawData[0]);
      const header = columns.join(',');
      const rows = rawData.map((row: any) =>
        columns.map((c) => `"${String(row[c] ?? '').replace(/"/g, '""')}"`).join(',')
      );

      const csvContent = [header, ...rows].join('\n');
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);

      const link = document.createElement('a');
      link.setAttribute('href', url);
      link.setAttribute('download', `${report.title.replace(/\s+/g, '_')}_raw_data.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      toast.dismiss(toastId);
      toast.success('CSV downloaded successfully');
    } catch (err: any) {
      console.error('Error downloading CSV:', err);
      toast.dismiss(toastId);
      toast.error(`Failed to generate CSV download: ${err.message || 'Unknown error'}`);
    }
  };

  const hasData = report.rawData && report.rawData.length > 0;

  return (
    <>
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="space-y-1.5 flex-1">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">{report.title}</h1>
            <Badge className="w-fit text-xs font-semibold py-1 px-3 bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-300 border-0">
              {report.reportType.replace('_', ' ').toUpperCase()}
            </Badge>
          </div>
          {report.description && <p className="text-muted-foreground text-sm leading-relaxed">{report.description}</p>}
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 pt-1 text-xs text-muted-foreground">
            <span>Generated: {reportDate}</span>
            {report.metadata?.dateRange && (
              <span>
                Period: {new Date(report.metadata.dateRange.from).toLocaleDateString()} -{' '}
                {new Date(report.metadata.dateRange.to).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap items-center gap-2 w-full lg:w-auto">
          {hasData ? (
            <Button 
              onClick={handleDownloadFullData}
              variant="default"
              size="sm"
              className="w-full lg:w-auto rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-semibold h-9 px-3"
            >
              <DownloadCloud className="w-4 h-4 mr-2" />
              Download Full CSV
            </Button>
          ) : (
            <span className="text-sm text-amber-600 dark:text-amber-400 font-medium px-2 py-1 bg-amber-50 dark:bg-amber-900/20 rounded">
              Data available in active session only
            </span>
          )}
          <Button
            size="sm"
            variant="outline"
            onClick={() => window.print()}
            className="h-9 px-3 rounded-lg"
          >
            <Printer className="h-4 w-4 mr-1.5" />
            Print
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                size="sm"
                variant="outline"
                className="h-9 px-3 rounded-lg"
              >
                <Download className="h-4 w-4 mr-1.5" />
                Export
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="rounded-lg w-56">
              <DropdownMenuLabel>Choose Format</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => handleExportClick('pdf')}
                className="rounded-md cursor-pointer text-sm"
              >
                <FileDown className="h-3.5 w-3.5 mr-2" />
                <span>PDF Report</span>
                <span className="ml-auto text-xs text-muted-foreground">2 styles</span>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onExport?.('csv')}
                className="rounded-md cursor-pointer text-sm"
              >
                <Download className="h-3.5 w-3.5 mr-2" />
                <span>CSV Data</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
          {onClose && (
            <Button
              size="sm"
              variant="outline"
              onClick={onClose}
              className="h-9 w-9 p-0 rounded-lg"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* Metadata Summary */}
      <Card className="p-3 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-slate-200 dark:border-slate-700">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-sm">
          <div>
            <span className="text-muted-foreground">Database:</span>
            <p className="font-semibold text-foreground">{report.metadata.database}</p>
          </div>
          <div>
            <span className="text-muted-foreground">Records:</span>
            <p className="font-semibold text-foreground">{report.rowCount || 0}</p>
          </div>
          {report.executionTime && (
            <div>
              <span className="text-muted-foreground">Query Time:</span>
              <p className="font-semibold text-foreground">{report.executionTime.toFixed(2)}s</p>
            </div>
          )}
          {report.metadata?.suggestedLayout && (
            <div>
              <span className="text-muted-foreground">Suggested Layout:</span>
              <p className="font-semibold text-foreground capitalize">{report.metadata.suggestedLayout}</p>
            </div>
          )}
        </div>
      </Card>

      {/* Sections */}
      <div className="space-y-6">
          {report.sections.map((section) => (
            <div key={section.id} className="space-y-3 page-break">
              {/* Section Header */}
              <div className="border-l-4 border-indigo-600 pl-3">
                <h2 className="text-xl font-bold text-slate-900 dark:text-white">{section.title}</h2>
                {section.description && <p className="text-muted-foreground text-sm mt-1">{section.description}</p>}
              </div>

              {/* Section Content */}
              {section.type === 'metrics' && renderMetrics(section.metrics)}

              {section.type === 'chart' && section.chartType && section.data && (
                <ReportVisualization
                  title={section.title}
                  description={section.description}
                  chartType={section.chartType}
                  data={section.data}
                  xAxis={section.chartType === 'pie' ? undefined : Object.keys(section.data[0] || {})[0]}
                  yAxis={section.chartType === 'pie' ? undefined : Object.keys(section.data[0] || {})[1]}
                  labels={section.chartType === 'pie' ? Object.keys(section.data[0] || {})[0] : undefined}
                  values={section.chartType === 'pie' ? Object.keys(section.data[0] || {})[1] : undefined}
                />
              )}

              {section.type === 'visualization' && section.chartConfig && section.data && (
                <ReportVisualization
                  title={section.title}
                  description={section.description}
                  chartType={section.chartConfig.type as ChartType}
                  data={section.data}
                  xAxis={section.chartConfig.xAxis as string}
                  yAxis={section.chartConfig.yAxis as string}
                />
              )}

              {section.type === 'table' && renderTableData(section.columns, section.data)}

              {section.type === 'summary' && section.summary && (
                <Card className="p-4 bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800">
                  <div className="prose dark:prose-invert max-w-none">
                    <p className="text-foreground text-sm whitespace-pre-wrap">{section.summary}</p>
                  </div>
                </Card>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="mt-8 pt-4 border-t border-slate-200 dark:border-slate-700 text-xs text-muted-foreground text-center">
          <p>
            Generated by Talk2SQL on {reportDate} · Database: {report.metadata.database}
          </p>
        </div>
      </div>

      {/* Export Dialog */}
      <ExportLayoutDialog
        isOpen={exportDialog.isOpen}
        format={exportDialog.format}
        report={report}
        onClose={() => setExportDialog({ isOpen: false, format: null })}
        onExport={handleExportWithLayout}
      />
    </>
  );
}
