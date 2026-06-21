/**
 * Directory taxonomy + server-side data helpers for the Phase F consumer front
 * door: the 16-vertical category grid, the category↔vertical mapping, tier-aware
 * CTA derivation, and the (server-component) fetchers that hit the backend's
 * directory-scope search. Pure data + fetch — safe to import in server components.
 */

export const API_BASE =
  process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api/v1';

export type ListingTier = 'DIRECTORY' | 'BOOKABLE' | 'COMMERCE';

export interface DirectoryCategory {
  slug: string;        // URL slug, e.g. "health-medical"
  vertical: string;    // backend businessType key, e.g. "HEALTH_MEDICAL"
  label: string;
  icon: string;        // emoji tile glyph
  blurb: string;       // short SEO/marketing line
  defaultTier: ListingTier;
}

// The launch grid. Order = display order on the hub. Slugs are stable public URLs.
export const DIRECTORY_CATEGORIES: DirectoryCategory[] = [
  { slug: 'food-beverage', vertical: 'FOOD_BEVERAGE', label: 'Food & Beverage', icon: '🍽️', blurb: 'Restaurants, cafes, bakeries & sweets', defaultTier: 'COMMERCE' },
  { slug: 'grocery', vertical: 'GROCERY', label: 'Grocery & Daily Needs', icon: '🛒', blurb: 'Kirana, supermarkets & dairy', defaultTier: 'COMMERCE' },
  { slug: 'shops-retail', vertical: 'RETAIL', label: 'Shops & Retail', icon: '🛍️', blurb: 'Apparel, mobiles, jewellery & more', defaultTier: 'DIRECTORY' },
  { slug: 'salon-beauty', vertical: 'SALON_BEAUTY', label: 'Salon & Beauty', icon: '💇', blurb: 'Salons, spas & bridal makeup', defaultTier: 'BOOKABLE' },
  { slug: 'health-medical', vertical: 'HEALTH_MEDICAL', label: 'Health & Medical', icon: '🩺', blurb: 'Doctors, clinics, pharmacies & labs', defaultTier: 'DIRECTORY' },
  { slug: 'home-repair', vertical: 'HOME_ESSENTIALS', label: 'Home & Repair', icon: '🔧', blurb: 'AC, RO, electrician, plumber & cleaning', defaultTier: 'DIRECTORY' },
  { slug: 'professional-services', vertical: 'PROFESSIONAL_SERVICES', label: 'Professional Services', icon: '💼', blurb: 'CA, lawyer, consultant & architect', defaultTier: 'DIRECTORY' },
  { slug: 'education', vertical: 'EDUCATION', label: 'Education & Coaching', icon: '🎓', blurb: 'Schools, coaching, tuition & classes', defaultTier: 'DIRECTORY' },
  { slug: 'fitness', vertical: 'FITNESS', label: 'Fitness & Wellness', icon: '🏋️', blurb: 'Gyms, yoga, physio & dietician', defaultTier: 'BOOKABLE' },
  { slug: 'automotive', vertical: 'AUTOMOTIVE', label: 'Automotive', icon: '🚗', blurb: 'Service, spares, tyres & car wash', defaultTier: 'DIRECTORY' },
  { slug: 'real-estate', vertical: 'REAL_ESTATE', label: 'Real Estate', icon: '🏠', blurb: 'Agents, PG/hostel, builders & rentals', defaultTier: 'DIRECTORY' },
  { slug: 'hotels', vertical: 'HOTELS', label: 'Hotels & Hospitality', icon: '🏨', blurb: 'Hotels, banquets & guest houses', defaultTier: 'DIRECTORY' },
  { slug: 'events', vertical: 'EVENTS', label: 'Events & Wedding', icon: '🎉', blurb: 'Caterers, photographers & decorators', defaultTier: 'DIRECTORY' },
  { slug: 'personal-services', vertical: 'PERSONAL_SERVICES', label: 'Personal Services', icon: '🧵', blurb: 'Tailor, laundry, cobbler & pet grooming', defaultTier: 'DIRECTORY' },
  { slug: 'travel', vertical: 'TRAVEL', label: 'Travel & Transport', icon: '✈️', blurb: 'Travel agents, cabs, movers & courier', defaultTier: 'DIRECTORY' },
  { slug: 'financial', vertical: 'FINANCIAL_SERVICES', label: 'Financial Services', icon: '🏦', blurb: 'Loans, insurance, mutual funds & ATM', defaultTier: 'DIRECTORY' },
];

