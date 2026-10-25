'use client';

import React, { useState, useEffect } from 'react';
import {
  Scale,
  Sparkles,
  Play,
  CheckCircle,
  AlertCircle,
  AlertTriangle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Info
} from 'lucide-react';
import { ExpectedHarvest, HarvestBatch, Product, Customer } from '@/types/database';
import { AllocationPlan, AllocationPolicy } from '@/lib/services/allocationService';

export default function AllocationWorkbenchPage() {
  const [expectedHarvests, setExpectedHarvests] = useState<ExpectedHarvest[]>([]);
  const [batches, setBatches] = useState<HarvestBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [selectedExpectedId, setSelectedExpectedId] = useState<string>('');
  const [selectedHarvestId, setSelectedHarvestId] = useState<string>('');
  const [policy, setPolicy] = useState<AllocationPolicy>('FIFO');

  const [previewPlan, setPreviewPlan] = useState<AllocationPlan | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(false);
  const [executing, setExecuting] = useState(false);
  const [executionResult, setExecutionResult] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Initial data loader
  const loadData = async () => {
    try {
      const [resE, resB, resP, resC] = await Promise.all([
        fetch('/api/expected-harvests'),
        fetch('/api/harvests'),
        fetch('/api/products'),
        fetch('/api/customers'),
      ]);
      const dataE = await resE.json();
      const dataB = await resB.json();
      const dataP = await resP.json();
      const dataC = await resC.json();

      setExpectedHarvests(Array.isArray(dataE) ? dataE : []);
      setBatches(Array.isArray(dataB) ? dataB : []);
      setProducts(Array.isArray(dataP) ? dataP : []);
      setCustomers(Array.isArray(dataC) ? dataC : []);

      // Auto-select the critical scenario if available
      const tomatoEH = Array.isArray(dataE)
        ? dataE.find((e: ExpectedHarvest) => e.expected_harvest_id === 'eh000001-0000-0000-0000-000000000001') || dataE[0]
        : null;
      const tomatoHB = Array.isArray(dataB)
        ? dataB.find((b: HarvestBatch) => b.harvest_id === 'hb000001-0000-0000-0000-000000000001') || dataB[0]
        : null;

      if (tomatoEH) setSelectedExpectedId(tomatoEH.expected_harvest_id);
      if (tomatoHB) setSelectedHarvestId(tomatoHB.harvest_id);
    } catch {
      setError('Failed to load allocation data');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // Fetch allocation preview whenever inputs change
  useEffect(() => {
    if (!selectedExpectedId || !selectedHarvestId) {
      setPreviewPlan(null);
      return;
    }

    const fetchPreview = async () => {
      setLoadingPreview(true);
      setError(null);
      try {
        const res = await fetch(
          `/api/allocation?expected_harvest_id=${selectedExpectedId}&harvest_id=${selectedHarvestId}&policy=${policy}`
        );
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Failed to compute allocation preview');
        setPreviewPlan(data);
      } catch (err: any) {
        setPreviewPlan(null);
        setError(err.message);
      } finally {
        setLoadingPreview(false);
      }
    };

    fetchPreview();
  }, [selectedExpectedId, selectedHarvestId, policy]);

  // Execute safe allocation transaction
  const handleExecuteAllocation = async () => {
    if (!selectedExpectedId || !selectedHarvestId) return;
    setExecuting(true);
    setError(null);
    setExecutionResult(null);
    try {
      const res = await fetch('/api/allocation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          expected_harvest_id: selectedExpectedId,
          harvest_id: selectedHarvestId,
          policy,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Allocation transaction failed');

      setExecutionResult(
        `Successfully allocated ${data.plan.total_to_allocate} kg across ${data.createdAllocations.length} pre-orders.`
      );
      loadData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setExecuting(false);
    }
  };

  const selectedBatch = batches.find((b) => b.harvest_id === selectedHarvestId);
  const selectedExpected = expectedHarvests.find((e) => e.expected_harvest_id === selectedExpectedId);
  const selectedProduct = selectedExpected ? products.find((p) => p.product_id === selectedExpected.product_id) : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Scale className="w-6 h-6 text-forest-700" />
            <span>Fair Pre-Order Allocation Workbench</span>
          </h1>
          <p className="text-stone-600 text-sm">
            Deterministic stock allocation algorithm preventing overselling and preserving invariant consistency
          </p>
        </div>
      </div>

      {/* Benchmark Demonstration Callout */}
      <div className="bg-emerald-950 text-white p-5 rounded-2xl shadow-md border border-emerald-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <span className="px-2 py-0.5 bg-leaf-500/30 text-leaf-300 border border-leaf-500/40 text-[10px] font-bold uppercase rounded">
              DBMS Invariant Enforcement
            </span>
            <h3 className="font-bold text-sm text-white">Stock Allocation Guard: Allocated &le; Actual Harvest</h3>
          </div>
          <p className="text-xs text-forest-200 max-w-3xl leading-relaxed">
            In FreshHarvest, customer pre-orders are placed against farmer forecasts, but stock is <strong>strictly allocated only from confirmed actual harvests</strong>. 
            When actual yield is lower than expected yield, the system prevents ghost inventory and transparently highlights unfulfilled demand.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs font-semibold text-leaf-300 bg-forest-900/80 px-3 py-2 rounded-xl border border-forest-800">
          <ShieldCheck className="w-4 h-4 text-leaf-400" />
          <span>ACID Protected</span>
        </div>
      </div>

      {/* Config Bar */}
      <div className="bg-white p-5 rounded-xl border border-ivory-300 shadow-sm grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Target Expected Commitment</label>
          <select
            value={selectedExpectedId}
            onChange={(e) => setSelectedExpectedId(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-stone-300 text-xs focus:border-forest-600 outline-none bg-white font-medium text-stone-800"
          >
            {expectedHarvests.map((eh) => {
              const p = products.find((pr) => pr.product_id === eh.product_id);
              return (
                <option key={eh.expected_harvest_id} value={eh.expected_harvest_id}>
                  {p?.product_name || 'Crop'} (Forecast: {eh.expected_quantity} kg &bull; {eh.expected_date})
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Actual Harvest Batch Source</label>
          <select
            value={selectedHarvestId}
            onChange={(e) => setSelectedHarvestId(e.target.value)}
            className="w-full p-2.5 rounded-lg border border-stone-300 text-xs focus:border-forest-600 outline-none bg-white font-medium text-stone-800"
          >
            {batches.map((b) => {
              const p = products.find((pr) => pr.product_id === b.product_id);
              return (
                <option key={b.harvest_id} value={b.harvest_id}>
                  {p?.product_name || 'Crop'} &bull; {b.quantity} kg harvested (Avail: {b.available_quantity} kg) &bull; {b.quality_grade}
                </option>
              );
            })}
          </select>
        </div>

        <div>
          <label className="block text-xs font-semibold text-stone-700 mb-1">Allocation Policy</label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setPolicy('FIFO')}
              className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                policy === 'FIFO'
                  ? 'bg-forest-700 text-white border-forest-800 shadow-sm'
                  : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
            >
              FIFO (Earliest First)
            </button>
            <button
              type="button"
              onClick={() => setPolicy('PROPORTIONAL')}
              className={`py-2 px-3 rounded-lg text-xs font-bold border transition-colors ${
                policy === 'PROPORTIONAL'
                  ? 'bg-forest-700 text-white border-forest-800 shadow-sm'
                  : 'bg-stone-50 text-stone-700 border-stone-300 hover:bg-stone-100'
              }`}
            >
              Proportional (Fair Share)
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 text-rose-800 rounded-xl text-xs flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold">Allocation Advisory</p>
            <p>{error}</p>
          </div>
        </div>
      )}

      {executionResult && (
        <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-3">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <div className="space-y-0.5">
            <p className="font-semibold">Transaction Executed Successfully</p>
            <p>{executionResult}</p>
          </div>
        </div>
      )}

      {/* Allocation Summary Metrics Card */}
      {previewPlan && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-xl border border-ivory-300 shadow-sm">
            <span className="text-[11px] font-medium text-stone-500">Available Batch Stock</span>
            <div className="text-xl font-bold text-stone-900 mt-1">{previewPlan.available_stock_before} kg</div>
            <span className="text-[10px] text-stone-400">Available for allocation</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-ivory-300 shadow-sm">
            <span className="text-[11px] font-medium text-stone-500">Total Pre-Order Demand</span>
            <div className="text-xl font-bold text-stone-900 mt-1">{previewPlan.total_demand} kg</div>
            <span className="text-[10px] text-stone-400">Requested by active customers</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-ivory-300 shadow-sm">
            <span className="text-[11px] font-medium text-stone-500">Total to Allocate</span>
            <div className="text-xl font-bold text-forest-700 mt-1">{previewPlan.total_to_allocate} kg</div>
            <span className="text-[10px] text-emerald-600 font-medium">Guaranteed &le; Available</span>
          </div>

          <div className="bg-white p-4 rounded-xl border border-ivory-300 shadow-sm">
            <span className="text-[11px] font-medium text-stone-500">Unfulfilled Shortage</span>
            <div className="text-xl font-bold text-amber-600 mt-1">{previewPlan.unfulfilled_shortage} kg</div>
            <span className="text-[10px] text-amber-700 font-medium">Demand shortfall</span>
          </div>
        </div>
      )}

      {/* Plan Preview Table */}
      <div className="bg-white rounded-xl border border-ivory-300 shadow-sm overflow-hidden">
        <div className="p-4 border-b border-stone-200/60 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-sm text-stone-900">Allocation Distribution Preview ({policy})</h2>
            <span className="text-xs bg-forest-50 text-forest-700 px-2 py-0.5 rounded font-medium border border-forest-200">
              Interactive Simulation
            </span>
          </div>
          <button
            onClick={handleExecuteAllocation}
            disabled={executing || !previewPlan || previewPlan.total_to_allocate <= 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-forest-700 hover:bg-forest-800 disabled:opacity-50 text-white text-xs font-bold rounded-lg transition-colors shadow-sm"
          >
            <Play className={`w-3.5 h-3.5 ${executing ? 'animate-spin' : ''}`} />
            <span>{executing ? 'Processing Transaction...' : 'Execute Allocation Transaction'}</span>
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200/60 text-stone-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Customer Name</th>
                <th className="p-3.5">Requested Qty</th>
                <th className="p-3.5">Previously Allocated</th>
                <th className="p-3.5">New Allocation Grant</th>
                <th className="p-3.5">Total After Run</th>
                <th className="p-3.5">Unfulfilled Deficit</th>
                <th className="p-3.5">Status Outcome</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loadingPreview ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-stone-400">Computing fair allocation preview...</td>
                </tr>
              ) : !previewPlan || previewPlan.items.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-stone-400">
                    No active pre-orders with unmet demand found for this commitment.
                  </td>
                </tr>
              ) : (
                previewPlan.items.map((it) => (
                  <tr key={it.pre_order_id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="p-3.5 font-bold text-stone-900">{it.customer_name}</td>
                    <td className="p-3.5 text-stone-700">{it.requested_quantity} kg</td>
                    <td className="p-3.5 text-stone-500">{it.previously_allocated} kg</td>
                    <td className="p-3.5 font-bold text-forest-700">+{it.new_allocated_quantity} kg</td>
                    <td className="p-3.5 font-bold text-stone-900">{it.total_allocated_after} kg</td>
                    <td className="p-3.5 font-bold text-amber-700">{it.unfulfilled_after} kg</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        it.status_after === 'Fully Allocated'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : it.status_after === 'Partially Allocated'
                          ? 'bg-blue-50 text-blue-700 border border-blue-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {it.status_after}
                      </span>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
