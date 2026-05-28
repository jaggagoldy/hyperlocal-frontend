'use client';

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Home, Search, Moon, Target, User, LogOut, LayoutDashboard, Zap, Briefcase } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

import { useLanguageStore } from "@/store/languageStore";

export function Navbar() {
  const { isAuthenticated, logout, user } = useAuthStore();
  const { language, setLanguage } = useLanguageStore();
  const isVendor = user?.role === 'vendor' || user?.role === 'admin';
  const router = useRouter();
  const pathname = usePathname();
  const isProMode = pathname.startsWith('/vendor-dashboard');

  const handleLogout = () => {
    logout();
    router.push('/login');
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
            HyperLocal <span className="text-primary">Go</span>
          </span>
        </Link>

        {/* Center: Segmented Role Switcher (For Dual-Role Users) */}
        {isAuthenticated && isVendor ? (
          <div className="bg-zinc-150 p-1 rounded-xl flex gap-1 items-center border border-zinc-200/40 select-none shadow-inner max-w-fit">
            <button
              onClick={() => router.push('/explore')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                !isProMode
                  ? 'bg-white text-primary shadow-xs border border-zinc-200/50'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Customer Mode</span>
              <span className="xs:hidden">Customer</span>
            </button>
            <button
              onClick={() => router.push('/vendor-dashboard')}
              className={`px-3 py-1.5 rounded-lg text-xs font-extrabold transition-all duration-200 flex items-center gap-1 cursor-pointer ${
                isProMode
                  ? 'bg-white text-primary shadow-xs border border-zinc-200/50'
                  : 'text-zinc-500 hover:text-zinc-800'
              }`}
            >
              <Briefcase className="w-3.5 h-3.5" />
              <span className="hidden xs:inline">Pro Mode</span>
              <span className="xs:hidden">Pro</span>
            </button>
          </div>
        ) : (
          /* Center Nav Links for standard consumers */
          <nav className="hidden md:flex items-center gap-2">
            <Link href="/">
              <Button variant="ghost" className="bg-primary/10 text-primary hover:bg-primary/15 hover:text-primary font-bold h-10 px-4 rounded-xl gap-2">
                <Home className="w-4 h-4" />
                Home
              </Button>
            </Link>
            <Link href="/explore">
              <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 font-bold h-10 px-4 rounded-xl gap-2">
                <Search className="w-4 h-4" />
                Explore
              </Button>
            </Link>
          </nav>
        )}

        {/* Right Actions */}
        <div className="flex items-center gap-2">
          {/* Language Switcher Toggle */}
          <div className="bg-zinc-100 p-0.5 rounded-lg flex gap-0.5 items-center border border-zinc-200/50 shadow-inner text-[10px] font-black select-none">
            <button
              onClick={() => setLanguage('en')}
              className={`px-2 py-1 rounded transition-all cursor-pointer font-bold ${
                language === 'en'
                  ? 'bg-white text-primary shadow-2xs font-extrabold'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              EN
            </button>
            <button
              onClick={() => setLanguage('hi')}
              className={`px-2 py-1 rounded transition-all cursor-pointer font-bold ${
                language === 'hi'
                  ? 'bg-white text-primary shadow-2xs font-extrabold'
                  : 'text-zinc-500 hover:text-zinc-700'
              }`}
            >
              हिन्दी
            </button>
          </div>

          {/* Theme/Settings Button */}
          <Button variant="outline" size="icon" className="hidden md:flex rounded-xl border-zinc-200 text-zinc-600 hover:bg-zinc-100 h-10 w-10">
            <Moon className="w-4 h-4" />
          </Button>

          {isAuthenticated ? (
            <>
              {/* Dynamic Nav link visibility based on active Role Mode */}
              {!isProMode ? (
                <>
                  <Link href="/explore" className="hidden md:inline">
                    <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 font-bold h-10 px-4 rounded-xl gap-2">
                      <Search className="w-4 h-4" />
                      Explore
                    </Button>
                  </Link>
                  <Link href="/profile">
                    <Button variant="outline" className="rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-bold h-10 px-4 gap-2">
                      <User className="w-4 h-4" />
                      <span className="hidden sm:inline">Profile</span>
                    </Button>
                  </Link>
                </>
              ) : (
                <Link href="/vendor-dashboard">
                  <Button variant="ghost" className="text-zinc-500 hover:text-zinc-900 hover:bg-zinc-100 font-bold h-10 px-4 rounded-xl gap-2 hidden md:flex">
                    <LayoutDashboard className="w-4 h-4" />
                    Pro Dashboard
                  </Button>
                </Link>
              )}

              <Button onClick={handleLogout} variant="ghost" className="rounded-xl text-red-500 hover:bg-red-50 hover:text-red-600 font-bold h-10 px-4 gap-2 cursor-pointer">
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Logout</span>
              </Button>
            </>
          ) : (
            <>
              <Link href="/login">
                <Button variant="outline" className="rounded-xl border-zinc-200 text-zinc-700 hover:bg-zinc-100 font-bold h-10 px-5">
                  Sign In
                </Button>
              </Link>
              <Link href="/vendor/register">
                <Button className="rounded-xl bg-primary text-white hover:bg-primary/90 hover:shadow-lg hover:shadow-primary/25 transition-all font-bold h-10 px-6 gap-1.5 cursor-pointer">
                  <Zap className="w-4 h-4" />
                  Join as Pro
                </Button>
              </Link>
            </>
          )}
        </div>

      </div>
    </header>
  );
}
