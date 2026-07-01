'use client';

import { useAuthStore } from '@/store/authStore';
import { User, Heart, Bell, Shield, MapPin, CreditCard, ChevronRight, Zap, LayoutDashboard, MessageSquare, AlertTriangle, BookOpen, Video, Play } from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import DeleteAccountModal from '@/components/shared/DeleteAccountModal';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const isVendor = user?.role === 'vendor' || user?.role === 'admin';

  const menuItems = [
    { icon: Heart, title: 'Saved Pros', desc: 'Your favourite professionals', href: '/profile/saved', color: '#f87171', bg: 'rgba(239,68,68,.08)', border: 'rgba(239,68,68,.15)' },
    { icon: MessageSquare, title: 'My Enquiries', desc: 'Track services you requested', href: '/profile/enquiries', color: '#34d399', bg: 'rgba(16,185,129,.08)', border: 'rgba(16,185,129,.15)' },
    { icon: BookOpen, title: 'My Bookings', desc: 'View and manage bookings', href: '/profile/bookings', color: '#a78bfa', bg: 'rgba(139,92,246,.08)', border: 'rgba(139,92,246,.15)' },
    { icon: MapPin, title: 'Addresses', desc: 'Manage saved locations', href: '/profile/addresses', color: '#38bdf8', bg: 'rgba(56,189,248,.08)', border: 'rgba(56,189,248,.15)' },
    { icon: CreditCard, title: 'Payments', desc: 'Manage payment methods', href: '/profile/payments', color: '#fbbf24', bg: 'rgba(245,158,11,.08)', border: 'rgba(245,158,11,.15)' },
    { icon: Bell, title: 'Notifications', desc: 'Configure alerts', href: '/profile/notifications', color: '#fb923c', bg: 'rgba(251,146,60,.08)', border: 'rgba(251,146,60,.15)' },
    { icon: Shield, title: 'Security', desc: 'Password & authentication', href: '/profile/security', color: '#94a3b8', bg: 'rgba(100,116,139,.08)', border: 'rgba(100,116,139,.15)' },
    { icon: Video, title: 'Video Tutorials', desc: 'Learn how to use the app', href: '/video-guides', color: '#f59e0b', bg: 'rgba(245,158,11,.08)', border: 'rgba(245,158,11,.15)' },
    { icon: Play, title: 'Relaunch Tour', desc: 'Replay the app walkthrough', href: '#tour', color: '#34d399', bg: 'rgba(16,185,129,.08)', border: 'rgba(16,185,129,.15)' },
  ];

  const initials = user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || '?';

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-[640px] mx-auto px-5 py-6 pb-20">

        {/* Profile card */}
        <div className="bg-card border border-border rounded-3xl p-6 mb-5 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-full shrink-0 bg-gradient-to-br from-primary to-violet-500 flex items-center justify-center text-2xl font-black text-white shadow-lg shadow-primary/25">
              {initials}
            </div>
            <div>
              <h1 className="text-[18px] font-black text-foreground mb-0.5">
                {user?.name || 'User'}
              </h1>
              <p className="text-xs font-semibold text-muted-foreground">
                {user?.email || user?.phoneNumber || 'Manage your account'}
              </p>
              {isVendor && (
                <div className="inline-flex items-center gap-1 mt-1.5 bg-primary/10 border border-primary/25 rounded-full px-2.5 py-0.5 text-[10px] font-extrabold text-primary">
                  <Zap className="w-2.5 h-2.5" /> NearByBazar Pro
                </div>
              )}
            </div>
          </div>
          <Link
            href="/profile/edit"
            className="px-4 py-2 rounded-xl bg-accent text-muted-foreground border border-border text-xs font-bold hover:text-foreground transition-all shrink-0"
          >
            Edit
          </Link>
        </div>

        {/* Vendor dashboard link */}
        {isVendor && (
          <Link
            href="/vendor-dashboard"
            className="flex items-center justify-between bg-gradient-to-br from-primary/10 via-accent/5 to-accent/10 border border-primary/20 rounded-[20px] p-4 mb-5 hover:border-primary/30 transition-all text-decoration-none"
          >
            <div className="flex items-center gap-3.5">
              <div className="w-11 h-11 rounded-xl bg-primary/15 border border-primary/25 flex items-center justify-center">
                <LayoutDashboard className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-sm font-black text-foreground mb-0.5">My Pro Dashboard</p>
                <p className="text-xs text-muted-foreground font-semibold">Leads, analytics & profile</p>
              </div>
            </div>
            <ChevronRight className="w-4.5 h-4.5 text-muted-foreground" />
          </Link>
        )}

        {/* Menu grid */}
        <div className="grid grid-cols-2 gap-3 mb-5">
          {menuItems.map((item) => {
            const cardContent = (
              <div className="bg-card border border-border rounded-2xl p-4 flex items-start gap-3 hover:border-border/80 transition-colors cursor-pointer w-full text-left">
                <div style={{
                  width: 36,
                  height: 36,
                  borderRadius: 10,
                  flexShrink: 0,
                  background: item.bg,
                  border: `1px solid ${item.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}>
                  <item.icon style={{ width: 16, height: 16, color: item.color }} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-xs font-black text-foreground mb-0.5">{item.title}</p>
                  <p className="text-[10px] font-semibold text-muted-foreground leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );

            if (item.href === '#tour') {
              return (
                <button
                  key={item.title}
                  onClick={() => {
                    localStorage.removeItem('spotlight_tour_done');
                    window.dispatchEvent(new Event('relaunch_spotlight_tour'));
                  }}
                  className="bg-transparent border-none p-0 text-left cursor-pointer w-full"
                >
                  {cardContent}
                </button>
              );
            }

            return (
              <Link key={item.href} href={item.href} className="text-decoration-none">
                {cardContent}
              </Link>
            );
          })}
        </div>

        {/* Join as Pro — non-vendors */}
        {!isVendor && (
          <div className="relative overflow-hidden bg-gradient-to-br from-primary/5 via-accent/5 to-accent/10 border border-primary/20 rounded-[20px] p-6 mb-5">
            <div className="absolute -top-10 -right-10 w-40 h-40 rounded-full bg-radial-gradient(circle,rgba(16,185,129,.12),transparent 70%) pointer-events-none" />
            <div className="relative">
              <div className="flex items-center gap-2 mb-2.5">
                <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 flex items-center justify-center">
                  <Zap className="w-3.5 h-3.5 text-amber-500" />
                </div>
                <span className="text-[10px] font-extrabold text-muted-foreground uppercase tracking-widest">For Professionals</span>
              </div>
              <h3 className="text-[18px] font-black text-foreground mb-1.5 leading-tight">
                Grow your business<br />with NearByBazar
              </h3>
              <p className="text-[11px] text-muted-foreground leading-relaxed mb-3.5">
                List your services, get verified leads from local customers, and manage everything from a dedicated pro dashboard.
              </p>
              <div className="flex gap-3 mb-4">
                {['Free to join', 'Verified leads', 'Pro badge'].map(b => (
                  <span key={b} className="text-[10px] font-bold text-primary flex items-center gap-1">
                    ✓ {b}
                  </span>
                ))}
              </div>
              <Link
                href="/vendor/register"
                className="inline-flex items-center gap-1.5 bg-primary hover:bg-primary/95 text-primary-foreground text-xs font-black px-5 py-2.5 rounded-xl shadow-md hover:scale-[1.02] active:scale-[0.98] transition-all text-decoration-none"
              >
                <Zap className="w-3.5 h-3.5" /> Join as a Pro →
              </Link>
            </div>
          </div>
        )}

        {/* Danger Zone */}
        <div className="border-t border-destructive/20 pt-6 pb-2">
          <div className="bg-destructive/5 border border-destructive/20 rounded-2xl p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <h3 className="text-sm font-black text-destructive flex items-center gap-1.5 mb-1">
                  <AlertTriangle className="w-4 h-4" /> Danger Zone
                </h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Once you delete your account, there is no going back. Please be certain.
                </p>
              </div>
              <button
                onClick={() => setIsDeleteModalOpen(true)}
                className="shrink-0 px-3.5 py-1.5 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-xs font-bold hover:bg-destructive/15 transition-colors cursor-pointer"
              >
                Delete
              </button>
            </div>
          </div>
        </div>

      </div>

      <DeleteAccountModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
      />
    </div>
  );
}
