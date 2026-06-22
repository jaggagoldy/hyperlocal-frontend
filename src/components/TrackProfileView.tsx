'use client';

import { useEffect, useRef } from 'react';
import { logInteraction } from '@/lib/analytics';

/**
 * Fires a single profile_view interaction when a storefront mounts (Phase G5).
 * Rendered from the server storefront page so every business — regardless of
 * template — contributes to the vendor's F5 "Profile Views" metric.
 */
export default function TrackProfileView({ businessProfileId }: { businessProfileId: string }) {
  const fired = useRef(false);
  useEffect(() => {
    if (fired.current || !businessProfileId) return;
    fired.current = true;
    logInteraction(businessProfileId, 'profile_view');
  }, [businessProfileId]);
  return null;
}
