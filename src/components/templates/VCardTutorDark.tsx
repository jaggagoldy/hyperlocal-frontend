'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { BookOpen, GraduationCap, Check, HelpCircle, FileText, UserCheck, Calendar } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardTutorDark({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [courses, setCourses] = useState<any[]>([]);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedCourse, setSelectedCourse] = useState('');
  const [grade, setGrade] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (business.catalog !== undefined) {
      setCourses(business.catalog || []);
    } else if (business.id) {
      apiClient.get(`/catalog?businessId=${business.id}`)
        .then(res => setCourses(res.data.data || []))
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
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans pb-24 relative overflow-hidden">
      {/* Glow overlays */}
      <div className="absolute top-[-5%] left-[-10%] w-[350px] h-[350px] bg-indigo-650/10 rounded-full blur-[90px] pointer-events-none"></div>

      {/* HEADER SECTION */}
      <div className="pt-20 pb-10 px-6 text-center border-b border-slate-900 bg-slate-950/70 backdrop-blur-md relative z-10">
        <div className="mx-auto w-24 h-24 rounded-2xl border border-indigo-500/20 p-1.5 bg-slate-900 mb-4 shadow-xl">
          <img 
            src={meta.logoUrl || "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=256&h=256"} 
            alt="Tutor Logo" 
            className="w-full h-full rounded-xl object-cover"
          />
        </div>
        <span className="px-2.5 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] font-bold uppercase rounded-md tracking-wider">ACADEMIC & COACHING</span>
        <h1 className="text-2xl font-black text-white mt-3 leading-tight tracking-tight">{business.businessName || 'Elite Academy'}</h1>
        {meta.displayName && <p className="text-xs font-semibold text-slate-400 mt-1">Instructor: {meta.displayName}</p>}
        <p className="text-slate-500 text-xs mt-2 italic max-w-xs mx-auto">"{meta.tagline || 'Simplifying concepts, achieving success.'}"</p>
      </div>

      {/* BATCHES & COURSES (CATALOG) */}
      <div className="px-6 py-8 relative z-10">
        <h3 className="text-xs font-bold tracking-widest text-indigo-400 uppercase mb-4 flex items-center gap-1.5">
          <BookOpen className="w-4 h-4" /> Academic Programs
        </h3>
        {courses.filter(c => c.isActive !== false).length > 0 ? (
          <div className="space-y-3.5">
            {courses.filter(c => c.isActive !== false).map((course) => (
              <div key={course.id} className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex items-center justify-between shadow-md">
                <div className="flex-1 min-w-0">
                  <h4 className="font-bold text-white text-sm">{course.title}</h4>
                  {course.description && <p className="text-xs text-slate-400 mt-1 line-clamp-1">{course.description}</p>}
                </div>
                <div className="text-right shrink-0 ml-4">
                  <span className="font-black text-indigo-400 text-sm">₹{course.price}</span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="space-y-3.5">
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex justify-between items-center shadow-md">
              <div>
                <h4 className="font-bold text-white text-sm">Mathematics (Grade 10)</h4>
                <p className="text-xs text-slate-400">Board exams preparation</p>
              </div>
              <span className="font-black text-indigo-400 text-sm">₹1,200 / month</span>
            </div>
            <div className="bg-slate-900 border border-slate-850 p-4 rounded-xl flex justify-between items-center shadow-md">
              <div>
                <h4 className="font-bold text-white text-sm">Physics Crash Course</h4>
                <p className="text-xs text-slate-400">Intensive board preparation</p>
              </div>
              <span className="font-black text-indigo-400 text-sm">₹2,500</span>
            </div>
          </div>
        )}
      </div>

      {/* STUDENT REGISTRATION FORM */}
      <div className="px-6 pb-8 relative z-10">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
          <h3 className="text-base font-bold text-white mb-4 text-center">Enrollment Enquiry</h3>
          {submitted ? (
            <div className="text-center py-6 bg-slate-950/80 rounded-xl border border-indigo-500/20">
              <Check className="w-8 h-8 text-indigo-400 mx-auto mb-2" />
              <p className="text-white font-bold text-sm">Enrollment Query Sent!</p>
              <p className="text-slate-450 text-xs mt-1">We will contact you to discuss scheduling and slot options.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <input 
                type="text" 
                required 
                value={name} 
                onChange={e => setName(e.target.value)} 
                placeholder="Student Full Name" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium" 
              />
              <input 
                type="tel" 
                required 
                value={phone} 
                onChange={e => setPhone(e.target.value)} 
                placeholder="Guardian Phone Number" 
                className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium" 
              />
              <div className="grid grid-cols-2 gap-3">
                <input 
                  type="text" 
                  required 
                  value={grade} 
                  onChange={e => setGrade(e.target.value)} 
                  placeholder="Class / Grade (e.g. Grade 10)" 
                  className="col-span-2 w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-100 placeholder-slate-600 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium" 
                />
              </div>
              <div>
                <select 
                  value={selectedCourse} 
                  onChange={e => setSelectedCourse(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 text-sm text-slate-300 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 outline-none transition-all font-medium"
                >
                  <option value="">Select Course / Program</option>
                  {courses.map(c => <option key={c.id} value={c.title}>{c.title}</option>)}
                  <option value="General Query">General Query</option>
                </select>
              </div>
              <button 
                type="submit" 
                disabled={isSubmitting} 
                className="w-full py-3.5 bg-indigo-650 hover:bg-indigo-700 text-white font-bold rounded-xl transition-all shadow-lg disabled:opacity-50 text-sm"
              >
                {isSubmitting ? 'Sending Request...' : 'Submit Request'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
