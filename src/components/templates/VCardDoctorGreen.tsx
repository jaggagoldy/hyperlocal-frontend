'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { MapPin, Phone, Mail, Globe, Star, Leaf, Heart, Check, Stethoscope, Clock } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardDoctorGreen({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [services, setServices] = useState<any[]>([]);
  
  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Sync services from builder catalog or API
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

  // Derive specialties from taxonomy or catalog
  const specialties: string[] = meta.taxonomy?.speciality || [];
  const consultationModes: string[] = meta.taxonomy?.consultation || [];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 font-sans pb-24 relative overflow-hidden">
      <div className="absolute top-0 left-0 right-0 h-64 bg-gradient-to-b from-emerald-100 to-stone-50"></div>
      
      {/* HERO */}
      <div className="relative pt-12 pb-8 px-6 text-center">
        <div className="mx-auto w-32 h-32 rounded-full border-4 border-white p-1 mb-4 shadow-xl bg-white">
          <img 
            src={meta.logoUrl || "https://images.unsplash.com/photo-1559839734-2b71ea197ec2?auto=format&fit=crop&w=256&h=256"} 
            alt="Profile" 
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-serif text-emerald-900 mb-1">
          {business.businessName || 'Holistic Wellness Clinic'}
        </h1>
        <h2 className="text-sm font-medium text-emerald-700 mb-2">
          {meta.displayName || 'Dr. Alisha Sharma'}
        </h2>
        <p className="text-stone-600 text-sm mb-4 max-w-xs mx-auto">
          {meta.tagline || 'Holistic Wellness & General Physician'}
        </p>
        <div className="flex items-center justify-center gap-1 text-emerald-600 bg-white shadow-sm w-max mx-auto px-4 py-2 rounded-full border border-emerald-50">
          <span className="font-bold">{meta.ratingOverride || 4.9}</span>
          <Star className="w-4 h-4 fill-current" />
        </div>
      </div>

      {/* SPECIALTIES from taxonomy */}
      {specialties.length > 0 && (
        <div className="px-6 py-4 relative z-10">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 text-center">Specialties</h3>
          <div className="flex flex-wrap justify-center gap-2">
            {specialties.map((s, i) => (
              <span key={i} className="px-3 py-1 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-full">
                {s}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* CONSULTATION MODES */}
      {consultationModes.length > 0 && (
        <div className="px-6 py-2 relative z-10">
          <div className="flex flex-wrap justify-center gap-2">
            {consultationModes.map((m, i) => (
              <span key={i} className="px-3 py-1 bg-white border border-stone-200 text-stone-600 text-xs font-semibold rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" /> {m}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* SERVICES from catalog */}
      {services.length > 0 && (
        <div className="px-6 py-6 relative z-10">
          <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-3 text-center">Services & Fees</h3>
          <div className="space-y-2">
            {services.filter(s => s.isActive !== false).map((service) => (
              <div key={service.id} className="bg-white p-4 rounded-2xl shadow-sm border border-stone-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-emerald-50 rounded-xl flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h4 className="font-bold text-stone-800 text-sm">{service.title}</h4>
                    {service.description && <p className="text-xs text-stone-400 line-clamp-1">{service.description}</p>}
                  </div>
                </div>
                <span className="font-bold text-emerald-700 text-sm shrink-0 ml-2">₹{service.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* If no specialties & no services, show default cards */}
      {specialties.length === 0 && services.length === 0 && (
        <div className="px-6 py-4 relative z-10">
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 text-center">
              <Leaf className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
              <span className="text-sm font-bold text-stone-800">General Care</span>
            </div>
            <div className="bg-white p-6 rounded-[2rem] shadow-sm border border-stone-100 text-center">
              <Heart className="w-8 h-8 text-emerald-500 mx-auto mb-3" />
              <span className="text-sm font-bold text-stone-800">Therapy</span>
            </div>
          </div>
        </div>
      )}

      {/* ABOUT */}
      {meta.aboutText && (
        <div className="px-6 py-4 relative z-10">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-stone-100">
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-widest mb-2">About</h3>
            <p className="text-stone-600 text-sm leading-relaxed">{meta.aboutText}</p>
          </div>
        </div>
      )}

      {/* BOOKING FORM */}
      <div className="px-6 pb-8 pt-4 relative z-10">
        <div className="bg-emerald-50 rounded-[2rem] p-8 shadow-inner border border-emerald-100">
          <h3 className="text-lg font-serif text-emerald-900 mb-6 text-center">Schedule Visit</h3>
          {submitted ? (
            <div className="text-center py-4">
              <Check className="w-12 h-12 text-emerald-600 mx-auto mb-2" />
              <p className="text-emerald-800 font-medium">Request Sent</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Full Name" className="w-full bg-white border border-stone-200 rounded-2xl p-4 text-stone-800 focus:border-emerald-500 outline-none" />
              <input type="datetime-local" required value={date} onChange={e => setDate(e.target.value)} className="w-full bg-white border border-stone-200 rounded-2xl p-4 text-stone-800 focus:border-emerald-500 outline-none" />
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Describe your symptoms or reason for visit" rows={3} className="w-full bg-white border border-stone-200 rounded-2xl p-4 text-stone-800 focus:border-emerald-500 outline-none resize-none text-sm" />
              <button type="submit" disabled={isSubmitting} className="w-full bg-emerald-600 text-white font-bold py-4 rounded-2xl shadow-lg shadow-emerald-600/20 hover:bg-emerald-700 transition-colors mt-2">
                {isSubmitting ? 'Submitting...' : 'Request Appointment'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-white/80 backdrop-blur-md border-t border-stone-100 flex justify-around p-4 z-50">
        <a href={`tel:${meta.contactPhone}`} className="text-stone-400 hover:text-emerald-600 p-2"><Phone className="w-6 h-6" /></a>
        <a href={`mailto:${meta.contactEmail}`} className="text-stone-400 hover:text-emerald-600 p-2"><Mail className="w-6 h-6" /></a>
        <button className="text-stone-400 hover:text-emerald-600 p-2"><MapPin className="w-6 h-6" /></button>
        <button className="text-stone-400 hover:text-emerald-600 p-2"><Globe className="w-6 h-6" /></button>
      </div>
    </div>
  );
}
