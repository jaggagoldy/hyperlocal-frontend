'use client';

import { useState, useEffect } from 'react';
import { Check, User, ShieldCheck, Wrench } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { BusinessProfile, CatalogItem } from '@/types/models';

interface HomeServicesLayoutProps {
  business: BusinessProfile;
  theme: any;
}

export default function HomeServicesLayout({ business, theme }: HomeServicesLayoutProps) {
  const [selectedServices, setSelectedServices] = useState<CatalogItem[]>([]);
  const searchParams = useSearchParams();

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

  const handleRequestProfessional = () => {
    if (selectedServices.length === 0) return;

    const totalBase = selectedServices.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);
    
    let message = `Hi! I found your profile on NearByBazar. I'd like to enquire about booking the following services:\n\n`;
    selectedServices.forEach(s => {
      message += `- ${s.title} (₹${s.price || 0})\n`;
    });
    message += `\nTotal Estimated Base: ₹${totalBase}\n\nAre you available? Let's discuss details.`;

    const phone = business.user?.phoneNumber || '9999999999'; // Fallback
    // Ensure phone number starts with country code if not present (simple hack for India +91)
    const formattedPhone = phone.startsWith('+') ? phone.replace('+', '') : (phone.length === 10 ? `91${phone}` : phone);
    
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
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
      {selectedServices.length > 0 && (
        <div className="fixed bottom-0 left-0 right-0 p-4 bg-zinc-900 border-t border-zinc-800 z-50 animate-in slide-in-from-bottom-full">
          <div className="max-w-5xl mx-auto flex items-center justify-between gap-4">
            <div className="text-zinc-100">
              <div className="text-sm text-zinc-400">{selectedServices.length} service(s) selected</div>
              <div className="font-bold text-lg">
                ₹{selectedServices.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0)} <span className="text-sm font-normal text-zinc-400">base est.</span>
              </div>
            </div>
            <button 
              onClick={handleRequestProfessional}
              className="bg-green-600 hover:bg-green-500 text-white font-bold py-3.5 px-8 rounded-xl transition-colors shadow-lg shadow-green-900/20"
            >
              Request Professional
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
