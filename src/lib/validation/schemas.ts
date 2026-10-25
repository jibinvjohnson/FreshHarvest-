import { z } from 'zod';

export const FarmerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  phone: z.string().min(8, 'Valid phone number required').max(20),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
});

export const FarmSchema = z.object({
  farmer_id: z.string().uuid('Farmer ID must be a valid UUID'),
  farm_name: z.string().min(2, 'Farm name required').max(150),
  location: z.string().min(2, 'Location required').max(200),
  area: z.coerce.number().positive('Area must be a positive number'),
});

export const CustomerSchema = z.object({
  full_name: z.string().min(2, 'Name must be at least 2 characters').max(120),
  phone: z.string().min(8, 'Valid phone number required').max(20),
  email: z.string().email('Invalid email address'),
  address: z.string().min(5, 'Address must be at least 5 characters'),
});

export const CategorySchema = z.object({
  category_name: z.string().min(2, 'Category name required').max(80),
  description: z.string().optional(),
});

export const ProductSchema = z.object({
  category_id: z.string().uuid('Category ID must be a valid UUID'),
  product_name: z.string().min(2, 'Product name required').max(120),
  unit: z.string().min(1, 'Unit required').default('kg'),
  description: z.string().optional(),
  indicative_price: z.coerce.number().min(0, 'Price cannot be negative'),
  is_active: z.boolean().default(true),
});

export const ExpectedHarvestSchema = z.object({
  farm_id: z.string().uuid('Farm ID must be a valid UUID'),
  product_id: z.string().uuid('Product ID must be a valid UUID'),
  expected_date: z.string().min(10, 'Valid expected date required (YYYY-MM-DD)'),
  expected_quantity: z.coerce.number().positive('Expected quantity must be greater than zero'),
  forecast_status: z.enum(['Active', 'Harvested', 'Partially Harvested', 'Cancelled', 'Overdue']).default('Active'),
});

export const HarvestBatchSchema = z.object({
  farm_id: z.string().uuid('Farm ID must be a valid UUID'),
  product_id: z.string().uuid('Product ID must be a valid UUID'),
  harvest_date: z.string().min(10, 'Valid harvest date required (YYYY-MM-DD)'),
  quantity: z.coerce.number().min(0, 'Harvest quantity cannot be negative'),
  quality_grade: z.enum(['Grade A', 'Grade B', 'Grade C', 'Premium', 'Standard']).default('Grade A'),
  freshness_deadline: z.string().min(10, 'Freshness deadline date required (YYYY-MM-DD)'),
  expected_harvest_id: z.string().uuid('Expected Harvest ID must be valid UUID').optional(),
});

export const PreOrderSchema = z.object({
  customer_id: z.string().uuid('Customer ID must be a valid UUID'),
  expected_harvest_id: z.string().uuid('Expected Harvest ID must be a valid UUID'),
  requested_quantity: z.coerce.number().positive('Requested quantity must be greater than zero'),
});

export const AllocationExecutionSchema = z.object({
  expected_harvest_id: z.string().uuid('Expected Harvest ID is required'),
  harvest_id: z.string().uuid('Harvest Batch ID is required'),
  policy: z.enum(['FIFO', 'PROPORTIONAL']).default('FIFO'),
});

export const SurplusListingSchema = z.object({
  harvest_id: z.string().uuid('Harvest ID must be a valid UUID'),
  quantity_listed: z.coerce.number().positive('Listed quantity must be greater than zero'),
  original_unit_price: z.coerce.number().min(0, 'Original price cannot be negative'),
  discounted_unit_price: z.coerce.number().min(0, 'Discounted price cannot be negative'),
  sale_deadline: z.string().min(10, 'Sale deadline date and time required'),
}).refine((data) => data.discounted_unit_price <= data.original_unit_price, {
  message: 'Discounted price cannot exceed original price',
  path: ['discounted_unit_price'],
});

export const SurplusPurchaseSchema = z.object({
  surplus_id: z.string().uuid('Surplus listing ID required'),
  customer_id: z.string().uuid('Customer ID required'),
  quantity: z.coerce.number().positive('Purchase quantity must be greater than zero'),
});

export const OrderItemInputSchema = z.object({
  product_id: z.string().uuid(),
  harvest_id: z.string().uuid().optional().nullable(),
  quantity: z.coerce.number().positive('Quantity must be positive'),
  unit_price: z.coerce.number().min(0, 'Price must be non-negative'),
});

export const OrderCreateSchema = z.object({
  customer_id: z.string().uuid('Customer ID required'),
  notes: z.string().optional(),
  items: z.array(OrderItemInputSchema).min(1, 'Order must contain at least one item'),
});

export const PaymentCreateSchema = z.object({
  order_id: z.string().uuid('Order ID required'),
  amount: z.coerce.number().positive('Payment amount must be greater than zero'),
  payment_method: z.enum(['UPI', 'Cash on Delivery', 'Bank Transfer', 'Card', 'Market Wallet']),
  transaction_reference: z.string().optional(),
});
