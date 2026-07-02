'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { LayoutDashboard, ShoppingBag, Package, Palette, PartyPopper } from 'lucide-react';

const STEPS = [
  { icon: LayoutDashboard, title: 'Your command center', body: 'See live orders, leads and stats the moment you log in.', accent: '#10b981' },
  { icon: ShoppingBag, title: 'Manage orders', body: 'Accept or reject incoming orders. The bell up top shows new ones as they arrive.', accent: '#6366f1' },
  { icon: Package, title: 'Build your catalog', body: 'Add your menu or services with prices — this is what customers order from.', accent: '#38bdf8' },
  { icon: Palette, title: 'Design your storefront', body: 'Customise your app icon, theme and share your QR code. Best done on a computer.', accent: '#f59e0b' },
];
const TOTAL = STEPS.length;

/**
 * One-time guided tour for new vendors. Triggered by the `nbb_vendor_tour` flag,
 * set when a vendor lists their first business (AddBusinessFlow).
 */
export default function VendorTour() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (localStorage.getItem('nbb_vendor_tour') === '1' && !localStorage.getItem('nbb_vendor_tour_done')) {
      const t = setTimeout(() => setOpen(true), 700);
      return () => clearTimeout(t);
    }
  }, []);

  const finish = () => {
    localStorage.setItem('nbb_vendor_tour_done', 'true');
    localStorage.removeItem('nbb_vendor_tour');
    setOpen(false);
  };

  if (!open) return null;
  const isDone = step >= TOTAL;
  const cur = STEPS[step];

  return (
    <div className="fixed inset-0 z-[300]" style={{ background: 'rgba(2,6,23,.72)', backdropFilter: 'blur(2px)' }}>
      <div className="absolute bottom-0 left-0 right-0" style={{ background: '#0f172a', borderTop: '1px solid rgba(255,255,255,.08)', borderRadius: '24px 24px 0 0', padding: '20px 22px 34px' }}>
        <div className="max-w-md mx-auto">
          {isDone ? (
            <div className="text-center">
              <div className="w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4" style={{ background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.35)' }}>
                <PartyPopper className="w-7 h-7" style={{ color: '#34d399' }} />
              </div>
              <p className="text-white text-lg font-black mb-1">You&apos;re all set! 🎉</p>
              <p className="text-[13px] mb-6" style={{ color: '#94a3b8' }}>Your business is live. Start by adding a few items to your catalog.</p>
              <div className="flex gap-2">
                <button onClick={finish} className="flex-1 h-11 rounded-xl font-black text-sm" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8' }}>Explore on my own</button>
                <button onClick={() => { finish(); router.push('/vendor-dashboard/workspace/management/catalog'); }} className="flex-[1.4] h-11 rounded-xl font-black text-sm text-white" style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>Add catalog items →</button>
              </div>
            </div>
          ) : (
            <>
              <div className="flex items-center justify-between mb-3">
                <div className="flex gap-1.5">
                  {STEPS.map((s, i) => (
                    <div key={i} style={{ width: step === i ? 20 : 7, height: 5, borderRadius: 3, background: step >= i ? s.accent : 'rgba(255,255,255,.15)', transition: 'all .25s' }} />
                  ))}
                </div>
                <span className="text-[10px] font-black" style={{ color: '#475569' }}>Step {step + 1} of {TOTAL}</span>
              </div>

              <div className="flex items-start gap-3 mb-5">
                <div className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0" style={{ background: `${cur.accent}22`, border: `1px solid ${cur.accent}55` }}>
                  <cur.icon className="w-5 h-5" style={{ color: cur.accent }} />
                </div>
                <div>
                  <p className="text-white text-[16px] font-black leading-tight">{cur.title}</p>
                  <p className="text-[13px] mt-1 leading-relaxed" style={{ color: '#94a3b8' }}>{cur.body}</p>
                </div>
              </div>

              <div className="flex gap-2">
                {step > 0 ? (
                  <button onClick={() => setStep((s) => s - 1)} className="h-11 px-5 rounded-xl font-black text-sm" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8' }}>Back</button>
                ) : (
                  <button onClick={finish} className="h-11 px-5 rounded-xl font-black text-sm" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8' }}>Skip</button>
                )}
                <button onClick={() => setStep((s) => s + 1)} className="flex-1 h-11 rounded-xl font-black text-sm text-white" style={{ background: `linear-gradient(135deg,${cur.accent},${cur.accent})` }}>
                  {step === TOTAL - 1 ? 'Finish' : 'Next'} →
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
