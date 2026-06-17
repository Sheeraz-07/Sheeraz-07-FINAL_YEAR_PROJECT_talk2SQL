'use client';

import React, { useMemo } from 'react';
import {
  ResponsiveContainer,
  BarChart,
  LineChart,
  AreaChart,
  PieChart,
  ScatterChart,
  ComposedChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Bar,
  Line,
  Area,
  Pie,
  Scatter,
  Cell,
  ReferenceLine,
} from 'recharts';
import { Card } from '@/components/ui/card';
import { ChartType } from '@/types';

interface ReportVisualizationProps {
  title: string;
  description?: string;
  chartType: ChartType;
  data: Record<string, unknown>[];
  xAxis?: string;
  yAxis?: string;
  labels?: string;
  values?: string;
  series?: string;
}

const COLORS = ['#3b82f6', '#ef4444', '#10b981', '#f59e0b', '#8b5cf6', '#06b6d4', '#ec4899', '#14b8a6'];

const toNumber = (value: unknown): number | null => {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

function renderBarChart(data: Record<string, unknown>[], xAxis?: string, yAxis?: string) {
  if (!xAxis || !yAxis) return null;
  const chartData = data.map((row) => ({
    ...row,
    [xAxis]: String(row[xAxis] ?? ''),
    [yAxis]: toNumber(row[yAxis]) ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 12, right: 20, left: 0, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey={xAxis} angle={-45} textAnchor="end" height={60} />
        <YAxis />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
        <Bar dataKey={yAxis} fill="#3b82f6" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}

function renderLineChart(data: Record<string, unknown>[], xAxis?: string, yAxis?: string) {
  if (!xAxis || !yAxis) return null;
  const chartData = data.map((row) => ({
    ...row,
    [xAxis]: String(row[xAxis] ?? ''),
    [yAxis]: toNumber(row[yAxis]) ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <LineChart data={chartData} margin={{ top: 12, right: 20, left: 0, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey={xAxis} angle={-45} textAnchor="end" height={60} />
        <YAxis />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
        <Legend />
        <Line type="monotone" dataKey={yAxis} stroke="#3b82f6" strokeWidth={2} dot={{ fill: '#3b82f6', r: 4 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

function renderAreaChart(data: Record<string, unknown>[], xAxis?: string, yAxis?: string) {
  if (!xAxis || !yAxis) return null;
  const chartData = data.map((row) => ({
    ...row,
    [xAxis]: String(row[xAxis] ?? ''),
    [yAxis]: toNumber(row[yAxis]) ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <AreaChart data={chartData} margin={{ top: 12, right: 20, left: 0, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey={xAxis} angle={-45} textAnchor="end" height={60} />
        <YAxis />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
        <Area type="monotone" dataKey={yAxis} stroke="#3b82f6" fill="#93c5fd" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

function renderPieChart(data: Record<string, unknown>[], labels?: string, values?: string) {
  if (!labels || !values) return null;
  const pieData = data.map((row) => ({
    name: String(row[labels] ?? 'Unknown'),
    value: toNumber(row[values]) ?? 0,
  }));

  return (
    <ResponsiveContainer width="100%" height={280}>
      <PieChart>
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
        <Legend />
        <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={95} label>
          {pieData.map((_, index) => (
            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
          ))}
        </Pie>
      </PieChart>
    </ResponsiveContainer>
  );
}

function renderStackedBarChart(
  data: Record<string, unknown>[],
  xAxis?: string,
  series?: string,
  yAxis?: string
) {
  if (!xAxis || !series || !yAxis) return null;

  const grouped: Record<string, Record<string, unknown>> = {};
  const seriesSet = new Set<string>();

  for (const row of data) {
    const x = String(row[xAxis] ?? 'Unknown');
    const s = String(row[series] ?? 'Unknown');
    const y = toNumber(row[yAxis]) ?? 0;

    if (!grouped[x]) grouped[x] = { [xAxis]: x };
    grouped[x][s] = ((grouped[x][s] as number) || 0) + y;
    seriesSet.add(s);
  }

  const chartData = Object.values(grouped);
  const seriesKeys = Array.from(seriesSet).slice(0, 8);

  return (
    <ResponsiveContainer width="100%" height={280}>
      <BarChart data={chartData} margin={{ top: 12, right: 20, left: 0, bottom: 50 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
        <XAxis dataKey={xAxis} angle={-45} textAnchor="end" height={60} />
        <YAxis />
        <Tooltip contentStyle={{ backgroundColor: '#1e293b', border: 'none', borderRadius: '8px', color: '#fff' }} />
        <Legend />
        {seriesKeys.map((key, index) => (
          <Bar key={key} dataKey={key} stackId="group" fill={COLORS[index % COLORS.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );
}

export function ReportVisualization({
  title,
  description,
  chartType,
  data,
  xAxis,
  yAxis,
  labels,
  values,
  series,
}: ReportVisualizationProps) {
  if (!data || data.length === 0) {
    return (
      <Card className="p-8 text-center">
        <p className="text-muted-foreground text-sm">No data available for visualization</p>
      </Card>
    );
  }

  const renderChart = () => {
    switch (chartType) {
      case 'bar':
        return renderBarChart(data, xAxis, yAxis);
      case 'line':
        return renderLineChart(data, xAxis, yAxis);
      case 'area':
        return renderAreaChart(data, xAxis, yAxis);
      case 'pie':
        return renderPieChart(data, labels, values);
      case 'stacked_bar':
        return renderStackedBarChart(data, xAxis, series, yAxis);
      default:
        return (
          <div className="text-center py-8 text-muted-foreground">
            Chart type '{chartType}' is not supported
          </div>
        );
    }
  };

  return (
    <div className="space-y-3">
      <div>
        <h3 className="text-base font-semibold text-foreground">{title}</h3>
        {description && <p className="text-sm text-muted-foreground mt-1">{description}</p>}
      </div>
      <Card className="p-4 border-slate-200 dark:border-slate-700 bg-white/50 dark:bg-slate-950/50">
        {renderChart()}
      </Card>
    </div>
  );
}
