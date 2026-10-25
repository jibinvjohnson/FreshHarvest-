# FreshHarvest: Local Farmer Market Management System
## Academic Project Report & Database Architecture Specification

**Student Name:** JIBIN V JOHNSON  
**Roll No:** 15  
**Degree:** Bachelor of Technology (B.Tech)  
**Institution:** Amal Jyothi College of Engineering  
**Department:** Computer Science and Engineering  
**Course:** Database Management Systems (DBMS) Capstone Laboratory  

---

## 1. Abstract
Agricultural market platforms frequently suffer from severe supply mismatches between anticipated crop yields and actual harvested quantities. Traditional e-commerce models operate under the assumption of stable factory inventory, leading to overbooking, cancelled consumer orders, unfair distribution during crop shortfalls, and substantial post-harvest food waste when unexpected surpluses occur.

**FreshHarvest** is a full-stack, relational database-driven platform built on Next.js 15, TypeScript, Tailwind CSS, and PostgreSQL / Supabase. FreshHarvest introduces a novel agricultural supply pipeline: **Expected Harvest $\to$ Customer Pre-Orders $\to$ Actual Harvest $\to$ Fair Stock Allocation $\to$ Order Fulfilment $\to$ Surplus Rescue**. The system enforces mathematical invariants ensuring that customer allocations never exceed verified harvest quantities, calculates audited harvest variance, provides deterministic stock allocation policies (FIFO and Proportional), enables time-decayed surplus produce rescue, and records an immutable audit trail (`HARVEST_AUDIT`).

---

## 2. Introduction & Problem Statement

### 2.1 Problem Statement
Smallholder agricultural marketing faces four systemic hurdles:
1. **Harvest Yield Uncertainty:** Biological variation and seasonal weather make exact yield prediction impossible. Farmers frequently over-commit or experience shortfalls.
2. **Unfair Allocation & Overbooking:** When harvest yields fall short of pre-orders, traditional platforms either silently cancel orders without explanation or allocate arbitrarily, alienating loyal consumers.
3. **Surplus Spoilage:** When physical harvest exceeds advance demand, excess perishable produce rots due to lack of immediate, discounted consumer clearance channels.
4. **Data Inconsistency:** Manual logbooks lack referential integrity, enabling negative quantities, orphan records, and historical tampering.

---

## 3. Comparison: Existing Systems vs. FreshHarvest

| Dimension | Existing Farm Direct / E-Commerce Platforms | FreshHarvest Proposed System |
|---|---|---|
| **Inventory Source** | Static warehouse assumptions | Dynamic two-stage pipeline (Forecast Commitment $\to$ Verified Batch) |
| **Shortfall Handling** | Random cancellation, overselling | Deterministic allocation policy (FIFO / Proportional) with transparent shortage calculation |
| **Commitment Auditing** | None; forecasts are discarded | Point-in-time snapshot variance table (`HARVEST_VARIANCE`) |
| **Surplus Handling** | Often dumped or unlisted | Real-time surplus listing with automated expiry and discount pricing |
| **Database Integrity** | Loose NoSQL or unnormalized schemas | 3NF PostgreSQL schema with foreign keys, CHECK constraints, and triggers |

---

## 4. System Objectives & Mathematical Formulations

### 4.1 Harvest Promise Formula
$$\Delta Q = Q_{actual} - Q_{expected}$$
$$V_{\%} = \begin{cases} 
0\% & \text{if } Q_E = 0 \text{ and } Q_A = 0 \\
+100\% & \text{if } Q_E = 0 \text{ and } Q_A > 0 \\
\left(\frac{Q_A - Q_E}{Q_E}\right) \times 100 & \text{if } Q_E > 0 
\end{cases}$$

### 4.2 Stock Allocation Invariant
$$\sum_{i=1}^{m} \text{AllocatedQuantity}_i \le \text{AvailableHarvestStock}$$
The total stock allocated to customer pre-orders must never exceed the actual confirmed harvest quantity.

---

## 5. Entity-Relationship (ER) Model

