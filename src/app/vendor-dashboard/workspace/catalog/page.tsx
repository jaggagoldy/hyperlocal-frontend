'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function VendorCatalogRedirect() {
  const router = useRouter();
  useEffect(() => {
    router.replace('/vendor-dashboard/workspace/management/catalog');
  }, [router]);
  return null;
}
