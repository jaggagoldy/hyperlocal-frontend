'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

type Category = 'all' | 'getting-started' | 'ordering' | 'booking' | 'tips';

interface Video {
  id: string;
  title: string;
  category: Category;
  categoryLabel: string;
  duration: string;
  views: string;
  bg: string;
  border: string;
  tagColor: string;
  featured?: boolean;
}

const VIDEOS: Video[] = [
  {
    id: 'walkthrough',
    title: 'Complete NearByBazar Walkthrough',
    category: 'getting-started',
    categoryLabel: 'Getting Started',
    duration: '2:18',
    views: '3,240',
    bg: 'linear-gradient(135deg,#0f172a,#1e1a3a)',
    border: 'rgba(139,92,246,.2)',
    tagColor: '#a78bfa',
    featured: true,
  },
  {
    id: 'first-order',
    title: 'How to place your first order',
    category: 'ordering',
    categoryLabel: 'Ordering',
    duration: '1:30',
    views: '1,200',
    bg: 'linear-gradient(135deg,#1a0a00,#2a1200)',
    border: 'rgba(251,146,60,.15)',
    tagColor: '#fb923c',
  },
  {
    id: 'salon-booking',
    title: 'Booking a salon appointment',
    category: 'booking',
    categoryLabel: 'Booking',
    duration: '2:00',
    views: '890',
    bg: 'linear-gradient(135deg,#0a001a,#1a0033)',
    border: 'rgba(139,92,246,.15)',
    tagColor: '#a78bfa',
  },
  {
    id: 'best-deals',
    title: 'Finding the best deals near you',
    category: 'tips',
    categoryLabel: 'Tips',
    duration: '1:45',
    views: '756',
    bg: 'linear-gradient(135deg,#001a10,#003321)',
    border: 'rgba(16,185,129,.15)',
    tagColor: '#34d399',
  },
  {
    id: 'order-tracking',
    title: 'Tracking your order live',
    category: 'ordering',
    categoryLabel: 'Ordering',
    duration: '2:30',
    views: '543',
    bg: 'linear-gradient(135deg,#001a2e,#002a4a)',
    border: 'rgba(56,189,248,.15)',
    tagColor: '#38bdf8',
  },
  {
    id: 'vendor-setup',
    title: 'Setting up your vendor profile',
    category: 'getting-started',
    categoryLabel: 'Getting Started',
    duration: '3:10',
    views: '412',
    bg: 'linear-gradient(135deg,#0f172a,#1e293b)',
    border: 'rgba(16,185,129,.15)',
    tagColor: '#34d399',
  },
  {
    id: 'enquiry',
    title: 'How to send a service enquiry',
    category: 'booking',
    categoryLabel: 'Booking',
    duration: '1:15',
    views: '298',
    bg: 'linear-gradient(135deg,#1a000a,#330014)',
    border: 'rgba(239,68,68,.15)',
    tagColor: '#f87171',
  },
  {
    id: 'wallet',
    title: 'Using NearByBazar Wallet',
    category: 'tips',
    categoryLabel: 'Tips',
    duration: '2:05',
    views: '187',
    bg: 'linear-gradient(135deg,#1a1000,#2a1c00)',
    border: 'rgba(245,158,11,.15)',
    tagColor: '#fbbf24',
  },
];

const CHIPS: { key: Category; label: string }[] = [
  { key: 'all', label: `All (${VIDEOS.length})` },
  { key: 'getting-started', label: 'Getting Started' },
  { key: 'ordering', label: 'Ordering' },
  { key: 'booking', label: 'Booking' },
  { key: 'tips', label: 'Tips' },
];

