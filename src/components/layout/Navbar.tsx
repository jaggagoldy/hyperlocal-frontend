'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Moon, Sun, Target, User, LogOut, LayoutDashboard,
  Briefcase, ChevronDown, ArrowLeftRight, UserPlus, Sparkles,
  Compass, LayoutGrid,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { useLanguageStore } from "@/store/languageStore";
import { useSearchStore } from "@/store/searchStore";
import { useThemeStore } from "@/store/themeStore";
import { useState, useRef, useEffect } from "react";
import apiClient from "@/lib/api-client";
import { toast } from "sonner";

const NAV_CATEGORIES = [
  { slug: 'food-beverage',        label: 'Food & Drinks',    emoji: '🍽️' },
  { slug: 'grocery',              label: 'Grocery',          emoji: '🛒' },
  { slug: 'salon-beauty',         label: 'Salon & Beauty',   emoji: '✂️' },
  { slug: 'health-medical',       label: 'Health & Medical', emoji: '🏥' },
  { slug: 'fitness',              label: 'Fitness',          emoji: '💪' },
  { slug: 'shops-retail',         label: 'Shops & Retail',   emoji: '🛍️' },
  { slug: 'home-repair',          label: 'Home Repair',      emoji: '🔧' },
  { slug: 'professional-services',label: 'Professional',     emoji: '💼' },
  { slug: 'automotive',           label: 'Automotive',       emoji: '🚗' },
  { slug: 'education',            label: 'Education',        emoji: '📚' },
];

