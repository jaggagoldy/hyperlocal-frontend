'use client';

import Link from 'next/link';
import { Star, ShoppingBag, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Listing } from '@/lib/directory';

interface RetailStoreCardProps {
  listing: Listing;
  onTap?: () => void;
  loading?: boolean;
}

export default function RetailStoreCard({ listing, onTap, loading }: RetailStoreCardProps) {
  if (loading) {
    return (
      <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <Skeleton className="h-40 sm:h-52 w-full rounded-none" />
        <div className="p-4 space-y-2.5">
          <Skeleton className="h-3 w-20" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-9 w-full rounded-xl mt-2" />
        </div>
      </div>
    );
  }

  const meta = listing.metaData || (listing as any).metaData || {};
  const sub = (meta.osm?.subcategory || listing.businessType.replace(/_/g, ' ')).replace(/-/g, ' ');
  const rating = listing.rating || 0;

  const coverImage =
    listing.media?.find(m => m.type === 'profile_image' || m.type === 'gallery')?.secureUrl ||
    (listing as any).media?.[0]?.secureUrl ||
    'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=500&h=300';

  const handleTap = (e: React.MouseEvent) => {
    if (onTap) {
      e.preventDefault();
      onTap();
    }
  };

  return (
    <div
      onClick={handleTap}
      className={`group relative flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-cyan-200 transition-all duration-300 overflow-hidden active:scale-[0.98] ${onTap ? 'cursor-pointer' : ''}`}
    >
      {/* Cover image */}
      <div className="relative h-40 sm:h-52 w-full overflow-hidden bg-zinc-100 shrink-0">
        <img
          src={coverImage}
          alt={listing.businessName}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Category badge */}
        <span className="absolute top-3 left-3 bg-cyan-600 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
          <ShoppingBag className="w-3 h-3" />
          {sub.split(' ')[0]}
        </span>

        {/* Rating */}
        {rating > 0 && (
          <div className="absolute bottom-3 right-3 bg-white text-zinc-900 font-black text-sm px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            {rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 p-4 flex flex-col gap-3">
        <p className="text-[11px] font-bold text-cyan-600 uppercase tracking-wide truncate">{sub}</p>

        <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 leading-snug group-hover:text-cyan-600 transition-colors line-clamp-1">
          {listing.businessName}
        </h3>

        {/* CTA */}
        {onTap ? (
          <button
            onClick={handleTap}
            className="mt-auto w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-cyan-600 hover:bg-cyan-700 shadow-sm active:scale-[0.98] transition-all"
          >
            View Store
            <ArrowRight className="w-4 h-4" />
          </button>
        ) : (
          <Link
            href={`/${listing.slug}`}
            onClick={e => e.stopPropagation()}
            className="mt-auto w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-zinc-900 hover:bg-zinc-800 shadow-sm active:scale-[0.98] transition-all"
          >
            {listing.listingTier === 'COMMERCE' ? 'Shop Now' : 'Visit Shop'}
            <ArrowRight className="w-4 h-4" />
          </Link>
        )}
      </div>
    </div>
  );
}