```mermaid
erDiagram
    FARMER ||--o{ FARM : owns
    FARM ||--o{ EXPECTED_HARVEST : forecasts
    FARM ||--o{ HARVEST_BATCH : plucks
    CATEGORY ||--o{ PRODUCT : classifies
    PRODUCT ||--o{ EXPECTED_HARVEST : commits
    PRODUCT ||--o{ HARVEST_BATCH : yields
    PRODUCT ||--o{ ORDER_ITEM : ordered_in
    CUSTOMER ||--o{ PRE_ORDER : reserves
    CUSTOMER ||--o{ ORDERS : places
    EXPECTED_HARVEST ||--o{ PRE_ORDER : requested_for
    EXPECTED_HARVEST ||--o{ HARVEST_VARIANCE : compared_in
    HARVEST_BATCH ||--o{ HARVEST_VARIANCE : records
    HARVEST_BATCH ||--o{ ALLOCATION : fulfills
    PRE_ORDER ||--o{ ALLOCATION : receives
    HARVEST_BATCH ||--o{ SURPLUS_LISTING : clears
    HARVEST_BATCH ||--o{ HARVEST_AUDIT : audits
    ORDERS ||--o{ ORDER_ITEM : contains
    ORDERS ||--o{ PAYMENT : settles
    HARVEST_BATCH ||--o{ ORDER_ITEM : sources

    FARMER {
        uuid farmer_id PK
        string full_name
        string phone
        string email UK
        string address
        timestamp created_at
    }

    FARM {
        uuid farm_id PK
        uuid farmer_id FK
        string farm_name
        string location
        numeric area
        timestamp created_at
    }

    CUSTOMER {
        uuid customer_id PK
        string full_name
        string phone
        string email UK
        string address
        timestamp created_at
    }

    CATEGORY {
        uuid category_id PK
        string category_name UK
        string description
    }

    PRODUCT {
        uuid product_id PK
        uuid category_id FK
        string product_name
        string unit
        numeric indicative_price
        boolean is_active
        timestamp created_at
    }

    EXPECTED_HARVEST {
        uuid expected_harvest_id PK
        uuid farm_id FK
        uuid product_id FK
        date expected_date
        numeric expected_quantity
        string forecast_status
        timestamp created_at
    }

    HARVEST_BATCH {
        uuid harvest_id PK
        uuid farm_id FK
        uuid product_id FK
        date harvest_date
        numeric quantity
        numeric available_quantity
        string quality_grade
        date freshness_deadline
        string status
        timestamp created_at
    }

    PRE_ORDER {
        uuid pre_order_id PK
        uuid customer_id FK
        uuid expected_harvest_id FK
        numeric requested_quantity
        numeric allocated_quantity
        string status
        timestamp placed_at
    }

    ALLOCATION {
        uuid allocation_id PK
        uuid pre_order_id FK
        uuid harvest_id FK
        numeric allocated_quantity
        string allocation_status
        timestamp allocated_at
    }

    SURPLUS_LISTING {
        uuid surplus_id PK
        uuid harvest_id FK
        numeric quantity_listed
        numeric quantity_sold
        numeric original_unit_price
        numeric discounted_unit_price
        timestamp sale_deadline
        string status
        timestamp created_at
    }

    ORDERS {
        uuid order_id PK
        uuid customer_id FK
        timestamp order_date
        string status
        numeric total_amount
        string notes
    }

    ORDER_ITEM {
        uuid order_item_id PK
        uuid order_id FK
        uuid product_id FK
        uuid harvest_id FK
        numeric quantity
        numeric unit_price
        numeric subtotal
    }

    PAYMENT {
        uuid payment_id PK
        uuid order_id FK
        numeric amount
        string payment_method
        string payment_status
        string transaction_reference
        timestamp paid_at
    }

    HARVEST_VARIANCE {
        uuid variance_id PK
        uuid expected_harvest_id FK
        uuid harvest_id FK
        numeric expected_quantity_snapshot
        numeric actual_quantity_snapshot
        numeric variance_quantity
        numeric variance_percentage
        timestamp recorded_at
    }

    HARVEST_AUDIT {
        uuid audit_id PK
        uuid harvest_id FK
        string action_type
        jsonb previous_value
        jsonb new_value
        string reason
        timestamp created_at
    }
```

