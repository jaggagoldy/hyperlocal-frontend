'use client';

import { Search, ShoppingCart, Cpu, Gamepad2, Monitor, Headphones, User, ChevronRight } from 'lucide-react';
import { BusinessProfile } from '@/types/models';

export default function RetailTech({ business }: { business: BusinessProfile }) {
  const products = business?.catalog || [];

  return (
    <div className="min-h-full bg-zinc-950 relative pb-32 font-sans text-zinc-300">
      {/* Cyber Header */}
      <div className="pt-12 px-6 pb-6 bg-zinc-950 border-b border-zinc-900 sticky top-0 z-10">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
             <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-purple-600 p-0.5">
                <div className="w-full h-full bg-zinc-950 rounded-[10px] flex items-center justify-center">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                </div>
             </div>
             <div>
               <h1 className="text-xl font-black text-white tracking-wider uppercase font-mono">{business?.businessName || 'CyberVault'}</h1>
             </div>
          </div>
          <div className="relative">
             <ShoppingCart className="w-6 h-6 text-cyan-400" />
             <div className="absolute -top-1 -right-1 w-4 h-4 bg-purple-500 text-white text-[10px] rounded-full flex items-center justify-center font-bold">1</div>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative group">
          <Search className="w-4 h-4 text-cyan-500 absolute left-4 top-1/2 -translate-y-1/2 group-focus-within:text-cyan-400" />
          <input 
            type="text" 
            placeholder="Search tech & gaming gifts..." 
            className="w-full h-11 pl-10 pr-4 bg-zinc-900 border border-zinc-800 rounded-xl text-sm font-semibold text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/50 transition-all placeholder:text-zinc-600"
          />
        </div>
      </div>

      {/* Cyber Categories */}
      <div className="px-6 py-6 border-b border-zinc-900">
        <h2 className="text-xs font-bold text-zinc-500 tracking-widest uppercase mb-4">Shop by Category</h2>
        <div className="flex gap-4 overflow-x-auto no-scrollbar">
          {((business?.metaData as any)?.cuisines?.length > 0 ? (business.metaData as any).cuisines : ['Displays', 'Gaming', 'Audio']).map((cat: string, idx: number) => (
            <div key={idx} className="flex flex-col items-center gap-2 shrink-0 group cursor-pointer">
              <div className="w-16 h-16 rounded-full border border-zinc-800 bg-zinc-900 flex items-center justify-center group-hover:border-cyan-500/50 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.2)] transition-all">
                 <span className="text-cyan-400 font-bold text-xl uppercase font-mono">{cat.charAt(0)}</span>
              </div>
              <span className="text-[10px] font-semibold text-zinc-400 group-hover:text-cyan-400 transition-colors uppercase tracking-wider">{cat}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Tech Product Grid */}
      <div className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-bold text-white tracking-widest uppercase">Latest Drops</h2>
          <button className="text-xs font-bold text-cyan-500 flex items-center hover:text-cyan-400 transition-colors">
            View All <ChevronRight className="w-3 h-3 ml-0.5" />
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          {products.map((product: any, idx: number) => (
            <div key={idx} className="bg-zinc-900 rounded-2xl border border-zinc-800 p-3 flex flex-col cursor-pointer group hover:border-cyan-500/30 transition-colors relative overflow-hidden">
              {/* Neon Glow Effect on Hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/5 to-purple-500/5 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              
              <div className="aspect-square bg-zinc-950 rounded-xl mb-3 overflow-hidden relative border border-zinc-800 group-hover:border-zinc-700 transition-colors p-2">
                {product.imageUrl ? (
                  <img src={product.imageUrl} alt={product.name} className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-500" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Monitor className="w-8 h-8 text-zinc-800" />
                  </div>
                )}
              </div>
              
              <div className="flex flex-col flex-1 relative z-10">
                <h3 className="text-xs font-bold text-zinc-300 leading-snug mb-2 line-clamp-2 uppercase font-mono">{product.name}</h3>
                
                <div className="mt-auto flex items-center justify-between">
                  <div className="text-sm font-black text-white">${product.price || 0}</div>
                  <button className="text-[10px] font-bold text-cyan-400 border border-cyan-500/30 bg-cyan-500/10 px-3 py-1 rounded-full uppercase tracking-wider hover:bg-cyan-500 hover:text-zinc-950 transition-colors">
                    Buy
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Cyber Bottom Nav */}
      <div className="fixed bottom-0 left-0 right-0 bg-zinc-950 border-t border-zinc-900 px-8 py-4 flex items-center justify-between z-20">
         <div className="flex flex-col items-center gap-1 cursor-pointer">
           <Cpu className="w-5 h-5 text-cyan-400" />
           <span className="text-[9px] font-bold text-cyan-400 uppercase tracking-widest">Home</span>
         </div>
         <div className="flex flex-col items-center gap-1 cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
           <Search className="w-5 h-5 text-white" />
           <span className="text-[9px] font-bold text-white uppercase tracking-widest">Browse</span>
         </div>
         <div className="flex flex-col items-center gap-1 cursor-pointer opacity-50 hover:opacity-100 transition-opacity">
           <User className="w-5 h-5 text-white" />
           <span className="text-[9px] font-bold text-white uppercase tracking-widest">Profile</span>
         </div>
      </div>
    </div>
  );
}
