'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  Search,
  MapPin,
  X,
  ChevronLeft,
  Check,
  Megaphone,
  Bell,
  CheckCircle,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { Listing } from '@/lib/directory';
import { useSearchStore } from '@/store/searchStore';
import { useDebounce } from '@/hooks/useDebounce';
import { useTranslation } from '@/lib/translations';
import { Skeleton } from '@/components/ui/Skeleton';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import SearchCardSelector from '@/components/directory/SearchCardSelector';
import QuickBookingDrawer from '@/components/directory/QuickBookingDrawer';
import VerticalHero from './VerticalHero';
import QuickFilterChips from './QuickFilterChips';
import CollectionRow from './CollectionRow';
import DealsStrip from './DealsStrip';
import FilterSheet, { type FilterState } from './FilterSheet';
import type { CollectionDef, VerticalExperienceConfig } from '@/config/verticalExperience';

interface VerticalExperienceProps {
  config: VerticalExperienceConfig;
  districtSlug?: string;
}

export default function VerticalExperience({ config, districtSlug }: VerticalExperienceProps) {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { selectedCity, setCity, setSearchQuery, minRating, openNow, setFilters } = useSearchStore();

  const pinnedDistrict = useRef(false);
  useEffect(() => {
    if (districtSlug && !pinnedDistrict.current) {
      pinnedDistrict.current = true;
      if (districtSlug !== selectedCity) setCity(districtSlug);
    }
  }, [districtSlug, selectedCity, setCity]);

  const [localQuery, setLocalQuery] = useState('');
  const debouncedQuery = useDebounce(localQuery, 450);
  const [activeQuickFilter, setActiveQuickFilter] = useState<string | null>(null);
  const [verifiedOnly, setVerifiedOnly] = useState(false);
  // Explicit "browse everything" flag for the "See all" affordance (a trimmed
  // query can't trigger browse mode on its own).
  const [forceBrowse, setForceBrowse] = useState(false);

  const browseMode = Boolean(debouncedQuery.trim() || activeQuickFilter || forceBrowse);

  // Browse results
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);

  // Location picker
  const [cities, setCities] = useState<any[]>([]);
  const [isLocationOpen, setIsLocationOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  // Booking drawer
  const [bookVendor, setBookVendor] = useState<Listing | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);

  // Filter bottom-sheet state (sheet component added in Phase 4)
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);


  // Coming-soon notify
  const [notifyInput, setNotifyInput] = useState('');
  const [hasSubscribed, setHasSubscribed] = useState(false);

  // Single page-level discover fetch — all rows derive from this.
  const [discoverItems, setDiscoverItems] = useState<Listing[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(true);

  useEffect(() => {
    setSearchQuery(debouncedQuery);
  }, [debouncedQuery, setSearchQuery]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, activeQuickFilter, selectedCity, minRating, openNow, verifiedOnly]);

  useEffect(() => {
    apiClient
      .get('/search/cities')
      .then((res) => {
        const fetched = res.data?.data || [];
        setCities(fetched);
        if (fetched.length > 0 && !fetched.some((c: any) => c.slug === selectedCity)) {
          setCity(fetched[0].slug);
        }
      })
      .catch((err) => console.error('Failed to fetch cities', err));
  }, [selectedCity, setCity]);

  useEffect(() => {
    let active = true;
    setDiscoverLoading(true);
    apiClient
      .get(`/search/explore/${selectedCity || 'any'}/any`, {
        params: { businessType: config.vertical, limit: 50 },
      })
      .then((res) => {
        if (active) setDiscoverItems(res.data?.data || []);
      })
      .catch(() => active && setDiscoverItems([]))
      .finally(() => active && setDiscoverLoading(false));
    return () => { active = false; };
  }, [selectedCity, config.vertical]);

  const deriveCollection = useCallback(
    (collection: CollectionDef): Listing[] => {
      let list = discoverItems;
      const minR = collection.params?.minRating;
      if (minR != null) list = list.filter((l) => (l.rating || 0) >= Number(minR));
      if (collection.params?.openNow) list = list.filter((l) => Boolean((l as any).isOnline));
      if (collection.filter) list = list.filter(collection.filter);
      return list.slice(0, 10);
    },
    [discoverItems]
  );

  const districtEmpty = !discoverLoading && discoverItems.length === 0;

  const fetchResults = useCallback(async () => {
    setLoading(true);
    try {
      const res = await apiClient.get(`/search/explore/${selectedCity || 'any'}/any`, {
        params: {
          businessType: config.vertical,
          query: debouncedQuery.trim(),
          limit: 24,
          page,
          minRating,
          openNow,
          verifiedOnly,
        },
      });
      let data: Listing[] = res.data?.data || [];
      setHasMore(data.length === 24);
      const chip = config.quickFilters.find((q) => q.id === activeQuickFilter);
      if (chip) data = data.filter(chip.match);
      setItems((prev) => (page === 1 ? data : [...prev, ...data]));
    } catch (err) {
      console.error('Failed to fetch results', err);
      if (page === 1) setItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCity, config.vertical, config.quickFilters, debouncedQuery, page, minRating, openNow, verifiedOnly, activeQuickFilter]);

  useEffect(() => {
    if (browseMode) fetchResults();
  }, [browseMode, fetchResults]);

  const cityName = (() => {
    const c = cities.find((x) => x.slug === selectedCity);
    return c ? c.name : selectedCity.charAt(0).toUpperCase() + selectedCity.slice(1);
  })();

  const filteredCities = cities.filter((c) =>
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  const onBook = (listing: Listing) => {
    if (config.actionKind === 'directory') return;
    setBookVendor(listing);
    setIsBookingOpen(true);
  };

  const handleSeeAll = (collection: CollectionDef) => {
    if (collection.params?.minRating) setFilters({ minRating: String(collection.params.minRating) });
    if (collection.params?.openNow) setFilters({ openNow: true });
    setActiveQuickFilter(collection.id === 'pure-veg' ? 'veg' : null);
    setForceBrowse(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearBrowse = () => {
    setLocalQuery('');
    setActiveQuickFilter(null);
    setVerifiedOnly(false);
    setForceBrowse(false);
    setFilters({ minRating: '', openNow: false });
  };

  const handleNotify = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyInput.trim()) return;
    setHasSubscribed(true);
    setNotifyInput('');
  };

  const handleCardTap = (listing: Listing) => {
    router.push(`/${listing.slug}`);
  };

  return (
    <div
      className="min-h-screen bg-white pb-24 font-sans"
      style={{ '--primary': config.theme.primary } as React.CSSProperties}
    >
      {/* Sticky browse header */}
      {browseMode && (
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-zinc-200 px-4 py-2.5">
          <div className="max-w-screen-2xl mx-auto flex items-center gap-3">
            <button
              onClick={clearBrowse}
              className="shrink-0 w-9 h-9 sm:w-10 sm:h-10 rounded-full border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 active:scale-[0.98] transition"
              aria-label="Back to discover"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <div className="flex-1 flex items-center bg-white border border-zinc-300 rounded-full h-10 sm:h-11 overflow-hidden focus-within:ring-2 focus-within:ring-[var(--primary)]/20">
              <button
                onClick={() => setIsLocationOpen(true)}
                className="flex items-center gap-1.5 px-3 sm:px-4 h-full bg-zinc-50 hover:bg-zinc-100 border-r border-zinc-200 shrink-0"
              >
                <MapPin className="w-3.5 h-3.5 sm:w-4 sm:h-4" style={{ color: config.theme.primary }} />
                <span className="text-xs sm:text-sm font-semibold text-zinc-800 truncate max-w-[70px] sm:max-w-[100px]">{cityName}</span>
              </button>
              <Search className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-zinc-400 ml-3 shrink-0" />
              <input
                value={localQuery.trim() === '' ? '' : localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
                placeholder={config.hero.searchPlaceholder[language]}
                className="flex-1 h-full px-2 sm:px-3 text-sm outline-none bg-transparent text-zinc-800 placeholder-zinc-400"
              />
            </div>
          </div>
        </header>
      )}

      <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 sm:py-8 space-y-8 sm:space-y-10">

        {/* ─── DISCOVER MODE ─── */}
        {!browseMode && (
          <>
            {discoverLoading ? (
              /* Skeleton layout for discover mode */
              <div className="space-y-8 animate-in fade-in duration-300">
                <Skeleton className="h-44 sm:h-64 w-full rounded-none sm:rounded-3xl -mx-4 sm:mx-0" />
                <div className="flex gap-2.5 overflow-hidden">
                  {[...Array(5)].map((_, i) => (
                    <Skeleton key={i} className="h-10 sm:h-12 w-24 shrink-0 rounded-full" />
                  ))}
                </div>
                {[0, 1].map((r) => (
                  <div key={r} className="space-y-3">
                    <Skeleton className="h-6 w-36" />
                    <div className="flex gap-4 overflow-hidden">
                      {[...Array(3)].map((_, i) => (
                        <div key={i} className="min-w-[280px] sm:min-w-[320px] shrink-0 rounded-2xl overflow-hidden border border-zinc-200">
                          <Skeleton className="h-40 sm:h-52 rounded-none" />
                          <div className="p-4 space-y-2">
                            <Skeleton className="h-3 w-20" />
                            <Skeleton className="h-5 w-3/4" />
                            <Skeleton className="h-3 w-1/2" />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : districtEmpty ? (
              <ComingSoon
                cityName={cityName}
                language={language}
                t={t}
                notifyInput={notifyInput}
                setNotifyInput={setNotifyInput}
                hasSubscribed={hasSubscribed}
                onNotify={handleNotify}
              />
            ) : (
              <div className="space-y-8 animate-in fade-in duration-300">
                <VerticalHero
                  config={config}
                  language={language}
                  cityName={cityName}
                  query={localQuery}
                  onQueryChange={setLocalQuery}
                  onOpenLocation={() => setIsLocationOpen(true)}
                />
                <QuickFilterChips
                  config={config}
                  language={language}
                  active={activeQuickFilter}
                  onToggle={setActiveQuickFilter}
                  onOpenFilters={() => setIsFilterSheetOpen(true)}
                />
                <DealsStrip config={config} items={discoverItems} language={language} />
                <div className="space-y-10">
                  {config.collections.map((collection) => (
                    <CollectionRow
                      key={collection.id}
                      config={config}
                      collection={collection}
                      language={language}
                      items={deriveCollection(collection)}
                      loading={false}
                      onSeeAll={handleSeeAll}
                      onBook={onBook}
                      onCardTap={handleCardTap}
                    />
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {/* ─── BROWSE MODE ─── */}
        {browseMode && (
          <div className="space-y-4">
            <QuickFilterChips
              config={config}
              language={language}
              active={activeQuickFilter}
              onToggle={setActiveQuickFilter}
              onOpenFilters={() => setIsFilterSheetOpen(true)}
            />

            <div className="flex overflow-x-auto hide-scrollbar gap-2 pb-1">
              <FilterChip active={verifiedOnly} onClick={() => setVerifiedOnly((v) => !v)}>
                {language === 'hi' ? 'सत्यापित' : 'Verified Only'}
              </FilterChip>
              <FilterChip active={openNow} onClick={() => setFilters({ openNow: !openNow })}>
                {language === 'hi' ? 'अभी खुले' : 'Open Now'}
              </FilterChip>
              <FilterChip
                active={minRating === '4.0'}
                onClick={() => setFilters({ minRating: minRating === '4.0' ? '' : '4.0' })}
              >
                {language === 'hi' ? 'टॉप रेटेड' : 'Top Rated'}
              </FilterChip>
            </div>

            {loading && page === 1 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="rounded-2xl overflow-hidden border border-zinc-200">
                    <Skeleton className="h-40 sm:h-52 rounded-none" />
                    <div className="p-4 space-y-2.5">
                      <Skeleton className="h-3 w-20" />
                      <Skeleton className="h-5 w-3/4" />
                      <Skeleton className="h-3 w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-16 text-center max-w-md mx-auto space-y-3">
                <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center border border-zinc-200">
                  <Search className="w-6 h-6 text-zinc-400" />
                </div>
                <h3 className="text-lg font-bold text-zinc-800">
                  {language === 'hi' ? 'कोई परिणाम नहीं मिला' : 'No results found'}
                </h3>
                <p className="text-zinc-500 text-sm">
                  {language === 'hi' ? 'फ़िल्टर बदलें या कुछ और खोजें।' : 'Try a different search or clear the filters.'}
                </p>
                <Button variant="outline" onClick={clearBrowse} className="rounded-xl font-bold text-xs">
                  {language === 'hi' ? 'फ़िल्टर साफ़ करें' : 'Clear filters'}
                </Button>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-5">
                  {items.map((listing, i) => (
                    <SearchCardSelector
                      key={`${listing.id}-${i}`}
                      listing={listing}
                      mode={config.cardMode}
                      onBookTrigger={onBook}
                      onTap={handleCardTap}
                    />
                  ))}
                </div>
                {hasMore && (
                  <div className="flex justify-center pt-2">
                    <Button
                      variant="outline"
                      onClick={() => setPage((p) => p + 1)}
                      disabled={loading}
                      className="rounded-xl font-bold"
                    >
                      {loading ? '…' : language === 'hi' ? 'और दिखाएं' : 'Load more'}
                    </Button>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {/* ─── LOCATION MODAL ─── */}
      {isLocationOpen && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-0 sm:p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-t-2xl sm:rounded-2xl border border-zinc-200 w-full sm:max-w-sm shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
            <div className="px-5 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <h3 className="font-extrabold text-sm text-zinc-900 uppercase tracking-wider">
                {language === 'hi' ? 'स्थान चुनें' : 'Select Location'}
              </h3>
              <button
                onClick={() => { setIsLocationOpen(false); setCitySearch(''); }}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-600 hover:bg-zinc-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4 border-b border-zinc-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder={language === 'hi' ? 'शहर खोजें…' : 'Search city…'}
                  className="h-10 pl-9 rounded-xl bg-zinc-50 border-zinc-200 text-xs"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                />
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-3 space-y-1">
              {filteredCities.length === 0 ? (
                <p className="text-zinc-400 text-xs text-center py-6 font-semibold">
                  {language === 'hi' ? 'कोई शहर नहीं मिला' : 'No matching cities'}
                </p>
              ) : (
                filteredCities.map((city: any) => {
                  const isSelected = selectedCity === city.slug;
                  return (
                    <button
                      key={city.slug}
                      onClick={() => { setCity(city.slug); setIsLocationOpen(false); setCitySearch(''); }}
                      className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                        isSelected
                          ? 'bg-[var(--primary)]/5 text-[var(--primary)] border border-[var(--primary)]/10'
                          : 'hover:bg-zinc-50 text-zinc-700 border border-transparent'
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <MapPin className={`w-4 h-4 ${isSelected ? '' : 'text-zinc-400'}`} />
                        {city.name}
                      </span>
                      {isSelected && <Check className="w-4 h-4" />}
                    </button>
                  );
                })
              )}
            </div>
          </div>
        </div>
      )}

      {/* ─── ACTION DRAWERS ─── */}
      <QuickBookingDrawer
        vendor={bookVendor}
        isOpen={isBookingOpen}
        onClose={() => { setIsBookingOpen(false); setBookVendor(null); }}
      />

      {/* Filter bottom-sheet */}
      <FilterSheet
        open={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        filters={{ minRating, openNow, verifiedOnly }}
        onApply={(f: FilterState) => {
          setFilters({ minRating: f.minRating, openNow: f.openNow });
          setVerifiedOnly(f.verifiedOnly);
        }}
        language={language}
      />

    </div>
  );
}

function FilterChip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      onClick={onClick}
      className={`shrink-0 inline-flex items-center gap-1.5 px-3.5 sm:px-4 py-2 rounded-full text-xs sm:text-sm font-bold border transition-all duration-150 active:scale-[0.98] whitespace-nowrap ${
        active
          ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-1 ring-emerald-500'
          : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
      }`}
    >
      {active && <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />}
      {children}
    </button>
  );
}

function ComingSoon({
  cityName,
  language,
  t,
  notifyInput,
  setNotifyInput,
  hasSubscribed,
  onNotify,
}: {
  cityName: string;
  language: string;
  t: (k: any, v?: any) => string;
  notifyInput: string;
  setNotifyInput: (v: string) => void;
  hasSubscribed: boolean;
  onNotify: (e: React.FormEvent) => void;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-10 px-4 text-center max-w-lg mx-auto space-y-7">
      <div className="space-y-3">
        <div className="w-16 h-16 bg-rose-50 text-rose-600 rounded-2xl border border-rose-100 flex items-center justify-center mx-auto shadow-sm">
          <Megaphone className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-black text-zinc-900 tracking-tight">
          {t('comingSoonTitle', { city: cityName })}
        </h2>
        <p className="text-zinc-500 text-sm font-medium max-w-sm mx-auto">{t('comingSoonDesc')}</p>
      </div>
      <div className="w-full bg-zinc-950 rounded-2xl p-5 shadow-xl text-left space-y-3.5">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-rose-600 text-white flex items-center justify-center">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <h4 className="text-xs font-bold text-zinc-200">{t('getNotified')}</h4>
            <p className="text-[10px] text-zinc-400 font-medium">{t('getNotifiedDesc')}</p>
          </div>
        </div>
        {hasSubscribed ? (
          <div className="bg-emerald-950/20 border border-emerald-500/25 rounded-xl p-3.5 flex gap-2.5 items-center text-emerald-400 font-bold text-xs">
            <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
            {language === 'hi' ? 'सहेज लिया गया!' : 'Saved! We will alert you on launch.'}
          </div>
        ) : (
          <form onSubmit={onNotify} className="flex gap-2">
            <Input
              type="text"
              placeholder={language === 'hi' ? 'मोबाइल या ईमेल' : 'Email or phone number'}
              required
              className="h-11 text-xs rounded-xl bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-500 flex-1"
              value={notifyInput}
              onChange={(e) => setNotifyInput(e.target.value)}
            />
            <Button type="submit" className="h-11 rounded-xl px-5 text-xs font-extrabold bg-rose-600 hover:bg-rose-700 text-white shrink-0">
              {t('notifyMe')}
            </Button>
          </form>
        )}
      </div>
    </div>
  );
}
