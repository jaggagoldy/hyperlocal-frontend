'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Store, ShieldCheck, MapPin, Star, Phone, Info } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { CatalogItem } from '@/types/models';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useCartStore } from '@/store/useCartStore';
import { toast } from 'sonner';

export default function ServiceDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const { user } = useAuthStore();
  
  const [item, setItem] = useState<CatalogItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEnquiring, setIsEnquiring] = useState(false);

  useEffect(() => {
    const fetchItem = async () => {
      try {
        const res = await apiClient.get(`/catalog/${id}`);
        setItem(res.data?.data || null);
      } catch (error) {
        console.error('Failed to load service', error);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchItem();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (!item) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-zinc-50 text-center">
        <Store className="w-16 h-16 text-zinc-300 mb-4" />
        <h2 className="text-xl font-bold text-zinc-900">Service Not Found</h2>
        <p className="text-zinc-500 mt-2 max-w-sm">The service you are looking for may have been removed or is currently unavailable.</p>
        <button onClick={() => router.back()} className="mt-6 px-6 py-2.5 bg-zinc-900 text-white font-bold rounded-xl shadow-sm">Go Back</button>
      </div>
    );
  }

  const vendor = item.vendor;
  const isVerified = vendor?.membershipTier === 'Pro' || vendor?.membershipTier === 'Starter';

  const handleEnquire = async () => {
    if (!user) {
      toast.error('Please login to send an enquiry.');
      router.push('/login');
      return;
    }
    
    setIsEnquiring(true);
    try {
      await apiClient.post('/catalog/enquire', {
        catalogItemId: item.id,
        customerName: user.name || 'Customer',
        customerPhone: user.phoneNumber || '',
        customerRequirement: `Interested in: ${item.title}`
      });
      toast.success('Inquiry sent successfully! The provider will contact you shortly.');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send inquiry.');
    } finally {
      setIsEnquiring(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-24 font-sans">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 backdrop-blur-md border-b border-zinc-200">
        <div className="max-w-3xl mx-auto px-4 h-16 flex items-center gap-3">
          <button onClick={() => router.back()} className="p-2 -ml-2 rounded-full hover:bg-zinc-100 text-zinc-700 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex-1">
            <h1 className="font-black text-zinc-900 truncate">{item.title}</h1>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-6 space-y-6">
        
        {/* Service Details Card */}
        <div className="bg-white rounded-3xl border border-zinc-200 p-1 shadow-sm overflow-hidden">
          {item.mediaUrl && (
            <div className="w-full h-64 md:h-80 bg-zinc-100 rounded-[1.3rem] overflow-hidden relative">
              <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
              {item.variants && (item.variants as any).length > 0 && (
                <div className="absolute top-4 left-4 flex gap-2">
                  {(item.variants as any).includes('veg') && <span className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-black text-green-700 shadow-sm flex items-center gap-1.5"><span className="w-2 h-2 bg-green-600 rounded-full"></span> VEG</span>}
                  {(item.variants as any).includes('non-veg') && <span className="bg-white/90 backdrop-blur px-2.5 py-1 rounded-full text-xs font-black text-rose-700 shadow-sm flex items-center gap-1.5"><span className="w-2 h-2 bg-rose-600 rounded-full"></span> NON-VEG</span>}
                </div>
              )}
            </div>
          )}
          
          <div className="p-5 md:p-6">
            <div className="flex justify-between items-start gap-4">
              <div>
                <h2 className="text-2xl font-black text-zinc-900 leading-tight">{item.title}</h2>
                <p className="text-sm font-bold text-zinc-500 uppercase tracking-wider mt-1">{item.category?.name}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-2xl font-black text-primary">₹{item.price || 'Ask'}</p>
                {item.unit && <p className="text-xs text-zinc-500 font-medium">per {item.unit}</p>}
              </div>
            </div>

            {item.description && (
              <div className="mt-6 pt-6 border-t border-zinc-100">
                <h3 className="text-sm font-bold text-zinc-900 mb-2 flex items-center gap-2"><Info className="w-4 h-4 text-zinc-400"/> About this service</h3>
                <p className="text-zinc-600 text-sm leading-relaxed whitespace-pre-wrap">{item.description}</p>
              </div>
            )}
          </div>
        </div>

        {/* Vendor Teaser Card (Masked Privacy) */}
        {vendor && (
          <div className="bg-zinc-900 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/20 rounded-full blur-3xl -mr-10 -mt-10"></div>
            
            <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Store className="w-4 h-4" /> Provided By
            </p>
            
            <div className="flex items-center gap-4 mb-6 relative z-10">
              <div className="w-14 h-14 bg-zinc-800 rounded-2xl flex items-center justify-center overflow-hidden border border-zinc-700 shrink-0">
                {vendor.media && (vendor.media as any).length > 0 ? (
                  <img src={(vendor.media as any)[0].secureUrl} className="w-full h-full object-cover" />
                ) : (
                  <Store className="w-6 h-6 text-zinc-500" />
                )}
              </div>
              <div>
                <h3 className="text-xl font-black flex items-center gap-2">
                  {vendor.businessName}
                  {isVerified && <ShieldCheck className="w-5 h-5 text-blue-400" />}
                </h3>
                <p className="text-sm text-zinc-400 flex items-center gap-1.5 mt-0.5">
                  <MapPin className="w-3.5 h-3.5" /> {vendor.localityName}
                </p>
              </div>
            </div>

            {/* Privacy Mask for Phone */}
            <div className="bg-zinc-800/50 border border-zinc-700/50 rounded-2xl p-4 flex items-center justify-between gap-4 mb-6 backdrop-blur-sm relative z-10">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-zinc-700 flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4 text-zinc-300" />
                </div>
                <div>
                  <p className="text-xs font-bold text-zinc-400">Direct Contact</p>
                  <p className="font-mono font-bold tracking-widest text-zinc-200 mt-0.5">+91 ••••• •••••</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] font-bold text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2 py-1 rounded border border-amber-500/20">Protected</span>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 relative z-10">
              {vendor.businessType === 'FOOD_BEVERAGE' ? (
                <button 
                  onClick={() => {
                    const { addItem } = useCartStore.getState();
                    addItem(item, 'TRANSACTIONAL');
                    toast.success('Added to Cart!');
                  }}
                  className="w-full bg-green-600 hover:bg-green-500 text-white font-black py-3.5 rounded-xl transition-colors shadow-[0_4px_14px_0_rgba(22,163,74,0.39)] flex items-center justify-center gap-2"
                >
                  Add to Cart
                </button>
              ) : vendor.businessType === 'HOME_SERVICES' || vendor.businessType === 'SALON_BEAUTY' || vendor.businessType === 'HOME_ESSENTIALS' ? (
                <button 
                  onClick={() => router.push(`/vendor/${vendor.slug}?preselect=${item.id}`)}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-black py-3.5 rounded-xl transition-colors shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] flex items-center justify-center gap-2"
                >
                  Book Service
                </button>
              ) : (
                <button 
                  onClick={handleEnquire}
                  disabled={isEnquiring}
                  className="w-full bg-primary hover:bg-primary/90 text-white font-black py-3.5 rounded-xl transition-colors shadow-[0_4px_14px_0_rgba(79,70,229,0.39)] disabled:opacity-70 flex items-center justify-center gap-2"
                >
                  {isEnquiring ? 'Sending...' : 'Enquire Now'}
                </button>
              )}
              
              <Link href={`/vendor/${vendor.slug}`} className="w-full bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white font-bold py-3.5 rounded-xl transition-colors flex items-center justify-center gap-2">
                View Full Profile
              </Link>
            </div>
            
          </div>
        )}

      </main>
    </div>
  );
}
