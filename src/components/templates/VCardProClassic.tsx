'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { Briefcase, Award, GraduationCap, Check, Phone, Mail, Globe, ArrowRight, UserCheck } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardProClassic({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [services, setServices] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [serviceOfInterest, setServiceOfInterest] = useState('');
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

  const areas: string[] = meta.taxonomy?.expertise || meta.taxonomy?.speciality || [];
  const qualifications: string[] = meta.taxonomy?.credentials || meta.taxonomy?.qualifications || [];

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* PROFESSIONAL HERO CARD */}
      <div className="pt-16 pb-8 px-6 text-center bg-white border-b border-slate-200/80 shadow-sm relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-blue-600 to-indigo-600"></div>
        <div className="mx-auto w-24 h-24 rounded-full border-4 border-slate-100 p-1 mb-4 shadow-inner">
          <img 
            src={meta.logoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256"} 
            alt="Profile Logo" 
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <h1 className="text-2xl font-black text-slate-900 leading-tight">
          {business.businessName || 'Consultancy Services'}
        </h1>
        {meta.displayName && (
          <h2 className="text-sm font-bold text-blue-600 mt-1 flex items-center justify-center gap-1">
            <UserCheck className="w-4 h-4" /> {meta.displayName}
          </h2>
        )}
        <p className="text-slate-500 text-xs mt-2 max-w-xs mx-auto">
          {meta.tagline || 'Chartered Accountant & Business Advisors'}
        </p>
      </div>

      {/* CREDENTIALS / EDUCATION */}
      {qualifications.length > 0 && (
        <div className="px-6 py-6">
          <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3 flex items-center gap-1">
            <GraduationCap className="w-4 h-4 text-blue-600" /> Credentials & Certifications
          </h3>
          <div className="space-y-2">
            {qualifications.map((qual, i) => (
              <div key={i} className="flex gap-2.5 items-start text-sm text-slate-650 bg-white p-3 rounded-xl border border-slate-200/60 shadow-xs">
                <Award className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                <span className="font-semibold">{qual}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* AREAS OF PRACTICE / TAXONOMY */}
      {areas.length > 0 && (
        <div className="px-6 py-2">
          <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-3">Areas of Practice</h3>
          <div className="flex flex-wrap gap-2">
            {areas.map((area, i) => (
              <span key={i} className="px-3.5 py-2 bg-blue-50/70 border border-blue-100 text-blue-700 text-xs font-bold rounded-xl">
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* ADVISORY & CONSULTING SERVICES (CATALOG) */}
      <div className="px-6 py-6">
        <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4 flex items-center gap-1">
          <Briefcase className="w-4 h-4 text-blue-600" /> Professional Services
        </h3>
        {services.filter(s => s.isActive !== false).length > 0 ? (
          <div className="space-y-3">
            {services.filter(s => s.isActive !== false).map((service) => (
              <div key={service.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900 text-sm">{service.title}</h4>
                  {service.description && <p className="text-xs text-slate-500 mt-1 line-clamp-2">{service.description}</p>}
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="font-bold text-blue-700 text-sm">₹{service.price}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Consultation Fee</h4>
                <p className="text-xs text-slate-550">Initial legal / tax review (30 mins)</p>
              </div>
              <span className="font-bold text-blue-600 text-sm">₹1,000</span>
            </div>
            <div className="bg-white p-4 rounded-xl border border-slate-200 flex justify-between items-center shadow-xs">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">GST Return Filing</h4>
                <p className="text-xs text-slate-550">Monthly compliance processing</p>
              </div>
              <span className="font-bold text-blue-600 text-sm">Starting ₹2,500</span>
            </div>
          </div>
        )}
      </div>

      {/* ABOUT BIO */}
      {meta.aboutText && (
        <div className="px-6 pb-6">
          <div className="bg-white rounded-xl p-5 border border-slate-200/80 shadow-xs">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Professional Bio</h3>
            <p className="text-slate-600 text-sm leading-relaxed whitespace-pre-line">{meta.aboutText}</p>
          </div>
        </div>
      )}

      {/* ENQUIRY / BOOK MEETING FORM */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-200 shadow-md">
          <h3 className="text-base font-bold text-slate-950 mb-4 text-center">Book Consultation / Request Quote</h3>
          {submitted ? (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-blue-100">
              <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-slate-800 font-bold text-sm">Inquiry Sent Successfully!</p>
              <p className="text-slate-500 text-xs mt-1">We will review your case and reply shortly.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <input 
                  type="text" 
                  required 
                  value={name} 
                  onChange={e => setName(e.target.value)} 
                  placeholder="Your Name / Company Name" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium" 
                />
              </div>
              <div>
                <input 
                  type="tel" 
                  required 
                  value={phone} 
                  onChange={e => setPhone(e.target.value)} 
                  placeholder="Mobile / Contact Number" 
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium" 
                />
              </div>
              <div>
                <select 
                  value={serviceOfInterest} 
                  onChange={e => setServiceOfInterest(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                >
                  <option value="">Select Service Needed</option>
                  {services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                  <option value="General Consultation">General Consultation</option>
                  <option value="Other Assistance">Other Assistance</option>
                </select>
              </div>
              <div>
                <textarea 
                  value={notes} 
                  onChange={e => setNotes(e.target.value)} 
                  placeholder="Briefly describe your requirements..." 
                  rows={3}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all font-medium"
                />
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md hover:shadow-lg disabled:opacity-50 text-sm flex items-center justify-center gap-1.5"
              >
                {isSubmitting ? 'Sending Request...' : <>Request Callback <ArrowRight className="w-4 h-4" /></>}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
