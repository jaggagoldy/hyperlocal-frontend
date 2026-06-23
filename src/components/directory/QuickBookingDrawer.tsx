'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { X, Calendar as CalendarIcon, Clock, Loader2, Check, Sparkles } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/authStore';
import { AuthModal } from '@/components/shared/AuthModal';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { Listing } from '@/lib/directory';
import { CatalogItem } from '@/types/models';

interface QuickBookingDrawerProps {
  vendor: Listing | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function QuickBookingDrawer({ vendor, isOpen, onClose }: QuickBookingDrawerProps) {
  const router = useRouter();
  const { cartItems, addItem, updateQuantity, clearCart, getTotalValue } = useCartStore();
  const { isAuthenticated } = useAuthStore();
  
  const [services, setServices] = useState<CatalogItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedServiceIds, setSelectedServiceIds] = useState<string[]>([]);
  
  // Booking Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceLocation, setServiceLocation] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  // Load vendor services on open
  useEffect(() => {
    if (isOpen && vendor?.id) {
      setLoading(true);
      setSelectedServiceIds([]);
      clearCart();
      apiClient.get(`/catalog?businessId=${vendor.id}`)
        .then(res => {
          const items = res.data.data || [];
          setServices(items.filter((item: any) => item.isActive !== false));
        })
        .catch(err => {
          console.error('Failed to load services', err);
          toast.error('Failed to fetch services for this vendor.');
        })
        .finally(() => setLoading(false));
    }
  }, [isOpen, vendor?.id]);

  if (!isOpen || !vendor) return null;

