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
  onTap?: (listing: Listing) => void;
  loading?: boolean;
}

export default function SearchCardSelector({
  listing,
  mode,
  onBookTrigger,
  onTap,
  loading,
}: SearchCardSelectorProps) {
  const tapHandler = onTap ? () => onTap(listing) : undefined;

  if (mode === 'food') {
    return <FoodListingCard listing={listing} onBook={onBookTrigger} onTap={tapHandler} loading={loading} />;
  }
  if (mode === 'retail') {
    return <RetailStoreCard listing={listing} onTap={tapHandler} loading={loading} />;
  }
  if (mode === 'service') {
    return <ServiceListingCard listing={listing} onBookTrigger={onBookTrigger} onTap={tapHandler} loading={loading} />;
  }

  const type = (listing.businessType || '').toUpperCase();
  if (['FOOD_BEVERAGE', 'RESTAURANT', 'CAFE', 'FOOD'].includes(type)) {
    return <FoodListingCard listing={listing} onTap={tapHandler} loading={loading} />;
  }
  if (['RETAIL', 'GROCERY'].includes(type)) {
    return <RetailStoreCard listing={listing} onTap={tapHandler} loading={loading} />;
  }
  if (['SALON_BEAUTY', 'HEALTH_MEDICAL', 'HOME_ESSENTIALS', 'PROFESSIONAL_SERVICES', 'EDUCATION', 'FITNESS', 'AUTOMOTIVE', 'REAL_ESTATE', 'HOTELS', 'EVENTS', 'PERSONAL_SERVICES', 'TRAVEL', 'FINANCIAL_SERVICES'].includes(type)) {
    return <ServiceListingCard listing={listing} onBookTrigger={onBookTrigger} onTap={tapHandler} loading={loading} />;
  }

  return <ListingCard listing={listing} />;
}
