'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Search,
  MapPin,
  Store,
  Smartphone,
  Download,
  ArrowRight,
  UtensilsCrossed,
  Scissors,
  Stethoscope,
  Wrench,
  ShieldCheck,
  Zap,
  X,
} from 'lucide-react';
import {
  DIRECTORY_CATEGORIES,
  fetchRegions,
  fetchDirectoryListings,
  type RegionState,
  type Listing,
} from '@/lib/directory';
import ListingCard from '@/components/directory/ListingCard';

const DISTRICT_KEY = 'nbb-district';
const DEFAULT_DISTRICT = 'hisar';

// Intent shortcuts → tap straight into a district×category spoke.
const INTENTS = [
  { label: 'Order Food', cat: 'food-beverage', icon: UtensilsCrossed, cls: 'bg-orange-50 text-orange-700 ring-orange-100' },
  { label: 'Book a Salon', cat: 'salon-beauty', icon: Scissors, cls: 'bg-violet-50 text-violet-700 ring-violet-100' },
  { label: 'Find a Doctor', cat: 'health-medical', icon: Stethoscope, cls: 'bg-sky-50 text-sky-700 ring-sky-100' },
  { label: 'Home Repair', cat: 'home-repair', icon: Wrench, cls: 'bg-amber-50 text-amber-700 ring-amber-100' },
];

// Minimal shape of the beforeinstallprompt event (not in lib.dom yet).
interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>;
}

