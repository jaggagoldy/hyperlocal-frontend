'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { Wrench, Check, Phone, ShieldAlert, Sparkles } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardRepairVibrant({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [services, setServices] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [issue, setIssue] = useState('');
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
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans pb-24">
      {/* HEADER SECTION */}
      <div className="pt-20 pb-10 px-6 text-center border-b border-stone-800 bg-stone-950 relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-1.5 bg-yellow-500"></div>
        <div className="mx-auto w-24 h-24 rounded-2xl mb-4 bg-stone-850 p-1 border border-yellow-500/20">
          <img 
            src={meta.logoUrl || "https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=256&h=256"} 
            alt="Repair Logo" 
            className="w-full h-full rounded-xl object-cover"
          />
        </div>
        <span className="px-2.5 py-0.5 bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 text-[10px] font-bold uppercase rounded-md tracking-wider">REPAIR & SERVICES</span>
        <h1 className="text-2xl font-black text-white mt-3 leading-tight tracking-tight">{business.businessName || 'On-Call Repairs'}</h1>
        {meta.experience && <p className="text-xs text-stone-400 mt-1">Experience: {meta.experience}</p>}
        <p className="text-stone-500 text-xs mt-2 italic max-w-xs mx-auto">"{meta.tagline || 'Quick, reliable, and expert service at your doorstep.'}"</p>
      </div>

      {/* REPAIR SERVICES (CATALOG) */}
      <div className="px-6 py-8">
        <h3 className="text-xs font-bold tracking-widest text-yellow-400 uppercase mb-4 flex items-center gap-1.5">
          <Wrench className="w-4 h-4 text-yellow-500" /> Services & Rates
        </h3>
        {services.filter(s => s.isActive !== false).length > 0 ? (
          <div className="space-y-3.5">
            {services.filter(s => s.isActive !== false).map((service) => (
              <div key={service.id} className="bg-stone-850 border border-stone-800 p-4 rounded-xl flex items-center justify-between shadow-md">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm">{service.title}</h4>
                  {service.description && <p className="text-xs text-stone-400 mt-1 line-clamp-1">{service.description}</p>}
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="font-black text-yellow-400 text-sm">₹{service.price}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="bg-stone-850 border border-stone-800 p-4 rounded-xl flex justify-between items-center shadow-md">
              <div>
                <h4 className="font-bold text-white text-sm">Standard Inspection</h4>
                <p className="text-xs text-stone-400">Diagnosis & visit fee</p>
              </div>
              <span className="font-black text-yellow-400 text-sm">₹250</span>
            </div>
          </div>
        )}
      </div>

      {/* QUICK ENQUIRY FORM */}
      <div className="px-6 pb-8">
        <div className="bg-stone-850 border border-stone-800 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-base font-bold text-white mb-4 text-center flex items-center justify-center gap-1.5">
            <ShieldAlert className="w-4 h-4 text-yellow-500" /> Request Service / Call
          </h3>
          {submitted ? (
            <div className="text-center py-6 bg-stone-900/80 rounded-xl border border-yellow-500/20">
              <Check className="w-8 h-8 text-yellow-400 mx-auto mb-2" />
              <p className="text-white font-bold text-sm">Service Request Submitted!</p>
              <p className="text-stone-400 text-xs mt-1">Our technician will call you to schedule a visit.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Your Name" 
                className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-105 placeholder-stone-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all font-medium" 
              />
              <input 
                type="tel" 
                required 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="Mobile Number" 
                className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-105 placeholder-stone-600 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all font-medium" 
              />
              <div>
                <select 
                  value={issue} 
                  onChange={e => setIssue(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-300 focus:border-yellow-500 focus:ring-1 focus:ring-yellow-500 outline-none transition-all font-medium"
                >
                  <option value="">Select Service Needed</option>
                  {services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                  <option value="General Maintenance">General Maintenance</option>
                  <option value="Emergency Repair">Emergency Repair</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 bg-yellow-500 hover:bg-yellow-600 text-stone-950 font-black rounded-xl transition-all shadow-lg disabled:opacity-50 text-sm uppercase tracking-wider"
              >
                {isSubmitting ? 'Requesting...' : 'Request Technician'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
