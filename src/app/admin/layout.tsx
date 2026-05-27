'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, Users, LogOut } from 'lucide-react';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAuthenticated, logout } = useAuthStore();
  const router = useRouter();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      if (!isAuthenticated || user?.role !== 'admin') {
        router.replace('/explore');
      }
    }
  }, [mounted, isAuthenticated, user, router]);

  if (!mounted || !isAuthenticated || user?.role !== 'admin') {
    return null; // Return null while checking auth
  }

  const handleLogout = () => {
    logout();
    router.replace('/login');
  };

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-muted/20 pb-safe z-50 bg-background absolute inset-0">
      {/* Sidebar / Top header */}
      <aside className="w-full md:w-64 bg-card border-r border-border md:min-h-screen flex flex-col z-50 p-4 shadow-sm">
        <h2 className="text-xl font-black mb-6 md:mb-8 px-2 tracking-tight text-primary">Admin Portal</h2>
        
        <nav className="flex md:flex-col gap-2 overflow-x-auto md:overflow-visible pb-2 md:pb-0 hide-scrollbar">
          <Link href="/admin" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted font-medium transition-colors whitespace-nowrap">
            <LayoutDashboard className="w-5 h-5" />
            Dashboard
          </Link>
          <Link href="/admin/vendors" className="flex items-center gap-2 px-3 py-2 rounded-md hover:bg-muted font-medium transition-colors whitespace-nowrap">
            <Users className="w-5 h-5" />
            Moderation
          </Link>
        </nav>
        
        <div className="mt-4 md:mt-auto pt-4 md:pt-8 border-t md:border-t-0 border-border">
          <button onClick={handleLogout} className="flex items-center gap-2 px-3 py-2 w-full text-left rounded-md hover:bg-destructive/10 text-destructive font-medium transition-colors">
            <LogOut className="w-5 h-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 md:p-8 max-w-[1200px] w-full mx-auto relative z-0 overflow-y-auto">
        {children}
      </main>
    </div>
  );
}
