"use client";

import { useEffect, useMemo, useState } from "react";
import {
  TrendingUp,
  Users,
  Package,
  AlertTriangle,
  ArrowUpRight,
  Calendar,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { QuickQuery } from "@/components/dashboard/QuickQuery";
import { RecentQueryList } from "@/components/dashboard/RecentQueryList";
import { InsightsPanel } from "@/components/dashboard/InsightsPanel";
import { ShortcutsGrid } from "@/components/dashboard/ShortcutsGrid";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import Link from "next/link";
import { useQueryStore } from "@/stores/queryStore";
import { useAuthStore } from "@/stores/authStore";
import type { Insight } from "@/types";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

interface KPIValue {
  value: number;
  change_pct: number;
}

interface AnalyticsSnapshot {
  kpis: {
    total_revenue: KPIValue;
    total_orders: KPIValue;
    avg_order_value: KPIValue;
    fulfillment_rate: KPIValue;
    attendance_rate: KPIValue;
    low_stock_items: KPIValue;
    total_employees: KPIValue;
    total_production_orders: KPIValue;
  };
  charts: {
    top_products: Array<{ product_name: string; revenue: number }>;
  };
  alerts: {
    low_stock_items: Array<{ material_name: string; deficit: number }>;
  };
}

const salesChartData = [
  { name: "Mon", mens: 145000, womens: 98000, kids: 45000 },
  { name: "Tue", mens: 198000, womens: 120000, kids: 67000 },
  { name: "Wed", mens: 167000, womens: 89000, kids: 52000 },
  { name: "Thu", mens: 234000, womens: 156000, kids: 78000 },
  { name: "Fri", mens: 189000, womens: 134000, kids: 62000 },
  { name: "Sat", mens: 98000, womens: 67000, kids: 34000 },
  { name: "Sun", mens: 67000, womens: 45000, kids: 23000 },
];

export default function DashboardPage() {
  const selectedDatabase = useQueryStore((state) => state.selectedDatabase);
  const token = useAuthStore((state) => state.token);
  const [analytics, setAnalytics] = useState<AnalyticsSnapshot | null>(null);
  const [insightsFetchFailed, setInsightsFetchFailed] = useState(false);

  const currentDate = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  useEffect(() => {
    const controller = new AbortController();

    const fetchInsightsData = async () => {
      try {
        const params = new URLSearchParams({
          range_days: "30",
          database: selectedDatabase,
        });

        const response = await fetch(
          `${API_BASE}/api/analytics?${params.toString()}`,
          {
            headers: token ? { Authorization: `Bearer ${token}` } : undefined,
            signal: controller.signal,
          },
        );

        if (!response.ok) {
          setInsightsFetchFailed(true);
          return;
        }

        const payload = (await response.json()) as AnalyticsSnapshot;
        setAnalytics(payload);
        setInsightsFetchFailed(false);
      } catch {
        setInsightsFetchFailed(true);
      }
    };

    fetchInsightsData();
    return () => controller.abort();
  }, [selectedDatabase, token]);

  const liveInsights = useMemo<Insight[]>(() => {
    if (insightsFetchFailed) {
      return [
        {
          id: "insights-fetch-failed",
          title: "Insights Temporarily Unavailable",
          description:
            "Could not load live insights right now. Please refresh the page or try again shortly.",
          trend: "alert",
        },
      ];
    }

    if (!analytics) {
      return [];
    }

    const insights: Insight[] = [];
    const revenueChange = analytics.kpis.total_revenue.change_pct;
    const ordersChange = analytics.kpis.total_orders.change_pct;
    const fulfillmentRate = analytics.kpis.fulfillment_rate.value;
    const attendanceRate = analytics.kpis.attendance_rate.value;
    const lowStockCount = analytics.kpis.low_stock_items.value;

    if (revenueChange >= 0) {
      insights.push({
        id: "revenue-growth",
        title: "Revenue Momentum",
        description: `Revenue is up ${revenueChange.toFixed(1)}% vs previous period. Consider scaling best-performing SKUs and channels.`,
        trend: "up",
        value: `PKR ${analytics.kpis.total_revenue.value.toLocaleString()}`,
      });
    } else {
      insights.push({
        id: "revenue-decline",
        title: "Revenue Decline Warning",
        description: `Revenue is down ${Math.abs(revenueChange).toFixed(1)}% vs previous period. Review pricing, campaign mix, and demand drop by category.`,
        trend: "down",
        value: `PKR ${analytics.kpis.total_revenue.value.toLocaleString()}`,
      });
    }

    if (ordersChange >= 0) {
      insights.push({
        id: "orders-trend-up",
        title: "Order Volume Trend",
        description: `Order volume increased by ${ordersChange.toFixed(1)}%. Verify fulfillment capacity keeps pace to avoid service bottlenecks.`,
        trend: "up",
        value: analytics.kpis.total_orders.value.toLocaleString(),
      });
    } else {
      insights.push({
        id: "orders-trend-down",
        title: "Order Volume Softening",
        description: `Order volume decreased by ${Math.abs(ordersChange).toFixed(1)}%. Investigate demand drivers and product/category performance.`,
        trend: "down",
        value: analytics.kpis.total_orders.value.toLocaleString(),
      });
    }

    if (lowStockCount > 0) {
      const materialList = analytics.alerts.low_stock_items
        .slice(0, 3)
        .map((item) => item.material_name)
        .join(", ");

      insights.push({
        id: "low-stock-alert",
        title: "Inventory Risk Alert",
        description: `${lowStockCount} material(s) are below reorder level${materialList ? `, including ${materialList}` : ""}. Prioritize replenishment planning.`,
        trend: "alert",
      });
    } else {
      insights.push({
        id: "inventory-stable",
        title: "Inventory Health Stable",
        description:
          "No materials are currently below reorder level in the selected database snapshot.",
        trend: "neutral",
      });
    }

    insights.push({
      id: "ops-health",
      title: "Operations Health Check",
      description: `Fulfillment is at ${fulfillmentRate.toFixed(1)}% and attendance at ${attendanceRate.toFixed(1)}%. Focus on process gaps if either KPI drops below target.`,
      trend: fulfillmentRate >= 80 && attendanceRate >= 90 ? "up" : "neutral",
      value: `${fulfillmentRate.toFixed(1)}% / ${attendanceRate.toFixed(1)}%`,
    });

    const topProduct = analytics.charts.top_products[0];
    if (topProduct) {
      insights.push({
        id: "top-product",
        title: "Top Product Driver",
        description: `${topProduct.product_name} is currently the top revenue contributor. Use it as a benchmark for assortment and promotions.`,
        trend: "neutral",
        value: `PKR ${Math.round(topProduct.revenue).toLocaleString()}`,
      });
    }

    return insights.slice(0, 5);
  }, [analytics]);

  return (
    <div className="min-h-screen bg-transparent">
      <div className="space-y-8 p-8 animate-fade-in max-w-[1600px] mx-auto">
        {/* Page Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold tracking-tight text-foreground">
              Dashboard Overview
            </h1>
            <p className="text-muted-foreground mt-2 flex items-center gap-2 font-medium">
              <Calendar className="h-4 w-4" />
              {currentDate}
            </p>
          </div>
          <Button
            asChild
            className="rounded-full shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-r from-indigo-600 to-blue-600 hover:from-indigo-700 hover:to-blue-700 px-6 py-6 text-white border-0 hover:scale-105"
          >
            <Link href="/reports">
              <ArrowUpRight className="h-4 w-4 mr-2" />
              View Reports
            </Link>
          </Button>
        </div>

        {/* Stats Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 justify-items-center max-w-[1600px] mx-auto">
          <MetricCard
            title="Total Revenue"
            value={
              analytics
                ? `PKR ${(analytics.kpis.total_revenue.value / 1000).toFixed(0)}K`
                : "—"
            }
            change={
              analytics ? analytics.kpis.total_revenue.change_pct : undefined
            }
            trend={
              analytics
                ? analytics.kpis.total_revenue.change_pct >= 0
                  ? "up"
                  : "down"
                : undefined
            }
            icon={TrendingUp}
          />
          <MetricCard
            title="Total Employees"
            value={
              analytics ? analytics.kpis.total_employees.value : "—"
            }
            icon={Users}
          />
          <MetricCard
            title="Production Orders"
            value={
              analytics
                ? analytics.kpis.total_production_orders.value
                : "—"
            }
            change={
              analytics
                ? analytics.kpis.total_production_orders.change_pct
                : undefined
            }
            trend={
              analytics
                ? analytics.kpis.total_production_orders.change_pct >= 0
                  ? "up"
                  : "down"
                : undefined
            }
            icon={Package}
          />
          <MetricCard
            title="Low Stock Alerts"
            value={
              analytics ? analytics.kpis.low_stock_items.value : "—"
            }
            trend={
              analytics
                ? analytics.kpis.low_stock_items.value > 0
                  ? "down"
                  : "neutral"
                : undefined
            }
            icon={AlertTriangle}
          />
        </div>

        {/* Quick Query */}
        <QuickQuery />

        {/* Shortcuts */}
        <ShortcutsGrid />

        {/* Charts and Recent Queries Row */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sales by Category Chart */}
          <Card className="col-span-1 lg:col-span-2 shadow-premium hover:shadow-premium-hover transition-all duration-300 rounded-2xl overflow-hidden h-[315px] animate-slide-up" style={{ animationDelay: '0.1s' }}>
            <CardHeader className="flex flex-row items-center justify-between pb-2 bg-gradient-to-r from-transparent to-indigo-50/50 dark:to-indigo-950/30">
              <CardTitle className="text-lg font-bold">
                Weekly Sales by Category
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs rounded-full font-semibold"
                asChild
              >
                <Link href="/analytics">
                  View Details
                </Link>
              </Button>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="h-[210px]">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={salesChartData}>
                    <CartesianGrid
                      strokeDasharray="3 3"
                      className="stroke-border/50"
                    />
                    <XAxis
                      dataKey="name"
                      className="text-[0.65rem]"
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <YAxis
                      className="text-[0.65rem]"
                      tickFormatter={(value) => `${value / 1000}K`}
                      stroke="hsl(var(--muted-foreground))"
                    />
                    <Tooltip
                      formatter={(value: number) =>
                        `PKR ${value.toLocaleString()}`
                      }
                      contentStyle={{
                        backgroundColor: "hsl(var(--card))",
                        border: "1px solid hsl(var(--border))",
                        borderRadius: "12px",
                        padding: "12px",
                      }}
                      labelStyle={{ fontWeight: 600, marginBottom: "8px" }}
                    />
                    <Bar
                      dataKey="mens"
                      name="Men's"
                      fill="hsl(var(--accent))"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="womens"
                      name="Women's"
                      fill="hsl(var(--success))"
                      radius={[6, 6, 0, 0]}
                    />
                    <Bar
                      dataKey="kids"
                      name="Kids"
                      fill="hsl(var(--warning))"
                      radius={[6, 6, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Recent Queries */}
          <div className="col-span-1 lg:col-span-2 h-[315px] animate-slide-up" style={{ animationDelay: '0.2s' }}>
            <RecentQueryList className="h-full" />
          </div>
        </div>

        {/* Insights Panel */}
        <InsightsPanel insights={liveInsights} />
      </div>
    </div>
  );
}
