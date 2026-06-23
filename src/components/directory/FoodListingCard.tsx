'use client';

import Link from 'next/link';
import { Star, MapPin, Clock, BadgePercent, ArrowRight } from 'lucide-react';
import { Listing } from '@/lib/directory';

export default function FoodListingCard({ listing }: { listing: Listing }) {
  const meta = listing.metaData || (listing as any).metaData || {};
  const cuisines = meta.cuisines || meta.osm?.subcategory?.split(';') || ['Multi-Cuisine', 'Fast Food'];
  const avgPrice = meta.avgPrice || 250;
  const deliveryTime = meta.deliveryTime || '30-40 mins';
  const isVegOnly = meta.isVegOnly || false;
  
  const coverImage = listing.media?.find(m => m.type === 'profile_image' || m.type === 'gallery')?.secureUrl 
    || (listing as any).media?.[0]?.secureUrl 
    || 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=500&h=300';

  return (
    <div className="group relative flex flex-col rounded-3xl border border-zinc-200 bg-white shadow-xs hover:shadow-xl hover:border-rose-500/30 hover:ring-8 hover:ring-rose-500/5 transition-all duration-300 overflow-hidden">
      
      {/* Visual Header / Cover */}
      <div className="relative h-44 w-full overflow-hidden bg-zinc-100 border-b border-zinc-100">
        <img
          src={coverImage}
          alt={listing.businessName}
          className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          loading="lazy"
        />
        
        {/* Badges */}
        <div className="absolute top-3.5 left-3.5 flex flex-wrap gap-1.5">
          {isVegOnly && (
            <span className="bg-emerald-600/90 backdrop-blur-md text-white text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
              Pure Veg
            </span>
          )}
          {meta.offers?.length > 0 && (
            <span className="bg-rose-600/95 backdrop-blur-md text-white text-[9px] font-black tracking-wider uppercase px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-sm border border-rose-500/20">
              <BadgePercent className="w-3.5 h-3.5 text-white" />
              Offers Active
            </span>
          )}
        </div>

        {/* Floating rating badge */}
        {listing.rating > 0 && (
          <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-xs text-zinc-900 font-extrabold text-xs px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md border border-zinc-100">
            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
            {listing.rating.toFixed(1)}
          </div>
        )}
      </div>

      {/* Info Section */}
      <div className="flex-1 p-5 flex flex-col justify-between">
        <div className="space-y-2">
          {/* Cuisines */}
          <p className="text-[10px] font-bold text-rose-600 uppercase tracking-widest truncate">
            {cuisines.slice(0, 3).join(' · ')}
          </p>

          <h3 className="text-base font-black text-zinc-900 leading-tight group-hover:text-rose-600 transition-colors">
            {listing.businessName}
          </h3>

          {/* Quick Metrics */}
          <div className="flex items-center gap-4 text-xs font-semibold text-zinc-500">
            <span className="flex items-center gap-1">
              <Clock className="w-3.5 h-3.5 text-zinc-400" />
              {deliveryTime}
            </span>
            <span className="w-1 h-1 bg-zinc-300 rounded-full" />
            <span>₹{avgPrice} for two</span>
          </div>

          {/* Locality */}
          <p className="flex items-center gap-1 text-[11px] font-medium text-zinc-400">
            <MapPin className="w-3.5 h-3.5 shrink-0" />
            <span className="truncate">{listing.localityName}</span>
          </p>
        </div>

        {/* CTA Footer */}
        <div className="mt-5 pt-4 border-t border-zinc-100 flex items-center justify-between">
          <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider">
            COMMERCE PARTNER
          </span>
          <Link
            href={`/${listing.slug}`}
            className="inline-flex items-center gap-1.5 px-4.5 py-2 rounded-xl text-xs font-extrabold text-white bg-rose-600 hover:bg-rose-700 shadow-md shadow-rose-600/10 active:scale-95 transition-all"
          >
            Order Menu
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
}
