'use client';

import { useState, useMemo } from 'react';
import { Minus, Plus, Search, Star, ArrowLeft, Heart } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { BusinessProfile, CatalogItem } from '@/types/models';
import CartDrawer from '../vendor/CartDrawer';
import VariantModal from '../vendor/VariantModal';
import { toast } from 'sonner';

interface FoodLayoutProps {
  business: BusinessProfile;
  theme: any;
}

export default function FoodPremiumDark({ business, theme }: FoodLayoutProps) {
  const router = useRouter();
  const { cartItems, addItem, removeItem, updateQuantity } = useCartStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState(false);
  const [nonVegFilter, setNonVegFilter] = useState(false);
  const [bestsellerFilter, setBestsellerFilter] = useState(false);
  const [isDescExpanded, setIsDescExpanded] = useState(false);
  
  const [selectedVariantItem, setSelectedVariantItem] = useState<CatalogItem | null>(null);

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
    
    if (vegFilter) {
      result = result.filter(item => {
        const isNonVeg = item.metaData?.isNonVeg === true || item.metaData?.dietaryType === 'Non-Veg';
        return !isNonVeg;
      });
    }
    if (nonVegFilter) {
      result = result.filter(item => {
        const isNonVeg = item.metaData?.isNonVeg === true || item.metaData?.dietaryType === 'Non-Veg';
        return isNonVeg;
      });
    }
    
    return result;
  }, [catalog, searchQuery, vegFilter, nonVegFilter]);

  const categories = ['Recommended', 'Starters', 'Main Course', 'Breads', 'Desserts', 'Beverages'];
  const heroImage = business.metaData?.bannerUrl || business.media?.filter((m: any) => m.type === 'shop_photo')[0]?.secureUrl || 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="w-full bg-zinc-950 min-h-screen text-white relative font-sans">
      <div className="relative w-full h-[300px] md:h-[400px]">
        <img src={heroImage} className="w-full h-full object-cover" alt="Restaurant Cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-950 via-zinc-950/60 to-transparent" />
        
        <div className="absolute inset-0 max-w-5xl mx-auto px-6 pt-6 pb-8 flex flex-col justify-between">
          <div className="flex justify-between items-center">
            <button onClick={() => router.back()} className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
               <ArrowLeft className="w-5 h-5" />
            </button>
            <button className="w-10 h-10 rounded-xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-colors">
               <Heart className="w-5 h-5" />
            </button>
          </div>
          
          <div className="text-white z-10">
            <h1 className="text-4xl md:text-6xl font-black mb-3 tracking-tight break-words px-2 line-clamp-2 bg-gradient-to-r from-white to-zinc-400 bg-clip-text text-transparent">{business.businessName}</h1>
            <div className="mb-3 px-2">
              <p className={`text-zinc-300 text-sm md:text-base font-light break-words ${isDescExpanded ? '' : 'line-clamp-2'}`}>
                {business.description || 'Elevating the culinary experience with premium ingredients and masterful preparation.'}
              </p>
              {(business.description?.length || 0) > 80 && (
                <button onClick={() => setIsDescExpanded(!isDescExpanded)} className="text-xs font-bold text-cyan-400 underline mt-1 hover:text-cyan-300 transition-colors">
                  {isDescExpanded ? 'See Less' : 'See More'}
                </button>
              )}
            </div>
            <div className="flex flex-wrap gap-2 text-xs font-semibold px-2">
              <span className="px-3 py-1.5 bg-zinc-900/80 backdrop-blur-md rounded-lg border border-white/10 flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-cyan-400 text-cyan-400"/> 
                <span className="text-zinc-100">{business.rating ? business.rating.toFixed(1) : '4.9'}</span>
              </span>
              {business.metaData?.isPureVeg && (
                <span className="px-3 py-1.5 bg-zinc-900/80 backdrop-blur-md rounded-lg border border-white/10 text-emerald-400">
                  Pure Veg
                </span>
              )}
              {business.metaData?.cuisines?.map((c: string) => (
                <span key={c} className="px-3 py-1.5 bg-zinc-900/80 backdrop-blur-md rounded-lg border border-white/10 text-zinc-300">{c}</span>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 mt-4">
        {business.metaData?.offers && business.metaData.offers.length > 0 && (
          <div className="mb-8">
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-2">
              {business.metaData.offers.map((offer: any, idx: number) => (
                <div key={idx} className="shrink-0 w-[280px] p-5 rounded-2xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-white/10 shadow-[0_8px_30px_rgb(0,0,0,0.5)] flex flex-col justify-between relative overflow-hidden group">
                  <div className="absolute inset-0 bg-cyan-400/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                  <div className="relative z-10">
                    <h4 className="text-cyan-400 font-black text-2xl tracking-tight">{offer.discount}</h4>
                    <p className="text-zinc-300 font-medium text-sm mt-1">{offer.title}</p>
                    <div className="mt-4 inline-block px-3 py-1.5 bg-black/50 border border-white/10 rounded-lg text-white font-mono font-bold text-[11px] tracking-widest">
                      {offer.code}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="sticky top-0 z-30 bg-zinc-950/80 backdrop-blur-xl pt-4 pb-4 -mx-6 px-6 md:mx-0 md:px-0">
          <div className="relative mb-5">
            <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-zinc-500" />
            <input 
              type="text" 
              placeholder="Find your next gourmet experience..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-5 py-4 bg-white/5 border border-white/10 rounded-2xl focus:outline-none focus:ring-1 focus:ring-cyan-500/50 focus:border-cyan-500/50 transition-all text-white placeholder:text-zinc-500 font-medium"
            />
          </div>
          
          <div className="flex gap-3 overflow-x-auto hide-scrollbar">
            <button onClick={() => { setVegFilter(!vegFilter); setNonVegFilter(false); }} className={`shrink-0 px-5 py-2.5 rounded-xl border text-sm font-semibold flex items-center gap-2.5 transition-all ${vegFilter ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-400' : 'border-white/10 text-zinc-400 bg-white/5 hover:bg-white/10'}`}>
               <div className="w-3.5 h-3.5 border-2 border-emerald-500 rounded flex items-center justify-center p-[1px]"><div className="w-full h-full bg-emerald-500 rounded-sm" /></div> Veg
            </button>
            <button onClick={() => { setNonVegFilter(!nonVegFilter); setVegFilter(false); }} className={`shrink-0 px-5 py-2.5 rounded-xl border text-sm font-semibold flex items-center gap-2.5 transition-all ${nonVegFilter ? 'border-rose-500/50 bg-rose-500/10 text-rose-400' : 'border-white/10 text-zinc-400 bg-white/5 hover:bg-white/10'}`}>
               <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-rose-500 relative top-[-1px]"></div> Non-Veg
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-8 mt-4 relative">
          <div className="flex overflow-x-auto gap-3 pb-4 -mx-6 px-6 sticky top-[130px] bg-zinc-950/80 backdrop-blur-xl z-20">
            {categories.map((cat, idx) => (
              <button key={cat} className={`shrink-0 px-5 py-2 rounded-xl text-sm font-bold transition-all ${idx === 0 ? 'bg-cyan-500 text-black' : 'bg-white/5 text-zinc-400 hover:bg-white/10 border border-white/5'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="flex-1 w-full pb-32">
            <div className="space-y-10">
              <div className="space-y-6">
                <h3 className="font-bold text-xl text-white tracking-wide">
                  Curated Specialties
                </h3>
                
                <div className="flex flex-col gap-6">
                  {filteredCatalog.map(item => {
                    const qty = getQuantity(item.id);
                    const isNonVeg = item.metaData?.isNonVeg === true || item.metaData?.dietaryType === 'Non-Veg';
                    const hasVariants = item.variants && Array.isArray(item.variants) && item.variants.length > 0;
                    
                    return (
                      <div key={item.id} className="p-4 rounded-3xl bg-zinc-900/50 border border-white/5 flex gap-5 group hover:bg-zinc-900 transition-colors">
                        <div className="relative shrink-0 w-[120px] h-[120px]">
                          {item.mediaUrl ? (
                            <div className="w-[120px] h-[120px] rounded-2xl overflow-hidden shadow-2xl">
                              <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" loading="lazy" />
                            </div>
                          ) : (
                            <div className="w-[120px] h-[120px] rounded-2xl overflow-hidden bg-zinc-800 flex flex-col items-center justify-center text-zinc-600">
                              <span className="font-bold text-xs uppercase tracking-widest">No Image</span>
                            </div>
                          )}
                        </div>

                        <div className="flex-1 min-w-0 py-1 flex flex-col justify-between">
                          <div>
                            <div className="flex justify-between items-start mb-1">
                               <h4 className="font-bold text-white text-lg leading-tight break-words line-clamp-2 pr-2">{item.title}</h4>
                               <div className={`shrink-0 w-4 h-4 border-2 rounded flex items-center justify-center p-[1px] ${isNonVeg ? 'border-rose-500' : 'border-emerald-500'}`}>
                                 {isNonVeg ? (
                                   <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[6px] border-l-transparent border-r-transparent border-b-rose-500"></div>
                                 ) : (
                                   <div className="w-full h-full rounded-sm bg-emerald-500" />
                                 )}
                               </div>
                            </div>
                            
                            {item.description && (
                              <p className="text-zinc-500 text-xs mt-1.5 line-clamp-2 leading-relaxed">{item.description}</p>
                            )}
                          </div>
                          
                          <div className="flex items-center justify-between mt-4">
                            {(() => {
                              const customPortions = item.variants && Array.isArray(item.variants) && item.variants.length > 0 && typeof item.variants[0] === 'object' ? item.variants : null;
                              if (customPortions) {
                                const minPrice = Math.min(...customPortions.map((p: any) => Number(p.price)));
                                return (
                                  <div className="font-semibold text-[15px] text-zinc-300">
                                    <span className="text-xs text-zinc-500">from</span> ₹{minPrice}
                                  </div>
                                );
                              }
                              return (
                                <div className="font-bold text-[16px] text-white">
                                  ₹{item.price ? Number(item.price).toFixed(2) : '0.00'}
                                </div>
                              );
                            })()}
                            
                            <div className="relative">
                              {qty === 0 ? (
                                <button 
                                  onClick={() => handleAddClick(item)}
                                  className="px-5 py-2 rounded-xl font-bold text-sm text-cyan-400 bg-cyan-400/10 hover:bg-cyan-400/20 transition-colors border border-cyan-400/20 flex items-center gap-2"
                                >
                                  <Plus className="w-4 h-4" /> Add
                                </button>
                              ) : (
                                <div className="flex items-center justify-between w-[90px] h-9 font-bold bg-cyan-500 text-black rounded-xl overflow-hidden shadow-[0_0_15px_rgba(6,182,212,0.3)]">
                                  <button onClick={() => updateQuantity(item.id, -1)} className="flex-1 h-full flex items-center justify-center hover:bg-cyan-400 transition-colors"><Minus className="w-4 h-4" /></button>
                                  <span className="w-6 text-center text-sm">{qty}</span>
                                  <button onClick={() => updateQuantity(item.id, 1)} className="flex-1 h-full flex items-center justify-center hover:bg-cyan-400 transition-colors"><Plus className="w-4 h-4" /></button>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {filteredCatalog.length === 0 && (
                  <div className="py-20 text-center text-zinc-600 font-medium">
                    No culinary masterpieces found.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <CartDrawer vendor={business} theme={theme} />
      
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
