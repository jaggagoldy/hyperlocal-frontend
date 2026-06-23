'use client';

import Link from 'next/link';
import { ShoppingCart, Plus, Minus, Store, Tag } from 'lucide-react';
import { useCartStore } from '@/store/useCartStore';
import { CatalogItem } from '@/types/models';

export default function RetailProductCard({ product }: { product: CatalogItem & { businessProfile?: any } }) {
  const { cartItems, addItem, updateQuantity } = useCartStore();
  
  const vendor = product.businessProfile || {};
  const vendorName = vendor.businessName || 'Local Store';
  const vendorSlug = vendor.slug || '';
  
  const inCartItem = cartItems.find(ci => ci.catalogItem.id === product.id);
  const quantity = inCartItem ? inCartItem.quantity : 0;
  
  const image = product.mediaUrl 
    || 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=300&h=200';

  const discountPercent = product.metaData?.discountPercent || 0;
  const originalPrice = product.metaData?.originalPrice || null;

  const handleAdd = () => {
    addItem(product, 'TRANSACTIONAL');
  };

  const handleIncrement = () => {
    updateQuantity(product.id, 1);
  };

  const handleDecrement = () => {
    updateQuantity(product.id, -1);
  };

  return (
    <div className="group bg-white border border-zinc-200 rounded-3xl p-4 flex flex-col justify-between hover:shadow-lg hover:border-cyan-500/20 transition-all duration-300">
      
      <div>
        {/* Product Photo */}
        <div className="relative w-full aspect-square rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100 mb-3.5">
          <img 
            src={image} 
            alt={product.title}
            className="w-full h-full object-cover group-hover:scale-102 transition-transform duration-500"
          />
          
          {/* Discount Badge */}
          {discountPercent > 0 && (
            <div className="absolute top-2.5 right-2.5 bg-rose-600/90 text-white font-extrabold text-[9px] px-2 py-0.5 rounded-md shadow-sm border border-rose-500/10 flex items-center gap-0.5">
              <Tag className="w-2.5 h-2.5" />
              {discountPercent}% OFF
            </div>
          )}
        </div>

        {/* Details */}
        <div className="space-y-1">
          <h3 className="font-extrabold text-sm sm:text-base text-zinc-950 truncate">
            {product.title}
          </h3>
          <p className="text-zinc-550 text-[11px] line-clamp-2 leading-snug">
            {product.description || 'Quality product available at your local store.'}
          </p>
          
          {/* Store Name reference */}
          {vendorSlug && (
            <Link 
              href={`/${vendorSlug}`}
              className="inline-flex items-center gap-1 text-[10px] font-bold text-zinc-400 hover:text-cyan-600 transition-colors mt-2"
            >
              <Store className="w-3 h-3" />
              <span className="truncate max-w-[150px]">{vendorName}</span>
            </Link>
          )}
        </div>
      </div>

      <div className="flex items-center justify-between mt-4 pt-3 border-t border-zinc-50">
        {/* Prices */}
        <div className="flex flex-col">
          <span className="font-black text-zinc-900 text-base sm:text-lg">
            ₹{product.price ? parseFloat(product.price.toString()).toFixed(0) : '0'}
          </span>
          {originalPrice && (
            <span className="text-[10px] text-zinc-400 font-medium line-through">
              ₹{originalPrice}
            </span>
          )}
        </div>

        {/* Add / Qty controls */}
        {quantity > 0 ? (
          <div className="flex items-center bg-zinc-900 text-white rounded-xl shadow-md border border-zinc-950 overflow-hidden h-9 px-1">
            <button 
              onClick={handleDecrement}
              className="w-7 h-full flex items-center justify-center hover:bg-zinc-800 active:scale-90 rounded-lg transition-all"
            >
              <Minus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
            <span className="w-7 text-center text-xs font-black select-none">{quantity}</span>
            <button 
              onClick={handleIncrement}
              className="w-7 h-full flex items-center justify-center hover:bg-zinc-800 active:scale-90 rounded-lg transition-all"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
            </button>
          </div>
        ) : (
          <button 
            onClick={handleAdd}
            className="h-9 px-4.5 rounded-xl border border-zinc-200 bg-zinc-50 hover:bg-zinc-900 text-zinc-700 hover:text-white font-extrabold text-xs shadow-2xs hover:shadow-md transition-all active:scale-95 flex items-center gap-1.5"
          >
            <ShoppingCart className="w-3.5 h-3.5" />
            Add
          </button>
        )}
      </div>

    </div>
  );
}
