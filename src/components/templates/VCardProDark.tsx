'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { Briefcase, Award, GraduationCap, Check, ArrowRight, Shield } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardProDark({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [services, setServices] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [service, setService] = useState('');
  const [notes, setNotes] = useState('');
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

  const qualifications = meta.taxonomy?.credentials || meta.taxonomy?.qualifications || [];
  const areas = meta.taxonomy?.expertise || meta.taxonomy?.speciality || [];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 relative overflow-hidden">
      {/* Glow overlay */}
      <div className="absolute top-[-5%] left-[-10%] w-[350px] h-[350px] bg-slate-800/20 rounded-full blur-[95px] pointer-events-none"></div>

      {/* HEADER BIO */}
      <div className="pt-20 pb-10 px-6 text-center border-b border-slate-900 bg-slate-950/70 backdrop-blur-md relative z-10">
        <div className="mx-auto w-24 h-24 rounded-full border border-slate-800 p-1 bg-slate-900 mb-4 shadow-xl">
          <img 
            src={meta.logoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256"} 
            alt="Profile Logo" 
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <span className="px-2.5 py-0.5 bg-slate-800 text-slate-350 border border-slate-850 text-[10px] font-bold uppercase rounded-md tracking-wider">ADVISORY & SERVICES</span>
        <h1 className="text-2xl font-black text-white mt-3 leading-tight tracking-tight">{business.businessName || 'Corporate Consultants'}</h1>
        {meta.displayName && <p className="text-xs font-semibold text-slate-400 mt-1">Lead Partner: {meta.displayName}</p>}
        <p className="text-slate-500 text-xs mt-2 italic max-w-xs mx-auto">"{meta.tagline || 'Strategic solutions for business growth.'}"</p>
      </div>

      {/* CREDENTIALS */}
      {qualifications.length > 0 && (
        <div className="px-6 py-6 relative z-10">
          <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-3 flex items-center gap-1.5">
            <GraduationCap className="w-4 h-4 text-slate-400" /> Qualifications
          </h3>
          <div className="space-y-2">
            {qualifications.map((qual: string, i: number) => (
              <div key={i} className="flex gap-2.5 items-start text-sm text-slate-300 bg-slate-900 p-3.5 rounded-xl border border-slate-850 shadow-md">
                <Award className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5" />
                <span className="font-semibold">{qual}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* PRACTICE AREAS */}
      {areas.length > 0 && (
        <div className="px-6 py-2 relative z-10">
          <h3 className="text-xs font-bold tracking-widest text-slate-500 uppercase mb-3">Key Practice Areas</h3>
          <div className="flex flex-wrap gap-2">
            {areas.map((area: string, i: number) => (
              <span key={i} className="bg-slate-900 px-3 py-1.5 rounded-xl border border-slate-850 text-xs font-bold text-slate-300">
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* SERVICES (CATALOG) */}
      <div className="px-6 py-6 relative z-10">
        <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4 flex items-center gap-1.5">
          <Briefcase className="w-4 h-4 text-slate-400" /> Services Menu
        </h3>
        {services.filter(s => s.isActive !== false).length > 0 ? (
          <div className="space-y-3.5">
            {services.filter(s => s.isActive !== false).map((service) => (
              <div key={service.id} className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex items-center justify-between shadow-md">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm">{service.title}</h4>
                  {service.description && <p className="text-xs text-slate-450 mt-1 line-clamp-1">{service.description}</p>}
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="font-black text-slate-300 text-sm">₹{service.price}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex justify-between items-center shadow-md">
              <div>
                <h4 className="font-bold text-white text-sm">Corporate Consultation</h4>
                <p className="text-xs text-slate-400">Advisory discussion (30 mins)</p>
              </div>
              <span className="font-black text-slate-300 text-sm">₹1,500</span>
            </div>
          </div>
        )}
      </div>

      {/* ENQUIRY FORM */}
      <div className="px-6 pb-8 relative z-10">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-base font-bold text-white mb-4 text-center">Consultation Request</h3>
          {submitted ? (
            <div className="text-center py-6 bg-slate-950/80 rounded-xl border border-slate-800">
              <Check className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
              <p className="text-white font-bold text-sm">Inquiry Received!</p>
              <p className="text-slate-450 text-xs mt-1">We will review details and schedule a briefing.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Name / Organization Name" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-655 focus:border-slate-700 focus:ring-1 focus:ring-slate-750 outline-none transition-all font-medium" 
              />
              <input 
                type="tel" 
                required 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="Mobile / Contact Number" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-655 focus:border-slate-700 focus:ring-1 focus:ring-slate-750 outline-none transition-all font-medium" 
              />
              <div>
                <select 
                  value={service} 
                  onChange={e => setService(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-350 focus:border-slate-700 focus:ring-1 focus:ring-slate-750 outline-none transition-all font-medium"
                >
                  <option value="">Choose Service Area</option>
                  {services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                  <option value="General Query">General Query</option>
                </select>
              </div>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                placeholder="Briefly state your requirements..." 
                rows={2}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-655 focus:border-slate-700 focus:ring-1 focus:ring-slate-750 outline-none transition-all font-medium"
              />
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-750 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 text-sm flex items-center justify-center gap-1.5 border border-slate-700"
              >
                {isSubmitting ? 'Requesting...' : <>Request Briefing <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
