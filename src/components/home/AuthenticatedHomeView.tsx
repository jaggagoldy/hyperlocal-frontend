'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Search, 
  Sparkles, 
  ArrowRight, 
  Phone, 
  CheckCircle2, 
  Building,
  Car,
  Scissors,
  Wrench,
  ChevronRight,
  ShieldCheck,
  Zap,
  Users,
  Megaphone,
  Star,
  Loader2,
  Utensils
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/translations';
import { useSearchStore } from '@/store/searchStore';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { ServiceSidebar } from '@/components/shared/ServiceSidebar';
import { useAuthStore } from '@/store/authStore';
import { AuthModal } from '@/components/shared/AuthModal';
import Link from 'next/link';
import Image from 'next/image';

export function AuthenticatedHomeView() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { selectedCity, setCity, setCategory } = useSearchStore();
  const { user } = useAuthStore();
  
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [pendingRfq, setPendingRfq] = useState(false);
  
  // List of cities fetched dynamically
  const [cities, setCities] = useState<any[]>([]);

  // Live Search state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  // RFQ form state
  const [rfqName, setRfqName] = useState('');
  const [rfqPhone, setRfqPhone] = useState('');
  const [rfqCategory, setRfqCategory] = useState('');
  const [rfqLocation, setRfqLocation] = useState('');
  const [rfqDetails, setRfqDetails] = useState('');
  const [isSubmittingRfq, setIsSubmittingRfq] = useState(false);
  
  // Showcase vendors state
  const [showcaseItems, setShowcaseItems] = useState<any[]>([]);
  const [loadingShowcase, setLoadingShowcase] = useState(true);

  // Fetch cities and showcase items on mount
  useEffect(() => {
    const initPage = async () => {
      try {
        const [citiesRes, catalogRes] = await Promise.all([
          apiClient.get('/search/cities'),
          apiClient.get('/catalog/explore', { params: { limit: 6 } })
        ]);
        
        const fetchedCities = citiesRes.data?.data || [];
        const filteredCities = fetchedCities.filter((c: any) =>
          ['fatehabad', 'hisar', 'sirsa'].includes(c.slug.toLowerCase())
        );
        setCities(filteredCities);
        
        // Ensure selectedCity is one of the valid Haryana cities
        if (filteredCities.length > 0 && !filteredCities.some((c: any) => c.slug === selectedCity)) {
          setCity(filteredCities[0].slug);
        }

        setShowcaseItems(catalogRes.data?.data || []);
      } catch (err) {
        console.error('Failed to initialize homepage data', err);
      } finally {
        setLoadingShowcase(false);
      }
    };
    initPage();
  }, [selectedCity, setCity]);

  // Live Search Effect
  useEffect(() => {
    const fetchSearchResults = async () => {
      if (!searchQuery.trim()) {
        setSearchResults([]);
        return;
      }
      setIsSearching(true);
      try {
        const res = await apiClient.get('/catalog/explore', { 
          params: { q: searchQuery, citySlug: selectedCity, limit: 5 } 
        });
        setSearchResults(res.data?.data || []);
      } catch (err) {
        console.error('Search failed', err);
      } finally {
        setIsSearching(false);
      }
    };

    const debounceTimer = setTimeout(fetchSearchResults, 300);
    return () => clearTimeout(debounceTimer);
  }, [searchQuery, selectedCity]);

  // Handle click outside search dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const [currentAdIndex, setCurrentAdIndex] = useState(0);

  const heroAds = [
    {
      badge: language === 'hi' ? 'वोकल फॉर लोकल' : 'Vocal for Local',
      title: t('heroTitle'),
      subtitle: t('heroSubtitle'),
      icon: Sparkles
    },
    {
      badge: 'PROMOTED',
      title: 'Get 50% Off on AC Repair Services Today!',
      subtitle: 'Book top-rated AC mechanics directly. No commission, 100% verified professionals.',
      icon: Zap
    },
    {
      badge: 'SPECIAL OFFER',
      title: 'Looking for Real Estate Agents?',
      subtitle: 'Find the best local agents for your property. Connect directly via WhatsApp.',
      icon: MapPin
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentAdIndex((prev) => (prev + 1) % heroAds.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [heroAds.length]);

  const handleHeroSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(`/explore?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/explore');
    }
  };

  const handleVerticalClick = (catSlug: string) => {
    setCategory(catSlug);
    router.push('/explore');
  };

  const handleRfqSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();

    if (!user) {
      setPendingRfq(true);
      setIsAuthModalOpen(true);
      return;
    }

    if (!rfqName.trim() || !rfqPhone.trim() || !rfqCategory || !rfqLocation.trim()) {
      toast.error(language === 'hi' ? 'कृपया सभी आवश्यक फ़ील्ड भरें।' : 'Please fill all required fields.');
      return;
    }

    if (rfqName.trim().length < 2) {
      toast.error(language === 'hi' ? 'कृपया एक वैध नाम दर्ज करें (कम से कम 2 अक्षर)।' : 'Please enter a valid name (at least 2 characters).');
      return;
    }

    if (!/^[6-9]\d{9}$/.test(rfqPhone)) {
      toast.error(language === 'hi' ? 'कृपया एक वैध 10-अंकीय भारतीय मोबाइल नंबर दर्ज करें।' : 'Please enter a valid 10-digit Indian mobile number.');
      return;
    }

    try {
      setIsSubmittingRfq(true);
      
      const categoryMapping: Record<string, string> = {
        'electrician': 'repairs-services',
        'plumber': 'repairs-services',
        'ac-repair': 'repairs-services',
        'carpenter': 'repairs-services',
        'ro-repair': 'repairs-services',
        'painter': 'home-services',
        'car-rental': 'cab-transport',
        'salon-booking': 'salon-beauty',
        'real-estate': 'real-estate',
        'restaurant-cafe': 'restaurant-cafe'
      };
      const dbCategorySlug = categoryMapping[rfqCategory] || rfqCategory;

      let catalogItemId = '';
      const resLocal = await apiClient.get('/catalog/explore', {
        params: { citySlug: selectedCity, categorySlug: dbCategorySlug, limit: 1 }
      });

      if (resLocal.data?.data?.[0]) {
        catalogItemId = resLocal.data.data[0].id;
      } else {
        const resAny = await apiClient.get('/catalog/explore', {
          params: { categorySlug: dbCategorySlug, limit: 1 }
        });
        if (resAny.data?.data?.[0]) {
          catalogItemId = resAny.data.data[0].id;
        }
      }
      
      await apiClient.post('/catalog/enquire', {
        catalogItemId: catalogItemId || '',
        customerName: rfqName,
        customerPhone: rfqPhone,
        customerRequirement: `[${rfqLocation}] ${rfqDetails || 'General Inquiry'}`,
      });

      toast.success(t('rfqSuccess'));
      setRfqName('');
      setRfqPhone('');
      setRfqCategory('');
      setRfqLocation('');
      setRfqDetails('');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to submit request');
    } finally {
      setIsSubmittingRfq(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary/30">
      
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => {
          setIsAuthModalOpen(false);
          setPendingRfq(false);
        }} 
        onSuccess={() => {
          setIsAuthModalOpen(false);
          if (pendingRfq) {
            setPendingRfq(false);
            handleRfqSubmit();
          }
        }} 
      />

      {/* ─── HERO SECTION ─── */}
      <div className="absolute top-[5%] left-[-150px] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-150px] w-[600px] h-[600px] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16 space-y-16">
        
        {/* ─── HERO & HEADER SEARCH SECTION ─── */}
        <section className="text-center max-w-4xl mx-auto space-y-6 relative z-30 min-h-[160px]">
          <div key={currentAdIndex} className="animate-in fade-in slide-in-from-bottom-2 duration-500">
            <span className="inline-flex bg-primary/10 text-primary border border-primary/20 text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full items-center gap-1.5 mb-6">
              {(() => {
                const Icon = heroAds[currentAdIndex].icon;
                return <Icon className="w-3.5 h-3.5" />;
              })()}
              {heroAds[currentAdIndex].badge}
            </span>
            
            <h1 
              className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 leading-tight mb-6"
              style={{ fontFamily: 'Outfit, sans-serif' }}
            >
              {heroAds[currentAdIndex].title}
            </h1>
            
            <p className="text-xs sm:text-sm md:text-base text-zinc-500 max-w-2xl mx-auto leading-relaxed font-semibold">
              {heroAds[currentAdIndex].subtitle}
            </p>
          </div>

          {/* Quick Location & Search Banner Bar */}
          <div className="relative max-w-2xl mx-auto mt-8" ref={searchContainerRef}>
            <form onSubmit={handleHeroSearchSubmit} className="bg-white border border-zinc-200 rounded-2xl shadow-lg shadow-zinc-200/50 p-2 flex flex-col sm:flex-row items-center gap-2">
              <div className="flex items-center gap-1.5 w-full sm:w-1/3 px-3 py-2 border-b sm:border-b-0 sm:border-r border-zinc-200">
                <MapPin className="w-4 h-4 text-primary" />
                <select
                  value={selectedCity}
                  onChange={(e) => setCity(e.target.value)}
                  className="bg-transparent border-none outline-none font-bold text-xs sm:text-sm text-zinc-800 w-full cursor-pointer appearance-none"
                >
                  {cities.map((city) => (
                    <option key={city.slug} value={city.slug}>{city.name}</option>
                  ))}
                </select>
              </div>
              
              <div className="flex items-center gap-1.5 w-full sm:w-2/3 px-3 py-2 relative">
                <Search className="w-4 h-4 text-zinc-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setShowSearchDropdown(true);
                  }}
                  onFocus={() => setShowSearchDropdown(true)}
                  placeholder={t('searchPlaceholder')}
                  className="bg-transparent border-none outline-none text-xs sm:text-sm text-zinc-800 w-full"
                />
                {isSearching && <Loader2 className="w-4 h-4 text-zinc-400 animate-spin absolute right-3" />}
              </div>
              
              <Button 
                type="submit" 
                className="w-full sm:w-auto h-10 px-6 rounded-xl bg-primary text-white font-bold text-xs shrink-0 shadow-sm"
              >
                {language === 'hi' ? 'खोजें' : 'Search'}
              </Button>
            </form>

            {/* Live Search Dropdown */}
            {showSearchDropdown && searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 w-full mt-2 bg-white rounded-2xl shadow-xl border border-zinc-200 overflow-hidden z-50 flex flex-col">
                {searchResults.length > 0 ? (
                  <div className="py-2">
                    <div className="px-4 py-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider bg-zinc-50 border-b border-zinc-100">
                      Top Results in {cities.find(c => c.slug === selectedCity)?.name || selectedCity}
                    </div>
                    {searchResults.map((item) => (
                      <div 
                        key={item.id} 
                        onClick={() => router.push(`/explore?q=${encodeURIComponent(item.title)}`)}
                        className="px-4 py-3 flex items-center gap-3 hover:bg-zinc-50 cursor-pointer transition-colors border-b border-zinc-100 last:border-0"
                      >
                        <div className="w-10 h-10 rounded-lg bg-zinc-100 overflow-hidden shrink-0 relative flex items-center justify-center">
                          {item.mediaUrl ? (
                            <Image src={item.mediaUrl} alt={item.title} fill className="object-cover" />
                          ) : (
                            <Search className="w-4 h-4 text-zinc-400" />
                          )}
                        </div>
                        <div>
                          <div className="text-sm font-bold text-zinc-900 flex items-center gap-2">
                            {item.title}
                            {item.vendor?.businessType === 'FOOD_BEVERAGE' && (
                              <span className="bg-orange-100 text-orange-700 border-orange-200 border px-1.5 py-0.5 rounded text-[10px] font-bold">Food</span>
                            )}
                            {item.vendor?.businessType === 'CAB_TRANSPORT' && (
                              <span className="bg-blue-100 text-blue-700 border-blue-200 border px-1.5 py-0.5 rounded text-[10px] font-bold">Cab</span>
                            )}
                            {(item.vendor?.businessType === 'HOME_ESSENTIALS' || item.vendor?.businessType === 'SALON_BEAUTY' || item.vendor?.businessType === 'HOME_ESSENTIALS') && (
                              <span className="bg-purple-100 text-purple-700 border-purple-200 border px-1.5 py-0.5 rounded text-[10px] font-bold">Service</span>
                            )}
                          </div>
                          <div className="text-xs text-zinc-500">{item.vendor?.businessName}</div>
                        </div>
                      </div>
                    ))}
                    <div 
                      onClick={() => router.push(`/explore?q=${encodeURIComponent(searchQuery)}`)}
                      className="px-4 py-3 text-xs font-bold text-primary hover:bg-primary/5 cursor-pointer flex items-center justify-center gap-1"
                    >
                      View all results <ArrowRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                ) : (
                  !isSearching && (
                    <div className="p-6 text-center text-sm text-zinc-500">
                      No results found for "{searchQuery}"
                    </div>
                  )
                )}
              </div>
            )}
          </div>
        </section>

        {/* ─── MARKETPLACE VERTICALS GRID ─── */}
        <section className="space-y-6 relative z-10">
          <div className="text-center space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
              {t('verticalsTitle')}
            </h2>
            <p className="text-xs text-zinc-500 font-bold max-w-md mx-auto">
              {t('verticalsSubtitle')}
            </p>
          </div>

          {(() => {
            const isProduction = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_APP_ENV === 'production';
            return (
              <div className={`grid grid-cols-2 gap-4 ${isProduction ? 'md:grid-cols-2 max-w-2xl mx-auto' : 'md:grid-cols-4'}`}>
                {(() => {
                  return [
                    ...(isProduction ? [] : [
                      { id: 'electrician', name: t('homeMaintenance'), icon: Wrench, count: 6, gradient: 'from-blue-500 to-indigo-600' },
                      { id: 'car-rental', name: t('carRental'), icon: Car, count: 2, gradient: 'from-teal-500 to-emerald-600' },
                    ]),
                    ...(isProduction ? [
                      { id: 'restaurant-cafe', name: language === 'hi' ? 'रेस्टोरेंट और कैफ़े' : 'Restaurant & Cafe', icon: Utensils, count: 1, gradient: 'from-orange-500 to-red-600' }
                    ] : []),
                    { id: 'salon-booking', name: t('salonBooking'), icon: Scissors, count: 2, gradient: 'from-rose-500 to-pink-600' },
                    ...(isProduction ? [] : [
                      { id: 'real-estate', name: t('realEstate'), icon: Building, count: 1, gradient: 'from-amber-500 to-orange-600' }
                    ])
                  ];
                })().map(vert => (
                  <div 
                    key={vert.id}
                    onClick={() => handleVerticalClick(vert.id)}
                    className="group bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm hover:shadow-lg hover:border-primary/20 hover:scale-[1.02] cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[160px]"
                  >
                    <div className={`w-11 h-11 shrink-0 rounded-xl bg-gradient-to-br ${vert.gradient} text-white flex items-center justify-center shadow-xs transition-transform group-hover:scale-105`}>
                      <vert.icon className="w-5.5 h-5.5" />
                    </div>
                    <div className="mt-4">
                      <h3 className="font-extrabold text-zinc-800 text-sm group-hover:text-primary transition-colors whitespace-normal leading-tight">
                        {vert.name}
                      </h3>
                      <div className="flex items-center justify-between text-[10px] text-zinc-400 mt-2 font-bold">
                        <span>{vert.count} PROS ACTIVE</span>
                        <ChevronRight className="w-4 h-4 text-zinc-300 shrink-0 group-hover:text-primary transition-colors group-hover:translate-x-0.5" />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            );
          })()}
        </section>

        {/* ─── VERIFIED PROS CAROUSEL SHOWCASE ─── */}
        {!loadingShowcase && showcaseItems.length > 0 && (
          <section className="space-y-6 relative z-10">
            <div className="flex items-end justify-between border-b border-zinc-200 pb-2">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-zinc-900 tracking-tight">
                  {t('topRatedTitle')}
                </h2>
                <p className="text-[10px] sm:text-xs text-zinc-500 font-bold">
                  {t('topRatedSubtitle')}
                </p>
              </div>
              <Link 
                href="/explore" 
                className="text-xs font-black text-primary hover:text-primary/80 flex items-center gap-0.5 shrink-0"
              >
                {language === 'hi' ? 'सभी देखें' : 'View All'}
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex overflow-x-auto gap-4 pb-6 custom-scrollbar -mx-4 px-4">
              {showcaseItems.map((item, i) => (
                <div 
                  key={i} 
                  className="bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow shrink-0 w-64 flex flex-col justify-between min-h-[192px]"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-emerald-100 flex items-center gap-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 fill-emerald-500 text-white" />
                        {t('verified')}
                      </span>
                      {item.vendor?.rating > 0 && (
                        <div className="flex items-center gap-0.5 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-extrabold border border-amber-100">
                          <Star className="w-3 h-3 fill-current" />
                          {item.vendor.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-extrabold text-zinc-900 text-sm whitespace-normal leading-tight">{item.title}</h3>
                    <p className="text-[11px] font-semibold text-zinc-500 whitespace-normal leading-tight">{item.vendor?.businessName}</p>
                    <p className="text-[11px] text-zinc-400 font-medium line-clamp-2 leading-relaxed">
                      {item.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-2">
                    <ServiceSidebar item={item} vendorName={item.vendor?.businessName || 'the provider'} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── VALUE PROPOSITION CARDS (Zero-Brokerage / Direct Connect) ─── */}
        <section className="max-w-6xl mx-auto px-4 lg:px-0 mb-8">
          <div className="bg-white border border-zinc-200 rounded-3xl p-8 sm:p-10 relative overflow-hidden shadow-xl shadow-zinc-200/40">
            <div className="absolute top-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
            <div className="flex-1 text-center lg:text-left space-y-4">
              <span className="inline-flex bg-primary/10 text-primary text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded border border-primary/20">
                Local B2B2C Mission
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight text-zinc-900">
                {t('valueTitle')}
              </h2>
              <p className="text-zinc-500 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
                Helping small local businesses survive and scale without paying 20-30% commissions on third-party aggregators. Keep 100% of your earnings.
              </p>
              <Link href="/vendor/register" className="inline-block pt-2">
                <Button className="bg-zinc-900 text-white hover:bg-zinc-800 font-black text-xs h-11 px-6 rounded-xl gap-1">
                  {t('joinProToday')}
                  <ArrowRight className="w-4 h-4 text-white" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-[1.5] w-full">
              {[
                { title: t('value1Title'), desc: t('value1Desc'), icon: Phone, color: 'text-emerald-500 bg-emerald-50 border-emerald-100' },
                { title: t('value2Title'), desc: t('value2Desc'), icon: Zap, color: 'text-rose-500 bg-rose-50 border-rose-100' },
                { title: t('value3Title'), desc: t('value3Desc'), icon: Users, color: 'text-indigo-500 bg-indigo-50 border-indigo-100' }
              ].map((val, idx) => (
                <div key={idx} className="bg-white border border-zinc-100 rounded-2xl p-5 space-y-3 shadow-sm hover:shadow-md transition-shadow">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center border ${val.color}`}>
                    <val.icon className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-zinc-800">{val.title}</h3>
                  <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">{val.desc}</p>
                </div>
              ))}
            </div>
          </div>
          </div>
        </section>


        {/* ─── INDIAMART STYLE INSTANT REQUIREMENT BOARD (RFQ) ─── */}
        <section className="relative z-10 max-w-6xl mx-auto mb-20 px-4 lg:px-0">
          {/* Mobile Trust Strip */}
          <div className="lg:hidden flex overflow-x-auto gap-3 pb-3 mb-2 scrollbar-none snap-x px-1">
            <div className="snap-start shrink-0 flex items-center gap-1.5 bg-white border border-zinc-200 px-3 py-1.5 rounded-full text-[10px] font-bold text-zinc-700 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> {language === 'hi' ? '100% सत्यापित प्रो' : '100% Verified Pros'}
            </div>
            <div className="snap-start shrink-0 flex items-center gap-1.5 bg-white border border-zinc-200 px-3 py-1.5 rounded-full text-[10px] font-bold text-zinc-700 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {language === 'hi' ? 'शून्य कमीशन' : 'Zero Commission'}
            </div>
            <div className="snap-start shrink-0 flex items-center gap-1.5 bg-white border border-zinc-200 px-3 py-1.5 rounded-full text-[10px] font-bold text-zinc-700 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> {language === 'hi' ? 'तुरंत व्हाट्सएप' : 'Instant WhatsApp'}
            </div>
          </div>

          <div className="bg-white border border-zinc-200 rounded-3xl shadow-xl relative overflow-hidden">
            {/* Ambient primary glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              
              {/* Left Column: The Form (col-span-7) */}
              <div className="p-6 sm:p-8 lg:col-span-7 space-y-6 flex flex-col justify-between">
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-black text-zinc-900 tracking-tight flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-primary" />
                    {t('rfqTitle')}
                  </h2>
                  <p className="text-zinc-500 text-xs font-medium">
                    {t('rfqSubtitle')}
                  </p>
                </div>

                <form onSubmit={handleRfqSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Your Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                        {language === 'hi' ? 'आपका नाम *' : 'Your Name *'}
                      </label>
                      <Input
                        placeholder="e.g. Rahul Sharma"
                        required
                        maxLength={50}
                        className="h-11 rounded-xl bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 text-xs focus-visible:ring-primary"
                        value={rfqName}
                        onChange={(e) => setRfqName(e.target.value.substring(0, 50))}
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                        {t('rfqPhone')} *
                      </label>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="e.g. 9876543210"
                        required
                        maxLength={10}
                        className="h-11 rounded-xl bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 text-xs focus-visible:ring-primary"
                        value={rfqPhone}
                        onChange={(e) => setRfqPhone(e.target.value.replace(/\D/g, '').substring(0, 10))}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                        {t('rfqCategory')} *
                      </label>
                      <select
                        required
                        value={rfqCategory}
                        onChange={(e) => setRfqCategory(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                      >
                        <option value="" className="text-zinc-400">{t('rfqCategory')}...</option>
                        {(() => {
                          const isProduction = process.env.NODE_ENV === 'production' || process.env.NEXT_PUBLIC_APP_ENV === 'production';
                          if (isProduction) {
                            return (
                              <>
                                <option value="restaurant-cafe">{language === 'hi' ? 'रेस्टोरेंट और कैफ़े' : 'Restaurant & Cafe'}</option>
                                <option value="salon-booking">{t('salonBooking')}</option>
                              </>
                            );
                          }
                          return (
                            <>
                              <option value="electrician">{t('electrician')}</option>
                              <option value="plumber">{t('plumber')}</option>
                              <option value="ac-repair">{t('ac-repair')}</option>
                              <option value="carpenter">{t('carpenter')}</option>
                              <option value="painter">{t('painter')}</option>
                              <option value="ro-repair">{t('ro-repair')}</option>
                              <option value="car-rental">{t('carRental')}</option>
                              <option value="salon-booking">{t('salonBooking')}</option>
                              <option value="real-estate">{t('realEstate')}</option>
                            </>
                          );
                        })()}
                      </select>
                    </div>

                    {/* Locality */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                        {t('rfqLocation')} *
                      </label>
                      <Input
                        placeholder="e.g. Model Town, GT Road"
                        required
                        maxLength={100}
                        className="h-11 rounded-xl bg-zinc-50 border-zinc-200 text-zinc-900 placeholder-zinc-400 text-xs focus-visible:ring-primary"
                        value={rfqLocation}
                        onChange={(e) => setRfqLocation(e.target.value.substring(0, 100))}
                      />
                    </div>
                  </div>

                  {/* Requirement Details */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-500 tracking-wider">
                      {language === 'hi' ? 'अपनी आवश्यकता का विवरण' : 'Explain what you need'}
                    </label>
                    <textarea
                      rows={2}
                      maxLength={500}
                      placeholder={t('rfqPlaceholder')}
                      className="w-full p-3.5 rounded-xl border border-zinc-200 bg-zinc-50 text-zinc-900 placeholder-zinc-400 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      value={rfqDetails}
                      onChange={(e) => setRfqDetails(e.target.value.substring(0, 500))}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="sticky bottom-0 z-50 p-4 -mx-6 sm:mx-0 sm:p-0 sm:static bg-white border-t border-zinc-100 sm:border-0 sm:bg-transparent shadow-[0_-10px_30px_rgba(0,0,0,0.05)] sm:shadow-none mt-4">
                    <Button
                      type="submit"
                      disabled={isSubmittingRfq}
                      className="w-full h-12 rounded-xl text-xs font-black bg-primary hover:bg-primary/95 text-white shadow-lg shadow-primary/20 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      {isSubmittingRfq ? (
                        <>Posting Request...</>
                      ) : (
                        <>
                          {t('rfqSubmit')}
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </Button>
                  </div>
                </form>
              </div>

              {/* Right Column: Advertisements & Benefits (col-span-5) */}
              <div className="lg:col-span-5 bg-zinc-50 border-t lg:border-t-0 lg:border-l border-zinc-200/80 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[350px]">
                {/* Visual Glow */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/5 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-5">
                  <h3 className="text-sm font-black text-primary uppercase tracking-widest">
                    {language === 'hi' ? 'सीधा वेंडर संपर्क • 100% सुरक्षित' : 'Direct Connect • 100% Verified'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center shrink-0 border border-emerald-200 text-emerald-600">
                        <CheckCircle2 className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-800 leading-tight">
                          {language === 'hi' ? 'शून्य बिचौलिया शुल्क (0% कमीशन)' : 'Zero Commission Fees (0% Brokerage)'}
                        </h4>
                        <p className="text-[11px] text-zinc-500 mt-1 font-medium leading-relaxed">
                          {language === 'hi' ? 'हम ग्राहकों और विक्रेताओं के बीच कोई शुल्क नहीं लेते हैं।' : 'We don\'t charge any commission. Keep 100% of the deal value.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center shrink-0 border border-amber-200 text-amber-600">
                        <Zap className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-800 leading-tight">
                          {language === 'hi' ? 'व्हाट्सएप और फोन पर त्वरित संपर्क' : 'Instant WhatsApp & Call Deals'}
                        </h4>
                        <p className="text-[11px] text-zinc-500 mt-1 font-medium leading-relaxed">
                          {language === 'hi' ? 'सीधे व्हाट्सएप चैट के माध्यम से मोलभाव करें और बुकिंग पूरी करें।' : 'Negotiate directly and finalize bookings instantly via chat or phone.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-100 flex items-center justify-center shrink-0 border border-indigo-200 text-indigo-600">
                        <ShieldCheck className="w-4 h-4" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-800 leading-tight">
                          {language === 'hi' ? 'सत्यापित स्थानीय वेंडर्स' : 'Identity Verified Local Pros'}
                        </h4>
                        <p className="text-[11px] text-zinc-500 mt-1 font-medium leading-relaxed">
                          {language === 'hi' ? 'सभी विक्रेता हमारे द्वारा दस्तावेज़-सत्यापित और रेटिंग-प्राप्त हैं।' : 'All service providers are document-verified for local safety.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advertisement Banner Card */}
                <div className="mt-6 bg-gradient-to-r from-primary to-rose-500 rounded-2xl p-4.5 relative overflow-hidden flex items-center justify-between gap-4 group shadow-lg shadow-primary/20">
                  <div className="space-y-1 relative z-10">
                    <span className="bg-white/20 text-[8px] font-black text-white px-2 py-0.5 rounded uppercase tracking-wider backdrop-blur-sm">
                      {language === 'hi' ? 'विशेष पार्टनर ऑफर' : 'PRO PARTNER DEAL'}
                    </span>
                    <h4 className="text-[11px] sm:text-xs font-extrabold text-white mt-1 leading-tight">
                      {language === 'hi' ? 'दुकानदार? आज ही जुड़ें और 10 गुना लीड पाएं' : 'Are you a Pro? Register to get 10x leads!'}
                    </h4>
                    <p className="text-[10px] text-white/80 font-medium">
                      {language === 'hi' ? 'शून्य दलाली पर अधिक ग्राहक पाएं।' : 'Create your digital catalog for free.'}
                    </p>
                  </div>
                  <Link href="/vendor/register" className="shrink-0 relative z-10">
                    <Button size="icon" className="w-8 h-8 rounded-xl bg-white text-primary hover:bg-zinc-50 flex items-center justify-center transition-transform group-hover:scale-105 shadow-md shadow-black/10">
                      <ArrowRight className="w-4 h-4" />
                    </Button>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>


      </main>

      {/* Global CSS scrollbar hide utility */}
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
