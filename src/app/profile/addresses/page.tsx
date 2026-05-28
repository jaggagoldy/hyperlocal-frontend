'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, MapPin, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function AddressesPage() {
  const router = useRouter();
  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
          <div className="flex items-center justify-between mb-1">
            <h1 className="text-2xl font-bold text-zinc-900">My Addresses</h1>
            <Button size="sm" variant="outline" className="gap-1.5 rounded-xl" disabled>
              <Plus className="w-4 h-4" />
              Add New
            </Button>
          </div>
          <p className="text-zinc-500 text-sm mb-10">Manage your saved home and work locations</p>

          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
              <MapPin className="w-10 h-10 text-emerald-300" />
            </div>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">No addresses saved</h2>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed mb-4">
              Save your home, work, or other frequent locations to quickly find services nearby.
            </p>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-amber-600 bg-amber-50 px-3 py-1.5 rounded-full border border-amber-200">
              Coming in Phase 2
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
