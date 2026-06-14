import React from 'react';
import FoodClassic from '@/components/templates/FoodClassic';
import FoodImmersive from '@/components/templates/FoodImmersive';
import FoodPremiumDark from '@/components/templates/FoodPremiumDark';
import FoodPremiumLight from '@/components/templates/FoodPremiumLight';
import FoodPremiumVibrant from '@/components/templates/FoodPremiumVibrant';
import RetailClassic from '@/components/templates/RetailClassic';
import RetailFashion from '@/components/templates/RetailFashion';
import RetailGrocery from '@/components/templates/RetailGrocery';
import RetailTech from '@/components/templates/RetailTech';
import CabTransportLayout from '@/components/vendor/CabTransportLayout';
import HomeServicesLayout from '@/components/vendor/HomeServicesLayout';
import VCardSalonDark from '@/components/templates/VCardSalonDark';
import VCardSalonLight from '@/components/templates/VCardSalonLight';
import VCardDoctorBlue from '@/components/templates/VCardDoctorBlue';
import VCardDoctorGreen from '@/components/templates/VCardDoctorGreen';
import VCardTutorVibrant from '@/components/templates/VCardTutorVibrant';
import VCardTutorClean from '@/components/templates/VCardTutorClean';
import { BusinessProfile } from '@/types/models';


import { LayoutTemplate, Smartphone, Grid, Store, Car, Briefcase, Sparkles, ShoppingBag, Zap } from 'lucide-react';

export const TEMPLATE_METADATA = [
  {
    id: 'food-classic',
    archetype: 'FOOD_BEVERAGE',
    name: 'Classic List',
    description: 'A clean, vertical list layout perfect for menus and large catalogs. Includes a sticky bottom cart.',
    icon: LayoutTemplate,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
  },
  {
    id: 'food-immersive',
    archetype: 'FOOD_BEVERAGE',
    name: 'Immersive Grid',
    description: 'A visually striking, full-screen dark mode layout. Great for showcasing high-quality photos.',
    icon: Smartphone,
    color: 'bg-rose-50 text-rose-600 border-rose-200'
  },
  {
    id: 'food-premium-dark',
    archetype: 'FOOD_BEVERAGE',
    name: 'Premium Dark',
    description: 'A luxurious dark aesthetic with glassmorphism overlays and neon accents. Perfect for high-end dining.',
    icon: Smartphone,
    color: 'bg-zinc-900 text-cyan-400 border-cyan-500/30'
  },
  {
    id: 'food-premium-light',
    archetype: 'FOOD_BEVERAGE',
    name: 'Premium Light',
    description: 'An ultra-clean, minimalist white layout with soft shadows and rounded corners.',
    icon: Smartphone,
    color: 'bg-zinc-50 text-zinc-900 border-zinc-200'
  },
  {
    id: 'food-premium-vibrant',
    archetype: 'FOOD_BEVERAGE',
    name: 'Premium Vibrant',
    description: 'A highly engaging, playful design with warm colors, offset grids, and floating badges.',
    icon: Grid,
    color: 'bg-orange-50 text-orange-600 border-orange-200'
  },
  {
    id: 'retail-classic',
    archetype: 'RETAIL',
    name: 'eCommerce Storefront',
    description: 'A modern, clean product grid optimized for B2C retail, electronics, and fashion.',
    icon: Store,
    color: 'bg-zinc-100 text-zinc-900 border-zinc-300'
  },
  {
    id: 'retail-fashion',
    archetype: 'RETAIL',
    name: 'Sleek Fashion',
    description: 'Edge-to-edge photography with minimal UI borders and elegant typography.',
    icon: Sparkles,
    color: 'bg-stone-100 text-stone-900 border-stone-300'
  },
  {
    id: 'retail-grocery',
    archetype: 'RETAIL',
    name: 'Supermarket Grocery',
    description: 'Dense grid layout with quick add buttons for rapid shopping.',
    icon: ShoppingBag,
    color: 'bg-emerald-50 text-emerald-600 border-emerald-200'
  },
  {
    id: 'retail-tech',
    archetype: 'RETAIL',
    name: 'CyberVault Tech',
    description: 'Sleek dark mode with subtle neon gradients. Extremely professional and modern.',
    icon: Zap,
    color: 'bg-zinc-900 text-cyan-400 border-cyan-500'
  },
  {
    id: 'cab-classic',
    archetype: 'CAB_TRANSPORT',
    name: 'Cab Booking Standard',
    description: 'Default layout for cab booking.',
    icon: Car,
    color: 'bg-blue-50 text-blue-600 border-blue-200'
  },
  {
    id: 'service-classic',
    archetype: 'SERVICE',
    name: 'Service Standard',
    description: 'Default layout for service providers.',
    icon: Briefcase,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
  },
  {
    id: 'listing-classic',
    archetype: 'LISTING',
    name: 'Listing Standard',
    description: 'Default layout for listings.',
    icon: Store,
    color: 'bg-orange-50 text-orange-600 border-orange-200'
  },
  {
    id: 'vcard-salon-dark',
    archetype: 'SERVICE',
    name: 'Luxe Dark (Salon/Spa)',
    description: 'A sleek, premium dark theme with gold accents. Perfect for high-end salons and spas.',
    icon: Sparkles,
    color: 'bg-zinc-900 text-yellow-500 border-yellow-500/50'
  },
  {
    id: 'vcard-salon-light',
    archetype: 'SERVICE',
    name: 'Soft Light (Salon/Spa)',
    description: 'A light, airy theme with soft pink accents and clean white backgrounds.',
    icon: Sparkles,
    color: 'bg-pink-50 text-pink-600 border-pink-200'
  },
  {
    id: 'vcard-doctor-blue',
    archetype: 'SERVICE',
    name: 'Trust Blue (Doctor/Clinic)',
    description: 'A trustworthy medical blue theme. Clean, clinical, professional.',
    icon: Briefcase,
    color: 'bg-blue-50 text-blue-600 border-blue-200'
  },
  {
    id: 'vcard-doctor-green',
    archetype: 'SERVICE',
    name: 'Holistic Green (Wellness)',
    description: 'Calming holistic green and earth tones. Warm, inviting, trustworthy.',
    icon: Briefcase,
    color: 'bg-green-50 text-green-600 border-green-200'
  },
  {
    id: 'vcard-tutor-vibrant',
    archetype: 'SERVICE',
    name: 'Vibrant Academic (Tutor)',
    description: 'Vibrant academic theme with indigo and orange. Energetic and engaging.',
    icon: Briefcase,
    color: 'bg-indigo-50 text-indigo-600 border-indigo-200'
  },
  {
    id: 'vcard-tutor-clean',
    archetype: 'SERVICE',
    name: 'Clean Academic (Tutor)',
    description: 'Clean, focused academic theme with soft gray and bright blue.',
    icon: Briefcase,
    color: 'bg-slate-50 text-slate-600 border-slate-200'
  }
];

