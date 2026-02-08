import { create } from 'zustand';
import type { QueryResult, QueryHistory } from '@/types';

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

// Mock data generators for garment manufacturing domain
const mockDataGenerators: Record<string, () => { data: Record<string, unknown>[]; sql: string }> = {
  employees: () => ({
    data: [
      { emp_id: 1, emp_name: 'Ahmed Khan', designation: 'Production Manager', dept_name: 'Production', salary: 85000, status: 'Active' },
      { emp_id: 2, emp_name: 'Fatima Ali', designation: 'Quality Inspector', dept_name: 'Quality Control', salary: 55000, status: 'Active' },
      { emp_id: 3, emp_name: 'Muhammad Hassan', designation: 'Machine Operator', dept_name: 'Stitching', salary: 35000, status: 'Active' },
      { emp_id: 4, emp_name: 'Ayesha Begum', designation: 'Cutting Specialist', dept_name: 'Cutting', salary: 40000, status: 'On Leave' },
      { emp_id: 5, emp_name: 'Usman Malik', designation: 'Warehouse Supervisor', dept_name: 'Warehouse', salary: 50000, status: 'Active' },
    ],
    sql: `SELECT e.emp_id, e.emp_name, e.designation, d.dept_name, e.salary, e.status\nFROM employees e\nJOIN departments d ON e.dept_id = d.dept_id\nORDER BY e.salary DESC;`
  }),
  attendance: () => ({
    data: [
      { emp_name: 'Ahmed Khan', att_date: '2024-01-28', check_in: '08:55', check_out: '17:30', status: 'Present', hours_worked: 8.5 },
      { emp_name: 'Fatima Ali', att_date: '2024-01-28', check_in: '09:15', check_out: '17:00', status: 'Late', hours_worked: 7.75 },
      { emp_name: 'Muhammad Hassan', att_date: '2024-01-28', check_in: '09:00', check_out: '18:00', status: 'Present', hours_worked: 9.0 },
      { emp_name: 'Ayesha Begum', att_date: '2024-01-28', check_in: null, check_out: null, status: 'Leave', hours_worked: null },
      { emp_name: 'Usman Malik', att_date: '2024-01-28', check_in: '08:45', check_out: '17:15', status: 'Present', hours_worked: 8.5 },
    ],
    sql: `SELECT e.emp_name, a.att_date, a.check_in, a.check_out, a.status, a.hours_worked\nFROM attendance a\nJOIN employees e ON a.emp_id = e.emp_id\nWHERE a.att_date = CURRENT_DATE\nORDER BY a.check_in;`
  }),
  inventory: () => ({
    data: [
      { material_name: 'Cotton Fabric (White)', category: 'Fabric', quantity: 45, unit: 'meters', reorder_level: 100, status: 'Low Stock' },
      { material_name: 'Polyester Thread', category: 'Thread', quantity: 250, unit: 'spools', reorder_level: 50, status: 'In Stock' },
      { material_name: 'Metal Buttons', category: 'Accessories', quantity: 15, unit: 'boxes', reorder_level: 20, status: 'Low Stock' },
      { material_name: 'Silk Fabric (Blue)', category: 'Fabric', quantity: 78, unit: 'meters', reorder_level: 50, status: 'In Stock' },
      { material_name: 'Zippers (12 inch)', category: 'Accessories', quantity: 500, unit: 'pieces', reorder_level: 100, status: 'In Stock' },
    ],
    sql: `SELECT rm.material_name, rm.category, i.quantity, rm.unit, rm.reorder_level,\n  CASE WHEN i.quantity < rm.reorder_level THEN 'Low Stock' ELSE 'In Stock' END as status\nFROM inventory i\nJOIN raw_materials rm ON i.material_id = rm.material_id\nORDER BY i.quantity ASC;`
  }),
  sales: () => ({
    data: [
      { product_name: 'Premium Dress Shirt', category: 'Mens', quantity: 150, total_amount: 225000, sale_date: '2024-01-28' },
      { product_name: 'Summer Kurta', category: 'Mens', quantity: 89, total_amount: 133500, sale_date: '2024-01-28' },
      { product_name: 'Designer Abaya', category: 'Womens', quantity: 45, total_amount: 180000, sale_date: '2024-01-27' },
      { product_name: 'Kids School Uniform', category: 'Kids', quantity: 200, total_amount: 160000, sale_date: '2024-01-27' },
      { product_name: 'Cotton Shalwar Kameez', category: 'Mens', quantity: 120, total_amount: 144000, sale_date: '2024-01-26' },
    ],
    sql: `SELECT p.product_name, p.category, SUM(s.quantity) as quantity, SUM(s.total_amount) as total_amount, s.sale_date\nFROM sales_orders s\nJOIN products p ON s.product_id = p.product_id\nWHERE s.sale_date >= CURRENT_DATE - INTERVAL '7 days'\nGROUP BY p.product_name, p.category, s.sale_date\nORDER BY total_amount DESC;`
  }),
  production: () => ({
    data: [
      { order_id: 101, product_name: 'Premium Dress Shirt', target_quantity: 500, completed_quantity: 320, status: 'In Progress', dept_name: 'Stitching' },
      { order_id: 102, product_name: 'Summer Kurta', target_quantity: 300, completed_quantity: 300, status: 'Completed', dept_name: 'Stitching' },
      { order_id: 103, product_name: 'Designer Abaya', target_quantity: 100, completed_quantity: 45, status: 'In Progress', dept_name: 'Tailoring' },
      { order_id: 104, product_name: 'Kids School Uniform', target_quantity: 1000, completed_quantity: 0, status: 'Planned', dept_name: 'Production' },
      { order_id: 105, product_name: 'Cotton Shalwar Kameez', target_quantity: 400, completed_quantity: 250, status: 'In Progress', dept_name: 'Stitching' },
    ],
    sql: `SELECT po.order_id, p.product_name, po.target_quantity, po.completed_quantity, po.status, d.dept_name\nFROM production_orders po\nJOIN products p ON po.product_id = p.product_id\nJOIN departments d ON po.dept_id = d.dept_id\nWHERE po.status != 'Cancelled'\nORDER BY po.order_date DESC;`
  }),
  departments: () => ({
    data: [
      { dept_name: 'Production', employee_count: 45, location: 'Building A' },
      { dept_name: 'Stitching', employee_count: 120, location: 'Building B' },
      { dept_name: 'Cutting', employee_count: 35, location: 'Building A' },
      { dept_name: 'Quality Control', employee_count: 15, location: 'Building B' },
      { dept_name: 'Warehouse', employee_count: 20, location: 'Building C' },
    ],
    sql: `SELECT d.dept_name, COUNT(e.emp_id) as employee_count, d.location\nFROM departments d\nLEFT JOIN employees e ON d.dept_id = e.dept_id\nGROUP BY d.dept_id, d.dept_name, d.location\nORDER BY employee_count DESC;`
  }),
};

