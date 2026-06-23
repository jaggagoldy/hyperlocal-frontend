import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { ChevronRight, ShieldCheck, Phone, CalendarCheck, ShoppingBag } from 'lucide-react';
import {
  DIRECTORY_CATEGORIES,
  getCategoryBySlug,
  resolveDistrict,
  fetchDirectoryListings,
  API_BASE,
} from '@/lib/directory';
import SearchCardSelector from '@/components/directory/SearchCardSelector';

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

  if (!cat || !district) notFound();

  const { listings, total } = await fetchDirectoryListings(slug, cat.vertical);

  const getSearchMode = (vertical: string) => {
    const v = (vertical || '').toUpperCase();
    if (v === 'FOOD_BEVERAGE') return 'food';
    if (['RETAIL', 'GROCERY'].includes(v)) return 'retail';
    return 'service';
  };
  const searchMode = getSearchMode(cat.vertical);

  const headerGradient = searchMode === 'food'
    ? 'from-rose-600 to-rose-750'
    : searchMode === 'retail'
      ? 'from-cyan-600 to-cyan-755'
      : 'from-emerald-600 to-emerald-755';

  const textPrimary = searchMode === 'food'
    ? 'text-rose-750 font-black'
    : searchMode === 'retail'
      ? 'text-cyan-755 font-black'
      : 'text-emerald-755 font-black';

  const ctaButtonCls = searchMode === 'food'
    ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-600/10'
    : searchMode === 'retail'
      ? 'bg-cyan-600 hover:bg-cyan-700 shadow-cyan-600/10'
      : 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/10';

  const siblingHoverCls = searchMode === 'food'
    ? 'hover:border-rose-300 hover:text-rose-700'
    : searchMode === 'retail'
      ? 'hover:border-cyan-300 hover:text-cyan-700'
      : 'hover:border-emerald-300 hover:text-emerald-700';

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
      <div className={`relative overflow-hidden bg-gradient-to-br ${headerGradient} text-white`}>
        {/* subtle decorative glow */}
        <div className="pointer-events-none absolute -right-16 -top-16 h-56 w-56 rounded-full bg-white/10 blur-3xl" />
        <div className="relative mx-auto max-w-5xl px-4 py-7">
          {/* Breadcrumb */}
          <nav className="flex items-center gap-1.5 text-xs font-semibold text-emerald-50/80" aria-label="Breadcrumb">
            <Link href="/directory" className="hover:text-white">Directory</Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            <Link href={`/directory?district=${slug}`} className="hover:text-white">{district.name}</Link>
            <ChevronRight className="h-3.5 w-3.5 opacity-60" />
            <span className="text-white">{cat.label}</span>
          </nav>

          <div className="mt-4 flex items-start gap-4">
            <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-white/15 text-4xl ring-1 ring-white/25 backdrop-blur">
              {cat.icon}
            </span>
            <div className="min-w-0">
              <h1 className="text-2xl font-black leading-tight sm:text-3xl">{cat.label} in {district.name}</h1>
              <p className="mt-0.5 text-sm font-medium text-emerald-50/90">{cat.blurb}</p>
              <p className="mt-2 inline-flex items-center gap-1.5 rounded-full bg-white/15 px-2.5 py-1 text-xs font-bold text-white ring-1 ring-white/20">
                <ShieldCheck className="h-3.5 w-3.5" /> {total} verified listing{total === 1 ? '' : 's'} · {district.state}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Listings */}
      <div className="mx-auto max-w-5xl px-4 py-6">
        {listings.length > 0 && (
          /* Results + tier legend so the card badges make sense at a glance */
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 border-b border-zinc-200 pb-4">
            <p className="text-sm font-bold text-zinc-700">
              Showing <span className={textPrimary}>{listings.length}</span> of {total}
            </p>
            <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
              <span className="inline-flex items-center gap-1 rounded-full border border-orange-200 bg-orange-50 px-2 py-0.5 text-orange-700"><ShoppingBag className="h-3 w-3" /> Order online</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-violet-200 bg-violet-50 px-2 py-0.5 text-violet-700"><CalendarCheck className="h-3 w-3" /> Bookable</span>
              <span className="inline-flex items-center gap-1 rounded-full border border-zinc-200 bg-zinc-100 px-2 py-0.5 text-zinc-600"><Phone className="h-3 w-3" /> Directory</span>
            </div>
          </div>
        )}
        {listings.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-zinc-300 bg-white p-10 text-center">
            <p className="text-lg font-bold text-zinc-800">No {cat.label.toLowerCase()} listed in {district.name} yet</p>
            <p className="mt-1 text-sm font-medium text-zinc-500">Own a business here? Be the first to get listed — it&apos;s free.</p>
            <Link href="/vendor/register" className={`mt-4 inline-block rounded-xl px-5 py-2.5 text-sm font-bold text-white transition-all shadow-md ${ctaButtonCls}`}>
              List your business
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {listings.map((l) => (
              <SearchCardSelector key={l.id} listing={l} mode={searchMode} />
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
                className={`rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-sm font-semibold text-zinc-700 transition-all ${siblingHoverCls}`}
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
