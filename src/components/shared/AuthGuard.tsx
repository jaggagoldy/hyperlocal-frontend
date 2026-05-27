'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

const protectedRoutes = ['/profile', '/admin', '/saved'];

export function AuthGuard({ children }: { children: React.ReactNode }) {
  const { isAuthenticated } = useAuthStore();
  const router = useRouter();
  const pathname = usePathname();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted) {
      const isProtected = protectedRoutes.some(route => pathname.startsWith(route));
      if (isProtected && !isAuthenticated) {
        router.replace('/login');
      }
    }
  }, [mounted, isAuthenticated, pathname, router]);

  if (!mounted) {
    return null; // Avoid hydration mismatch on initial render
  }

  return <>{children}</>;
}
