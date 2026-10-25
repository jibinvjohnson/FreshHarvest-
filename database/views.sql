-- ==============================================================================
-- FreshHarvest — Relational Views for Reporting & Analytics
-- ==============================================================================

-- 1. View: Expected vs Actual Harvest Variance
CREATE OR REPLACE VIEW v_expected_vs_actual_harvest AS
SELECT 
    eh.expected_harvest_id,
    f.farm_name,
    fm.full_name AS farmer_name,
    p.product_name,
    eh.expected_date,
    eh.expected_quantity,
    hb.harvest_id,
    hb.harvest_date AS actual_harvest_date,
    COALESCE(hb.quantity, 0) AS actual_quantity,
    COALESCE(hb.quantity, 0) - eh.expected_quantity AS variance_quantity,
    ROUND(
        CASE 
            WHEN eh.expected_quantity = 0 THEN 0
            ELSE ((COALESCE(hb.quantity, 0) - eh.expected_quantity) / eh.expected_quantity) * 100 
        END, 
        2
    ) AS variance_percentage,
    CASE 
        WHEN hb.quantity IS NULL THEN 'Pending Harvest'
        WHEN hb.quantity < eh.expected_quantity THEN 'Shortfall (Deficit)'
        WHEN hb.quantity = eh.expected_quantity THEN 'Exact Match'
        ELSE 'Surplus (Excess)'
    END AS outcome_status
FROM EXPECTED_HARVEST eh
JOIN FARM f ON eh.farm_id = f.farm_id
JOIN FARMER fm ON f.farmer_id = fm.farmer_id
JOIN PRODUCT p ON eh.product_id = p.product_id
LEFT JOIN HARVEST_VARIANCE hv ON eh.expected_harvest_id = hv.expected_harvest_id
LEFT JOIN HARVEST_BATCH hb ON hv.harvest_id = hb.harvest_id;

-- 2. View: Product Available Stock Across Batches
CREATE OR REPLACE VIEW v_product_available_stock AS
SELECT 
    p.product_id,
    p.product_name,
    c.category_name,
    p.unit,
    p.indicative_price,
    COUNT(hb.harvest_id) AS active_batch_count,
    COALESCE(SUM(hb.available_quantity), 0) AS total_available_stock,
    MIN(hb.freshness_deadline) AS nearest_expiry
FROM PRODUCT p
JOIN CATEGORY c ON p.category_id = c.category_id
LEFT JOIN HARVEST_BATCH hb ON p.product_id = hb.product_id AND hb.available_quantity > 0 AND hb.freshness_deadline >= CURRENT_DATE
GROUP BY p.product_id, p.product_name, c.category_name, p.unit, p.indicative_price;

-- 3. View: Pre-Order Fulfilment & Allocation Summary
CREATE OR REPLACE VIEW v_preorder_allocation_summary AS
SELECT 
    po.pre_order_id,
    c.customer_id,
    c.full_name AS customer_name,
    c.phone AS customer_phone,
    p.product_name,
    eh.expected_date,
    po.requested_quantity,
    po.allocated_quantity,
    (po.requested_quantity - po.allocated_quantity) AS unfulfilled_quantity,
    po.status AS pre_order_status,
    po.placed_at
FROM PRE_ORDER po
JOIN CUSTOMER c ON po.customer_id = c.customer_id
JOIN EXPECTED_HARVEST eh ON po.expected_harvest_id = eh.expected_harvest_id
JOIN PRODUCT p ON eh.product_id = p.product_id;

-- 4. View: Active Surplus Rescue Listings
CREATE OR REPLACE VIEW v_surplus_active_summary AS
SELECT 
    sl.surplus_id,
    sl.harvest_id,
    p.product_name,
    f.farm_name,
    sl.quantity_listed,
    sl.quantity_sold,
    (sl.quantity_listed - sl.quantity_sold) AS quantity_remaining,
    sl.original_unit_price,
    sl.discounted_unit_price,
    ROUND(((sl.original_unit_price - sl.discounted_unit_price) / sl.original_unit_price) * 100, 1) AS discount_percentage,
    sl.sale_deadline,
    sl.status
FROM SURPLUS_LISTING sl
JOIN HARVEST_BATCH hb ON sl.harvest_id = hb.harvest_id
JOIN PRODUCT p ON hb.product_id = p.product_id
JOIN FARM f ON hb.farm_id = f.farm_id;

-- 5. View: Farmer Performance & Reliability
CREATE OR REPLACE VIEW v_farmer_performance_overview AS
SELECT 
    fm.farmer_id,
    fm.full_name AS farmer_name,
    COUNT(DISTINCT f.farm_id) AS total_farms,
    COUNT(DISTINCT eh.expected_harvest_id) AS total_commitments,
    COALESCE(SUM(eh.expected_quantity), 0) AS total_expected_kg,
    COALESCE(SUM(hb.quantity), 0) AS total_harvested_kg,
    ROUND(
        AVG(
            CASE 
                WHEN eh.expected_quantity > 0 AND hb.quantity IS NOT NULL 
                THEN ((hb.quantity - eh.expected_quantity) / eh.expected_quantity) * 100
                ELSE NULL 
            END
        ), 
        2
    ) AS avg_variance_percentage
FROM FARMER fm
LEFT JOIN FARM f ON fm.farmer_id = f.farmer_id
LEFT JOIN EXPECTED_HARVEST eh ON f.farm_id = eh.farm_id
LEFT JOIN HARVEST_VARIANCE hv ON eh.expected_harvest_id = hv.expected_harvest_id
LEFT JOIN HARVEST_BATCH hb ON hv.harvest_id = hb.harvest_id
GROUP BY fm.farmer_id, fm.full_name;