export default function VideoGuidesPage() {
  const [activeCategory, setActiveCategory] = useState<Category>('all');

  const filtered = activeCategory === 'all' ? VIDEOS : VIDEOS.filter(v => v.category === activeCategory);
  const featured = VIDEOS.find(v => v.featured);
  const list = filtered.filter(v => !v.featured || activeCategory !== 'all');

  return (
    <div style={{ minHeight: '100vh', background: '#020617', color: '#fff' }}>
      {/* Header */}
      <div style={{
        background: 'rgba(15,23,42,.95)',
        backdropFilter: 'blur(20px)',
        borderBottom: '1px solid rgba(255,255,255,.06)',
        padding: '0 20px',
        position: 'sticky', top: 0, zIndex: 40,
      }}>
        <div style={{ maxWidth: 640, margin: '0 auto' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, height: 56 }}>
            <Link href="/profile" style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: '#94a3b8', textDecoration: 'none', flexShrink: 0,
            }}>
              <ArrowLeft style={{ width: 16, height: 16 }} />
            </Link>
            <div>
              <p style={{ fontSize: 11, fontWeight: 700, color: '#475569', marginBottom: 1 }}>Help &amp; Guides</p>
              <h1 style={{ fontSize: 18, fontWeight: 900, color: '#fff', lineHeight: 1.1 }}>Video Tutorials 🎬</h1>
            </div>
          </div>

          {/* Category chips */}
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', scrollbarWidth: 'none', paddingBottom: 12, marginBottom: 4 }}>
            {CHIPS.map(chip => (
              <button
                key={chip.key}
                onClick={() => setActiveCategory(chip.key)}
                style={{
                  flexShrink: 0, padding: '5px 14px', borderRadius: 999,
                  fontSize: 11, fontWeight: 800, cursor: 'pointer', transition: 'all .15s',
                  background: activeCategory === chip.key ? 'rgba(16,185,129,.12)' : 'rgba(255,255,255,.05)',
                  border: activeCategory === chip.key ? '1px solid rgba(16,185,129,.3)' : '1px solid rgba(255,255,255,.1)',
                  color: activeCategory === chip.key ? '#34d399' : '#64748b',
                }}
              >
                {chip.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 640, margin: '0 auto', padding: '20px 20px 80px' }}>

        {/* Featured video */}
        {activeCategory === 'all' && featured && (
          <div style={{ marginBottom: 24 }}>
            <Link href={`/video-guides/${featured.id}`} style={{ textDecoration: 'none' }}>
              <div style={{ borderRadius: 16, overflow: 'hidden', marginBottom: 10, position: 'relative' }}>
                <div style={{ background: featured.bg, height: 160, display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', border: `1px solid ${featured.border}`, borderRadius: 16 }}>
                  <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 50% 50%,rgba(139,92,246,.15),transparent 70%)' }} />
                  <div style={{
                    width: 56, height: 56, borderRadius: '50%',
                    background: 'rgba(255,255,255,.15)', backdropFilter: 'blur(8px)',
                    border: '2px solid rgba(255,255,255,.3)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1,
                    fontSize: 22, paddingLeft: 3,
                  }}>▶</div>
                  <div style={{ position: 'absolute', bottom: 10, right: 10, background: 'rgba(0,0,0,.6)', borderRadius: 6, padding: '2px 8px', fontSize: 10, fontWeight: 800, color: '#fff' }}>{featured.duration}</div>
                  <div style={{ position: 'absolute', top: 10, left: 10, background: 'rgba(245,158,11,.15)', border: '1px solid rgba(245,158,11,.3)', borderRadius: 20, padding: '2px 8px', fontSize: 9, fontWeight: 800, color: '#f59e0b', textTransform: 'uppercase', letterSpacing: '.08em' }}>FEATURED</div>
                </div>
              </div>
              <p style={{ fontSize: 14, fontWeight: 900, color: '#fff', marginBottom: 6 }}>{featured.title}</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{ fontSize: 9, fontWeight: 800, color: featured.tagColor, background: `color-mix(in srgb, ${featured.tagColor} 12%, transparent)`, border: `1px solid ${featured.tagColor}33`, borderRadius: 20, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '.06em' }}>{featured.categoryLabel}</span>
                <span style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>👁 {featured.views} views</span>
              </div>
            </Link>
          </div>
        )}

        {/* List */}
        {list.length > 0 && (
          <>
            <p style={{ fontSize: 10, fontWeight: 800, textTransform: 'uppercase', letterSpacing: '.12em', color: '#334155', marginBottom: 12 }}>
              {activeCategory === 'all' ? 'All Videos' : CHIPS.find(c => c.key === activeCategory)?.label}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              {list.map((video, idx) => (
                <Link key={video.id} href={`/video-guides/${video.id}`} style={{ textDecoration: 'none' }}>
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 14,
                    padding: '14px 0',
                    borderBottom: idx < list.length - 1 ? '1px solid rgba(255,255,255,.05)' : 'none',
                  }}>
                    <div style={{
                      position: 'relative', width: 80, height: 54, borderRadius: 10, flexShrink: 0,
                      background: video.bg, border: `1px solid ${video.border}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: 12, color: 'rgba(255,255,255,.4)' }}>▶</span>
                      <div style={{ position: 'absolute', bottom: 4, right: 5, background: 'rgba(0,0,0,.6)', borderRadius: 4, padding: '1px 5px', fontSize: 9, fontWeight: 800, color: '#fff' }}>{video.duration}</div>
                    </div>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: 13, fontWeight: 800, color: '#fff', marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{video.title}</p>
                      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <span style={{ fontSize: 9, fontWeight: 800, color: video.tagColor, background: `color-mix(in srgb, ${video.tagColor} 12%, transparent)`, border: `1px solid ${video.tagColor}33`, borderRadius: 20, padding: '2px 8px', textTransform: 'uppercase', letterSpacing: '.06em' }}>{video.categoryLabel}</span>
                        <span style={{ fontSize: 10, color: '#475569', fontWeight: 600 }}>{video.views} views</span>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
