'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import { 
  Store, Building2, Users, CreditCard, Package, Calendar, MessageSquare, Bot, 
  Wallet, Contact, QrCode, User, MonitorSmartphone, ChevronDown, Bell, LayoutDashboard
} from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function WorkspaceLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { activeBusinessId, setActiveBusiness, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  
  const [businesses, setBusinesses] = useState<any[]>([]);
  const [activeBusiness, setActiveBusinessData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSwitcherOpen, setIsSwitcherOpen] = useState(false);

  useEffect(() => {
    if (_hasHydrated) {
      if (!activeBusinessId) {
        router.replace('/vendor-dashboard');
      } else {
        fetchBusinessesAndSetContext();
      }
    }
  }, [_hasHydrated, activeBusinessId]);

  const fetchBusinessesAndSetContext = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/business/me/list');
      const allBusinesses = res.data.data || [];
      setBusinesses(allBusinesses);
      
      const current = allBusinesses.find((b: any) => b.id === activeBusinessId);
      if (current) {
        setActiveBusinessData(current);
      } else {
        setActiveBusiness(null);
        router.replace('/vendor-dashboard');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!_hasHydrated || isLoading || !activeBusiness) {
    return (
      <div className="flex h-screen w-full items-center justify-center bg-[#F3F4F6]">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const handleBusinessSwitch = (id: string) => {
    setActiveBusiness(id);
    setIsSwitcherOpen(false);
    // Setting activeBusinessId triggers useEffect, which fetches new metrics on dashboard home
  };

  const SIDEBAR_GROUPS = [
    {
      label: 'MANAGEMENT',
      items: [
        { name: 'My Business', href: '/vendor-dashboard/workspace/management/my-business', icon: Store },
        { name: 'Restaurants/Catalog', href: '/vendor-dashboard/workspace/management/catalog', icon: Building2 },
        { name: 'Staff Members', href: '/vendor-dashboard/workspace/management/staff', icon: Users },
        { name: 'Subscriptions', href: '/vendor-dashboard/workspace/management/subscriptions', icon: CreditCard },
        { name: 'Offerings', href: '/vendor-dashboard/workspace/management/offerings', icon: Package },
      ]
    },
    {
      label: 'COMMUNICATIONS',
      items: [
        { name: 'Appointments', href: '/vendor-dashboard/workspace/communications/appointments', icon: Calendar },
        { name: 'Enquiries', href: '/vendor-dashboard/workspace/communications/enquiries', icon: MessageSquare },
        { name: 'AI & WhatsApp', href: '/vendor-dashboard/workspace/communications/ai-whatsapp', icon: Bot },
      ]
    },
    {
      label: 'ASSETS & FINANCE',
      items: [
        { name: 'Wallet', href: '/vendor-dashboard/workspace/finance/wallet', icon: Wallet },
        { name: 'Physical Card', href: '/vendor-dashboard/workspace/finance/physical-card', icon: Contact },
        { name: 'QR Standee', href: '/vendor-dashboard/workspace/finance/qr-standee', icon: QrCode },
      ]
    },
    {
      label: 'ACCOUNT',
      items: [
        { name: 'Profile', href: '/vendor-dashboard/workspace/account/profile', icon: User },
        { name: 'POS System', href: '/vendor-dashboard/workspace/account/pos', icon: MonitorSmartphone },
      ]
    }
  ];

  return (
    <div className="flex h-screen bg-[#F8F9FA] text-zinc-900 font-sans">
      
      {/* ─── DESKTOP SIDEBAR ─── */}
      <aside className="hidden lg:flex flex-col w-64 bg-[#EBECEE] border-r border-zinc-200/60 overflow-y-auto">
        <div className="p-5 pb-2">
          {/* Logo Placeholder - BusinessBay style */}
          <div className="flex items-center gap-2 mb-6 cursor-pointer" onClick={() => router.push('/vendor-dashboard/workspace')}>
            <div className="w-8 h-8 rounded-lg bg-black flex items-center justify-center text-white font-black text-lg">B</div>
            <div>
              <h1 className="font-bold text-lg leading-tight">BusinessBay</h1>
              <p className="text-[9px] text-zinc-500 uppercase tracking-wide font-bold">AI Innovation Hub</p>
            </div>
          </div>
          
          <button 
            onClick={() => router.push('/vendor-dashboard/workspace')}
            className={`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl font-bold text-sm transition-colors ${
              pathname === '/vendor-dashboard/workspace' ? 'bg-[#1D4ED8] text-white shadow-md' : 'text-zinc-600 hover:bg-zinc-200/50'
            }`}
          >
            <LayoutDashboard className="w-4 h-4" />
            Dashboard
            {activeBusiness.membershipTier === 'Pro' && (
              <span className="ml-auto text-[9px] bg-white/20 px-1.5 py-0.5 rounded-md uppercase tracking-wider">BB OS Pro</span>
            )}
          </button>
        </div>

        <nav className="flex-1 py-4 px-3">
          {SIDEBAR_GROUPS.map((group, idx) => (
            <div key={idx} className="mb-6">
              <h3 className="px-4 mb-2 text-[10px] font-black text-zinc-400 uppercase tracking-widest">{group.label}</h3>
              <ul className="space-y-0.5">
                {group.items.map(item => {
                  const isActive = pathname === item.href;
                  const Icon = item.icon;
                  return (
                    <li key={item.name}>
                      <Link 
                        href={item.href}
                        className={`flex items-center gap-3 px-4 py-2 rounded-xl text-sm font-semibold transition-colors ${
                          isActive ? 'bg-zinc-200/70 text-zinc-900' : 'text-zinc-500 hover:bg-zinc-200/50 hover:text-zinc-800'
                        }`}
                      >
                        <Icon className={`w-4 h-4 ${isActive ? 'text-zinc-800' : 'text-zinc-400'}`} />
                        {item.name}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      {/* ─── MAIN CONTENT WRAPPER ─── */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden bg-[#F8F9FA]">
        
        {/* ─── TOP NAVBAR ─── */}
        <header className="h-16 border-b border-zinc-200 bg-white flex items-center justify-between px-6 shrink-0 z-40 sticky top-0">
          <div className="flex items-center gap-4">
            {/* Mobile Sidebar Toggle - Hidden on Desktop */}
            <button className="lg:hidden p-2 -ml-2 text-zinc-500 hover:bg-zinc-100 rounded-lg">
              <LayoutDashboard className="w-5 h-5" />
            </button>
            <h2 className="text-lg font-bold text-zinc-800 hidden md:block">
              {pathname === '/vendor-dashboard/workspace' ? 'Dashboard Overview' : pathname.split('/').pop()?.replace(/-/g, ' ').toUpperCase()}
            </h2>
          </div>

          <div className="flex items-center gap-4">
            
            {/* Wallet Button */}
            <button className="hidden md:flex items-center gap-2 bg-zinc-100 hover:bg-zinc-200 transition-colors px-4 py-2 rounded-lg text-sm font-bold text-zinc-700 border border-zinc-200">
              <Wallet className="w-4 h-4 text-zinc-500" />
              Wallet: ₹0.00 <ChevronDown className="w-3 h-3 ml-1 text-zinc-400" />
            </button>

            {/* Business Switcher Dropdown */}
            <div className="relative">
              <button 
                onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
                className="flex items-center gap-2 bg-[#1D4ED8] hover:bg-blue-800 transition-colors px-4 py-2 rounded-lg text-sm font-bold text-white shadow-sm"
              >
                <span className="truncate max-w-[120px]">{activeBusiness.businessName}</span>
                <ChevronDown className="w-3 h-3 opacity-80" />
              </button>
              
              {isSwitcherOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsSwitcherOpen(false)}></div>
                  <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2">
                    <div className="max-h-60 overflow-y-auto">
                      {businesses.map(b => (
                        <button
                          key={b.id}
                          onClick={() => handleBusinessSwitch(b.id)}
                          className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${
                            b.id === activeBusiness.id ? 'bg-blue-50 text-blue-700 font-bold' : 'text-zinc-600 hover:bg-zinc-50 font-medium'
                          }`}
                        >
                          {b.businessName}
                        </button>
                      ))}
                    </div>
                    <div className="px-4 py-2 mt-2 border-t border-zinc-100">
                      <button 
                        onClick={() => router.push('/vendor-dashboard/workspace/management/my-business')} 
                        className="w-full bg-[#1D4ED8] text-white rounded-lg py-2 text-xs font-bold hover:bg-blue-800"
                      >
                        + Create New Business
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Language & Notifications */}
            <div className="flex items-center gap-3 border-l border-zinc-200 pl-4">
              <button className="text-sm font-bold text-zinc-600 flex items-center gap-1 hover:text-zinc-900">
                EN <ChevronDown className="w-3 h-3 text-zinc-400" />
              </button>
              <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full relative">
                <Bell className="w-5 h-5" />
                <span className="absolute top-1.5 right-2 w-2 h-2 bg-rose-500 rounded-full border border-white"></span>
              </button>
              <div className="w-8 h-8 rounded-full bg-zinc-800 flex items-center justify-center text-white font-bold text-sm">
                A
              </div>
            </div>

          </div>
        </header>

        {/* ─── PAGE CONTENT ─── */}
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          {children}
        </main>

      </div>
    </div>
  );
}
