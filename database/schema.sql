-- ==============================================================================
-- FreshHarvest — Local Farmer Market Management System
-- Relational Database Schema (PostgreSQL / Supabase compatible)
-- Database Name: local_farmer_market (or Supabase default postgres)
-- ==============================================================================

-- Clean up any existing tables in reverse dependency order
DROP TABLE IF EXISTS HARVEST_AUDIT CASCADE;
DROP TABLE IF EXISTS SURPLUS_LISTING CASCADE;
DROP TABLE IF EXISTS ALLOCATION CASCADE;
DROP TABLE IF EXISTS HARVEST_VARIANCE CASCADE;
DROP TABLE IF EXISTS PAYMENT CASCADE;
DROP TABLE IF EXISTS ORDER_ITEM CASCADE;
DROP TABLE IF EXISTS ORDERS CASCADE;
DROP TABLE IF EXISTS PRE_ORDER CASCADE;
DROP TABLE IF EXISTS EXPECTED_HARVEST CASCADE;
DROP TABLE IF EXISTS HARVEST_BATCH CASCADE;
DROP TABLE IF EXISTS PRODUCT CASCADE;
DROP TABLE IF EXISTS CATEGORY CASCADE;
DROP TABLE IF EXISTS CUSTOMER CASCADE;
DROP TABLE IF EXISTS FARM CASCADE;
DROP TABLE IF EXISTS FARMER CASCADE;

