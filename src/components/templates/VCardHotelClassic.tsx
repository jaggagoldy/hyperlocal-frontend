'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { Home, Check, Phone, Mail, Globe, ArrowRight, Shield, Calendar, Star, Building } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardHotelClassic({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [rooms, setRooms] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [roomType, setRoomType] = useState('');
  const [checkIn, setCheckIn] = useState('');
  const [guests, setGuests] = useState('1');
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
  const hotelStarRating = meta.starRating || '3 Star';

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* HOTEL HERO BANNER */}
      <div className="relative h-64 bg-slate-900">
        <img 
          src={meta.bannerUrl || "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=800&q=80"} 
          alt="Hotel Showcase" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent"></div>
        <div className="absolute bottom-6 left-6 flex items-end gap-4 z-10">
          <div className="w-20 h-20 rounded-2xl bg-white border-2 border-indigo-600 overflow-hidden shrink-0 shadow-md">
            <img 
              src={meta.logoUrl || "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=256&h=256"} 
              alt="Hotel Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase rounded-md tracking-wider">HOTELS & BANQUETS</span>
              <span className="flex items-center gap-0.5 text-[10px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-100 uppercase">{hotelStarRating}</span>
            </div>
            <h1 className="text-2xl font-black text-slate-900 mt-1 leading-tight">{business.businessName || 'Golden Palace Hotel'}</h1>
            {meta.displayName && <p className="text-xs text-slate-500 mt-0.5">Manager: {meta.displayName}</p>}
          </div>
        </div>
      </div>

      {/* TAGLINE */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white">
        <p className="text-indigo-755 text-sm font-semibold italic flex items-center gap-1">
          <Building className="w-4 h-4 text-indigo-500" /> "{meta.tagline || 'Experience world-class hospitality and luxury comfort.'}"
        </p>
      </div>

      {/* AMENITIES */}
      {amenitiesList.length > 0 && (
        <div className="px-6 py-6">
          <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Hotel Services & Amenities</h3>
          <div className="grid grid-cols-2 gap-2 bg-white p-4 rounded-xl border border-slate-200 shadow-xs">
            {amenitiesList.map((amenity, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-650 text-xs font-semibold">
                <Check className="w-4 h-4 text-indigo-600 shrink-0" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ROOMS & SUITES (CATALOG) */}
      <div className="px-6 py-2">
        <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4 flex items-center gap-1">
          <Home className="w-4 h-4 text-indigo-600" /> Rooms & Booking Rates
        </h3>
        {rooms.filter(r => r.isActive !== false).length > 0 ? (
          <div className="space-y-4">
            {rooms.filter(r => r.isActive !== false).map((room) => (
              <div key={room.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {room.mediaUrl && (
                  <div className="h-44 w-full overflow-hidden">
                    <img src={room.mediaUrl} alt={room.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h4 className="font-bold text-slate-900 text-sm">{room.title}</h4>
                  {room.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{room.description}</p>}
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="font-bold text-indigo-600 text-sm">₹{room.price} / night</span>
                    <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-100 uppercase">Bookable</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Deluxe AC Room</h4>
                <p className="text-xs text-slate-500">King bed, free Wifi, LED TV</p>
              </div>
              <span className="font-bold text-indigo-650 text-sm">₹2,200 / night</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Executive Banquet Hall</h4>
                <p className="text-xs text-slate-500">Capacity 150 guests, air-conditioned</p>
              </div>
              <span className="font-bold text-indigo-655 text-sm">₹25,000 / event</span>
            </div>
          </div>
        )}
      </div>

      {/* ABOUT TEXT */}
      {meta.aboutText && (
        <div className="px-6 py-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">About The Property</h3>
            <p className="text-slate-650 text-sm leading-relaxed whitespace-pre-line">{meta.aboutText}</p>
          </div>
        </div>
      )}

      {/* ROOM ENQUIRY / BOOKING FORM */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
          <h3 className="text-base font-bold text-slate-900 mb-4 text-center">Check Room Availability / Stay Enquiry</h3>
          {submitted ? (
            <div className="text-center py-6 bg-indigo-50/50 rounded-xl border border-indigo-150">
              <Check className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-indigo-850 font-bold text-sm">Stay Request Sent!</p>
              <p className="text-indigo-700/85 text-xs mt-1">We will verify room occupancy and contact you immediately.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Primary Guest Name" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium" 
                />
              </div>
              <div>
                <input 
                  type="tel" 
                  required 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="Contact Mobile Number" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[10px] font-bold text-slate-450 uppercase mb-1 block">Check-In Date</label>
                  <input 
                    type="date" 
                    required 
                    value={checkIn} 
                    onChange={e => setCheckIn(e.target.value)} 
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium" 
                  />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-slate-450 uppercase mb-1 block">Total Guests</label>
                  <select 
                    value={guests} 
                    onChange={e => setGuests(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium"
                  >
                    <option value="1">1 Guest</option>
                    <option value="2">2 Guests</option>
                    <option value="3">3 Guests</option>
                    <option value="4+">4+ Guests</option>
                  </select>
                </div>
              </div>
              <div>
                <select 
                  value={roomType} 
                  onChange={e => setRoomType(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium"
                >
                  <option value="">Select Suite / Room Preference</option>
                  {rooms.map(r => <option key={r.id} value={r.title}>{r.title}</option>)}
                  <option value="Standard Room">Standard Room</option>
                  <option value="Deluxe Suite">Deluxe Suite</option>
                  <option value="Banquet Reservation">Banquet Reservation</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Checking Stay Availability...' : <>Request Stay Quote <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
