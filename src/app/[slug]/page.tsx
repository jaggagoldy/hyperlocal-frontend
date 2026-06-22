import axios from 'axios';
import { notFound } from 'next/navigation';
import { getTemplateComponent, TEMPLATE_METADATA } from '@/lib/templateRegistry';
import { ReviewSection } from '@/components/vendor/ReviewSection';
import TrackProfileView from '@/components/TrackProfileView';

export const dynamic = 'force-dynamic';

// This function simulates fetching business data from your backend.
// In a real implementation, you would call your API.
async function getBusinessBySlug(slug: string) {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/business/${slug}`;
    const res = await axios.get(url, { timeout: 5000 });
    return res.data?.data || null;
  } catch (error) {
    console.error("Error fetching business by slug:", error);
    return null;
  }
}

export default async function StorefrontPage({ params }: { params: Promise<{ slug: string }> | { slug: string } }) {
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

  // Get the archetype from the business's first category, or fallback to businessType
  const archetype = business.categories?.[0]?.category?.archetype || business.businessType || 'SERVICE';
  
  // Use themeFlavor as the templateId. If none exists, pass an empty string to trigger fallbacks.
  const templateId = business.themeFlavor || '';

  // Retrieve the registered component for this template
  const StorefrontTemplate = getTemplateComponent(templateId, archetype);
  // TEMPLATE_METADATA entries carry a lucide `icon` (a React component), which cannot be
  // serialized across the Server→Client boundary. Strip it; templates only read serializable fields.
  const { icon: _icon, ...theme } = TEMPLATE_METADATA.find(t => t.id === templateId) || TEMPLATE_METADATA[0];

  return (
    <div className="min-h-screen bg-zinc-50">
      {business.id && <TrackProfileView businessProfileId={business.id} />}
      <StorefrontTemplate business={business} theme={theme} />
      {business.id && (
        <div className="mx-auto max-w-3xl px-4 pb-12 sm:px-6">
          <ReviewSection vendorId={business.id} ratingAvg={business.rating || 0} />
        </div>
      )}
    </div>
  );
}
