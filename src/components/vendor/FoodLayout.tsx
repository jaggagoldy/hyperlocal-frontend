'use client';

import { useState, useMemo } from 'react';
import { Minus, Plus, Search, Star, ArrowLeft } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useCartStore } from '@/store/useCartStore';
import { BusinessProfile, CatalogItem } from '@/types/models';
import CartDrawer from './CartDrawer';
import VariantModal from './VariantModal';
import { toast } from 'sonner';

interface FoodLayoutProps {
  business: BusinessProfile;
  theme: any;
}

export default function FoodLayout({ business, theme }: FoodLayoutProps) {
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

  const categories = ['Recommended', 'Starters', 'Main Course', 'Breads', 'Desserts', 'Beverages'];
  const heroImage = business.media?.filter((m: any) => m.type === 'shop_photo')[0]?.secureUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?auto=format&fit=crop&w=1200&q=80';

  return (
    <div className="w-full bg-white relative">
      <div className="relative w-full h-[250px] md:h-[340px] bg-zinc-900">
        <img src={heroImage} className="w-full h-full object-cover opacity-60" alt="Restaurant Cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        
        <div className="absolute inset-0 max-w-5xl mx-auto px-4 pt-4 pb-6 flex flex-col justify-between">
          <button onClick={() => router.back()} className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white/30 transition-colors">
             <ArrowLeft className="w-6 h-6" />
          </button>
          
          <div className="text-white">
            <h1 className="text-3xl md:text-5xl font-black mb-2 tracking-tight">{business.businessName}</h1>
            <p className="text-zinc-200 text-sm md:text-base font-medium mb-4 flex items-center gap-2">
              <span className="truncate">{business.localityName}</span>
              <span className="text-zinc-400">•</span>
              <span>2.5 km away</span>
            </p>
            <div className="flex flex-wrap gap-2 text-xs md:text-sm font-semibold">
              <span className="px-2.5 py-1.5 bg-green-600 rounded-lg shadow-sm flex items-center gap-1 text-white">
                <Star className="w-3.5 h-3.5 fill-current"/> {business.rating ? business.rating.toFixed(1) : 'NEW'}
              </span>
              <span className="px-3 py-1.5 bg-white/20 rounded-lg backdrop-blur-md">North Indian</span>
              <span className="px-3 py-1.5 bg-white/20 rounded-lg backdrop-blur-md">Chinese</span>
              <span className="px-3 py-1.5 bg-white/20 rounded-lg backdrop-blur-md">Fast Food</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 mt-6">
        <div className="sticky top-0 z-30 bg-white/95 backdrop-blur-md pt-4 pb-4 -mx-4 px-4 md:mx-0 md:px-0 shadow-sm md:shadow-none">
          <div className="relative mb-4">
            <Search className="w-5 h-5 absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400" />
            <input 
              type="text" 
              placeholder="Search for dishes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-12 pr-4 py-3.5 bg-zinc-100/70 border border-zinc-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-rose-500/20 focus:border-rose-500 transition-all font-semibold placeholder:text-zinc-400"
            />
          </div>
          
          <div className="flex gap-3 overflow-x-auto hide-scrollbar">
            <button onClick={() => { setVegFilter(!vegFilter); setNonVegFilter(false); }} className={`shrink-0 px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 transition-colors ${vegFilter ? 'border-green-600 bg-green-50 text-green-700 shadow-sm' : 'border-zinc-200 text-zinc-600 bg-white'}`}>
               <div className="w-3.5 h-3.5 border-2 border-green-600 rounded-sm flex items-center justify-center p-[1px]"><div className="w-full h-full bg-green-600 rounded-full" /></div> Pure Veg
            </button>
            <button onClick={() => { setNonVegFilter(!nonVegFilter); setVegFilter(false); }} className={`shrink-0 px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 transition-colors ${nonVegFilter ? 'border-red-600 bg-red-50 text-red-700 shadow-sm' : 'border-zinc-200 text-zinc-600 bg-white'}`}>
               <div className="w-0 h-0 border-l-[6px] border-r-[6px] border-b-[10px] border-l-transparent border-r-transparent border-b-red-600 relative top-[-1px]"></div> Non-Veg
            </button>
            <button onClick={() => setBestsellerFilter(!bestsellerFilter)} className={`shrink-0 px-4 py-2 rounded-xl border text-sm font-bold flex items-center gap-2 transition-colors ${bestsellerFilter ? 'border-rose-600 bg-rose-50 text-rose-700 shadow-sm' : 'border-zinc-200 text-zinc-600 bg-white'}`}>
               ⭐ Bestsellers
            </button>
          </div>
        </div>

        <div className="flex flex-col md:flex-row gap-8 mt-6 relative">
          <div className="hidden md:block w-64 shrink-0 sticky top-48 h-[calc(100vh-12rem)] overflow-y-auto pr-4 border-r border-zinc-100">
            <ul className="space-y-1 font-semibold text-zinc-500 text-base">
              {categories.map((cat, idx) => (
                <li key={cat} className={`px-4 py-3.5 rounded-xl cursor-pointer transition-colors ${idx === 0 ? 'bg-rose-50 text-rose-600 border-r-4 border-rose-500 font-bold' : 'hover:bg-zinc-50'}`}>
                  {cat}
                </li>
              ))}
            </ul>
          </div>
          
          <div className="md:hidden flex overflow-x-auto gap-2 pb-4 -mx-4 px-4 sticky top-[120px] bg-white/95 backdrop-blur-md z-20 shadow-sm">
            {categories.map((cat, idx) => (
              <button key={cat} className={`shrink-0 px-5 py-2.5 rounded-full text-sm font-bold transition-colors ${idx === 0 ? 'bg-zinc-900 text-white' : 'bg-zinc-100 text-zinc-600'}`}>
                {cat}
              </button>
            ))}
          </div>

          <div className="flex-1 w-full pb-32">
            <div className="space-y-10">
              <div className="space-y-6">
                <h3 className="font-extrabold text-2xl flex items-center gap-2 text-zinc-900">
                  Recommended
                </h3>
                
                <div className="divide-y divide-zinc-100 border-b border-zinc-100">
                  {filteredCatalog.map(item => {
                    const qty = getQuantity(item.id);
                    const isNonVeg = item.metaData?.isNonVeg === true || item.metaData?.dietaryType === 'Non-Veg';
                    const hasVariants = item.variants && Array.isArray(item.variants) && item.variants.length > 0;
                    
                    return (
                      <div key={item.id} className="py-8 flex justify-between gap-6 group">
                        <div className="flex-1 min-w-0 pr-4">
                          <div className={`w-4 h-4 border-2 rounded-sm flex items-center justify-center mb-2.5 p-[1px] ${isNonVeg ? 'border-red-600' : 'border-green-600'}`}>
                            {isNonVeg ? (
                              <div className="w-0 h-0 border-l-[4px] border-r-[4px] border-b-[7px] border-l-transparent border-r-transparent border-b-red-600"></div>
                            ) : (
                              <div className="w-full h-full rounded-full bg-green-600" />
                            )}
                          </div>
                          
                          <h4 className="font-bold text-zinc-900 text-lg leading-tight mb-1">{item.title}</h4>
                          
                          <div className="font-bold mt-1 text-[16px] text-zinc-800">
                            ₹{item.price?.toString()}
                          </div>
                          
                          {hasVariants && (
                             <div className="inline-block mt-2 px-2 py-1 bg-blue-50 text-blue-700 text-[10px] font-black uppercase tracking-wider rounded-md border border-blue-200">
                               Customizable
                             </div>
                          )}

                          {item.description && (
                            <p className="text-zinc-500 text-sm mt-3 line-clamp-2 leading-relaxed">{item.description}</p>
                          )}
                        </div>

                        <div className="relative shrink-0 flex flex-col items-center justify-end w-[140px] h-[140px]">
                          {item.mediaUrl ? (
                            <div className="w-[140px] h-[140px] rounded-2xl overflow-hidden shadow-sm group-hover:shadow-md transition-shadow">
                              <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                            </div>
                          ) : (
                            <div className="w-[140px] h-[140px] rounded-2xl overflow-hidden bg-zinc-100 flex flex-col items-center justify-center text-zinc-400">
                              <span className="font-bold text-sm">No Image</span>
                            </div>
                          )}

                          <div className="absolute -bottom-4 w-[110px] left-1/2 -translate-x-1/2 shadow-[0_4px_14px_rgba(0,0,0,0.1)] rounded-xl overflow-hidden bg-white border border-green-100">
                            {qty === 0 ? (
                              <button 
                                onClick={() => handleAddClick(item)}
                                className="w-full py-2.5 font-black text-[16px] text-green-700 uppercase tracking-wider bg-green-50 hover:bg-green-100 transition-colors"
                              >
                                ADD
                              </button>
                            ) : (
                              <div className="flex items-center justify-between w-full font-bold bg-green-600 text-white">
                                <button onClick={() => updateQuantity(item.id, -1)} className="p-2.5 hover:bg-green-700 transition-colors"><Minus className="w-4 h-4" /></button>
                                <span className="w-8 text-center">{qty}</span>
                                <button onClick={() => updateQuantity(item.id, 1)} className="p-2.5 hover:bg-green-700 transition-colors"><Plus className="w-4 h-4" /></button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
                
                {filteredCatalog.length === 0 && (
                  <div className="py-20 text-center text-zinc-400 font-medium text-lg">
                    No items found matching your filters.
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
