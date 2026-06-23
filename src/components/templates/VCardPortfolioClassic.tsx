'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { Sparkles, Image, Check, Calendar, ArrowRight, Star, Heart } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardPortfolioClassic({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [services, setServices] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
  const [packageSelected, setPackageSelected] = useState('');
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

  const cuisinesList: string[] = meta.taxonomy?.cuisines || [];
  const eventTypes: string[] = meta.taxonomy?.event_types || meta.taxonomy?.speciality || [];

  return (
    <div className="min-h-screen bg-pink-50/30 text-zinc-800 font-sans pb-24">
      {/* GLAMOUR BANNER HERO */}
      <div className="relative h-64 bg-pink-900">
        <img 
          src={meta.bannerUrl || "https://images.unsplash.com/photo-1469371670807-013ccf25f16a?auto=format&fit=crop&w=800&q=80"} 
          alt="Event Showcase" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-pink-50/30 to-transparent"></div>
        <div className="absolute bottom-6 left-6 flex items-end gap-4 z-10">
          <div className="w-20 h-20 rounded-2xl bg-white border-2 border-pink-400 overflow-hidden shrink-0 shadow-md">
            <img 
              src={meta.logoUrl || "https://images.unsplash.com/photo-1532712938310-34cb3982ef74?auto=format&fit=crop&w=256&h=256"} 
              alt="Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="px-2 py-0.5 bg-pink-100 text-pink-700 border border-pink-200 text-[10px] font-bold uppercase rounded-md tracking-wider">EVENTS & COORDINATION</span>
            <h1 className="text-2xl font-black text-zinc-900 mt-1 leading-tight">{business.businessName || 'Elite Planners'}</h1>
            {meta.displayName && <p className="text-xs text-zinc-500 mt-0.5">Lead Designer: {meta.displayName}</p>}
          </div>
        </div>
      </div>

      {/* TAGLINE */}
      <div className="px-6 py-4 border-b border-pink-100 bg-white">
        <p className="text-pink-700/80 text-sm font-semibold italic flex items-center gap-1">
          <Heart className="w-4 h-4 text-pink-500 fill-current" /> "{meta.tagline || 'Crafting unforgettable memories for your special moments.'}"
        </p>
      </div>

      {/* EVENTS / SERVICES LISTING */}
      {eventTypes.length > 0 && (
        <div className="px-6 py-6">
          <h3 className="text-xs font-bold tracking-widest text-pink-600 uppercase mb-3">Event Focus</h3>
          <div className="flex flex-wrap gap-2">
            {eventTypes.map((event, i) => (
              <span key={i} className="bg-white px-3.5 py-1.5 rounded-full border border-pink-200 text-xs font-bold text-pink-700 shadow-xs">
                {event}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* SERVICE PACKAGES (CATALOG) */}
      <div className="px-6 py-2">
        <h3 className="text-xs font-bold tracking-widest text-pink-600 uppercase mb-4 flex items-center gap-1">
          <Sparkles className="w-4 h-4 text-pink-500" /> Packages & Pricing
        </h3>
        {services.filter(s => s.isActive !== false).length > 0 ? (
          <div className="space-y-4">
            {services.filter(s => s.isActive !== false).map((service) => (
              <div key={service.id} className="bg-white rounded-2xl border border-pink-100 overflow-hidden shadow-xs">
                {service.mediaUrl && (
                  <div className="h-40 w-full overflow-hidden">
                    <img src={service.mediaUrl} alt={service.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-zinc-955 text-sm">{service.title}</h4>
                    {service.description && <p className="text-xs text-zinc-500 mt-1 line-clamp-2">{service.description}</p>}
                  </div>
                  <div className="text-right shrink-0 ml-4">
                    <span className="font-bold text-pink-600 text-sm">₹{service.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-xl border border-pink-100 flex justify-between items-center shadow-xs">
              <div>
                <h4 className="font-bold text-zinc-900 text-sm">Full Decor Package</h4>
                <p className="text-xs text-zinc-500">Floral arrangement + stage setup</p>
              </div>
              <span className="font-bold text-pink-600 text-sm">₹45,000</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-pink-100 flex justify-between items-center shadow-xs">
              <div>
                <h4 className="font-bold text-zinc-900 text-sm">Photography Session</h4>
                <p className="text-xs text-zinc-500">Professional shoot (4 hours)</p>
              </div>
              <span className="font-bold text-pink-600 text-sm">₹15,000</span>
            </div>
          </div>
        )}
      </div>

      {/* ABOUT DESCRIPTION */}
      {meta.aboutText && (
        <div className="px-6 py-6">
          <div className="bg-white rounded-2xl p-5 border border-pink-100 shadow-xs">
            <h3 className="text-xs font-bold text-pink-600 uppercase tracking-widest mb-2">Our Story</h3>
            <p className="text-zinc-650 text-sm leading-relaxed whitespace-pre-line">{meta.aboutText}</p>
          </div>
        </div>
      )}

      {/* BOOKING REQUEST FORM */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl p-6 border border-pink-100 shadow-md">
          <h3 className="text-base font-bold text-zinc-900 mb-4 text-center">Check Event Date & Package availability</h3>
          {submitted ? (
            <div className="text-center py-6 bg-pink-50/50 rounded-xl border border-pink-150">
              <Check className="w-8 h-8 text-pink-600 mx-auto mb-2" />
              <p className="text-pink-850 font-bold text-sm">Enquiry Received!</p>
              <p className="text-pink-700/80 text-xs mt-1">We will review our calendar and call you back.</p>
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
                  className="w-full bg-pink-50/30 border border-pink-100 rounded-xl p-3.5 text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all font-medium" 
                />
              </div>
              <div>
                <input 
                  type="tel" 
                  required 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="WhatsApp / Phone Number" 
                  className="w-full bg-pink-50/30 border border-pink-100 rounded-xl p-3.5 text-sm text-zinc-900 placeholder-zinc-400 focus:bg-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all font-medium" 
                />
              </div>
              <div>
                <input 
                  type="date" 
                  required 
                  value={eventDate} 
                  onChange={e => setEventDate(e.target.value)} 
                  className="w-full bg-pink-50/30 border border-pink-100 rounded-xl p-3.5 text-sm text-zinc-900 focus:bg-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all font-medium" 
                />
              </div>
              <div>
                <select 
                  value={packageSelected} 
                  onChange={e => setPackageSelected(e.target.value)}
                  className="w-full bg-pink-50/30 border border-pink-100 rounded-xl p-3.5 text-sm text-zinc-900 focus:bg-white focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all font-medium"
                >
                  <option value="">Choose Desired Package</option>
                  {services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                  <option value="Custom Decoration">Custom Decoration</option>
                  <option value="Catering Service">Catering Service</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Checking Calendar...' : <>Check Date Availability <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
