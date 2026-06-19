import { Report, ReportSection, ChartType } from '@/types';

export interface AnalysisResult {
  sections: ReportSection[];
  insights: string;
  suggestedCharts: ChartType[];
}

/**
 * Analyzes query data and generates report sections with visualizations
 */
export function analyzeDataForReport(
  data: Record<string, unknown>[],
  columns: string[],
  reportType: string
): AnalysisResult {
  if (!data || data.length === 0) {
    return {
      sections: [],
      insights: 'No data available for analysis',
      suggestedCharts: [],
    };
  }

  const sections: ReportSection[] = [];
  const suggestedCharts: ChartType[] = [];

  // Analyze column types
  const numericColumns = identifyNumericColumns(data, columns);
  const categoricalColumns = identifyCategorialColumns(data, columns);

  // Generate metrics section
  if (numericColumns.length > 0) {
    const metricsSection = generateMetricsSection(data, numericColumns);
    if (metricsSection) {
      sections.push(metricsSection);
    }
  }

  // Generate chart section based on data patterns
  const chartConfig = suggestChartForData(data, numericColumns, categoricalColumns, reportType);
  if (chartConfig) {
    sections.push(chartConfig.section);
    suggestedCharts.push(...chartConfig.types);
  }

  // Generate data table section
  const tableSection: ReportSection = {
    id: `table-${Date.now()}`,
    title: 'Detailed Data',
    description: 'Complete dataset from the query',
    type: 'table',
    data,
    columns: columns,
  };
  sections.push(tableSection);

  // Generate insights section
  const insights = generateInsights(data, numericColumns, categoricalColumns, reportType);
  const summarySection: ReportSection = {
    id: `summary-${Date.now()}`,
    title: 'Key Insights & Analysis',
    description: 'AI-generated analysis and findings',
    type: 'summary',
    summary: insights,
    data: [],
    columns: [],
  };
  sections.push(summarySection);

  return {
    sections,
    insights,
    suggestedCharts,
  };
}

/**
 * Identifies numeric columns in the dataset
 */
function identifyNumericColumns(data: Record<string, unknown>[], columns: string[]): string[] {
  return columns.filter((col) => {
    const samples = data.slice(0, Math.min(10, data.length)).map((row) => row[col]);
    const numericCount = samples.filter((val) => typeof val === 'number' || !isNaN(parseFloat(String(val)))).length;
    return numericCount / samples.length > 0.7;
  });
}

/**
 * Identifies categorical columns in the dataset
 */
function identifyCategorialColumns(data: Record<string, unknown>[], columns: string[]): string[] {
  return columns.filter((col) => {
    const samples = data.slice(0, Math.min(10, data.length)).map((row) => row[col]);
    const stringCount = samples.filter((val) => typeof val === 'string').length;
    return stringCount / samples.length > 0.7;
  });
}

/**
 * Formats a number with K or M suffix for large numbers
 */
function formatNumberShort(num: number): string {
  if (Math.abs(num) >= 1_000_000) {
    return (num / 1_000_000).toFixed(1) + 'M';
  } else if (Math.abs(num) >= 1_000) {
    return (num / 1_000).toFixed(1) + 'K';
  }
  return num.toFixed(2).replace(/\.00$/, '');
}

/**
 * Converts a string to Title Case
 */
function toTitleCase(str: string): string {
  return str.replace(/_/g, ' ')
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(' ');
}

/**
 * Generates metrics section with key performance indicators
 */
function generateMetricsSection(data: Record<string, unknown>[], numericColumns: string[]): ReportSection | null {
  if (numericColumns.length === 0) return null;

  const metrics = numericColumns.slice(0, 4).map((col) => {
    const values = data
      .map((row) => {
        const val = row[col];
        return typeof val === 'number' ? val : parseFloat(String(val));
      })
      .filter((val) => !isNaN(val));

    if (values.length === 0) return null;

    const colLower = col.toLowerCase();
    const isSumType = /(total|revenue|sales|amount|qty|quantity|profit|cost|count)/i.test(colLower);
    
    let aggregateValue = 0;
    let labelPrefix = '';

    if (isSumType) {
      aggregateValue = values.reduce((a, b) => a + b, 0);
      labelPrefix = 'Total';
    } else {
      aggregateValue = values.reduce((a, b) => a + b, 0) / values.length;
      labelPrefix = 'Avg';
    }

    const cleanColName = toTitleCase(col);
    // Avoid redundancies like "Total Total Revenue"
    let finalLabel = cleanColName;
    if (!cleanColName.toLowerCase().includes(labelPrefix.toLowerCase())) {
      finalLabel = `${labelPrefix} ${cleanColName}`;
    }

    const formattedValue = formatNumberShort(aggregateValue);

    // Calculate trend (simplified - comparing first half to second half)
    const midpoint = Math.floor(values.length / 2);
    let trendPercent = 0;
    
    if (midpoint > 0 && values.length > 1) {
      const firstHalf = values.slice(0, midpoint);
      const secondHalf = values.slice(midpoint);
      
      const firstAgg = isSumType 
        ? firstHalf.reduce((a, b) => a + b, 0) 
        : firstHalf.reduce((a, b) => a + b, 0) / firstHalf.length;
        
      const secondAgg = isSumType 
        ? secondHalf.reduce((a, b) => a + b, 0) 
        : secondHalf.reduce((a, b) => a + b, 0) / secondHalf.length;

      if (firstAgg !== 0) {
        trendPercent = ((secondAgg - firstAgg) / Math.abs(firstAgg)) * 100;
      }
    }

    const trend = trendPercent > 5 ? 'up' : trendPercent < -5 ? 'down' : 'neutral';

    return {
      label: finalLabel,
      value: formattedValue,
      trend: trend as 'up' | 'down' | 'neutral',
      trendValue: Math.abs(trendPercent).toFixed(1),
    };
  });

  return {
    id: `metrics-${Date.now()}`,
    title: 'Key Metrics',
    description: 'Summary of main KPIs',
    type: 'metrics',
    metrics: metrics.filter((m) => m !== null),
    data: [],
    columns: [],
  };
}

