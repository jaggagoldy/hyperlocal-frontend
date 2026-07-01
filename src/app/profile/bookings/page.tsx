'use client';

import { ArrowLeft, ClipboardList, Search } from 'lucide-react';
import Link from 'next/link';

export default function BookingsPage() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="bg-card border-b border-border sticky top-0 z-40 px-5">
        <div className="max-w-[640px] mx-auto flex items-center gap-3 h-14">
          <Link
            href="/profile"
            className="w-9 h-9 rounded-full bg-accent border border-border flex items-center justify-center text-muted-foreground hover:text-foreground transition-all shrink-0 text-decoration-none"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div>
            <p className="text-[11px] font-bold text-muted-foreground/80 mb-0.5">My Account</p>
            <h1 className="text-[18px] font-black text-foreground leading-tight">My Bookings 📋</h1>
          </div>
        </div>
      </div>

      <div className="max-w-[640px] mx-auto px-5 py-8 pb-20">
        <div className="bg-card border border-border rounded-3xl p-12 text-center shadow-xs">
          <div className="w-18 h-18 rounded-2xl mx-auto mb-4 bg-primary/10 border border-primary/20 flex items-center justify-center">
            <ClipboardList className="w-8 h-8 text-primary" />
          </div>
          <h2 className="text-[18px] font-black text-foreground mb-2">No bookings yet</h2>
          <p className="text-xs text-muted-foreground leading-relaxed max-w-[260px] mx-auto mb-6">
            Once you request a service from a professional, your bookings will appear here.
          </p>
          <Link
            href="/explore"
            className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-black px-6 py-2.5 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all text-decoration-none"
          >
            <Search className="w-3.5 h-3.5" /> Explore Services
          </Link>
        </div>
      </div>
    </div>
  );
}
