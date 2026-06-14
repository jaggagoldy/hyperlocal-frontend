'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { MapPin, Phone, Mail, Globe, Book, PenTool, Check, BookOpen } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardTutorClean({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [services, setServices] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [subject, setSubject] = useState('');
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

  // Build dropdown options: from taxonomy OR from catalog items
  const subjectOptions = subjectsList.length > 0 ? subjectsList : 
    services.map(s => s.title);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans pb-24">
      {/* HERO */}
      <div className="pt-16 pb-8 px-6 text-center bg-white border-b border-slate-200 shadow-sm">
        <div className="mx-auto w-24 h-24 rounded-2xl mb-4 bg-slate-100 p-1">
          <img 
            src={meta.logoUrl || "https://images.unsplash.com/photo-1544717302-de2939b7ef71?auto=format&fit=crop&w=256&h=256"} 
            alt="Profile" 
            className="w-full h-full rounded-xl object-cover"
          />
        </div>
        <h1 className="text-2xl font-bold text-slate-900 mb-1">
          {business.businessName || 'Academic Excellence'}
        </h1>
        <h2 className="text-sm font-semibold text-blue-600 mb-2">
          {meta.displayName || 'David Chen'}
        </h2>
        <p className="text-slate-500 text-sm max-w-xs mx-auto">
          {meta.tagline || 'Expert Tutoring in Mathematics & Sciences'}
        </p>

        {/* Tags: grades & modes */}
        {/* Tags: subjects, grades & modes */}
        {(subjectsList.length > 0 || grades.length > 0 || modes.length > 0) && (
          <div className="flex flex-wrap justify-center gap-2 mt-4">
            {subjectsList.map((s, i) => (
              <span key={i} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-md">{s}</span>
            ))}
            {grades.map((g, i) => (
              <span key={i} className="px-2 py-1 bg-blue-50 text-blue-700 text-xs font-bold rounded-md">{g}</span>
            ))}
            {modes.map((m, i) => (
              <span key={i} className="px-2 py-1 bg-slate-100 text-slate-600 text-xs font-semibold rounded-md">{m}</span>
            ))}
          </div>
        )}
      </div>

      {/* PROGRAMS from catalog */}
      <div className="px-6 py-8">
        <h3 className="text-xs font-bold tracking-widest text-slate-400 uppercase mb-4 text-center">Programs & Courses</h3>
        {services.filter(s => s.isActive !== false).length > 0 ? (
          <div className="space-y-3">
            {services.filter(s => s.isActive !== false).map((service) => (
              <div key={service.id} className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                  <BookOpen className="w-6 h-6" />
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-slate-900">{service.title}</h4>
                  {service.description && <p className="text-xs text-slate-500 line-clamp-1">{service.description}</p>}
                </div>
                <span className="font-bold text-blue-700 shrink-0 ml-2">₹{service.price}</span>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3">
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <Book className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Weekly Tutoring</h4>
                <p className="text-xs text-slate-500">1-on-1 personalized sessions</p>
              </div>
            </div>
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-center gap-4">
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center shrink-0">
                <PenTool className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-bold text-slate-900">Exam Prep</h4>
                <p className="text-xs text-slate-500">Intensive crash courses</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* ABOUT */}
      {meta.aboutText && (
        <div className="px-6 pb-6">
          <div className="bg-white rounded-xl p-5 shadow-sm border border-slate-200">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">About</h3>
            <p className="text-slate-600 text-sm leading-relaxed">{meta.aboutText}</p>
          </div>
        </div>
      )}

      {/* ENQUIRY FORM */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-slate-200">
          <h3 className="text-lg font-bold text-slate-900 mb-4">Enroll Now</h3>
          {submitted ? (
            <div className="text-center py-4 bg-slate-50 rounded-xl">
              <Check className="w-8 h-8 text-blue-600 mx-auto mb-2" />
              <p className="text-slate-800 font-medium text-sm">Request Submitted</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input type="text" required value={name} onChange={e => setName(e.target.value)} placeholder="Student Name" className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all" />
              <select required value={subject} onChange={e => setSubject(e.target.value)} className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-sm text-slate-900 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none appearance-none transition-all">
                <option value="">
                  {subjectOptions.length > 0 ? 'Select Subject / Program' : 'Select Level'}
                </option>
                {subjectOptions.length > 0 ? (
                  subjectOptions.map((s, i) => <option key={i} value={s}>{s}</option>)
                ) : (
                  <>
                    <option value="highschool">High School</option>
                    <option value="college">College / University</option>
                  </>
                )}
              </select>
              <button type="submit" disabled={isSubmitting} className="w-full bg-slate-900 text-white font-bold text-sm py-3 rounded-lg hover:bg-slate-800 transition-colors">
                {isSubmitting ? 'Sending...' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FOOTER */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 flex justify-around p-4 z-50">
        <a href={`tel:${meta.contactPhone}`} className="text-slate-400 hover:text-blue-600 transition-colors"><Phone className="w-5 h-5" /></a>
        <a href={`mailto:${meta.contactEmail}`} className="text-slate-400 hover:text-blue-600 transition-colors"><Mail className="w-5 h-5" /></a>
        <button className="text-slate-400 hover:text-blue-600 transition-colors"><MapPin className="w-5 h-5" /></button>
        <button className="text-slate-400 hover:text-blue-600 transition-colors"><Globe className="w-5 h-5" /></button>
      </div>
    </div>
  );
}
