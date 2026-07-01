'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Bell, Target, ArrowLeft, ChevronUp } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';

// ── palette (mirrors the design tokens) ──────────────────────────────────────
const C = {
  bg: '#020617', card: '#0f172a', card2: '#1e293b',
  br: 'rgba(255,255,255,.06)', br2: 'rgba(255,255,255,.12)',
  em: '#10b981', emL: '#34d399', am: '#f59e0b',
  t1: '#ffffff', t2: '#94a3b8', t3: '#64748b', t4: '#475569',
};

type Cat = 'app-builder' | 'analytics' | 'payments';
interface Feature { icon: string; title: string; body?: string; cat: Cat }
interface Release { version: string; date: string; isLatest?: boolean; layout: 'grid' | 'list'; features: Feature[] }

const RELEASES: Release[] = [
  {
    version: 'v2.3', date: 'June 2026', isLatest: true, layout: 'grid',
    features: [
      { icon: '🎓', title: 'Education Hub Launched', body: 'Guides, tutorials and learning paths for every vendor.', cat: 'app-builder' },
      { icon: '🤖', title: 'AI Menu Suggestions (Beta)', body: 'AI recommends dishes to add based on your category.', cat: 'app-builder' },
      { icon: '🌐', title: 'Hindi / English Storefront', body: "Your store now shows in the customer's preferred language.", cat: 'app-builder' },
      { icon: '📊', title: 'Bulk Dish Import via CSV', body: 'Upload your entire menu from a spreadsheet in one click.', cat: 'analytics' },
    ],
  },
  {
    version: 'v2.2', date: 'May 2026', layout: 'list',
    features: [
      { icon: '📊', title: 'Advanced Analytics Dashboard', body: 'Views, CTR, revenue trends', cat: 'analytics' },
      { icon: '📁', title: 'Export Orders as Excel', body: 'Download history & summaries', cat: 'analytics' },
      { icon: '💳', title: 'Razorpay Payout Integration', body: 'Withdraw earnings directly', cat: 'payments' },
    ],
  },
  {
    version: 'v2.1', date: 'April 2026', layout: 'list',
    features: [
      { icon: '🖼️', title: 'Multi-image Upload per Dish', cat: 'app-builder' },
      { icon: '💬', title: 'In-app Customer Messaging', cat: 'app-builder' },
    ],
  },
];

const COMING_SOON = [
  { icon: '💬', title: 'WhatsApp Order Alerts', body: 'Instant order pings on WhatsApp' },
  { icon: '📱', title: 'QR Code for Table Orders', body: 'Customers scan QR, place order' },
  { icon: '🎁', title: 'Loyalty Points System', body: 'Reward repeat customers' },
];

const INITIAL_VOTES = [
  { id: 'reviews', label: 'Customer reviews on orders', votes: 142 },
  { id: 'inventory', label: 'Inventory low-stock alerts', votes: 98 },
  { id: 'staff', label: 'Staff / sub-account access', votes: 71 },
];

const TABS: { id: 'all' | Cat; label: string }[] = [
  { id: 'all', label: 'All Updates' },
  { id: 'app-builder', label: 'App Builder' },
  { id: 'analytics', label: 'Analytics' },
  { id: 'payments', label: 'Payments' },
];

