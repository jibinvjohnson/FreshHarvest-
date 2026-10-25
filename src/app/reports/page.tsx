'use client';

import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  Scale,
  Layers,
  ClipboardList,
  Sparkles,
  Users,
  Code2,
  TrendingDown,
  TrendingUp,
  ShieldCheck,
  CheckCircle,
  Copy
} from 'lucide-react';
import {
  ExpectedHarvest,
  HarvestBatch,
  HarvestVariance,
  Product,
  Farm,
  Farmer,
  PreOrder,
  Customer,
  SurplusListing
} from '@/types/database';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<'variance' | 'stock' | 'preorders' | 'surplus' | 'farmers' | 'sql'>('variance');
  const [variances, setVariances] = useState<HarvestVariance[]>([]);
  const [expectedHarvests, setExpectedHarvests] = useState<ExpectedHarvest[]>([]);
  const [batches, setBatches] = useState<HarvestBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [surplusListings, setSurplusListings] = useState<SurplusListing[]>([]);
  const [copiedSql, setCopiedSql] = useState<string | null>(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        const [resE, resB, resP, resFa, resFm, resPO, resC, resS] = await Promise.all([
          fetch('/api/expected-harvests'),
          fetch('/api/harvests'),
          fetch('/api/products'),
          fetch('/api/farms'),
          fetch('/api/farmers'),
          fetch('/api/pre-orders'),
          fetch('/api/customers'),
          fetch('/api/surplus'),
        ]);

        const dataE = await resE.json();
        const dataB = await resB.json();
        const dataP = await resP.json();
        const dataFa = await resFa.json();
        const dataFm = await resFm.json();
        const dataPO = await resPO.json();
        const dataC = await resC.json();
        const dataS = await resS.json();

        setExpectedHarvests(Array.isArray(dataE) ? dataE : []);
        setBatches(Array.isArray(dataB) ? dataB : []);
        setProducts(Array.isArray(dataP) ? dataP : []);
        setFarms(Array.isArray(dataFa) ? dataFa : []);
        setFarmers(Array.isArray(dataFm) ? dataFm : []);
        setPreOrders(Array.isArray(dataPO) ? dataPO : []);
        setCustomers(Array.isArray(dataC) ? dataC : []);
        setSurplusListings(Array.isArray(dataS) ? dataS : []);
      } catch (e) {
        console.error(e);
      }
    };
    fetchAll();
  }, []);

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSql(label);
    setTimeout(() => setCopiedSql(null), 2000);
  };

  const sqlSnippets = [
    {
      title: '1. INSERT Crop Variety Demonstration',
      category: 'Data Manipulation Language (DML)',
      code: `-- Inserting a new catalog product with category referential integrity
INSERT INTO PRODUCT (product_id, category_id, product_name, unit, indicative_price, is_active)
VALUES (
    gen_random_uuid(),
    'c0000001-0000-0000-0000-000000000001',
    'Bell Pepper (Capsicum)',
    'kg',
    75.00,
    TRUE
);`,
    },
    {
      title: '2. SELECT with WHERE and ORDER BY',
      category: 'DML Queries',
      code: `-- High-value active produce sorted in descending price order
SELECT product_name, unit, indicative_price
FROM PRODUCT
WHERE is_active = TRUE AND indicative_price >= 40.00
ORDER BY indicative_price DESC
LIMIT 5;`,
    },
    {
      title: '3. INNER JOIN: Farmers, Farms, and Expected Harvests',
      category: 'Relational Joins',
      code: `-- Joining 3 relations across Foreign Keys
SELECT 
    fm.full_name AS farmer_name,
    f.farm_name,
    f.location,
    p.product_name,
    eh.expected_date,
    eh.expected_quantity
FROM FARMER fm
JOIN FARM f ON fm.farmer_id = f.farmer_id
JOIN EXPECTED_HARVEST eh ON f.farm_id = eh.farm_id
JOIN PRODUCT p ON eh.product_id = p.product_id
ORDER BY eh.expected_date ASC;`,
    },
    {
      title: '4. LEFT JOIN: Products with Available Stock Inventory',
      category: 'Relational Joins',
      code: `-- Preserves all catalog products even if 0 harvest stock exists
SELECT 
    p.product_name,
    c.category_name,
    p.unit,
    COALESCE(SUM(hb.available_quantity), 0) AS total_available_stock
FROM PRODUCT p
JOIN CATEGORY c ON p.category_id = c.category_id
LEFT JOIN HARVEST_BATCH hb ON p.product_id = hb.product_id AND hb.available_quantity > 0
GROUP BY p.product_id, p.product_name, c.category_name, p.unit
ORDER BY total_available_stock DESC;`,
    },
    {
      title: '5. AGGREGATES, GROUP BY, and HAVING',
      category: 'Analytical Queries',
      code: `-- Pre-order demand aggregation by category filtered by HAVING count > 0
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
ORDER BY total_requested_kg DESC;`,
    },
    {
      title: '6. CORRELATED SUBQUERY: Above-Average Pre-Order Demand',
      category: 'Subqueries & Nested Relational Calculus',
      code: `-- Identifies customers whose requested reservation exceeds average pre-order size
SELECT 
    c.full_name,
    c.email,
    po.requested_quantity
FROM PRE_ORDER po
JOIN CUSTOMER c ON po.customer_id = c.customer_id
WHERE po.requested_quantity > (
    SELECT AVG(requested_quantity) 
    FROM PRE_ORDER
);`,
    },
    {
      title: '7. SAFE TRANSACTION WITH ROW-LEVEL LOCKING (SELECT FOR UPDATE)',
      category: 'Concurrency Control & ACID Transactions',
      code: `-- Prevents two concurrent requests from allocating or selling the same harvest stock
BEGIN;

-- Lock the target batch row exclusively against concurrent writes
SELECT harvest_id, available_quantity, status
FROM HARVEST_BATCH
WHERE harvest_id = 'hb000001-0000-0000-0000-000000000001'
FOR UPDATE;

-- Critical Invariant Guard: Ensure sufficient stock
-- IF (available_quantity >= requested_allocation) THEN
--   INSERT INTO ALLOCATION (pre_order_id, harvest_id, allocated_quantity, allocation_status)
--   VALUES ('po000001-...', 'hb000001-...', 35.0, 'Confirmed');
--   UPDATE HARVEST_BATCH SET available_quantity = available_quantity - 35.0;
-- ELSE
--   RAISE EXCEPTION 'Stock shortage';
-- END IF;

COMMIT;`,
    },
    {
      title: '8. DATABASE VIEW: Harvest Promise Variance',
      category: 'Database Views (v_expected_vs_actual_harvest)',
      code: `CREATE OR REPLACE VIEW v_expected_vs_actual_harvest AS
SELECT 
    eh.expected_harvest_id,
    f.farm_name,
    p.product_name,
    eh.expected_quantity,
    COALESCE(hb.quantity, 0) AS actual_quantity,
    COALESCE(hb.quantity, 0) - eh.expected_quantity AS variance_quantity,
    ROUND(
        CASE 
            WHEN eh.expected_quantity = 0 THEN 0
            ELSE ((COALESCE(hb.quantity, 0) - eh.expected_quantity) / eh.expected_quantity) * 100 
        END, 
        2
    ) AS variance_percentage
FROM EXPECTED_HARVEST eh
JOIN FARM f ON eh.farm_id = f.farm_id
JOIN PRODUCT p ON eh.product_id = p.product_id
LEFT JOIN HARVEST_VARIANCE hv ON eh.expected_harvest_id = hv.expected_harvest_id
LEFT JOIN HARVEST_BATCH hb ON hv.harvest_id = hb.harvest_id;`,
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <BarChart3 className="w-6 h-6 text-forest-700" />
            <span>DBMS Live Reports & SQL Queries Hub</span>
          </h1>
          <p className="text-stone-600 text-sm">
            Relational summaries, normalization compliance, and demonstrable SQL query examples for academic presentation
          </p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex flex-wrap gap-1.5 p-1 bg-stone-100 rounded-xl border border-stone-200">
        {[
          { id: 'variance', label: 'Harvest Variance', icon: Scale },
          { id: 'stock', label: 'Product Stock', icon: Layers },
          { id: 'preorders', label: 'Pre-Order Fulfilment', icon: ClipboardList },
          { id: 'surplus', label: 'Surplus Rescue', icon: Sparkles },
          { id: 'farmers', label: 'Farmer Reliability', icon: Users },
          { id: 'sql', label: 'Demonstrable SQL Queries', icon: Code2 },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-lg text-xs font-bold transition-all ${
                isActive
                  ? 'bg-white text-forest-800 shadow-sm border border-stone-200'
                  : 'text-stone-600 hover:text-stone-900 hover:bg-stone-200/50'
              }`}
            >
              <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-forest-600' : 'text-stone-400'}`} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab 1: Harvest Variance */}
      {activeTab === 'variance' && (
        <div className="space-y-4">
          <div className="bg-white p-4 rounded-xl border border-ivory-300 shadow-sm flex items-center justify-between">
            <div className="text-xs text-stone-700">
              <strong>Formula:</strong> Variance = Actual Yield &minus; Expected Yield &nbsp;|&nbsp; 
              Variance % = ((Actual &minus; Expected) / Expected) &times; 100
            </div>
            <span className="text-[11px] font-semibold text-forest-700 bg-forest-50 px-2.5 py-1 rounded border border-forest-200">
              View: v_expected_vs_actual_harvest
            </span>
          </div>

          <div className="bg-white rounded-xl border border-ivory-300 shadow-sm overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider">
                  <tr>
                    <th className="p-3.5">Produce Crop</th>
                    <th className="p-3.5">Farm Plot</th>
                    <th className="p-3.5">Expected (Forecast)</th>
                    <th className="p-3.5">Actual (Yield)</th>
                    <th className="p-3.5">Difference</th>
                    <th className="p-3.5">Variance %</th>
                    <th className="p-3.5">Outcome Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {expectedHarvests.map((eh) => {
                    const prod = products.find((p) => p.product_id === eh.product_id);
                    const farm = farms.find((f) => f.farm_id === eh.farm_id);
                    const batch = batches.find((b) => b.product_id === eh.product_id && b.farm_id === eh.farm_id);

                    const actual = batch ? batch.quantity : 0;
                    const diff = Number((actual - eh.expected_quantity).toFixed(2));
                    const pct = eh.expected_quantity > 0 ? Number(((diff / eh.expected_quantity) * 100).toFixed(2)) : 0;

                    return (
                      <tr key={eh.expected_harvest_id} className="hover:bg-stone-50/60">
                        <td className="p-3.5 font-bold text-stone-900">{prod?.product_name || 'Crop'}</td>
                        <td className="p-3.5 text-stone-700">{farm?.farm_name || 'Farm'}</td>
                        <td className="p-3.5 font-semibold text-stone-800">{eh.expected_quantity} kg</td>
                        <td className="p-3.5 font-semibold text-stone-900">{batch ? `${actual} kg` : 'Pending'}</td>
                        <td className="p-3.5 font-bold">
                          {batch ? (
                            <span className={diff < 0 ? 'text-rose-600' : diff > 0 ? 'text-emerald-600' : 'text-stone-700'}>
                              {diff > 0 ? `+${diff}` : diff} kg
                            </span>
                          ) : '—'}
                        </td>
                        <td className="p-3.5 font-bold">
                          {batch ? (
                            <span className={pct < 0 ? 'text-rose-600' : pct > 0 ? 'text-emerald-600' : 'text-stone-700'}>
                              {pct > 0 ? `+${pct}%` : `${pct}%`}
                            </span>
                          ) : '—'}
                        </td>
                        <td className="p-3.5">
                          {!batch ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              Pending Harvest
                            </span>
                          ) : diff < 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-rose-50 text-rose-700 border border-rose-200 flex items-center gap-1 w-fit">
                              <TrendingDown className="w-3 h-3" /> Shortfall (Deficit)
                            </span>
                          ) : diff > 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1 w-fit">
                              <TrendingUp className="w-3 h-3" /> Surplus (Excess)
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-stone-100 text-stone-700 border border-stone-200">
                              Exact Match
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* Tab 2: Available Stock */}
      {activeTab === 'stock' && (
        <div className="bg-white rounded-xl border border-ivory-300 shadow-sm overflow-hidden">
          <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
            <span className="font-bold text-stone-800">Aggregated Available Inventory Across Active Batches</span>
            <span className="text-forest-700 font-semibold bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
              View: v_product_available_stock
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase">
                <tr>
                  <th className="p-3.5">Product Name</th>
                  <th className="p-3.5">Catalog Unit</th>
                  <th className="p-3.5">Indicative Price</th>
                  <th className="p-3.5">Active Batches</th>
                  <th className="p-3.5">Total Available Stock</th>
                  <th className="p-3.5">Stock Value</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {products.map((p) => {
                  const productBatches = batches.filter((b) => b.product_id === p.product_id && b.available_quantity > 0);
                  const totalAvail = productBatches.reduce((sum, b) => sum + b.available_quantity, 0);
                  const totalVal = totalAvail * p.indicative_price;

                  return (
                    <tr key={p.product_id} className="hover:bg-stone-50/60">
                      <td className="p-3.5 font-bold text-stone-900">{p.product_name}</td>
                      <td className="p-3.5 uppercase font-medium text-stone-600">{p.unit}</td>
                      <td className="p-3.5 font-semibold text-stone-800">₹{p.indicative_price.toFixed(2)}</td>
                      <td className="p-3.5 font-medium text-stone-700">{productBatches.length} batch(es)</td>
                      <td className="p-3.5 font-bold text-forest-700">{totalAvail} {p.unit}</td>
                      <td className="p-3.5 font-bold text-stone-900">₹{totalVal.toFixed(2)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 3: Pre-Orders Fulfilment */}
      {activeTab === 'preorders' && (
        <div className="bg-white rounded-xl border border-ivory-300 shadow-sm overflow-hidden">
          <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
            <span className="font-bold text-stone-800">Pre-Order Allocation & Shortage Breakdown</span>
            <span className="text-forest-700 font-semibold bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
              View: v_preorder_allocation_summary
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase">
                <tr>
                  <th className="p-3.5">Customer</th>
                  <th className="p-3.5">Target Produce Item</th>
                  <th className="p-3.5">Requested Qty</th>
                  <th className="p-3.5">Allocated Qty</th>
                  <th className="p-3.5">Unfulfilled Shortage</th>
                  <th className="p-3.5">Fulfilment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {preOrders.map((po) => {
                  const cust = customers.find((c) => c.customer_id === po.customer_id);
                  const eh = expectedHarvests.find((e) => e.expected_harvest_id === po.expected_harvest_id);
                  const prod = eh ? products.find((p) => p.product_id === eh.product_id) : null;
                  const shortage = Math.max(0, po.requested_quantity - po.allocated_quantity);

                  return (
                    <tr key={po.pre_order_id} className="hover:bg-stone-50/60">
                      <td className="p-3.5 font-bold text-stone-900">{cust?.full_name || 'Customer'}</td>
                      <td className="p-3.5 text-stone-700">{prod?.product_name || 'Crop'}</td>
                      <td className="p-3.5 font-semibold text-stone-800">{po.requested_quantity} kg</td>
                      <td className="p-3.5 font-bold text-emerald-700">{po.allocated_quantity} kg</td>
                      <td className="p-3.5 font-bold text-amber-700">{shortage} kg</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          po.status === 'Fully Allocated' || po.status === 'Fulfilled'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : po.status === 'Partially Allocated'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-amber-50 text-amber-700 border border-amber-200'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 4: Surplus Rescue */}
      {activeTab === 'surplus' && (
        <div className="bg-white rounded-xl border border-ivory-300 shadow-sm overflow-hidden">
          <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
            <span className="font-bold text-stone-800">Surplus Produce Rescue Performance</span>
            <span className="text-forest-700 font-semibold bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
              View: v_surplus_active_summary
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase">
                <tr>
                  <th className="p-3.5">Produce Crop</th>
                  <th className="p-3.5">Quantity Listed</th>
                  <th className="p-3.5">Rescued (Sold)</th>
                  <th className="p-3.5">Remaining</th>
                  <th className="p-3.5">Original Price</th>
                  <th className="p-3.5">Rescue Price</th>
                  <th className="p-3.5">Discount %</th>
                  <th className="p-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {surplusListings.map((sl) => {
                  const batch = batches.find((b) => b.harvest_id === sl.harvest_id);
                  const prod = batch ? products.find((p) => p.product_id === batch.product_id) : null;
                  const discountPct = Math.round(((sl.original_unit_price - sl.discounted_unit_price) / sl.original_unit_price) * 100);

                  return (
                    <tr key={sl.surplus_id} className="hover:bg-stone-50/60">
                      <td className="p-3.5 font-bold text-stone-900">{prod?.product_name || 'Crop'}</td>
                      <td className="p-3.5 font-semibold text-stone-800">{sl.quantity_listed} kg</td>
                      <td className="p-3.5 font-bold text-emerald-700">{sl.quantity_sold} kg</td>
                      <td className="p-3.5 font-bold text-amber-700">{sl.quantity_listed - sl.quantity_sold} kg</td>
                      <td className="p-3.5 text-stone-400 line-through">₹{sl.original_unit_price.toFixed(2)}</td>
                      <td className="p-3.5 font-bold text-forest-700">₹{sl.discounted_unit_price.toFixed(2)}</td>
                      <td className="p-3.5 font-bold text-amber-700">{discountPct}% OFF</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          sl.status === 'Active'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : sl.status === 'Sold Out'
                            ? 'bg-stone-100 text-stone-700 border border-stone-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}>
                          {sl.status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 5: Farmer Reliability */}
      {activeTab === 'farmers' && (
        <div className="bg-white rounded-xl border border-ivory-300 shadow-sm overflow-hidden">
          <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between text-xs">
            <span className="font-bold text-stone-800">Farmer Harvest Commitment & Historical Performance</span>
            <span className="text-forest-700 font-semibold bg-forest-50 px-2 py-0.5 rounded border border-forest-200">
              View: v_farmer_performance_overview
            </span>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase">
                <tr>
                  <th className="p-3.5">Farmer Name</th>
                  <th className="p-3.5">Total Farms</th>
                  <th className="p-3.5">Commitments Published</th>
                  <th className="p-3.5">Total Expected Yield</th>
                  <th className="p-3.5">Total Harvested Yield</th>
                  <th className="p-3.5">Average Variance %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {farmers.map((fm) => {
                  const farmerFarms = farms.filter((f) => f.farmer_id === fm.farmer_id);
                  const farmerExpected = expectedHarvests.filter((eh) => farmerFarms.some((f) => f.farm_id === eh.farm_id));
                  const totalExp = farmerExpected.reduce((sum, eh) => sum + eh.expected_quantity, 0);

                  const farmerBatches = batches.filter((b) => farmerFarms.some((f) => f.farm_id === b.farm_id));
                  const totalHarv = farmerBatches.reduce((sum, b) => sum + b.quantity, 0);

                  const avgVar = totalExp > 0 ? Number((((totalHarv - totalExp) / totalExp) * 100).toFixed(2)) : 0;

                  return (
                    <tr key={fm.farmer_id} className="hover:bg-stone-50/60">
                      <td className="p-3.5 font-bold text-stone-900">{fm.full_name}</td>
                      <td className="p-3.5 text-stone-700">{farmerFarms.length} Farm(s)</td>
                      <td className="p-3.5 text-stone-700">{farmerExpected.length} Commitment(s)</td>
                      <td className="p-3.5 font-semibold text-stone-800">{totalExp} kg</td>
                      <td className="p-3.5 font-bold text-stone-900">{totalHarv} kg</td>
                      <td className="p-3.5 font-bold">
                        <span className={avgVar < 0 ? 'text-rose-600' : avgVar > 0 ? 'text-emerald-600' : 'text-stone-700'}>
                          {avgVar > 0 ? `+${avgVar}%` : `${avgVar}%`}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 6: Demonstrable SQL Queries */}
      {activeTab === 'sql' && (
        <div className="space-y-6">
          <div className="bg-forest-900 text-white p-5 rounded-2xl border border-forest-800 shadow-md">
            <h2 className="text-base font-bold flex items-center gap-2">
              <Code2 className="w-5 h-5 text-leaf-300" />
              <span>DBMS Curriculum & Academic Evaluation SQL Queries</span>
            </h2>
            <p className="text-xs text-forest-200 mt-1 leading-relaxed">
              These live SQL commands directly implement the relational requirements specified in syllabus criteria: 
              DDL constraints, DML CRUD, Relational Algebra Joins, Aggregation with Group By & Having, Correlated Subqueries, Database Views, 
              and Concurrency Row Locking via <code className="text-leaf-300 bg-forest-950 px-1 py-0.5 rounded">SELECT FOR UPDATE</code>.
            </p>
          </div>

          <div className="space-y-4">
            {sqlSnippets.map((snip, idx) => (
              <div key={idx} className="bg-white rounded-xl border border-ivory-300 shadow-sm overflow-hidden">
                <div className="p-3.5 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block">{snip.category}</span>
                    <h3 className="font-bold text-stone-900 text-xs">{snip.title}</h3>
                  </div>
                  <button
                    onClick={() => copyToClipboard(snip.code, snip.title)}
                    className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-stone-700 bg-white border border-stone-300 rounded hover:bg-stone-50 transition-colors"
                  >
                    {copiedSql === snip.title ? (
                      <>
                        <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                        <span className="text-emerald-700">Copied</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5 text-stone-500" />
                        <span>Copy SQL</span>
                      </>
                    )}
                  </button>
                </div>
                <pre className="p-4 bg-stone-950 text-leaf-200 text-xs font-mono overflow-x-auto leading-relaxed">
                  <code>{snip.code}</code>
                </pre>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
