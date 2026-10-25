'use client';

import React, { useState, useEffect } from 'react';
import { Sprout, Plus, Search, CheckCircle, AlertCircle, Layers, Calendar, Award } from 'lucide-react';
import { HarvestBatch, Farm, Product, ExpectedHarvest } from '@/types/database';

export default function HarvestsPage() {
  const [batches, setBatches] = useState<HarvestBatch[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [expectedHarvests, setExpectedHarvests] = useState<ExpectedHarvest[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    farm_id: '',
    product_id: '',
    harvest_date: new Date().toISOString().split('T')[0],
    quantity: 70,
    quality_grade: 'Grade A' as HarvestBatch['quality_grade'],
    freshness_deadline: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
    expected_harvest_id: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resB, resFa, resP, resE] = await Promise.all([
        fetch('/api/harvests'),
        fetch('/api/farms'),
        fetch('/api/products'),
        fetch('/api/expected-harvests'),
      ]);
      const dataB = await resB.json();
      const dataFa = await resFa.json();
      const dataP = await resP.json();
      const dataE = await resE.json();

      setBatches(Array.isArray(dataB) ? dataB : []);
      setFarms(Array.isArray(dataFa) ? dataFa : []);
      setProducts(Array.isArray(dataP) ? dataP : []);
      setExpectedHarvests(Array.isArray(dataE) ? dataE : []);

      if (Array.isArray(dataFa) && dataFa.length > 0 && Array.isArray(dataP) && dataP.length > 0) {
        setFormData((prev) => ({
          ...prev,
          farm_id: dataFa[0].farm_id,
          product_id: dataP[0].product_id,
        }));
      }
    } catch {
      setError('Failed to load harvest batch records.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const payload: any = { ...formData };
      if (!payload.expected_harvest_id) delete payload.expected_harvest_id;

      const res = await fetch('/api/harvests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record harvest batch');
      setSuccess('Actual harvest batch recorded successfully!');
      setShowModal(false);
      setFormData({
        farm_id: farms[0]?.farm_id || '',
        product_id: products[0]?.product_id || '',
        harvest_date: new Date().toISOString().split('T')[0],
        quantity: 70,
        quality_grade: 'Grade A',
        freshness_deadline: new Date(Date.now() + 5 * 86400000).toISOString().split('T')[0],
        expected_harvest_id: '',
      });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = batches.filter((b) => {
    const prod = products.find((p) => p.product_id === b.product_id);
    const farm = farms.find((f) => f.farm_id === b.farm_id);
    return (
      (prod?.product_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (farm?.farm_name || '').toLowerCase().includes(search.toLowerCase()) ||
      b.status.toLowerCase().includes(search.toLowerCase()) ||
      b.quality_grade.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Sprout className="w-6 h-6 text-forest-700" />
            <span>Actual Harvest Batches</span>
          </h1>
          <p className="text-stone-600 text-sm">Verified field plucking batches, quality classifications, and real-time stock</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(null); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Record Harvest Batch</span>
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      <div className="bg-white p-4 rounded-xl border border-ivory-300 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search by crop, farm, grade, or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent outline-none text-stone-800 placeholder-stone-400"
        />
      </div>

      <div className="bg-white rounded-xl border border-ivory-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200/60 text-stone-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Produce Crop</th>
                <th className="p-3.5">Farm Origin</th>
                <th className="p-3.5">Harvest Date</th>
                <th className="p-3.5">Harvested Qty</th>
                <th className="p-3.5">Available Stock</th>
                <th className="p-3.5">Quality Grade</th>
                <th className="p-3.5">Freshness Expiry</th>
                <th className="p-3.5">Batch Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-stone-400">Loading harvest records...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-6 text-center text-stone-400">No harvest batches found.</td>
                </tr>
              ) : (
                filtered.map((hb) => {
                  const prod = products.find((p) => p.product_id === hb.product_id);
                  const farm = farms.find((f) => f.farm_id === hb.farm_id);
                  return (
                    <tr key={hb.harvest_id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-3.5 font-bold text-stone-900">{prod?.product_name || 'Produce'}</td>
                      <td className="p-3.5 text-stone-700">{farm?.farm_name || 'Farm'}</td>
                      <td className="p-3.5 text-stone-600">{hb.harvest_date}</td>
                      <td className="p-3.5 font-bold text-stone-900">{hb.quantity} {prod?.unit || 'kg'}</td>
                      <td className="p-3.5 font-bold text-forest-700">{hb.available_quantity} {prod?.unit || 'kg'}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200 text-[11px] font-medium flex items-center gap-1 w-fit">
                          <Award className="w-3 h-3 text-amber-600" />
                          {hb.quality_grade}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-600">{hb.freshness_deadline}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          hb.status === 'Available'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : hb.status === 'Partially Allocated' || hb.status === 'Fully Allocated'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : hb.status === 'Surplus Listed'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-stone-100 text-stone-600 border border-stone-200'
                        }`}>
                          {hb.status}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-ivory-300">
            <h2 className="text-base font-bold text-stone-900 mb-1">Record Actual Field Harvest</h2>
            <p className="text-xs text-stone-500 mb-4">Log weighed crop yield from farm plucking.</p>

            {error && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Link to Forecast Commitment (Optional)</label>
                <select
                  value={formData.expected_harvest_id}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const eh = expectedHarvests.find((item) => item.expected_harvest_id === selId);
                    if (eh) {
                      setFormData({
                        ...formData,
                        expected_harvest_id: selId,
                        farm_id: eh.farm_id,
                        product_id: eh.product_id,
                      });
                    } else {
                      setFormData({ ...formData, expected_harvest_id: '' });
                    }
                  }}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none bg-white"
                >
                  <option value="">-- No Forecast Link (Standalone Batch) --</option>
                  {expectedHarvests.map((eh) => {
                    const prod = products.find((p) => p.product_id === eh.product_id);
                    return (
                      <option key={eh.expected_harvest_id} value={eh.expected_harvest_id}>
                        {prod?.product_name || 'Crop'} (Expected: {eh.expected_quantity} kg on {eh.expected_date})
                      </option>
                    );
                  })}
                </select>
                <p className="text-[10px] text-stone-400 mt-1">Linking an expected harvest triggers automatic variance calculation & audit log.</p>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Farm Plot</label>
                <select
                  value={formData.farm_id}
                  onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none bg-white"
                >
                  {farms.map((fa) => (
                    <option key={fa.farm_id} value={fa.farm_id}>
                      {fa.farm_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Produce Item</label>
                <select
                  value={formData.product_id}
                  onChange={(e) => setFormData({ ...formData, product_id: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none bg-white"
                >
                  {products.map((p) => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.product_name} ({p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Harvest Date</label>
                  <input
                    type="date"
                    required
                    value={formData.harvest_date}
                    onChange={(e) => setFormData({ ...formData, harvest_date: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Harvested Quantity</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={formData.quantity}
                    onChange={(e) => setFormData({ ...formData, quantity: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Quality Grade</label>
                  <select
                    value={formData.quality_grade}
                    onChange={(e) => setFormData({ ...formData, quality_grade: e.target.value as any })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none bg-white"
                  >
                    <option value="Grade A">Grade A (Premium Fresh)</option>
                    <option value="Grade B">Grade B (Standard Market)</option>
                    <option value="Grade C">Grade C (Processing/Canning)</option>
                    <option value="Premium">Premium Orchard</option>
                    <option value="Standard">Standard</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Freshness Deadline</label>
                  <input
                    type="date"
                    required
                    value={formData.freshness_deadline}
                    onChange={(e) => setFormData({ ...formData, freshness_deadline: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="px-3.5 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-forest-700 text-white rounded-lg hover:bg-forest-800 transition-colors font-semibold"
                >
                  Record Batch
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
