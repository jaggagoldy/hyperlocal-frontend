'use client';

import { usePathname, useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { 
  Home, Store, PlusCircle, Settings,
  LogOut, User, Bell, ChevronRight, BarChart3, ShoppingBag
} from 'lucide-react';

export default function WorkspaceLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/vendor/login');
  };

  const navItems = [
    { name: 'Dashboard', href: '/vendor-dashboard/workspace', icon: Home },
    { name: 'Orders', href: '/vendor-dashboard/workspace/management/orders', icon: ShoppingBag },
    { name: 'Catalog & Menu', href: '/vendor-dashboard/workspace/management/catalog', icon: Store },
    { name: 'Leads & Enquiries', href: '/vendor-dashboard/workspace/management/leads', icon: BarChart3 },
    { name: 'Business Settings', href: '/vendor-dashboard/workspace/settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 flex">
      {/* ─── UNIFIED VERTICAL SIDEBAR ─── */}
      <aside className="w-64 bg-white border-r border-zinc-200 hidden md:flex md:flex-col fixed inset-y-0 z-50">
        
        {/* Brand Area */}
        <div className="h-16 flex items-center px-6 border-b border-zinc-100">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
              <span className="text-white font-black text-lg">N</span>
            </div>
            <span className="font-black text-zinc-900 tracking-tight text-lg">NearByBazar</span>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 px-4 space-y-2 overflow-y-auto">
          <div className="text-xs font-black text-zinc-400 uppercase tracking-wider mb-4 px-2">Active Workspace</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            // Exact match for home, startsWith for others
            const isActive = item.href === '/vendor-dashboard/workspace' 
              ? pathname === item.href 
              : pathname.startsWith(item.href);

            return (
              <button
                key={item.name}
                onClick={() => router.push(item.href)}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl transition-all group ${
                  isActive 
                    ? 'bg-emerald-50 text-emerald-700 font-bold' 
                    : 'text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900 font-medium'
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-5 h-5 ${isActive ? 'text-emerald-600' : 'text-zinc-400 group-hover:text-zinc-600'}`} />
                  <span className="text-sm">{item.name}</span>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-emerald-600" />}
              </button>
            );
          })}
        </div>

        {/* User Profile Footer */}
        <div className="p-4 border-t border-zinc-100">
          <div className="flex items-center justify-between p-3 bg-zinc-50 rounded-xl border border-zinc-200">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold text-sm">
                {user?.name?.charAt(0) || 'V'}
              </div>
              <div className="flex flex-col items-start overflow-hidden w-28">
                <span className="text-xs font-bold text-zinc-900 truncate w-full">{user?.name || 'Vendor'}</span>
                <span className="text-[10px] text-zinc-500 truncate w-full">{user?.phoneNumber}</span>
              </div>
            </div>
            <button onClick={handleLogout} className="p-1.5 text-zinc-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* ─── MAIN CONTENT AREA ─── */}
      <div className="flex-1 md:pl-64 flex flex-col min-h-screen">
        
        {/* Simple Top Bar (Mobile + Global Actions) */}
        <header className="h-16 bg-white border-b border-zinc-200 flex items-center justify-between px-4 md:px-8 sticky top-0 z-40">
          <div className="flex items-center gap-2">
            <button 
              onClick={() => router.push('/vendor-dashboard')}
              className="hidden md:flex items-center gap-2 text-sm font-bold text-zinc-500 hover:text-zinc-900 transition-colors bg-zinc-100 hover:bg-zinc-200 px-3 py-1.5 rounded-lg"
            >
              Switch Business
            </button>
            <div className="md:hidden flex items-center gap-2">
              <div className="w-8 h-8 bg-emerald-600 rounded-lg flex items-center justify-center shadow-sm">
                <span className="text-white font-black text-lg">N</span>
              </div>
              <span className="font-black text-zinc-900 tracking-tight text-lg">NearByBazar</span>
            </div>
          </div>
          
          <div className="flex items-center gap-4 ml-auto">
            <button className="p-2 text-zinc-500 hover:bg-zinc-100 rounded-full relative transition-colors">
              <Bell className="w-5 h-5" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border border-white"></span>
            </button>
            <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-zinc-50 rounded-full border border-zinc-200">
               <User className="w-4 h-4 text-zinc-500" />
               <span className="text-xs font-bold text-zinc-700">{user?.role?.toUpperCase() || 'VENDOR'}</span>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="flex-1 p-4 md:p-8">
          {children}
        </main>
        
      </div>
    </div>
  );
}
