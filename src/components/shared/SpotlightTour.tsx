'use client';

import { useState, useEffect, useCallback } from 'react';
import { usePathname } from 'next/navigation';

interface Step {
  icon: string;
  title: string;
  body: string;
  spotlightTop: string;
  spotlightHeight: string;
  color: string;
  btnBg: string;
  btnColor: string;
}

const STEPS: Step[] = [
  {
    icon: '🔍',
    title: 'Find anything near you',
    body: 'Search for food, salons, doctors, repair services — anything in your city.',
    spotlightTop: '14%',
    spotlightHeight: '7%',
    color: 'rgba(16,185,129,.7)',
    btnBg: '#10b981',
    btnColor: '#052e16',
  },
  {
    icon: '📂',
    title: 'Browse by category',
    body: 'Tap a category chip to filter restaurants, salons, shops and more instantly.',
    spotlightTop: '23%',
    spotlightHeight: '5%',
    color: 'rgba(139,92,246,.7)',
    btnBg: '#7c3aed',
    btnColor: '#fff',
  },
  {
    icon: '👆',
    title: 'Tap any business',
    body: 'See their full menu, prices, reviews and place an order or booking in seconds.',
    spotlightTop: '33%',
    spotlightHeight: '14%',
    color: 'rgba(56,189,248,.7)',
    btnBg: '#38bdf8',
    btnColor: '#082f49',
  },
  {
    icon: '🛒',
    title: 'Order, book, or enquire',
    body: 'Add items to your cart, pick a time slot for services, or send a quick enquiry — all in the app.',
    spotlightTop: '62%',
    spotlightHeight: '8%',
    color: 'rgba(245,158,11,.7)',
    btnBg: '#f59e0b',
    btnColor: '#431407',
  },
];

const TOTAL = STEPS.length;
const COMPLETE_STEP = TOTAL + 1;

