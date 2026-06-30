'use client';

import { useState, useMemo } from 'react';
import {
  Minus, Plus, Search, Star, ArrowLeft, Heart, Phone, MessageCircle,
  MapPin, Clock, BadgeCheck, ChevronRight, Ticket, ShoppingCart, X, ChevronLeft,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import { BusinessProfile, CatalogItem } from '@/types/models';
import VariantModal from '../vendor/VariantModal';
import { toast } from 'sonner';

interface FoodLayoutProps { business: BusinessProfile; theme: any; }

// ─── veg / non-veg indicator ────────────────────────────────────────────────

function VegDot({ isNonVeg }: { isNonVeg: boolean }) {
  return (
    <span className={`inline-flex w-4 h-4 shrink-0 border-2 rounded items-center justify-center
      ${isNonVeg ? 'border-rose-500' : 'border-emerald-500'}`}>
      {isNonVeg
        ? <span className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-rose-500" />
        : <span className="w-2 h-2 rounded-full bg-emerald-500" />
      }
    </span>
  );
}

// ─── cart content (desktop sidebar + mobile sheet) ───────────────────────────
// Uses natural content flow — NO flex-1 on items → no gap

function CartContent({ business, onSuccess }: { business: BusinessProfile; onSuccess?: () => void }) {
  const { cartItems, vendorId, getTotalValue, clearCart } = useCartStore();
  const router = useRouter();
  const [couponCode, setCouponCode]       = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; amount: number } | null>(null);
  const [couponError, setCouponError]     = useState('');
  const [showCheckout, setShowCheckout]   = useState(false);
  const [customerName, setCustomerName]   = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [serviceLocation, setServiceLocation] = useState('');
  const [isSubmitting, setIsSubmitting]   = useState(false);

  const meta     = (business.metaData || {}) as Record<string, any>;
  const subtotal = getTotalValue();
  const discount = appliedCoupon?.amount ?? 0;
  const total    = Math.max(0, subtotal - discount);
  const myItems  = vendorId && vendorId !== business.id ? [] : cartItems;

  const handleApply = () => {
    setCouponError(''); setAppliedCoupon(null);
    const offers: any[] = (meta.offers as any[]) || [];
    const offer = offers.find((o: any) => o.code?.toUpperCase() === couponCode.toUpperCase());
    if (!offer) { setCouponError('Invalid coupon code'); return; }
    const pct = offer.discount?.match(/(\d+)%/);
    const amount = pct ? subtotal * (parseInt(pct[1]) / 100)
      : parseInt(offer.discount?.match(/(\d+)/)?.[1] ?? '0');
    setAppliedCoupon({ code: offer.code, amount });
    toast.success(`${offer.code} applied — saving ₹${amount.toFixed(0)}!`);
  };

  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await apiClient.post('/orders', {
        businessProfileId: business.id,
        orderType: 'TRANSACTIONAL',
        customerName: customerName.trim(),
        customerPhone: customerPhone.trim(),
        serviceLocation: serviceLocation.trim(),
        totalAmount: total,
        appliedCoupon: appliedCoupon?.code ?? null,
        items: myItems.map(ci => ({
          catalogItemId: ci.catalogItem.id,
          quantity: ci.quantity,
        })),
      });
      toast.success('Order placed! The vendor will confirm shortly. Track it in My Orders.');
      clearCart();
      setShowCheckout(false);
      onSuccess?.();
      router.push('/profile/orders');
    } catch (err: any) {
      toast.error(err?.response?.data?.message || 'Failed to place order. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    /* No h-full / flex-col — content flows naturally, parent is the scroll container */
    <div style={{ background: '#0a0f1e' }}>

      {/* Sticky header */}
      <div className="px-5 pt-5 pb-4 border-b sticky top-0 z-10"
        style={{ background: '#0a0f1e', borderColor: 'rgba(255,255,255,.08)' }}>
        {showCheckout ? (
          <div className="flex items-center gap-3">
            <button onClick={() => setShowCheckout(false)} className="text-zinc-400 hover:text-white transition-colors">
              <ChevronLeft className="w-5 h-5" />
            </button>
            <h3 className="font-black text-white text-sm">Delivery Details</h3>
          </div>
        ) : (
          <h3 className="font-black text-white flex items-center gap-2 text-sm">
            <ShoppingCart className="w-4 h-4 text-emerald-400" /> Your Order
          </h3>
        )}
      </div>

      {myItems.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 px-8 text-center">
          <ShoppingCart className="w-10 h-10 mb-3" style={{ color: '#1e293b' }} />
          <p className="text-sm font-bold" style={{ color: '#334155' }}>Your cart is empty</p>
          <p className="text-xs mt-1" style={{ color: '#1e293b' }}>Add items from the menu</p>
        </div>
      ) : !showCheckout ? (
        <>
          {/* Items list — max-height so it scrolls internally when many items */}
          <div className="overflow-y-auto px-5 pt-4 pb-2 space-y-3" style={{ maxHeight: '38vh' }}>
            {myItems.map(ci => (
              <div key={ci.catalogItem.id} className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-white leading-tight truncate">{ci.catalogItem.title}</p>
                  <p className="text-xs mt-0.5" style={{ color: '#475569' }}>×{ci.quantity}</p>
                </div>
                <span className="text-sm font-black text-white shrink-0">
                  ₹{(Number(ci.catalogItem.price || 0) * ci.quantity).toFixed(0)}
                </span>
              </div>
            ))}
          </div>

          {/* Coupon + totals + CTA — flows immediately after items, no gap */}
          <div className="px-5 pb-5 pt-4 space-y-3 border-t"
            style={{ borderColor: 'rgba(255,255,255,.07)' }}>
            {!appliedCoupon ? (
              <div className="flex gap-2">
                <input
                  type="text" value={couponCode}
                  onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                  placeholder="COUPON CODE"
                  className="flex-1 min-w-0 px-3 py-2.5 text-xs font-bold rounded-xl outline-none uppercase tracking-wider"
                  style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#fff' }}
                />
                <button onClick={handleApply}
                  className="px-4 py-2.5 text-xs font-black rounded-xl transition-colors"
                  style={{ background: 'rgba(6,182,212,.15)', border: '1px solid rgba(6,182,212,.3)', color: '#22d3ee' }}>
                  Apply
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between px-3 py-2 rounded-xl"
                style={{ background: 'rgba(6,182,212,.08)', border: '1px solid rgba(6,182,212,.2)' }}>
                <p className="text-xs font-black" style={{ color: '#22d3ee' }}>
                  🎟 {appliedCoupon.code} applied — saving ₹{appliedCoupon.amount.toFixed(0)}!
                </p>
                <button onClick={() => { setAppliedCoupon(null); setCouponCode(''); }}>
                  <X className="w-3.5 h-3.5" style={{ color: '#64748b' }} />
                </button>
              </div>
            )}
            {couponError && <p className="text-xs text-rose-400 font-bold">{couponError}</p>}

            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between">
                <span style={{ color: '#64748b' }}>Subtotal</span>
                <span className="font-bold text-white">₹{subtotal.toFixed(0)}</span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: '#64748b' }}>Delivery</span>
                <span className="font-bold" style={{ color: '#34d399' }}>FREE</span>
              </div>
              {appliedCoupon && (
                <div className="flex justify-between">
                  <span style={{ color: '#64748b' }}>Discount ({appliedCoupon.code})</span>
                  <span className="font-bold text-rose-400">-₹{appliedCoupon.amount.toFixed(0)}</span>
                </div>
              )}
              <div className="flex justify-between text-base font-black pt-2"
                style={{ borderTop: '1px solid rgba(255,255,255,.07)' }}>
                <span className="text-white">Total</span>
                <span style={{ color: '#22d3ee' }}>₹{total.toFixed(0)}</span>
              </div>
            </div>

            <button
              onClick={() => {
                const { isAuthenticated } = useAuthStore.getState();
                if (!isAuthenticated) {
                  toast.error('Please login to place an order.');
                  router.push('/login');
                  return;
                }
                setShowCheckout(true);
              }}
              className="w-full py-3.5 rounded-2xl font-black text-sm text-white transition-all active:scale-[0.98]"
              style={{ background: 'linear-gradient(135deg,#059669,#10b981)', boxShadow: '0 4px 20px rgba(16,185,129,.3)' }}>
              Place Order →
            </button>
            {meta.deliveryTime && (
              <p className="text-center text-[11px]" style={{ color: '#334155' }}>
                Est. delivery: {meta.deliveryTime}
              </p>
            )}
          </div>
        </>
      ) : (
        /* Checkout form */
        <form onSubmit={handleOrderSubmit} className="px-5 py-5 space-y-4">
          <div className="space-y-3">
            <div>
              <label className="text-xs font-black mb-1.5 block" style={{ color: '#94a3b8' }}>YOUR NAME</label>
              <input
                required
                value={customerName}
                onChange={e => setCustomerName(e.target.value)}
                placeholder="Full name"
                className="w-full px-4 py-3 text-sm rounded-xl outline-none"
                style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#fff' }}
              />
            </div>
            <div>
              <label className="text-xs font-black mb-1.5 block" style={{ color: '#94a3b8' }}>MOBILE NUMBER</label>
              <input
                required
                type="tel"
                pattern="[0-9]{10}"
                value={customerPhone}
                onChange={e => setCustomerPhone(e.target.value)}
                placeholder="10-digit mobile number"
                className="w-full px-4 py-3 text-sm rounded-xl outline-none"
                style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#fff' }}
              />
            </div>
            <div>
              <label className="text-xs font-black mb-1.5 block" style={{ color: '#94a3b8' }}>DELIVERY ADDRESS</label>
              <textarea
                required
                rows={2}
                value={serviceLocation}
                onChange={e => setServiceLocation(e.target.value)}
                placeholder="House no., street, area"
                className="w-full px-4 py-3 text-sm rounded-xl outline-none resize-none"
                style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#fff' }}
              />
            </div>
          </div>

          <div className="py-3 space-y-1.5 border-t border-b" style={{ borderColor: 'rgba(255,255,255,.07)' }}>
            <div className="flex justify-between text-sm">
              <span style={{ color: '#64748b' }}>Order total</span>
              <span className="font-black" style={{ color: '#22d3ee' }}>₹{total.toFixed(0)}</span>
            </div>
            {appliedCoupon && (
              <div className="flex justify-between text-xs">
                <span style={{ color: '#64748b' }}>Coupon ({appliedCoupon.code})</span>
                <span className="font-bold text-rose-400">-₹{appliedCoupon.amount.toFixed(0)}</span>
              </div>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 rounded-2xl font-black text-sm text-white transition-all active:scale-[0.98] disabled:opacity-60"
            style={{ background: 'linear-gradient(135deg,#059669,#10b981)', boxShadow: '0 4px 20px rgba(16,185,129,.3)' }}>
            {isSubmitting ? 'Placing Order...' : 'Confirm Order →'}
          </button>
          <p className="text-center text-[11px]" style={{ color: '#475569' }}>
            Vendor will confirm your order. Track it in Profile → My Orders.
          </p>
        </form>
      )}
    </div>
  );
}

