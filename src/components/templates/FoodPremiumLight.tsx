'use client';

import { useState, useMemo } from 'react';
import { Minus, Plus, Search, Star, ArrowLeft, Heart, Info } from 'lucide-react';
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

export default function FoodPremiumLight({ business, theme }: FoodLayoutProps) {
  const router = useRouter();
  const { cartItems, addItem, removeItem, updateQuantity } = useCartStore();
  
  const [searchQuery, setSearchQuery] = useState('');
  const [vegFilter, setVegFilter] = useState(false);
  const [nonVegFilter, setNonVegFilter] = useState(false);
  const [bestsellerFilter, setBestsellerFilter] = useState(false);
  
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

  const categories = ['Signature Collections', 'Starters', 'Main Course', 'Desserts', 'Beverages'];
  const heroImage = business.metaData?.bannerUrl || business.media?.filter((m: any) => m.type === 'shop_photo')[0]?.secureUrl || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="w-full bg-zinc-50 min-h-screen text-zinc-900 relative font-sans">
      
      {/* Immersive Light Header */}
      <div className="relative w-full pb-8 bg-white shadow-sm border-b border-zinc-100 rounded-b-[40px]">
        <div className="relative w-full h-[250px] md:h-[350px] rounded-b-[40px] overflow-hidden">
          <img src={heroImage} className="w-full h-full object-cover" alt="Restaurant Cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
          
          <div className="absolute top-6 left-6 right-6 flex justify-between items-center z-10">
            <button onClick={() => router.back()} className="w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-zinc-900 hover:scale-105 transition-transform">
               <ArrowLeft className="w-6 h-6" />
            </button>
            <button className="w-12 h-12 rounded-full bg-white/90 backdrop-blur shadow-lg flex items-center justify-center text-zinc-900 hover:scale-105 transition-transform">
               <Heart className="w-6 h-6" />
            </button>
          </div>
        </div>
        
        <div className="max-w-5xl mx-auto px-8 -mt-16 relative z-20 flex flex-col items-center text-center">
          <div className="w-32 h-32 rounded-3xl bg-white shadow-2xl p-2 mb-6 border border-zinc-100">
             <img src={business.metaData?.logoUrl || heroImage} className="w-full h-full object-cover rounded-2xl" alt="Logo" />
          </div>
          
          <h1 className="text-4xl md:text-5xl font-black mb-3 tracking-tight text-zinc-900">{business.businessName}</h1>
          <p className="text-zinc-500 font-medium text-lg max-w-2xl mx-auto leading-relaxed">
             {business.description || 'Experience the perfect blend of taste and elegance.'}
          </p>
          
          <div className="flex flex-wrap items-center justify-center gap-3 mt-6">
            <span className="px-4 py-2 bg-zinc-100 rounded-full font-bold flex items-center gap-1.5 text-zinc-800">
              <Star className="w-4 h-4 fill-zinc-900"/> {business.rating ? business.rating.toFixed(1) : '4.8'}
            </span>
            <span className="px-4 py-2 bg-zinc-100 rounded-full font-bold text-zinc-800 flex items-center gap-1.5">
              <Info className="w-4 h-4" /> Info
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-3xl mx-auto px-6 mt-8">
        
        {business.metaData?.offers && business.metaData.offers.length > 0 && (
          <div className="mb-10">
            <div className="flex gap-4 overflow-x-auto hide-scrollbar pb-4 -mx-6 px-6 md:mx-0 md:px-0">
              {business.metaData.offers.map((offer: any, idx: number) => (
                <div key={idx} className="shrink-0 w-[280px] p-6 rounded-3xl bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border border-zinc-100 flex flex-col">
                  <h4 className="text-zinc-900 font-black text-2xl tracking-tight">{offer.discount}</h4>
                  <p className="text-zinc-500 font-medium text-sm mt-1">{offer.title}</p>
                  <div className="mt-4 inline-block px-4 py-2 bg-zinc-50 rounded-xl text-zinc-800 font-mono font-bold tracking-widest text-xs self-start">
                    {offer.code}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="sticky top-0 z-30 bg-zinc-50/90 backdrop-blur-xl pt-2 pb-4 -mx-6 px-6 md:mx-0 md:px-0">
          <div className="relative mb-5">
            <Search className="w-6 h-6 absolute left-5 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search menus..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-14 pr-6 py-4 bg-white shadow-[0_8px_30px_rgb(0,0,0,0.04)] border-none rounded-[24px] focus:outline-none focus:ring-2 focus:ring-zinc-900/10 transition-all text-zinc-900 placeholder:text-zinc-400 font-medium text-lg"
            />
          </div>
          
          <div className="flex gap-3 overflow-x-auto hide-scrollbar pb-2">
            <button onClick={() => { setVegFilter(!vegFilter); setNonVegFilter(false); }} className={`shrink-0 px-5 py-2.5 rounded-full border-none text-sm font-bold flex items-center gap-2.5 transition-all shadow-sm ${vegFilter ? 'bg-emerald-100 text-emerald-800' : 'bg-white text-zinc-600 hover:bg-zinc-100'}`}>
               <div className="w-4 h-4 border-2 border-emerald-600 rounded flex items-center justify-center p-[2px]"><div className="w-full h-full bg-emerald-600 rounded-sm" /></div> Veg
            </button>
            <button onClick={() => { setNonVegFilter(!nonVegFilter); setVegFilter(false); }} className={`shrink-0 px-5 py-2.5 rounded-full border-none text-sm font-bold flex items-center gap-2.5 transition-all shadow-sm ${nonVegFilter ? 'bg-rose-100 text-rose-800' : 'bg-white text-zinc-600 hover:bg-zinc-100'}`}>
               <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-rose-600 relative top-[-1px]"></div> Non-Veg
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-10 mt-6 relative pb-32">
          <div className="flex overflow-x-auto gap-4 pb-4 -mx-6 px-6 sticky top-[140px] bg-zinc-50/90 backdrop-blur-xl z-20 hide-scrollbar">
            {categories.map((cat, idx) => (
              <button key={cat} className={`shrink-0 text-2xl font-black transition-colors ${idx === 0 ? 'text-zinc-900' : 'text-zinc-300 hover:text-zinc-500'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="space-y-6">
            {filteredCatalog.map(item => {
              const qty = getQuantity(item.id);
              const isNonVeg = item.metaData?.isNonVeg === true || item.metaData?.dietaryType === 'Non-Veg';
              const hasVariants = item.variants && Array.isArray(item.variants) && item.variants.length > 0;
              
              return (
                <div key={item.id} className="p-5 rounded-[32px] bg-white shadow-[0_8px_40px_rgb(0,0,0,0.03)] border border-zinc-100/50 flex flex-col md:flex-row gap-6 hover:shadow-[0_8px_40px_rgb(0,0,0,0.06)] transition-shadow">
                  {item.mediaUrl && (
                    <div className="relative shrink-0 w-full md:w-[160px] h-[200px] md:h-[160px] rounded-[24px] overflow-hidden">
                      <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" loading="lazy" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0 flex flex-col justify-center">
                    <div className="flex justify-between items-start mb-2">
                       <h4 className="font-black text-zinc-900 text-xl md:text-2xl leading-tight break-words pr-4">{item.title}</h4>
                       <div className={`shrink-0 w-5 h-5 border-2 rounded flex items-center justify-center p-[2px] ${isNonVeg ? 'border-rose-500' : 'border-emerald-500'}`}>
                         {isNonVeg ? (
                           <div className="w-0 h-0 border-l-[5px] border-r-[5px] border-b-[8px] border-l-transparent border-r-transparent border-b-rose-500"></div>
                         ) : (
                           <div className="w-full h-full rounded-sm bg-emerald-500" />
                         )}
                       </div>
                    </div>
                    
                    {item.description && (
                      <p className="text-zinc-500 font-medium text-sm md:text-base leading-relaxed line-clamp-2">{item.description}</p>
                    )}

                    <div className="mt-6 flex flex-wrap items-center justify-between gap-4">
                      {(() => {
                        const customPortions = item.variants && Array.isArray(item.variants) && item.variants.length > 0 && typeof item.variants[0] === 'object' ? item.variants : null;
                        if (customPortions) {
                          const minPrice = Math.min(...customPortions.map((p: any) => Number(p.price)));
                          return (
                            <div className="font-black text-xl text-zinc-900">
                              <span className="text-sm font-bold text-zinc-400">from</span> ${minPrice}
                            </div>
                          );
                        }
                        return (
                          <div className="font-black text-xl text-zinc-900">
                            ${item.price ? Number(item.price).toFixed(2) : '0.00'}
                          </div>
                        );
                      })()}
                      
                      <div className="relative">
                        {qty === 0 ? (
                          <button 
                            onClick={() => handleAddClick(item)}
                            className="px-8 py-3.5 rounded-2xl font-bold text-white bg-zinc-900 hover:bg-zinc-800 shadow-xl shadow-zinc-900/20 hover:shadow-zinc-900/30 transition-all flex items-center gap-2"
                          >
                            <Plus className="w-5 h-5" /> Add
                          </button>
                        ) : (
                          <div className="flex items-center justify-between w-[120px] h-[52px] font-black bg-zinc-100 text-zinc-900 rounded-2xl overflow-hidden">
                            <button onClick={() => updateQuantity(item.id, -1)} className="flex-1 h-full flex items-center justify-center hover:bg-zinc-200 transition-colors"><Minus className="w-5 h-5" /></button>
                            <span className="w-8 text-center text-lg">{qty}</span>
                            <button onClick={() => updateQuantity(item.id, 1)} className="flex-1 h-full flex items-center justify-center hover:bg-zinc-200 transition-colors"><Plus className="w-5 h-5" /></button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            
            {filteredCatalog.length === 0 && (
              <div className="py-20 text-center text-zinc-400 font-medium text-lg">
                No items match your search.
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
