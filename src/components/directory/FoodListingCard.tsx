'use client';

import Link from 'next/link';
import { Star, MapPin, Clock, BadgePercent, CalendarCheck, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Listing } from '@/lib/directory';

interface FoodListingCardProps {
  listing: Listing;
  onBook?: (listing: Listing) => void;
  onTap?: () => void;
  loading?: boolean;
}

export default function FoodListingCard({ listing, onBook, onTap, loading }: FoodListingCardProps) {
  if (loading) {
    return (
      <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <Skeleton className="h-40 sm:h-52 w-full rounded-none" />
        <div className="p-4 space-y-2.5">
          <Skeleton className="h-3 w-24" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-9 w-full rounded-xl mt-2" />
        </div>
      </div>
    );
  }

  const meta = listing.metaData || (listing as any).metaData || {};
  const cuisines: string[] = meta.cuisines || meta.osm?.subcategory?.split(';') || ['Multi-Cuisine'];
  const avgPrice = meta.avgPrice || 250;
  const deliveryTime = meta.deliveryTime || '30–40 min';
  const isVegOnly = meta.isVegOnly || false;
  const hasOffer = meta.offers?.length > 0;
  const rawOffer = hasOffer ? meta.offers[0] : null;
  const offerLabel: string | null = rawOffer
    ? (typeof rawOffer === 'string' ? rawOffer : rawOffer?.title || rawOffer?.label || 'Special offer')
    : null;

  const coverImage =
    listing.media?.find(m => m.type === 'profile_image' || m.type === 'gallery')?.secureUrl ||
    (listing as any).media?.[0]?.secureUrl ||
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&h=300';

  const handleTap = (e: React.MouseEvent) => {
    if (onTap) {
      e.preventDefault();
      onTap();
    }
  };

  return (
    <div
      onClick={handleTap}
      className={`group relative flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-rose-200 transition-all duration-300 overflow-hidden active:scale-[0.98] ${onTap ? 'cursor-pointer' : ''}`}
    >
      {/* Cover image */}
      <div className="relative h-40 sm:h-52 w-full overflow-hidden bg-zinc-100 shrink-0">
        <img
          src={coverImage}
          alt={listing.businessName}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Veg badge */}
        {isVegOnly && (
          <span className="absolute top-3 left-3 flex items-center gap-1.5 bg-emerald-600 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg shadow-sm">
            <span className="w-1.5 h-1.5 rounded-full bg-white shrink-0" />
            Pure Veg
          </span>
        )}

        {/* Rating badge */}
        {listing.rating > 0 && (
          <div className="absolute bottom-3 right-3 bg-white text-zinc-900 font-black text-sm px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            {listing.rating.toFixed(1)}
          </div>
        )}

        {/* Offer ribbon at image bottom */}
        {offerLabel && (
          <div className="absolute bottom-0 left-0 right-0 bg-rose-600/90 text-white text-[11px] font-bold px-3 py-1.5 flex items-center gap-1.5 backdrop-blur-sm">
            <BadgePercent className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{offerLabel}</span>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 p-4 flex flex-col gap-3">
        {/* Cuisine pills */}
        <div className="flex gap-1.5 overflow-x-auto hide-scrollbar">
          {cuisines.slice(0, 3).map((c, i) => (
            <span key={i} className="shrink-0 text-[11px] font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5">
              {c.trim()}
            </span>
          ))}
        </div>

        <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 leading-snug group-hover:text-rose-600 transition-colors line-clamp-1">
          {listing.businessName}
        </h3>

        <div className="flex items-center gap-2 text-xs font-medium text-zinc-500">
          <Clock className="w-3.5 h-3.5 text-zinc-400 shrink-0" />
          <span>{deliveryTime}</span>
          <span className="w-1 h-1 bg-zinc-300 rounded-full shrink-0" />
          <span>₹{avgPrice} for two</span>
        </div>

        <p className="flex items-center gap-1 text-xs font-medium text-zinc-400">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{listing.localityName}</span>
        </p>

        {/* CTA */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          {onBook && !onTap && (
            <button
              onClick={e => { e.stopPropagation(); onBook(listing); }}
              className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl text-xs font-bold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 active:scale-[0.98] transition-all"
            >
              <CalendarCheck className="w-3.5 h-3.5" />
              Book
            </button>
          )}
          {onTap ? (
            <button
              onClick={handleTap}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm active:scale-[0.98] transition-all"
            >
              View Details
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <Link
              href={`/${listing.slug}`}
              onClick={e => e.stopPropagation()}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm active:scale-[0.98] transition-all"
            >
              Order Menu
              <ArrowRight className="w-4 h-4" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
