'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, BadgeCheck, MapPin, Phone, MessageCircle, Clock } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { ReviewSection } from '@/components/vendor/ReviewSection';
import { THEME_FLAVORS, ThemeFlavor } from '@/config/themes';

import { Vendor, Media } from '@/types/models';

export default function VendorProfilePage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;
  const [vendor, setVendor] = useState<Vendor | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchVendor = async () => {
      try {
        const res = await apiClient.get(`/vendors/${slug}`);
        setVendor(res.data?.data || null);
      } catch (error) {
        console.error('Failed to load vendor', error);
      } finally {
        setLoading(false);
      }
    };
    if (slug) fetchVendor();
  }, [slug]);

  const handleInteraction = async (type: 'call_click' | 'whatsapp_click') => {
    if (!vendor) return;
    try {
      apiClient.post('/analytics/interaction', { vendorId: vendor.id, type }).catch(() => {});
      const phone = vendor.phoneNumber || '1234567890';
      if (type === 'call_click') {
        window.location.href = `tel:${phone}`;
      } else {
        window.location.href = `https://wa.me/${phone.replace('+', '')}`;
      }
    } catch (error) {
      console.error('Interaction trigger failed', error);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center p-4">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!vendor) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4">
        <h2 className="text-xl font-bold">Vendor Not Found</h2>
        <Button onClick={() => router.back()} className="mt-4">Go Back</Button>
      </div>
    );
  }

  const isVerified = vendor.membershipTier === 'Pro' || vendor.membershipTier === 'Starter';
  const shopPhotos = vendor.media?.filter((m: Media) => m.type === 'shop_photo') || [];
  const rateCards = vendor.media?.filter((m: Media) => m.type === 'rate_card') || [];

  const currentThemeId = (vendor as any).themeFlavor as ThemeFlavor || 'trust-utility';
  const theme = THEME_FLAVORS[currentThemeId] || THEME_FLAVORS['trust-utility'];

  return (
    <div className={`flex flex-col min-h-screen pb-[100px] ${theme.colors.background}`}>
      {/* Sticky Header */}
      <header className={`sticky top-0 z-40 bg-background/50 backdrop-blur-md border-b border-border px-4 py-3 flex items-center gap-3 bg-gradient-to-r ${theme.colors.headerGradient}`}>
        <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-black/5 transition-colors">
          <ArrowLeft className="w-6 h-6 text-foreground" />
        </button>
        <div className="flex-1 truncate">
          <h1 className="font-bold text-lg flex items-center gap-1.5 truncate">
            {vendor.businessName}
            {isVerified && <BadgeCheck className="w-5 h-5 text-blue-500 shrink-0" />}
          </h1>
          <p className="text-xs text-muted-foreground truncate">{vendor.localityName}</p>
        </div>
      </header>

      <main className="flex-1 px-4 py-6">
        {/* Info Section */}
        <div className="space-y-5">
          <p className="text-foreground leading-relaxed text-sm sm:text-base">
            {vendor.description || 'Reliable and trusted local service provider in your area.'}
          </p>
          
          <div className="flex flex-col gap-3">
            <div className="flex items-start gap-3 text-sm text-muted-foreground">
              <MapPin className={`w-5 h-5 shrink-0 mt-0.5 ${theme.colors.primary}`} />
              <span className="leading-relaxed">
                {vendor.localityName}
                {vendor.chowkLandmark && `, Near ${vendor.chowkLandmark}`}
                {vendor.pincode && ` - ${vendor.pincode}`}
              </span>
            </div>
            
            <div className="flex items-center gap-3 text-sm text-muted-foreground">
              <Clock className={`w-5 h-5 shrink-0 ${theme.colors.primary}`} />
              <span>{vendor.openingTime || '09:00 AM'} - {vendor.closingTime || '08:00 PM'}</span>
            </div>
          </div>
        </div>

        {/* Media Gallery */}
        {(shopPhotos.length > 0 || rateCards.length > 0) && (
          <div className="mt-8 space-y-6">
            {shopPhotos.length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-3">Shop Photos</h3>
                <div className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory hide-scrollbar -mx-4 px-4">
                  {shopPhotos.map((photo: Media) => (
                    <div key={photo.id} className="relative w-64 h-40 shrink-0 snap-center rounded-xl overflow-hidden border border-border bg-muted">
                      <img 
                        src={photo.secureUrl} 
                        alt="Shop Photo" 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
            
            {rateCards.length > 0 && (
              <div>
                <h3 className="font-bold text-lg mb-3">Rate Cards</h3>
                <div className="flex overflow-x-auto gap-4 pb-2 snap-x snap-mandatory hide-scrollbar -mx-4 px-4">
                  {rateCards.map((card: Media) => (
                    <div key={card.id} className="relative w-48 h-64 shrink-0 snap-center rounded-xl overflow-hidden border border-border bg-muted">
                      <img 
                        src={card.secureUrl} 
                        alt="Rate Card" 
                        className="w-full h-full object-cover"
                        loading="lazy"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* Reviews */}
        <ReviewSection 
          vendorId={vendor.id}
          ratingAvg={vendor.rating || 0}
          reviewCount={vendor.reviews?.length || 0}
          reviews={vendor.reviews || []}
        />
      </main>

      {/* Sticky Action Footer */}
      <div className={`fixed bottom-0 left-0 w-full border-t border-border p-4 flex gap-3 z-50 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.05)] ${theme.colors.background}`}>
        <Button 
          variant="outline" 
          className={`flex-1 h-14 rounded-xl font-bold text-lg border-2 border-current hover:bg-black/5 ${theme.colors.primary}`}
          onClick={() => handleInteraction('call_click')}
        >
          <Phone className="w-5 h-5 mr-2" />
          Call
        </Button>
        <Button 
          className={`flex-1 h-14 rounded-xl font-bold text-lg ${theme.colors.button}`}
          onClick={() => handleInteraction('whatsapp_click')}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          WhatsApp
        </Button>
      </div>

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
