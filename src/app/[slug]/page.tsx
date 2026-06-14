import axios from 'axios';
import { notFound } from 'next/navigation';
import { getTemplateComponent, TEMPLATE_METADATA } from '@/lib/templateRegistry';

// This function simulates fetching business data from your backend.
// In a real implementation, you would call your API.
async function getBusinessBySlug(slug: string) {
  try {
    const url = `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1'}/business/${slug}`;
    const res = await axios.get(url);
    return res.data?.data || null;
  } catch (error) {
    console.error("Error fetching business by slug:", error);
    return null;
  }
}

export default async function StorefrontPage({ params }: { params: { slug: string } }) {
  const business = await getBusinessBySlug(params.slug);
  
  if (!business) {
    notFound();
  }

  // Get the archetype from the business's first category, or fallback to businessType
  const archetype = business.categories?.[0]?.category?.archetype || business.businessType || 'SERVICE';
  
  // Use themeFlavor as the templateId. If none exists, pass an empty string to trigger fallbacks.
  const templateId = business.themeFlavor || '';

  // Retrieve the registered component for this template
  const StorefrontTemplate = getTemplateComponent(templateId, archetype);
  const theme = TEMPLATE_METADATA.find(t => t.id === templateId) || TEMPLATE_METADATA[0];

  return (
    <div className="min-h-screen bg-zinc-50">
      <StorefrontTemplate business={business} theme={theme} />
    </div>
  );
}
