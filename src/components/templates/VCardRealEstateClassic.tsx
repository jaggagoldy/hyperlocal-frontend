'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { Home, Eye, MapPin, Check, Phone, Mail, Globe, ArrowRight, Shield } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardRealEstateClassic({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [properties, setProperties] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [propertyOfInterest, setPropertyOfInterest] = useState('');
  const [visitDate, setVisitDate] = useState('');
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* REAL ESTATE HERO BANNER */}
      <div className="relative h-64 bg-slate-900">
        <img 
          src={meta.bannerUrl || "https://images.unsplash.com/photo-1564013799919-ab600027ffc6?auto=format&fit=crop&w=800&q=80"} 
          alt="Property Showcase" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-50 to-transparent"></div>
        <div className="absolute bottom-6 left-6 flex items-end gap-4 z-10">
          <div className="w-20 h-20 rounded-2xl bg-white border-2 border-indigo-600 overflow-hidden shrink-0 shadow-md">
            <img 
              src={meta.logoUrl || "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&w=256&h=256"} 
              alt="Real Estate Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="px-2 py-0.5 bg-indigo-50 text-indigo-700 border border-indigo-200 text-[10px] font-bold uppercase rounded-md tracking-wider">REAL ESTATE & RENTALS</span>
            <h1 className="text-2xl font-black text-slate-900 mt-1 leading-tight">{business.businessName || 'Green Field Realty'}</h1>
            {meta.displayName && <p className="text-xs text-slate-500 mt-0.5">Licensed Agent: {meta.displayName}</p>}
          </div>
        </div>
      </div>

      {/* TAGLINE */}
      <div className="px-6 py-4 border-b border-slate-200 bg-white">
        <p className="text-indigo-700/80 text-sm font-semibold italic flex items-center gap-1">
          <Shield className="w-4 h-4 text-indigo-500" /> "{meta.tagline || 'Helping you find the perfect place to call home.'}"
        </p>
      </div>

      {/* PROPERTY TYPES */}
      {propertyTypes.length > 0 && (
        <div className="px-6 py-6">
          <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Portfolio Scope</h3>
          <div className="flex flex-wrap gap-2">
            {propertyTypes.map((type, i) => (
              <span key={i} className="bg-white px-3.5 py-1.5 rounded-xl border border-slate-200 text-xs font-bold text-slate-700 shadow-xs">
                {type}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ACTIVE LISTINGS (CATALOG) */}
      <div className="px-6 py-2">
        <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4 flex items-center gap-1">
          <Home className="w-4 h-4 text-indigo-600" /> Active Listings / Rooms
        </h3>
        {properties.filter(p => p.isActive !== false).length > 0 ? (
          <div className="space-y-4">
            {properties.filter(p => p.isActive !== false).map((prop) => (
              <div key={prop.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs">
                {prop.mediaUrl && (
                  <div className="h-44 w-full overflow-hidden">
                    <img src={prop.mediaUrl} alt={prop.title} className="w-full h-full object-cover" />
                  </div>
                )}
                <div className="p-4">
                  <h4 className="font-bold text-slate-900 text-sm">{prop.title}</h4>
                  {prop.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{prop.description}</p>}
                  <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
                    <span className="font-bold text-indigo-600 text-sm">₹{prop.price}</span>
                    <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 uppercase">Available</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">2 BHK Apartment (Rent)</h4>
                <p className="text-xs text-slate-500">Fully furnished, Sector 15</p>
              </div>
              <span className="font-bold text-indigo-650 text-sm">₹18,000 / month</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Single PG Room (Rent)</h4>
                <p className="text-xs text-slate-500">With food & AC, model town</p>
              </div>
              <span className="font-bold text-indigo-655 text-sm">₹8,500 / month</span>
            </div>
          </div>
        )}
      </div>

      {/* AMENITIES */}
      {amenitiesList.length > 0 && (
        <div className="px-6 py-6">
          <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Key Facilities</h3>
          <div className="grid grid-cols-2 gap-2">
            {amenitiesList.map((amenity, i) => (
              <div key={i} className="flex items-center gap-2 text-slate-600 text-xs font-medium">
                <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{amenity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABOUT TEXT */}
      {meta.aboutText && (
        <div className="px-6 py-6">
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs">
            <h3 className="text-xs font-bold text-indigo-600 uppercase tracking-widest mb-2">Agency Details</h3>
            <p className="text-slate-650 text-sm leading-relaxed whitespace-pre-line">{meta.aboutText}</p>
          </div>
        </div>
      )}

      {/* INSPECTION VISIT BOOKING FORM */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
          <h3 className="text-base font-bold text-slate-900 mb-4 text-center">Schedule Site Visit / Inspection</h3>
          {submitted ? (
            <div className="text-center py-6 bg-indigo-50/50 rounded-xl border border-indigo-150">
              <Check className="w-8 h-8 text-indigo-600 mx-auto mb-2" />
              <p className="text-indigo-850 font-bold text-sm">Site Visit Scheduled!</p>
              <p className="text-indigo-700/85 text-xs mt-1">Our agent will call you to confirm the time slot.</p>
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
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium" 
                />
              </div>
              <div>
                <input 
                  type="tel" 
                  required 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="Mobile Number" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium" 
                />
              </div>
              <div>
                <input 
                  type="date" 
                  required 
                  value={visitDate} 
                  onChange={e => setVisitDate(e.target.value)} 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium" 
                />
              </div>
              <div>
                <select 
                  value={propertyOfInterest} 
                  onChange={e => setPropertyOfInterest(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:bg-white focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium"
                >
                  <option value="">Select Property / Unit of Interest</option>
                  {properties.map(p => <option key={p.id} value={p.title}>{p.title}</option>)}
                  <option value="General Rent Inquiry">General Rent Inquiry</option>
                  <option value="Buy / Investment Inquiry">Buy / Investment Inquiry</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Scheduling Visit...' : <>Request Inspection Visit <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
