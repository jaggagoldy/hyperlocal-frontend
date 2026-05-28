'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const protectedRoutes = ['/profile', '/admin', '/saved', '/onboarding'];
const authOnlyRoutes = ['/login', '/register', '/forgot-password'];

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
      const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
      const isAuthOnly = authOnlyRoutes.some(route => pathname.startsWith(route));
      
      // Not logged in & trying to access protected route → login
      if (isProtected && !isAuthenticated) {
        router.replace('/login');
      }
      // Already logged in & on a login/register page → profile
      if (isAuthOnly && isAuthenticated) {
        router.replace('/profile');
      }
    }
  }, [mounted, _hasHydrated, isAuthenticated, pathname, router]);

  if (!mounted) {
    return null; // Avoid hydration mismatch on initial render
  }

  return <>{children}</>;
}
