'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import {
  TrendingUp, TrendingDown, Star, Eye, ShoppingBag, IndianRupee,
  ArrowRight, Clock, ChevronDown
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

// ─── helpers ────────────────────────────────────────────────────────────────

function shortDate(d: Date): string {
  return d.toLocaleDateString('en-IN', { weekday: 'short' }).slice(0, 3);
}

function formatMoneyK(n: number): string {
  if (n >= 100000) return `₹${(n / 100000).toFixed(1)}L`;
  if (n >= 1000) return `₹${(n / 1000).toFixed(1)}K`;
  return `₹${n}`;
}

const STATUS_STYLES: Record<string, string> = {
  PENDING: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
  CONFIRMED: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  COMPLETED: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  CANCELLED: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
  NEW: 'bg-indigo-500/10 text-indigo-300 border border-indigo-500/20',
  CONTACTED: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  CONVERTED: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
};

// ─── sub-components ──────────────────────────────────────────────────────────

function KPICard({
  label, value, sub, up, cardStyle,
}: {
  label: string; value: string; sub: string; up?: boolean; cardStyle: React.CSSProperties;
}) {
  return (
    <div className="rounded-2xl p-5" style={cardStyle}>
      <p className="text-[10px] font-black uppercase tracking-wider mb-2" style={{ color: '#64748b' }}>{label}</p>
      <p className="text-2xl font-black text-white mb-1">{value}</p>
      {sub && (
        <p className="text-xs font-bold flex items-center gap-1" style={{ color: up === false ? '#f87171' : '#34d399' }}>
          {up !== undefined && (up ? <TrendingUp className="w-3 h-3" /> : <TrendingDown className="w-3 h-3" />)}
          {sub}
        </p>
      )}
    </div>
  );
}

// ─── main page ───────────────────────────────────────────────────────────────

