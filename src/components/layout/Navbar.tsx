'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home, Search, Moon, Target, User, LogOut, LayoutDashboard,
  Briefcase, ChevronDown, ArrowLeftRight, UserPlus, Coffee
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { useState, useRef, useEffect } from "react";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

export function Navbar() {
  const { isAuthenticated, logout, user, activeContext, updateToken } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const router = useRouter();
  const pathname = usePathname();
  const isProMode = activeContext === 'vendor';

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Dual-profile user detection
  const isDualProfile = user?.hasCustomerProfile && user?.hasVendorProfile;

  // Close menu when clicking outside
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleLogout = () => {
    setProfileMenuOpen(false);
    logout();
    router.push('/login');
  };

  if (pathname.startsWith('/vendor-dashboard') || pathname.startsWith('/admin')) {
    return null;
  }

  const handleContextSwitch = async () => {
    const targetContext = isProMode ? 'customer' : 'vendor';
    setIsSwitching(true);
    setProfileMenuOpen(false);
    try {
      const res = await apiClient.post('/auth/switch-context', { targetContext });
      const { token, user: newUser } = res.data.data;
      updateToken(token, newUser);
      toast.success(
        targetContext === 'vendor'
          ? '🔧 Switched to Vendor Dashboard'
          : '🏠 Switched to Consumer App'
      );
      router.push(targetContext === 'vendor' ? '/vendor-dashboard' : '/explore');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not switch context');
    } finally {
      setIsSwitching(false);
    }
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-200 bg-white/85 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-[#F43F5E] text-white flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/25 transition-all">
            <Target className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-zinc-900" style={{ fontFamily: 'Outfit, sans-serif' }}>
            NearByBazar
          </span>
        </Link>

        {/* Center Nav Links */}
        <nav className="hidden md:flex items-center gap-2">
          <Link href="/">
            <Button variant="ghost" className="bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary font-bold h-10 px-4 rounded-xl gap-2">
              <Home className="w-4 h-4" />
              Home
            </Button>
          </Link>
          <Link href="/food">
            <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 font-bold h-10 px-4 rounded-xl gap-2">
              <Coffee className="w-4 h-4" />
              Food
            </Button>
          </Link>
          <Link href="/explore">
            <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 font-bold h-10 px-4 rounded-xl gap-2">
              <Search className="w-4 h-4" />
              Explore
            </Button>
          </Link>
          {isAuthenticated && isProMode && (
            <Link href="/vendor-dashboard">
              <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 font-bold h-10 px-4 rounded-xl gap-2">
                <LayoutDashboard className="w-4 h-4" />
                Dashboard
              </Button>
            </Link>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher */}
          <div className="bg-zinc-100 p-0.5 rounded-lg flex gap-0.5 items-center border border-zinc-200/50 shadow-inner text-[10px] font-black select-none">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded transition-all cursor-pointer font-bold ${language === 'en' ? 'bg-white text-primary shadow-2xs font-extrabold' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 rounded transition-all cursor-pointer font-bold ${language === 'hi' ? 'bg-white text-primary shadow-2xs font-extrabold' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              हिन्दी
            </button>
          </div>

          <Button variant="outline" size="icon" className="hidden md:flex rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-100 h-10 w-10">
            <Moon className="w-4 h-4" />
          </Button>

          {isAuthenticated ? (
            /* ── Profile Dropdown ── */
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setProfileMenuOpen(prev => !prev)}
                className={`flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-xl border transition-all font-bold text-sm ${
                  profileMenuOpen
                    ? 'bg-zinc-100 border-zinc-300 text-zinc-900'
                    : 'bg-white border-zinc-200 text-zinc-700 hover:bg-zinc-50 hover:border-zinc-300'
                }`}
              >
                {/* Avatar */}
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black ${isProMode ? 'bg-amber-500' : 'bg-primary'}`}>
                  {user?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-xs font-extrabold text-zinc-800">{user?.name || 'Account'}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isProMode ? 'text-amber-500' : 'text-primary'}`}>
                    {isProMode ? '🔧 Pro Mode' : '👤 Consumer'}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {/* Dropdown Menu */}
              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-white border border-zinc-200 rounded-2xl shadow-xl shadow-zinc-200/50 overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150">

                  {/* Context Switcher — only for dual-profile users */}
                  {isDualProfile && (
                    <button
                      onClick={handleContextSwitch}
                      disabled={isSwitching}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-zinc-100 transition-all text-left ${
                        isProMode
                          ? 'bg-blue-50 hover:bg-blue-100 text-blue-700'
                          : 'bg-amber-50 hover:bg-amber-100 text-amber-700'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isProMode ? 'bg-blue-100' : 'bg-amber-100'}`}>
                        <ArrowLeftRight className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold">
                          {isSwitching ? 'Switching...' : isProMode ? '🏠 Switch to Consumer App' : '🔧 Switch to Pro Dashboard'}
                        </span>
                        <span className="text-[10px] font-semibold opacity-70">
                          {isProMode ? 'Browse services as a customer' : 'Manage your business'}
                        </span>
                      </div>
                    </button>
                  )}

                  {/* Register as Vendor CTA — for customer-only users */}
                  {user?.hasCustomerProfile && !user?.hasVendorProfile && (
                    <button
                      onClick={() => { setProfileMenuOpen(false); router.push('/vendor/register'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-zinc-100 hover:bg-emerald-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-emerald-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-emerald-700">Register as a Pro</span>
                        <span className="text-[10px] text-zinc-500 font-semibold">List your services & earn more</span>
                      </div>
                    </button>
                  )}

                  {/* Register as Consumer CTA — for vendor-only users */}
                  {user?.hasVendorProfile && !user?.hasCustomerProfile && (
                    <button
                      onClick={() => { setProfileMenuOpen(false); router.push('/create-consumer-profile'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-zinc-100 hover:bg-blue-50 transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                        <UserPlus className="w-4 h-4 text-blue-600" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-blue-700">Create Consumer Account</span>
                        <span className="text-[10px] text-zinc-500 font-semibold">Book services without logging out</span>
                      </div>
                    </button>
                  )}

                  {/* Profile Link */}
                  {!isProMode && (
                    <Link href="/profile" onClick={() => setProfileMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                          <User className="w-4 h-4 text-zinc-600" />
                        </div>
                        <span className="text-sm font-bold text-zinc-700">My Profile</span>
                      </div>
                    </Link>
                  )}

                  {isProMode && (
                    <Link href="/vendor-dashboard" onClick={() => setProfileMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-zinc-50 transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-zinc-100 flex items-center justify-center">
                          <LayoutDashboard className="w-4 h-4 text-zinc-600" />
                        </div>
                        <span className="text-sm font-bold text-zinc-700">Vendor Dashboard</span>
                      </div>
                    </Link>
                  )}

                  {/* Logout */}
                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 transition-colors text-left border-t border-zinc-100"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-50 flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-red-500" />
                    </div>
                    <span className="text-sm font-bold text-red-600">Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <Link href="/login">
              <Button variant="outline" className="rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-bold h-10 px-5">
                Sign In
              </Button>
            </Link>
          )}
        </div>

      </div>
    </header>
  );
}
