'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { MapPin, Phone, Mail, Globe, Dumbbell, Award, Clock, Check, Heart } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardWellnessClassic({ business }: { business: BusinessProfile }) {
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

  const specialties: string[] = meta.taxonomy?.speciality || meta.taxonomy?.expertise || [];
  const facilities: string[] = meta.taxonomy?.facilities || meta.taxonomy?.amenities || [];

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 font-sans pb-24">
      {/* HERO BANNER */}
      <div className="relative h-64 bg-zinc-800">
        <img 
          src={meta.bannerUrl || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=800&q=80"} 
          alt="Gym Banner" 
          className="w-full h-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-stone-900 to-transparent"></div>
        <div className="absolute bottom-6 left-6 flex items-end gap-4">
          <div className="w-20 h-20 rounded-2xl bg-stone-850 border-2 border-emerald-500 overflow-hidden shrink-0 shadow-lg">
            <img 
              src={meta.logoUrl || "https://images.unsplash.com/photo-1517838277536-f5f99be501cd?auto=format&fit=crop&w=256&h=256"} 
              alt="Logo" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <span className="px-2 py-0.5 bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 text-[10px] font-bold uppercase rounded-md tracking-wider">FITNESS & WELLNESS</span>
            <h1 className="text-2xl font-black text-white mt-1 leading-tight">{business.businessName || 'Iron Gym'}</h1>
            {meta.displayName && <p className="text-xs text-stone-400 mt-0.5">Trainer: {meta.displayName}</p>}
          </div>
        </div>
      </div>

      {/* TAGLINE */}
      <div className="px-6 py-4 border-b border-stone-800/80 bg-stone-950/20">
        <p className="text-stone-300 text-sm font-semibold italic">
          "{meta.tagline || 'Transform your body, mind, and life.'}"
        </p>
      </div>

      {/* SPECIALTIES */}
      {specialties.length > 0 && (
        <div className="px-6 py-6">
          <h3 className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-3 flex items-center gap-1">
            <Award className="w-4 h-4" /> Specialties & Programs
          </h3>
          <div className="flex flex-wrap gap-2">
            {specialties.map((spec, i) => (
              <span key={i} className="bg-stone-800 px-3 py-1.5 rounded-lg border border-stone-700 text-xs font-bold text-stone-200">
                {spec}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CATALOG PROGRAMS */}
      <div className="px-6 py-2">
        <h3 className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-4 flex items-center gap-1">
          <Dumbbell className="w-4 h-4" /> Memberships & Sessions
        </h3>
        {services.filter(s => s.isActive !== false).length > 0 ? (
          <div className="space-y-3">
            {services.filter(s => s.isActive !== false).map((service) => (
              <div key={service.id} className="bg-stone-800 p-4 rounded-xl border border-stone-700 flex items-center justify-between shadow-sm">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm">{service.title}</h4>
                  {service.description && <p className="text-xs text-stone-400 mt-1 line-clamp-2">{service.description}</p>}
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="font-bold text-emerald-400 text-sm">₹{service.price}</span>
                  {service.variants && service.variants.length > 0 && (
                    <p className="text-[10px] text-stone-400 mt-0.5">+{service.variants.length} options</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-stone-850 p-4 rounded-xl border border-stone-800 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-white text-sm">Monthly Pass</h4>
                <p className="text-xs text-stone-400">Unlimited gym access</p>
              </div>
              <span className="font-bold text-emerald-400 text-sm">₹1,500</span>
            </div>
            <div className="bg-stone-850 p-4 rounded-xl border border-stone-800 flex justify-between items-center">
              <div>
                <h4 className="font-bold text-white text-sm">Personal Training Session</h4>
                <p className="text-xs text-stone-400">1-on-1 coaching (60 mins)</p>
              </div>
              <span className="font-bold text-emerald-400 text-sm">₹800</span>
            </div>
          </div>
        )}
      </div>

      {/* AMENITIES */}
      {facilities.length > 0 && (
        <div className="px-6 py-6">
          <h3 className="text-xs font-bold tracking-widest text-emerald-400 uppercase mb-3">Amenities & Facilities</h3>
          <div className="grid grid-cols-2 gap-2">
            {facilities.map((fac, i) => (
              <div key={i} className="flex items-center gap-2 text-stone-300 text-xs">
                <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{fac}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABOUT TEXT */}
      {meta.aboutText && (
        <div className="px-6 pb-6">
          <div className="bg-stone-800 rounded-xl p-5 border border-stone-700">
            <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-widest mb-2">About Us</h3>
            <p className="text-stone-300 text-sm leading-relaxed">{meta.aboutText}</p>
          </div>
        </div>
      )}

      {/* QUICK ENQUIRY FORM */}
      <div className="px-6 pb-8">
        <div className="bg-stone-800 rounded-2xl p-6 border border-stone-700 shadow-md">
          <h3 className="text-base font-bold text-white mb-4 text-center flex items-center justify-center gap-1">
            <Heart className="w-4 h-4 text-emerald-400" /> Start Your Fitness Journey
          </h3>
          {submitted ? (
            <div className="text-center py-4 bg-stone-900 rounded-xl border border-emerald-500/20">
              <Check className="w-8 h-8 text-emerald-400 mx-auto mb-2" />
              <p className="text-stone-200 font-bold text-sm">Request Submitted!</p>
              <p className="text-stone-400 text-xs mt-1">We will contact you shortly.</p>
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
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-100 placeholder-stone-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" 
                />
              </div>
              <div>
                <input 
                  type="tel" 
                  required 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="Mobile Number" 
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-100 placeholder-stone-500 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all" 
                />
              </div>
              <div>
                <select 
                  value={selectedClass} 
                  onChange={e => setSelectedClass(e.target.value)}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl p-3.5 text-sm text-stone-150 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all"
                >
                  <option value="">Interested Program / Membership</option>
                  {services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                  <option value="General Query">General Query</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 text-sm"
              >
                {isSubmitting ? 'Submitting...' : 'Join Now'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
