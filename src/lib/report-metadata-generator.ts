/**
 * Report Metadata Generator
 * 
 * Intelligently generates report metadata (title, description, type, styling)
 * from natural language queries and database results using AI-like inference.
 */

export interface ReportMetadata {
  title: string;
  description: string;
  reportType: string;
  dateRange?: { from: Date; to: Date };
  suggestedLayout: 'modern' | 'minimal';
  summaryStats?: {
    totalRecords: number;
    keyMetrics: string[];
    analysisType: string;
  };
}

/**
 * Intelligently generates report metadata from a user query and data
 */
export function generateReportMetadata(
  userQuery: string,
  data: Record<string, unknown>[],
  columns: string[]
): ReportMetadata {
  const title = generateReportTitle(userQuery, data, columns);
  const description = generateReportDescription(userQuery, data, title);
  const reportType = inferReportType(userQuery, columns);
  const dateRange = extractDateRange(userQuery, data, columns);
  const suggestedLayout = selectLayout(userQuery, data, reportType);
  const summaryStats = extractSummaryStats(data, columns, reportType);

  return {
    title,
    description,
    reportType,
    dateRange,
    suggestedLayout,
    summaryStats,
  };
}

/**
 * Generates an intelligent report title from the query and data
 * 
 * Examples:
 * "Generate attendance report of last month" -> "April 2026 Employee Attendance Report"
 * "Show sales performance for this quarter" -> "Q2 2026 Sales Performance Report"
 */
function generateReportTitle(userQuery: string, data: Record<string, unknown>[], columns: string[]): string {
  const queryLower = userQuery.toLowerCase();
  
  // Extract date indicators
  const monthMatch = extractMonth(userQuery);
  const quarterMatch = extractQuarter(userQuery);
  const yearMatch = extractYear(userQuery);
  
  // Extract subject/entity
  const subject = extractSubject(userQuery, columns);
  
  // Extract action/report type
  const reportTypeKeywords = {
    attendance: ['attendance', 'present', 'absent', 'leave', 'working hours'],
    sales: ['sales', 'revenue', 'profit', 'earning', 'transaction'],
    inventory: ['inventory', 'stock', 'product', 'material', 'warehouse'],
    production: ['production', 'output', 'manufacture', 'produce', 'factory'],
    performance: ['performance', 'efficiency', 'productivity', 'progress'],
    analysis: ['analysis', 'trend', 'comparison', 'forecast'],
  };
  
  let reportType = 'Report';
  for (const [type, keywords] of Object.entries(reportTypeKeywords)) {
    if (keywords.some(kw => queryLower.includes(kw))) {
      reportType = type.charAt(0).toUpperCase() + type.slice(1) + ' Report';
      break;
    }
  }
  
  // Build title
  let title = '';
  
  if (monthMatch) {
    title = `${monthMatch} ${yearMatch || new Date().getFullYear()} ${subject} ${reportType}`;
  } else if (quarterMatch) {
    title = `${quarterMatch} ${yearMatch || new Date().getFullYear()} ${subject} ${reportType}`;
  } else if (queryLower.includes('today') || queryLower.includes('daily')) {
    title = `Daily ${subject} ${reportType}`;
  } else if (queryLower.includes('this week') || queryLower.includes('weekly')) {
    title = `Weekly ${subject} ${reportType}`;
  } else if (queryLower.includes('this month') || queryLower.includes('monthly')) {
    const now = new Date();
    const monthName = new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
    title = `${monthName} ${now.getFullYear()} ${subject} ${reportType}`;
  } else if (queryLower.includes('year') || queryLower.includes('annual')) {
    const year = yearMatch || new Date().getFullYear();
    title = `${year} Annual ${subject} ${reportType}`;
  } else {
    title = `${subject} ${reportType}`;
  }
  
  return title.trim();
}

/**
 * Generates a comprehensive report description
 */
