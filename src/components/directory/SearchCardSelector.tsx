'use client';

import FoodListingCard from './FoodListingCard';
import RetailStoreCard from './RetailStoreCard';
import ServiceListingCard from './ServiceListingCard';
import ListingCard from './ListingCard';
import { Listing } from '@/lib/directory';

interface SearchCardSelectorProps {
  listing: Listing;
  mode?: 'food' | 'retail' | 'service' | 'generic';
  onBookTrigger?: (listing: Listing) => void;
}

export default function SearchCardSelector({ 
  listing, 
  mode,
  onBookTrigger 
}: SearchCardSelectorProps) {
  if (mode === 'food') {
    return <FoodListingCard listing={listing} />;
  }
  if (mode === 'retail') {
    return <RetailStoreCard listing={listing} />;
  }
  if (mode === 'service') {
    return <ServiceListingCard listing={listing} onBookTrigger={onBookTrigger} />;
  }
  
  // Dynamic fallback based on businessType vertical
  const type = (listing.businessType || '').toUpperCase();
  if (['FOOD_BEVERAGE', 'RESTAURANT', 'CAFE', 'FOOD'].includes(type)) {
    return <FoodListingCard listing={listing} />;
  }
  if (['RETAIL', 'GROCERY'].includes(type)) {
    return <RetailStoreCard listing={listing} />;
  }
  if (['SALON_BEAUTY', 'HEALTH_MEDICAL', 'HOME_ESSENTIALS', 'PROFESSIONAL_SERVICES', 'EDUCATION', 'FITNESS', 'AUTOMOTIVE', 'REAL_ESTATE', 'HOTELS', 'EVENTS', 'PERSONAL_SERVICES', 'TRAVEL', 'FINANCIAL_SERVICES'].includes(type)) {
    return <ServiceListingCard listing={listing} onBookTrigger={onBookTrigger} />;
  }

  return <ListingCard listing={listing} />;
}
