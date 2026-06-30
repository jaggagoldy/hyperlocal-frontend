import axios from 'axios';
import { notFound } from 'next/navigation';
import { getTemplateComponent, getTemplateArchetype, TEMPLATE_METADATA } from '@/lib/templateRegistry';
import { ReviewSection } from '@/components/vendor/ReviewSection';
import TrackProfileView from '@/components/TrackProfileView';

export const dynamic = 'force-dynamic';

// This function simulates fetching business data from your backend.
// In a real implementation, you would call your API.
async function getBusinessBySlug(slug: string) {
  const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/business/${slug}`;
  // The backend (Render free tier) can cold-start slowly, so allow a generous
  // timeout and retry once — the first request wakes the server, the retry lands.
  for (let attempt = 0; attempt < 2; attempt++) {
    try {
      const res = await axios.get(url, { timeout: 30000 });
      return res.data?.data || null;
    } catch (error) {
      const status = (error as { response?: { status?: number } }).response?.status;
      // A real 404 means the business doesn't exist — don't retry.
      if (status === 404) return null;
      if (attempt === 1) {
        console.error('Error fetching business by slug:', error);
        return null;
      }
    }
  }
  return null;
}

export default async function StorefrontPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  // Guard: If the slug contains a dot, it is a request for a missing static file
  // (e.g. /favicon.ico, /icon-192x192.png) falling through. Reject immediately.
  if (slug.includes('.')) {
    notFound();
  }

  const business = await getBusinessBySlug(slug);
  
  if (!business) {
    notFound();
  }

  // Derive archetype — category → businessType → getTemplateArchetype() which
  // defaults to FOOD_BEVERAGE for unknown/empty types (avoids wrong SERVICE fallback).
  const rawType = business.categories?.[0]?.category?.archetype || business.businessType || '';
  const archetype = getTemplateArchetype(rawType);

  // Use themeFlavor as the templateId. If none exists, pass an empty string to trigger fallbacks.
  const templateId = business.themeFlavor || '';

  // Retrieve the registered component for this template
  const StorefrontTemplate = getTemplateComponent(templateId, archetype);
  // TEMPLATE_METADATA entries carry a lucide `icon` (a React component), which cannot be
  // serialized across the Server→Client boundary. Strip it; templates only read serializable fields.
  const { icon: _icon, ...theme } = TEMPLATE_METADATA.find(t => t.id === templateId) || TEMPLATE_METADATA[0];

  // Dark templates own their full-page background — match it so the review
  // section below the template doesn't render on a white/zinc strip.
  const isDark = templateId.includes('dark') || templateId === 'food-immersive';
  const pageBg  = isDark ? '#020617' : '#fafafa';

  return (
    <div style={{ minHeight: '100vh', background: pageBg }}>
      {business.id && <TrackProfileView businessProfileId={business.id} />}
      <StorefrontTemplate business={business} theme={theme} />
      {business.id && (
        <div
          className={`mx-auto max-w-3xl px-4 pb-12 sm:px-6 ${isDark ? 'dark' : ''}`}
          style={isDark ? { background: '#020617', borderTop: '1px solid rgba(255,255,255,.07)' } : undefined}
        >
          <ReviewSection vendorId={business.id} ratingAvg={business.rating || 0} />
        </div>
      )}
    </div>
  );
}
