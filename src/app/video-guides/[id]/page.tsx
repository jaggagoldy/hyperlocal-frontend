'use client';

import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { use } from 'react';

interface Video {
  id: string;
  title: string;
  categoryLabel: string;
  duration: string;
  views: string;
  description: string;
  bg: string;
  border: string;
  tagColor: string;
}

const VIDEOS: Record<string, Video> = {
  walkthrough: {
    id: 'walkthrough',
    title: 'Complete NearByBazar Walkthrough',
    categoryLabel: 'Getting Started',
    duration: '2:18',
    views: '3,240',
    description: 'A complete 2-minute tour covering how to explore businesses, place orders, book appointments, and track your orders in real time.',
    bg: 'linear-gradient(135deg,#0f0015,#000d26)',
    border: 'rgba(139,92,246,.2)',
    tagColor: '#a78bfa',
  },
  'first-order': {
    id: 'first-order',
    title: 'How to place your first order',
    categoryLabel: 'Ordering',
    duration: '1:30',
    views: '1,200',
    description: 'Learn how to browse restaurant menus, add items to your cart, and place your first food order on NearByBazar.',
    bg: 'linear-gradient(135deg,#1a0a00,#2a1200)',
    border: 'rgba(251,146,60,.15)',
    tagColor: '#fb923c',
  },
  'salon-booking': {
    id: 'salon-booking',
    title: 'Booking a salon appointment',
    categoryLabel: 'Booking',
    duration: '2:00',
    views: '890',
    description: 'Discover how to find salons near you, check availability, and book your appointment in under a minute.',
    bg: 'linear-gradient(135deg,#0a001a,#1a0033)',
    border: 'rgba(139,92,246,.15)',
    tagColor: '#a78bfa',
  },
  'best-deals': {
    id: 'best-deals',
    title: 'Finding the best deals near you',
    categoryLabel: 'Tips',
    duration: '1:45',
    views: '756',
    description: 'Learn how to use filters, deal strips, and promo codes to save money on every order.',
    bg: 'linear-gradient(135deg,#001a10,#003321)',
    border: 'rgba(16,185,129,.15)',
    tagColor: '#34d399',
  },
  'order-tracking': {
    id: 'order-tracking',
    title: 'Tracking your order live',
    categoryLabel: 'Ordering',
    duration: '2:30',
    views: '543',
    description: 'See how to track your order status in real-time and get notifications when your order is ready.',
    bg: 'linear-gradient(135deg,#001a2e,#002a4a)',
    border: 'rgba(56,189,248,.15)',
    tagColor: '#38bdf8',
  },
  'vendor-setup': {
    id: 'vendor-setup',
    title: 'Setting up your vendor profile',
    categoryLabel: 'Getting Started',
    duration: '3:10',
    views: '412',
    description: 'A step-by-step guide for vendors: create your profile, upload your menu, and go live on NearByBazar.',
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
    border: 'rgba(16,185,129,.15)',
    tagColor: '#34d399',
  },
  enquiry: {
    id: 'enquiry',
    title: 'How to send a service enquiry',
    categoryLabel: 'Booking',
    duration: '1:15',
    views: '298',
    description: 'Learn how to contact a service provider, describe your needs, and get a quote — all within the app.',
    bg: 'linear-gradient(135deg,#1a000a,#330014)',
    border: 'rgba(239,68,68,.15)',
    tagColor: '#f87171',
  },
  wallet: {
    id: 'wallet',
    title: 'Using NearByBazar Wallet',
    categoryLabel: 'Tips',
    duration: '2:05',
    views: '187',
    description: 'Understand how to top up your wallet, use cashback credits, and pay faster on every transaction.',
    bg: 'linear-gradient(135deg,#1a1000,#2a1c00)',
    border: 'rgba(245,158,11,.15)',
    tagColor: '#fbbf24',
  },
};

const UP_NEXT = ['first-order', 'salon-booking', 'best-deals'];

export default function VideoPlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const video = VIDEOS[id] || VIDEOS['walkthrough'];

  return (
    <div style={{ minHeight: '100vh', background: '#000', color: '#fff' }}>

      {/* Video player area */}
      <div style={{ position: 'relative', width: '100%', maxWidth: 640, margin: '0 auto' }}>
        {/* Back button overlay */}
        <Link href="/video-guides" style={{
          position: 'absolute', top: 16, left: 16, zIndex: 10,
          width: 36, height: 36, borderRadius: '50%',
          background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)',
          border: '1px solid rgba(255,255,255,.2)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff', textDecoration: 'none',
        }}>
          <ArrowLeft style={{ width: 16, height: 16 }} />
        </Link>

        {/* Coming Soon placeholder — replace with a real YouTube iframe or <video> when video URLs are available */}
        <div style={{
          position: 'relative', width: '100%', paddingBottom: '56.25%',
          background: video.bg,
        }}>
          <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg,rgba(139,92,246,.08),rgba(16,185,129,.05))' }} />
          <div style={{
            position: 'absolute', inset: 0,
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 12,
          }}>
            <div style={{
              width: 64, height: 64, borderRadius: '50%',
              background: 'rgba(255,255,255,.1)', backdropFilter: 'blur(12px)',
              border: '2px solid rgba(255,255,255,.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 26, paddingLeft: 4,
            }}>▶</div>
            <div style={{
              background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(8px)',
              border: '1px solid rgba(255,255,255,.15)',
              borderRadius: 10, padding: '6px 14px',
              fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,.7)',
            }}>Video coming soon · {video.duration}</div>
          </div>
        </div>
      </div>

      {/* Video info */}
      <div style={{ maxWidth: 640, margin: '0 auto', background: '#020617' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid rgba(255,255,255,.06)' }}>
          <h2 style={{ fontSize: 15, fontWeight: 900, color: '#fff', marginBottom: 6 }}>{video.title}</h2>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <span style={{
              fontSize: 9, fontWeight: 800, color: video.tagColor,
              background: `color-mix(in srgb, ${video.tagColor} 12%, transparent)`,
              border: `1px solid ${video.tagColor}33`,
              borderRadius: 20, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '.06em',
            }}>{video.categoryLabel}</span>
            <span style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>{video.views} views · June 2026</span>
          </div>
          <p style={{ fontSize: 12, color: '#64748b', lineHeight: 1.65 }}>{video.description}</p>
        </div>

        {/* Up next */}
        <div style={{ padding: '14px 20px' }}>
          <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', color: '#334155', marginBottom: 12 }}>Up Next</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {UP_NEXT.filter(uid => uid !== id).slice(0, 2).map(uid => {
              const v = VIDEOS[uid];
              if (!v) return null;
              return (
                <Link key={uid} href={`/video-guides/${uid}`} style={{ textDecoration: 'none' }}>
                  <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                    <div style={{
                      width: 80, height: 54, borderRadius: 10, flexShrink: 0,
                      background: v.bg, border: `1px solid ${v.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 10, color: 'rgba(255,255,255,.3)' }}>▶</span>
                    </div>
                    <div>
                      <p style={{ fontSize: 12, fontWeight: 800, color: '#fff', marginBottom: 4 }}>{v.title}</p>
                      <span style={{
                        fontSize: 9, fontWeight: 800, color: v.tagColor,
                        background: `color-mix(in srgb, ${v.tagColor} 12%, transparent)`,
                        border: `1px solid ${v.tagColor}33`,
                        borderRadius: 20, padding: '2px 8px', textTransform: 'uppercase',
                      }}>{v.categoryLabel} · {v.duration}</span>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
