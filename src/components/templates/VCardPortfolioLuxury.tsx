'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { Sparkles, Check, Heart } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardPortfolioLuxury({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [services, setServices] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [packagePref, setPackagePref] = useState('');
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
    <div className="min-h-screen bg-stone-50 text-stone-900 font-serif pb-24">
      {/* EDITORIAL HERO */}
      <div className="pt-24 pb-12 px-6 text-center border-b border-stone-200/80 bg-white">
        <div className="mx-auto w-24 h-24 rounded-full border border-stone-200 p-1 mb-4 shadow-sm">
          <img 
            src={meta.logoUrl || "https://images.unsplash.com/photo-1519741497674-611481863552?auto=format&fit=crop&w=256&h=256"} 
            alt="Event Logo" 
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <span className="text-[10px] font-black text-amber-700 bg-amber-50 border border-amber-200 px-3 py-1 rounded uppercase tracking-widest font-sans">EDITORIAL DESIGN & EVENTS</span>
        <h1 className="text-3xl font-black tracking-tight text-stone-950 mt-4 leading-tight">
          {business.businessName || 'Atelier Signature'}
        </h1>
        <p className="text-stone-500 text-sm mt-3 leading-relaxed max-w-xs mx-auto font-sans italic">
          "{meta.tagline || 'Curation of elegant events and bespoke weddings.'}"
        </p>
      </div>

      {/* PORTFOLIO PACKAGES (CATALOG) */}
      <div className="px-6 py-8">
        <h3 className="text-xs font-bold tracking-widest text-amber-800 uppercase mb-4 text-center font-sans">Collections & Commissions</h3>
        {services.filter(s => s.isActive !== false).length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {services.filter(s => s.isActive !== false).map((service) => (
              <div key={service.id} className="bg-white rounded-2xl border border-stone-200/85 overflow-hidden shadow-xs">
                {service.mediaUrl && (
                  <div className="h-44 w-full overflow-hidden">
                    <img src={service.mediaUrl} alt={service.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4 flex items-center justify-between font-sans">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-stone-900 text-sm">{service.title}</h4>
                    {service.description && <p className="text-xs text-stone-500 mt-1 line-clamp-1">{service.description}</p>}
                  </div>
                  <span className="font-black text-amber-700 text-sm ml-4">₹{service.price}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3 font-sans">
            <div className="bg-white p-4 rounded-xl border border-stone-200/85 flex justify-between items-center shadow-xs">
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Full curation & styling</h4>
                <p className="text-xs text-stone-500">Luxury decor & planning</p>
              </div>
              <span className="font-black text-amber-700 text-sm">₹60,000</span>
            </div>
          </div>
        )}
      </div>

      {/* ABOUT TEXT */}
      {meta.aboutText && (
        <div className="px-6 pb-6">
          <div className="bg-white rounded-2xl p-5 border border-stone-200/85 shadow-xs">
            <h3 className="text-xs font-bold text-amber-800 uppercase tracking-widest mb-2 font-sans">Philosophy</h3>
            <p className="text-stone-650 text-sm leading-relaxed whitespace-pre-line font-sans">{meta.aboutText}</p>
          </div>
        </div>
      )}

      {/* LUXURY RESERVATION FORM */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-3xl p-6 border border-stone-250 shadow-md">
          <h3 className="text-md font-bold text-stone-950 mb-4 text-center font-sans flex items-center justify-center gap-1.5">
            <Heart className="w-4 h-4 text-amber-700 fill-current" /> Commission Request
          </h3>
          {submitted ? (
            <div className="text-center py-6 bg-stone-50 rounded-2xl font-sans">
              <Check className="w-8 h-8 text-amber-700 mx-auto mb-2" />
              <p className="text-stone-850 font-bold text-sm">Request Submitted</p>
              <p className="text-stone-500 text-xs mt-1">We will review details and check date occupancy.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4 font-sans">
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Full Name" 
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:border-amber-700 focus:ring-1 focus:ring-amber-700 outline-none transition-all font-medium" 
              />
              <input 
                type="tel" 
                required 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="Contact Mobile" 
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:border-amber-700 focus:ring-1 focus:ring-amber-700 outline-none transition-all font-medium" 
              />
              <div>
                <select 
                  value={packagePref} 
                  onChange={e => setPackagePref(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm text-stone-900 focus:bg-white focus:border-amber-700 focus:ring-1 focus:ring-amber-700 outline-none transition-all font-medium"
                >
                  <option value="">Preferred Commission / Service</option>
                  {services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                  <option value="Bespoke Wedding Decor">Bespoke Wedding Decor</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 bg-stone-950 hover:bg-black text-amber-400 font-bold rounded-xl transition-all shadow-md disabled:opacity-50 text-sm uppercase tracking-wider font-sans border border-amber-600/30"
              >
                {isSubmitting ? 'Submitting...' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
