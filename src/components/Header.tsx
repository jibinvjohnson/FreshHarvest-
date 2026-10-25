'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Database, RotateCcw, ShieldCheck, UserCheck, CheckCircle2, AlertCircle } from 'lucide-react';
import { dbRepository, DBConnectionStatus } from '@/lib/db/repository';

export function Header() {
  const [connStatus, setConnStatus] = useState<DBConnectionStatus | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [resetMessage, setResetMessage] = useState<string | null>(null);

  useEffect(() => {
    setConnStatus(dbRepository.getConnectionStatus());
  }, []);

  const handleReset = async () => {
    setIsResetting(true);
    try {
      dbRepository.resetDemo();
      setResetMessage('Demo baseline reset successfully!');
      setTimeout(() => {
        setResetMessage(null);
        window.location.reload();
      }, 700);
    } catch {
      setResetMessage('Error resetting database.');
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <header className="h-16 border-b border-ivory-200 bg-white/80 backdrop-blur sticky top-0 z-20 px-6 flex items-center justify-between">
      {/* Database Status Indicator */}
      <div className="flex items-center gap-3">
        {connStatus?.isRemote ? (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
            <Database className="w-3.5 h-3.5 text-emerald-600" />
            <span>Supabase PostgreSQL Connected</span>
          </div>
        ) : (
          <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-medium" title="Schema constraints, ACID transactions, and foreign keys strictly enforced in local relational engine">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <Database className="w-3.5 h-3.5 text-amber-600" />
            <span>Local Relational Engine (PostgreSQL Compatible Demo Mode)</span>
          </div>
        )}

        {resetMessage && (
          <span className="text-xs font-medium text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md border border-emerald-200 flex items-center gap-1">
            <CheckCircle2 className="w-3 h-3" /> {resetMessage}
          </span>
        )}
      </div>

      {/* Action Controls */}
      <div className="flex items-center gap-3">
        <button
          onClick={handleReset}
          disabled={isResetting}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-ivory-300 text-xs font-medium text-stone-700 hover:bg-ivory-100 transition-colors disabled:opacity-50"
          title="Reset database to seed baseline state"
        >
          <RotateCcw className={`w-3.5 h-3.5 text-stone-500 ${isResetting ? 'animate-spin' : ''}`} />
          <span>Reset Demo</span>
        </button>

        <Link
          href="/login"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-forest-50 border border-forest-200 text-xs font-semibold text-forest-800 hover:bg-forest-100 transition-colors"
        >
          <UserCheck className="w-3.5 h-3.5 text-forest-600" />
          <span>Role: Admin / Demonstration</span>
        </Link>
      </div>
    </header>
  );
}