export default function WorkspaceDashboard() {
  const router = useRouter();
  const { activeBusinessId } = useAuthStore();

  const [businesses, setBusinesses] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [orders, setOrders] = useState<any[]>([]);
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7D');

  useEffect(() => {
    if (!activeBusinessId) { router.push('/vendor-dashboard'); return; }
    fetchAll();
  }, [activeBusinessId]);

  const fetchAll = async () => {
    try {
      setIsLoading(true);
      const [bizRes, dashRes, ordersRes, leadsRes] = await Promise.allSettled([
        apiClient.get('/business/me/list'),
        apiClient.get('/business/me/dashboard'),
        apiClient.get('/orders/vendor'),
        apiClient.get('/leads'),
      ]);
      if (bizRes.status === 'fulfilled') setBusinesses(bizRes.value.data?.data || []);
      if (dashRes.status === 'fulfilled') setAnalytics(dashRes.value.data?.data?.analytics || {});
      if (ordersRes.status === 'fulfilled') setOrders(ordersRes.value.data?.data || []);
      if (leadsRes.status === 'fulfilled') setLeads(leadsRes.value.data?.data || []);
    } finally {
      setIsLoading(false);
    }
  };

  const activeBusiness = businesses.find(b => b.id === activeBusinessId);
  const otherBusinesses = businesses.filter(b => b.id !== activeBusinessId);

  // Revenue trend — last 7 days from orders
  const revenueTrend = useMemo(() => {
    const days: { label: string; date: string; rev: number }[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().slice(0, 10);
      days.push({ label: shortDate(d), date: key, rev: 0 });
    }
    orders.filter(o => o.status === 'COMPLETED').forEach(o => {
      const key = new Date(o.createdAt).toISOString().slice(0, 10);
      const day = days.find(d => d.date === key);
      if (day) day.rev += Number(o.totalAmount || 0);
    });
    return days;
  }, [orders]);

  const maxRev = Math.max(...revenueTrend.map(d => d.rev), 1);

  // Month revenue
  const thisMonth = new Date();
  const monthlyRevenue = orders
    .filter(o => {
      const d = new Date(o.createdAt);
      return o.status === 'COMPLETED' && d.getMonth() === thisMonth.getMonth() && d.getFullYear() === thisMonth.getFullYear();
    })
    .reduce((s, o) => s + Number(o.totalAmount || 0), 0);

  // Order status breakdown for "Order Types" panel
  const statusBreakdown = useMemo(() => {
    const total = orders.length || 1;
    const pending = orders.filter(o => o.status === 'PENDING').length;
    const confirmed = orders.filter(o => o.status === 'CONFIRMED').length;
    const completed = orders.filter(o => o.status === 'COMPLETED').length;
    return [
      { label: 'New', pct: Math.round((pending / total) * 100), color: '#818cf8' },
      { label: 'Active', pct: Math.round((confirmed / total) * 100), color: '#fbbf24' },
      { label: 'Done', pct: Math.round((completed / total) * 100), color: '#34d399' },
    ];
  }, [orders]);

  // Recent activity (orders + leads combined, newest first)
  const recentActivity = useMemo(() => {
    const combined = [
      ...orders.map(o => ({ ...o, _kind: 'order' })),
      ...leads.map(l => ({ ...l, _kind: 'lead' })),
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    return combined.slice(0, 6);
  }, [orders, leads]);

  const avgOrderValue = orders.length
    ? Math.round(orders.reduce((s, o) => s + Number(o.totalAmount || 0), 0) / orders.length)
    : 0;

  const newOrdersCount = orders.filter(o => o.status === 'PENDING').length;

  if (isLoading) {
    return (
      <div className="p-6 xl:p-8 space-y-6">
        {/* Branch tabs skeleton */}
        <div className="flex gap-2">
          {[1, 2].map(i => <div key={i} className="h-9 w-32 rounded-full animate-pulse" style={{ background: 'rgba(255,255,255,.06)' }} />)}
        </div>
        {/* KPI skeletons */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="h-28 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,.04)' }} />
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          <div className="lg:col-span-3 h-64 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,.04)' }} />
          <div className="lg:col-span-2 h-64 rounded-2xl animate-pulse" style={{ background: 'rgba(255,255,255,.04)' }} />
        </div>
      </div>
    );
  }

  return (
    <div className="p-5 xl:p-8 space-y-6 pb-24">

      {/* ── BRANCH TABS ── */}
      <div className="flex items-center gap-2 flex-wrap">
        {activeBusiness && (
          <button className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold text-white"
            style={{ background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.25)' }}>
            <span>{activeBusiness.businessName}</span>
            <span className="text-[10px] font-medium" style={{ color: '#34d399' }}>
              {activeBusiness.localityName || activeBusiness.city?.name || ''}
            </span>
          </button>
        )}
        {otherBusinesses.slice(0, 2).map(biz => (
          <button
            key={biz.id}
            onClick={() => router.push('/vendor-dashboard')}
            className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-zinc-800"
            style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: '#9ca3af' }}
          >
            {biz.businessName}
            <span className="text-[10px]" style={{ color: '#4b5563' }}>{biz.localityName || biz.city?.name || ''}</span>
          </button>
        ))}
        <button
          onClick={() => router.push('/vendor/register')}
          className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-colors hover:bg-zinc-800"
          style={{ background: 'rgba(255,255,255,.04)', border: '1px dashed rgba(255,255,255,.12)', color: '#6b7280' }}
        >
          + Add Branch
        </button>
      </div>

      {/* ── KPI CARDS ── */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          label="Revenue (Month)"
          value={formatMoneyK(monthlyRevenue)}
          sub="+12% vs last month"
          up={true}
          cardStyle={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}
        />
        <KPICard
          label="Total Orders"
          value={orders.length.toString()}
          sub={`${newOrdersCount} pending`}
          up={newOrdersCount > 0}
          cardStyle={{ background: 'rgba(99,102,241,.06)', border: '1px solid rgba(99,102,241,.15)' }}
        />
        <KPICard
          label="Profile Views"
          value={(analytics?.profileViews || 0).toLocaleString()}
          sub={`+${analytics?.last30Days?.profileViews ?? 0} this month`}
          up={true}
          cardStyle={{ background: 'rgba(139,92,246,.06)', border: '1px solid rgba(139,92,246,.15)' }}
        />
        <KPICard
          label="Avg Rating"
          value={`${(analytics?.rating || activeBusiness?.rating || 0).toFixed(1)} ⭐`}
          sub={`${leads.length} enquiries total`}
          cardStyle={{ background: 'rgba(245,158,11,.06)', border: '1px solid rgba(245,158,11,.15)' }}
        />
      </div>

      {/* ── CHART + ORDER TYPES ROW ── */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">

        {/* Revenue Trend Chart */}
        <div className="lg:col-span-3 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
          <div className="flex items-center justify-between mb-5">
            <div>
              <h3 className="font-black text-white text-sm">Revenue Trend · 7 Days</h3>
              <p className="text-[11px] mt-0.5" style={{ color: '#4b5563' }}>
                {new Date(Date.now() - 6 * 86400000).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                {' – '}
                {new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
              </p>
            </div>
            <select
              value={dateRange}
              onChange={e => setDateRange(e.target.value)}
              className="text-xs font-bold rounded-lg px-2.5 py-1.5 outline-none"
              style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#9ca3af' }}
            >
              <option value="7D">7 Days</option>
              <option value="30D">30 Days</option>
            </select>
          </div>

          {/* Bar Chart */}
          <div className="flex items-end justify-between gap-1.5 h-36 mb-2">
            {revenueTrend.map((d) => {
              const pct = maxRev > 0 ? (d.rev / maxRev) * 100 : 0;
              return (
                <div key={d.date} className="flex-1 flex flex-col items-center gap-1 group relative">
                  <div className="absolute bottom-full mb-1 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 pointer-events-none transition-opacity z-10">
                    <div className="text-[10px] font-bold px-2 py-1 rounded-lg whitespace-nowrap"
                      style={{ background: '#1e293b', color: '#e2e8f0', border: '1px solid rgba(255,255,255,.1)' }}>
                      {formatMoneyK(d.rev)}
                    </div>
                  </div>
                  <div className="w-full rounded-t-md transition-all duration-500"
                    style={{
                      height: `${Math.max(pct, pct > 0 ? 8 : 0)}%`,
                      background: pct > 0
                        ? 'linear-gradient(to top, #059669, #34d399)'
                        : 'rgba(255,255,255,.06)',
                      minHeight: pct > 0 ? '6px' : '0px',
                    }}
                  />
                </div>
              );
            })}
          </div>

          {/* X-axis labels + values */}
          <div className="flex justify-between gap-1.5">
            {revenueTrend.map((d) => (
              <div key={d.date} className="flex-1 text-center">
                <p className="text-[9px] font-bold" style={{ color: '#4b5563' }}>{d.label}</p>
                {d.rev > 0 && (
                  <p className="text-[9px] font-bold mt-0.5" style={{ color: '#34d399' }}>{formatMoneyK(d.rev)}</p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Order Breakdown */}
        <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
          <h3 className="font-black text-white text-sm mb-4">Order Status</h3>

          <div className="space-y-3.5">
            {statusBreakdown.map(({ label, pct, color }) => (
              <div key={label}>
                <div className="flex justify-between items-center mb-1.5">
                  <span className="text-xs font-bold" style={{ color: '#9ca3af' }}>{label}</span>
                  <span className="text-xs font-black" style={{ color }}>{pct}%</span>
                </div>
                <div className="h-1.5 rounded-full" style={{ background: 'rgba(255,255,255,.08)' }}>
                  <div className="h-full rounded-full transition-all duration-700"
                    style={{ width: `${pct}%`, background: color }} />
                </div>
              </div>
            ))}
          </div>

          <div className="mt-5 pt-4 space-y-1.5" style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
            <div className="flex justify-between text-xs">
              <span style={{ color: '#4b5563' }}>Total Orders</span>
              <span className="font-bold text-white">{orders.length}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: '#4b5563' }}>Avg Order Value</span>
              <span className="font-bold text-white">₹{avgOrderValue}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span style={{ color: '#4b5563' }}>Revenue (Month)</span>
              <span className="font-bold" style={{ color: '#34d399' }}>{formatMoneyK(monthlyRevenue)}</span>
            </div>
          </div>

          <button
            onClick={() => router.push('/vendor-dashboard/workspace/management/orders')}
            className="mt-5 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-bold transition-colors hover:bg-zinc-700"
            style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#9ca3af' }}
          >
            Manage Orders <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

      </div>

      {/* ── RECENT ACTIVITY ── */}
      <div className="rounded-2xl overflow-hidden" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.07)' }}>
        <div className="flex items-center justify-between px-5 py-4" style={{ borderBottom: '1px solid rgba(255,255,255,.07)' }}>
          <h3 className="font-black text-white text-sm flex items-center gap-2">
            <Clock className="w-4 h-4 text-emerald-400" /> Recent Activity
          </h3>
          <button
            onClick={() => router.push('/vendor-dashboard/workspace/management/orders')}
            className="text-xs font-bold flex items-center gap-1 transition-colors hover:text-white"
            style={{ color: '#34d399' }}
          >
            View all <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {recentActivity.length === 0 ? (
          <div className="py-16 text-center">
            <Star className="w-10 h-10 mx-auto mb-3" style={{ color: '#1e293b' }} />
            <p className="text-sm font-bold" style={{ color: '#374151' }}>No activity yet</p>
            <p className="text-xs mt-1" style={{ color: '#1f2937' }}>Orders and enquiries will appear here</p>
          </div>
        ) : (
          <div className="divide-y" style={{ borderColor: 'rgba(255,255,255,.05)' }}>
            {/* Table header */}
            <div className="hidden md:grid grid-cols-5 gap-4 px-5 py-3 text-[10px] font-black uppercase tracking-wider"
              style={{ color: '#374151', background: 'rgba(255,255,255,.02)' }}>
              <span className="col-span-2">Customer</span>
              <span>Type</span>
              <span>Amount</span>
              <span>Status</span>
            </div>

            {recentActivity.map((item) => {
              const isOrder = item._kind === 'order';
              return (
                <div
                  key={item.id}
                  className="grid grid-cols-2 md:grid-cols-5 gap-4 px-5 py-3.5 cursor-pointer transition-colors hover:bg-zinc-800/30"
                  onClick={() => router.push(isOrder
                    ? '/vendor-dashboard/workspace/management/orders'
                    : '/vendor-dashboard/workspace/management/leads'
                  )}
                >
                  <div className="col-span-2 md:col-span-2">
                    <p className="text-sm font-bold text-white truncate">{item.customerName || '—'}</p>
                    <p className="text-[10px] mt-0.5 truncate" style={{ color: '#4b5563' }}>
                      {formatDistanceToNow(new Date(item.createdAt), { addSuffix: true })}
                    </p>
                  </div>
                  <div className="hidden md:flex items-center">
                    <span className="text-xs font-bold px-2 py-0.5 rounded-md"
                      style={{ background: isOrder ? 'rgba(245,158,11,.1)' : 'rgba(99,102,241,.1)', color: isOrder ? '#fbbf24' : '#818cf8' }}>
                      {isOrder ? 'Order' : 'Lead'}
                    </span>
                  </div>
                  <div className="hidden md:flex items-center">
                    <span className="text-sm font-black" style={{ color: '#e2e8f0' }}>
                      {isOrder ? `₹${item.totalAmount || '—'}` : '—'}
                    </span>
                  </div>
                  <div className="flex items-center">
                    <span className={`text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wide ${STATUS_STYLES[item.status] || 'text-zinc-400 bg-zinc-800'}`}>
                      {item.status}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}
