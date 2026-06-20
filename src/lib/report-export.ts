import { Report } from '@/types';

/**
 * Generates a professional HTML string for a report
 * Can be used for PDF export or printing
 */
export function generateReportHTML(report: Report): string {
  const reportDate = new Date(report.createdAt).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });

  const sectionsHTML = report.sections
    .map((section) => {
      let content = '';

      if (section.type === 'metrics' && section.metrics) {
        content = `
          <div class="metrics-grid">
            ${section.metrics
              .map(
                (metric) => `
              <div class="metric-card">
                <p class="metric-label">${metric.label}</p>
                <p class="metric-value">${metric.value}</p>
                ${
                  metric.trend
                    ? `<p class="metric-trend ${metric.trend === 'up' ? 'positive' : metric.trend === 'down' ? 'negative' : ''}">${metric.trend === 'up' ? '↑' : metric.trend === 'down' ? '↓' : '→'} ${metric.trendValue}%</p>`
                    : ''
                }
              </div>
            `
              )
              .join('')}
          </div>
        `;
      }

      if (section.type === 'table' && section.data && section.data.length > 0) {
        const columns = section.columns || Object.keys(section.data[0]);
        content = `
          <table class="data-table">
            <thead>
              <tr>
                ${columns.map((col) => `<th>${col}</th>`).join('')}
              </tr>
            </thead>
            <tbody>
              ${section.data
                .slice(0, 20)
                .map(
                  (row) => `
                <tr>
                  ${columns.map((col) => `<td>${String(row[col] ?? '-')}</td>`).join('')}
                </tr>
              `
                )
                .join('')}
            </tbody>
          </table>
        `;
      }

      if (section.type === 'summary' && section.summary) {
        content = `
          <div class="summary-box">
            ${section.summary}
          </div>
        `;
      }

      return `
        <section class="report-section">
          <h2 class="section-title">${section.title}</h2>
          ${section.description ? `<p class="section-description">${section.description}</p>` : ''}
          <div class="section-content">
            ${content}
          </div>
        </section>
      `;
    })
    .join('');

  return `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>${report.title}</title>
        <style>
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          
          body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            line-height: 1.6;
            color: #333;
            background: #f5f5f5;
            padding: 20px;
          }
          
          .report {
            max-width: 900px;
            margin: 0 auto;
            background: white;
            padding: 40px;
            border-radius: 8px;
            box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
          }
          
          .report-header {
            margin-bottom: 40px;
            border-bottom: 2px solid #e5e7eb;
            padding-bottom: 30px;
          }
          
          .report-title {
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 10px;
            color: #1f2937;
          }
          
          .report-meta {
            display: flex;
            gap: 20px;
            flex-wrap: wrap;
            color: #666;
            font-size: 14px;
            margin-top: 15px;
          }
          
          .meta-item {
            display: flex;
            gap: 5px;
          }
          
          .meta-label {
            font-weight: 600;
          }
          
          .report-type {
            display: inline-block;
            background: #3b82f6;
            color: white;
            padding: 4px 12px;
            border-radius: 20px;
            font-size: 12px;
            font-weight: 600;
            margin-bottom: 15px;
          }
          
          .report-section {
            margin-bottom: 40px;
            page-break-inside: avoid;
          }
          
          .section-title {
            font-size: 24px;
            font-weight: 600;
            margin-bottom: 10px;
            color: #1f2937;
            border-left: 4px solid #3b82f6;
            padding-left: 15px;
          }
          
          .section-description {
            color: #666;
            font-size: 14px;
            margin-bottom: 20px;
          }
          
          .section-content {
            margin-top: 15px;
          }
          
          .metrics-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-bottom: 20px;
          }
          
          .metric-card {
            background: #f3f4f6;
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 20px;
            text-align: center;
          }
          
          .metric-label {
            font-size: 12px;
            font-weight: 600;
            color: #666;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 10px;
          }
          
          .metric-value {
            font-size: 28px;
            font-weight: 700;
            color: #1f2937;
            margin-bottom: 8px;
          }
          
          .metric-trend {
            font-size: 12px;
            font-weight: 600;
            color: #666;
          }
          
          .metric-trend.positive {
            color: #10b981;
          }
          
          .metric-trend.negative {
            color: #ef4444;
          }
          
          .data-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 15px;
            font-size: 14px;
          }
          
          .data-table thead {
            background: #f3f4f6;
          }
          
          .data-table th {
            padding: 12px;
            text-align: left;
            font-weight: 600;
            border-bottom: 2px solid #e5e7eb;
            color: #1f2937;
          }
          
          .data-table td {
            padding: 12px;
            border-bottom: 1px solid #e5e7eb;
            color: #555;
          }
          
          .data-table tbody tr:nth-child(even) {
            background: #fafafa;
          }
          
          .summary-box {
            background: #eff6ff;
            border-left: 4px solid #3b82f6;
            padding: 20px;
            border-radius: 4px;
            line-height: 1.8;
            color: #1f2937;
          }
          
          .report-footer {
            margin-top: 50px;
            padding-top: 30px;
            border-top: 1px solid #e5e7eb;
            text-align: center;
            color: #999;
            font-size: 12px;
          }
          
          @media print {
            body {
              background: white;
              padding: 0;
            }
            
            .report {
              box-shadow: none;
              margin: 0;
              padding: 20px;
            }
            
            .report-section {
              page-break-inside: avoid;
            }
          }
        </style>
      </head>
      <body>
        <div class="report">
          <div class="report-header">
            <span class="report-type">${report.reportType.replace('_', ' ').toUpperCase()}</span>
            <h1 class="report-title">${report.title}</h1>
            ${report.description ? `<p style="color: #666; margin-bottom: 15px;">${report.description}</p>` : ''}
            <div class="report-meta">
              <div class="meta-item">
                <span class="meta-label">Generated:</span>
                <span>${reportDate}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Database:</span>
                <span>${report.metadata.database}</span>
              </div>
              <div class="meta-item">
                <span class="meta-label">Records:</span>
                <span>${report.rowCount || 0}</span>
              </div>
              ${
                report.executionTime
                  ? `<div class="meta-item"><span class="meta-label">Query Time:</span><span>${report.executionTime.toFixed(2)}s</span></div>`
                  : ''
              }
            </div>
          </div>
          
          ${sectionsHTML}
          
          <div class="report-footer">
            <p>Generated by Talk2SQL on ${reportDate}</p>
            <p>Database: ${report.metadata.database}</p>
          </div>
        </div>
      </body>
    </html>
  `;
}

