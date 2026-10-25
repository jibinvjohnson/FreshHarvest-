'use client';

import React, { useState, useEffect } from 'react';
import { Layers, Plus, Search, CheckCircle, AlertCircle, ShoppingBag } from 'lucide-react';
import { Category, Product } from '@/types/database';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ category_name: '', description: '' });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  const loadData = async () => {
    try {
      setLoading(true);
      const [resC, resP] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/products'),
      ]);
      const dataC = await resC.json();
      const dataP = await resP.json();
      setCategories(Array.isArray(dataC) ? dataC : []);
      setProducts(Array.isArray(dataP) ? dataP : []);
    } catch {
      setError('Failed to load categories');
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
      const res = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to create category');
      setSuccess('Category created successfully!');
      setShowModal(false);
      setFormData({ category_name: '', description: '' });
      loadData();
    } catch (err: any) {
      setError(err.message);
    }
  };

  const filtered = categories.filter((c) =>
    c.category_name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Layers className="w-6 h-6 text-forest-700" />
            <span>Produce Categories</span>
          </h1>
          <p className="text-stone-600 text-sm">Organize agricultural crops, roots, vegetables, and fruit varieties</p>
        </div>
        <button
          onClick={() => { setShowModal(true); setError(null); }}
          className="inline-flex items-center gap-2 px-4 py-2 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm"
        >
          <Plus className="w-4 h-4" />
          <span>Add Category</span>
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
          placeholder="Search categories..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full text-xs bg-transparent outline-none text-stone-800 placeholder-stone-400"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {loading ? (
          <div className="col-span-2 text-center py-10 text-stone-400 text-xs">Loading categories...</div>
        ) : filtered.length === 0 ? (
          <div className="col-span-2 text-center py-10 text-stone-400 text-xs">No categories found.</div>
        ) : (
          filtered.map((cat) => {
            const catProducts = products.filter((p) => p.category_id === cat.category_id);
            return (
              <div key={cat.category_id} className="p-5 bg-white rounded-xl border border-ivory-300 shadow-sm space-y-2">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-stone-900 text-sm">{cat.category_name}</h3>
                  <span className="px-2 py-0.5 rounded-full bg-forest-50 text-forest-700 border border-forest-200 text-[11px] font-medium flex items-center gap-1">
                    <ShoppingBag className="w-3 h-3" />
                    {catProducts.length} Products
                  </span>
                </div>
                <p className="text-stone-600 text-xs leading-relaxed">{cat.description || 'No description provided.'}</p>
              </div>
            );
          })
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 bg-stone-900/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-xl border border-ivory-300">
            <h2 className="text-base font-bold text-stone-900 mb-1">Add Produce Category</h2>
            <p className="text-xs text-stone-500 mb-4">Define a new classification group for crops and garden yields.</p>

            {error && (
              <div className="p-3 mb-4 bg-rose-50 border border-rose-200 text-rose-700 rounded-lg text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-stone-700 mb-1">Category Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Exotic Fruits"
                  value={formData.category_name}
                  onChange={(e) => setFormData({ ...formData, category_name: e.target.value })}
                  className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
                />
              </div>

              <div>
                <label className="block font-medium text-stone-700 mb-1">Description</label>
                <textarea
                  rows={3}
                  placeholder="e.g. Tree-ripened orchard and citrus crops"
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
                  Save Category
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