/**
 * Suggests appropriate chart type and generates chart data
 */
function suggestChartForData(
  data: Record<string, unknown>[],
  numericColumns: string[],
  categoricalColumns: string[],
  reportType: string
): { section: ReportSection; types: ChartType[] } | null {
  const types: ChartType[] = [];

  // If we have numeric and categorical data
  if (numericColumns.length > 0 && categoricalColumns.length > 0) {
    const categoryCol = categoricalColumns[0];
    const valueCol = numericColumns[0];

    // Group data by category
    const grouped: Record<string, number[]> = {};
    data.forEach((row) => {
      const key = String(row[categoryCol]);
      if (!grouped[key]) {
        grouped[key] = [];
      }
      grouped[key].push(parseFloat(String(row[valueCol])) || 0);
    });

    // Calculate aggregates
    const chartData = Object.entries(grouped).map(([key, values]) => ({
      name: key,
      [valueCol]: (values as number[]).reduce((a, b) => a + b, 0) / (values as number[]).length,
    }));

    // Suggest chart types
    if (chartData.length <= 10) {
      types.push('bar');
      types.push('pie');
    }
    if (chartData.length > 3) {
      types.push('line');
    }

    return {
      section: {
        id: `chart-${Date.now()}`,
        title: `${valueCol} by ${categoryCol}`,
        description: `Visualization of ${valueCol.toLowerCase()} across different ${categoryCol.toLowerCase()}`,
        type: 'chart',
        chartType: types[0] || 'bar',
        data: chartData,
        columns: ['name', valueCol],
      },
      types,
    };
  }

  // If we have multiple numeric columns - use line chart
  if (numericColumns.length >= 2) {
    types.push('line');
    types.push('area');
    const chartData = data.slice(0, 20).map((row, idx) => ({
      name: `Point ${idx + 1}`,
      ...Object.fromEntries(numericColumns.slice(0, 2).map((col) => [col, parseFloat(String(row[col])) || 0])),
    }));

    return {
      section: {
        id: `chart-${Date.now()}`,
        title: `Trend Analysis`,
        description: `Trending data points over time`,
        type: 'chart',
        chartType: 'line',
        data: chartData,
        columns: ['name', ...numericColumns.slice(0, 2)],
      },
      types,
    };
  }

  return null;
}

/**
 * Generates AI-like insights based on data analysis
 */
function generateInsights(
  data: Record<string, unknown>[],
  numericColumns: string[],
  categoricalColumns: string[],
  reportType: string
): string {
  const insights: string[] = [];

  // Total records insight
  insights.push(`This report contains ${data.length} records of data.`);

  // Numeric analysis
  if (numericColumns.length > 0) {
    const col = numericColumns[0];
    const values = data
      .map((row) => {
        const val = row[col];
        return typeof val === 'number' ? val : parseFloat(String(val));
      })
      .filter((val) => !isNaN(val));

    if (values.length > 0) {
      const avg = values.reduce((a, b) => a + b, 0) / values.length;
      const max = Math.max(...values);
      const min = Math.min(...values);
      insights.push(
        `The ${col.replace(/_/g, ' ').toLowerCase()} ranges from ${min.toFixed(2)} to ${max.toFixed(2)}, with an average of ${avg.toFixed(2)}.`
      );
    }
  }

  // Categorical analysis
  if (categoricalColumns.length > 0) {
    const col = categoricalColumns[0];
    const uniqueValues = new Set(data.map((row) => row[col]));
    insights.push(
      `The dataset includes ${uniqueValues.size} unique values in the ${col.replace(/_/g, ' ').toLowerCase()} category.`
    );

    // Find most common category
    const categoryCount: Record<string, number> = {};
    data.forEach((row) => {
      const key = String(row[col]);
      categoryCount[key] = (categoryCount[key] || 0) + 1;
    });
    const mostCommon = Object.entries(categoryCount).sort(([, a], [, b]) => b - a)[0];
    if (mostCommon) {
      insights.push(
        `The most common ${col.replace(/_/g, ' ').toLowerCase()} is ${mostCommon[0]} (${mostCommon[1]} occurrences).`
      );
    }
  }

  // Report-type specific insights
  if (reportType === 'sales') {
    insights.push('Sales data analysis provides visibility into revenue trends and customer purchasing patterns.');
  } else if (reportType === 'attendance') {
    insights.push('Attendance metrics help track workforce presence and engagement.');
  } else if (reportType === 'inventory') {
    insights.push('Inventory analysis ensures optimal stock levels and identifies potential supply chain issues.');
  }

  insights.push(
    'Review the visualizations above for detailed trends and patterns. Use this data to inform strategic decisions.'
  );

  return insights.join(' ');
}

/**
 * Enhances a report with analysis and visualizations
 */
export function enhanceReportWithAnalysis(
  report: Report,
  queryData: Record<string, unknown>[],
  columns: string[]
): Report {
  const analysis = analyzeDataForReport(queryData, columns, report.reportType);

  return {
    ...report,
    sections: analysis.sections,
    rawData: queryData,
    columns,
    rowCount: queryData.length,
  };
}
