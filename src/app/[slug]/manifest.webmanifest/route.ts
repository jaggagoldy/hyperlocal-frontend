import axios from 'axios';

export const dynamic = 'force-dynamic';

/**
 * Per-vendor web app manifest. When a customer installs a storefront (Add to Home
 * Screen / Install), this makes the installed app use THAT business's name and logo
 * instead of the generic NearByBazar app. Served at /{slug}/manifest.webmanifest and
 * referenced by the storefront page's generateMetadata.
 */
export async function GET(_req: Request, { params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let business: any = null;
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/business/${slug}`;
    const res = await axios.get(url, { timeout: 30000 });
    business = res.data?.data || null;
  } catch {/* fall back to the generic app below */}

  const name = business?.businessName || 'NearByBazar';
  const logo: string | undefined = business?.media?.find((m: any) => m.type === 'profile_image')?.secureUrl;

  const icons = logo
    ? [
        { src: logo, sizes: '192x192', purpose: 'any' },
        { src: logo, sizes: '512x512', purpose: 'any' },
        { src: logo, sizes: '512x512', purpose: 'maskable' },
      ]
    : [
        { src: '/icon-192x192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
        { src: '/icon-512x512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
      ];

  const manifest = {
    name,
    short_name: name.length > 12 ? `${name.slice(0, 12)}…` : name,
    description: business?.metaData?.aboutText || `Order & book from ${name} on NearByBazar.`,
    start_url: `/${slug}`,
    scope: `/${slug}`,
    display: 'standalone',
    background_color: '#020617',
    theme_color: '#10b981',
    icons,
  };

  return new Response(JSON.stringify(manifest), {
    headers: {
      'Content-Type': 'application/manifest+json',
      'Cache-Control': 'public, max-age=300, s-maxage=300',
    },
  });
}
