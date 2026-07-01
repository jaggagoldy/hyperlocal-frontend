'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import WhatsNewClient from './WhatsNewClient';
import VendorChangelog from './VendorChangelog';

// Per the design: vendors see the platform changelog; users see the "Near You"
// discovery feed. We decide on the client because auth/context lives in the store.
export default function WhatsNewSwitch({
  newBusinesses,
  platformUpdates,
}: {
  newBusinesses: React.ComponentProps<typeof WhatsNewClient>['newBusinesses'];
  platformUpdates: React.ComponentProps<typeof WhatsNewClient>['platformUpdates'];
}) {
  const { activeContext, user } = useAuthStore();
  const [mounted, setMounted] = useState(false);
  const [override, setOverride] = useState<'vendor' | 'user' | null>(null);
  useEffect(() => {
    setMounted(true);
    // Allow ?view=vendor / ?view=user to force a view (handy for previews/demos).
    const v = new URLSearchParams(window.location.search).get('view');
    if (v === 'vendor' || v === 'user') setOverride(v);
  }, []);

  // Default (and SSR) render is the consumer feed; switch to the vendor
  // changelog after mount if forced, or if the user is in Pro/vendor mode.
  const isVendorView = mounted && (
    override === 'vendor' ||
    (override !== 'user' && (activeContext === 'vendor' || (user?.hasVendorProfile && !user?.hasCustomerProfile)))
  );

  if (isVendorView) return <VendorChangelog />;
  return <WhatsNewClient newBusinesses={newBusinesses} platformUpdates={platformUpdates} />;
}
