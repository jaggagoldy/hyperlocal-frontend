/**
 * Vertical Experience registry — the config that drives a purpose-built,
 * "mini-website" browse experience per service vertical (Food, Salon, Grocery…).
 *
 * One <VerticalExperience config={...} /> shell reads a config from here and renders
 * a themed hero, quick-filter chips, curated collection carousels, and a results grid.
 * Adding a new vertical is a new entry in VERTICAL_EXPERIENCES — not a new page.
 *
 * Keyed by the canonical directory slug (see src/lib/directory.ts DIRECTORY_CATEGORIES).
 */
import type { Listing } from '@/lib/directory';

/** A bilingual string pair. */
export interface Bi {
  en: string;
  hi: string;
}

/** Params accepted by the /search/explore/:city/:category endpoint. */
export type ExploreParams = Record<string, string | number | boolean>;

/** A horizontally-scrolling curated row (e.g. "Top Rated Near You"). */
export interface CollectionDef {
  id: string;
  title: Bi;
  subtitle?: Bi;
  emoji?: string;
  /** Extra explore-endpoint params layered on top of the vertical defaults. */
  params?: ExploreParams;
  /** Optional client-side narrowing (e.g. only listings that carry offers). */
  filter?: (l: Listing) => boolean;
}

/** A quick-filter chip (e.g. a cuisine). Narrows the result set client-side. */
export interface QuickFilterDef {
  id: string;
  label: Bi;
  emoji?: string;
  /** Match against a listing — true keeps it. */
  match: (l: Listing) => boolean;
}

export interface VerticalExperienceConfig {
  /** directory.ts slug, e.g. 'food-beverage'. */
  slug: string;
  /** backend businessType key, e.g. 'FOOD_BEVERAGE'. */
  vertical: string;
  /** card style fed to SearchCardSelector. */
  cardMode: 'food' | 'retail' | 'service';
  /** primary consumer action archetype. */
  actionKind: 'commerce' | 'bookable' | 'directory';
  theme: {
    /** hex used for the CSS --primary token on this page. */
    primary: string;
    /** tailwind gradient classes for the hero backdrop. */
    heroGradient: string;
    /** tailwind classes for an active chip. */
    chipActive: string;
    accentText: string;
  };
  hero: {
    title: Bi;
    subtitle: Bi;
    searchPlaceholder: Bi;
    /** background image (appetite/ambience). */
    image: string;
  };
  /** label for the primary card CTA, archetype-appropriate. */
  primaryCta: Bi;
  quickFilters: QuickFilterDef[];
  collections: CollectionDef[];
}

// ── helpers for reading loosely-typed listing metadata ──────────────────────
const meta = (l: Listing): any => (l as any).metaData || {};
const cuisinesOf = (l: Listing): string[] => {
  const m = meta(l);
  const raw: string[] = m.cuisines || m.osm?.subcategory?.split(';') || [];
  return raw.map((c) => String(c).toLowerCase());
};
const hasCuisine = (l: Listing, ...needles: string[]) => {
  const c = cuisinesOf(l).join(' ');
  return needles.some((n) => c.includes(n));
};
const hasOffers = (l: Listing) => Array.isArray(meta(l).offers) && meta(l).offers.length > 0;
const isVeg = (l: Listing) => Boolean(meta(l).isVegOnly);

/** Lowercased haystack of a listing's service tags / name for keyword matching. */
const tagText = (l: Listing): string => {
  const m = meta(l);
  const parts: string[] = [];
  if (Array.isArray(m.services)) parts.push(...m.services.map(String));
  if (Array.isArray(m.tags)) parts.push(...m.tags.map(String));
  if (m.osm?.subcategory) parts.push(String(m.osm.subcategory));
  if (l.businessName) parts.push(l.businessName);
  return parts.join(' ').toLowerCase();
};
const hasTag = (l: Listing, ...needles: string[]) => {
  const t = tagText(l);
  return needles.some((n) => t.includes(n));
};

/** Bilingual label helper — Hindi falls back to English when not supplied. */
const bi = (en: string, hi?: string): Bi => ({ en, hi: hi ?? en });

/**
 * The standard curated rows every vertical gets (Trending / Top Rated / Open Now),
 * plus any vertical-specific extras appended after. Param-based so they populate
 * straight from the explore endpoint; empty rows hide themselves.
 */
const baseCollections = (extra: CollectionDef[] = []): CollectionDef[] => [
  { id: 'trending', emoji: '🔥', title: bi('Trending Near You', 'आपके पास ट्रेंडिंग'), subtitle: bi('Popular with locals this week', 'इस हफ्ते लोकल पसंद') },
  { id: 'top-rated', emoji: '⭐', title: bi('Top Rated', 'टॉप रेटेड'), subtitle: bi('Highest customer ratings', 'सबसे ज्यादा रेटिंग'), params: { minRating: 4.0 } },
  { id: 'open-now', emoji: '🕒', title: bi('Open Now', 'अभी खुले हैं'), subtitle: bi('Available right away', 'अभी उपलब्ध'), params: { openNow: true } },
  ...extra,
];