-- 1. FARMER TABLE
CREATE TABLE FARMER (
    farmer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 2. FARM TABLE
CREATE TABLE FARM (
    farm_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farmer_id UUID NOT NULL REFERENCES FARMER(farmer_id) ON DELETE CASCADE,
    farm_name VARCHAR(150) NOT NULL,
    location VARCHAR(200) NOT NULL,
    area NUMERIC(8, 2) NOT NULL CHECK (area > 0), -- in acres/hectares
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. CUSTOMER TABLE
CREATE TABLE CUSTOMER (
    customer_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    full_name VARCHAR(120) NOT NULL,
    phone VARCHAR(20) NOT NULL,
    email VARCHAR(120) NOT NULL UNIQUE,
    address TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. CATEGORY TABLE
CREATE TABLE CATEGORY (
    category_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_name VARCHAR(80) NOT NULL UNIQUE,
    description TEXT
);

-- 5. PRODUCT TABLE
CREATE TABLE PRODUCT (
    product_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    category_id UUID NOT NULL REFERENCES CATEGORY(category_id) ON DELETE RESTRICT,
    product_name VARCHAR(120) NOT NULL,
    unit VARCHAR(20) NOT NULL DEFAULT 'kg', -- kg, bunch, crate, litre
    description TEXT,
    indicative_price NUMERIC(10, 2) NOT NULL CHECK (indicative_price >= 0),
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. HARVEST_BATCH TABLE (Actual harvest recorded)
CREATE TABLE HARVEST_BATCH (
    harvest_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES FARM(farm_id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES PRODUCT(product_id) ON DELETE RESTRICT,
    harvest_date DATE NOT NULL,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity >= 0),
    available_quantity NUMERIC(10, 2) NOT NULL CHECK (available_quantity >= 0 AND available_quantity <= quantity),
    quality_grade VARCHAR(20) NOT NULL DEFAULT 'Grade A' CHECK (quality_grade IN ('Grade A', 'Grade B', 'Grade C', 'Premium', 'Standard')),
    freshness_deadline DATE NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Available' CHECK (status IN ('Available', 'Partially Allocated', 'Fully Allocated', 'Surplus Listed', 'Sold Out', 'Expired')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. EXPECTED_HARVEST TABLE (Farmer forecast / commitment)
CREATE TABLE EXPECTED_HARVEST (
    expected_harvest_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    farm_id UUID NOT NULL REFERENCES FARM(farm_id) ON DELETE RESTRICT,
    product_id UUID NOT NULL REFERENCES PRODUCT(product_id) ON DELETE RESTRICT,
    expected_date DATE NOT NULL,
    expected_quantity NUMERIC(10, 2) NOT NULL CHECK (expected_quantity > 0),
    forecast_status VARCHAR(30) NOT NULL DEFAULT 'Active' CHECK (forecast_status IN ('Active', 'Harvested', 'Partially Harvested', 'Cancelled', 'Overdue')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 8. PRE_ORDER TABLE (Advance reservation against expected crop)
CREATE TABLE PRE_ORDER (
    pre_order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES CUSTOMER(customer_id) ON DELETE RESTRICT,
    expected_harvest_id UUID NOT NULL REFERENCES EXPECTED_HARVEST(expected_harvest_id) ON DELETE RESTRICT,
    requested_quantity NUMERIC(10, 2) NOT NULL CHECK (requested_quantity > 0),
    allocated_quantity NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (allocated_quantity >= 0 AND allocated_quantity <= requested_quantity),
    status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Partially Allocated', 'Fully Allocated', 'Cancelled', 'Fulfilled')),
    placed_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 9. ORDERS TABLE (Customer purchase orders)
CREATE TABLE ORDERS (
    order_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    customer_id UUID NOT NULL REFERENCES CUSTOMER(customer_id) ON DELETE RESTRICT,
    order_date TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
    status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (status IN ('Pending', 'Confirmed', 'Processing', 'Delivered', 'Cancelled')),
    total_amount NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (total_amount >= 0),
    notes TEXT
);

-- 10. ORDER_ITEM TABLE
CREATE TABLE ORDER_ITEM (
    order_item_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES ORDERS(order_id) ON DELETE CASCADE,
    product_id UUID NOT NULL REFERENCES PRODUCT(product_id) ON DELETE RESTRICT,
    harvest_id UUID REFERENCES HARVEST_BATCH(harvest_id) ON DELETE SET NULL,
    quantity NUMERIC(10, 2) NOT NULL CHECK (quantity > 0),
    unit_price NUMERIC(10, 2) NOT NULL CHECK (unit_price >= 0),
    subtotal NUMERIC(10, 2) NOT NULL CHECK (subtotal >= 0)
);

-- 11. PAYMENT TABLE
CREATE TABLE PAYMENT (
    payment_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    order_id UUID NOT NULL REFERENCES ORDERS(order_id) ON DELETE RESTRICT,
    amount NUMERIC(10, 2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) NOT NULL CHECK (payment_method IN ('UPI', 'Cash on Delivery', 'Bank Transfer', 'Card', 'Market Wallet')),
    payment_status VARCHAR(30) NOT NULL DEFAULT 'Pending' CHECK (payment_status IN ('Pending', 'Completed', 'Failed', 'Refunded')),
    transaction_reference VARCHAR(100),
    paid_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. HARVEST_VARIANCE TABLE (Audited snapshot comparing forecast vs reality)
CREATE TABLE HARVEST_VARIANCE (
    variance_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expected_harvest_id UUID NOT NULL REFERENCES EXPECTED_HARVEST(expected_harvest_id) ON DELETE RESTRICT,
    harvest_id UUID NOT NULL REFERENCES HARVEST_BATCH(harvest_id) ON DELETE RESTRICT,
    expected_quantity_snapshot NUMERIC(10, 2) NOT NULL CHECK (expected_quantity_snapshot >= 0),
    actual_quantity_snapshot NUMERIC(10, 2) NOT NULL CHECK (actual_quantity_snapshot >= 0),
    variance_quantity NUMERIC(10, 2) NOT NULL, -- actual - expected (negative = shortfall, positive = surplus)
    variance_percentage NUMERIC(8, 2) NOT NULL, -- ((actual - expected) / expected) * 100
    recorded_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 13. ALLOCATION TABLE (Fair distribution linking pre-orders to actual batches)
CREATE TABLE ALLOCATION (
    allocation_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    pre_order_id UUID NOT NULL REFERENCES PRE_ORDER(pre_order_id) ON DELETE RESTRICT,
    harvest_id UUID NOT NULL REFERENCES HARVEST_BATCH(harvest_id) ON DELETE RESTRICT,
    allocated_quantity NUMERIC(10, 2) NOT NULL CHECK (allocated_quantity > 0),
    allocation_status VARCHAR(30) NOT NULL DEFAULT 'Confirmed' CHECK (allocation_status IN ('Confirmed', 'Fulfilled', 'Released', 'Cancelled')),
    allocated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 14. SURPLUS_LISTING TABLE (Discounted rescue of unsold, unallocated fresh stock)
CREATE TABLE SURPLUS_LISTING (
    surplus_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    harvest_id UUID NOT NULL REFERENCES HARVEST_BATCH(harvest_id) ON DELETE RESTRICT,
    quantity_listed NUMERIC(10, 2) NOT NULL CHECK (quantity_listed > 0),
    quantity_sold NUMERIC(10, 2) NOT NULL DEFAULT 0 CHECK (quantity_sold >= 0 AND quantity_sold <= quantity_listed),
    original_unit_price NUMERIC(10, 2) NOT NULL CHECK (original_unit_price >= 0),
    discounted_unit_price NUMERIC(10, 2) NOT NULL CHECK (discounted_unit_price >= 0 AND discounted_unit_price <= original_unit_price),
    sale_deadline TIMESTAMPTZ NOT NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Active' CHECK (status IN ('Active', 'Sold Out', 'Expired', 'Withdrawn')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 15. HARVEST_AUDIT TABLE (Traceability for critical quantity & state transitions)
CREATE TABLE HARVEST_AUDIT (
    audit_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    harvest_id UUID NOT NULL REFERENCES HARVEST_BATCH(harvest_id) ON DELETE CASCADE,
    action_type VARCHAR(50) NOT NULL CHECK (action_type IN ('HARVEST_RECORDED', 'QUANTITY_ADJUSTED', 'ALLOCATION_DEDUCTED', 'SURPLUS_LISTED', 'SURPLUS_SOLD', 'BATCH_EXPIRED')),
    previous_value JSONB,
    new_value JSONB,
    reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);
