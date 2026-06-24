'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Compass, ShoppingBag, Store, ShieldCheck, Heart, Award, ArrowRight } from 'lucide-react';

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans overflow-hidden">
      {/* Decorative Blur Glows */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-emerald-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-40 right-1/4 w-96 h-96 bg-cyan-500/10 rounded-full blur-[120px] pointer-events-none" />

      {/* ─── HERO SECTION ─── */}
      <section className="relative max-w-6xl mx-auto px-6 pt-24 pb-16 text-center space-y-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-xs font-bold text-emerald-400">
          <Compass className="w-3.5 h-3.5" />
          Our Mission
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-black tracking-tight max-w-4xl mx-auto leading-[1.1] text-white">
          Empowering Local Merchants. <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400">
            Connecting Communities.
          </span>
        </h1>
        
        <p className="text-base sm:text-lg text-zinc-400 max-w-2xl mx-auto font-medium leading-relaxed">
          NearByBazar is northern India's premier commission-free hyperlocal discovery engine, designed specifically to digitize neighborhoods and scale small business visibility.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-4 pt-4">
          <Link href="/explore">
            <Button className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black px-8 h-12 rounded-xl shadow-lg shadow-emerald-500/10 active:scale-97 transition-all">
              Explore Shops Nearby
            </Button>
          </Link>
          <Link href="/vendor/register">
            <Button className="bg-zinc-900 hover:bg-zinc-850 text-white border border-zinc-800 font-bold px-8 h-12 rounded-xl transition-all">
              Register Storefront
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── STATS SECTION ─── */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {[
            { value: "9+", label: "Active Districts", desc: "Punjab & Haryana coverage" },
            { value: "3.3K+", label: "Verified Partners", desc: "Local shops & professionals" },
            { value: "0%", label: "Platform Commission", desc: "Keep 100% of your earnings" },
            { value: "100%", label: "Direct Checkout", desc: "Buyers pay sellers directly" }
          ].map((stat, i) => (
            <div key={i} className="bg-zinc-900/40 border border-zinc-900 rounded-2xl p-6 text-center backdrop-blur-md">
              <span className="block text-4xl sm:text-5xl font-black text-white bg-clip-text bg-gradient-to-br from-white to-zinc-400">
                {stat.value}
              </span>
              <span className="block text-xs sm:text-sm font-black uppercase text-emerald-400 tracking-wider mt-2">
                {stat.label}
              </span>
              <span className="block text-[10px] sm:text-xs text-zinc-500 font-semibold mt-1">
                {stat.desc}
              </span>
            </div>
          ))}
        </div>
      </section>

      {/* ─── WHAT WE BUILD ─── */}
      <section className="max-w-6xl mx-auto px-6 py-16 grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
        <div className="space-y-6">
          <h2 className="text-3xl font-extrabold text-white tracking-tight">
            Why we built <span className="text-emerald-400">NearByBazar</span>
          </h2>
          <p className="text-sm text-zinc-400 font-medium leading-relaxed">
            Traditionally, small-town merchants in India are left behind in the digital marketplace race. High aggregator commissions (often up to 30%) eat away at thin local margins, while complex delivery chains distance businesses from their customer base.
          </p>
          <p className="text-sm text-zinc-400 font-medium leading-relaxed">
            We created a direct-to-consumer discovery platform that connects users with nearby vendors without middlemen. Whether you are searching for a plate of Chole Bhature, daily groceries, or scheduling an appointment at a local salon, NearByBazar helps you locate them and connect with them instantly.
          </p>
          
          <div className="space-y-4 pt-2">
            {[
              { icon: Store, title: "Custom App Builder", desc: "Vendors configure and launch custom templates specific to their vertical." },
              { icon: ShieldCheck, title: "Verified Badging", desc: "Browse confidence-grade listings with verified ratings and phone info." },
              { icon: ShoppingBag, title: "Zero Commissions", desc: "No booking fees, order cuts, or transaction handling tariffs." }
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <span className="w-10 h-10 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center text-emerald-400 shrink-0">
                  <item.icon className="w-5 h-5" />
                </span>
                <div>
                  <h4 className="font-extrabold text-sm text-white">{item.title}</h4>
                  <p className="text-xs text-zinc-550 font-semibold">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Visual Mockups Column */}
        <div className="relative rounded-3xl bg-zinc-900/60 border border-zinc-900 p-8 overflow-hidden space-y-6">
          <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          
          <div className="space-y-1">
            <span className="text-[10px] font-black uppercase text-emerald-400 tracking-widest">Platform Core Values</span>
            <h3 className="text-xl font-extrabold text-white">How it benefits you</h3>
          </div>

          <div className="space-y-4">
            {[
              { role: "For Customers", points: ["Search menus, catalogs, and schedules easily.", "Interactive radar proximity map to locate shops.", "Direct support via phone & WhatsApp channels."] },
              { role: "For Local Merchants", points: ["Get discovered by thousands of local customers.", "Manage offerings and appointment calendars.", "Dual profiles to switch context instantly."] }
            ].map((box, i) => (
              <div key={i} className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-920 space-y-2">
                <h4 className="text-xs font-black uppercase text-white flex items-center gap-1.5">
                  <Award className="w-3.5 h-3.5 text-emerald-400" />
                  {box.role}
                </h4>
                <ul className="space-y-1.5 text-xs text-zinc-400 font-semibold list-disc list-inside">
                  {box.points.map((p, k) => <li key={k}>{p}</li>)}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── CALL TO ACTION ─── */}
      <section className="max-w-4xl mx-auto px-6 py-20 text-center">
        <div className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-900 rounded-3xl p-8 sm:p-12 space-y-6 relative overflow-hidden shadow-2xl">
          <div className="absolute -bottom-20 -left-20 w-60 h-60 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
          
          <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
            Ready to list your business?
          </h2>
          <p className="text-sm text-zinc-400 max-w-lg mx-auto font-semibold">
            Onboard your restaurant, retail store, or service catalog in less than 5 minutes and customize your storefront template today.
          </p>
          
          <div className="pt-4">
            <Link href="/vendor/register">
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black px-8 h-12 rounded-xl shadow-lg shadow-emerald-500/10 active:scale-97 transition-all inline-flex items-center gap-2">
                Get Started Now
                <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
