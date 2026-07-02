import { createRequire } from 'module';
if (typeof globalThis.require === 'undefined') {
  (globalThis as any).require = createRequire(import.meta.url);
}

import type { Metadata } from 'next';
import Link from 'next/link';
import { Store, Smartphone } from 'lucide-react';
import { DIRECTORY_CATEGORIES, fetchRegions } from '@/lib/directory';
import DistrictPicker from '@/components/directory/DistrictPicker';

export const revalidate = 3600;

export const metadata: Metadata = {
  title: 'Local Business Directory — Punjab & Haryana | NearByBazar',
  description:
    'Discover local businesses across Punjab & Haryana — food, salons, doctors, repairs, shops and more. Call, book or order. List your business free.',
  alternates: { canonical: '/directory' },
};

export default async function DirectoryHubPage({
  searchParams,
}: {
  searchParams: Promise<{ district?: string }>;
}) {
  const sp = await searchParams;
  const states = await fetchRegions();
  const allDistricts = states.flatMap((s) => s.districts);
  // Default to the requested district, else the first canonical district available.
  const districtSlug = sp.district && allDistricts.some((d) => d.slug === sp.district)
    ? sp.district
    : (allDistricts[0]?.slug || 'hisar');
  const district = allDistricts.find((d) => d.slug === districtSlug);

  return (
    <div className="min-h-screen bg-zinc-50">
      {/* Hero */}
      <div className="bg-gradient-to-b from-emerald-600 to-emerald-700 text-white">
        <div className="mx-auto max-w-5xl px-4 py-8">
          <h1 className="text-2xl font-black sm:text-3xl">Your local marketplace</h1>
          <p className="mt-1 max-w-xl text-sm font-medium text-emerald-50/90">
            Find trusted local businesses across Punjab &amp; Haryana — call, book or order, all in one place.
          </p>
          <div className="mt-4 max-w-xs">
            {states.length > 0 && <DistrictPicker states={states} value={districtSlug} />}
          </div>
        </div>
      </div>

      {/* Category grid */}
      <div className="mx-auto max-w-5xl px-4 py-7">
        <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">
          Explore {district?.name ? `in ${district.name}` : ''}
        </h2>
        <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
          {DIRECTORY_CATEGORIES.map((c) => (
            <Link
              key={c.slug}
              href={`/${districtSlug}/${c.slug}`}
              className="group flex flex-col gap-2 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
            >
              <span className="text-3xl">{c.icon}</span>
              <span className="font-extrabold leading-tight text-zinc-900">{c.label}</span>
              <span className="text-xs font-medium text-zinc-500 line-clamp-2">{c.blurb}</span>
            </Link>
          ))}
        </div>

        {/* Dual value strip */}
        <div className="mt-8 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link href="/vendor/register" className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 hover:bg-emerald-100/70">
            <Store className="h-7 w-7 shrink-0 text-emerald-700" />
            <div>
              <p className="font-extrabold text-emerald-900">List your business — free</p>
              <p className="text-xs font-medium text-emerald-700/80">Get discovered by customers nearby in minutes.</p>
            </div>
          </Link>
          <Link href="/vendor/register" className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 hover:bg-zinc-50">
            <Smartphone className="h-7 w-7 shrink-0 text-violet-600" />
            <div>
              <p className="font-extrabold text-zinc-900">Get your own ordering app</p>
              <p className="text-xs font-medium text-zinc-500">Upgrade your listing into a storefront &amp; PWA.</p>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
