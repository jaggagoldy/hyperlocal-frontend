'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { Dumbbell, Award, Check, Phone, Heart } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardWellnessDark({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [services, setServices] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedClass, setSelectedClass] = useState('');
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
    <div className="min-h-screen bg-zinc-950 text-zinc-100 font-sans pb-24 relative overflow-hidden">
      {/* Glow overlay */}
      <div className="absolute top-[-5%] right-[-10%] w-[350px] h-[350px] bg-lime-500/10 rounded-full blur-[90px] pointer-events-none"></div>

      {/* HEADER HERO */}
      <div className="pt-20 pb-10 px-6 text-center border-b border-zinc-900 bg-zinc-950/70 backdrop-blur-md relative z-10">
        <div className="mx-auto w-24 h-24 rounded-full border-2 border-lime-500 p-1 mb-4 shadow-xl">
          <img 
            src={meta.logoUrl || "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?auto=format&fit=crop&w=256&h=256"} 
            alt="Gym Logo" 
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <span className="px-2.5 py-0.5 bg-lime-500/20 text-lime-400 border border-lime-500/30 text-[10px] font-bold uppercase rounded-md tracking-wider">POWER FITNESS</span>
        <h1 className="text-3xl font-black text-white mt-3 leading-tight tracking-tight">{business.businessName || 'Powerhouse Gym'}</h1>
        <p className="text-zinc-400 text-xs mt-2 italic max-w-xs mx-auto">"{meta.tagline || 'Push your limits. Earn your results.'}"</p>
      </div>

      {/* PROGRAMS (CATALOG) */}
      <div className="px-6 py-8 relative z-10">
        <h3 className="text-xs font-bold tracking-widest text-lime-400 uppercase mb-4 flex items-center gap-1.5">
          <Dumbbell className="w-4 h-4" /> Gym Programs & Slots
        </h3>
        {services.filter(s => s.isActive !== false).length > 0 ? (
          <div className="space-y-3.5">
            {services.filter(s => s.isActive !== false).map((service) => (
              <div key={service.id} className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl flex items-center justify-between shadow-md">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm">{service.title}</h4>
                  {service.description && <p className="text-xs text-zinc-450 mt-1 line-clamp-1">{service.description}</p>}
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="font-black text-lime-400 text-sm">₹{service.price}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl flex justify-between items-center shadow-md">
              <div>
                <h4 className="font-bold text-white text-sm">Monthly Gym Membership</h4>
                <p className="text-xs text-zinc-400">Cardio & weights area access</p>
              </div>
              <span className="font-black text-lime-400 text-sm">₹1,200</span>
            </div>
            <div className="bg-zinc-900 border border-zinc-850 p-4 rounded-xl flex justify-between items-center shadow-md">
              <div>
                <h4 className="font-bold text-white text-sm">Personal Trainer Session</h4>
                <p className="text-xs text-zinc-400">1-on-1 coaching (60 mins)</p>
              </div>
              <span className="font-black text-lime-400 text-sm">₹700</span>
            </div>
          </div>
        )}
      </div>

      {/* LEAD FORM */}
      <div className="px-6 pb-8 relative z-10">
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-base font-bold text-white mb-4 text-center flex items-center justify-center gap-1.5">
            <Heart className="w-4 h-4 text-lime-400" /> Reserve Gym Slot
          </h3>
          {submitted ? (
            <div className="text-center py-6 bg-zinc-950/80 rounded-xl border border-lime-500/20">
              <Check className="w-8 h-8 text-lime-400 mx-auto mb-2" />
              <p className="text-white font-bold text-sm">Enquiry Requested!</p>
              <p className="text-zinc-500 text-xs mt-1">Our coach will call you back to schedule your session.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Full Name" 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none transition-all font-medium" 
              />
              <input 
                type="tel" 
                required 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="WhatsApp Number" 
                className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-100 placeholder-zinc-600 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none transition-all font-medium" 
              />
              <div>
                <select 
                  value={selectedClass} 
                  onChange={e => setSelectedClass(e.target.value)}
                  className="w-full bg-zinc-950 border border-zinc-800 rounded-xl p-3.5 text-sm text-zinc-350 focus:border-lime-500 focus:ring-1 focus:ring-lime-500 outline-none transition-all font-medium"
                >
                  <option value="">Choose Membership / Program</option>
                  {services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                  <option value="General Enquiry">General Enquiry</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 bg-lime-500 hover:bg-lime-600 text-zinc-950 font-black rounded-xl transition-all shadow-lg disabled:opacity-50 text-sm uppercase tracking-wider"
              >
                {isSubmitting ? 'Requesting...' : 'Request Booking'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
