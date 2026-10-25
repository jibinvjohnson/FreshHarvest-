-- ==============================================================================
-- FreshHarvest — DBMS Query Demonstrations & Practical Reports
-- ==============================================================================

-- ------------------------------------------------------------------------------
-- 1. BASIC CRUD OPERATIONS
-- ------------------------------------------------------------------------------

-- 1.1 INSERT Demonstration
INSERT INTO PRODUCT (product_id, category_id, product_name, unit, description, indicative_price, is_active)
VALUES (
    gen_random_uuid(),
    'c0000001-0000-0000-0000-000000000001',
    'Bell Pepper (Capsicum)',
    'kg',
    'Crisp green bell peppers grown under shade net',
    75.00,
    TRUE
);

-- 1.2 SELECT with WHERE, ORDER BY, and LIMIT
SELECT product_name, unit, indicative_price
FROM PRODUCT
WHERE is_active = TRUE AND indicative_price > 40.00
ORDER BY indicative_price DESC
LIMIT 5;

-- 1.3 UPDATE Demonstration
UPDATE HARVEST_BATCH
SET quality_grade = 'Premium'
WHERE harvest_id = 'hb000001-0000-0000-0000-000000000002';

-- 1.4 DELETE Demonstration respecting referential integrity
-- Deleting an order item cascades or can be safely removed before order deletion
DELETE FROM ORDER_ITEM 
WHERE order_item_id = 'oi000001-0000-0000-0000-000000000003';

-- ------------------------------------------------------------------------------
-- 2. JOINS & RELATIONAL ALGEBRA
-- ------------------------------------------------------------------------------

-- 2.1 INNER JOIN: Farmers, Farms, and Expected Harvests
SELECT 
    fm.full_name AS farmer_name,
    fm.phone,
    f.farm_name,
    f.location,
    p.product_name,
    eh.expected_date,
    eh.expected_quantity
FROM FARMER fm
JOIN FARM f ON fm.farmer_id = f.farmer_id
JOIN EXPECTED_HARVEST eh ON f.farm_id = eh.farm_id
JOIN PRODUCT p ON eh.product_id = p.product_id
ORDER BY eh.expected_date ASC;

-- 2.2 LEFT JOIN: Products and Available Batches (including products with 0 stock)
SELECT 
    p.product_id,
    p.product_name,
    c.category_name,
    hb.harvest_id,
    COALESCE(hb.available_quantity, 0) AS batch_available_qty,
    hb.freshness_deadline
FROM PRODUCT p
JOIN CATEGORY c ON p.category_id = c.category_id
LEFT JOIN HARVEST_BATCH hb ON p.product_id = hb.product_id AND hb.available_quantity > 0
ORDER BY p.product_name;

-- ------------------------------------------------------------------------------
-- 3. AGGREGATES, GROUP BY, AND HAVING
-- ------------------------------------------------------------------------------

-- 3.1 Aggregation: Total Produce Demand by Category with HAVING Filter
SELECT 
    c.category_name,
    COUNT(DISTINCT p.product_id) AS product_count,
    COUNT(po.pre_order_id) AS total_preorders,
    COALESCE(SUM(po.requested_quantity), 0) AS total_requested_kg
FROM CATEGORY c
JOIN PRODUCT p ON c.category_id = p.category_id
LEFT JOIN EXPECTED_HARVEST eh ON p.product_id = eh.product_id
LEFT JOIN PRE_ORDER po ON eh.expected_harvest_id = po.expected_harvest_id
GROUP BY c.category_name
HAVING COUNT(po.pre_order_id) > 0
ORDER BY total_requested_kg DESC;

-- ------------------------------------------------------------------------------
-- 4. SUBQUERIES (Nested & Correlated)
-- ------------------------------------------------------------------------------

-- 4.1 Correlated Subquery: Customers whose pre-order quantity exceeds average pre-order size
SELECT 
    c.full_name,
    c.email,
    po.requested_quantity
FROM PRE_ORDER po
JOIN CUSTOMER c ON po.customer_id = c.customer_id
WHERE po.requested_quantity > (
    SELECT AVG(requested_quantity) 
    FROM PRE_ORDER
);

-- 4.2 Subquery with EXISTS: Farmers who have had at least one actual shortfall
SELECT fm.full_name, fm.phone
FROM FARMER fm
WHERE EXISTS (
    SELECT 1 
    FROM FARM f
    JOIN EXPECTED_HARVEST eh ON f.farm_id = eh.farm_id
    JOIN HARVEST_VARIANCE hv ON eh.expected_harvest_id = hv.expected_harvest_id
    WHERE f.farmer_id = fm.farmer_id AND hv.variance_quantity < 0
);

-- ------------------------------------------------------------------------------
-- 5. THE ESSENTIAL SHORTFALL & ALLOCATION REPORT
-- ------------------------------------------------------------------------------

SELECT 
    eh.expected_harvest_id,
    p.product_name,
    eh.expected_quantity AS expected_kg,
    hb.quantity AS actual_kg,
    (hb.quantity - eh.expected_quantity) AS variance_kg,
    ROUND(((hb.quantity - eh.expected_quantity) / eh.expected_quantity) * 100, 2) AS variance_pct,
    COALESCE(SUM(po.requested_quantity), 0) AS total_preorder_demand_kg,
    COALESCE(SUM(po.allocated_quantity), 0) AS total_allocated_kg,
    (COALESCE(SUM(po.requested_quantity), 0) - COALESCE(SUM(po.allocated_quantity), 0)) AS unfulfilled_shortfall_kg
FROM EXPECTED_HARVEST eh
JOIN PRODUCT p ON eh.product_id = p.product_id
JOIN HARVEST_VARIANCE hv ON eh.expected_harvest_id = hv.expected_harvest_id
JOIN HARVEST_BATCH hb ON hv.harvest_id = hb.harvest_id
LEFT JOIN PRE_ORDER po ON eh.expected_harvest_id = po.expected_harvest_id
GROUP BY eh.expected_harvest_id, p.product_name, eh.expected_quantity, hb.quantity
ORDER BY eh.expected_harvest_id;

-- ------------------------------------------------------------------------------
-- 6. SAFE TRANSACTION WITH ROW-LEVEL LOCKING (SELECT FOR UPDATE)
-- Demonstrates concurrent stock protection during allocation
-- ------------------------------------------------------------------------------

BEGIN;

-- Lock harvest batch row against concurrent modifications
SELECT harvest_id, available_quantity, status
FROM HARVEST_BATCH
WHERE harvest_id = 'hb000001-0000-0000-0000-000000000001'
FOR UPDATE;

-- Verify stock sufficiency before deducting
-- If available_quantity >= 10.00 THEN
--   INSERT INTO ALLOCATION (pre_order_id, harvest_id, allocated_quantity, allocation_status)
--   VALUES ('po000001-0000-0000-0000-000000000003', 'hb000001-0000-0000-0000-000000000001', 10.00, 'Confirmed');
--   UPDATE HARVEST_BATCH SET available_quantity = available_quantity - 10.00 WHERE harvest_id = '...';
-- END IF;

COMMIT;
