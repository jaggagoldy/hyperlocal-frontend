import { useState } from 'react';
import { X } from 'lucide-react';
import { CatalogItem } from '@/types/models';

interface VariantModalProps {
  item: CatalogItem;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (item: CatalogItem, variant: any) => void;
}

export default function VariantModal({ item, isOpen, onClose, onAdd }: VariantModalProps) {
  // In a real implementation, you'd parse `item.variants` JSON.
  // We'll mock the extraction here for the UI.
  const variants = item.variants as any[] || [
    { id: 'v1', name: 'Half Plate', priceAdd: 0 },
    { id: 'v2', name: 'Full Plate', priceAdd: 50 },
  ];
  
  const [selectedVariant, setSelectedVariant] = useState(variants[0]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[70] bg-black/60 flex items-end sm:items-center justify-center p-0 sm:p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-lg rounded-t-3xl sm:rounded-2xl flex flex-col overflow-hidden animate-in slide-in-from-bottom-10 sm:zoom-in-95">
        <div className="p-5 border-b border-zinc-100 flex justify-between items-center bg-white sticky top-0">
          <div className="flex flex-col">
            <h2 className="font-extrabold text-xl text-zinc-900 leading-tight">Customize</h2>
            <p className="text-zinc-500 font-medium text-sm">{item.title}</p>
          </div>
          <button onClick={onClose} className="p-2 bg-zinc-100 rounded-full hover:bg-zinc-200 transition-colors text-zinc-600">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <div className="p-5 space-y-6 max-h-[60vh] overflow-y-auto">
          <div>
            <h3 className="font-bold text-zinc-900 text-lg mb-4 flex items-center justify-between">
              Portion Size
              <span className="text-xs font-semibold bg-zinc-100 text-zinc-600 px-2 py-1 rounded">REQUIRED</span>
            </h3>
            
            <div className="space-y-3">
              {variants.map(v => {
                const isSelected = selectedVariant.id === v.id;
                return (
                  <label key={v.id} className={`flex items-center justify-between p-4 border rounded-xl cursor-pointer transition-colors ${isSelected ? 'border-green-600 bg-green-50/50' : 'border-zinc-200 hover:border-zinc-300'}`}>
                    <div className="flex items-center gap-3">
                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${isSelected ? 'border-green-600' : 'border-zinc-300'}`}>
                        {isSelected && <div className="w-2.5 h-2.5 bg-green-600 rounded-full" />}
                      </div>
                      <span className={`font-semibold ${isSelected ? 'text-green-800' : 'text-zinc-700'}`}>{v.name}</span>
                    </div>
                    <span className="font-bold text-zinc-900">
                      {v.priceAdd > 0 ? `+₹${v.priceAdd}` : `₹${item.price}`}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>
        </div>

        <div className="p-5 border-t border-zinc-100 bg-white pb-safe shadow-[0_-10px_20px_rgba(0,0,0,0.02)]">
          <button 
            onClick={() => onAdd(item, selectedVariant)}
            className="w-full py-4 rounded-xl font-black text-lg flex justify-between items-center px-6 bg-green-600 text-white shadow-lg shadow-green-600/20 active:scale-[0.98] transition-transform"
          >
            <span>Add item to cart</span>
            <span>₹{(Number(item.price || 0) + (selectedVariant.priceAdd || 0)).toString()}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
