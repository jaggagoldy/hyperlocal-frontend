'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import { 
  Search, 
  MapPin, 
  X, 
  Star, 
  BadgeCheck, 
  ImageIcon, 
  ChevronRight, 
  ChevronDown, 
  Sparkles, 
  Bell, 
  ArrowRight, 
  SlidersHorizontal, 
  Award, 
  ShieldAlert, 
  CheckCircle,
  HelpCircle,
  Megaphone,
  Check,
  Loader2
} from 'lucide-react';
import { useSearchStore } from '@/store/searchStore';
import { useDebounce } from '@/hooks/useDebounce';
import { EnquiryDrawer } from '@/components/shared/EnquiryDrawer';
import apiClient from '@/lib/api-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CatalogItem } from '@/types/models';
import { useRouter } from 'next/navigation';
import { useTranslation } from '@/lib/translations';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { toast } from 'sonner';

// Define client-side grouping of flat database categories into Verticals with Translation keys
const VERTICALS = [
  {
    id: 'home-maintenance',
    nameKey: 'homeMaintenance' as const,
    icon: '🔧',
    categorySlugs: ['electrician', 'plumber', 'carpenter', 'painter'],
  },
  {
    id: 'appliance-repair',
    nameKey: 'applianceRepair' as const,
    icon: '🔌',
    categorySlugs: ['ac-repair', 'ro-repair'],
  },
  {
    id: 'car-rental',
    nameKey: 'carRental' as const,
    icon: '🚗',
    categorySlugs: ['car-rental'],
  },
  {
    id: 'salon-booking',
    nameKey: 'salonBooking' as const,
    icon: '✂️',
    categorySlugs: ['salon-booking'],
  },
  {
    id: 'real-estate',
    nameKey: 'realEstate' as const,
    icon: '🏢',
    categorySlugs: ['real-estate'],
  }
];

