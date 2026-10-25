'use client';

import React, { useState, useEffect } from 'react';
import { CalendarClock, Plus, Search, CheckCircle, AlertCircle, TrendingUp, AlertTriangle } from 'lucide-react';
import { ExpectedHarvest, Farm, Product, Farmer } from '@/types/database';

export default function ExpectedHarvestsPage() {
  const [expectedHarvests, setExpectedHarvests] = useState<ExpectedHarvest[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    farm_id: '',
    product_id: '',
    expected_date: new Date().toISOString().split('T')[0],
    expected_quantity: 100,
    forecast_status: 'Active' as ExpectedHarvest['forecast_status'],
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resE, resFa, resP, resFm] = await Promise.all([
        fetch('/api/expected-harvests'),
        fetch('/api/farms'),
        fetch('/api/products'),
        fetch('/api/farmers'),
      ]);
      const dataE = await resE.json();
      const dataFa = await resFa.json();
      const dataP = await resP.json();
      const dataFm = await resFm.json();

      setExpectedHarvests(Array.isArray(dataE) ? dataE : []);
      setFarms(Array.isArray(dataFa) ? dataFa : []);
      setProducts(Array.isArray(dataP) ? dataP : []);
      setFarmers(Array.isArray(dataFm) ? dataFm : []);

      if (Array.isArray(dataFa) && dataFa.length > 0 && Array.isArray(dataP) && dataP.length > 0) {
        setFormData((prev) => ({
          ...prev,
          farm_id: dataFa[0].farm_id,
          product_id: dataP[0].product_id,
        }));
      }
    } catch {
      setError('Failed to load expected harvest commitments.');
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
      const res = await fetch('/api/expected-harvests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record commitment forecast');
      setSuccess('Expected harvest forecast saved!');
      setShowModal(false);
      setFormData({
        farm_id: farms[0]?.farm_id || '',
        product_id: products[0]?.product_id || '',
        expected_date: new Date().toISOString().split('T')[0],
        expected_quantity: 100,
        forecast_status: 'Active',
      });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = expectedHarvests.filter((eh) => {
    const prod = products.find((p) => p.product_id === eh.product_id);
    const farm = farms.find((f) => f.farm_id === eh.farm_id);
    return (
      (prod?.product_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (farm?.farm_name || '').toLowerCase().includes(search.toLowerCase()) ||
      eh.forecast_status.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <CalendarClock className="w-6 h-6 text-forest-700" />
            <span>Expected Harvest Forecasts</span>
          </h1>
          <p className="text-stone-600 text-sm">Farmer harvest commitments that back advance customer reservations</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(null); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Forecast Commitment</span>
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Benchmark Demo Scenario Box */}
      <div className="bg-amber-50/80 border border-amber-200 rounded-xl p-4 flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-200/60 text-amber-900 rounded-lg">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <span className="font-bold text-xs text-amber-900">Demo Scenario Focus: Organic Country Tomatoes</span>
            <p className="text-xs text-stone-600 mt-0.5">
              100 kg expected yield commitment &bull; Actual yield: 70 kg &bull; Valid pre-order demand: 90 kg
            </p>
          </div>
        </div>
        <span className="text-[11px] font-semibold text-amber-800 bg-amber-100 px-2.5 py-1 rounded-md border border-amber-200">
          Target Commitment #1
        </span>
      </div>

      <div className="bg-white p-4 rounded-xl border border-ivory-300 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search by crop, farm, or forecast status..."
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
                <th className="p-3.5">Produce Item</th>
                <th className="p-3.5">Farm & Farmer</th>
                <th className="p-3.5">Expected Harvest Date</th>
                <th className="p-3.5">Forecast Quantity</th>
                <th className="p-3.5">Forecast Status</th>
                <th className="p-3.5">Created Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-stone-400">Loading forecast records...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-stone-400">No expected harvests found.</td>
                </tr>
              ) : (
                filtered.map((eh) => {
                  const prod = products.find((p) => p.product_id === eh.product_id);
                  const farm = farms.find((f) => f.farm_id === eh.farm_id);
                  const farmer = farm ? farmers.find((fm) => fm.farmer_id === farm.farmer_id) : null;
                  return (
                    <tr key={eh.expected_harvest_id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-3.5 font-bold text-stone-900">{prod?.product_name || 'Crop'}</td>
                      <td className="p-3.5">
                        <div className="font-semibold text-stone-800">{farm?.farm_name || 'Farm'}</div>
                        <div className="text-[11px] text-stone-500">{farmer?.full_name}</div>
                      </td>
                      <td className="p-3.5 font-medium text-stone-700">{eh.expected_date}</td>
                      <td className="p-3.5 font-bold text-forest-800">{eh.expected_quantity} {prod?.unit || 'kg'}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          eh.forecast_status === 'Harvested'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : eh.forecast_status === 'Active'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : 'bg-stone-100 text-stone-600 border border-stone-200'
                        }`}>
                          {eh.forecast_status}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-500">{new Date(eh.created_at).toLocaleDateString()}</td>
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
            <h2 className="text-base font-bold text-stone-900 mb-1">Create Harvest Commitment</h2>
            <p className="text-xs text-stone-500 mb-4">Publish an advance crop forecast to open customer pre-orders.</p>

            {error && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Farm Plot</label>
                <select
                  value={formData.farm_id}
                  onChange={(e) => setFormData({ ...formData, farm_id: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none bg-white"
                >
                  {farms.map((fa) => (
                    <option key={fa.farm_id} value={fa.farm_id}>
                      {fa.farm_name} ({fa.location})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Crop Product</label>
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
                  <label className="block font-medium text-stone-700 mb-1">Expected Date</label>
                  <input
                    type="date"
                    required
                    value={formData.expected_date}
                    onChange={(e) => setFormData({ ...formData, expected_date: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Expected Quantity</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={formData.expected_quantity}
                    onChange={(e) => setFormData({ ...formData, expected_quantity: parseFloat(e.target.value) || 0 })}
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
                  Save Forecast
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
