'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, LogOut, Loader2 } from 'lucide-react';

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, activeContext, logout, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [isAuthorizing, setIsAuthorizing] = useState(true);

  useEffect(() => {
    if (_hasHydrated) {
      if (!user) {
        router.replace('/login');
      } else if (!user.hasVendorProfile && activeContext !== 'vendor') {
        router.replace('/vendor/register');
      } else if (user.hasVendorProfile && activeContext !== 'vendor') {
        router.replace('/explore');
      } else {
        setIsAuthorizing(false);
      }
    }
  }, [user, activeContext, _hasHydrated, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!_hasHydrated || isAuthorizing) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col bg-slate-50 dark:bg-slate-950">
      {/* Top Navigation - Vendor OS Theme */}
      <header className="sticky top-0 z-40 bg-slate-900 text-slate-50 border-b border-slate-800 px-4 py-3 shadow-md flex items-center justify-between">
        <div className="flex items-center gap-2 font-bold text-lg cursor-pointer" onClick={() => router.push('/vendor-dashboard')}>
          <LayoutDashboard className="w-5 h-5 text-indigo-400" />
          <span className="tracking-tight">Vendor<span className="text-indigo-400">OS</span> Hub</span>
        </div>
        <button onClick={handleLogout} className="flex items-center gap-2 p-2 text-slate-300 hover:text-red-400 transition-colors text-sm font-medium">
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
