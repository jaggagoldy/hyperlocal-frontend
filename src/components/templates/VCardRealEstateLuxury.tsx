'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { Home, Eye, MapPin, Check, Shield } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardRealEstateLuxury({ business }: { business: BusinessProfile }) {
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
  const amenitiesList: string[] = meta.taxonomy?.amenities || [];

  return (
    <div className="min-h-screen bg-emerald-50/20 text-stone-800 font-sans pb-24">
      {/* REAL ESTATE HERO BANNER */}
      <div className="relative h-64 bg-emerald-950">
        <img 
          src={meta.bannerUrl || "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80"} 
          alt="Luxury Property" 
          className="w-full h-full object-cover opacity-35"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-emerald-50/20 to-transparent"></div>
        <div className="absolute bottom-6 left-6 flex items-end gap-4 z-10">
          <div className="w-20 h-20 rounded-2xl bg-white border-2 border-emerald-600 overflow-hidden shrink-0 shadow-md">
            <img 
              src={meta.logoUrl || "https://images.unsplash.com/photo-1582407947304-fd86f028f716?auto=format&fit=crop&w=256&h=256"} 
              alt="Real Estate Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 border border-emerald-250 text-[10px] font-bold uppercase rounded-md tracking-wider">PRESTIGE PROPERTIES</span>
            <h1 className="text-2xl font-black text-emerald-950 mt-1 leading-tight">{business.businessName || 'Greenway Realty'}</h1>
            {meta.displayName && <p className="text-xs text-stone-500 mt-0.5">Senior Consultant: {meta.displayName}</p>}
          </div>
        </div>
      </div>

      {/* TAGLINE */}
      <div className="px-6 py-4 border-b border-emerald-100 bg-white">
        <p className="text-emerald-800 text-sm font-semibold italic flex items-center gap-1">
          <Shield className="w-4 h-4 text-emerald-600" /> "{meta.tagline || 'Curating elite residences for sophisticated buyers.'}"
        </p>
      </div>

      {/* PROPERTY TYPES */}
      {propertyTypes.length > 0 && (
        <div className="px-6 py-6">
          <h3 className="text-xs font-bold tracking-widest text-emerald-700 uppercase mb-3">Portfolio Focus</h3>
          <div className="flex flex-wrap gap-2">
            {propertyTypes.map((type, i) => (
              <span key={i} className="bg-white px-3.5 py-1.5 rounded-xl border border-emerald-100 text-xs font-bold text-emerald-755 shadow-xs">
                {type}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE LISTINGS (CATALOG) */}
      <div className="px-6 py-2">
        <h3 className="text-xs font-bold tracking-widest text-emerald-700 uppercase mb-4 flex items-center gap-1.5">
          <Home className="w-4 h-4 text-emerald-600" /> Premium Catalog
        </h3>
        {properties.filter(p => p.isActive !== false).length > 0 ? (
          <div className="space-y-4">
            {properties.filter(p => p.isActive !== false).map((prop) => (
              <div key={prop.id} className="bg-white rounded-2xl border border-emerald-100 overflow-hidden shadow-xs">
                {prop.mediaUrl && (
                  <div className="h-44 w-full overflow-hidden">
                    <img src={prop.mediaUrl} alt={prop.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h4 className="font-bold text-emerald-950 text-sm">{prop.title}</h4>
                  {prop.description && <p className="text-xs text-stone-500 mt-1 line-clamp-1">{prop.description}</p>}
                  <div className="mt-3 flex items-center justify-between border-t border-emerald-50 pt-3">
                    <span className="font-bold text-emerald-700 text-sm">₹{prop.price}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-xl border border-emerald-100 flex justify-between items-center shadow-xs">
              <div>
                <h4 className="font-bold text-emerald-950 text-sm">3 BHK Luxury Villa</h4>
                <p className="text-xs text-stone-500">Sector 10 residential, gated community</p>
              </div>
              <span className="font-bold text-emerald-700 text-sm">₹45,000 / month</span>
            </div>
          </div>
        )}
      </div>

      {/* AMENITIES */}
      {amenitiesList.length > 0 && (
        <div className="px-6 py-6">
          <h3 className="text-xs font-bold tracking-widest text-emerald-700 uppercase mb-3">Key Facilities</h3>
          <div className="grid grid-cols-2 gap-2 bg-white p-4 rounded-xl border border-emerald-100 shadow-xs">
            {amenitiesList.map((amenity, i) => (
              <div key={i} className="flex items-center gap-2 text-stone-650 text-xs font-semibold">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* BOOK VISIT FORM */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl p-6 border border-emerald-150 shadow-md">
          <h3 className="text-base font-bold text-emerald-950 mb-4 text-center">Schedule Visit</h3>
          {submitted ? (
            <div className="text-center py-6 bg-emerald-50/50 rounded-xl border border-emerald-150">
              <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-emerald-950 font-bold text-sm">Site Visit Scheduled!</p>
              <p className="text-emerald-700/80 text-xs mt-1">Our consultant will call you to confirm the time slot.</p>
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
                  className="w-full bg-emerald-50/20 border border-emerald-100 rounded-xl p-3.5 text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium" 
                />
              </div>
              <div>
                <input 
                  type="tel" 
                  required 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="Mobile Number" 
                  className="w-full bg-emerald-50/20 border border-emerald-100 rounded-xl p-3.5 text-sm text-stone-900 placeholder-stone-400 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium" 
                />
              </div>
              <div>
                <select 
                  value={property} 
                  onChange={e => setProperty(e.target.value)}
                  className="w-full bg-emerald-50/20 border border-emerald-100 rounded-xl p-3.5 text-sm text-stone-900 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium"
                >
                  <option value="">Choose Unit of Interest</option>
                  {properties.map(p => <option key={p.id} value={p.title}>{p.title}</option>)}
                  <option value="General Rent Inquiry">General Rent Inquiry</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50 text-sm"
              >
                {isSubmitting ? 'Requesting...' : 'Request Site Visit'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
