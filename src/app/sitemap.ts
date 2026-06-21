import type { MetadataRoute } from 'next';
import { DIRECTORY_CATEGORIES, fetchRegions } from '@/lib/directory';

// Set NEXT_PUBLIC_SITE_URL to the canonical production origin (no trailing slash).
const BASE = (process.env.NEXT_PUBLIC_SITE_URL || 'https://nearbybazar.in').replace(/\/$/, '');

export const revalidate = 86400;

/** Programmatic sitemap: the directory hub + every district × category spoke. */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const states = await fetchRegions();
  const districts = states.flatMap((s) => s.districts);
  const now = new Date();

  const staticUrls: MetadataRoute.Sitemap = [
    { url: `${BASE}/`, lastModified: now, changeFrequency: 'daily', priority: 1 },
    { url: `${BASE}/directory`, lastModified: now, changeFrequency: 'daily', priority: 0.9 },
  ];

  const spokes: MetadataRoute.Sitemap = [];
  for (const d of districts) {
    for (const c of DIRECTORY_CATEGORIES) {
      spokes.push({
        url: `${BASE}/${d.slug}/${c.slug}`,
        lastModified: now,
        changeFrequency: 'weekly',
        priority: 0.6,
      });
    }
  }

  return [...staticUrls, ...spokes];
}