function generateReportDescription(userQuery: string, data: Record<string, unknown>[], title: string): string {
  const recordCount = data.length;
  const queryLower = userQuery.toLowerCase();
  
  // Determine focus areas based on query
  const focusAreas: string[] = [];
  
  if (queryLower.includes('attendance') || queryLower.includes('present')) {
    focusAreas.push('presence patterns', 'attendance metrics', 'absence analysis');
  } else if (queryLower.includes('sales') || queryLower.includes('revenue')) {
    focusAreas.push('revenue trends', 'sales performance', 'customer insights');
  } else if (queryLower.includes('inventory') || queryLower.includes('stock')) {
    focusAreas.push('stock levels', 'inventory status', 'material movement');
  } else if (queryLower.includes('production') || queryLower.includes('output')) {
    focusAreas.push('production metrics', 'efficiency rates', 'output analysis');
  } else if (queryLower.includes('performance') || queryLower.includes('efficiency')) {
    focusAreas.push('performance metrics', 'efficiency analysis', 'key indicators');
  }
  
  // Add generic analysis areas
  if (focusAreas.length === 0) {
    focusAreas.push('detailed analysis', 'trend insights', 'key metrics');
  }
  
  if (queryLower.includes('comparison') || queryLower.includes('vs')) {
    focusAreas.push('comparative analysis');
  }
  
  if (queryLower.includes('trend') || queryLower.includes('forecast')) {
    focusAreas.push('trend analysis');
  }
  
  const description = `${title} containing analysis of ${recordCount} records. This comprehensive report provides ${focusAreas.join(', ')}, and detailed insights based on the queried data.`;
  
  return description;
}

/**
 * Infers the report type from the user query
 */
function inferReportType(userQuery: string, columns: string[]): string {
  const queryLower = userQuery.toLowerCase();
  const columnStr = columns.map(c => c.toLowerCase()).join(' ');
  
  const typeMap: Record<string, string[]> = {
    'attendance': ['attendance', 'present', 'absent', 'leave', 'empname', 'vrdate'],
    'sales': ['sales', 'revenue', 'profit', 'product', 'order', 'customer', 'transaction'],
    'inventory': ['inventory', 'stock', 'material', 'warehouse', 'quantity', 'product_id'],
    'production': ['production', 'output', 'factory', 'manufacture', 'product', 'batch'],
    'financial': ['revenue', 'expense', 'profit', 'budget', 'cost', 'income'],
    'hr_analytics': ['employee', 'department', 'salary', 'hire_date', 'designation'],
  };
  
  for (const [type, keywords] of Object.entries(typeMap)) {
    if (keywords.some(kw => queryLower.includes(kw) || columnStr.includes(kw))) {
      return type;
    }
  }
  
  return 'custom';
}

/**
 * Extracts date range from query and data
 */
function extractDateRange(userQuery: string, data: Record<string, unknown>[], columns: string[]): { from: Date; to: Date } | undefined {
  // Find date columns
  const dateColumns = columns.filter(col => {
    const colLower = col.toLowerCase();
    return colLower.includes('date') || colLower.includes('time') || colLower.includes('vrdate');
  });
  
  if (dateColumns.length === 0 || data.length === 0) return undefined;
  
  // Extract dates from data
  const dates: Date[] = [];
  const dateCol = dateColumns[0];
  
  data.forEach(row => {
    const value = row[dateCol];
    if (value) {
      try {
        const dateValue = String(value);
        const date = new Date(dateValue);
        if (!isNaN(date.getTime())) {
          dates.push(date);
        }
      } catch (e) {
        // Skip invalid dates
      }
    }
  });
  
  if (dates.length < 2) return undefined;
  
  dates.sort((a, b) => a.getTime() - b.getTime());
  
  return {
    from: dates[0],
    to: dates[dates.length - 1],
  };
}

/**
 * Selects appropriate layout based on query complexity and data size
 * Modern layout for complex queries with lots of data
 * Minimal for simple/tabular data
 */
function selectLayout(userQuery: string, data: Record<string, unknown>[], reportType: string): 'modern' | 'minimal' {
  const queryComplexity = userQuery.split(' ').length;
  const dataSize = data.length;
  const hasComplexKeywords = [
    'trend', 'forecast', 'analysis', 'comparison', 'performance',
    'comprehensive', 'detailed', 'deep', 'advanced'
  ].some(kw => userQuery.toLowerCase().includes(kw));
  
  // Use modern layout for:
  // - Complex queries with many words
  // - Large datasets
  // - Queries with analysis keywords
  // - Sales/financial/performance reports
  
  if (queryComplexity > 15 || dataSize > 500 || hasComplexKeywords) {
    return 'modern';
  }
  
  if (['attendance', 'inventory'].includes(reportType) && dataSize < 200) {
    return 'minimal';
  }
  
  return dataSize > 300 ? 'modern' : 'minimal';
}

/**
 * Extracts summary statistics from the data
 */
