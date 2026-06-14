'use client';

import { useState, useMemo } from 'react';
import { Minus, Plus, Search, Star, ArrowLeft, Flame, Tag } from 'lucide-react';
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

export default function FoodPremiumVibrant({ business, theme }: FoodLayoutProps) {
  const router = useRouter();
  const { cartItems, addItem, removeItem, updateQuantity } = useCartStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState(false);
  const [nonVegFilter, setNonVegFilter] = useState(false);
  
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

  const categories = ['Hot Spots', 'Pizza & Pasta', 'Burgers', 'Snacks', 'Desserts', 'Drinks'];
  const heroImage = business.metaData?.bannerUrl || business.media?.filter((m: any) => m.type === 'shop_photo')[0]?.secureUrl || 'https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="w-full bg-[#FAFAFA] min-h-screen text-zinc-900 relative font-sans overflow-x-hidden">
      
      {/* Playful Header background decoration */}
      <div className="absolute top-0 left-0 w-full h-[400px] overflow-hidden z-0">
         <div className="absolute top-[-100px] right-[-50px] w-[300px] h-[300px] bg-orange-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
         <div className="absolute top-[50px] left-[-100px] w-[350px] h-[350px] bg-yellow-400 rounded-full mix-blend-multiply filter blur-3xl opacity-20"></div>
      </div>

      <div className="max-w-5xl mx-auto px-6 pt-6 relative z-10">
        <div className="flex justify-between items-center mb-8">
          <button onClick={() => router.back()} className="w-12 h-12 rounded-full bg-white shadow-[0_4px_20px_rgb(0,0,0,0.06)] flex items-center justify-center text-zinc-900 hover:scale-110 transition-transform">
             <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="bg-white px-5 py-2.5 rounded-full shadow-[0_4px_20px_rgb(0,0,0,0.06)] flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
            <span className="text-sm font-black text-zinc-800">Delivering Now</span>
          </div>
        </div>

        <div className="bg-white rounded-[40px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] overflow-hidden border border-zinc-100 relative mb-10">
          <div className="relative w-full h-[220px]">
            <img src={heroImage} className="w-full h-full object-cover" alt="Cover" />
            <div className="absolute bottom-4 right-4 bg-white/90 backdrop-blur-md px-4 py-2 rounded-full shadow-lg flex items-center gap-1">
              <Star className="w-4 h-4 fill-orange-500 text-orange-500"/>
              <span className="font-black text-sm">{business.rating ? business.rating.toFixed(1) : 'NEW'}</span>
            </div>
          </div>
          
          <div className="p-8 pt-6 relative">
            <div className="absolute -top-12 left-8 w-24 h-24 rounded-[24px] bg-white p-2 shadow-xl border border-zinc-100 rotate-[-5deg]">
               <img src={business.metaData?.logoUrl || heroImage} className="w-full h-full object-cover rounded-[16px]" alt="Logo" />
            </div>
            
            <div className="ml-[110px] mt-2 mb-6">
              <h1 className="text-3xl md:text-4xl font-black tracking-tight text-zinc-900 mb-1">{business.businessName}</h1>
              <p className="text-zinc-500 font-semibold">{business.description || 'Delicious, fresh, and piping hot!'}</p>
            </div>
            
            <div className="flex flex-wrap gap-2">
              {business.metaData?.cuisines?.map((c: string) => (
                <span key={c} className="px-4 py-2 bg-orange-50 text-orange-600 rounded-full font-bold text-xs uppercase tracking-wide border border-orange-100">{c}</span>
              ))}
              {business.metaData?.isPureVeg && (
                <span className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-full font-bold text-xs uppercase tracking-wide border border-emerald-100">Pure Veg</span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 relative z-10">
        
        {business.metaData?.offers && business.metaData.offers.length > 0 && (
          <div className="mb-10">
            <h3 className="font-black text-2xl mb-4 flex items-center gap-2">
               <Tag className="text-orange-500 w-6 h-6" /> Special Offers
            </h3>
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-6 px-6 md:mx-0 md:px-0">
              {business.metaData.offers.map((offer: any, idx: number) => (
                <div key={idx} className="shrink-0 w-[260px] p-6 rounded-[24px] bg-gradient-to-br from-orange-400 to-orange-600 shadow-lg shadow-orange-500/30 text-white relative overflow-hidden transform hover:-translate-y-1 transition-transform">
                  <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/20 rounded-full blur-xl"></div>
                  <h4 className="font-black text-3xl mb-1">{offer.discount}</h4>
                  <p className="font-semibold text-white/90 text-sm mb-4">{offer.title}</p>
                  <div className="inline-block px-4 py-2 bg-black/20 backdrop-blur-md rounded-full font-black text-xs tracking-widest uppercase">
                    {offer.code}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="sticky top-0 z-30 bg-[#FAFAFA]/90 backdrop-blur-xl pt-2 pb-4 -mx-6 px-6 md:mx-0 md:px-0">
          <div className="relative mb-4 flex gap-3">
            <div className="relative flex-1">
              <Search className="w-5 h-5 absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
              <input 
                type="text" 
                placeholder="Craving something?"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-12 pr-6 py-4 bg-white shadow-[0_4px_20px_rgb(0,0,0,0.05)] border-2 border-transparent rounded-[20px] focus:outline-none focus:border-orange-500 transition-all text-zinc-900 placeholder:text-zinc-400 font-bold text-base"
              />
            </div>
          </div>
          
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            <button onClick={() => { setVegFilter(!vegFilter); setNonVegFilter(false); }} className={`shrink-0 px-6 py-3 rounded-full text-sm font-black flex items-center gap-2 transition-all shadow-sm border-2 ${vegFilter ? 'bg-emerald-500 border-emerald-500 text-white' : 'bg-white border-transparent text-zinc-600 hover:border-emerald-200'}`}>
               <span className="text-base">🥦</span> Veg Only
            </button>
            <button onClick={() => { setNonVegFilter(!nonVegFilter); setVegFilter(false); }} className={`shrink-0 px-6 py-3 rounded-full text-sm font-black flex items-center gap-2 transition-all shadow-sm border-2 ${nonVegFilter ? 'bg-rose-500 border-rose-500 text-white' : 'bg-white border-transparent text-zinc-600 hover:border-rose-200'}`}>
               <span className="text-base">🍗</span> Non-Veg
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-10 mt-6 relative pb-32">
          <div className="flex overflow-x-auto gap-3 pb-4 -mx-6 px-6 sticky top-[150px] bg-[#FAFAFA]/90 backdrop-blur-xl z-20 hide-scrollbar">
            {categories.map((cat, idx) => (
              <button key={cat} className={`shrink-0 px-6 py-3 rounded-full text-sm font-black transition-all ${idx === 0 ? 'bg-zinc-900 text-white shadow-lg' : 'bg-white text-zinc-500 hover:bg-zinc-100 shadow-sm border border-zinc-100'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="flex flex-col gap-8">
            {filteredCatalog.map((item, idx) => {
              const qty = getQuantity(item.id);
              const isNonVeg = item.metaData?.isNonVeg === true || item.metaData?.dietaryType === 'Non-Veg';
              const hasVariants = item.variants && Array.isArray(item.variants) && item.variants.length > 0;
              const isHot = idx % 3 === 0; // Just mock some visual flair for the first item
              
              return (
                <div key={item.id} className="bg-white rounded-[32px] shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 p-4 flex flex-col hover:-translate-y-1 hover:shadow-[0_12px_40px_rgb(0,0,0,0.08)] transition-all relative">
                  
                  {isHot && (
                    <div className="absolute -top-3 -left-3 z-10 bg-gradient-to-r from-orange-500 to-rose-500 text-white text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-lg flex items-center gap-1">
                      <Flame className="w-3 h-3" /> Must Try!
                    </div>
                  )}

                  <div className="relative w-full h-[200px] rounded-[24px] overflow-hidden mb-5">
                    {item.mediaUrl ? (
                      <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                    ) : (
                      <div className="w-full h-full bg-orange-50 flex items-center justify-center">
                        <span className="font-black text-orange-200 text-2xl">YUM</span>
                      </div>
                    )}
                  </div>

                  <div className="flex-1 flex flex-col justify-between px-2">
                    <div>
                      <div className="flex justify-between items-start mb-2">
                         <h4 className="font-black text-zinc-900 text-2xl leading-tight pr-4">{item.title}</h4>
                         <div className={`shrink-0 w-6 h-6 rounded-full flex items-center justify-center bg-zinc-50 ${isNonVeg ? 'text-rose-500' : 'text-emerald-500'}`}>
                           {isNonVeg ? '🍗' : '🥦'}
                         </div>
                      </div>
                      
                      {item.description && (
                        <p className="text-zinc-500 font-semibold text-sm leading-relaxed line-clamp-2">{item.description}</p>
                      )}
                    </div>
                    
                    <div className="mt-6 flex items-center justify-between">
                      <div className="bg-orange-50 px-4 py-2 rounded-xl text-orange-600">
                        {(() => {
                          const customPortions = item.variants && Array.isArray(item.variants) && item.variants.length > 0 && typeof item.variants[0] === 'object' ? item.variants : null;
                          if (customPortions) {
                            const minPrice = Math.min(...customPortions.map((p: any) => Number(p.price)));
                            return (
                              <div className="font-black text-lg">
                                <span className="text-xs opacity-70 mr-1">from</span>${minPrice}
                              </div>
                            );
                          }
                          return (
                            <div className="font-black text-lg">
                              ${item.price ? Number(item.price).toFixed(2) : '0.00'}
                            </div>
                          );
                        })()}
                      </div>
                      
                      <div className="relative">
                        {qty === 0 ? (
                          <button 
                            onClick={() => handleAddClick(item)}
                            className="px-6 py-3 rounded-xl font-black text-white bg-orange-500 hover:bg-orange-600 shadow-lg shadow-orange-500/30 hover:shadow-orange-500/40 transition-all active:scale-95 uppercase tracking-wide text-sm"
                          >
                            Add To Cart
                          </button>
                        ) : (
                          <div className="flex items-center justify-between w-[130px] h-[48px] font-black bg-orange-500 text-white rounded-xl overflow-hidden shadow-lg shadow-orange-500/30">
                            <button onClick={() => updateQuantity(item.id, -1)} className="flex-1 h-full flex items-center justify-center hover:bg-orange-600 transition-colors"><Minus className="w-5 h-5" /></button>
                            <span className="w-8 text-center text-lg">{qty}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="flex-1 h-full flex items-center justify-center hover:bg-orange-600 transition-colors"><Plus className="w-5 h-5" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredCatalog.length === 0 && (
              <div className="col-span-full py-20 text-center text-zinc-400 font-bold text-xl">
                Whoops! Nothing found.
              </div>
            )}
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
