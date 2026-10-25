'use client';

import React, { useState, useEffect } from 'react';
import { CreditCard, Plus, Search, CheckCircle, AlertCircle, ShieldCheck, DollarSign } from 'lucide-react';
import { Payment, Order } from '@/types/database';

export default function PaymentsPage() {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    order_id: '',
    amount: 100,
    payment_method: 'UPI' as Payment['payment_method'],
    transaction_reference: '',
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resP, resO] = await Promise.all([
        fetch('/api/payments'),
        fetch('/api/orders'),
      ]);
      const dataP = await resP.json();
      const dataO = await resO.json();
      setPayments(Array.isArray(dataP) ? dataP : []);
      setOrders(dataO.orders || []);

      if (dataO.orders && dataO.orders.length > 0) {
        setFormData((prev) => ({
          ...prev,
          order_id: dataO.orders[0].order_id,
          amount: dataO.orders[0].total_amount,
        }));
      }
    } catch {
      setError('Failed to load payments');
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
      const res = await fetch('/api/payments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to record payment');
      setSuccess('Payment recorded and order confirmed!');
      setShowModal(false);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = payments.filter(
    (p) =>
      p.payment_method.toLowerCase().includes(search.toLowerCase()) ||
      p.payment_status.toLowerCase().includes(search.toLowerCase()) ||
      (p.transaction_reference || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <CreditCard className="w-6 h-6 text-forest-700" />
            <span>Payments & Settlement</span>
          </h1>
          <p className="text-stone-600 text-sm">Audited transactions, settlement channels, and order payment reconciliation</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(null); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Record Payment</span>
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
          placeholder="Search by payment method, status, or reference..."
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
                <th className="p-3.5">Transaction Ref</th>
                <th className="p-3.5">Associated Order</th>
                <th className="p-3.5">Settlement Method</th>
                <th className="p-3.5">Amount Paid</th>
                <th className="p-3.5">Payment Status</th>
                <th className="p-3.5">Timestamp</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-stone-400">Loading payments...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-stone-400">No payment records found.</td>
                </tr>
              ) : (
                filtered.map((pay) => (
                  <tr key={pay.payment_id} className="hover:bg-stone-50/60 transition-colors">
                    <td className="p-3.5 font-mono text-stone-700 font-medium">
                      {pay.transaction_reference || `TXN-${pay.payment_id.slice(0, 8)}`}
                    </td>
                    <td className="p-3.5 font-mono text-stone-500">Order #{pay.order_id.slice(0, 8)}</td>
                    <td className="p-3.5 font-medium text-stone-800">{pay.payment_method}</td>
                    <td className="p-3.5 font-bold text-forest-800 text-sm">₹{pay.amount.toFixed(2)}</td>
                    <td className="p-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        pay.payment_status === 'Completed'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-amber-50 text-amber-700 border border-amber-200'
                      }`}>
                        {pay.payment_status}
                      </span>
                    </td>
                    <td className="p-3.5 text-stone-500">{new Date(pay.paid_at).toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-ivory-300">
            <h2 className="text-base font-bold text-stone-900 mb-1">Record Settlement Payment</h2>
            <p className="text-xs text-stone-500 mb-4">Simulate transaction clearance for a customer order.</p>

            {error && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Target Order</label>
                <select
                  value={formData.order_id}
                  onChange={(e) => {
                    const selO = orders.find((o) => o.order_id === e.target.value);
                    setFormData({
                      ...formData,
                      order_id: e.target.value,
                      amount: selO?.total_amount || 100,
                    });
                  }}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none bg-white"
                >
                  {orders.map((o) => (
                    <option key={o.order_id} value={o.order_id}>
                      Order #{o.order_id.slice(0, 8)} — ₹{o.total_amount} ({o.status})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Payment Method</label>
                <select
                  value={formData.payment_method}
                  onChange={(e) => setFormData({ ...formData, payment_method: e.target.value as any })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none bg-white"
                >
                  <option value="UPI">UPI (Unified Payments Interface)</option>
                  <option value="Bank Transfer">Bank Transfer (NEFT/RTGS)</option>
                  <option value="Card">Debit / Credit Card</option>
                  <option value="Market Wallet">Market Wallet</option>
                  <option value="Cash on Delivery">Cash on Delivery (COD)</option>
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Payment Amount (₹)</label>
                <input
                  type="number"
                  step="0.5"
                  min="1"
                  required
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Transaction Reference</label>
                <input
                  type="text"
                  placeholder="e.g. UPI/2026/993182"
                  value={formData.transaction_reference}
                  onChange={(e) => setFormData({ ...formData, transaction_reference: e.target.value })}
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
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
