'use client';

/**
 * PDF Export Utility - Enhanced PDF generation with better styling
 * and chart placeholder support
 */

export interface PDFExportOptions {
  margin?: number | number[];
  scale?: number;
  quality?: number;
  orientation?: 'portrait' | 'landscape';
}

/**
 * Generates optimized HTML for PDF export with proper styling
 * Handles:
 * - Table responsiveness and column wrapping
 * - Chart placeholders (charts render better in digital preview)
 * - Metric cards with proper formatting
 * - Data truncation for readability
 */
export function generateOptimizedPDFHTML(htmlContent: string): string {
  // Add print-specific styles
  const printStyles = `
    <style>
      @page {
        size: A4 portrait;
        margin: 10mm;
      }

      @media print {
        * {
          -webkit-print-color-adjust: exact !important;
          print-color-adjust: exact !important;
          color-adjust: exact !important;
        }

        body {
          background: white;
          color: black;
          margin: 0;
          padding: 0;
        }

        table {
          page-break-inside: avoid;
          margin: 15px 0;
          width: 100%;
        }

        tr, td, th {
          page-break-inside: avoid;
        }

        h1, h2, h3 {
          page-break-after: avoid;
        }

        .page-break {
          page-break-before: always;
        }

        img {
          max-width: 100%;
          height: auto;
        }

        /* Table optimization */
        table {
          font-size: 10px;
          border-collapse: collapse;
        }

        td, th {
          word-wrap: break-word;
          overflow-wrap: break-word;
          padding: 6px;
          max-width: 50mm;
        }

        /* Prevent content from being hidden */
        div {
          overflow: visible !important;
        }

        .chart-placeholder {
          border: 2px dashed #ccc;
          padding: 20px;
          text-align: center;
          page-break-inside: avoid;
        }
      }

      /* General print-friendly styles */
      a {
        color: #0066cc;
        text-decoration: underline;
      }

      body {
        font-family: Arial, Segoe UI, sans-serif;
      }

      /* Ensure no content is hidden due to CSS */
      * {
        overflow: visible !important;
      }

      /* Tables should wrap content */
      table td {
        word-wrap: break-word;
        word-break: break-word;
        white-space: normal;
      }
    </style>
  `;

  // Insert print styles into head
  const modifiedHTML = htmlContent.replace('</head>', printStyles + '</head>');

  return modifiedHTML;
}

/**
 * Exports report data to CSV format
 * Useful alternative when PDF has rendering issues
 */
export function exportToCSV(
  data: Record<string, unknown>[],
  columns: string[],
  filename: string
): void {
  const escapeCSV = (value: unknown): string => {
    const str = String(value ?? '');
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };

  const lines = [
    columns.join(','),
    ...data.map((row) => columns.map((col) => escapeCSV(row[col])).join(',')),
  ];

  const blob = new Blob([lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

/**
 * Chart rendering note for PDF
 * Charts are best viewed in the digital report preview
 */
export const chartPDFNote = `
  <div style="background-color:#fff3cd; border:2px solid #ffc107; border-radius:6px; padding:16px; margin:20px 0; text-align:center;">
    <strong style="color:#856404;">📊 Chart Visualization</strong>
    <p style="color:#856404; font-size:12px; margin:8px 0 0 0;">
      For the best chart viewing experience, please view the digital report preview.
      Exported PDF shows data tables with all the information visualized in the charts.
    </p>
  </div>
`;

/**
 * Best practices for PDF export
 */
export const PDFExportBestPractices = `
## PDF Export Tips

### If Tables Are Getting Cut Off:
1. Export as CSV for full data visibility
2. Open CSV in Excel or Google Sheets
3. Print from there with landscape orientation

### If Charts Are Missing:
1. Charts render better in the web preview
2. You can screenshot the preview for charts
3. CSV/JSON exports include all raw data behind charts

### For Large Datasets:
1. Use CSV export instead - it includes all rows
2. PDF limits to 15 rows per table for readability
3. Open CSV in spreadsheet software for full analysis

### Landscape Layout for Tables:
1. Use print preview and select landscape
2. This gives more space for wide tables
3. Some PDF readers have zoom options

### Browser Tips:
1. Try a different browser if export fails
2. Clear browser cache and try again
3. Check browser console (F12) for specific errors
`;
