'use client';

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { useRegions, districtsForState } from '@/lib/useRegions';
import { ArrowLeft, ArrowRight, Check, Loader2, Store, MapPin, Phone, Sparkles, Monitor, PartyPopper } from 'lucide-react';

// Lightweight emoji per vertical — avoids heavy icon mapping and reads well on mobile.
const VERTICAL_EMOJI: Record<string, string> = {
  FOOD_BEVERAGE: '🍽️', GROCERY: '🛒', RETAIL: '🛍️', SALON_BEAUTY: '💇', HEALTH_MEDICAL: '🩺',
  HOME_ESSENTIALS: '🔧', PROFESSIONAL_SERVICES: '💼', EDUCATION: '🎓', FITNESS: '💪', AUTOMOTIVE: '🚗',
  REAL_ESTATE: '🏠', HOTELS: '🏨', EVENTS: '🎉', PERSONAL_SERVICES: '🧵', TRAVEL: '✈️', FINANCIAL_SERVICES: '💰',
};

const EM = '#10b981';

/**
 * Lightweight, mobile-safe "Add your business" onboarding. Creates a BusinessProfile
 * for the CURRENT logged-in user (POST /business/register also flips hasVendorProfile),
 * then switches them into vendor mode — which lights up the customer↔vendor account
 * switcher for dual-profile users. The full storefront builder (menu/photos/theme)
 * lives in the dashboard's "Design Storefront" and is best used on desktop.
 */
