'use client';

import { useState, useEffect } from 'react';
import { Search, MapPin, Sparkles, Scissors, UserPlus, Heart, ShieldCheck, Zap, Download, X, Store, Smartphone, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useLanguageStore } from '@/store/languageStore';
import ListingCard from '@/components/directory/ListingCard';
import apiClient from '@/lib/api-client';

interface District {
  name: string;
  slug: string;
}

interface StateGroup {
  name: string;
  districts: District[];
}

const DIRECTORY_CATEGORIES = [
  { slug: 'restaurant-cafe',      label: 'Restaurant & Cafe', icon: '🍽️', blurb: 'Book tables or discover local dine-in menus' },
  { slug: 'salon-beauty',         label: 'Salon & Beauty',    icon: '✂️', blurb: 'Salons, spas, hair stylists & grooming pros' },
  { slug: 'electrician',          label: 'Electrician',       icon: '🔌', blurb: 'Fan repair, home wiring, inverter services' },
  { slug: 'plumber',              label: 'Plumber',           icon: '🚰', blurb: 'Pipe leaks, taps repair, water filter setup' },
  { slug: 'ac-repair',            label: 'AC & Appliance',    icon: '❄️', blurb: 'Air conditioner service & appliance repair' },
  { slug: 'carpenter',            label: 'Carpenter',         icon: '🪚', blurb: 'Furniture assembly, locks & wooden repair' },
  { slug: 'painter',              label: 'Painter',           icon: '🎨', blurb: 'Interior walls, exterior shine & wallpaper' },
  { slug: 'ro-repair',            label: 'RO Service',        icon: '💧', blurb: 'Water purifier service & filter change' },
  { slug: 'car-rental',           label: 'Car Rental',        icon: '🚗', blurb: 'Self-drive cars, local cabs & taxi services' },
  { slug: 'real-estate',          label: 'Real Estate',       icon: '🏢', blurb: 'Rent, buy or list properties & storefronts' },
];

const INTENTS = [
  { label: 'Order Food', cat: 'restaurant-cafe',  icon: Store,      bg: 'rgba(239,68,68,.08)', border: 'rgba(239,68,68,.12)',  color: '#f87171' },
  { label: 'Book Salon', cat: 'salon-beauty',     icon: Scissors,   bg: 'rgba(139,92,246,.08)', border: 'rgba(139,92,246,.12)', color: '#a78bfa' },
  { label: 'Find Doctor', cat: 'health-medical',   icon: UserPlus,   bg: 'rgba(56,189,248,.08)', border: 'rgba(56,189,248,.12)', color: '#38bdf8' },
  { label: 'Home Repair', cat: 'home-repair',      icon: Zap,        bg: 'rgba(245,158,11,.08)', border: 'rgba(245,158,11,.12)',  color: '#fbbf24' },
];

