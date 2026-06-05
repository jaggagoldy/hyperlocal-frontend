'use client';

import { MapPin, Phone, Star, BadgeCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';

interface VendorCardProps {
  vendor: any;
  viewMode?: 'grid' | 'list';
}

export function VendorCard({ vendor, viewMode = 'grid' }: VendorCardProps) {
  const router = useRouter();
  
  const isVerified = vendor.idVerified || vendor.membershipTier === 'Pro' || vendor.membershipTier === 'Starter';
  
  const statusColors: Record<string, string> = {
    available: 'text-green-600',
    busy: 'text-orange-500',
    closed: 'text-gray-500',
    emergency: 'text-red-500',
  };

  const isTransactional = ['RESTAURANT', 'STREET_VENDOR', 'CLOUD_KITCHEN'].includes(vendor.businessType);
  const mainActionText = isTransactional ? 'Order Now' : 'Book Appointment';

  return (
    <div className={`bg-white border border-zinc-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex ${
      viewMode === 'list' ? 'flex-col sm:flex-row h-auto sm:h-64' : 'flex-col h-[420px]'
    }`}>
      {/* Cover Image */}
      <div className={`relative bg-zinc-100 flex-shrink-0 border-zinc-100 ${
        viewMode === 'list' ? 'h-48 sm:h-full w-full sm:w-64 border-b sm:border-b-0 sm:border-r' : 'h-48 w-full border-b'
      }`}>
        {vendor.profilePhotoUrl ? (
          <img 
            src={vendor.profilePhotoUrl} 
            alt={vendor.businessName} 
            className="w-full h-full object-cover"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-zinc-50 text-zinc-300 font-bold text-xl uppercase">
            {vendor.businessName?.charAt(0)}
          </div>
        )}
        
        {vendor.rating > 0 && (
          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-md text-zinc-900 px-2 py-1 rounded-lg font-black text-xs shadow-sm border border-zinc-200 flex items-center gap-1">
            <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
            {vendor.rating.toFixed(1)}
          </div>
        )}
      </div>
      
      {/* Details Section */}
      <div className={`p-4 flex flex-col flex-1 justify-between min-w-0 ${
        viewMode === 'list' ? 'sm:p-5' : ''
      }`}>
        <div className="space-y-3">
          <div>
            <h3 className="font-extrabold text-zinc-900 text-lg leading-tight truncate flex items-center gap-2">
              <span className="truncate">{vendor.businessName}</span>
              {isVerified && <BadgeCheck className="w-5 h-5 text-blue-500 fill-blue-500/10 flex-shrink-0" />}
              {vendor.businessType === 'FOOD_BEVERAGE' && (
                <span className="shrink-0 bg-orange-100 text-orange-700 border-orange-200 border px-1.5 py-0.5 rounded text-[10px] font-bold">Food</span>
              )}
              {vendor.businessType === 'CAB_TRANSPORT' && (
                <span className="shrink-0 bg-blue-100 text-blue-700 border-blue-200 border px-1.5 py-0.5 rounded text-[10px] font-bold">Cab</span>
              )}
              {(vendor.businessType === 'HOME_SERVICES' || vendor.businessType === 'SALON_BEAUTY' || vendor.businessType === 'HOME_ESSENTIALS') && (
                <span className="shrink-0 bg-purple-100 text-purple-700 border-purple-200 border px-1.5 py-0.5 rounded text-[10px] font-bold">Service</span>
              )}
            </h3>
            <p className={`text-xs font-bold mt-1 uppercase tracking-wider ${statusColors[vendor.status] || 'text-zinc-500'}`}>
              {vendor.status === 'available' && vendor.isOnline ? 'Available' : 'Not Available'}
            </p>
          </div>

          <div className="space-y-2 text-zinc-500 text-xs font-semibold">
            <p className="flex items-start gap-1.5 line-clamp-2">
              <MapPin className="w-4 h-4 text-zinc-400 shrink-0 mt-0.5" />
              <span>{vendor.localityName}, {vendor.chowkLandmark && `Near ${vendor.chowkLandmark}, `}{vendor.city?.name}</span>
            </p>
            {vendor.phoneNumber && (
              <p className="flex items-center gap-1.5 text-emerald-600">
                <Phone className="w-4 h-4 shrink-0" />
                {vendor.phoneNumber}
              </p>
            )}
          </div>
        </div>

        <div className={`pt-4 flex gap-2 ${
          viewMode === 'list' ? 'mt-auto' : 'flex-col mt-4'
        }`}>
          {!isTransactional && (
            <Button 
              variant="outline" 
              className="flex-1 bg-zinc-50 hover:bg-zinc-100 text-zinc-900 font-bold border-zinc-200"
              onClick={() => router.push(`/vendor/${vendor.slug}`)}
            >
              View Profile
            </Button>
          )}
          <Button 
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white font-bold shadow-md shadow-orange-500/20"
            onClick={() => router.push(`/vendor/${vendor.slug}`)}
          >
            {mainActionText}
          </Button>
        </div>
      </div>
    </div>
  );
}