---

## 6. Relational Normalization (1NF, 2NF, 3NF Analysis)

### 6.1 First Normal Form (1NF)
- **Atomic Values:** Every column in the 15 relations holds only indivisible, atomic values. No comma-delimited strings or multi-valued attributes exist.
- **Unique Identification:** Every tuple is uniquely identified by a single primary surrogate key (`UUID`).

### 6.2 Second Normal Form (2NF)
- **Functional Dependencies:** A relation is in 2NF if it is in 1NF and no non-prime attribute is partially dependent on any candidate key.
- In FreshHarvest, tables with composite natural relationships (e.g., `ORDER_ITEM`, `ALLOCATION`) use surrogate primary keys where every non-key attribute is fully functionally dependent on the primary key:
  - $\text{order\_item\_id} \to (\text{order\_id}, \text{product\_id}, \text{quantity}, \text{unit\_price}, \text{subtotal})$
  - Neither `quantity` nor `unit_price` depends on a subset of the primary key.

### 6.3 Third Normal Form (3NF)
- A relation is in 3NF if it is in 2NF and has no transitive dependencies ($X \to Y$ and $Y \to Z$ where $Z$ is non-prime).
- **Transitive Dependency Elimination Examples:**
  - `PRODUCT` holds `category_id`, but does NOT store `category_name` or `description`. Storing both would create $product\_id \to category\_id \to category\_name$. `CATEGORY` was separated into an independent relation.
  - `FARM` references `farmer_id`, but does not replicate the farmer's personal contact details (`phone`, `email`, `address`).
  - `ORDER_ITEM` records `unit_price` strictly as a point-in-time transaction snapshot to prevent historical order corruption when catalog prices change.

---

## 7. The Critical Shortfall Demonstration Scenario

To verify that the system handles crop deficits robustly, FreshHarvest embeds an explicit benchmark scenario:
1. **Farmer:** Thomas Kurian (Green Valley Organic Estate).
2. **Crop:** Organic Country Tomatoes.
3. **Expected Harvest Forecast:** 100 kg.
4. **Valid Pre-Orders Placed:**
   - Alice Mathew: 35 kg (09:00 AM)
   - Bob K. Joseph: 35 kg (10:15 AM)
   - Catherine Thomas: 20 kg (11:30 AM)
   - **Total Demand:** 90 kg.
5. **Actual Harvest Weighed:** 70 kg.
6. **Execution Outcome:**
   - Variance: $70 - 100 = -30$ kg (-30.00% shortfall).
   - Alice receives full 35 kg.
   - Bob receives full 35 kg.
   - Total allocated = 70 kg (100% of actual batch yield).
   - Catherine receives 0 kg with an explicit 20 kg shortfall.
   - Batch stock remaining = 0 kg; no ghost inventory overselling.

---

## 8. Automated Testing & Verification
FreshHarvest includes an automated Vitest test suite (`tests/business-logic.test.ts`) covering all 14 required cases:
- Shortfall & surplus variance calculations.
- Zero expected quantity safe division.
- FIFO and Proportional allocation previews and executions.
- Invariant assertions: Allocated $\le$ Available.
- Rejection of invalid negative quantities.
- Surplus auto-expiration and inventory limits.
- Server-side order total recalculations.
- Foreign-key referential integrity enforcement.
- Transactional state preservation on failure.

All 14 tests pass cleanly with 100% assertion success.

---

## 9. Conclusion & Future Scope
FreshHarvest proves that embedding agricultural realities directly into relational database models prevents inventory overselling, maintains consumer trust through transparent allocation policies, and reduces food waste via automated surplus rescue. Future work includes GPS route optimization for farm pickups and IoT cold-storage sensor integration.
