'use client';

import { useState, useEffect } from 'react';
import { Check, User, ShieldCheck, Wrench, X, Loader2 } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { BusinessProfile, CatalogItem } from '@/types/models';

interface HomeServicesLayoutProps {
  business: BusinessProfile;
  theme: any;
}

export default function HomeServicesLayout({ business, theme }: HomeServicesLayoutProps) {
  const [selectedServices, setSelectedServices] = useState<CatalogItem[]>([]);
  const searchParams = useSearchParams();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestDetails, setRequestDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const connectionMode = business.connectionMode || 'REQUIRE_APPROVAL';

  useEffect(() => {
    const preselectId = searchParams.get('preselect');
    if (preselectId && business.catalogItems) {
      const preselectItem = business.catalogItems.find(item => item.id === preselectId);
      if (preselectItem) {
        setSelectedServices([preselectItem]);
      }
    }
  }, [searchParams, business.catalogItems]);

  const toggleService = (item: CatalogItem) => {
    setSelectedServices(prev => {
      const isSelected = prev.some(s => s.id === item.id);
      if (isSelected) {
        return prev.filter(s => s.id !== item.id);
      } else {
        return [...prev, item];
      }
    });
  };

  const handlePrimaryAction = () => {
    if (connectionMode === 'DIRECT') {
      executeDirectConnect();
    } else {
      setIsRequestModalOpen(true);
    }
  };

  const executeDirectConnect = async () => {
    if (selectedServices.length === 0 && (business.catalogItems?.length ?? 0) > 0) {
      // Optional: prompt them to select
    }

    const totalBase = selectedServices.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    
    let message = `Hi! I found your profile on NearByBazar. I'd like to enquire about booking the following services:\n\n`;
    selectedServices.forEach(s => {
      message += `- ${s.title} (₹${s.price || 0})\n`;
    });
    message += `\nTotal Estimated Base: ₹${totalBase}\n\nAre you available? Let's discuss details.`;

    const phone = business.user?.phoneNumber || '9999999999'; // Fallback
    const formattedPhone = phone.startsWith('+') ? phone.replace('+', '') : (phone.length === 10 ? `91${phone}` : phone);
    
    try {
      await import('@/lib/api-client').then(m => m.default.post('/analytics/lead', {
        businessProfileId: business.id,
        type: 'whatsapp_click'
      }));
    } catch (e) {}

    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const submitRequest = async () => {
    try {
      setIsSubmitting(true);
      const { useAuthStore } = await import('@/store/authStore');
      const { user } = useAuthStore.getState();
      
      const totalBase = selectedServices.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
      
      await import('@/lib/api-client').then(m => m.default.post('/orders/checkout', {
        businessProfileId: business.id,
        orderType: 'SERVICE_BOOKING',
        customerName: user?.name || 'Guest User',
        customerPhone: user?.phoneNumber || '9999999999',
        serviceLocation: requestDetails,
        totalValue: totalBase,
        status: 'PENDING',
        items: selectedServices.map(s => ({
          catalogItemId: s.id,
          quantity: 1,
          priceAtTimeOfOrder: s.price || 0
        }))
      }));
      
      alert('Request Submitted Successfully! The vendor will review and accept.');
      setIsRequestModalOpen(false);
      setSelectedServices([]);
      setRequestDetails('');
    } catch (error) {
      console.error(error);
      alert('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const profileImage = business.media?.find((m: any) => m.type === 'shop_photo' || m.type === 'profile_image')?.secureUrl 
    || 'https://images.unsplash.com/photo-1540569014015-19a7be504e3a?auto=format&fit=crop&w=400&q=80';

  const isVerified = business.membershipTier === 'Pro' || business.membershipTier === 'Starter';
  const experience = business.metaData?.experience || '5+ Years';

  return (
    <div className="w-full relative min-h-screen">
      {/* Hero Profile Card */}
      <div className="bg-zinc-900 rounded-2xl p-6 shadow-lg mb-8 flex items-center gap-6 border border-zinc-800">
        <div className="relative shrink-0">
          <div className="w-24 h-24 rounded-full overflow-hidden border-4 border-zinc-800">
            <img src={profileImage} alt={business.businessName} className="w-full h-full object-cover" />
          </div>
          {isVerified && (
            <div className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-1 border-2 border-zinc-900">
              <ShieldCheck className="w-5 h-5 text-white" />
            </div>
          )}
        </div>
        <div className="flex-1">
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {business.businessName}
          </h2>
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-zinc-400">
            <span className="flex items-center gap-1 bg-zinc-800 px-2.5 py-1 rounded-md">
              <User className="w-4 h-4" /> Professional
            </span>
            <span className="flex items-center gap-1 bg-zinc-800 px-2.5 py-1 rounded-md">
              <Wrench className="w-4 h-4" /> {experience} Exp
            </span>
            {isVerified && (
              <span className="text-blue-400 font-medium">Verified Pro</span>
            )}
          </div>
        </div>
      </div>

      {/* Services Checklist */}
      <div className="mb-32">
        <h3 className="text-xl font-bold text-zinc-100 mb-6">Select Services</h3>
        <div className="space-y-4">
          {business.catalogItems?.map(item => {
            const isSelected = selectedServices.some(s => s.id === item.id);
            return (
              <div 
                key={item.id}
                onClick={() => toggleService(item)}
                className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex gap-4 ${isSelected ? 'border-green-500 bg-green-500/10' : 'border-zinc-800 bg-zinc-900/50 hover:border-zinc-700'}`}
              >
                <div className={`w-6 h-6 rounded-md border-2 flex items-center justify-center shrink-0 mt-1 ${isSelected ? 'border-green-500 bg-green-500' : 'border-zinc-600'}`}>
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
                <div className="flex-1">
                  <h4 className={`text-lg font-bold ${isSelected ? 'text-green-400' : 'text-zinc-100'}`}>
                    {item.title}
                  </h4>
                  <div className="text-zinc-400 mt-1 font-medium">
                    ₹{item.price?.toString()}
                  </div>
                  {item.description && (
                    <p className="text-zinc-500 text-sm mt-2 leading-relaxed">
                      {item.description}
                    </p>
                  )}
                </div>
                {item.mediaUrl && (
                  <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0">
                    <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
                  </div>
                )}
              </div>
            );
          })}
          {(!business.catalogItems || business.catalogItems.length === 0) && (
            <div className="text-center py-12 text-zinc-500">
              No services listed by this professional yet.
            </div>
          )}
        </div>
      </div>

      {/* Sticky Bottom Action Bar */}
      <div className="sticky bottom-0 left-0 right-0 p-4 bg-zinc-900 border-t border-zinc-800 z-50 shadow-[0_-10px_30px_rgba(0,0,0,0.5)] mt-auto">
        <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
          {selectedServices.length > 0 ? (
            <>
              <div className="text-zinc-100 flex-1">
                <div className="text-sm text-zinc-400">{selectedServices.length} service(s) selected</div>
                <div className="font-bold text-lg">
                  ₹{selectedServices.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0)} <span className="text-sm font-normal text-zinc-400">base est.</span>
                </div>
              </div>
              <button 
                onClick={handlePrimaryAction}
                className="bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 px-6 rounded-xl transition-colors shadow-lg shadow-green-900/20 whitespace-nowrap"
              >
                {connectionMode === 'DIRECT' ? 'Request Pro' : 'Request to Book'}
              </button>
            </>
          ) : (
            <button 
              onClick={handlePrimaryAction}
              className="w-full bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 px-8 rounded-xl transition-colors shadow-lg shadow-green-900/20"
            >
              {connectionMode === 'DIRECT' ? 'Contact Professional' : 'Request to Book'}
            </button>
          )}
        </div>
      </div>

      {/* Request Modal */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-zinc-900 w-full max-w-md rounded-2xl p-6 border border-zinc-800 shadow-2xl relative">
            <button onClick={() => setIsRequestModalOpen(false)} className="absolute top-4 right-4 text-zinc-400 hover:text-white">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold text-white mb-2">Request to Book</h3>
            <p className="text-zinc-400 text-sm mb-6">Describe your requirements or any specific problems you're facing. This helps the professional understand if they can help.</p>
            
            <textarea 
              value={requestDetails}
              onChange={(e) => setRequestDetails(e.target.value)}
              className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-4 text-white focus:outline-none focus:border-green-500 min-h-[120px] mb-4"
              placeholder="E.g. I have a leaky faucet in my kitchen that needs fixing..."
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
