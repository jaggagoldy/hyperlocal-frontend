'use client';

import { useState } from 'react';
import {
  Search, MapPin, UtensilsCrossed, Scissors, Stethoscope, Wrench,
  ShoppingBag, Dumbbell, Car, Home, Briefcase, GraduationCap,
  Truck, Camera, Cpu, Star, ArrowRight, Store, Smartphone,
  ShieldCheck, Zap, BadgeCheck, Bell, User, Target,
  ChevronDown, PawPrint, Calendar, Bookmark, Monitor, Compass,
} from 'lucide-react';

// ─── MOCK DATA ────────────────────────────────────────────────────────────────

const VERTICALS = [
  { icon: UtensilsCrossed, label: 'Food & Restaurants',    count: '240+', accent: 'text-orange-400', accentBg: 'bg-orange-400/10', accentBorder: 'border-orange-400/20' },
  { icon: ShoppingBag,     label: 'Grocery & Kirana',      count: '180+', accent: 'text-green-400',  accentBg: 'bg-green-400/10',  accentBorder: 'border-green-400/20' },
  { icon: Scissors,        label: 'Salons & Beauty',       count: '95+',  accent: 'text-violet-400', accentBg: 'bg-violet-400/10', accentBorder: 'border-violet-400/20' },
  { icon: Stethoscope,     label: 'Health & Medical',      count: '65+',  accent: 'text-sky-400',    accentBg: 'bg-sky-400/10',    accentBorder: 'border-sky-400/20' },
  { icon: Wrench,          label: 'Home Repair',           count: '120+', accent: 'text-amber-400',  accentBg: 'bg-amber-400/10',  accentBorder: 'border-amber-400/20' },
  { icon: Store,           label: 'Retail & Shopping',     count: '300+', accent: 'text-pink-400',   accentBg: 'bg-pink-400/10',   accentBorder: 'border-pink-400/20' },
  { icon: Dumbbell,        label: 'Fitness & Gym',         count: '45+',  accent: 'text-red-400',    accentBg: 'bg-red-400/10',    accentBorder: 'border-red-400/20' },
  { icon: Car,             label: 'Auto & Vehicle',        count: '80+',  accent: 'text-cyan-400',   accentBg: 'bg-cyan-400/10',   accentBorder: 'border-cyan-400/20' },
  { icon: Home,            label: 'Real Estate',           count: '55+',  accent: 'text-teal-400',   accentBg: 'bg-teal-400/10',   accentBorder: 'border-teal-400/20' },
  { icon: GraduationCap,   label: 'Education & Coaching',  count: '70+',  accent: 'text-indigo-400', accentBg: 'bg-indigo-400/10', accentBorder: 'border-indigo-400/20' },
  { icon: Truck,           label: 'Logistics & Delivery',  count: '35+',  accent: 'text-lime-400',   accentBg: 'bg-lime-400/10',   accentBorder: 'border-lime-400/20' },
  { icon: Camera,          label: 'Photography',           count: '40+',  accent: 'text-fuchsia-400',accentBg: 'bg-fuchsia-400/10',accentBorder: 'border-fuchsia-400/20' },
  { icon: Cpu,             label: 'Tech Services',         count: '50+',  accent: 'text-blue-400',   accentBg: 'bg-blue-400/10',   accentBorder: 'border-blue-400/20' },
  { icon: PawPrint,        label: 'Pet Care',              count: '25+',  accent: 'text-yellow-400', accentBg: 'bg-yellow-400/10', accentBorder: 'border-yellow-400/20' },
  { icon: Briefcase,       label: 'Professional Services', count: '60+',  accent: 'text-slate-400',  accentBg: 'bg-slate-400/10',  accentBorder: 'border-slate-400/20' },
  { icon: Calendar,        label: 'Events & Entertainment',count: '30+',  accent: 'text-rose-400',   accentBg: 'bg-rose-400/10',   accentBorder: 'border-rose-400/20' },
];

