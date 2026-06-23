'use client';

import Link from 'next/link';
import { Star, MapPin, ShoppingBag, ArrowRight } from 'lucide-react';
import { Listing } from '@/lib/directory';

export default function RetailStoreCard({ listing }: { listing: Listing }) {
  const meta = listing.metaData || (listing as any).metaData || {};
  const sub = meta.osm?.subcategory || listing.businessType.replace(/_/g, ' ');
  const rating = listing.rating || 0;
  
  const coverImage = listing.media?.find(m => m.type === 'profile_image' || m.type === 'gallery')?.secureUrl 
    || (listing as any).media?.[0]?.secureUrl 
    || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=500&h=300';

  return (
    <div className="group relative flex flex-col rounded-3xl border border-zinc-200 bg-white shadow-xs hover:shadow-xl hover:border-cyan-500/30 hover:ring-8 hover:ring-cyan-500/5 transition-all duration-300 overflow-hidden">
      
      {/* Visual Header / Cover */}
      <div className="relative h-44 w-full overflow-hidden bg-zinc-100 border-b border-zinc-100">
        <img
          src={coverImage}
          alt={listing.businessName}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Rating Floating */}
        {rating > 0 && (
          <div className="absolute bottom-3 right-3 bg-zinc-900/90 backdrop-blur-md text-white font-extrabold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
            <Star className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400" />
            {rating.toFixed(1)}
          </div>
        )}

        <span className="absolute top-3.5 left-3.5 bg-cyan-600/90 backdrop-blur-md text-white text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-cyan-500/20">
          <ShoppingBag className="w-3 h-3" />
          Retail Shop
        </span>
      </div>

      {/* Info Section */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Subcategory */}
          <p className="text-[10px] font-bold text-cyan-600 uppercase tracking-widest truncate">
            {sub.replace(/-/g, ' ')}
          </p>

          <h3 className="text-base font-black text-zinc-900 leading-tight group-hover:text-cyan-600 transition-colors">
            {listing.businessName}
          </h3>

          {/* Locality */}
          <p className="flex items-center gap-1 text-xs font-semibold text-zinc-500">
            <MapPin className="w-3.5 h-3.5 shrink-0 text-zinc-400" />
            <span className="truncate">{listing.localityName}</span>
          </p>
        </div>

        {/* CTA Footer */}
        <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            {listing.listingTier === 'COMMERCE' ? 'Instant Buy' : 'Store Catalog'}
          </span>
          <Link
            href={`/${listing.slug}`}
            className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-extrabold text-white bg-zinc-900 hover:bg-zinc-800 shadow-md active:scale-95 transition-all"
          >
            Visit Shop
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
