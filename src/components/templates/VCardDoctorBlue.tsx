'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { MapPin, Phone, Mail, Globe, Star, Activity, HeartPulse, Check, Stethoscope, Clock } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardDoctorBlue({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [services, setServices] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  // Sync from builder's live catalog or API
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

  const specialties: string[] = meta.taxonomy?.speciality || [];
  const consultationModes: string[] = meta.taxonomy?.consultation || [];

  return (
    <div className="min-h-screen bg-blue-50 text-blue-900 font-sans pb-24">
      {/* HERO */}
      <div className="bg-white rounded-b-3xl shadow-sm pb-8 pt-12 px-6 text-center border-b border-blue-100">
        <div className="mx-auto w-32 h-32 rounded-full border-4 border-blue-100 p-1 mb-4 shadow-inner">
          <img 
            src={meta.logoUrl || "https://images.unsplash.com/photo-1612349317150-e413f6a5b16d?auto=format&fit=crop&w=256&h=256"} 
            alt="Profile" 
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-bold text-blue-900 mb-1">
          {business.businessName || 'Dr. Sharma Clinic'}
        </h1>
        <h2 className="text-sm font-semibold text-blue-600 mb-2">
          {meta.displayName || 'Dr. Rahul Sharma'}
        </h2>
        <p className="text-blue-700/70 text-sm mb-4 max-w-xs mx-auto">
          {meta.tagline || 'Senior General Physician'}
        </p>
        <div className="flex items-center justify-center gap-1 text-blue-500 bg-blue-50 w-max mx-auto px-4 py-2 rounded-full">
          <span className="font-bold">{meta.ratingOverride || 4.9}</span>
          <Star className="w-4 h-4 fill-current" />
          <span className="text-blue-600/70 text-xs ml-1">(120 Reviews)</span>
        </div>
      </div>

      {/* SPECIALIZATIONS from taxonomy */}
      <div className="px-6 py-8">
        <h3 className="text-xs font-bold tracking-widest text-blue-400 uppercase mb-4 pl-2">Specializations</h3>
        {specialties.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {specialties.map((spec, i) => (
              <span key={i} className="bg-white px-4 py-2 rounded-xl shadow-sm border border-blue-100 text-sm font-bold text-blue-800 flex items-center gap-2">
                <HeartPulse className="w-4 h-4 text-blue-500" />
                {spec}
              </span>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-50 text-center">
              <HeartPulse className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <span className="text-sm font-bold text-blue-900">Cardiology</span>
            </div>
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-blue-50 text-center">
              <Activity className="w-8 h-8 text-blue-500 mx-auto mb-3" />
              <span className="text-sm font-bold text-blue-900">Pediatrics</span>
            </div>
          </div>
        )}

        {/* Consultation Modes */}
        {consultationModes.length > 0 && (
          <div className="flex flex-wrap gap-2 mt-4">
            {consultationModes.map((m, i) => (
              <span key={i} className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-bold rounded-full flex items-center gap-1">
                <Clock className="w-3 h-3" /> {m}
              </span>
            ))}
          </div>
        )}
      </div>

      {/* SERVICES from catalog */}
      {services.filter(s => s.isActive !== false).length > 0 && (
        <div className="px-6 pb-6">
          <h3 className="text-xs font-bold tracking-widest text-blue-400 uppercase mb-4 pl-2">Services & Fees</h3>
          <div className="space-y-2">
            {services.filter(s => s.isActive !== false).map((service) => (
              <div key={service.id} className="bg-white p-4 rounded-2xl shadow-sm border border-blue-50 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-50 rounded-xl flex items-center justify-center shrink-0">
                    <Stethoscope className="w-5 h-5 text-blue-500" />
                  </div>
                  <div>
                    <h4 className="font-bold text-blue-900 text-sm">{service.title}</h4>
                    {service.description && <p className="text-xs text-blue-400 line-clamp-1">{service.description}</p>}
                  </div>
                </div>
                <span className="font-bold text-blue-700 text-sm shrink-0 ml-2">₹{service.price}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ABOUT */}
      {meta.aboutText && (
        <div className="px-6 pb-6">
          <div className="bg-white rounded-2xl p-5 shadow-sm border border-blue-100">
            <h3 className="text-xs font-bold text-blue-400 uppercase tracking-widest mb-2">About</h3>
            <p className="text-blue-700/80 text-sm leading-relaxed">{meta.aboutText}</p>
          </div>
        </div>
      )}

      {/* BOOKING FORM */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-blue-100">
          <h3 className="text-lg font-bold text-blue-900 mb-6 text-center">Book Consultation</h3>
          {submitted ? (
            <div className="text-center py-4">
              <Check className="w-12 h-12 text-blue-500 mx-auto mb-2" />
              <p className="text-blue-600 font-medium">Appointment Requested</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Patient Name" className="w-full bg-blue-50 border-none rounded-xl p-4 text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              <input type="datetime-local" required value={date} onChange={e => setDate(e.target.value)} className="w-full bg-blue-50 border-none rounded-xl p-4 text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none" />
              <textarea value={message} onChange={e => setMessage(e.target.value)} placeholder="Reason for visit" rows={3} className="w-full bg-blue-50 border-none rounded-xl p-4 text-blue-900 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm" />
              <button type="submit" disabled={isSubmitting} className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-600/20 hover:bg-blue-700 transition-colors mt-2">
                {isSubmitting ? 'Submitting...' : 'Request Appointment'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-blue-100 flex justify-around p-4 z-50 shadow-[0_-10px_40px_rgba(37,99,235,0.05)]">
        <a href={`tel:${meta.contactPhone}`} className="text-blue-400 hover:text-blue-600 p-2"><Phone className="w-6 h-6" /></a>
        <a href={`mailto:${meta.contactEmail}`} className="text-blue-400 hover:text-blue-600 p-2"><Mail className="w-6 h-6" /></a>
        <button className="text-blue-400 hover:text-blue-600 p-2"><MapPin className="w-6 h-6" /></button>
        <button className="text-blue-400 hover:text-blue-600 p-2"><Globe className="w-6 h-6" /></button>
      </div>
    </div>
  );
}
