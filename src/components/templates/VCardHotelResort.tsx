'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { Home, Check, Heart, Building, Star } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardHotelResort({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [rooms, setRooms] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [room, setRoom] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (business.catalog !== undefined) {
      setRooms(business.catalog || []);
    } else if (business.id) {
      apiClient.get(`/catalog?businessId=${business.id}`)
        .then(res => setRooms(res.data.data || []))
        .catch(console.error);
    }
  }, [business.id, business.catalog]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  const amenitiesList: string[] = meta.taxonomy?.amenities || meta.taxonomy?.facilities || [];

  return (
    <div className="min-h-screen bg-[#faf7f2] text-amber-950 font-sans pb-24">
      {/* BANNER */}
      <div className="relative h-64 bg-orange-950">
        <img 
          src={meta.bannerUrl || "https://images.unsplash.com/photo-1571896349842-33c89424de2d?auto=format&fit=crop&w=800&q=80"} 
          alt="Resort Showcase" 
          className="w-full h-full object-cover opacity-45"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#faf7f2] to-transparent"></div>
        <div className="absolute bottom-6 left-6 flex items-end gap-4 z-10">
          <div className="w-20 h-20 rounded-2xl bg-white border-2 border-orange-400 overflow-hidden shrink-0 shadow-md">
            <img 
              src={meta.logoUrl || "https://images.unsplash.com/photo-1584132967334-10e028bd69f7?auto=format&fit=crop&w=256&h=256"} 
              alt="Resort Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="px-2 py-0.5 bg-orange-100 text-orange-700 border border-orange-200 text-[10px] font-bold uppercase rounded-md tracking-wider">RESORT & RETREAT</span>
            <h1 className="text-2xl font-black text-amber-950 mt-1 leading-tight">{business.businessName || 'Terracotta Palms Resort'}</h1>
          </div>
        </div>
      </div>

      {/* TAGLINE */}
      <div className="px-6 py-4 border-b border-orange-100 bg-white">
        <p className="text-orange-700/80 text-sm font-semibold italic flex items-center gap-1.5">
          <Building className="w-4 h-4 text-orange-500" /> "{meta.tagline || 'Your serene oasis of relaxation and comfort.'}"
        </p>
      </div>

      {/* AMENITIES */}
      {amenitiesList.length > 0 && (
        <div className="px-6 py-6">
          <h3 className="text-xs font-bold tracking-widest text-orange-600 uppercase mb-3">Resort Facilities</h3>
          <div className="grid grid-cols-2 gap-2 bg-white p-4 rounded-xl border border-orange-100 shadow-xs">
            {amenitiesList.map((amenity, i) => (
              <div key={i} className="flex items-center gap-2 text-amber-900 text-xs font-semibold">
                <Check className="w-4 h-4 text-orange-500 shrink-0" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROOMS & SUITES (CATALOG) */}
      <div className="px-6 py-2">
        <h3 className="text-xs font-bold tracking-widest text-orange-600 uppercase mb-4 flex items-center gap-1.5">
          <Home className="w-4 h-4 text-orange-500" /> Cabins & Villas
        </h3>
        {rooms.filter(r => r.isActive !== false).length > 0 ? (
          <div className="space-y-4">
            {rooms.filter(r => r.isActive !== false).map((room) => (
              <div key={room.id} className="bg-white rounded-2xl border border-orange-100 overflow-hidden shadow-xs">
                {room.mediaUrl && (
                  <div className="h-44 w-full overflow-hidden">
                    <img src={room.mediaUrl} alt={room.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h4 className="font-bold text-amber-950 text-sm">{room.title}</h4>
                  {room.description && <p className="text-xs text-amber-900/60 mt-1 line-clamp-1">{room.description}</p>}
                  <div className="mt-3 flex items-center justify-between border-t border-orange-50 pt-3">
                    <span className="font-bold text-orange-700 text-sm">₹{room.price} / night</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-xl border border-orange-100 flex justify-between items-center shadow-xs">
              <div>
                <h4 className="font-bold text-amber-955 text-sm">Palms Villa</h4>
                <p className="text-xs text-amber-900/60">Garden view, private terrace</p>
              </div>
              <span className="font-bold text-orange-700 text-sm">₹4,500 / night</span>
            </div>
          </div>
        )}
      </div>

      {/* BOOK RESERVATION */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl p-6 border border-orange-100 shadow-md">
          <h3 className="text-base font-bold text-amber-950 mb-4 text-center flex items-center justify-center gap-1.5">
            <Heart className="w-4 h-4 text-orange-500" /> Stay Booking Enquiry
          </h3>
          {submitted ? (
            <div className="text-center py-6 bg-orange-50/50 rounded-xl border border-orange-150">
              <Check className="w-8 h-8 text-orange-600 mx-auto mb-2" />
              <p className="text-amber-950 font-bold text-sm">Resort Booking Requested!</p>
              <p className="text-orange-700/80 text-xs mt-1">We will verify occupancy and contact you immediately.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Guest Full Name" 
                className="w-full bg-[#faf7f2] border border-orange-100 rounded-xl p-3.5 text-sm text-amber-950 placeholder-orange-300 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all font-medium" 
              />
              <input 
                type="tel" 
                required 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="Contact Mobile" 
                className="w-full bg-[#faf7f2] border border-orange-100 rounded-xl p-3.5 text-sm text-amber-950 placeholder-orange-300 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all font-medium" 
              />
              <select 
                value={room} 
                onChange={e => setRoom(e.target.value)}
                className="w-full bg-[#faf7f2] border border-orange-100 rounded-xl p-3.5 text-sm text-amber-950 focus:bg-white focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none transition-all font-medium"
              >
                <option value="">Select Cabin Type</option>
                {rooms.map(r => <option key={r.id} value={r.title}>{r.title}</option>)}
                <option value="Palms Villa">Palms Villa</option>
              </select>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 bg-orange-600 hover:bg-orange-700 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50 text-sm"
              >
                {isSubmitting ? 'Requesting...' : 'Request Stay Quote'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
