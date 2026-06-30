'use client';

import { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Skeleton } from '@/components/ui/Skeleton';
import { Listing } from '@/lib/directory';
import SearchCardSelector from '@/components/directory/SearchCardSelector';
import type { CollectionDef, VerticalExperienceConfig } from '@/config/verticalExperience';

interface CollectionRowProps {
  config: VerticalExperienceConfig;
  collection: CollectionDef;
  language: 'en' | 'hi';
  items: Listing[];
  loading: boolean;
  onSeeAll: (collection: CollectionDef) => void;
  onBook: (listing: Listing) => void;
  onCardTap?: (listing: Listing) => void;
}

export default function CollectionRow({
  config,
  collection,
  language,
  items,
  loading,
  onSeeAll,
  onBook,
  onCardTap,
}: CollectionRowProps) {
  const scroller = useRef<HTMLDivElement | null>(null);

  const scroll = (dir: 'l' | 'r') => {
    if (!scroller.current) return;
    scroller.current.scrollBy({ left: dir === 'l' ? -600 : 600, behavior: 'smooth' });
  };

  if (!loading && items.length === 0) return null;

  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between gap-3">
        <div className="min-w-0">
          <h2 className="flex items-center gap-2 text-lg sm:text-2xl font-black text-zinc-900 tracking-tight">
            {collection.emoji && <span>{collection.emoji}</span>}
            <span className="truncate">{collection.title[language]}</span>
          </h2>
          {collection.subtitle && (
            <p className="text-xs sm:text-sm text-zinc-500 font-medium mt-0.5 truncate">
              {collection.subtitle[language]}
            </p>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {!loading && items.length > 2 && (
            <>
              <button
                onClick={() => scroll('l')}
                className="hidden sm:flex w-9 h-9 rounded-full border border-zinc-200 bg-white items-center justify-center text-zinc-600 hover:bg-zinc-50 active:scale-[0.98] transition"
                aria-label="Scroll left"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => scroll('r')}
                className="hidden sm:flex w-9 h-9 rounded-full border border-zinc-200 bg-white items-center justify-center text-zinc-600 hover:bg-zinc-50 active:scale-[0.98] transition"
                aria-label="Scroll right"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </>
          )}
          <button
            onClick={() => onSeeAll(collection)}
            className="text-xs font-extrabold px-3 h-8 sm:h-9 rounded-full border border-zinc-200 bg-white hover:bg-zinc-50 active:scale-[0.98] transition"
            style={{ color: config.theme.primary }}
          >
            {language === 'hi' ? 'सभी देखें' : 'See all'}
          </button>
        </div>
      </div>

      <div
        ref={scroller}
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-2 hide-scrollbar snap-x snap-mandatory"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {loading
          ? [...Array(3)].map((_, i) => (
              <div key={i} className="min-w-[280px] sm:min-w-[320px] shrink-0 snap-start">
                <div className="rounded-2xl overflow-hidden border border-zinc-200">
                  <Skeleton className="h-40 sm:h-52 w-full rounded-none" />
                  <div className="p-4 space-y-2.5">
                    <Skeleton className="h-3 w-20" />
                    <Skeleton className="h-5 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              </div>
            ))
          : items.map((listing, i) => (
              <div
                key={`${listing.id}-${i}`}
                className="min-w-[280px] sm:min-w-[320px] shrink-0 snap-start"
              >
                <SearchCardSelector
                  listing={listing}
                  mode={config.cardMode}
                  onBookTrigger={onBook}
                  onTap={onCardTap}
                />
              </div>
            ))}
      </div>
    </section>
  );
}
