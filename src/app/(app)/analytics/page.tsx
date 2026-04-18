"use client";

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  AreaChart,
  Area,
} from 'recharts';
import { TrendingUp, TrendingDown, Download, RefreshCw, AlertTriangle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useQueryStore } from '@/stores/queryStore';
import { useAuthStore } from '@/stores/authStore';
import { toast } from 'sonner';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
const PIE_COLORS = ['#2563eb', '#10b981', '#f59e0b', '#a855f7', '#ef4444', '#0ea5e9'];

interface KPIValue {
  value: number;
  change_pct: number;
}

interface AnalyticsResponse {
  request_id: string;
  database: string;
  range_days: number;
  generated_at: string;
  kpis: {
    total_revenue: KPIValue;
    total_orders: KPIValue;
    avg_order_value: KPIValue;
    fulfillment_rate: KPIValue;
    attendance_rate: KPIValue;
    low_stock_items: KPIValue;
  };
  charts: {
    sales_trend: Array<{ day: string; revenue: number; orders: number }>;
    attendance_trend: Array<{ day: string; attendance_rate: number }>;
    category_mix: Array<{ category: string; revenue: number }>;
    top_products: Array<{ product_name: string; units_sold: number; revenue: number }>;
    department_productivity: Array<{ department: string; completed_qty: number; target_qty: number; completion_rate: number }>;
  };
  alerts: {
    low_stock_items: Array<{ material_name: string; current_stock: number; reorder_level: number; deficit: number }>;
  };
}

const EMPTY_ANALYTICS: AnalyticsResponse = {
  request_id: '',
  database: 'supabase',
  range_days: 30,
  generated_at: new Date().toISOString(),
  kpis: {
    total_revenue: { value: 0, change_pct: 0 },
    total_orders: { value: 0, change_pct: 0 },
    avg_order_value: { value: 0, change_pct: 0 },
    fulfillment_rate: { value: 0, change_pct: 0 },
    attendance_rate: { value: 0, change_pct: 0 },
    low_stock_items: { value: 0, change_pct: 0 },
  },
  charts: {
    sales_trend: [],
    attendance_trend: [],
    category_mix: [],
    top_products: [],
    department_productivity: [],
  },
  alerts: {
    low_stock_items: [],
  },
};

function compactDateLabel(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric' }).format(date);
}

function formatCurrency(value: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'PKR',
    maximumFractionDigits: 0,
  }).format(value);
}

function formatPercent(value: number) {
  return `${value.toFixed(1)}%`;
}