export function GuestLandingView() {
  const { language } = useLanguageStore();
  const [states, setStates] = useState<StateGroup[]>([]);
  const [districtSlug, setDistrictSlug] = useState('hisar');
  const [listings, setListings] = useState<any[]>([]);
  const [loadingListings, setLoadingListings] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isCategoriesExpanded, setIsCategoriesExpanded] = useState(false);

  // PWA install trigger state
  const [installPrompt, setInstallPrompt] = useState<any>(null);
  const [installDismissed, setInstallDismissed] = useState(false);

  const allDistricts = states.flatMap((s) => s.districts);
  const district = allDistricts.find((d) => d.slug === districtSlug);
  const districtName = district?.name || 'Hisar';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('nbb-district');
      if (saved) setDistrictSlug(saved);

      const dismissed = sessionStorage.getItem('nbb-install-dismissed');
      if (dismissed) setInstallDismissed(true);

      const handleBeforeInstallPrompt = (e: any) => {
        e.preventDefault();
        setInstallPrompt(e);
      };
      window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }
  }, []);

  const handleInstall = async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    const { outcome } = await installPrompt.userChoice;
    if (outcome === 'accepted') {
      setInstallPrompt(null);
    }
  };

  useEffect(() => {
    async function fetchDistricts() {
      try {
        const res = await apiClient.get('/search/cities');
        const list = res.data.data;
        const groups: Record<string, District[]> = {};
        list.forEach((item: any) => {
          const stateName = item.state || 'Haryana';
          if (!groups[stateName]) groups[stateName] = [];
          groups[stateName].push({
            name: item.name,
            slug: item.slug,
          });
        });
        const mapped = Object.keys(groups).map((key) => ({
          name: key,
          districts: groups[key],
        }));
        setStates(mapped);
      } catch (err) {
        console.error(err);
      }
    }
    fetchDistricts();
  }, []);

  useEffect(() => {
    async function fetchPopularListings() {
      if (!districtSlug) return;
      setLoadingListings(true);
      try {
        const res = await apiClient.get(`/search/explore/${districtSlug}/any?limit=6`);
        setListings(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoadingListings(false);
      }
    }
    fetchPopularListings();
  }, [districtSlug]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    window.location.href = `/explore?q=${encodeURIComponent(searchQuery.trim())}`;
  };

  const dismissInstall = () => {
    setInstallDismissed(true);
    sessionStorage.setItem('nbb-install-dismissed', '1');
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
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
          <label className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-card border border-border shadow-inner cursor-pointer">
            <MapPin className="h-3.5 w-3.5 shrink-0 text-primary" />
            <select
              value={districtSlug}
              onChange={(e) => {
                const slug = e.target.value;
                setDistrictSlug(slug);
                localStorage.setItem('nbb-district', slug);
              }}
              className="bg-transparent text-sm font-bold outline-none text-foreground [&>optgroup]:bg-card [&>optgroup]:text-foreground [&>option]:bg-card [&>option]:text-foreground"
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

          <h1 className="mt-6 max-w-2xl text-4xl sm:text-5xl lg:text-6xl font-black leading-[1.1] tracking-tight">
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
          <p className="mt-3 max-w-xl text-sm sm:text-base font-medium text-muted-foreground">
            Discover, call, book or order from trusted businesses near you — restaurants, salons, doctors, repairs &amp; more.
          </p>

          {/* Search bar */}
          <form
            onSubmit={handleSearchSubmit}
            className="mt-6 flex max-w-2xl items-center gap-2 rounded-2xl p-2 bg-card border border-border shadow-xl focus-within:ring-2 focus-within:ring-primary/20"
          >
            <div className="flex flex-1 items-center pl-3 gap-2.5">
              <Search className="h-5 w-5 shrink-0 text-muted-foreground" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={`Search in ${districtName}…`}
                className="h-10 w-full bg-transparent text-sm font-medium text-foreground placeholder:text-muted-foreground outline-none"
              />
            </div>
            <button
              type="submit"
              className="h-10 shrink-0 rounded-xl px-5 text-sm font-black bg-primary text-primary-foreground transition-all hover:opacity-90 active:scale-[0.97]"
            >
              Search
            </button>
          </form>

          {/* Trust strip */}
          <div className="mt-4 flex flex-wrap gap-x-5 gap-y-2 text-xs font-bold text-muted-foreground">
            <span className="inline-flex items-center gap-1.5">
              <Zap className="h-3.5 w-3.5 text-primary" />
              Instant WhatsApp connect
            </span>
            <span className="inline-flex items-center gap-1.5">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" />
              Verified local businesses
            </span>
            <span className="inline-flex items-center gap-1.5 text-primary">
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
                className="flex items-center gap-2.5 rounded-2xl p-3 transition-all hover:-translate-y-0.5 hover:shadow-lg bg-card border border-border"
              >
                <span
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                  style={{ background: i.bg, border: `1px solid ${i.border}` }}
                >
                  <Icon className="h-5 w-5" style={{ color: i.color }} />
                </span>
                <span className="text-sm font-extrabold leading-tight text-foreground">{i.label}</span>
              </Link>
            );
          })}
        </section>

        {/* ── STATS STRIP ── */}
        <section className="mt-10 bg-card border border-border py-5 px-6 rounded-2xl grid grid-cols-2 md:grid-cols-4 gap-y-4 md:gap-y-0 text-center shadow-xs">
          <div className="border-r border-border">
            <p className="text-2xl md:text-3xl font-black text-foreground">2,400+</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Businesses</p>
          </div>
          <div className="md:border-r border-border">
            <p className="text-2xl md:text-3xl font-black text-foreground">16</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Verticals</p>
          </div>
          <div className="border-r border-border">
            <p className="text-2xl md:text-3xl font-black text-foreground">28</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Districts</p>
          </div>
          <div>
            <p className="text-2xl md:text-3xl font-black text-foreground">₹0</p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground mt-1">Commission</p>
          </div>
        </section>

        {/* ── 16-CATEGORY GRID ── */}
        <section className="mt-12">
          <div className="flex items-end justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-foreground">Browse categories</h2>
              <p className="text-sm font-medium mt-0.5 text-muted-foreground">
                Explore {districtName} across 16 verticals.
              </p>
            </div>
            <Link
              href={`/directory?district=${districtSlug}`}
              className="hidden sm:flex items-center gap-1 text-sm font-bold text-primary hover:underline"
            >
              All <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
            {DIRECTORY_CATEGORIES.slice(0, isCategoriesExpanded ? undefined : 8).map((c) => (
              <Link
                key={c.slug}
                href={`/${districtSlug}/${c.slug}`}
                className="group flex flex-col gap-2 rounded-2xl p-4 transition-all hover:-translate-y-0.5 bg-card border border-border hover:border-primary/30 shadow-xs"
              >
                <span className="text-3xl">{c.icon}</span>
                <span className="font-extrabold leading-tight text-foreground">{c.label}</span>
                <span className="line-clamp-2 text-xs font-medium text-muted-foreground">{c.blurb}</span>
              </Link>
            ))}
          </div>
          <div className="text-center mt-6">
            <button
              onClick={() => setIsCategoriesExpanded(prev => !prev)}
              className="inline-flex items-center gap-2 rounded-xl bg-card border border-border hover:bg-accent text-foreground font-bold text-xs px-5 py-2.5 transition-all cursor-pointer"
            >
              {isCategoriesExpanded ? 'Show fewer categories ↑' : 'Show all 16 categories ↓'}
            </button>
          </div>
        </section>

        {/* ── NEARBY / FEATURED LISTINGS ── */}
        <section className="mt-12">
          <div className="flex items-end justify-between mb-4">
            <h2 className="text-xl font-black text-foreground">Popular in {districtName}</h2>
            <Link href={`/directory?district=${districtSlug}`} className="text-sm font-bold shrink-0 text-primary hover:underline">
              See all
            </Link>
          </div>

          {loadingListings ? (
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {Array.from({ length: 6 }).map((_, i) => (
                <div
                  key={i}
                  className="h-48 animate-pulse rounded-2xl bg-card border border-border"
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
            <div className="rounded-2xl p-8 text-center text-sm font-medium border-2 border-dashed border-border bg-card text-muted-foreground">
              No listings in {districtName} yet — try another district, or{' '}
              <Link href="/vendor/register" className="font-bold text-primary hover:underline">
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
            className="flex items-center gap-3 rounded-2xl p-4 transition-all hover:-translate-y-0.5 bg-primary/5 border border-primary/20 hover:border-primary/45"
          >
            <Store className="h-8 w-8 shrink-0 text-primary" />
            <div>
              <p className="font-extrabold text-foreground">List your business — free</p>
              <p className="text-xs font-medium mt-0.5 text-muted-foreground">
                Get discovered by customers nearby in minutes.
              </p>
            </div>
          </Link>
          <Link
            href="/vendor/register"
            className="flex items-center gap-3 rounded-2xl p-4 transition-all hover:-translate-y-0.5 bg-card border border-border hover:border-border/80"
          >
            <Smartphone className="h-8 w-8 shrink-0 text-violet-400" />
            <div>
              <p className="font-extrabold text-foreground">Get your own ordering app</p>
              <p className="text-xs font-medium mt-0.5 text-muted-foreground">
                Upgrade your listing into a storefront &amp; PWA.
              </p>
            </div>
          </Link>
        </section>

        {/* ── SEO FOOTER: district × category links ── */}
        <section className="mt-12 pt-8 border-t border-border">
          <h2 className="text-xs font-bold uppercase tracking-wider mb-3 text-muted-foreground/60">
            Popular searches in {districtName}
          </h2>
          <div className="flex flex-wrap gap-2">
            {DIRECTORY_CATEGORIES.map((c) => (
              <Link
                key={c.slug}
                href={`/${districtSlug}/${c.slug}`}
                className="rounded-full px-3 py-1.5 text-xs font-semibold transition-all bg-card border border-border text-muted-foreground hover:border-primary/25 hover:text-primary"
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
          <div className="flex items-center gap-3 rounded-2xl p-3 bg-card border border-primary/20 shadow-2xl">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary/10 border border-primary/20">
              <Download className="h-5 w-5 text-primary" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-extrabold text-foreground">Install NearByBazar</p>
              <p className="truncate text-xs font-medium text-muted-foreground">
                Add to your home screen for one-tap access.
              </p>
            </div>
            <button
              onClick={handleInstall}
              className="shrink-0 rounded-xl px-3 py-2 text-sm font-black bg-primary text-primary-foreground hover:bg-primary/95 transition-all"
            >
              Install
            </button>
            <button
              onClick={dismissInstall}
              aria-label="Dismiss"
              className="shrink-0 rounded-lg p-1.5 text-muted-foreground hover:text-foreground"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
