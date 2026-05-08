/**
 * Report Layout Styles
 * 
 * Defines CSS styles and HTML templates for two professional report layouts:
 * 1. Modern Professional: Clean enterprise dashboard styling with colors and cards
 * 2. Minimal Tabular: Compact, printer-friendly, simple table-based layout
 */

export type LayoutStyle = 'modern' | 'minimal';

/**
 * Modern Professional Layout CSS
 * Clean enterprise dashboard styling with colored headers, summary cards, and analytics-friendly structure
 */
export const MODERN_LAYOUT_CSS = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
    background-color: #f8f9fa;
    color: #2c3e50;
    line-height: 1.6;
  }
  
  .modern-container {
    max-width: 100%;
    margin: 0 auto;
    background-color: white;
    padding: 20px;
  }
  
  /* Header Section */
  .report-header {
    border-bottom: 3px solid #3498db;
    padding-bottom: 25px;
    margin-bottom: 30px;
  }
  
  .report-title {
    font-size: 32px;
    font-weight: 700;
    color: #1a3a4a;
    margin-bottom: 8px;
  }
  
  .report-subtitle {
    font-size: 14px;
    color: #7f8c8d;
    margin-top: 10px;
  }
  
  .report-meta {
    display: flex;
    gap: 30px;
    margin-top: 15px;
    font-size: 13px;
    color: #7f8c8d;
  }
  
  .meta-item {
    display: flex;
    align-items: center;
    gap: 5px;
  }
  
  .meta-label {
    font-weight: 600;
    color: #34495e;
  }
  
  /* Metrics Cards */
  .metrics-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
    gap: 20px;
    margin-bottom: 40px;
  }
  
  .metric-card {
    background: linear-gradient(135deg, #3498db 0%, #2980b9 100%);
    color: white;
    padding: 25px;
    border-radius: 12px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
    transition: transform 0.2s, box-shadow 0.2s;
  }
  
  .metric-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 12px rgba(0, 0, 0, 0.15);
  }
  
  .metric-card:nth-child(2) {
    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
  }
  
  .metric-card:nth-child(3) {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
  }
  
  .metric-card:nth-child(4) {
    background: linear-gradient(135deg, #f39c12 0%, #d68910 100%);
  }
  
  .metric-label {
    font-size: 13px;
    font-weight: 500;
    opacity: 0.9;
    margin-bottom: 10px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }
  
  .metric-value {
    font-size: 28px;
    font-weight: 700;
    margin-bottom: 8px;
  }
  
  .metric-trend {
    font-size: 12px;
    font-weight: 600;
    opacity: 0.85;
  }
  
  .metric-trend.positive {
    color: #fff;
  }
  
  .metric-trend.negative {
    color: #ffcccc;
  }
  
  /* Section */
  .report-section {
    margin-bottom: 40px;
    page-break-inside: avoid;
  }
  
  .section-header {
    border-left: 4px solid #3498db;
    padding-left: 20px;
    margin-bottom: 20px;
  }
  
  .section-title {
    font-size: 22px;
    font-weight: 700;
    color: #1a3a4a;
    margin-bottom: 6px;
  }
  
  .section-description {
    font-size: 13px;
    color: #7f8c8d;
  }
  
  .section-content {
    background-color: #f8f9fa;
    padding: 20px;
    border-radius: 8px;
    border: 1px solid #ecf0f1;
  }
  
  /* Tables */
  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 15px;
    font-size: 11px;
  }
  
  .data-table thead {
    background: linear-gradient(135deg, #34495e 0%, #2c3e50 100%);
    color: white;
  }
  
  .data-table th {
    padding: 8px 10px;
    text-align: left;
    font-weight: 600;
    border: 1px solid #34495e;
    word-break: break-word;
    word-wrap: break-word;
    overflow-wrap: break-word;
  }
  
  .data-table td {
    padding: 6px 8px;
      word-break: break-word;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 150px;
    border: 1px solid #ecf0f1;
    background-color: white;
  }
  
  .data-table tbody tr:nth-child(even) {
    background-color: #f8f9fa;
  }
  
  .data-table tbody tr:hover {
    background-color: #ecf0f1;
  }
  
  /* Summary Box */
  .summary-box {
    background-color: #ecf0f1;
    padding: 20px;
    border-left: 4px solid #3498db;
    border-radius: 4px;
    line-height: 1.8;
    font-size: 13px;
    color: #2c3e50;
  }
  
  .summary-box strong {
    color: #1a3a4a;
  }
  
  .summary-box ul, .summary-box ol {
    margin-left: 20px;
    margin-top: 10px;
  }
  
  .summary-box li {
    margin-bottom: 8px;
  }
  
  /* Charts (placeholder styling) */
  .chart-container {
    background-color: #ecf0f1;
    padding: 30px;
    border-radius: 8px;
    text-align: center;
    color: #7f8c8d;
    font-style: italic;
    margin-top: 15px;
  }
  
  /* Footer */
  .report-footer {
    margin-top: 50px;
    padding-top: 20px;
    border-top: 1px solid #ecf0f1;
    font-size: 11px;
    color: #7f8c8d;
    text-align: center;
  }
  
  @media print {
    body {
      background-color: white;
    }
    .modern-container {
      padding: 20px;
    }
    .section-content {
      page-break-inside: avoid;
    }
  }
`;

/**
 * Minimal Tabular Layout CSS
 * Compact, printer-friendly, simple table-based layout suitable for official documentation
 */
export const MINIMAL_LAYOUT_CSS = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }
  
  body {
    font-family: 'Arial', 'Helvetica', sans-serif;
    background-color: white;
    color: #000;
    line-height: 1.4;
    font-size: 11px;
  }
  
  .minimal-container {
    max-width: 100%;
    margin: 0;
    padding: 15px;
  }
  
  /* Header Section */
  .report-header {
    border-bottom: 2px solid #000;
    padding-bottom: 12px;
    margin-bottom: 20px;
  }
  
  .report-title {
    font-size: 16px;
    font-weight: bold;
    color: #000;
    margin-bottom: 4px;
  }
  
  .report-subtitle {
    font-size: 10px;
    color: #333;
    margin-top: 6px;
  }
  
  .report-meta {
    display: table;
    width: 100%;
    margin-top: 8px;
    font-size: 10px;
    color: #333;
  }
  
  .meta-item {
    display: table-cell;
    padding: 3px 10px;
    border-right: 1px solid #ccc;
  }
  
  .meta-item:last-child {
    border-right: none;
  }
  
  .meta-label {
    font-weight: bold;
  }
  
  /* Metrics (Simple layout) */
  .metrics-grid {
    display: table;
    width: 100%;
    margin-bottom: 25px;
    border-collapse: collapse;
  }
  
  .metric-card {
    display: table-row;
  }
  
  .metric-card > * {
    display: table-cell;
    padding: 8px;
    border: 1px solid #999;
  }
  
  .metric-label {
    font-weight: bold;
    width: 30%;
    background-color: #e6e6e6;
  }
  
  .metric-value {
    font-weight: bold;
    width: 35%;
  }
  
  .metric-trend {
    font-size: 9px;
    width: 35%;
  }
  
  /* Section */
  .report-section {
    margin-bottom: 25px;
    page-break-inside: avoid;
  }
  
  .section-header {
    border-bottom: 1px solid #000;
    padding-bottom: 6px;
    margin-bottom: 12px;
  }
  
  .section-title {
    font-size: 13px;
    font-weight: bold;
    color: #000;
    margin-bottom: 3px;
  }
  
  .section-description {
    font-size: 10px;
    color: #333;
  }
  
  .section-content {
    background-color: white;
    padding: 0;
  }
  
  /* Tables */
  .data-table {
    width: 100%;
    border-collapse: collapse;
    margin-top: 10px;
    font-size: 10px;
  }
  
  .data-table thead {
    background-color: #e6e6e6;
    color: #000;
  }
  
  .data-table th {
    padding: 6px;
      word-break: break-word;
      word-wrap: break-word;
      overflow-wrap: break-word;
    text-align: left;
    font-weight: bold;
    border: 1px solid #999;
  }
  
  .data-table td {
    padding: 5px 6px;
      word-break: break-word;
      word-wrap: break-word;
      overflow-wrap: break-word;
      max-width: 120px;
    border: 1px solid #999;
  }
  
  .data-table tbody tr:nth-child(even) {
    background-color: #f5f5f5;
  }
  
  /* Summary Box */
  .summary-box {
    background-color: white;
    padding: 8px;
    border: 1px solid #999;
    line-height: 1.5;
    font-size: 10px;
    color: #000;
  }
  
  .summary-box strong {
    color: #000;
  }
  
  .summary-box ul, .summary-box ol {
    margin-left: 15px;
    margin-top: 6px;
  }
  
  .summary-box li {
    margin-bottom: 3px;
  }
  
  /* Charts (placeholder) */
  .chart-container {
    background-color: #f5f5f5;
    padding: 15px;
    border: 1px solid #999;
    text-align: center;
    color: #666;
    font-style: italic;
    margin-top: 10px;
    font-size: 10px;
  }
  
  /* Footer */
  .report-footer {
    margin-top: 30px;
    padding-top: 10px;
    border-top: 1px solid #ccc;
    font-size: 9px;
    color: #666;
    text-align: center;
  }
  
  @media print {
    body {
      background-color: white;
    }
    .minimal-container {
      padding: 10px;
    }
    .section-content {
      page-break-inside: avoid;
    }
  }
`;

/**
 * Gets the appropriate CSS for the layout
 */
export function getLayoutCSS(layout: LayoutStyle): string {
  return layout === 'modern' ? MODERN_LAYOUT_CSS : MINIMAL_LAYOUT_CSS;
}

/**
 * Gets the container class name for the layout
 */
export function getLayoutContainerClass(layout: LayoutStyle): string {
  return layout === 'modern' ? 'modern-container' : 'minimal-container';
}