export function Navbar() {
  const { isAuthenticated, logout, user, activeContext, updateToken } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const { selectedCity } = useSearchStore();
  const { theme, setTheme } = useThemeStore();
  const router = useRouter();
  const pathname = usePathname();
  const isProMode = activeContext === 'vendor';
  const citySlug = selectedCity || 'hisar';

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const root = window.document.documentElement;
      if (theme === 'vibrant') {
        root.classList.add('vibrant');
      } else {
        root.classList.remove('vibrant');
      }
    }
  }, [theme]);

  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const [categoriesOpen, setCategoriesOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const categoriesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const isDualProfile = user?.hasCustomerProfile && user?.hasVendorProfile;

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setProfileMenuOpen(false);
      }
      if (categoriesRef.current && !categoriesRef.current.contains(e.target as Node)) {
        setCategoriesOpen(false);
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

  const authPaths = ['/login', '/register', '/vendor/login', '/vendor/register', '/forgot-password', '/reset-password'];
  if (authPaths.includes(pathname)) return null;

  const segments = pathname.split('/').filter(Boolean);
  const isStorefront = segments.length === 1 && ![
    'explore', 'food', 'login', 'register', 'vendor',
    'admin', 'vendor-dashboard', 'directory', 'pro',
    'onboarding', 'profile', 'create-consumer-profile',
    'reset-password', 'forgot-password', 'sw-reset', 'claim'
  ].includes(segments[0]);

  if (isStorefront || pathname.startsWith('/vendor-dashboard') || pathname.startsWith('/admin')) {
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

  const navLinkClass = (active: boolean) =>
    `flex items-center gap-1.5 h-10 px-3.5 rounded-xl font-bold text-sm transition-all ${
      active
        ? 'bg-accent text-accent-foreground'
        : 'text-muted-foreground hover:text-foreground hover:bg-accent'
    }`;

  return (
    <header className={`sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-xl transition-shadow duration-200 ${scrolled ? 'shadow-sm' : ''}`}>
      <div className="max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group shrink-0">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-primary to-[#F43F5E] text-white flex items-center justify-center group-hover:shadow-lg group-hover:shadow-primary/25 transition-all">
            <Target className="w-5 h-5" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-foreground" style={{ fontFamily: 'Outfit, sans-serif' }}>
            NearByBazar
          </span>
        </Link>

        {/* Center Nav */}
        <nav className="hidden md:flex items-center gap-1">
          {isProMode ? (
            /* Vendor pro mode — just the dashboard link */
            <Link href="/vendor-dashboard" className={navLinkClass(pathname.startsWith('/vendor-dashboard'))}>
              <LayoutDashboard className="w-4 h-4" />
              Dashboard
            </Link>
          ) : (
            <>
              {/* Explore */}
              <Link href="/explore" className={navLinkClass(pathname.startsWith('/explore'))}>
                <Compass className="w-4 h-4" />
                Explore
              </Link>

              {/* Categories dropdown */}
              <div className="relative" ref={categoriesRef}>
                <button
                  onClick={() => setCategoriesOpen(prev => !prev)}
                  className={navLinkClass(categoriesOpen)}
                >
                  <LayoutGrid className="w-4 h-4" />
                  Categories
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${categoriesOpen ? 'rotate-180' : ''}`} />
                </button>

                {categoriesOpen && (
                  <div className="absolute left-0 top-full mt-2 w-72 bg-card border border-border rounded-2xl shadow-xl shadow-black/40 overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150 p-2">
                    <p className="text-[9px] font-black uppercase tracking-[0.18em] px-2 pt-1 pb-2 text-muted-foreground/60">
                      Browse by category
                    </p>
                    <div className="grid grid-cols-2 gap-1">
                      {NAV_CATEGORIES.map(cat => (
                        <Link
                          key={cat.slug}
                          href={`/${citySlug}/${cat.slug}`}
                          onClick={() => setCategoriesOpen(false)}
                          className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors hover:bg-accent group"
                        >
                          <span className="text-base leading-none">{cat.emoji}</span>
                          <span className="text-xs font-semibold text-muted-foreground group-hover:text-foreground transition-colors truncate">
                            {cat.label}
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* For Business — guests and customer-only accounts */}
              {!user?.hasVendorProfile && (
                <Link href="/vendor/register" className={navLinkClass(pathname.startsWith('/vendor/register'))}>
                  <Briefcase className="w-4 h-4" />
                  For Business
                </Link>
              )}
            </>
          )}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* What's New */}
          <Link
            href="/whats-new"
            aria-label="What's New"
            className={`relative flex items-center gap-1.5 h-10 px-2.5 sm:px-3 rounded-xl border font-bold text-sm transition-all active:scale-[0.97] ${
              pathname.startsWith('/whats-new')
                ? 'bg-primary/15 border-primary/30 text-primary'
                : 'bg-accent/40 border-border text-muted-foreground hover:bg-accent hover:text-foreground'
            }`}
          >
            <Sparkles className="w-4 h-4 text-emerald-400" />
            <span className="hidden md:inline">What&apos;s New</span>
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="absolute inline-flex h-full w-full rounded-full bg-primary opacity-60 animate-ping" />
              <span className="relative inline-flex h-2.5 w-2.5 rounded-full bg-primary" />
            </span>
          </Link>

          {/* Language Switcher */}
          <div className="bg-accent/40 p-0.5 rounded-lg flex gap-0.5 items-center border border-border shadow-inner text-[10px] font-black select-none">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded transition-all cursor-pointer font-bold ${language === 'en' ? 'bg-accent text-primary shadow-2xs font-extrabold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 rounded transition-all cursor-pointer font-bold ${language === 'hi' ? 'bg-accent text-primary shadow-2xs font-extrabold' : 'text-muted-foreground hover:text-foreground'}`}
            >
              हि
            </button>
          </div>

          <Button 
            variant="ghost" 
            size="icon" 
            onClick={() => setTheme(theme === 'dark' ? 'vibrant' : 'dark')}
            className="hidden md:flex rounded-xl border border-border bg-card text-muted-foreground hover:bg-accent hover:text-foreground h-10 w-10"
          >
            {theme === 'vibrant' ? <Sun className="w-4 h-4 text-amber-500" /> : <Moon className="w-4 h-4" />}
          </Button>

          {isAuthenticated ? (
            /* ── Profile Dropdown ── */
            <div className="relative" ref={menuRef}>
              <button
                onClick={() => setProfileMenuOpen(prev => !prev)}
                className={`flex items-center gap-2 pl-3 pr-2.5 py-2 rounded-xl border transition-all font-bold text-sm ${
                  profileMenuOpen
                    ? 'bg-white/[0.08] border-white/[0.15] text-white'
                    : 'bg-[#0f172a] border-white/[0.06] text-zinc-300 hover:bg-white/[0.04] hover:border-white/[0.1]'
                }`}
              >
                <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-white text-xs font-black ${isProMode ? 'bg-amber-500' : 'bg-primary'}`}>
                  {user?.name?.[0]?.toUpperCase() || <User className="w-4 h-4" />}
                </div>
                <div className="hidden sm:flex flex-col items-start leading-none">
                  <span className="text-xs font-extrabold text-white">{user?.name || 'Account'}</span>
                  <span className={`text-[9px] font-bold uppercase tracking-wider ${isProMode ? 'text-amber-500' : 'text-primary'}`}>
                    {isProMode ? '🔧 Pro Mode' : '👤 Consumer'}
                  </span>
                </div>
                <ChevronDown className={`w-3.5 h-3.5 text-zinc-400 transition-transform ${profileMenuOpen ? 'rotate-180' : ''}`} />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 top-full mt-2 w-64 bg-[#0f172a] border border-white/[0.08] rounded-2xl shadow-xl shadow-black/80 overflow-hidden z-50 animate-in fade-in-0 zoom-in-95 duration-150">

                  {isDualProfile && (
                    <button
                      onClick={handleContextSwitch}
                      disabled={isSwitching}
                      className={`w-full flex items-center gap-3 px-4 py-3.5 border-b border-white/[0.05] transition-all text-left ${
                        isProMode
                          ? 'bg-blue-950/40 hover:bg-blue-900/40 text-blue-300'
                          : 'bg-amber-950/40 hover:bg-amber-900/40 text-amber-300'
                      }`}
                    >
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${isProMode ? 'bg-blue-900/40' : 'bg-amber-900/40'}`}>
                        <ArrowLeftRight className="w-4 h-4" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-extrabold">
                          {isSwitching ? 'Switching...' : isProMode ? '🏠 Switch to Consumer' : '🔧 Switch to Pro Dashboard'}
                        </span>
                        <span className="text-[10px] font-semibold opacity-70">
                          {isProMode ? 'Browse services as a customer' : 'Manage your business'}
                        </span>
                      </div>
                    </button>
                  )}

                  {user?.hasCustomerProfile && !user?.hasVendorProfile && (
                    <button
                      onClick={() => { setProfileMenuOpen(false); router.push('/vendor/register'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-white/[0.05] hover:bg-white/[0.04] transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
                        <Briefcase className="w-4 h-4 text-emerald-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-emerald-400">Register as a Pro</span>
                        <span className="text-[10px] text-zinc-500 font-semibold">List your services & earn more</span>
                      </div>
                    </button>
                  )}

                  {user?.hasVendorProfile && !user?.hasCustomerProfile && (
                    <button
                      onClick={() => { setProfileMenuOpen(false); router.push('/create-consumer-profile'); }}
                      className="w-full flex items-center gap-3 px-4 py-3 border-b border-white/[0.05] hover:bg-white/[0.04] transition-colors text-left"
                    >
                      <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
                        <UserPlus className="w-4 h-4 text-blue-400" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-blue-400">Create Consumer Account</span>
                        <span className="text-[10px] text-zinc-500 font-semibold">Book services without logging out</span>
                      </div>
                    </button>
                  )}

                  {!isProMode && (
                    <Link href="/profile" onClick={() => setProfileMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
                          <User className="w-4 h-4 text-zinc-300" />
                        </div>
                        <span className="text-sm font-bold text-zinc-300">My Profile</span>
                      </div>
                    </Link>
                  )}

                  {isProMode && (
                    <Link href="/vendor-dashboard" onClick={() => setProfileMenuOpen(false)}>
                      <div className="flex items-center gap-3 px-4 py-3 hover:bg-white/[0.04] transition-colors cursor-pointer">
                        <div className="w-8 h-8 rounded-lg bg-white/[0.05] flex items-center justify-center">
                          <LayoutDashboard className="w-4 h-4 text-zinc-300" />
                        </div>
                        <span className="text-sm font-bold text-zinc-300">Vendor Dashboard</span>
                      </div>
                    </Link>
                  )}

                  <button
                    onClick={handleLogout}
                    className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-500/10 transition-colors text-left border-t border-white/[0.05]"
                  >
                    <div className="w-8 h-8 rounded-lg bg-red-500/10 flex items-center justify-center">
                      <LogOut className="w-4 h-4 text-red-400" />
                    </div>
                    <span className="text-sm font-bold text-red-400">Logout</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" className="rounded-xl text-zinc-400 hover:text-white hover:bg-white/[0.04] font-bold h-10 px-4">
                  Sign In
                </Button>
              </Link>
              <Link href="/vendor/register">
                <Button className="rounded-xl bg-emerald-500 hover:bg-emerald-600 text-zinc-950 font-black h-10 px-4 shadow-lg shadow-emerald-500/10">
                  List Business Free
                </Button>
              </Link>
            </div>
          )}
        </div>

      </div>
    </header>
  );
}
