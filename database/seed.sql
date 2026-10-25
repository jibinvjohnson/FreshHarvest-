-- ==============================================================================
-- FreshHarvest — Demo Seed Data
-- ==============================================================================

-- 1. CATEGORIES
INSERT INTO CATEGORY (category_id, category_name, description) VALUES
('c0000001-0000-0000-0000-000000000001', 'Vegetables', 'Fresh seasonal garden vegetables and root crops'),
('c0000001-0000-0000-0000-000000000002', 'Fruits', 'Tree-ripened orchard and tropical fruits'),
('c0000001-0000-0000-0000-000000000003', 'Tubers & Roots', 'Nutritious local tubers, tapioca, and yams'),
('c0000001-0000-0000-0000-000000000004', 'Herbs & Leafy Greens', 'Fragrant culinary herbs and organic leafy greens');

-- 2. FARMERS (>= 5 farmers)
INSERT INTO FARMER (farmer_id, full_name, phone, email, address) VALUES
('f0000001-0000-0000-0000-000000000001', 'Thomas Kurian', '+91 94471 23451', 'thomas.kurian@highlandfarms.in', 'Kanjirappally, Kottayam, Kerala'),
('f0000001-0000-0000-0000-000000000002', 'Mary Mathew', '+91 98462 89012', 'mary.mathew@greenmeadows.in', 'Pala, Kottayam, Kerala'),
('f0000001-0000-0000-0000-000000000003', 'Rajan Pillai', '+91 94950 11223', 'rajan.pillai@valleyfresh.in', 'Vagamon, Idukki, Kerala'),
('f0000001-0000-0000-0000-000000000004', 'Joseph Varghese', '+91 97455 33445', 'joseph.v@riverbanks.in', 'Ettumanoor, Kottayam, Kerala'),
('f0000001-0000-0000-0000-000000000005', 'Ancy Chacko', '+91 98950 77889', 'ancy.chacko@sunrisefarms.in', 'Kuttikkanam, Idukki, Kerala');

-- 3. FARMS (>= 5 farms)
INSERT INTO FARM (farm_id, farmer_id, farm_name, location, area) VALUES
('fa000001-0000-0000-0000-000000000001', 'f0000001-0000-0000-0000-000000000001', 'Green Valley Organic Estate', 'Kanjirappally North', 4.5),
('fa000001-0000-0000-0000-000000000002', 'f0000001-0000-0000-0000-000000000002', 'Riverview Vegetable Meadows', 'Pala Riverbank', 3.2),
('fa000001-0000-0000-0000-000000000003', 'f0000001-0000-0000-0000-000000000003', 'Highland Hilltop Plantations', 'Vagamon Heights', 6.0),
('fa000001-0000-0000-0000-000000000004', 'f0000001-0000-0000-0000-000000000004', 'Sunrise Agro Orchards', 'Ettumanoor West', 2.8),
('fa000001-0000-0000-0000-000000000005', 'f0000001-0000-0000-0000-000000000005', 'Mist Canopy Spice & Fruit Farm', 'Kuttikkanam Ridge', 5.0);

