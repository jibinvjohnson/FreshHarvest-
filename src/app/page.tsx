import React from 'react';
import Link from 'next/link';
import {
  Sprout,
  Scale,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  ArrowRight,
  Database,
  BarChart3,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="space-y-12 pb-12">
      {/* College Academic Submission Header */}
      <div className="bg-gradient-to-r from-forest-900 to-forest-950 text-white rounded-2xl p-6 lg:p-8 shadow-xl border border-forest-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-forest-800 pb-4 mb-6">
          <div>
            <span className="inline-block px-3 py-1 bg-leaf-500/20 text-leaf-300 border border-leaf-500/30 rounded-full text-xs font-semibold uppercase tracking-wider mb-2">
              B.Tech DBMS Capstone Project
            </span>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight">
              Fresh<span className="text-leaf-400">Harvest</span>
            </h1>
            <p className="text-forest-200 text-sm mt-1">
              Local Farmer Market Management System — Harvest Promise, Fair Pre-Order Allocation, and Surplus Rescue
            </p>
          </div>
          <div className="bg-forest-800/60 p-4 rounded-xl border border-forest-700/60 text-xs text-forest-200 space-y-1">
            <p><strong className="text-white">Student:</strong> JIBIN V JOHNSON</p>
            <p><strong className="text-white">Roll No:</strong> 15</p>
            <p><strong className="text-white">Institution:</strong> Amal Jyothi College of Engineering</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-forest-700 flex items-center justify-center text-leaf-300 flex-shrink-0">
              <Scale className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Harvest Promise</h3>
              <p className="text-forest-300 text-xs">Audited variance formula comparing farmer crop forecasts against verified yields.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-forest-700 flex items-center justify-center text-leaf-300 flex-shrink-0">
              <CalendarCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Fair Allocation</h3>
              <p className="text-forest-300 text-xs">ACID stock distribution (FIFO & Proportional) preventing over-booking and shortages.</p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-forest-700 flex items-center justify-center text-leaf-300 flex-shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-semibold text-white text-sm">Surplus Rescue</h3>
              <p className="text-forest-300 text-xs">Discounted rescue channels for unallocated fresh produce before expiry.</p>
            </div>
          </div>
        </div>
      </div>

      {/* The Essential Demonstration Scenario Banner */}
      <div className="bg-amber-50 border-2 border-amber-300 rounded-2xl p-6 shadow-sm">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-100 rounded-xl text-amber-800 flex-shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div className="space-y-2 flex-1">
            <div className="flex items-center gap-2">
              <span className="bg-amber-200 text-amber-900 font-bold text-xs px-2.5 py-0.5 rounded-full uppercase">
                Demo Benchmark Scenario
              </span>
              <h2 className="text-base font-bold text-stone-900">
                100 kg Expected &bull; 70 kg Actual Harvest &bull; 90 kg Pre-Orders
              </h2>
            </div>
            <p className="text-stone-700 text-xs leading-relaxed">
              When actual yield (70 kg) falls short of expected forecast (100 kg) by <strong className="text-rose-700">-30 kg (-30%)</strong>, 
              FreshHarvest prevents over-allocation. The first 70 kg is allocated fairly (Alice: 35 kg, Bob: 35 kg), while Catherine receives 0 kg with an explicit 
              <strong className="text-amber-800"> 20 kg shortfall</strong>. No excess stock can ever be listed or allocated!
            </p>
            <div className="pt-2 flex flex-wrap gap-3">
              <Link
                href="/allocation"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-medium text-xs rounded-lg transition-colors shadow-sm"
              >
                <span>Inspect Allocation Workbench</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
              <Link
                href="/reports"
                className="inline-flex items-center gap-1.5 px-3.5 py-1.5 bg-white border border-amber-300 hover:bg-amber-100 text-stone-800 font-medium text-xs rounded-lg transition-colors"
              >
                <BarChart3 className="w-3.5 h-3.5 text-amber-700" />
                <span>View DBMS Variance Report</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Core Workflow Stages */}
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-forest-700" />
          <span>The FreshHarvest Relational Workflow</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            { step: '01', title: 'Expected Harvest', desc: 'Farmers publish crop volume forecasts & harvest dates' },
            { step: '02', title: 'Customer Pre-Orders', desc: 'Shoppers reserve advance quota before plucking' },
            { step: '03', title: 'Actual Harvest & Variance', desc: 'Weighed yield entered, variance audited immediately' },
            { step: '04', title: 'Fair Allocation', desc: 'Deterministic FIFO or Proportional stock assignment' },
            { step: '05', title: 'Surplus Rescue', desc: 'Remaining unsold stock listed at discount before expiry' },
          ].map((s, idx) => (
            <div key={idx} className="bg-white p-4 rounded-xl border border-ivory-300 shadow-sm flex flex-col justify-between">
              <div>
                <span className="text-xs font-bold text-forest-600 bg-forest-50 px-2 py-0.5 rounded">
                  STAGE {s.step}
                </span>
                <h3 className="font-semibold text-stone-900 text-sm mt-2">{s.title}</h3>
                <p className="text-stone-600 text-xs mt-1 leading-snug">{s.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Navigation Quick Launch Grid */}
      <div>
        <h2 className="text-xl font-bold text-stone-900 mb-4 flex items-center gap-2">
          <Database className="w-5 h-5 text-forest-700" />
          <span>Explore Application Modules</span>
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/dashboard"
            className="p-5 bg-white rounded-xl border border-ivory-300 hover:border-forest-500 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-forest-100 flex items-center justify-center text-forest-700 mb-3 group-hover:bg-forest-600 group-hover:text-white transition-colors">
              <TrendingUp className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 group-hover:text-forest-700 transition-colors">Executive Dashboard</h3>
            <p className="text-stone-600 text-xs mt-1">Live metrics, expected vs actual harvest charts, inventory overview and shortages.</p>
          </Link>

          <Link
            href="/allocation"
            className="p-5 bg-white rounded-xl border border-ivory-300 hover:border-forest-500 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-leaf-100 flex items-center justify-center text-leaf-700 mb-3 group-hover:bg-leaf-600 group-hover:text-white transition-colors">
              <Scale className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 group-hover:text-forest-700 transition-colors">Fair Allocation Workbench</h3>
            <p className="text-stone-600 text-xs mt-1">Interactive FIFO vs Proportional allocation preview, execution, and shortage handling.</p>
          </Link>

          <Link
            href="/surplus-rescue"
            className="p-5 bg-white rounded-xl border border-ivory-300 hover:border-forest-500 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-amber-100 flex items-center justify-center text-amber-700 mb-3 group-hover:bg-amber-600 group-hover:text-white transition-colors">
              <Sparkles className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 group-hover:text-forest-700 transition-colors">Surplus Rescue Hub</h3>
            <p className="text-stone-600 text-xs mt-1">Rescue excess farm stock with auto-expiry tracking and discounted customer checkout.</p>
          </Link>

          <Link
            href="/reports"
            className="p-5 bg-white rounded-xl border border-ivory-300 hover:border-forest-500 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center text-blue-700 mb-3 group-hover:bg-blue-600 group-hover:text-white transition-colors">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 group-hover:text-forest-700 transition-colors">DBMS Reports & SQL</h3>
            <p className="text-stone-600 text-xs mt-1">Relational views, normalization (1NF, 2NF, 3NF), and demonstrable SQL queries.</p>
          </Link>

          <Link
            href="/history"
            className="p-5 bg-white rounded-xl border border-ivory-300 hover:border-forest-500 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-purple-100 flex items-center justify-center text-purple-700 mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 group-hover:text-forest-700 transition-colors">Farmer Commitment & Audits</h3>
            <p className="text-stone-600 text-xs mt-1">Immutable transaction logs and farmer historical reliability metrics.</p>
          </Link>

          <Link
            href="/settings"
            className="p-5 bg-white rounded-xl border border-ivory-300 hover:border-forest-500 hover:shadow-md transition-all group"
          >
            <div className="w-10 h-10 rounded-lg bg-stone-100 flex items-center justify-center text-stone-700 mb-3 group-hover:bg-stone-600 group-hover:text-white transition-colors">
              <Database className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-stone-900 group-hover:text-forest-700 transition-colors">System Settings & DB Mode</h3>
            <p className="text-stone-600 text-xs mt-1">Inspect Supabase connection status, reset demo baseline, and toggle policies.</p>
          </Link>
        </div>
      </div>
    </div>
  );
}
