'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { Sparkles, Check, Heart, Calendar } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardPortfolioDark({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [services, setServices] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [eventDate, setEventDate] = useState('');
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
    <div className="min-h-screen bg-stone-950 text-stone-100 font-sans pb-24 relative overflow-hidden">
      {/* Glow overlay */}
      <div className="absolute top-[-5%] left-[-10%] w-[350px] h-[350px] bg-pink-500/10 rounded-full blur-[90px] pointer-events-none"></div>

      {/* HEADER HERO */}
      <div className="pt-20 pb-10 px-6 text-center border-b border-stone-900 bg-stone-950/70 backdrop-blur-md relative z-10">
        <div className="mx-auto w-24 h-24 rounded-full border border-pink-500/20 p-1 bg-stone-900 mb-4 shadow-xl">
          <img 
            src={meta.logoUrl || "https://images.unsplash.com/photo-1511285560929-80b456fea0bc?auto=format&fit=crop&w=256&h=256"} 
            alt="Event Logo" 
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <span className="px-2.5 py-0.5 bg-pink-500/20 text-pink-400 border border-pink-500/30 text-[10px] font-bold uppercase rounded-md tracking-wider">CREATIVE STUDIO</span>
        <h1 className="text-2xl font-black text-white mt-3 leading-tight tracking-tight">{business.businessName || 'Cinematic Memories'}</h1>
        <p className="text-stone-400 text-xs mt-2 italic max-w-xs mx-auto">"{meta.tagline || 'Visual storytellers for your special moments.'}"</p>
      </div>

      {/* PORTFOLIO PACKAGES (CATALOG WITH IMAGES) */}
      <div className="px-6 py-8 relative z-10">
        <h3 className="text-xs font-bold tracking-widest text-pink-400 uppercase mb-4 flex items-center gap-1.5">
          <Sparkles className="w-4 h-4 text-pink-500" /> Event Portfolios & Pricing
        </h3>
        {services.filter(s => s.isActive !== false).length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {services.filter(s => s.isActive !== false).map((service) => (
              <div key={service.id} className="bg-stone-900 border border-stone-850 rounded-2xl overflow-hidden shadow-md">
                {service.mediaUrl && (
                  <div className="h-44 w-full overflow-hidden">
                    <img src={service.mediaUrl} alt={service.title} className="w-full h-full object-cover opacity-80 hover:opacity-100 transition-opacity" />
                  </div>
                )}
                <div className="p-4 flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-white text-sm">{service.title}</h4>
                    {service.description && <p className="text-xs text-stone-400 mt-1 line-clamp-1">{service.description}</p>}
                  </div>
                  <span className="font-black text-pink-400 text-sm ml-4">₹{service.price}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="bg-stone-900 border border-stone-850 p-4 rounded-xl flex justify-between items-center shadow-md">
              <div>
                <h4 className="font-bold text-white text-sm">Wedding Shoot Package</h4>
                <p className="text-xs text-stone-400">Full day coverage, video teaser</p>
              </div>
              <span className="font-black text-pink-400 text-sm">₹40,000</span>
            </div>
          </div>
        )}
      </div>

      {/* BIO */}
      {meta.aboutText && (
        <div className="px-6 pb-6 relative z-10">
          <div className="bg-stone-900 rounded-xl p-5 border border-stone-850 shadow-md">
            <h3 className="text-xs font-bold text-pink-400 uppercase tracking-widest mb-2">Our Vision</h3>
            <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-line">{meta.aboutText}</p>
          </div>
        </div>
      )}

      {/* ENQUIRY CARD */}
      <div className="px-6 pb-8 relative z-10">
        <div className="bg-stone-900 border border-stone-800 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-base font-bold text-white mb-4 text-center">Check Event Date Availability</h3>
          {submitted ? (
            <div className="text-center py-6 bg-stone-950/80 rounded-xl border border-pink-500/20">
              <Check className="w-8 h-8 text-pink-400 mx-auto mb-2" />
              <p className="text-white font-bold text-sm">Enquiry Submitted!</p>
              <p className="text-stone-550 text-xs mt-1">We will check our session dates and get back to you.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Your Name" 
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-100 placeholder-stone-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all font-medium" 
              />
              <input 
                type="tel" 
                required 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="Mobile / Contact Number" 
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-100 placeholder-stone-600 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all font-medium" 
              />
              <input 
                type="date" 
                required 
                value={eventDate} 
                onChange={e => setEventDate(e.target.value)} 
                className="w-full bg-stone-950 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-100 focus:border-pink-500 focus:ring-1 focus:ring-pink-500 outline-none transition-all" 
              />
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 bg-pink-600 hover:bg-pink-700 text-stone-950 font-black rounded-xl transition-all shadow-lg disabled:opacity-50 text-sm uppercase tracking-wider"
              >
                {isSubmitting ? 'Checking Calendar...' : 'Check Availability'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
