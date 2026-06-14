'use client';

import { MapPin, Clock, Store, ShoppingBag, Search, Filter } from 'lucide-react';
import { BusinessProfile } from '@/types/models';

export default function RetailClassic({ business }: { business: BusinessProfile }) {
  const products = business?.catalogItems || [];

  return (
    <div className="min-h-full bg-white relative pb-32 font-sans">
      {/* Sleek Retail Header */}
      <div className="relative pt-12 pb-6 px-6 bg-zinc-50 border-b border-zinc-100">
        <div className="flex items-center gap-4 mb-6">
          <div className="w-16 h-16 rounded-2xl bg-white shadow-sm border border-zinc-200 flex items-center justify-center overflow-hidden shrink-0">
            {business?.metaData?.logoUrl ? (
              <img src={business.metaData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
            ) : (
              <Store className="w-8 h-8 text-zinc-400" />
            )}
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">{business?.businessName || 'Retail Store'}</h1>
            <p className="text-sm font-medium text-zinc-500 mt-0.5">{business?.description || 'Your neighborhood store.'}</p>
          </div>
        </div>
        
        <div className="flex flex-wrap items-center gap-4 text-xs font-bold text-zinc-500 uppercase tracking-wider">
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-zinc-200">
            <MapPin className="w-3.5 h-3.5 text-zinc-400" /> {(business?.city as any)?.name || (business as any)?.cityName || 'Local Area'}
          </span>
          <span className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-zinc-200">
            <Clock className="w-3.5 h-3.5 text-zinc-400" /> 10:00 AM - 9:00 PM
          </span>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="sticky top-0 z-10 bg-white/80 backdrop-blur-md border-b border-zinc-100 px-6 py-4 flex items-center gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search products..." 
            className="w-full h-11 pl-10 pr-4 bg-zinc-50 border border-zinc-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 transition-all"
          />
        </div>
        <button className="w-11 h-11 bg-zinc-50 border border-zinc-200 rounded-xl flex items-center justify-center shrink-0 hover:bg-zinc-100 transition-colors">
          <Filter className="w-4 h-4 text-zinc-600" />
        </button>
      </div>

      {/* Category Bar */}
      {business?.metaData?.cuisines && business.metaData.cuisines.length > 0 && (
        <div className="px-6 py-4 flex gap-2 overflow-x-auto no-scrollbar border-b border-zinc-100 bg-zinc-50/50">
          {business.metaData.cuisines.map((cat: string) => (
            <button key={cat} className="px-5 py-2 rounded-xl border border-zinc-200 bg-white text-sm font-bold text-zinc-600 whitespace-nowrap hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all shadow-sm">
              {cat}
            </button>
          ))}
        </div>
      )}

      {/* Product Grid */}
      <div className="p-6">
        <div className="grid grid-cols-2 gap-4">
          {products.length > 0 ? (
            products.map((product: any, idx: number) => (
              <div key={idx} className="group cursor-pointer">
                <div className="aspect-square bg-zinc-50 rounded-2xl mb-3 overflow-hidden border border-zinc-100 relative">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShoppingBag className="w-8 h-8 text-zinc-300" />
                    </div>
                  )}
                  {/* Add to cart quick button */}
                  <button className="absolute bottom-3 right-3 w-8 h-8 bg-zinc-900 text-white rounded-full flex items-center justify-center opacity-0 translate-y-2 group-hover:opacity-100 group-hover:translate-y-0 transition-all shadow-lg">
                    <span className="text-lg leading-none font-medium mb-0.5">+</span>
                  </button>
                </div>
                <div>
                  <div className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">{product.foodCategory || 'Product'}</div>
                  <h3 className="text-sm font-bold text-zinc-900 leading-snug mb-1 line-clamp-2">{product.name}</h3>
                  <div className="text-sm font-black text-emerald-600">₹{product.price || 0}</div>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-2 text-center py-12">
              <ShoppingBag className="w-12 h-12 text-zinc-200 mx-auto mb-3" />
              <p className="text-zinc-500 font-medium">No products added yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
