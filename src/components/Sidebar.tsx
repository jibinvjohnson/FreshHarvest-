'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  Sprout,
  LayoutDashboard,
  CalendarClock,
  Scale,
  Sparkles,
  ClipboardList,
  ShoppingCart,
  CreditCard,
  Users,
  MapPin,
  UserCheck,
  ShoppingBag,
  Layers,
  BarChart3,
  History,
  Settings,
  KeyRound,
  ExternalLink
} from 'lucide-react';

interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
}

interface NavSection {
  title: string;
  items: NavItem[];
}

const navSections: NavSection[] = [
  {
    title: 'Core System',
    items: [
      { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
      { name: 'Fair Allocation', href: '/allocation', icon: Scale, badge: 'Key Feature' },
      { name: 'Surplus Rescue', href: '/surplus-rescue', icon: Sparkles, badge: 'Rescue' },
    ],
  },
  {
    title: 'Harvest Operations',
    items: [
      { name: 'Expected Harvests', href: '/expected-harvests', icon: CalendarClock },
      { name: 'Actual Batches', href: '/harvests', icon: Sprout },
      { name: 'Customer Pre-Orders', href: '/pre-orders', icon: ClipboardList },
    ],
  },
  {
    title: 'Marketplace & Sales',
    items: [
      { name: 'Products Catalog', href: '/products', icon: ShoppingBag },
      { name: 'Categories', href: '/categories', icon: Layers },
      { name: 'Orders', href: '/orders', icon: ShoppingCart },
      { name: 'Payments', href: '/payments', icon: CreditCard },
    ],
  },
  {
    title: 'Stakeholders',
    items: [
      { name: 'Farmers', href: '/farmers', icon: Users },
      { name: 'Farms', href: '/farms', icon: MapPin },
      { name: 'Customers', href: '/customers', icon: UserCheck },
    ],
  },
  {
    title: 'DBMS & Governance',
    items: [
      { name: 'DBMS Reports & SQL', href: '/reports', icon: BarChart3 },
      { name: 'Audit & Commitment', href: '/history', icon: History },
      { name: 'System Settings', href: '/settings', icon: Settings },
      { name: 'Auth & Role Switcher', href: '/login', icon: KeyRound },
    ],
  },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 flex-shrink-0 bg-forest-950 text-white flex flex-col h-screen sticky top-0 border-r border-forest-800 select-none z-30">
      {/* Brand Header */}
      <div className="p-4 border-b border-forest-800 flex items-center justify-between">
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-forest-600 flex items-center justify-center text-white shadow-md group-hover:bg-forest-500 transition-colors">
            <Sprout className="w-5 h-5 text-leaf-300" />
          </div>
          <div>
            <h1 className="font-bold text-lg leading-tight tracking-tight text-white flex items-center gap-1">
              Fresh<span className="text-leaf-400">Harvest</span>
            </h1>
            <p className="text-[10px] text-forest-300 font-medium uppercase tracking-wider">DBMS Platform</p>
          </div>
        </Link>
        <Link href="/" title="Landing Page" className="text-forest-400 hover:text-white transition-colors p-1 rounded">
          <ExternalLink className="w-4 h-4" />
        </Link>
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 py-4 space-y-6">
        {navSections.map((section, idx) => (
          <div key={idx}>
            <div className="px-3 mb-1.5 text-[11px] font-semibold tracking-wider uppercase text-forest-400">
              {section.title}
            </div>
            <div className="space-y-0.5">
              {section.items.map((item) => {
                const isActive = pathname === item.href;
                const Icon = item.icon;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`flex items-center justify-between px-3 py-2 rounded-lg text-sm font-medium transition-all ${
                      isActive
                        ? 'bg-forest-700 text-white shadow-sm'
                        : 'text-forest-200 hover:bg-forest-900 hover:text-white'
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className={`w-4 h-4 ${isActive ? 'text-leaf-300' : 'text-forest-400'}`} />
                      <span>{item.name}</span>
                    </div>
                    {item.badge && (
                      <span className={`text-[10px] px-1.5 py-0.5 rounded-full font-semibold ${
                        item.badge === 'Key Feature'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-leaf-500/20 text-leaf-300 border border-leaf-500/30'
                      }`}>
                        {item.badge}
                      </span>
                    )}
                  </Link>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* Student Academic Footer */}
      <div className="p-3 border-t border-forest-900 bg-forest-900/40 text-[11px] text-forest-300">
        <p className="font-semibold text-white">Jibin V Johnson</p>
        <p className="text-forest-400">Roll No: 15 &bull; AJCE</p>
        <p className="text-[10px] text-leaf-400/80 mt-0.5">B.Tech DBMS Capstone</p>
      </div>
    </aside>
  );
}