// ─── main template ───────────────────────────────────────────────────────────

export default function FoodPremiumDark({ business, theme }: FoodLayoutProps) {
  const router = useRouter();
  const { cartItems, vendorId, addItem, updateQuantity, getTotalValue } = useCartStore();

  const [activeTab, setActiveTab]       = useState<'menu'|'info'|'reviews'|'photos'>('menu');
  const [searchQuery, setSearchQuery]   = useState('');
  const [vegFilter, setVegFilter]       = useState(false);
  const [nonVegFilter, setNonVegFilter] = useState(false);
  const [activeCategory, setActiveCategory] = useState('All');
  const [selectedVariantItem, setSelectedVariantItem] = useState<CatalogItem | null>(null);
  const [showMobileCart, setShowMobileCart] = useState(false);

  const catalog  = (business.catalogItems || []).filter(i => i.isActive !== false);
  const meta     = (business.metaData || {}) as Record<string, any>;
  const cuisines: string[] = meta.cuisines || [];
  const isOpen   = ['available', 'AVAILABLE'].includes((business as any).status ?? '');
  const phone    = business.phoneNumber || (business as any).phone;
  const whatsapp = (business as any).whatsapp || meta.whatsapp || meta.whatsappNumber || phone;

  const heroImage = meta.bannerUrl
    || business.media?.find((m: any) => ['shop_photo','banner'].includes(m.type))?.secureUrl
    || 'https://images.unsplash.com/photo-1555939594-58d7cb561ad1?auto=format&fit=crop&w=1400&q=80';

  const logoImage = business.media?.find((m: any) => ['profile_image','logo'].includes(m.type))?.secureUrl;

  const allCategories = useMemo(() => {
    const cats = new Set<string>();
    catalog.forEach(i => cats.add(i.category?.name || 'Other'));
    return ['All', ...Array.from(cats)];
  }, [catalog]);

  const filteredItems = useMemo(() => {
    let items = catalog;
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(i => i.title.toLowerCase().includes(q) || (i.description||'').toLowerCase().includes(q));
    }
    if (vegFilter)    items = items.filter(i => !(i.metaData?.isNonVeg || i.metaData?.dietaryType === 'Non-Veg'));
    if (nonVegFilter) items = items.filter(i =>   i.metaData?.isNonVeg || i.metaData?.dietaryType === 'Non-Veg');
    if (activeCategory !== 'All') items = items.filter(i => (i.category?.name || 'Other') === activeCategory);
    return items;
  }, [catalog, searchQuery, vegFilter, nonVegFilter, activeCategory]);

  const filteredGroups = useMemo(() => {
    const g: Record<string, CatalogItem[]> = {};
    filteredItems.forEach(i => { const c = i.category?.name || 'Other'; (g[c] ??= []).push(i); });
    return g;
  }, [filteredItems]);

  const getQty = (id: string) => cartItems.find(ci => ci.catalogItem.id === id)?.quantity ?? 0;

  const handleAdd = (item: CatalogItem) => {
    if (Array.isArray(item.variants) && item.variants.length > 0) { setSelectedVariantItem(item); return; }
    const res = addItem(item, 'TRANSACTIONAL');
    if (!res.success) toast.error(res.error);
  };

  const cartCount = cartItems.reduce((s, ci) => s + ci.quantity, 0);
  const cartTotal = getTotalValue();
  const myItems   = vendorId && vendorId !== business.id ? [] : cartItems;

  const TABS = [
    { id: 'menu' as const, label: 'Menu' },
    { id: 'info' as const, label: 'Info' },
    { id: 'reviews' as const, label: 'Reviews' },
    { id: 'photos' as const, label: 'Photos' },
  ];

  return (
    <div className="min-h-screen font-sans" style={{ background: '#020617', color: '#fff' }}>

      {/* ── MOBILE HERO ── */}
      <div className="lg:hidden relative w-full" style={{ height: '52vw', minHeight: 240, maxHeight: 400 }}>
        <img src={heroImage} className="w-full h-full object-cover" alt={business.businessName} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/40 to-transparent" />
        <div className="absolute top-0 left-0 right-0 flex items-center justify-between px-4 pt-5">
          <button onClick={() => router.back()}
            className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md"
            style={{ background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.15)' }}>
            <ArrowLeft className="w-4 h-4 text-white" />
          </button>
          <button className="w-9 h-9 rounded-full flex items-center justify-center backdrop-blur-md"
            style={{ background: 'rgba(0,0,0,.5)', border: '1px solid rgba(255,255,255,.15)' }}>
            <Heart className="w-4 h-4 text-white" />
          </button>
        </div>
        <div className="absolute bottom-0 left-0 right-0 px-4 pb-4">
          <h1 className="text-2xl font-black text-white tracking-tight mb-1">{business.businessName}</h1>
          <p className="text-sm text-zinc-300 mb-2 line-clamp-1">{business.description || cuisines.join(' · ')}</p>
          <div className="flex flex-wrap gap-2">
            <span className="flex items-center gap-1 px-2.5 py-1 rounded-xl text-xs font-bold"
              style={{ background: 'rgba(0,0,0,.55)', border: '1px solid rgba(255,255,255,.12)' }}>
              <Star className="w-3 h-3 fill-cyan-400 text-cyan-400" />
              <span className="text-zinc-100">{(business.rating||0).toFixed(1)}</span>
            </span>
            {cuisines.slice(0,3).map(c => (
              <span key={c} className="px-2.5 py-1 rounded-xl text-xs font-medium"
                style={{ background: 'rgba(0,0,0,.55)', border: '1px solid rgba(255,255,255,.12)', color: '#cbd5e1' }}>{c}</span>
            ))}
          </div>
        </div>
      </div>

      {/* ── DESKTOP SMALL HERO ── */}
      <div className="hidden lg:block relative w-full h-[180px] overflow-hidden">
        <img src={heroImage} className="w-full h-full object-cover" alt={business.businessName} />
        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-[#020617]/35 to-transparent" />
      </div>

      {/* ── FULL WIDTH: info bar + offer strip (full width so Call/WhatsApp buttons are visible) ── */}
      <div className="max-w-screen-2xl mx-auto px-4 lg:px-8">

          {/* Desktop info bar */}
          <div className="hidden lg:flex items-center gap-5 py-5 border-b"
            style={{ borderColor: 'rgba(255,255,255,.08)' }}>
            {logoImage
              ? <img src={logoImage} alt="logo" className="w-20 h-20 rounded-2xl object-cover shrink-0 border -mt-10 z-10 shadow-xl"
                  style={{ borderColor: 'rgba(0,0,0,.5)', background: '#0a0f1e' }} />
              : <div className="w-20 h-20 rounded-2xl shrink-0 flex items-center justify-center text-3xl font-black -mt-10 z-10 shadow-xl"
                  style={{ background: '#0a0f1e', border: '3px solid rgba(0,0,0,.5)' }}>
                  {business.businessName?.charAt(0)}
                </div>
            }
            <div className="flex-1 min-w-0">
              <div className="flex items-center flex-wrap gap-2 mb-1">
                <h1 className="text-2xl font-black text-white tracking-tight">{business.businessName}</h1>
                {business.idVerified && (
                  <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(16,185,129,.1)', color: '#34d399', border: '1px solid rgba(16,185,129,.2)' }}>
                    <BadgeCheck className="w-3 h-3" /> Verified
                  </span>
                )}
                {isOpen && (
                  <span className="flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{ background: 'rgba(34,197,94,.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,.2)' }}>
                    <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Open Now
                  </span>
                )}
              </div>
              <p className="text-sm mb-2" style={{ color: '#64748b' }}>
                {cuisines.join(' · ') || (business as any).businessType?.replace(/_/g,' ')}
              </p>
              <div className="flex flex-wrap items-center gap-4 text-xs font-semibold" style={{ color: '#94a3b8' }}>
                {business.rating > 0 && (
                  <span className="flex items-center gap-1">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {business.rating.toFixed(1)}
                    {meta.reviewCount && <span style={{ color: '#64748b' }}>({meta.reviewCount} reviews)</span>}
                  </span>
                )}
                {meta.deliveryTime && <span className="flex items-center gap-1"><Clock className="w-3.5 h-3.5" style={{ color: '#475569' }} /> {meta.deliveryTime}</span>}
                {meta.avgPrice && <span>₹{meta.avgPrice} for two</span>}
                {(business.localityName || (business as any).city?.name) && (
                  <span className="flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" style={{ color: '#475569' }} />
                    {[business.localityName,(business as any).city?.name].filter(Boolean).join(', ')}
                  </span>
                )}
              </div>
            </div>
            {/* Call / WhatsApp */}
            <div className="flex items-center gap-2 shrink-0">
              {phone && (
                <a href={`tel:${phone}`}
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#cbd5e1' }}>
                  <Phone className="w-4 h-4" /> Call
                </a>
              )}
              {whatsapp && (
                <a href={`https://wa.me/91${whatsapp}`} target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold"
                  style={{ background: 'rgba(37,211,102,.1)', border: '1px solid rgba(37,211,102,.2)', color: '#25D366' }}>
                  <MessageCircle className="w-4 h-4" /> WhatsApp
                </a>
              )}
            </div>
          </div>

          {/* Mobile info (below hero) */}
          <div className="lg:hidden pt-3 pb-2 space-y-1.5">
            <div className="flex items-center gap-2 flex-wrap">
              {business.idVerified && (
                <span className="flex items-center gap-1 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(16,185,129,.1)', color: '#34d399', border: '1px solid rgba(16,185,129,.2)' }}>
                  <BadgeCheck className="w-3 h-3" /> Verified
                </span>
              )}
              {isOpen && (
                <span className="flex items-center gap-1.5 text-xs font-bold px-2 py-0.5 rounded-full"
                  style={{ background: 'rgba(34,197,94,.1)', color: '#4ade80', border: '1px solid rgba(34,197,94,.2)' }}>
                  <span className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse" /> Open Now
                </span>
              )}
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs" style={{ color: '#94a3b8' }}>
              {business.rating > 0 && <span className="flex items-center gap-1 font-bold"><Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />{business.rating.toFixed(1)}</span>}
              {meta.deliveryTime && <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {meta.deliveryTime}</span>}
              {meta.avgPrice && <span>₹{meta.avgPrice} for two</span>}
              {business.localityName && <span className="flex items-center gap-1"><MapPin className="w-3 h-3" /> {business.localityName}</span>}
            </div>
          </div>

          {/* Offer strip */}
          {meta.offers && (meta.offers as any[]).length > 0 && (
            <div className="flex items-center gap-2 py-3 text-sm font-bold"
              style={{ background: 'rgba(120,0,15,.4)', borderTop: '1px solid rgba(239,68,68,.12)', borderBottom: '1px solid rgba(239,68,68,.12)', color: '#fca5a5', padding: '12px 0', marginLeft: '-1rem', marginRight: '-1rem', paddingLeft: '1rem', paddingRight: '1rem' }}>
              <Ticket className="w-4 h-4 shrink-0 text-rose-400" />
              <span className="truncate">
                {(meta.offers as any[])[0].title}
                {(meta.offers as any[])[0].code && <> · Use code <span className="font-black tracking-wider">{(meta.offers as any[])[0].code}</span></>}
              </span>
            </div>
          )}

      </div>

      {/* ── TWO-COLUMN: (tabs + search + menu) | (cart) — cart starts at tab level ── */}
      <div className="lg:flex lg:items-start max-w-screen-2xl mx-auto">

        <div className="flex-1 min-w-0 px-4 lg:px-8">

          {/* ── TABS — sticky top-0 ── */}
          <div className="flex border-b sticky top-0 z-20"
            style={{ background: '#020617', borderColor: 'rgba(255,255,255,.08)' }}>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)}
                className="flex-1 py-3.5 text-sm font-bold transition-colors"
                style={{
                  color: activeTab === tab.id ? '#34d399' : '#64748b',
                  borderBottom: activeTab === tab.id ? '2px solid #34d399' : '2px solid transparent',
                }}>
                {tab.label}
              </button>
            ))}
          </div>

          {/* ── MENU TAB ── */}
          {activeTab === 'menu' && (
            <>
              {/* ONE sticky block: search + filters + category chips
                  — combined so there's only one sticky offset to manage */}
              <div className="sticky top-[49px] z-10"
                style={{ background: 'rgba(2,6,23,.97)', backdropFilter: 'blur(16px)' }}>
                {/* Search */}
                <div className="pt-3 pb-2">
                  <div className="relative">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
                    <input type="text" value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Find your next gourmet experience..."
                      className="w-full pl-11 pr-4 py-3 rounded-2xl text-sm outline-none"
                      style={{ background: 'rgba(255,255,255,.06)', border: '1px solid rgba(255,255,255,.1)', color: '#fff' }}
                    />
                  </div>
                </div>
                {/* Veg / Non-Veg */}
                <div className="flex gap-2 pb-2">
                  {[
                    { label: 'Veg',     active: vegFilter,    onClick: () => { setVegFilter(v => !v); setNonVegFilter(false); },
                      icon: <span className="w-4 h-4 border-2 border-emerald-500 rounded flex items-center justify-center"><span className="w-2 h-2 rounded-sm bg-emerald-500" /></span> },
                    { label: 'Non-Veg', active: nonVegFilter, onClick: () => { setNonVegFilter(v => !v); setVegFilter(false); },
                      icon: <span className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[8px] border-l-transparent border-r-transparent border-b-rose-500" /> },
                  ].map(f => (
                    <button key={f.label} onClick={f.onClick}
                      className="flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold border transition-all"
                      style={f.active
                        ? { background: 'rgba(16,185,129,.1)', borderColor: 'rgba(16,185,129,.3)', color: '#34d399' }
                        : { background: 'rgba(255,255,255,.04)', borderColor: 'rgba(255,255,255,.1)', color: '#94a3b8' }
                      }>
                      {f.icon} {f.label}
                    </button>
                  ))}
                </div>
                {/* Category chips */}
                <div className="flex gap-2 overflow-x-auto pb-3 hide-scrollbar">
                  {allCategories.map(cat => (
                    <button key={cat} onClick={() => setActiveCategory(cat)}
                      className="shrink-0 px-4 py-2 rounded-xl text-sm font-bold transition-all"
                      style={activeCategory === cat
                        ? { background: '#06b6d4', color: '#000' }
                        : { background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.08)', color: '#94a3b8' }
                      }>
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Menu items grouped by category */}
              <div className="pb-32 lg:pb-8 mt-2 space-y-8">
                {Object.keys(filteredGroups).length === 0 ? (
                  <div className="py-20 text-center">
                    <p className="text-lg font-bold" style={{ color: '#64748b' }}>No items found</p>
                  </div>
                ) : Object.entries(filteredGroups).map(([catName, items]) => (
                  <div key={catName}>
                    <h3 className="text-xs font-black uppercase tracking-widest mb-4 flex items-center gap-2"
                      style={{ color: '#94a3b8' }}>
                      <span className="w-5 h-0.5 rounded" style={{ background: '#334155' }} />
                      {catName}
                    </h3>
                    <div className="space-y-3">
                      {items.map(item => {
                        const qty       = getQty(item.id);
                        const isNonVeg  = item.metaData?.isNonVeg || item.metaData?.dietaryType === 'Non-Veg';
                        const hasVar    = Array.isArray(item.variants) && item.variants.length > 0;
                        const price     = hasVar ? Math.min(...(item.variants as any[]).map((v: any) => Number(v.price))) : Number(item.price||0);
                        return (
                          <div key={item.id}
                            className="flex items-center gap-3 p-3 rounded-2xl transition-colors hover:bg-white/[0.04]"
                            style={{ background: 'rgba(255,255,255,.03)', border: '1px solid rgba(255,255,255,.06)' }}>
                            <div className="w-20 h-20 rounded-xl shrink-0 overflow-hidden" style={{ background: 'rgba(255,255,255,.08)' }}>
                              {item.mediaUrl
                                ? <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                                : <div className="w-full h-full flex items-center justify-center text-xl">🍽️</div>
                              }
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <VegDot isNonVeg={!!isNonVeg} />
                                <p className="text-sm font-bold text-white truncate">{item.title}</p>
                              </div>
                              {item.description && (
                                <p className="text-xs line-clamp-2 mb-1.5" style={{ color: '#94a3b8' }}>{item.description}</p>
                              )}
                              <p className="text-sm font-black text-white">
                                {hasVar && <span className="text-xs font-medium mr-1" style={{ color: '#94a3b8' }}>from</span>}
                                ₹{price}
                              </p>
                            </div>
                            <div className="shrink-0">
                              {qty === 0 ? (
                                <button onClick={() => handleAdd(item)}
                                  className="w-9 h-9 rounded-full flex items-center justify-center text-xl font-black active:scale-90"
                                  style={{ background: 'rgba(16,185,129,.12)', border: '1px solid rgba(16,185,129,.3)', color: '#34d399' }}>
                                  +
                                </button>
                              ) : (
                                <div className="flex items-center h-8 rounded-xl overflow-hidden" style={{ background: '#06b6d4' }}>
                                  <button onClick={() => updateQuantity(item.id, -1)} className="w-8 h-full flex items-center justify-center font-black text-black hover:bg-cyan-400">
                                    <Minus className="w-3.5 h-3.5" />
                                  </button>
                                  <span className="w-5 text-center text-xs font-black text-black">{qty}</span>
                                  <button onClick={() => updateQuantity(item.id, 1)} className="w-8 h-full flex items-center justify-center font-black text-black hover:bg-cyan-400">
                                    <Plus className="w-3.5 h-3.5" />
                                  </button>
                                </div>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {/* ── INFO TAB ── */}
          {activeTab === 'info' && (
            <div className="py-6 space-y-0">
              {[
                { label: 'Address',       value: [business.localityName,(business as any).city?.name].filter(Boolean).join(', ') },
                { label: 'Cuisines',      value: cuisines.join(', ') },
                { label: 'Delivery Time', value: meta.deliveryTime },
                { label: 'Avg Price',     value: meta.avgPrice ? `₹${meta.avgPrice} for two` : null },
                { label: 'Working Hours', value: business.timeAvailability },
              ].filter(r => r.value).map(row => (
                <div key={row.label} className="py-4 border-b" style={{ borderColor: 'rgba(255,255,255,.07)' }}>
                  <p className="text-xs font-black uppercase tracking-wider mb-1" style={{ color: '#475569' }}>{row.label}</p>
                  <p className="text-sm font-medium" style={{ color: '#cbd5e1' }}>{row.value}</p>
                </div>
              ))}
            </div>
          )}

          {/* ── REVIEWS TAB ── */}
          {activeTab === 'reviews' && (
            <div className="py-16 text-center">
              <Star className="w-12 h-12 mx-auto mb-3" style={{ color: '#334155' }} />
              <p className="font-bold" style={{ color: '#64748b' }}>Reviews coming soon</p>
            </div>
          )}

          {/* ── PHOTOS TAB ── */}
          {activeTab === 'photos' && (
            <div className="py-6 grid grid-cols-3 gap-2">
              {(business.media||[]).filter((m:any) => m.type !== 'profile_image').map((m:any, i:number) => (
                <img key={i} src={m.secureUrl} alt="" className="w-full aspect-square object-cover rounded-xl" />
              ))}
              {(business.media||[]).filter((m:any) => m.type !== 'profile_image').length === 0 && (
                <div className="col-span-3 py-16 text-center font-bold" style={{ color: '#64748b' }}>No photos yet</div>
              )}
            </div>
          )}
        </div>

        {/* ── RIGHT COLUMN: sticky cart, full viewport height, scrolls its own content ── */}
        <div className="hidden lg:block w-[340px] shrink-0 sticky top-0 border-l overflow-y-auto"
          style={{ height: '100vh', borderColor: 'rgba(255,255,255,.08)' }}>
          <CartContent business={business} />
        </div>
      </div>

      {/* ── MOBILE: floating cart bar ── */}
      {myItems.length > 0 && (
        <div className="lg:hidden fixed bottom-0 left-0 right-0 p-4 z-50"
          style={{ background: 'linear-gradient(to top,#020617 60%,transparent)' }}>
          <button onClick={() => setShowMobileCart(true)}
            className="w-full flex items-center justify-between py-3.5 px-5 rounded-2xl font-bold text-white"
            style={{ background: 'linear-gradient(135deg,#059669,#10b981)', boxShadow: '0 8px 24px rgba(16,185,129,.35)' }}>
            <span className="flex items-center gap-2">
              <span className="bg-white/20 rounded-lg px-2 py-0.5 text-sm">{cartCount}</span>
              <span className="text-sm">items</span>
            </span>
            <span className="flex items-center gap-1 text-sm font-black">
              ₹{cartTotal.toFixed(0)} <ChevronRight className="w-4 h-4" />
            </span>
          </button>
        </div>
      )}

      {/* ── MOBILE: cart bottom sheet ── */}
      {showMobileCart && (
        <div className="lg:hidden fixed inset-0 z-[60]">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowMobileCart(false)} />
          <div className="absolute bottom-0 left-0 right-0 rounded-t-3xl overflow-hidden flex flex-col"
            style={{ maxHeight: '85vh', background: '#0a0f1e', border: '1px solid rgba(255,255,255,.08)' }}>
            <div className="flex items-center justify-between px-5 py-4 border-b shrink-0"
              style={{ borderColor: 'rgba(255,255,255,.08)' }}>
              <span className="font-black text-white flex items-center gap-2">
                <ShoppingCart className="w-4 h-4 text-emerald-400" /> Your Order
              </span>
              <button onClick={() => setShowMobileCart(false)}><X className="w-5 h-5" style={{ color: '#64748b' }} /></button>
            </div>
            <div className="flex-1 overflow-y-auto">
              <CartContent business={business} onSuccess={() => setShowMobileCart(false)} />
            </div>
          </div>
        </div>
      )}

      {/* Variant modal */}
      {selectedVariantItem && (
        <VariantModal item={selectedVariantItem} isOpen={true}
          onClose={() => setSelectedVariantItem(null)}
          onAdd={(item, _v) => { const r = addItem(item, 'TRANSACTIONAL'); if (!r.success) toast.error(r.error); setSelectedVariantItem(null); }}
        />
      )}

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar{display:none}
        .hide-scrollbar{-ms-overflow-style:none;scrollbar-width:none}
      `}</style>
    </div>
  );
}
