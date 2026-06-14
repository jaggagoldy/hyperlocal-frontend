'use client';

import React, { useState, useEffect } from 'react';
import { BusinessProfile } from '@/types/models';
import { MapPin, Phone, Mail, Globe, Star, Scissors, Sparkles, Check, Users, Tag } from 'lucide-react';
import apiClient from '@/lib/api-client';

export default function VCardSalonDark({ business }: { business: BusinessProfile }) {
  const meta = business.metaData || {};
  const [services, setServices] = useState<any[]>([]);
  const [selectedServices, setSelectedServices] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
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
    <div className="min-h-screen bg-[#111111] text-yellow-500 font-sans pb-24">
      {/* HEADER */}
      <div className="relative pt-12 pb-8 px-6 text-center border-b border-yellow-900/30 bg-gradient-to-b from-black to-[#111111]">
        <h1 className="text-2xl font-serif tracking-widest text-yellow-600 uppercase mb-6">
          {business.businessName || 'Elegance Salon'}
        </h1>

        <div className="mx-auto w-32 h-32 rounded-full border-4 border-yellow-600 p-1 mb-4">
          <img
            src={meta.logoUrl || "https://images.unsplash.com/photo-1600948836101-f9ffda59d250?auto=format&fit=crop&w=256&h=256"}
            alt="Profile"
            className="w-full h-full rounded-full object-cover"
          />
        </div>

        <h2 className="text-xl font-medium text-yellow-500 mb-1">{meta.displayName || 'Owner Name'}</h2>
        <p className="text-yellow-700 text-sm mb-3">{meta.tagline || 'Master Stylist & Owner'}</p>

        <div className="flex items-center justify-center gap-1 text-yellow-500">
          <span className="font-bold">{meta.ratingOverride || 4.8}</span>
          <div className="flex">
            {[...Array(5)].map((_, i) => (
              <Star key={i} className="w-4 h-4 fill-current" />
            ))}
          </div>
          <span className="text-yellow-700 text-sm ml-2">(124 Reviews)</span>
        </div>
      </div>

      {/* EXPERTISE & TAGS — from taxonomy */}
      {(genderLabel || allTags.length > 0) && (
        <div className="px-6 py-5 border-b border-yellow-900/30">
          {genderLabel && (
            <div className="flex items-center gap-2 mb-3">
              <Users className="w-4 h-4 text-yellow-600 shrink-0" />
              <span className="text-xs text-yellow-700 uppercase tracking-widest">Caters To</span>
              <span className="ml-auto px-3 py-1 bg-yellow-900/20 border border-yellow-700/40 rounded-full text-yellow-400 text-xs font-bold">
                {genderLabel}
              </span>
            </div>
          )}
          {allTags.length > 0 && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <Tag className="w-4 h-4 text-yellow-600 shrink-0" />
                <span className="text-xs text-yellow-700 uppercase tracking-widest">Specialties</span>
              </div>
              <div className="flex flex-wrap gap-2">
                {allTags.map((tag, i) => (
                  <span
                    key={i}
                    className="px-3 py-1 text-xs font-bold border border-yellow-600/40 text-yellow-500 rounded-full bg-yellow-900/10"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ABOUT */}
      {meta.aboutText && (
        <div className="px-6 py-5 border-b border-yellow-900/30">
          <p className="text-yellow-700 text-sm leading-relaxed">{meta.aboutText}</p>
        </div>
      )}

      {/* SERVICES */}
      <div className="px-6 py-8 border-b border-yellow-900/30">
        <h3 className="text-center text-sm tracking-widest text-yellow-600 uppercase mb-6">Our Services</h3>

        {loading ? (
          <div className="text-center text-yellow-800">Loading services...</div>
        ) : services.filter(s => s.isActive !== false).length === 0 ? (
          <div className="grid grid-cols-3 gap-4">
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-2 border-yellow-600 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(202,138,4,0.2)]">
                <Scissors className="w-8 h-8" />
              </div>
              <span className="text-xs tracking-wider uppercase text-center">Haircut</span>
            </div>
            <div className="flex flex-col items-center">
              <div className="w-16 h-16 rounded-full border-2 border-yellow-600 flex items-center justify-center mb-2 shadow-[0_0_15px_rgba(202,138,4,0.2)]">
                <Sparkles className="w-8 h-8" />
              </div>
              <span className="text-xs tracking-wider uppercase text-center">Spa<br />Treatments</span>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {services.filter(s => s.isActive !== false).map(service => {
              const isSelected = selectedServices.includes(service.id);
              // Only show image if it's set and NOT a food placeholder
              const hasImage = service.mediaUrl &&
                !service.mediaUrl.includes('1546069901') && // food bowl URL
                !service.mediaUrl.includes('unsplash.com/photo-1546069');
              return (
                <div
                  key={service.id}
                  onClick={() => toggleService(service.id)}
                  className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${isSelected
                    ? 'border-yellow-500 bg-yellow-900/20 shadow-[0_0_15px_rgba(202,138,4,0.15)]'
                    : 'border-yellow-900/30 bg-[#151515] hover:border-yellow-700/50'
                  }`}
                >
                  {hasImage && (
                    <img src={service.mediaUrl} alt={service.title} className="w-14 h-14 rounded-lg object-cover shrink-0" />
                  )}
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-yellow-500">{service.title}</h4>
                    {service.description && <p className="text-xs text-yellow-700 mt-1 line-clamp-1">{service.description}</p>}
                  </div>
                  <div className="flex items-center gap-3 shrink-0">
                    <span className="font-serif text-yellow-600 tracking-wide">₹{service.price}</span>
                    <div className={`w-6 h-6 rounded-full border flex items-center justify-center ${isSelected ? 'border-yellow-500 bg-yellow-500 text-black' : 'border-yellow-900/50'}`}>
                      {isSelected && <Check className="w-4 h-4" />}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* BOOKING FORM */}
      <div className="px-6 py-8">
        <div className="border border-yellow-600/50 rounded-lg p-6 bg-[#1a1a1a] shadow-[0_0_30px_rgba(202,138,4,0.05)]">
          <h3 className="text-center text-sm tracking-widest text-yellow-600 uppercase mb-6">Make Appointment</h3>

          {submitted ? (
            <div className="text-center py-8">
              <div className="w-16 h-16 mx-auto bg-yellow-500/20 rounded-full flex items-center justify-center mb-4">
                <Check className="w-8 h-8 text-yellow-500" />
              </div>
              <h4 className="text-lg font-medium text-yellow-500 mb-2">Request Received!</h4>
              <p className="text-yellow-700 text-sm">We will contact you shortly to confirm your booking.</p>
              <button onClick={() => setSubmitted(false)} className="mt-6 text-sm text-yellow-600 underline">
                Book another
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {selectedServices.length > 0 && (
                <div className="p-3 bg-yellow-900/10 border border-yellow-900/30 rounded-lg flex justify-between items-center text-sm mb-4">
                  <span className="text-yellow-600">{selectedServices.length} service(s) selected</span>
                  <span className="font-bold text-yellow-500">₹{totalSelectedPrice}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="text-xs tracking-wider uppercase text-yellow-700">Select Date</label>
                <input
                  type="datetime-local"
                  required
                  value={date}
                  onChange={e => setDate(e.target.value)}
                  className="w-full bg-black border border-yellow-900/50 rounded p-3 text-yellow-500 focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs tracking-wider uppercase text-yellow-700">Full Name</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Your Name"
                  className="w-full bg-black border border-yellow-900/50 rounded p-3 text-yellow-500 placeholder-yellow-900 focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs tracking-wider uppercase text-yellow-700">Message / Request</label>
                <input
                  type="text"
                  value={message}
                  onChange={e => setMessage(e.target.value)}
                  placeholder="Optional notes for your booking"
                  className="w-full bg-black border border-yellow-900/50 rounded p-3 text-yellow-500 placeholder-yellow-900 focus:outline-none focus:border-yellow-500 transition-colors"
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting || (meta.enableServiceSelection && selectedServices.length === 0)}
                className="w-full bg-gradient-to-r from-yellow-600 to-yellow-500 text-black font-bold uppercase tracking-widest py-4 rounded shadow-[0_0_20px_rgba(202,138,4,0.3)] hover:opacity-90 transition-opacity mt-4 disabled:opacity-50"
              >
                {isSubmitting ? 'Submitting...' : 'Make Appointment'}
              </button>
            </form>
          )}
        </div>
      </div>

      {/* FOOTER NAV */}
      <div className="fixed bottom-0 left-0 right-0 bg-black border-t border-yellow-900/50 flex justify-around p-4 z-50">
        <a href={`tel:${meta.contactPhone}`} className="text-yellow-600 hover:text-yellow-400 p-2"><Phone className="w-5 h-5" /></a>
        <a href={`mailto:${meta.contactEmail}`} className="text-yellow-600 hover:text-yellow-400 p-2"><Mail className="w-5 h-5" /></a>
        <button className="text-yellow-600 hover:text-yellow-400 p-2"><MapPin className="w-5 h-5" /></button>
        <button className="text-yellow-600 hover:text-yellow-400 p-2"><Globe className="w-5 h-5" /></button>
      </div>
    </div>
  );
}