export function SpotlightTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const pathname = usePathname();

  // Allow re-triggering the tour from the Profile page
  const triggerTour = useCallback(() => {
    setStep(1);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const handler = () => {
      // Only start on the home page; if user is elsewhere, mark done silently so they
      // aren't ambushed by spotlight cutouts pointing at the wrong elements.
      if (pathname === '/') {
        triggerTour();
      }
    };
    window.addEventListener('tutorial_modal_closed', handler);
    return () => window.removeEventListener('tutorial_modal_closed', handler);
  }, [triggerTour, pathname]);

  // Allow Profile page to re-launch the tour via a custom event
  useEffect(() => {
    const handler = () => triggerTour();
    window.addEventListener('relaunch_spotlight_tour', handler);
    return () => window.removeEventListener('relaunch_spotlight_tour', handler);
  }, [triggerTour]);

  // Mount check: if tutorial_seen is set but tour is not done, show on next home visit
  useEffect(() => {
    if (
      pathname === '/' &&
      localStorage.getItem('tutorial_seen') &&
      !localStorage.getItem('spotlight_tour_done')
    ) {
      const t = setTimeout(() => triggerTour(), 800);
      return () => clearTimeout(t);
    }
  }, [pathname, triggerTour]);

  const handleFinish = useCallback(() => {
    localStorage.setItem('spotlight_tour_done', 'true');
    setIsOpen(false);
  }, []);

  const handleNext = () => {
    if (step < COMPLETE_STEP) setStep(s => s + 1);
    else handleFinish();
  };

  const handleBack = () => setStep(s => Math.max(1, s - 1));

  if (!isOpen) return null;

  const isComplete = step === COMPLETE_STEP;
  const current = STEPS[step - 1];
  const isLastStep = step === TOTAL;

  const dotColors = STEPS.map(s => s.btnBg);

  return (
    <div className="fixed inset-0 z-[300]" style={{ pointerEvents: 'all' }}>

      {/* ── Step complete (final screen) ── */}
      {isComplete && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-8"
          style={{ background: 'rgba(2,6,23,.92)' }}
        >
          <div
            className="w-24 h-24 rounded-full flex items-center justify-center mb-5"
            style={{ background: 'rgba(16,185,129,.1)', border: '2px solid rgba(16,185,129,.35)', boxShadow: '0 0 60px rgba(16,185,129,.25)' }}
          >
            <span className="text-[44px]">🎉</span>
          </div>
          <p className="text-[22px] font-black text-white text-center mb-2">Tour Complete!</p>
          <p className="text-[12px] text-center leading-relaxed mb-7" style={{ color: '#64748b' }}>
            You know the basics. Now go explore what&apos;s near you — food, services, shops and more.
          </p>

          <a
            href="/video-guides"
            onClick={handleFinish}
            className="w-full flex items-center gap-3 p-4 rounded-2xl mb-4"
            style={{ background: 'rgba(245,158,11,.08)', border: '1px solid rgba(245,158,11,.25)' }}
          >
            <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-[18px]" style={{ background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.25)' }}>▶️</div>
            <div>
              <p className="text-[12px] font-black text-white">Watch video tutorial</p>
              <p className="text-[10px] font-semibold" style={{ color: '#64748b' }}>2 min · See it in action</p>
            </div>
          </a>

          <button
            onClick={handleFinish}
            className="w-full h-12 rounded-2xl text-[14px] font-black"
            style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#052e16', boxShadow: '0 8px 20px rgba(16,185,129,.3)' }}
          >
            Start Exploring →
          </button>
          <p className="text-[11px] font-semibold mt-3" style={{ color: '#334155' }}>
            Rewatch anytime: Profile → Video Tutorials
          </p>
        </div>
      )}

      {/* ── Steps 1-4: dim overlay + spotlight cutout ── */}
      {!isComplete && current && (
        <>
          <div className="absolute inset-0" style={{ background: 'rgba(0,0,0,.62)', pointerEvents: 'none' }} />

          {/* Spotlight cutout */}
          <div
            style={{
              position: 'absolute',
              top: current.spotlightTop,
              left: 16,
              right: 16,
              height: current.spotlightHeight,
              background: 'transparent',
              borderRadius: 14,
              boxShadow: `0 0 0 9999px rgba(0,0,0,.62)`,
              border: `2px solid ${current.color}`,
              zIndex: 10,
              pointerEvents: 'none',
            }}
          />

          {/* Bottom tooltip */}
          <div
            className="absolute bottom-0 left-0 right-0 z-20"
            style={{ background: '#0f172a', borderTop: '1px solid rgba(255,255,255,.08)', borderRadius: '24px 24px 0 0', padding: '20px 24px 40px' }}
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex gap-1.5">
                {STEPS.map((_, i) => (
                  <div
                    key={i}
                    style={{
                      width: step === i + 1 ? 20 : 8,
                      height: 5,
                      borderRadius: 3,
                      background: step === i + 1 ? dotColors[i] : 'rgba(255,255,255,.15)',
                      transition: 'all .25s',
                    }}
                  />
                ))}
              </div>
              <span className="text-[10px] font-black" style={{ color: '#334155' }}>
                Step {step} of {TOTAL}
              </span>
            </div>

            <p className="text-[16px] font-black text-white mb-1.5">{current.icon} {current.title}</p>
            <p className="text-[12px] leading-relaxed mb-4" style={{ color: '#64748b' }}>{current.body}</p>

            <div className="flex gap-2">
              {step > 1 ? (
                <button
                  onClick={handleBack}
                  className="h-10 flex-1 rounded-xl text-[12px] font-black"
                  style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#64748b' }}
                >
                  ← Back
                </button>
              ) : (
                <button
                  onClick={handleFinish}
                  className="h-10 flex-1 rounded-xl text-[12px] font-black"
                  style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#64748b' }}
                >
                  Skip Tour
                </button>
              )}
              <button
                onClick={handleNext}
                className="h-10 flex-[2] rounded-xl text-[13px] font-black"
                style={{ background: current.btnBg, color: current.btnColor }}
              >
                {isLastStep ? 'Finish Tour →' : 'Next →'}
              </button>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