// ── FOOD ────────────────────────────────────────────────────────────────────
const FOOD: VerticalExperienceConfig = {
  slug: 'food-beverage',
  vertical: 'FOOD_BEVERAGE',
  cardMode: 'food',
  actionKind: 'commerce',
  theme: {
    primary: '#e11d48', // rose-600
    heroGradient: 'from-rose-600 via-red-600 to-orange-600',
    chipActive: 'bg-rose-600 border-rose-600 text-white shadow-md shadow-rose-600/20',
    accentText: 'text-rose-600',
  },
  hero: {
    title: { en: 'Dining out in {city}', hi: '{city} में बाहर खाना' },
    subtitle: {
      en: 'Discover the best restaurants, cafés & cloud kitchens near you — book a table or order in.',
      hi: 'अपने पास के बेहतरीन रेस्टोरेंट, कैफे और क्लाउड किचन खोजें — टेबल बुक करें या ऑर्डर करें।',
    },
    searchPlaceholder: {
      en: 'Search restaurants, cuisines or a dish…',
      hi: 'रेस्टोरेंट, व्यंजन या कोई डिश खोजें…',
    },
    image:
      'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?auto=format&fit=crop&w=1600&q=80',
  },
  primaryCta: { en: 'Book a Table', hi: 'टेबल बुक करें' },
  quickFilters: [
    { id: 'top-rated', label: { en: 'Top Rated', hi: 'टॉप रेटेड' }, emoji: '⭐', match: (l) => (l.rating ?? 0) >= 4.0 },
    { id: 'offers', label: { en: 'Offers Today', hi: 'आज के ऑफर' }, emoji: '🏷', match: hasOffers },
    { id: 'north-indian', label: { en: 'North Indian', hi: 'नॉर्थ इंडियन' }, emoji: '🍛', match: (l) => hasCuisine(l, 'north indian', 'punjabi', 'thali', 'tandoor') },
    { id: 'chinese', label: { en: 'Chinese', hi: 'चाइनीज़' }, emoji: '🥢', match: (l) => hasCuisine(l, 'chinese', 'noodle', 'momo') },
    { id: 'biryani', label: { en: 'Biryani', hi: 'बिरयानी' }, emoji: '🍚', match: (l) => hasCuisine(l, 'biryani', 'mughlai') },
    { id: 'pizza', label: { en: 'Pizza & Fast Food', hi: 'पिज़्ज़ा और फास्ट फूड' }, emoji: '🍕', match: (l) => hasCuisine(l, 'pizza', 'fast food', 'burger', 'italian') },
    { id: 'cafe', label: { en: 'Cafés', hi: 'कैफे' }, emoji: '☕', match: (l) => hasCuisine(l, 'cafe', 'coffee', 'bakery', 'dessert') },
    { id: 'street-food', label: { en: 'Street Food', hi: 'स्ट्रीट फूड' }, emoji: '🌮', match: (l) => hasCuisine(l, 'street', 'chaat', 'snack') },
    { id: 'veg', label: { en: 'Pure Veg', hi: 'शुद्ध शाकाहारी' }, emoji: '🥬', match: (l) => isVeg(l) },
  ],
  collections: [
    {
      id: 'trending',
      emoji: '🔥',
      title: { en: 'Trending Near You', hi: 'आपके पास ट्रेंडिंग' },
      subtitle: { en: "Where everyone's eating this week", hi: 'इस हफ्ते सबकी पसंद' },
    },
    {
      id: 'top-rated',
      emoji: '⭐',
      title: { en: 'Top Rated Restaurants', hi: 'टॉप रेटेड रेस्टोरेंट' },
      subtitle: { en: 'Loved for taste & service', hi: 'स्वाद और सेवा के लिए सराहे गए' },
      params: { minRating: 4.0 },
    },
    {
      id: 'open-now',
      emoji: '🕒',
      title: { en: 'Open Now', hi: 'अभी खुले हैं' },
      subtitle: { en: 'Ready to serve right away', hi: 'अभी सेवा के लिए तैयार' },
      params: { openNow: true },
    },
    {
      id: 'great-offers',
      emoji: '🎁',
      title: { en: 'Great Offers', hi: 'शानदार ऑफर' },
      subtitle: { en: 'Deals you can taste', hi: 'ऐसे ऑफर जो आपको पसंद आएं' },
      filter: hasOffers,
    },
    {
      id: 'pure-veg',
      emoji: '🥗',
      title: { en: 'Pure Veg Picks', hi: 'शुद्ध शाकाहारी चुनिंदा' },
      subtitle: { en: '100% vegetarian kitchens', hi: '100% शाकाहारी किचन' },
      filter: isVeg,
    },
  ],
};

