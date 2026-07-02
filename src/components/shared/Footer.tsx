'use client';

import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { usePathname } from 'next/navigation';

export function Footer() {
  const pathname = usePathname();

  // Determine if we are on a client storefront (vCard) page.
  // Storefront subpaths or dashboard paths don't display the global footer.
  const segments = pathname.split('/').filter(Boolean);
  const isStorefront = segments.length === 1 && ![
    'explore', 'food', 'login', 'register', 'vendor', 
    'admin', 'vendor-dashboard', 'directory', 'pro', 
    'onboarding', 'profile', 'create-consumer-profile',
    'reset-password', 'forgot-password', 'sw-reset', 'claim', 'faq', 'about', 'contact'
  ].includes(segments[0]);

  if (isStorefront || pathname.startsWith('/vendor-dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  return (
    <footer className="bg-zinc-950 border-t border-zinc-900 text-zinc-100 pt-16 pb-8 px-6 md:px-12 lg:px-24 font-sans">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
        {/* Column 1: Brand & Description */}
        <div className="space-y-6">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-emerald-500 flex items-center justify-center font-black text-zinc-950 text-lg shadow-lg shadow-emerald-500/10">
              N
            </div>
            <span className="text-2xl font-black tracking-tight text-white">
              NearBy<span className="text-emerald-400">Bazar</span>
            </span>
          </div>
          
          <p className="text-xs text-zinc-400 font-semibold leading-relaxed">
            Connecting Punjab & Haryana communities to verified local dining, daily grocery essentials, top-tier beauty salons, and professional services. Instantly local, commission-free discovery.
          </p>

          <div className="flex items-center gap-3">
            {/* Facebook */}
            <Link href="https://facebook.com/nearbybazar" target="_blank" className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 hover:bg-zinc-850 flex items-center justify-center transition-all">
              <svg className="w-3.5 h-3.5 text-zinc-400 hover:text-emerald-400 fill-current" viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.469h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.469h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
            </Link>
            {/* Instagram */}
            <Link href="https://instagram.com/nearbybazar" target="_blank" className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 hover:bg-zinc-850 flex items-center justify-center transition-all">
              <svg className="w-3.5 h-3.5 text-zinc-400 hover:text-emerald-400 fill-current" viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/></svg>
            </Link>
            {/* LinkedIn */}
            <Link href="https://linkedin.com/company/nearbybazar" target="_blank" className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 hover:bg-zinc-850 flex items-center justify-center transition-all">
              <svg className="w-3.5 h-3.5 text-zinc-400 hover:text-emerald-400 fill-current" viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
            </Link>
            {/* X */}
            <Link href="https://x.com/nearbybazar" target="_blank" className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/40 hover:bg-zinc-850 flex items-center justify-center transition-all">
              <svg className="w-3.5 h-3.5 text-zinc-400 hover:text-emerald-400 fill-current" viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
            </Link>
          </div>
        </div>

        {/* Column 2: Local Verticals */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-sm uppercase text-white tracking-widest">Shop & Book</h4>
          <ul className="space-y-3.5 text-xs text-zinc-450 font-bold">
            <li>
              <Link href="/explore?businessType=FOOD_BEVERAGE" className="hover:text-emerald-400 transition-colors">
                🍽️ Food & Dining
              </Link>
            </li>
            <li>
              <Link href="/explore?businessType=GROCERY" className="hover:text-emerald-400 transition-colors">
                🛒 Grocery & Daily Needs
              </Link>
            </li>
            <li>
              <Link href="/explore?businessType=RETAIL" className="hover:text-emerald-400 transition-colors">
                🛍️ Shops & Retail
              </Link>
            </li>
            <li>
              <Link href="/explore?selectedCategory=salon-beauty" className="hover:text-emerald-400 transition-colors">
                💇 Salon & Beauty
              </Link>
            </li>
            <li>
              <Link href="/explore?selectedCategory=home-repair" className="hover:text-emerald-400 transition-colors">
                🔧 Home Repairs & Services
              </Link>
            </li>
            <li>
              <Link href="/explore?selectedCategory=health-medical" className="hover:text-emerald-400 transition-colors">
                🩺 Doctors & Medical
              </Link>
            </li>
          </ul>
        </div>

        {/* Column 3: Active Neighborhoods */}
        <div className="space-y-4">
          <h4 className="font-extrabold text-sm uppercase text-white tracking-widest">Active Districts</h4>
          
          <div className="grid grid-cols-2 gap-4 text-xs font-bold">
            <div className="space-y-3.5 text-zinc-450">
              <span className="block text-[10px] uppercase text-zinc-550 font-black tracking-wider">Haryana</span>
              <Link href="/gurugram/explore" className="block hover:text-emerald-400 transition-colors">Gurugram</Link>
              <Link href="/karnal/explore" className="block hover:text-emerald-400 transition-colors">Karnal</Link>
              <Link href="/panipat/explore" className="block hover:text-emerald-400 transition-colors">Panipat</Link>
              <Link href="/rohtak/explore" className="block hover:text-emerald-400 transition-colors">Rohtak</Link>
            </div>
            
            <div className="space-y-3.5 text-zinc-450">
              <span className="block text-[10px] uppercase text-zinc-550 font-black tracking-wider">Punjab</span>
              <Link href="/ludhiana/explore" className="block hover:text-emerald-400 transition-colors">Ludhiana</Link>
              <Link href="/amritsar/explore" className="block hover:text-emerald-400 transition-colors">Amritsar</Link>
              <Link href="/jalandhar/explore" className="block hover:text-emerald-400 transition-colors">Jalandhar</Link>
              <Link href="/patiala/explore" className="block hover:text-emerald-400 transition-colors">Patiala</Link>
            </div>
          </div>
        </div>

        {/* Column 4: Support & Business */}
        <div className="space-y-5">
          <h4 className="font-extrabold text-sm uppercase text-white tracking-widest">Trust & Support</h4>
          
          <ul className="space-y-3 text-xs text-zinc-450 font-bold">
            <li>
              <Link href="/whats-new" className="inline-flex items-center gap-2 text-emerald-400 hover:text-emerald-300 transition-colors">
                <span>🆕</span>
                <span>What&apos;s New</span>
                <span className="text-[8px] font-black uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 rounded-full px-1.5 py-0.5 tracking-wider">New</span>
              </Link>
            </li>
            <li><Link href="/about" className="hover:text-emerald-400 transition-colors">About NearByBazar</Link></li>
            <li><Link href="/faq" className="hover:text-emerald-400 transition-colors">Frequently Asked FAQs</Link></li>
            <li><Link href="/contact" className="hover:text-emerald-400 transition-colors">Contact Support</Link></li>
            <li><Link href="/pro" className="hover:text-emerald-400 transition-colors">Pro Storefront Tiers</Link></li>
          </ul>

          <div className="pt-2">
            <Link href="/business">
              <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black text-xs h-10 rounded-lg shadow-md shadow-emerald-500/10 transition-all active:scale-97">
                Register Your Shop
              </Button>
            </Link>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto mt-16 pt-6 border-t border-zinc-900 flex flex-col md:flex-row items-center justify-between gap-4 text-[10px] text-zinc-550 font-semibold uppercase tracking-wider">
        <div className="flex flex-wrap gap-4 justify-center md:justify-start">
          <p>© 2026 NearByBazar. All rights reserved.</p>
          <span className="text-zinc-800">|</span>
          <Link href="#" className="hover:text-zinc-400">Terms of Service</Link>
          <span className="text-zinc-800">|</span>
          <Link href="#" className="hover:text-zinc-400">Privacy Policy</Link>
        </div>
        <p>Managed by NearByBazar Technologies Pvt Ltd.</p>
      </div>
    </footer>
  );
}
