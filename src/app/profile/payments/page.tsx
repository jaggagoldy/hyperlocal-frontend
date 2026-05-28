'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, CreditCard, Lock } from 'lucide-react';

export default function PaymentsPage() {
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
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Payments</h1>
          <p className="text-zinc-500 text-sm mb-10">Manage your saved payment methods</p>

          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="w-20 h-20 rounded-2xl bg-blue-50 flex items-center justify-center mb-5">
              <CreditCard className="w-10 h-10 text-blue-300" />
            </div>
            <h2 className="text-xl font-bold text-zinc-800 mb-2">No payment methods yet</h2>
            <p className="text-zinc-500 text-sm max-w-xs leading-relaxed mb-6">
              Securely save UPI IDs, cards, or net banking for faster checkout when booking services.
            </p>
            <div className="flex items-center gap-2 text-xs font-semibold text-zinc-500 bg-zinc-50 px-4 py-2.5 rounded-xl border border-zinc-200">
              <Lock className="w-3.5 h-3.5" />
              256-bit encrypted · Coming in Phase 2
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
