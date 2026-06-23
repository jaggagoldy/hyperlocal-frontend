'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { Briefcase, Check, ArrowRight, UserCheck } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardProModern({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [services, setServices] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
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

  const areas = meta.taxonomy?.expertise || meta.taxonomy?.speciality || [];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans pb-24">
      {/* HEADER SECTION */}
      <div className="pt-20 pb-8 px-6 border-b border-zinc-150">
        <span className="text-[10px] font-black text-zinc-500 bg-zinc-100 border border-zinc-200 px-3 py-1 rounded uppercase tracking-wider">CONSULTANT PROFILE</span>
        <h1 className="text-4xl font-black tracking-tight text-zinc-900 mt-4 leading-tight">
          {business.businessName || 'Strategic Advisory'}
        </h1>
        {meta.displayName && (
          <h2 className="text-lg font-bold text-zinc-700 mt-1 flex items-center gap-1.5">
            <UserCheck className="w-5 h-5 text-zinc-500" /> {meta.displayName}
          </h2>
        )}
        <p className="text-zinc-400 text-sm mt-3 leading-relaxed">
          {meta.tagline || 'Leading compliance, strategic corporate finance, and business expansion services.'}
        </p>
      </div>

      {/* DYNAMIC EDITORIAL GRID */}
      <div className="px-6 py-8 grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Box 1: Specialties */}
        {areas.length > 0 && (
          <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-3">
            <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Core Verticals</h3>
            <div className="space-y-1">
              {areas.map((area: string, i: number) => (
                <div key={i} className="text-sm font-black text-zinc-800 flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-900 shrink-0"></span>
                  {area}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Box 2: Catalog Items */}
        <div className="p-6 bg-zinc-50 border border-zinc-100 rounded-3xl space-y-4 md:col-span-2">
          <h3 className="text-xs font-bold tracking-widest text-zinc-400 uppercase">Services & Pricing</h3>
          {services.filter(s => s.isActive !== false).length > 0 ? (
            <div className="grid grid-cols-1 gap-3">
              {services.filter(s => s.isActive !== false).map((service) => (
                <div key={service.id} className="p-4 bg-white border border-zinc-200/80 rounded-2xl flex items-center justify-between shadow-xs">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-bold text-zinc-900 text-sm">{service.title}</h4>
                    {service.description && <p className="text-xs text-zinc-500 mt-1 line-clamp-1">{service.description}</p>}
                  </div>
                  <span className="font-black text-zinc-900 text-sm ml-2">₹{service.price}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-3">
              <div className="p-4 bg-white border border-zinc-200/80 rounded-2xl flex justify-between items-center shadow-xs">
                <div>
                  <h4 className="font-bold text-zinc-900 text-sm">Consultation Session</h4>
                  <p className="text-xs text-zinc-500">Business compliance advisory</p>
                </div>
                <span className="font-black text-zinc-900 text-sm">₹1,500</span>
              </div>
            </div>
          )}
        </div>

        {/* Box 3: Bio */}
        {meta.aboutText && (
          <div className="p-6 bg-zinc-900 text-zinc-100 rounded-3xl space-y-3 md:col-span-2 shadow-lg">
            <h3 className="text-xs font-bold tracking-widest text-zinc-500 uppercase">Professional Summary</h3>
            <p className="text-zinc-300 text-sm leading-relaxed whitespace-pre-line">{meta.aboutText}</p>
          </div>
        )}

      </div>

      {/* ENQUIRY CARD */}
      <div className="px-6 pb-8">
        <div className="bg-zinc-50 border border-zinc-200 rounded-3xl p-6 shadow-sm">
          <h3 className="text-md font-bold text-zinc-950 mb-4 text-center">Schedule Initial Consult</h3>
          {submitted ? (
            <div className="text-center py-6 bg-white border border-zinc-200 rounded-2xl">
              <Check className="w-8 h-8 text-zinc-900 mx-auto mb-2" />
              <p className="text-zinc-800 font-bold text-sm">Briefing Requested</p>
              <p className="text-zinc-500 text-xs mt-1">We will review details and schedule a briefing.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Full Name" 
                className="w-full bg-white border border-zinc-200 rounded-xl p-3.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all font-medium" 
              />
              <input 
                type="tel" 
                required 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="Contact Phone" 
                className="w-full bg-white border border-zinc-200 rounded-xl p-3.5 text-sm text-zinc-900 placeholder-zinc-400 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all font-medium" 
              />
              <select 
                value={service} 
                onChange={e => setService(e.target.value)}
                className="w-full bg-white border border-zinc-200 rounded-xl p-3.5 text-sm text-zinc-900 focus:border-zinc-900 focus:ring-1 focus:ring-zinc-900 outline-none transition-all font-medium"
              >
                <option value="">Choose Service Domain</option>
                {services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                <option value="General Enquiry">General Enquiry</option>
              </select>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 bg-zinc-900 hover:bg-black text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50 text-sm flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Requesting...' : <>Request Callback <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
