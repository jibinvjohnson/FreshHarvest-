'use client';

import React, { useState, useEffect } from 'react';
import { History, ShieldCheck, Clock, CheckCircle, AlertCircle, FileText, ArrowRight } from 'lucide-react';
import { HarvestAudit, HarvestBatch, Farm, Product } from '@/types/database';

export default function HistoryPage() {
  const [audits, setAudits] = useState<HarvestAudit[]>([]);
  const [batches, setBatches] = useState<HarvestBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterAction, setFilterAction] = useState<string>('ALL');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [resA, resB, resP] = await Promise.all([
          fetch('/api/harvests'), // returns batches
          fetch('/api/products'),
          fetch('/api/orders'), // placeholder
        ]);
        const dataB = await resA.json();
        const dataP = await resB.json();

        // fetch audits from reports/history endpoint
        // Let's create an endpoint or get from db
        const resAudits = await fetch('/api/history');
        const dataAudits = await resAudits.json();

        setBatches(Array.isArray(dataB) ? dataB : []);
        setProducts(Array.isArray(dataP) ? dataP : []);
        setAudits(Array.isArray(dataAudits) ? dataAudits : []);
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = audits.filter(
    (a) => filterAction === 'ALL' || a.action_type === filterAction
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <History className="w-6 h-6 text-forest-700" />
            <span>Harvest Commitment & Audit History</span>
          </h1>
          <p className="text-stone-600 text-sm">
            Immutable database audit trail tracking yield measurements, stock reductions, and status transitions
          </p>
        </div>
      </div>

      {/* Audit Banner */}
      <div className="bg-forest-950 text-white p-5 rounded-2xl shadow-md border border-forest-900 flex items-start gap-4">
        <ShieldCheck className="w-6 h-6 text-leaf-400 mt-1 flex-shrink-0" />
        <div className="space-y-1 text-xs">
          <h3 className="font-bold text-sm text-white">Cryptographic / Immutable Audit Trail (HARVEST_AUDIT)</h3>
          <p className="text-forest-200 leading-relaxed">
            Every critical stock operation in FreshHarvest automatically records an audit entry capturing previous values, 
            new values, authorized actor or transaction reason, and precise ISO timestamps. This prevents historical rewrite anomalies.
          </p>
        </div>
      </div>

      {/* Filter Action Tabs */}
      <div className="flex flex-wrap gap-2">
        {['ALL', 'HARVEST_RECORDED', 'QUANTITY_ADJUSTED', 'ALLOCATION_DEDUCTED', 'SURPLUS_LISTED', 'SURPLUS_SOLD'].map((act) => (
          <button
            key={act}
            onClick={() => setFilterAction(act)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              filterAction === act
                ? 'bg-forest-700 text-white border-forest-800'
                : 'bg-white text-stone-700 border-stone-200 hover:bg-stone-50'
            }`}
          >
            {act === 'ALL' ? 'All Audit Records' : act.replace(/_/g, ' ')}
          </button>
        ))}
      </div>

      {/* Audit Log Timeline Table */}
      <div className="bg-white rounded-xl border border-ivory-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200 text-stone-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Action Event</th>
                <th className="p-3.5">Target Harvest Batch</th>
                <th className="p-3.5">Previous Value</th>
                <th className="p-3.5">New Value</th>
                <th className="p-3.5">Operational Reason</th>
                <th className="p-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-stone-400">Loading immutable audit logs...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-stone-400">No audit events match your filter.</td>
                </tr>
              ) : (
                filtered.map((aud) => {
                  const batch = batches.find((b) => b.harvest_id === aud.harvest_id);
                  const prod = batch ? products.find((p) => p.product_id === batch.product_id) : null;

                  return (
                    <tr key={aud.audit_id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          aud.action_type === 'HARVEST_RECORDED'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : aud.action_type === 'ALLOCATION_DEDUCTED'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : aud.action_type === 'SURPLUS_LISTED' || aud.action_type === 'SURPLUS_SOLD'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-stone-100 text-stone-700 border border-stone-200'
                        }`}>
                          {aud.action_type}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-stone-900">{prod?.product_name || 'Harvest Batch'}</div>
                        <div className="font-mono text-[10px] text-stone-400">{aud.harvest_id.slice(0, 8)}...</div>
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-stone-500 max-w-xs truncate">
                        {aud.previous_value ? JSON.stringify(aud.previous_value) : '— (Initial)'}
                      </td>
                      <td className="p-3.5 font-mono text-[11px] text-forest-700 max-w-xs truncate">
                        {aud.new_value ? JSON.stringify(aud.new_value) : '—'}
                      </td>
                      <td className="p-3.5 text-stone-700">{aud.reason || 'Standard system mutation'}</td>
                      <td className="p-3.5 text-stone-500 whitespace-nowrap">
                        {new Date(aud.created_at).toLocaleString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
