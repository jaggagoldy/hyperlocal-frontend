'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  MapPin, 
  Search, 
  User, 
  Sparkles, 
  ArrowRight, 
  Phone, 
  CheckCircle2, 
  SlidersHorizontal,
  Building,
  Car,
  Scissors,
  Wrench,
  Award,
  ChevronRight,
  ShieldCheck,
  Zap,
  Users,
  Megaphone,
  Star
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useTranslation } from '@/lib/translations';
import { useSearchStore } from '@/store/searchStore';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { EnquiryDrawer } from '@/components/shared/EnquiryDrawer';
import Link from 'next/link';

export default function Home() {
  const router = useRouter();
  const { t, language } = useTranslation();
  const { selectedCity, setCity, setCategory } = useSearchStore();
  
  // List of cities fetched dynamically
  const [cities, setCities] = useState<any[]>([]);

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

  const handleHeroSearch = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/explore');
  };

  const handleVerticalClick = (catSlug: string) => {
    setCategory(catSlug);
    router.push('/explore');
  };

  const handleNameChange = (val: string) => {
    if (val.length <= 50) {
      setRfqName(val);
    }
  };

  const handlePhoneChange = (val: string) => {
    const cleaned = val.replace(/\D/g, '');
    if (cleaned.length <= 10) {
      setRfqPhone(cleaned);
    }
  };

  const handleLocationChange = (val: string) => {
    if (val.length <= 100) {
      setRfqLocation(val);
    }
  };

  const handleDetailsChange = (val: string) => {
    if (val.length <= 500) {
      setRfqDetails(val);
    }
  };

  const handleRfqSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
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
    
    if (/^(\d)\1{9}$/.test(rfqPhone) || ['0123456789', '1234567890', '9876543210'].includes(rfqPhone)) {
      toast.error(language === 'hi' ? 'कृपया एक वैध मोबाइल नंबर दर्ज करें। दोहराए गए या क्रमबद्ध अंक अमान्य हैं।' : 'Please enter a valid mobile number. Repeating or sequential digits are invalid.');
      return;
    }

    try {
      setIsSubmittingRfq(true);
      
      // 1. Resolve a catalogItem ID for the selected category category
      let catalogItemId = '';
      const resLocal = await apiClient.get('/catalog/explore', {
        params: { citySlug: selectedCity, categorySlug: rfqCategory, limit: 1 }
      });

      if (resLocal.data?.data?.[0]) {
        catalogItemId = resLocal.data.data[0].id;
      } else {
        // Fallback: search across all cities for this category
        const resAny = await apiClient.get('/catalog/explore', {
          params: { categorySlug: rfqCategory, limit: 1 }
        });
        if (resAny.data?.data?.[0]) {
          catalogItemId = resAny.data.data[0].id;
        }
      }

      // If no catalog item is found locally or globally, backend will handle fallback to hyperlocal-general-services
      // by us passing an empty string
      
      // 2. Post inquiry/lead
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
    <div className="min-h-screen bg-zinc-50/40 relative overflow-hidden pb-20 font-sans">
      
      {/* Ambient Radial Gradients */}
      <div className="absolute top-[5%] left-[-150px] w-[600px] h-[600px] rounded-full bg-primary/5 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-150px] w-[600px] h-[600px] rounded-full bg-rose-500/5 blur-[120px] pointer-events-none" />

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-10 md:pt-16 space-y-16">
        
        {/* ─── HERO & HEADER SEARCH SECTION ─── */}
        <section className="text-center max-w-4xl mx-auto space-y-6 relative z-10">
          <span className="inline-flex bg-primary/10 text-primary border border-primary/20 text-[10px] sm:text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full items-center gap-1.5 animate-pulse">
            <Sparkles className="w-3.5 h-3.5" /> {language === 'hi' ? 'वोकल फॉर लोकल' : 'Vocal for Local'}
          </span>
          
          <h1 
            className="text-3xl sm:text-4xl md:text-5xl font-black tracking-tight text-zinc-900 leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif' }}
          >
            {t('heroTitle')}
          </h1>
          
          <p className="text-xs sm:text-sm md:text-base text-zinc-500 max-w-2xl mx-auto leading-relaxed font-semibold">
            {t('heroSubtitle')}
          </p>

          {/* Quick Location & Search Banner Bar */}
          <form onSubmit={handleHeroSearch} className="bg-white border border-zinc-200 rounded-2xl shadow-md p-2 flex flex-col sm:flex-row items-center gap-2 max-w-2xl mx-auto mt-8">
            <div className="flex items-center gap-1.5 w-full sm:w-1/3 px-3 py-2 border-b sm:border-b-0 sm:border-r border-zinc-200">
              <MapPin className="w-4 h-4 text-primary" />
              <select
                value={selectedCity}
                onChange={(e) => setCity(e.target.value)}
                className="bg-transparent border-none outline-none font-bold text-xs sm:text-sm text-zinc-800 w-full cursor-pointer appearance-none"
              >
                {cities.map((city) => (
                  <option key={city.id} value={city.slug}>{city.name}</option>
                ))}
              </select>
            </div>
            
            <div className="flex items-center gap-1.5 w-full sm:w-2/3 px-3 py-2">
              <Search className="w-4 h-4 text-zinc-400" />
              <input
                type="text"
                readOnly
                onClick={() => router.push('/explore')}
                placeholder={t('searchPlaceholder')}
                className="bg-transparent border-none outline-none text-xs sm:text-sm text-zinc-650 w-full cursor-pointer"
              />
            </div>
            
            <Button 
              type="submit" 
              className="w-full sm:w-auto h-10 px-6 rounded-xl bg-primary text-white font-bold text-xs shrink-0 shadow-sm"
            >
              {language === 'hi' ? 'खोजें' : 'Search'}
            </Button>
          </form>
        </section>

        {/* ─── INDIAMART STYLE INSTANT REQUIREMENT BOARD (RFQ) ─── */}
        <section className="relative z-10 max-w-6xl mx-auto">
          {/* Mobile Trust Strip (visible primarily on mobile) */}
          <div className="lg:hidden flex overflow-x-auto gap-3 pb-3 mb-2 scrollbar-none snap-x px-1">
            <div className="snap-start shrink-0 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-zinc-200/60 px-3 py-1.5 rounded-full text-[10px] font-bold text-zinc-700 shadow-sm">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" /> {language === 'hi' ? '100% सत्यापित प्रो' : '100% Verified Pros'}
            </div>
            <div className="snap-start shrink-0 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-zinc-200/60 px-3 py-1.5 rounded-full text-[10px] font-bold text-zinc-700 shadow-sm">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> {language === 'hi' ? 'शून्य कमीशन' : 'Zero Commission'}
            </div>
            <div className="snap-start shrink-0 flex items-center gap-1.5 bg-white/80 backdrop-blur-sm border border-zinc-200/60 px-3 py-1.5 rounded-full text-[10px] font-bold text-zinc-700 shadow-sm">
              <Zap className="w-3.5 h-3.5 text-amber-500" /> {language === 'hi' ? 'तुरंत व्हाट्सएप' : 'Instant WhatsApp'}
            </div>
          </div>

          <div className="bg-zinc-950 border border-zinc-900 rounded-3xl shadow-2xl relative overflow-hidden">
            {/* Ambient gold glow */}
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="grid grid-cols-1 lg:grid-cols-12 items-stretch">
              
              {/* Left Column: The Form (col-span-7) */}
              <div className="p-6 sm:p-8 lg:col-span-7 space-y-6 flex flex-col justify-between">
                <div className="space-y-1">
                  <h2 className="text-lg sm:text-xl font-black text-white tracking-tight flex items-center gap-2">
                    <Megaphone className="w-5 h-5 text-amber-500" />
                    {t('rfqTitle')}
                  </h2>
                  <p className="text-zinc-450 text-xs font-semibold">
                    {t('rfqSubtitle')}
                  </p>
                </div>

                <form onSubmit={handleRfqSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Your Name */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                        {language === 'hi' ? 'आपका नाम *' : 'Your Name *'}
                      </label>
                      <Input
                        placeholder="e.g. Rahul Sharma"
                        required
                        maxLength={50}
                        className="h-11 rounded-xl bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus-visible:ring-primary"
                        value={rfqName}
                        onChange={(e) => handleNameChange(e.target.value)}
                      />
                    </div>

                    {/* Phone Number */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                        {t('rfqPhone')} *
                      </label>
                      <Input
                        type="tel"
                        inputMode="numeric"
                        pattern="[0-9]*"
                        placeholder="e.g. 9876543210"
                        required
                        maxLength={10}
                        className="h-11 rounded-xl bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus-visible:ring-primary"
                        value={rfqPhone}
                        onChange={(e) => handlePhoneChange(e.target.value)}
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Category Dropdown */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                        {t('rfqCategory')} *
                      </label>
                      <select
                        required
                        value={rfqCategory}
                        onChange={(e) => setRfqCategory(e.target.value)}
                        className="w-full h-11 px-3 rounded-xl border border-zinc-800 bg-zinc-900 text-white text-xs focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium"
                      >
                        <option value="" className="bg-zinc-900 text-zinc-400">{t('rfqCategory')}...</option>
                        <option value="electrician" className="bg-zinc-900 text-zinc-100">{t('electrician')}</option>
                        <option value="plumber" className="bg-zinc-900 text-zinc-100">{t('plumber')}</option>
                        <option value="ac-repair" className="bg-zinc-900 text-zinc-100">{t('ac-repair')}</option>
                        <option value="carpenter" className="bg-zinc-900 text-zinc-100">{t('carpenter')}</option>
                        <option value="painter" className="bg-zinc-900 text-zinc-100">{t('painter')}</option>
                        <option value="ro-repair" className="bg-zinc-900 text-zinc-100">{t('ro-repair')}</option>
                        <option value="car-rental" className="bg-zinc-900 text-zinc-100">{t('carRental')}</option>
                        <option value="salon-booking" className="bg-zinc-900 text-zinc-100">{t('salonBooking')}</option>
                        <option value="real-estate" className="bg-zinc-900 text-zinc-100">{t('realEstate')}</option>
                      </select>
                    </div>

                    {/* Locality */}
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                        {t('rfqLocation')} *
                      </label>
                      <Input
                        placeholder="e.g. Model Town, GT Road"
                        required
                        maxLength={100}
                        className="h-11 rounded-xl bg-zinc-900 border-zinc-800 text-zinc-100 placeholder-zinc-500 text-xs focus-visible:ring-primary"
                        value={rfqLocation}
                        onChange={(e) => handleLocationChange(e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Requirement Details */}
                  <div className="space-y-1">
                    <label className="text-[10px] uppercase font-bold text-zinc-400 tracking-wider">
                      {language === 'hi' ? 'अपनी आवश्यकता का विवरण' : 'Explain what you need'}
                    </label>
                    <textarea
                      rows={2}
                      maxLength={500}
                      placeholder={t('rfqPlaceholder')}
                      className="w-full p-3.5 rounded-xl border border-zinc-800 bg-zinc-900 text-zinc-100 placeholder-zinc-500 text-xs focus:outline-none focus:ring-1 focus:ring-primary"
                      value={rfqDetails}
                      onChange={(e) => handleDetailsChange(e.target.value)}
                    />
                  </div>

                  {/* Submit Button */}
                  <div className="sticky bottom-0 z-50 p-4 -mx-6 sm:mx-0 sm:p-0 sm:static bg-zinc-950 border-t border-zinc-800 sm:border-0 sm:bg-transparent shadow-[0_-10px_30px_rgba(0,0,0,0.5)] sm:shadow-none mt-4">
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
              <div className="lg:col-span-5 bg-gradient-to-b from-zinc-900/60 to-zinc-950/90 border-t lg:border-t-0 lg:border-l border-zinc-800/80 p-6 sm:p-8 flex flex-col justify-between relative overflow-hidden min-h-[350px]">
                {/* Visual Glow */}
                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-primary/10 rounded-full blur-3xl pointer-events-none" />

                <div className="space-y-5">
                  <h3 className="text-sm font-black text-amber-500 uppercase tracking-widest">
                    {language === 'hi' ? 'सीधा वेंडर संपर्क • 100% सुरक्षित' : 'Direct Connect • 100% Verified'}
                  </h3>
                  
                  <div className="space-y-4">
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center shrink-0 border border-emerald-500/20 text-emerald-450">
                        <CheckCircle2 className="w-4 h-4 text-emerald-450" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-100 leading-tight">
                          {language === 'hi' ? 'शून्य बिचौलिया शुल्क (0% कमीशन)' : 'Zero Commission Fees (0% Brokerage)'}
                        </h4>
                        <p className="text-[11px] text-zinc-400 mt-1 font-medium leading-relaxed">
                          {language === 'hi' ? 'हम ग्राहकों और विक्रेताओं के बीच कोई शुल्क नहीं लेते हैं।' : 'We don\'t charge any commission. Keep 100% of the deal value.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 border border-primary/20 text-primary-400">
                        <Zap className="w-4 h-4 text-primary" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-100 leading-tight">
                          {language === 'hi' ? 'व्हाट्सएप और फोन पर त्वरित संपर्क' : 'Instant WhatsApp & Call Deals'}
                        </h4>
                        <p className="text-[11px] text-zinc-400 mt-1 font-medium leading-relaxed">
                          {language === 'hi' ? 'सीधे व्हाट्सएप चैट के माध्यम से मोलभाव करें और बुकिंग पूरी करें।' : 'Negotiate directly and finalize bookings instantly via chat or phone.'}
                        </p>
                      </div>
                    </div>

                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-lg bg-indigo-500/10 flex items-center justify-center shrink-0 border border-indigo-500/20 text-indigo-400">
                        <ShieldCheck className="w-4 h-4 text-indigo-450" />
                      </div>
                      <div>
                        <h4 className="text-xs font-bold text-zinc-100 leading-tight">
                          {language === 'hi' ? 'सत्यापित स्थानीय वेंडर्स' : 'Identity Verified Local Pros'}
                        </h4>
                        <p className="text-[11px] text-zinc-400 mt-1 font-medium leading-relaxed">
                          {language === 'hi' ? 'सभी विक्रेता हमारे द्वारा दस्तावेज़-सत्यापित और रेटिंग-प्राप्त हैं।' : 'All service providers are document-verified for local safety.'}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Advertisement Banner Card */}
                <div className="mt-6 bg-gradient-to-r from-primary/25 to-rose-500/25 border border-primary/25 rounded-2xl p-4.5 relative overflow-hidden flex items-center justify-between gap-4 group">
                  <div className="space-y-1 relative z-10">
                    <span className="bg-rose-500 text-[8px] font-black text-white px-2 py-0.5 rounded uppercase tracking-wider">
                      {language === 'hi' ? 'विशेष पार्टनर ऑफर' : 'PRO PARTNER DEAL'}
                    </span>
                    <h4 className="text-[11px] sm:text-xs font-extrabold text-white mt-1 leading-tight">
                      {language === 'hi' ? 'दुकानदार? आज ही जुड़ें और 10 गुना लीड पाएं' : 'Are you a Pro? Register to get 10x leads!'}
                    </h4>
                    <p className="text-[10px] text-zinc-350 font-medium">
                      {language === 'hi' ? 'शून्य दलाली पर अधिक ग्राहक पाएं।' : 'Create your digital catalog for free.'}
                    </p>
                  </div>
                  <Link href="/vendor/register" className="shrink-0 relative z-10">
                    <Button size="icon" className="w-8 h-8 rounded-xl bg-white hover:bg-zinc-50 text-zinc-950 flex items-center justify-center transition-transform group-hover:scale-105 shadow-md shadow-black/10">
                      <ArrowRight className="w-4 h-4 text-zinc-900" />
                    </Button>
                  </Link>
                </div>
              </div>

            </div>
          </div>
        </section>

        {/* ─── MARKETPLACE VERTICALS GRID ─── */}
        <section className="space-y-6 relative z-10">
          <div className="text-center space-y-1.5">
            <h2 className="text-xl sm:text-2xl font-black text-zinc-900 tracking-tight">
              {t('verticalsTitle')}
            </h2>
            <p className="text-xs text-zinc-400 font-bold max-w-md mx-auto">
              {t('verticalsSubtitle')}
            </p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { id: 'electrician', name: t('homeMaintenance'), icon: Wrench, count: 6, gradient: 'from-blue-500 to-indigo-600' },
              { id: 'car-rental', name: t('carRental'), icon: Car, count: 2, gradient: 'from-teal-500 to-emerald-600' },
              { id: 'salon-booking', name: t('salonBooking'), icon: Scissors, count: 2, gradient: 'from-rose-500 to-pink-600' },
              { id: 'real-estate', name: t('realEstate'), icon: Building, count: 1, gradient: 'from-amber-500 to-orange-600' }
            ].map(vert => (
              <div 
                key={vert.id}
                onClick={() => handleVerticalClick(vert.id)}
                className="group bg-white border border-zinc-200 rounded-2xl p-5 shadow-2xs hover:shadow-lg hover:border-primary/20 hover:scale-[1.02] cursor-pointer transition-all duration-300 flex flex-col justify-between min-h-[160px]"
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
        </section>

        {/* ─── VERIFIED PROS CAROUSEL SHOWCASE ─── */}
        {!loadingShowcase && showcaseItems.length > 0 && (
          <section className="space-y-6 relative z-10">
            <div className="flex items-end justify-between border-b border-zinc-200 pb-2">
              <div>
                <h2 className="text-lg sm:text-xl font-black text-zinc-900 tracking-tight">
                  {t('topRatedTitle')}
                </h2>
                <p className="text-[10px] sm:text-xs text-zinc-400 font-bold">
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

            <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-thin hide-scrollbar -mx-4 px-4">
              {showcaseItems.map((item, i) => (
                <div 
                  key={i} 
                  className="bg-white border border-zinc-250/60 rounded-2xl p-4 shadow-2xs hover:shadow-md transition-shadow shrink-0 w-64 flex flex-col justify-between min-h-[192px]"
                >
                  <div className="space-y-1.5 min-w-0">
                    <div className="flex items-center justify-between gap-2">
                      <span className="bg-emerald-50 text-emerald-700 text-[11px] font-black uppercase tracking-wider px-2 py-0.5 rounded-md border border-emerald-100/50 flex items-center gap-0.5">
                        <ShieldCheck className="w-3.5 h-3.5 fill-emerald-500 text-white" />
                        {t('verified')}
                      </span>
                      {item.vendor?.rating > 0 && (
                        <div className="flex items-center gap-0.5 text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded text-[10px] font-extrabold border border-amber-100/50">
                          <Star className="w-3 h-3 fill-current" />
                          {item.vendor.rating.toFixed(1)}
                        </div>
                      )}
                    </div>
                    
                    <h3 className="font-extrabold text-zinc-950 text-sm whitespace-normal leading-tight">{item.title}</h3>
                    <p className="text-[11px] font-semibold text-zinc-400 whitespace-normal leading-tight">{item.vendor?.businessName}</p>
                    <p className="text-[11px] text-zinc-500 font-medium line-clamp-2 leading-relaxed">
                      {item.description || 'No description provided.'}
                    </p>
                  </div>

                  <div className="pt-2">
                    <EnquiryDrawer item={item} vendorName={item.vendor?.businessName || 'the provider'} />
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ─── VALUE PROPOSITION CARDS (Zero-Brokerage / Direct Connect) ─── */}
        <section className="bg-zinc-900 border border-zinc-800 rounded-3xl p-8 sm:p-10 text-white relative overflow-hidden shadow-2xl">
          <div className="absolute top-0 left-0 w-48 h-48 bg-primary/5 rounded-full blur-2xl pointer-events-none" />
          
          <div className="flex flex-col lg:flex-row items-center gap-10 relative z-10">
            <div className="flex-1 text-center lg:text-left space-y-4">
              <span className="inline-flex bg-rose-500 text-white text-[11px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded border border-rose-455">
                Local B2B2C Mission
              </span>
              <h2 className="text-2xl sm:text-4xl font-black tracking-tight leading-tight">
                {t('valueTitle')}
              </h2>
              <p className="text-zinc-400 text-xs sm:text-sm leading-relaxed max-w-lg mx-auto lg:mx-0 font-medium">
                Helping small local businesses survive and scale without paying 20-30% commissions on third-party aggregators. Keep 100% of your earnings.
              </p>
              <Link href="/vendor/register" className="inline-block pt-2">
                <Button className="bg-white text-zinc-950 hover:bg-zinc-50 font-black text-xs h-11 px-6 rounded-xl gap-1">
                  {t('joinProToday')}
                  <ArrowRight className="w-4 h-4 text-zinc-950" />
                </Button>
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 flex-[1.5] w-full">
              {[
                { title: t('value1Title'), desc: t('value1Desc'), icon: Phone, color: 'text-emerald-400 bg-emerald-950/20' },
                { title: t('value2Title'), desc: t('value2Desc'), icon: Zap, color: 'text-rose-400 bg-rose-950/20' },
                { title: t('value3Title'), desc: t('value3Desc'), icon: Users, color: 'text-indigo-400 bg-indigo-950/20' }
              ].map((val, idx) => (
                <div key={idx} className="bg-zinc-950/60 border border-zinc-800 rounded-2xl p-5 space-y-3 shadow-inner">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${val.color}`}>
                    <val.icon className="w-4.5 h-4.5" />
                  </div>
                  <h3 className="font-extrabold text-sm text-zinc-100">{val.title}</h3>
                  <p className="text-[11px] text-zinc-400 font-medium leading-relaxed">{val.desc}</p>
                </div>
              ))}
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
