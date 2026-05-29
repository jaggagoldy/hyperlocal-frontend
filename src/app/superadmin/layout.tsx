'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';

export default function SuperadminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, _hasHydrated, logout } = useAuthStore();
  const [isAuthorized, setIsAuthorized] = useState(false);

  useEffect(() => {
    if (!_hasHydrated) return;

    if (pathname === '/superadmin/login') {
      setIsAuthorized(true);
      return;
    }

    if (!isAuthenticated || user?.role !== 'admin') {
      router.push('/superadmin/login');
    } else {
      setIsAuthorized(true);
    }
  }, [pathname, router, user, isAuthenticated, _hasHydrated]);

  if (!isAuthorized) {
    return null; // or a loading spinner
  }

  // If on login page, don't show the dashboard layout
  if (pathname === '/superadmin/login') {
    return <>{children}</>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <aside className="w-64 bg-slate-900 text-white flex flex-col">
        <div className="p-6 font-bold text-2xl tracking-tighter text-white">
          SUPERADMIN
        </div>
        <nav className="flex-1 px-4 space-y-2">
          <Link href="/superadmin" className={`block px-4 py-2 rounded-md ${pathname === '/superadmin' ? 'bg-slate-800' : 'hover:bg-slate-800'}`}>
            Dashboard
          </Link>
          <Link href="/superadmin/vendors" className={`block px-4 py-2 rounded-md ${pathname.includes('/vendors') ? 'bg-slate-800' : 'hover:bg-slate-800'}`}>
            Vendors (KYC & Ads)
          </Link>
          <Link href="/superadmin/users" className={`block px-4 py-2 rounded-md ${pathname.includes('/users') ? 'bg-slate-800' : 'hover:bg-slate-800'}`}>
            Users (Moderation)
          </Link>
          <Link href="/superadmin/support" className={`block px-4 py-2 rounded-md ${pathname.includes('/support') ? 'bg-slate-800' : 'hover:bg-slate-800'}`}>
            Support Board
          </Link>
          <Link href="/superadmin/leads" className={`block px-4 py-2 rounded-md ${pathname.includes('/leads') ? 'bg-slate-800' : 'hover:bg-slate-800'}`}>
            Lead Audit
          </Link>
        </nav>
        <div className="p-4">
          <button
            onClick={() => {
              logout();
              router.push('/superadmin/login');
            }}
            className="w-full bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-md"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-8">
        {children}
      </main>
    </div>
  );
}
