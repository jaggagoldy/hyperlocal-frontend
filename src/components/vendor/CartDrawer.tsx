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

  // Coupon State
  const [couponCode, setCouponCode] = useState('');
  const [appliedDiscount, setAppliedDiscount] = useState<{code: string, amount: number, title: string} | null>(null);
  const [discountError, setDiscountError] = useState('');

  const totalValue = getTotalValue();
  const finalTotal = appliedDiscount ? Math.max(0, totalValue - appliedDiscount.amount) : totalValue;
  const itemCount = cartItems.reduce((acc, ci) => acc + ci.quantity, 0);

  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  if (itemCount === 0) return null;

  const handleApplyCoupon = (e: React.MouseEvent) => {
    e.preventDefault();
    setDiscountError('');
    setAppliedDiscount(null);

    if (!couponCode) return;

    const offers = vendor.metaData?.offers || [];
    const offer = offers.find((o: any) => o.code.toUpperCase() === couponCode.toUpperCase());
    
    if (!offer) {
      setDiscountError('Invalid or expired coupon code');
      return;
    }

    let amount = 0;
    if (offer.discount.includes('%')) {
      const match = offer.discount.match(/(\d+)/);
      if (match) {
        const percentage = Number(match[1]);
        amount = totalValue * (percentage / 100);
      }
    } else {
      const match = offer.discount.match(/(\d+)/);
      if (match) {
        amount = Number(match[1]);
      }
    }

    setAppliedDiscount({ code: offer.code, title: offer.title, amount });
    toast.success(`Coupon applied! Saved ₹${amount.toFixed(2)}`);
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const isPreview = typeof window !== 'undefined' && window.location.pathname.includes('/vendor-dashboard');
    if (isPreview) {
      toast.success('Preview Mode: Your checkout flow works perfectly! (No real order placed)');
      clearCart();
      setIsOpen(false);
      return;
    }

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
      await apiClient.post('/orders', {
        businessProfileId: vendor.id,
        orderType: 'TRANSACTIONAL',
        customerName,
        customerPhone,
        serviceLocation,
        totalAmount: finalTotal,
        appliedCoupon: appliedDiscount ? appliedDiscount.code : null,
        items: cartItems.map(ci => ({
          catalogItemId: ci.catalogItem.id,
          quantity: ci.quantity
        }))
      });
      toast.success('Order placed successfully! The vendor will contact you shortly.');
      clearCart();
      setIsOpen(false);
      router.push('/profile/enquiries');
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
                <span className="text-lg">₹{finalTotal.toFixed(2)}</span>
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
        <div className="fixed inset-0 z-[60] bg-black/60 flex flex-col justify-end text-zinc-900 font-sans">
          <div className="bg-white w-full max-h-[90vh] rounded-t-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom">
            <div className="p-4 border-b border-zinc-100 flex justify-between items-center bg-zinc-50/80">
              <h2 className="font-bold text-lg text-zinc-900">Checkout</h2>
              <button onClick={() => setIsOpen(false)} className="p-2 rounded-full hover:bg-zinc-200 text-zinc-500"><X className="w-5 h-5" /></button>
            </div>
            
            <div className="flex-1 overflow-y-auto p-4 space-y-6 bg-white">
              {/* Order Summary */}
              <div>
                <h3 className="font-bold text-xs text-zinc-500 mb-3 uppercase tracking-wider">Order Summary</h3>
                <div className="space-y-3">
                  {cartItems.map(ci => (
                    <div key={ci.catalogItem.id} className="flex justify-between items-start text-sm">
                      <div className="flex gap-2">
                        <span className="font-medium">{ci.quantity}x</span>
                        <span>{ci.catalogItem.title}</span>
                      </div>
                      <span className="font-semibold">₹{(parseFloat(ci.catalogItem.price?.toString() || '0') * ci.quantity).toFixed(2)}</span>
                    </div>
                  ))}
                  <div className="pt-3 border-t">
                    <div className="flex gap-2 mb-2">
                      <input 
                        type="text" 
                        value={couponCode} 
                        onChange={e => setCouponCode(e.target.value.toUpperCase())}
                        placeholder="Enter Coupon Code" 
                        className="flex-1 border border-zinc-200 rounded-lg px-3 py-2 text-sm outline-none focus:border-green-500 uppercase font-semibold text-zinc-900 placeholder:text-zinc-400 bg-white" 
                      />
                      <button onClick={handleApplyCoupon} className="px-4 py-2 bg-zinc-900 text-white rounded-lg text-sm font-bold hover:bg-zinc-800 transition-colors">
                        Apply
                      </button>
                    </div>
                    {discountError && <p className="text-xs text-red-500 font-semibold mb-2">{discountError}</p>}
                    {appliedDiscount && (
                       <div className="flex justify-between items-center bg-green-50 text-green-700 px-3 py-2 rounded-lg mb-2 text-sm">
                         <div>
                           <span className="font-bold">{appliedDiscount.code}</span> applied!
                         </div>
                         <button onClick={() => { setAppliedDiscount(null); setCouponCode(''); }} className="text-xs font-bold hover:underline">Remove</button>
                       </div>
                    )}
                    
                    <div className="flex justify-between text-sm text-zinc-500 mt-2">
                      <span>Subtotal</span>
                      <span>₹{totalValue.toFixed(2)}</span>
                    </div>
                    {appliedDiscount && (
                      <div className="flex justify-between text-sm text-green-600 font-bold mt-1">
                        <span>Discount ({appliedDiscount.code})</span>
                        <span>- ₹{appliedDiscount.amount.toFixed(2)}</span>
                      </div>
                    )}
                    <div className="flex justify-between font-black text-xl mt-3 pt-3 border-t">
                      <span>Total</span>
                      <span>₹{finalTotal.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Delivery Details */}
              <form id="checkout-form" onSubmit={handleCheckout} className="space-y-4">
                <h3 className="font-bold text-xs text-zinc-500 uppercase tracking-wider mt-2">Delivery Details</h3>
                <div>
                  <label className="text-sm font-semibold text-zinc-700">Your Name</label>
                  <input required type="text" value={customerName} onChange={e => setCustomerName(e.target.value)} className="mt-1 w-full border border-zinc-200 rounded-lg p-2.5 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-zinc-900 bg-white" placeholder="e.g. Rahul Kumar" />
                </div>
                <div>
                  <label className="text-sm font-medium">Mobile Number</label>
                  <input 
                    required 
                    type="tel" 
                    maxLength={10}
                    pattern="[6-9][0-9]{9}" 
                    value={customerPhone} 
                    onChange={e => {
                      const val = e.target.value.replace(/\D/g, '');
                      if (val.length <= 10) setCustomerPhone(val);
                    }} 
                    className="mt-1 w-full border border-zinc-200 rounded-lg p-2.5 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 text-zinc-900 bg-white" 
                    placeholder="10-digit mobile number" 
                  />
                </div>
                <div>
                  <label className="text-sm font-semibold text-zinc-700">Complete Delivery Address</label>
                  <textarea required value={serviceLocation} onChange={e => setServiceLocation(e.target.value)} rows={3} className="mt-1 w-full border border-zinc-200 rounded-lg p-2.5 outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500 resize-none text-zinc-900 bg-white" placeholder="House no, Street, Landmark..." />
                </div>
              </form>
            </div>

            <div className="p-4 border-t border-zinc-100 bg-white pb-safe">
              <button 
                type="submit" 
                form="checkout-form"
                disabled={isSubmitting}
                className={`w-full py-4 rounded-xl font-bold text-lg flex justify-center items-center ${theme?.colors?.primary || 'bg-green-600'} border border-transparent disabled:opacity-50 text-white`}
                style={{ backgroundColor: 'var(--primary, #16a34a)' }} // Fallback if theme structure implies tailwind classes for bg
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
