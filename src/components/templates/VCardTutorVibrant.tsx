'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { MapPin, Phone, Mail, Globe, Star, BookOpen, Atom, Check } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardTutorVibrant({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [services, setServices] = useState<any[]>([]);
  const [selectedService, setSelectedService] = useState('');

  const [name, setName] = useState('');
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

  // Taxonomy fields
  const subjectsList: string[] = meta.taxonomy?.subjects || [];
  const grades: string[] = meta.taxonomy?.grades || [];
  const modes: string[] = meta.taxonomy?.mode || [];

  const activeServices = services.filter(s => s.isActive !== false);
  const subjectOptions = subjectsList.length > 0 ? subjectsList : activeServices.map(s => s.title);

  return (
    <div className="min-h-screen bg-[#1F1B4C] text-white font-sans pb-24 relative">
      <div className="absolute inset-0 bg-gradient-to-br from-[#3B2C9A] to-[#E94E1B] opacity-20 pointer-events-none"></div>
      
      {/* HERO */}
      <div className="relative pt-16 pb-12 px-6 text-center border-b border-white/10 rounded-b-[3rem] bg-[#2A2369]">
        <div className="mx-auto w-32 h-32 rounded-full border-4 border-[#FF6B35] p-1 mb-4 relative z-10 bg-[#1F1B4C]">
          <img 
            src={meta.logoUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=256&h=256"} 
            alt="Profile" 
            className="w-full h-full rounded-full object-cover"
          />
          <div className="absolute -bottom-2 -right-2 bg-[#FF6B35] text-white text-xs font-bold px-2 py-1 rounded-lg">
            <Star className="w-3 h-3 inline mr-1" />{meta.ratingOverride || 4.9}
          </div>
        </div>
        <h1 className="text-2xl font-black text-white mb-1">
          {business.businessName || 'Personal Tutor'}
        </h1>
        <h2 className="text-base font-bold text-[#FF6B35] mb-2">
          {meta.displayName || 'Sarah Johnson, M.Sc.'}
        </h2>
        <p className="text-indigo-200 text-sm max-w-xs mx-auto">
          {meta.tagline || 'Boost Your Grades! Fast & Fun Learning'}
        </p>

        {/* Subjects, Grades & Modes */}
        {(subjectsList.length > 0 || grades.length > 0 || modes.length > 0) && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {subjectsList.map((s, i) => (
              <span key={i} className="px-2 py-1 bg-indigo-500/30 border border-indigo-400/40 text-indigo-200 text-xs font-bold rounded-full">{s}</span>
            ))}
            {grades.map((g, i) => (
              <span key={i} className="px-2 py-1 bg-white/10 border border-white/20 text-white text-xs font-bold rounded-full">{g}</span>
            ))}
            {modes.map((m, i) => (
              <span key={i} className="px-2 py-1 bg-[#FF6B35]/20 border border-[#FF6B35]/40 text-[#FF6B35] text-xs font-bold rounded-full">{m}</span>
            ))}
          </div>
        )}
      </div>

      {/* COURSES from catalog */}
      <div className="px-6 py-10 relative z-10">
        <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-4 text-center">Courses & Programs</h3>
        {activeServices.length > 0 ? (
          <div className="space-y-3">
            {activeServices.map((service) => (
              <button
                key={service.id}
                onClick={() => setSelectedService(service.id === selectedService ? '' : service.id)}
                className={`w-full bg-[#2A2369] p-4 rounded-2xl border text-left transition-all ${
                  selectedService === service.id
                    ? 'border-[#FF6B35] shadow-[0_0_20px_rgba(255,107,53,0.2)]'
                    : 'border-indigo-500/30 hover:border-indigo-400/50'
                }`}
              >
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-[#3B2C9A] rounded-xl flex items-center justify-center shrink-0">
                      <BookOpen className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">{service.title}</h4>
                      {service.description && <p className="text-xs text-indigo-300 line-clamp-1">{service.description}</p>}
                    </div>
                  </div>
                  <span className="font-bold text-[#FF6B35] shrink-0 ml-2">₹{service.price}</span>
                </div>
              </button>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-[#2A2369] p-6 rounded-3xl shadow-lg text-center border border-indigo-500/30">
              <div className="w-16 h-16 bg-[#3B2C9A] rounded-full flex items-center justify-center mx-auto mb-4">
                <BookOpen className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Math Crash Course</h3>
              <button className="mt-3 bg-[#FF6B35] text-white text-xs font-bold px-4 py-2 rounded-full">Explore</button>
            </div>
            <div className="bg-[#E94E1B] p-6 rounded-3xl shadow-lg text-center">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                <Atom className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-sm font-bold text-white mb-1">Physics Prep</h3>
              <button className="mt-3 bg-white text-[#E94E1B] text-xs font-bold px-4 py-2 rounded-full">Explore</button>
            </div>
          </div>
        )}
      </div>

      {/* ABOUT */}
      {meta.aboutText && (
        <div className="px-6 pb-6 relative z-10">
          <div className="bg-[#2A2369] rounded-2xl p-5 border border-indigo-500/30">
            <h3 className="text-xs font-bold text-indigo-300 uppercase tracking-widest mb-2">About</h3>
            <p className="text-indigo-100 text-sm leading-relaxed">{meta.aboutText}</p>
          </div>
        </div>
      )}

      {/* ENQUIRY FORM */}
      <div className="px-6 pb-8 relative z-10">
        <div className="bg-[#2A2369] rounded-3xl p-8 border border-indigo-500/30">
          <h3 className="text-xl font-black text-white mb-6 text-center">Ready to Excel? Get in Touch!</h3>
          {submitted ? (
            <div className="text-center py-4">
              <Check className="w-12 h-12 text-[#FF6B35] mx-auto mb-2" />
              <p className="text-white font-bold">Enquiry Sent!</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Your Name" className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white placeholder-indigo-200 focus:border-[#FF6B35] outline-none" />
              <select
                required
                value={selectedService}
                onChange={e => setSelectedService(e.target.value)}
                className="w-full bg-white/10 border border-white/20 rounded-xl p-4 text-white focus:border-[#FF6B35] outline-none appearance-none"
              >
                <option value="" className="text-black">
                  {subjectOptions.length > 0 ? 'Select Subject / Program' : 'Select Subject'}
                </option>
                {subjectOptions.length > 0 ? (
                  subjectOptions.map((s, i) => <option key={i} value={s} className="text-black">{s}</option>)
                ) : (
                  <>
                    <option value="math" className="text-black">Mathematics</option>
                    <option value="physics" className="text-black">Physics</option>
                  </>
                )}
              </select>
              <button type="submit" disabled={isSubmitting} className="w-full bg-[#FF6B35] text-white font-black py-4 rounded-xl shadow-lg shadow-[#FF6B35]/30 hover:bg-[#E94E1B] transition-colors mt-2">
                {isSubmitting ? 'Sending...' : 'ENQUIRE NOW →'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-[#1F1B4C] border-t border-white/10 flex justify-around p-4 z-50">
        <a href={`tel:${meta.contactPhone}`} className="text-indigo-300 hover:text-white p-2"><Phone className="w-6 h-6" /></a>
        <a href={`mailto:${meta.contactEmail}`} className="text-indigo-300 hover:text-white p-2"><Mail className="w-6 h-6" /></a>
        <button className="text-indigo-300 hover:text-white p-2"><MapPin className="w-6 h-6" /></button>
        <button className="text-indigo-300 hover:text-white p-2"><Globe className="w-6 h-6" /></button>
      </div>
    </div>
  );
}
