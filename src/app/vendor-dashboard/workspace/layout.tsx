'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import {
  LayoutDashboard, ShoppingBag, Package, BarChart3, Star, Settings,
  HelpCircle, LogOut, ChevronDown, Plus, Bell, Megaphone, Menu, X
} from 'lucide-react';

const NAV_ITEMS = [
  { label: 'Dashboard', href: '/vendor-dashboard/workspace', icon: LayoutDashboard, section: 'OVERVIEW' },
  { label: 'Orders', href: '/vendor-dashboard/workspace/management/orders', icon: ShoppingBag, badge: true, section: null },
  { label: 'Catalog', href: '/vendor-dashboard/workspace/management/catalog', icon: Package, section: null },
  { label: 'Leads & Enquiries', href: '/vendor-dashboard/workspace/management/leads', icon: Star, section: null },
  { label: 'Design Storefront', href: '/vendor-dashboard/workspace/builder', icon: BarChart3, section: null },
  { label: 'Settings', href: '/vendor-dashboard/workspace/settings', icon: Settings, section: 'MANAGE' },
  { label: 'Support', href: '/vendor-dashboard/workspace/account', icon: HelpCircle, section: null },
];

function getPageTitle(pathname: string): string {
  if (pathname === '/vendor-dashboard/workspace') return 'Dashboard';
  if (pathname.includes('/orders')) return 'Orders';
  if (pathname.includes('/catalog') || pathname.includes('/catalog')) return 'Catalog';
  if (pathname.includes('/builder')) return 'Design Storefront';
  if (pathname.includes('/leads')) return 'Leads & Enquiries';
  if (pathname.includes('/settings')) return 'Settings';
  if (pathname.includes('/account')) return 'Account';
  return 'Workspace';
}

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, activeBusinessId, setActiveBusiness, logout, _hasHydrated } = useAuthStore();
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!activeBusinessId) {
      router.push('/vendor-dashboard');
      return;
    }
    fetchBusinesses();
    fetchNewOrdersCount();
    // Refresh the notification count periodically so the bell reflects new orders.
    const poll = setInterval(fetchNewOrdersCount, 60000);
    return () => clearInterval(poll);
  }, [_hasHydrated, activeBusinessId]);

  const fetchBusinesses = async () => {
    try {
      const res = await apiClient.get('/business/me/list');
      setBusinesses(res.data?.data || []);
    } catch {}
  };

  const fetchNewOrdersCount = async () => {
    try {
      const res = await apiClient.get('/orders/vendor');
      const orders = res.data?.data || [];
      setNewOrdersCount(orders.filter((o: any) => o.status === 'PENDING').length);
    } catch {}
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const activeBusiness = businesses.find(b => b.id === activeBusinessId);
  const otherBusinesses = businesses.filter(b => b.id !== activeBusinessId);

  const businessEmoji = (type?: string) => {
    if (!type) return '🏪';
    if (type.includes('FOOD') || type.includes('RESTAURANT')) return '🍽️';
    if (type.includes('SALON') || type.includes('BEAUTY')) return '✂️';
    if (type.includes('RETAIL') || type.includes('GROCERY')) return '🛒';
    if (type.includes('HEALTH') || type.includes('DOCTOR')) return '🏥';
    if (type.includes('FITNESS') || type.includes('GYM')) return '💪';
    return '🏪';
  };

  let prevSection: string | null = null;

  const SidebarContent = () => (
    <div className="flex flex-col h-full border-r border-white/[0.05]" style={{ background: '#070d1a' }}>
      {/* Logo */}
      <div className="px-5 pt-5 pb-4 border-b" style={{ borderColor: 'rgba(255,255,255,.05)' }}>
        <div
          className="flex items-center gap-2.5 mb-1 cursor-pointer"
          onClick={() => { setSidebarOpen(false); router.push('/vendor-dashboard'); }}
        >
          <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center shadow-lg shadow-emerald-500/20">
            <span className="text-zinc-950 font-black text-lg leading-none">N</span>
          </div>
          <span className="font-black text-white tracking-tight text-base">NearByBazar</span>
        </div>
        <p className="text-[9px] font-black uppercase tracking-[0.18em]" style={{ color: '#334155' }}>Vendor Console</p>
      </div>

      {/* Active Business Switcher */}
      <div className="px-3 py-3 border-b" style={{ borderColor: 'rgba(255,255,255,.05)' }}>
        <p className="text-[9px] font-black uppercase tracking-[0.15em] px-2 mb-2" style={{ color: '#334155' }}>Active Business</p>

        {activeBusiness ? (
          <div
            className="rounded-xl p-3 flex items-center gap-2.5 cursor-pointer transition-colors hover:bg-emerald-950/20"
            style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.18)' }}
            onClick={() => router.push('/vendor-dashboard')}
          >
            <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 text-base"
              style={{ background: 'rgba(16,185,129,.15)' }}>
              {businessEmoji(activeBusiness.businessType)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-bold text-white text-xs truncate leading-tight">{activeBusiness.businessName}</p>
              <p className="text-[10px] truncate mt-0.5" style={{ color: '#94a3b8' }}>
                {(activeBusiness.businessType || '').replace(/_/g, ' ')} · {activeBusiness.city?.name || activeBusiness.localityName || '—'}
              </p>
            </div>
            <ChevronDown className="w-3.5 h-3.5 shrink-0 text-emerald-400" />
          </div>
        ) : (
          <div className="rounded-xl p-3 animate-pulse bg-white/[0.04]">
            <div className="h-3 w-24 rounded bg-zinc-800 mb-1.5" />
            <div className="h-2.5 w-16 rounded bg-zinc-800" />
          </div>
        )}

        {otherBusinesses.slice(0, 2).map(biz => (
          <button
            key={biz.id}
            onClick={() => { setActiveBusiness(biz.id); setSidebarOpen(false); router.push('/vendor-dashboard/workspace'); }}
            className="w-full flex items-center gap-2.5 px-2 py-2 rounded-lg mt-1 transition-colors hover:bg-white/[0.04]"
          >
            <div className="w-6 h-6 rounded-md flex items-center justify-center text-sm shrink-0 bg-white/[0.05]">
              {businessEmoji(biz.businessType)}
            </div>
            <p className="text-xs font-medium truncate text-zinc-400">{biz.businessName}</p>
          </button>
        ))}

        <button
          onClick={() => { setSidebarOpen(false); router.push('/vendor/register'); }}
          className="w-full flex items-center gap-2 px-2 py-2 rounded-lg mt-0.5 transition-colors hover:bg-white/[0.04]"
        >
          <Plus className="w-3.5 h-3.5 text-zinc-500" />
          <p className="text-xs font-medium text-zinc-500">Add branch / business</p>
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 pl-3 py-3 overflow-y-auto space-y-0.5 scrollbar-none">
        {NAV_ITEMS.map((item) => {
          const showSectionHeader = item.section && item.section !== prevSection;
          if (showSectionHeader) prevSection = item.section!;

          const Icon = item.icon;
          const isActive = item.href === '/vendor-dashboard/workspace'
            ? pathname === item.href
            : pathname.startsWith(item.href);

          const badge = item.badge && newOrdersCount > 0 ? newOrdersCount : null;

          return (
            <div key={item.href}>
              {showSectionHeader && (
                <p className="text-[9px] font-black uppercase tracking-[0.15em] px-2 pt-4 pb-1.5" style={{ color: '#334155' }}>
                  {item.section}
                </p>
              )}
              <button
                onClick={() => { setSidebarOpen(false); router.push(item.href); }}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-l-xl text-sm font-medium transition-all ${
                  isActive ? 'font-bold' : 'hover:bg-white/[0.03]'
                }`}
                style={isActive
                  ? { background: 'rgba(16,185,129,.1)', color: '#ffffff', borderRight: '2px solid #10b981' }
                  : { color: '#475569' }
                }
              >
                <div className="flex items-center gap-2.5">
                  <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : ''}`} />
                  {item.label}
                </div>
                {badge ? (
                  <span className="text-[10px] font-black px-1.5 py-0.5 rounded-md"
                    style={{ background: 'rgba(99,102,241,.2)', color: '#818cf8' }}>
                    {badge} new
                  </span>
                ) : null}
              </button>
            </div>
          );
        })}
      </nav>

      {/* Bottom: Classic UI toggle + Logout */}
      <div className="px-3 pb-4 pt-3 border-t" style={{ borderColor: 'rgba(255,255,255,.07)' }}>
        <p className="text-[9px] font-black uppercase tracking-[0.15em] px-2 mb-2" style={{ color: '#374151' }}>Interface</p>
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl mb-2"
          style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.07)' }}>
          <div className="flex-1 min-w-0">
            <p className="text-xs font-bold text-white">Switch to Classic UI</p>
            <p className="text-[10px]" style={{ color: '#4b5563' }}>Back to old version</p>
          </div>
          <button
            onClick={() => { setSidebarOpen(false); router.push('/vendor-dashboard'); }}
            className="w-9 h-5 rounded-full relative transition-colors shrink-0"
            style={{ background: 'rgba(255,255,255,.12)' }}
          >
            <span className="absolute top-0.5 left-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-transform" />
          </button>
        </div>
        <button
          onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg transition-colors hover:bg-zinc-800/60"
          style={{ color: '#4b5563' }}
        >
          <LogOut className="w-4 h-4" />
          <span className="text-xs font-medium">Logout</span>
        </button>
      </div>
    </div>
  );

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: '#0d1117' }}>

      {/* ── DESKTOP SIDEBAR ── */}
      <aside className="w-[220px] shrink-0 hidden md:flex flex-col border-r" style={{ borderColor: 'rgba(255,255,255,.07)' }}>
        <SidebarContent />
      </aside>

      {/* ── MOBILE DRAWER OVERLAY ── */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-[60] md:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setSidebarOpen(false)} />
          <aside className="absolute left-0 top-0 bottom-0 w-[220px] border-r z-10" style={{ borderColor: 'rgba(255,255,255,.07)' }}>
            <SidebarContent />
          </aside>
        </div>
      )}

      {/* ── MAIN AREA ── */}
      <div className="flex-1 flex flex-col overflow-hidden min-w-0">

        {/* Top Header */}
        <header className="h-14 flex items-center justify-between px-4 md:px-6 border-b shrink-0 gap-3"
          style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,.07)' }}>

          <div className="flex items-center gap-3 min-w-0">
            {/* Mobile hamburger */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="md:hidden p-1.5 rounded-lg hover:bg-zinc-800 transition-colors"
              style={{ color: '#6b7280' }}
            >
              <Menu className="w-5 h-5" />
            </button>

            <div className="min-w-0">
              <h1 className="text-sm font-black text-white leading-tight">{getPageTitle(pathname)}</h1>
              {activeBusiness && (
                <p className="text-[11px] hidden sm:block leading-tight truncate" style={{ color: '#4b5563' }}>
                  {activeBusiness.businessName} · {activeBusiness.localityName || activeBusiness.city?.name || ''}
                </p>
              )}
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <div className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold"
              style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', color: '#34d399' }}>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Online · Taking Orders
            </div>
            <button className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors hover:bg-zinc-800"
              style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#9ca3af' }}>
              <Megaphone className="w-3.5 h-3.5" />
              Announce
            </button>
            <button
              onClick={() => router.push('/vendor-dashboard/workspace/management/orders')}
              className="p-2 rounded-lg hover:bg-zinc-800 transition-colors relative"
              style={{ color: newOrdersCount > 0 ? '#34d399' : '#6b7280' }}
              aria-label={newOrdersCount > 0 ? `${newOrdersCount} new orders` : 'Notifications'}
              title={newOrdersCount > 0 ? `${newOrdersCount} new order${newOrdersCount > 1 ? 's' : ''}` : 'No new orders'}
            >
              <Bell className="w-4 h-4" />
              {newOrdersCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-500 text-white text-[9px] font-black flex items-center justify-center leading-none">
                  {newOrdersCount > 9 ? '9+' : newOrdersCount}
                </span>
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 overflow-y-auto" style={{ background: '#0d1117' }}>
          {children}
        </main>
      </div>
    </div>
  );
}
