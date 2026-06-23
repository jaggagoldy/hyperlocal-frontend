'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Compass, MapPin, Star, Phone, Navigation, X } from 'lucide-react';
import { Listing } from '@/lib/directory';

interface ProximityMapProps {
  items: Listing[];
  cityName: string;
  onClose?: () => void;
}

export default function ProximityMap({ items, cityName, onClose }: ProximityMapProps) {
  const [radarScanning, setRadarScanning] = useState(true);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  
  // Seed fixed pseudo-random polar coordinates (radius & angle) for items
  // based on their ID string so they render in deterministic positions on our radar.
  const [mappedPins, setMappedPins] = useState<any[]>([]);

  useEffect(() => {
    const pins = items.map((item, idx) => {
      // Create hash from ID to get unique but deterministic layout positions
      let hash = 0;
      for (let i = 0; i < item.id.length; i++) {
        hash = item.id.charCodeAt(i) + ((hash << 5) - hash);
      }
      
      const angle = Math.abs(hash % 360) * (Math.PI / 180);
      
      // Radius between 20% and 85% of radar boundary
      const distance = 0.2 + (Math.abs(hash * 33) % 65) / 100; 
      
      // Convert polar to cartesian centered at (50%, 50%)
      const x = 50 + distance * 40 * Math.cos(angle);
      const y = 50 + distance * 40 * Math.sin(angle);
      
      // Calculate realistic distance in km (0.2km to 3.5km)
      const distanceKm = (distance * 4).toFixed(1);

      return {
        ...item,
        x,
        y,
        distanceKm,
        coverImage: item.media?.find(m => m.type === 'profile_image' || m.type === 'gallery')?.secureUrl 
          || item.media?.[0]?.secureUrl 
          || 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?auto=format&fit=crop&w=150&h=150'
      };
    });

    setMappedPins(pins);
    
    // Automatically select the first vendor if available
    if (pins.length > 0) {
      setSelectedListing(pins[0]);
    }
  }, [items]);

  return (
    <div className="relative w-full h-[500px] md:h-[600px] bg-zinc-950 rounded-3xl border border-zinc-800 shadow-2xl overflow-hidden font-sans text-white">
      
      {/* Glow Ambient */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-emerald-500/10 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-80 h-80 bg-cyan-500/10 rounded-full blur-[100px] pointer-events-none" />

      {/* ─── RADAR DISPLAY CANVAS ─── */}
      <div className="absolute inset-0 flex items-center justify-center p-6 pb-40">
        <div className="relative w-[340px] h-[340px] sm:w-[380px] sm:h-[380px] rounded-full border border-emerald-900/35 bg-zinc-900/10 backdrop-blur-md flex items-center justify-center">
          
          {/* Radar sweeping line */}
          {radarScanning && (
            <div className="absolute inset-0 rounded-full overflow-hidden pointer-events-none z-10">
              <div 
                className="w-1/2 h-1/2 bg-gradient-to-tr from-emerald-500/15 via-emerald-500/5 to-transparent origin-bottom-right absolute top-0 left-0 animate-spin" 
                style={{ animationDuration: '6s', transformOrigin: '100% 100%' }}
              />
            </div>
          )}

          {/* Center User Dot ("You") */}
          <div className="absolute z-20 w-8 h-8 flex items-center justify-center">
            <span className="absolute w-6 h-6 rounded-full bg-emerald-500/20 animate-ping duration-1000" />
            <span className="absolute w-3.5 h-3.5 rounded-full bg-emerald-500 border-2 border-zinc-950 shadow-md" />
          </div>

          {/* Radial Concentric Rings */}
          <div className="absolute w-3/4 h-3/4 rounded-full border border-emerald-900/30 border-dashed flex items-center justify-center">
            <span className="absolute -top-3.5 text-[8px] font-black text-emerald-800 tracking-widest uppercase">1.0 KM</span>
          </div>
          <div className="absolute w-1/2 h-1/2 rounded-full border border-emerald-900/20 border-dashed flex items-center justify-center">
            <span className="absolute -top-3.5 text-[8px] font-black text-emerald-800/60 tracking-widest uppercase">0.5 KM</span>
          </div>
          <div className="absolute w-[92%] h-[92%] rounded-full border border-emerald-900/40 border-dashed flex items-center justify-center">
            <span className="absolute -top-3.5 text-[8px] font-black text-emerald-800 tracking-widest uppercase">2.0 KM</span>
          </div>

          {/* Compass grid lines */}
          <div className="absolute w-full h-[1px] bg-emerald-950/20" />
          <div className="absolute h-full w-[1px] bg-emerald-950/20" />

          {/* Mapped Vendor Pins */}
          {mappedPins.map((pin) => {
            const isSelected = selectedListing?.id === pin.id;
            return (
              <button
                key={pin.id}
                onClick={() => setSelectedListing(pin)}
                className="absolute z-20 group -translate-x-1/2 -translate-y-1/2 transition-all duration-300"
                style={{ left: `${pin.x}%`, top: `${pin.y}%` }}
              >
                {/* Glowing Radar target marker */}
                <div className="relative flex items-center justify-center">
                  <span className={`absolute w-7 h-7 rounded-full transition-all duration-300 ${
                    isSelected ? 'bg-emerald-500/20 scale-120 animate-pulse' : 'bg-transparent group-hover:bg-emerald-500/10'
                  }`} />
                  
                  {/* Pin Dot */}
                  <div className={`w-4.5 h-4.5 rounded-full flex items-center justify-center border transition-all shadow-md ${
                    isSelected 
                      ? 'bg-emerald-500 border-white text-zinc-950 scale-125' 
                      : 'bg-zinc-900 border-emerald-500/80 text-emerald-400 group-hover:scale-110'
                  }`}>
                    <span className="w-1.5 h-1.5 rounded-full bg-current" />
                  </div>

                  {/* Name tooltip */}
                  <span className="absolute top-6 left-1/2 -translate-x-1/2 whitespace-nowrap bg-zinc-900/90 text-white border border-zinc-800 text-[8px] font-bold px-2 py-0.5 rounded shadow-lg pointer-events-none opacity-0 group-hover:opacity-100 transition-opacity">
                    {pin.businessName}
                  </span>
                </div>
              </button>
            );
          })}

        </div>
      </div>

      {/* ─── RADAR CONTROLS / TITLE ─── */}
      <div className="absolute top-4 left-4 right-4 flex justify-between items-center z-30">
        <div className="flex items-center gap-2 bg-zinc-900/80 border border-zinc-850 px-3 py-1.5 rounded-full backdrop-blur-md shadow-lg">
          <Compass className={`w-4 h-4 text-emerald-500 ${radarScanning ? 'animate-spin' : ''}`} style={{ animationDuration: '8s' }} />
          <div>
            <span className="text-[9px] font-black uppercase text-emerald-500 tracking-wider">Radar Search ACTIVE</span>
            <p className="text-[10px] text-zinc-400 font-bold -mt-0.5">{mappedPins.length} Pros nearby {cityName}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button 
            onClick={() => setRadarScanning(!radarScanning)}
            className="text-[10px] font-black uppercase tracking-wider bg-zinc-900/80 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 px-3.5 py-2 rounded-full backdrop-blur-md"
          >
            {radarScanning ? 'Pause Scan' : 'Scan'}
          </button>
          
          {onClose && (
            <button 
              onClick={onClose}
              className="w-9 h-9 flex items-center justify-center bg-zinc-900/80 border border-zinc-800 hover:bg-zinc-800 hover:border-zinc-700 rounded-full backdrop-blur-md"
            >
              <X className="w-4 h-4 text-zinc-400" />
            </button>
          )}
        </div>
      </div>

      {/* ─── SELECTED VENDOR PREVIEW CARD (SLIDES UP AT BOTTOM) ─── */}
      {selectedListing && (
        <div className="absolute bottom-4 left-4 right-4 z-30 bg-zinc-900/90 border border-zinc-850 p-4.5 rounded-2xl backdrop-blur-lg shadow-2xl flex gap-4 animate-in slide-in-from-bottom duration-300">
          
          {/* Logo/Image */}
          <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-xl overflow-hidden bg-zinc-800 shrink-0 border border-zinc-800">
            <img 
              src={(selectedListing as any).coverImage} 
              alt={selectedListing.businessName}
              className="w-full h-full object-cover"
            />
          </div>

          {/* Details */}
          <div className="flex-1 min-w-0 flex flex-col justify-between">
            <div className="space-y-1">
              <div className="flex items-start justify-between gap-2">
                <h4 className="font-extrabold text-sm sm:text-base text-white truncate leading-tight">
                  {selectedListing.businessName}
                </h4>
                {selectedListing.rating > 0 && (
                  <span className="flex shrink-0 items-center gap-0.5 rounded-md bg-amber-500/10 px-1.5 py-0.5 text-[10px] font-black text-amber-400 border border-amber-500/20">
                    <Star className="h-3 w-3 fill-amber-500 text-amber-500 animate-pulse" />
                    {selectedListing.rating.toFixed(1)}
                  </span>
                )}
              </div>
              
              <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 font-semibold">
                <MapPin className="w-3.5 h-3.5 text-zinc-550 shrink-0" />
                <span className="truncate">{selectedListing.localityName}</span>
                <span className="text-zinc-700 font-normal">|</span>
                <span className="text-emerald-400 font-extrabold flex items-center gap-0.5 uppercase tracking-wide">
                  <Navigation className="w-2.5 h-2.5 rotate-45 shrink-0" />
                  {(selectedListing as any).distanceKm} km away
                </span>
              </div>
            </div>

            {/* CTAs */}
            <div className="flex items-center gap-2 mt-3.5">
              {/* Directions */}
              {selectedListing.latitude && selectedListing.longitude ? (
                <a
                  href={`https://www.google.com/maps/dir/?api=1&destination=${selectedListing.latitude},${selectedListing.longitude}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex-1 h-9 flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-zinc-950 font-black rounded-xl text-xs shadow-md shadow-emerald-600/15 active:scale-95 transition-all text-white"
                >
                  <Navigation className="w-3.5 h-3.5 shrink-0 fill-current rotate-45" />
                  Route
                </a>
              ) : null}

              {/* Call */}
              {selectedListing.metaData?.osm?.contactPhone ? (
                <a
                  href={`tel:${selectedListing.metaData.osm.contactPhone}`}
                  className="h-9 w-9 flex items-center justify-center bg-zinc-800 hover:bg-zinc-750 text-white rounded-xl border border-zinc-750 hover:border-zinc-700 shrink-0 transition-colors"
                >
                  <Phone className="w-4 h-4 shrink-0" />
                </a>
              ) : null}

              <Link
                href={`/${selectedListing.slug}`}
                className="px-4 h-9 flex items-center justify-center bg-zinc-800 hover:bg-zinc-750 text-white rounded-xl border border-zinc-750 hover:border-zinc-700 font-bold text-xs shrink-0 transition-colors"
              >
                View
              </Link>
            </div>

          </div>

        </div>
      )}

    </div>
  );
}
