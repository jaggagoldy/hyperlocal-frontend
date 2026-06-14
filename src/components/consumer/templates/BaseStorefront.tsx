'use client';

import { getBlueprintForArchetype } from '@/lib/blueprints';
import { ShoppingCart, Calendar, MessageSquare, IndianRupee, Store, Clock, MapPin } from 'lucide-react';

export default function BaseStorefront({ business }: { business: any }) {
  // Determine capabilities from the business type archetype
  const moduleConfig = getBlueprintForArchetype(business?.businessType);
  const { commerce, scheduling, leadGen, estimation } = moduleConfig;

  // Dynamically render the Floating Call-To-Action (CTA) Based on Active Modules
  const renderFloatingCTA = () => {
    if (commerce) {
      return (
        <button className="w-full py-4 rounded-xl bg-zinc-900 text-white font-black text-lg shadow-[0_8px_20px_rgba(0,0,0,0.2)] flex items-center justify-center gap-3 hover:bg-zinc-800 transition-all hover:-translate-y-1">
          <ShoppingCart className="w-5 h-5" /> 
          <span>Add to Cart</span>
        </button>
      );
    }
    
    if (scheduling) {
      return (
        <button className="w-full py-4 rounded-xl bg-blue-600 text-white font-black text-lg shadow-[0_8px_20px_rgba(37,99,235,0.3)] flex items-center justify-center gap-3 hover:bg-blue-700 transition-all hover:-translate-y-1">
          <Calendar className="w-5 h-5" /> 
          <span>Book Appointment</span>
        </button>
      );
    }
    
    if (leadGen && !estimation) {
      return (
        <button className="w-full py-4 rounded-xl bg-emerald-600 text-white font-black text-lg shadow-[0_8px_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-3 hover:bg-emerald-700 transition-all hover:-translate-y-1">
          <MessageSquare className="w-5 h-5" /> 
          <span>Request Info</span>
        </button>
      );
    }

    if (leadGen && estimation) {
      return (
        <button className="w-full py-4 rounded-xl bg-orange-600 text-white font-black text-lg shadow-[0_8px_20px_rgba(234,88,12,0.3)] flex items-center justify-center gap-3 hover:bg-orange-700 transition-all hover:-translate-y-1">
          <IndianRupee className="w-5 h-5" /> 
          <span>Request Quote</span>
        </button>
      );
    }
    
    return null;
  };

  return (
    <div className="min-h-screen bg-zinc-50 pb-32">
      {/* Universal Hero Header */}
      <div className="relative h-64 bg-zinc-900 overflow-hidden">
        {business?.metaData?.bannerUrl ? (
          <img src={business.metaData.bannerUrl} alt="Cover" className="w-full h-full object-cover opacity-60" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-zinc-800 to-zinc-900"></div>
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/40 to-transparent"></div>
        
        <div className="absolute bottom-6 left-6 right-6 flex items-end gap-6">
          <div className="w-24 h-24 rounded-2xl bg-white p-1.5 shadow-2xl shrink-0">
             <div className="w-full h-full rounded-xl overflow-hidden bg-zinc-100 flex items-center justify-center border border-zinc-200">
               {business?.metaData?.logoUrl ? (
                 <img src={business.metaData.logoUrl} alt="Logo" className="w-full h-full object-cover" />
               ) : (
                 <Store className="w-8 h-8 text-zinc-400" />
               )}
             </div>
          </div>
          <div className="pb-2 text-white">
             <h1 className="text-3xl font-black mb-1">{business?.businessName || 'Business Name'}</h1>
             <div className="flex flex-wrap items-center gap-4 text-sm font-medium text-zinc-300">
                <span className="flex items-center gap-1.5"><MapPin className="w-4 h-4"/> {business?.localityName || 'City Center'}</span>
                <span className="flex items-center gap-1.5"><Clock className="w-4 h-4"/> 9 AM - 10 PM</span>
             </div>
          </div>
        </div>
      </div>

      {/* Dynamic Content Area */}
      <div className="max-w-4xl mx-auto p-6 space-y-8 mt-4">
         <div className="bg-white p-6 rounded-3xl border border-zinc-200 shadow-sm">
            <h2 className="text-xl font-black text-zinc-900 mb-2">About Us</h2>
            <p className="text-zinc-600 leading-relaxed font-medium">
              {business?.description || 'No description provided.'}
            </p>
         </div>

         {/* Catalog / Menu / Services renders here dynamically in the future */}
      </div>

      {/* Universal Floating Dynamic CTA */}
      <div className="fixed bottom-0 left-0 right-0 z-50 bg-white/90 backdrop-blur-xl border-t border-zinc-200 p-6 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
        <div className="max-w-md mx-auto">
          {renderFloatingCTA()}
        </div>
      </div>
    </div>
  );
}
