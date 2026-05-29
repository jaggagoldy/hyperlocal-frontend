'use client';

import { useAuthStore } from '@/store/authStore';
import { User, Package, Heart, Bell, Shield, MapPin, CreditCard, ChevronRight, Zap, LayoutDashboard, MessageSquare } from 'lucide-react';
import Link from 'next/link';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const isVendor = user?.role === 'vendor' || user?.role === 'admin';

  const menuItems = [
    { icon: Heart, title: 'Saved Pros', desc: 'View your favorite professionals', href: '/profile/saved' },
    { icon: MessageSquare, title: 'My Enquiries', desc: 'Track services you have requested', href: '/profile/enquiries' },
    { icon: MapPin, title: 'Addresses', desc: 'Manage your saved locations', href: '/profile/addresses' },
    { icon: CreditCard, title: 'Payments', desc: 'Manage payment methods', href: '/profile/payments' },
    { icon: Bell, title: 'Notifications', desc: 'Configure alerts and updates', href: '/profile/notifications' },
    { icon: Shield, title: 'Security', desc: 'Password and authentication', href: '/profile/security' },
  ];

  return (
    <div className="min-h-screen bg-muted/20 py-12">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Header Profile Card */}
        <div className="bg-white rounded-[2rem] p-8 mb-6 border border-zinc-200 shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary to-[#F43F5E] flex items-center justify-center text-white text-3xl font-bold shadow-lg shadow-primary/20 flex-shrink-0">
              {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase() || <User size={36} />}
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-zinc-900 tracking-tight">
                Welcome back, {user?.name || 'User'}
              </h1>
              <p className="text-zinc-500 font-medium mt-1 text-sm">
                {user?.email || user?.phoneNumber || 'Manage your account'}
              </p>
              {isVendor && (
                <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200 mt-2">
                  <Zap className="w-3 h-3" /> HyperLocal Pro
                </span>
              )}
            </div>
          </div>
          <Link
            href="/profile/edit"
            className="hidden sm:inline-flex px-5 py-2.5 rounded-xl bg-zinc-100 text-zinc-700 text-sm font-semibold hover:bg-zinc-200 transition-colors"
          >
            Edit Profile
          </Link>
        </div>

        {/* Vendor Dashboard Quick Link — shown only to vendors */}
        {isVendor && (
          <Link
            href="/vendor-dashboard"
            className="flex items-center justify-between bg-gradient-to-r from-primary/90 to-purple-600 text-white rounded-2xl p-5 mb-6 shadow-lg shadow-primary/20 hover:shadow-primary/30 hover:brightness-105 transition-all group"
          >
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-white/15 flex items-center justify-center">
                <LayoutDashboard className="w-6 h-6" />
              </div>
              <div>
                <p className="font-bold text-base">My Pro Dashboard</p>
                <p className="text-white/70 text-sm mt-0.5">View leads, analytics & manage your profile</p>
              </div>
            </div>
            <ChevronRight className="w-5 h-5 text-white/60 group-hover:text-white group-hover:translate-x-1 transition-all" />
          </Link>
        )}

        {/* Settings Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item, idx) => (
            <Link
              key={idx}
              href={item.href}
              className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm hover:shadow-md hover:border-primary/20 transition-all group flex items-start justify-between"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-primary/5 text-primary flex items-center justify-center group-hover:bg-primary group-hover:text-white transition-colors flex-shrink-0">
                  <item.icon className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-zinc-900">{item.title}</h3>
                  <p className="text-zinc-500 text-sm mt-0.5 leading-relaxed">
                    {item.desc}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-5 h-5 text-zinc-300 group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
            </Link>
          ))}
        </div>

        {/* Join as Pro Banner — shown only to non-vendors */}
        {!isVendor && (
          <div className="mt-6 relative overflow-hidden bg-zinc-900 rounded-2xl p-8 text-white shadow-xl">
            {/* Ambient glow */}
            <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-primary/20 blur-[60px] pointer-events-none" />
            <div className="absolute -bottom-10 -left-10 w-48 h-48 rounded-full bg-purple-600/20 blur-[60px] pointer-events-none" />

            <div className="relative flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
              <div>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center">
                    <Zap className="w-4 h-4 text-yellow-400" />
                  </div>
                  <span className="text-xs font-bold text-white/60 uppercase tracking-wider">For Professionals</span>
                </div>
                <h3 className="text-2xl font-bold mb-2 leading-tight">
                  Grow your business<br />with HyperLocal Go
                </h3>
                <p className="text-zinc-400 text-sm max-w-sm leading-relaxed">
                  List your services, get verified leads from local customers, and manage everything from a dedicated pro dashboard.
                </p>
                <div className="flex gap-4 mt-4">
                  {['Free to join', 'Verified leads', 'Pro badge'].map((b) => (
                    <div key={b} className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
                      <span>✓</span> {b}
                    </div>
                  ))}
                </div>
              </div>
              <Link
                href="/vendor/register"
                className="flex-shrink-0 inline-flex items-center gap-2 bg-white text-zinc-900 px-7 py-3.5 rounded-xl font-bold hover:bg-zinc-100 transition-colors shadow-lg text-sm"
              >
                <Zap className="w-4 h-4 text-primary" />
                Join as a Pro →
              </Link>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
