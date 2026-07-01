'use client';

import { GuestLandingView } from '@/components/home/GuestLandingView';

// Single landing for everyone — the green hyperlocal hub that production shows a
// fresh visitor. Rendered regardless of login state so the landing is identical
// across prod and local. Its category tiles route into the per-service
// experiences (/{district}/{category}).
export default function Home() {
  return <GuestLandingView />;
}
