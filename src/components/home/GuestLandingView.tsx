'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { 
  Search, 
  ShieldCheck, 
  CheckCircle2,
  Building,
  Car,
  Scissors,
  Wrench,
  ChevronRight,
  MapPin,
  ArrowRight,
  Shield,
  Zap,
  Phone,
  Check
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { AuthModal } from '@/components/shared/AuthModal';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';

export function GuestLandingView() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/explore');
    }
  };

  const featuredCategories = [
    { id: 'electrician', name: 'Electricians & Plumbers', icon: Wrench },
    { id: 'car-rental', name: 'Car Rentals', icon: Car },
    { id: 'salon-booking', name: 'Salon & Beauty', icon: Scissors },
    { id: 'real-estate', name: 'Real Estate Agents', icon: Building }
  ];

  const steps = [
    { title: 'Search Local Pros', desc: 'Find trusted professionals in your area.', icon: Search },
    { title: 'Compare Profiles', desc: 'Check reviews and verified IDs.', icon: ShieldCheck },
    { title: 'Connect directly', desc: 'Chat instantly via WhatsApp. Zero fees.', icon: Phone }
  ];

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-blue-500/30">
      
      <main>
        {/* ─── HERO SECTION (Clean & Corporate) ─── */}
        <section className="bg-slate-50 border-b border-slate-200">
          <div className="max-w-6xl mx-auto px-6 pt-12 pb-20 lg:pt-16 lg:pb-32 flex flex-col items-center text-center space-y-8">
            <div className="inline-flex items-center gap-2 bg-blue-50 border border-blue-100 text-blue-700 px-4 py-1.5 rounded-full text-xs font-bold tracking-wide">
              <Shield className="w-4 h-4" /> 100% Govt. ID Verified Pros
            </div>
            
            <h1 className="text-4xl md:text-6xl font-black text-slate-900 tracking-tight max-w-4xl leading-tight">
              The smartest way to hire <span className="text-blue-600">local professionals.</span>
            </h1>
            
            <p className="text-lg text-slate-600 font-medium max-w-2xl">
              Connect directly with verified experts in your city. <span className="font-bold text-slate-900">₹0 Brokerage & 0% Commission.</span> Keep 100% of your peace of mind.
            </p>

            <form onSubmit={handleSearchSubmit} className="w-full max-w-2xl mt-8 flex flex-col sm:flex-row gap-3 bg-white p-3 rounded-2xl shadow-xl shadow-slate-200/50 border border-slate-100">
              <div className="flex-1 flex items-center px-4">
                <Search className="w-5 h-5 text-slate-400 mr-3" />
                <input 
                  type="text"
                  placeholder="What service do you need?"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full h-12 outline-none text-slate-900 font-medium placeholder-slate-400 bg-transparent"
                />
              </div>
              <Button type="submit" className="h-12 px-8 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-md shadow-blue-500/20">
                Search
              </Button>
            </form>

            <div className="flex flex-wrap justify-center gap-6 mt-8 pt-4">
              <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> ₹0 Brokerage
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <Zap className="w-4 h-4 text-amber-500" /> Instant WhatsApp Connect
              </div>
              <div className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <ShieldCheck className="w-4 h-4 text-blue-500" /> Secure & Verified
              </div>
            </div>
          </div>
        </section>

        {/* ─── HOW IT WORKS (Consumers) ─── */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6">
            <div className="text-center space-y-4 mb-16">
              <h2 className="text-3xl font-black text-slate-900">How NearBy Bazar Works</h2>
              <p className="text-slate-500 font-medium">Three simple steps to get your job done right.</p>
            </div>

            <div className="grid md:grid-cols-3 gap-12 text-center">
              {steps.map((step, idx) => (
                <div key={idx} className="space-y-4 flex flex-col items-center">
                  <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center text-blue-600 border border-blue-100 shadow-sm">
                    <step.icon className="w-8 h-8" />
                  </div>
                  <h3 className="text-xl font-extrabold text-slate-900">{step.title}</h3>
                  <p className="text-slate-500 font-medium max-w-xs">{step.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ─── FEATURED CATEGORIES ─── */}
        <section className="py-24 bg-slate-50 border-y border-slate-200">
          <div className="max-w-6xl mx-auto px-6">
            <div className="flex justify-between items-end mb-12">
              <div className="space-y-2">
                <h2 className="text-3xl font-black text-slate-900">Explore Services</h2>
                <p className="text-slate-500 font-medium">Find exactly what you need in your neighborhood.</p>
              </div>
              <Button variant="ghost" className="hidden sm:flex font-bold text-blue-600 hover:text-blue-700" onClick={() => router.push('/explore')}>
                View All Categories <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
              {featuredCategories.map((cat) => (
                <div 
                  key={cat.id}
                  onClick={() => router.push('/explore')}
                  className="bg-white border border-slate-200 rounded-2xl p-6 cursor-pointer hover:shadow-lg hover:border-blue-200 transition-all flex flex-col items-center text-center space-y-4 group"
                >
                  <div className="w-12 h-12 bg-slate-50 rounded-xl flex items-center justify-center text-slate-700 group-hover:bg-blue-50 group-hover:text-blue-600 transition-colors">
                    <cat.icon className="w-6 h-6" />
                  </div>
                  <h3 className="font-extrabold text-slate-900 text-sm sm:text-base">{cat.name}</h3>
                </div>
              ))}
            </div>
            
            <Button variant="ghost" className="w-full mt-6 sm:hidden font-bold text-blue-600" onClick={() => router.push('/explore')}>
              View All Categories <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </section>

        {/* ─── THE VENDOR ADVANTAGE ─── */}
        <section className="py-24 bg-white">
          <div className="max-w-6xl mx-auto px-6 flex flex-col lg:flex-row items-center gap-16">
            <div className="flex-1 space-y-8">
              <div className="inline-flex items-center gap-2 bg-[#25D366]/10 text-[#25D366] px-4 py-1.5 rounded-full text-xs font-bold tracking-wide uppercase">
                For Service Providers
              </div>
              <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-tight">
                Grow your business with zero commission.
              </h2>
              <div className="space-y-4">
                {[
                  'Keep 100% of your earnings. No hidden fees.',
                  'Get direct leads straight to your WhatsApp.',
                  'Free professional digital catalog and booking dashboard.',
                  'Build trust with verified badges and authentic reviews.'
                ].map((benefit, i) => (
                  <div key={i} className="flex items-start gap-3">
                    <div className="w-6 h-6 rounded-full bg-emerald-100 flex items-center justify-center shrink-0 mt-0.5">
                      <Check className="w-3.5 h-3.5 text-emerald-600" />
                    </div>
                    <span className="text-slate-600 font-medium">{benefit}</span>
                  </div>
                ))}
              </div>
              <Button 
                onClick={() => router.push('/vendor/register')}
                className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-base shadow-lg"
              >
                Join as a Pro Today
              </Button>
            </div>
            <div className="flex-1 w-full bg-slate-100 rounded-3xl p-8 lg:p-12 border border-slate-200 shadow-inner flex items-center justify-center min-h-[400px]">
              {/* Abstract Representation of Vendor Dashboard */}
              <div className="w-full max-w-sm bg-white rounded-2xl shadow-xl overflow-hidden border border-slate-200">
                <div className="bg-slate-900 p-4 flex items-center justify-between">
                  <div className="font-black text-white text-lg">Vendor OS</div>
                  <div className="flex gap-1.5">
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                    <div className="w-2.5 h-2.5 rounded-full bg-slate-700" />
                  </div>
                </div>
                <div className="p-6 space-y-4">
                  <div className="h-8 w-1/2 bg-slate-100 rounded-md" />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="h-20 bg-slate-100 rounded-xl" />
                    <div className="h-20 bg-slate-100 rounded-xl" />
                  </div>
                  <div className="h-12 bg-[#25D366]/10 rounded-xl border border-[#25D366]/20 flex items-center px-4 gap-3">
                    <Phone className="w-5 h-5 text-[#25D366]" />
                    <div className="h-3 w-1/2 bg-[#25D366]/30 rounded" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── FOOTER CTA ─── */}
        <section className="py-24 bg-blue-600">
          <div className="max-w-4xl mx-auto px-6 text-center space-y-8">
            <h2 className="text-4xl md:text-5xl font-black text-white">Ready to simplify your life?</h2>
            <p className="text-blue-100 font-medium text-lg max-w-2xl mx-auto">
              Join thousands of locals who trust NearBy Bazar to find the best professionals in the city.
            </p>
            <Button 
              onClick={() => router.push('/login')}
              className="h-14 px-10 rounded-xl bg-white text-blue-600 hover:bg-slate-50 font-black text-lg shadow-xl shadow-blue-900/20"
            >
              Get Started for Free
            </Button>
          </div>
        </section>
      </main>
    </div>
  );
}
