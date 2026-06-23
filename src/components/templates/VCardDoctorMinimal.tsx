'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { Stethoscope, Check, Calendar, Activity, ShieldAlert, FileText, Star } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardDoctorMinimal({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [services, setServices] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [date, setDate] = useState('');
  const [symptoms, setSymptoms] = useState('');
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
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* HEADER BIO */}
      <div className="pt-16 pb-8 px-6 bg-white border-b border-slate-200/60 text-center">
        <div className="mx-auto w-24 h-24 rounded-full border-4 border-slate-50 p-1 mb-4 shadow-sm">
          <img 
            src={meta.logoUrl || "https://images.unsplash.com/photo-1622253692010-333f2da6031d?auto=format&fit=crop&w=256&h=256"} 
            alt="Doctor profile" 
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <span className="text-[10px] font-black text-blue-600 bg-blue-50 border border-blue-100 px-2.5 py-1 rounded-full uppercase tracking-wider">MEDICINE & CARE</span>
        <h1 className="text-2xl font-black text-slate-900 mt-3 leading-tight">{business.businessName || 'Family Practice'}</h1>
        {meta.displayName && <p className="text-sm font-semibold text-slate-500 mt-1">{meta.displayName}</p>}
        <p className="text-xs text-slate-400 mt-2 max-w-xs mx-auto italic">"{meta.tagline || 'Your health is our primary commitment.'}"</p>
      </div>

      {/* TREATMENTS (CATALOG) */}
      <div className="px-6 py-8">
        <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4 flex items-center gap-1">
          <Stethoscope className="w-4 h-4 text-blue-600" /> Services & Consultations
        </h3>
        {services.filter(s => s.isActive !== false).length > 0 ? (
          <div className="space-y-2">
            {services.filter(s => s.isActive !== false).map((service) => (
              <div key={service.id} className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm">{service.title}</h4>
                  {service.description && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{service.description}</p>}
                </div>
                <span className="font-black text-slate-900 text-sm ml-2">₹{service.price}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-2">
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">General Check-up</h4>
                <p className="text-xs text-slate-400">Regular physical review</p>
              </div>
              <span className="font-black text-slate-900 text-sm">₹500</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-xs flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Online Prescription</h4>
                <p className="text-xs text-slate-400">Virtual consult & digital rx</p>
              </div>
              <span className="font-black text-slate-900 text-sm">₹350</span>
            </div>
          </div>
        )}
      </div>

      {/* APPOINTMENT FORM */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200/80 shadow-sm">
          <h3 className="text-base font-bold text-slate-950 mb-4 text-center">Schedule Clinic Visit</h3>
          {submitted ? (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-blue-100">
              <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-slate-800 font-bold text-sm">Appointment Requested!</p>
              <p className="text-slate-500 text-xs mt-1">We will review patient slots and message confirmation details.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Patient Full Name" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium" 
              />
              <input 
                type="tel" 
                required 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="Contact Mobile Number" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium" 
              />
              <input 
                type="datetime-local" 
                required 
                value={date} 
                onChange={e => setDate(e.target.value)} 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium" 
              />
              <textarea 
                value={symptoms} 
                onChange={e => setSymptoms(e.target.value)} 
                placeholder="Describe symptoms / reasons for visit..." 
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
              />
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50 text-sm"
              >
                {isSubmitting ? 'Scheduling Appointment...' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
