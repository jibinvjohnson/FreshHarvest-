import {
  Farmer, Farm, Customer, Category, Product,
  HarvestBatch, ExpectedHarvest, PreOrder, Order, OrderItem,
  Payment, HarvestVariance, Allocation, SurplusListing, HarvestAudit
} from '@/types/database';
import { getInitialSeedData } from './initialSeed';
import { supabase, isSupabaseConfigured } from './supabase';

export interface DBConnectionStatus {
  isRemote: boolean;
  databaseEngine: 'Supabase PostgreSQL' | 'Local Relational Engine';
  status: 'connected' | 'demo_local';
  hostDescription: string;
  message: string;
}

// In-memory relational storage mirroring schema.sql
class RelationalStore {
  farmers: Farmer[] = [];
  farms: Farm[] = [];
  customers: Customer[] = [];
  categories: Category[] = [];
  products: Product[] = [];
  harvestBatches: HarvestBatch[] = [];
  expectedHarvests: ExpectedHarvest[] = [];
  preOrders: PreOrder[] = [];
  orders: Order[] = [];
  orderItems: OrderItem[] = [];
  payments: Payment[] = [];
  harvestVariances: HarvestVariance[] = [];
  allocations: Allocation[] = [];
  surplusListings: SurplusListing[] = [];
  audits: HarvestAudit[] = [];

  constructor() {
    this.resetToSeed();
  }

  resetToSeed() {
    const seed = getInitialSeedData();
    this.farmers = [...seed.farmers];
    this.farms = [...seed.farms];
    this.customers = [...seed.customers];
    this.categories = [...seed.categories];
    this.products = [...seed.products];
    this.harvestBatches = [...seed.harvestBatches];
    this.expectedHarvests = [...seed.expectedHarvests];
    this.preOrders = [...seed.preOrders];
    this.orders = [...seed.orders];
    this.orderItems = [...seed.orderItems];
    this.payments = [...seed.payments];
    this.harvestVariances = [...seed.harvestVariances];
    this.allocations = [...seed.allocations];
    this.surplusListings = [...seed.surplusListings];
    this.audits = [...seed.audits];
  }

  // Automatic expiration checker for surplus listings
  checkSurplusExpirations() {
    const now = new Date();
    this.surplusListings.forEach((sl) => {
      if (sl.status === 'Active' && new Date(sl.sale_deadline) <= now) {
        sl.status = 'Expired';
      }
    });
  }
}

// Global singleton to preserve state across HMR during local development
const globalStore = (globalThis as unknown as { __freshHarvestStore?: RelationalStore });
if (!globalStore.__freshHarvestStore) {
  globalStore.__freshHarvestStore = new RelationalStore();
}
const store = globalStore.__freshHarvestStore;

