import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronLeft } from 'lucide-react';
import {
  DIRECTORY_CATEGORIES,
  getCategoryBySlug,
  resolveDistrict,
  fetchDirectoryListings,
  API_BASE,
} from '@/lib/directory';
import ListingCard from '@/components/directory/ListingCard';

// ISR: SEO pages stay cached and fast, refreshed periodically as supply changes.
export const revalidate = 1800;

type Params = { slug: string; category: string };

export async function generateMetadata({ params }: { params: Promise<Params> | Params }): Promise<Metadata> {
  const { slug, category } = await params;
  const cat = getCategoryBySlug(category);
  const district = await resolveDistrict(slug);
  if (!cat || !district) return { title: 'Not found | NearByBazar' };
  const title = `${cat.label} in ${district.name} | NearByBazar`;
  const description = `Find and connect with the best ${cat.label.toLowerCase()} in ${district.name}, ${district.state}. ${cat.blurb}. Call, book or order — all on NearByBazar.`;
  return {
    title,
    description,
    alternates: { canonical: `/${slug}/${category}` },
    openGraph: { title, description, type: 'website' },
  };
}

export default async function DirectoryCategoryPage({ params }: { params: Promise<Params> | Params }) {
  const { slug, category } = await params;
  const cat = getCategoryBySlug(category);
  const district = await resolveDistrict(slug);

  // A 2-segment URL whose first part isn't a real district, or unknown category,
  // is not a directory page — 404 (the 1-segment /[slug] storefront route is separate).
  if (!cat || !district) notFound();

  const { listings, total } = await fetchDirectoryListings(slug, cat.vertical);

  // schema.org ItemList of LocalBusiness for rich results.
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: `${cat.label} in ${district.name}`,
    numberOfItems: total,
    itemListElement: listings.slice(0, 25).map((l, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: {
        '@type': 'LocalBusiness',
        name: l.businessName,
        address: { '@type': 'PostalAddress', addressLocality: l.localityName, addressRegion: district.state, addressCountry: 'IN' },
        ...(l.latitude && l.longitude ? { geo: { '@type': 'GeoCoordinates', latitude: l.latitude, longitude: l.longitude } } : {}),
        ...(l.metaData?.osm?.contactPhone ? { telephone: l.metaData.osm.contactPhone } : {}),
        ...(l.rating > 0 ? { aggregateRating: { '@type': 'AggregateRating', ratingValue: l.rating, ratingCount: 1 } } : {}),
      },
    })),
  };

  const siblings = DIRECTORY_CATEGORIES.filter((c) => c.slug !== category).slice(0, 8);

  return (
    <div className="min-h-screen bg-zinc-50">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Header */}
      <div className="bg-gradient-to-b from-emerald-600 to-emerald-700 text-white">
        <div className="mx-auto max-w-5xl px-4 py-6">
          <Link href="/directory" className="inline-flex items-center gap-1 text-sm font-semibold text-emerald-50/90 hover:text-white">
            <ChevronLeft className="h-4 w-4" /> All categories
          </Link>
          <div className="mt-3 flex items-center gap-3">
            <span className="text-4xl">{cat.icon}</span>
            <div>
              <h1 className="text-2xl font-black leading-tight sm:text-3xl">{cat.label} in {district.name}</h1>
              <p className="text-sm font-medium text-emerald-50/90">{total} listing{total === 1 ? '' : 's'} · {district.state}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="mx-auto max-w-5xl px-4 py-6">
        {listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
            <p className="text-lg font-bold text-zinc-800">No {cat.label.toLowerCase()} listed in {district.name} yet</p>
            <p className="mt-1 text-sm font-medium text-zinc-500">Own a business here? Be the first to get listed — it&apos;s free.</p>
            <Link href="/vendor/register" className="mt-4 inline-block rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
              List your business
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <ListingCard key={l.id} listing={l} />
            ))}
          </div>
        )}

        {/* Internal links — sibling categories in the same district (SEO spokes) */}
        <div className="mt-10">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">More in {district.name}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {siblings.map((c) => (
              <Link
                key={c.slug}
                href={`/${slug}/${c.slug}`}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700 hover:border-emerald-300 hover:text-emerald-700"
              >
                {c.icon} {c.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

// Surface the API base in dev logs only if misconfigured (helps diagnose empty pages).
if (process.env.NODE_ENV !== 'production' && !API_BASE) {
  console.warn('[directory] NEXT_PUBLIC_API_URL is not set');
}
