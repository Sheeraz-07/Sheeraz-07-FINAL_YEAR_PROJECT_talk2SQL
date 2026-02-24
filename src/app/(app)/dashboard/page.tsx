"use client";

import {
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
} from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { QuickQuery } from '@/components/dashboard/QuickQuery';
import { RecentQueryList } from '@/components/dashboard/RecentQueryList';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { ShortcutsGrid } from '@/components/dashboard/ShortcutsGrid';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const mockStats = {
  totalQueries: 1234,
  queriesChange: 12,
  activeDatabases: 2,
  reportsGenerated: 45,
  avgResponseTime: 0.45,
  // Garment-specific stats
  totalEmployees: 235,
  activeOrders: 12,
  lowStockItems: 5,
  todaySales: 485000,
};

const mockInsights = [
  {
    id: '1',
    title: 'Sales Increased',
    description: 'Sales revenue increased by 23% compared to last week. Top sellers: Dress Shirts, Kurtas.',
    trend: 'up' as const,
    value: '+PKR 234,500',
  },
  {
    id: '2',
    title: 'Low Stock Alert',
    description: '5 raw materials are below reorder level: Cotton Fabric, Metal Buttons, Silk Thread.',
    trend: 'alert' as const,
  },
  {
    id: '3',
    title: 'Production On Track',
    description: '3 production orders completed today. 8 orders in progress.',
    trend: 'up' as const,
    value: '85% efficiency',
  },
  {
    id: '4',
    title: 'Attendance Today',
    description: '228 employees present, 5 on leave, 2 absent.',
    trend: 'neutral' as const,
    value: '97% rate',
  },
];

const salesChartData = [
  { name: 'Mon', mens: 145000, womens: 98000, kids: 45000 },
  { name: 'Tue', mens: 198000, womens: 120000, kids: 67000 },
  { name: 'Wed', mens: 167000, womens: 89000, kids: 52000 },
  { name: 'Thu', mens: 234000, womens: 156000, kids: 78000 },
  { name: 'Fri', mens: 189000, womens: 134000, kids: 62000 },
  { name: 'Sat', mens: 98000, womens: 67000, kids: 34000 },
  { name: 'Sun', mens: 67000, womens: 45000, kids: 23000 },
];

export default function DashboardPage() {
  const currentDate = new Date().toLocaleDateString('en-US', { 
    weekday: 'long', 
    year: 'numeric', 
    month: 'long', 
    day: 'numeric' 
  });

  return (
    <div className="min-h-screen bg-[#F9FAFB] dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="space-y-5 p-6 animate-fade-in max-w-[1600px] mx-auto">
      {/* Page Header */}
      <div className="flex items-center justify-between px-0.5">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">Dashboard Overview</h1>
          <p className="text-muted-foreground mt-1.5 flex items-center gap-2 font-medium text-sm">
            <Calendar className="h-3.5 w-3.5" />
            {currentDate}
          </p>
        </div>
        <Button className="h-9 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 bg-gradient-to-b from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 px-5 text-white border-0 text-sm font-semibold">
          <ArrowUpRight className="h-4 w-4 mr-2" />
          View Reports
        </Button>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Today's Sales"
          value={`PKR ${(mockStats.todaySales / 1000).toFixed(0)}K`}
          change={23}
          trend="up"
          icon={TrendingUp}
        />
        <MetricCard
          title="Active Employees"
          value={mockStats.totalEmployees}
          icon={Users}
        />
        <MetricCard
          title="Production Orders"
          value={mockStats.activeOrders}
          change={3}
          trend="up"
          icon={Package}
        />
        <MetricCard
          title="Low Stock Alerts"
          value={mockStats.lowStockItems}
          trend="down"
          icon={AlertTriangle}
        />
      </div>

      {/* Quick Query */}
      <QuickQuery />

      {/* Shortcuts */}
      <ShortcutsGrid />

      {/* Charts and Recent Queries Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        {/* Sales by Category Chart */}
        <Card className="border border-[#edf2f7] dark:border-slate-700/60 shadow-[0_4px_6px_-1px_rgba(0,0,0,0.05),0_2px_4px_-1px_rgba(0,0,0,0.03)] hover:shadow-[0_10px_20px_-5px_rgba(0,0,0,0.1),0_4px_6px_-2px_rgba(0,0,0,0.05)] hover:border-blue-200 dark:hover:border-blue-700/50 transition-all duration-300 bg-gradient-to-b from-white to-[#fafafa] dark:from-slate-900 dark:to-slate-900/95 rounded-xl overflow-hidden">
          <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-br from-indigo-50/30 to-blue-50/20 dark:from-indigo-950/20 dark:to-blue-950/10">
            <CardTitle className="text-base font-bold text-slate-900 dark:text-slate-50">Weekly Sales by Category</CardTitle>
            <Button variant="ghost" size="sm" className="text-xs rounded-full hover:bg-indigo-100 dark:hover:bg-indigo-900/50 font-semibold px-3 py-1.5 hover:border hover:border-indigo-200 dark:hover:border-indigo-700/50">
              View Details
            </Button>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={salesChartData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-slate-200 dark:stroke-slate-700/50" opacity={0.5} />
                  <XAxis 
                    dataKey="name" 
                    className="text-xs"
                    stroke="#94a3b8"
                    tick={{ fill: '#64748b' }}
                  />
                  <YAxis 
                    className="text-xs" 
                    tickFormatter={(value) => `${value / 1000}K`}
                    stroke="#94a3b8"
                    tick={{ fill: '#64748b' }}
                  />
                  <Tooltip
                    formatter={(value: number) => `PKR ${value.toLocaleString()}`}
                    contentStyle={{
                      backgroundColor: '#ffffff',
                      border: '1px solid #edf2f7',
                      borderRadius: '12px',
                      padding: '12px',
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                    }}
                    labelStyle={{ fontWeight: 600, marginBottom: '8px', color: '#1e293b' }}
                  />
                  <Bar dataKey="mens" name="Men's" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="womens" name="Women's" fill="#06b6d4" radius={[8, 8, 0, 0]} />
                  <Bar dataKey="kids" name="Kids" fill="#14b8a6" radius={[8, 8, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Queries */}
        <RecentQueryList />
      </div>

      {/* Insights Panel */}
      <InsightsPanel insights={mockInsights} />
    </div>
    </div>
  );
}