export function GuestLandingView() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [states, setStates] = useState<RegionState[]>([]);
  const [districtSlug, setDistrictSlug] = useState(DEFAULT_DISTRICT);
  const [listings, setListings] = useState<Listing[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [installPrompt, setInstallPrompt] = useState<BeforeInstallPromptEvent | null>(null);
  const [installDismissed, setInstallDismissed] = useState(true);

  const allDistricts = states.flatMap((s) => s.districts);
  const district = allDistricts.find((d) => d.slug === districtSlug);
  const districtName = district?.name || 'your area';

  // Restore the saved district before fetching regions so the picker doesn't flicker.
  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(DISTRICT_KEY) : null;
    if (saved) setDistrictSlug(saved);
  }, []);

  // Load the PB+HR region registry once.
  useEffect(() => {
    fetchRegions().then((s) => {
      setStates(s);
      // If the saved/default district isn't valid, fall back to the first available.
      const flat = s.flatMap((x) => x.districts);
      setDistrictSlug((cur) => (flat.some((d) => d.slug === cur) ? cur : flat[0]?.slug || DEFAULT_DISTRICT));
    });
  }, []);

  // Fetch nearby/featured listings for the chosen district (directory scope = all verticals).
  const loadListings = useCallback((slug: string) => {
    setLoadingListings(true);
    fetchDirectoryListings(slug, 'any', { limit: 8 })
      .then(({ listings }) => setListings(listings))
      .catch(() => setListings([]))
      .finally(() => setLoadingListings(false));
  }, []);

  useEffect(() => {
    loadListings(districtSlug);
  }, [districtSlug, loadListings]);

  // PWA install affordance — capture the deferred prompt; hide if already installed.
  useEffect(() => {
    const onPrompt = (e: Event) => {
      e.preventDefault();
      setInstallPrompt(e as BeforeInstallPromptEvent);
      setInstallDismissed(sessionStorage.getItem('nbb-install-dismissed') === '1');
    };
    window.addEventListener('beforeinstallprompt', onPrompt);
    return () => window.removeEventListener('beforeinstallprompt', onPrompt);
  }, []);

  const onDistrictChange = (slug: string) => {
    setDistrictSlug(slug);
    if (typeof window !== 'undefined') localStorage.setItem(DISTRICT_KEY, slug);
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const base = `/explore?district=${districtSlug}`;
    router.push(searchQuery.trim() ? `${base}&q=${encodeURIComponent(searchQuery.trim())}` : base);
  };

  const handleInstall = async () => {
    if (!installPrompt) return;
    await installPrompt.prompt();
    await installPrompt.userChoice;
    setInstallPrompt(null);
  };

  const dismissInstall = () => {
    setInstallDismissed(true);
    sessionStorage.setItem('nbb-install-dismissed', '1');
  };

  return (
    <div className="min-h-screen bg-zinc-50 text-foreground">
      {/* ─── HERO: district bar + search ─── */}
      <section className="bg-gradient-to-b from-emerald-600 to-emerald-700 text-white">
        <div className="mx-auto max-w-5xl px-4 pb-10 pt-8 sm:pt-12">
          {/* District bar + Sign In */}
          <div className="flex items-center justify-between w-full">
            <label className="flex items-center gap-2 rounded-full bg-white/15 px-3 py-1.5 backdrop-blur ring-1 ring-white/25">
              <MapPin className="h-4 w-4 shrink-0 text-white" />
              <select
                value={districtSlug}
                onChange={(e) => onDistrictChange(e.target.value)}
                className="bg-transparent text-sm font-bold text-white outline-none [&>optgroup]:text-zinc-900 [&>option]:text-zinc-900"
                aria-label="Choose your district"
              >
                {states.length === 0 && <option value={districtSlug}>{districtName}</option>}
                {states.map((s) => (
                  <optgroup key={s.name} label={s.name}>
                    {s.districts.map((d) => (
                      <option key={d.slug} value={d.slug}>{d.name}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </label>
            <Link href="/login">
              <button className="rounded-full bg-white/15 px-5 py-1.5 text-sm font-bold text-white backdrop-blur ring-1 ring-white/25 hover:bg-white/25 transition-all shadow-lg shadow-black/10">
                Sign In
              </button>
            </Link>
          </div>

          <h1 className="mt-6 max-w-2xl text-3xl font-black leading-tight tracking-tight sm:text-4xl">
            Everything local in {districtName}, <span className="text-emerald-100">one tap away.</span>
          </h1>
          <p className="mt-2 max-w-xl text-sm font-medium text-emerald-50/90 sm:text-base">
            Discover, call, book or order from trusted businesses near you — restaurants, salons, doctors, repairs &amp; more.
          </p>

          {/* Search */}
          <form onSubmit={handleSearchSubmit} className="mt-5 flex max-w-2xl items-center gap-2 rounded-2xl bg-white p-2 shadow-xl shadow-emerald-900/20">
            <div className="flex flex-1 items-center pl-3">
              <Search className="mr-2 h-5 w-5 shrink-0 text-zinc-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search businesses, services, owners…"
                className="h-10 w-full bg-transparent text-sm font-medium text-zinc-900 placeholder-zinc-400 outline-none"
              />
            </div>
            <button type="submit" className="h-10 shrink-0 rounded-xl bg-emerald-600 px-5 text-sm font-bold text-white shadow-sm shadow-emerald-700/30 transition-colors hover:bg-emerald-700">
              Search
            </button>
          </form>

          {/* Trust strip */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-emerald-50">
            <span className="inline-flex items-center gap-1.5"><Zap className="h-3.5 w-3.5" /> Instant WhatsApp connect</span>
            <span className="inline-flex items-center gap-1.5"><ShieldCheck className="h-3.5 w-3.5" /> Verified local businesses</span>
            <span className="inline-flex items-center gap-1.5">₹0 commission</span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-5xl px-4">
        {/* ─── INTENT SHORTCUTS ─── */}
        <section className="-mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {INTENTS.map((i) => (
            <Link
              key={i.label}
              href={`/${districtSlug}/${i.cat}`}
              className="flex items-center gap-2.5 rounded-2xl border border-zinc-200 bg-white p-3 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
            >
              <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ring-1 ${i.cls}`}>
                <i.icon className="h-5 w-5" />
              </span>
              <span className="text-sm font-extrabold leading-tight text-zinc-900">{i.label}</span>
            </Link>
          ))}
        </section>

        {/* ─── 16-CATEGORY GRID ─── */}
        <section className="mt-9">
          <div className="flex items-end justify-between">
            <div>
              <h2 className="text-lg font-black text-zinc-900">Browse categories</h2>
              <p className="text-sm font-medium text-zinc-500">Explore {districtName} across 16 verticals.</p>
            </div>
            <Link href={`/directory?district=${districtSlug}`} className="hidden shrink-0 items-center gap-1 text-sm font-bold text-emerald-700 hover:text-emerald-800 sm:flex">
              All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {DIRECTORY_CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/${districtSlug}/${c.slug}`}
                className="group flex flex-col gap-1.5 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-300 hover:shadow-md"
              >
                <span className="text-3xl">{c.icon}</span>
                <span className="font-extrabold leading-tight text-zinc-900">{c.label}</span>
                <span className="line-clamp-2 text-xs font-medium text-zinc-500">{c.blurb}</span>
              </Link>
            ))}
          </div>
        </section>

        {/* ─── NEARBY / FEATURED LISTINGS ─── */}
        <section className="mt-10">
          <div className="flex items-end justify-between">
            <h2 className="text-lg font-black text-zinc-900">Popular in {districtName}</h2>
            <Link href={`/directory?district=${districtSlug}`} className="shrink-0 text-sm font-bold text-emerald-700 hover:text-emerald-800">
              See all
            </Link>
          </div>

          {loadingListings ? (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-40 animate-pulse rounded-2xl border border-zinc-200 bg-white" />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="mt-3 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <div className="mt-3 rounded-2xl border-2 border-dashed border-zinc-200 bg-white p-8 text-center text-sm font-medium text-zinc-500">
              No listings in {districtName} yet — try another district, or{' '}
              <Link href="/vendor/register" className="font-bold text-emerald-700 hover:underline">list your business</Link>.
            </div>
          )}
        </section>

        {/* ─── DUAL VALUE STRIP ─── */}
        <section className="mt-10 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link href="/vendor/register" className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-emerald-50 p-4 transition-colors hover:bg-emerald-100/70">
            <Store className="h-8 w-8 shrink-0 text-emerald-700" />
            <div>
              <p className="font-extrabold text-emerald-900">List your business — free</p>
              <p className="text-xs font-medium text-emerald-700/80">Get discovered by customers nearby in minutes.</p>
            </div>
          </Link>
          <Link href="/vendor/register" className="flex items-center gap-3 rounded-2xl border border-zinc-200 bg-white p-4 transition-colors hover:bg-zinc-50">
            <Smartphone className="h-8 w-8 shrink-0 text-violet-600" />
            <div>
              <p className="font-extrabold text-zinc-900">Get your own ordering app</p>
              <p className="text-xs font-medium text-zinc-500">Upgrade your listing into a storefront &amp; PWA.</p>
            </div>
          </Link>
        </section>

        {/* ─── SEO FOOTER: district × category links ─── */}
        <section className="mt-12 border-t border-zinc-200 py-8">
          <h2 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Popular searches in {districtName}</h2>
          <div className="mt-3 flex flex-wrap gap-2">
            {DIRECTORY_CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/${districtSlug}/${c.slug}`}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-semibold text-zinc-600 transition-colors hover:border-emerald-300 hover:text-emerald-700"
              >
                {c.label} in {districtName}
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ─── PWA INSTALL PROMPT (bottom sheet) ─── */}
      {installPrompt && !installDismissed && (
        <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md p-3 sm:bottom-4">
          <div className="flex items-center gap-3 rounded-2xl border border-emerald-200 bg-white p-3 shadow-2xl shadow-emerald-900/20">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-emerald-700 ring-1 ring-emerald-100">
              <Download className="h-5 w-5" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-zinc-900">Install NearByBazar</p>
              <p className="truncate text-xs font-medium text-zinc-500">Add to your home screen for one-tap access.</p>
            </div>
            <button onClick={handleInstall} className="shrink-0 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white hover:bg-emerald-700">
              Install
            </button>
            <button onClick={dismissInstall} aria-label="Dismiss" className="shrink-0 rounded-lg p-1.5 text-zinc-400 hover:bg-zinc-100">
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
