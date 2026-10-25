-- ==============================================================================
-- FreshHarvest — Demo Reset Script
-- WARNING: This script purges all transactional data and re-seeds the baseline demo.
-- ==============================================================================

\echo 'WARNING: Deleting all existing FreshHarvest data and reloading seed dataset...'

BEGIN;

-- Truncate all tables cascading referential relationships
TRUNCATE TABLE 
    HARVEST_AUDIT,
    SURPLUS_LISTING,
    ALLOCATION,
    HARVEST_VARIANCE,
    PAYMENT,
    ORDER_ITEM,
    ORDERS,
    PRE_ORDER,
    EXPECTED_HARVEST,
    HARVEST_BATCH,
    PRODUCT,
    CATEGORY,
    CUSTOMER,
    FARM,
    FARMER
CASCADE;

COMMIT;

\i seed.sql;

\echo 'FreshHarvest database reset complete! Demo dataset restored successfully.'
