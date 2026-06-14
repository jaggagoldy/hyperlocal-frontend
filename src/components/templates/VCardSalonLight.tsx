'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { MapPin, Phone, Mail, Globe, Star, Scissors, Sparkles, Check, Users, Tag } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardSalonLight({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [services, setServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const [name, setName] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    if (business.catalog !== undefined) {
      setServices(business.catalog || []);
      setLoading(false);
    } else if (business.id) {
      const fetchCatalog = async () => {
        try {
          const res = await apiClient.get(`/catalog?businessId=${business.id}`);
          setServices(res.data.data || []);
        } catch (err) {
          console.error(err);
        } finally {
          setLoading(false);
        }
      };
      fetchCatalog();
    } else {
      setLoading(false);
    }
  }, [business.id, business.catalog]);

  const toggleService = (id: string) => {
    setSelectedServices(prev => 
      prev.includes(id) ? prev.filter(s => s !== id) : [...prev, id]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
    }, 1000);
  };

  const totalSelectedPrice = services
    .filter(s => selectedServices.includes(s.id))
    .reduce((sum, s) => sum + (Number(s.price) || 0), 0);

  // Taxonomy
  const genderLabel: string = meta.taxonomy?.gender || '';
  const expertiseTags: string[] = meta.taxonomy?.expertise || [];
  const customTags: string[] = meta.customTags || [];
  const allTags = [...expertiseTags, ...customTags];

  return (
    <div className="min-h-screen bg-stone-50 text-stone-800 font-sans pb-24">
      {/* HEADER SECTION */}
      <div className="bg-white rounded-b-[3rem] shadow-sm pb-10 pt-12 px-6 text-center relative overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-32 bg-pink-50"></div>
        
        <div className="relative mx-auto w-32 h-32 rounded-full border-4 border-white p-1 mb-4 shadow-lg bg-white">
          <img 
            src={meta.logoUrl || "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=256&h=256"} 
            alt="Profile" 
            className="w-full h-full rounded-full object-cover"
          />
        </div>
        
        <h1 className="text-2xl font-serif text-stone-900 mb-1">
          {business.businessName || 'Beauty & Bloom'}
        </h1>
        <h2 className="text-sm font-medium text-pink-600 mb-2 uppercase tracking-widest">{meta.displayName || 'Owner Name'}</h2>
        <p className="text-stone-500 text-sm mb-4 max-w-xs mx-auto leading-relaxed">{meta.aboutText || ''}</p>
        
        <div className="flex items-center justify-center gap-1 text-pink-500 bg-pink-50 w-max mx-auto px-4 py-2 rounded-full">
          <span className="font-bold">{meta.ratingOverride || 4.8}</span>
          <Star className="w-4 h-4 fill-current" />
          <span className="text-stone-500 text-xs ml-1">(120 reviews)</span>
        </div>
      </div>

      {/* EXPERTISE & TAGS from taxonomy */}
      {(genderLabel || allTags.length > 0) && (
        <div className="px-6 py-5 bg-white border-b border-stone-100">
          {genderLabel && (
            <div className="flex items-center gap-3 mb-3">
              <Users className="w-4 h-4 text-pink-400 shrink-0" />
              <span className="text-xs text-stone-400 uppercase tracking-widest">Caters To</span>
              <span className="ml-auto px-3 py-1 bg-pink-50 border border-pink-200 rounded-full text-pink-600 text-xs font-bold">
                {genderLabel}
              </span>
            </div>
          )}
          {allTags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-pink-400 shrink-0" />
                <span className="text-xs text-stone-400 uppercase tracking-widest">Specialties</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs font-bold border border-pink-200 text-pink-600 rounded-full bg-pink-50"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* SERVICES */}
      <div className="px-6 py-8">
        <h3 className="text-center text-sm font-bold tracking-widest text-stone-400 uppercase mb-6">Select Services</h3>
        
        {loading ? (
          <div className="text-center text-stone-400">Loading...</div>
        ) : services.length === 0 ? (
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
              <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Scissors className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-stone-800">Styling</span>
            </div>
            <div className="bg-white p-6 rounded-2xl shadow-sm text-center">
              <div className="w-12 h-12 bg-pink-50 text-pink-500 rounded-xl flex items-center justify-center mx-auto mb-3">
                <Sparkles className="w-6 h-6" />
              </div>
              <span className="text-sm font-bold text-stone-800">Nails</span>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {services.filter(s => s.isActive !== false).map(service => {
              const isSelected = selectedServices.includes(service.id);
              // Only show image if it's a real image (not food placeholder)
              const hasRealImage = service.mediaUrl &&
                !service.mediaUrl.includes('1546069901') &&
                !service.mediaUrl.includes('photo-1546069');
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`p-5 rounded-2xl transition-all cursor-pointer border-2 text-center relative ${
                    isSelected
                      ? 'border-pink-500 bg-pink-50 shadow-md'
                      : 'border-transparent bg-white shadow-sm hover:border-pink-200'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 w-5 h-5 bg-pink-500 rounded-full flex items-center justify-center text-white shadow-sm">
                      <Check className="w-3 h-3" />
                    </div>
                  )}
                  {hasRealImage && (
                    <img src={service.mediaUrl} alt={service.title} className="w-16 h-16 rounded-xl object-cover mx-auto mb-3" />
                  )}
                  <h4 className="font-bold text-stone-800 mb-1">{service.title}</h4>
                  <span className="text-sm text-pink-600 font-medium">₹{service.price}</span>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOOKING FORM */}
      <div className="px-6 pb-8">
        <div className="bg-white rounded-3xl p-8 shadow-sm">
          <h3 className="text-center text-xl font-serif text-stone-800 mb-6">Book Your Session</h3>
          
          {submitted ? (
            <div className="text-center py-6">
              <div className="w-16 h-16 mx-auto bg-green-50 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-green-500" />
              </div>
              <h4 className="text-lg font-bold text-stone-800 mb-2">Request Received</h4>
              <p className="text-stone-500 text-sm">We will contact you to confirm.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {selectedServices.length > 0 && (
                <div className="flex justify-between items-center text-sm mb-2 px-1">
                  <span className="text-stone-500 font-medium">{selectedServices.length} selected</span>
                  <span className="font-bold text-pink-600">₹{totalSelectedPrice} Total</span>
                </div>
              )}
              
              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Full Name</label>
                <input 
                  type="text" 
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-stone-800 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Date & Time</label>
                <input 
                  type="datetime-local" 
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-stone-800 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-stone-500 uppercase tracking-wider mb-2">Message</label>
                <input 
                  type="text" 
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  className="w-full bg-stone-50 border border-stone-200 rounded-xl p-4 text-stone-800 focus:outline-none focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition-all"
                />
              </div>

              <button 
                type="submit" 
                disabled={isSubmitting || (meta.enableServiceSelection && selectedServices.length === 0)}
                className="w-full bg-pink-500 text-white font-bold py-4 rounded-xl shadow-lg shadow-pink-500/30 hover:bg-pink-600 transition-colors mt-2 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Make Appointment'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FOOTER NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-stone-100 flex justify-around p-4 z-50">
        <a href={`tel:${meta.contactPhone}`} className="text-stone-400 hover:text-pink-500 transition-colors p-2"><Phone className="w-6 h-6" /></a>
        <a href={`mailto:${meta.contactEmail}`} className="text-stone-400 hover:text-pink-500 transition-colors p-2"><Mail className="w-6 h-6" /></a>
        <button className="text-stone-400 hover:text-pink-500 transition-colors p-2"><MapPin className="w-6 h-6" /></button>
        <button className="text-stone-400 hover:text-pink-500 transition-colors p-2"><Globe className="w-6 h-6" /></button>
      </div>
    </div>
  );
}
