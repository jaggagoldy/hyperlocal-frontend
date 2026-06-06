'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';

export default function PwaManifestInjector() {
  const searchParams = useSearchParams();
  const [manifestUrl, setManifestUrl] = useState<string | null>(null);

  useEffect(() => {
    // Check if we are trying to install a white-labeled PWA
    const isPwa = searchParams.get('pwa');
    // If the URL has businessId (or if we extracted it from a slug in a real storefront page)
    const businessId = searchParams.get('businessId');
    const businessName = searchParams.get('bname');

    if (isPwa === 'true') {
      let url = '/api/manifest?startUrl=' + encodeURIComponent(window.location.pathname + window.location.search);
      if (businessId) url += `&businessId=${businessId}`;
      if (businessName) url += `&name=${encodeURIComponent(businessName)}`;
      setManifestUrl(url);
    }
  }, [searchParams]);

  if (!manifestUrl) return null;

  return (
    <link rel="manifest" href={manifestUrl} />
  );
}
