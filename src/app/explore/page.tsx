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
  List,
  Compass
} from 'lucide-react';
import SearchCardSelector from '@/components/directory/SearchCardSelector';
import FoodDishCard from '@/components/directory/FoodDishCard';
import RetailProductCard from '@/components/directory/RetailProductCard';
import ProximityMap from '@/components/directory/ProximityMap';
import QuickBookingDrawer from '@/components/directory/QuickBookingDrawer';
import CartDrawer from '@/components/vendor/CartDrawer';
import { useCartStore } from '@/store/useCartStore';
import { Listing } from '@/lib/directory';
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

// Client-side mapping of vertical keys to emojis for the sidebar
const VERTICAL_EMOJIS: Record<string, string> = {
  FOOD_BEVERAGE: '🍔',
  GROCERY: '🛒',
  RETAIL: '🛍️',
  SALON_BEAUTY: '✂️',
  HEALTH_MEDICAL: '🩺',
  HOME_ESSENTIALS: '🔧',
  PROFESSIONAL_SERVICES: '💼',
  EDUCATION: '🎓',
  FITNESS: '🏋️',
  AUTOMOTIVE: '🚗',
  REAL_ESTATE: '🏢',
  HOTELS: '🏨',
  EVENTS: '🎉',
  PERSONAL_SERVICES: '👔',
  TRAVEL: '✈️',
  FINANCIAL_SERVICES: '💵'
};

// Search-driven page (reads useSearchParams) — render on demand, not statically
// prerendered, so the build doesn't bail out now that AuthGuard no longer blanks SSR.
export const dynamic = 'force-dynamic';

function ExplorePageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { t, language } = useTranslation();
  const { user, activeContext, updateToken, isAuthenticated } = useAuthStore();
  const { cartItems, vendorId } = useCartStore();
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

  // Sync state to URL params
  useEffect(() => {
    if (isInitialized.current) {
      const params = new URLSearchParams(searchParams.toString());
      let changed = false;

      if (businessType && params.get('businessType') !== businessType) { params.set('businessType', businessType); changed = true; }
      else if (!businessType && params.has('businessType')) { params.delete('businessType'); changed = true; }
      
      if (minRating && params.get('minRating') !== minRating) { params.set('minRating', minRating); changed = true; }
      else if (!minRating && params.has('minRating')) { params.delete('minRating'); changed = true; }
      
      if (openNow && params.get('openNow') !== 'true') { params.set('openNow', 'true'); changed = true; }
      else if (!openNow && params.has('openNow')) { params.delete('openNow'); changed = true; }
      
      if (changed) {
        router.replace(`?${params.toString()}`, { scroll: false });
      }
    }
  }, [businessType, minRating, openNow, router, searchParams]);

  // Smart Pro CTA: dual-profile users switch context instead of being sent to register
  const isDualProfile = user?.hasCustomerProfile && user?.hasVendorProfile;
  const isVendorContext = activeContext === 'vendor';
  
  const handleProCta = async () => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/vendor/register');
      return;
    }
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

  // Resolve layout mode (food / retail / service / generic)
  const getSearchMode = (catSlug: string, btFilter: string) => {
    const bt = (btFilter || '').toUpperCase();
    if (catSlug === 'food-beverage' || bt.includes('FOOD_BEVERAGE')) return 'food';
    if (catSlug === 'grocery' || catSlug === 'shops-retail' || bt.includes('GROCERY') || bt.includes('RETAIL')) return 'retail';
    if (catSlug && catSlug !== '') return 'service';
    return 'generic';
  };
  const searchMode = getSearchMode(selectedCategory, businessType);

  const [searchTab, setSearchTab] = useState<'vendors' | 'items'>('vendors');
  const [catalogItems, setCatalogItems] = useState<any[]>([]);
  const [selectedBookVendor, setSelectedBookVendor] = useState<Listing | null>(null);
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [showRadarMap, setShowRadarMap] = useState(false);

  // Automatically reset searchTab to vendors when category switches
  useEffect(() => {
    setSearchTab('vendors');
    setShowRadarMap(false);
  }, [selectedCategory]);

  // Cities List (Fetched dynamically from backend)
  const [cities, setCities] = useState<any[]>([]);
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const [citySearch, setCitySearch] = useState('');

  // Mobile Filter Drawer state
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  const [isAdvancedFilterOpen, setIsAdvancedFilterOpen] = useState(false);

  // Expanded Verticals state
  const [expandedVerticals, setExpandedVerticals] = useState<Record<string, boolean>>({});
  const [verticals, setVerticals] = useState<any[]>([]);
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [activeCategorySlugs, setActiveCategorySlugs] = useState<string[]>([]);

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
      sponsor: "Sheluxe",
      category: "Lingerie",
      title: "Revamp your intimate wear collection",
      discount: "at 50% off",
      bgGradient: "from-orange-50 via-rose-50 to-orange-100",
      buttonBg: "bg-[#826953] hover:bg-[#6c5541]",
      titleColor: "text-rose-900",
      url: "https://example.com/sheluxe"
    },
    {
      sponsor: "Urban Cleaners",
      category: "Home Services",
      title: "Professional deep cleaning for your home",
      discount: "Flat 20% Off",
      bgGradient: "from-teal-50 via-cyan-50 to-emerald-50",
      buttonBg: "bg-teal-600 hover:bg-teal-700",
      titleColor: "text-teal-900",
      url: "https://example.com/urban"
    },
    {
      sponsor: "FixIt Fast",
      category: "Repairs",
      title: "Same day appliance repair services",
      discount: "Book Now",
      bgGradient: "from-indigo-50 via-purple-50 to-pink-50",
      buttonBg: "bg-indigo-600 hover:bg-indigo-700",
      titleColor: "text-indigo-900",
      url: "https://example.com/fixit"
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

    const fetchVerticals = async () => {
      try {
        const res = await apiClient.get('/verticals');
        const data = res.data?.data || [];
        // Only keep enabled ones (comingSoon: false) or show all. The explore screen is transactional by default.
        const activeVerticals = data.filter((v: any) => !v.comingSoon);
        setVerticals(activeVerticals);
        
        // Expand the first few verticals by default
        const initialExpanded: Record<string, boolean> = {};
        activeVerticals.slice(0, 3).forEach((v: any) => {
          initialExpanded[v.key] = true;
        });
        setExpandedVerticals(initialExpanded);
      } catch (err) {
        console.error('Failed to fetch verticals list', err);
      }
    };

    fetchCities();
    fetchVerticals();
  }, [selectedCity, setCity]);

  // Fetch active category slugs for city-based active service filtering
  useEffect(() => {
    const fetchActiveCategories = async () => {
      try {
        const res = await apiClient.get(`/search/categories?city=${selectedCity}&onlyAvailable=${onlyAvailable}`);
        const categories = res.data?.data || [];
        const slugs: string[] = [];
        categories.forEach((cat: any) => {
          slugs.push(cat.slug);
          cat.subcategories?.forEach((sub: any) => {
            slugs.push(sub.slug);
          });
        });
        setActiveCategorySlugs(slugs);
      } catch (err) {
        console.error('Failed to fetch active categories', err);
      }
    };
    fetchActiveCategories();
  }, [selectedCity, onlyAvailable]);

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
          businessType: businessType || '', 
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
  }, [selectedCity, selectedCategory, debouncedQuery, page, verifiedOnly, businessType, minRating, openNow]);

  // Fetch catalog items for search
  const fetchCatalogItems = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const res = await apiClient.get('/catalog/explore', {
        params: {
          citySlug: selectedCity,
          categorySlug: selectedCategory || undefined,
          searchQuery: debouncedQuery || undefined,
          page: reset ? 1 : page,
          limit: 10
        }
      });
      const newItems = res.data?.data || [];
      setCatalogItems(prev => reset ? newItems : [...prev, ...newItems]);
      setHasMore(newItems.length === 10);
    } catch (error) {
      console.error('Failed to fetch catalog items', error);
      if (reset) setCatalogItems([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCity, selectedCategory, debouncedQuery, page]);

  // Refetch when filters or tabs change
  useEffect(() => {
    if (searchTab === 'items') {
      fetchCatalogItems(true);
    } else {
      fetchItems(true);
    }
  }, [selectedCity, selectedCategory, debouncedQuery, verifiedOnly, businessType, minRating, openNow, searchTab, fetchItems, fetchCatalogItems]);

  // Load page
  useEffect(() => {
    if (page > 1) {
      if (searchTab === 'items') {
        fetchCatalogItems(false);
      } else {
        fetchItems(false);
      }
      const grid = document.getElementById('explore-grid');
      if (grid) grid.scrollIntoView({ behavior: 'smooth' });
    }
  }, [page, searchTab, fetchItems, fetchCatalogItems]);

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
      gradient: "bg-gradient-to-br from-indigo-950 via-slate-900 to-slate-950",
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
      gradient: "bg-gradient-to-br from-amber-950 via-indigo-950 to-slate-950",
      cta: isDualProfile ? (language === 'hi' ? 'डैशबोर्ड खोलें' : 'Open Dashboard') : t('joinProToday'),
      action: handleProCta
    }] : []),
    {
      title: t('value3Title'),
      desc: t('value3Desc'),
      badge: language === 'hi' ? 'सुरक्षा पहले' : 'Security First',
      gradient: "bg-gradient-to-br from-rose-950 via-[#311042] to-slate-950",
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
    const translated = t(keyMap[slug] || slug);
    if (translated === (keyMap[slug] || slug)) {
      for (const v of verticals) {
        const sub = v.subcategories?.find((s: any) => s.slug === slug);
        if (sub) return sub.label;
      }
    }
    return translated;
  };

  const getVerticalLabel = (vertical: any) => {
    const keyMap: Record<string, string> = {
      FOOD_BEVERAGE: 'foodAndDining',
      SALON_BEAUTY: 'salonBooking',
      HOME_ESSENTIALS: 'homeMaintenance',
      REAL_ESTATE: 'realEstate',
      TRAVEL: 'carRental',
      GROCERY: 'grocery'
    };
    const transKey = keyMap[vertical.key];
    if (transKey) {
      const translated = t(transKey as any);
      if (translated !== transKey) return translated;
    }
    return vertical.label;
  };

  const renderCategoryNavigation = () => {
    return (
      <div className="space-y-4">
        {/* Active Services Only Toggle */}
        <div className="flex items-center justify-between p-3 rounded-xl bg-zinc-50 border border-zinc-150">
          <div className="flex flex-col gap-0.5">
            <span className="text-xs font-extrabold text-zinc-700">
              {language === 'hi' ? 'केवल सक्रिय सेवाएं' : 'Active Services Only'}
            </span>
            <span className="text-[9px] text-zinc-400 font-semibold leading-none">
              {language === 'hi' ? 'वेंडर वाले वर्ग ही दिखाएं' : 'Hide empty categories'}
            </span>
          </div>
          <button
            onClick={() => setOnlyAvailable(prev => !prev)}
            className={`relative inline-flex h-5 w-9 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-250 ease-in-out focus:outline-hidden ${
              onlyAvailable ? 'bg-emerald-600' : 'bg-zinc-200'
            }`}
          >
            <span
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-xs ring-0 transition duration-250 ease-in-out ${
                onlyAvailable ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>

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

        {/* Loading Spinner */}
        {verticals.length === 0 && (
          <div className="p-6 text-zinc-400 text-center font-bold text-xs flex items-center justify-center gap-2 bg-zinc-50/50 rounded-xl border border-zinc-150">
            <Loader2 className="w-4 h-4 animate-spin text-zinc-400" />
            Loading Categories...
          </div>
        )}

        {/* Grouped Verticals (Dynamic) */}
        {verticals.map(vertical => {
          const filteredSubs = vertical.subcategories?.filter((sub: any) => 
            !onlyAvailable || activeCategorySlugs.includes(sub.slug)
          ) || [];

          if (onlyAvailable && filteredSubs.length === 0) return null;

          const isExpanded = expandedVerticals[vertical.key];
          return (
            <div key={vertical.key} className="border border-zinc-150 rounded-xl overflow-hidden bg-white shadow-xs">
              <button
                onClick={() => toggleVertical(vertical.key)}
                className="w-full flex items-center justify-between p-3.5 bg-zinc-50/50 hover:bg-zinc-50 border-b border-zinc-100 transition-colors"
              >
                <span className="flex items-center gap-2 text-xs font-extrabold text-zinc-700 tracking-wide uppercase">
                  <span>{VERTICAL_EMOJIS[vertical.key] || '🌐'}</span>
                  {getVerticalLabel(vertical)}
                </span>
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-zinc-400" />
                ) : (
                  <ChevronRight className="w-4 h-4 text-zinc-400" />
                )}
              </button>

              {isExpanded && (
                <div className="p-1 space-y-0.5 bg-white">
                  {filteredSubs.map((sub: any) => {
                    const isSelected = selectedCategory === sub.slug;
                    return (
                      <button
                        key={sub.slug}
                        onClick={() => {
                          setCategory(sub.slug);
                          setIsMobileFilterOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2.5 rounded-lg text-xs font-semibold flex items-center justify-between transition-colors ${
                          isSelected 
                            ? 'bg-primary/5 text-primary font-bold' 
                            : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
                        }`}
                      >
                        {getCategoryName(sub.slug)}
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
    <div 
      className="flex flex-col min-h-screen bg-[#020617] pb-24 font-sans text-white"
      style={{
        '--primary': searchMode === 'food' 
          ? '#e11d48' 
          : searchMode === 'retail' 
            ? '#0891b2' 
            : '#10b981'
      } as React.CSSProperties}
    >
      
      {/* ─── STICKY HEADER ─── */}
      <header className="sticky top-0 z-40 bg-background/95 border-b border-border px-4 py-3 shadow-xs backdrop-blur-xl">
        <div className="max-w-screen-2xl mx-auto flex items-center gap-3">
          
          {/* Unified Search Bar */}
          <div className="flex-1 flex items-center bg-card border border-border rounded-full shadow-sm overflow-hidden h-12 focus-within:ring-2 focus-within:ring-primary/20 focus-within:border-primary transition-all">
            
            {/* Location Section */}
            <button 
              onClick={() => setIsLocationModalOpen(true)}
              className="flex items-center gap-2 px-4 md:px-5 h-full bg-accent/20 hover:bg-accent transition-colors border-r border-border shrink-0 text-foreground"
            >
              <MapPin className="w-4 h-4 text-primary" />
              <span className="text-sm font-semibold text-foreground truncate max-w-[80px] md:max-w-[120px]">{getCityNameBySlug(selectedCity) || 'Location'}</span>
              <ChevronDown className="w-4 h-4 text-muted-foreground hidden sm:block" />
            </button>

            {/* Search Input Section */}
            <div className="flex-1 relative h-full flex items-center">
              <input 
                type="text"
                placeholder={t('searchPlaceholder')}
                className="w-full h-full pl-4 pr-10 text-sm outline-none bg-transparent text-foreground placeholder-muted-foreground"
                value={localQuery}
                onChange={(e) => setLocalQuery(e.target.value)}
              />
              {localQuery && (
                <button 
                  className="absolute right-3 text-muted-foreground hover:text-foreground bg-accent/40 hover:bg-accent p-1 rounded-full transition-colors"
                  onClick={() => setLocalQuery('')}
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Search Button (Desktop) */}
            <button className="hidden sm:flex h-full px-8 bg-primary hover:bg-primary/90 text-primary-foreground text-sm font-black transition-colors items-center justify-center">
              {language === 'hi' ? 'खोजें' : 'Search'}
            </button>

            {/* Search Button (Mobile Icon) */}
            <button className="sm:hidden h-full px-4 bg-primary hover:bg-primary/90 text-primary-foreground flex items-center justify-center transition-colors">
              <Search className="w-4 h-4" />
            </button>
          </div>

          {/* Mobile Filter Button */}
          <Drawer open={isMobileFilterOpen} onOpenChange={setIsMobileFilterOpen}>
            <DrawerTrigger asChild>
              <Button 
                variant="outline" 
                className="md:hidden shrink-0 rounded-full w-12 h-12 p-0 border-white/[0.08] text-white bg-[#0f172a] hover:bg-[#1e293b] shadow-sm"
              >
                <SlidersHorizontal className="w-5 h-5 text-white" />
              </Button>
            </DrawerTrigger>
            <DrawerContent className="p-5 max-h-[80vh] flex flex-col bg-[#0f172a] border-white/[0.08] text-white">
              <DrawerHeader className="px-0 pt-0 text-left border-b border-white/[0.05] pb-2.5 mb-4">
                <DrawerTitle className="text-base font-bold text-white">
                  {language === 'hi' ? 'श्रेणी से फ़िल्टर करें' : 'Filter by Category'}
                </DrawerTitle>
                <DrawerDescription className="text-xs text-zinc-400">
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
      <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6 flex gap-6 flex-1">
        
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
            <div className="relative w-full h-[220px] rounded-2xl overflow-hidden shadow-lg select-none group bg-zinc-950 border border-zinc-800 carousel">
              {slides.map((slide, index) => {
                const isActive = index === activeSlide;
                return (
                  <div
                    key={index}
                    onClick={slide.action}
                    className={`absolute inset-0 w-full h-full p-8 sm:px-10 flex flex-col justify-center items-start text-white transition-all duration-700 ease-in-out cursor-pointer transform ${
                      slide.gradient
                    } ${
                      isActive 
                        ? 'opacity-100 translate-x-0 scale-100 z-10 visible' 
                        : 'opacity-0 translate-x-4 scale-95 z-0 invisible pointer-events-none'
                    }`}
                  >
                    {/* Ambient glow effects */}
                    <div className="absolute -top-12 -right-12 w-72 h-72 bg-white/5 rounded-full blur-3xl pointer-events-none" />
                    
                    <div className="relative z-10 space-y-2">
                      <span className={`inline-flex items-center gap-1 text-[9px] uppercase tracking-widest font-black px-2.5 py-1 rounded-full border shadow-sm ${
                        index === 0 
                          ? 'bg-amber-500/15 border-amber-500/30 text-amber-300' 
                          : index === 1 
                            ? 'bg-emerald-500/15 border-emerald-500/30 text-emerald-300' 
                            : 'bg-indigo-500/15 border-indigo-500/30 text-indigo-300'
                      }`}>
                        {index === 0 && <span className="text-[10px]">👑</span>}
                        {index === 1 && <span className="text-[10px]">📢</span>}
                        {index === 2 && <span className="text-[10px]">⚡</span>}
                        {slide.badge}
                      </span>
                      <h2 className="text-xl sm:text-2xl lg:text-[26px] font-black tracking-tight leading-tight max-w-lg text-white">
                        {slide.title}
                      </h2>
                      <p className="text-xs sm:text-sm text-white/80 font-medium leading-relaxed max-w-md">
                        {slide.desc}
                      </p>
                      <button
                        onClick={(e) => { e.stopPropagation(); slide.action(); }}
                        className="mt-4 px-5 py-2.5 bg-white text-zinc-950 text-xs font-black rounded-xl shadow-md hover:shadow-lg hover:scale-105 active:scale-95 transition-all flex items-center gap-2 group/btn"
                      >
                        {slide.cta}
                        <ArrowRight className="w-4 h-4 group-hover/btn:translate-x-1 transition-transform" />
                      </button>
                    </div>
                  </div>
                );
              })}

              {/* Dots Indicators (mockup style) */}
              <div className="absolute bottom-4 right-10 flex gap-2 z-20">
                {slides.map((_, index) => (
                  <button
                    key={index}
                    onClick={() => setActiveSlide(index)}
                    className={`h-2 rounded-full transition-all duration-300 ${
                      index === activeSlide ? 'w-6 bg-white shadow-md' : 'w-2 bg-white/40 hover:bg-white/70'
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
              <div className="flex items-center justify-between text-xs text-zinc-400 font-bold border-b border-zinc-850 pb-3">
                <div className="flex items-center gap-2">
                  <span className="text-white text-sm font-extrabold">
                    {items.length} Results
                  </span>
                  {selectedCategory && (
                    <span className="bg-primary/5 text-primary border border-primary/10 px-2 py-0.5 rounded-md capitalize hidden sm:inline-block">
                      {getCategoryName(selectedCategory)}
                    </span>
                  )}
                </div>
                

                <div className="flex items-center gap-4">
                  <label className="flex items-center gap-2 cursor-pointer text-sm font-bold text-zinc-200 hover:text-white">
                    <input 
                      type="checkbox" 
                      className="rounded border-white/10 bg-zinc-900 text-primary focus:ring-primary h-4 w-4"
                      checked={verifiedOnly}
                      onChange={(e) => setVerifiedOnly(e.target.checked)}
                    />
                    Verified Pros Only
                  </label>
                  

                  <Drawer open={isAdvancedFilterOpen} onOpenChange={setIsAdvancedFilterOpen}>
                    <DrawerTrigger asChild>
                      <Button variant="outline" className="h-8 text-xs px-3 bg-zinc-900 border-zinc-800 rounded-md shadow-sm font-semibold text-zinc-200 hover:bg-zinc-800 hover:text-white flex items-center gap-2">
                        <SlidersHorizontal className="w-3.5 h-3.5" />
                        Filters
                        {(businessType || minRating || openNow) && (
                          <span className="flex h-2 w-2 rounded-full bg-primary" />
                        )}
                      </Button>
                    </DrawerTrigger>
                    <DrawerContent className="p-5 max-h-[90vh] flex flex-col bg-[#0f172a] border-t border-white/[0.08] text-white">
                      <DrawerHeader className="px-0 pt-0 text-left border-b border-white/[0.05] pb-3 mb-4">
                        <DrawerTitle className="text-lg font-black text-white">Advanced Filters</DrawerTitle>
                      </DrawerHeader>
                      <div className="flex-1 overflow-y-auto space-y-6 pb-6 px-1">
                        
                        <div className="space-y-3">
                          <h4 className="text-sm font-extrabold text-zinc-200">Business Model</h4>
                          <div className="grid grid-cols-2 gap-2">
                            {(() => {
                              const isProduction = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_APP_ENV === 'production';
                              return isProduction 
                                ? ['FOOD_BEVERAGE', 'SALON_BEAUTY']
                                : ['FOOD_BEVERAGE', 'SALON_BEAUTY', 'HOME_ESSENTIALS', 'CAB_TRANSPORT'];
                            })().map((bt) => (
                              <label key={bt} className="flex items-center gap-2 text-sm text-zinc-300 font-semibold hover:text-white cursor-pointer">
                                <input 
                                  type="checkbox" 
                                  className="rounded border-white/10 bg-zinc-900 text-primary focus:ring-primary h-4 w-4"
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
                          <h4 className="text-sm font-extrabold text-zinc-200">Minimum Rating</h4>
                          <div className="flex gap-3">
                            <label className="flex items-center gap-2 text-sm text-zinc-300 font-semibold hover:text-white cursor-pointer">
                              <input 
                                type="radio" 
                                name="minRating"
                                className="border-white/10 bg-zinc-900 text-primary focus:ring-primary"
                                checked={minRating === '4.0'}
                                onChange={() => setFilters({ minRating: '4.0' })}
                              />
                              4.0+ Stars
                            </label>
                            <label className="flex items-center gap-2 text-sm text-zinc-300 font-semibold hover:text-white cursor-pointer">
                              <input 
                                type="radio" 
                                name="minRating"
                                className="border-white/10 bg-zinc-900 text-primary focus:ring-primary"
                                checked={minRating === '3.0'}
                                onChange={() => setFilters({ minRating: '3.0' })}
                              />
                              3.0+ Stars
                            </label>
                            <label className="flex items-center gap-2 text-sm text-zinc-300 font-semibold hover:text-white cursor-pointer">
                              <input 
                                type="radio" 
                                name="minRating"
                                className="border-white/10 bg-zinc-900 text-primary focus:ring-primary"
                                checked={minRating === ''}
                                onChange={() => setFilters({ minRating: '' })}
                              />
                              Any
                            </label>
                          </div>
                        </div>

                        {/* Open Now Toggle */}
                        <div className="space-y-3 pt-2">
                          <label className="flex items-center justify-between text-sm font-extrabold text-zinc-200 cursor-pointer">
                            <span>Open Now</span>
                            <input 
                              type="checkbox" 
                              className="w-10 h-5 bg-zinc-800 border border-white/5 rounded-full appearance-none checked:bg-primary transition-colors cursor-pointer relative before:content-[''] before:absolute before:w-4 before:h-4 before:bg-white before:rounded-full before:left-0.5 before:top-0.5 checked:before:translate-x-5 before:transition-transform"
                              checked={openNow}
                              onChange={(e) => setFilters({ openNow: e.target.checked })}
                            />
                          </label>
                          <p className="text-xs text-zinc-400 font-medium">Only show pros who are currently accepting bookings.</p>
                        </div>

                      </div>
                      
                      <div className="border-t border-white/[0.05] pt-4 flex gap-3">
                        <Button 
                          variant="outline" 
                          className="flex-1 border-white/10 bg-transparent text-zinc-300 hover:bg-white/[0.04] hover:text-white"
                          onClick={() => setFilters({ businessType: '', minRating: '', openNow: false })}
                        >
                          Clear
                        </Button>
                        <Button 
                          className="flex-1 bg-primary text-emerald-950 font-black hover:bg-primary/90"
                          onClick={() => setIsAdvancedFilterOpen(false)}
                        >
                          Apply Filters
                        </Button>
                      </div>
                    </DrawerContent>
                  </Drawer>

                  {searchMode === 'service' && (
                    <button
                      onClick={() => setShowRadarMap(!showRadarMap)}
                      className={`h-9 px-4.5 text-xs font-bold rounded-xl border transition-all flex items-center gap-1.5 shadow-sm active:scale-95 ${
                        showRadarMap
                          ? 'bg-primary border-primary text-primary-foreground font-black'
                          : 'bg-card border-border hover:bg-accent text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <Compass className={`w-4 h-4 ${showRadarMap ? 'animate-spin' : ''}`} style={{ animationDuration: '6s' }} />
                      {showRadarMap ? 'Close Map' : 'Radar Map'}
                    </button>
                  )}

                  <div className="h-4 w-px bg-border hidden sm:block"></div>
                  <div className="flex items-center gap-3">
                    <span className="hidden sm:inline-block text-muted-foreground text-[10px] font-bold uppercase tracking-wider">View By</span>
                    <div className="flex items-center bg-card rounded-lg p-1 border border-border shadow-inner">
                      <button 
                        onClick={() => setViewMode('grid')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                          viewMode === 'grid' 
                            ? 'bg-accent text-accent-foreground shadow-sm font-extrabold' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                        }`}
                      >
                        <span className="hidden sm:inline">Grid</span>
                        <LayoutGrid className="w-4 h-4" />
                      </button>
                      <button 
                        onClick={() => setViewMode('list')}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md transition-all ${
                          viewMode === 'list' 
                            ? 'bg-accent text-accent-foreground shadow-sm font-extrabold' 
                            : 'text-muted-foreground hover:text-foreground hover:bg-accent'
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
              // Skeleton Loaders matching ListingCard
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs animate-pulse flex flex-col h-[280px]">
                    <div className="h-36 bg-zinc-100 w-full border-b border-zinc-100" />
                    <div className="p-4 flex gap-3 flex-1">
                      <div className="h-14 w-14 bg-zinc-100 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-3">
                        <div className="space-y-2">
                          <div className="h-4.5 bg-zinc-100 rounded w-3/4" />
                          <div className="flex gap-2">
                            <div className="h-4 bg-zinc-150 rounded w-16" />
                            <div className="h-4 bg-zinc-100 rounded w-20" />
                          </div>
                        </div>
                        <div className="h-3.5 bg-zinc-100 rounded w-1/2" />
                      </div>
                    </div>
                    <div className="mt-auto border-t border-zinc-100 p-3 flex gap-2">
                      <div className="h-9 bg-zinc-100 rounded-xl flex-1" />
                      <div className="h-9 bg-zinc-100 rounded-xl flex-1" />
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
              // Search Criteria Empty State (Redesigned)
              <div className="flex flex-col items-center justify-center py-16 text-center px-4 max-w-lg mx-auto space-y-6">
                <div className="w-16 h-16 bg-zinc-900 rounded-full flex items-center justify-center mx-auto shadow-md border border-zinc-800 animate-pulse">
                  <Search className="w-6 h-6 text-zinc-400" />
                </div>
                <div>
                  <h3 className="text-xl font-black text-white">{t('noResults')}</h3>
                  <p className="text-zinc-400 text-xs sm:text-sm mt-2 max-w-sm mx-auto leading-relaxed">
                    {language === 'hi' 
                      ? `हम जल्द ही आ रहे हैं! वर्तमान में हमारे पास ${getCityNameBySlug(selectedCity)} में इस श्रेणी के अंतर्गत कोई सूचीबद्ध व्यवसाय नहीं है।`
                      : `Currently, we don't have any businesses listed under this category in ${getCityNameBySlug(selectedCity)}, but we are expanding soon!`}
                  </p>
                </div>
                
                <div className="bg-[#0f172a] border border-cyan-500/10 rounded-2xl p-5 text-xs text-zinc-350 leading-relaxed font-semibold shadow-inner space-y-4 w-full">
                  <div className="flex items-start gap-2.5 text-left">
                    <span className="text-base shrink-0">💡</span>
                    <div>
                      <p className="font-bold text-white mb-1">
                        {language === 'hi' ? 'क्या आप एक ग्राहक हैं?' : 'Are you looking for this service?'}
                      </p>
                      <p className="text-zinc-400 font-medium">
                        {language === 'hi' 
                          ? 'आप हमारी मुख्य स्क्रीन पर इस सेवा के लिए अनुरोध (RFQ) पोस्ट कर सकते हैं ताकि स्थानीय वेंडर्स आपसे सीधे संपर्क कर सकें।' 
                          : 'You can post a requirement (RFQ) on our home screen to let verified local pros reach out to you directly.'}
                      </p>
                    </div>
                  </div>
                  <div className="h-px bg-zinc-800/80 w-full" />
                  <div className="flex items-start gap-2.5 text-left">
                    <span className="text-base shrink-0">💼</span>
                    <div>
                      <p className="font-bold text-white mb-1">
                        {language === 'hi' ? 'क्या आप एक स्थानीय व्यवसायी हैं?' : 'Are you a local vendor?'}
                      </p>
                      <p className="text-zinc-400 font-medium">
                        {language === 'hi' 
                          ? 'आज ही अपना व्यवसाय मुफ़्त में सूचीबद्ध करें और अपने स्थानीय क्षेत्र से सीधे ग्राहक लीड्स प्राप्त करें!' 
                          : 'List your business for free today and start receiving direct customer leads from your area!'}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-3 w-full justify-center">
                  <Button 
                    onClick={() => router.push('/')} 
                    className="rounded-xl h-11 font-black text-xs px-6 bg-emerald-600 hover:bg-emerald-700 text-white w-full sm:w-auto shadow-md"
                  >
                    {language === 'hi' ? 'अनुरोध (RFQ) पोस्ट करें' : 'Post Requirement (RFQ)'}
                  </Button>
                  <Button 
                    onClick={() => router.push('/pro')} 
                    variant="outline" 
                    className="rounded-xl h-11 font-bold text-xs px-6 border-zinc-750 text-zinc-300 hover:bg-zinc-800 w-full sm:w-auto hover:text-white"
                  >
                    {language === 'hi' ? 'व्यवसाय सूचीबद्ध करें' : 'Join as Partner / Pro'}
                  </Button>
                  <Button 
                    onClick={() => setCategory('')} 
                    variant="ghost" 
                    className="rounded-xl h-11 font-bold text-xs text-zinc-400 hover:text-white w-full sm:w-auto"
                  >
                    {language === 'hi' ? 'श्रेणी साफ़ करें' : 'Clear Filter'}
                  </Button>
                </div>
              </div>
            ) : (
              // Product Grid Layout
              <div className="flex flex-col xl:flex-row gap-6 items-start">
                <div className="flex-1 w-full min-w-0">
                  
                  {/* Domain Tab Selector (Food & Retail) */}
                  {(searchMode === 'food' || searchMode === 'retail') && (
                    <div className="flex border-b border-zinc-200 gap-6 mb-5">
                      <button
                        onClick={() => setSearchTab('vendors')}
                        className={`pb-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                          searchTab === 'vendors'
                            ? 'border-primary text-zinc-955 font-black'
                            : 'border-transparent text-zinc-400 hover:text-zinc-650'
                        }`}
                      >
                        {searchMode === 'food' ? 'Restaurants & Cafes' : 'Shops & Supermarkets'}
                      </button>
                      <button
                        onClick={() => setSearchTab('items')}
                        className={`pb-3.5 text-sm font-bold border-b-2 transition-all cursor-pointer ${
                          searchTab === 'items'
                            ? 'border-primary text-zinc-955 font-black'
                            : 'border-transparent text-zinc-400 hover:text-zinc-650'
                        }`}
                      >
                        {searchMode === 'food' ? 'Dishes & Meals' : 'Products & Goods'}
                      </button>
                    </div>
                  )}

                  {/* Filter Chips (Hidden when searching specific items) */}
                  {searchTab === 'vendors' && (
                    <div className="flex flex-wrap items-center gap-2 mb-4">
                      <button
                        onClick={() => setVerifiedOnly(!verifiedOnly)}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          verifiedOnly
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-1 ring-emerald-500'
                            : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {verifiedOnly && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        Verified Only
                      </button>

                      <button
                        onClick={() => setFilters({ openNow: !openNow })}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          openNow
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-1 ring-emerald-500'
                            : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {openNow && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        Open Now
                      </button>

                      <button
                        onClick={() => setFilters({ minRating: minRating === '4.0' ? '' : '4.0' })}
                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold border transition-all ${
                          minRating === '4.0'
                            ? 'bg-emerald-50 border-emerald-500 text-emerald-700 shadow-sm ring-1 ring-emerald-500'
                            : 'bg-white border-zinc-200 text-zinc-600 hover:bg-zinc-50'
                        }`}
                      >
                        {minRating === '4.0' && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        Top Rated (4.0+)
                      </button>

                      {(verifiedOnly || openNow || minRating) && (
                        <button
                          onClick={() => {
                            setVerifiedOnly(false);
                            setFilters({ minRating: '', openNow: false });
                          }}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold text-zinc-555 hover:text-zinc-900 hover:bg-zinc-100 transition-all border border-transparent"
                        >
                          Clear All
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  )}

                  {/* Proximity Map Overlay */}
                  {showRadarMap && searchMode === 'service' && (
                    <div className="mb-6 animate-in fade-in zoom-in-98 duration-300">
                      <ProximityMap 
                        items={items as any[]} 
                        cityName={getCityNameBySlug(selectedCity)} 
                        onClose={() => setShowRadarMap(false)} 
                      />
                    </div>
                  )}

                  {searchTab === 'items' ? (
                    // Dishes / Products Search Grid
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                      {catalogItems.length === 0 && !loading ? (
                        <div className="col-span-2 py-16 text-center text-zinc-400 font-bold text-xs border border-dashed rounded-3xl border-zinc-200 bg-white">
                          No dishes or products match your search.
                        </div>
                      ) : (
                        catalogItems.map((item, i) => (
                          searchMode === 'food' ? (
                            <FoodDishCard key={`${item.id}-${i}`} dish={item} />
                          ) : (
                            <RetailProductCard key={`${item.id}-${i}`} product={item} />
                          )
                        ))
                      )}
                    </div>
                  ) : (
                    // Regular Listings (Vendors) Grid
                    <div className={
                      viewMode === 'list'
                        ? "flex flex-col gap-4"
                        : "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4"
                    }>
                      {items.map((vendor, i) => (
                        <SearchCardSelector 
                          key={`${vendor.id}-${i}`} 
                          listing={vendor as any} 
                          mode={searchMode}
                          onBookTrigger={(listing) => {
                            setSelectedBookVendor(listing);
                            setIsBookingOpen(true);
                          }}
                        />
                      ))}
                    </div>
                  )}
                  
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

      {/* ─── QUICK BOOKING & CART DRAWER OVERLAYS ─── */}
      <QuickBookingDrawer
        vendor={selectedBookVendor}
        isOpen={isBookingOpen}
        onClose={() => {
          setIsBookingOpen(false);
          setSelectedBookVendor(null);
        }}
      />

      {(() => {
        const activeCartItem = cartItems[0];
        const cartVendor = activeCartItem 
          ? ((activeCartItem.catalogItem as any).businessProfile || { id: vendorId, businessName: 'Storefront', metaData: {} })
          : vendorId ? { id: vendorId, businessName: 'Storefront', metaData: {} } : null;
        
        const mockCartTheme = {
          colors: {
            primary: searchMode === 'food' ? 'bg-rose-600' : 'bg-zinc-900',
          }
        };

        return cartVendor ? (
          <CartDrawer
            vendor={cartVendor as any}
            theme={mockCartTheme}
          />
        ) : null;
      })()}

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

export default function ExplorePage() {
  return (
    <Suspense fallback={null}>
      <ExplorePageContent />
    </Suspense>
  );
}
