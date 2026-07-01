import { fetchDirectoryListings, getCategoryByVertical } from '@/lib/directory';
import WhatsNewSwitch from './WhatsNewSwitch';

export const revalidate = 3600;

const PLATFORM_UPDATES = [
  {
    id: 'edu-center',
    icon: '🎓',
    iconBg: 'rgba(139,92,246,.15)',
    iconBorder: 'rgba(139,92,246,.25)',
    title: 'Education Center is here!',
    body: 'Learn how to get the most out of NearByBazar — ordering, bookings, safety guides and more.',
    cta: 'Watch Tutorials',
    ctaHref: '/video-guides',
    date: 'June 2026',
    accent: '#a78bfa',
    accentBg: 'rgba(139,92,246,.08)',
    accentBorder: 'rgba(139,92,246,.2)',
  },
  {
    id: 'fatehabad',
    icon: '📍',
    iconBg: 'rgba(56,189,248,.1)',
    iconBorder: 'rgba(56,189,248,.2)',
    title: 'Now live in Fatehabad!',
    body: 'NearByBazar just expanded to Fatehabad district — 120+ businesses now online.',
    cta: 'Discover Fatehabad',
    ctaHref: '/fatehabad/food-beverage',
    date: 'June 15, 2026',
    accent: '#38bdf8',
    accentBg: 'rgba(56,189,248,.06)',
    accentBorder: 'rgba(56,189,248,.15)',
  },
  {
    id: 'order-tracking',
    icon: '🔔',
    iconBg: 'rgba(251,146,60,.1)',
    iconBorder: 'rgba(251,146,60,.2)',
    title: 'Faster order tracking',
    body: 'Real-time status updates now every 30 seconds. No more refreshing!',
    cta: null,
    ctaHref: null,
    date: 'June 10, 2026',
    accent: '#fb923c',
    accentBg: 'rgba(251,146,60,.06)',
    accentBorder: 'rgba(251,146,60,.12)',
  },
  {
    id: 'payment-security',
    icon: '🔒',
    iconBg: 'rgba(16,185,129,.1)',
    iconBorder: 'rgba(16,185,129,.2)',
    title: 'Improved payment security',
    body: 'Upgraded to PCI DSS Level 1 certified payments. Your money is safer than ever.',
    cta: null,
    ctaHref: null,
    date: 'June 5, 2026',
    accent: '#10b981',
    accentBg: 'rgba(16,185,129,.06)',
    accentBorder: 'rgba(16,185,129,.12)',
  },
];

export default async function WhatsNewPage() {
  // Fetch the 8 most recently joined businesses from the default district
  const { listings } = await fetchDirectoryListings('hisar', 'any', { limit: 8 });

  const newBusinesses = listings.map((l) => {
    const cat = getCategoryByVertical(l.businessType);
    return {
      id: l.id,
      name: l.businessName,
      slug: l.slug,
      locality: l.localityName || l.city?.name || 'Hisar',
      businessType: l.businessType,
      icon: cat?.icon || '🏪',
      label: cat?.label || 'Business',
      rating: l.rating,
      media: l.media,
    };
  });

  return (
    <WhatsNewSwitch
      newBusinesses={newBusinesses}
      platformUpdates={PLATFORM_UPDATES}
    />
  );
}