// ── SALON & BEAUTY ───────────────────────────────────────────────────────────
const SALON: VerticalExperienceConfig = {
  slug: 'salon-beauty',
  vertical: 'SALON_BEAUTY',
  cardMode: 'service',
  actionKind: 'bookable',
  theme: {
    primary: '#9333ea', // violet-600
    heroGradient: 'from-violet-600 via-fuchsia-600 to-pink-600',
    chipActive: 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-600/20',
    accentText: 'text-violet-600',
  },
  hero: {
    title: { en: 'Salons & spas in {city}', hi: '{city} में सैलून और स्पा' },
    subtitle: {
      en: 'Book trusted salons, spas & bridal makeup artists near you — pick a time that suits you.',
      hi: 'अपने पास के भरोसेमंद सैलून, स्पा और ब्राइडल मेकअप आर्टिस्ट बुक करें — अपने अनुसार समय चुनें।',
    },
    searchPlaceholder: {
      en: 'Search salons, spas or a service…',
      hi: 'सैलून, स्पा या कोई सेवा खोजें…',
    },
    image:
      'https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=1600&q=80',
  },
  primaryCta: { en: 'Book Appointment', hi: 'अपॉइंटमेंट बुक करें' },
  quickFilters: [
    { id: 'haircut', label: { en: 'Haircut & Styling', hi: 'हेयरकट और स्टाइलिंग' }, emoji: '💇', match: (l) => hasTag(l, 'hair', 'cut', 'styl', 'salon') },
    { id: 'color', label: { en: 'Hair Colour', hi: 'हेयर कलर' }, emoji: '🎨', match: (l) => hasTag(l, 'colour', 'color', 'highlight') },
    { id: 'bridal', label: { en: 'Bridal Makeup', hi: 'ब्राइडल मेकअप' }, emoji: '👰', match: (l) => hasTag(l, 'bridal', 'makeup', 'mehndi', 'party') },
    { id: 'spa', label: { en: 'Spa & Massage', hi: 'स्पा और मसाज' }, emoji: '💆', match: (l) => hasTag(l, 'spa', 'massage', 'wellness') },
    { id: 'skin', label: { en: 'Facial & Skin', hi: 'फेशियल और स्किन' }, emoji: '✨', match: (l) => hasTag(l, 'facial', 'skin', 'clean') },
    { id: 'mens', label: { en: "Men's Grooming", hi: 'मेन्स ग्रूमिंग' }, emoji: '💈', match: (l) => hasTag(l, 'men', 'beard', 'shave', 'barber') },
    { id: 'nails', label: { en: 'Nails', hi: 'नेल्स' }, emoji: '💅', match: (l) => hasTag(l, 'nail', 'manicure', 'pedicure') },
  ],
  collections: [
    {
      id: 'trending',
      emoji: '🔥',
      title: { en: 'Trending Near You', hi: 'आपके पास ट्रेंडिंग' },
      subtitle: { en: 'Most-booked salons this week', hi: 'इस हफ्ते सबसे ज्यादा बुक' },
    },
    {
      id: 'top-rated',
      emoji: '⭐',
      title: { en: 'Top Rated Salons', hi: 'टॉप रेटेड सैलून' },
      subtitle: { en: 'Loved for service & hygiene', hi: 'सेवा और स्वच्छता के लिए सराहे गए' },
      params: { minRating: 4.0 },
    },
    {
      id: 'open-now',
      emoji: '🕒',
      title: { en: 'Open Now', hi: 'अभी खुले हैं' },
      subtitle: { en: 'Walk in or book right away', hi: 'अभी जाएं या बुक करें' },
      params: { openNow: true },
    },
    {
      id: 'bridal',
      emoji: '👰',
      title: { en: 'Bridal & Party Ready', hi: 'ब्राइडल और पार्टी रेडी' },
      subtitle: { en: 'Makeup artists for your big day', hi: 'आपके खास दिन के लिए मेकअप आर्टिस्ट' },
      filter: (l) => hasTag(l, 'bridal', 'makeup', 'party', 'mehndi'),
    },
  ],
};

// ── GROCERY & DAILY NEEDS (commerce) ─────────────────────────────────────────
const GROCERY: VerticalExperienceConfig = {
  slug: 'grocery',
  vertical: 'GROCERY',
  cardMode: 'retail',
  actionKind: 'commerce',
  theme: {
    primary: '#16a34a',
    heroGradient: 'from-green-600 via-emerald-600 to-lime-600',
    chipActive: 'bg-green-600 border-green-600 text-white shadow-md shadow-green-600/20',
    accentText: 'text-green-600',
  },
  hero: {
    title: bi('Groceries & daily needs in {city}', '{city} में किराना और रोज़मर्रा का सामान'),
    subtitle: bi('Kirana stores, supermarkets & dairies near you — order essentials in minutes.', 'आपके पास किराना, सुपरमार्केट और डेयरी — मिनटों में मंगाएं।'),
    searchPlaceholder: bi('Search stores or an item…', 'दुकान या सामान खोजें…'),
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1600&q=80',
  },
  primaryCta: bi('Order', 'ऑर्डर करें'),
  quickFilters: [
    { id: 'kirana', label: bi('Kirana', 'किराना'), emoji: '🏪', match: (l) => hasTag(l, 'kirana', 'general', 'grocery') },
    { id: 'supermarket', label: bi('Supermarket', 'सुपरमार्केट'), emoji: '🛒', match: (l) => hasTag(l, 'supermarket', 'mart', 'store') },
    { id: 'dairy', label: bi('Dairy', 'डेयरी'), emoji: '🥛', match: (l) => hasTag(l, 'dairy', 'milk') },
    { id: 'fruits-veg', label: bi('Fruits & Veg', 'फल और सब्ज़ी'), emoji: '🥦', match: (l) => hasTag(l, 'fruit', 'vegetable', 'sabzi') },
    { id: 'bakery', label: bi('Bakery', 'बेकरी'), emoji: '🍞', match: (l) => hasTag(l, 'bakery', 'bread') },
  ],
  collections: baseCollections([
    { id: 'essentials', emoji: '🧺', title: bi('Daily Essentials', 'रोज़मर्रा की ज़रूरतें'), subtitle: bi('Stock up the kitchen', 'रसोई के लिए') },
  ]),
};

