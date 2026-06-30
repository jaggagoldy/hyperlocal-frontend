'use client';

import { getVerticalExperience } from '@/config/verticalExperience';
import VerticalExperience from './VerticalExperience';

/**
 * Client boundary for rendering the vertical engine from a Server Component
 * (e.g. the ISR /[district]/[category] route). The config holds match/filter
 * functions which cannot be serialized across the RSC boundary, so we pass only
 * the serializable slug and resolve the config here, on the client.
 */
export default function VerticalExperienceRoute({
  slug,
  districtSlug,
}: {
  slug: string;
  districtSlug?: string;
}) {
  const config = getVerticalExperience(slug);
  if (!config) return null;
  return <VerticalExperience config={config} districtSlug={districtSlug} />;
}
