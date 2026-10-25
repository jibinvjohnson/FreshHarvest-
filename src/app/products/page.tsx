'use client';

import React, { useState, useEffect } from 'react';
import { ShoppingBag, Plus, Search, Tag, CheckCircle, AlertCircle, Check, X } from 'lucide-react';
import { Product, Category } from '@/types/database';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    category_id: '',
    product_name: '',
    unit: 'kg',
    description: '',
    indicative_price: 50,
    is_active: true,
  });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resP, resC] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
      ]);
      const dataP = await resP.json();
      const dataC = await resC.json();
      setProducts(Array.isArray(dataP) ? dataP : []);
      setCategories(Array.isArray(dataC) ? dataC : []);
      if (Array.isArray(dataC) && dataC.length > 0) {
        setFormData((prev) => ({ ...prev, category_id: dataC[0].category_id }));
      }
    } catch {
      setError('Failed to load products');
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
      const res = await fetch('/api/products', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create product');
      setSuccess('Product registered successfully!');
      setShowModal(false);
      setFormData({
        category_id: categories[0]?.category_id || '',
        product_name: '',
        unit: 'kg',
        description: '',
        indicative_price: 50,
        is_active: true,
      });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = products.filter(
    (p) =>
      p.product_name.toLowerCase().includes(search.toLowerCase()) ||
      p.unit.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <ShoppingBag className="w-6 h-6 text-forest-700" />
            <span>Produce Products Catalog</span>
          </h1>
          <p className="text-stone-600 text-sm">Farm-fresh produce varieties, measurement units, and indicative prices</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(null); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
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
          placeholder="Search produce by name or unit..."
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
                <th className="p-3.5">Product Name</th>
                <th className="p-3.5">Category</th>
                <th className="p-3.5">Unit</th>
                <th className="p-3.5">Indicative Price</th>
                <th className="p-3.5">Status</th>
                <th className="p-3.5">Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-stone-400">Loading products...</td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-stone-400">No products match your query.</td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const cat = categories.find((c) => c.category_id === prod.category_id);
                  return (
                    <tr key={prod.product_id} className="hover:bg-stone-50/60 transition-colors">
                      <td className="p-3.5 font-bold text-stone-900">{prod.product_name}</td>
                      <td className="p-3.5">
                        <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 border border-stone-200 text-[11px] font-medium">
                          {cat?.category_name || 'Category'}
                        </span>
                      </td>
                      <td className="p-3.5 font-medium text-stone-600 uppercase">{prod.unit}</td>
                      <td className="p-3.5 font-bold text-forest-700">₹{prod.indicative_price.toFixed(2)} / {prod.unit}</td>
                      <td className="p-3.5">
                        {prod.is_active ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-semibold">
                            <Check className="w-3 h-3" /> Active
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-stone-100 text-stone-500 border border-stone-200 text-[10px] font-semibold">
                            <X className="w-3 h-3" /> Inactive
                          </span>
                        )}
                      </td>
                      <td className="p-3.5 text-stone-500 max-w-xs truncate">{prod.description || '—'}</td>
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
            <h2 className="text-base font-bold text-stone-900 mb-1">Add Produce Product</h2>
            <p className="text-xs text-stone-500 mb-4">Create a new agricultural crop item in the database catalog.</p>

            {error && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Category</label>
                <select
                  value={formData.category_id}
                  onChange={(e) => setFormData({ ...formData, category_id: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none bg-white"
                >
                  {categories.map((c) => (
                    <option key={c.category_id} value={c.category_id}>
                      {c.category_name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Product Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Crisp Yardlong Green Beans"
                  value={formData.product_name}
                  onChange={(e) => setFormData({ ...formData, product_name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-stone-700 mb-1">Unit of Measurement</label>
                  <select
                    value={formData.unit}
                    onChange={(e) => setFormData({ ...formData, unit: e.target.value })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none bg-white"
                  >
                    <option value="kg">kg (Kilogram)</option>
                    <option value="bunch">bunch</option>
                    <option value="crate">crate</option>
                    <option value="litre">litre</option>
                  </select>
                </div>

                <div>
                  <label className="block font-medium text-stone-700 mb-1">Indicative Price (₹)</label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    required
                    value={formData.indicative_price}
                    onChange={(e) => setFormData({ ...formData, indicative_price: parseFloat(e.target.value) || 0 })}
                    className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="e.g. Freshly plucked tender pole beans"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
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
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