// ── SHOPS & RETAIL (directory) ───────────────────────────────────────────────
const RETAIL: VerticalExperienceConfig = {
  slug: 'shops-retail',
  vertical: 'RETAIL',
  cardMode: 'retail',
  actionKind: 'directory',
  theme: {
    primary: '#2563eb',
    heroGradient: 'from-blue-600 via-indigo-600 to-violet-600',
    chipActive: 'bg-blue-600 border-blue-600 text-white shadow-md shadow-blue-600/20',
    accentText: 'text-blue-600',
  },
  hero: {
    title: bi('Shops & retail in {city}', '{city} में दुकानें और रिटेल'),
    subtitle: bi('Apparel, mobiles, electronics & jewellery from trusted local shops.', 'भरोसेमंद लोकल दुकानों से कपड़े, मोबाइल, इलेक्ट्रॉनिक्स और ज्वेलरी।'),
    searchPlaceholder: bi('Search shops or products…', 'दुकान या प्रोडक्ट खोजें…'),
    image: 'https://images.unsplash.com/photo-1481437156560-3205f6a55735?auto=format&fit=crop&w=1600&q=80',
  },
  primaryCta: bi('Visit', 'देखें'),
  quickFilters: [
    { id: 'apparel', label: bi('Apparel', 'कपड़े'), emoji: '👕', match: (l) => hasTag(l, 'apparel', 'cloth', 'fashion', 'garment') },
    { id: 'mobiles', label: bi('Mobiles', 'मोबाइल'), emoji: '📱', match: (l) => hasTag(l, 'mobile', 'phone') },
    { id: 'electronics', label: bi('Electronics', 'इलेक्ट्रॉनिक्स'), emoji: '🔌', match: (l) => hasTag(l, 'electronic', 'appliance') },
    { id: 'jewellery', label: bi('Jewellery', 'ज्वेलरी'), emoji: '💍', match: (l) => hasTag(l, 'jewel', 'gold', 'ornament') },
    { id: 'footwear', label: bi('Footwear', 'फुटवियर'), emoji: '👟', match: (l) => hasTag(l, 'footwear', 'shoe') },
  ],
  collections: baseCollections(),
};

// ── HEALTH & MEDICAL (directory) ─────────────────────────────────────────────
const HEALTH: VerticalExperienceConfig = {
  slug: 'health-medical',
  vertical: 'HEALTH_MEDICAL',
  cardMode: 'service',
  actionKind: 'directory',
  theme: {
    primary: '#0284c7',
    heroGradient: 'from-sky-600 via-cyan-600 to-blue-600',
    chipActive: 'bg-sky-600 border-sky-600 text-white shadow-md shadow-sky-600/20',
    accentText: 'text-sky-600',
  },
  hero: {
    title: bi('Doctors & clinics in {city}', '{city} में डॉक्टर और क्लिनिक'),
    subtitle: bi('Doctors, clinics, pharmacies & diagnostic labs near you — verified and reachable.', 'आपके पास डॉक्टर, क्लिनिक, फार्मेसी और लैब — सत्यापित और उपलब्ध।'),
    searchPlaceholder: bi('Search doctors, clinics or labs…', 'डॉक्टर, क्लिनिक या लैब खोजें…'),
    image: 'https://images.unsplash.com/photo-1576091160550-2173dba999ef?auto=format&fit=crop&w=1600&q=80',
  },
  primaryCta: bi('Contact', 'संपर्क करें'),
  quickFilters: [
    { id: 'physician', label: bi('Physician', 'फिजिशियन'), emoji: '🩺', match: (l) => hasTag(l, 'physician', 'general', 'clinic', 'doctor') },
    { id: 'dentist', label: bi('Dentist', 'डेंटिस्ट'), emoji: '🦷', match: (l) => hasTag(l, 'dental', 'dentist') },
    { id: 'pharmacy', label: bi('Pharmacy', 'फार्मेसी'), emoji: '💊', match: (l) => hasTag(l, 'pharmacy', 'chemist', 'medical store') },
    { id: 'lab', label: bi('Labs & Tests', 'लैब और जांच'), emoji: '🧪', match: (l) => hasTag(l, 'lab', 'diagnostic', 'pathology') },
    { id: 'child', label: bi('Child Care', 'बाल रोग'), emoji: '🧒', match: (l) => hasTag(l, 'pediatric', 'child') },
  ],
  collections: baseCollections(),
};

