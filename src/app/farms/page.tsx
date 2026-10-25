'use client';

import React, { useState, useEffect } from 'react';
import { MapPin, Plus, Search, User, CheckCircle, AlertCircle } from 'lucide-react';
import { Farm, Farmer } from '@/types/database';

export default function FarmsPage() {
  const [farms, setFarms] = useState<Farm[]>([]);
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ farmer_id: '', farm_name: '', location: '', area: 1 });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resFarms, resFarmers] = await Promise.all([
        fetch('/api/farms'),
        fetch('/api/farmers'),
      ]);
      const dataFarms = await resFarms.json();
      const dataFarmers = await resFarmers.json();
      setFarms(Array.isArray(dataFarms) ? dataFarms : []);
      setFarmers(Array.isArray(dataFarmers) ? dataFarmers : []);
      if (Array.isArray(dataFarmers) && dataFarmers.length > 0) {
        setFormData((prev) => ({ ...prev, farmer_id: dataFarmers[0].farmer_id }));
      }
    } catch {
      setError('Failed to load farm properties.');
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
      const res = await fetch('/api/farms', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create farm');
      setSuccess('Farm registered successfully!');
      setShowModal(false);
      setFormData({ farmer_id: farmers[0]?.farmer_id || '', farm_name: '', location: '', area: 1 });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = farms.filter(
    (f) =>
      f.farm_name.toLowerCase().includes(search.toLowerCase()) ||
      f.location.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <MapPin className="w-6 h-6 text-forest-700" />
            <span>Farm Estates Management</span>
          </h1>
          <p className="text-stone-600 text-sm">Agricultural plots, geographic locations, and acreage</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(null); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Farm</span>
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
          placeholder="Search by farm name or location..."
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
                <th className="p-3.5">Farm Name</th>
                <th className="p-3.5">Assigned Farmer</th>
                <th className="p-3.5">Location</th>
                <th className="p-3.5">Cultivated Area</th>
                <th className="p-3.5">Registered Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-stone-400">Loading farms...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-stone-400">No farms match your query.</td>
                </tr>
              ) : (
                filtered.map((fa) => {
                  const owner = farmers.find((f) => f.farmer_id === fa.farmer_id);
                  return (
                    <tr key={fa.farm_id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-3.5 font-semibold text-stone-900">{fa.farm_name}</td>
                      <td className="p-3.5 text-stone-700">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-forest-600" />
                          {owner?.full_name || 'Unassigned'}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-600">{fa.location}</td>
                      <td className="p-3.5 font-medium text-stone-900">{fa.area} Acres</td>
                      <td className="p-3.5 text-stone-500">{new Date(fa.created_at).toLocaleDateString()}</td>
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
            <h2 className="text-base font-bold text-stone-900 mb-1">Register New Farm Plot</h2>
            <p className="text-xs text-stone-500 mb-4">Link an agricultural parcel to a verified farmer.</p>

            {error && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Farmer Owner</label>
                <select
                  value={formData.farmer_id}
                  onChange={(e) => setFormData({ ...formData, farmer_id: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none bg-white"
                >
                  {farmers.map((f) => (
                    <option key={f.farmer_id} value={f.farmer_id}>
                      {f.full_name} ({f.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Farm Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Green Valley Organic Estate"
                  value={formData.farm_name}
                  onChange={(e) => setFormData({ ...formData, farm_name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Location Details</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Kanjirappally North, Kottayam"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Area (in Acres)</label>
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  required
                  value={formData.area}
                  onChange={(e) => setFormData({ ...formData, area: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                />
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
                  Save Farm
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
