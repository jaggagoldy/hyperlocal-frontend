'use client';

import { useState, useEffect } from 'react';
import { useSearchStore } from '@/store/searchStore';
import { useAuthStore } from '@/store/authStore';

const CITIES = [
  { slug: 'hisar', name: 'Hisar' },
  { slug: 'fatehabad', name: 'Fatehabad' },
  { slug: 'sirsa', name: 'Sirsa' },
  { slug: 'rohtak', name: 'Rohtak' },
  { slug: 'bhiwani', name: 'Bhiwani' },
  { slug: 'ambala', name: 'Ambala' },
];

const FEATURES = [
  { icon: '🍽️', label: 'Order Food', sub: 'From local restaurants near you', bg: 'rgba(16,185,129,.08)', border: 'rgba(16,185,129,.2)' },
  { icon: '📅', label: 'Book Services', sub: 'Salons, doctors, repairs & more', bg: 'rgba(139,92,246,.08)', border: 'rgba(139,92,246,.2)' },
  { icon: '🛒', label: 'Shop Local', sub: 'Groceries & retail, delivered fast', bg: 'rgba(56,189,248,.08)', border: 'rgba(56,189,248,.2)' },
];

export function TutorialModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [selectedCity, setSelectedCity] = useState('hisar');
  const { setCity } = useSearchStore();
  const { isAuthenticated, activeContext } = useAuthStore();

  useEffect(() => {
    // Only greet BRAND-NEW signups (the register/login flow sets this flag), never
    // anonymous first-time visitors.
    const pending = localStorage.getItem('nbb_show_onboarding');
    if (pending && !localStorage.getItem('tutorial_seen')) {
      const t = setTimeout(() => setIsOpen(true), 1200);
      return () => clearTimeout(t);
    }
  }, [isAuthenticated, activeContext]);

  // Skip: close without starting the spotlight tour
  const handleSkip = () => {
    setCity(selectedCity);
    localStorage.setItem('tutorial_seen', 'true');
    localStorage.setItem('spotlight_tour_done', 'true'); // don't ambush a user who skipped
    localStorage.removeItem('nbb_show_onboarding');
    setIsOpen(false);
  };

  // Complete: close AND fire the spotlight tour
  const handleComplete = () => {
    setCity(selectedCity);
    localStorage.setItem('tutorial_seen', 'true');
    localStorage.removeItem('nbb_show_onboarding');
    setIsOpen(false);
    window.dispatchEvent(new Event('tutorial_modal_closed'));
  };

  const handleNext = () => {
    if (step < 3) setStep(s => s + 1);
    else handleComplete();
  };

  const handleGPS = () => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        // Approximate lat/lng for each supported city
        const CITY_COORDS: Record<string, [number, number]> = {
          hisar: [29.15, 75.72], fatehabad: [29.51, 75.45],
          sirsa: [29.54, 75.02], rohtak: [28.89, 76.6],
          bhiwani: [28.79, 76.13], ambala: [30.37, 76.78],
        };
        const dist = (slug: string) => {
          const [lat, lon] = CITY_COORDS[slug] || [29.15, 75.72];
          return Math.hypot(latitude - lat, longitude - lon);
        };
        const closest = CITIES.reduce((best, city) =>
          dist(city.slug) < dist(best.slug) ? city : best
        , CITIES[0]);
        setSelectedCity(closest.slug);
      },
      () => {/* permission denied — stay on manual picker */}
    );
  };

  if (!isOpen) return null;

  const dotColor = step === 2 ? '#38bdf8' : '#10b981';
  const ctaBg = step === 2
    ? 'linear-gradient(135deg,#38bdf8,#0ea5e9)'
    : 'linear-gradient(135deg,#10b981,#059669)';
  const ctaColor = step === 2 ? '#082f49' : '#052e16';
  const ctaShadow = step === 2
    ? '0 8px 24px rgba(56,189,248,.3)'
    : '0 8px 24px rgba(16,185,129,.35)';
  const ctaLabel = step === 1 ? 'Next →' : step === 2 ? 'Confirm City →' : 'Start Exploring 🚀';

  return (
    <div
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-in fade-in duration-300"
      style={{ background: 'rgba(0,0,0,.75)', backdropFilter: 'blur(10px)' }}
    >
      <div
        className="relative w-full max-w-[390px] rounded-[32px] flex flex-col overflow-hidden animate-in zoom-in-95 duration-300"
        style={{ background: '#020617', maxHeight: '90vh' }}
      >
        {/* Background glows per slide */}
        {step === 1 && (
          <>
            <div style={{ position: 'absolute', top: -60, left: -80, width: 300, height: 300, background: 'radial-gradient(circle,rgba(16,185,129,.22),transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
            <div style={{ position: 'absolute', bottom: -40, right: -60, width: 260, height: 260, background: 'radial-gradient(circle,rgba(139,92,246,.16),transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
          </>
        )}
        {step === 2 && (
          <div style={{ position: 'absolute', top: -40, right: -60, width: 280, height: 280, background: 'radial-gradient(circle,rgba(56,189,248,.18),transparent 70%)', pointerEvents: 'none', zIndex: 0 }} />
        )}
        {step === 3 && (
          <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(ellipse at 50% 30%,rgba(16,185,129,.15),transparent 60%)', pointerEvents: 'none', zIndex: 0 }} />
        )}

        {/* Skip button */}
        <button
          onClick={handleSkip}
          className="absolute top-5 right-5 z-30 px-3 py-1 rounded-full text-[11px] font-bold transition-opacity hover:opacity-80"
          style={{ background: 'rgba(255,255,255,.08)', border: '1px solid rgba(255,255,255,.1)', color: '#64748b' }}
        >
          Skip
        </button>

        {/* ── Slide 1: Welcome ── */}
        {step === 1 && (
          <div className="flex flex-col items-center px-7 pt-16 pb-4 relative z-10">
            {/* Spinning logo ring */}
            <div className="relative mb-8 shrink-0" style={{ width: 100, height: 100 }}>
              <div style={{
                position: 'absolute', inset: -4, borderRadius: '50%',
                background: 'conic-gradient(from 0deg,rgba(16,185,129,.4),rgba(139,92,246,.3),rgba(16,185,129,.4))',
                animation: 'spin 4s linear infinite',
              }} />
              <div style={{
                width: 100, height: 100, borderRadius: '50%',
                background: 'linear-gradient(135deg,#10b981,#0d9488)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                position: 'relative', boxShadow: '0 0 40px rgba(16,185,129,.4)', fontSize: 40,
              }}>🎯</div>
            </div>
            <h1 className="text-[28px] font-black text-white text-center leading-tight mb-2">
              Welcome to<br /><span style={{ color: '#34d399' }}>NearByBazar</span> 👋
            </h1>
            <p className="text-[14px] font-medium text-center leading-relaxed mb-7" style={{ color: '#64748b' }}>
              Your city&apos;s best restaurants, salons, doctors &amp; shops — all in one app.
            </p>
            <div className="flex flex-col gap-3 w-full">
              {FEATURES.map(f => (
                <div key={f.label} className="flex items-center gap-4 p-4 rounded-2xl" style={{ background: f.bg, border: `1px solid ${f.border}` }}>
                  <span className="text-[22px] shrink-0">{f.icon}</span>
                  <div>
                    <p className="text-[13px] font-black text-white mb-0.5">{f.label}</p>
                    <p className="text-[11px] font-medium" style={{ color: '#64748b' }}>{f.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── Slide 2: City Picker ── */}
        {step === 2 && (
          <div className="flex flex-col items-center px-7 pt-16 pb-4 relative z-10">
            <div className="relative mb-7 rounded-[32px] flex flex-col items-center justify-center shrink-0"
              style={{ width: 140, height: 140, background: 'rgba(56,189,248,.08)', border: '1px solid rgba(56,189,248,.2)' }}>
              <span className="text-[52px]">📍</span>
              <div className="absolute top-2.5 right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px]" style={{ background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.3)' }}>🍽️</div>
              <div className="absolute bottom-3 left-1.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px]" style={{ background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.3)' }}>💈</div>
              <div className="absolute top-3 left-2.5 w-6 h-6 rounded-full flex items-center justify-center text-[10px]" style={{ background: 'rgba(245,158,11,.15)', border: '1px solid rgba(245,158,11,.3)' }}>🛒</div>
            </div>
            <h2 className="text-2xl font-black text-white text-center mb-2">Choose Your City</h2>
            <p className="text-[13px] text-center leading-relaxed mb-7" style={{ color: '#64748b' }}>
              We&apos;ll show you the best businesses near you. Currently serving{' '}
              <span style={{ color: '#38bdf8', fontWeight: 700 }}>Haryana</span>.
            </p>
            <div className="flex flex-wrap gap-2.5 justify-center mb-5 w-full">
              {CITIES.map(c => (
                <button
                  key={c.slug}
                  onClick={() => setSelectedCity(c.slug)}
                  className="px-4 py-2.5 rounded-xl text-[13px] font-bold transition-all active:scale-95"
                  style={selectedCity === c.slug
                    ? { background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)', color: '#34d399' }
                    : { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8' }
                  }
                >
                  {c.name}{selectedCity === c.slug ? ' ✓' : ''}
                </button>
              ))}
            </div>
            <p className="text-[11px] font-medium mb-2" style={{ color: '#64748b' }}>Or use GPS to auto-detect</p>
            <button onClick={handleGPS} className="h-10 w-full rounded-xl flex items-center justify-center gap-2 text-[12px] font-bold active:scale-[.98] transition-transform" style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', color: '#64748b' }}>
              <span>📡</span> Use my current location
            </button>
          </div>
        )}

        {/* ── Slide 3: All Set ── */}
        {step === 3 && (
          <div className="flex flex-col items-center px-7 pt-16 pb-4 relative z-10 text-center">
            <div className="w-24 h-24 rounded-full flex items-center justify-center mb-6 shrink-0"
              style={{ background: 'rgba(16,185,129,.1)', border: '2px solid rgba(16,185,129,.3)', boxShadow: '0 0 60px rgba(16,185,129,.2)' }}>
              <span className="text-[42px]">✅</span>
            </div>
            <h2 className="text-[26px] font-black text-white mb-2">You&apos;re all set! 🎉</h2>
            <p className="text-[13px] leading-relaxed mb-7" style={{ color: '#64748b' }}>
              NearByBazar is ready for{' '}
              <span className="text-white font-bold">{CITIES.find(c => c.slug === selectedCity)?.name ?? 'your city'}</span>.
              {' '}Start exploring businesses around you.
            </p>
            {/* Video tour CTA intentionally omitted until we publish a video. */}
            {/* Social proof */}
            <div className="flex items-center gap-2.5">
              <div className="flex">
                {[
                  { initials: 'RK', bg: 'linear-gradient(135deg,#7c3aed,#5b21b6)' },
                  { initials: 'PK', bg: 'linear-gradient(135deg,#be185d,#9d174d)' },
                  { initials: 'AS', bg: 'linear-gradient(135deg,#065f46,#059669)' },
                ].map((a, i) => (
                  <div key={a.initials} className="w-6 h-6 rounded-full flex items-center justify-center text-[8px] font-black text-white"
                    style={{ background: a.bg, border: '2px solid #020617', marginLeft: i > 0 ? -6 : 0, zIndex: 3 - i }}>
                    {a.initials}
                  </div>
                ))}
              </div>
              <p className="text-[11px] font-medium" style={{ color: '#64748b' }}>
                <span className="text-white font-black">10,000+</span> users in Haryana
              </p>
            </div>
          </div>
        )}

        {/* Step dots + CTA */}
        <div className="px-7 pb-10 pt-4 relative z-10 shrink-0">
          <div className="flex justify-center gap-1.5 mb-5">
            {[1, 2, 3].map(i => (
              <div key={i} style={{
                width: step === i ? 20 : 6, height: 6, borderRadius: 999,
                transition: 'all .25s',
                background: step === i ? dotColor : 'rgba(255,255,255,.15)',
              }} />
            ))}
          </div>
          <button
            onClick={handleNext}
            className="w-full h-[52px] rounded-2xl text-[15px] font-black transition-all active:scale-[0.98]"
            style={{ background: ctaBg, color: ctaColor, boxShadow: ctaShadow }}
          >
            {ctaLabel}
          </button>
          {step === 3 && (
            <p className="text-center text-[11px] font-medium mt-3" style={{ color: '#334155' }}>
              You can always revisit this tour from Settings
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
