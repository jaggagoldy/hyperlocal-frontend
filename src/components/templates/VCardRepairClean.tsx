'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { Wrench, Check, Phone, ShieldCheck } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardRepairClean({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [services, setServices] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [issue, setIssue] = useState('');
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

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* HEADER BIO */}
      <div className="pt-16 pb-8 px-6 bg-white border-b border-slate-200/60 text-center">
        <div className="mx-auto w-24 h-24 rounded-full border-4 border-slate-50 p-1 mb-4 shadow-sm">
          <img 
            src={meta.logoUrl || "https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=256&h=256"} 
            alt="Repair Logo" 
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        <span className="text-[10px] font-black text-slate-600 bg-slate-100 border border-slate-200 px-3 py-1 rounded uppercase tracking-wider">FACILITIES & MAINTENANCE</span>
        <h1 className="text-2xl font-black text-slate-900 mt-3 leading-tight">{business.businessName || 'Pro Maintenance'}</h1>
        {meta.experience && <p className="text-xs text-slate-500 mt-1">Exp: {meta.experience}</p>}
        <p className="text-xs text-slate-450 mt-2 max-w-xs mx-auto italic">"{meta.tagline || 'Professional maintenance services for home & office.'}"</p>
      </div>

      {/* REPAIR SERVICES (CATALOG) */}
      <div className="px-6 py-8">
        <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4 flex items-center gap-1.5">
          <Wrench className="w-4 h-4 text-slate-500" /> Services Menu
        </h3>
        {services.filter(s => s.isActive !== false).length > 0 ? (
          <div className="space-y-2">
            {services.filter(s => s.isActive !== false).map((service) => (
              <div key={service.id} className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex items-center justify-between">
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
            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-xs flex justify-between items-center">
              <div>
                <h4 className="font-bold text-slate-900 text-sm">Hourly Assistance</h4>
                <p className="text-xs text-slate-400">Plumbing / electrical / repair work</p>
              </div>
              <span className="font-black text-slate-900 text-sm">₹300 / hr</span>
            </div>
          </div>
        )}
      </div>

      {/* QUICK ENQUIRY FORM */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl p-6 border border-slate-250 shadow-sm">
          <h3 className="text-base font-bold text-slate-950 mb-4 text-center flex items-center justify-center gap-1">
            <ShieldCheck className="w-4 h-4 text-emerald-600" /> Request Job Quote
          </h3>
          {submitted ? (
            <div className="text-center py-6 bg-slate-50 rounded-xl border border-slate-200">
              <Check className="w-8 h-8 text-emerald-600 mx-auto mb-2" />
              <p className="text-slate-800 font-bold text-sm">Job Request Submitted!</p>
              <p className="text-slate-500 text-xs mt-1">We will review details and schedule a dispatcher.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Full Name" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition-all font-medium" 
              />
              <input 
                type="tel" 
                required 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="Contact Mobile" 
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition-all font-medium" 
              />
              <div>
                <select 
                  value={issue} 
                  onChange={e => setIssue(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 focus:bg-white focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition-all font-medium"
                >
                  <option value="">Select Service / Job</option>
                  {services.map(s => <option key={s.id} value={s.title}>{s.title}</option>)}
                  <option value="Plumbing Service">Plumbing Service</option>
                  <option value="Electrical Repair">Electrical Repair</option>
                </select>
              </div>
              <textarea 
                value={notes} 
                onChange={e => setNotes(e.target.value)} 
                placeholder="Describe details of work needed..." 
                rows={2}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3.5 text-sm text-slate-900 placeholder-slate-400 focus:bg-white focus:border-slate-500 focus:ring-1 focus:ring-slate-500 outline-none transition-all font-medium"
              />
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-900 text-white font-bold rounded-xl transition-all shadow-md disabled:opacity-50 text-sm"
              >
                {isSubmitting ? 'Requesting...' : 'Request Quote'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