-- 4. PRODUCTS (>= 8 products)
INSERT INTO PRODUCT (product_id, category_id, product_name, unit, description, indicative_price, is_active) VALUES
('p0000001-0000-0000-0000-000000000001', 'c0000001-0000-0000-0000-000000000001', 'Organic Country Tomatoes', 'kg', 'Vine-ripened, pesticide-free juicy red tomatoes', 45.00, TRUE),
('p0000001-0000-0000-0000-000000000002', 'c0000001-0000-0000-0000-000000000001', 'Crisp Yardlong Green Beans', 'kg', 'Freshly plucked tender pole beans', 60.00, TRUE),
('p0000001-0000-0000-0000-000000000003', 'c0000001-0000-0000-0000-000000000001', 'Highland Cabbage', 'kg', 'Compact, pesticide-free green cabbage heads', 35.00, TRUE),
('p0000001-0000-0000-0000-000000000004', 'c0000001-0000-0000-0000-000000000002', 'Grand Naine Bananas', 'kg', 'Sweet, naturally ripened golden bananas', 40.00, TRUE),
('p0000001-0000-0000-0000-000000000005', 'c0000001-0000-0000-0000-000000000002', 'Passion Fruit (Purple Giant)', 'kg', 'Fragrant, aromatic citrusy tropical fruit', 110.00, TRUE),
('p0000001-0000-0000-0000-000000000006', 'c0000001-0000-0000-0000-000000000003', 'Fresh Tapioca (Cassava)', 'kg', 'Steaming-grade starch-rich freshly dug tubers', 30.00, TRUE),
('p0000001-0000-0000-0000-000000000007', 'c0000001-0000-0000-0000-000000000004', 'Organic Red Spinach (Cheera)', 'bunch', 'Iron-rich tender ruby red amaranth leaves', 25.00, TRUE),
('p0000001-0000-0000-0000-000000000008', 'c0000001-0000-0000-0000-000000000004', 'Fresh Mint Leaves', 'bunch', 'Aromatic refreshing herbs plucked daily', 15.00, TRUE);

-- 5. CUSTOMERS (>= 8 customers)
INSERT INTO CUSTOMER (customer_id, full_name, phone, email, address) VALUES
('u0000001-0000-0000-0000-000000000001', 'Alice Mathew', '+91 94470 55111', 'alice.m@gmail.com', 'Flat 4A, Green Terraces, Kottayam'),
('u0000001-0000-0000-0000-000000000002', 'Bob K. Joseph', '+91 98471 22334', 'bob.joseph@outlook.com', 'House 12, Rose Villa, Pala'),
('u0000001-0000-0000-0000-000000000003', 'Catherine Thomas', '+91 94460 33445', 'catherine.t@gmail.com', 'Hill View Residency, Kanjirappally'),
('u0000001-0000-0000-0000-000000000004', 'David Cherian', '+91 97451 99887', 'david.cherian@yahoo.com', 'Door 7, River Park, Ettumanoor'),
('u0000001-0000-0000-0000-000000000005', 'Elizabeth Joy', '+91 98952 44332', 'elizabeth.joy@gmail.com', 'Pine Valley Road, Vagamon'),
('u0000001-0000-0000-0000-000000000006', 'Francis Xavier', '+91 94473 66778', 'fxavier@gmail.com', 'Teak Wood Enclave, Kanjirappally'),
('u0000001-0000-0000-0000-000000000007', 'Gita Ramanathan', '+91 98460 11990', 'gita.ram@gmail.com', 'Temple Road, Changanassery'),
('u0000001-0000-0000-0000-000000000008', 'Hari Krishnan', '+91 97463 88123', 'hari.krishnan@gmail.com', 'Lakeside Avenue, Kumarakom');

