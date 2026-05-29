'use client';

import { useSavedProsStore } from '@/store/useSavedProsStore';
import { ServiceSidebar } from '@/components/shared/ServiceSidebar';
import { Heart, ArrowLeft, Star, MapPin } from 'lucide-react';
import Link from 'next/link';

export default function SavedProsPage() {
  const { savedPros, removePro } = useSavedProsStore();

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link href="/profile" className="p-2 bg-white rounded-full border border-zinc-200 text-zinc-500 hover:text-zinc-900 shadow-sm transition-all">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-zinc-900 tracking-tight flex items-center gap-2">
              <Heart className="w-6 h-6 fill-rose-500 text-rose-500" /> Saved Pros
            </h1>
            <p className="text-zinc-500 text-sm mt-0.5">Your favorite local professionals</p>
          </div>
        </div>

        {/* Content */}
        {savedPros.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center border border-zinc-200 shadow-sm">
            <div className="w-16 h-16 mx-auto bg-zinc-50 rounded-full flex items-center justify-center mb-4">
              <Heart className="w-8 h-8 text-zinc-300" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900">No saved pros yet</h3>
            <p className="text-zinc-500 mt-2 max-w-sm mx-auto">
              When you find a service you like, click the heart icon to save it here for quick access later.
            </p>
            <Link href="/explore" className="inline-flex items-center justify-center h-10 px-6 rounded-xl bg-primary text-white font-bold mt-6 shadow-sm hover:opacity-90">
              Explore Services
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {savedPros.map((pro) => (
              <div key={pro.id} className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm flex items-start gap-4">
                <div className="w-20 h-20 rounded-xl bg-zinc-100 flex-shrink-0 overflow-hidden border border-zinc-200">
                  {pro.mediaUrl ? (
                    <img src={pro.mediaUrl} alt={pro.title} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-zinc-100 text-zinc-400">
                      No Image
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <h3 className="font-bold text-zinc-900 line-clamp-1">
                      {pro.title}
                    </h3>
                    <button 
                      onClick={() => removePro(pro.id)}
                      className="text-zinc-400 hover:text-rose-500 flex-shrink-0"
                    >
                      <Heart className="w-4 h-4 fill-rose-500 text-rose-500" />
                    </button>
                  </div>
                  
                  <div className="flex items-center gap-1.5 mt-1 text-xs text-zinc-500">
                    <Star className="w-3.5 h-3.5 text-amber-400 fill-amber-400" />
                    <span className="font-semibold text-zinc-700">4.8</span>
                    <span>(120)</span>
                  </div>
                  
                  <div className="flex items-center gap-1 text-xs text-zinc-400 mt-2">
                    <MapPin className="w-3 h-3" />
                    <span>Sector 62, Noida</span>
                  </div>

                  <div className="mt-3">
                    <ServiceSidebar item={pro} vendorName={pro.vendor?.businessName || 'the provider'} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
