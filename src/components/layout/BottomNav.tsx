'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, User, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/translations';
import { useAuthStore } from '@/store/authStore';

export function BottomNav() {
  const pathname = usePathname();
  const { t } = useTranslation();
  const { isAuthenticated } = useAuthStore();

  const navItems = [
    { name: t('home') || 'Home', href: '/', icon: Home },
    { name: t('categories') || 'Categories', href: '/directory', icon: LayoutGrid },
    { name: t('explore') || 'Explore', href: '/explore', icon: Search },
    { name: t('profile') || 'Profile', href: '/profile', icon: User },
  ];

  // Hide on auth paths (except landing '/' when authenticated)
  const authPaths = ['/login', '/register', '/vendor/login', '/vendor/register', '/forgot-password', '/reset-password'];
  if (authPaths.includes(pathname)) {
    return null;
  }
  
  if (pathname === '/' && !isAuthenticated) {
    return null;
  }

  const segments = pathname.split('/').filter(Boolean);
  const isStorefront = segments.length === 1 && ![
    'explore', 'food', 'login', 'register', 'vendor', 
    'admin', 'vendor-dashboard', 'directory', 'pro', 
    'onboarding', 'profile', 'create-consumer-profile',
    'reset-password', 'forgot-password', 'sw-reset', 'claim'
  ].includes(segments[0]);

  if (isStorefront || pathname.startsWith('/vendor-dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <nav className="md:hidden fixed bottom-0 left-0 z-50 w-full h-16 bg-[#0a1223]/97 backdrop-blur-md border-t border-white/[0.06] flex items-center justify-around pb-safe shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-0.5 text-zinc-400 hover:text-emerald-400 transition-colors relative",
              isActive && "text-emerald-400 font-bold"
            )}
          >
            <item.icon className={cn("w-5 h-5 transition-transform duration-200", isActive && "scale-110")} />
            <span className="text-[10px] tracking-tight">{item.name}</span>
            {isActive && (
              <span className="absolute bottom-1 w-1 h-1 rounded-full bg-emerald-400" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}
