import React from 'react';
import { THEME_FLAVORS, ThemeFlavor } from '@/config/themes';
import { CheckCircle2, ShieldCheck, MapPin, ArrowRight } from 'lucide-react';

interface VendorProfilePreviewProps {
  businessName: string;
  customServiceType: string;
  themeFlavor: string;
  catalogCount?: number;
  localityName?: string;
  city?: string;
  idVerified?: boolean;
}

export function VendorProfilePreview({ 
  businessName, 
  customServiceType, 
  themeFlavor, 
  catalogCount = 0,
  localityName = 'Locality',
  city = 'City',
  idVerified = false
}: VendorProfilePreviewProps) {
  const theme = THEME_FLAVORS[themeFlavor as ThemeFlavor] || THEME_FLAVORS['trust-utility'];
  const bgClasses = theme.colors?.background || 'bg-white border-zinc-200';
  const badgeClasses = theme.colors?.badge || 'bg-zinc-100 text-zinc-600';
  const buttonClasses = theme.colors?.button || 'bg-black text-white';

  return (
    <div className={`p-5 rounded-xl border transition-all shadow-sm ${bgClasses}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-white/50 border border-black/5 flex items-center justify-center font-black text-lg shadow-sm">
            {businessName ? businessName.charAt(0).toUpperCase() : 'B'}
          </div>
          <div>
            <h3 className="font-bold text-base leading-tight" style={{ color: 'inherit' }}>
              {businessName || 'Your Business Name'}
            </h3>
            <div className="text-xs opacity-80 mt-0.5 flex items-center gap-1" style={{ color: 'inherit' }}>
              <MapPin className="w-3 h-3" />
              {localityName}, {city}
            </div>
          </div>
        </div>
        {idVerified && (
          <div className="bg-emerald-50 text-emerald-700 border border-emerald-100 px-2 py-1 rounded text-[9px] font-black uppercase flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" /> Verified
          </div>
        )}
      </div>

      <div className="mb-4">
        <p className="text-xs font-medium opacity-90" style={{ color: 'inherit' }}>
          {customServiceType || 'Your Service Tagline / Specialty'}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-4">
        {[...Array(Math.max(2, Math.min(catalogCount || 2, 4)))].map((_, i) => (
          <div key={i} className="h-16 rounded-lg bg-black/5 border border-black/5 flex flex-col justify-end p-2 relative overflow-hidden">
            <div className="absolute top-1 left-1 bg-black/20 text-white text-[8px] px-1 rounded font-bold">Service {i+1}</div>
            <div className="h-2 w-1/2 bg-black/10 rounded mt-auto" />
            <div className="h-2 w-1/3 bg-black/10 rounded mt-1" />
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between">
        <span className={`text-[10px] px-2 py-1 rounded-full font-bold flex items-center gap-1 ${badgeClasses}`}>
          <CheckCircle2 className="w-3 h-3" /> {catalogCount} Services Active
        </span>
        <button className={`px-4 py-2 rounded-lg flex items-center justify-center text-xs font-bold gap-1 shadow-sm ${buttonClasses}`}>
          Request Quote <ArrowRight className="w-3 h-3" />
        </button>
      </div>
    </div>
  );
}
