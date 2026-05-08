import { ReportTemplate, ReportType } from '@/types';
import {
  TrendingUp,
  Users,
  Package,
  Factory,
  DollarSign,
  BarChart3,
  FileText,
} from 'lucide-react';

export const REPORT_TEMPLATES: Record<ReportType, ReportTemplate[]> = {
  sales: [
    {
      id: 'daily-sales',
      name: 'Daily Sales Report',
      description: 'Comprehensive daily sales analysis with top products, revenue trends, and customer insights',
      category: 'sales',
      icon: '📈',
      prompt: `Generate a daily sales report for today that includes:
1. Total sales revenue and comparison with yesterday
2. Top 5 best-selling products with quantities and revenue
3. Sales breakdown by category
4. Order count and average order value
5. Sales trend for the last 7 days
6. Regional/customer segment performance if available`,
      suggestedCharts: ['bar', 'line', 'pie', 'area'],
      sections: [
        {
          title: 'Sales Overview',
          description: 'High-level metrics and KPIs for the day',
          type: 'metrics',
        },
        {
          title: 'Top Products',
          description: 'Best performing products by revenue and quantity',
          type: 'chart',
          suggestedCharts: ['bar', 'pie'],
        },
        {
          title: 'Sales Trend',
          description: '7-day sales trend analysis',
          type: 'chart',
          suggestedCharts: ['line', 'area'],
        },
        {
          title: 'Category Breakdown',
          description: 'Sales distribution across categories',
          type: 'chart',
          suggestedCharts: ['pie', 'bar'],
        },
        {
          title: 'Detailed Transactions',
          description: 'Complete list of transactions for the day',
          type: 'table',
        },
      ],
      tags: ['daily', 'sales', 'revenue'],
      isBuiltIn: true,
    },
    {
      id: 'monthly-sales-analysis',
      name: 'Monthly Sales Analysis',
      description: 'In-depth analysis of monthly sales performance with trends, comparisons, and forecasts',
      category: 'sales',
      icon: '📊',
      prompt: `Generate a monthly sales analysis report that includes:
1. Monthly revenue total with comparison to previous months
2. Growth rate and trend analysis
3. Top 10 products by revenue
4. Sales by category - percentage breakdown
5. Customer acquisition and retention metrics
6. Average order value trends
7. Sales forecast for next month if possible
8. Performance comparison with targets`,
      suggestedCharts: ['bar', 'line', 'pie', 'area', 'stacked_bar'],
      sections: [
        {
          title: 'Monthly Summary',
          description: 'Key metrics and KPIs for the month',
          type: 'metrics',
        },
        {
          title: 'Revenue Trend',
          description: 'Revenue performance over months',
          type: 'chart',
          suggestedCharts: ['line', 'area'],
        },
        {
          title: 'Product Performance',
          description: 'Top selling products this month',
          type: 'chart',
          suggestedCharts: ['bar'],
        },
        {
          title: 'Category Distribution',
          description: 'Sales distribution by category',
          type: 'chart',
          suggestedCharts: ['pie', 'stacked_bar'],
        },
        {
          title: 'Detailed Sales Data',
          description: 'Complete monthly sales transactions',
          type: 'table',
        },
      ],
      tags: ['monthly', 'sales', 'analytics'],
      isBuiltIn: true,
    },
    {
      id: 'yearly-sales-summary',
      name: 'Yearly Sales Summary',
      description: 'Annual sales performance overview with quarterly comparisons and year-over-year analysis',
      category: 'sales',
      icon: '📅',
      prompt: `Generate a yearly sales summary report that includes:
1. Annual revenue with YoY comparison
2. Quarterly breakdown and trends
3. Monthly revenue progression throughout the year
4. Best and worst performing months
5. Top products for the year
6. Seasonal trends if applicable
7. Growth metrics and performance against targets`,
      suggestedCharts: ['line', 'bar', 'stacked_bar', 'area'],
      sections: [
        {
          title: 'Annual Performance',
          description: 'Year-over-year metrics and growth',
          type: 'metrics',
        },
        {
          title: 'Monthly Progression',
          description: 'Revenue trend throughout the year',
          type: 'chart',
          suggestedCharts: ['line', 'area'],
        },
        {
          title: 'Quarterly Analysis',
          description: 'Quarterly revenue and performance',
          type: 'chart',
          suggestedCharts: ['bar'],
        },
        {
          title: 'Top Products',
          description: 'Best performing products for the year',
          type: 'chart',
          suggestedCharts: ['bar'],
        },
      ],
      tags: ['yearly', 'sales', 'annual'],
      isBuiltIn: true,
    },
  ],
  attendance: [
    {
      id: 'daily-attendance',
      name: 'Daily Attendance Report',
      description: 'Today\'s attendance overview with present, absent, late, and on-leave employees',
      category: 'attendance',
      icon: '✓',
      prompt: `Generate a daily attendance report for today that includes:
1. Total employees, present count, absent count, late arrivals
2. Attendance percentage by department
3. List of absent employees
4. List of employees on leave with leave type
5. Late arrivals with check-in time
6. Department-wise breakdown`,
      suggestedCharts: ['pie', 'bar'],
      sections: [
        {
          title: 'Attendance Overview',
          description: 'Daily attendance metrics and statistics',
          type: 'metrics',
        },
        {
          title: 'Status Distribution',
          description: 'Present, Absent, Late, and Leave breakdown',
          type: 'chart',
          suggestedCharts: ['pie'],
        },
        {
          title: 'Department Analysis',
          description: 'Attendance by department',
          type: 'chart',
          suggestedCharts: ['bar'],
        },
        {
          title: 'Detailed Records',
          description: 'Complete attendance records for the day',
          type: 'table',
        },
      ],
      tags: ['daily', 'attendance', 'hr'],
      isBuiltIn: true,
    },
    {
      id: 'monthly-attendance-analysis',
      name: 'Monthly Attendance Analysis',
      description: 'Month-long attendance patterns with trends, problem areas, and performance metrics',
      category: 'attendance',
      icon: '📅',
      prompt: `Generate a monthly attendance analysis that includes:
1. Overall attendance percentage for the month
2. Number of absences, lates, and leaves
3. Most absent employees
4. Department-wise attendance comparison
5. Attendance trend over the month
6. Leave types distribution
7. Chronic absenteeism alerts
8. Attendance performance by employee tenure`,
      suggestedCharts: ['bar', 'line', 'pie'],
      sections: [
        {
          title: 'Monthly Attendance Summary',
          description: 'Aggregate attendance metrics for the month',
          type: 'metrics',
        },
        {
          title: 'Daily Attendance Trend',
          description: 'Attendance pattern throughout the month',
          type: 'chart',
          suggestedCharts: ['line'],
        },
        {
          title: 'Department Comparison',
          description: 'Attendance across departments',
          type: 'chart',
          suggestedCharts: ['bar'],
        },
        {
          title: 'Absence Analysis',
          description: 'Breakdown of absences, lates, and leaves',
          type: 'chart',
          suggestedCharts: ['pie', 'bar'],
        },
        {
          title: 'Detailed Analysis',
          description: 'Complete monthly attendance records',
          type: 'table',
        },
      ],
      tags: ['monthly', 'attendance', 'analytics'],
      isBuiltIn: true,
    },
    {
      id: 'yearly-attendance-report',
      name: 'Yearly Attendance Report',
      description: 'Annual attendance performance with trends, patterns, and employee insights',
      category: 'attendance',
      icon: '📈',
      prompt: `Generate a yearly attendance report that includes:
1. Annual attendance percentage
2. Total absences, lates, and leaves for the year
3. Monthly attendance trend
4. Most consistent and least consistent attendees
5. Leave type distribution for the year
6. Seasonal attendance patterns
7. Department performance comparison`,
      suggestedCharts: ['line', 'bar', 'pie'],
      sections: [
        {
          title: 'Annual Attendance Metrics',
          description: 'Year-over-year attendance performance',
          type: 'metrics',
        },
        {
          title: 'Monthly Trend',
          description: 'Attendance trend over all months',
          type: 'chart',
          suggestedCharts: ['line'],
        },
        {
          title: 'Leave Distribution',
          description: 'Types of leaves taken during the year',
          type: 'chart',
          suggestedCharts: ['pie'],
        },
      ],
      tags: ['yearly', 'attendance', 'annual'],
      isBuiltIn: true,
    },
  ],
  inventory: [
    {
      id: 'inventory-status',
      name: 'Inventory Status Report',
      description: 'Current inventory levels with low stock alerts and reorder recommendations',
      category: 'inventory',
      icon: '📦',
      prompt: `Generate an inventory status report that includes:
1. Total inventory value
2. Number of items in stock
3. Low stock items (below reorder level) - urgent list
4. Stock distribution by category
5. Most and least stocked items
6. Reorder recommendations
7. Stock age analysis if available`,
      suggestedCharts: ['bar', 'pie'],
      sections: [
        {
          title: 'Inventory Overview',
          description: 'Current inventory metrics and statistics',
          type: 'metrics',
        },
        {
          title: 'Stock Distribution',
          description: 'Inventory by category',
          type: 'chart',
          suggestedCharts: ['pie'],
        },
        {
          title: 'Low Stock Alerts',
          description: 'Items requiring reorder',
          type: 'table',
        },
        {
          title: 'Top Items',
          description: 'Most and least stocked items',
          type: 'chart',
          suggestedCharts: ['bar'],
        },
      ],
      tags: ['inventory', 'stock', 'alert'],
      isBuiltIn: true,
    },
    {
      id: 'inventory-movement',
      name: 'Inventory Movement Report',
      description: 'Inventory consumption and movement analysis with usage trends',
      category: 'inventory',
      icon: '📊',
      prompt: `Generate an inventory movement report that includes:
1. Items with highest movement/usage
2. Items with lowest movement
3. Average usage per item
4. Inventory turnover rate
5. Slow-moving inventory identification
6. Material consumption trends
7. Reorder frequency analysis`,
      suggestedCharts: ['bar', 'line'],
      sections: [
        {
          title: 'Movement Summary',
          description: 'Inventory movement metrics',
          type: 'metrics',
        },
        {
          title: 'High Movement Items',
          description: 'Most used materials',
          type: 'chart',
          suggestedCharts: ['bar'],
        },
        {
          title: 'Movement Trend',
          description: 'Inventory usage over time',
          type: 'chart',
          suggestedCharts: ['line'],
        },
        {
          title: 'Detailed Movement',
          description: 'Complete inventory movement records',
          type: 'table',
        },
      ],
      tags: ['inventory', 'movement', 'usage'],
      isBuiltIn: true,
    },
  ],
  production: [
    {
      id: 'production-status',
      name: 'Production Status Report',
      description: 'Current production orders status with progress and completion metrics',
      category: 'production',
      icon: '🏭',
      prompt: `Generate a production status report that includes:
1. Total production orders and their status breakdown
2. Completion percentage for in-progress orders
3. Completed orders this period
4. Orders behind schedule
5. Production by department
6. Production efficiency metrics
7. Resource utilization`,
      suggestedCharts: ['bar', 'pie', 'line'],
      sections: [
        {
          title: 'Production Metrics',
          description: 'Current production statistics',
          type: 'metrics',
        },
        {
          title: 'Order Status',
          description: 'Status distribution of production orders',
          type: 'chart',
          suggestedCharts: ['pie'],
        },
        {
          title: 'Department Production',
          description: 'Production output by department',
          type: 'chart',
          suggestedCharts: ['bar'],
        },
        {
          title: 'Orders List',
          description: 'Detailed production orders information',
          type: 'table',
        },
      ],
      tags: ['production', 'orders', 'status'],
      isBuiltIn: true,
    },
    {
      id: 'production-efficiency',
      name: 'Production Efficiency Report',
      description: 'Production performance analysis with efficiency metrics and improvements',
      category: 'production',
      icon: '⚡',
      prompt: `Generate a production efficiency report that includes:
1. Overall production efficiency percentage
2. On-time completion rate
3. Quality metrics (if available)
4. Productivity per department
5. Resource utilization rate
6. Bottlenecks and delays
7. Efficiency trend over time`,
      suggestedCharts: ['bar', 'line'],
      sections: [
        {
          title: 'Efficiency Metrics',
          description: 'Production performance indicators',
          type: 'metrics',
        },
        {
          title: 'Department Performance',
          description: 'Efficiency by department',
          type: 'chart',
          suggestedCharts: ['bar'],
        },
        {
          title: 'Efficiency Trend',
          description: 'Performance trend over time',
          type: 'chart',
          suggestedCharts: ['line'],
        },
      ],
      tags: ['production', 'efficiency', 'performance'],
      isBuiltIn: true,
    },
  ],
  hr_analytics: [
    {
      id: 'hr-overview',
      name: 'HR Overview Report',
      description: 'Comprehensive HR metrics including workforce, turnover, and performance',
      category: 'hr_analytics',
      icon: '👥',
      prompt: `Generate an HR overview report that includes:
1. Total workforce and active employees
2. Employee distribution by department
3. Employee distribution by designation
4. Turnover rate and trends
5. New hires this period
6. Terminations if any
7. HR headcount analytics`,
      suggestedCharts: ['pie', 'bar'],
      sections: [
        {
          title: 'Workforce Summary',
          description: 'HR metrics and workforce overview',
          type: 'metrics',
        },
        {
          title: 'Department Distribution',
          description: 'Employees by department',
          type: 'chart',
          suggestedCharts: ['pie'],
        },
        {
          title: 'Designation Breakdown',
          description: 'Employees by designation',
          type: 'chart',
          suggestedCharts: ['bar'],
        },
      ],
      tags: ['hr', 'workforce', 'analytics'],
      isBuiltIn: true,
    },
  ],
  financial: [
    {
      id: 'financial-summary',
      name: 'Financial Summary Report',
      description: 'Financial overview including revenue, expenses, and profitability',
      category: 'financial',
      icon: '💰',
      prompt: `Generate a financial summary report that includes:
1. Total revenue
2. Total expenses and cost breakdown
3. Gross profit and profit margin
4. Revenue trends
5. Expense breakdown by category
6. Cost per unit if applicable
7. Financial performance metrics`,
      suggestedCharts: ['bar', 'pie', 'line'],
      sections: [
        {
          title: 'Financial Metrics',
          description: 'Key financial indicators',
          type: 'metrics',
        },
        {
          title: 'Revenue vs Expense',
          description: 'Revenue and expense comparison',
          type: 'chart',
          suggestedCharts: ['bar'],
        },
        {
          title: 'Expense Breakdown',
          description: 'Expense distribution',
          type: 'chart',
          suggestedCharts: ['pie'],
        },
      ],
      tags: ['financial', 'revenue', 'expense'],
      isBuiltIn: true,
    },
  ],
  custom: [],
};

export const getAllTemplates = (): ReportTemplate[] => {
  return Object.values(REPORT_TEMPLATES).flat();
};

export const getTemplatesByCategory = (category: ReportType): ReportTemplate[] => {
  return REPORT_TEMPLATES[category] || [];
};

export const getTemplate = (id: string): ReportTemplate | undefined => {
  for (const templates of Object.values(REPORT_TEMPLATES)) {
    const template = templates.find((t) => t.id === id);
    if (template) return template;
  }
  return undefined;
};
