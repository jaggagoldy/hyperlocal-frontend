'use client';

import { useEffect, useState, useCallback, useRef, Suspense } from 'react';
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
  Loader2,
  LayoutGrid,
  List
} from 'lucide-react';
import { VendorCard } from '@/components/shared/VendorCard';
import { useSearchStore } from '@/store/searchStore';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import { useDebounce } from '@/hooks/useDebounce';
import { ServiceSidebar } from '@/components/shared/ServiceSidebar';

import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { CatalogItem } from '@/types/models';
import { useRouter, useSearchParams } from 'next/navigation';
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
const FOOD_VERTICALS = [
  {
    id: 'food-dining',
    nameKey: 'foodAndDining' as const,
    icon: '🍔',
    categorySlugs: ['restaurant', 'cloud-kitchen', 'street-food'],
  }
];

// Search-driven page (reads useSearchParams) — render on demand, not statically
// prerendered, so the build doesn't bail out now that AuthGuard no longer blanks SSR.
export const dynamic = 'force-dynamic';

function FoodPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useTranslation();
  const { user, activeContext, updateToken } = useAuthStore();
  const { 
    selectedCity, 
    selectedCategory, 
    searchQuery, 
    page, 
    setCity, 
    setCategory, 
    setSearchQuery, 
    setPage,
    businessType,
    minRating,
    openNow,
    setFilters
  } = useSearchStore();

  // Initialize from URL params on first load
  const isInitialized = useRef(false);
  useEffect(() => {
    if (!isInitialized.current) {
      isInitialized.current = true;
      const bt = searchParams.get('businessType');
      const mr = searchParams.get('minRating');
      const on = searchParams.get('openNow') === 'true';
      if (bt !== null || mr !== null || searchParams.has('openNow')) {
        setFilters({ businessType: bt || '', minRating: mr || '', openNow: on });
      }
    }
  }, [searchParams, setFilters]);

  // Sync state to URL params (ignoring businessType as it's hardcoded to food)
  useEffect(() => {
    if (isInitialized.current) {
      const params = new URLSearchParams(searchParams.toString());
      let changed = false;
      
      if (minRating && params.get('minRating') !== minRating) { params.set('minRating', minRating); changed = true; }
      else if (!minRating && params.has('minRating')) { params.delete('minRating'); changed = true; }
      
      if (openNow && params.get('openNow') !== 'true') { params.set('openNow', 'true'); changed = true; }
      else if (!openNow && params.has('openNow')) { params.delete('openNow'); changed = true; }
      
      if (changed) {
        router.replace(`?${params.toString()}`, { scroll: false });
      }
    }
  }, [minRating, openNow, router, searchParams]);

  // Smart Pro CTA: dual-profile users switch context instead of being sent to register
  const isDualProfile = user?.hasCustomerProfile && user?.hasVendorProfile;
  const isVendorContext = activeContext === 'vendor';
  
  const handleProCta = async () => {
    if (isDualProfile) {
      try {
        const res = await apiClient.post('/auth/switch-context', { targetContext: 'vendor' });
        const { token, user: newUser } = res.data.data;
        updateToken(token, newUser);
        toast.success('🔧 Switched to Pro Dashboard');
        router.push('/vendor-dashboard');
      } catch {
        router.push('/vendor-dashboard');
      }
    } else {
      router.push('/vendor/register');
    }
  };

  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debouncedQuery = useDebounce(localQuery, 500);
  
  const [items, setItems] = useState<(CatalogItem & { vendor: any })[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);
  const [verifiedOnly, setVerifiedOnly] = useState(false);

  // Cities List (Fetched dynamically from backend)
  const [cities, setCities] = useState<any[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  // Mobile Filter Drawer state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  // Expanded Verticals state
  const [expandedVerticals, setExpandedVerticals] = useState<Record<string, boolean>>({
    'food-dining': true,
  });

  // Promotional Banner Carousel state
  const [activeSlide, setActiveSlide] = useState(0);
  const carouselTimer = useRef<NodeJS.Timeout | null>(null);

  // Coming Soon Notify State
  const [notifyInput, setNotifyInput] = useState('');
  const [isSubmittingNotify, setIsSubmittingNotify] = useState(false);
  const [hasSubscribedNotify, setHasSubscribedNotify] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [activeAdIndex, setActiveAdIndex] = useState(0);

  const SIDEBAR_ADS = [
    {
      sponsor: "Swad Express",
      category: "Restaurant",
      title: "50% Off Your First Thali Order!",
      discount: "Use code SWAD50",
      bgGradient: "from-orange-50 via-rose-50 to-orange-100",
      buttonBg: "bg-[#826953] hover:bg-[#6c5541]",
      titleColor: "text-rose-900",
      url: "#"
    },
    {
      sponsor: "Hisar Street Bites",
      category: "Street Food",
      title: "Craving Golgappas? We deliver them crisp!",
      discount: "Flat 20% Off",
      bgGradient: "from-teal-50 via-cyan-50 to-emerald-50",
      buttonBg: "bg-teal-600 hover:bg-teal-700",
      titleColor: "text-teal-900",
      url: "#"
    },
    {
      sponsor: "Midnight Kitchen",
      category: "Cloud Kitchen",
      title: "Late night cravings? Open till 3 AM.",
      discount: "Order Now",
      bgGradient: "from-indigo-50 via-purple-50 to-pink-50",
      buttonBg: "bg-indigo-600 hover:bg-indigo-700",
      titleColor: "text-indigo-900",
      url: "#"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveAdIndex((prev) => (prev + 1) % SIDEBAR_ADS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [SIDEBAR_ADS.length]);

  // Fetch Cities on Mount
  useEffect(() => {
    const fetchCities = async () => {
      try {
        const res = await apiClient.get('/search/cities');
        // Full canonical PB+HR district list (every district always shown).
        const fetchedCities = res.data?.data || [];
        setCities(fetchedCities);

        // Keep the current selection if it's a valid district; else fall back.
        if (fetchedCities.length > 0 && !fetchedCities.some((c: any) => c.slug === selectedCity)) {
          setCity(fetchedCities[0].slug);
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
      const res = await apiClient.get(`/search/explore/${selectedCity || 'any'}/${selectedCategory || 'any'}`, {
        params: { 
          query: debouncedQuery, 
          page: reset ? 1 : page, 
          limit: 10,
          verifiedOnly,
          businessType: businessType || 'FOOD_BEVERAGE', // ALWAYS FILTER FOR FOOD
          minRating,
          openNow
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
  }, [selectedCity, selectedCategory, debouncedQuery, verifiedOnly, businessType, minRating, openNow, fetchItems]);

  // Load page
  useEffect(() => {
    if (page > 1) {
      fetchItems(true);
      const grid = document.getElementById('explore-grid');
      if (grid) grid.scrollIntoView({ behavior: 'smooth' });
    }
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
    ...(!isVendorContext ? [{
      title: isDualProfile
        ? (language === 'hi' ? 'अपने वेंडर डैशबोर्ड पर जाएं' : 'Switch to Your Pro Dashboard')
        : (language === 'hi' ? 'प्रो प्लान में अपग्रेड करें' : 'Upgrade to Pro Tier Mode'),
      desc: t('proDesc'),
      badge: isDualProfile ? (language === 'hi' ? 'डुअल अकाउंट' : 'Dual Account') : (language === 'hi' ? 'पार्टनर ऑफर' : 'Partner Offer'),
      gradient: "from-amber-600 via-orange-700 to-rose-800",
      cta: isDualProfile ? (language === 'hi' ? 'डैशबोर्ड खोलें' : 'Open Dashboard') : t('joinProToday'),
      action: handleProCta
    }] : []),
    {
      title: t('value3Title'),
      desc: t('value3Desc'),
      badge: language === 'hi' ? 'सुरक्षा पहले' : 'Security First',
      gradient: "from-indigo-650 via-indigo-800 to-violet-900",
      cta: language === 'hi' ? 'अधिक जानें' : 'Learn More',
      action: () => toast.info("All pros carry official verification badges on their profiles.")
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [slides.length]);

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
      'restaurant': 'restaurant',
      'cloud-kitchen': 'cloudKitchen'
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
        {FOOD_VERTICALS.map(vertical => {
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
                          
                          const foodCategories = ['restaurant', 'cloud-kitchen', 'street-food'];
                          if (slug && !foodCategories.includes(slug)) {
                            router.push('/explore');
                          }
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
        <div className="max-w-7xl mx-auto flex items-center gap-3">
          
          {/* Unified Search Bar */}
          <div className="flex-1 flex items-center bg-white border border-zinc-300 rounded-full shadow-sm overflow-hidden h-12 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            
            {/* Location Section */}
            <button 
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-2 px-4 md:px-5 h-full bg-zinc-50 hover:bg-zinc-100 transition-colors border-r border-zinc-200 shrink-0"
            >
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-zinc-800 truncate max-w-[80px] md:max-w-[120px]">{getCityNameBySlug(selectedCity) || 'Location'}</span>
              <ChevronDown className="w-4 h-4 text-zinc-400 hidden sm:block" />
            </button>

            {/* Search Input Section */}
            <div className="flex-1 relative h-full flex items-center">
              <input 
                type="text"
                placeholder={t('searchPlaceholder')}
                className="w-full h-full pl-4 pr-10 text-sm outline-none bg-transparent text-zinc-800 placeholder-zinc-400"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
              />
              {localQuery && (
                <button 
                  className="absolute right-3 text-zinc-400 hover:text-zinc-700 bg-zinc-100 hover:bg-zinc-200 p-1 rounded-full transition-colors"
                  onClick={() => setLocalQuery('')}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Button (Desktop) */}
            <button className="hidden sm:flex h-full px-8 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 text-sm font-bold transition-colors items-center justify-center">
              {language === 'hi' ? 'खोजें' : 'Search'}
            </button>

            {/* Search Button (Mobile Icon) */}
            <button className="sm:hidden h-full px-4 bg-zinc-200 hover:bg-zinc-300 text-zinc-800 flex items-center justify-center transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Filter Button */}
          <Drawer open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <DrawerTrigger asChild>
              <Button 
                variant="outline" 
                className="md:hidden shrink-0 rounded-full w-12 h-12 p-0 border-zinc-300 text-zinc-700 bg-white shadow-sm"
              >
                <SlidersHorizontal className="w-5 h-5 text-zinc-700" />
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
            <div className="relative w-full aspect-[21/9] sm:aspect-[24/8] lg:aspect-[24/7] rounded-3xl overflow-hidden shadow-xl select-none group bg-zinc-900 border border-zinc-800">
              {slides.map((slide, index) => {
                const isActive = index === activeSlide;
                return (
                  <div
                    key={index}
                    className={`absolute inset-0 w-full h-full bg-gradient-to-r ${slide.gradient} p-6 sm:p-10 flex flex-col justify-center items-start text-white transition-all duration-700 ease-in-out transform ${
                      isActive ? 'opacity-100 translate-x-0 scale-100' : 'opacity-0 translate-x-4 scale-98 pointer-events-none'
                    }`}
                  >
                    {/* Ambient glow effects */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl pointer-events-none transform translate-x-1/2 -translate-y-1/2" />
                    <div className="absolute bottom-0 right-1/4 w-48 h-48 bg-black/20 rounded-full blur-3xl pointer-events-none" />

                    <div className="relative z-10 space-y-3">
                      <span className="inline-flex bg-white/20 backdrop-blur-md text-[10px] uppercase tracking-widest font-black px-3 py-1 rounded-full text-white shadow-sm border border-white/10">
                        {slide.badge}
                      </span>
                      <h2 className="text-xl sm:text-2xl lg:text-3xl font-black tracking-tight leading-tight max-w-sm sm:max-w-lg text-white drop-shadow-sm">
                        {slide.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-white/90 font-medium leading-relaxed max-w-sm sm:max-w-md">
                        {slide.desc}
                      </p>
                      <button
                        onClick={slide.action}
                        className="mt-6 px-6 py-2.5 bg-white text-zinc-900 text-xs sm:text-sm font-extrabold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group/btn"
                      >
                        {slide.cta}
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Dots Indicators */}
              <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 z-20 bg-black/20 backdrop-blur-md px-3 py-2 rounded-full border border-white/10">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeSlide ? 'w-6 bg-white shadow-[0_0_10px_rgba(255,255,255,0.8)]' : 'w-2 bg-white/40 hover:bg-white/80'
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
              <div className="flex items-center justify-between text-xs text-zinc-500 font-bold border-b border-zinc-200/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-zinc-900 text-sm font-extrabold">
                    {items.length} Results
                  </span>
                  {selectedCategory && (
                    <span className="bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-md capitalize hidden sm:inline-block">
                      {getCategoryName(selectedCategory)}
                    </span>
                  )}
                </div>
                

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-semibold text-zinc-700">
                    <input 
                      type="checkbox" 
                      className="rounded border-zinc-300 text-primary focus:ring-primary h-4 w-4"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                    />
                    Verified Pros Only
                  </label>
                  
                  <Drawer open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
                    <DrawerTrigger asChild>
                      <Button variant="outline" className="h-8 text-xs px-3 bg-white border-zinc-300 rounded-md shadow-sm font-semibold text-zinc-700 flex items-center gap-2">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Filters
                        {(businessType || minRating || openNow) && (
                          <span className="flex h-2 w-2 rounded-full bg-primary" />
                        )}
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="p-5 max-h-[90vh] flex flex-col">
                      <DrawerHeader className="px-0 pt-0 text-left border-b border-zinc-100 pb-3 mb-4">
                        <DrawerTitle className="text-lg font-bold text-zinc-900">Advanced Filters</DrawerTitle>
                      </DrawerHeader>
                      <div className="flex-1 overflow-y-auto space-y-6 pb-6 px-1">
                        
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-zinc-800">Business Model</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {['FOOD_BEVERAGE', 'SALON_BEAUTY', 'HOME_ESSENTIALS', 'CAB_TRANSPORT'].map((bt) => (
                              <label key={bt} className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="rounded border-zinc-300 text-primary focus:ring-primary h-4 w-4"
                                  checked={businessType.includes(bt)}
                                  onChange={(e) => {
                                    let newTypes = businessType ? businessType.split(',') : [];
                                    if (e.target.checked) {
                                      newTypes.push(bt);
                                    } else {
                                      newTypes = newTypes.filter(t => t !== bt);
                                    }
                                    setFilters({ businessType: newTypes.join(',') });
                                  }}
                                />
                                {bt.replace('_', ' ')}
                              </label>
                            ))}
                          </div>
                        </div>

                        {/* Minimum Rating Filter */}
                        <div className="space-y-3">
                          <h4 className="text-sm font-bold text-zinc-800">Minimum Rating</h4>
                          <div className="flex gap-3">
                            <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
                              <input 
                                type="radio" 
                                name="minRating"
                                className="border-zinc-300 text-primary focus:ring-primary"
                                checked={minRating === '4.0'}
                                onChange={() => setFilters({ minRating: '4.0' })}
                              />
                              4.0+ Stars
                            </label>
                            <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
                              <input 
                                type="radio" 
                                name="minRating"
                                className="border-zinc-300 text-primary focus:ring-primary"
                                checked={minRating === '3.0'}
                                onChange={() => setFilters({ minRating: '3.0' })}
                              />
                              3.0+ Stars
                            </label>
                            <label className="flex items-center gap-2 text-sm text-zinc-600 cursor-pointer">
                              <input 
                                type="radio" 
                                name="minRating"
                                className="border-zinc-300 text-primary focus:ring-primary"
                                checked={minRating === ''}
                                onChange={() => setFilters({ minRating: '' })}
                              />
                              Any
                            </label>
                          </div>
                        </div>

                        {/* Open Now Toggle */}
                        <div className="space-y-3 pt-2">
                          <label className="flex items-center justify-between text-sm font-bold text-zinc-800 cursor-pointer">
                            <span>Open Now</span>
                            <input 
                              type="checkbox" 
                              className="w-10 h-5 bg-zinc-200 rounded-full appearance-none checked:bg-primary transition-colors cursor-pointer relative before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:left-0.5 before:top-0.5 checked:before:translate-x-5 before:transition-transform"
                              checked={openNow}
                              onChange={(e) => setFilters({ openNow: e.target.checked })}
                            />
                          </label>
                          <p className="text-xs text-zinc-500">Only show pros who are currently accepting bookings.</p>
                        </div>

                      </div>
                      
                      <div className="border-t border-zinc-100 pt-4 flex gap-3">
                        <Button 
                          variant="outline" 
                          className="flex-1"
                          onClick={() => setFilters({ businessType: '', minRating: '', openNow: false })}
                        >
                          Clear
                        </Button>
                        <Button 
                          className="flex-1"
                          onClick={() => setIsAdvancedFilterOpen(false)}
                        >
                          Apply Filters
                        </Button>
                      </div>
                    </DrawerContent>
                  </Drawer>

                  <div className="h-4 w-px bg-zinc-300 hidden sm:block"></div>
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-block">View By</span>
                    <div className="flex items-center bg-zinc-100 rounded-lg p-1 border border-zinc-200 shadow-2xs">
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                          viewMode === 'grid' 
                            ? 'bg-zinc-800 text-white shadow-sm' 
                            : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50'
                        }`}
                      >
                        <span className="hidden sm:inline">Grid</span>
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                          viewMode === 'list' 
                            ? 'bg-zinc-800 text-white shadow-sm' 
                            : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-200/50'
                        }`}
                      >
                        <span className="hidden sm:inline">List</span>
                        <List className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
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

                {/* High Contrast \"Register as a Pro\" CTA — hidden for vendor-context users */}
                {!isVendorContext && (
                  <div 
                    onClick={handleProCta}
                    className="group w-full bg-gradient-to-br from-primary to-primary-dark hover:from-primary/95 hover:to-primary-dark/95 text-white p-6 rounded-2xl shadow-xl border border-primary-dark/20 text-left space-y-4 transition-all duration-300 cursor-pointer hover:shadow-2xl hover:scale-[1.01] relative overflow-hidden"
                  >
                    <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
                    
                    <div className="space-y-1.5 relative z-10">
                      <span className="inline-flex bg-white/20 text-white text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded border border-white/15">
                        {isDualProfile ? (language === 'hi' ? 'डुअल अकाउंट' : 'Dual Account') : t('forPros')}
                      </span>
                      <h3 className="text-base sm:text-lg font-black tracking-tight leading-tight">
                        {isDualProfile
                          ? (language === 'hi' ? 'अपने वेंडर डैशबोर्ड पर जाएं' : 'Switch to Your Pro Dashboard')
                          : t('areYouPro')}
                      </h3>
                      <p className="text-[11px] sm:text-xs text-white/80 leading-relaxed max-w-sm">
                        {t('proDesc')}
                      </p>
                    </div>

                    <span className="inline-flex items-center gap-1.5 bg-white text-zinc-950 font-black px-4.5 py-2.5 rounded-xl text-xs transition-all shadow-md group-hover:bg-zinc-50 group-hover:translate-x-1 select-none">
                      {isDualProfile ? (language === 'hi' ? 'डैशबोर्ड खोलें' : 'Open Dashboard') : t('joinProToday')}
                      <ArrowRight className="w-4 h-4 text-zinc-950" />
                    </span>
                  </div>
                )}

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
              <div className="flex flex-col xl:flex-row gap-6 items-start">
                <div className="flex-1 w-full min-w-0">
                  <div className={
                    viewMode === 'list'
                      ? "flex flex-col gap-4"
                      : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-4"
                  }>
                    {items.map((vendor, i) => (
                      <VendorCard key={`${vendor.id}-${i}`} vendor={vendor} viewMode={viewMode as any} />
                    ))}
                  </div>
                  
                  {/* Numbered Pagination */}
                  {(page > 1 || hasMore) && (
                    <div className="flex items-center justify-center gap-2 mt-8">
                      <button 
                        onClick={() => page > 1 && setPage(page - 1)}
                        disabled={page === 1 || loading}
                        className="w-10 h-10 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                      >
                        <ChevronRight className="w-5 h-5 rotate-180" />
                      </button>
                      
                      <div className="flex items-center gap-1">
                        {[Math.max(1, page - 1), page, page + 1].map((p, idx) => {
                          if (p > page && !hasMore) return null;
                          if (p === Math.max(1, page - 1) && page === 1 && idx === 0) return null;
                          
                          return (
                            <button 
                              key={p}
                              onClick={() => setPage(p)}
                              className={`w-10 h-10 rounded-xl text-sm font-bold transition-all ${
                                page === p 
                                  ? 'bg-primary text-white shadow-md' 
                                  : 'text-zinc-600 hover:bg-zinc-100'
                              }`}
                            >
                              {p}
                            </button>
                          )
                        })}
                      </div>

                      <button 
                        onClick={() => hasMore && setPage(page + 1)}
                        disabled={!hasMore || loading}
                        className="w-10 h-10 rounded-xl border border-zinc-200 flex items-center justify-center text-zinc-600 hover:bg-zinc-50 hover:text-zinc-900 disabled:opacity-50 disabled:hover:bg-transparent transition-all"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  )}
                </div>

                {/* Vertical Banner Ad (Right Sidebar) */}
                <div className="hidden xl:block w-[300px] shrink-0 sticky top-28 h-[550px]">
                  {(() => {
                    const ad = SIDEBAR_ADS[activeAdIndex];
                    return (
                      <div 
                        onClick={() => window.open(ad.url, '_blank')}
                        className="bg-zinc-100 border border-zinc-200 rounded-2xl overflow-hidden shadow-sm flex flex-col items-center justify-center relative h-full group cursor-pointer transition-all hover:shadow-md"
                      >
                        <div className={`absolute inset-0 bg-gradient-to-br ${ad.bgGradient} transition-colors duration-700`} />
                        
                        {/* Dynamic Ad Content */}
                        <div className="relative z-10 w-full h-full flex flex-col p-6 items-center justify-between text-center animate-in fade-in duration-500" key={ad.sponsor}>
                          <div className="flex flex-col items-center gap-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500 bg-white/60 px-2 py-0.5 rounded-full shadow-2xs">Sponsored</span>
                            <h3 className={`font-extrabold text-[28px] ${ad.titleColor} mt-6 leading-none tracking-tight`}>{ad.sponsor}</h3>
                            <span className={`text-[10px] ${ad.titleColor} opacity-60 uppercase tracking-widest font-bold`}>{ad.category}</span>
                            
                            <div className={`h-px w-16 bg-current opacity-20 my-4 ${ad.titleColor}`} />
                            
                            <p className="text-zinc-700 font-medium text-sm leading-snug px-4">
                              {ad.title}
                            </p>
                          </div>
                          
                          <div className={`w-full text-white font-black text-xl py-4 rounded-xl shadow-lg transition-colors mt-8 ${ad.buttonBg}`}>
                              {ad.discount}
                          </div>
                        </div>
                      </div>
                    );
                  })()}
                </div>
              </div>
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
              {/* Popular Cities Quick Links — districts that currently have listings */}
              {!citySearch && cities.some((c: any) => c.hasVendors) && (
                <div className="space-y-1.5">
                  <p className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">{t('popularCities')}</p>
                  <div className="flex flex-wrap gap-1.5">
                    {cities.filter((c: any) => c.hasVendors).slice(0, 6).map((city: any) => {
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
                        key={city.slug}
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

export default function FoodPage() {
  return (
    <Suspense fallback={null}>
      <FoodPageContent />
    </Suspense>
  );
}
