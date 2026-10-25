# FreshHarvest — Local Farmer Market Management System
> **College DBMS Capstone Project**  
> **Student:** JIBIN V JOHNSON &bull; **Roll No:** 15  
> **Institution:** Amal Jyothi College of Engineering  
> **Unique Focus:** Harvest Promise, Fair Pre-Order Allocation, and Surplus Rescue  
> 
> 🌐 **Live Production Deployment:** [https://fresh-harvest-swart.vercel.app/](https://fresh-harvest-swart.vercel.app/)  
> 📁 **GitHub Repository:** [https://github.com/jibinvjohnson/FreshHarvest-](https://github.com/jibinvjohnson/FreshHarvest-)  

---

## 1. Project Overview

**FreshHarvest** is a complete, full-stack, presentation-ready database-driven platform designed to connect regional farmers with conscious local consumers. 

Traditional market and e-commerce platforms assume static, predictable warehouse inventory. Agriculture, however, is subject to weather, seasonal fluctuations, and biological variance. FreshHarvest bridges this gap with a continuous relational workflow:

```text
Expected Harvest (Commitment) 
       ↓
Customer Pre-Orders (Advance Reservations) 
       ↓
Actual Harvest (Weighed Physical Yield) 
       ↓
Fair Stock Allocation (FIFO / Proportional Invariant Guard) 
       ↓
Order Fulfilment & Commercial Settlement 
       ↓
Surplus Produce Rescue (Discounted Expiry Clearance)
```

---

## 2. Key Features

1. **Harvest Promise Reliability:**  
   Calculates exact yield variance ($\Delta Q = \text{Actual} - \text{Expected}$) and percentage deviation ($V_{\%}$) without division-by-zero errors. Distinguishes shortfalls from surpluses and stores snapshots in `HARVEST_VARIANCE`.
2. **Fair Pre-Order Allocation:**  
   Enforces the mathematical invariant: **$\sum \text{Allocated} \le \text{Available Actual Stock}$**. Previews and executes deterministic FIFO or Proportional allocation without overselling or duplicate assignment.
3. **Surplus Produce Rescue Hub:**  
   Exposes eligible remaining stock at discounted prices with automatic sale deadline expiration tracking.
4. **Farmer Commitment History & Cryptographic Audit:**  
   Maintains immutable database logs (`HARVEST_AUDIT`) capturing before-and-after states for every harvest creation, quantity adjustment, allocation, and surplus transaction.
5. **Interactive DBMS Live Reports & Demonstrable SQL Hub:**  
   Live reporting views and SQL demonstrations covering INSERT, SELECT with WHERE/ORDER BY, UPDATE, DELETE with referential integrity, INNER JOIN, LEFT JOIN, Aggregates (COUNT, SUM, AVG) with GROUP BY & HAVING, Correlated Subqueries, Views, and Concurrency Row-Level Locking (`SELECT FOR UPDATE`).

---

## 3. Technology Stack

- **Framework:** Next.js 15 (App Router)
- **Language:** TypeScript 5.7
- **Styling:** Tailwind CSS 3.4
- **Database Engine:** Supabase PostgreSQL (Remote) with Local Relational Engine (PostgreSQL-compatible demo mode when credentials are not configured)
- **Validation:** Zod schema validation on all inputs and API routes
- **Visualization:** Recharts for dynamic expected vs. actual yield bar charts
- **Icons:** Lucide React
- **Testing:** Vitest automated test suite (14 passing tests)

---

## 4. Quick Start & Setup Instructions

### 4.1 Prerequisites
- Node.js v18+ (tested on Node v24)
- npm v9+

### 4.2 Clone & Install
```bash
# Navigate to project directory
cd DBMS

# Install dependencies
npm install
```

### 4.3 Environment Configuration
Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```

> **Note on Database Connection Modes:**  
> - **Remote Supabase PostgreSQL:** Provide your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` in `.env.local` and run the SQL migration scripts in `/database`.  
> - **High-Fidelity Local Relational Mode:** If Supabase credentials are omitted, FreshHarvest automatically runs in high-fidelity local development mode with an in-memory relational store that strictly enforces foreign keys, unique constraints, check constraints, ACID-like transactions, and seed data.

### 4.4 Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser.

### 4.5 Run Production Build
```bash
npm run build
npm start
```

### 4.6 Run Automated Tests
```bash
npm test
```
Runs all 14 business logic and invariant validation tests.

---

## 5. Database Schema & Setup

All SQL scripts are organized in the `/database` directory. Execute in this exact order:

1. `database/schema.sql`: 15 tables with PKs, FKs, CHECK and UNIQUE constraints.
2. `database/indexes.sql`: B-Tree indexes for foreign keys, dates, and statuses.
3. `database/constraints_and_triggers.sql`: Triggers for `HARVEST_AUDIT`, order total auto-updates, and stock limits.
4. `database/views.sql`: Reporting views (`v_expected_vs_actual_harvest`, `v_product_available_stock`, etc.).
5. `database/seed.sql`: Demonstration data with 5 farmers, 5 farms, 8 products, 8 customers, and realistic transactions.
6. `database/reports.sql`: Demonstrable queries for college lab exams.
7. `database/reset_demo.sql`: Safe script to reset to baseline.

### Schema Normalization
- **1NF:** Single-valued atomic attributes and surrogate UUID primary keys.
- **2NF:** Zero partial dependencies on composite keys.
- **3NF:** Zero transitive dependencies (e.g. `PRODUCT` references `CATEGORY` without duplicating descriptions; `FARM` references `FARMER` without replicating contact info).

---

## 6. The Essential Shortfall Demonstration Walkthrough

To demonstrate the required scenario to examiners:

1. **Navigate to:** `/expected-harvests`
   - Observe **Expected Commitment #1**: Organic Country Tomatoes (Farm: Green Valley Organic Estate, Expected Quantity: **100 kg**).
2. **Navigate to:** `/pre-orders`
   - Notice the three valid customer pre-orders placed against this commitment:
     - Alice Mathew: **35 kg** (09:00 AM)
     - Bob K. Joseph: **35 kg** (10:15 AM)
     - Catherine Thomas: **20 kg** (11:30 AM)
     - **Total Customer Demand = 90 kg**.
3. **Navigate to:** `/harvests`
   - Observe the actual weighed harvest batch: **70 kg**.
4. **Navigate to:** `/reports` (Harvest Variance Tab)
   - Inspect the variance calculation:
     $$\text{Variance} = 70 - 100 = -30\text{ kg} \quad (-30.00\% \text{ Shortfall})$$
5. **Navigate to:** `/allocation` (Fair Allocation Workbench)
   - Select Organic Country Tomatoes (100 kg forecast / 70 kg actual).
   - Under **FIFO Policy**:
     - Alice Mathew receives full **35 kg** grant.
     - Bob K. Joseph receives full **35 kg** grant.
     - Catherine Thomas receives **0 kg** with an explicit **20 kg unfulfilled shortage**.
     - Total allocated = **70 kg** (Exactly equals actual harvest; 0 kg ghost stock created).
   - Click **Execute Allocation Transaction** to run the ACID transaction.
6. **Navigate to:** `/surplus-rescue`
   - Notice that because all 70 kg of tomatoes were consumed by pre-orders, **no tomato surplus exists**.
   - Inspect the Green Beans batch where a genuine surplus of **25 kg** is actively listed at a 30% discount with an live expiry countdown.
   - Click **Rescue Now** to simulate customer purchase and observe real-time inventory decrement.
7. **Navigate to:** `/history`
   - Verify the immutable audit log recording the operations with timestamps.

---

## 7. Project Structure

```text
DBMS/
├── database/                   # Relational SQL Scripts & Migrations
│   ├── schema.sql              # 15 Core & Extension Tables
│   ├── indexes.sql             # Performance Indexes
│   ├── constraints_and_triggers.sql # Stored Functions & Triggers
│   ├── views.sql               # Relational Reporting Views
│   ├── seed.sql                # Demonstration Seed Data
│   ├── reports.sql             # Academic Demonstrable Queries
│   ├── reset_demo.sql          # Demo Purge & Reload
│   └── README.md               # SQL Setup & Normalization Docs
├── src/
│   ├── app/                    # Next.js App Router (18 Real Pages + APIs)
│   │   ├── allocation/         # Fair Allocation Workbench
│   │   ├── api/                # RESTful API Endpoints with Zod Validation
│   │   ├── categories/         # Category CRUD
│   │   ├── customers/          # Customer CRUD
│   │   ├── dashboard/          # Metrics & Recharts Graph
│   │   ├── expected-harvests/  # Crop Commitments
│   │   ├── farmers/            # Farmer CRUD
│   │   ├── farms/              # Farm Management
│   │   ├── harvests/           # Actual Harvest Batches
│   │   ├── history/            # Audit Trail & Commitment Metrics
│   │   ├── login/              # Auth & Role Switcher
│   │   ├── orders/             # Commercial Purchase Orders
│   │   ├── payments/           # Settlement Records
│   │   ├── pre-orders/         # Advance Reservations
│   │   ├── products/           # Product Catalog
│   │   ├── reports/            # DBMS Reports & SQL Viewer
│   │   ├── settings/           # DB Configuration & Demo Reset
│   │   ├── surplus-rescue/     # Surplus Clearance Hub
│   │   ├── globals.css         # Tailwind Styling & Colors
│   │   ├── layout.tsx          # Root Layout with Sidebar & Header
│   │   └── page.tsx            # Project Landing Page
│   ├── components/             # Reusable UI & Chart Components
│   │   ├── HarvestChart.tsx    # Recharts Expected vs Actual Graph
│   │   ├── Header.tsx          # Status Bar & Reset Demo Action
│   │   └── Sidebar.tsx         # Responsive Sidebar Navigation
│   ├── lib/
│   │   ├── db/                 # Repository & In-Memory Relational Engine
│   │   │   ├── initialSeed.ts  # Deterministic Baseline Data
│   │   │   ├── repository.ts   # Unified ACID Database Access Layer
│   │   │   └── supabase.ts     # Supabase Client Initialization
│   │   ├── services/           # Core Business Logic Services
│   │   │   ├── allocationService.ts # FIFO & Proportional Allocation
│   │   │   ├── reportingService.ts  # Dashboard Aggregations
│   │   │   └── varianceService.ts   # Harvest Promise Variance Math
│   │   └── validation/
│   │       └── schemas.ts      # Zod Validation Schemas
│   └── types/
│       └── database.ts         # TypeScript Interfaces for all 15 Tables
├── tests/
│   └── business-logic.test.ts  # 14 Vitest Automated Test Cases
├── ALGORITHMS.md               # Algorithmic & Complexity Documentation
├── PROJECT_REPORT.md           # Formal Academic Project Report
├── PRESENTATION.md             # 5-8 Minute College Presentation Guide
├── TEST_CASES.md               # Test Scenarios & Execution Matrix
├── .env.example                # Sample Environment Variables
├── package.json                # Project Dependencies & Scripts
├── tsconfig.json               # TypeScript Configuration
└── tailwind.config.ts          # Tailwind Theme & Palette Configuration
```

---

## 8. Academic Submission Details

- **Student:** JIBIN V JOHNSON
- **Roll No:** 15
- **Institution:** Amal Jyothi College of Engineering
- **Department:** Computer Science and Engineering
- **Course:** B.Tech DBMS Project Laboratory