export interface TemplateProps {
  business: BusinessProfile;
}

export const TemplateRegistry: Record<string, React.FC<TemplateProps>> = {
  // Food Templates
  'food-classic': FoodClassic,
  'food-immersive': FoodImmersive,
  'food-premium-dark': FoodPremiumDark,
  'food-premium-light': FoodPremiumLight,
  'food-premium-vibrant': FoodPremiumVibrant,
  
  // Retail Templates
  'retail-classic': RetailClassic,
  'retail-fashion': RetailFashion,
  'retail-grocery': RetailGrocery,
  'retail-tech': RetailTech,
  
  // Base fallbacks mapping back to existing templates for other Archetypes
  'cab-classic': CabTransportLayout,
  'service-classic': HomeServicesLayout,
  'listing-classic': HomeServicesLayout,
  
  // vCard Themes
  'vcard-salon-dark': VCardSalonDark,
  'vcard-salon-light': VCardSalonLight,
  'vcard-doctor-blue': VCardDoctorBlue,
  'vcard-doctor-green': VCardDoctorGreen,
  'vcard-tutor-vibrant': VCardTutorVibrant,
  'vcard-tutor-clean': VCardTutorClean,
};

export const getTemplateArchetype = (type?: string): string => {
  const t = type?.toUpperCase() || 'FOOD_BEVERAGE';
  if (['FOOD_BEVERAGE', 'RESTAURANT', 'CAFE', 'FOOD', 'RESTAURANT_CAFE', 'RESTAURANT / CAFE'].includes(t)) return 'FOOD_BEVERAGE';
  if (['RETAIL', 'GROCERY'].includes(t)) return 'RETAIL';
  if (['CAB_TRANSPORT'].includes(t)) return 'CAB_TRANSPORT';
  if (['SERVICE_BOOKING', 'SERVICE_LEADGEN', 'SERVICE', 'REAL_ESTATE', 'INFLUENCER', 'PG_HOSTEL', 'DOCTOR', 'SALON_BEAUTY', 'GYM', 'TUTOR', 'HOME_ESSENTIALS', 'REPAIR_SERVICE', 'PLUMBER', 'ELECTRICIAN', 'LISTING'].includes(t)) return 'SERVICE';
  return 'FOOD_BEVERAGE';
};

export const getTemplateComponent = (templateId: string, archetype: string) => {
  if (TemplateRegistry[templateId]) {
    return TemplateRegistry[templateId];
  }
  
  // Fallbacks based on archetype
  if (archetype === 'FOOD_BEVERAGE') return FoodClassic;
  if (archetype === 'RETAIL') return RetailClassic;
  if (archetype === 'CAB_TRANSPORT') return CabTransportLayout;
  return HomeServicesLayout;
};
