'use client';

import Link from 'next/link';
import { Star, MapPin, BadgeCheck, ShieldAlert, Award, CalendarDays, ArrowRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Listing, tierBadge } from '@/lib/directory';

interface ServiceListingCardProps {
  listing: Listing;
  onBookTrigger?: (listing: Listing) => void;
  onTap?: () => void;
  loading?: boolean;
}

export default function ServiceListingCard({ listing, onBookTrigger, onTap, loading }: ServiceListingCardProps) {
  if (loading) {
    return (
      <div className="flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm overflow-hidden">
        <Skeleton className="h-40 sm:h-52 w-full rounded-none" />
        <div className="p-4 space-y-2.5">
          <Skeleton className="h-4 w-16 rounded-md" />
          <Skeleton className="h-5 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-9 w-full rounded-xl mt-2" />
        </div>
      </div>
    );
  }

  const meta = listing.metaData || (listing as any).metaData || {};
  const badge = tierBadge(listing.listingTier);
  const credentials: string[] = meta.taxonomy?.credentials || meta.taxonomy?.qualifications || [];
  const expertise: string[] = meta.taxonomy?.expertise || meta.taxonomy?.speciality || [];
  const hasBooking = listing.listingTier === 'BOOKABLE';

  const coverImage =
    listing.media?.find(m => m.type === 'profile_image' || m.type === 'gallery')?.secureUrl ||
    (listing as any).media?.[0]?.secureUrl ||
    'https://images.unsplash.com/photo-1521791136368-1a46827d0515?auto=format&fit=crop&w=500&h=300';

  const handleTap = (e: React.MouseEvent) => {
    if (onTap) {
      e.preventDefault();
      onTap();
    }
  };

  return (
    <div
      onClick={handleTap}
      className={`group relative flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-lg hover:-translate-y-0.5 hover:border-emerald-200 transition-all duration-300 overflow-hidden active:scale-[0.98] ${onTap ? 'cursor-pointer' : ''}`}
    >
      {/* Cover image */}
      <div className="relative h-40 sm:h-52 w-full overflow-hidden bg-zinc-100 shrink-0">
        <img
          src={coverImage}
          alt={listing.businessName}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />

        {/* Verification badge */}
        <div className="absolute top-3 right-3">
          {listing.isClaimed ? (
            <span className="bg-emerald-600 text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
              <BadgeCheck className="w-3.5 h-3.5" />
              Verified
            </span>
          ) : (
            <span className="bg-black/60 backdrop-blur-sm text-white text-[10px] font-bold uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-400" />
              Unclaimed
            </span>
          )}
        </div>

        {/* Rating */}
        {listing.rating > 0 && (
          <div className="absolute bottom-3 right-3 bg-white text-zinc-900 font-black text-sm px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            {listing.rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="flex-1 p-4 flex flex-col gap-2.5">
        <span className={`inline-block rounded-md px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide ${badge.cls}`}>
          {badge.label}
        </span>

        <h3 className="text-base sm:text-lg font-extrabold text-zinc-900 leading-snug group-hover:text-emerald-700 transition-colors line-clamp-1">
          {listing.businessName}
        </h3>

        {credentials.length > 0 && (
          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-600">
            <Award className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span className="truncate">{credentials[0]}</span>
          </div>
        )}

        {expertise.length > 0 && (
          <div className="flex gap-1.5 flex-wrap">
            {expertise.slice(0, 2).map((exp: string, idx: number) => (
              <span key={idx} className="bg-zinc-100 border border-zinc-200 px-2 py-0.5 rounded-lg text-[11px] font-bold text-zinc-600">
                {exp}
              </span>
            ))}
          </div>
        )}

        <p className="flex items-center gap-1 text-xs font-medium text-zinc-400">
          <MapPin className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate">{listing.localityName}</span>
        </p>

        {/* CTA */}
        <div className="flex items-center gap-2 mt-auto pt-1">
          {onTap ? (
            <button
              onClick={handleTap}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm active:scale-[0.98] transition-all"
            >
              {hasBooking ? 'Book Now' : 'View Profile'}
              <ArrowRight className="w-4 h-4" />
            </button>
          ) : (
            <>
              {hasBooking && onBookTrigger && (
                <button
                  onClick={e => { e.stopPropagation(); onBookTrigger(listing); }}
                  className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm active:scale-[0.98] transition-all"
                >
                  <CalendarDays className="w-4 h-4" />
                  Book Now
                </button>
              )}
              <Link
                href={`/${listing.slug}`}
                onClick={e => e.stopPropagation()}
                className={`inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl text-sm font-bold text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 transition-all active:scale-[0.98] ${hasBooking && onBookTrigger ? 'w-auto' : 'flex-1'}`}
              >
                {hasBooking ? 'View' : 'Contact'}
                <ArrowRight className="w-4 h-4" />
              </Link>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
