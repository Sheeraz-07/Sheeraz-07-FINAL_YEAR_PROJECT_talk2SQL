"use client";

import {
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
} from 'lucide-react';
import { MetricCard } from '@/components/dashboard/MetricCard';
import { QuickQuery } from '@/components/dashboard/QuickQuery';
import { RecentQueryList } from '@/components/dashboard/RecentQueryList';
import { InsightsPanel } from '@/components/dashboard/InsightsPanel';
import { ShortcutsGrid } from '@/components/dashboard/ShortcutsGrid';
import { Card } from '@/components/ui/card';
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
  return (
    <div className="space-y-6">
      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Sales by Category Chart */}
        <Card className="p-6">
          <h3 className="font-semibold mb-4">Weekly Sales by Category (PKR)</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={salesChartData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-border" />
                <XAxis dataKey="name" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `${value / 1000}K`} />
                <Tooltip
                  formatter={(value: number) => `PKR ${value.toLocaleString()}`}
                  contentStyle={{
                    backgroundColor: 'hsl(var(--card))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px',
                  }}
                />
                <Bar dataKey="mens" name="Men's" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="womens" name="Women's" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                <Bar dataKey="kids" name="Kids" fill="hsl(var(--warning))" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Recent Queries */}
        <RecentQueryList />
      </div>

      {/* Insights Panel */}
      <InsightsPanel insights={mockInsights} />
    </div>
  );
}
