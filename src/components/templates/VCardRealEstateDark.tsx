'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { Home, Eye, MapPin, Check, Shield } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardRealEstateDark({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [properties, setProperties] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [property, setProperty] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (business.catalog !== undefined) {
      setProperties(business.catalog || []);
    } else if (business.id) {
      apiClient.get(`/catalog?businessId=${business.id}`)
        .then(res => setProperties(res.data.data || []))
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

  const propertyTypes: string[] = meta.taxonomy?.property_type || [];

  return (
    <div className="min-h-screen bg-neutral-900 text-stone-100 font-sans pb-24 relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute top-[-5%] left-[-10%] w-[350px] h-[350px] bg-blue-500/10 rounded-full blur-[90px] pointer-events-none"></div>

      {/* HERO SECTION */}
      <div className="pt-20 pb-10 px-6 text-center border-b border-stone-850 bg-stone-950/40 backdrop-blur-md relative z-10">
        <div className="mx-auto w-24 h-24 rounded-2xl border border-blue-500/20 p-1.5 bg-stone-800 mb-4 shadow-xl">
          <img 
            src={meta.logoUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=256&h=256"} 
            alt="Real Estate Logo" 
            className="w-full h-full rounded-xl object-cover"
          />
        </div>
        <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold uppercase rounded-md tracking-wider">PREMIUM REAL ESTATE</span>
        <h1 className="text-2xl font-black text-white mt-3 leading-tight tracking-tight">{business.businessName || 'Elite Listings'}</h1>
        <p className="text-stone-400 text-xs mt-2 italic max-w-xs mx-auto">"{meta.tagline || 'Modern spaces for modern lifestyles.'}"</p>
      </div>

      {/* PORTFOLIO SCOPE */}
      {propertyTypes.length > 0 && (
        <div className="px-6 py-6 relative z-10">
          <h3 className="text-xs font-bold tracking-widest text-blue-400 uppercase mb-3">Portfolio Scope</h3>
          <div className="flex flex-wrap gap-2">
            {propertyTypes.map((type, i) => (
              <span key={i} className="bg-stone-800 px-3.5 py-1.5 rounded-lg border border-stone-750 text-xs font-bold text-stone-200">
                {type}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CATALOG PROPERTIES (LISTINGS) */}
      <div className="px-6 py-2 relative z-10">
        <h3 className="text-xs font-bold tracking-widest text-blue-400 uppercase mb-4 flex items-center gap-1.5">
          <Home className="w-4 h-4 text-blue-500" /> Active Properties
        </h3>
        {properties.filter(p => p.isActive !== false).length > 0 ? (
          <div className="grid grid-cols-1 gap-4">
            {properties.filter(p => p.isActive !== false).map((prop) => (
              <div key={prop.id} className="bg-stone-850 border border-stone-800 rounded-2xl overflow-hidden shadow-md">
                {prop.mediaUrl && (
                  <div className="h-44 w-full overflow-hidden">
                    <img src={prop.mediaUrl} alt={prop.title} className="w-full h-full object-cover opacity-80" />
                  </div>
                )}
                <div className="p-4">
                  <h4 className="font-bold text-white text-sm">{prop.title}</h4>
                  {prop.description && <p className="text-xs text-stone-400 mt-1 line-clamp-1">{prop.description}</p>}
                  <div className="mt-3 flex items-center justify-between border-t border-stone-800 pt-3">
                    <span className="font-bold text-blue-400 text-sm">₹{prop.price}</span>
                    <span className="text-[9px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase">Active</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-stone-850 p-4 rounded-xl border border-stone-800 flex justify-between items-center shadow-md">
              <div>
                <h4 className="font-bold text-white text-sm">Luxury Flat (Sector 14)</h4>
                <p className="text-xs text-stone-400">3 BHK spacious, high-rise</p>
              </div>
              <span className="font-black text-blue-400 text-sm">₹25,000 / month</span>
            </div>
          </div>
        )}
      </div>

      {/* BIO */}
      {meta.aboutText && (
        <div className="px-6 py-6 relative z-10">
          <div className="bg-stone-850 rounded-xl p-5 border border-stone-800 shadow-md">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">Agency Details</h3>
            <p className="text-stone-300 text-sm leading-relaxed whitespace-pre-line">{meta.aboutText}</p>
          </div>
        </div>
      )}

      {/* BOOK VISIT FORM */}
      <div className="px-6 pb-8 relative z-10">
        <div className="bg-stone-850 border border-stone-800 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-base font-bold text-white mb-4 text-center">Schedule Site Visit</h3>
          {submitted ? (
            <div className="text-center py-6 bg-stone-900/80 rounded-xl border border-blue-500/20">
              <Check className="w-8 h-8 text-blue-400 mx-auto mb-2" />
              <p className="text-white font-bold text-sm">Visit Request Received!</p>
              <p className="text-stone-500 text-xs mt-1">Our agent will call you to confirm the time slot.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Full Name" 
                className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-100 placeholder-stone-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium" 
              />
              <input 
                type="tel" 
                required 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="Mobile Number" 
                className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-100 placeholder-stone-600 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium" 
              />
              <div>
                <select 
                  value={property} 
                  onChange={e => setProperty(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-305 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                >
                  <option value="">Choose Listing of Interest</option>
                  {properties.map(p => <option key={p.id} value={p.title}>{p.title}</option>)}
                  <option value="General Rent Inquiry">General Rent Inquiry</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 text-sm uppercase tracking-wider"
              >
                {isSubmitting ? 'Requesting...' : 'Request Inspection'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
