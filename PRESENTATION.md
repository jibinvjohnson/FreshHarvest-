# FreshHarvest — College Presentation Guide (5–8 Minutes)

**Presentation Title:** FreshHarvest — Local Farmer Market Management System  
**Unique Focus:** Harvest Promise, Fair Pre-Order Allocation, and Surplus Rescue  
**Student Presenter:** Jibin V Johnson (Roll No: 15)  
**Institution:** Amal Jyothi College of Engineering  
**Department:** Computer Science and Engineering / IT  
**Course:** Database Management Systems (DBMS) Capstone Project  

---

## Slide 1: Title & Introduction (1 Minute)
- **Good morning respected evaluators and faculty members.**
- Today I am presenting **FreshHarvest**, a database-driven agricultural technology platform designed to bridge the gap between local farmers and consumers.
- Unlike generic e-commerce applications, FreshHarvest solves the central dilemma of agriculture: **Yield Uncertainty**.
- Farmers cannot predict weather, pests, and rainfall with 100% precision. When expected crops fall short of consumer pre-orders, traditional systems either over-book, cancel arbitrarily, or cause customer frustration.
- FreshHarvest introduces **four core DBMS-driven innovations**:
  1. **Harvest Promise Reliability** (Audited forecast variance).
  2. **Fair Pre-Order Stock Allocation** (ACID FIFO & Proportional distribution).
  3. **Surplus Produce Rescue** (Time-decayed discounted channels).
  4. **Cryptographic Harvest Commitment History** (Immutable audit trails).

---

## Slide 2: Relational Schema & Database Architecture (1.5 Minutes)
- FreshHarvest is built upon a normalized PostgreSQL / Supabase relational architecture comprising **15 core and extension tables**:
  - **Master Entities:** `FARMER`, `FARM`, `CUSTOMER`, `CATEGORY`, `PRODUCT`.
  - **Harvest Pipeline:** `EXPECTED_HARVEST` (Forecasts) $\to$ `HARVEST_BATCH` (Physically plucked yield).
  - **Reservations & Allocation:** `PRE_ORDER` $\to$ `ALLOCATION` (Fair quota binding).
  - **Commercial Orders:** `ORDERS`, `ORDER_ITEM`, `PAYMENT`.
  - **Analytical & Governance:** `HARVEST_VARIANCE`, `SURPLUS_LISTING`, `HARVEST_AUDIT`.
- **Normalization Proof:**
  - **1NF:** Atomic attributes, surrogate primary keys (`UUID`).
  - **2NF:** Zero partial dependencies on composite keys.
  - **3NF:** Zero transitive dependencies (e.g. `PRODUCT` references `CATEGORY` via foreign key; farm plots do not duplicate farmer addresses).
- **Triggers & Integrity Constraints:**
  - Check constraints enforce non-negative prices and non-negative quantities.
  - `trg_guard_allocation` prevents allocating stock beyond physical availability.
  - `trg_audit_harvest` automatically captures before/after JSON snapshots into `HARVEST_AUDIT`.

---

## Slide 3: The Core Demonstrating Scenario (2 Minutes)
- Let us demonstrate the **benchmark scenario** configured in our seed dataset:
  - **Farmer:** Thomas Kurian (Green Valley Organic Estate)
  - **Crop:** Organic Country Tomatoes
  - **Expected Harvest Forecast:** **100 kg**
  - **Valid Pre-Orders Placed:**
    1. Alice Mathew: Requested **35 kg** (Placed at 09:00 AM)
    2. Bob K. Joseph: Requested **35 kg** (Placed at 10:15 AM)
    3. Catherine Thomas: Requested **20 kg** (Placed at 11:30 AM)
    - **Total Customer Demand = 90 kg**
  - **Actual Harvest Weighed from Field:** **70 kg** (a shortfall of -30 kg or -30%)
- **What happens in traditional systems?**
  - Overselling or silent cancellation.
- **What happens in FreshHarvest?**
  1. The **Harvest Promise formula** records:
     $$\Delta Q = 70 - 100 = -30\text{ kg} \quad (-30.00\%)$$
  2. The **Fair Allocation Engine** executes under FIFO:
     - Alice receives full **35 kg**.
     - Bob receives full **35 kg**.
     - Total allocated = **70 kg** (Exactly equals actual harvest; **Stock Invariant preserved**).
     - Catherine receives **0 kg** with an audited **20 kg unfulfilled shortage**.
  3. No ghost stock can ever be listed or allocated.

---

## Slide 4: Surplus Produce Rescue & Anti-Waste Hub (1 Minute)
- For batches where actual harvest exceeds pre-order reservations (such as our 95 kg Green Beans harvest), remaining stock is exposed via **Surplus Rescue**:
  - Farmers configure a discount (e.g. 30% off, from ₹60 down to ₹42/kg).
  - A strict cutoff timestamp (`sale_deadline`) is assigned.
  - The application automatically validates deadlines on access—no non-existent background worker needed.
  - Shoppers rescue produce before decay, decreasing avoidable agricultural loss.

---

## Slide 5: DBMS Live Reports, Views, and Concurrency (1 Minute)
- The platform features live reporting views:
  - `v_expected_vs_actual_harvest`: Evaluates farmer forecast reliability.
  - `v_product_available_stock`: Aggregated inventory across farms.
  - `v_preorder_allocation_summary`: Identifies unfulfilled shortages.
- **Concurrency Control Demonstration:**
  - Demonstrates `BEGIN; SELECT ... FOR UPDATE; COMMIT;` row-level locking to prevent two concurrent shoppers from purchasing the same surplus produce.
- **Automated Testing:**
  - 14 automated tests executed via Vitest validating zero-division safety, negative quantity rejection, foreign-key cascade, and transaction rollback.

---

## Slide 6: Summary & Conclusion (30 Seconds)
- FreshHarvest demonstrates that a thoughtful relational schema combined with disciplined business logic solves real-world agricultural distribution challenges.
- **Key Takeaways:**
  - Transparent harvest variance calculation.
  - Mathematical stock allocation invariants.
  - Zero ghost inventory overselling.
  - Automated surplus decay and rescue.
- **Thank you! I am now ready to demonstrate the live application and answer your questions.**