// ── HOME & REPAIR (directory) ────────────────────────────────────────────────
const HOME_REPAIR: VerticalExperienceConfig = {
  slug: 'home-repair',
  vertical: 'HOME_ESSENTIALS',
  cardMode: 'service',
  actionKind: 'directory',
  theme: {
    primary: '#d97706',
    heroGradient: 'from-amber-500 via-orange-600 to-red-600',
    chipActive: 'bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-600/20',
    accentText: 'text-amber-600',
  },
  hero: {
    title: bi('Home & repair help in {city}', '{city} में घर और रिपेयर सेवाएं'),
    subtitle: bi('AC, RO, electrician, plumber, carpenter & cleaning — trusted pros a call away.', 'AC, RO, इलेक्ट्रीशियन, प्लंबर, कारपेंटर और सफाई — भरोसेमंद प्रोफेशनल।'),
    searchPlaceholder: bi('Search a service or pro…', 'सेवा या प्रोफेशनल खोजें…'),
    image: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=1600&q=80',
  },
  primaryCta: bi('Call', 'कॉल करें'),
  quickFilters: [
    { id: 'ac', label: bi('AC Repair', 'AC रिपेयर'), emoji: '❄️', match: (l) => hasTag(l, 'ac', 'air condition', 'cooling') },
    { id: 'ro', label: bi('RO / Water', 'RO / पानी'), emoji: '💧', match: (l) => hasTag(l, 'ro', 'water', 'purifier') },
    { id: 'electrician', label: bi('Electrician', 'इलेक्ट्रीशियन'), emoji: '💡', match: (l) => hasTag(l, 'electric') },
    { id: 'plumber', label: bi('Plumber', 'प्लंबर'), emoji: '🚿', match: (l) => hasTag(l, 'plumb') },
    { id: 'carpenter', label: bi('Carpenter', 'कारपेंटर'), emoji: '🪚', match: (l) => hasTag(l, 'carpenter', 'wood') },
    { id: 'cleaning', label: bi('Cleaning', 'सफाई'), emoji: '🧹', match: (l) => hasTag(l, 'clean', 'pest') },
  ],
  collections: baseCollections(),
};

// ── PROFESSIONAL SERVICES (directory) ────────────────────────────────────────
const PROFESSIONAL: VerticalExperienceConfig = {
  slug: 'professional-services',
  vertical: 'PROFESSIONAL_SERVICES',
  cardMode: 'service',
  actionKind: 'directory',
  theme: {
    primary: '#7c3aed',
    heroGradient: 'from-violet-600 via-purple-600 to-indigo-600',
    chipActive: 'bg-violet-600 border-violet-600 text-white shadow-md shadow-violet-600/20',
    accentText: 'text-violet-600',
  },
  hero: {
    title: bi('Professional services in {city}', '{city} में प्रोफेशनल सेवाएं'),
    subtitle: bi('CAs, lawyers, consultants & architects — verified experts for your needs.', 'CA, वकील, सलाहकार और आर्किटेक्ट — आपकी ज़रूरत के लिए सत्यापित विशेषज्ञ।'),
    searchPlaceholder: bi('Search experts or firms…', 'विशेषज्ञ या फर्म खोजें…'),
    image: 'https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=1600&q=80',
  },
  primaryCta: bi('Contact', 'संपर्क करें'),
  quickFilters: [
    { id: 'ca', label: bi('CA / Accountant', 'CA / अकाउंटेंट'), emoji: '📊', match: (l) => hasTag(l, 'ca', 'account', 'tax', 'audit') },
    { id: 'lawyer', label: bi('Lawyer', 'वकील'), emoji: '⚖️', match: (l) => hasTag(l, 'law', 'advocate', 'legal') },
    { id: 'consultant', label: bi('Consultant', 'सलाहकार'), emoji: '💼', match: (l) => hasTag(l, 'consult') },
    { id: 'architect', label: bi('Architect', 'आर्किटेक्ट'), emoji: '📐', match: (l) => hasTag(l, 'architect', 'interior', 'design') },
  ],
  collections: baseCollections(),
};

// ── EDUCATION & COACHING (directory) ─────────────────────────────────────────
const EDUCATION: VerticalExperienceConfig = {
  slug: 'education',
  vertical: 'EDUCATION',
  cardMode: 'service',
  actionKind: 'directory',
  theme: {
    primary: '#4f46e5',
    heroGradient: 'from-indigo-600 via-blue-600 to-sky-600',
    chipActive: 'bg-indigo-600 border-indigo-600 text-white shadow-md shadow-indigo-600/20',
    accentText: 'text-indigo-600',
  },
  hero: {
    title: bi('Coaching & classes in {city}', '{city} में कोचिंग और क्लासेस'),
    subtitle: bi('Schools, coaching centres, tuition & skill classes near you.', 'आपके पास स्कूल, कोचिंग सेंटर, ट्यूशन और स्किल क्लासेस।'),
    searchPlaceholder: bi('Search classes or tutors…', 'क्लास या ट्यूटर खोजें…'),
    image: 'https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1600&q=80',
  },
  primaryCta: bi('Enquire', 'पूछताछ करें'),
  quickFilters: [
    { id: 'coaching', label: bi('Coaching', 'कोचिंग'), emoji: '📚', match: (l) => hasTag(l, 'coaching', 'academy', 'institute') },
    { id: 'tuition', label: bi('Tuition', 'ट्यूशन'), emoji: '✏️', match: (l) => hasTag(l, 'tuition', 'tutor') },
    { id: 'computer', label: bi('Computer', 'कंप्यूटर'), emoji: '💻', match: (l) => hasTag(l, 'computer', 'it', 'software') },
    { id: 'music-dance', label: bi('Music & Dance', 'संगीत और नृत्य'), emoji: '🎵', match: (l) => hasTag(l, 'music', 'dance', 'art') },
    { id: 'language', label: bi('Language', 'भाषा'), emoji: '🗣️', match: (l) => hasTag(l, 'language', 'english', 'spoken') },
  ],
  collections: baseCollections(),
};

