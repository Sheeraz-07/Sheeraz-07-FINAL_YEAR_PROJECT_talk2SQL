import { create } from 'zustand';

export interface KPIValue {
  value: number;
  change_pct: number;
}

export interface AnalyticsSnapshot {
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

interface DashboardStore {
  analytics: AnalyticsSnapshot | null;
  insightsFetchFailed: boolean;
  hasLoadedInitial: boolean;
  loadedDatabase: string | null;
  setAnalytics: (analytics: AnalyticsSnapshot | null) => void;
  setInsightsFetchFailed: (failed: boolean) => void;
  setHasLoadedInitial: (loaded: boolean) => void;
  setLoadedDatabase: (db: string | null) => void;
}

export const useDashboardStore = create<DashboardStore>((set) => ({
  analytics: null,
  insightsFetchFailed: false,
  hasLoadedInitial: false,
  loadedDatabase: null,
  setAnalytics: (analytics) => set({ analytics }),
  setInsightsFetchFailed: (insightsFetchFailed) => set({ insightsFetchFailed }),
  setHasLoadedInitial: (hasLoadedInitial) => set({ hasLoadedInitial }),
  setLoadedDatabase: (loadedDatabase) => set({ loadedDatabase }),
}));
