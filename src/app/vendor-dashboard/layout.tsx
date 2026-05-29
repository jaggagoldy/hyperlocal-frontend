'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { LayoutDashboard, Users, Package, Settings, LogOut } from 'lucide-react';
import { Loader2 } from 'lucide-react';

export default function VendorDashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorizing, setIsAuthorizing] = useState(true);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isMounted) {
      if (!user) {
        router.replace('/login');
      } else if (!user.hasVendorProfile && user.activeContext !== 'vendor') {
        router.replace('/vendor/register');
      } else if (user.hasVendorProfile && user.activeContext !== 'vendor') {
        router.replace('/explore');
      } else {
        setIsAuthorizing(false);
      }
    }
  }, [user, isMounted, router]);

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  if (!isMounted || isAuthorizing) {
    return (
      <div className="flex h-screen w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const navItems = [
    { name: 'My Leads', href: '/vendor-dashboard', icon: Users },
    { name: 'My Catalog', href: '/vendor-dashboard/catalog', icon: Package },
    { name: 'Settings', href: '/vendor-dashboard/settings', icon: Settings },
  ];

  return (
    <div className="flex h-screen flex-col bg-muted/20">
      {/* Top Mobile Navigation */}
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 shadow-sm flex items-center justify-between">
        <div className="flex items-center gap-2 text-primary font-bold text-lg">
          <LayoutDashboard className="w-5 h-5" />
          <span>Vendor OS</span>
        </div>
        <button onClick={handleLogout} className="p-2 text-muted-foreground hover:text-red-500 transition-colors">
          <LogOut className="w-5 h-5" />
        </button>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto pb-20">
        {children}
      </main>

      {/* Bottom Mobile Navigation */}
      <nav className="fixed bottom-0 z-40 w-full bg-background border-t border-border px-2 py-2 flex justify-around items-center">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;
          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-colors min-w-[72px] ${
                isActive ? 'text-primary' : 'text-muted-foreground hover:bg-muted'
              }`}
            >
              <Icon className="w-6 h-6" />
              <span className="text-[10px] font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
    </div>
  );
}
