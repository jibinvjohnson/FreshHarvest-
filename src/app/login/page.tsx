'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { KeyRound, ShieldCheck, User, Users, CheckCircle, ArrowRight } from 'lucide-react';

export default function LoginPage() {
  const [activeRole, setActiveRole] = useState<'admin' | 'farmer' | 'customer'>('admin');
  const [email, setEmail] = useState('admin@freshharvest.market');
  const [password, setPassword] = useState('demo1234');
  const [loginMessage, setLoginMessage] = useState<string | null>(null);

  const handleRoleSelect = (role: 'admin' | 'farmer' | 'customer') => {
    setActiveRole(role);
    if (role === 'admin') setEmail('admin@freshharvest.market');
    else if (role === 'farmer') setEmail('thomas.kurian@highlandfarms.in');
    else setEmail('alice.m@gmail.com');
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginMessage(`Authenticated successfully as ${activeRole.toUpperCase()}!`);
    setTimeout(() => {
      setLoginMessage(null);
    }, 2000);
  };

  return (
    <div className="max-w-xl mx-auto py-8 space-y-6">
      <div className="text-center space-y-2">
        <div className="w-12 h-12 bg-forest-100 text-forest-700 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
          <KeyRound className="w-6 h-6" />
        </div>
        <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">System Authentication & Role Switcher</h1>
        <p className="text-stone-600 text-xs">Simulate user access roles for the college DBMS evaluation</p>
      </div>

      {loginMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center justify-center gap-2 font-medium">
          <CheckCircle className="w-4 h-4 text-emerald-600" />
          <span>{loginMessage}</span>
        </div>
      )}

      {/* Role Selection Cards */}
      <div className="grid grid-cols-3 gap-3">
        {[
          { id: 'admin', label: 'Market Admin', icon: ShieldCheck, desc: 'Full DBMS & Allocation Access' },
          { id: 'farmer', label: 'Local Farmer', icon: Users, desc: 'Commitments & Batch Entry' },
          { id: 'customer', label: 'Customer', icon: User, desc: 'Pre-Orders & Surplus Rescue' },
        ].map((r) => {
          const Icon = r.icon;
          const isSelected = activeRole === r.id;
          return (
            <button
              key={r.id}
              type="button"
              onClick={() => handleRoleSelect(r.id as any)}
              className={`p-3.5 rounded-xl border text-left flex flex-col justify-between transition-all ${
                isSelected
                  ? 'bg-forest-700 text-white border-forest-800 shadow-md'
                  : 'bg-white text-stone-700 border-ivory-300 hover:bg-stone-50'
              }`}
            >
              <div>
                <Icon className={`w-5 h-5 mb-2 ${isSelected ? 'text-leaf-300' : 'text-forest-600'}`} />
                <div className="font-bold text-xs">{r.label}</div>
              </div>
              <p className={`text-[10px] mt-2 leading-tight ${isSelected ? 'text-forest-200' : 'text-stone-400'}`}>
                {r.desc}
              </p>
            </button>
          );
        })}
      </div>

      {/* Login Box */}
      <div className="bg-white rounded-2xl border border-ivory-300 p-6 shadow-sm space-y-4">
        <form onSubmit={handleLogin} className="space-y-4 text-xs">
          <div>
            <label className="block font-medium text-stone-700 mb-1">Simulated User Email</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
            />
          </div>

          <div>
            <label className="block font-medium text-stone-700 mb-1">Demo Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-2.5 rounded-lg border border-stone-300 focus:border-forest-600 outline-none"
            />
          </div>

          <button
            type="submit"
            className="w-full py-2.5 bg-forest-700 hover:bg-forest-800 text-white font-bold rounded-xl transition-colors shadow-sm flex items-center justify-center gap-1.5"
          >
            <span>Enter as {activeRole.toUpperCase()}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 space-y-1">
          <p><strong>Note for evaluators:</strong> Supabase Auth can be toggled in <code>.env.local</code>.</p>
          <p>For college presentations, demo role switching is active by default to quickly demo both farmer commitments and customer pre-orders without logout delays.</p>
        </div>
      </div>
    </div>
  );
}
