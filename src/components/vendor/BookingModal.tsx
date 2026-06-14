'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { BusinessProfile, CatalogItem } from '@/types/models';
import { useAuthStore } from '@/store/authStore';
import { AuthModal } from '@/components/shared/AuthModal';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { X, Calendar as CalendarIcon, Clock } from 'lucide-react';

interface BookingModalProps {
  vendor: BusinessProfile;
  theme: any;
  onClose: () => void;
}

export default function BookingModal({ vendor, theme, onClose }: BookingModalProps) {
  const { cartItems, getTotalValue, clearCart } = useCartStore();
  
  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceLocation, setServiceLocation] = useState('');
  
  // Date/Time State
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledTime, setScheduledTime] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalValue = getTotalValue();

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication first
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      toast.error('Please log in to place a booking.');
      setIsAuthModalOpen(true);
      return;
    }

    if (!customerName || !customerPhone || !serviceLocation || !scheduledDate || !scheduledTime) {
      return toast.error('Please fill in all details, including date and time.');
    }

    // Combine date and time to ISO string
    const dateTimeString = `${scheduledDate}T${scheduledTime}:00`;
    let scheduledAt;
    try {
      scheduledAt = new Date(dateTimeString).toISOString();
    } catch {
      return toast.error('Invalid Date/Time selected.');
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/orders/checkout', {
        vendorId: vendor.id,
        orderType: 'BOOKING',
        customerName,
        customerPhone,
        serviceLocation,
        scheduledAt,
        items: cartItems.map(ci => ({
          catalogItemId: ci.catalogItem.id,
          quantity: ci.quantity
        }))
      });
      toast.success('Booking Request sent successfully! The vendor will confirm shortly.');
      clearCart();
      onClose();
      router.push('/profile/enquiries');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send booking request.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-zinc-950 border border-zinc-800 w-full max-w-md max-h-[90vh] rounded-2xl flex flex-col overflow-hidden animate-in zoom-in-95 shadow-[0_0_50px_rgba(0,0,0,0.5)]">
        <div className="p-5 border-b border-zinc-800 flex justify-between items-center bg-zinc-900/50">
          <h2 className="font-extrabold text-xl text-zinc-100">Book Service</h2>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-white/10 text-zinc-400 hover:text-zinc-100 transition-colors">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="flex-1 overflow-y-auto p-5 space-y-8 hide-scrollbar">
          {/* Selected Services */}
          <div>
            <h3 className="font-bold text-xs text-amber-500 mb-4 uppercase tracking-widest flex items-center gap-2">
              <span className="w-4 h-[1px] bg-amber-500/50"></span> Selected Services
            </h3>
            <div className="space-y-3 bg-zinc-900/50 p-4 rounded-xl border border-zinc-800/50">
              {cartItems.map(ci => (
                <div key={ci.catalogItem.id} className="flex justify-between items-start text-sm">
                  <span className="text-zinc-300 font-medium">{ci.catalogItem.title}</span>
                  <span className="font-bold text-zinc-100">₹{ci.catalogItem.price?.toString() || '0'}</span>
                </div>
              ))}
              <div className="pt-3 mt-3 border-t border-zinc-800 flex justify-between font-black text-lg text-amber-400">
                <span>Estimated Total</span>
                <span>₹{totalValue}</span>
              </div>
            </div>
          </div>

          <form id="booking-form" onSubmit={handleBooking} className="space-y-8">
            {/* Scheduling */}
            <div>
               <h3 className="font-bold text-xs text-amber-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                 <span className="w-4 h-[1px] bg-amber-500/50"></span> When do you need this?
               </h3>
               <div className="grid grid-cols-2 gap-4">
                 <div>
                   <label className="text-xs font-bold text-zinc-400 mb-2 block uppercase tracking-wide">Date</label>
                   <div className="relative group">
                     <CalendarIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
                     <input required type="date" value={scheduledDate} onChange={e => setScheduledDate(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 text-zinc-100 text-sm transition-all" style={{ colorScheme: 'dark' }} />
                   </div>
                 </div>
                 <div>
                   <label className="text-xs font-bold text-zinc-400 mb-2 block uppercase tracking-wide">Time</label>
                   <div className="relative group">
                     <Clock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500 group-focus-within:text-amber-500 transition-colors" />
                     <input required type="time" value={scheduledTime} onChange={e => setScheduledTime(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl pl-10 pr-4 py-3 outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 text-zinc-100 text-sm transition-all" style={{ colorScheme: 'dark' }} />
                   </div>
                 </div>
               </div>
            </div>

            {/* Customer Details */}
            <div>
              <h3 className="font-bold text-xs text-amber-500 mb-4 uppercase tracking-widest flex items-center gap-2">
                <span className="w-4 h-[1px] bg-amber-500/50"></span> Your Details
              </h3>
              <div className="space-y-4">
                <div>
                  <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 text-zinc-100 text-sm placeholder:text-zinc-600 transition-all" placeholder="Full Name" />
                </div>
                <div>
                  <input required type="tel" pattern="[6-9][0-9]{9}" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 text-zinc-100 text-sm placeholder:text-zinc-600 transition-all" placeholder="10-digit mobile number" />
                </div>
                <div>
                  <textarea required value={serviceLocation} onChange={e => setServiceLocation(e.target.value)} rows={3} className="w-full bg-zinc-900 border border-zinc-800 rounded-xl p-3.5 outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 text-zinc-100 text-sm placeholder:text-zinc-600 resize-none transition-all" placeholder="Service Address (House/Flat, Street, Landmark...)" />
                </div>
              </div>
            </div>
          </form>
        </div>

        <div className="p-5 border-t border-zinc-800 bg-zinc-950/80 backdrop-blur-md pb-safe">
          <button 
            type="submit" 
            form="booking-form"
            disabled={isSubmitting}
            className="w-full py-4 rounded-xl font-extrabold text-lg flex justify-center items-center bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 shadow-[0_0_20px_rgba(245,158,11,0.2)] disabled:opacity-50 transition-transform active:scale-[0.98]"
          >
            {isSubmitting ? 'Processing...' : 'Send Booking Request'}
          </button>
        </div>
      </div>
      <style jsx>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={() => {
          setIsAuthModalOpen(false);
        }}
      />
    </div>
  );
}
