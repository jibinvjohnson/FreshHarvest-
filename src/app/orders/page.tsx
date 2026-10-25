'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Search, CheckCircle, AlertCircle, User, Package } from 'lucide-react';
import { Order, OrderItem, Customer, Product, HarvestBatch } from '@/types/database';

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [batches, setBatches] = useState<HarvestBatch[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    customer_id: '',
    notes: 'Direct farm order',
    items: [{ product_id: '', quantity: 5, unit_price: 45 }],
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resO, resC, resP, resB] = await Promise.all([
        fetch('/api/orders'),
        fetch('/api/customers'),
        fetch('/api/products'),
        fetch('/api/harvests'),
      ]);
      const dataO = await resO.json();
      const dataC = await resC.json();
      const dataP = await resP.json();
      const dataB = await resB.json();

      setOrders(dataO.orders || []);
      setOrderItems(dataO.items || []);
      setCustomers(Array.isArray(dataC) ? dataC : []);
      setProducts(Array.isArray(dataP) ? dataP : []);
      setBatches(Array.isArray(dataB) ? dataB : []);

      if (Array.isArray(dataC) && dataC.length > 0 && Array.isArray(dataP) && dataP.length > 0) {
        setFormData((prev) => ({
          ...prev,
          customer_id: dataC[0].customer_id,
          items: [{ product_id: dataP[0].product_id, quantity: 5, unit_price: dataP[0].indicative_price }],
        }));
      }
    } catch {
      setError('Failed to load orders');
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
      const res = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create order');
      setSuccess('Order created successfully!');
      setShowModal(false);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = orders.filter((o) => {
    const cust = customers.find((c) => c.customer_id === o.customer_id);
    return (
      (cust?.full_name || '').toLowerCase().includes(search.toLowerCase()) ||
      o.status.toLowerCase().includes(search.toLowerCase()) ||
      (o.notes || '').toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <ShoppingCart className="w-6 h-6 text-forest-700" />
            <span>Customer Purchase Orders</span>
          </h1>
          <p className="text-stone-600 text-sm">Fulfilled pre-orders and direct farm store purchases</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(null); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>New Customer Order</span>
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
          placeholder="Search orders by customer or notes..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent outline-none text-stone-800 placeholder-stone-400"
        />
      </div>

      <div className="space-y-4">
        {loading ? (
          <div className="text-center py-12 text-stone-400 text-xs">Loading orders...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-12 text-stone-400 text-xs">No orders found.</div>
        ) : (
          filtered.map((order) => {
            const cust = customers.find((c) => c.customer_id === order.customer_id);
            const items = orderItems.filter((it) => it.order_id === order.order_id);
            return (
              <div
                key={order.order_id}
                className="bg-white rounded-xl border border-ivory-300 p-5 shadow-sm space-y-3"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-stone-100 pb-3">
                  <div>
                    <span className="text-[11px] font-mono text-stone-400">Order #{order.order_id.slice(0, 8)}</span>
                    <h3 className="font-bold text-stone-900 text-sm flex items-center gap-1.5 mt-0.5">
                      <User className="w-3.5 h-3.5 text-forest-600" />
                      {cust?.full_name || 'Customer'}
                    </h3>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-semibold ${
                      order.status === 'Confirmed' || order.status === 'Delivered'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : order.status === 'Processing'
                        ? 'bg-blue-50 text-blue-700 border border-blue-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {order.status}
                    </span>
                    <span className="font-extrabold text-base text-forest-800">
                      ₹{order.total_amount.toFixed(2)}
                    </span>
                  </div>
                </div>

                {/* Line Items List */}
                <div className="bg-stone-50 p-3 rounded-lg border border-stone-100">
                  <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block mb-2">Order Line Items</span>
                  <div className="space-y-1.5">
                    {items.map((it) => {
                      const prod = products.find((p) => p.product_id === it.product_id);
                      return (
                        <div key={it.order_item_id} className="flex justify-between text-xs text-stone-700">
                          <span className="flex items-center gap-1.5 font-medium">
                            <Package className="w-3 h-3 text-stone-400" />
                            {prod?.product_name || 'Produce Item'} &times; {it.quantity} {prod?.unit || 'kg'}
                          </span>
                          <span className="font-semibold text-stone-900">
                            ₹{it.subtotal.toFixed(2)} <span className="text-stone-400 font-normal">(@ ₹{it.unit_price})</span>
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="flex justify-between items-center text-[11px] text-stone-500 pt-1">
                  <span>Notes: {order.notes || 'Standard fulfilment'}</span>
                  <span>{new Date(order.order_date).toLocaleString()}</span>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-ivory-300">
            <h2 className="text-base font-bold text-stone-900 mb-1">Create Customer Order</h2>
            <p className="text-xs text-stone-500 mb-4">Record purchase order items and compute totals strictly on server.</p>

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
                <label className="block font-medium text-stone-700 mb-1">Produce Item</label>
                <select
                  value={formData.items[0].product_id}
                  onChange={(e) => {
                    const selP = products.find((p) => p.product_id === e.target.value);
                    setFormData({
                      ...formData,
                      items: [
                        {
                          product_id: e.target.value,
                          quantity: formData.items[0].quantity,
                          unit_price: selP?.indicative_price || 40,
                        },
                      ],
                    });
                  }}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none bg-white"
                >
                  {products.map((p) => (
                    <option key={p.product_id} value={p.product_id}>
                      {p.product_name} (₹{p.indicative_price}/{p.unit})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Quantity</label>
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    required
                    value={formData.items[0].quantity}
                    onChange={(e) => {
                      const qty = parseFloat(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        items: [{ ...formData.items[0], quantity: qty }],
                      });
                    }}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Unit Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={formData.items[0].unit_price}
                    onChange={(e) => {
                      const price = parseFloat(e.target.value) || 0;
                      setFormData({
                        ...formData,
                        items: [{ ...formData.items[0], unit_price: price }],
                      });
                    }}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Order Notes</label>
                <input
                  type="text"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
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
                  Create Order
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
