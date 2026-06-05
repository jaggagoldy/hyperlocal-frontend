'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/authStore';
import { AuthModal } from '@/components/shared/AuthModal';
import { BusinessProfile } from '@/types/models';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { X, ChevronRight } from 'lucide-react';

interface CartDrawerProps {
  vendor: BusinessProfile;
  theme: any;
}

export default function CartDrawer({ vendor, theme }: CartDrawerProps) {
  const { cartItems, getTotalValue, clearCart } = useCartStore();
  const [isOpen, setIsOpen] = useState(false);
  
  // Form State
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceLocation, setServiceLocation] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const totalValue = getTotalValue();
  const itemCount = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  if (itemCount === 0) return null;

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Check authentication first
    const { isAuthenticated } = useAuthStore.getState();
    if (!isAuthenticated) {
      toast.error('Please log in to place an order.');
      setIsAuthModalOpen(true);
      return;
    }

    if (!customerName || !customerPhone || !serviceLocation) {
      return toast.error('Please fill in all details.');
    }

    setIsSubmitting(true);
    try {
      await apiClient.post('/orders/checkout', {
        vendorId: vendor.id,
        orderType: 'TRANSACTIONAL',
        customerName,
        customerPhone,
        serviceLocation,
        items: cartItems.map(ci => ({
          catalogItemId: ci.catalogItem.id,
          quantity: ci.quantity
        }))
      });
      toast.success('Order placed successfully! The vendor will contact you shortly.');
      clearCart();
      setIsOpen(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to place order.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Sticky Bottom Bar when Drawer is closed */}
      {!isOpen && (
        <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-transparent pointer-events-none pb-safe">
          <div className="max-w-5xl mx-auto flex justify-center">
            <button 
              onClick={() => setIsOpen(true)}
              className="w-full md:max-w-md py-3.5 px-5 rounded-2xl shadow-xl font-bold text-white flex items-center justify-between bg-green-600 hover:bg-green-700 pointer-events-auto active:scale-[0.98] transition-transform"
            >
              <div className="flex items-center gap-2">
                <span className="bg-white/20 px-2 py-0.5 rounded text-sm">{itemCount} item{itemCount > 1 ? 's' : ''}</span>
                <span className="text-lg">₹{totalValue}</span>
              </div>
              <div className="flex items-center gap-1">
                <span>View Cart</span>
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          </div>
        </div>
      )}

      {/* Drawer Overlay */}
      {isOpen && (
        <div className="fixed inset-0 z-[60] bg-black/60 flex flex-col justify-end">
          <div className="bg-background w-full max-h-[90vh] rounded-t-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom">
            <div className="p-4 border-b flex justify-between items-center bg-muted/30">
              <h2 className="font-bold text-lg">Checkout</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-black/5"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6">
              {/* Order Summary */}
              <div>
                <h3 className="font-semibold text-sm text-muted-foreground mb-3 uppercase tracking-wider">Order Summary</h3>
                <div className="space-y-3">
                  {cartItems.map(ci => (
                    <div key={ci.catalogItem.id} className="flex justify-between items-start text-sm">
                      <div className="flex gap-2">
                        <span className="font-medium">{ci.quantity}x</span>
                        <span>{ci.catalogItem.title}</span>
                      </div>
                      <span className="font-semibold">₹{(parseFloat(ci.catalogItem.price?.toString() || '0') * ci.quantity)}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t flex justify-between font-bold text-lg">
                    <span>Total</span>
                    <span>₹{totalValue}</span>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                <h3 className="font-semibold text-sm text-muted-foreground uppercase tracking-wider">Delivery Details</h3>
                <div>
                  <label className="text-sm font-medium">Your Name</label>
                  <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="mt-1 w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary/50" placeholder="e.g. Rahul Kumar" />
                </div>
                <div>
                  <label className="text-sm font-medium">Mobile Number</label>
                  <input required type="tel" pattern="[6-9][0-9]{9}" value={customerPhone} onChange={e => setCustomerPhone(e.target.value)} className="mt-1 w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary/50" placeholder="10-digit mobile number" />
                </div>
                <div>
                  <label className="text-sm font-medium">Complete Delivery Address</label>
                  <textarea required value={serviceLocation} onChange={e => setServiceLocation(e.target.value)} rows={3} className="mt-1 w-full border rounded-lg p-2.5 outline-none focus:ring-2 focus:ring-primary/50 resize-none" placeholder="House no, Street, Landmark..." />
                </div>
              </form>
            </div>

            <div className="p-4 border-t bg-background pb-safe">
              <button 
                type="submit" 
                form="checkout-form"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center ${theme.colors.primary} border border-transparent disabled:opacity-50 text-white`}
                style={{ backgroundColor: 'var(--primary, #000)' }} // Fallback if theme structure implies tailwind classes for bg
              >
                {isSubmitting ? 'Processing...' : 'Place Order via WhatsApp'}
              </button>
            </div>
          </div>
        </div>
      )}

      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={() => {
          setIsAuthModalOpen(false);
          // Optional: we can automatically submit the checkout if they succeed,
          // but just letting them click "Place Order" again is fine.
        }}
      />
    </>
  );
}
