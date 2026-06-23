'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { Sparkles, MapPin, Check, Phone, Scissors, Star, Heart } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardSalonModern({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [services, setServices] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [time, setTime] = useState('');
  const [service, setService] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (business.catalog !== undefined) {
      setServices(business.catalog || []);
    } else if (business.id) {
      apiClient.get(`/catalog?businessId=${business.id}`)
        .then(res => setServices(res.data.data || []))
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

  return (
    <div className="min-h-screen bg-neutral-900 text-stone-100 font-sans pb-24 relative overflow-hidden">
      {/* Background overlay */}
      <div className="absolute top-[-10%] right-[-10%] w-[300px] h-[300px] bg-amber-500/10 rounded-full blur-[80px] pointer-events-none"></div>

      {/* HERO SECTION */}
      <div className="pt-20 pb-12 px-6 text-center border-b border-stone-850 bg-stone-950/40 backdrop-blur-md relative z-10">
        <div className="mx-auto w-24 h-24 rounded-full border-2 border-amber-400 p-1 mb-4 shadow-xl">
          <img 
            src={meta.logoUrl || "https://images.unsplash.com/photo-1560066984-138dadb4c035?auto=format&fit=crop&w=256&h=256"} 
            alt="Salon Logo" 
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <span className="px-3 py-1 bg-amber-400/10 text-amber-400 border border-amber-400/30 text-[10px] font-bold uppercase rounded-full tracking-widest">LUXE SALON</span>
        <h1 className="text-3xl font-black text-white mt-3 leading-tight tracking-tight">{business.businessName || 'Luxe Parlour'}</h1>
        <p className="text-stone-400 text-xs mt-2 italic font-medium">"{meta.tagline || 'Experience premium hair styling and aesthetics.'}"</p>
      </div>

      {/* SPECIAL SERVICES (CATALOG) */}
      <div className="px-6 py-8 relative z-10">
        <h3 className="text-[10px] font-black tracking-widest text-amber-400 uppercase mb-5 flex items-center gap-1.5 justify-center">
          <Scissors className="w-3.5 h-3.5" /> Treatment Menu
        </h3>
        {services.filter(s => s.isActive !== false).length > 0 ? (
          <div className="grid grid-cols-1 gap-3.5">
            {services.filter(s => s.isActive !== false).map((item) => (
              <div key={item.id} className="bg-stone-850/60 backdrop-blur-md border border-stone-800/80 p-4 rounded-2xl flex items-center justify-between shadow-lg">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm">{item.title}</h4>
                  {item.description && <p className="text-xs text-stone-400 mt-1 line-clamp-1">{item.description}</p>}
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="font-black text-amber-400 text-sm">₹{item.price}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3.5">
            <div className="bg-stone-850/60 backdrop-blur-md border border-stone-800/80 p-4 rounded-2xl flex justify-between items-center shadow-lg">
              <div>
                <h4 className="font-bold text-white text-sm">Signature Haircut</h4>
                <p className="text-xs text-stone-400">Styling & wash included</p>
              </div>
              <span className="font-black text-amber-400 text-sm">₹499</span>
            </div>
            <div className="bg-stone-850/60 backdrop-blur-md border border-stone-800/80 p-4 rounded-2xl flex justify-between items-center shadow-lg">
              <div>
                <h4 className="font-bold text-white text-sm">Luxury Facial</h4>
                <p className="text-xs text-stone-400">Skin therapy (45 mins)</p>
              </div>
              <span className="font-black text-amber-400 text-sm">₹1,200</span>
            </div>
          </div>
        )}
      </div>

      {/* BOOKING SLOTS FORM */}
      <div className="px-6 pb-8 relative z-10">
        <div className="bg-stone-950/50 backdrop-blur-lg border border-amber-400/20 rounded-3xl p-6 shadow-2xl">
          <h3 className="text-base font-black text-white mb-4 text-center flex items-center justify-center gap-1.5">
            <Sparkles className="w-4 h-4 text-amber-400" /> Reserve Appointment
          </h3>
          {submitted ? (
            <div className="text-center py-6 bg-stone-900/80 rounded-2xl border border-amber-400/20">
              <Check className="w-8 h-8 text-amber-400 mx-auto mb-2" />
              <p className="text-white font-black text-sm">Reservation Request Sent!</p>
              <p className="text-stone-400 text-xs mt-1">We will contact you to confirm your slot.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Your Name" 
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-100 placeholder-stone-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all font-medium" 
                />
              </div>
              <div>
                <input 
                  type="tel" 
                  required 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="Mobile Number" 
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-100 placeholder-stone-600 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all font-medium" 
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="datetime-local" 
                  required 
                  value={time} 
                  onChange={e => setTime(e.target.value)} 
                  className="col-span-2 w-full bg-stone-900 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-100 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all" 
                />
              </div>
              <div>
                <select 
                  value={service} 
                  onChange={e => setService(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-300 focus:border-amber-400 focus:ring-1 focus:ring-amber-400 outline-none transition-all"
                >
                  <option value="">Select Treatment</option>
                  {services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                  <option value="Hair Styling">Hair Styling</option>
                  <option value="Skin Treatment">Skin Treatment</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-stone-950 font-black rounded-xl transition-all shadow-lg disabled:opacity-50 text-sm uppercase tracking-wider"
              >
                {isSubmitting ? 'Requesting...' : 'Request Slot'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
