'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import { 
  Store, Car, Home, Scissors, LayoutDashboard, Settings, 
  Package, CheckSquare, ClipboardList, Star, MessageSquare, Menu, ChevronDown 
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
        // No active business? Kick back to Hub
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
        // ID is invalid, go to Hub
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
      <div className="flex h-screen w-full items-center justify-center bg-slate-50 dark:bg-slate-950">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  // --- Dynamic Navigation Logic ---
  const type = activeBusiness.businessType;
  
  let navItems = [
    { name: 'Dashboard', href: '/vendor-dashboard/workspace', icon: LayoutDashboard }
  ];

  if (type === 'CAB_TRANSPORT') {
    navItems.push(
      { name: 'My Vehicles', href: '/vendor-dashboard/workspace/catalog', icon: Car },
      { name: 'Ride Requests', href: '/vendor-dashboard/workspace/leads', icon: MessageSquare }
    );
  } else if (type === 'FOOD_BEVERAGE') {
    navItems.push(
      { name: 'Menu Builder', href: '/vendor-dashboard/workspace/catalog', icon: Menu },
      { name: 'Live Orders', href: '/vendor-dashboard/workspace/leads', icon: ClipboardList }
    );
  } else {
    navItems.push(
      { name: 'My Services', href: '/vendor-dashboard/workspace/catalog', icon: Package },
      { name: 'Appointments', href: '/vendor-dashboard/workspace/leads', icon: CheckSquare }
    );
  }

  // Common Tabs
  navItems.push(
    { name: 'Reviews', href: '/vendor-dashboard/workspace/reviews', icon: Star },
    { name: 'Settings', href: '/vendor-dashboard/workspace/settings', icon: Settings }
  );

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950">
      
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800">
        <div className="p-4 border-b border-slate-200 dark:border-slate-800">
          
          {/* Workspace Switcher */}
          <div className="relative">
            <button 
              onClick={() => setIsSwitcherOpen(!isSwitcherOpen)}
              className="w-full flex items-center justify-between bg-slate-100 dark:bg-slate-800 px-3 py-2.5 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors"
            >
              <div className="flex flex-col items-start truncate text-left pr-2">
                <span className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">ACTIVE WORKSPACE</span>
                <span className="text-sm font-bold text-slate-800 dark:text-slate-200 truncate w-full">{activeBusiness.businessName}</span>
              </div>
              <ChevronDown className="w-4 h-4 text-slate-500 flex-shrink-0" />
            </button>
            
            {isSwitcherOpen && (
              <div className="absolute top-full left-0 mt-2 w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-xl z-50 overflow-hidden">
                <div className="max-h-60 overflow-y-auto py-1">
                  {businesses.map(b => (
                    <button
                      key={b.id}
                      onClick={() => {
                        setActiveBusiness(b.id);
                        setIsSwitcherOpen(false);
                      }}
                      className={`w-full text-left px-4 py-2.5 text-sm hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors ${b.id === activeBusiness.id ? 'bg-indigo-50 dark:bg-indigo-900/20 text-indigo-700 dark:text-indigo-300 font-semibold' : 'text-slate-700 dark:text-slate-300'}`}
                    >
                      {b.businessName}
                    </button>
                  ))}
                </div>
                <div className="border-t border-slate-200 dark:border-slate-700">
                  <Link href="/vendor-dashboard" className="block px-4 py-2.5 text-sm text-center text-indigo-600 dark:text-indigo-400 font-semibold hover:bg-slate-50 dark:hover:bg-slate-700">
                    Go to Hub Overview
                  </Link>
                </div>
              </div>
            )}
          </div>
          
        </div>

        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-colors font-medium text-sm ${
                  isActive 
                    ? 'bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-400' 
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-400'}`} />
                {item.name}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        {/* Mobile Header */}
        <header className="md:hidden sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex flex-col">
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">Workspace</span>
            <span className="text-sm font-bold truncate max-w-[150px]">{activeBusiness.businessName}</span>
          </div>
          <button 
            onClick={() => router.push('/vendor-dashboard')}
            className="text-xs bg-slate-100 dark:bg-slate-800 px-3 py-1.5 rounded-md font-medium"
          >
            Switch
          </button>
        </header>

        <main className="flex-1 overflow-y-auto pb-20 md:pb-0">
          {children}
        </main>

        {/* Mobile Bottom Navigation */}
        <nav className="md:hidden fixed bottom-0 z-40 w-full bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-2 py-2 flex justify-around items-center">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            const Icon = item.icon;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors min-w-[64px] ${
                  isActive ? 'text-indigo-600 dark:text-indigo-400' : 'text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{item.name.split(' ')[0]}</span>
              </Link>
            );
          })}
        </nav>
      </div>

    </div>
  );
}
