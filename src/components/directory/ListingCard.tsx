import { MapPin, Star, Phone } from 'lucide-react';
import { Listing, listingCtas, tierBadge, getCategoryByVertical } from '@/lib/directory';

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

  return (
    <div className="group flex flex-col rounded-2xl border border-zinc-200 bg-white shadow-sm hover:shadow-md hover:border-emerald-200 transition-all overflow-hidden">
      <div className="flex gap-3 p-4">
        {/* Monogram avatar */}
        <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-50 to-emerald-100 text-emerald-700 text-xl font-black ring-1 ring-emerald-100">
          {cat?.icon || initial}
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <h3 className="truncate font-extrabold text-zinc-900 leading-tight">{listing.businessName}</h3>
            {listing.rating > 0 && (
              <span className="flex shrink-0 items-center gap-0.5 rounded-md bg-amber-50 px-1.5 py-0.5 text-xs font-bold text-amber-700">
                <Star className="h-3.5 w-3.5 fill-amber-500 text-amber-500" />
                {listing.rating.toFixed(1)}
              </span>
            )}
          </div>

          <div className="mt-1 flex flex-wrap items-center gap-1.5">
            <span className={`rounded border px-1.5 py-0.5 text-[10px] font-bold ${badge.cls}`}>{badge.label}</span>
            {sub && <span className="rounded border border-zinc-200 bg-zinc-50 px-1.5 py-0.5 text-[10px] font-semibold capitalize text-zinc-600">{sub.replace(/-/g, ' ')}</span>}
          </div>

          <p className="mt-1.5 flex items-start gap-1 text-xs font-semibold text-zinc-500">
            <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-zinc-400" />
            <span className="line-clamp-1">
              {listing.localityName}
              {listing.city?.district ? `, ${listing.city.district}` : ''}
            </span>
          </p>
        </div>
      </div>

      {/* Tier-aware CTAs */}
      <div className="mt-auto flex gap-2 border-t border-zinc-100 p-3">
        {ctas.length === 0 ? (
          <span className="flex-1 text-center text-xs font-semibold text-zinc-400 py-2">Details coming soon</span>
        ) : (
          ctas.slice(0, 3).map((c) => (
            <a
              key={c.label}
              href={c.href}
              target={c.href.startsWith('http') ? '_blank' : undefined}
              rel={c.href.startsWith('http') ? 'noopener noreferrer' : undefined}
              className={
                c.kind === 'primary'
                  ? 'flex flex-1 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-3 py-2 text-sm font-bold text-white shadow-sm shadow-emerald-600/20 hover:bg-emerald-700 transition-colors'
                  : 'flex flex-1 items-center justify-center gap-1.5 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm font-bold text-zinc-700 hover:bg-zinc-100 transition-colors'
              }
            >
              {c.label === 'Call' && <Phone className="h-3.5 w-3.5" />}
              {c.label}
            </a>
          ))
        )}
      </div>
    </div>
  );
}