/**
 * Exports report as PDF (requires html2pdf library)
 * Install: npm install html2pdf.js
 */
export async function exportReportPDF(report: Report) {
  try {
    // Dynamically import html2pdf for tree-shaking
    const { default: html2pdf } = await import('html2pdf.js');

    const html = generateReportHTML(report);
    const filename = `${report.title.replace(/\s+/g, '_').toLowerCase()}_${new Date().toISOString().split('T')[0]}.pdf`;

    const opt = {
      margin: 10,
      filename,
      image: { type: 'jpeg' as const, quality: 0.98 },
      html2canvas: { scale: 2 },
      jsPDF: { orientation: 'portrait' as const, unit: 'mm' as const, format: 'a4' as const },
    };

    html2pdf().set(opt).from(html).save();

    return { success: true, message: 'PDF exported successfully' };
  } catch (error) {
    console.error('PDF export error:', error);
    return { success: false, message: 'PDF export failed. Please try CSV export instead.' };
  }
}

/**
 * Exports report as formatted JSON
 */
export function exportReportJSON(report: Report): string {
  return JSON.stringify(
    {
      title: report.title,
      description: report.description,
      type: report.reportType,
      sections: report.sections,
      metadata: report.metadata,
      sql: report.sql,
      generatedAt: report.createdAt,
      columns: report.columns,
      rowCount: report.rowCount,
      executionTime: report.executionTime,
    },
    null,
    2
  );
}

/**
 * Generates a simple text summary of the report
 */
export function generateReportSummary(report: Report): string {
  const lines: string[] = [
    `Report: ${report.title}`,
    `Type: ${report.reportType}`,
    `Generated: ${new Date(report.createdAt).toLocaleString()}`,
    `Database: ${report.metadata.database}`,
    `Records: ${report.rowCount}`,
    `Query Time: ${report.executionTime?.toFixed(3)}s`,
    '',
    'Sections:',
  ];

  report.sections.forEach((section) => {
    lines.push(`  - ${section.title}: ${section.type}`);
  });

  return lines.join('\n');
}
