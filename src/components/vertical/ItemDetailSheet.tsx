'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Star, MapPin, ExternalLink, BadgeCheck, ShoppingBag, Clock } from 'lucide-react';
import { Drawer, DrawerContent, DrawerTitle } from '@/components/ui/drawer';
import { Skeleton } from '@/components/ui/Skeleton';
import { QuantityStepper } from '@/components/ui/QuantityStepper';
import { useCartStore } from '@/store/useCartStore';
import apiClient from '@/lib/api-client';
import { Listing } from '@/lib/directory';
import { CatalogItem } from '@/types/models';

type CardMode = 'food' | 'retail' | 'service';

interface ItemDetailSheetProps {
  listing: Listing | null;
  mode: CardMode;
  open: boolean;
  onClose: () => void;
  language?: 'en' | 'hi';
}

export default function ItemDetailSheet({ listing, mode, open, onClose, language = 'en' }: ItemDetailSheetProps) {
  const [catalogItems, setCatalogItems] = useState<CatalogItem[]>([]);
  const [catalogLoading, setCatalogLoading] = useState(false);
  const { cartItems, addItem, updateQuantity } = useCartStore();

  const isCommerce = mode === 'food' || mode === 'retail';

  useEffect(() => {
    if (!listing || !open || !isCommerce) return;
    let active = true;
    setCatalogLoading(true);
    setCatalogItems([]);
    apiClient
      .get(`/catalog/business/${listing.id}`)
      .then(res => {
        if (active) {
          const all: CatalogItem[] = res.data?.data || [];
          setCatalogItems(all.filter(i => i.isActive).slice(0, 12));
        }
      })
      .catch(() => active && setCatalogItems([]))
      .finally(() => active && setCatalogLoading(false));
    return () => { active = false; };
  }, [listing?.id, open, isCommerce]);

  if (!listing) return null;

  const meta = (listing.metaData || (listing as any).metaData || {}) as Record<string, any>;
  const cuisines: string[] = meta.cuisines || meta.osm?.subcategory?.split(';') || [];
  const sub = (meta.osm?.subcategory || listing.businessType?.replace(/_/g, ' ') || '').replace(/-/g, ' ');
  const expertise: string[] = meta.taxonomy?.expertise || meta.taxonomy?.speciality || [];
  const hasOffer = meta.offers?.length > 0;
  const rawOffer = hasOffer ? meta.offers[0] : null;
  const offerLabel: string | null = rawOffer
    ? (typeof rawOffer === 'string' ? rawOffer : rawOffer?.title || rawOffer?.label || 'Special offer')
    : null;
  const isVegOnly = meta.isVegOnly || false;
  const avgPrice = meta.avgPrice;
  const deliveryTime = meta.deliveryTime;

  const coverImage =
    listing.media?.find((m: any) => m.type === 'profile_image' || m.type === 'gallery')?.secureUrl ||
    (listing as any).media?.[0]?.secureUrl ||
    'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=800&h=400';

  const getQty = (itemId: string) =>
    cartItems.find(ci => ci.catalogItem.id === itemId)?.quantity ?? 0;

  const handleAdd = (item: CatalogItem) => {
    addItem(item, 'TRANSACTIONAL');
  };

  const handleInc = (item: CatalogItem) => {
    const qty = getQty(item.id);
    if (qty === 0) {
      addItem(item, 'TRANSACTIONAL');
    } else {
      updateQuantity(item.id, 1);
    }
  };

  const handleDec = (item: CatalogItem) => {
    updateQuantity(item.id, -1);
  };

  return (
    <Drawer open={open} onOpenChange={o => !o && onClose()}>
      <DrawerContent className="max-h-[90vh] pb-safe flex flex-col">
        <DrawerTitle className="sr-only">{listing.businessName}</DrawerTitle>
        {/* Hero image */}
        <div className="relative h-52 w-full shrink-0 overflow-hidden bg-zinc-100">
          <img
            src={coverImage}
            alt={listing.businessName}
            className="w-full h-full object-cover"
          />
          {offerLabel && (
            <div className="absolute bottom-0 left-0 right-0 bg-rose-600/90 text-white text-xs font-bold px-4 py-2 backdrop-blur-sm">
              {offerLabel}
            </div>
          )}
          {listing.rating > 0 && (
            <div className="absolute top-3 right-3 bg-white text-zinc-900 font-black text-sm px-2.5 py-1 rounded-lg flex items-center gap-1 shadow-md">
              <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
              {listing.rating.toFixed(1)}
            </div>
          )}
        </div>

        {/* Scrollable body */}
        <div className="flex-1 overflow-y-auto">
          <div className="p-5 space-y-3 border-b border-zinc-100">
            {/* Tags */}
            {mode === 'food' && cuisines.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {cuisines.slice(0, 4).map((c, i) => (
                  <span key={i} className="text-[11px] font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-100 px-2.5 py-0.5">
                    {c.trim()}
                  </span>
                ))}
              </div>
            )}
            {mode === 'service' && expertise.length > 0 && (
              <div className="flex gap-1.5 flex-wrap">
                {expertise.slice(0, 3).map((e, i) => (
                  <span key={i} className="text-[11px] font-bold rounded-lg bg-zinc-100 text-zinc-600 border border-zinc-200 px-2.5 py-0.5">
                    {e}
                  </span>
                ))}
              </div>
            )}
            {mode === 'retail' && sub && (
              <span className="text-[11px] font-bold text-cyan-600 uppercase tracking-wide">{sub}</span>
            )}

            <h2 className="text-xl font-black text-zinc-900 leading-tight">{listing.businessName}</h2>

            <div className="flex flex-wrap items-center gap-3 text-xs text-zinc-500">
              {listing.isClaimed && (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <BadgeCheck className="w-3.5 h-3.5" />
                  Verified
                </span>
              )}
              {isVegOnly && (
                <span className="inline-flex items-center gap-1 text-emerald-600 font-semibold">
                  <span className="w-2 h-2 rounded-full bg-emerald-600" />
                  Pure Veg
                </span>
              )}
              {deliveryTime && (
                <span className="inline-flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-zinc-400" />
                  {deliveryTime}
                </span>
              )}
              {avgPrice && (
                <span className="font-medium">₹{avgPrice} for two</span>
              )}
            </div>

            <p className="flex items-center gap-1.5 text-xs text-zinc-400 font-medium">
              <MapPin className="w-3.5 h-3.5 shrink-0" />
              {listing.localityName}
            </p>
          </div>

          {/* Catalog items (food / retail) */}
          {isCommerce && (
            <div className="p-5 space-y-3">
              <h3 className="text-sm font-black text-zinc-800 uppercase tracking-wide flex items-center gap-1.5">
                <ShoppingBag className="w-4 h-4 text-zinc-400" />
                {language === 'hi' ? 'मेनू / आइटम' : 'Menu / Items'}
              </h3>

              {catalogLoading ? (
                <div className="space-y-3">
                  {[...Array(3)].map((_, i) => (
                    <div key={i} className="flex gap-3 py-2">
                      <Skeleton className="w-16 h-16 rounded-xl shrink-0" />
                      <div className="flex-1 space-y-1.5 py-1">
                        <Skeleton className="h-4 w-2/3" />
                        <Skeleton className="h-3 w-1/2" />
                        <Skeleton className="h-3 w-1/4" />
                      </div>
                    </div>
                  ))}
                </div>
              ) : catalogItems.length === 0 ? (
                <p className="text-xs text-zinc-400 py-4 text-center">
                  {language === 'hi' ? 'अभी कोई आइटम नहीं' : 'No items listed yet'}
                </p>
              ) : (
                <div className="space-y-1 divide-y divide-zinc-100">
                  {catalogItems.map(item => {
                    const qty = getQty(item.id);
                    return (
                      <div key={item.id} className="flex items-center gap-3 py-3">
                        {item.mediaUrl && (
                          <img
                            src={item.mediaUrl}
                            alt={item.title}
                            className="w-16 h-16 rounded-xl object-cover shrink-0 border border-zinc-100"
                            loading="lazy"
                          />
                        )}
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-zinc-900 line-clamp-1">{item.title}</p>
                          {item.description && (
                            <p className="text-xs text-zinc-500 line-clamp-1 mt-0.5">{item.description}</p>
                          )}
                          {item.price != null && (
                            <p className="text-sm font-black text-zinc-800 mt-1">₹{item.price}</p>
                          )}
                        </div>
                        <div className="shrink-0">
                          {qty === 0 ? (
                            <button
                              onClick={() => handleAdd(item)}
                              className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center text-xl font-black leading-none active:scale-90 transition-transform shadow-sm shadow-emerald-200"
                            >
                              +
                            </button>
                          ) : (
                            <QuantityStepper
                              qty={qty}
                              onInc={() => handleInc(item)}
                              onDec={() => handleDec(item)}
                            />
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Sticky CTA footer */}
        <div className="p-4 border-t border-zinc-100 pb-safe bg-white shrink-0">
          <Link
            href={`/${listing.slug}`}
            onClick={onClose}
            className="flex items-center justify-center gap-2 w-full py-3 rounded-2xl text-sm font-black text-white shadow-sm active:scale-[0.98] transition-all"
            style={{ background: 'var(--primary, #059669)' }}
          >
            <ExternalLink className="w-4 h-4" />
            {language === 'hi' ? 'पूरी प्रोफ़ाइल देखें' : 'View Full Profile'}
          </Link>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