const BY_SLUG = new Map(DIRECTORY_CATEGORIES.map((c) => [c.slug, c]));
const BY_VERTICAL = new Map(DIRECTORY_CATEGORIES.map((c) => [c.vertical, c]));

export const getCategoryBySlug = (slug: string) => BY_SLUG.get(slug) || null;
export const getCategoryByVertical = (v: string) => BY_VERTICAL.get(v) || null;

export interface RegionState { name: string; districts: { name: string; slug: string; state: string }[] }

/** Fetch the canonical PB+HR region registry (ISR-cached). */
export async function fetchRegions(): Promise<RegionState[]> {
  try {
    const res = await fetch(`${API_BASE}/regions`, { next: { revalidate: 86400 } });
    if (!res.ok) return [];
    const body = await res.json();
    return body?.data?.states || [];
  } catch {
    return [];
  }
}

/** Resolve a district slug → its canonical {name, slug, state}, or null. */
export async function resolveDistrict(slug: string) {
  const states = await fetchRegions();
  for (const s of states) {
    const d = s.districts.find((x) => x.slug === slug);
    if (d) return d;
  }
  return null;
}

export interface Listing {
  id: string;
  businessName: string;
  slug: string;
  listingTier: ListingTier | null;
  isClaimed: boolean;
  businessType: string;
  localityName: string;
  rating: number;
  latitude: number | null;
  longitude: number | null;
  city?: { name: string; district: string | null };
  metaData?: { osm?: { contactPhone?: string | null; website?: string | null; subcategory?: string | null } };
}

/** Fetch directory listings for a district + vertical (directory scope, ISR-cached). */
export async function fetchDirectoryListings(
  districtSlug: string,
  vertical: string,
  opts: { limit?: number; page?: number } = {}
): Promise<{ listings: Listing[]; total: number }> {
  const limit = opts.limit ?? 60;
  const page = opts.page ?? 1;
  const url = `${API_BASE}/search/explore/${districtSlug}/any?scope=directory&businessType=${vertical}&limit=${limit}&page=${page}`;
  try {
    const res = await fetch(url, { next: { revalidate: 1800 } });
    if (!res.ok) return { listings: [], total: 0 };
    const body = await res.json();
    return { listings: body?.data || [], total: body?.meta?.total || 0 };
  } catch {
    return { listings: [], total: 0 };
  }
}

// ---- Tier-aware CTAs -----------------------------------------------------
export interface Cta {
  label: string;
  href: string;
  kind: 'primary' | 'secondary';
}

const sanitizePhone = (p?: string | null) => (p ? p.replace(/[^\d+]/g, '') : '');

/**
 * Derive the consumer CTAs for a listing from its tier:
 *  - DIRECTORY → Call / WhatsApp / Directions (no storefront)
 *  - BOOKABLE  → Book (storefront) + Call
 *  - COMMERCE  → Order (storefront) + Call
 * Falls back gracefully when phone/geo are missing.
 */
export function listingCtas(l: Listing): Cta[] {
  const phone = sanitizePhone(l.metaData?.osm?.contactPhone);
  const ctas: Cta[] = [];
  const tier = l.listingTier || 'DIRECTORY';

  if (tier === 'COMMERCE') {
    ctas.push({ label: 'Order', href: `/${l.slug}`, kind: 'primary' });
  } else if (tier === 'BOOKABLE') {
    ctas.push({ label: 'Book', href: `/${l.slug}`, kind: 'primary' });
  } else {
    // DIRECTORY
    if (phone) ctas.push({ label: 'Call', href: `tel:${phone}`, kind: 'primary' });
    if (phone) ctas.push({ label: 'WhatsApp', href: `https://wa.me/${phone.replace(/^\+/, '')}`, kind: 'secondary' });
  }

  if (tier !== 'DIRECTORY' && phone) {
    ctas.push({ label: 'Call', href: `tel:${phone}`, kind: 'secondary' });
  }

  if (l.latitude && l.longitude) {
    ctas.push({
      label: 'Directions',
      href: `https://www.google.com/maps/dir/?api=1&destination=${l.latitude},${l.longitude}`,
      kind: 'secondary',
    });
  }
  return ctas;
}

export const tierBadge = (tier: ListingTier | null): { label: string; cls: string } => {
  switch (tier) {
    case 'COMMERCE':
      return { label: 'Order online', cls: 'bg-orange-100 text-orange-700 border-orange-200' };
    case 'BOOKABLE':
      return { label: 'Bookable', cls: 'bg-violet-100 text-violet-700 border-violet-200' };
    default:
      return { label: 'Directory', cls: 'bg-zinc-100 text-zinc-600 border-zinc-200' };
  }
};
