'use client';

import { useState } from 'react';
import { useCartStore } from '@/store/useCartStore';
import { BusinessProfile, CatalogItem } from '@/types/models';
import BookingModal from './BookingModal';
import { toast } from 'sonner';
import { Sparkles, Check, ChevronRight } from 'lucide-react';

interface BookingLayoutProps {
  vendor: BusinessProfile;
  theme: any;
}

export default function BookingLayout({ vendor, theme }: BookingLayoutProps) {
  const { cartItems, addItem, removeItem } = useCartStore();
  const [isModalOpen, setIsModalOpen] = useState(false);

  const isSelected = (itemId: string) => cartItems.some(ci => ci.catalogItem.id === itemId);

  const toggleSelection = (item: CatalogItem) => {
    if (isSelected(item.id)) {
      removeItem(item.id);
    } else {
      const res = addItem(item, 'BOOKING');
      if (!res.success) toast.error(res.error);
    }
  };

  const catalog = vendor.catalogItems || [];

  if (catalog.length === 0) {
    return <div className="text-zinc-500 p-8 text-center border border-zinc-800 rounded-2xl border-dashed bg-zinc-900/50">No premium services available at the moment.</div>;
  }

  const selectedCount = cartItems.length;

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {catalog.map(item => {
          const selected = isSelected(item.id);
          return (
            <div 
              key={item.id} 
              onClick={() => toggleSelection(item)}
              className={`p-5 rounded-2xl flex items-start gap-5 cursor-pointer transition-all duration-300 ${
                selected 
                  ? 'bg-amber-500/10 border border-amber-500/50 shadow-[0_0_20px_rgba(245,158,11,0.1)]' 
                  : 'bg-zinc-900/80 border border-zinc-800 hover:border-zinc-700 hover:bg-zinc-800/80'
              }`}
            >
              <div className="mt-1 flex-shrink-0">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors border ${
                  selected ? 'bg-amber-500 border-amber-500 text-zinc-950' : 'border-zinc-600 bg-zinc-800'
                }`}>
                  {selected && <Check className="w-4 h-4 font-bold" />}
                </div>
              </div>
              <div className="flex-1">
                <h4 className={`font-bold text-lg leading-tight transition-colors ${selected ? 'text-amber-400' : 'text-zinc-100'}`}>
                  {item.title}
                </h4>
                {item.description && <p className="text-sm text-zinc-400 mt-2 line-clamp-2 leading-relaxed">{item.description}</p>}
                
                <div className="flex items-center justify-between mt-4">
                  <div className="font-extrabold text-[15px] text-zinc-200">
                    ₹{item.price?.toString()} {item.unit && <span className="text-zinc-500 text-xs font-semibold tracking-wide uppercase">/ {item.unit}</span>}
                  </div>
                  
                  {selected && (
                    <span className="text-[10px] font-black uppercase tracking-widest text-amber-500 flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded">
                      <Sparkles className="w-3 h-3" /> Selected
                    </span>
                  )}
                </div>
              </div>
              
              {item.mediaUrl && (
                <div className={`w-[84px] h-[84px] shrink-0 rounded-xl overflow-hidden border transition-colors ${selected ? 'border-amber-500/30' : 'border-zinc-800'}`}>
                  <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" loading="lazy" />
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Floating Action Button for Booking */}
      {selectedCount > 0 && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 w-[90%] max-w-sm z-50 animate-in slide-in-from-bottom-8 duration-300">
          <button 
            onClick={() => setIsModalOpen(true)}
            className="w-full py-4 px-6 rounded-2xl shadow-[0_0_30px_rgba(245,158,11,0.3)] font-extrabold text-lg flex items-center justify-between bg-gradient-to-r from-amber-500 to-amber-600 text-zinc-950 transition-transform active:scale-95"
          >
            <span>Book {selectedCount} Service{selectedCount > 1 ? 's' : ''}</span>
            <div className="w-8 h-8 rounded-full bg-zinc-950/20 flex items-center justify-center backdrop-blur-sm">
              <ChevronRight className="w-5 h-5" />
            </div>
          </button>
        </div>
      )}

      {isModalOpen && (
        <BookingModal 
          vendor={vendor} 
          theme={theme} 
          onClose={() => setIsModalOpen(false)} 
        />
      )}
    </div>
  );
}
