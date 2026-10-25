import React from 'react';
import Link from 'next/link';
import {
  Users,
  MapPin,
  ShoppingBag,
  CalendarClock,
  TrendingDown,
  TrendingUp,
  ClipboardList,
  Layers,
  Sparkles,
  AlertOctagon,
  ArrowRight,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { getDashboardMetrics, getHarvestChartData } from '@/lib/services/reportingService';
import { dbRepository } from '@/lib/db/repository';
import { HarvestChart } from '@/components/HarvestChart';

export const dynamic = 'force-dynamic';

export default async function DashboardPage() {
  const metrics = await getDashboardMetrics();
  const chartData = await getHarvestChartData();
  const [orders, audits, customers, products] = await Promise.all([
    dbRepository.getOrders(),
    dbRepository.getHarvestAudits(),
    dbRepository.getCustomers(),
    dbRepository.getProducts(),
  ]);

  const recentOrders = orders.slice(0, 5);
  const recentAudits = audits.slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-stone-900 tracking-tight">Market Overview Dashboard</h1>
          <p className="text-stone-600 text-sm">Real-time harvest commitments, pre-order fulfilment, and stock metrics</p>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href="/allocation"
            className="px-3.5 py-2 bg-forest-700 hover:bg-forest-800 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
          >
            <span>Allocation Workbench</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
          <Link
            href="/surplus-rescue"
            className="px-3.5 py-2 bg-amber-600 hover:bg-amber-700 text-white text-xs font-semibold rounded-lg transition-colors shadow-sm flex items-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>Surplus Rescue</span>
          </Link>
        </div>
      </div>

      {/* Primary KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-xl border border-ivory-300 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Total Farmers</span>
            <Users className="w-4 h-4 text-forest-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{metrics.totalFarmers}</div>
          <p className="text-[11px] text-stone-500 mt-1">{metrics.activeFarms} Active Farms Registered</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-ivory-300 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Active Products</span>
            <ShoppingBag className="w-4 h-4 text-forest-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{metrics.activeProducts}</div>
          <p className="text-[11px] text-stone-500 mt-1">Catalog Varieties Active</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-ivory-300 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Upcoming Harvests</span>
            <CalendarClock className="w-4 h-4 text-forest-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{metrics.upcomingHarvests}</div>
          <p className="text-[11px] text-stone-500 mt-1">Pending Field Commitments</p>
        </div>

        <div className="bg-white p-4 rounded-xl border border-ivory-300 shadow-sm">
          <div className="flex items-center justify-between text-stone-500 mb-2">
            <span className="text-xs font-medium">Available Stock</span>
            <Layers className="w-4 h-4 text-forest-600" />
          </div>
          <div className="text-2xl font-bold text-stone-900">{metrics.availableStockTotal} <span className="text-sm font-normal text-stone-500">kg</span></div>
          <p className="text-[11px] text-emerald-600 font-medium mt-1">Unallocated Fresh Batches</p>
        </div>
      </div>

      {/* Harvest & Allocation Operational Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Forecast vs Actual Yield */}
        <div className="bg-white p-5 rounded-xl border border-ivory-300 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Harvest Promise</span>
            {metrics.overallVarianceQuantity < 0 ? (
              <span className="text-xs bg-rose-50 text-rose-700 px-2 py-0.5 rounded font-medium flex items-center gap-1 border border-rose-200">
                <TrendingDown className="w-3.5 h-3.5" /> Deficit Shortfall
              </span>
            ) : (
              <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded font-medium flex items-center gap-1 border border-emerald-200">
                <TrendingUp className="w-3.5 h-3.5" /> Surplus
              </span>
            )}
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-stone-500">Total Expected Quantity:</span>
              <span className="font-semibold text-stone-800">{metrics.totalExpectedQuantity} kg</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-500">Total Actual Quantity:</span>
              <span className="font-semibold text-stone-800">{metrics.totalActualQuantity} kg</span>
            </div>
            <div className="border-t border-stone-100 pt-2 flex justify-between text-sm font-bold">
              <span className="text-stone-700">Net Variance:</span>
              <span className={metrics.overallVarianceQuantity < 0 ? 'text-rose-600' : 'text-emerald-600'}>
                {metrics.overallVarianceQuantity > 0 ? `+${metrics.overallVarianceQuantity}` : metrics.overallVarianceQuantity} kg
              </span>
            </div>
          </div>
        </div>

        {/* Pre-Orders & Shortage Alert */}
        <div className="bg-white p-5 rounded-xl border border-ivory-300 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Pre-Orders & Fulfilment</span>
            <ClipboardList className="w-4 h-4 text-stone-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-stone-500">Pending Pre-Orders:</span>
              <span className="font-semibold text-stone-800">{metrics.pendingPreOrdersCount} orders</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-500">Unfulfilled Demand:</span>
              <span className="font-semibold text-stone-800">{metrics.pendingPreOrdersDemand} kg</span>
            </div>
            <div className="border-t border-stone-100 pt-2 flex justify-between text-sm font-bold">
              <span className="text-stone-700">Allocation Shortage:</span>
              <span className="text-amber-600 flex items-center gap-1">
                <AlertOctagon className="w-4 h-4" />
                {metrics.totalAllocationShortage} kg
              </span>
            </div>
          </div>
        </div>

        {/* Surplus Awaiting Rescue */}
        <div className="bg-white p-5 rounded-xl border border-ivory-300 shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-semibold text-stone-600 uppercase tracking-wider">Surplus Rescue</span>
            <Sparkles className="w-4 h-4 text-amber-500" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-stone-500">Active Rescue Listings:</span>
              <span className="font-semibold text-stone-800">{metrics.surplusActiveCount} active</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-stone-500">Produce Awaiting Rescue:</span>
              <span className="font-semibold text-amber-700">{metrics.surplusAwaitingRescue} kg</span>
            </div>
            <div className="border-t border-stone-100 pt-2 flex justify-between text-sm font-bold">
              <span className="text-stone-700">Total Market Sales:</span>
              <span className="text-forest-700">₹{metrics.totalRevenue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Recharts Graph: Expected vs Actual Harvest */}
      <div className="bg-white p-6 rounded-xl border border-ivory-300 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4">
          <div>
            <h2 className="text-base font-bold text-stone-900">Crop Forecast vs Verified Harvest Yield</h2>
            <p className="text-xs text-stone-500">Comparing farmer commitments with audited batch plucking results</p>
          </div>
          <span className="text-xs bg-forest-50 text-forest-700 border border-forest-200 px-2.5 py-1 rounded-md font-medium">
            Active Harvest Cycles
          </span>
        </div>
        <HarvestChart data={chartData} />
      </div>

      {/* Recent Orders & Harvest Audit Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Orders */}
        <div className="bg-white p-5 rounded-xl border border-ivory-300 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-stone-900">Recent Customer Orders</h2>
            <Link href="/orders" className="text-xs text-forest-700 hover:underline font-medium">
              View All Orders &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {recentOrders.map((o) => {
              const cust = customers.find((c) => c.customer_id === o.customer_id);
              return (
                <div key={o.order_id} className="p-3 bg-stone-50 rounded-lg border border-stone-200/60 flex items-center justify-between">
                  <div>
                    <div className="font-semibold text-xs text-stone-900">{cust?.full_name || 'Customer'}</div>
                    <div className="text-[11px] text-stone-500">{o.notes || 'Direct farm purchase'}</div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-xs text-stone-900">₹{o.total_amount.toFixed(2)}</div>
                    <span className={`text-[10px] px-2 py-0.5 rounded-full font-medium ${
                      o.status === 'Confirmed' || o.status === 'Delivered'
                        ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}>
                      {o.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Audits */}
        <div className="bg-white p-5 rounded-xl border border-ivory-300 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-sm font-bold text-stone-900">Recent Harvest & Stock Audits</h2>
            <Link href="/history" className="text-xs text-forest-700 hover:underline font-medium">
              Audit Log &rarr;
            </Link>
          </div>
          <div className="space-y-3">
            {recentAudits.map((a) => (
              <div key={a.audit_id} className="p-3 bg-stone-50 rounded-lg border border-stone-200/60 flex items-start gap-2.5">
                <Clock className="w-4 h-4 text-forest-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-xs text-stone-800">{a.action_type}</span>
                    <span className="text-[10px] text-stone-400">{new Date(a.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-0.5">{a.reason || 'Database mutation recorded'}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