  const handleServiceToggle = (service: CatalogItem) => {
    const isSelected = selectedServiceIds.includes(service.id);
    if (isSelected) {
      setSelectedServiceIds(prev => prev.filter(id => id !== service.id));
      // Remove from cart store
      updateQuantity(service.id, -99); // Force remove
    } else {
      setSelectedServiceIds(prev => [...prev, service.id]);
      // Add to cart store as BOOKING type
      addItem(service, 'BOOKING');
    }
  };

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isAuthenticated) {
      toast.error('Please log in to place a booking.');
      setIsAuthModalOpen(true);
      return;
    }

    if (selectedServiceIds.length === 0) {
      return toast.error('Please select at least one service.');
    }

    if (!customerName || !customerPhone || !serviceLocation || !scheduledDate || !scheduledTime) {
      return toast.error('Please fill in all scheduling and contact details.');
    }

    // Combine Date and Time
    const dateTimeString = `${scheduledDate}T${scheduledTime}:00`;
    let scheduledAt;
    try {
      scheduledAt = new Date(dateTimeString).toISOString();
    } catch {
      return toast.error('Invalid Date or Time selection.');
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/orders', {
        businessProfileId: vendor.id,
        orderType: 'BOOKING',
        customerName,
        customerPhone,
        serviceLocation,
        scheduledAt,
        totalAmount: getTotalValue(),
        items: cartItems.map(ci => ({
          catalogItemId: ci.catalogItem.id,
          quantity: ci.quantity
        }))
      });
      
      toast.success('Booking Request sent successfully! Vendor will confirm soon.');
      clearCart();
      onClose();
      router.push('/profile/bookings');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to request booking.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex flex-col justify-end font-sans text-zinc-900">
        <div className="bg-white w-full max-w-xl mx-auto rounded-t-3xl flex flex-col max-h-[92vh] overflow-hidden animate-in slide-in-from-bottom duration-300">
          
          {/* Header */}
          <div className="px-6 py-4.5 border-b border-zinc-150 flex justify-between items-center bg-zinc-50/80">
            <div className="flex items-center gap-2">
              <span className="text-xl">📅</span>
              <div>
                <h2 className="font-black text-base text-zinc-950">Book an Appointment</h2>
                <p className="text-[10px] text-zinc-400 font-extrabold uppercase tracking-wider">{vendor.businessName}</p>
              </div>
            </div>
            <button 
              onClick={onClose} 
              className="p-2 rounded-full hover:bg-zinc-200 text-zinc-500 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-white hide-scrollbar">
            
            {/* Step 1: Select Services */}
            <div>
              <h3 className="font-bold text-xs text-emerald-700 mb-3.5 uppercase tracking-widest flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> 1. Select Services
              </h3>
              
              {loading ? (
                <div className="py-8 flex justify-center items-center gap-2 text-zinc-400 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-emerald-600" />
                  Loading offerings...
                </div>
              ) : services.length === 0 ? (
                <div className="py-6 text-center text-xs font-semibold text-zinc-400 border border-dashed border-zinc-250 rounded-2xl">
                  No offerings listed for bookings yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {services.map(s => {
                    const isSelected = selectedServiceIds.includes(s.id);
                    return (
                      <button
                        key={s.id}
                        onClick={() => handleServiceToggle(s)}
                        className={`w-full flex items-center justify-between p-3.5 rounded-2xl border text-left transition-all ${
                          isSelected 
                            ? 'bg-emerald-50 border-emerald-500/80 ring-1 ring-emerald-500 shadow-2xs' 
                            : 'bg-white border-zinc-200 hover:border-zinc-300'
                        }`}
                      >
                        <div className="flex-1 min-w-0 pr-4">
                          <p className="font-extrabold text-xs text-zinc-950 truncate">{s.title}</p>
                          {s.description && (
                            <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{s.description}</p>
                          )}
                        </div>
                        <div className="flex items-center gap-3 shrink-0">
                          <span className="font-black text-xs text-zinc-900">₹{s.price}</span>
                          <div className={`w-5 h-5 rounded-md border flex items-center justify-center transition-all ${
                            isSelected ? 'bg-emerald-600 border-emerald-600 text-white' : 'border-zinc-300 bg-zinc-50'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Step 2: Schedule & Contact details (shown if services selected) */}
            {selectedServiceIds.length > 0 && (
              <form id="quick-booking-form" onSubmit={handleBooking} className="space-y-6 animate-in fade-in duration-300">
                
                {/* Date & Time slots */}
                <div className="space-y-3.5">
                  <h3 className="font-bold text-xs text-emerald-700 uppercase tracking-widest">
                    2. Select Date &amp; Time
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 mb-1.5 block uppercase tracking-wider">Date</label>
                      <div className="relative group">
                        <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-600 transition-colors" />
                        <input 
                          required 
                          type="date" 
                          value={scheduledDate}
                          onChange={e => setScheduledDate(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-zinc-900 text-xs transition-all font-semibold"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-zinc-500 mb-1.5 block uppercase tracking-wider">Time Slot</label>
                      <div className="relative group">
                        <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 group-focus-within:text-emerald-600 transition-colors" />
                        <input 
                          required 
                          type="time" 
                          value={scheduledTime}
                          onChange={e => setScheduledTime(e.target.value)}
                          className="w-full bg-zinc-50 border border-zinc-200 rounded-xl pl-9 pr-3.5 py-2.5 outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-zinc-900 text-xs transition-all font-semibold"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Contact Inputs */}
                <div className="space-y-3">
                  <h3 className="font-bold text-xs text-emerald-700 uppercase tracking-widest">
                    3. Contact &amp; Location
                  </h3>
                  <div className="space-y-3">
                    <input 
                      required 
                      type="text" 
                      placeholder="Your Full Name"
                      value={customerName}
                      onChange={e => setCustomerName(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-xs font-semibold text-zinc-900 placeholder:text-zinc-450"
                    />
                    <input 
                      required 
                      type="tel" 
                      maxLength={10}
                      pattern="[6-9][0-9]{9}"
                      placeholder="10-digit Mobile Number"
                      value={customerPhone}
                      onChange={e => setCustomerPhone(e.target.value.replace(/\D/g, ''))}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-xs font-semibold text-zinc-900 placeholder:text-zinc-450"
                    />
                    <textarea 
                      required 
                      rows={2}
                      placeholder="Your Complete Address (House, Landmark, locality...)"
                      value={serviceLocation}
                      onChange={e => setServiceLocation(e.target.value)}
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 outline-none focus:ring-2 focus:ring-emerald-500/10 focus:border-emerald-500 text-xs font-semibold text-zinc-900 placeholder:text-zinc-450 resize-none"
                    />
                  </div>
                </div>

              </form>
            )}

          </div>

          {/* Sticky checkout footer */}
          <div className="p-5 border-t border-zinc-100 bg-white pb-safe">
            {selectedServiceIds.length > 0 ? (
              <button
                type="submit"
                form="quick-booking-form"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-extrabold text-base flex justify-center items-center bg-emerald-600 hover:bg-emerald-700 text-white shadow-lg shadow-emerald-600/10 disabled:opacity-50 transition-all active:scale-[0.98]"
              >
                {isSubmitting ? 'Requesting Appointment...' : `Book Slot · Total ₹${getTotalValue()}`}
              </button>
            ) : (
              <button
                disabled
                className="w-full py-4 rounded-xl font-extrabold text-base flex justify-center items-center bg-zinc-200 text-zinc-400 cursor-not-allowed"
              >
                Select Services to Book
              </button>
            )}
          </div>

        </div>
      </div>

      <AuthModal 
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        onSuccess={() => setIsAuthModalOpen(false)}
      />

      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </>
  );
}
