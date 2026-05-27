'use client';

import { Phone, MessageCircle, BadgeCheck, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import apiClient from '@/lib/api-client';

interface VendorCardProps {
  vendor: {
    id: string;
    businessName: string;
    localityName: string;
    chowkLandmark?: string;
    rating: number;
    status: string; // 'available', 'busy', 'closed', 'emergency', 'suspended'
    membershipTier: string;
    phoneNumber?: string;
  };
}

export function VendorCard({ vendor }: VendorCardProps) {
  const isVerified = vendor.membershipTier === 'Pro' || vendor.membershipTier === 'Starter';
  
  const statusColors: Record<string, string> = {
    available: 'bg-green-500',
    busy: 'bg-orange-500',
    closed: 'bg-gray-500',
    emergency: 'bg-red-500',
  };

  const handleInteraction = async (type: 'call_click' | 'whatsapp_click') => {
    try {
      // Asynchronously log interaction to backend
      apiClient.post('/analytics/interaction', { vendorId: vendor.id, type }).catch(() => {});
      
      const phone = vendor.phoneNumber || '1234567890'; // fallback
      if (type === 'call_click') {
        window.location.href = `tel:${phone}`;
      } else {
        window.location.href = `https://wa.me/${phone.replace('+', '')}`;
      }
    } catch (error) {
      console.error('Interaction trigger failed', error);
    }
  };

  return (
    <div className="bg-card border border-border rounded-xl p-4 shadow-sm flex flex-col gap-3">
      <div className="flex justify-between items-start">
        <div>
          <h3 className="font-semibold text-lg flex items-center gap-1.5 text-card-foreground">
            {vendor.businessName}
            {isVerified && <BadgeCheck className="w-5 h-5 text-blue-500" />}
          </h3>
          <p className="text-sm text-muted-foreground mt-0.5">
            {vendor.localityName} {vendor.chowkLandmark && `• Near ${vendor.chowkLandmark}`}
          </p>
        </div>
        <div className="flex flex-col items-end gap-1.5">
          <div className="flex items-center gap-1 bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-500 px-2 py-0.5 rounded text-sm font-medium">
            <Star className="w-3.5 h-3.5 fill-current" />
            {(vendor.rating || 0).toFixed(1)}
          </div>
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground font-medium">
            <span className={`w-2 h-2 rounded-full ${statusColors[vendor.status] || 'bg-gray-400'}`} />
            <span className="capitalize">{vendor.status || 'Unknown'}</span>
          </div>
        </div>
      </div>

      <div className="flex gap-3 mt-2">
        <Button 
          variant="outline" 
          className="flex-1 h-12 rounded-lg border-primary text-primary hover:bg-primary/10 font-semibold"
          onClick={() => handleInteraction('call_click')}
        >
          <Phone className="w-5 h-5 mr-2" />
          Call Now
        </Button>
        <Button 
          className="flex-1 h-12 rounded-lg bg-green-600 hover:bg-green-700 text-white font-semibold"
          onClick={() => handleInteraction('whatsapp_click')}
        >
          <MessageCircle className="w-5 h-5 mr-2" />
          WhatsApp
        </Button>
      </div>
    </div>
  );
}
