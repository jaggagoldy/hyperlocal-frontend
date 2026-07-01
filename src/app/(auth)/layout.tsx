import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen" style={{ background: '#020617' }}>
      {/* ── Left marketing panel (lg+) ── */}
      <div
        className="hidden lg:flex w-[420px] shrink-0 flex-col justify-between relative overflow-hidden p-12"
        style={{ background: '#020617', borderRight: '1px solid rgba(255,255,255,.05)' }}
      >
        {/* Glow blobs */}
        <div
          className="pointer-events-none absolute -top-24 -left-16 w-80 h-80 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(16,185,129,.28), transparent 70%)' }}
        />
        <div
          className="pointer-events-none absolute bottom-0 -right-16 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,.18), transparent 70%)' }}
        />

        {/* Logo */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2.5">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center text-sm"
              style={{ background: 'linear-gradient(135deg,#10b981,#0d9488)' }}
            >
              🎯
            </div>
            <span className="text-base font-black text-white">NearByBazar</span>
          </Link>
        </div>

        {/* Hero copy */}
        <div className="relative z-10 space-y-5">
          <h1 className="text-4xl font-black text-white leading-[1.15]">
            Your city&apos;s best,
            <br />
            <span style={{ color: '#34d399' }}>one tap away.</span>
          </h1>
          <p className="text-sm font-medium leading-relaxed" style={{ color: '#64748b' }}>
            Discover verified restaurants, salons, doctors &amp; repair services in Haryana — order, book, or call in seconds.
          </p>

          <div className="flex flex-wrap gap-2 pt-2">
            {[
              { label: '✅ 2,400+ businesses', bg: 'rgba(16,185,129,.1)', border: 'rgba(16,185,129,.2)', color: '#34d399' },
              { label: '⭐ 16 verticals',       bg: 'rgba(56,189,248,.1)', border: 'rgba(56,189,248,.2)', color: '#38bdf8' },
              { label: '₹0 commission',         bg: 'rgba(255,255,255,.05)', border: 'rgba(255,255,255,.06)', color: '#94a3b8' },
            ].map((chip) => (
              <span
                key={chip.label}
                className="inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full"
                style={{ background: chip.bg, border: `1px solid ${chip.border}`, color: chip.color }}
              >
                {chip.label}
              </span>
            ))}
          </div>

          {/* Social proof avatars */}
          <div className="flex items-center gap-3 pt-4">
            <div className="flex">
              {[
                ['RK', 'linear-gradient(135deg,#312e81,#7c3aed)'],
                ['AS', 'linear-gradient(135deg,#9d174d,#db2777)'],
                ['PK', 'linear-gradient(135deg,#065f46,#059669)'],
                ['MV', 'linear-gradient(135deg,#7c2d12,#c2410c)'],
              ].map(([init, bg], idx) => (
                <div
                  key={idx}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-[10px] font-black text-white"
                  style={{ background: bg, border: '2px solid #020617', marginLeft: idx === 0 ? 0 : '-8px' }}
                >
                  {init}
                </div>
              ))}
            </div>
            <p className="text-xs font-medium" style={{ color: '#64748b' }}>
              <span className="text-white font-bold">10k+</span> users in Haryana
            </p>
          </div>
        </div>

        <div className="relative z-10 h-4" />
      </div>

      {/* ── Right form panel ── */}
      <div className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative" style={{ background: '#0f172a' }}>
        {/* Mobile back link */}
        <Link
          href="/"
          className="lg:hidden absolute top-5 left-5 inline-flex items-center gap-1.5 text-sm font-semibold"
          style={{ color: '#64748b' }}
        >
          <ArrowLeft className="w-4 h-4" />
          NearByBazar
        </Link>

        <div className="w-full max-w-sm mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