// ── FITNESS & WELLNESS (bookable) ────────────────────────────────────────────
const FITNESS: VerticalExperienceConfig = {
  slug: 'fitness',
  vertical: 'FITNESS',
  cardMode: 'service',
  actionKind: 'bookable',
  theme: {
    primary: '#ea580c',
    heroGradient: 'from-orange-600 via-red-600 to-rose-600',
    chipActive: 'bg-orange-600 border-orange-600 text-white shadow-md shadow-orange-600/20',
    accentText: 'text-orange-600',
  },
  hero: {
    title: bi('Gyms & wellness in {city}', '{city} में जिम और वेलनेस'),
    subtitle: bi('Gyms, yoga, physio & dieticians — book a session or a free trial.', 'जिम, योग, फिजियो और डाइटीशियन — सेशन या फ्री ट्रायल बुक करें।'),
    searchPlaceholder: bi('Search gyms or trainers…', 'जिम या ट्रेनर खोजें…'),
    image: 'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=1600&q=80',
  },
  primaryCta: bi('Book Trial', 'ट्रायल बुक करें'),
  quickFilters: [
    { id: 'gym', label: bi('Gym', 'जिम'), emoji: '🏋️', match: (l) => hasTag(l, 'gym', 'fitness') },
    { id: 'yoga', label: bi('Yoga', 'योग'), emoji: '🧘', match: (l) => hasTag(l, 'yoga', 'meditation') },
    { id: 'physio', label: bi('Physio', 'फिजियो'), emoji: '💪', match: (l) => hasTag(l, 'physio', 'rehab') },
    { id: 'dietician', label: bi('Dietician', 'डाइटीशियन'), emoji: '🥗', match: (l) => hasTag(l, 'diet', 'nutrition') },
  ],
  collections: baseCollections(),
};

// ── AUTOMOTIVE (directory) ───────────────────────────────────────────────────
const AUTOMOTIVE: VerticalExperienceConfig = {
  slug: 'automotive',
  vertical: 'AUTOMOTIVE',
  cardMode: 'service',
  actionKind: 'directory',
  theme: {
    primary: '#ca8a04',
    heroGradient: 'from-yellow-500 via-amber-600 to-orange-600',
    chipActive: 'bg-amber-600 border-amber-600 text-white shadow-md shadow-amber-600/20',
    accentText: 'text-amber-600',
  },
  hero: {
    title: bi('Car & bike services in {city}', '{city} में कार और बाइक सेवाएं'),
    subtitle: bi('Service centres, spares, tyres & car wash — keep your ride running.', 'सर्विस सेंटर, स्पेयर, टायर और कार वॉश।'),
    searchPlaceholder: bi('Search garages or spares…', 'गैराज या स्पेयर खोजें…'),
    image: 'https://images.unsplash.com/photo-1486262715619-67b85e0b08d3?auto=format&fit=crop&w=1600&q=80',
  },
  primaryCta: bi('Call', 'कॉल करें'),
  quickFilters: [
    { id: 'service', label: bi('Service Centre', 'सर्विस सेंटर'), emoji: '🔧', match: (l) => hasTag(l, 'service', 'garage', 'repair') },
    { id: 'spares', label: bi('Spares', 'स्पेयर'), emoji: '⚙️', match: (l) => hasTag(l, 'spare', 'parts') },
    { id: 'tyres', label: bi('Tyres', 'टायर'), emoji: '🛞', match: (l) => hasTag(l, 'tyre', 'tire', 'wheel') },
    { id: 'wash', label: bi('Car Wash', 'कार वॉश'), emoji: '🚿', match: (l) => hasTag(l, 'wash', 'detail') },
    { id: 'two-wheeler', label: bi('Two-Wheeler', 'टू-व्हीलर'), emoji: '🏍️', match: (l) => hasTag(l, 'bike', 'two wheeler', 'scooter') },
  ],
  collections: baseCollections(),
};

// ── REAL ESTATE (directory) ──────────────────────────────────────────────────
const REAL_ESTATE: VerticalExperienceConfig = {
  slug: 'real-estate',
  vertical: 'REAL_ESTATE',
  cardMode: 'service',
  actionKind: 'directory',
  theme: {
    primary: '#0891b2',
    heroGradient: 'from-cyan-600 via-sky-600 to-blue-600',
    chipActive: 'bg-cyan-600 border-cyan-600 text-white shadow-md shadow-cyan-600/20',
    accentText: 'text-cyan-600',
  },
  hero: {
    title: bi('Property & rentals in {city}', '{city} में प्रॉपर्टी और किराया'),
    subtitle: bi('Agents, PG/hostels, rentals & builders — find your next place.', 'एजेंट, PG/हॉस्टल, किराया और बिल्डर।'),
    searchPlaceholder: bi('Search agents or localities…', 'एजेंट या इलाका खोजें…'),
    image: 'https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=1600&q=80',
  },
  primaryCta: bi('Enquire', 'पूछताछ करें'),
  quickFilters: [
    { id: 'agents', label: bi('Agents', 'एजेंट'), emoji: '🤝', match: (l) => hasTag(l, 'agent', 'broker', 'realtor', 'property') },
    { id: 'pg', label: bi('PG / Hostel', 'PG / हॉस्टल'), emoji: '🛏️', match: (l) => hasTag(l, 'pg', 'hostel') },
    { id: 'rentals', label: bi('Rentals', 'किराया'), emoji: '🏠', match: (l) => hasTag(l, 'rent', 'lease') },
    { id: 'builders', label: bi('Builders', 'बिल्डर'), emoji: '🏗️', match: (l) => hasTag(l, 'builder', 'construction', 'developer') },
  ],
  collections: baseCollections(),
};

