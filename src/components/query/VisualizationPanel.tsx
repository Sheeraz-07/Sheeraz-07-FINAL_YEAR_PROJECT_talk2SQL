import { useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import {
  ResponsiveContainer,
  CartesianGrid,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  ScatterChart,
  Scatter,
  ComposedChart,
  ReferenceLine,
} from 'recharts';
import { MinusCircle, PlusCircle } from 'lucide-react';
import type {
  QueryResult,
  VisualizationChartSpec,
  VisualizationChartType,
  VisualizationResponse,
} from '@/types';

const CHART_LABELS: Record<VisualizationChartType, string> = {
  bar: 'Bar Chart',
  line: 'Line Chart',
  pie: 'Pie Chart',
  scatter: 'Scatter Plot',
  histogram: 'Histogram',
  box: 'Box Plot',
  area: 'Area Chart',
  stacked_bar: 'Stacked Bar Chart',
  grouped_bar: 'Grouped Bar Chart',
  table: 'Table View',
};

const PALETTE = ['#2563eb', '#f97316', '#14b8a6', '#f59e0b', '#8b5cf6', '#ef4444', '#10b981', '#3b82f6'];

type Props = {
  result: QueryResult;
};

function toNumber(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value;
  if (typeof value === 'string' && value.trim() !== '') {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function quantile(sortedValues: number[], q: number): number {
  if (!sortedValues.length) return 0;
  const pos = (sortedValues.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;
  if (sortedValues[base + 1] !== undefined) {
    return sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base]);
  }
  return sortedValues[base];
}

function computeHistogram(rows: Record<string, unknown>[], column: string, bins = 8) {
  const values = rows.map((r) => toNumber(r[column])).filter((v): v is number => v !== null);
  if (!values.length) return [] as Array<{ range: string; count: number }>;

  const min = Math.min(...values);
  const max = Math.max(...values);
  if (min === max) {
    return [{ range: `${min}`, count: values.length }];
  }

  const width = (max - min) / bins;
  const bucketCounts = Array.from({ length: bins }, () => 0);

  for (const value of values) {
    const index = Math.min(Math.floor((value - min) / width), bins - 1);
    bucketCounts[index] += 1;
  }

  return bucketCounts.map((count, index) => {
    const start = min + index * width;
    const end = start + width;
    return {
      range: `${start.toFixed(1)}-${end.toFixed(1)}`,
      count,
    };
  });
}

function computeBoxData(rows: Record<string, unknown>[], column: string) {
  const values = rows.map((r) => toNumber(r[column])).filter((v): v is number => v !== null).sort((a, b) => a - b);
  if (!values.length) return null;

  const min = values[0];
  const q1 = quantile(values, 0.25);
  const median = quantile(values, 0.5);
  const q3 = quantile(values, 0.75);
  const max = values[values.length - 1];

  return {
    label: column,
    floor: q1,
    box: q3 - q1,
    min,
    median,
    max,
  };
}

function buildSeriesData(
  rows: Record<string, unknown>[],
  xColumn: string,
  seriesColumn: string,
  yColumn: string
): { data: Array<Record<string, unknown>>; seriesKeys: string[] } {
  const grouped: Record<string, Record<string, unknown>> = {};
  const seriesSet = new Set<string>();

  for (const row of rows) {
    const x = String(row[xColumn] ?? 'Unknown');
    const series = String(row[seriesColumn] ?? 'Unknown');
    const y = toNumber(row[yColumn]) ?? 0;

    if (!grouped[x]) grouped[x] = { [xColumn]: x };
    grouped[x][series] = ((grouped[x][series] as number) || 0) + y;
    seriesSet.add(series);
  }

  return {
    data: Object.values(grouped),
    seriesKeys: Array.from(seriesSet).slice(0, 8),
  };
}

function fallbackSpec(type: VisualizationChartType, visualization: VisualizationResponse): VisualizationChartSpec {
  const metadata = visualization.metadata;
  const numeric = metadata.numeric_columns;
  const categorical = metadata.categorical_columns;
  const datetimeCols = metadata.datetime_columns;

  switch (type) {
    case 'bar':
      return { type, x: categorical[0], y: numeric[0], title: 'Bar Chart' };
    case 'line':
      return { type, x: datetimeCols[0] || categorical[0], y: numeric[0], title: 'Line Chart' };
    case 'area':
      return { type, x: datetimeCols[0] || categorical[0], y: numeric[0], title: 'Area Chart' };
    case 'pie':
      return { type, labels: categorical[0], values: numeric[0], title: 'Pie Chart' };
    case 'scatter':
      return { type, x: numeric[0], y: numeric[1], title: 'Scatter Plot' };
    case 'histogram':
      return { type, x: numeric[0], title: 'Histogram' };
    case 'box':
      return { type, x: numeric[0], title: 'Box Plot' };
    case 'stacked_bar':
    case 'grouped_bar':
      return { type, x: categorical[0], series: categorical[1], y: numeric[0], title: CHART_LABELS[type] };
    default:
      return { type, title: CHART_LABELS[type] };
  }
}

function toChartData(rows: Record<string, unknown>[], spec: VisualizationChartSpec) {
  const x = spec.x;
  const y = spec.y;
  if (!x || !y) return [] as Array<Record<string, unknown>>;

  return rows.map((row) => ({
    ...row,
    [x]: String(row[x] ?? ''),
    [y]: toNumber(row[y]) ?? 0,
  }));
}

function ChartCard({ spec, rows }: { spec: VisualizationChartSpec; rows: Record<string, unknown>[] }) {
  const chartData = useMemo(() => toChartData(rows, spec), [rows, spec]);

  if (spec.type === 'table') {
    const preview = rows.slice(0, 10);
    return (
      <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-slate-700">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 dark:bg-slate-800">
            <tr>
              {Object.keys(preview[0] || {}).map((key) => (
                <th key={key} className="px-3 py-2 text-left font-semibold">
                  {key}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {preview.map((row, index) => (
              <tr key={index} className="border-t border-slate-200 dark:border-slate-700">
                {Object.keys(preview[0] || {}).map((key) => (
                  <td key={key} className="px-3 py-2">
                    {String(row[key] ?? '-')}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    );
  }

  if (spec.type === 'histogram' && spec.x) {
    const bins = computeHistogram(rows, spec.x);
    return (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={bins}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="range" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="count" fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (spec.type === 'box' && spec.x) {
    const box = computeBoxData(rows, spec.x);
    if (!box) {
      return <p className="text-sm text-muted-foreground">Not enough numeric values for box plot.</p>;
    }

    return (
      <ResponsiveContainer width="100%" height={280}>
        <ComposedChart data={[box]}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="label" />
          <YAxis />
          <Tooltip />
          <Bar dataKey="floor" stackId="box" fill="transparent" />
          <Bar dataKey="box" stackId="box" fill="#3b82f6" radius={[4, 4, 0, 0]} />
          <ReferenceLine y={box.median} stroke="#ef4444" strokeWidth={2} />
          <ReferenceLine y={box.min} stroke="#64748b" strokeDasharray="4 4" />
          <ReferenceLine y={box.max} stroke="#64748b" strokeDasharray="4 4" />
        </ComposedChart>
      </ResponsiveContainer>
    );
  }

  if ((spec.type === 'stacked_bar' || spec.type === 'grouped_bar') && spec.x && spec.series && spec.y) {
    const { data, seriesKeys } = buildSeriesData(rows, spec.x, spec.series, spec.y);
    return (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={spec.x} />
          <YAxis />
          <Tooltip />
          <Legend />
          {seriesKeys.map((key, index) => (
            <Bar
              key={key}
              dataKey={key}
              fill={PALETTE[index % PALETTE.length]}
              stackId={spec.type === 'stacked_bar' ? 'group' : undefined}
            />
          ))}
        </BarChart>
      </ResponsiveContainer>
    );
  }

  if (spec.type === 'pie' && spec.labels && spec.values) {
    const pieData = rows.map((row) => ({
      name: String(row[spec.labels!] ?? 'Unknown'),
      value: toNumber(row[spec.values!]) ?? 0,
    }));

    return (
      <ResponsiveContainer width="100%" height={280}>
        <PieChart>
          <Tooltip />
          <Legend />
          <Pie data={pieData} dataKey="value" nameKey="name" outerRadius={95} label>
            {pieData.map((_, index) => (
              <Cell key={index} fill={PALETTE[index % PALETTE.length]} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
    );
  }

  if (spec.type === 'scatter' && spec.x && spec.y) {
    const scatterData = rows
      .map((row) => ({
        x: toNumber(row[spec.x!]),
        y: toNumber(row[spec.y!]),
      }))
      .filter((point) => point.x !== null && point.y !== null) as Array<{ x: number; y: number }>;

    return (
      <ResponsiveContainer width="100%" height={280}>
        <ScatterChart>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="x" name={spec.x} />
          <YAxis dataKey="y" name={spec.y} />
          <Tooltip cursor={{ strokeDasharray: '3 3' }} />
          <Scatter data={scatterData} fill="#2563eb" />
        </ScatterChart>
      </ResponsiveContainer>
    );
  }

  if (spec.type === 'line' && spec.x && spec.y) {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <LineChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={spec.x} />
          <YAxis />
          <Tooltip />
          <Line type="monotone" dataKey={spec.y} stroke="#2563eb" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    );
  }

  if (spec.type === 'area' && spec.x && spec.y) {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <AreaChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={spec.x} />
          <YAxis />
          <Tooltip />
          <Area type="monotone" dataKey={spec.y} stroke="#2563eb" fill="#93c5fd" />
        </AreaChart>
      </ResponsiveContainer>
    );
  }

  if (spec.type === 'bar' && spec.x && spec.y) {
    return (
      <ResponsiveContainer width="100%" height={280}>
        <BarChart data={chartData}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey={spec.x} />
          <YAxis />
          <Tooltip />
          <Bar dataKey={spec.y} fill="#2563eb" />
        </BarChart>
      </ResponsiveContainer>
    );
  }

  return <p className="text-sm text-muted-foreground">Unable to render this chart with current dataset.</p>;
}

export function VisualizationPanel({ result }: Props) {
  const visualization = result.visualization;

  const initialTypes = useMemo(
    () => (visualization?.default_charts || []).map((c) => c.type),
    [visualization]
  );

  const [activeTypes, setActiveTypes] = useState<VisualizationChartType[]>(initialTypes);
  const [pendingType, setPendingType] = useState<VisualizationChartType | ''>('');

  useEffect(() => {
    setActiveTypes(initialTypes);
    setPendingType('');
  }, [result.id, initialTypes]);

  if (!visualization) {
    return (
      <Card className="p-5 border-2 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700">
        <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
          Not enough structured data for visualization
        </p>
      </Card>
    );
  }

  const available = visualization.available_charts || [];

  const activeSpecs = activeTypes.map((type) => {
    const fromBackend = (visualization.default_charts || []).find((c) => c.type === type);
    return fromBackend || fallbackSpec(type, visualization);
  });

  const remaining = available.filter((type) => !activeTypes.includes(type));

  const addChart = () => {
    if (!pendingType) return;
    setActiveTypes((prev) => [...prev, pendingType]);
    setPendingType('');
  };

  const removeChart = (type: VisualizationChartType) => {
    setActiveTypes((prev) => prev.filter((t) => t !== type));
  };

  const fallbackMessage = visualization.fallback_message || visualization.suggestion;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-2 flex-wrap">
          <h3 className="text-lg font-bold">Recommended Visualizations</h3>
          {visualization.metadata.aggregation_present && (
            <Badge variant="outline" className="font-semibold">Aggregated Data</Badge>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Select
            value={pendingType || undefined}
            onValueChange={(value: VisualizationChartType) => setPendingType(value)}
          >
            <SelectTrigger className="w-52 h-10 rounded-full">
              <SelectValue placeholder="More Visualizations" />
            </SelectTrigger>
            <SelectContent>
              {remaining.map((type) => (
                <SelectItem key={type} value={type}>
                  {CHART_LABELS[type]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button
            variant="outline"
            className="rounded-full h-10"
            onClick={addChart}
            disabled={!pendingType}
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Add
          </Button>
        </div>
      </div>

      {fallbackMessage && (
        <Card className="p-3 border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/60">
          <p className="text-sm text-muted-foreground">{fallbackMessage}</p>
        </Card>
      )}

      {!activeSpecs.length && (
        <Card className="p-5 border-2 border-amber-200 bg-amber-50 dark:bg-amber-900/20 dark:border-amber-700">
          <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
            Not enough structured data for visualization
          </p>
        </Card>
      )}

      {activeSpecs.map((spec) => (
        <Card key={`${result.id}-${spec.type}`} className="p-5 space-y-3 rounded-2xl border-0 shadow-lg bg-white/90 dark:bg-slate-900/90">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h4 className="text-base font-bold">{spec.title || CHART_LABELS[spec.type]}</h4>
              {spec.reason && <p className="text-sm text-muted-foreground">{spec.reason}</p>}
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => removeChart(spec.type)}
              className="rounded-full"
            >
              <MinusCircle className="h-4 w-4 mr-2" />
              Remove
            </Button>
          </div>
          <ChartCard spec={spec} rows={result.results} />
        </Card>
      ))}
    </div>
  );
}
