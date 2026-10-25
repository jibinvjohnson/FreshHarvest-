'use client';

import React, { useState, useEffect } from 'react';
import { ClipboardList, Plus, Search, CheckCircle, AlertCircle, User, Calendar } from 'lucide-react';
import { PreOrder, Customer, ExpectedHarvest, Product } from '@/types/database';

export default function PreOrdersPage() {
  const [preOrders, setPreOrders] = useState<PreOrder[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [expectedHarvests, setExpectedHarvests] = useState<ExpectedHarvest[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    expected_harvest_id: '',
    requested_quantity: 20,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resPO, resC, resE, resP] = await Promise.all([
        fetch('/api/pre-orders'),
        fetch('/api/customers'),
        fetch('/api/expected-harvests'),
        fetch('/api/products'),
      ]);
      const dataPO = await resPO.json();
      const dataC = await resC.json();
      const dataE = await resE.json();
      const dataP = await resP.json();

      setPreOrders(Array.isArray(dataPO) ? dataPO : []);
      setCustomers(Array.isArray(dataC) ? dataC : []);
      setExpectedHarvests(Array.isArray(dataE) ? dataE : []);
      setProducts(Array.isArray(dataP) ? dataP : []);

      if (Array.isArray(dataC) && dataC.length > 0 && Array.isArray(dataE) && dataE.length > 0) {
        setFormData((prev) => ({
          ...prev,
          customer_id: dataC[0].customer_id,
          expected_harvest_id: dataE[0].expected_harvest_id,
        }));
      }
    } catch {
      setError('Failed to load pre-orders');
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
      const res = await fetch('/api/pre-orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to place pre-order');
      setSuccess('Pre-order reservation placed successfully!');
      setShowModal(false);
      setFormData({
        customer_id: customers[0]?.customer_id || '',
        expected_harvest_id: expectedHarvests[0]?.expected_harvest_id || '',
        requested_quantity: 20,
      });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = preOrders.filter((po) => {
    const cust = customers.find((c) => c.customer_id === po.customer_id);
    const eh = expectedHarvests.find((e) => e.expected_harvest_id === po.expected_harvest_id);
    const prod = eh ? products.find((p) => p.product_id === eh.product_id) : null;
    return (
      (cust?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      (prod?.product_name || '').toLowerCase().includes(search.toLowerCase()) ||
      po.status.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <ClipboardList className="w-6 h-6 text-forest-700" />
            <span>Customer Pre-Orders</span>
          </h1>
          <p className="text-stone-600 text-sm">Advance reservations against upcoming expected harvest crops</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(null); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Place Pre-Order</span>
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
          placeholder="Search by customer name, crop, or reservation status..."
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
                <th className="p-3.5">Customer</th>
                <th className="p-3.5">Target Crop & Forecast</th>
                <th className="p-3.5">Requested Qty</th>
                <th className="p-3.5">Allocated Qty</th>
                <th className="p-3.5">Unfulfilled Qty</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Reservation Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-stone-400">Loading pre-orders...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="p-6 text-center text-stone-400">No pre-orders found.</td>
                </tr>
              ) : (
                filtered.map((po) => {
                  const cust = customers.find((c) => c.customer_id === po.customer_id);
                  const eh = expectedHarvests.find((e) => e.expected_harvest_id === po.expected_harvest_id);
                  const prod = eh ? products.find((p) => p.product_id === eh.product_id) : null;
                  const unfulfilled = Math.max(0, po.requested_quantity - po.allocated_quantity);
                  return (
                    <tr key={po.pre_order_id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-3.5 font-bold text-stone-900">
                        <span className="flex items-center gap-1.5">
                          <User className="w-3.5 h-3.5 text-forest-600" />
                          {cust?.full_name || 'Customer'}
                        </span>
                      </td>
                      <td className="p-3.5">
                        <div className="font-semibold text-stone-800">{prod?.product_name || 'Crop'}</div>
                        <div className="text-[11px] text-stone-500">Exp. Date: {eh?.expected_date}</div>
                      </td>
                      <td className="p-3.5 font-bold text-stone-900">{po.requested_quantity} {prod?.unit || 'kg'}</td>
                      <td className="p-3.5 font-bold text-emerald-700">{po.allocated_quantity} {prod?.unit || 'kg'}</td>
                      <td className="p-3.5 font-bold text-amber-700">{unfulfilled} {prod?.unit || 'kg'}</td>
                      <td className="p-3.5">
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          po.status === 'Fully Allocated' || po.status === 'Fulfilled'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : po.status === 'Partially Allocated'
                            ? 'bg-blue-50 text-blue-700 border border-blue-200'
                            : po.status === 'Pending'
                            ? 'bg-amber-50 text-amber-700 border border-amber-200'
                            : 'bg-stone-100 text-stone-500 border border-stone-200'
                        }`}>
                          {po.status}
                        </span>
                      </td>
                      <td className="p-3.5 text-stone-500">{new Date(po.placed_at).toLocaleString()}</td>
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
            <h2 className="text-base font-bold text-stone-900 mb-1">Place Pre-Order Reservation</h2>
            <p className="text-xs text-stone-500 mb-4">Reserve advance produce share before harvest plucking begins.</p>

            {error && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Customer</label>
                <select
                  value={formData.customer_id}
                  onChange={(e) => setFormData({ ...formData, customer_id: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none bg-white"
                >
                  {customers.map((c) => (
                    <option key={c.customer_id} value={c.customer_id}>
                      {c.full_name} ({c.email})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Expected Harvest Commitment</label>
                <select
                  value={formData.expected_harvest_id}
                  onChange={(e) => setFormData({ ...formData, expected_harvest_id: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none bg-white"
                >
                  {expectedHarvests.map((eh) => {
                    const prod = products.find((p) => p.product_id === eh.product_id);
                    return (
                      <option key={eh.expected_harvest_id} value={eh.expected_harvest_id}>
                        {prod?.product_name || 'Crop'} (Forecast: {eh.expected_quantity} kg on {eh.expected_date})
                      </option>
                    );
                  })}
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Requested Quantity (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={formData.requested_quantity}
                  onChange={(e) => setFormData({ ...formData, requested_quantity: parseFloat(e.target.value) || 0 })}
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
                  Confirm Reservation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
