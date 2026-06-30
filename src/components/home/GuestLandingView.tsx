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

const INTENTS = [
  { label: 'Order Food',   cat: 'food-beverage',  icon: UtensilsCrossed, color: '#fb923c', bg: 'rgba(251,146,60,.1)',  border: 'rgba(251,146,60,.2)' },
  { label: 'Book Salon',   cat: 'salon-beauty',   icon: Scissors,        color: '#a78bfa', bg: 'rgba(167,139,250,.1)', border: 'rgba(167,139,250,.2)' },
  { label: 'Find Doctor',  cat: 'health-medical', icon: Stethoscope,     color: '#38bdf8', bg: 'rgba(56,189,248,.1)',  border: 'rgba(56,189,248,.2)' },
  { label: 'Home Repair',  cat: 'home-repair',    icon: Wrench,          color: '#f59e0b', bg: 'rgba(245,158,11,.1)',  border: 'rgba(245,158,11,.2)' },
];

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
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);

  const allDistricts = states.flatMap((s) => s.districts);
  const district = allDistricts.find((d) => d.slug === districtSlug);
  const districtName = district?.name || 'your area';

  useEffect(() => {
    const saved = typeof window !== 'undefined' ? localStorage.getItem(DISTRICT_KEY) : null;
    if (saved) setDistrictSlug(saved);
  }, []);

  useEffect(() => {
    fetchRegions().then((s) => {
      setStates(s);
      const flat = s.flatMap((x) => x.districts);
      setDistrictSlug((cur) => (flat.some((d) => d.slug === cur) ? cur : flat[0]?.slug || DEFAULT_DISTRICT));
    });
  }, []);

  const loadListings = useCallback((slug: string) => {
    setLoadingListings(true);
    fetchDirectoryListings(slug, 'any', { limit: 8 })
      .then(({ listings }) => setListings(listings))
      .catch(() => setListings([]))
      .finally(() => setLoadingListings(false));
  }, []);

  useEffect(() => { loadListings(districtSlug); }, [districtSlug, loadListings]);

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
    <div className="min-h-screen text-white" style={{ background: '#020617' }}>
      {/* ── HERO ── */}
      <section className="relative overflow-hidden pt-8 pb-16">
        {/* Glow blobs */}
        <div
          className="pointer-events-none absolute -top-32 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,.18), transparent 65%)' }}
        />
        <div
          className="pointer-events-none absolute top-0 -right-32 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(56,189,248,.12), transparent 70%)' }}
        />

        <div className="relative z-10 mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 sm:pt-6">
          {/* District selector */}
          <label
            className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 backdrop-blur cursor-pointer"
            style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)' }}
          >
            <MapPin className="h-3.5 w-3.5 shrink-0" style={{ color: '#34d399' }} />
            <select
              value={districtSlug}
              onChange={(e) => onDistrictChange(e.target.value)}
              className="bg-transparent text-sm font-bold outline-none text-white [&>optgroup]:text-zinc-900 [&>option]:text-zinc-900"
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

          <h1
            className="mt-6 max-w-2xl text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight"
          >
            Everything local in{' '}
            <span
              style={{
                background: 'linear-gradient(135deg,#10b981,#34d399)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              {districtName}
            </span>
            ,<br className="hidden sm:block" /> one tap away.
          </h1>
          <p className="mt-3 max-w-xl text-sm sm:text-base font-medium" style={{ color: '#64748b' }}>
            Discover, call, book or order from trusted businesses near you — restaurants, salons, doctors, repairs &amp; more.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-6 flex max-w-2xl items-center gap-2 rounded-2xl p-2"
            style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.08)', boxShadow: '0 0 0 1px rgba(16,185,129,.1), 0 20px 60px rgba(0,0,0,.4)' }}
          >
            <div className="flex flex-1 items-center pl-3 gap-2.5">
              <Search className="h-5 w-5 shrink-0" style={{ color: '#475569' }} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search in ${districtName}…`}
                className="h-10 w-full bg-transparent text-sm font-medium text-white placeholder:text-slate-600 outline-none"
              />
            </div>
            <button
              type="submit"
              className="h-10 shrink-0 rounded-xl px-5 text-sm font-black text-white transition-all hover:opacity-90 active:scale-[0.97]"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
            >
              Search
            </button>
          </form>

          {/* Trust strip */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold" style={{ color: '#475569' }}>
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5" style={{ color: '#34d399' }} />
              Instant WhatsApp connect
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5" style={{ color: '#34d399' }} />
              Verified local businesses
            </span>
            <span className="inline-flex items-center gap-1.5" style={{ color: '#34d399' }}>
              ₹0 commission
            </span>
          </div>
        </div>
      </section>

      <div className="mx-auto max-w-screen-2xl px-4 sm:px-6 lg:px-8 pb-24">
        {/* ── INTENT SHORTCUTS ── */}
        <section className="-mt-10 relative z-10 grid grid-cols-2 gap-3 sm:grid-cols-4">
          {INTENTS.map((i) => {
            const Icon = i.icon;
            return (
              <Link
                key={i.label}
                href={`/${districtSlug}/${i.cat}`}
                className="flex items-center gap-2.5 rounded-2xl p-3 transition-all hover:-translate-y-0.5 hover:shadow-lg"
                style={{ background: '#0f172a', border: `1px solid ${i.border}` }}
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: i.bg, border: `1px solid ${i.border}` }}
                >
                  <Icon className="h-5 w-5" style={{ color: i.color }} />
                </span>
                <span className="text-sm font-extrabold leading-tight text-white">{i.label}</span>
              </Link>
            );
          })}
        </section>

        {/* ── STATS STRIP ── */}
        <section className="mt-10 bg-white/[0.02] border-y border-white/[0.05] py-5 px-6 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-y-4 md:gap-y-0 text-center">
          <div className="border-r border-white/[0.05]">
            <p className="text-2xl md:text-3xl font-black text-white">2,400+</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-1">Businesses</p>
          </div>
          <div className="md:border-r border-white/[0.05]">
            <p className="text-2xl md:text-3xl font-black text-white">16</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-1">Verticals</p>
          </div>
          <div className="border-r border-white/[0.05]">
            <p className="text-2xl md:text-3xl font-black text-white">28</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-1">Districts</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-white">₹0</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-zinc-500 mt-1">Commission</p>
          </div>
        </section>

        {/* ── 16-CATEGORY GRID ── */}
        <section className="mt-12">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-white">Browse categories</h2>
              <p className="text-sm font-medium mt-0.5" style={{ color: '#475569' }}>
                Explore {districtName} across 16 verticals.
              </p>
            </div>
            <Link
              href={`/directory?district=${districtSlug}`}
              className="hidden sm:flex items-center gap-1 text-sm font-bold"
              style={{ color: '#34d399' }}
            >
              All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {DIRECTORY_CATEGORIES.slice(0, isCategoriesExpanded ? undefined : 8).map((c) => (
              <Link
                key={c.slug}
                href={`/${districtSlug}/${c.slug}`}
                className="group flex flex-col gap-2 rounded-2xl p-4 transition-all hover:-translate-y-0.5"
                style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.06)' }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = 'rgba(16,185,129,.25)')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.06)')}
              >
                <span className="text-3xl">{c.icon}</span>
                <span className="font-extrabold leading-tight text-white">{c.label}</span>
                <span className="line-clamp-2 text-xs font-medium" style={{ color: '#475569' }}>{c.blurb}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <button
              onClick={() => setIsCategoriesExpanded(prev => !prev)}
              className="inline-flex items-center gap-2 rounded-xl bg-white/[0.05] border border-white/[0.08] hover:bg-white/[0.08] text-white font-bold text-xs px-5 py-2.5 transition-all cursor-pointer"
            >
              {isCategoriesExpanded ? 'Show fewer categories ↑' : 'Show all 16 categories ↓'}
            </button>
          </div>
        </section>

        {/* ── NEARBY / FEATURED LISTINGS ── */}
        <section className="mt-12">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl font-black text-white">Popular in {districtName}</h2>
            <Link href={`/directory?district=${districtSlug}`} className="text-sm font-bold shrink-0" style={{ color: '#34d399' }}>
              See all
            </Link>
          </div>

          {loadingListings ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-2xl"
                  style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.06)' }}
                />
              ))}
            </div>
          ) : listings.length > 0 ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {listings.map((l) => (
                <ListingCard key={l.id} listing={l} />
              ))}
            </div>
          ) : (
            <div
              className="rounded-2xl p-8 text-center text-sm font-medium"
              style={{ border: '2px dashed rgba(255,255,255,.06)', background: '#0f172a', color: '#475569' }}
            >
              No listings in {districtName} yet — try another district, or{' '}
              <Link href="/vendor/register" className="font-bold" style={{ color: '#34d399' }}>
                list your business
              </Link>
              .
            </div>
          )}
        </section>

        {/* ── DUAL VALUE STRIP ── */}
        <section className="mt-12 grid grid-cols-1 gap-3 sm:grid-cols-2">
          <Link
            href="/vendor/register"
            className="flex items-center gap-3 rounded-2xl p-4 transition-all hover:-translate-y-0.5"
            style={{ background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.2)' }}
          >
            <Store className="h-8 w-8 shrink-0" style={{ color: '#34d399' }} />
            <div>
              <p className="font-extrabold text-white">List your business — free</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: '#64748b' }}>
                Get discovered by customers nearby in minutes.
              </p>
            </div>
          </Link>
          <Link
            href="/vendor/register"
            className="flex items-center gap-3 rounded-2xl p-4 transition-all hover:-translate-y-0.5"
            style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.06)' }}
          >
            <Smartphone className="h-8 w-8 shrink-0" style={{ color: '#a78bfa' }} />
            <div>
              <p className="font-extrabold text-white">Get your own ordering app</p>
              <p className="text-xs font-medium mt-0.5" style={{ color: '#64748b' }}>
                Upgrade your listing into a storefront &amp; PWA.
              </p>
            </div>
          </Link>
        </section>

        {/* ── SEO FOOTER: district × category links ── */}
        <section className="mt-12 pt-8" style={{ borderTop: '1px solid rgba(255,255,255,.05)' }}>
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3" style={{ color: '#334155' }}>
            Popular searches in {districtName}
          </h2>
          <div className="flex flex-wrap gap-2">
            {DIRECTORY_CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/${districtSlug}/${c.slug}`}
                className="rounded-full px-3 py-1.5 text-xs font-semibold transition-colors"
                style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.06)', color: '#475569' }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(16,185,129,.25)';
                  (e.currentTarget as HTMLElement).style.color = '#34d399';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,255,255,.06)';
                  (e.currentTarget as HTMLElement).style.color = '#475569';
                }}
              >
                {c.label} in {districtName}
              </Link>
            ))}
          </div>
        </section>
      </div>

      {/* ── PWA INSTALL PROMPT ── */}
      {installPrompt && !installDismissed && (
        <div className="fixed inset-x-0 bottom-0 z-50 mx-auto max-w-md p-3 sm:bottom-4">
          <div
            className="flex items-center gap-3 rounded-2xl p-3"
            style={{ background: '#0f172a', border: '1px solid rgba(16,185,129,.2)', boxShadow: '0 20px 60px rgba(0,0,0,.5)' }}
          >
            <span
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
              style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)' }}
            >
              <Download className="h-5 w-5" style={{ color: '#34d399' }} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-white">Install NearByBazar</p>
              <p className="truncate text-xs font-medium" style={{ color: '#475569' }}>
                Add to your home screen for one-tap access.
              </p>
            </div>
            <button
              onClick={handleInstall}
              className="shrink-0 rounded-xl px-3 py-2 text-sm font-black text-white"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)' }}
            >
              Install
            </button>
            <button
              onClick={dismissInstall}
              aria-label="Dismiss"
              className="shrink-0 rounded-lg p-1.5"
              style={{ color: '#475569' }}
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