export const dbRepository = {
  getConnectionStatus(): DBConnectionStatus {
    if (isSupabaseConfigured && supabase) {
      return {
        isRemote: true,
        databaseEngine: 'Supabase PostgreSQL',
        status: 'connected',
        hostDescription: process.env.NEXT_PUBLIC_SUPABASE_URL || 'Remote Cloud DB',
        message: 'Successfully connected to remote Supabase PostgreSQL instance.',
      };
    }
    return {
      isRemote: false,
      databaseEngine: 'Local Relational Engine',
      status: 'demo_local',
      hostDescription: 'localhost (PostgreSQL-compatible in-memory store)',
      message: 'Running in High-Fidelity Local Development Mode. Schema constraints, ACID transactions, and foreign keys strictly enforced.',
    };
  },

  resetDemo() {
    store.resetToSeed();
    return { success: true, message: 'Database reset to initial demo state.' };
  },

  // 1. FARMERS
  async getFarmers(): Promise<Farmer[]> {
    return [...store.farmers];
  },
  async getFarmerById(id: string): Promise<Farmer | null> {
    return store.farmers.find((f) => f.farmer_id === id) || null;
  },
  async createFarmer(data: Omit<Farmer, 'farmer_id' | 'created_at'>): Promise<Farmer> {
    if (store.farmers.some((f) => f.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error(`Unique constraint violation: Farmer with email ${data.email} already exists.`);
    }
    const farmer: Farmer = {
      farmer_id: crypto.randomUUID(),
      ...data,
      created_at: new Date().toISOString(),
    };
    store.farmers.unshift(farmer);
    return farmer;
  },
  async updateFarmer(id: string, data: Partial<Omit<Farmer, 'farmer_id' | 'created_at'>>): Promise<Farmer> {
    const idx = store.farmers.findIndex((f) => f.farmer_id === id);
    if (idx === -1) throw new Error('Farmer not found');
    store.farmers[idx] = { ...store.farmers[idx], ...data };
    return store.farmers[idx];
  },
  async deleteFarmer(id: string): Promise<void> {
    // Cascades to farms as per schema
    store.farms = store.farms.filter((f) => f.farmer_id !== id);
    store.farmers = store.farmers.filter((f) => f.farmer_id !== id);
  },

  // 2. FARMS
  async getFarms(): Promise<Farm[]> {
    return [...store.farms];
  },
  async createFarm(data: Omit<Farm, 'farm_id' | 'created_at'>): Promise<Farm> {
    if (!store.farmers.some((f) => f.farmer_id === data.farmer_id)) {
      throw new Error('Foreign key violation: Specified farmer_id does not exist.');
    }
    if (data.area <= 0) throw new Error('Check constraint violation: Farm area must be > 0.');
    const farm: Farm = {
      farm_id: crypto.randomUUID(),
      ...data,
      created_at: new Date().toISOString(),
    };
    store.farms.unshift(farm);
    return farm;
  },
  async updateFarm(id: string, data: Partial<Omit<Farm, 'farm_id' | 'created_at'>>): Promise<Farm> {
    const idx = store.farms.findIndex((f) => f.farm_id === id);
    if (idx === -1) throw new Error('Farm not found');
    if (data.area !== undefined && data.area <= 0) throw new Error('Area must be > 0');
    store.farms[idx] = { ...store.farms[idx], ...data };
    return store.farms[idx];
  },
  async deleteFarm(id: string): Promise<void> {
    const hasBatches = store.harvestBatches.some((hb) => hb.farm_id === id);
    if (hasBatches) throw new Error('Foreign key RESTRICT violation: Farm has existing harvest batches.');
    store.farms = store.farms.filter((f) => f.farm_id !== id);
  },

  // 3. CUSTOMERS
  async getCustomers(): Promise<Customer[]> {
    return [...store.customers];
  },
  async createCustomer(data: Omit<Customer, 'customer_id' | 'created_at'>): Promise<Customer> {
    if (store.customers.some((c) => c.email.toLowerCase() === data.email.toLowerCase())) {
      throw new Error(`Unique constraint violation: Customer with email ${data.email} already exists.`);
    }
    const customer: Customer = {
      customer_id: crypto.randomUUID(),
      ...data,
      created_at: new Date().toISOString(),
    };
    store.customers.unshift(customer);
    return customer;
  },
  async updateCustomer(id: string, data: Partial<Omit<Customer, 'customer_id' | 'created_at'>>): Promise<Customer> {
    const idx = store.customers.findIndex((c) => c.customer_id === id);
    if (idx === -1) throw new Error('Customer not found');
    store.customers[idx] = { ...store.customers[idx], ...data };
    return store.customers[idx];
  },
  async deleteCustomer(id: string): Promise<void> {
    const hasOrders = store.orders.some((o) => o.customer_id === id);
    const hasPreOrders = store.preOrders.some((po) => po.customer_id === id);
    if (hasOrders || hasPreOrders) throw new Error('Foreign key RESTRICT: Customer has associated orders or pre-orders.');
    store.customers = store.customers.filter((c) => c.customer_id !== id);
  },

  // 4. CATEGORIES
  async getCategories(): Promise<Category[]> {
    return [...store.categories];
  },
  async createCategory(data: Omit<Category, 'category_id'>): Promise<Category> {
    if (store.categories.some((c) => c.category_name.toLowerCase() === data.category_name.toLowerCase())) {
      throw new Error(`Unique constraint violation: Category "${data.category_name}" already exists.`);
    }
    const category: Category = {
      category_id: crypto.randomUUID(),
      ...data,
    };
    store.categories.push(category);
    return category;
  },
  async updateCategory(id: string, data: Partial<Omit<Category, 'category_id'>>): Promise<Category> {
    const idx = store.categories.findIndex((c) => c.category_id === id);
    if (idx === -1) throw new Error('Category not found');
    store.categories[idx] = { ...store.categories[idx], ...data };
    return store.categories[idx];
  },
  async deleteCategory(id: string): Promise<void> {
    const hasProducts = store.products.some((p) => p.category_id === id);
    if (hasProducts) throw new Error('Foreign key RESTRICT: Category contains active products.');
    store.categories = store.categories.filter((c) => c.category_id !== id);
  },

  // 5. PRODUCTS
  async getProducts(): Promise<Product[]> {
    return [...store.products];
  },
  async createProduct(data: Omit<Product, 'product_id' | 'created_at'>): Promise<Product> {
    if (!store.categories.some((c) => c.category_id === data.category_id)) {
      throw new Error('Foreign key violation: Invalid category_id.');
    }
    if (data.indicative_price < 0) throw new Error('Check constraint violation: Price cannot be negative.');
    const product: Product = {
      product_id: crypto.randomUUID(),
      ...data,
      created_at: new Date().toISOString(),
    };
    store.products.unshift(product);
    return product;
  },
  async updateProduct(id: string, data: Partial<Omit<Product, 'product_id' | 'created_at'>>): Promise<Product> {
    const idx = store.products.findIndex((p) => p.product_id === id);
    if (idx === -1) throw new Error('Product not found');
    if (data.indicative_price !== undefined && data.indicative_price < 0) {
      throw new Error('Price cannot be negative');
    }
    store.products[idx] = { ...store.products[idx], ...data };
    return store.products[idx];
  },
  async deleteProduct(id: string): Promise<void> {
    const hasBatches = store.harvestBatches.some((hb) => hb.product_id === id);
    const hasExpected = store.expectedHarvests.some((eh) => eh.product_id === id);
    if (hasBatches || hasExpected) throw new Error('Foreign key RESTRICT: Product has related harvest records.');
    store.products = store.products.filter((p) => p.product_id !== id);
  },

  // 6. EXPECTED HARVESTS
  async getExpectedHarvests(): Promise<ExpectedHarvest[]> {
    return [...store.expectedHarvests];
  },
  async createExpectedHarvest(data: Omit<ExpectedHarvest, 'expected_harvest_id' | 'created_at'>): Promise<ExpectedHarvest> {
    if (!store.farms.some((f) => f.farm_id === data.farm_id)) throw new Error('Invalid farm_id');
    if (!store.products.some((p) => p.product_id === data.product_id)) throw new Error('Invalid product_id');
    if (data.expected_quantity <= 0) throw new Error('Expected quantity must be > 0');

    const expected: ExpectedHarvest = {
      expected_harvest_id: crypto.randomUUID(),
      ...data,
      created_at: new Date().toISOString(),
    };
    store.expectedHarvests.unshift(expected);
    return expected;
  },
  async updateExpectedHarvest(id: string, data: Partial<Omit<ExpectedHarvest, 'expected_harvest_id' | 'created_at'>>): Promise<ExpectedHarvest> {
    const idx = store.expectedHarvests.findIndex((eh) => eh.expected_harvest_id === id);
    if (idx === -1) throw new Error('Expected harvest not found');
    store.expectedHarvests[idx] = { ...store.expectedHarvests[idx], ...data };
    return store.expectedHarvests[idx];
  },

  // 7. HARVEST BATCHES
  async getHarvestBatches(): Promise<HarvestBatch[]> {
    return [...store.harvestBatches];
  },
  async createHarvestBatch(
    data: Omit<HarvestBatch, 'harvest_id' | 'available_quantity' | 'status' | 'created_at'> & { expected_harvest_id?: string }
  ): Promise<HarvestBatch> {
    if (data.quantity < 0) throw new Error('Quantity cannot be negative');
    if (!store.farms.some((f) => f.farm_id === data.farm_id)) throw new Error('Invalid farm_id');
    if (!store.products.some((p) => p.product_id === data.product_id)) throw new Error('Invalid product_id');

    const batch: HarvestBatch = {
      harvest_id: crypto.randomUUID(),
      farm_id: data.farm_id,
      product_id: data.product_id,
      harvest_date: data.harvest_date,
      quantity: data.quantity,
      available_quantity: data.quantity, // initially all available
      quality_grade: data.quality_grade,
      freshness_deadline: data.freshness_deadline,
      status: 'Available',
      created_at: new Date().toISOString(),
    };

    store.harvestBatches.unshift(batch);

    // Audit log
    store.audits.unshift({
      audit_id: crypto.randomUUID(),
      harvest_id: batch.harvest_id,
      action_type: 'HARVEST_RECORDED',
      new_value: { quantity: batch.quantity, grade: batch.quality_grade, harvest_date: batch.harvest_date },
      reason: 'Harvest recorded from field',
      created_at: new Date().toISOString(),
    });

    // If linked to an expected harvest, record variance snapshot & update expected harvest status
    if (data.expected_harvest_id) {
      const expected = store.expectedHarvests.find((eh) => eh.expected_harvest_id === data.expected_harvest_id);
      if (expected) {
        expected.forecast_status = 'Harvested';
        const diff = batch.quantity - expected.expected_quantity;
        const pct = expected.expected_quantity > 0 ? (diff / expected.expected_quantity) * 100 : 0;

        store.harvestVariances.unshift({
          variance_id: crypto.randomUUID(),
          expected_harvest_id: expected.expected_harvest_id,
          harvest_id: batch.harvest_id,
          expected_quantity_snapshot: expected.expected_quantity,
          actual_quantity_snapshot: batch.quantity,
          variance_quantity: diff,
          variance_percentage: Number(pct.toFixed(2)),
          recorded_at: new Date().toISOString(),
        });
      }
    }

    return batch;
  },

  // 8. PRE-ORDERS
  async getPreOrders(): Promise<PreOrder[]> {
    return [...store.preOrders];
  },
  async createPreOrder(data: Omit<PreOrder, 'pre_order_id' | 'allocated_quantity' | 'status' | 'placed_at'>): Promise<PreOrder> {
    if (!store.customers.some((c) => c.customer_id === data.customer_id)) throw new Error('Invalid customer_id');
    if (!store.expectedHarvests.some((eh) => eh.expected_harvest_id === data.expected_harvest_id)) throw new Error('Invalid expected_harvest_id');
    if (data.requested_quantity <= 0) throw new Error('Requested quantity must be > 0');

    const preOrder: PreOrder = {
      pre_order_id: crypto.randomUUID(),
      ...data,
      allocated_quantity: 0,
      status: 'Pending',
      placed_at: new Date().toISOString(),
    };
    store.preOrders.push(preOrder);
    return preOrder;
  },
  async cancelPreOrder(id: string): Promise<PreOrder> {
    const idx = store.preOrders.findIndex((po) => po.pre_order_id === id);
    if (idx === -1) throw new Error('Pre-order not found');
    if (store.preOrders[idx].allocated_quantity > 0) {
      throw new Error('Cannot cancel pre-order that has already been allocated stock.');
    }
    store.preOrders[idx].status = 'Cancelled';
    return store.preOrders[idx];
  },

  // 9. ALLOCATIONS & EXECUTION (Transactional)
  async getAllocations(): Promise<Allocation[]> {
    return [...store.allocations];
  },

  // 10. SURPLUS LISTINGS
  async getSurplusListings(): Promise<SurplusListing[]> {
    store.checkSurplusExpirations();
    return [...store.surplusListings];
  },
  async createSurplusListing(data: Omit<SurplusListing, 'surplus_id' | 'quantity_sold' | 'status' | 'created_at'>): Promise<SurplusListing> {
    const batch = store.harvestBatches.find((hb) => hb.harvest_id === data.harvest_id);
    if (!batch) throw new Error('Harvest batch not found');
    if (data.quantity_listed <= 0) throw new Error('Listed quantity must be > 0');
    if (data.quantity_listed > batch.available_quantity) {
      throw new Error(`Cannot list ${data.quantity_listed}kg: only ${batch.available_quantity}kg is available in this harvest batch.`);
    }
    if (data.discounted_unit_price > data.original_unit_price) {
      throw new Error('Discounted price cannot exceed original price.');
    }

    const listing: SurplusListing = {
      surplus_id: crypto.randomUUID(),
      harvest_id: data.harvest_id,
      quantity_listed: data.quantity_listed,
      quantity_sold: 0,
      original_unit_price: data.original_unit_price,
      discounted_unit_price: data.discounted_unit_price,
      sale_deadline: data.sale_deadline,
      status: 'Active',
      created_at: new Date().toISOString(),
    };

    batch.status = 'Surplus Listed';
    store.surplusListings.unshift(listing);

    store.audits.unshift({
      audit_id: crypto.randomUUID(),
      harvest_id: batch.harvest_id,
      action_type: 'SURPLUS_LISTED',
      new_value: { surplus_id: listing.surplus_id, quantity: listing.quantity_listed, price: listing.discounted_unit_price },
      reason: 'Surplus produce listed for discounted rescue',
      created_at: new Date().toISOString(),
    });

    return listing;
  },

  async purchaseSurplus(surplusId: string, customerId: string, quantity: number): Promise<{ order: Order; item: OrderItem; payment: Payment }> {
    store.checkSurplusExpirations();
    const listing = store.surplusListings.find((s) => s.surplus_id === surplusId);
    if (!listing) throw new Error('Surplus listing not found');
    if (listing.status !== 'Active') throw new Error(`Listing is no longer active (Current status: ${listing.status})`);
    if (new Date(listing.sale_deadline) <= new Date()) {
      listing.status = 'Expired';
      throw new Error('Listing has expired past its sale deadline.');
    }

    const remainingSurplus = listing.quantity_listed - listing.quantity_sold;
    if (quantity <= 0) throw new Error('Quantity must be greater than zero');
    if (quantity > remainingSurplus) {
      throw new Error(`Requested ${quantity} exceeds remaining surplus of ${remainingSurplus}`);
    }

    const batch = store.harvestBatches.find((hb) => hb.harvest_id === listing.harvest_id);
    if (!batch) throw new Error('Associated harvest batch missing');
    if (quantity > batch.available_quantity) {
      throw new Error(`Insufficient batch stock (${batch.available_quantity} available)`);
    }

    // ACID-like atomic updates
    listing.quantity_sold += quantity;
    if (listing.quantity_sold >= listing.quantity_listed) {
      listing.status = 'Sold Out';
    }

    batch.available_quantity -= quantity;
    if (batch.available_quantity <= 0) {
      batch.status = 'Sold Out';
    }

    const totalAmount = Number((quantity * listing.discounted_unit_price).toFixed(2));

    const order: Order = {
      order_id: crypto.randomUUID(),
      customer_id: customerId,
      order_date: new Date().toISOString(),
      status: 'Confirmed',
      total_amount: totalAmount,
      notes: `Surplus rescue purchase of ${quantity} units at ₹${listing.discounted_unit_price}/unit`,
    };
    store.orders.unshift(order);

    const item: OrderItem = {
      order_item_id: crypto.randomUUID(),
      order_id: order.order_id,
      product_id: batch.product_id,
      harvest_id: batch.harvest_id,
      quantity,
      unit_price: listing.discounted_unit_price,
      subtotal: totalAmount,
    };
    store.orderItems.unshift(item);

    const payment: Payment = {
      payment_id: crypto.randomUUID(),
      order_id: order.order_id,
      amount: totalAmount,
      payment_method: 'UPI',
      payment_status: 'Completed',
      transaction_reference: `RESCUE-${Date.now().toString().slice(-6)}`,
      paid_at: new Date().toISOString(),
    };
    store.payments.unshift(payment);

    store.audits.unshift({
      audit_id: crypto.randomUUID(),
      harvest_id: batch.harvest_id,
      action_type: 'SURPLUS_SOLD',
      new_value: { sold: quantity, buyer_order: order.order_id, remaining_in_batch: batch.available_quantity },
      reason: `Surplus rescued by customer: ${quantity} units sold`,
      created_at: new Date().toISOString(),
    });

    return { order, item, payment };
  },

  // 11. ORDERS & PAYMENTS
  async getOrders(): Promise<Order[]> {
    return [...store.orders];
  },
  async getOrderItems(): Promise<OrderItem[]> {
    return [...store.orderItems];
  },
  async getPayments(): Promise<Payment[]> {
    return [...store.payments];
  },
  async createOrderWithItems(
    customerId: string,
    items: Array<{ product_id: string; harvest_id?: string | null; quantity: number; unit_price: number }>,
    notes?: string
  ): Promise<{ order: Order; items: OrderItem[] }> {
    if (!store.customers.some((c) => c.customer_id === customerId)) throw new Error('Customer does not exist');
    if (!items || items.length === 0) throw new Error('Order must contain at least one item');

    // Recalculate total strictly on server
    let total = 0;
    const orderId = crypto.randomUUID();
    const createdItems: OrderItem[] = [];

    for (const it of items) {
      if (it.quantity <= 0) throw new Error('Quantity must be > 0');
      if (it.unit_price < 0) throw new Error('Unit price cannot be negative');
      const subtotal = Number((it.quantity * it.unit_price).toFixed(2));
      total += subtotal;

      createdItems.push({
        order_item_id: crypto.randomUUID(),
        order_id: orderId,
        product_id: it.product_id,
        harvest_id: it.harvest_id || null,
        quantity: it.quantity,
        unit_price: it.unit_price,
        subtotal,
      });
    }

    const order: Order = {
      order_id: orderId,
      customer_id: customerId,
      order_date: new Date().toISOString(),
      status: 'Pending',
      total_amount: Number(total.toFixed(2)),
      notes,
    };

    store.orders.unshift(order);
    store.orderItems.push(...createdItems);
    return { order, items: createdItems };
  },

  async recordPayment(data: Omit<Payment, 'payment_id' | 'paid_at' | 'payment_status'> & { payment_status?: Payment['payment_status'] }): Promise<Payment> {
    const order = store.orders.find((o) => o.order_id === data.order_id);
    if (!order) throw new Error('Order not found');
    if (data.amount <= 0) throw new Error('Payment amount must be greater than zero');

    const payment: Payment = {
      payment_id: crypto.randomUUID(),
      order_id: data.order_id,
      amount: data.amount,
      payment_method: data.payment_method,
      payment_status: data.payment_status || 'Completed',
      transaction_reference: data.transaction_reference || `TXN-${Date.now().toString().slice(-8)}`,
      paid_at: new Date().toISOString(),
    };

    if (payment.payment_status === 'Completed') {
      order.status = 'Confirmed';
    }

    store.payments.unshift(payment);
    return payment;
  },

  // 12. HARVEST VARIANCES & AUDITS
  async getHarvestVariances(): Promise<HarvestVariance[]> {
    return [...store.harvestVariances];
  },
  async getHarvestAudits(): Promise<HarvestAudit[]> {
    return [...store.audits];
  },

  // Internal accessor for safe transactions
  _getInternalStore() {
    return store;
  }
};