// Detect query type from natural language
const detectQueryType = (query: string): string => {
  const q = query.toLowerCase();
  if (q.includes('employee') || q.includes('staff') || q.includes('worker') || q.includes('salary')) return 'employees';
  if (q.includes('attendance') || q.includes('present') || q.includes('absent') || q.includes('late')) return 'attendance';
  if (q.includes('inventory') || q.includes('stock') || q.includes('material') || q.includes('fabric')) return 'inventory';
  if (q.includes('sale') || q.includes('revenue') || q.includes('order') && q.includes('customer')) return 'sales';
  if (q.includes('production') || q.includes('manufacturing') || q.includes('target')) return 'production';
  if (q.includes('department') || q.includes('dept')) return 'departments';
  return 'sales'; // default
};

const generateMockResults = (query: string): QueryResult => {
  const queryType = detectQueryType(query);
  const generator = mockDataGenerators[queryType] || mockDataGenerators.sales;
  const { data, sql } = generator();
  
  return {
    id: crypto.randomUUID(),
    naturalQuery: query,
    generatedSQL: sql,
    results: data,
    columns: Object.keys(data[0] || {}),
    rowCount: data.length,
    executionTime: Math.random() * 0.5 + 0.3,
    createdAt: new Date(),
    status: 'success',
  };
};

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

export const useQueryStore = create<QueryState>((set, get) => ({
  currentQuery: '',
  results: null,
  isLoading: false,
  loadingStep: 0,
  error: null,
  language: 'en',
  selectedDatabase: 'garment_db',
  history: mockHistory,
  savedQueries: mockHistory.filter((q) => q.isFavorite),

  setQuery: (query) => set({ currentQuery: query }),
  setLanguage: (lang) => set({ language: lang }),
  setDatabase: (dbId) => set({ selectedDatabase: dbId }),

  executeQuery: async () => {
    const { currentQuery } = get();
    if (!currentQuery.trim()) return;

    set({ isLoading: true, loadingStep: 0, error: null, results: null });

    // Step 1: Intent check
    set({ loadingStep: 1 });

    try {
      const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

      // Step 2: Calling backend
      set({ loadingStep: 2 });

      const response = await fetch(`${API_BASE}/api/query`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: '1', // TODO: get from auth store
          session_id: crypto.randomUUID(),
          query: currentQuery,
        }),
      });

      // Step 3: Processing response
      set({ loadingStep: 3 });

      const data = await response.json();

      // Step 4: Complete
      set({ loadingStep: 4 });

      if (data.status === 'error') {
        set({
          error: `Backend Error: ${data.error || 'Query failed'}`,
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
      // Fallback to mock data if backend is not running
      console.warn('Backend unavailable, using mock data:', err);
      const result = generateMockResults(currentQuery);
      result.generatedSQL = `/* MOCK DATA */ ${result.generatedSQL}`;
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
}));
