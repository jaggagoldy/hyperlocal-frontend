'use client';

import Link from 'next/link';
import { ShoppingBag, Plus, Minus, Store } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { CatalogItem } from '@/types/models';

export default function FoodDishCard({ dish }: { dish: CatalogItem & { businessProfile?: any } }) {
  const { cartItems, addItem, updateQuantity } = useCartStore();
  
  const vendor = dish.businessProfile || {};
  const vendorName = vendor.businessName || 'Local Restaurant';
  const vendorSlug = vendor.slug || '';
  
  const inCartItem = cartItems.find(ci => ci.catalogItem.id === dish.id);
  const quantity = inCartItem ? inCartItem.quantity : 0;
  
  const isVeg = dish.metaData?.isVeg !== false; 
  const image = dish.mediaUrl 
    || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=300&h=200';

  const handleAdd = () => {
    addItem(dish, 'TRANSACTIONAL');
  };

  const handleIncrement = () => {
    updateQuantity(dish.id, 1);
  };

  const handleDecrement = () => {
    updateQuantity(dish.id, -1);
  };

  return (
    <div className="group bg-white border border-zinc-200 rounded-3xl p-4 flex gap-4 hover:shadow-lg hover:border-rose-500/20 transition-all duration-300">
      
      {/* Dish Photo */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-2xl overflow-hidden bg-zinc-50 shrink-0 border border-zinc-100">
        <img 
          src={image} 
          alt={dish.title}
          className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
        />
        
        {/* Veg/Non-Veg indicator */}
        <div className="absolute top-2 left-2 bg-white/90 p-1.5 rounded-md shadow-sm border border-zinc-150 flex items-center justify-center">
          <span className={`w-2.5 h-2.5 rounded-full ${isVeg ? 'bg-emerald-600' : 'bg-rose-600'} flex items-center justify-center relative`}>
            <span className={`absolute -inset-0.5 border ${isVeg ? 'border-emerald-600' : 'border-rose-600'} rounded-xs`} />
          </span>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 flex flex-col justify-between min-w-0">
        <div className="space-y-1">
          <h3 className="font-extrabold text-sm sm:text-base text-zinc-950 truncate pr-4">
            {dish.title}
          </h3>
          <p className="text-zinc-500 text-xs line-clamp-2 leading-relaxed">
            {dish.description || 'Delicious freshly prepared dish from our menu.'}
          </p>
          
          {/* Restaurant reference */}
          {vendorSlug && (
            <Link 
              href={`/${vendorSlug}`}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-zinc-400 hover:text-rose-600 transition-colors mt-1"
            >
              <Store className="w-3 h-3" />
              <span className="truncate max-w-[120px] sm:max-w-[180px]">{vendorName}</span>
            </Link>
          )}
        </div>

        <div className="flex items-center justify-between mt-3 pt-2">
          {/* Price */}
          <span className="font-black text-zinc-900 text-base sm:text-lg">
            ₹{dish.price ? parseFloat(dish.price.toString()).toFixed(0) : '0'}
          </span>

          {/* Add / Qty controls */}
          {quantity > 0 ? (
            <div className="flex items-center bg-rose-600 text-white rounded-xl shadow-md border border-rose-700/10 overflow-hidden h-9 px-1">
              <button 
                onClick={handleDecrement}
                className="w-7 h-full flex items-center justify-center hover:bg-rose-700 active:scale-90 rounded-lg transition-all"
              >
                <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
              <span className="w-7 text-center text-xs font-black select-none">{quantity}</span>
              <button 
                onClick={handleIncrement}
                className="w-7 h-full flex items-center justify-center hover:bg-rose-700 active:scale-90 rounded-lg transition-all"
              >
                <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              </button>
            </div>
          ) : (
            <button 
              onClick={handleAdd}
              className="h-9 px-4.5 rounded-xl border border-rose-200 bg-rose-50 hover:bg-rose-600 text-rose-650 hover:text-white font-extrabold text-xs shadow-2xs hover:shadow-md transition-all active:scale-95 flex items-center gap-1"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              Add
            </button>
          )}
        </div>

      </div>

    </div>
  );
}