const INTENT_SHORTCUTS = [
  { icon: UtensilsCrossed, label: 'Order Food',    sub: 'Delivered hot & fast',   iconColor: 'text-orange-400', iconBg: 'bg-orange-400/15', border: 'border-orange-400/20 hover:border-orange-400/40 hover:bg-orange-400/8' },
  { icon: Scissors,        label: 'Book a Salon',  sub: 'Ease into your look',     iconColor: 'text-violet-400', iconBg: 'bg-violet-400/15', border: 'border-violet-400/20 hover:border-violet-400/40 hover:bg-violet-400/8' },
  { icon: Stethoscope,     label: 'Find a Doctor', sub: 'Book in 30 seconds',      iconColor: 'text-sky-400',    iconBg: 'bg-sky-400/15',    border: 'border-sky-400/20 hover:border-sky-400/40 hover:bg-sky-400/8' },
  { icon: Wrench,          label: 'Home Repair',   sub: 'Vetted technicians',      iconColor: 'text-amber-400',  iconBg: 'bg-amber-400/15',  border: 'border-amber-400/20 hover:border-amber-400/40 hover:bg-amber-400/8' },
];

const LISTINGS = [
  {
    name: 'Shahi Darbar Restaurant', type: 'North Indian · Mughlai',
    rating: 4.6, reviews: 482, meta: '28–35 min · ₹200 for two',
    tag: 'BESTSELLER', tagBg: 'bg-amber-400 text-zinc-900',
    gradFrom: 'from-orange-950', gradTo: 'to-red-950', emoji: '🍛',
    offer: '20% off above ₹299', offerBg: 'bg-rose-600',
  },
  {
    name: 'Glamour Studio', type: 'Unisex Salon',
    rating: 4.8, reviews: 237, meta: 'Walk-in · 9am–8pm · ₹500 avg',
    tag: 'TOP RATED', tagBg: 'bg-violet-500 text-white',
    gradFrom: 'from-violet-950', gradTo: 'to-slate-900', emoji: '✂️',
    offer: 'First visit 15% off', offerBg: 'bg-violet-600',
  },
  {
    name: 'Dr. Meena Gupta Clinic', type: 'General Physician',
    rating: 4.9, reviews: 341, meta: 'Available today · ₹300 consult',
    tag: 'VERIFIED', tagBg: 'bg-emerald-500 text-white',
    gradFrom: 'from-teal-950', gradTo: 'to-slate-900', emoji: '🏥',
    offer: null, offerBg: null,
  },
];

const STATS = [
  { value: '2,400+', label: 'Businesses' },
  { value: '16',     label: 'Verticals'  },
  { value: '28',     label: 'Districts'  },
  { value: '₹0',     label: 'Commission' },
];

const WHY_US = [
  { icon: ShieldCheck, color: 'text-emerald-400', bg: 'bg-emerald-400/10', title: 'Verified Partners',    desc: 'Every listing is manually checked and approved by our on-ground team before going live. Zero ghost profiles.' },
  { icon: Zap,         color: 'text-amber-400',   bg: 'bg-amber-400/10',   title: 'Instant Discovery',   desc: 'Find the right business in seconds. Book, call, or WhatsApp in one tap — no app download required.' },
  { icon: BadgeCheck,  color: 'text-sky-400',     bg: 'bg-sky-400/10',     title: 'Haryana-First Focus', desc: 'Purpose-built for Tier-2 and Tier-3 cities. Fully bilingual, local pricing, and local trust baked in.' },
];

// ─── DESKTOP LANDING ──────────────────────────────────────────────────────────

