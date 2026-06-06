'use client';

import { useState } from 'react';
import { ArrowLeft, CheckCircle2, Car, Users, Wind, MapPin, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { BusinessProfile } from '@/types/models';

interface CabTransportLayoutProps {
  business: BusinessProfile;
  theme: any;
}

export default function CabTransportLayout({ business, theme }: CabTransportLayoutProps) {
  const router = useRouter();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestDetails, setRequestDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const connectionMode = business.connectionMode || 'REQUIRE_APPROVAL';

  const handlePrimaryAction = () => {
    if (connectionMode === 'DIRECT') {
      executeDirectConnect();
    } else {
      setIsRequestModalOpen(true);
    }
  };

  const executeDirectConnect = async () => {
    const vehicleModel = business.metaData?.model || 'vehicle';
    const message = `Hi ${business.businessName}, I saw your ${vehicleModel} on NearByBazar and want to check your availability for a trip. Please let me know your rates!`;
    const phone = business.user?.phoneNumber || '9999999999';
    const formattedPhone = phone.startsWith('+') ? phone.replace('+', '') : (phone.length === 10 ? `91${phone}` : phone);
    
    try {
      await import('@/lib/api-client').then(m => m.default.post('/analytics/lead', {
        businessProfileId: business.id,
        type: 'whatsapp_click'
      }));
    } catch (e) {
      console.error('Failed to log analytics', e);
    }
    
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const submitRequest = async () => {
    try {
      setIsSubmitting(true);
      const { useAuthStore } = await import('@/store/authStore');
      const { user } = useAuthStore.getState();
      
      const baseFareAmt = business.catalogItems && business.catalogItems.length > 0 
        ? business.catalogItems[0].price 
        : (business.metaData?.baseFare || 0);
      
      await import('@/lib/api-client').then(m => m.default.post('/orders/checkout', {
        businessProfileId: business.id,
        orderType: 'SERVICE_BOOKING',
        customerName: user?.name || 'Guest User',
        customerPhone: user?.phoneNumber || '9999999999',
        serviceLocation: requestDetails,
        totalValue: isNaN(Number(baseFareAmt)) ? 0 : Number(baseFareAmt),
        status: 'PENDING',
        items: [] // No specific items for a cab ride
      }));
      
      alert('Request Submitted Successfully! The driver will review and accept.');
      setIsRequestModalOpen(false);
      setRequestDetails('');
    } catch (error) {
      console.error(error);
      alert('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const vehicleImage = business.media?.find((m: any) => m.type === 'shop_photo' || m.type === 'vehicle_photo')?.secureUrl 
    || 'https://images.unsplash.com/photo-1549317661-bd32c8ce0db2?auto=format&fit=crop&w=800&q=80';

  const driverImage = business.media?.find((m: any) => m.type === 'profile_image')?.secureUrl
    || 'https://images.unsplash.com/photo-1633332755192-727a05c4013d?auto=format&fit=crop&w=200&q=80';

  const model = business.metaData?.model || 'Standard Cab';
  const vehicleType = business.metaData?.vehicleType || 'Sedan';
  const hasAc = business.metaData?.ac !== false;
  const seats = business.metaData?.seats || 4;
  const baseFare = business.catalogItems && business.catalogItems.length > 0 
    ? business.catalogItems[0].price 
    : (business.metaData?.baseFare || 'Negotiable');

  return (
    <div className="w-full relative min-h-screen bg-zinc-950 text-zinc-50 pb-32">
      {/* Hero Section with Vehicle Image */}
      <div className="relative w-full h-[300px] md:h-[400px]">
        <img src={vehicleImage} className="w-full h-full object-cover opacity-80" alt="Vehicle" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/40 to-transparent" />
        
        {/* Navigation Bar overlay */}
        <div className="absolute top-0 left-0 right-0 p-4 flex items-center">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white hover:bg-black/60 transition-colors">
            <ArrowLeft className="w-6 h-6" />
          </button>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-4 -mt-16 relative z-10">
        {/* Driver Profile Thumbnail & Status Card */}
        <div className="bg-zinc-900 rounded-3xl p-6 shadow-2xl border border-zinc-800">
          <div className="flex items-start justify-between">
            <div className="flex gap-4 items-center">
              <div className="relative">
                <div className="w-20 h-20 rounded-full overflow-hidden border-4 border-zinc-800 shadow-inner bg-zinc-800">
                  <img src={driverImage} alt="Driver" className="w-full h-full object-cover" />
                </div>
                {business.isOnline && (
                  <div className="absolute bottom-0 right-0 w-5 h-5 bg-green-500 border-4 border-zinc-900 rounded-full"></div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-black text-white">{business.businessName}</h1>
                <div className="flex items-center gap-2 mt-1 text-zinc-400">
                  <MapPin className="w-4 h-4 text-amber-500" />
                  <span className="text-sm font-medium">{business.localityName}</span>
                </div>
              </div>
            </div>
            
            <div className="hidden sm:flex flex-col items-end">
              <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1.5 border border-green-500/20">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div> Active Now
              </div>
              {business.membershipTier === 'Pro' && (
                <div className="mt-2 text-blue-400 text-xs font-bold flex items-center gap-1">
                  <CheckCircle2 className="w-4 h-4" /> Verified Driver
                </div>
              )}
            </div>
          </div>

          <div className="mt-8 pt-6 border-t border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-4">Vehicle Specifications</h3>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800/50 flex flex-col items-center justify-center text-center">
                <Car className="w-6 h-6 text-indigo-400 mb-2" />
                <span className="text-xs text-zinc-500 font-medium">Model</span>
                <span className="text-sm font-bold text-zinc-100">{model}</span>
              </div>
              <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800/50 flex flex-col items-center justify-center text-center">
                <div className="w-6 h-6 rounded flex items-center justify-center bg-zinc-900 text-zinc-300 mb-2 font-bold text-xs border border-zinc-700">TYPE</div>
                <span className="text-xs text-zinc-500 font-medium">Category</span>
                <span className="text-sm font-bold text-zinc-100">{vehicleType}</span>
              </div>
              <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800/50 flex flex-col items-center justify-center text-center">
                <Wind className="w-6 h-6 text-sky-400 mb-2" />
                <span className="text-xs text-zinc-500 font-medium">Climate</span>
                <span className="text-sm font-bold text-zinc-100">{hasAc ? 'AC Cab' : 'Non-AC Cab'}</span>
              </div>
              <div className="bg-zinc-950 rounded-xl p-3 border border-zinc-800/50 flex flex-col items-center justify-center text-center">
                <Users className="w-6 h-6 text-rose-400 mb-2" />
                <span className="text-xs text-zinc-500 font-medium">Capacity</span>
                <span className="text-sm font-bold text-zinc-100">{seats} Seats</span>
              </div>
            </div>
          </div>
        </div>

        {business.description && (
          <div className="mt-8 bg-zinc-900/50 rounded-2xl p-6 border border-zinc-800">
            <h3 className="text-sm font-bold text-zinc-400 uppercase tracking-wider mb-3">About the Driver</h3>
            <p className="text-zinc-300 leading-relaxed text-sm">
              {business.description}
            </p>
          </div>
        )}
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-950 border-t border-zinc-800 z-50">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="hidden sm:block">
            <div className="text-xs text-zinc-400 uppercase tracking-wider font-bold mb-0.5">Base Fare</div>
            <div className="text-2xl font-black text-white">
              {typeof baseFare === 'number' || !isNaN(Number(baseFare)) ? `₹${baseFare}` : baseFare}
            </div>
          </div>
          <button 
            onClick={handlePrimaryAction}
            className="flex-1 sm:flex-none w-full sm:w-auto bg-green-600 hover:bg-green-500 text-white font-bold py-4 px-8 rounded-xl transition-all shadow-[0_0_20px_rgba(22,163,74,0.3)] flex items-center justify-center gap-2"
          >
            {connectionMode === 'DIRECT' ? 'Call & Negotiate Fare on WhatsApp' : 'Request to Book Cab'}
          </button>
        </div>
      </div>

      {/* Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-900 w-full max-w-md rounded-2xl p-6 border border-zinc-800 shadow-2xl relative">
            <button onClick={() => setIsRequestModalOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-2">Request Cab</h3>
            <p className="text-zinc-400 text-sm mb-6">Where do you want to go and when? Provide details so the driver can approve your trip.</p>
            
            <textarea 
              value={requestDetails}
              onChange={(e) => setRequestDetails(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-green-500 min-h-[120px] mb-4"
              placeholder="E.g. Pickup from Airport tomorrow at 5am, drop off at City Center."
            />

            <button 
              onClick={submitRequest}
              disabled={isSubmitting || requestDetails.trim() === ''}
              className="w-full bg-green-600 hover:bg-green-500 disabled:opacity-50 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
