'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { Home, Check, Heart, Building, Calendar, Star } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardHotelLuxury({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [rooms, setRooms] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [room, setRoom] = useState('');
  const [date, setDate] = useState('');
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
    <div className="min-h-screen bg-stone-950 text-stone-100 font-serif pb-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-5%] left-[-10%] w-[350px] h-[350px] bg-amber-500/10 rounded-full blur-[90px] pointer-events-none"></div>

      {/* HOTEL HERO BANNER */}
      <div className="relative h-64 bg-stone-900">
        <img 
          src={meta.bannerUrl || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=800&q=80"} 
          alt="Boutique Hotel" 
          className="w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-950 to-transparent"></div>
        <div className="absolute bottom-6 left-6 flex items-end gap-4 z-10 font-sans">
          <div className="w-20 h-20 rounded-2xl bg-stone-900 border-2 border-amber-500 overflow-hidden shrink-0 shadow-md">
            <img 
              src={meta.logoUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=256&h=256"} 
              alt="Hotel Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10px] font-bold uppercase rounded-md tracking-wider">BOUTIQUE RETREAT</span>
              <span className="text-[10px] font-bold text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">★★★★★</span>
            </div>
            <h1 className="text-2xl font-black text-white mt-1 leading-tight">{business.businessName || 'Grand Imperial Palace'}</h1>
          </div>
        </div>
      </div>

      {/* TAGLINE */}
      <div className="px-6 py-4 border-b border-stone-850 bg-stone-950/20 font-sans">
        <p className="text-amber-400 text-sm font-semibold italic flex items-center gap-1.5">
          <Building className="w-4 h-4 text-amber-500" /> "{meta.tagline || 'Experience majestic luxury and royal comfort.'}"
        </p>
      </div>

      {/* AMENITIES */}
      {amenitiesList.length > 0 && (
        <div className="px-6 py-6">
          <h3 className="text-xs font-bold tracking-widest text-amber-500 uppercase mb-3 font-sans">Palace Amenities</h3>
          <div className="grid grid-cols-2 gap-2 bg-stone-900 border border-stone-850 p-4 rounded-xl shadow-md font-sans">
            {amenitiesList.map((amenity, i) => (
              <div key={i} className="flex items-center gap-2 text-stone-300 text-xs font-semibold">
                <Check className="w-4 h-4 text-amber-500 shrink-0" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROOMS & SUITES (CATALOG) */}
      <div className="px-6 py-2">
        <h3 className="text-xs font-bold tracking-widest text-amber-500 uppercase mb-4 flex items-center gap-1.5 font-sans">
          <Home className="w-4 h-4 text-amber-500" /> Suites & Rates
        </h3>
        {rooms.filter(r => r.isActive !== false).length > 0 ? (
          <div className="space-y-4">
            {rooms.filter(r => r.isActive !== false).map((room) => (
              <div key={room.id} className="bg-stone-900 border border-stone-850 rounded-2xl overflow-hidden shadow-md">
                {room.mediaUrl && (
                  <div className="h-44 w-full overflow-hidden">
                    <img src={room.mediaUrl} alt={room.title} className="w-full h-full object-cover opacity-80" />
                  </div>
                )}
                <div className="p-4 font-sans">
                  <h4 className="font-bold text-white text-sm">{room.title}</h4>
                  {room.description && <p className="text-xs text-stone-400 mt-1 line-clamp-1">{room.description}</p>}
                  <div className="mt-3 flex items-center justify-between border-t border-stone-800 pt-3">
                    <span className="font-bold text-amber-400 text-sm">₹{room.price} / night</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 font-sans">
            <div className="bg-stone-900 border border-stone-850 p-4 rounded-xl flex justify-between items-center shadow-md">
              <div>
                <h4 className="font-bold text-white text-sm">Royal Suite</h4>
                <p className="text-xs text-stone-400">Exclusive butler service, king bed</p>
              </div>
              <span className="font-black text-amber-400 text-sm">₹8,000 / night</span>
            </div>
          </div>
        )}
      </div>

      {/* BOOK RESERVATION */}
      <div className="px-6 pb-8">
        <div className="bg-stone-900 border border-stone-800 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-base font-bold text-white mb-4 text-center font-sans flex items-center justify-center gap-1.5">
            <Heart className="w-4 h-4 text-amber-500 fill-current" /> Stay Inquiry
          </h3>
          {submitted ? (
            <div className="text-center py-6 bg-stone-950/80 rounded-2xl font-sans border border-amber-500/20">
              <Check className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-white font-bold text-sm">Stay Query Registered!</p>
              <p className="text-stone-400 text-xs mt-1">We will check vacancy and contact you for confirmation.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Guest Name" 
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-100 placeholder-stone-600 focus:bg-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all font-medium" 
              />
              <input 
                type="tel" 
                required 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="Mobile Number" 
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-100 placeholder-stone-600 focus:bg-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all font-medium" 
              />
              <input 
                type="date" 
                required 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-105 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all" 
              />
              <select 
                value={room} 
                onChange={e => setRoom(e.target.value)}
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-300 focus:bg-stone-900 focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none transition-all font-medium"
              >
                <option value="">Preferred Room / Suite</option>
                {rooms.map(r => <option key={r.id} value={r.title}>{r.title}</option>)}
                <option value="Royal Suite">Royal Suite</option>
              </select>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-600 text-stone-950 font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 text-sm uppercase tracking-wider border border-amber-650/30"
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
