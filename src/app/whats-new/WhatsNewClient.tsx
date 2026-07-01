'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, MapPin, Star } from 'lucide-react';

interface NewBusiness {
  id: string;
  name: string;
  slug: string;
  locality: string;
  businessType: string;
  icon: string;
  label: string;
  rating: number;
  media?: { type: string; secureUrl: string }[];
}

interface PlatformUpdate {
  id: string;
  icon: string;
  iconBg: string;
  iconBorder: string;
  title: string;
  body: string;
  cta: string | null;
  ctaHref: string | null;
  date: string;
  accent: string;
  accentBg: string;
  accentBorder: string;
}

const ACCENT_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  FOOD_BEVERAGE:        { bg: 'rgba(239,68,68,.1)',   border: 'rgba(239,68,68,.25)',   text: '#f87171', label: 'Food' },
  GROCERY:              { bg: 'rgba(56,189,248,.1)',   border: 'rgba(56,189,248,.25)',  text: '#38bdf8', label: 'Grocery' },
  RETAIL:               { bg: 'rgba(56,189,248,.1)',   border: 'rgba(56,189,248,.25)',  text: '#38bdf8', label: 'Retail' },
  SALON_BEAUTY:         { bg: 'rgba(139,92,246,.1)',   border: 'rgba(139,92,246,.25)',  text: '#a78bfa', label: 'Salon' },
  HEALTH_MEDICAL:       { bg: 'rgba(16,185,129,.1)',   border: 'rgba(16,185,129,.25)',  text: '#34d399', label: 'Health' },
  HOME_ESSENTIALS:      { bg: 'rgba(251,146,60,.1)',   border: 'rgba(251,146,60,.25)',  text: '#fb923c', label: 'Home' },
  PROFESSIONAL_SERVICES:{ bg: 'rgba(245,158,11,.1)',   border: 'rgba(245,158,11,.25)',  text: '#fbbf24', label: 'Services' },
  EDUCATION:            { bg: 'rgba(245,158,11,.1)',   border: 'rgba(245,158,11,.25)',  text: '#fbbf24', label: 'Education' },
  FITNESS:              { bg: 'rgba(16,185,129,.1)',   border: 'rgba(16,185,129,.25)',  text: '#34d399', label: 'Fitness' },
  AUTOMOTIVE:           { bg: 'rgba(100,116,139,.1)',  border: 'rgba(100,116,139,.25)', text: '#94a3b8', label: 'Auto' },
};

const getAccent = (type: string) =>
  ACCENT_COLORS[type] || { bg: 'rgba(255,255,255,.06)', border: 'rgba(255,255,255,.1)', text: '#94a3b8', label: 'Business' };

