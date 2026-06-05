'use client';

import Link from 'next/link';
import { ArrowRight, Sparkles, TrendingUp, ShieldCheck, Zap, MessageSquare } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ProLandingPage() {
  return (
    <div className="min-h-screen bg-zinc-950 text-white font-sans selection:bg-primary/30">
      
      {/* ─── NAVBAR ─── */}
      <nav className="flex items-center justify-between px-6 lg:px-12 py-6 absolute top-0 left-0 w-full z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-gradient-to-br from-primary to-primary-focus rounded-lg flex items-center justify-center shadow-lg shadow-primary/20">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight">NearByBazar <span className="text-primary">Pro</span></span>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/vendor/login">
            <Button variant="ghost" className="text-zinc-300 hover:text-white hover:bg-zinc-800 font-bold hidden sm:flex">
              Log in to Vendor OS
            </Button>
          </Link>
          <Link href="/vendor/register">
            <Button className="bg-primary hover:bg-primary-focus text-white font-bold rounded-full px-6 shadow-lg shadow-primary/20">
              Become a Pro
            </Button>
          </Link>
        </div>
      </nav>

      {/* ─── HERO SECTION ─── */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 px-6 lg:px-12 overflow-hidden flex flex-col items-center text-center">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-xs font-bold text-zinc-300 mb-8 z-10">
          <span className="flex h-2 w-2 relative">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Now accepting new pros in your city
        </div>

        <h1 className="text-5xl lg:text-7xl font-black tracking-tight mb-6 max-w-4xl z-10 leading-[1.1]">
          Grow your service business with <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-400">Zero Commission.</span>
        </h1>
        
        <p className="text-lg lg:text-xl text-zinc-400 max-w-2xl mb-10 z-10">
          Join thousands of top-rated professionals getting direct leads, instant WhatsApp notifications, and advanced tools to scale their business—all without paying a cut.
        </p>

        <div className="flex flex-col sm:flex-row items-center gap-4 z-10 w-full sm:w-auto">
          <Link href="/vendor/register" className="w-full sm:w-auto">
            <Button className="w-full sm:w-auto h-14 px-8 text-lg font-bold bg-white text-zinc-950 hover:bg-zinc-100 rounded-full shadow-xl">
              Start Earning Today <ArrowRight className="ml-2 w-5 h-5" />
            </Button>
          </Link>
          <Link href="/vendor/login" className="w-full sm:w-auto">
            <Button variant="outline" className="w-full sm:w-auto h-14 px-8 text-lg font-bold border-zinc-700 text-zinc-300 hover:text-white hover:bg-zinc-800 rounded-full">
              Sign in to Vendor OS
            </Button>
          </Link>
        </div>
      </section>

      {/* ─── FEATURES GRID ─── */}
      <section className="py-24 px-6 lg:px-12 bg-zinc-900/50 border-t border-zinc-800/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-black mb-4">Why Pros choose NearBy Bazar</h2>
            <p className="text-zinc-400">Everything you need to manage and scale your local services.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group">
              <div className="w-12 h-12 bg-emerald-500/10 text-emerald-500 rounded-xl flex items-center justify-center mb-6">
                <TrendingUp className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">0% Commission Fees</h3>
              <p className="text-zinc-400 leading-relaxed">
                Keep 100% of what you earn. We never take a cut of your hard work. Subscriptions coming soon for premium placement.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group">
              <div className="w-12 h-12 bg-indigo-500/10 text-indigo-500 rounded-xl flex items-center justify-center mb-6">
                <MessageSquare className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Direct WhatsApp Dispatch</h3>
              <p className="text-zinc-400 leading-relaxed">
                No complex apps to check. Get direct messages to your WhatsApp the second a customer requests your service.
              </p>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 p-8 rounded-3xl relative overflow-hidden group">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center mb-6">
                <Zap className="w-6 h-6" />
              </div>
              <h3 className="text-xl font-bold mb-3">Vendor OS Command Center</h3>
              <p className="text-zinc-400 leading-relaxed">
                Access a high-performance Kanban dashboard to track leads, pause services instantly, and monitor your total revenue.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-32 px-6 lg:px-12 text-center">
        <div className="max-w-3xl mx-auto bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800 rounded-3xl p-12 relative overflow-hidden">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-1 bg-gradient-to-r from-transparent via-primary to-transparent" />
          <h2 className="text-4xl font-black mb-6">Ready to upgrade your business?</h2>
          <p className="text-zinc-400 text-lg mb-8">
            Registration takes less than 2 minutes. Get verified and start receiving jobs today.
          </p>
          <Link href="/vendor/register">
            <Button className="h-14 px-10 text-lg font-bold bg-primary hover:bg-primary-focus text-white rounded-full shadow-lg shadow-primary/20">
              Create Pro Account Now
            </Button>
          </Link>
        </div>
      </section>
      
    </div>
  );
}
