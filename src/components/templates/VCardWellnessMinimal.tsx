'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { Heart, Check, Flower2, Calendar, Phone } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardWellnessMinimal({ business }: { business: BusinessProfile }) {
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
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans pb-24">
      {/* HEADER SECTION */}
      <div className="pt-16 pb-8 px-6 bg-white border-b border-stone-200/60 text-center">
        <div className="mx-auto w-24 h-24 rounded-full border-4 border-stone-100 p-1 mb-4 shadow-sm">
          <img 
            src={meta.logoUrl || "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=256&h=256"} 
            alt="Yoga Profile" 
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 border border-emerald-100 px-3 py-1 rounded-full uppercase tracking-wider">YOGA & PILATES</span>
        <h1 className="text-2xl font-black text-stone-900 mt-3 leading-tight">{business.businessName || 'Mindful Space'}</h1>
        {meta.displayName && <p className="text-xs font-semibold text-stone-500 mt-1">Instructor: {meta.displayName}</p>}
        <p className="text-xs text-stone-400 mt-2 max-w-xs mx-auto italic">"{meta.tagline || 'Find balance, peace, and mindfulness.'}"</p>
      </div>

      {/* CLASSES (CATALOG) */}
      <div className="px-6 py-8">
        <h3 className="text-xs font-bold tracking-widest text-stone-400 uppercase mb-4 flex items-center gap-1.5">
          <Flower2 className="w-4 h-4 text-emerald-700" /> Sessions & Memberships
        </h3>
        {services.filter(s => s.isActive !== false).length > 0 ? (
          <div className="space-y-2">
            {services.filter(s => s.isActive !== false).map((service) => (
              <div key={service.id} className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-stone-900 text-sm">{service.title}</h4>
                  {service.description && <p className="text-xs text-stone-500 mt-1 line-clamp-1">{service.description}</p>}
                </div>
                <span className="font-black text-emerald-800 text-sm ml-2">₹{service.price}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex justify-between items-center">
              <div>
                <h4 className="font-bold text-stone-900 text-sm">Hatha Yoga Class</h4>
                <p className="text-xs text-stone-500">60 mins group session</p>
              </div>
              <span className="font-black text-emerald-800 text-sm">₹300</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-stone-200 shadow-xs flex justify-between items-center">
              <div>
                <h4 className="font-bold text-stone-900 text-sm">1-on-1 Meditation</h4>
                <p className="text-xs text-stone-500">Personal coaching (45 mins)</p>
              </div>
              <span className="font-black text-emerald-800 text-sm">₹600</span>
            </div>
          </div>
        )}
      </div>

      {/* MIND MINDFUL BOOKING FORM */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl p-6 border border-stone-200/80 shadow-xs">
          <h3 className="text-base font-bold text-stone-950 mb-4 text-center flex items-center justify-center gap-1">
            <Heart className="w-4 h-4 text-emerald-700" /> Request Free Demo Session
          </h3>
          {submitted ? (
            <div className="text-center py-6 bg-stone-50 rounded-xl border border-emerald-100">
              <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-stone-850 font-bold text-sm">Session Requested!</p>
              <p className="text-stone-500 text-xs mt-1">We will contact you to verify slot details.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Your Full Name" 
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm text-stone-900 placeholder-stone-450 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium" 
              />
              <input 
                type="tel" 
                required 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="Mobile / WhatsApp Number" 
                className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm text-stone-900 placeholder-stone-450 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium" 
              />
              <div>
                <select 
                  value={selectedClass} 
                  onChange={e => setSelectedClass(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-3.5 text-sm text-stone-950 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all font-medium"
                >
                  <option value="">Select Yoga / Pilates Level</option>
                  {services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                  <option value="Beginner Class">Beginner Class</option>
                  <option value="Advanced Class">Advanced Class</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50 text-sm"
              >
                {isSubmitting ? 'Requesting...' : 'Request Slot'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