-- 6. EXPECTED HARVESTS (Commitment Forecasts)
-- EH-01: THE CRITICAL DEMO SCENARIO (100 kg expected tomatoes)
INSERT INTO EXPECTED_HARVEST (expected_harvest_id, farm_id, product_id, expected_date, expected_quantity, forecast_status) VALUES
('eh000001-0000-0000-0000-000000000001', 'fa000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '2 days', 100.00, 'Harvested'),
('eh000001-0000-0000-0000-000000000002', 'fa000001-0000-0000-0000-000000000002', 'p0000001-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '1 day', 80.00, 'Harvested'),
('eh000001-0000-0000-0000-000000000003', 'fa000001-0000-0000-0000-000000000003', 'p0000001-0000-0000-0000-000000000005', CURRENT_DATE + INTERVAL '3 days', 50.00, 'Active'),
('eh000001-0000-0000-0000-000000000004', 'fa000001-0000-0000-0000-000000000004', 'p0000001-0000-0000-0000-000000000004', CURRENT_DATE + INTERVAL '5 days', 120.00, 'Active'),
('eh000001-0000-0000-0000-000000000005', 'fa000001-0000-0000-0000-000000000005', 'p0000001-0000-0000-0000-000000000006', CURRENT_DATE - INTERVAL '3 days', 150.00, 'Harvested');

-- 7. ACTUAL HARVEST BATCHES
-- HB-01: THE CRITICAL DEMO SCENARIO (70 kg actual harvest vs 100 kg expected => 30 kg shortfall)
INSERT INTO HARVEST_BATCH (harvest_id, farm_id, product_id, harvest_date, quantity, available_quantity, quality_grade, freshness_deadline, status) VALUES
('hb000001-0000-0000-0000-000000000001', 'fa000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000001', CURRENT_DATE - INTERVAL '2 days', 70.00, 0.00, 'Grade A', CURRENT_DATE + INTERVAL '5 days', 'Fully Allocated'),
('hb000001-0000-0000-0000-000000000002', 'fa000001-0000-0000-0000-000000000002', 'p0000001-0000-0000-0000-000000000002', CURRENT_DATE - INTERVAL '1 day', 95.00, 25.00, 'Grade A', CURRENT_DATE + INTERVAL '4 days', 'Surplus Listed'),
('hb000001-0000-0000-0000-000000000003', 'fa000001-0000-0000-0000-000000000005', 'p0000001-0000-0000-0000-000000000006', CURRENT_DATE - INTERVAL '3 days', 160.00, 40.00, 'Standard', CURRENT_DATE + INTERVAL '6 days', 'Available');

-- 8. HARVEST VARIANCE (Audited comparison records)
INSERT INTO HARVEST_VARIANCE (variance_id, expected_harvest_id, harvest_id, expected_quantity_snapshot, actual_quantity_snapshot, variance_quantity, variance_percentage) VALUES
-- The critical scenario: 100 expected, 70 actual => -30 kg (-30.00%)
('hv000001-0000-0000-0000-000000000001', 'eh000001-0000-0000-0000-000000000001', 'hb000001-0000-0000-0000-000000000001', 100.00, 70.00, -30.00, -30.00),
-- Beans scenario: 80 expected, 95 actual => +15 kg (+18.75%)
('hv000001-0000-0000-0000-000000000002', 'eh000001-0000-0000-0000-000000000002', 'hb000001-0000-0000-0000-000000000002', 80.00, 95.00, 15.00, 18.75),
-- Tapioca scenario: 150 expected, 160 actual => +10 kg (+6.67%)
('hv000001-0000-0000-0000-000000000003', 'eh000001-0000-0000-0000-000000000005', 'hb000001-0000-0000-0000-000000000003', 150.00, 160.00, 10.00, 6.67);

-- 9. PRE-ORDERS (Valid pre-orders totaling 90 kg against the 100 kg expected tomatoes)
INSERT INTO PRE_ORDER (pre_order_id, customer_id, expected_harvest_id, requested_quantity, allocated_quantity, status, placed_at) VALUES
-- Customer 1: Alice requested 35 kg at 09:00 AM (earliest)
('po000001-0000-0000-0000-000000000001', 'u0000001-0000-0000-0000-000000000001', 'eh000001-0000-0000-0000-000000000001', 35.00, 35.00, 'Fully Allocated', CURRENT_TIMESTAMP - INTERVAL '3 days 4 hours'),
-- Customer 2: Bob requested 35 kg at 10:15 AM
('po000001-0000-0000-0000-000000000002', 'u0000001-0000-0000-0000-000000000002', 'eh000001-0000-0000-0000-000000000001', 35.00, 35.00, 'Fully Allocated', CURRENT_TIMESTAMP - INTERVAL '3 days 3 hours'),
-- Customer 3: Catherine requested 20 kg at 11:30 AM (Total pre-order demand = 35 + 35 + 20 = 90 kg)
-- Because actual harvest was only 70 kg, Alice (35) and Bob (35) consumed all 70 kg. Catherine gets 0 kg (Shortfall = 20 kg)
('po000001-0000-0000-0000-000000000003', 'u0000001-0000-0000-0000-000000000003', 'eh000001-0000-0000-0000-000000000001', 20.00, 0.00, 'Pending', CURRENT_TIMESTAMP - INTERVAL '3 days 2 hours'),

-- Other pre-orders for beans
('po000001-0000-0000-0000-000000000004', 'u0000001-0000-0000-0000-000000000004', 'eh000001-0000-0000-0000-000000000002', 40.00, 40.00, 'Fulfilled', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('po000001-0000-0000-0000-000000000005', 'u0000001-0000-0000-0000-000000000005', 'eh000001-0000-0000-0000-000000000002', 30.00, 30.00, 'Fulfilled', CURRENT_TIMESTAMP - INTERVAL '2 days'),

-- Pre-order for upcoming passion fruit
('po000001-0000-0000-0000-000000000006', 'u0000001-0000-0000-0000-000000000006', 'eh000001-0000-0000-0000-000000000003', 15.00, 0.00, 'Pending', CURRENT_TIMESTAMP - INTERVAL '1 day'),

-- Cancelled pre-order demonstration
('po000001-0000-0000-0000-000000000007', 'u0000001-0000-0000-0000-000000000007', 'eh000001-0000-0000-0000-000000000003', 10.00, 0.00, 'Cancelled', CURRENT_TIMESTAMP - INTERVAL '12 hours');

-- 10. ALLOCATIONS (Fair Pre-Order Allocation linking actual stock to requests)
INSERT INTO ALLOCATION (allocation_id, pre_order_id, harvest_id, allocated_quantity, allocation_status) VALUES
-- Exactly 70 kg allocated to satisfy FIFO: 35 kg to Alice, 35 kg to Bob
('al000001-0000-0000-0000-000000000001', 'po000001-0000-0000-0000-000000000001', 'hb000001-0000-0000-0000-000000000001', 35.00, 'Confirmed'),
('al000001-0000-0000-0000-000000000002', 'po000001-0000-0000-0000-000000000002', 'hb000001-0000-0000-0000-000000000001', 35.00, 'Confirmed'),

-- 70 kg beans allocated
('al000001-0000-0000-0000-000000000003', 'po000001-0000-0000-0000-000000000004', 'hb000001-0000-0000-0000-000000000002', 40.00, 'Fulfilled'),
('al000001-0000-0000-0000-000000000004', 'po000001-0000-0000-0000-000000000005', 'hb000001-0000-0000-0000-000000000002', 30.00, 'Fulfilled');

-- 11. SURPLUS RESCUE LISTINGS (At least 3 surplus listings in different states)
INSERT INTO SURPLUS_LISTING (surplus_id, harvest_id, quantity_listed, quantity_sold, original_unit_price, discounted_unit_price, sale_deadline, status) VALUES
-- 1. Active surplus rescue (25 kg beans listed with 30% discount)
('sl000001-0000-0000-0000-000000000001', 'hb000001-0000-0000-0000-000000000002', 25.00, 10.00, 60.00, 42.00, CURRENT_TIMESTAMP + INTERVAL '24 hours', 'Active'),
-- 2. Sold out surplus rescue
('sl000001-0000-0000-0000-000000000002', 'hb000001-0000-0000-0000-000000000003', 30.00, 30.00, 30.00, 20.00, CURRENT_TIMESTAMP - INTERVAL '1 day', 'Sold Out'),
-- 3. Expired surplus rescue
('sl000001-0000-0000-0000-000000000003', 'hb000001-0000-0000-0000-000000000001', 10.00, 2.00, 45.00, 30.00, CURRENT_TIMESTAMP - INTERVAL '6 hours', 'Expired');

-- 12. ORDERS & ORDER ITEMS
INSERT INTO ORDERS (order_id, customer_id, order_date, status, total_amount, notes) VALUES
('o0000001-0000-0000-0000-000000000001', 'u0000001-0000-0000-0000-000000000001', CURRENT_TIMESTAMP - INTERVAL '1 day', 'Confirmed', 1575.00, 'Pre-order fulfilment for 35kg tomatoes'),
('o0000001-0000-0000-0000-000000000002', 'u0000001-0000-0000-0000-000000000004', CURRENT_TIMESTAMP - INTERVAL '2 days', 'Delivered', 2400.00, 'Pre-order fulfilment for 40kg beans'),
('o0000001-0000-0000-0000-000000000003', 'u0000001-0000-0000-0000-000000000008', CURRENT_TIMESTAMP - INTERVAL '5 hours', 'Processing', 420.00, 'Surplus rescue purchase of 10kg beans');

INSERT INTO ORDER_ITEM (order_item_id, order_id, product_id, harvest_id, quantity, unit_price, subtotal) VALUES
('oi000001-0000-0000-0000-000000000001', 'o0000001-0000-0000-0000-000000000001', 'p0000001-0000-0000-0000-000000000001', 'hb000001-0000-0000-0000-000000000001', 35.00, 45.00, 1575.00),
('oi000001-0000-0000-0000-000000000002', 'o0000001-0000-0000-0000-000000000002', 'p0000001-0000-0000-0000-000000000002', 'hb000001-0000-0000-0000-000000000002', 40.00, 60.00, 2400.00),
('oi000001-0000-0000-0000-000000000003', 'o0000001-0000-0000-0000-000000000003', 'p0000001-0000-0000-0000-000000000002', 'hb000001-0000-0000-0000-000000000002', 10.00, 42.00, 420.00);

-- 13. PAYMENTS
INSERT INTO PAYMENT (payment_id, order_id, amount, payment_method, payment_status, transaction_reference, paid_at) VALUES
('py000001-0000-0000-0000-000000000001', 'o0000001-0000-0000-0000-000000000001', 1575.00, 'UPI', 'Completed', 'UPI/2026/88392101', CURRENT_TIMESTAMP - INTERVAL '1 day'),
('py000001-0000-0000-0000-000000000002', 'o0000001-0000-0000-0000-000000000002', 2400.00, 'Bank Transfer', 'Completed', 'NEFT/KL9938210', CURRENT_TIMESTAMP - INTERVAL '2 days'),
('py000001-0000-0000-0000-000000000003', 'o0000001-0000-0000-0000-000000000003', 420.00, 'Market Wallet', 'Pending', 'WAL/7746193', CURRENT_TIMESTAMP - INTERVAL '5 hours');

-- 14. HARVEST AUDIT LOGS
INSERT INTO HARVEST_AUDIT (audit_id, harvest_id, action_type, previous_value, new_value, reason, created_at) VALUES
('au000001-0000-0000-0000-000000000001', 'hb000001-0000-0000-0000-000000000001', 'HARVEST_RECORDED', NULL, '{"quantity": 70.0, "quality_grade": "Grade A"}', 'Batch plucking completed in morning shift', CURRENT_TIMESTAMP - INTERVAL '2 days 6 hours'),
('au000001-0000-0000-0000-000000000002', 'hb000001-0000-0000-0000-000000000001', 'ALLOCATION_DEDUCTED', '{"available_quantity": 70.0}', '{"available_quantity": 0.0}', 'FIFO pre-order allocation executed (70kg to Alice & Bob)', CURRENT_TIMESTAMP - INTERVAL '2 days 5 hours'),
('au000001-0000-0000-0000-000000000003', 'hb000001-0000-0000-0000-000000000002', 'SURPLUS_LISTED', '{"available_quantity": 25.0}', '{"available_quantity": 25.0, "surplus_listed": 25.0}', '25kg listed for rescue at 30% discount', CURRENT_TIMESTAMP - INTERVAL '1 day 2 hours');
