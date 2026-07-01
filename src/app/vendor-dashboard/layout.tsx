'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Loader2 } from 'lucide-react';

export default function VendorDashboardLayout({ children }: { children: React.ReactNode }) {
  const { user, activeContext, _hasHydrated } = useAuthStore();
  const router = useRouter();
  const [isAuthorizing, setIsAuthorizing] = useState(true);

  useEffect(() => {
    if (!_hasHydrated) return;
    if (!user) {
      router.replace('/login');
    } else if (!user.hasVendorProfile && activeContext !== 'vendor') {
      router.replace('/vendor/register');
    } else if (user.hasVendorProfile && activeContext !== 'vendor') {
      router.replace('/explore');
    } else {
      setIsAuthorizing(false);
    }
  }, [user, activeContext, _hasHydrated, router]);

  if (!_hasHydrated || isAuthorizing) {
    return (
      <div className="flex h-screen w-full items-center justify-center" style={{ background: '#0d1117' }}>
        <Loader2 className="h-8 w-8 animate-spin text-emerald-500" />
      </div>
    );
  }

  // Children render their own full UI — hub page has its own header,
  // workspace/* pages use workspace/layout.tsx which has its own dark sidebar.
  return <>{children}</>;
}
