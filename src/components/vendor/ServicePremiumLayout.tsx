'use client';

import { useState, useEffect } from 'react';
import { Check, BadgeCheck, Sparkles, Clock, X, Loader2, ArrowRight, ChevronRight } from 'lucide-react';
import { useSearchParams } from 'next/navigation';
import { BusinessProfile, CatalogItem } from '@/types/models';

interface ServicePremiumLayoutProps {
  business: BusinessProfile;
  theme?: any;
}

/**
 * Premium service-provider storefront — the replacement for the old flat
 * "Service Standard" layout. Same booking logic (select services → Request to
 * Book / WhatsApp), redesigned with a cover-image hero, refined selectable
 * service cards, and a glass sticky checkout bar.
 */
export default function ServicePremiumLayout({ business }: ServicePremiumLayoutProps) {
  const [selectedServices, setSelectedServices] = useState<CatalogItem[]>([]);
  const searchParams = useSearchParams();
  const [isRequestModalOpen, setIsRequestModalOpen] = useState(false);
  const [requestDetails, setRequestDetails] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const connectionMode = business.connectionMode || 'REQUIRE_APPROVAL';

  useEffect(() => {
    const preselectId = searchParams.get('preselect');
    if (preselectId && business.catalogItems) {
      const preselectItem = business.catalogItems.find((item) => item.id === preselectId);
      if (preselectItem) setSelectedServices([preselectItem]);
    }
  }, [searchParams, business.catalogItems]);

  const toggleService = (item: CatalogItem) => {
    setSelectedServices((prev) =>
      prev.some((s) => s.id === item.id) ? prev.filter((s) => s.id !== item.id) : [...prev, item]
    );
  };

  const total = selectedServices.reduce((acc, curr) => acc + (Number(curr.price) || 0), 0);

  const handlePrimaryAction = () => {
    if (connectionMode === 'DIRECT') executeDirectConnect();
    else setIsRequestModalOpen(true);
  };

  const executeDirectConnect = async () => {
    let message = `Hi! I found your profile on NearByBazar. I'd like to enquire about booking the following services:\n\n`;
    selectedServices.forEach((s) => {
      message += `- ${s.title} (₹${s.price || 0})\n`;
    });
    message += `\nTotal Estimated Base: ₹${total}\n\nAre you available? Let's discuss details.`;

    const phone = business.user?.phoneNumber || '9999999999';
    const formattedPhone = phone.startsWith('+')
      ? phone.replace('+', '')
      : phone.length === 10
        ? `91${phone}`
        : phone;

    try {
      await import('@/lib/api-client').then((m) =>
        m.default.post('/analytics/lead', { businessProfileId: business.id, type: 'whatsapp_click' })
      );
    } catch {}

    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const submitRequest = async () => {
    try {
      setIsSubmitting(true);
      const { useAuthStore } = await import('@/store/authStore');
      const { user } = useAuthStore.getState();

      await import('@/lib/api-client').then((m) =>
        m.default.post('/orders/checkout', {
          businessProfileId: business.id,
          orderType: 'SERVICE_BOOKING',
          customerName: user?.name || 'Guest User',
          customerPhone: user?.phoneNumber || '9999999999',
          serviceLocation: requestDetails,
          totalValue: total,
          status: 'PENDING',
          items: selectedServices.map((s) => ({
            catalogItemId: s.id,
            quantity: 1,
            priceAtTimeOfOrder: s.price || 0,
          })),
        })
      );

      alert('Request Submitted Successfully! The vendor will review and accept.');
      setIsRequestModalOpen(false);
      setSelectedServices([]);
      setRequestDetails('');
    } catch (error) {
      console.error(error);
      alert('Failed to submit request');
    } finally {
      setIsSubmitting(false);
    }
  };

  const profileImage =
    business.media?.find((m: any) => m.type === 'shop_photo' || m.type === 'profile_image')?.secureUrl ||
    'https://images.unsplash.com/photo-1521590832167-7bcbfaa6381f?auto=format&fit=crop&w=400&q=80';
  const coverImage =
    business.media?.find((m: any) => m.type === 'gallery' || m.type === 'cover')?.secureUrl ||
    profileImage;

  const isVerified = business.membershipTier === 'Pro' || business.membershipTier === 'Starter';
  const experience = business.metaData?.experience || '5+ Years';
  const taxonomy = business.metaData?.taxonomy || {};
  const customTags = business.metaData?.customTags || [];
  const taxonomyTags = Object.values(taxonomy).flatMap((val) => {
    if (Array.isArray(val)) return val;
    if (typeof val === 'string' && val) return [val];
    return [];
  });
  const allTags = [...new Set([...taxonomyTags, ...customTags])];

  return (
    <div className="w-full relative min-h-screen bg-white pb-32">
      {/* ─── Cover hero ─── */}
      <div className="relative h-60 sm:h-72 w-full overflow-hidden">
        <img src={coverImage} alt="" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-indigo-950/60 to-indigo-900/20" />
        <div className="absolute top-4 right-4">
          <span className="inline-flex items-center gap-1.5 rounded-full bg-white/15 backdrop-blur-md px-3 py-1.5 text-[11px] font-bold uppercase tracking-wide text-white ring-1 ring-white/25">
            <Sparkles className="w-3.5 h-3.5" /> Premium Pro
          </span>
        </div>
      </div>

      {/* ─── Profile header (overlapping the hero) ─── */}
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <div className="-mt-16 relative flex items-end gap-4">
          <div className="relative shrink-0">
            <div className="w-28 h-28 rounded-2xl overflow-hidden ring-4 ring-white shadow-xl bg-zinc-100">
              <img src={profileImage} alt={business.businessName} className="w-full h-full object-cover" />
            </div>
            {isVerified && (
              <div className="absolute -bottom-2 -right-2 bg-indigo-600 rounded-full p-1 ring-4 ring-white">
                <BadgeCheck className="w-5 h-5 text-white" />
              </div>
            )}
          </div>
          <div className="pb-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-black text-zinc-900 tracking-tight leading-tight truncate">
              {business.businessName}
            </h1>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-indigo-50 text-indigo-700 px-3 py-1 text-xs font-bold border border-indigo-100">
                <Sparkles className="w-3.5 h-3.5" /> {experience} Experience
              </span>
              {isVerified && (
                <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 text-emerald-700 px-3 py-1 text-xs font-bold border border-emerald-100">
                  <BadgeCheck className="w-3.5 h-3.5" /> Verified Pro
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ─── Specialties ─── */}
        {allTags.length > 0 && (
          <div className="mt-8">
            <h3 className="text-[11px] font-bold text-zinc-400 uppercase tracking-widest mb-3">Specialties</h3>
            <div className="flex flex-wrap gap-2">
              {allTags.map((tag, idx) => (
                <span
                  key={idx}
                  className="bg-zinc-50 text-zinc-700 px-3.5 py-1.5 rounded-full text-xs font-bold border border-zinc-200"
                >
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}

        {/* ─── Services ─── */}
        <div className="mt-10">
          <div className="flex items-baseline justify-between mb-5">
            <h2 className="text-xl font-black text-zinc-900 tracking-tight">Select Services</h2>
            {business.catalogItems && business.catalogItems.length > 0 && (
              <span className="text-xs font-bold text-zinc-400">{business.catalogItems.length} available</span>
            )}
          </div>

          <div className="space-y-3.5">
            {business.catalogItems?.map((item) => {
              const isSelected = selectedServices.some((s) => s.id === item.id);
              return (
                <button
                  key={item.id}
                  onClick={() => toggleService(item)}
                  className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex gap-4 items-center ${
                    isSelected
                      ? 'border-indigo-500 bg-indigo-50/50 ring-2 ring-indigo-500/20 shadow-sm'
                      : 'border-zinc-200 bg-white hover:border-zinc-300 hover:shadow-sm'
                  }`}
                >
                  {/* Selection indicator */}
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors ${
                      isSelected ? 'border-indigo-600 bg-indigo-600' : 'border-zinc-300'
                    }`}
                  >
                    {isSelected && <Check className="w-3.5 h-3.5 text-white" strokeWidth={3} />}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="text-base font-bold text-zinc-900 leading-snug truncate">{item.title}</h4>
                    <div className="mt-1 flex items-center gap-3 text-sm">
                      <span className="font-extrabold text-indigo-600">₹{item.price?.toString()}</span>
                      {item.description && (
                        <span className="flex items-center gap-1 text-zinc-400 font-medium truncate">
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.description}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {item.mediaUrl ? (
                    <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 bg-zinc-100">
                      <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
                    </div>
                  ) : (
                    <ChevronRight className="w-5 h-5 text-zinc-300 shrink-0" />
                  )}
                </button>
              );
            })}

            {(!business.catalogItems || business.catalogItems.length === 0) && (
              <div className="text-center py-14 rounded-2xl border border-dashed border-zinc-200 bg-zinc-50/50 text-zinc-400 font-semibold text-sm">
                No services listed by this professional yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* ─── Glass sticky checkout bar ─── */}
      <div className="fixed bottom-0 left-0 right-0 p-3.5 bg-white/90 backdrop-blur-xl border-t border-zinc-200 z-50 shadow-[0_-8px_30px_rgba(0,0,0,0.06)]">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          {selectedServices.length > 0 ? (
            <>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-bold text-zinc-400">{selectedServices.length} selected · base est.</div>
                <div className="text-xl font-black text-zinc-900">₹{total}</div>
              </div>
              <button
                onClick={handlePrimaryAction}
                className="inline-flex items-center gap-2 bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3.5 px-7 rounded-2xl transition-all shadow-lg shadow-indigo-600/25 active:scale-95 whitespace-nowrap"
              >
                {connectionMode === 'DIRECT' ? 'Request Pro' : 'Request to Book'}
                <ArrowRight className="w-4 h-4" />
              </button>
            </>
          ) : (
            <button
              onClick={handlePrimaryAction}
              className="w-full inline-flex items-center justify-center gap-2 bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3.5 px-8 rounded-2xl transition-all shadow-lg shadow-indigo-600/25 active:scale-[0.99]"
            >
              {connectionMode === 'DIRECT' ? 'Contact Professional' : 'Request to Book'}
              <ArrowRight className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* ─── Request Modal ─── */}
      {isRequestModalOpen && (
        <div className="fixed inset-0 bg-zinc-900/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-md rounded-3xl p-6 border border-zinc-200 shadow-2xl relative">
            <button
              onClick={() => setIsRequestModalOpen(false)}
              className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-700 p-1 rounded-lg hover:bg-zinc-100"
            >
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-black text-zinc-900 mb-2">Request to Book</h3>
            <p className="text-zinc-500 text-sm mb-5 leading-relaxed">
              Describe your requirements or any specific problems you&apos;re facing — it helps the professional confirm they can help.
            </p>

            <textarea
              value={requestDetails}
              onChange={(e) => setRequestDetails(e.target.value)}
              className="w-full bg-zinc-50 border border-zinc-200 rounded-2xl p-4 text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/15 min-h-[120px] mb-4 text-sm"
              placeholder="E.g. I'd like a haircut and deep conditioning this weekend…"
            />

            <button
              onClick={submitRequest}
              disabled={isSubmitting || requestDetails.trim() === ''}
              className="w-full bg-gradient-to-br from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 disabled:opacity-50 text-white font-bold py-3.5 rounded-2xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              {isSubmitting ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Send Request'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