export default function WhatsNewClient({
  newBusinesses,
  platformUpdates,
}: {
  newBusinesses: NewBusiness[];
  platformUpdates: PlatformUpdate[];
}) {
  const [tab, setTab] = useState<'near' | 'platform'>('near');

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#fff' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(15,23,42,.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        padding: '0 20px',
        position: 'sticky',
        top: 0,
        zIndex: 40,
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 56 }}>
            <Link href="/" style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#94a3b8', textDecoration: 'none', flexShrink: 0,
            }}>
              <ArrowLeft style={{ width: 16, height: 16 }} />
            </Link>
            <div style={{ flex: 1 }}>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 1 }}>Hisar, Haryana</p>
              <h1 style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>What&apos;s New 🆕</h1>
            </div>
          </div>

          {/* Tabs */}
          <div style={{
            display: 'flex',
            background: 'rgba(255,255,255,.04)',
            border: '1px solid rgba(255,255,255,.06)',
            borderRadius: 12, padding: 3, gap: 3, marginBottom: 16,
          }}>
            <button
              onClick={() => setTab('near')}
              style={{
                flex: 1, padding: '9px 8px', borderRadius: 9, fontSize: 12, fontWeight: 800,
                border: tab === 'near' ? '1px solid rgba(16,185,129,.25)' : '1px solid transparent',
                background: tab === 'near' ? 'rgba(16,185,129,.12)' : 'transparent',
                color: tab === 'near' ? '#34d399' : '#475569',
                cursor: 'pointer', transition: 'all .15s',
              }}
            >
              📍 Near You
            </button>
            <button
              onClick={() => setTab('platform')}
              style={{
                flex: 1, padding: '9px 8px', borderRadius: 9, fontSize: 12, fontWeight: 800,
                border: tab === 'platform' ? '1px solid rgba(139,92,246,.25)' : '1px solid transparent',
                background: tab === 'platform' ? 'rgba(139,92,246,.12)' : 'transparent',
                color: tab === 'platform' ? '#a78bfa' : '#475569',
                cursor: 'pointer', transition: 'all .15s',
              }}
            >
              🚀 Platform Updates
            </button>
          </div>
        </div>
      </div>

      {/* Content */}
      <div style={{ maxWidth: 640, margin: '0 auto', padding: '0 20px 80px' }}>

        {/* ── Near You tab ── */}
        {tab === 'near' && (
          <div style={{ paddingTop: 20 }}>
            {/* banner */}
            <div style={{
              background: 'linear-gradient(135deg,rgba(16,185,129,.08),rgba(56,189,248,.06))',
              border: '1px solid rgba(16,185,129,.18)',
              borderRadius: 16, padding: '14px 18px',
              display: 'flex', alignItems: 'center', gap: 14, marginBottom: 24,
            }}>
              <span style={{ fontSize: 28 }}>🎉</span>
              <div>
                <p style={{ fontSize: 14, fontWeight: 900, color: '#fff', marginBottom: 2 }}>
                  {newBusinesses.length} new businesses this week!
                </p>
                <p style={{ fontSize: 12, fontWeight: 600, color: '#64748b' }}>
                  <MapPin style={{ width: 11, height: 11, display: 'inline', marginRight: 3 }} />
                  New in Hisar · June 2026
                </p>
              </div>
            </div>

            {/* just joined label */}
            <p style={{
              fontSize: 10, fontWeight: 800, textTransform: 'uppercase',
              letterSpacing: '.12em', color: '#334155', marginBottom: 12,
            }}>
              Just Joined
            </p>

            {newBusinesses.length === 0 ? (
              <div style={{
                textAlign: 'center', padding: '48px 24px',
                background: 'rgba(255,255,255,.03)', borderRadius: 16,
                border: '1px solid rgba(255,255,255,.06)',
              }}>
                <p style={{ fontSize: 14, color: '#475569', fontWeight: 600 }}>
                  No new businesses to show right now. Check back soon!
                </p>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                {newBusinesses.map((biz) => {
                  const accent = getAccent(biz.businessType);
                  const thumb = biz.media?.find(m => m.type === 'shop_photo' || m.type === 'menu_photo')?.secureUrl;
                  return (
                    <Link
                      key={biz.id}
                      href={`/${biz.slug}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div style={{
                        background: '#0f172a', border: '1px solid rgba(255,255,255,.06)',
                        borderRadius: 16, padding: 14,
                        display: 'flex', gap: 14, alignItems: 'flex-start',
                        transition: 'border-color .15s',
                      }}>
                        {/* icon / thumb */}
                        <div style={{
                          width: 52, height: 52, borderRadius: 14, flexShrink: 0,
                          background: thumb ? 'transparent' : accent.bg,
                          border: `1px solid ${accent.border}`,
                          overflow: 'hidden',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 22,
                        }}>
                          {thumb
                            ? <img src={thumb} alt={biz.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            : biz.icon
                          }
                        </div>

                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                            <p style={{ fontSize: 14, fontWeight: 900, color: '#fff', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '70%' }}>
                              {biz.name}
                            </p>
                            <span style={{
                              fontSize: 9, fontWeight: 800,
                              background: accent.bg, color: accent.text,
                              border: `1px solid ${accent.border}`,
                              borderRadius: 20, padding: '2px 8px',
                              textTransform: 'uppercase', letterSpacing: '.06em', flexShrink: 0,
                            }}>
                              {accent.label}
                            </span>
                          </div>

                          <p style={{ fontSize: 11, color: '#475569', fontWeight: 600, marginBottom: 8 }}>
                            📍 {biz.locality} · Just joined
                          </p>

                          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                            {biz.rating > 0 && (
                              <div style={{
                                display: 'inline-flex', alignItems: 'center', gap: 3,
                                background: 'rgba(16,185,129,.08)', border: '1px solid rgba(16,185,129,.18)',
                                borderRadius: 8, padding: '2px 7px',
                                fontSize: 11, fontWeight: 900, color: '#34d399',
                              }}>
                                <Star style={{ width: 9, height: 9, fill: '#34d399' }} />
                                {biz.rating.toFixed(1)}
                              </div>
                            )}
                            <span style={{
                              fontSize: 10, fontWeight: 700, color: '#34d399',
                              background: 'rgba(16,185,129,.06)', borderRadius: 6, padding: '2px 8px',
                            }}>
                              New on NearByBazar
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* ── Platform Updates tab ── */}
        {tab === 'platform' && (
          <div style={{ paddingTop: 20, display: 'flex', flexDirection: 'column', gap: 14 }}>
            {platformUpdates.map((upd) => (
              <div
                key={upd.id}
                style={{
                  background: upd.accentBg,
                  border: `1px solid ${upd.accentBorder}`,
                  borderRadius: 16, padding: '16px 18px',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: upd.iconBg, border: `1px solid ${upd.iconBorder}`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 20,
                  }}>
                    {upd.icon}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 5 }}>
                      <p style={{ fontSize: 14, fontWeight: 900, color: '#fff' }}>{upd.title}</p>
                      <span style={{
                        fontSize: 8, fontWeight: 800,
                        background: 'rgba(16,185,129,.1)', color: '#34d399',
                        borderRadius: 20, padding: '1px 6px',
                        textTransform: 'uppercase', letterSpacing: '.08em', flexShrink: 0,
                      }}>
                        NEW
                      </span>
                    </div>
                    <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.65, marginBottom: upd.cta ? 12 : 6 }}>
                      {upd.body}
                    </p>
                    {upd.cta && upd.ctaHref && (
                      <Link
                        href={upd.ctaHref}
                        style={{
                          display: 'inline-flex', alignItems: 'center', gap: 4,
                          fontSize: 12, fontWeight: 700, color: upd.accent,
                          background: `color-mix(in srgb, ${upd.accent} 10%, transparent)`,
                          border: `1px solid ${upd.accentBorder}`,
                          borderRadius: 8, padding: '5px 12px',
                          textDecoration: 'none', transition: 'opacity .15s',
                        }}
                      >
                        {upd.cta} →
                      </Link>
                    )}
                    {!upd.cta && (
                      <p style={{ fontSize: 10, color: '#334155', fontWeight: 600 }}>{upd.date}</p>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
