'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Database, RotateCcw, ShieldCheck, CheckCircle2, AlertTriangle, Key } from 'lucide-react';
import { dbRepository, DBConnectionStatus } from '@/lib/db/repository';

export default function SettingsPage() {
  const [status, setStatus] = useState<DBConnectionStatus | null>(null);
  const [defaultPolicy, setDefaultPolicy] = useState('FIFO');
  const [resetting, setResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    setStatus(dbRepository.getConnectionStatus());
  }, []);

  const handleReset = async () => {
    if (!confirm('Are you sure you want to delete all current transactions and reset to the demo baseline?')) return;
    setResetting(true);
    try {
      const res = await fetch('/api/reset-demo', { method: 'POST' });
      if (res.ok) {
        setResetMessage('Demo baseline reloaded successfully!');
        setTimeout(() => {
          window.location.reload();
        }, 800);
      }
    } catch {
      setResetMessage('Reset failed.');
    } finally {
      setResetting(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight flex items-center gap-2">
            <Settings className="w-6 h-6 text-forest-700" />
            <span>System Configuration & Database Status</span>
          </h1>
          <p className="text-stone-600 text-sm">
            Manage environment drivers, relational database status, and demo baseline data
          </p>
        </div>
      </div>

      {resetMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{resetMessage}</span>
        </div>
      )}

      {/* Database Connection Engine Card */}
      <div className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-stone-100 pb-4">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-xl ${status?.isRemote ? 'bg-emerald-100 text-emerald-800' : 'bg-amber-100 text-amber-800'}`}>
              <Database className="w-6 h-6" />
            </div>
            <div>
              <h2 className="font-bold text-stone-900 text-base">{status?.databaseEngine}</h2>
              <p className="text-xs text-stone-500">{status?.hostDescription}</p>
            </div>
          </div>
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            status?.isRemote
              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
              : 'bg-amber-50 text-amber-800 border border-amber-200'
          }`}>
            {status?.isRemote ? '🟢 Remote Connected' : '🟡 Local Relational Mode'}
          </span>
        </div>

        <p className="text-xs text-stone-600 leading-relaxed">
          {status?.message}
        </p>

        <div className="bg-stone-50 p-4 rounded-xl border border-stone-200/80 text-xs space-y-2">
          <span className="font-bold text-stone-800 block">Connecting Remote Supabase PostgreSQL:</span>
          <p className="text-stone-600">
            To connect a remote Supabase instance, copy <code className="bg-white px-1.5 py-0.5 rounded border border-stone-300 text-forest-700">.env.example</code> to <code className="bg-white px-1.5 py-0.5 rounded border border-stone-300 text-forest-700">.env.local</code> and provide your:
          </p>
          <ul className="list-disc pl-5 text-stone-600 space-y-1">
            <li><code>NEXT_PUBLIC_SUPABASE_URL</code></li>
            <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code></li>
          </ul>
          <p className="text-stone-500 text-[11px] pt-1">
            Then execute the scripts in <code className="text-stone-700">/database/schema.sql</code> and <code className="text-stone-700">/database/seed.sql</code> inside the Supabase SQL Editor.
          </p>
        </div>
      </div>

      {/* Allocation Policy Config */}
      <div className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-sm space-y-4">
        <h2 className="font-bold text-stone-900 text-base">Default Fair Allocation Policy</h2>
        <p className="text-xs text-stone-600">
          Determine the default queue order algorithm applied when customer pre-orders exceed actual harvest batch yield.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          <label className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
            defaultPolicy === 'FIFO'
              ? 'border-forest-600 bg-forest-50/50 text-forest-900 shadow-sm'
              : 'border-stone-200 hover:bg-stone-50 text-stone-700'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs">FIFO (Earliest First)</span>
              <input
                type="radio"
                name="policy"
                value="FIFO"
                checked={defaultPolicy === 'FIFO'}
                onChange={() => setDefaultPolicy('FIFO')}
              />
            </div>
            <p className="text-[11px] text-stone-500 leading-normal">
              Allocates 100% of available stock chronologically to the earliest valid pre-orders until batch stock is depleted.
            </p>
          </label>

          <label className={`p-4 rounded-xl border cursor-pointer flex flex-col justify-between transition-all ${
            defaultPolicy === 'PROPORTIONAL'
              ? 'border-forest-600 bg-forest-50/50 text-forest-900 shadow-sm'
              : 'border-stone-200 hover:bg-stone-50 text-stone-700'
          }`}>
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-xs">Proportional (Fair Share)</span>
              <input
                type="radio"
                name="policy"
                value="PROPORTIONAL"
                checked={defaultPolicy === 'PROPORTIONAL'}
                onChange={() => setDefaultPolicy('PROPORTIONAL')}
              />
            </div>
            <p className="text-[11px] text-stone-500 leading-normal">
              Distributes available harvest stock proportionally based on each customer&apos;s requested quota relative to total demand.
            </p>
          </label>
        </div>
      </div>

      {/* Reset Demo Data Card */}
      <div className="bg-white rounded-2xl border border-rose-200 p-6 shadow-sm space-y-3">
        <div className="flex items-center gap-2 text-rose-700">
          <AlertTriangle className="w-5 h-5" />
          <h2 className="font-bold text-sm">Demo Data Management</h2>
        </div>
        <p className="text-xs text-stone-600 leading-relaxed">
          Restore the database to its pristine academic baseline seed state, including the 
          <strong> 100 kg expected &bull; 70 kg actual &bull; 90 kg pre-orders tomato shortage scenario</strong>.
        </p>
        <button
          onClick={handleReset}
          disabled={resetting}
          className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white text-xs font-bold rounded-xl transition-colors shadow-sm flex items-center gap-2"
        >
          <RotateCcw className={`w-3.5 h-3.5 ${resetting ? 'animate-spin' : ''}`} />
          <span>{resetting ? 'Resetting Demo Baseline...' : 'Reset Demo Dataset'}</span>
        </button>
      </div>
    </div>
  );
}