export default function ExplorePage() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { 
    selectedCity, 
    selectedCategory, 
    searchQuery, 
    page, 
    setCity, 
    setCategory, 
    setSearchQuery, 
    setPage 
  } = useSearchStore();

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debouncedQuery = useDebounce(localQuery, 500);
  
  const [items, setItems] = useState<(CatalogItem & { vendor: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  // Cities List (Fetched dynamically from backend)
  const [cities, setCities] = useState<any[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  // Mobile Filter Drawer state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);

  // Expanded Verticals state
  const [expandedVerticals, setExpandedVerticals] = useState<Record<string, boolean>>({
    'home-maintenance': true,
    'appliance-repair': true,
    'car-rental': true,
    'salon-booking': true,
    'real-estate': true,
  });

  // Promotional Banner Carousel state
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselTimer = useRef<NodeJS.Timeout | null>(null);

  // Coming Soon Notify State
  const [notifyInput, setNotifyInput] = useState('');
  const [isSubmittingNotify, setIsSubmittingNotify] = useState(false);
  const [hasSubscribedNotify, setHasSubscribedNotify] = useState(false);

  // Fetch Cities on Mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await apiClient.get('/search/cities');
        const fetchedCities = res.data?.data || [];
        const filteredCities = fetchedCities.filter((c: any) =>
          ['fatehabad', 'hisar', 'sirsa'].includes(c.slug.toLowerCase())
        );
        setCities(filteredCities);
        
        // Ensure selectedCity is one of the valid Haryana cities
        if (filteredCities.length > 0 && !filteredCities.some((c: any) => c.slug === selectedCity)) {
          setCity(filteredCities[0].slug);
        }
      } catch (err) {
        console.error('Failed to fetch cities list', err);
      }
    };
    fetchCities();
  }, [selectedCity, setCity]);

  // Sync Search query state
  useEffect(() => {
    setSearchQuery(debouncedQuery);
  }, [debouncedQuery, setSearchQuery]);

  // Promo Banner Auto-Rotation
  useEffect(() => {
    carouselTimer.current = setInterval(() => {
      setActiveSlide(prev => (prev + 1) % 3);
    }, 5000);

    return () => {
      if (carouselTimer.current) clearInterval(carouselTimer.current);
    };
  }, []);

  // Main Item Fetching function
  const fetchItems = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/catalog/explore`, {
        params: { 
          citySlug: selectedCity,
          categorySlug: selectedCategory,
          searchQuery: debouncedQuery, 
          page: reset ? 1 : page, 
          limit: 10 
        }
      });
      
      const newItems = res.data?.data || [];
      setItems(prev => reset ? newItems : [...prev, ...newItems]);
      setHasMore(newItems.length === 10);
    } catch (error) {
      console.error('Failed to fetch items', error);
      if (reset) setItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCity, selectedCategory, debouncedQuery, page]);

  // Refetch when filters change
  useEffect(() => {
    fetchItems(true);
  }, [selectedCity, selectedCategory, debouncedQuery, fetchItems]);

  // Load more pagination
  useEffect(() => {
    if (page > 1) fetchItems(false);
  }, [page, fetchItems]);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!notifyInput.trim()) return;

    setIsSubmittingNotify(true);
    // Simulate notification signup API request
    setTimeout(() => {
      setIsSubmittingNotify(false);
      setHasSubscribedNotify(true);
      setNotifyInput('');
      toast.success(
        language === 'hi'
          ? 'सफलतापूर्वक सहेज लिया गया! लॉन्च होने पर हम आपको सूचित करेंगे।'
          : "Awesome! We'll notify you as soon as services are live here."
      );
    }, 800);
  };

  const getCityNameBySlug = (slug: string) => {
    const cityObj = cities.find(c => c.slug === slug);
    return cityObj ? cityObj.name : slug.charAt(0).toUpperCase() + slug.slice(1);
  };

  // Toggle vertical expansion
  const toggleVertical = (id: string) => {
    setExpandedVerticals(prev => ({
      ...prev,
      [id]: !prev[id],
    }));
  };

  const filteredCities = cities.filter(c => 
    c.name.toLowerCase().includes(citySearch.toLowerCase())
  );

  // Carousel slide definitions
  const slides = [
    {
      title: t('heroTitle').split(' Chowk')[0] + " Chowk",
      desc: t('heroSubtitle'),
      badge: language === 'hi' ? 'स्थानीय और तेज़' : 'Fast & Local',
      gradient: "from-teal-650 via-teal-800 to-emerald-900",
      cta: language === 'hi' ? 'अभी बुक करें' : 'Book Now',
      action: () => {
        const grid = document.getElementById('explore-grid');
        if (grid) grid.scrollIntoView({ behavior: 'smooth' });
      }
    },
    {
      title: language === 'hi' ? 'प्रो प्लान में अपग्रेड करें' : 'Upgrade to Pro Tier Mode',
      desc: t('proDesc'),
      badge: language === 'hi' ? 'पार्टनर ऑफर' : 'Partner Offer',
      gradient: "from-amber-600 via-orange-700 to-rose-800",
      cta: t('joinProToday'),
      action: () => router.push('/vendor/register')
    },
    {
      title: t('value3Title'),
      desc: t('value3Desc'),
      badge: language === 'hi' ? 'सुरक्षा पहले' : 'Security First',
      gradient: "from-indigo-650 via-indigo-800 to-violet-900",
      cta: language === 'hi' ? 'अधिक जानें' : 'Learn More',
      action: () => toast.info("All pros carry official verification badges on their profiles.")
    }
  ];

  // Helper to determine if the selected city has active catalog items at all
  const isCityEmpty = items.length === 0 && !loading && selectedCategory === '' && debouncedQuery === '';

  // Helper to get Category Name by Slug using our translation hook dictionary
  const getCategoryName = (slug: string) => {
    const keyMap: Record<string, any> = {
      electrician: 'electrician',
      plumber: 'plumber',
      carpenter: 'carpenter',
      painter: 'painter',
      'ac-repair': 'ac-repair',
      'ro-repair': 'ro-repair',
      'car-rental': 'carRental',
      'salon-booking': 'salonBooking',
      'real-estate': 'realEstate',
    };
    return t(keyMap[slug] || slug);
  };

  const renderCategoryNavigation = () => {
    return (
      <div className="space-y-4">
        {/* All Services Button */}
        <button
          onClick={() => {
            setCategory('');
            setIsMobileFilterOpen(false);
          }}
          className={`w-full text-left px-3.5 py-3 rounded-xl font-bold text-xs transition-all flex items-center justify-between border ${
            !selectedCategory 
              ? 'bg-primary/5 text-primary border-primary/20 shadow-xs' 
              : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 border-transparent'
          }`}
        >
          <span className="flex items-center gap-2">
            <span>🌐</span> {t('allServices')}
          </span>
          <ChevronRight className={`w-4 h-4 text-zinc-400 ${!selectedCategory ? 'text-primary' : ''}`} />
        </button>

        {/* Grouped Verticals */}
        {VERTICALS.map(vertical => {
          const isExpanded = expandedVerticals[vertical.id];
          return (
            <div key={vertical.id} className="border border-zinc-150 rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                onClick={() => toggleVertical(vertical.id)}
                className="w-full flex items-center justify-between p-3.5 bg-zinc-50/50 hover:bg-zinc-50 border-b border-zinc-100 transition-colors"
              >
                <span className="flex items-center gap-2 text-xs font-extrabold text-zinc-700 tracking-wide uppercase">
                  <span>{vertical.icon}</span>
                  {t(vertical.nameKey)}
                </span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                )}
              </button>

              {isExpanded && (
                <div className="p-1 space-y-0.5 bg-white">
                  {vertical.categorySlugs.map(slug => {
                    const isSelected = selectedCategory === slug;
                    return (
                      <button
                        key={slug}
                        onClick={() => {
                          setCategory(slug);
                          setIsMobileFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                          isSelected 
                            ? 'bg-primary/5 text-primary font-bold' 
                            : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
                        }`}
                      >
                        {getCategoryName(slug)}
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div className="flex flex-col min-h-screen bg-zinc-50/30 pb-24 font-sans">
      
      {/* ─── STICKY HEADER ─── */}
      <header className="sticky top-0 z-40 bg-white border-b border-zinc-200/80 px-4 py-3 shadow-xs">
        <div className="max-w-7xl mx-auto flex flex-col gap-3">
          
          <div className="flex items-center justify-between gap-4">
            {/* Location Selector Trigger */}
            <button 
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-1.5 text-zinc-800 hover:text-primary transition-colors font-bold text-sm bg-zinc-150/40 hover:bg-zinc-150/60 px-3.5 py-1.5 rounded-xl border border-zinc-200/40 shadow-2xs group"
            >
              <MapPin className="w-4.5 h-4.5 text-primary group-hover:scale-105 transition-transform" />
              <span>{getCityNameBySlug(selectedCity)}</span>
              <ChevronDown className="w-3.5 h-3.5 text-zinc-400" />
            </button>

            {/* Mobile Filter Button */}
            <Drawer open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
              <DrawerTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  className="lg:hidden h-9 px-3 rounded-xl border-zinc-250 text-zinc-600 gap-1.5 font-bold text-xs"
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  {language === 'hi' ? 'श्रेणियां' : 'Categories'}
                </Button>
              </DrawerTrigger>
              <DrawerContent className="p-5 max-h-[80vh] flex flex-col">
                <DrawerHeader className="px-0 pt-0 text-left border-b border-zinc-100 pb-2.5 mb-4">
                  <DrawerTitle className="text-base font-bold text-zinc-900">
                    {language === 'hi' ? 'श्रेणी से फ़िल्टर करें' : 'Filter by Category'}
                  </DrawerTitle>
                  <DrawerDescription className="text-xs">
                    {language === 'hi' ? 'मार्केटप्लेस में सेवाओं को देखने के लिए श्रेणी चुनें।' : 'Select a business vertical below to filter services.'}
                  </DrawerDescription>
                </DrawerHeader>
                <div className="flex-1 overflow-y-auto pb-4">
                  {renderCategoryNavigation()}
                </div>
              </DrawerContent>
            </Drawer>
          </div>

          {/* Search Input Box */}
          <div className="relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-zinc-400" />
            <Input 
              type="text"
              placeholder={t('searchPlaceholder')}
              className="h-11 pl-10 pr-10 text-xs sm:text-sm rounded-xl bg-zinc-50 border-zinc-200 focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-white transition-all shadow-2xs"
              value={localQuery}
              onChange={(e) => setLocalQuery(e.target.value)}
            />
            {localQuery && (
              <button 
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-600 p-1"
                onClick={() => setLocalQuery('')}
              >
                <X className="w-4.5 h-4.5" />
              </button>
            )}
          </div>
        </div>
      </header>

      {/* ─── MAIN RESPONSIVE CONTAINER ─── */}
      <div className="max-w-7xl mx-auto w-full px-4 py-6 flex gap-6 flex-1">
        
        {/* Left Sidebar Category Filter (Desktop Only) */}
        <aside className="hidden lg:block w-64 shrink-0 self-start sticky top-28 space-y-6">
          <div className="bg-white border border-zinc-200 p-5 rounded-2xl shadow-xs space-y-4">
            <div>
              <h3 className="font-extrabold text-sm text-zinc-800 uppercase tracking-wider">{language === 'hi' ? 'सेवा वर्ग' : 'Service Verticals'}</h3>
              <p className="text-[10px] text-zinc-400 font-medium mt-0.5">{language === 'hi' ? 'मरम्मत वर्ग से फ़िल्टर करें' : 'Filter by repair category'}</p>
            </div>
            {renderCategoryNavigation()}
          </div>
        </aside>

        {/* Right Content Area */}
        <main className="flex-1 space-y-6 min-w-0">
          
          {/* Dynamic Promotional Ads Carousel */}
          {!isCityEmpty && (
            <div className="relative w-full aspect-[21/9] sm:aspect-[24/8] lg:aspect-[24/7] rounded-2xl overflow-hidden shadow-md select-none group border border-zinc-200/50">
              {slides.map((slide, index) => {
                const isActive = index === activeSlide;
                return (
                  <div
                    key={index}
                    className={`absolute inset-0 w-full h-full bg-gradient-to-r ${slide.gradient} p-5 sm:p-7 flex flex-col justify-center items-start text-white transition-all duration-700 ease-in-out transform ${
                      isActive ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-98 pointer-events-none'
                    }`}
                  >
                    <span className="inline-flex bg-white/25 backdrop-blur-md text-[9px] uppercase tracking-widest font-black px-2 py-0.5 rounded-md mb-2">
                      {slide.badge}
                    </span>
                    <h2 className="text-base sm:text-lg lg:text-xl font-black tracking-tight leading-tight max-w-sm sm:max-w-md">
                      {slide.title}
                    </h2>
                    <p className="text-[11px] sm:text-xs text-white/85 font-medium leading-relaxed max-w-xs sm:max-w-sm mt-1">
                      {slide.desc}
                    </p>
                    <button
                      onClick={slide.action}
                      className="mt-3.5 sm:mt-4 px-3.5 py-1.5 bg-white text-zinc-950 text-[10px] font-extrabold rounded-lg shadow-sm hover:scale-103 active:scale-97 transition-all flex items-center gap-1"
                    >
                      {slide.cta}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}

              {/* Dots Indicators */}
              <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`h-1.5 rounded-full transition-all duration-300 ${
                      index === activeSlide ? 'w-5 bg-white' : 'w-1.5 bg-white/50 hover:bg-white/80'
                    }`}
                    aria-label={`Slide ${index + 1}`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Results Grid / Lists */}
          <div id="explore-grid" className="space-y-4">
            
            {/* Show search count header */}
            {!loading && items.length > 0 && (
              <div className="flex items-center justify-between text-xs text-zinc-400 font-bold border-b border-zinc-200/50 pb-2">
                <span>
                  {t('showingResults', { count: items.length, city: getCityNameBySlug(selectedCity).toUpperCase() })}
                </span>
                {selectedCategory && (
                  <span className="bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-md capitalize">
                    {getCategoryName(selectedCategory)}
                  </span>
                )}
              </div>
            )}

            {loading && page === 1 ? (
              // Skeleton Loaders
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs animate-pulse flex flex-col h-[320px]">
                    <div className="h-44 bg-zinc-100 w-full"></div>
                    <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                      <div className="space-y-2">
                        <div className="h-4 bg-zinc-150 rounded w-3/4" />
                        <div className="h-3.5 bg-zinc-100 rounded w-1/2" />
                      </div>
                      <div className="h-10 bg-zinc-150 rounded-xl w-full" />
                    </div>
                  </div>
                ))}
              </div>
            ) : isCityEmpty ? (
              // ─── HIGH CONTRAST "COMING SOON / WE ARE EXPANSION" HINDI COMPLIANT EMPTY STATE ───
              <div className="flex flex-col items-center justify-center py-8 px-4 text-center max-w-lg mx-auto space-y-8">
                
                {/* Visual Icon Illustration */}
                <div className="space-y-3">
                  <div className="w-18 h-18 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100 flex items-center justify-center mx-auto shadow-sm animate-bounce">
                    <Megaphone className="w-8 h-8" />
                  </div>
                  <h2 className="text-xl font-black text-zinc-900 tracking-tight leading-tight">
                    {t('comingSoonTitle', { city: getCityNameBySlug(selectedCity) })}
                  </h2>
                  <p className="text-zinc-550 text-xs sm:text-sm leading-relaxed max-w-sm mx-auto font-semibold">
                    {t('comingSoonDesc')}
                  </p>
                </div>

                {/* High Contrast Input Form for Notification Signup */}
                <div className="w-full bg-zinc-950 border border-zinc-900/40 rounded-2xl p-5 shadow-xl text-left space-y-3.5 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-24 h-24 bg-primary/5 rounded-full blur-xl pointer-events-none" />
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg bg-primary text-white flex items-center justify-center shadow-xs">
                      <Bell className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-zinc-200">{t('getNotified')}</h4>
                      <p className="text-[10px] text-zinc-400 font-medium">{t('getNotifiedDesc')}</p>
                    </div>
                  </div>

                  {hasSubscribedNotify ? (
                    <div className="bg-emerald-950/20 border border-emerald-500/25 rounded-xl p-3.5 flex gap-2.5 items-center text-emerald-400 font-bold text-xs">
                      <CheckCircle className="w-5 h-5 text-emerald-500 shrink-0" />
                      {language === 'hi' ? 'सहेज लिया गया! जल्द सूचित किया जायेगा।' : 'Saved! We will alert you upon launching.'}
                    </div>
                  ) : (
                    <form onSubmit={handleNotifySubmit} className="flex gap-2">
                      <Input
                        type="text"
                        placeholder={language === 'hi' ? 'मोबाइल नंबर या ईमेल भरें' : 'Email or Phone Number'}
                        required
                        className="h-11 text-xs rounded-xl bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-500 focus-visible:ring-primary focus-visible:border-primary flex-1"
                        value={notifyInput}
                        onChange={(e) => setNotifyInput(e.target.value)}
                        disabled={isSubmittingNotify}
                      />
                      <Button
                        type="submit"
                        disabled={isSubmittingNotify}
                        className="h-11 rounded-xl px-5 text-xs font-extrabold bg-primary hover:bg-primary/90 text-white shrink-0 shadow-md shadow-primary/20 transition-all flex items-center gap-1"
                      >
                        {isSubmittingNotify ? '...' : t('notifyMe')}
                      </Button>
                    </form>
                  )}
                </div>

                {/* High Contrast "Register as a Pro" CTA */}
                <div 
                  onClick={() => router.push('/vendor/register')}
                  className="group w-full bg-gradient-to-br from-primary to-primary-dark hover:from-primary/95 hover:to-primary-dark/95 text-white p-6 rounded-2xl shadow-xl border border-primary-dark/20 text-left space-y-4 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:scale-[1.01] relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
                  
                  <div className="space-y-1.5 relative z-10">
                    <span className="inline-flex bg-white/20 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-white/15">
                      {t('forPros')}
                    </span>
                    <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                      {t('areYouPro')}
                    </h3>
                    <p className="text-[11px] sm:text-xs text-white/80 leading-relaxed max-w-sm">
                      {t('proDesc')}
                    </p>
                  </div>

                  <span className="inline-flex items-center gap-1.5 bg-white text-zinc-950 font-black px-4.5 py-2.5 rounded-xl text-xs transition-all shadow-md group-hover:bg-zinc-50 group-hover:translate-x-1 select-none">
                    {t('joinProToday')}
                    <ArrowRight className="w-4 h-4 text-zinc-950" />
                  </span>
                </div>

              </div>
            ) : items.length === 0 ? (
              // Search Criteria Empty State
              <div className="flex flex-col items-center justify-center py-16 text-center px-4 max-w-md mx-auto space-y-4">
                <div className="w-14 h-14 bg-zinc-100 rounded-full flex items-center justify-center mx-auto shadow-xs border border-zinc-200/50">
                  <Search className="w-6 h-6 text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-zinc-800">{t('noResults')}</h3>
                  <p className="text-zinc-555 text-xs sm:text-sm mt-1 max-w-xs mx-auto leading-relaxed">
                    {t('noResultsDesc')}
                  </p>
                </div>
                
                <div className="bg-zinc-50 border border-zinc-200/60 rounded-xl p-3.5 text-xs text-zinc-550 leading-relaxed font-semibold">
                  💡 {language === 'hi' 
                    ? `हम ${getCityNameBySlug(selectedCity)} में लगातार नए प्रोवाइडर्स को जोड़ रहे हैं! किसी अन्य श्रेणी का चयन करें या फ़िल्टर को साफ़ करें।` 
                    : `We're actively onboarding professionals in ${getCityNameBySlug(selectedCity)}! Try selecting other categories or clear the search criteria.`}
                </div>
                <Button 
                  onClick={() => setCategory('')} 
                  variant="outline" 
                  className="rounded-xl h-10 font-bold text-xs"
                >
                  {language === 'hi' ? 'श्रेणी साफ़ करें' : 'Clear Category Filter'}
                </Button>
              </div>
            ) : (
              // Product Grid Layout
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
                  {items.map((item, i) => (
                    <div 
                      key={`${item.id}-${i}`} 
                      className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md hover:border-zinc-355 transition-all flex flex-col h-[340px]"
                    >
                      {/* Item Image */}
                      <div className="relative h-44 bg-zinc-100 flex-shrink-0 border-b border-zinc-100">
                        {item.mediaUrl ? (
                          <img 
                            src={item.mediaUrl} 
                            alt={item.title} 
                            className="w-full h-full object-cover"
                            loading="lazy"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-zinc-50">
                            <ImageIcon className="w-8 h-8 text-zinc-300" />
                          </div>
                        )}
                        {item.price && (
                          <div className="absolute bottom-2.5 left-2.5 bg-zinc-950/85 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg font-black text-xs shadow-sm border border-zinc-800/40">
                            ₹{item.price}
                          </div>
                        )}
                      </div>
                      
                      {/* Item Details */}
                      <div className="p-4 flex flex-col flex-1 justify-between min-w-0">
                        <div className="space-y-1.5">
                          <h3 className="font-extrabold text-zinc-900 text-sm sm:text-base leading-tight truncate">
                            {item.title}
                          </h3>
                          
                          {/* Vendor Details */}
                          <div className="flex items-center gap-1.5 text-xs font-semibold text-zinc-450">
                            <span className="truncate max-w-[120px] text-zinc-800 font-bold">{item.vendor?.businessName}</span>
                            {item.vendor?.idVerified && (
                              <BadgeCheck className="w-4 h-4 text-emerald-500 fill-emerald-500/10 flex-shrink-0" />
                            )}
                            {item.vendor?.rating > 0 && (
                              <div className="flex items-center gap-0.5 ml-auto text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-extrabold border border-amber-100/50">
                                <Star className="w-3 h-3 fill-current" />
                                <span>{item.vendor.rating.toFixed(1)}</span>
                              </div>
                            )}
                          </div>

                          {/* Description */}
                          {item.description && (
                            <p className="text-zinc-550 text-xs line-clamp-2 leading-relaxed font-medium">
                              {item.description}
                            </p>
                          )}
                        </div>

                        <div className="pt-2">
                          <EnquiryDrawer item={item} vendorName={item.vendor?.businessName || 'the provider'} />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                {/* Pagination Load More Button */}
                {hasMore && (
                  <Button 
                    variant="outline" 
                    className="w-full h-11 mt-4 font-bold bg-white border-zinc-250 text-xs rounded-xl shadow-xs" 
                    onClick={() => setPage(page + 1)}
                    disabled={loading}
                  >
                    {loading ? (
                      <span className="flex items-center gap-1.5"><Loader2 className="w-3.5 h-3.5 animate-spin" /> {language === 'hi' ? 'लोड हो रहा है...' : 'Loading...'}</span>
                    ) : (
                      t('loadMore')
                    )}
                  </Button>
                )}
              </>
            )}
          </div>
        </main>
      </div>

      {/* ─── SEARCHABLE LOCATION SELECTION MODAL ─── */}
      {isLocationModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs transition-all duration-300 animate-in fade-in-0">
          <div className="bg-white rounded-2xl border border-zinc-200 max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[80vh]">
            
            {/* Modal Header */}
            <div className="px-5 py-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/50">
              <div>
                <h3 className="font-extrabold text-sm text-zinc-900 uppercase tracking-wider">{language === 'hi' ? 'स्थान चुनें' : 'Select Location'}</h3>
                <p className="text-[10px] text-zinc-400 font-medium">{language === 'hi' ? 'सेवाएँ खोजने के लिए शहर चुनें' : 'Choose city to find services'}</p>
              </div>
              <button 
                onClick={() => {
                  setIsLocationModalOpen(false);
                  setCitySearch('');
                }}
                className="p-1 rounded-lg text-zinc-400 hover:text-zinc-650 hover:bg-zinc-100 transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* City Search Field */}
            <div className="p-4 border-b border-zinc-100">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400" />
                <Input
                  type="text"
                  placeholder={language === 'hi' ? 'शहर का नाम खोजें...' : 'Search city name...'}
                  className="h-10 pl-9 rounded-xl bg-zinc-50 border-zinc-250 text-xs focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-white"
                  value={citySearch}
                  onChange={(e) => setCitySearch(e.target.value)}
                />
              </div>
            </div>

            {/* Scrollable Cities List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {/* Popular Cities Quick Links */}
              {!citySearch && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">{t('popularCities')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {[
                      { name: 'Noida', slug: 'noida' },
                      { name: 'Dadri', slug: 'dadri' },
                      { name: 'Fatehabad', slug: 'fatehabad' },
                      { name: 'Hisar', slug: 'hisar' }
                    ].map(city => {
                      const isCurrent = selectedCity === city.slug;
                      return (
                        <button
                          key={city.slug}
                          onClick={() => {
                            setCity(city.slug);
                            setIsLocationModalOpen(false);
                          }}
                          className={`px-3 py-1.5 rounded-lg text-xs font-bold border transition-colors ${
                            isCurrent
                              ? 'bg-primary/5 text-primary border-primary/20'
                              : 'bg-zinc-50 hover:bg-zinc-100 text-zinc-650 border-zinc-200'
                          }`}
                        >
                          {city.name}
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Dynamic Search Results */}
              <div className="space-y-1">
                <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider mb-2">{language === 'hi' ? 'सभी शहर' : 'All Cities'}</p>
                {filteredCities.length === 0 ? (
                  <p className="text-zinc-450 text-xs text-center py-6 font-semibold">
                    {language === 'hi' ? `"${citySearch}" से मेल खाता कोई शहर नहीं मिला` : `No registered cities match "${citySearch}"`}
                  </p>
                ) : (
                  filteredCities.map((city: any) => {
                    const isSelected = selectedCity === city.slug;
                    return (
                      <button
                        key={city.id}
                        onClick={() => {
                          setCity(city.slug);
                          setIsLocationModalOpen(false);
                          setCitySearch('');
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl text-xs font-bold flex items-center justify-between transition-colors ${
                          isSelected 
                            ? 'bg-primary/5 text-primary border border-primary/10' 
                            : 'hover:bg-zinc-50 text-zinc-700 hover:text-zinc-900 border border-transparent'
                        }`}
                      >
                        <span className="flex items-center gap-2">
                          <MapPin className={`w-4 h-4 ${isSelected ? 'text-primary' : 'text-zinc-400'}`} />
                          {city.name}
                        </span>
                        {isSelected && <span className="w-1.5 h-1.5 rounded-full bg-primary" />}
                      </button>
                    );
                  })
                )}
              </div>
            </div>

            {/* Modal footer suggestion */}
            <div className="px-5 py-3.5 bg-zinc-50 border-t border-zinc-100 text-[10px] text-zinc-450 text-center font-semibold leading-relaxed">
              {language === 'hi' 
                ? '💡 हम हर हफ्ते नए शहरों में सेवाएं शुरू कर रहे हैं! जांचने के लिए अपना शहर लिखें।' 
                : "💡 We're launching in new areas every week! Type your city to check availability."}
            </div>

          </div>
        </div>
      )}

      {/* Global CSS scrollbar styling */}
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