// ── HOTELS & HOSPITALITY (directory) ─────────────────────────────────────────
const HOTELS: VerticalExperienceConfig = {
  slug: 'hotels',
  vertical: 'HOTELS',
  cardMode: 'service',
  actionKind: 'directory',
  theme: {
    primary: '#9333ea',
    heroGradient: 'from-purple-600 via-fuchsia-600 to-pink-600',
    chipActive: 'bg-purple-600 border-purple-600 text-white shadow-md shadow-purple-600/20',
    accentText: 'text-purple-600',
  },
  hero: {
    title: bi('Hotels & stays in {city}', '{city} में होटल और ठहरने की जगह'),
    subtitle: bi('Hotels, banquets & guest houses — for stays, functions & events.', 'होटल, बैंक्वेट और गेस्ट हाउस — ठहरने और आयोजनों के लिए।'),
    searchPlaceholder: bi('Search hotels or banquets…', 'होटल या बैंक्वेट खोजें…'),
    image: 'https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1600&q=80',
  },
  primaryCta: bi('Enquire', 'पूछताछ करें'),
  quickFilters: [
    { id: 'hotels', label: bi('Hotels', 'होटल'), emoji: '🏨', match: (l) => hasTag(l, 'hotel', 'stay', 'lodge') },
    { id: 'banquets', label: bi('Banquets', 'बैंक्वेट'), emoji: '🎀', match: (l) => hasTag(l, 'banquet', 'marriage', 'hall') },
    { id: 'guesthouse', label: bi('Guest Houses', 'गेस्ट हाउस'), emoji: '🏡', match: (l) => hasTag(l, 'guest', 'guesthouse') },
    { id: 'resort', label: bi('Resorts', 'रिसॉर्ट'), emoji: '🌴', match: (l) => hasTag(l, 'resort') },
  ],
  collections: baseCollections(),
};

// ── EVENTS & WEDDING (directory) ─────────────────────────────────────────────
const EVENTS: VerticalExperienceConfig = {
  slug: 'events',
  vertical: 'EVENTS',
  cardMode: 'service',
  actionKind: 'directory',
  theme: {
    primary: '#db2777',
    heroGradient: 'from-pink-600 via-rose-600 to-red-600',
    chipActive: 'bg-pink-600 border-pink-600 text-white shadow-md shadow-pink-600/20',
    accentText: 'text-pink-600',
  },
  hero: {
    title: bi('Events & wedding services in {city}', '{city} में इवेंट और शादी सेवाएं'),
    subtitle: bi('Caterers, photographers, decorators & DJs — plan your perfect day.', 'कैटरर, फोटोग्राफर, डेकोरेटर और DJ — अपना खास दिन प्लान करें।'),
    searchPlaceholder: bi('Search caterers or photographers…', 'कैटरर या फोटोग्राफर खोजें…'),
    image: 'https://images.unsplash.com/photo-1519225421980-715cb0215aed?auto=format&fit=crop&w=1600&q=80',
  },
  primaryCta: bi('Enquire', 'पूछताछ करें'),
  quickFilters: [
    { id: 'caterers', label: bi('Caterers', 'कैटरर'), emoji: '🍽️', match: (l) => hasTag(l, 'cater', 'food') },
    { id: 'photo', label: bi('Photographers', 'फोटोग्राफर'), emoji: '📸', match: (l) => hasTag(l, 'photo', 'video', 'film') },
    { id: 'decor', label: bi('Decorators', 'डेकोरेटर'), emoji: '🎈', match: (l) => hasTag(l, 'decor', 'flower', 'light') },
    { id: 'dj', label: bi('DJ & Music', 'DJ और संगीत'), emoji: '🎧', match: (l) => hasTag(l, 'dj', 'music', 'band') },
    { id: 'tent', label: bi('Tent & Mandap', 'टेंट और मंडप'), emoji: '⛺', match: (l) => hasTag(l, 'tent', 'mandap') },
  ],
  collections: baseCollections(),
};

// ── PERSONAL SERVICES (directory) ────────────────────────────────────────────
const PERSONAL: VerticalExperienceConfig = {
  slug: 'personal-services',
  vertical: 'PERSONAL_SERVICES',
  cardMode: 'service',
  actionKind: 'directory',
  theme: {
    primary: '#0d9488',
    heroGradient: 'from-teal-600 via-emerald-600 to-green-600',
    chipActive: 'bg-teal-600 border-teal-600 text-white shadow-md shadow-teal-600/20',
    accentText: 'text-teal-600',
  },
  hero: {
    title: bi('Personal services in {city}', '{city} में पर्सनल सेवाएं'),
    subtitle: bi('Tailors, laundry, cobblers & pet grooming — everyday help nearby.', 'दर्जी, लॉन्ड्री, मोची और पेट ग्रूमिंग — रोज़मर्रा की मदद।'),
    searchPlaceholder: bi('Search a service…', 'सेवा खोजें…'),
    image: 'https://images.unsplash.com/photo-1556905055-8f358a7a47b2?auto=format&fit=crop&w=1600&q=80',
  },
  primaryCta: bi('Contact', 'संपर्क करें'),
  quickFilters: [
    { id: 'tailor', label: bi('Tailor', 'दर्जी'), emoji: '🧵', match: (l) => hasTag(l, 'tailor', 'stitch', 'boutique') },
    { id: 'laundry', label: bi('Laundry', 'लॉन्ड्री'), emoji: '🧺', match: (l) => hasTag(l, 'laundry', 'dry clean', 'wash') },
    { id: 'cobbler', label: bi('Cobbler', 'मोची'), emoji: '👞', match: (l) => hasTag(l, 'cobbler', 'shoe repair') },
    { id: 'pet', label: bi('Pet Grooming', 'पेट ग्रूमिंग'), emoji: '🐾', match: (l) => hasTag(l, 'pet', 'grooming', 'vet') },
  ],
  collections: baseCollections(),
};

