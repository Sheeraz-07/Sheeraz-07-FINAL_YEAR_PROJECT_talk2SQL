/**
 * Enhanced Report XLSX Export
 * 
 * Generates professional Excel reports with two layout styles.
 * Uses xlsx library for Excel file generation.
 */

import { Report, ReportSection } from '@/types';
import { LayoutStyle } from './report-layout-styles';

/**
 * Modern Excel layout configuration
 * Uses multiple sheets with formatted headers and styled metrics
 */
export async function exportReportToXLSX(
  report: Report,
  layout: LayoutStyle = 'modern'
): Promise<void> {
  try {
    const XLSX = await import('xlsx');

    const workbook = XLSX.utils.book_new();

    if (layout === 'modern') {
      // Modern layout: Multiple sheets with summary, metrics, and detailed data
      createModernLayout(workbook, report, XLSX);
    } else {
      // Minimal layout: Single sheet with simple table
      createMinimalLayout(workbook, report, XLSX);
    }

    // Generate filename
    const filename = `${report.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.xlsx`;

    // Download the file
    XLSX.writeFile(workbook, filename);
  } catch (error) {
    console.error('XLSX export error:', error);
    throw new Error('Failed to export Excel. Please make sure xlsx library is installed.');
  }
}

/**
 * Creates modern layout with multiple sheets
 */
function createModernLayout(workbook: any, report: Report, XLSX: any): void {
  // Sheet 1: Summary/Cover Page
  const summarySheet = createSummarySheet(report);
  XLSX.utils.book_append_sheet(workbook, summarySheet, 'Summary');

  // Sheet 2: Metrics
  const metricsSection = report.sections.find((s) => s.type === 'metrics');
  if (metricsSection && metricsSection.metrics) {
    const metricsSheet = createMetricsSheet(metricsSection.metrics);
    XLSX.utils.book_append_sheet(workbook, metricsSheet, 'Metrics');
  }

  // Sheet 3+: Data tables for each section
  report.sections.forEach((section, index) => {
    if (section.type === 'table' && section.data && section.data.length > 0) {
      const tableSheet = XLSX.utils.json_to_sheet(section.data);
      applyModernTableFormatting(tableSheet, section.columns || Object.keys(section.data[0] || {}), section.data, XLSX);
      XLSX.utils.book_append_sheet(workbook, tableSheet, section.title.substring(0, 31));
    }
  });

  // Sheet: Insights
  const summarySection = report.sections.find((s) => s.type === 'summary');
  if (summarySection && summarySection.summary) {
    const insightsSheet = createInsightsSheet(summarySection.summary);
    XLSX.utils.book_append_sheet(workbook, insightsSheet, 'Insights');
  }

  // Sheet: Raw Data
  if (report.rawData && report.rawData.length > 0) {
    const rawSheet = XLSX.utils.json_to_sheet(report.rawData);
    applyModernTableFormatting(rawSheet, report.columns, report.rawData, XLSX);
    XLSX.utils.book_append_sheet(workbook, rawSheet, 'Raw Data');
  }
}

/**
 * Creates minimal layout with single sheet
 */
function createMinimalLayout(workbook: any, report: Report, XLSX: any): void {
  const data: any[] = [];

  // Add header information
  data.push(['REPORT TITLE', report.title]);
  data.push(['DESCRIPTION', report.description || '']);
  data.push(['GENERATED', new Date(report.createdAt).toLocaleString()]);
  data.push(['DATABASE', report.metadata.database]);
  data.push(['RECORDS', report.rowCount || 0]);
  data.push(['QUERY TIME', `${report.executionTime || 0}s`]);
  data.push([]); // Empty row

  // Add metrics if available
  const metricsSection = report.sections.find((s) => s.type === 'metrics');
  if (metricsSection && metricsSection.metrics) {
    data.push(['METRICS', '', '', '']);
    metricsSection.metrics.forEach((metric) => {
      data.push([
        metric.label,
        metric.value,
        metric.trend ? `${metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'} ${metric.trendValue}%` : '',
      ]);
    });
    data.push([]); // Empty row
  }

  // Add data tables
  report.sections.forEach((section) => {
    if (section.type === 'table' && section.data && section.data.length > 0) {
      data.push([section.title.toUpperCase()]);
      const columns = section.columns || Object.keys(section.data[0]);
      data.push(columns);

      section.data.forEach((row) => {
        data.push(columns.map((col) => row[col] ?? ''));
      });

      data.push([]); // Empty row
    }
  });

  // Add summary section
  const summarySection = report.sections.find((s) => s.type === 'summary');
  if (summarySection && summarySection.summary) {
    data.push(['KEY INSIGHTS & ANALYSIS']);
    const summaryText = summarySection.summary.split('\n');
    summaryText.forEach((line) => {
      data.push([line]);
    });
  }

  const sheet = XLSX.utils.aoa_to_sheet(data);
  applyMinimalTableFormatting(sheet, data);
  XLSX.utils.book_append_sheet(workbook, sheet, 'Report');
}

/**
 * Creates summary sheet for modern layout
 */
function createSummarySheet(report: Report): any {
  const XLSX = require('xlsx');
  const data = [
    ['REPORT SUMMARY'],
    [],
    ['Title', report.title],
    ['Description', report.description || ''],
    ['Generated', new Date(report.createdAt).toLocaleString()],
    ['Database', report.metadata.database],
    ['Report Type', report.reportType.toUpperCase()],
    ['Records Analyzed', report.rowCount || 0],
    ['Query Execution Time', `${report.executionTime || 0}s`],
    [],
    ['METADATA'],
    ['Generated By', report.metadata.generatedBy || 'System'],
    ['SQL Query', report.sql || ''],
    ['Column Count', report.columns?.length || 0],
  ];

  return XLSX.utils.aoa_to_sheet(data);
}

