'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BadgeCheck, MapPin, Clock } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { THEME_FLAVORS, ThemeFlavor } from '@/config/themes';
import { BusinessProfile, Media } from '@/types/models';

import FoodLayout from '@/components/vendor/FoodLayout';
import HomeServicesLayout from '@/components/vendor/HomeServicesLayout';
import CabTransportLayout from '@/components/vendor/CabTransportLayout';
import { ReviewSection } from '@/components/vendor/ReviewSection';

export default function VendorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [business, setBusiness] = useState<BusinessProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBusiness = async () => {
      try {
        const res = await apiClient.get(`/business/${slug}`);
        setBusiness(res.data?.data || null);
      } catch (error) {
        console.error('Failed to load business profile', error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchBusiness();
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!business) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold">Profile Not Found</h2>
        <button onClick={() => router.back()} className="mt-4 px-4 py-2 bg-primary text-white rounded">Go Back</button>
      </div>
    );
  }

  const isVerified = business.membershipTier === 'Pro' || business.membershipTier === 'Starter';
  const shopPhotos = business.media?.filter((m: Media) => m.type === 'shop_photo') || [];
  
  const currentThemeId = (business as any).themeFlavor as ThemeFlavor || 'trust-utility';
  const theme = THEME_FLAVORS[currentThemeId] || THEME_FLAVORS['trust-utility'];

  const isDarkPremium = business.businessType === 'SALON_BEAUTY' || business.businessType === 'HOME_ESSENTIALS';

  return (
    <div className={`flex flex-col min-h-screen pb-[100px] ${isDarkPremium ? 'bg-zinc-950 text-zinc-50' : theme.colors.background}`}>
      
      {/* Hide sticky header for CabTransport since it has its own prominent Vehicle Card */}
      {business.businessType !== 'CAB_TRANSPORT' && (
        <header className={`sticky top-0 z-40 ${isDarkPremium ? 'bg-zinc-950/80' : 'bg-background/50'} backdrop-blur-md border-b ${isDarkPremium ? 'border-zinc-800' : 'border-border'} ${isDarkPremium ? '' : `bg-gradient-to-r ${theme.colors.headerGradient}`}`}>
          <div className="max-w-5xl mx-auto px-4 py-3 flex items-center gap-3">
            <button onClick={() => router.back()} className={`p-2 -ml-2 rounded-full hover:bg-white/10 ${isDarkPremium ? 'text-zinc-100' : 'text-zinc-800'} transition-colors`}>
              <ArrowLeft className="w-6 h-6" />
            </button>
            <div className="flex-1 truncate">
              <h1 className="font-bold text-lg flex items-center gap-1.5 truncate">
                {business.businessName}
                {isVerified && <BadgeCheck className="w-5 h-5 text-blue-500 shrink-0" />}
              </h1>
              <p className={`text-xs truncate ${isDarkPremium ? 'text-zinc-400' : 'text-zinc-500'}`}>{business.localityName}</p>
            </div>
          </div>
        </header>
      )}

      {business.businessType !== 'CAB_TRANSPORT' && business.businessType !== 'HOME_ESSENTIALS' && (
        <section className="space-y-4 px-4 pt-6 max-w-5xl mx-auto w-full">
          <div className="flex flex-col gap-3">
            <div className={`flex items-start gap-3 text-sm ${isDarkPremium ? 'text-zinc-400' : 'text-zinc-500'}`}>
              <MapPin className="w-5 h-5 shrink-0 mt-0.5 text-amber-500" />
              <span className="leading-relaxed">
                {business.localityName}
                {business.isStreetVendor ? (business.landmark && `, ${business.landmark}`) : (business.chowkLandmark && `, Near ${business.chowkLandmark}`)}
              </span>
            </div>
            
            <div className={`flex items-center gap-3 text-sm ${isDarkPremium ? 'text-zinc-400' : 'text-zinc-500'}`}>
              <Clock className="w-5 h-5 shrink-0 text-amber-500" />
              <span>{business.isOnline ? '🟢 Available' : '🔴 Unavailable'}</span>
            </div>
          </div>
        </section>
      )}

      <main className={`flex-1 w-full max-w-5xl mx-auto ${business.businessType === 'CAB_TRANSPORT' ? 'p-0' : 'px-4 py-6'} space-y-8`}>
        
        {/* Polymorphic Layout Router */}
        <section className={business.businessType !== 'CAB_TRANSPORT' ? 'mt-4' : ''}>
          {business.businessType === 'FOOD_BEVERAGE' && (
            <FoodLayout business={business} theme={theme} />
          )}
          {business.businessType === 'HOME_ESSENTIALS' && (
            <HomeServicesLayout business={business} theme={theme} />
          )}
          {business.businessType === 'CAB_TRANSPORT' && (
            <CabTransportLayout business={business} theme={theme} />
          )}
          {business.businessType === 'SALON_BEAUTY' && (
            <div className="text-center p-8 bg-zinc-900 rounded-xl">
              <h2 className="text-xl font-bold">Salon & Beauty Layout Coming Soon</h2>
            </div>
          )}
        </section>

        {/* Media Gallery */}
        {shopPhotos.length > 0 && business.businessType !== 'CAB_TRANSPORT' && (
          <section className="mt-8 px-4 sm:px-0">
            <h3 className="font-bold text-lg mb-3">Gallery</h3>
            <div className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory hide-scrollbar -mx-4 px-4 sm:mx-0 sm:px-0">
              {shopPhotos.map((photo: Media) => (
                <div key={photo.id} className="relative w-64 h-40 shrink-0 snap-center rounded-xl overflow-hidden border border-border bg-muted">
                  <img src={photo.secureUrl} alt="Gallery" className="w-full h-full object-cover" loading="lazy" />
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Reviews */}
        {business.businessType !== 'CAB_TRANSPORT' && (
          <ReviewSection 
            vendorId={business.id}
            ratingAvg={business.rating || 0}
            reviewCount={business.reviews?.length || 0}
            reviews={business.reviews || []}
          />
        )}
      </main>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
