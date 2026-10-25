-- ==============================================================================
-- FreshHarvest — Indexes for Performance & Query Optimization
-- ==============================================================================

-- Foreign Key Indexes to optimize JOIN operations
CREATE INDEX idx_farm_farmer ON FARM(farmer_id);
CREATE INDEX idx_product_category ON PRODUCT(category_id);
CREATE INDEX idx_harvest_farm ON HARVEST_BATCH(farm_id);
CREATE INDEX idx_harvest_product ON HARVEST_BATCH(product_id);
CREATE INDEX idx_expected_farm ON EXPECTED_HARVEST(farm_id);
CREATE INDEX idx_expected_product ON EXPECTED_HARVEST(product_id);
CREATE INDEX idx_preorder_customer ON PRE_ORDER(customer_id);
CREATE INDEX idx_preorder_expected ON PRE_ORDER(expected_harvest_id);
CREATE INDEX idx_orders_customer ON ORDERS(customer_id);
CREATE INDEX idx_orderitem_order ON ORDER_ITEM(order_id);
CREATE INDEX idx_orderitem_product ON ORDER_ITEM(product_id);
CREATE INDEX idx_payment_order ON PAYMENT(order_id);
CREATE INDEX idx_variance_expected ON HARVEST_VARIANCE(expected_harvest_id);
CREATE INDEX idx_variance_harvest ON HARVEST_VARIANCE(harvest_id);
CREATE INDEX idx_allocation_preorder ON ALLOCATION(pre_order_id);
CREATE INDEX idx_allocation_harvest ON ALLOCATION(harvest_id);
CREATE INDEX idx_surplus_harvest ON SURPLUS_LISTING(harvest_id);
CREATE INDEX idx_audit_harvest ON HARVEST_AUDIT(harvest_id);

-- Date and Status Filtering Indexes
CREATE INDEX idx_harvest_date ON HARVEST_BATCH(harvest_date);
CREATE INDEX idx_harvest_status ON HARVEST_BATCH(status);
CREATE INDEX idx_harvest_freshness ON HARVEST_BATCH(freshness_deadline);
CREATE INDEX idx_expected_date ON EXPECTED_HARVEST(expected_date);
CREATE INDEX idx_expected_status ON EXPECTED_HARVEST(forecast_status);
CREATE INDEX idx_preorder_status ON PRE_ORDER(status);
CREATE INDEX idx_preorder_placed ON PRE_ORDER(placed_at);
CREATE INDEX idx_orders_date ON ORDERS(order_date);
CREATE INDEX idx_orders_status ON ORDERS(status);
CREATE INDEX idx_surplus_status_deadline ON SURPLUS_LISTING(status, sale_deadline);
