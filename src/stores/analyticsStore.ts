import { create } from 'zustand';

export interface KPIValue {
  value: number;
  change_pct: number;
}

export interface AnalyticsResponse {
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

export const EMPTY_ANALYTICS: AnalyticsResponse = {
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

interface AnalyticsStore {
  analytics: AnalyticsResponse;
  dateRange: string;
  hasLoadedInitial: boolean;
  loadedDatabase: string | null;
  setAnalytics: (analytics: AnalyticsResponse) => void;
  setDateRange: (range: string) => void;
  setHasLoadedInitial: (loaded: boolean) => void;
  setLoadedDatabase: (db: string | null) => void;
}

export const useAnalyticsStore = create<AnalyticsStore>((set) => ({
  analytics: EMPTY_ANALYTICS,
  dateRange: '30',
  hasLoadedInitial: false,
  loadedDatabase: null,
  setAnalytics: (analytics) => set({ analytics }),
  setDateRange: (dateRange) => set({ dateRange }),
  setHasLoadedInitial: (hasLoadedInitial) => set({ hasLoadedInitial }),
  setLoadedDatabase: (loadedDatabase) => set({ loadedDatabase }),
}));
