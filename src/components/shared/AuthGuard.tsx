'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const protectedRoutes = ['/profile', '/admin', '/saved', '/onboarding', '/vendor-dashboard'];
const authOnlyRoutes = ['/login', '/register', '/forgot-password', '/vendor/login'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && _hasHydrated) {
      const { isAuthenticated, activeContext } = useAuthStore.getState();
      const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
      const isAuthOnly = authOnlyRoutes.some(route => pathname.startsWith(route));
      
      const isConsumerRoute = ['/explore', '/profile', '/saved', '/onboarding'].some(route => pathname.startsWith(route)) || pathname === '/';
      const isVendorRoute = pathname.startsWith('/vendor-dashboard');

      // Walled Garden Check (Only if authenticated)
      if (isAuthenticated && activeContext) {
        if (activeContext === 'customer' && isVendorRoute) {
          router.replace('/');
          return;
        }
        if (activeContext === 'vendor' && isConsumerRoute && pathname !== '/vendor/login') {
          router.replace('/vendor-dashboard');
          return;
        }
      }

      // Not logged in & trying to access protected route → login
      if (isProtected && !isAuthenticated) {
        router.replace('/login');
      }
      
      // Already logged in & on a login/register page → profile/vendor-dashboard
      if (isAuthOnly && isAuthenticated) {
        if (activeContext === 'vendor') {
          router.replace('/vendor-dashboard');
        } else {
          router.replace('/');
        }
      }
    }
  }, [mounted, _hasHydrated, pathname, router]);

  // Always render children so every route server-renders its content into the initial
  // HTML (SEO: directory/storefront markup + schema.org JSON-LD land in the document,
  // not only the RSC flight payload). Auth-based redirects still run in the effect above
  // once mounted + hydrated; protected pages remain gated client-side.
  return <>{children}</>;
}
