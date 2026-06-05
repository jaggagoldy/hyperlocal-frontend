'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Search, Bookmark, User, Coffee } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTranslation } from '@/lib/translations';

export function BottomNav() {
  const pathname = usePathname();

  const { t } = useTranslation();

  const navItems = [
    { name: t('home') || 'Home', href: '/', icon: Home },
    { name: t('food') || 'Food', href: '/food', icon: Coffee },
    { name: t('explore') || 'Explore', href: '/explore', icon: Search },
    { name: t('profile') || 'Profile', href: '/profile', icon: User },
  ];

  const isVendorProfile = pathname.startsWith('/vendor/');
  if (isVendorProfile) return null;

  return (
    <nav className="fixed bottom-0 left-0 z-50 w-full h-16 bg-background border-t border-border flex items-center justify-around pb-safe">
      {navItems.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        return (
          <Link
            key={item.name}
            href={item.href}
            className={cn(
              "flex flex-col items-center justify-center w-full h-full space-y-1 text-muted-foreground hover:text-primary transition-colors",
              isActive && "text-primary"
            )}
          >
            <item.icon className="w-6 h-6" />
            <span className="text-[10px] font-medium">{item.name}</span>
          </Link>
        );
      })}
    </nav>
  );
}
