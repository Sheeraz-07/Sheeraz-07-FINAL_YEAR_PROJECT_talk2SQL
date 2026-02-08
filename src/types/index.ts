// Talk2SQL Type Definitions - Garment Manufacturing Database

// ==================== Core HR Tables ====================

export interface Department {
  dept_id: number;
  dept_name: string;
  location: string | null;
  created_at: Date;
}

export interface Employee {
  emp_id: number;
  emp_name: string;
  email: string | null;
  phone: string | null;
  address: string | null;
  hire_date: Date | null;
  salary: number | null;
  status: 'Active' | 'Inactive' | 'On Leave';
  dept_id: number;
  designation: string | null;
  manager_id: number | null;
  created_at: Date;
}

export interface User {
  user_id: number;
  emp_id: number | null;
  username: string;
  password_hash?: string;
  role: 'user' | 'analyst' | 'admin';
  last_login: Date | null;
  // Frontend-only fields
  name?: string;
  email?: string;
  avatar?: string;
  preferredLanguage?: 'en' | 'ur';
}

// ==================== Attendance & Leave ====================

export interface Attendance {
  att_id: number;
  emp_id: number;
  att_date: Date;
  check_in: string | null;
  check_out: string | null;
  status: 'Present' | 'Absent' | 'Late' | 'Half Day' | 'Leave';
  hours_worked: number | null;
}

export interface Leave {
  leave_id: number;
  emp_id: number;
  leave_type: 'Sick' | 'Casual' | 'Annual' | 'Maternity';
  start_date: Date;
  end_date: Date;
  status: 'Pending' | 'Approved' | 'Rejected';
}

// ==================== Supply Chain ====================

export interface Supplier {
  supplier_id: number;
  supplier_name: string;
  contact_person: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
}

export interface RawMaterial {
  material_id: number;
  material_name: string;
  category: string | null;
  unit: string | null;
  supplier_id: number | null;
  cost_per_unit: number | null;
  reorder_level: number;
}

export interface Inventory {
  inv_id: number;
  material_id: number;
  quantity: number;
  last_updated: Date;
}

// ==================== Products & Manufacturing ====================

export interface Product {
  product_id: number;
  product_name: string;
  product_code: string | null;
  category: 'Mens' | 'Womens' | 'Kids';
  size: 'S' | 'M' | 'L' | 'XL' | 'XXL';
  selling_price: number | null;
  created_at: Date;
}

export interface ProductionOrder {
  order_id: number;
  product_id: number;
  order_date: Date | null;
  target_quantity: number;
  completed_quantity: number;
  status: 'Planned' | 'In Progress' | 'Completed' | 'Cancelled';
  dept_id: number | null;
}

export interface ProductionDetail {
  detail_id: number;
  order_id: number;
  material_id: number;
  quantity_used: number;
}

// ==================== Sales ====================

export interface SalesOrder {
  sale_id: number;
  product_id: number;
  quantity: number;
  sale_date: Date | null;
  customer_name: string | null;
  total_amount: number | null;
}

// ==================== App-Specific Types ====================

export interface Database {
  id: string;
  name: string;
  type: 'mysql' | 'postgresql';
  host: string;
  port: number;
  status: 'connected' | 'disconnected' | 'error';
  lastAccessed?: Date;
  queryCount: number;
}

export interface QueryResult {
  id: string;
  naturalQuery: string;
  generatedSQL: string;
  results: Record<string, unknown>[];
  columns: string[];
  rowCount: number;
  executionTime: number;
  createdAt: Date;
  status: 'success' | 'error';
  error?: string;
}

export interface QueryHistory {
  id: string;
  naturalQuery: string;
  generatedSQL: string;
  rowCount: number;
  executionTime: number;
  createdAt: Date;
  isFavorite: boolean;
  status: 'success' | 'error';
}

export interface Report {
  id: string;
  title: string;
  description?: string;
  queryId?: string;
  chartType?: 'bar' | 'line' | 'pie' | 'scatter';
  createdAt: Date;
  scheduledAt?: string;
  status: 'draft' | 'generated' | 'scheduled';
}

export interface DashboardStats {
  totalQueries: number;
  queriesChange: number;
  activeDatabases: number;
  reportsGenerated: number;
  avgResponseTime: number;
  // Garment-specific stats
  totalEmployees?: number;
  activeOrders?: number;
  lowStockItems?: number;
  todaySales?: number;
}

export interface Insight {
  id: string;
  title: string;
  description: string;
  trend: 'up' | 'down' | 'neutral' | 'alert';
  value?: string;
  createdAt?: Date;
}

// ==================== Database Schema Reference ====================

export const DATABASE_SCHEMA = `
-- Departments
departments (dept_id, dept_name, location, created_at)

-- Employees  
employees (emp_id, emp_name, email, phone, address, hire_date, salary, status, dept_id, designation, manager_id, created_at)

-- Users (App Authentication)
users (user_id, emp_id, username, password_hash, role, last_login)

-- Attendance
attendance (att_id, emp_id, att_date, check_in, check_out, status, hours_worked)

-- Leaves
leaves (leave_id, emp_id, leave_type, start_date, end_date, status)

-- Suppliers
suppliers (supplier_id, supplier_name, contact_person, phone, email, address)

-- Raw Materials
raw_materials (material_id, material_name, category, unit, supplier_id, cost_per_unit, reorder_level)

-- Inventory
inventory (inv_id, material_id, quantity, last_updated)

-- Products
products (product_id, product_name, product_code, category, size, selling_price, created_at)

-- Production Orders
production_orders (order_id, product_id, order_date, target_quantity, completed_quantity, status, dept_id)

-- Production Details
production_details (detail_id, order_id, material_id, quantity_used)

-- Sales Orders
sales_orders (sale_id, product_id, quantity, sale_date, customer_name, total_amount)
`;
