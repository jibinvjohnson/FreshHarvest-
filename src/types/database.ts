// Database Models and Interfaces matching schema.sql exactly

export type QualityGrade = 'Grade A' | 'Grade B' | 'Grade C' | 'Premium' | 'Standard';
export type HarvestBatchStatus = 'Available' | 'Partially Allocated' | 'Fully Allocated' | 'Surplus Listed' | 'Sold Out' | 'Expired';
export type ForecastStatus = 'Active' | 'Harvested' | 'Partially Harvested' | 'Cancelled' | 'Overdue';
export type PreOrderStatus = 'Pending' | 'Partially Allocated' | 'Fully Allocated' | 'Cancelled' | 'Fulfilled';
export type OrderStatus = 'Pending' | 'Confirmed' | 'Processing' | 'Delivered' | 'Cancelled';
export type PaymentMethod = 'UPI' | 'Cash on Delivery' | 'Bank Transfer' | 'Card' | 'Market Wallet';
export type PaymentStatus = 'Pending' | 'Completed' | 'Failed' | 'Refunded';
export type AllocationStatus = 'Confirmed' | 'Fulfilled' | 'Released' | 'Cancelled';
export type SurplusStatus = 'Active' | 'Sold Out' | 'Expired' | 'Withdrawn';
export type AuditActionType = 'HARVEST_RECORDED' | 'QUANTITY_ADJUSTED' | 'ALLOCATION_DEDUCTED' | 'SURPLUS_LISTED' | 'SURPLUS_SOLD' | 'BATCH_EXPIRED';

export interface Farmer {
  farmer_id: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
}

export interface Farm {
  farm_id: string;
  farmer_id: string;
  farm_name: string;
  location: string;
  area: number;
  created_at: string;
}

export interface Customer {
  customer_id: string;
  full_name: string;
  phone: string;
  email: string;
  address: string;
  created_at: string;
}

export interface Category {
  category_id: string;
  category_name: string;
  description?: string;
}

export interface Product {
  product_id: string;
  category_id: string;
  product_name: string;
  unit: string;
  description?: string;
  indicative_price: number;
  is_active: boolean;
  created_at: string;
}

export interface HarvestBatch {
  harvest_id: string;
  farm_id: string;
  product_id: string;
  harvest_date: string;
  quantity: number;
  available_quantity: number;
  quality_grade: QualityGrade;
  freshness_deadline: string;
  status: HarvestBatchStatus;
  created_at: string;
}

export interface ExpectedHarvest {
  expected_harvest_id: string;
  farm_id: string;
  product_id: string;
  expected_date: string;
  expected_quantity: number;
  forecast_status: ForecastStatus;
  created_at: string;
}

export interface PreOrder {
  pre_order_id: string;
  customer_id: string;
  expected_harvest_id: string;
  requested_quantity: number;
  allocated_quantity: number;
  status: PreOrderStatus;
  placed_at: string;
}

export interface Order {
  order_id: string;
  customer_id: string;
  order_date: string;
  status: OrderStatus;
  total_amount: number;
  notes?: string;
}

export interface OrderItem {
  order_item_id: string;
  order_id: string;
  product_id: string;
  harvest_id?: string | null;
  quantity: number;
  unit_price: number;
  subtotal: number;
}

export interface Payment {
  payment_id: string;
  order_id: string;
  amount: number;
  payment_method: PaymentMethod;
  payment_status: PaymentStatus;
  transaction_reference?: string;
  paid_at: string;
}

export interface HarvestVariance {
  variance_id: string;
  expected_harvest_id: string;
  harvest_id: string;
  expected_quantity_snapshot: number;
  actual_quantity_snapshot: number;
  variance_quantity: number;
  variance_percentage: number;
  recorded_at: string;
}

export interface Allocation {
  allocation_id: string;
  pre_order_id: string;
  harvest_id: string;
  allocated_quantity: number;
  allocation_status: AllocationStatus;
  allocated_at: string;
}

export interface SurplusListing {
  surplus_id: string;
  harvest_id: string;
  quantity_listed: number;
  quantity_sold: number;
  original_unit_price: number;
  discounted_unit_price: number;
  sale_deadline: string;
  status: SurplusStatus;
  created_at: string;
}

export interface HarvestAudit {
  audit_id: string;
  harvest_id: string;
  action_type: AuditActionType;
  previous_value?: Record<string, unknown> | null;
  new_value?: Record<string, unknown> | null;
  reason?: string;
  created_at: string;
}
