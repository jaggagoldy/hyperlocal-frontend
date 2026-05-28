'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, ClipboardList, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function BookingsPage() {
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
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">My Bookings</h1>
          <p className="text-zinc-500 text-sm mb-10">View and manage your service requests</p>

          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-primary/8 flex items-center justify-center mb-5">
              <ClipboardList className="w-10 h-10 text-primary/50" />
            </div>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">No bookings yet</h2>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed mb-8">
              Once you request a service from a professional, your bookings will appear here.
            </p>
            <Link href="/explore">
              <Button className="gap-2 px-6">
                <Search className="w-4 h-4" />
                Explore Services
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
