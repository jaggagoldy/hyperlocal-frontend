import Link from 'next/link';
import { MapPin, Star, BadgeCheck, ShieldAlert } from 'lucide-react';
import { Listing, listingCtas, tierBadge, getCategoryByVertical } from '@/lib/directory';
import ListingCtas from './ListingCtas';

/**
 * Tier-aware directory listing card (server component — plain anchors, no hooks).
 * DIRECTORY stubs surface Call / WhatsApp / Directions inline; BOOKABLE / COMMERCE
 * link to the storefront with Book / Order. Premium, mobile-first emerald styling.
 */
export default function ListingCard({ listing }: { listing: Listing }) {
  const ctas = listingCtas(listing);
  const badge = tierBadge(listing.listingTier);
  const cat = getCategoryByVertical(listing.businessType);
  const sub = listing.metaData?.osm?.subcategory;
  const initial = listing.businessName?.charAt(0)?.toUpperCase() || '?';

  // Extract cover image if available
  const coverImage = listing.media?.find(m => m.type === 'profile_image' || m.type === 'gallery')?.secureUrl || listing.media?.[0]?.secureUrl;

  return (
    <div className="group flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-md hover:border-emerald-500/50 hover:ring-4 hover:ring-emerald-500/5 hover:-translate-y-0.5 transition-all duration-300 overflow-hidden">
      {coverImage && (
        <div className="relative h-36 w-full overflow-hidden bg-zinc-50 border-b border-zinc-100">
          <img
            src={coverImage}
            alt={listing.businessName}
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-102"
            loading="lazy"
          />
          {!listing.isClaimed && (
            <span className="absolute top-3 right-3 bg-black/60 backdrop-blur-md text-white text-[9px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
              <ShieldAlert className="w-2.5 h-2.5 text-amber-400" />
              Unclaimed
            </span>
          )}
        </div>
      )}

      <div className="flex gap-3 p-4">
        {/* Monogram avatar */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 text-xl font-black ring-1 ring-emerald-100">
          {cat?.icon || initial}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-extrabold text-zinc-900 leading-tight group-hover:text-emerald-700 transition-colors">{listing.businessName}</h3>
            {listing.rating > 0 && (
              <span className="flex shrink-0 items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-bold text-amber-700">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                {listing.rating.toFixed(1)}
              </span>
            )}
          </div>

          <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
            <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${badge.cls}`}>{badge.label}</span>
            
            {listing.isClaimed ? (
              <span className="inline-flex items-center gap-0.5 rounded border border-emerald-200 bg-emerald-50 px-1.5 py-0.5 text-[10px] font-extrabold text-emerald-700">
                <BadgeCheck className="h-3 w-3 text-emerald-600 fill-emerald-100" />
                Verified
              </span>
            ) : !coverImage ? (
              <span className="inline-flex items-center gap-0.5 rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-bold text-zinc-500">
                Unclaimed
              </span>
            ) : null}

            {sub && <span className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-semibold capitalize text-zinc-600">{sub.replace(/-/g, ' ')}</span>}
          </div>

          <p className="mt-2 flex items-start gap-1 text-xs font-semibold text-zinc-500">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <span className="line-clamp-1">
              {listing.localityName}
              {listing.city?.district ? `, ${listing.city.district}` : ''}
            </span>
          </p>
        </div>
      </div>

      {/* Tier-aware CTAs (client component — logs call/whatsapp/directions clicks) */}
      <div className="mt-auto flex gap-2 border-t border-zinc-100 p-3 bg-zinc-50/30">
        <ListingCtas ctas={ctas} businessProfileId={listing.id} />
      </div>

      {/* Claim affordance — unclaimed imported stubs only */}
      {!listing.isClaimed && (
        <Link
          href={`/claim/${listing.id}?name=${encodeURIComponent(listing.businessName)}`}
          className="flex items-center justify-center gap-1.5 border-t border-zinc-100 bg-zinc-50/60 py-2 text-xs font-bold text-emerald-700 hover:bg-emerald-50 hover:text-emerald-800 transition-colors"
        >
          <BadgeCheck className="h-3.5 w-3.5" /> Is this your business? Claim it
        </Link>
      )}
    </div>
  );
}
