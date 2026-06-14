'use client';

import { MapPin, ShoppingBag, Search, Heart, User, Filter, ArrowRight } from 'lucide-react';
import { BusinessProfile } from '@/types/models';

export default function RetailFashion({ business }: { business: BusinessProfile }) {
  const products = business?.catalog || [];

  return (
    <div className="min-h-full bg-[#FAFAFA] relative pb-32 font-serif text-zinc-900">
      {/* Fashion Header */}
      <div className="pt-12 px-6 pb-6 text-center border-b border-zinc-200 bg-white">
        <h1 className="text-3xl font-light tracking-widest uppercase mb-2">
          {business?.businessName || 'LUMIÈRE'}
        </h1>
        <p className="text-xs tracking-[0.2em] text-zinc-500 uppercase">
          {(business?.city as any)?.name || (business as any)?.cityName || 'PARIS'} • BOUTIQUE
        </p>
      </div>

      {/* Hero Image (First product or generic) */}
      <div className="relative h-[60vh] bg-zinc-200 overflow-hidden">
        {products[0]?.imageUrl ? (
          <img src={products[0].imageUrl} alt="Featured" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-zinc-100 text-zinc-300">
             <ShoppingBag className="w-16 h-16 mb-4" />
             <p className="font-sans text-xs uppercase tracking-widest">No Featured Items</p>
          </div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent flex items-end p-8">
          <div className="text-white w-full flex justify-between items-end">
            <div>
              <h2 className="text-sm tracking-widest uppercase mb-1">New Collection</h2>
              <p className="text-3xl font-light">{products[0]?.name || 'Signature Series'}</p>
            </div>
            <button className="w-12 h-12 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/40 text-white hover:bg-white hover:text-black transition-all">
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>

      {/* Sticky Filter Bar */}
      <div className="sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-zinc-200 px-6 py-4 flex items-center justify-between font-sans">
        <div className="flex gap-6 overflow-x-auto no-scrollbar text-xs font-semibold uppercase tracking-widest text-zinc-500">
          {((business?.metaData as any)?.cuisines?.length > 0 ? (business.metaData as any).cuisines : ['Women', 'Men', 'Accessories']).map((cat: string, idx: number) => (
            <button key={idx} className={`shrink-0 hover:text-black transition-colors ${idx === 0 ? 'text-black border-b-2 border-black pb-1' : ''}`}>{cat}</button>
          ))}
        </div>
        <button className="shrink-0">
          <Filter className="w-4 h-4 text-zinc-800" />
        </button>
      </div>

      {/* Masonry-style Grid */}
      <div className="p-4 grid grid-cols-2 gap-4">
        {products.map((product: any, idx: number) => (
          <div key={idx} className={`group cursor-pointer flex flex-col ${idx % 3 === 0 ? 'col-span-2' : 'col-span-1'}`}>
            <div className={`relative bg-zinc-100 overflow-hidden ${idx % 3 === 0 ? 'aspect-[4/3]' : 'aspect-[3/4]'}`}>
              {product.imageUrl ? (
                <img src={product.imageUrl} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-zinc-50">
                  <span className="text-zinc-300 font-sans text-xs tracking-widest uppercase">Image</span>
                </div>
              )}
              {/* Like Button overlay */}
              <button className="absolute top-3 right-3 p-2 text-zinc-400 hover:text-red-500 transition-colors">
                <Heart className="w-5 h-5" />
              </button>
            </div>
            
            <div className="py-4 px-1 flex flex-col flex-1 justify-between font-sans">
              <div>
                <h3 className="text-sm font-medium text-zinc-900 leading-snug line-clamp-2 mb-1">{product.name}</h3>
              </div>
              <div className="flex items-center justify-between mt-3">
                <div className="text-sm font-bold text-zinc-900">₹{product.price || 0}</div>
                <button className="text-xs font-bold uppercase tracking-wider border-b border-black pb-0.5 hover:text-zinc-500 transition-colors">
                  Add
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Bottom Nav Placeholder for the fashion aesthetic */}
      <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-zinc-200 px-8 py-4 flex items-center justify-between z-20">
         <Search className="w-6 h-6 text-zinc-900" />
         <div className="relative">
           <ShoppingBag className="w-6 h-6 text-zinc-900" />
           <div className="absolute -top-1 -right-1 w-4 h-4 bg-black text-white text-[10px] rounded-full flex items-center justify-center font-sans font-bold">2</div>
         </div>
         <User className="w-6 h-6 text-zinc-900" />
      </div>
    </div>
  );
}
