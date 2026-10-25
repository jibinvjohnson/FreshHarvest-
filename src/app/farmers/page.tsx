'use client';

import React, { useState, useEffect } from 'react';
import { Users, Plus, Search, Phone, Mail, MapPin, CheckCircle, AlertCircle } from 'lucide-react';
import { Farmer, Farm } from '@/types/database';

export default function FarmersPage() {
  const [farmers, setFarmers] = useState<Farmer[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ full_name: '', phone: '', email: '', address: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resF, resFa] = await Promise.all([
        fetch('/api/farmers'),
        fetch('/api/farms'),
      ]);
      const dataF = await resF.json();
      const dataFa = await resFa.json();
      setFarmers(Array.isArray(dataF) ? dataF : []);
      setFarms(Array.isArray(dataFa) ? dataFa : []);
    } catch {
      setError('Failed to load farmers.');
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
      const res = await fetch('/api/farmers', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create farmer');
      setSuccess('Farmer registered successfully!');
      setShowModal(false);
      setFormData({ full_name: '', phone: '', email: '', address: '' });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = farmers.filter(
    (f) =>
      f.full_name.toLowerCase().includes(search.toLowerCase()) ||
      f.email.toLowerCase().includes(search.toLowerCase()) ||
      f.phone.includes(search)
  );

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Users className="w-6 h-6 text-forest-700" />
            <span>Farmers Management</span>
          </h1>
          <p className="text-stone-600 text-sm">Registered regional growers and agricultural producers</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(null); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Farmer</span>
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {/* Filter and Search */}
      <div className="bg-white p-4 rounded-xl border border-ivory-300 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search by name, email, or phone number..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent outline-none text-stone-800 placeholder-stone-400"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl border border-ivory-300 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-stone-50 border-b border-stone-200/60 text-stone-600 font-semibold uppercase tracking-wider">
              <tr>
                <th className="p-3.5">Farmer Name</th>
                <th className="p-3.5">Contact Details</th>
                <th className="p-3.5">Registered Address</th>
                <th className="p-3.5">Farms Count</th>
                <th className="p-3.5">Joined Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-stone-400">Loading farmers...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={5} className="p-6 text-center text-stone-400">No farmers match your query.</td>
                </tr>
              ) : (
                filtered.map((f) => {
                  const farmerFarms = farms.filter((fa) => fa.farmer_id === f.farmer_id);
                  return (
                    <tr key={f.farmer_id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-3.5 font-semibold text-stone-900">{f.full_name}</td>
                      <td className="p-3.5 space-y-1">
                        <div className="flex items-center gap-1.5 text-stone-600">
                          <Phone className="w-3 h-3 text-forest-600" />
                          <span>{f.phone}</span>
                        </div>
                        <div className="flex items-center gap-1.5 text-stone-500">
                          <Mail className="w-3 h-3 text-stone-400" />
                          <span>{f.email}</span>
                        </div>
                      </td>
                      <td className="p-3.5 text-stone-600 max-w-xs truncate">
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-stone-400 flex-shrink-0" />
                          {f.address}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-full bg-forest-50 text-forest-800 border border-forest-200 font-medium">
                          {farmerFarms.length} {farmerFarms.length === 1 ? 'Farm' : 'Farms'}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-500">
                        {new Date(f.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Form */}
      {showModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-ivory-300">
            <h2 className="text-base font-bold text-stone-900 mb-1">Register New Farmer</h2>
            <p className="text-xs text-stone-500 mb-4">Add a verified agricultural producer to the cooperative.</p>

            {error && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Thomas Kurian"
                  value={formData.full_name}
                  onChange={(e) => setFormData({ ...formData, full_name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Phone Number</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. +91 94471 23451"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. thomas.k@highlandfarms.in"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Residential / Farm Office Address</label>
                <textarea
                  required
                  rows={2}
                  placeholder="e.g. Kanjirappally, Kottayam, Kerala"
                  value={formData.address}
                  onChange={(e) => setFormData({ ...formData, address: e.target.value })}
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
                  Save Farmer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