function DesktopLanding() {
  const [query, setQuery] = useState('');
  const [showAll, setShowAll] = useState(false);
  const cats = showAll ? VERTICALS : VERTICALS.slice(0, 8);

  return (
    <div className="min-h-screen bg-slate-950 text-white">

      {/* NAV */}
      <nav className="sticky top-0 z-50 border-b border-white/5 bg-slate-950/90 backdrop-blur-xl">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-6">
          <div className="flex items-center gap-2.5 shrink-0">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
              <Target className="w-5 h-5 text-white" />
            </div>
            <span className="text-lg font-black tracking-tight">NearByBazar</span>
          </div>

          <div className="hidden md:flex items-center gap-1">
            {['Explore', 'Categories', 'For Business', 'Blog'].map(l => (
              <button key={l} className="px-4 py-2 rounded-lg text-sm font-semibold text-slate-400 hover:text-white hover:bg-white/5 transition-colors">
                {l}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-3 shrink-0">
            <div className="flex items-center gap-0.5 bg-white/5 rounded-lg p-0.5 text-xs font-black border border-white/5">
              <button className="px-2.5 py-1 rounded-md bg-white/10 text-white">EN</button>
              <button className="px-2.5 py-1 rounded-md text-slate-400 hover:text-white transition-colors">हि</button>
            </div>
            <button className="text-sm font-semibold text-slate-300 hover:text-white transition-colors px-3 py-2">Sign In</button>
            <button className="bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-900 font-black text-sm px-5 py-2 rounded-xl transition-all shadow-lg shadow-emerald-500/20">
              List Business Free
            </button>
          </div>
        </div>
      </nav>

      {/* HERO */}
      <section className="relative overflow-hidden">
        {/* Glow blobs */}
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 left-1/4 w-[700px] h-[700px] rounded-full bg-emerald-500/6 blur-3xl" />
          <div className="absolute top-20 right-0 w-[500px] h-[500px] rounded-full bg-violet-500/5 blur-3xl" />
          <div className="absolute bottom-0 inset-x-0 h-48 bg-gradient-to-t from-slate-950 to-transparent" />
        </div>

        <div className="relative max-w-7xl mx-auto px-6 pt-20 pb-32">
          {/* Eyebrow */}
          <div className="inline-flex items-center gap-2 bg-emerald-500/10 border border-emerald-500/20 rounded-full px-4 py-1.5 text-sm font-semibold text-emerald-400 mb-6">
            <Zap className="w-3.5 h-3.5" />
            Haryana&apos;s #1 Hyperlocal Marketplace
          </div>

          {/* Headline */}
          <h1 className="text-[68px] font-black tracking-tight leading-[1.03] mb-5">
            Everything local,
            <br />
            <span className="bg-gradient-to-r from-emerald-400 to-teal-300 bg-clip-text text-transparent">
              one tap away.
            </span>
          </h1>

          <p className="text-lg text-slate-400 font-medium max-w-xl mb-10 leading-relaxed">
            Discover, book, and order from 2,400+ verified businesses in your district —
            restaurants, salons, doctors, repairs &amp; more.
          </p>

          {/* Search */}
          <div className="flex items-center max-w-2xl bg-slate-800/80 rounded-2xl border border-white/8 shadow-2xl shadow-black/50 p-1.5 mb-6 backdrop-blur-sm">
            <button className="flex items-center gap-2 shrink-0 bg-slate-700/60 hover:bg-slate-700 rounded-xl px-4 py-2.5 border border-white/5 transition-colors">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-sm font-bold">Hisar</span>
              <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
            </button>
            <div className="w-px h-8 bg-white/8 mx-2 shrink-0" />
            <div className="flex flex-1 items-center gap-3 px-2">
              <Search className="w-4 h-4 text-slate-500 shrink-0" />
              <input
                type="text"
                placeholder="Search restaurants, salons, doctors..."
                value={query}
                onChange={e => setQuery(e.target.value)}
                className="flex-1 bg-transparent text-sm font-medium placeholder-slate-500 outline-none"
              />
            </div>
            <button className="shrink-0 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-900 font-black text-sm px-6 py-2.5 rounded-xl transition-all shadow-lg shadow-emerald-500/20">
              Search
            </button>
          </div>

          {/* Trust strip */}
          <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm font-medium text-slate-500">
            <span className="flex items-center gap-1.5 text-slate-400"><ShieldCheck className="w-4 h-4 text-emerald-400" /> 2,400+ Verified Businesses</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="flex items-center gap-1.5"><Zap className="w-4 h-4 text-amber-400" /> Instant WhatsApp Connect</span>
            <span className="w-1 h-1 rounded-full bg-slate-700" />
            <span className="flex items-center gap-1.5"><BadgeCheck className="w-4 h-4 text-sky-400" /> ₹0 Commission</span>
          </div>
        </div>

        {/* Intent shortcuts – float above hero bottom */}
        <div className="relative max-w-7xl mx-auto px-6 -mt-16 z-10">
          <div className="grid grid-cols-4 gap-4">
            {INTENT_SHORTCUTS.map((item, i) => {
              const Icon = item.icon;
              return (
                <button
                  key={i}
                  className={`group flex items-center gap-3 p-4 rounded-2xl bg-slate-900 border transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 text-left ${item.border}`}
                >
                  <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${item.iconBg}`}>
                    <Icon className={`w-5 h-5 ${item.iconColor}`} />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white">{item.label}</p>
                    <p className="text-xs text-slate-500 font-medium">{item.sub}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* STATS */}
      <div className="border-y border-white/5 bg-slate-900/40 mt-12">
        <div className="max-w-7xl mx-auto px-6 py-6 grid grid-cols-4 gap-6 divide-x divide-white/5">
          {STATS.map((s, i) => (
            <div key={i} className="text-center px-6 first:pl-0 last:pr-0">
              <p className="text-3xl font-black text-white mb-0.5">{s.value}</p>
              <p className="text-sm font-medium text-slate-500">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* CATEGORIES */}
      <section className="max-w-7xl mx-auto px-6 py-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Browse Categories</h2>
            <p className="text-slate-500 font-medium mt-1">16 verticals across Haryana</p>
          </div>
          <button className="flex items-center gap-1 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
            View all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-4 gap-3">
          {cats.map((cat, i) => {
            const Icon = cat.icon;
            return (
              <button
                key={i}
                className="group flex items-center gap-3 p-4 rounded-2xl bg-slate-900 border border-white/5 hover:border-white/12 hover:bg-slate-800/80 transition-all duration-200 hover:-translate-y-0.5 text-left"
              >
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${cat.accentBg} border ${cat.accentBorder}`}>
                  <Icon className={`w-5 h-5 ${cat.accent}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-sm font-black text-white leading-snug truncate">{cat.label}</p>
                  <p className="text-xs text-slate-600 font-medium">{cat.count} listed</p>
                </div>
              </button>
            );
          })}
        </div>

        {!showAll && (
          <div className="mt-4 text-center">
            <button
              onClick={() => setShowAll(true)}
              className="text-sm font-bold text-slate-400 hover:text-white border border-white/10 hover:border-white/20 rounded-xl px-6 py-2.5 transition-all hover:bg-white/5"
            >
              Show all 16 categories ↓
            </button>
          </div>
        )}
      </section>

      {/* FEATURED LISTINGS */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="flex items-end justify-between mb-8">
          <div>
            <h2 className="text-3xl font-black tracking-tight">Popular in Hisar</h2>
            <p className="text-slate-500 font-medium mt-1">Top-rated businesses this week</p>
          </div>
          <button className="flex items-center gap-1 text-sm font-bold text-emerald-400 hover:text-emerald-300 transition-colors">
            See all <ArrowRight className="w-4 h-4" />
          </button>
        </div>

        <div className="grid grid-cols-3 gap-5">
          {LISTINGS.map((l, i) => (
            <div
              key={i}
              className="group rounded-2xl overflow-hidden bg-slate-900 border border-white/5 hover:border-white/10 transition-all duration-200 hover:-translate-y-1 hover:shadow-xl hover:shadow-black/40 cursor-pointer"
            >
              <div className={`relative h-44 bg-gradient-to-br ${l.gradFrom} ${l.gradTo} flex items-center justify-center`}>
                <span className="text-5xl">{l.emoji}</span>
                <div className={`absolute top-3 left-3 text-[10px] font-black tracking-wider px-2.5 py-1 rounded-lg ${l.tagBg}`}>
                  {l.tag}
                </div>
                <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm rounded-lg px-2 py-1 flex items-center gap-1">
                  <BadgeCheck className="w-3 h-3 text-emerald-400" />
                  <span className="text-[10px] text-white font-bold">Verified</span>
                </div>
                {l.offer && (
                  <div className={`absolute bottom-0 left-0 right-0 ${l.offerBg} text-white text-xs font-bold px-3 py-1.5`}>
                    🏷 {l.offer}
                  </div>
                )}
              </div>

              <div className="p-4">
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div className="min-w-0">
                    <h3 className="font-black text-white text-base leading-snug truncate">{l.name}</h3>
                    <p className="text-xs text-slate-500 font-medium mt-0.5">{l.type}</p>
                  </div>
                  <div className="flex items-center gap-1 shrink-0 bg-emerald-500/10 border border-emerald-500/20 rounded-lg px-2 py-1">
                    <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                    <span className="text-xs font-black text-emerald-400">{l.rating}</span>
                    <span className="text-[10px] text-slate-600">({l.reviews})</span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 font-medium mb-3">{l.meta}</p>
                <button className="w-full text-sm font-black text-emerald-400 hover:text-emerald-300 border border-emerald-400/20 hover:border-emerald-400/40 hover:bg-emerald-400/5 rounded-xl py-2.5 transition-all">
                  View Details
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* DUAL CTA */}
      <section className="max-w-7xl mx-auto px-6 pb-16">
        <div className="grid grid-cols-2 gap-4">
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-emerald-900/60 to-teal-950/60 border border-emerald-500/20 p-8">
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-emerald-400/8 rounded-full blur-3xl" />
            <Store className="w-10 h-10 text-emerald-400 mb-4" />
            <h3 className="text-2xl font-black mb-2">List your business — free</h3>
            <p className="text-slate-400 font-medium text-sm mb-6 leading-relaxed">
              Get discovered by thousands of local customers. No setup fee, no commission, zero risk.
            </p>
            <button className="inline-flex items-center gap-2 bg-emerald-500 hover:bg-emerald-400 active:scale-95 text-zinc-900 font-black text-sm px-6 py-3 rounded-xl transition-all shadow-lg shadow-emerald-500/25">
              Start for free <ArrowRight className="w-4 h-4" />
            </button>
          </div>
          <div className="relative overflow-hidden rounded-2xl bg-slate-900 border border-white/8 p-8">
            <div className="absolute -top-16 -right-16 w-40 h-40 bg-violet-400/5 rounded-full blur-3xl" />
            <Smartphone className="w-10 h-10 text-violet-400 mb-4" />
            <h3 className="text-2xl font-black mb-2">Get your own ordering app</h3>
            <p className="text-slate-400 font-medium text-sm mb-6 leading-relaxed">
              Upgrade your listing to a full storefront with ordering, bookings, and your own PWA link.
            </p>
            <button className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white font-black text-sm px-6 py-3 rounded-xl border border-white/10 hover:border-white/20 transition-all">
              Learn more <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* WHY US */}
      <section className="border-t border-white/5 bg-slate-900/30">
        <div className="max-w-7xl mx-auto px-6 py-16">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black mb-2">Why NearByBazar?</h2>
            <p className="text-slate-500 font-medium">Built for Bharat — not borrowed from the West.</p>
          </div>
          <div className="grid grid-cols-3 gap-6">
            {WHY_US.map((f, i) => {
              const Icon = f.icon;
              return (
                <div key={i} className="p-6 rounded-2xl bg-slate-900 border border-white/5">
                  <div className={`w-12 h-12 rounded-xl ${f.bg} flex items-center justify-center mb-4`}>
                    <Icon className={`w-6 h-6 ${f.color}`} />
                  </div>
                  <h3 className="text-lg font-black mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400 font-medium leading-relaxed">{f.desc}</p>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="border-t border-white/5 bg-slate-950">
        <div className="max-w-7xl mx-auto px-6 py-10 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Target className="w-4 h-4 text-white" />
            </div>
            <span className="font-black">NearByBazar</span>
          </div>
          <p className="text-sm text-slate-600 font-medium">© 2026 NearByBazar · Hyperlocal · Haryana-first.</p>
          <div className="flex items-center gap-5 text-sm font-medium text-slate-500">
            {['Privacy', 'Terms', 'Contact', 'Blog'].map(l => (
              <button key={l} className="hover:text-white transition-colors">{l}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}

// ─── MOBILE LANDING ───────────────────────────────────────────────────────────

function MobileLanding() {
  const [query, setQuery] = useState('');

  return (
    <div className="flex flex-col h-full bg-slate-950 text-white">
      {/* Scrollable content */}
      <div className="flex-1 overflow-y-auto">
        {/* Mock status bar */}
        <div className="flex items-center justify-between px-5 pt-10 pb-2 text-[11px] font-bold text-slate-400">
          <span>9:41</span>
          <div className="flex items-center gap-1.5">
            <div className="flex gap-0.5 items-end">
              {[3, 5, 7, 9, 9].map((h, i) => (
                <div key={i} className="w-[3px] bg-slate-400 rounded-sm" style={{ height: h }} />
              ))}
            </div>
            <span>5G</span>
            <div className="relative w-6 h-3 rounded-sm border border-slate-400">
              <div className="absolute left-0.5 top-0.5 bottom-0.5 right-1.5 bg-slate-400 rounded-sm" />
            </div>
          </div>
        </div>

        {/* Top Nav */}
        <div className="flex items-center justify-between px-4 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
              <Target className="w-3.5 h-3.5 text-white" />
            </div>
            <span className="font-black text-sm">NearByBazar</span>
          </div>
          <div className="flex items-center gap-2">
            <button className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
              <Bell className="w-4 h-4 text-slate-400" />
            </button>
            <button className="w-8 h-8 rounded-xl bg-white/5 flex items-center justify-center">
              <User className="w-4 h-4 text-slate-400" />
            </button>
          </div>
        </div>

        {/* Location pill */}
        <div className="px-4 mb-3">
          <button className="flex items-center gap-1.5 bg-white/5 border border-white/8 rounded-xl px-3 py-1.5">
            <MapPin className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-sm font-bold">Hisar, Haryana</span>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
          </button>
        </div>

        {/* Hero */}
        <div className="px-4 mb-5">
          <h1 className="text-2xl font-black leading-tight mb-1">
            What are you looking for <span className="text-emerald-400">today?</span>
          </h1>
          <p className="text-xs text-slate-500 font-medium mb-3">2,400+ local businesses near you</p>
          <div className="flex items-center gap-2 bg-slate-800/80 rounded-xl border border-white/8 p-2">
            <Search className="w-4 h-4 text-slate-500 ml-1 shrink-0" />
            <input
              placeholder="Restaurants, salons, doctors..."
              value={query}
              onChange={e => setQuery(e.target.value)}
              className="flex-1 bg-transparent text-sm font-medium placeholder-slate-500 outline-none"
            />
            <button className="bg-emerald-500 text-zinc-900 font-black text-xs px-3 py-1.5 rounded-lg shrink-0">
              Go
            </button>
          </div>
        </div>

        {/* Intent grid */}
        <div className="px-4 mb-5">
          <div className="grid grid-cols-4 gap-2">
            {INTENT_SHORTCUTS.map((item, i) => {
              const Icon = item.icon;
              return (
                <button key={i} className="flex flex-col items-center gap-1.5 p-2.5 rounded-xl bg-slate-900 border border-white/5 active:scale-95 transition-transform">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${item.iconBg}`}>
                    <Icon className={`w-4 h-4 ${item.iconColor}`} />
                  </div>
                  <span className="text-[10px] font-bold text-center leading-tight">{item.label.split(' ')[0]}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Category horizontal scroll */}
        <div className="mb-5">
          <div className="flex items-center justify-between px-4 mb-3">
            <h2 className="text-sm font-black">Categories</h2>
            <button className="text-xs font-bold text-emerald-400">See all</button>
          </div>
          <div className="flex gap-3 overflow-x-auto pl-4 pr-4 hide-scrollbar pb-1">
            {VERTICALS.slice(0, 10).map((cat, i) => {
              const Icon = cat.icon;
              return (
                <button key={i} className="shrink-0 flex flex-col items-center gap-1.5 w-14">
                  <div className={`w-12 h-12 rounded-2xl ${cat.accentBg} border ${cat.accentBorder} flex items-center justify-center`}>
                    <Icon className={`w-5 h-5 ${cat.accent}`} />
                  </div>
                  <span className="text-[9px] font-bold text-slate-400 text-center leading-tight">
                    {cat.label.split(' ')[0]}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Featured listings */}
        <div className="px-4 pb-4">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-black">⭐ Popular in Hisar</h2>
            <button className="text-xs font-bold text-emerald-400">See all</button>
          </div>
          <div className="space-y-3">
            {LISTINGS.map((l, i) => (
              <div key={i} className="flex gap-3 p-3 rounded-2xl bg-slate-900 border border-white/5 active:bg-slate-800 transition-colors">
                <div className={`w-16 h-16 rounded-xl bg-gradient-to-br ${l.gradFrom} ${l.gradTo} flex items-center justify-center shrink-0 text-2xl`}>
                  {l.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-1 mb-0.5">
                    <p className="text-sm font-black truncate">{l.name}</p>
                    <div className="flex items-center gap-0.5 shrink-0">
                      <Star className="w-3 h-3 fill-emerald-400 text-emerald-400" />
                      <span className="text-xs font-black text-emerald-400">{l.rating}</span>
                    </div>
                  </div>
                  <p className="text-[11px] text-slate-500 font-medium">{l.type}</p>
                  <p className="text-[11px] text-slate-600 mt-0.5">{l.meta}</p>
                  {l.offer && (
                    <span className="inline-flex text-[10px] font-bold text-rose-400 bg-rose-400/10 rounded-md px-1.5 py-0.5 mt-1">
                      🏷 {l.offer}
                    </span>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Nav – outside scroll, pinned to flex-col bottom */}
      <div className="shrink-0 bg-slate-900/95 backdrop-blur-xl border-t border-white/5 flex items-center justify-around px-2 pt-2 pb-4">
        {[
          { icon: Home,     label: 'Home',     active: true  },
          { icon: Compass,  label: 'Explore',  active: false },
          { icon: Calendar, label: 'Bookings', active: false },
          { icon: Bookmark, label: 'Saved',    active: false },
          { icon: User,     label: 'Profile',  active: false },
        ].map((tab, i) => {
          const Icon = tab.icon;
          return (
            <button key={i} className="flex flex-col items-center gap-1 px-3 py-1">
              <Icon className={`w-5 h-5 ${tab.active ? 'text-emerald-400' : 'text-slate-500'}`} />
              <span className={`text-[10px] font-bold ${tab.active ? 'text-emerald-400' : 'text-slate-500'}`}>{tab.label}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

// ─── PHONE FRAME ─────────────────────────────────────────────────────────────

function PhoneFrame({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="relative rounded-[52px] border-[6px] border-slate-700 shadow-2xl shadow-black/70 overflow-hidden bg-slate-950"
      style={{ width: 390, height: 812 }}
    >
      {/* Notch */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-28 h-6 bg-slate-900 rounded-b-3xl z-20" />
      {/* Home indicator */}
      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 w-28 h-1 bg-white/20 rounded-full z-20" />
      {/* Content fills the full frame */}
      <div className="h-full">
        {children}
      </div>
    </div>
  );
}

// ─── PREVIEW PAGE ─────────────────────────────────────────────────────────────

export default function LandingPreview() {
  const [mode, setMode] = useState<'desktop' | 'mobile'>('desktop');

  return (
    <div className="min-h-screen">
      {/* Preview banner */}
      <div className="sticky top-0 z-[200] bg-zinc-900/95 backdrop-blur-xl border-b border-white/8 px-6 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse shrink-0" />
          <span className="text-sm font-black text-white">Design Preview</span>
          <span className="text-xs font-medium text-zinc-500 hidden sm:block">
            NearByBazar v2.0 · Landing Page · For visual approval — no production impact
          </span>
        </div>
        <div className="flex items-center bg-zinc-800 rounded-xl p-0.5 gap-0.5 border border-white/5">
          <button
            onClick={() => setMode('desktop')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === 'desktop' ? 'bg-white text-zinc-900 shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Monitor className="w-4 h-4" />
            Desktop
          </button>
          <button
            onClick={() => setMode('mobile')}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-bold transition-all ${
              mode === 'mobile' ? 'bg-white text-zinc-900 shadow' : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            Mobile PWA
          </button>
        </div>
      </div>

      {/* Content */}
      {mode === 'desktop' ? (
        <DesktopLanding />
      ) : (
        <div className="min-h-screen bg-zinc-950 flex flex-col items-center py-10 gap-4">
          <p className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
            iPhone 14 Pro · 390 × 812 · Scroll inside the frame
          </p>
          <PhoneFrame>
            <MobileLanding />
          </PhoneFrame>
          <p className="text-xs text-zinc-700 font-medium">
            ↑ Drag to scroll inside the phone frame
          </p>
        </div>
      )}
    </div>
  );
}
