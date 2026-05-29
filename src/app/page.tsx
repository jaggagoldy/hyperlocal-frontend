'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { GuestLandingView } from '@/components/home/GuestLandingView';
import { AuthenticatedHomeView } from '@/components/home/AuthenticatedHomeView';

export default function Home() {
  const { user } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  // For SEO and initial render, we default to the Guest Landing View.
  // Once hydration is complete and a user is detected, we seamlessly swap to the Authenticated Dashboard.
  if (!mounted || !user) {
    return <GuestLandingView />;
  }

  return <AuthenticatedHomeView />;
}
