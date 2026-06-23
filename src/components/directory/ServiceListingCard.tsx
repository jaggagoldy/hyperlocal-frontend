'use client';

import Link from 'next/link';
import { Star, MapPin, BadgeCheck, ShieldAlert, Award, CalendarDays, ArrowRight } from 'lucide-react';
import { Listing, tierBadge } from '@/lib/directory';

interface ServiceListingCardProps {
  listing: Listing;
  onBookTrigger?: (listing: Listing) => void;
}

export default function ServiceListingCard({ listing, onBookTrigger }: ServiceListingCardProps) {
  const meta = listing.metaData || (listing as any).metaData || {};
  const badge = tierBadge(listing.listingTier);
  
  // Extract credentials & expertise
  const credentials = meta.taxonomy?.credentials || meta.taxonomy?.qualifications || [];
  const expertise = meta.taxonomy?.expertise || meta.taxonomy?.speciality || [];
  
  const coverImage = listing.media?.find(m => m.type === 'profile_image' || m.type === 'gallery')?.secureUrl 
    || (listing as any).media?.[0]?.secureUrl 
    || 'https://images.unsplash.com/photo-1521791136368-1a46827d0515?auto=format&fit=crop&w=500&h=300';

  const hasBooking = listing.listingTier === 'BOOKABLE';

  return (
    <div className="group relative flex flex-col rounded-3xl border border-zinc-200 bg-white shadow-xs hover:shadow-xl hover:border-emerald-500/30 hover:ring-8 hover:ring-emerald-500/5 transition-all duration-300 overflow-hidden">
      
      {/* Visual Cover */}
      <div className="relative h-40 w-full overflow-hidden bg-zinc-100 border-b border-zinc-100">
        <img
          src={coverImage}
          alt={listing.businessName}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Verification badges */}
        <div className="absolute top-3 right-3 flex gap-1.5">
          {listing.isClaimed ? (
            <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded flex items-center gap-0.5 border border-emerald-500/20">
              <BadgeCheck className="w-3 h-3 text-white" />
              Verified
            </span>
          ) : (
            <span className="bg-black/60 backdrop-blur-md text-white text-[9px] font-black tracking-wider uppercase px-2 py-0.5 rounded flex items-center gap-0.5">
              <ShieldAlert className="w-3 h-3 text-amber-400" />
              Unclaimed
            </span>
          )}
        </div>

        {/* Rating Floating */}
        {listing.rating > 0 && (
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs text-zinc-900 font-extrabold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md border border-zinc-100">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            {listing.rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div className="space-y-3.5">
          
          {/* Header Info */}
          <div className="space-y-1">
            <span className={`inline-block rounded px-1.5 py-0.5 text-[9px] font-black uppercase tracking-wider ${badge.cls}`}>
              {badge.label}
            </span>
            <h3 className="text-base font-black text-zinc-900 leading-tight group-hover:text-emerald-700 transition-colors">
              {listing.businessName}
            </h3>
          </div>

          {/* Credentials / Exp */}
          {credentials.length > 0 && (
            <div className="flex items-center gap-1.5 text-xs font-bold text-zinc-650">
              <Award className="w-4 h-4 text-emerald-600" />
              <span className="truncate">{credentials[0]}</span>
            </div>
          )}

          {/* Expertise horizontal tags list */}
          {expertise.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {expertise.slice(0, 2).map((exp: string, idx: number) => (
                <span key={idx} className="bg-zinc-100 border border-zinc-200/60 px-2.5 py-0.5 rounded-lg text-[10px] font-extrabold text-zinc-600 uppercase tracking-wide">
                  {exp}
                </span>
              ))}
            </div>
          )}

          {/* Locality */}
          <p className="flex items-center gap-1 text-[11px] font-semibold text-zinc-500 pt-1">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
            <span className="truncate">{listing.localityName}</span>
          </p>
        </div>

        {/* CTA Footer */}
        <div className="mt-6 pt-4 border-t border-zinc-100 flex items-center gap-2">
          {hasBooking && onBookTrigger ? (
            <button
              onClick={() => onBookTrigger(listing)}
              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4.5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/10 active:scale-[0.98] transition-all"
            >
              <CalendarDays className="w-4 h-4" />
              Quick Book
            </button>
          ) : null}

          <Link
            href={`/${listing.slug}`}
            className={`px-4.5 py-2.5 rounded-xl text-xs font-extrabold text-zinc-700 hover:text-zinc-900 bg-zinc-100 hover:bg-zinc-200 transition-all flex items-center justify-center gap-1 ${
              hasBooking ? 'w-auto' : 'flex-1'
            }`}
          >
            {hasBooking ? 'View' : 'Contact Vendor'}
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
