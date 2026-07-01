'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { usePathname } from 'next/navigation';

interface Step {
  icon: string;
  title: string;
  body: string;
  target: string; // CSS selector of the homepage element to spotlight
  color: string;
  btnBg: string;
  btnColor: string;
}

// Each step points at a REAL homepage element (data-tour anchors in
// GuestLandingView), so the spotlight tracks the element's actual position
// instead of guessing with hardcoded viewport percentages.
const STEPS: Step[] = [
  {
    icon: '🔍',
    title: 'Find anything near you',
    body: 'Search for food, salons, doctors or repairs — anything in your city.',
    target: '[data-tour="search"]',
    color: 'rgba(16,185,129,.9)',
    btnBg: '#10b981',
    btnColor: '#052e16',
  },
  {
    icon: '⚡',
    title: 'Quick shortcuts',
    body: 'One tap to order food, book a salon, find a doctor or a home-repair pro.',
    target: '[data-tour="shortcuts"]',
    color: 'rgba(139,92,246,.9)',
    btnBg: '#7c3aed',
    btnColor: '#fff',
  },
  {
    icon: '🗂️',
    title: 'Browse by category',
    body: 'Explore all 16 local categories — restaurants, beauty, repairs and more.',
    target: '[data-tour="categories"]',
    color: 'rgba(56,189,248,.9)',
    btnBg: '#38bdf8',
    btnColor: '#082f49',
  },
  {
    icon: '🏪',
    title: 'Tap any business to order or book',
    body: 'Open a business to see menu, prices & reviews — then order, book or enquire in seconds.',
    target: '[data-tour="listings"]',
    color: 'rgba(245,158,11,.9)',
    btnBg: '#f59e0b',
    btnColor: '#431407',
  },
];

const TOTAL = STEPS.length;
const COMPLETE_STEP = TOTAL + 1;
const PAD = 10; // spotlight padding around the target element

interface Rect { top: number; left: number; width: number; height: number; }

export function SpotlightTour() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);
  const [rect, setRect] = useState<Rect | null>(null);
  const rafRef = useRef<number | null>(null);
  const pathname = usePathname();

  const triggerTour = useCallback(() => {
    setStep(1);
    setIsOpen(true);
  }, []);

  useEffect(() => {
    const handler = () => { if (pathname === '/') triggerTour(); };
    window.addEventListener('tutorial_modal_closed', handler);
    return () => window.removeEventListener('tutorial_modal_closed', handler);
  }, [triggerTour, pathname]);

  useEffect(() => {
    const handler = () => triggerTour();
    window.addEventListener('relaunch_spotlight_tour', handler);
    return () => window.removeEventListener('relaunch_spotlight_tour', handler);
  }, [triggerTour]);

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

  const isComplete = step === COMPLETE_STEP;
  const current = !isComplete ? STEPS[step - 1] : null;

  // Scroll the current target into view whenever the step changes.
  useEffect(() => {
    if (!isOpen || !current) return;
    const el = document.querySelector(current.target) as HTMLElement | null;
    el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  }, [isOpen, current]);

  // Track the target's live position (handles the scroll animation, resize, etc.).
  useEffect(() => {
    if (!isOpen || !current) { setRect(null); return; }
    const tick = () => {
      const el = document.querySelector(current.target) as HTMLElement | null;
      if (el) {
        const r = el.getBoundingClientRect();
        setRect({ top: r.top, left: r.left, width: r.width, height: r.height });
      } else {
        setRect(null);
      }
      rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
  }, [isOpen, current]);

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

  const isLastStep = step === TOTAL;
  const dotColors = STEPS.map(s => s.btnBg);

  // Put the tooltip on the opposite side of the highlighted element so it never
  // covers it. If the target's centre is in the lower half, dock the card to the top.
  const targetCentreY = rect ? rect.top + rect.height / 2 : 0;
  const dockTop = rect ? targetCentreY > window.innerHeight * 0.55 : false;

  return (
    <div className="fixed inset-0 z-[300]" style={{ pointerEvents: 'none' }}>

      {/* ── Final screen ── */}
      {isComplete && (
        <div
          className="absolute inset-0 flex flex-col items-center justify-center px-8"
          style={{ background: 'rgba(2,6,23,.92)', pointerEvents: 'auto' }}
        >
          <div className="w-full max-w-sm flex flex-col items-center">
            <div
              className="w-24 h-24 rounded-full flex items-center justify-center mb-5"
              style={{ background: 'rgba(16,185,129,.1)', border: '2px solid rgba(16,185,129,.35)', boxShadow: '0 0 60px rgba(16,185,129,.25)' }}
            >
              <span className="text-[44px]">🎉</span>
            </div>
            <p className="text-[22px] font-black text-white text-center mb-2">You&apos;re all set!</p>
            <p className="text-[13px] text-center leading-relaxed mb-7" style={{ color: '#94a3b8' }}>
              That&apos;s the basics. Now go explore what&apos;s near you — food, services, shops and more.
            </p>
            {/* Video walkthrough intentionally omitted until we publish one. */}
            <button
              onClick={handleFinish}
              className="w-full h-12 rounded-2xl text-[14px] font-black"
              style={{ background: 'linear-gradient(135deg,#10b981,#059669)', color: '#052e16', boxShadow: '0 8px 20px rgba(16,185,129,.3)' }}
            >
              Start Exploring →
            </button>
          </div>
        </div>
      )}

      {/* ── Steps 1-4: single dim + spotlight cutout that tracks the element ── */}
      {!isComplete && current && (
        <>
          {rect ? (
            <div
              style={{
                position: 'absolute',
                top: rect.top - PAD,
                left: rect.left - PAD,
                width: rect.width + PAD * 2,
                height: rect.height + PAD * 2,
                borderRadius: 16,
                // One shadow paints the dim everywhere EXCEPT this rectangle (the "hole").
                boxShadow: '0 0 0 9999px rgba(2,6,23,.72)',
                border: `2px solid ${current.color}`,
                transition: 'top .15s ease, left .15s ease, width .15s ease, height .15s ease',
                pointerEvents: 'none',
              }}
            />
          ) : (
            // Fallback dim if the element isn't found (e.g. still loading).
            <div className="absolute inset-0" style={{ background: 'rgba(2,6,23,.72)', pointerEvents: 'none' }} />
          )}

          {/* Tooltip card */}
          <div
            className="absolute left-0 right-0 px-4"
            style={{ [dockTop ? 'top' : 'bottom']: 0, pointerEvents: 'auto' } as React.CSSProperties}
          >
            <div
              className="mx-auto w-full max-w-lg"
              style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.08)', borderRadius: 24, padding: '20px 22px', marginTop: dockTop ? 16 : 0, marginBottom: dockTop ? 0 : 24, boxShadow: '0 -10px 40px rgba(0,0,0,.4)' }}
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
                <span className="text-[10px] font-black" style={{ color: '#475569' }}>
                  Step {step} of {TOTAL}
                </span>
              </div>

              <p className="text-[16px] font-black text-white mb-1.5">{current.icon} {current.title}</p>
              <p className="text-[12.5px] leading-relaxed mb-4" style={{ color: '#94a3b8' }}>{current.body}</p>

              <div className="flex gap-2">
                {step > 1 ? (
                  <button
                    onClick={handleBack}
                    className="h-10 flex-1 rounded-xl text-[12px] font-black"
                    style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8' }}
                  >
                    ← Back
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    className="h-10 flex-1 rounded-xl text-[12px] font-black"
                    style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8' }}
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
          </div>
        </>
      )}
    </div>
  );
}
