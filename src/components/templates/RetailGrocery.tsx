'use client';

import { MapPin, Search, Filter, Plus, ShoppingCart, Apple, Car, Clock } from 'lucide-react';
import { BusinessProfile } from '@/types/models';

export default function RetailGrocery({ business }: { business: BusinessProfile }) {
  const products = business?.catalog || [];

  return (
    <div className="min-h-full bg-white relative pb-32 font-sans">
      {/* Grocery Header */}
      <div className="pt-10 px-4 pb-4 bg-emerald-600 text-white rounded-b-[2rem] shadow-sm relative z-10">
        <div className="flex items-center justify-between mb-6">
          <div>
            <p className="text-emerald-100 text-xs font-semibold uppercase tracking-wider mb-0.5">Delivery in 15 mins</p>
            <div className="flex items-center gap-1.5 text-white">
              <h1 className="text-lg font-black">{business?.businessName || 'FreshMart'}</h1>
              <MapPin className="w-4 h-4 text-emerald-300" />
            </div>
          </div>
          <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center relative shadow-inner">
             <img src="https://ui-avatars.com/api/?name=FM&background=10b981&color=fff" alt="Logo" className="w-full h-full rounded-full" />
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="w-5 h-5 text-zinc-400 absolute left-4 top-1/2 -translate-y-1/2" />
          <input 
            type="text" 
            placeholder="Search groceries..." 
            className="w-full h-12 pl-12 pr-4 bg-white rounded-2xl text-sm font-semibold text-zinc-900 shadow-md focus:outline-none"
          />
          <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-zinc-100 rounded-xl flex items-center justify-center">
            <Filter className="w-4 h-4 text-zinc-600" />
          </button>
        </div>
      </div>

      {/* Category Pills */}
      <div className="px-4 py-6 flex gap-3 overflow-x-auto no-scrollbar border-b border-zinc-100">
        {((business?.metaData as any)?.cuisines?.length > 0 ? (business.metaData as any).cuisines : ['Fruits', 'Veggies', 'Dairy', 'Bakery', 'Meat']).map((cat: string, idx: number) => (
          <div key={idx} className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer">
            <div className="w-14 h-14 bg-emerald-50 rounded-2xl flex items-center justify-center group-hover:scale-105 transition-transform border border-emerald-100 text-emerald-600 shadow-sm">
               <span className="text-xl font-bold">{cat.charAt(0)}</span>
            </div>
            <span className="text-xs font-bold text-zinc-700">{cat}</span>
          </div>
        ))}
      </div>

      {/* Product Grid */}
      <div className="p-4">
        <h2 className="text-lg font-black text-zinc-900 mb-4">Trending Near You</h2>
        <div className="grid grid-cols-2 gap-x-3 gap-y-4">
          {products.map((product: any, idx: number) => (
            <div key={idx} className="bg-white rounded-2xl border border-zinc-100 shadow-sm p-3 flex flex-col cursor-pointer relative overflow-hidden group hover:border-emerald-200 transition-colors">
              <div className="absolute top-2 left-2 bg-blue-100 text-blue-700 text-[10px] font-bold px-2 py-0.5 rounded-md z-10">
                {product.foodCategory || 'Dairy'}
              </div>
              <div className="aspect-square bg-zinc-50 rounded-xl mb-3 overflow-hidden p-4 relative">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Apple className="w-8 h-8 text-zinc-200" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col flex-1">
                <h3 className="text-sm font-bold text-zinc-800 leading-snug mb-1 line-clamp-2">{product.name}</h3>
                <p className="text-xs text-zinc-500 mb-2">1 {product.unit || 'unit'}</p>
                
                <div className="mt-auto flex items-center justify-between">
                  <div className="text-sm font-black text-zinc-900">₹{product.price || 0}</div>
                  <button className="w-8 h-8 bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-colors">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Floating Bottom Nav */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-sm bg-zinc-900 text-white rounded-2xl shadow-xl p-4 flex items-center justify-between z-20">
         <div className="flex items-center gap-3">
           <div className="relative">
             <ShoppingCart className="w-6 h-6 text-emerald-400" />
             <div className="absolute -top-2 -right-2 w-5 h-5 bg-emerald-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold border-2 border-zinc-900">3</div>
           </div>
           <div>
             <p className="text-xs text-zinc-400 font-semibold uppercase tracking-wider">3 items</p>
             <p className="text-sm font-bold">₹1,450</p>
           </div>
         </div>
         <button className="bg-emerald-500 hover:bg-emerald-400 text-white text-sm font-bold px-5 py-2.5 rounded-xl transition-colors">
           Checkout
         </button>
      </div>
    </div>
  );
}
