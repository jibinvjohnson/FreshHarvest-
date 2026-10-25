import {
  Farmer, Farm, Customer, Category, Product,
  HarvestBatch, ExpectedHarvest, PreOrder, Order, OrderItem,
  Payment, HarvestVariance, Allocation, SurplusListing, HarvestAudit
} from '@/types/database';

export function getInitialSeedData() {
  const categories: Category[] = [
    { category_id: 'c0000001-0000-0000-0000-000000000001', category_name: 'Vegetables', description: 'Fresh seasonal garden vegetables and root crops' },
    { category_id: 'c0000001-0000-0000-0000-000000000002', category_name: 'Fruits', description: 'Tree-ripened orchard and tropical fruits' },
    { category_id: 'c0000001-0000-0000-0000-000000000003', category_name: 'Tubers & Roots', description: 'Nutritious local tubers, tapioca, and yams' },
    { category_id: 'c0000001-0000-0000-0000-000000000004', category_name: 'Herbs & Leafy Greens', description: 'Fragrant culinary herbs and organic leafy greens' },
  ];

  const farmers: Farmer[] = [
    { farmer_id: 'f0000001-0000-0000-0000-000000000001', full_name: 'Thomas Kurian', phone: '+91 94471 23451', email: 'thomas.kurian@highlandfarms.in', address: 'Kanjirappally, Kottayam, Kerala', created_at: '2026-02-01T08:00:00Z' },
    { farmer_id: 'f0000001-0000-0000-0000-000000000002', full_name: 'Mary Mathew', phone: '+91 98462 89012', email: 'mary.mathew@greenmeadows.in', address: 'Pala, Kottayam, Kerala', created_at: '2026-02-02T09:30:00Z' },
    { farmer_id: 'f0000001-0000-0000-0000-000000000003', full_name: 'Rajan Pillai', phone: '+91 94950 11223', email: 'rajan.pillai@valleyfresh.in', address: 'Vagamon, Idukki, Kerala', created_at: '2026-02-03T11:00:00Z' },
    { farmer_id: 'f0000001-0000-0000-0000-000000000004', full_name: 'Joseph Varghese', phone: '+91 97455 33445', email: 'joseph.v@riverbanks.in', address: 'Ettumanoor, Kottayam, Kerala', created_at: '2026-02-04T10:15:00Z' },
    { farmer_id: 'f0000001-0000-0000-0000-000000000005', full_name: 'Ancy Chacko', phone: '+91 98950 77889', email: 'ancy.chacko@sunrisefarms.in', address: 'Kuttikkanam, Idukki, Kerala', created_at: '2026-02-05T14:20:00Z' },
  ];

  const farms: Farm[] = [
    { farm_id: 'fa000001-0000-0000-0000-000000000001', farmer_id: 'f0000001-0000-0000-0000-000000000001', farm_name: 'Green Valley Organic Estate', location: 'Kanjirappally North', area: 4.5, created_at: '2026-02-01T08:30:00Z' },
    { farm_id: 'fa000001-0000-0000-0000-000000000002', farmer_id: 'f0000001-0000-0000-0000-000000000002', farm_name: 'Riverview Vegetable Meadows', location: 'Pala Riverbank', area: 3.2, created_at: '2026-02-02T10:00:00Z' },
    { farm_id: 'fa000001-0000-0000-0000-000000000003', farmer_id: 'f0000001-0000-0000-0000-000000000003', farm_name: 'Highland Hilltop Plantations', location: 'Vagamon Heights', area: 6.0, created_at: '2026-02-03T11:30:00Z' },
    { farm_id: 'fa000001-0000-0000-0000-000000000004', farmer_id: 'f0000001-0000-0000-0000-000000000004', farm_name: 'Sunrise Agro Orchards', location: 'Ettumanoor West', area: 2.8, created_at: '2026-02-04T10:45:00Z' },
    { farm_id: 'fa000001-0000-0000-0000-000000000005', farmer_id: 'f0000001-0000-0000-0000-000000000005', farm_name: 'Mist Canopy Spice & Fruit Farm', location: 'Kuttikkanam Ridge', area: 5.0, created_at: '2026-02-05T15:00:00Z' },
  ];

  const products: Product[] = [
    { product_id: 'p0000001-0000-0000-0000-000000000001', category_id: 'c0000001-0000-0000-0000-000000000001', product_name: 'Organic Country Tomatoes', unit: 'kg', description: 'Vine-ripened, pesticide-free juicy red tomatoes', indicative_price: 45.0, is_active: true, created_at: '2026-02-01T09:00:00Z' },
    { product_id: 'p0000001-0000-0000-0000-000000000002', category_id: 'c0000001-0000-0000-0000-000000000001', product_name: 'Crisp Yardlong Green Beans', unit: 'kg', description: 'Freshly plucked tender pole beans', indicative_price: 60.0, is_active: true, created_at: '2026-02-01T09:05:00Z' },
    { product_id: 'p0000001-0000-0000-0000-000000000003', category_id: 'c0000001-0000-0000-0000-000000000001', product_name: 'Highland Cabbage', unit: 'kg', description: 'Compact, pesticide-free green cabbage heads', indicative_price: 35.0, is_active: true, created_at: '2026-02-01T09:10:00Z' },
    { product_id: 'p0000001-0000-0000-0000-000000000004', category_id: 'c0000001-0000-0000-0000-000000000002', product_name: 'Grand Naine Bananas', unit: 'kg', description: 'Sweet, naturally ripened golden bananas', indicative_price: 40.0, is_active: true, created_at: '2026-02-01T09:15:00Z' },
    { product_id: 'p0000001-0000-0000-0000-000000000005', category_id: 'c0000001-0000-0000-0000-000000000002', product_name: 'Passion Fruit (Purple Giant)', unit: 'kg', description: 'Fragrant, aromatic citrusy tropical fruit', indicative_price: 110.0, is_active: true, created_at: '2026-02-01T09:20:00Z' },
    { product_id: 'p0000001-0000-0000-0000-000000000006', category_id: 'c0000001-0000-0000-0000-000000000003', product_name: 'Fresh Tapioca (Cassava)', unit: 'kg', description: 'Steaming-grade starch-rich freshly dug tubers', indicative_price: 30.0, is_active: true, created_at: '2026-02-01T09:25:00Z' },
    { product_id: 'p0000001-0000-0000-0000-000000000007', category_id: 'c0000001-0000-0000-0000-000000000004', product_name: 'Organic Red Spinach (Cheera)', unit: 'bunch', description: 'Iron-rich tender ruby red amaranth leaves', indicative_price: 25.0, is_active: true, created_at: '2026-02-01T09:30:00Z' },
    { product_id: 'p0000001-0000-0000-0000-000000000008', category_id: 'c0000001-0000-0000-0000-000000000004', product_name: 'Fresh Mint Leaves', unit: 'bunch', description: 'Aromatic refreshing herbs plucked daily', indicative_price: 15.0, is_active: true, created_at: '2026-02-01T09:35:00Z' },
  ];

  const customers: Customer[] = [
    { customer_id: 'u0000001-0000-0000-0000-000000000001', full_name: 'Alice Mathew', phone: '+91 94470 55111', email: 'alice.m@gmail.com', address: 'Flat 4A, Green Terraces, Kottayam', created_at: '2026-02-01T10:00:00Z' },
    { customer_id: 'u0000001-0000-0000-0000-000000000002', full_name: 'Bob K. Joseph', phone: '+91 98471 22334', email: 'bob.joseph@outlook.com', address: 'House 12, Rose Villa, Pala', created_at: '2026-02-01T10:30:00Z' },
    { customer_id: 'u0000001-0000-0000-0000-000000000003', full_name: 'Catherine Thomas', phone: '+91 94460 33445', email: 'catherine.t@gmail.com', address: 'Hill View Residency, Kanjirappally', created_at: '2026-02-01T11:00:00Z' },
    { customer_id: 'u0000001-0000-0000-0000-000000000004', full_name: 'David Cherian', phone: '+91 97451 99887', email: 'david.cherian@yahoo.com', address: 'Door 7, River Park, Ettumanoor', created_at: '2026-02-02T11:30:00Z' },
    { customer_id: 'u0000001-0000-0000-0000-000000000005', full_name: 'Elizabeth Joy', phone: '+91 98952 44332', email: 'elizabeth.joy@gmail.com', address: 'Pine Valley Road, Vagamon', created_at: '2026-02-02T12:00:00Z' },
    { customer_id: 'u0000001-0000-0000-0000-000000000006', full_name: 'Francis Xavier', phone: '+91 94473 66778', email: 'fxavier@gmail.com', address: 'Teak Wood Enclave, Kanjirappally', created_at: '2026-02-03T12:30:00Z' },
    { customer_id: 'u0000001-0000-0000-0000-000000000007', full_name: 'Gita Ramanathan', phone: '+91 98460 11990', email: 'gita.ram@gmail.com', address: 'Temple Road, Changanassery', created_at: '2026-02-03T14:00:00Z' },
    { customer_id: 'u0000001-0000-0000-0000-000000000008', full_name: 'Hari Krishnan', phone: '+91 97463 88123', email: 'hari.krishnan@gmail.com', address: 'Lakeside Avenue, Kumarakom', created_at: '2026-02-04T15:00:00Z' },
  ];

  const now = new Date();
  const today = now.toISOString().split('T')[0];
  const in3Days = new Date(now.getTime() + 3 * 86400000).toISOString().split('T')[0];
  const in5Days = new Date(now.getTime() + 5 * 86400000).toISOString().split('T')[0];
  const in7Days = new Date(now.getTime() + 7 * 86400000).toISOString().split('T')[0];
  const in24Hours = new Date(now.getTime() + 24 * 3600000).toISOString();
  const yesterday = new Date(now.getTime() - 86400000).toISOString();
  const past6Hours = new Date(now.getTime() - 6 * 3600000).toISOString();

  const expectedHarvests: ExpectedHarvest[] = [
    // CRITICAL DEMO SCENARIO: 100 kg expected tomatoes
    { expected_harvest_id: 'eh000001-0000-0000-0000-000000000001', farm_id: 'fa000001-0000-0000-0000-000000000001', product_id: 'p0000001-0000-0000-0000-000000000001', expected_date: today, expected_quantity: 100.0, forecast_status: 'Harvested', created_at: yesterday },
    { expected_harvest_id: 'eh000001-0000-0000-0000-000000000002', farm_id: 'fa000001-0000-0000-0000-000000000002', product_id: 'p0000001-0000-0000-0000-000000000002', expected_date: today, expected_quantity: 80.0, forecast_status: 'Harvested', created_at: yesterday },
    { expected_harvest_id: 'eh000001-0000-0000-0000-000000000003', farm_id: 'fa000001-0000-0000-0000-000000000003', product_id: 'p0000001-0000-0000-0000-000000000005', expected_date: in3Days, expected_quantity: 50.0, forecast_status: 'Active', created_at: yesterday },
    { expected_harvest_id: 'eh000001-0000-0000-0000-000000000004', farm_id: 'fa000001-0000-0000-0000-000000000004', product_id: 'p0000001-0000-0000-0000-000000000004', expected_date: in5Days, expected_quantity: 120.0, forecast_status: 'Active', created_at: yesterday },
    { expected_harvest_id: 'eh000001-0000-0000-0000-000000000005', farm_id: 'fa000001-0000-0000-0000-000000000005', product_id: 'p0000001-0000-0000-0000-000000000006', expected_date: today, expected_quantity: 150.0, forecast_status: 'Harvested', created_at: yesterday },
  ];

  const harvestBatches: HarvestBatch[] = [
    // CRITICAL DEMO SCENARIO: 70 kg actual tomatoes vs 100 kg expected (Variance = -30 kg)
    { harvest_id: 'hb000001-0000-0000-0000-000000000001', farm_id: 'fa000001-0000-0000-0000-000000000001', product_id: 'p0000001-0000-0000-0000-000000000001', harvest_date: today, quantity: 70.0, available_quantity: 0.0, quality_grade: 'Grade A', freshness_deadline: in5Days, status: 'Fully Allocated', created_at: yesterday },
    { harvest_id: 'hb000001-0000-0000-0000-000000000002', farm_id: 'fa000001-0000-0000-0000-000000000002', product_id: 'p0000001-0000-0000-0000-000000000002', harvest_date: today, quantity: 95.0, available_quantity: 25.0, quality_grade: 'Grade A', freshness_deadline: in7Days, status: 'Surplus Listed', created_at: yesterday },
    { harvest_id: 'hb000001-0000-0000-0000-000000000003', farm_id: 'fa000001-0000-0000-0000-000000000005', product_id: 'p0000001-0000-0000-0000-000000000006', harvest_date: today, quantity: 160.0, available_quantity: 40.0, quality_grade: 'Standard', freshness_deadline: in7Days, status: 'Available', created_at: yesterday },
  ];

  const harvestVariances: HarvestVariance[] = [
    // CRITICAL DEMO SCENARIO: 70 actual - 100 expected = -30 kg (-30.00%)
    { variance_id: 'hv000001-0000-0000-0000-000000000001', expected_harvest_id: 'eh000001-0000-0000-0000-000000000001', harvest_id: 'hb000001-0000-0000-0000-000000000001', expected_quantity_snapshot: 100.0, actual_quantity_snapshot: 70.0, variance_quantity: -30.0, variance_percentage: -30.0, recorded_at: yesterday },
    { variance_id: 'hv000001-0000-0000-0000-000000000002', expected_harvest_id: 'eh000001-0000-0000-0000-000000000002', harvest_id: 'hb000001-0000-0000-0000-000000000002', expected_quantity_snapshot: 80.0, actual_quantity_snapshot: 95.0, variance_quantity: 15.0, variance_percentage: 18.75, recorded_at: yesterday },
    { variance_id: 'hv000001-0000-0000-0000-000000000003', expected_harvest_id: 'eh000001-0000-0000-0000-000000000005', harvest_id: 'hb000001-0000-0000-0000-000000000003', expected_quantity_snapshot: 150.0, actual_quantity_snapshot: 160.0, variance_quantity: 10.0, variance_percentage: 6.67, recorded_at: yesterday },
  ];

  const preOrders: PreOrder[] = [
    // CRITICAL DEMO SCENARIO: Alice (35 kg), Bob (35 kg), Catherine (20 kg) -> Total 90 kg demand against 70 kg harvest!
    { pre_order_id: 'po000001-0000-0000-0000-000000000001', customer_id: 'u0000001-0000-0000-0000-000000000001', expected_harvest_id: 'eh000001-0000-0000-0000-000000000001', requested_quantity: 35.0, allocated_quantity: 35.0, status: 'Fully Allocated', placed_at: yesterday },
    { pre_order_id: 'po000001-0000-0000-0000-000000000002', customer_id: 'u0000001-0000-0000-0000-000000000002', expected_harvest_id: 'eh000001-0000-0000-0000-000000000001', requested_quantity: 35.0, allocated_quantity: 35.0, status: 'Fully Allocated', placed_at: yesterday },
    { pre_order_id: 'po000001-0000-0000-0000-000000000003', customer_id: 'u0000001-0000-0000-0000-000000000003', expected_harvest_id: 'eh000001-0000-0000-0000-000000000001', requested_quantity: 20.0, allocated_quantity: 0.0, status: 'Pending', placed_at: yesterday },

    { pre_order_id: 'po000001-0000-0000-0000-000000000004', customer_id: 'u0000001-0000-0000-0000-000000000004', expected_harvest_id: 'eh000001-0000-0000-0000-000000000002', requested_quantity: 40.0, allocated_quantity: 40.0, status: 'Fulfilled', placed_at: yesterday },
    { pre_order_id: 'po000001-0000-0000-0000-000000000005', customer_id: 'u0000001-0000-0000-0000-000000000005', expected_harvest_id: 'eh000001-0000-0000-0000-000000000002', requested_quantity: 30.0, allocated_quantity: 30.0, status: 'Fulfilled', placed_at: yesterday },
    { pre_order_id: 'po000001-0000-0000-0000-000000000006', customer_id: 'u0000001-0000-0000-0000-000000000006', expected_harvest_id: 'eh000001-0000-0000-0000-000000000003', requested_quantity: 15.0, allocated_quantity: 0.0, status: 'Pending', placed_at: yesterday },
    { pre_order_id: 'po000001-0000-0000-0000-000000000007', customer_id: 'u0000001-0000-0000-0000-000000000007', expected_harvest_id: 'eh000001-0000-0000-0000-000000000003', requested_quantity: 10.0, allocated_quantity: 0.0, status: 'Cancelled', placed_at: yesterday },
  ];

  const allocations: Allocation[] = [
    // 70 kg total allocated: 35 kg to Alice, 35 kg to Bob
    { allocation_id: 'al000001-0000-0000-0000-000000000001', pre_order_id: 'po000001-0000-0000-0000-000000000001', harvest_id: 'hb000001-0000-0000-0000-000000000001', allocated_quantity: 35.0, allocation_status: 'Confirmed', allocated_at: yesterday },
    { allocation_id: 'al000001-0000-0000-0000-000000000002', pre_order_id: 'po000001-0000-0000-0000-000000000002', harvest_id: 'hb000001-0000-0000-0000-000000000001', allocated_quantity: 35.0, allocation_status: 'Confirmed', allocated_at: yesterday },
    { allocation_id: 'al000001-0000-0000-0000-000000000003', pre_order_id: 'po000001-0000-0000-0000-000000000004', harvest_id: 'hb000001-0000-0000-0000-000000000002', allocated_quantity: 40.0, allocation_status: 'Fulfilled', allocated_at: yesterday },
    { allocation_id: 'al000001-0000-0000-0000-000000000004', pre_order_id: 'po000001-0000-0000-0000-000000000005', harvest_id: 'hb000001-0000-0000-0000-000000000002', allocated_quantity: 30.0, allocation_status: 'Fulfilled', allocated_at: yesterday },
  ];

  const surplusListings: SurplusListing[] = [
    { surplus_id: 'sl000001-0000-0000-0000-000000000001', harvest_id: 'hb000001-0000-0000-0000-000000000002', quantity_listed: 25.0, quantity_sold: 10.0, original_unit_price: 60.0, discounted_unit_price: 42.0, sale_deadline: in24Hours, status: 'Active', created_at: yesterday },
    { surplus_id: 'sl000001-0000-0000-0000-000000000002', harvest_id: 'hb000001-0000-0000-0000-000000000003', quantity_listed: 30.0, quantity_sold: 30.0, original_unit_price: 30.0, discounted_unit_price: 20.0, sale_deadline: past6Hours, status: 'Sold Out', created_at: yesterday },
    { surplus_id: 'sl000001-0000-0000-0000-000000000003', harvest_id: 'hb000001-0000-0000-0000-000000000001', quantity_listed: 10.0, quantity_sold: 2.0, original_unit_price: 45.0, discounted_unit_price: 30.0, sale_deadline: past6Hours, status: 'Expired', created_at: yesterday },
  ];

  const orders: Order[] = [
    { order_id: 'o0000001-0000-0000-0000-000000000001', customer_id: 'u0000001-0000-0000-0000-000000000001', order_date: '2026-02-23T10:00:00Z', status: 'Confirmed', total_amount: 1575.0, notes: 'Pre-order fulfilment for 35kg tomatoes' },
    { order_id: 'o0000001-0000-0000-0000-000000000002', customer_id: 'u0000001-0000-0000-0000-000000000004', order_date: '2026-02-24T11:00:00Z', status: 'Delivered', total_amount: 2400.0, notes: 'Pre-order fulfilment for 40kg beans' },
    { order_id: 'o0000001-0000-0000-0000-000000000003', customer_id: 'u0000001-0000-0000-0000-000000000008', order_date: '2026-02-25T09:30:00Z', status: 'Processing', total_amount: 420.0, notes: 'Surplus rescue purchase of 10kg beans' },
  ];

  const orderItems: OrderItem[] = [
    { order_item_id: 'oi000001-0000-0000-0000-000000000001', order_id: 'o0000001-0000-0000-0000-000000000001', product_id: 'p0000001-0000-0000-0000-000000000001', harvest_id: 'hb000001-0000-0000-0000-000000000001', quantity: 35.0, unit_price: 45.0, subtotal: 1575.0 },
    { order_item_id: 'oi000001-0000-0000-0000-000000000002', order_id: 'o0000001-0000-0000-0000-000000000002', product_id: 'p0000001-0000-0000-0000-000000000002', harvest_id: 'hb000001-0000-0000-0000-000000000002', quantity: 40.0, unit_price: 60.0, subtotal: 2400.0 },
    { order_item_id: 'oi000001-0000-0000-0000-000000000003', order_id: 'o0000001-0000-0000-0000-000000000003', product_id: 'p0000001-0000-0000-0000-000000000002', harvest_id: 'hb000001-0000-0000-0000-000000000002', quantity: 10.0, unit_price: 42.0, subtotal: 420.0 },
  ];

  const payments: Payment[] = [
    { payment_id: 'py000001-0000-0000-0000-000000000001', order_id: 'o0000001-0000-0000-0000-000000000001', amount: 1575.0, payment_method: 'UPI', payment_status: 'Completed', transaction_reference: 'UPI/2026/88392101', paid_at: '2026-02-23T10:05:00Z' },
    { payment_id: 'py000001-0000-0000-0000-000000000002', order_id: 'o0000001-0000-0000-0000-000000000002', amount: 2400.0, payment_method: 'Bank Transfer', payment_status: 'Completed', transaction_reference: 'NEFT/KL9938210', paid_at: '2026-02-24T11:15:00Z' },
    { payment_id: 'py000001-0000-0000-0000-000000000003', order_id: 'o0000001-0000-0000-0000-000000000003', amount: 420.0, payment_method: 'Market Wallet', payment_status: 'Pending', transaction_reference: 'WAL/7746193', paid_at: '2026-02-25T09:35:00Z' },
  ];

  const audits: HarvestAudit[] = [
    { audit_id: 'au000001-0000-0000-0000-000000000001', harvest_id: 'hb000001-0000-0000-0000-000000000001', action_type: 'HARVEST_RECORDED', previous_value: null, new_value: { quantity: 70.0, quality_grade: 'Grade A' }, reason: 'Batch plucking completed in morning shift', created_at: '2026-02-23T06:00:00Z' },
    { audit_id: 'au000001-0000-0000-0000-000000000002', harvest_id: 'hb000001-0000-0000-0000-000000000001', action_type: 'ALLOCATION_DEDUCTED', previous_value: { available_quantity: 70.0 }, new_value: { available_quantity: 0.0 }, reason: 'FIFO pre-order allocation executed (70kg to Alice & Bob)', created_at: '2026-02-23T06:10:00Z' },
    { audit_id: 'au000001-0000-0000-0000-000000000003', harvest_id: 'hb000001-0000-0000-0000-000000000002', action_type: 'SURPLUS_LISTED', previous_value: { available_quantity: 25.0 }, new_value: { available_quantity: 25.0, surplus_listed: 25.0 }, reason: '25kg listed for rescue at 30% discount', created_at: '2026-02-24T08:00:00Z' },
  ];

  return {
    farmers,
    farms,
    customers,
    categories,
    products,
    harvestBatches,
    expectedHarvests,
    preOrders,
    orders,
    orderItems,
    payments,
    harvestVariances,
    allocations,
    surplusListings,
    audits,
  };
}
