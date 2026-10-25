'use client';

import React, { useState, useEffect } from 'react';
import { Sparkles, Plus, Search, CheckCircle, AlertCircle, Clock, ShoppingCart, Tag, ShieldCheck } from 'lucide-react';
import { SurplusListing, HarvestBatch, Product, Farm, Customer } from '@/types/database';

export default function SurplusRescuePage() {
  const [listings, setListings] = useState<SurplusListing[]>([]);
  const [batches, setBatches] = useState<HarvestBatch[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [farms, setFarms] = useState<Farm[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);

  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showPurchaseModal, setShowPurchaseModal] = useState(false);
  const [selectedListing, setSelectedListing] = useState<SurplusListing | null>(null);

  const [createFormData, setCreateFormData] = useState({
    harvest_id: '',
    quantity_listed: 20,
    original_unit_price: 60,
    discounted_unit_price: 40,
    sale_deadline: new Date(Date.now() + 24 * 3600000).toISOString().slice(0, 16),
  });

  const [purchaseFormData, setPurchaseFormData] = useState({
    customer_id: '',
    quantity: 5,
  });

  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resL, resB, resP, resF, resC] = await Promise.all([
        fetch('/api/surplus'),
        fetch('/api/harvests'),
        fetch('/api/products'),
        fetch('/api/farms'),
        fetch('/api/customers'),
      ]);
      const dataL = await resL.json();
      const dataB = await resB.json();
      const dataP = await resP.json();
      const dataF = await resF.json();
      const dataC = await resC.json();

      setListings(Array.isArray(dataL) ? dataL : []);
      setBatches(Array.isArray(dataB) ? dataB : []);
      setProducts(Array.isArray(dataP) ? dataP : []);
      setFarms(Array.isArray(dataF) ? dataF : []);
      setCustomers(Array.isArray(dataC) ? dataC : []);

      if (Array.isArray(dataB) && dataB.length > 0) {
        const firstAvail = dataB.find((b: HarvestBatch) => b.available_quantity > 0) || dataB[0];
        setCreateFormData((prev) => ({
          ...prev,
          harvest_id: firstAvail.harvest_id,
          quantity_listed: Math.min(20, firstAvail.available_quantity || 10),
        }));
      }

      if (Array.isArray(dataC) && dataC.length > 0) {
        setPurchaseFormData((prev) => ({ ...prev, customer_id: dataC[0].customer_id }));
      }
    } catch {
      setError('Failed to load surplus listings');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleCreateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/surplus', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...createFormData,
          sale_deadline: new Date(createFormData.sale_deadline).toISOString(),
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to list surplus');
      setSuccess('Surplus produce listed for discounted rescue!');
      setShowCreateModal(false);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handlePurchaseSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedListing) return;
    setError(null);
    setSuccess(null);
    try {
      const res = await fetch('/api/surplus', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          surplus_id: selectedListing.surplus_id,
          customer_id: purchaseFormData.customer_id,
          quantity: purchaseFormData.quantity,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to complete rescue purchase');
      setSuccess(`Rescued ${purchaseFormData.quantity} kg of surplus produce! Order #${data.order.order_id.slice(0, 8)} created.`);
      setShowPurchaseModal(false);
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = listings.filter((sl) => {
    const batch = batches.find((b) => b.harvest_id === sl.harvest_id);
    const prod = batch ? products.find((p) => p.product_id === batch.product_id) : null;
    return (
      (prod?.product_name || '').toLowerCase().includes(search.toLowerCase()) ||
      sl.status.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-600" />
            <span>Surplus Produce Rescue Hub</span>
          </h1>
          <p className="text-stone-600 text-sm">
            Rescue unsold, unallocated fresh produce at discounted prices before the harvest freshness deadline
          </p>
        </div>
        <button
          onClick={() => { setShowCreateModal(true); setError(null); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>List Surplus Produce</span>
        </button>
      </div>

      {success && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{success}</span>
        </div>
      )}

      {error && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-rose-600" />
          <span>{error}</span>
        </div>
      )}

      {/* Information Banner */}
      <div className="bg-leaf-50 border border-leaf-200 rounded-xl p-4 flex items-center gap-3">
        <Tag className="w-5 h-5 text-leaf-700 flex-shrink-0" />
        <p className="text-xs text-leaf-900 leading-relaxed">
          <strong>Surplus Rescue Policy:</strong> Only batches with genuine available stock remaining after pre-order allocations 
          are eligible. Deadlines are monitored in real time and listings auto-expire upon arrival of the cutoff timestamp.
        </p>
      </div>

      {/* Search */}
      <div className="bg-white p-4 rounded-xl border border-ivory-300 shadow-sm flex items-center gap-3">
        <Search className="w-4 h-4 text-stone-400" />
        <input
          type="text"
          placeholder="Search surplus listings by produce crop or status..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent outline-none text-stone-800 placeholder-stone-400"
        />
      </div>

      {/* Surplus Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {loading ? (
          <div className="col-span-3 text-center py-12 text-stone-400 text-xs">Loading surplus listings...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-3 text-center py-12 text-stone-400 text-xs">No surplus listings match your search.</div>
        ) : (
          filtered.map((sl) => {
            const batch = batches.find((b) => b.harvest_id === sl.harvest_id);
            const prod = batch ? products.find((p) => p.product_id === batch.product_id) : null;
            const farm = batch ? farms.find((f) => f.farm_id === batch.farm_id) : null;

            const remaining = Math.max(0, sl.quantity_listed - sl.quantity_sold);
            const discountPct = Math.round(((sl.original_unit_price - sl.discounted_unit_price) / sl.original_unit_price) * 100);
            const isExpired = new Date(sl.sale_deadline) <= new Date();

            return (
              <div
                key={sl.surplus_id}
                className="bg-white rounded-2xl border border-ivory-300 p-5 shadow-sm hover:shadow-md transition-shadow flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      {discountPct}% OFF
                    </span>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                      sl.status === 'Active' && !isExpired
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : sl.status === 'Sold Out'
                        ? 'bg-stone-100 text-stone-700 border border-stone-200'
                        : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}>
                      {isExpired ? 'Expired' : sl.status}
                    </span>
                  </div>

                  <h3 className="text-base font-bold text-stone-900">{prod?.product_name || 'Produce Item'}</h3>
                  <p className="text-xs text-stone-500 mb-3">{farm?.farm_name || 'Farm Plot'}</p>

                  <div className="space-y-1.5 text-xs bg-stone-50 p-3 rounded-xl border border-stone-100 mb-4">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Original Price:</span>
                      <span className="line-through text-stone-400">₹{sl.original_unit_price.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold">
                      <span className="text-stone-700">Rescue Price:</span>
                      <span className="text-forest-700 text-sm">₹{sl.discounted_unit_price.toFixed(2)} / {prod?.unit || 'kg'}</span>
                    </div>
                    <div className="flex justify-between pt-1 border-t border-stone-200">
                      <span className="text-stone-500">Remaining to Rescue:</span>
                      <span className="font-bold text-stone-800">{remaining} {prod?.unit || 'kg'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-1.5 text-[11px] text-stone-500 mb-4">
                    <Clock className="w-3.5 h-3.5 text-stone-400" />
                    <span>Deadline: {new Date(sl.sale_deadline).toLocaleString()}</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    setSelectedListing(sl);
                    setPurchaseFormData({ customer_id: customers[0]?.customer_id || '', quantity: Math.min(5, remaining) });
                    setShowPurchaseModal(true);
                  }}
                  disabled={sl.status !== 'Active' || isExpired || remaining <= 0}
                  className="w-full py-2.5 px-4 bg-amber-600 hover:bg-amber-700 disabled:opacity-40 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <ShoppingCart className="w-3.5 h-3.5" />
                  <span>{sl.status !== 'Active' || isExpired ? 'Unavailable' : 'Rescue Now'}</span>
                </button>
              </div>
            );
          })
        )}
      </div>

      {/* Modal: Create Surplus Listing */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-ivory-300">
            <h2 className="text-base font-bold text-stone-900 mb-1">List Surplus Produce for Rescue</h2>
            <p className="text-xs text-stone-500 mb-4">Make unallocated harvest stock available to shoppers at a discount.</p>

            <form onSubmit={handleCreateSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Select Harvest Batch Source</label>
                <select
                  value={createFormData.harvest_id}
                  onChange={(e) => {
                    const selId = e.target.value;
                    const b = batches.find((item) => item.harvest_id === selId);
                    const p = b ? products.find((pr) => pr.product_id === b.product_id) : null;
                    setCreateFormData({
                      ...createFormData,
                      harvest_id: selId,
                      original_unit_price: p?.indicative_price || 60,
                      discounted_unit_price: Math.round((p?.indicative_price || 60) * 0.7),
                      quantity_listed: Math.min(20, b?.available_quantity || 10),
                    });
                  }}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none bg-white"
                >
                  {batches
                    .filter((b) => b.available_quantity > 0)
                    .map((b) => {
                      const p = products.find((pr) => pr.product_id === b.product_id);
                      return (
                        <option key={b.harvest_id} value={b.harvest_id}>
                          {p?.product_name || 'Batch'} ({b.available_quantity} kg available &bull; Grade: {b.quality_grade})
                        </option>
                      );
                    })}
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Quantity to List for Rescue (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  required
                  value={createFormData.quantity_listed}
                  onChange={(e) => setCreateFormData({ ...createFormData, quantity_listed: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={createFormData.original_unit_price}
                    onChange={(e) => setCreateFormData({ ...createFormData, original_unit_price: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                  />
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Discounted Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={createFormData.discounted_unit_price}
                    onChange={(e) => setCreateFormData({ ...createFormData, discounted_unit_price: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Rescue Sale Deadline</label>
                <input
                  type="datetime-local"
                  required
                  value={createFormData.sale_deadline}
                  onChange={(e) => setCreateFormData({ ...createFormData, sale_deadline: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                />
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-3.5 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
                >
                  Publish Surplus
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Customer Rescue Purchase */}
      {showPurchaseModal && selectedListing && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-ivory-300">
            <h2 className="text-base font-bold text-stone-900 mb-1">Rescue Produce Purchase</h2>
            <p className="text-xs text-stone-500 mb-4">Complete discounted surplus acquisition.</p>

            <form onSubmit={handlePurchaseSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Customer Purchaser</label>
                <select
                  value={purchaseFormData.customer_id}
                  onChange={(e) => setPurchaseFormData({ ...purchaseFormData, customer_id: e.target.value })}
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
                <label className="block font-medium text-stone-700 mb-1">Quantity to Purchase (kg)</label>
                <input
                  type="number"
                  step="0.5"
                  min="0.5"
                  max={selectedListing.quantity_listed - selectedListing.quantity_sold}
                  required
                  value={purchaseFormData.quantity}
                  onChange={(e) => setPurchaseFormData({ ...purchaseFormData, quantity: parseFloat(e.target.value) || 0 })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                />
                <span className="text-[11px] text-stone-500 mt-1 block">
                  Remaining available: {selectedListing.quantity_listed - selectedListing.quantity_sold} kg
                </span>
              </div>

              <div className="p-3 bg-stone-50 rounded-xl border border-stone-200">
                <div className="flex justify-between font-bold text-stone-900 text-xs">
                  <span>Total Due (at ₹{selectedListing.discounted_unit_price}/kg):</span>
                  <span className="text-forest-700 text-sm">
                    ₹{(purchaseFormData.quantity * selectedListing.discounted_unit_price).toFixed(2)}
                  </span>
                </div>
              </div>

              <div className="flex justify-end gap-2.5 pt-3">
                <button
                  type="button"
                  onClick={() => setShowPurchaseModal(false)}
                  className="px-3.5 py-2 border border-stone-300 text-stone-700 rounded-lg hover:bg-stone-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors font-semibold"
                >
                  Confirm Purchase & Pay
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