export default function AddBusinessFlow() {
  const router = useRouter();
  const { user, token, isAuthenticated, _hasHydrated, setActiveBusiness, updateToken, setAuth } = useAuthStore();
  const regionStates = useRegions();

  const [verticals, setVerticals] = useState<any[]>([]);
  const [step, setStep] = useState(1);
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  // form
  const [businessName, setBusinessName] = useState('');
  const [vertical, setVertical] = useState<any | null>(null);
  const [subcategory, setSubcategory] = useState<string>('');
  const [stateName, setStateName] = useState('');
  const [district, setDistrict] = useState('');
  const [locality, setLocality] = useState('');
  const [pincode, setPincode] = useState('');
  const [phone, setPhone] = useState('');

  // Auth guard — you must have an account first (we reuse it and add a vendor profile).
  useEffect(() => {
    if (!_hasHydrated) return;
    if (!isAuthenticated) {
      router.push('/login?redirect=/vendor/register');
      return;
    }
    if (user?.hasVendorProfile) {
      // Already a vendor — go straight to the business dashboard.
      router.push('/vendor-dashboard/workspace');
      return;
    }
    apiClient.get('/verticals').then(r => setVerticals(r.data?.data || [])).catch(() => {});
  }, [_hasHydrated, isAuthenticated, user?.hasVendorProfile, router]);

  useEffect(() => { if (user?.phoneNumber) setPhone(user.phoneNumber); }, [user?.phoneNumber]);

  const liveVerticals = useMemo(() => verticals.filter((v: any) => !v.comingSoon), [verticals]);
  const districts = useMemo(() => districtsForState(regionStates, stateName), [regionStates, stateName]);

  const canNext =
    step === 1 ? businessName.trim().length >= 2 && !!vertical :
    step === 2 ? !!stateName && !!district && locality.trim().length >= 2 && /^\d{6}$/.test(pincode) :
    /^[6-9]\d{9}$/.test(phone);

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);
    try {
      const res = await apiClient.post('/business/register', {
        businessName: businessName.trim(),
        businessType: vertical.key,
        subcategorySlug: subcategory || undefined,
        state: stateName,
        district,
        cityName: district, // finer city defaults to the district
        localityName: locality.trim(),
        pincode,
        connectionMode: 'REQUIRE_APPROVAL',
        metaData: { contactPhone: phone, displayName: businessName.trim() },
      });
      const data = res.data?.data || res.data;
      if (data?.id) setActiveBusiness(data.id);

      // The register response includes a fresh vendor token + user, so the client
      // becomes a vendor (dual-profile) without a re-login → switcher lights up.
      if (data?.token && data?.user) {
        updateToken(data.token, data.user);
      } else if (token && user) {
        setAuth(token, { ...user, hasVendorProfile: true, role: 'vendor', hasCustomerProfile: (user as any).hasCustomerProfile ?? true } as any, 'vendor');
      }
      // Trigger the one-time vendor guided tour on their first dashboard visit.
      localStorage.setItem('nbb_vendor_tour', '1');
      setSuccess(true);
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Could not create your business. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!_hasHydrated || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center" style={{ background: '#020617' }}><Loader2 className="w-7 h-7 animate-spin" style={{ color: EM }} /></div>;
  }

  // ── Success ──
  if (success) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 text-center" style={{ background: '#020617', color: '#fff' }}>
        <div className="w-20 h-20 rounded-full flex items-center justify-center mb-5" style={{ background: 'rgba(16,185,129,.12)', border: '2px solid rgba(16,185,129,.35)' }}>
          <PartyPopper className="w-9 h-9" style={{ color: '#34d399' }} />
        </div>
        <h1 className="text-2xl font-black mb-2">You&apos;re live! 🎉</h1>
        <p className="text-sm mb-1 font-bold" style={{ color: '#e2e8f0' }}>{businessName}</p>
        <p className="text-[13px] leading-relaxed mb-7 max-w-sm" style={{ color: '#64748b' }}>
          Your business is listed. Manage orders & enquiries from your dashboard. You can switch
          between your <span className="text-white font-semibold">Customer</span> and{' '}
          <span className="text-white font-semibold">Business</span> accounts anytime from the profile menu.
        </p>
        <button
          onClick={() => router.push('/vendor-dashboard/workspace')}
          className="w-full max-w-sm h-12 rounded-2xl font-black text-sm text-white mb-3"
          style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}
        >
          Open Business Dashboard →
        </button>
        <div className="w-full max-w-sm flex items-start gap-3 p-3.5 rounded-2xl text-left" style={{ background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.2)' }}>
          <Monitor className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
          <p className="text-[11px] leading-snug" style={{ color: '#94a3b8' }}>
            <span className="text-white font-bold">Next:</span> add your menu/photos and design your storefront app
            from <span className="text-white">Dashboard → Design Storefront</span> — best done on a computer.
          </p>
        </div>
      </div>
    );
  }

  const StepDots = () => (
    <div className="flex gap-1.5">
      {[1, 2, 3].map(i => (
        <div key={i} style={{ width: step === i ? 22 : 7, height: 6, borderRadius: 999, background: step >= i ? EM : 'rgba(255,255,255,.14)', transition: 'all .25s' }} />
      ))}
    </div>
  );

  const inputCls = 'w-full h-12 px-4 rounded-xl text-sm font-semibold text-white outline-none';
  const inputStyle = { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)' } as const;

  return (
    <div className="min-h-screen flex flex-col" style={{ background: '#020617', color: '#fff' }}>
      {/* Header */}
      <div className="sticky top-0 z-10 px-5 h-14 flex items-center justify-between" style={{ background: '#070d1a', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ background: EM }}><Store className="w-4 h-4 text-white" /></div>
          <span className="text-sm font-black">NearByBazar <span style={{ color: '#34d399' }}>for Business</span></span>
        </div>
        <StepDots />
      </div>

      <div className="flex-1 overflow-y-auto px-5 py-6 pb-28 max-w-lg w-full mx-auto">
        {/* Step 1 — business + category */}
        {step === 1 && (
          <div>
            <h1 className="text-xl font-black mb-1">Tell us about your business</h1>
            <p className="text-[13px] mb-5" style={{ color: '#64748b' }}>List it free — get calls, orders & bookings from customers near you.</p>

            <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: '#64748b' }}>Business name</label>
            <input value={businessName} onChange={e => setBusinessName(e.target.value)} placeholder="e.g. Sharma Sweets" className={`${inputCls} mt-1.5 mb-5`} style={inputStyle} />

            <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: '#64748b' }}>What do you offer?</label>
            <div className="grid grid-cols-2 gap-2.5 mt-2">
              {liveVerticals.map((v: any) => {
                const active = vertical?.key === v.key;
                return (
                  <button key={v.key} onClick={() => { setVertical(v); setSubcategory(''); }}
                    className="flex items-center gap-2.5 p-3 rounded-xl text-left transition-all active:scale-[.98]"
                    style={active ? { background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.4)' } : { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}>
                    <span className="text-xl">{VERTICAL_EMOJI[v.key] || '🏪'}</span>
                    <span className="text-[12px] font-bold leading-tight" style={{ color: active ? '#fff' : '#cbd5e1' }}>{v.label}</span>
                  </button>
                );
              })}
            </div>

            {vertical?.subcategories?.length > 0 && (
              <div className="mt-5">
                <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: '#64748b' }}>Type (optional)</label>
                <div className="flex flex-wrap gap-2 mt-2">
                  {vertical.subcategories.map((s: any) => {
                    const active = subcategory === s.slug;
                    return (
                      <button key={s.slug} onClick={() => setSubcategory(active ? '' : s.slug)}
                        className="px-3.5 h-9 rounded-full text-[12px] font-bold transition-all"
                        style={active ? { background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.4)', color: '#34d399' } : { background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8' }}>
                        {s.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Step 2 — location */}
        {step === 2 && (
          <div>
            <h1 className="text-xl font-black mb-1 flex items-center gap-2"><MapPin className="w-5 h-5" style={{ color: EM }} /> Where are you located?</h1>
            <p className="text-[13px] mb-5" style={{ color: '#64748b' }}>So nearby customers can find you.</p>

            <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: '#64748b' }}>State</label>
            <select value={stateName} onChange={e => { setStateName(e.target.value); setDistrict(''); }} className={`${inputCls} mt-1.5 mb-4 appearance-none`} style={inputStyle}>
              <option value="" style={{ background: '#0f172a' }}>Select state</option>
              {regionStates.map(s => <option key={s.name} value={s.name} style={{ background: '#0f172a' }}>{s.name}</option>)}
            </select>

            <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: '#64748b' }}>District</label>
            <select value={district} onChange={e => setDistrict(e.target.value)} disabled={!stateName} className={`${inputCls} mt-1.5 mb-4 appearance-none disabled:opacity-40`} style={inputStyle}>
              <option value="" style={{ background: '#0f172a' }}>Select district</option>
              {districts.map(d => <option key={d.slug} value={d.name} style={{ background: '#0f172a' }}>{d.name}</option>)}
            </select>

            <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: '#64748b' }}>Locality / area</label>
            <input value={locality} onChange={e => setLocality(e.target.value)} placeholder="e.g. Model Town" className={`${inputCls} mt-1.5 mb-4`} style={inputStyle} />

            <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: '#64748b' }}>Pincode</label>
            <input value={pincode} onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} inputMode="numeric" placeholder="6-digit pincode" className={`${inputCls} mt-1.5`} style={inputStyle} />
          </div>
        )}

        {/* Step 3 — contact + review */}
        {step === 3 && (
          <div>
            <h1 className="text-xl font-black mb-1 flex items-center gap-2"><Phone className="w-5 h-5" style={{ color: EM }} /> How can customers reach you?</h1>
            <p className="text-[13px] mb-5" style={{ color: '#64748b' }}>We share this only when a customer wants to connect.</p>

            <label className="text-[11px] font-black uppercase tracking-wider" style={{ color: '#64748b' }}>Business phone (WhatsApp)</label>
            <input value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} inputMode="numeric" placeholder="10-digit mobile" className={`${inputCls} mt-1.5 mb-6`} style={inputStyle} />

            <div className="rounded-2xl p-4" style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.08)' }}>
              <p className="text-[11px] font-black uppercase tracking-wider mb-3" style={{ color: '#64748b' }}>Review</p>
              {[
                ['Business', `${VERTICAL_EMOJI[vertical?.key] || ''} ${businessName}`],
                ['Category', vertical?.label + (subcategory ? ` · ${vertical?.subcategories?.find((s: any) => s.slug === subcategory)?.label ?? ''}` : '')],
                ['Location', `${locality}, ${district}, ${stateName} — ${pincode}`],
                ['Phone', phone],
              ].map(([k, v]) => (
                <div key={k} className="flex justify-between gap-4 py-1.5 text-[13px]">
                  <span style={{ color: '#64748b' }}>{k}</span>
                  <span className="font-semibold text-right text-white">{v}</span>
                </div>
              ))}
            </div>

            <div className="flex items-start gap-2 mt-4 text-[11px]" style={{ color: '#64748b' }}>
              <Sparkles className="w-3.5 h-3.5 shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
              You&apos;ll be able to add your menu, photos & a full storefront app after this — best on a computer.
            </div>
          </div>
        )}
      </div>

      {/* Sticky footer nav */}
      <div className="fixed bottom-0 left-0 right-0 px-5 py-4 pb-safe flex gap-3 max-w-lg mx-auto" style={{ background: 'linear-gradient(to top, #020617 70%, transparent)' }}>
        {step > 1 && (
          <button onClick={() => setStep(s => s - 1)} className="h-12 px-5 rounded-2xl font-black text-sm flex items-center gap-1.5" style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#94a3b8' }}>
            <ArrowLeft className="w-4 h-4" /> Back
          </button>
        )}
        {step < 3 ? (
          <button onClick={() => canNext && setStep(s => s + 1)} disabled={!canNext}
            className="flex-1 h-12 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-1.5 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
            Continue <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <button onClick={handleSubmit} disabled={!canNext || submitting}
            className="flex-1 h-12 rounded-2xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-40"
            style={{ background: 'linear-gradient(135deg,#059669,#10b981)' }}>
            {submitting ? <><Loader2 className="w-4 h-4 animate-spin" /> Creating…</> : <><Check className="w-4 h-4" /> Create my business</>}
          </button>
        )}
      </div>
    </div>
  );
}