function extractSummaryStats(
  data: Record<string, unknown>[],
  columns: string[],
  reportType: string
): { totalRecords: number; keyMetrics: string[]; analysisType: string } {
  const keyMetrics: string[] = [];
  
  // Identify numeric columns for metrics
  const numericCols = columns.filter(col => {
    const samples = data.slice(0, Math.min(5, data.length)).map(row => row[col]);
    return samples.some(val => typeof val === 'number' || !isNaN(parseFloat(String(val))));
  });
  
  // Extract key metrics
  numericCols.slice(0, 3).forEach(col => {
    keyMetrics.push(`${col} metrics`);
  });
  
  // Identify analysis type
  let analysisType = 'General Analysis';
  if (reportType === 'attendance') {
    analysisType = 'Attendance Analysis';
  } else if (reportType === 'sales') {
    analysisType = 'Sales Performance Analysis';
  } else if (reportType === 'inventory') {
    analysisType = 'Inventory Analysis';
  } else if (reportType === 'production') {
    analysisType = 'Production Analysis';
  }
  
  return {
    totalRecords: data.length,
    keyMetrics: keyMetrics.length > 0 ? keyMetrics : ['Record count', 'Data distribution'],
    analysisType,
  };
}

/**
 * Helper: Extract month name from query
 */
function extractMonth(query: string): string | null {
  const months = [
    'january', 'february', 'march', 'april', 'may', 'june',
    'july', 'august', 'september', 'october', 'november', 'december',
    'jan', 'feb', 'mar', 'apr', 'jun', 'jul', 'aug', 'sep', 'sept', 'oct', 'nov', 'dec'
  ];
  
  const queryLower = query.toLowerCase();
  for (const month of months) {
    if (queryLower.includes(month)) {
      const fullMonths = [
        'January', 'February', 'March', 'April', 'May', 'June',
        'July', 'August', 'September', 'October', 'November', 'December'
      ];
      const monthIndex = months.indexOf(month.toLowerCase());
      return fullMonths[monthIndex % 12];
    }
  }
  
  // Check for relative month references
  if (queryLower.includes('last month')) {
    const now = new Date();
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1);
    return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(lastMonth);
  }
  
  if (queryLower.includes('this month')) {
    const now = new Date();
    return new Intl.DateTimeFormat('en-US', { month: 'long' }).format(now);
  }
  
  return null;
}

/**
 * Helper: Extract quarter from query
 */
function extractQuarter(query: string): string | null {
  const queryLower = query.toLowerCase();
  
  if (queryLower.includes('q1') || queryLower.includes('first quarter')) return 'Q1';
  if (queryLower.includes('q2') || queryLower.includes('second quarter')) return 'Q2';
  if (queryLower.includes('q3') || queryLower.includes('third quarter')) return 'Q3';
  if (queryLower.includes('q4') || queryLower.includes('fourth quarter')) return 'Q4';
  
  if (queryLower.includes('this quarter')) {
    const now = new Date();
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    return `Q${quarter}`;
  }
  
  if (queryLower.includes('quarter')) {
    return 'Q1'; // Default to Q1 if quarter mentioned but not specified
  }
  
  return null;
}

/**
 * Helper: Extract year from query
 */
function extractYear(query: string): number | null {
  const yearMatch = query.match(/\b(20\d{2}|19\d{2})\b/);
  return yearMatch ? parseInt(yearMatch[0]) : null;
}

/**
 * Helper: Extract subject/entity from query and columns
 */
function extractSubject(query: string, columns: string[]): string {
  const queryLower = query.toLowerCase();
  
  // Subject keywords mapping
  const subjectMap: Record<string, string[]> = {
    'Employee': ['employee', 'empname', 'emp_', 'staff', 'personnel'],
    'Sales': ['sales', 'order', 'customer', 'transaction'],
    'Product': ['product', 'item', 'sku', 'inventory'],
    'Department': ['department', 'dept', 'division'],
    'Financial': ['financial', 'revenue', 'expense', 'profit'],
  };
  
  // Check query for subject keywords
  for (const [subject, keywords] of Object.entries(subjectMap)) {
    if (keywords.some(kw => queryLower.includes(kw))) {
      return subject;
    }
  }
  
  // Check columns for subject indicators
  for (const [subject, keywords] of Object.entries(subjectMap)) {
    const columnStr = columns.map(c => c.toLowerCase()).join(' ');
    if (keywords.some(kw => columnStr.includes(kw))) {
      return subject;
    }
  }
  
  return 'Data';
}
