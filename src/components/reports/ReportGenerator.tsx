'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Plus, Sparkles, Zap, BarChart3 } from 'lucide-react';
import { Report, ReportType } from '@/types';
import { useQueryStore } from '@/stores/queryStore';
import { useAuthStore } from '@/stores/authStore';
import { analyzeDataForReport } from '@/lib/report-generator-advanced';
import { generateReportMetadata } from '@/lib/report-metadata-generator';

interface ReportGeneratorProps {
  onReportGenerated?: (report: Report) => void;
  isGenerating?: boolean;
}

/**
 * AI-Driven Report Generator
 * 
 * Fully automated report generation with intelligent metadata extraction.
 * Users simply describe what they want, and the AI handles:
 * - SQL query generation
 * - Data retrieval
 * - Title/description generation
 * - Report structure and styling
 */
export function ReportGenerator({ onReportGenerated, isGenerating = false }: ReportGeneratorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [userQuery, setUserQuery] = useState('');
  const [localLoading, setLocalLoading] = useState(false);

  const selectedDatabase = useQueryStore((state) => state.selectedDatabase);
  const token = useAuthStore((state) => state.token);
  const authUser = useAuthStore((state) => state.user);

  const isCurrentlyGenerating = isGenerating || localLoading;

  const handleGenerateReport = async () => {
    if (!userQuery.trim()) {
      toast.error('Please describe what report you want to generate');
      return;
    }

    setLocalLoading(true);
    await generateReport(userQuery.trim());
    setLocalLoading(false);
  };

  const generateReport = async (query: string) => {
    const reportId = crypto.randomUUID();
    const createdAt = new Date().toISOString();

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
      
      // Check if backend is reachable
      try {
        await fetch(`${apiUrl}/`, { 
          method: 'GET',
          signal: AbortSignal.timeout(5000)
        }).catch(() => null);
      } catch (e) {
        throw new Error(`Backend not reachable at ${apiUrl}. Is the server running?`);
      }

      const headers: Record<string, string> = { 'Content-Type': 'application/json' };
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }

      toast.loading('🔄 Processing your query...');

      // Step 1: Send natural language query to backend
      const response = await fetch(`${apiUrl}/api/query`, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          user_id: String(authUser?.user_id ?? 1),
          session_id: crypto.randomUUID(),
          query: query.trim(),
          database: selectedDatabase || 'supabase',
        }),
      });

      const payload = await response.json().catch(() => null);
      
      if (!response.ok) {
        const errorMsg = payload?.error || payload?.detail || `HTTP ${response.status}`;
        throw new Error(errorMsg);
      }

      if (payload?.status === 'error') {
        throw new Error(payload?.error || 'Backend returned an error');
      }

      // Validate response
      if (!payload?.data || !Array.isArray(payload.data)) {
        throw new Error('No data returned from query. Please try a different query.');
      }

      if (payload.data.length === 0) {
        throw new Error('Query returned no results. Please adjust your search criteria.');
      }

      const fullData = payload.data as Record<string, unknown>[];
      const columns = (payload.columns || []) as string[];
      const analysisSampleSize = 600;
      const analysisData = fullData.length > analysisSampleSize
        ? fullData.slice(0, analysisSampleSize)
        : fullData;

      toast.loading(`📊 Analyzing ${analysisData.length} sampled rows and preparing ${fullData.length} total rows for export...`);

      // Step 2: Analyze data with AI-like intelligence
      const analysisResult = analyzeDataForReport(
        analysisData,
        columns,
        'custom'
      );

      // Keep full table data for report preview/export while using sampled analysis for speed
      const sectionsWithFullTable = analysisResult.sections.map((section) => {
        if (section.type !== 'table') return section;
        return {
          ...section,
          data: fullData,
          columns,
          description: `Complete dataset from query (${fullData.length} rows)`,
        };
      });

      // Step 3: Generate intelligent metadata from query and data
      const metadata = generateReportMetadata(
        query,
        fullData,
        columns
      );

      const generatedReport: Report = {
        id: reportId,
        title: metadata.title,
        description: metadata.description,
        reportType: metadata.reportType as ReportType,
        sections: sectionsWithFullTable,
        metadata: {
          generatedAt: createdAt,
          database: selectedDatabase || 'supabase',
          generatedBy: authUser?.username || 'System',
          dateRange: metadata.dateRange,
          suggestedLayout: metadata.suggestedLayout,
        },
        sql: payload.sql || '',
        rawData: fullData,
        columns,
        rowCount: payload.row_count || fullData.length || 0,
        executionTime: payload.execution_time || 0,
        createdAt,
        status: 'generated',
        tags: [metadata.reportType],
      };

      onReportGenerated?.(generatedReport);
      setIsOpen(false);
      resetForm();
      toast.dismiss();
      toast.success(`✅ Report generated! ${generatedReport.rowCount} records analyzed.`);
    } catch (err) {
      toast.dismiss();
      const message = err instanceof Error ? err.message : 'Failed to generate report';
      console.error('Report generation error:', err);
      toast.error(`Report generation failed: ${message}`);
    }
  };

  const resetForm = () => {
    setUserQuery('');
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) resetForm();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          className="gap-2 rounded-full font-semibold bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 border-0 shadow-lg hover:shadow-xl hover:scale-105 transition-all duration-200 h-10 px-5"
        >
          <Plus className="h-4 w-4" />
          <span className="hidden sm:inline">Generate Report</span>
          <span className="sm:hidden">New Report</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-indigo-600" />
            AI-Powered Report Generator
          </DialogTitle>
          <DialogDescription>
            Describe what report you want to generate. The AI will automatically determine the best structure, title, and formatting.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 py-3">
          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-blue-50 dark:bg-blue-950/30">
              <BarChart3 className="h-4 w-4 text-blue-600 dark:text-blue-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-blue-900 dark:text-blue-200">Automatic Structure</p>
                <p className="text-blue-700 dark:text-blue-300">AI determines layout</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-green-50 dark:bg-green-950/30">
              <Zap className="h-4 w-4 text-green-600 dark:text-green-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-green-900 dark:text-green-200">Smart Metadata</p>
                <p className="text-green-700 dark:text-green-300">Title & description auto-generated</p>
              </div>
            </div>
            <div className="flex items-start gap-2 p-2.5 rounded-lg bg-purple-50 dark:bg-purple-950/30">
              <Sparkles className="h-4 w-4 text-purple-600 dark:text-purple-400 mt-0.5 flex-shrink-0" />
              <div className="text-xs">
                <p className="font-semibold text-purple-900 dark:text-purple-200">Export Options</p>
                <p className="text-purple-700 dark:text-purple-300">PDF & Excel with styles</p>
              </div>
            </div>
          </div>

          {/* Query Input */}
          <div className="space-y-2">
            <label className="text-sm font-semibold">What would you like to analyze?</label>
            <Textarea
              placeholder="Examples:
