# FreshHarvest Database Documentation

## 1. Overview
The **FreshHarvest** database manages farmer profiles, farms, crop catalog, commitment forecasts (expected harvests), actual harvests, fair pre-order allocations, purchases, surplus rescue listings, and audit trails.

The database is built for **PostgreSQL 14+** and **Supabase PostgreSQL**.

---

## 2. Script Execution Order

To set up the database from scratch, execute the SQL files in this exact sequential order:

1. **`schema.sql`**  
   Creates all 15 core and extension tables, defines PRIMARY KEYs, FOREIGN KEYs with referential actions (`ON DELETE CASCADE / RESTRICT / SET NULL`), and data validation `CHECK` constraints (e.g. non-negative quantities, valid price domains, allowed enum-like statuses).

2. **`indexes.sql`**  
   Adds B-Tree indexes on frequently joined foreign keys (`farm_id`, `product_id`, `customer_id`, etc.) and filtered columns (`harvest_date`, `status`, `sale_deadline`).

3. **`constraints_and_triggers.sql`**  
   Creates PL/pgSQL stored functions and database triggers:
   - `trg_audit_harvest`: Logs harvest entries and availability adjustments into `HARVEST_AUDIT`.
   - `trg_update_order_total`: Dynamically recalculates `ORDERS.total_amount` upon changes to `ORDER_ITEM`.
   - `trg_guard_allocation`: Prevents over-allocation by raising an exception if `allocated_quantity > available_quantity`.

4. **`views.sql`**  
   Creates reporting views:
   - `v_expected_vs_actual_harvest`: Harvest promise variance metrics and shortfall indicators.
   - `v_product_available_stock`: Aggregated inventory across all farms.
   - `v_preorder_allocation_summary`: Pre-order tracking with remaining unallocated quantities.
   - `v_surplus_active_summary`: Active rescue produce with discount percentages.
   - `v_farmer_performance_overview`: Farmer commitment vs harvest history.

5. **`seed.sql`**  
   Populates comprehensive realistic demonstration data:
   - 5 Farmers & 5 Farms in Kerala
   - 4 Categories & 8 Products
   - 8 Customers
   - 5 Expected Harvests & 3 Actual Harvest Batches
   - 7 Pre-orders & 4 Allocations demonstrating the **100 kg expected vs 70 kg actual vs 90 kg demand scenario**
   - 3 Surplus listings (Active, Sold Out, Expired)
   - 3 Orders, 3 Order Items, and 3 Payments
   - Audit logs for traceability

---

## 3. Relational Normalization Analysis (1NF, 2NF, 3NF)

### First Normal Form (1NF)
- **Atomic Attributes**: All attributes contain single, indivisible scalar values (e.g., `full_name`, `phone`, `unit_price`, `quantity`). No comma-separated lists or repeating groups exist. (Audit JSON payload is strictly metadata/snapshot for change tracking, not relational state).
- **Primary Keys**: Every entity has a unique surrogate UUID primary key (`farmer_id`, `farm_id`, `order_id`, etc.).

### Second Normal Form (2NF)
- A table is in 2NF if it is in 1NF and every non-key attribute is fully functionally dependent on the primary key (no partial dependencies).
- In FreshHarvest, all composite relationships (such as order items or allocations) use a single surrogate primary key (`order_item_id`, `allocation_id`), or composite candidate keys where every non-key attribute depends on the full key. For example, in `ORDER_ITEM`, `quantity` and `unit_price` depend entirely on the specific line item identified by `order_item_id`.

### Third Normal Form (3NF)
- A table is in 3NF if it is in 2NF and has no transitive dependencies ($X \to Y$ and $Y \to Z$ where $Z$ is non-prime).
- **Transitive dependency removal examples**:
  - `PRODUCT` stores `category_id`, but does not store `category_name` or `category_description`. If it did, `product_id -> category_id -> category_name` would cause update anomalies. `CATEGORY` is an independent relation.
  - `HARVEST_BATCH` references `farm_id`, but does NOT duplicate `farmer_id` or `farmer_name`. Farmers are accessed via `FARM.farmer_id`.
  - `ORDER_ITEM` references `product_id` and records `unit_price` as a point-in-time price snapshot, preventing historical order modifications if catalog prices change.

---

## 4. How to Run in Supabase or Local PostgreSQL

### Option A: Supabase Web SQL Editor
1. Log in to your Supabase project dashboard.
2. Navigate to **SQL Editor** -> **New Query**.
3. Paste and run `schema.sql`, followed by `indexes.sql`, `constraints_and_triggers.sql`, `views.sql`, and `seed.sql`.

### Option B: Local PostgreSQL (psql CLI)
```bash
# Create the database
createdb -U postgres local_farmer_market

# Execute scripts in sequence
psql -U postgres -d local_farmer_market -f database/schema.sql
psql -U postgres -d local_farmer_market -f database/indexes.sql
psql -U postgres -d local_farmer_market -f database/constraints_and_triggers.sql
psql -U postgres -d local_farmer_market -f database/views.sql
psql -U postgres -d local_farmer_market -f database/seed.sql
```