export default function VendorChangelog() {
  const { user } = useAuthStore();
  const [tab, setTab] = useState<'all' | Cat>('all');
  const [votes, setVotes] = useState(INITIAL_VOTES);
  const [voted, setVoted] = useState<Record<string, boolean>>({});
  const [subscribed, setSubscribed] = useState(false);

  const initials = (user?.name || 'RK').split(' ').map((w) => w[0]).join('').slice(0, 2).toUpperCase();

  const upvote = (id: string) => {
    setVotes((prev) => prev.map((v) => v.id === id ? { ...v, votes: v.votes + (voted[id] ? -1 : 1) } : v));
    setVoted((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const subscribe = () => {
    setSubscribed(true);
    toast.success("You're subscribed — we'll email you when we ship new features.");
  };

  const releases = RELEASES
    .map((r) => ({ ...r, features: tab === 'all' ? r.features : r.features.filter((f) => f.cat === tab) }))
    .filter((r) => r.features.length > 0);

  return (
    <div style={{ minHeight: '100vh', background: C.bg, color: C.t1 }}>
      {/* ── Top bar ── */}
      <div style={{ background: '#070d1a', borderBottom: `1px solid ${C.br}`, position: 'sticky', top: 0, zIndex: 40 }}>
        <div style={{ maxWidth: 1180, margin: '0 auto', padding: '0 20px', height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
            <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
              <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg,#10b981,#0d9488)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <Target style={{ width: 15, height: 15, color: '#fff' }} />
              </div>
              <span style={{ fontSize: 15, fontWeight: 900, color: '#fff' }}>NearByBazar</span>
            </Link>
            <div style={{ width: 1, height: 20, background: C.br2 }} className="hidden sm:block" />
            <span style={{ fontSize: 13, fontWeight: 800, color: C.am }} className="hidden sm:inline">🚀 What&apos;s New</span>
            <span style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 20, padding: '2px 10px', fontSize: 10, fontWeight: 800, color: C.emL }}>v2.3 Latest</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <button
              onClick={subscribe}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 11, fontWeight: 800,
                padding: '7px 14px', borderRadius: 10, cursor: 'pointer',
                background: subscribed ? 'rgba(16,185,129,.12)' : 'rgba(255,255,255,.04)',
                border: `1px solid ${subscribed ? 'rgba(16,185,129,.3)' : C.br2}`,
                color: subscribed ? C.emL : C.t2,
              }}
            >
              <Bell style={{ width: 13, height: 13 }} />
              {subscribed ? 'Subscribed' : 'Subscribe to updates'}
            </button>
            <div style={{ width: 32, height: 32, borderRadius: 999, background: 'linear-gradient(135deg,#0f172a,#1e293b)', border: `1px solid ${C.br2}`, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 800, color: C.t2 }}>
              {initials}
            </div>
          </div>
        </div>
      </div>

      {/* ── Body ── */}
      <div style={{ maxWidth: 1180, margin: '0 auto', padding: '24px 20px 80px' }} className="flex flex-col lg:flex-row gap-6">

        {/* changelog timeline */}
        <div style={{ flex: 1, minWidth: 0 }}>
          {/* back (mobile, since global navbar is hidden here) */}
          <Link href="/" style={{ display: 'inline-flex', alignItems: 'center', gap: 6, fontSize: 12, fontWeight: 700, color: C.t3, textDecoration: 'none', marginBottom: 18 }}>
            <ArrowLeft style={{ width: 14, height: 14 }} /> Back to NearByBazar
          </Link>

          {/* tabs */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, marginBottom: 24 }}>
            {TABS.map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setTab(t.id)}
                  style={{
                    borderRadius: 20, padding: '5px 16px', fontSize: 11, fontWeight: 800, cursor: 'pointer',
                    background: active ? 'rgba(245,158,11,.1)' : C.card2,
                    border: `1px solid ${active ? 'rgba(245,158,11,.25)' : C.br}`,
                    color: active ? C.am : C.t3,
                    transition: 'all .15s',
                  }}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          {releases.map((r, ri) => (
            <div key={r.version} style={{ display: 'flex', gap: 18, marginBottom: 28 }}>
              {/* timeline rail */}
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexShrink: 0, width: 16 }}>
                {r.isLatest ? (
                  <div style={{ width: 14, height: 14, borderRadius: 999, background: C.em, boxShadow: '0 0 0 4px rgba(16,185,129,.2)' }} />
                ) : (
                  <div style={{ width: 12, height: 12, borderRadius: 999, background: C.card2, border: `2px solid ${C.br2}`, marginTop: 1 }} />
                )}
                {ri < releases.length - 1 && <div style={{ width: 2, flex: 1, background: r.isLatest ? 'rgba(16,185,129,.15)' : 'rgba(255,255,255,.05)', marginTop: 8 }} />}
              </div>

              {/* release block */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <span style={{ fontSize: r.isLatest ? 17 : 15, fontWeight: 900, color: r.isLatest ? '#fff' : C.t2 }}>{r.version}</span>
                  <span style={{ fontSize: 11, color: C.t3, fontWeight: 600 }}>{r.date}</span>
                  {r.isLatest && (
                    <span style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', borderRadius: 20, padding: '2px 10px', fontSize: 9, fontWeight: 800, color: C.emL, letterSpacing: '.08em' }}>NEW</span>
                  )}
                </div>

                {r.layout === 'grid' ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {r.features.map((f) => (
                      <div key={f.title} style={{ background: C.card, border: `1px solid ${C.br}`, borderRadius: 12, padding: 14, display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                        <span style={{ fontSize: 20, flexShrink: 0 }}>{f.icon}</span>
                        <div>
                          <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 3 }}>{f.title}</p>
                          {f.body && <p style={{ fontSize: 11.5, color: C.t2, lineHeight: 1.5 }}>{f.body}</p>}
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {r.features.map((f) => (
                      <div key={f.title} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '11px 14px', background: C.card, border: `1px solid ${C.br}`, borderRadius: 10 }}>
                        <span style={{ fontSize: 15 }}>{f.icon}</span>
                        <div>
                          <span style={{ fontSize: 12.5, fontWeight: 700, color: '#fff' }}>{f.title}</span>
                          {f.body && <span style={{ fontSize: 11, color: C.t3, fontWeight: 500, marginLeft: 8 }}>{f.body}</span>}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* ── right rail ── */}
        <div className="w-full lg:w-[300px] lg:flex-shrink-0 flex flex-col gap-4">
          {/* coming soon */}
          <div style={{ background: 'linear-gradient(135deg,rgba(245,158,11,.08),rgba(139,92,246,.06))', border: '1px solid rgba(245,158,11,.2)', borderRadius: 16, padding: 18 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
              <span style={{ fontSize: 16 }}>🚀</span>
              <p style={{ fontSize: 11, fontWeight: 900, color: C.am, letterSpacing: '.04em' }}>COMING IN JULY 2026</p>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {COMING_SOON.map((c) => (
                <div key={c.title} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,.03)', borderRadius: 10, padding: '10px 12px' }}>
                  <span style={{ fontSize: 14 }}>{c.icon}</span>
                  <div>
                    <p style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>{c.title}</p>
                    <p style={{ fontSize: 10, color: C.t3, fontWeight: 600 }}>{c.body}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* feature voting */}
          <div style={{ background: C.card, border: `1px solid ${C.br}`, borderRadius: 14, padding: 16 }}>
            <p style={{ fontSize: 12, fontWeight: 900, color: '#fff', marginBottom: 4 }}>💡 Shape What We Build</p>
            <p style={{ fontSize: 11, color: C.t2, lineHeight: 1.6, marginBottom: 12 }}>Vote on upcoming features — the most upvoted get built first.</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 12 }}>
              {votes.map((v) => (
                <button
                  key={v.id}
                  onClick={() => upvote(v.id)}
                  style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px',
                    background: voted[v.id] ? 'rgba(16,185,129,.1)' : C.card2,
                    border: `1px solid ${voted[v.id] ? 'rgba(16,185,129,.3)' : 'transparent'}`,
                    borderRadius: 8, cursor: 'pointer', textAlign: 'left', transition: 'all .15s',
                  }}
                >
                  <span style={{ fontSize: 11, fontWeight: 700, color: C.t2 }}>{v.label}</span>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 2, fontSize: 10, fontWeight: 800, color: voted[v.id] ? C.emL : C.t3 }}>
                    <ChevronUp style={{ width: 12, height: 12 }} /> {v.votes}
                  </span>
                </button>
              ))}
            </div>
            <Link href="/whats-new" style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', width: '100%', fontSize: 11, fontWeight: 800, padding: '9px', borderRadius: 10, background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.25)', color: C.emL, textDecoration: 'none' }}>
              Vote on More Features
            </Link>
          </div>

          {/* all release notes */}
          <div style={{ background: C.card, border: `1px solid ${C.br}`, borderRadius: 14, padding: 14 }}>
            <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', color: C.t3, marginBottom: 10 }}>All Release Notes</p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                { v: 'v2.3 · June 2026', tag: 'Latest' },
                { v: 'v2.2 · May 2026', tag: '→' },
                { v: 'v2.1 · April 2026', tag: '→' },
                { v: 'v2.0 · March 2026', tag: '→' },
              ].map((rn, i) => (
                <div key={rn.v} style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11 }}>
                  <span style={{ fontWeight: 700, color: i === 0 ? C.t2 : C.t3 }}>{rn.v}</span>
                  <span style={{ color: i === 0 ? C.emL : C.t3, fontWeight: 700 }}>{rn.tag}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