• Generate attendance report of last month
• Show sales performance for this quarter
• List top 10 products by revenue

Be specific about timeframes, metrics, and requirements..."
              value={userQuery}
              onChange={(e) => setUserQuery(e.target.value)}
              className="min-h-[110px] rounded-lg border-slate-200 dark:border-slate-700 resize-none focus:ring-indigo-500 focus:border-indigo-500"
            />
            <p className="text-xs text-muted-foreground">
              Add timeframe, metrics, and required filters for better results.
            </p>
          </div>

          {/* Query Examples */}
          <div className="bg-slate-50 dark:bg-slate-900 p-2.5 rounded-lg border border-slate-200 dark:border-slate-700">
            <p className="text-xs font-semibold mb-1.5 text-slate-700 dark:text-slate-300">
              Need inspiration? Try these queries:
            </p>
            <ul className="space-y-1 text-xs text-slate-600 dark:text-slate-400">
              <li>• "Monthly attendance report with absence reasons and trends"</li>
              <li>• "Top selling products this quarter with revenue comparison"</li>
              <li>• "Inventory levels below minimum threshold across all locations"</li>
            </ul>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex justify-between items-center pt-3 border-t border-slate-200 dark:border-slate-700">
          <Button
            variant="outline"
            onClick={() => handleOpenChange(false)}
            className="rounded-lg"
          >
            Cancel
          </Button>

          <Button
            disabled={isCurrentlyGenerating || !userQuery.trim()}
            onClick={handleGenerateReport}
            className="gap-2 rounded-lg bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 border-0"
          >
            {isCurrentlyGenerating ? (
              <>
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                Generate Report
              </>
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