/**
 * Creates metrics sheet for modern layout
 */
function createMetricsSheet(metrics: ReportSection['metrics']): any {
  const XLSX = require('xlsx');
  if (!metrics) return XLSX.utils.aoa_to_sheet([]);

  const data = [
    ['METRICS SUMMARY'],
    [],
    ['Metric', 'Value', 'Trend', 'Change %'],
  ];

  metrics.forEach((metric) => {
    data.push([
      metric.label,
      String(metric.value),
      metric.trend || 'neutral',
      metric.trendValue ? `${metric.trendValue}%` : '-',
    ]);
  });

  return XLSX.utils.aoa_to_sheet(data);
}

/**
 * Creates insights sheet for modern layout
 */
function createInsightsSheet(summary: string): any {
  const XLSX = require('xlsx');
  const lines = summary.split('\n');
  const data = [['KEY INSIGHTS & ANALYSIS'], [], ...lines.map((line) => [line])];

  return XLSX.utils.aoa_to_sheet(data);
}

/**
 * Applies modern Excel formatting to a sheet
 */
function applyModernTableFormatting(sheet: any, columns: string[], data: Record<string, unknown>[], XLSX: any): void {
  if (!sheet['!cols']) {
    sheet['!cols'] = [];
  }

  // Set dynamic column widths based on header and sample data length
  columns.forEach((column, index) => {
    const values = data.slice(0, 200).map((row) => String(row[column] ?? ''));
    const maxLen = Math.max(column.length, ...values.map((value) => value.length), 12);
    sheet['!cols'][index] = { wch: Math.min(Math.max(maxLen + 2, 12), 45) };
  });

  // Let Excel wrap content so text remains visible
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (sheet[cellRef]) {
        sheet[cellRef].s = {
          alignment: { wrapText: true, vertical: 'top' },
        };
      }
    }
  }

  for (let col = 0; col < columns.length; col++) {
    const cellRef = XLSX.utils.encode_cell({ r: 0, c: col });
    if (sheet[cellRef]) {
      sheet[cellRef].s = {
        font: { bold: true, color: { rgb: 'FFFFFF' } },
        fill: { fgColor: { rgb: '366092' } },
        alignment: { horizontal: 'center', vertical: 'center', wrapText: true },
      };
    }
  }

  sheet['!rows'] = [];
  for (let row = 0; row < Math.min(data.length + 1, 1000); row++) {
    const rowValues = row === 0 ? columns : columns.map((column) => String(data[row - 1]?.[column] ?? ''));
    const maxLines = Math.max(
      1,
      ...rowValues.map((value) => Math.ceil(Math.max(value.length, 1) / 28))
    );
    sheet['!rows'][row] = { hpt: Math.min(Math.max(maxLines * 18, 18), 96) };
  }
}

/**
 * Applies minimal Excel formatting to a sheet
 */
function applyMinimalTableFormatting(sheet: any, data: unknown[][]): void {
  if (!sheet['!cols']) {
    sheet['!cols'] = [];
  }

  const rowCount = Math.min(data.length, 500);
  const maxColumns = Math.max(...data.slice(0, rowCount).map((row) => row.length), 1);
  for (let i = 0; i < maxColumns; i++) {
    const colValues = data.slice(0, rowCount).map((row) => String(row[i] ?? ''));
    const maxLen = Math.max(10, ...colValues.map((value) => value.length));
    sheet['!cols'][i] = { wch: Math.min(Math.max(maxLen + 2, 12), 40) };
  }

  const XLSX = require('xlsx');
  const range = XLSX.utils.decode_range(sheet['!ref'] || 'A1:A1');
  for (let row = range.s.r; row <= range.e.r; row++) {
    for (let col = range.s.c; col <= range.e.c; col++) {
      const cellRef = XLSX.utils.encode_cell({ r: row, c: col });
      if (sheet[cellRef]) {
        sheet[cellRef].s = { alignment: { wrapText: true, vertical: 'top' } };
      }
    }
  }

  sheet['!rows'] = [];
  for (let row = 0; row < Math.min(data.length, 1000); row++) {
    const rowValues = data[row].map((value) => String(value ?? ''));
    const maxLines = Math.max(
      1,
      ...rowValues.map((value) => Math.ceil(Math.max(value.length, 1) / 24))
    );
    sheet['!rows'][row] = { hpt: Math.min(Math.max(maxLines * 18, 18), 96) };
  }
}

/**
 * Generates XLSX as Blob (for saving or sending)
 */
export async function generateReportXLSXBlob(
  report: Report,
  layout: LayoutStyle = 'modern'
): Promise<Blob> {
  try {
    const XLSX = await import('xlsx');

    const workbook = XLSX.utils.book_new();

    if (layout === 'modern') {
      createModernLayout(workbook, report, XLSX);
    } else {
      createMinimalLayout(workbook, report, XLSX);
    }

    // Generate blob
    const wbout = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
    return new Blob([wbout], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  } catch (error) {
    console.error('XLSX blob generation error:', error);
    throw error;
  }
}

// Helper: Check if XLSX library is available
export async function isXLSXAvailable(): Promise<boolean> {
  try {
    await import('xlsx');
    return true;
  } catch {
    return false;
  }
}
