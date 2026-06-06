import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const businessId = searchParams.get('businessId');
  const businessName = searchParams.get('name') || 'NearByBazar Store';
  const startUrl = searchParams.get('startUrl') || '/';
  
  // Create a dynamic manifest
  const manifest = {
    name: businessName,
    short_name: businessName.substring(0, 12),
    description: `Official app for ${businessName}`,
    start_url: `${startUrl}?pwa=true`,
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#059669', // Emerald-600
    icons: [
      {
        src: '/icons/icon-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any maskable'
      },
      {
        src: '/icons/icon-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any maskable'
      }
    ],
    // This allows the PWA to only scope to this specific storefront if we wanted, 
    // but typically '/' is fine so they can still browse the marketplace if they leave the store.
    scope: '/'
  };

  return new NextResponse(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
      // Cache for 1 hour
      'Cache-Control': 'public, max-age=3600, stale-while-revalidate=86400',
    },
  });
}
