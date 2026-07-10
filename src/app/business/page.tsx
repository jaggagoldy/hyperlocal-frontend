'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { useLanguageStore } from '@/store/languageStore';
import { Store, MessageCircle, Check, Banknote, Smartphone, Monitor, LayoutDashboard, ChevronDown } from 'lucide-react';

const EM = '#10b981';

export default function BusinessLandingPage() {
  const router = useRouter();
  const { isAuthenticated, user, _hasHydrated } = useAuthStore();
  const { language } = useLanguageStore();
  const hi = language === 'hi';
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  const isVendor = mounted && _hasHydrated && !!user?.hasVendorProfile;
  const loggedIn = mounted && _hasHydrated && isAuthenticated;

  const primaryHref = !loggedIn
    ? '/login?redirect=/vendor/register'
    : isVendor
      ? '/vendor-dashboard/workspace'
      : '/vendor/register';
  const primaryLabel = isVendor
    ? (hi ? 'बिज़नेस डैशबोर्ड खोलें' : 'Go to Business Dashboard')
    : (hi ? 'अपना व्यवसाय सूचीबद्ध करें — मुफ़्त' : 'List your business — free');

  const t = (en: string, h: string) => (hi ? h : en);

  const WHY = [
    { icon: Banknote, title: t('Free listing', 'मुफ़्त लिस्टिंग'), sub: t('Live in minutes', 'मिनटों में लाइव') },
    { icon: MessageCircle, title: t('Direct leads', 'सीधे लीड'), sub: t('No middleman', 'कोई बिचौलिया नहीं') },
    { icon: Check, title: t('0% commission', '0% कमीशन'), sub: t('Keep every rupee', 'हर रुपया आपका') },
    { icon: Smartphone, title: t('Your own app', 'अपना खुद का ऐप'), sub: t('Storefront + PWA', 'स्टोरफ्रंट + PWA') },
  ];
  const STEPS = [
    t('List your business in 2 minutes', '2 मिनट में अपना व्यवसाय सूचीबद्ध करें'),
    t('Get discovered by nearby customers', 'आस-पास के ग्राहकों तक पहुँचें'),
    t('Receive orders and bookings on WhatsApp', 'WhatsApp पर ऑर्डर और बुकिंग पाएँ'),
  ];
  const CATS = [
    t('Food', 'खाना'), t('Grocery', 'किराना'), t('Salon', 'सैलून'), t('Health', 'स्वास्थ्य'),
    t('Retail', 'रिटेल'), t('Home Repair', 'घर मरम्मत'), t('Fitness', 'फिटनेस'), t('Education', 'शिक्षा'),
  ];
  const FAQS = [
    { q: t('Is it really free?', 'क्या यह वाकई मुफ़्त है?'), a: t('Yes — listing your business is free with 0% commission on orders.', 'हाँ — लिस्टिंग मुफ़्त है और ऑर्डर पर 0% कमीशन।') },
    { q: t('How do customers reach me?', 'ग्राहक मुझ तक कैसे पहुँचते हैं?'), a: t('Customers call or message you directly on WhatsApp — no middleman.', 'ग्राहक सीधे WhatsApp पर कॉल या मैसेज करते हैं — कोई बिचौलिया नहीं।') },
    { q: t('Do I need a computer?', 'क्या मुझे कंप्यूटर चाहिए?'), a: t('No — go live from your phone. Design your full storefront later on a computer.', 'नहीं — फ़ोन से लाइव हों। पूरा स्टोरफ्रंट बाद में कंप्यूटर पर बनाएँ।') },
    { q: t('Can I keep my customer account?', 'क्या मेरा ग्राहक खाता रहेगा?'), a: t('Yes — the same account works for both. Switch between Customer and Business anytime.', 'हाँ — एक ही खाता दोनों के लिए। ग्राहक और व्यवसाय के बीच कभी भी स्विच करें।') },
  ];

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  return (
    <div style={{ background: '#020617', color: '#e2e8f0', minHeight: '100vh' }}>
      {/* Top bar */}
      <header style={{ background: '#070d1a', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
        <div className="max-w-lg mx-auto px-4 h-14 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2" style={{ textDecoration: 'none' }}>
            <span className="w-6 h-6 rounded-md flex items-center justify-center text-[13px] font-black" style={{ background: EM, color: '#052e16' }}>N</span>
            <span className="font-black text-white text-sm">NearByBazar <span style={{ color: '#34d399' }}>{t('for Business', 'व्यवसाय के लिए')}</span></span>
          </Link>
          <Link href="/vendor/login" className="text-xs font-bold" style={{ color: '#94a3b8', textDecoration: 'none' }}>{t('Sign in', 'साइन इन')}</Link>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 pb-28">
        {/* Hero */}
        <section className="pt-8">
          <span className="inline-block text-[11px] font-bold rounded-full px-3 py-1" style={{ color: '#34d399', background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.25)' }}>
            {t('For local businesses', 'स्थानीय व्यवसायों के लिए')}
          </span>
          <h1 className="text-3xl font-black text-white mt-3 leading-tight">{t('Grow your business, locally', 'अपना व्यवसाय बढ़ाएँ, लोकल')}</h1>
          <p className="mt-2 text-sm" style={{ color: '#94a3b8' }}>
            {t('Get orders, bookings, and calls from customers near you — with your own storefront.', 'अपने आस-पास के ग्राहकों से ऑर्डर, बुकिंग और कॉल पाएँ — अपने खुद के स्टोरफ्रंट के साथ।')}
          </p>

          <Link href={primaryHref} className="mt-5 flex items-center justify-center gap-2 h-12 rounded-2xl font-black text-sm" style={{ background: EM, color: '#052e16', textDecoration: 'none' }}>
            {isVendor ? <LayoutDashboard className="w-4 h-4" /> : <Store className="w-4 h-4" />}
            {primaryLabel}
          </Link>
          <Link href="/contact" className="mt-2.5 flex items-center justify-center gap-2 h-11 rounded-2xl font-bold text-sm" style={{ border: '1px solid rgba(255,255,255,.14)', color: '#cbd5e1', textDecoration: 'none' }}>
            <MessageCircle className="w-4 h-4" /> {t('Talk to us', 'हमसे बात करें')}
          </Link>

          <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-xs font-medium" style={{ color: '#94a3b8' }}>
            {[t('0% commission', '0% कमीशन'), t('WhatsApp leads', 'WhatsApp लीड'), t('Free forever', 'हमेशा मुफ़्त')].map(x => (
              <span key={x} className="inline-flex items-center gap-1.5"><Check className="w-3.5 h-3.5" style={{ color: '#34d399' }} /> {x}</span>
            ))}
          </div>
        </section>

        {/* Why */}
        <section className="mt-9">
          <p className="text-[11px] font-black uppercase tracking-wider mb-3" style={{ color: '#64748b' }}>{t('Why NearByBazar', 'क्यों NearByBazar')}</p>
          <div className="grid grid-cols-2 gap-2.5">
            {WHY.map((w) => (
              <div key={w.title} className="rounded-2xl p-3.5" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.06)' }}>
                <w.icon className="w-5 h-5" style={{ color: '#34d399' }} />
                <p className="text-white font-extrabold mt-2 text-sm">{w.title}</p>
                <p className="text-xs mt-0.5" style={{ color: '#64748b' }}>{w.sub}</p>
              </div>
            ))}
          </div>
        </section>

        {/* How it works */}
        <section className="mt-9">
          <p className="text-[11px] font-black uppercase tracking-wider mb-3" style={{ color: '#64748b' }}>{t('How it works', 'यह कैसे काम करता है')}</p>
          <div className="flex flex-col gap-2">
            {STEPS.map((s, i) => (
              <div key={i} className="flex items-center gap-3 rounded-xl p-3" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.06)' }}>
                <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-black shrink-0" style={{ background: 'rgba(16,185,129,.15)', color: '#34d399' }}>{i + 1}</span>
                <span className="text-sm">{s}</span>
              </div>
            ))}
          </div>
        </section>

        {/* Mobile → desktop note */}
        <div className="mt-6 flex items-start gap-3 rounded-2xl p-3.5" style={{ background: 'rgba(245,158,11,.07)', border: '1px solid rgba(245,158,11,.2)' }}>
          <Monitor className="w-4 h-4 shrink-0 mt-0.5" style={{ color: '#f59e0b' }} />
          <span className="text-xs" style={{ color: '#94a3b8' }}>{t('Go live on mobile now — design your full storefront on a computer later.', 'अभी मोबाइल पर लाइव हों — पूरा स्टोरफ्रंट बाद में कंप्यूटर पर बनाएँ।')}</span>
        </div>

        {/* Categories */}
        <section className="mt-9">
          <p className="text-[11px] font-black uppercase tracking-wider mb-3" style={{ color: '#64748b' }}>{t('Businesses we serve', 'हम किनकी सेवा करते हैं')}</p>
          <div className="flex flex-wrap gap-2">
            {CATS.map(c => (
              <span key={c} className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.08)', color: '#94a3b8' }}>{c}</span>
            ))}
            <span className="px-3 py-1.5 rounded-full text-xs font-bold" style={{ color: '#34d399' }}>+8 {t('more', 'और')}</span>
          </div>
        </section>

        {/* Stats */}
        <section className="mt-9 grid grid-cols-3 rounded-2xl overflow-hidden" style={{ border: '1px solid rgba(255,255,255,.06)' }}>
          {[['2,400+', t('Businesses', 'व्यवसाय')], ['28', t('Districts', 'ज़िले')], ['₹0', t('Commission', 'कमीशन')]].map(([n, l], i) => (
            <div key={l} className="py-4 text-center" style={{ background: '#0a0f1e', borderLeft: i ? '1px solid rgba(255,255,255,.06)' : 'none' }}>
              <p className="text-white font-black text-lg">{n}</p>
              <p className="text-[10px] font-bold uppercase tracking-wider mt-0.5" style={{ color: '#64748b' }}>{l}</p>
            </div>
          ))}
        </section>

        {/* FAQ */}
        <section className="mt-9">
          <p className="text-[11px] font-black uppercase tracking-wider mb-3" style={{ color: '#64748b' }}>{t('Questions', 'सवाल')}</p>
          <div className="flex flex-col gap-2">
            {FAQS.map((f, i) => (
              <button key={i} onClick={() => setOpenFaq(openFaq === i ? null : i)} className="text-left rounded-xl p-3.5" style={{ background: '#0f172a', border: '1px solid rgba(255,255,255,.06)' }}>
                <div className="flex items-center justify-between gap-3">
                  <span className="text-sm font-bold text-white">{f.q}</span>
                  <ChevronDown className={`w-4 h-4 shrink-0 transition-transform ${openFaq === i ? 'rotate-180' : ''}`} style={{ color: '#64748b' }} />
                </div>
                {openFaq === i && <p className="text-xs mt-2 leading-relaxed" style={{ color: '#94a3b8' }}>{f.a}</p>}
              </button>
            ))}
          </div>
        </section>
      </main>

      {/* Bottom CTA */}
      <div style={{ background: '#070d1a', borderTop: '1px solid rgba(255,255,255,.06)' }}>
        <div className="max-w-lg mx-auto px-4 py-4 pb-safe">
          <Link href={primaryHref} className="flex items-center justify-center h-12 rounded-2xl font-black text-sm" style={{ background: EM, color: '#052e16', textDecoration: 'none' }}>
            {primaryLabel}
          </Link>
          <p className="text-center text-xs mt-2" style={{ color: '#64748b' }}>
            {t('Already a partner?', 'पहले से पार्टनर हैं?')} <Link href="/vendor/login" style={{ color: '#34d399' }}>{t('Sign in', 'साइन इन')}</Link>
          </p>
        </div>
      </div>
    </div>
  );
}
