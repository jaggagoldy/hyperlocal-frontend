'use client';

import { useState, useMemo } from 'react';
import { Minus, Plus, Search, Star, ArrowLeft, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { BusinessProfile, CatalogItem } from '@/types/models';
import CartDrawer from '../vendor/CartDrawer';
import VariantModal from '../vendor/VariantModal';
import { toast } from 'sonner';

interface FoodImmersiveProps {
  business: BusinessProfile;
}

export default function FoodImmersive({ business }: FoodImmersiveProps) {
  const router = useRouter();
  const { cartItems, addItem, removeItem, updateQuantity } = useCartStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedVariantItem, setSelectedVariantItem] = useState<CatalogItem | null>(null);
  const [isDescExpanded, setIsDescExpanded] = useState(false);

  const getQuantity = (itemId: string) => {
    return cartItems.find(ci => ci.catalogItem.id === itemId)?.quantity || 0;
  };

  const handleAddClick = (item: CatalogItem) => {
    if (item.variants && Array.isArray(item.variants) && item.variants.length > 0) {
      setSelectedVariantItem(item);
    } else {
      const res = addItem(item, 'TRANSACTIONAL');
      if (!res.success) toast.error(res.error);
    }
  };

  const catalog = business.catalogItems || [];

  const filteredCatalog = useMemo(() => {
    let result = catalog;
    if (searchQuery) {
      const lowerQuery = searchQuery.toLowerCase();
      result = result.filter(item => 
        item.title.toLowerCase().includes(lowerQuery) || 
        (item.description && item.description.toLowerCase().includes(lowerQuery))
      );
    }
    return result;
  }, [catalog, searchQuery]);

  const categories = ['All', 'Chef Specials', 'Mains', 'Desserts'];
  const heroImage = business.metaData?.bannerUrl || business.media?.filter((m: any) => m.type === 'shop_photo')[0]?.secureUrl || 'https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="w-full min-h-screen bg-black text-white relative font-sans">
      {/* Immersive Hero Header */}
      <div className="relative w-full h-[60vh] bg-zinc-900 rounded-b-[40px] overflow-hidden shadow-2xl">
        <img src={heroImage} className="w-full h-full object-cover opacity-80" alt="Restaurant Cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/40 to-transparent" />
        
        <div className="absolute inset-0 max-w-5xl mx-auto px-6 pt-6 pb-12 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <button onClick={() => router.back()} className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10">
               <ArrowLeft className="w-6 h-6" />
            </button>
            <button className="w-12 h-12 rounded-full bg-black/40 backdrop-blur-xl flex items-center justify-center text-white hover:bg-black/60 transition-colors border border-white/10">
               <Heart className="w-6 h-6" />
            </button>
          </div>
          
          <div className="text-center">
            {business.metaData?.logoUrl && (
               <div className="w-16 h-16 mx-auto rounded-3xl bg-white/20 backdrop-blur-xl p-1 shadow-xl mb-4 border border-white/20">
                  <img src={business.metaData.logoUrl} className="w-full h-full object-cover rounded-[20px]" alt="Logo" />
               </div>
            )}
            <h1 className="text-4xl md:text-6xl font-black mb-2 tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white to-zinc-400 break-words px-4 leading-tight line-clamp-2">{business.businessName}</h1>
            <div className="mb-4">
              <p className={`text-zinc-300 text-sm md:text-lg font-medium break-words ${isDescExpanded ? '' : 'line-clamp-2'}`}>
                {business.description || 'An Immersive Culinary Experience'}
              </p>
              {(business.description?.length || 0) > 80 && (
                <button onClick={() => setIsDescExpanded(!isDescExpanded)} className="text-xs font-bold text-zinc-400 underline mt-1 hover:text-white transition-colors">
                  {isDescExpanded ? 'See Less' : 'See More'}
                </button>
              )}
            </div>
            <div className="flex justify-center gap-3 text-sm font-semibold flex-wrap">
              <span className="px-4 py-2 bg-rose-600 rounded-xl shadow-lg flex items-center gap-2 text-white">
                <Star className="w-4 h-4 fill-current"/> {business.rating ? business.rating.toFixed(1) : 'NEW'}
              </span>
              {business.metaData?.isPureVeg && (
                <span className="px-4 py-2 bg-green-600 text-white rounded-xl shadow-lg font-bold">
                  Pure Veg
                </span>
              )}
              {business.metaData?.isDineInAvailable && (
                <span className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow-lg font-bold">
                  Dine-In
                </span>
              )}
              {business.metaData?.cuisines?.map((c: string) => (
                <span key={c} className="px-4 py-2 bg-white/10 rounded-xl backdrop-blur-md border border-white/10">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      {business.metaData?.offers && business.metaData.offers.length > 0 && (
        <div className="max-w-5xl mx-auto px-6 -mt-8 mb-6 relative z-20">
          <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4">
            {business.metaData.offers.map((offer: any, idx: number) => (
              <div key={idx} className="shrink-0 w-[280px] p-5 rounded-3xl bg-gradient-to-br from-rose-500/90 to-orange-600/90 backdrop-blur-xl border border-white/20 shadow-2xl flex flex-col justify-between">
                <div>
                  <h4 className="text-white font-black text-xl mb-1">{offer.discount}</h4>
                  <p className="text-white/80 font-medium text-sm">{offer.title}</p>
                </div>
                <div className="mt-4 inline-flex items-center self-start px-3 py-1 bg-black/30 rounded-lg backdrop-blur-md border border-white/10">
                  <span className="text-white font-mono font-bold tracking-wider text-xs">USE CODE: {offer.code}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        {/* Search & Filter Bar */}
        <div className="bg-zinc-900/80 backdrop-blur-xl p-4 rounded-3xl border border-white/10 shadow-2xl mb-12 flex gap-4 items-center">
          <div className="relative flex-1">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search our menu..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-black/50 border-none rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500 transition-all font-medium placeholder:text-zinc-500 text-white"
            />
          </div>
        </div>

        {/* Categories Pills */}
        <div className="flex gap-3 overflow-x-auto hide-scrollbar mb-10 pb-2">
          {categories.map((cat, idx) => (
            <button key={cat} className={`shrink-0 px-6 py-3 rounded-2xl text-sm font-bold transition-all ${idx === 0 ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30' : 'bg-zinc-900 text-zinc-400 hover:text-white hover:bg-zinc-800'}`}>
              {cat}
            </button>
          ))}
        </div>

        {/* Immersive List Layout */}
        <div className="flex flex-col gap-6 pb-32">
          {filteredCatalog.map(item => {
            const qty = getQuantity(item.id);
            const hasVariants = item.variants && Array.isArray(item.variants) && item.variants.length > 0;
            const imageUrl = item.mediaUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80';
            
            return (
              <div key={item.id} className="group relative bg-zinc-900 rounded-3xl overflow-hidden border border-white/5 hover:border-white/20 transition-all">
                <div className="aspect-[4/3] w-full overflow-hidden relative">
                  <img src={imageUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-transparent to-transparent opacity-90" />
                  
                  {/* Price Tag Overlay */}
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-black/60 backdrop-blur-md rounded-xl border border-white/10 font-bold">
                     ₹{item.price ? Number(item.price).toFixed(0) : '0'}
                  </div>
                </div>
                
                <div className="p-6">
                  <h4 className="font-bold text-xl mb-2 text-white break-words line-clamp-2">{item.title}</h4>
                  {item.description && (
                    <p className="text-zinc-400 text-sm line-clamp-2 mb-6">{item.description}</p>
                  )}
                  
                  <div className="flex items-center justify-between mt-auto">
                    {hasVariants ? (
                      <span className="text-rose-400 text-xs font-bold uppercase tracking-widest">Customizable</span>
                    ) : (
                      <span className="text-zinc-500 text-xs font-bold uppercase tracking-widest">Standard Portion</span>
                    )}

                    {qty === 0 ? (
                      <button 
                        onClick={() => handleAddClick(item)}
                        className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center hover:bg-rose-500 hover:text-white transition-all shadow-xl"
                      >
                        <Plus className="w-6 h-6" />
                      </button>
                    ) : (
                      <div className="flex items-center gap-4 bg-rose-600 rounded-full px-4 py-2 text-white font-bold">
                        <button onClick={() => updateQuantity(item.id, -1)} className="hover:text-black transition-colors"><Minus className="w-4 h-4" /></button>
                        <span>{qty}</span>
                        <button onClick={() => updateQuantity(item.id, 1)} className="hover:text-black transition-colors"><Plus className="w-4 h-4" /></button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
        
        {filteredCatalog.length === 0 && (
          <div className="py-20 text-center text-zinc-500 font-medium text-lg">
            No culinary creations found.
          </div>
        )}
      </div>

      <CartDrawer vendor={business} theme={null} />
      
      {selectedVariantItem && (
        <VariantModal 
          item={selectedVariantItem} 
          isOpen={!!selectedVariantItem}
          onClose={() => setSelectedVariantItem(null)}
          onAdd={(item, selectedVariant) => {
             const res = addItem(item, 'TRANSACTIONAL');
             if (!res.success) toast.error(res.error);
             setSelectedVariantItem(null);
          }}
        />
      )}
      
      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar { display: none; }
        .hide-scrollbar { -ms-overflow-style: none; scrollbar-width: none; }
      `}</style>
    </div>
  );
}
