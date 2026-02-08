"use client";

import { useState } from 'react';
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
import { TrendingUp, TrendingDown, Download, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

const salesData = [
  { month: 'Jan', sales: 4000, revenue: 2400, target: 3500 },
  { month: 'Feb', sales: 3000, revenue: 1398, target: 3500 },
  { month: 'Mar', sales: 2000, revenue: 9800, target: 3500 },
  { month: 'Apr', sales: 2780, revenue: 3908, target: 3500 },
  { month: 'May', sales: 1890, revenue: 4800, target: 3500 },
  { month: 'Jun', sales: 2390, revenue: 3800, target: 3500 },
  { month: 'Jul', sales: 3490, revenue: 4300, target: 3500 },
];

const categoryData = [
  { name: 'Electronics', value: 35, color: 'hsl(var(--chart-1))' },
  { name: 'Clothing', value: 25, color: 'hsl(var(--chart-2))' },
  { name: 'Food', value: 20, color: 'hsl(var(--chart-3))' },
  { name: 'Others', value: 20, color: 'hsl(var(--chart-4))' },
];

const queryMetrics = [
  { day: 'Mon', queries: 145, avgTime: 0.45 },
  { day: 'Tue', queries: 198, avgTime: 0.52 },
  { day: 'Wed', queries: 167, avgTime: 0.38 },
  { day: 'Thu', queries: 234, avgTime: 0.41 },
  { day: 'Fri', queries: 189, avgTime: 0.55 },
  { day: 'Sat', queries: 98, avgTime: 0.32 },
  { day: 'Sun', queries: 67, avgTime: 0.28 },
];

const kpiCards = [
  { title: 'Total Revenue', value: 'PKR 2.4M', change: 12.5, trend: 'up' },
  { title: 'Total Orders', value: '1,234', change: 8.2, trend: 'up' },
  { title: 'Avg Order Value', value: 'PKR 1,945', change: -2.1, trend: 'down' },
  { title: 'Conversion Rate', value: '3.2%', change: 0.5, trend: 'up' },
];

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d');

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h2 className="text-2xl font-bold mb-1">Analytics</h2>
          <p className="text-muted-foreground">
            Data visualizations and insights
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-36">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 90 days</SelectItem>
              <SelectItem value="1y">Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button variant="outline">
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpiCards.map((kpi) => (
          <Card key={kpi.title} className="p-6">
            <p className="text-sm text-muted-foreground mb-2">{kpi.title}</p>
            <p className="text-3xl font-bold mb-2">{kpi.value}</p>
            <div
              className={cn(
                'flex items-center gap-1 text-sm',
                kpi.trend === 'up' ? 'text-success' : 'text-destructive'
              )}
            >
              {kpi.trend === 'up' ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span>
                {kpi.change > 0 ? '+' : ''}
                {kpi.change}%
              </span>
              <span className="text-muted-foreground">vs last period</span>
            </div>
          </Card>
        ))}
      </div>

      {/* Charts Tabs */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="sales">Sales</TabsTrigger>
          <TabsTrigger value="queries">Query Stats</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Revenue Trend */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Revenue Trend</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={salesData}>
                    <defs>
                      <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="month" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Area
                      type="monotone"
                      dataKey="revenue"
                      stroke="hsl(var(--primary))"
                      fillOpacity={1}
                      fill="url(#colorRevenue)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Category Distribution */}
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Sales by Category</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="sales" className="space-y-4">
          <Card className="p-6">
            <h3 className="font-semibold mb-4">Sales vs Target</h3>
            <div className="h-[400px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px',
                    }}
                  />
                  <Legend />
                  <Bar dataKey="sales" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="target" fill="hsl(var(--muted))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="queries" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="p-6">
              <h3 className="font-semibold mb-4">Daily Queries</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={queryMetrics}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Bar dataKey="queries" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            <Card className="p-6">
              <h3 className="font-semibold mb-4">Avg Response Time</h3>
              <div className="h-[300px]">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={queryMetrics}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                    <XAxis dataKey="day" className="text-xs" />
                    <YAxis className="text-xs" />
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                      }}
                    />
                    <Line
                      type="monotone"
                      dataKey="avgTime"
                      stroke="hsl(var(--chart-2))"
                      strokeWidth={2}
                      dot={{ fill: 'hsl(var(--chart-2))' }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
