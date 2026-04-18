import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { QueryResult, QueryHistory } from '@/types';
import { useAuthStore } from '@/stores/authStore';

interface QueryState {
  currentQuery: string;
  results: QueryResult | null;
  isLoading: boolean;
  loadingStep: number;
  error: string | null;
  language: 'en' | 'ur';
  selectedDatabase: string;
  history: QueryHistory[];
  savedQueries: QueryHistory[];
  
  setQuery: (query: string) => void;
  setLanguage: (lang: 'en' | 'ur') => void;
  setDatabase: (dbId: string) => void;
  executeQuery: () => Promise<void>;
  clearResults: () => void;
  toggleFavorite: (id: string) => void;
  deleteFromHistory: (id: string) => void;
}

const mockHistory: QueryHistory[] = [
  {
    id: '1',
    naturalQuery: 'Show me today\'s attendance report',
    generatedSQL: 'SELECT e.emp_name, a.check_in, a.check_out, a.status FROM attendance a JOIN employees e ON a.emp_id = e.emp_id WHERE a.att_date = CURRENT_DATE',
    rowCount: 156,
    executionTime: 0.45,
    createdAt: new Date(Date.now() - 3600000),
    isFavorite: true,
    status: 'success',
  },
  {
    id: '2',
    naturalQuery: 'Top 5 selling products this month',
    generatedSQL: 'SELECT p.product_name, SUM(s.quantity) as sold, SUM(s.total_amount) as revenue FROM sales_orders s JOIN products p ON s.product_id = p.product_id GROUP BY p.product_id ORDER BY revenue DESC LIMIT 5',
    rowCount: 5,
    executionTime: 0.32,
    createdAt: new Date(Date.now() - 7200000),
    isFavorite: false,
    status: 'success',
  },
  {
    id: '3',
    naturalQuery: 'Low stock materials alert',
    generatedSQL: 'SELECT rm.material_name, i.quantity, rm.reorder_level FROM inventory i JOIN raw_materials rm ON i.material_id = rm.material_id WHERE i.quantity < rm.reorder_level',
    rowCount: 8,
    executionTime: 0.28,
    createdAt: new Date(Date.now() - 86400000),
    isFavorite: true,
    status: 'success',
  },
  {
    id: '4',
    naturalQuery: 'Production orders in progress',
    generatedSQL: 'SELECT po.order_id, p.product_name, po.target_quantity, po.completed_quantity FROM production_orders po JOIN products p ON po.product_id = p.product_id WHERE po.status = \'In Progress\'',
    rowCount: 12,
    executionTime: 0.35,
    createdAt: new Date(Date.now() - 172800000),
    isFavorite: false,
    status: 'success',
  },
];

export const useQueryStore = create<QueryState>()(
  persist(
    (set, get) => ({
      currentQuery: '',
      results: null,
      isLoading: false,
      loadingStep: 0,
      error: null,
      language: 'en',
      selectedDatabase: 'supabase',
      history: mockHistory,
      savedQueries: mockHistory.filter((q) => q.isFavorite),

      setQuery: (query) => set({ currentQuery: query }),
      setLanguage: (lang) => set({ language: lang }),
      setDatabase: (dbId) => set({ selectedDatabase: dbId }),

      executeQuery: async () => {
        const { currentQuery, selectedDatabase } = get();
        const { token, user } = useAuthStore.getState();
        if (!currentQuery.trim()) return;

      set({ isLoading: true, loadingStep: 0, error: null, results: null });

      // Step 1: Intent check
      set({ loadingStep: 1 });

        try {
          const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

          // Step 2: Calling backend
          set({ loadingStep: 2 });

          const headers: Record<string, string> = { 'Content-Type': 'application/json' };
          if (token) {
            headers.Authorization = `Bearer ${token}`;
          }

          const response = await fetch(`${API_BASE}/api/query`, {
            method: 'POST',
            headers,
            body: JSON.stringify({
              user_id: String(user?.user_id ?? 1),
              session_id: crypto.randomUUID(),
              query: currentQuery,
              database: selectedDatabase,
            }),
          });

          // Step 3: Processing response
          set({ loadingStep: 3 });

          const data = await response.json().catch(() => null);

          if (!response.ok) {
            const err = data?.error || data?.detail || `HTTP ${response.status}`;
            throw new Error(err);
          }

          // Step 4: Complete
          set({ loadingStep: 4 });

          if (!data || data.status === 'error') {
            set({
              error: `Backend Error: ${data?.error || 'Query failed'}`,
              isLoading: false,
              loadingStep: 0,
            });
            return;
          }

          const result: QueryResult = {
            id: data.id || crypto.randomUUID(),
            naturalQuery: currentQuery,
            generatedSQL: `/* FROM BACKEND */ ${data.sql}` || '',
            results: data.data || [],
            columns: data.columns || [],
            rowCount: data.row_count || 0,
            executionTime: data.execution_time || 0,
            createdAt: new Date(),
            status: 'success',
            visualization: data.visualization || undefined,
          };

          const newHistoryItem: QueryHistory = {
            id: result.id,
            naturalQuery: result.naturalQuery,
            generatedSQL: result.generatedSQL,
            rowCount: result.rowCount,
            executionTime: result.executionTime,
            createdAt: result.createdAt,
            isFavorite: false,
            status: 'success',
          };

          set((state) => ({
            results: result,
            isLoading: false,
            loadingStep: 0,
            history: [newHistoryItem, ...state.history],
          }));
        } catch (err) {
          console.error('Backend query failed:', err);
          const message = err instanceof Error ? err.message : 'Unable to reach backend';
          set({
            error: `Backend Error: ${message}`,
            results: null,
            isLoading: false,
            loadingStep: 0,
          });
        }
      },

      clearResults: () => set({ results: null, currentQuery: '', error: null }),

      toggleFavorite: (id) => {
        set((state) => ({
          history: state.history.map((q) =>
            q.id === id ? { ...q, isFavorite: !q.isFavorite } : q
          ),
          savedQueries: state.history.filter((q) =>
            q.id === id ? !q.isFavorite : q.isFavorite
          ),
        }));
      },

      deleteFromHistory: (id) => {
        set((state) => ({
          history: state.history.filter((q) => q.id !== id),
          savedQueries: state.savedQueries.filter((q) => q.id !== id),
        }));
      },
    }),
    {
      name: 'query-storage',
      partialize: (state) => ({
        language: state.language,
        selectedDatabase: state.selectedDatabase,
        history: state.history,
        savedQueries: state.savedQueries,
      }),
    }
  )
);