// ── TRAVEL & TRANSPORT (directory) ───────────────────────────────────────────
const TRAVEL: VerticalExperienceConfig = {
  slug: 'travel',
  vertical: 'TRAVEL',
  cardMode: 'service',
  actionKind: 'directory',
  theme: {
    primary: '#0891b2',
    heroGradient: 'from-sky-600 via-cyan-600 to-teal-600',
    chipActive: 'bg-cyan-600 border-cyan-600 text-white shadow-md shadow-cyan-600/20',
    accentText: 'text-cyan-600',
  },
  hero: {
    title: bi('Travel & transport in {city}', '{city} में ट्रैवल और ट्रांसपोर्ट'),
    subtitle: bi('Travel agents, cabs, movers & couriers — get there and ship it.', 'ट्रैवल एजेंट, कैब, मूवर्स और कूरियर।'),
    searchPlaceholder: bi('Search agents or cabs…', 'एजेंट या कैब खोजें…'),
    image: 'https://images.unsplash.com/photo-1436491865332-7a61a109cc05?auto=format&fit=crop&w=1600&q=80',
  },
  primaryCta: bi('Call', 'कॉल करें'),
  quickFilters: [
    { id: 'agents', label: bi('Travel Agents', 'ट्रैवल एजेंट'), emoji: '🧳', match: (l) => hasTag(l, 'travel', 'tour', 'agent', 'ticket') },
    { id: 'cabs', label: bi('Cabs & Taxi', 'कैब और टैक्सी'), emoji: '🚕', match: (l) => hasTag(l, 'cab', 'taxi', 'car rental') },
    { id: 'movers', label: bi('Movers', 'मूवर्स'), emoji: '📦', match: (l) => hasTag(l, 'mover', 'packer', 'shifting') },
    { id: 'courier', label: bi('Courier', 'कूरियर'), emoji: '✉️', match: (l) => hasTag(l, 'courier', 'parcel', 'logistic') },
  ],
  collections: baseCollections(),
};

// ── FINANCIAL SERVICES (directory) ───────────────────────────────────────────
const FINANCIAL: VerticalExperienceConfig = {
  slug: 'financial',
  vertical: 'FINANCIAL_SERVICES',
  cardMode: 'service',
  actionKind: 'directory',
  theme: {
    primary: '#059669',
    heroGradient: 'from-emerald-600 via-green-600 to-teal-700',
    chipActive: 'bg-emerald-600 border-emerald-600 text-white shadow-md shadow-emerald-600/20',
    accentText: 'text-emerald-600',
  },
  hero: {
    title: bi('Financial services in {city}', '{city} में वित्तीय सेवाएं'),
    subtitle: bi('Loans, insurance, mutual funds & banking help from local advisors.', 'लोन, बीमा, म्यूचुअल फंड और बैंकिंग सहायता।'),
    searchPlaceholder: bi('Search advisors or services…', 'सलाहकार या सेवा खोजें…'),
    image: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=1600&q=80',
  },
  primaryCta: bi('Enquire', 'पूछताछ करें'),
  quickFilters: [
    { id: 'loans', label: bi('Loans', 'लोन'), emoji: '🏦', match: (l) => hasTag(l, 'loan', 'finance', 'credit') },
    { id: 'insurance', label: bi('Insurance', 'बीमा'), emoji: '🛡️', match: (l) => hasTag(l, 'insurance', 'policy', 'lic') },
    { id: 'investment', label: bi('Investment', 'निवेश'), emoji: '📈', match: (l) => hasTag(l, 'mutual', 'invest', 'wealth', 'stock') },
    { id: 'tax', label: bi('Tax & GST', 'टैक्स और GST'), emoji: '🧾', match: (l) => hasTag(l, 'tax', 'gst', 'account') },
  ],
  collections: baseCollections(),
};

export const VERTICAL_EXPERIENCES: Record<string, VerticalExperienceConfig> = {
  'food-beverage': FOOD,
  'grocery': GROCERY,
  'shops-retail': RETAIL,
  'salon-beauty': SALON,
  'health-medical': HEALTH,
  'home-repair': HOME_REPAIR,
  'professional-services': PROFESSIONAL,
  'education': EDUCATION,
  'fitness': FITNESS,
  'automotive': AUTOMOTIVE,
  'real-estate': REAL_ESTATE,
  'hotels': HOTELS,
  'events': EVENTS,
  'personal-services': PERSONAL,
  'travel': TRAVEL,
  'financial': FINANCIAL,
};

export const getVerticalExperience = (slug: string): VerticalExperienceConfig | null =>
  VERTICAL_EXPERIENCES[slug] || null;