export default function AnalyticsPage() {
  const selectedDatabase = useQueryStore((state) => state.selectedDatabase);
  const token = useAuthStore((state) => state.token);
  const [dateRange, setDateRange] = useState('30');
  const [loading, setLoading] = useState(false);
  const [analytics, setAnalytics] = useState<AnalyticsResponse>(EMPTY_ANALYTICS);

  const fetchAnalytics = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({
        range_days: dateRange,
        database: selectedDatabase,
      });

      const response = await fetch(`${API_BASE}/api/analytics?${params.toString()}`, {
        method: 'GET',
        headers: token ? { Authorization: `Bearer ${token}` } : undefined,
      });

      const payload = await response.json().catch(() => null);
      if (!response.ok || !payload) {
        throw new Error(payload?.detail || `HTTP ${response.status}`);
      }

      setAnalytics(payload as AnalyticsResponse);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Unable to load analytics';
      toast.error(`Analytics fetch failed: ${message}`);
      setAnalytics(EMPTY_ANALYTICS);
    } finally {
      setLoading(false);
    }
  }, [dateRange, selectedDatabase, token]);

  useEffect(() => {
    fetchAnalytics();
  }, [fetchAnalytics]);

  const kpiCards = useMemo(
    () => [
      {
        title: 'Total Revenue',
        value: formatCurrency(analytics.kpis.total_revenue.value),
        change: analytics.kpis.total_revenue.change_pct,
      },
      {
        title: 'Total Orders',
        value: analytics.kpis.total_orders.value.toLocaleString(),
        change: analytics.kpis.total_orders.change_pct,
      },
      {
        title: 'Avg Order Value',
        value: formatCurrency(analytics.kpis.avg_order_value.value),
        change: analytics.kpis.avg_order_value.change_pct,
      },
      {
        title: 'Fulfillment Rate',
        value: formatPercent(analytics.kpis.fulfillment_rate.value),
        change: analytics.kpis.fulfillment_rate.change_pct,
      },
      {
        title: 'Attendance Rate',
        value: formatPercent(analytics.kpis.attendance_rate.value),
        change: analytics.kpis.attendance_rate.change_pct,
      },
      {
        title: 'Low Stock Items',
        value: analytics.kpis.low_stock_items.value.toLocaleString(),
        change: analytics.kpis.low_stock_items.change_pct,
      },
    ],
    [analytics]
  );

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(analytics, null, 2)], {
      type: 'application/json;charset=utf-8;',
    });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `analytics_${analytics.database}_${analytics.range_days}d.json`;
    anchor.click();
    URL.revokeObjectURL(url);
    toast.success('Analytics snapshot exported');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Organization Analytics</h2>
          <p className="text-muted-foreground">
            Decision intelligence from live {selectedDatabase === 'sql_server' ? 'SQL Server' : 'Supabase'} data
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
              <SelectItem value="365">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" onClick={fetchAnalytics} disabled={loading}>
            <RefreshCw className={cn('h-4 w-4 mr-2', loading && 'animate-spin')} />
            Refresh
          </Button>
          <Button variant="outline" onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
        {kpiCards.map((kpi) => {
          const up = kpi.change >= 0;
          return (
            <Card key={kpi.title} className="p-5">
              <p className="text-sm text-muted-foreground mb-1">{kpi.title}</p>
              <p className="text-2xl font-bold mb-2">{kpi.value}</p>
              <div className={cn('flex items-center gap-1 text-xs', up ? 'text-emerald-600' : 'text-red-600')}>
                {up ? <TrendingUp className="h-3.5 w-3.5" /> : <TrendingDown className="h-3.5 w-3.5" />}
                <span>{up ? '+' : ''}{kpi.change.toFixed(1)}%</span>
                <span className="text-muted-foreground">vs previous period</span>
              </div>
            </Card>
          );
        })}
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="commercial">Commercial</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Revenue Trend</h3>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={analytics.charts.sales_trend}>
                    <defs>
                      <linearGradient id="revenueFill" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#2563eb" stopOpacity={0.35} />
                        <stop offset="95%" stopColor="#2563eb" stopOpacity={0.02} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tickFormatter={compactDateLabel} className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `${Math.round(v / 1000)}K`} />
                    <Tooltip
                      labelFormatter={(v) => compactDateLabel(String(v))}
                      formatter={(v: number) => formatCurrency(v)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area type="monotone" dataKey="revenue" stroke="#2563eb" fill="url(#revenueFill)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Category Revenue Mix</h3>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={analytics.charts.category_mix}
                      dataKey="revenue"
                      nameKey="category"
                      innerRadius={65}
                      outerRadius={108}
                      paddingAngle={2}
                    >
                      {analytics.charts.category_mix.map((entry, index) => (
                        <Cell key={`${entry.category}-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="commercial" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Orders Trend</h3>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.charts.sales_trend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tickFormatter={compactDateLabel} className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip labelFormatter={(v) => compactDateLabel(String(v))} />
                    <Bar dataKey="orders" fill="#0ea5e9" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Top Products by Revenue</h3>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.charts.top_products} layout="vertical" margin={{ left: 20, right: 10 }}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis type="number" className="text-xs" />
                    <YAxis type="category" dataKey="product_name" width={150} className="text-xs" />
                    <Tooltip formatter={(v: number) => formatCurrency(v)} />
                    <Bar dataKey="revenue" fill="#10b981" radius={[0, 5, 5, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="operations" className="space-y-4">
          <div className="grid grid-cols-1 xl:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Attendance Trend</h3>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={analytics.charts.attendance_trend}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" tickFormatter={compactDateLabel} className="text-xs" />
                    <YAxis className="text-xs" domain={[0, 100]} tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} labelFormatter={(v) => compactDateLabel(String(v))} />
                    <Line type="monotone" dataKey="attendance_rate" stroke="#a855f7" strokeWidth={2.2} dot={{ fill: '#a855f7' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Department Productivity</h3>
              <div className="h-[320px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={analytics.charts.department_productivity}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="department" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(v) => `${v}%`} />
                    <Tooltip formatter={(v: number) => `${v.toFixed(1)}%`} />
                    <Legend />
                    <Bar dataKey="completion_rate" name="Completion Rate" fill="#f59e0b" radius={[5, 5, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>

          <Card className="p-6">
            <div className="flex items-center gap-2 mb-4">
              <AlertTriangle className="h-5 w-5 text-amber-500" />
              <h3 className="font-semibold">Low Stock Risk List</h3>
            </div>
            {analytics.alerts.low_stock_items.length ? (
              <div className="overflow-auto rounded-xl border border-border">
                <table className="w-full text-sm">
                  <thead className="bg-muted/60">
                    <tr>
                      <th className="px-4 py-2 text-left">Material</th>
                      <th className="px-4 py-2 text-left">Current Stock</th>
                      <th className="px-4 py-2 text-left">Reorder Level</th>
                      <th className="px-4 py-2 text-left">Deficit</th>
                    </tr>
                  </thead>
                  <tbody>
                    {analytics.alerts.low_stock_items.map((item) => (
                      <tr key={item.material_name} className="border-t border-border">
                        <td className="px-4 py-2">{item.material_name}</td>
                        <td className="px-4 py-2">{item.current_stock}</td>
                        <td className="px-4 py-2">{item.reorder_level}</td>
                        <td className="px-4 py-2 font-semibold text-red-600">{item.deficit}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">No low-stock alerts for this period.</p>
            )}
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
