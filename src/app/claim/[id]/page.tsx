'use client';

import { useState } from 'react';
import { useParams, useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { toast } from 'sonner';
import { ShieldCheck, Phone, ArrowRight, Loader2 } from 'lucide-react';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';

/**
 * Phase F claim flow: "Is this your business? Claim it." Sends a WhatsApp OTP to the
 * listed (or owner-asserted) phone, verifies it, assigns ownership, and routes the
 * new vendor to their dashboard. Requires the visitor to be logged in.
 */
export default function ClaimPage() {
  const { id } = useParams<{ id: string }>();
  const search = useSearchParams();
  const router = useRouter();
  const token = useAuthStore((s) => s.token);

  const name = search.get('name') || 'this listing';
  const [step, setStep] = useState<'start' | 'code'>('start');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [masked, setMasked] = useState('');
  const [loading, setLoading] = useState(false);

  if (!token) {
    return (
      <Shell>
        <h1 className="text-xl font-black text-zinc-900">Claim {name}</h1>
        <p className="mt-2 text-sm font-medium text-zinc-500">Please log in to claim and manage this listing.</p>
        <Link href="/vendor/login" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-bold text-white hover:bg-emerald-700">
          Log in to continue <ArrowRight className="h-4 w-4" />
        </Link>
      </Shell>
    );
  }

  const initiate = async () => {
    setLoading(true);
    try {
      const res = await apiClient.post(`/business/${id}/claim/initiate`, phone ? { phone } : {});
      const data = res.data?.data;
      setMasked(data?.maskedPhone || '');
      setStep('code');
      if (data?.devCode) toast.message(`Dev code: ${data.devCode}`);
      else if (data?.sent) toast.success(`Code sent on WhatsApp to ${data?.maskedPhone}`);
      else toast.warning('Could not send automatically — please contact support.');
    } catch {
      /* api-client surfaces the error toast */
    } finally {
      setLoading(false);
    }
  };

  const verify = async () => {
    setLoading(true);
    try {
      await apiClient.post(`/business/${id}/claim/verify`, { code });
      toast.success('Listing claimed! Welcome aboard.');
      router.push('/vendor-dashboard');
    } catch {
      /* error toast handled globally */
    } finally {
      setLoading(false);
    }
  };

  return (
    <Shell>
      <div className="mb-4 inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-700">
        <ShieldCheck className="h-4 w-4" /> Verify ownership
      </div>
      <h1 className="text-xl font-black text-zinc-900">Claim {name}</h1>

      {step === 'start' ? (
        <>
          <p className="mt-2 text-sm font-medium text-zinc-500">
            We&apos;ll send a one-time code on WhatsApp to verify you own this business. Leave the field blank to use the number listed on the business.
          </p>
          <label className="mt-5 block text-xs font-bold text-zinc-700">Your WhatsApp number (optional)</label>
          <div className="mt-1.5 flex items-center gap-2 rounded-xl border border-zinc-200 bg-zinc-50 px-3 focus-within:border-emerald-500">
            <Phone className="h-4 w-4 text-zinc-400" />
            <input
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="e.g. 98xxxxxxxx"
              className="h-11 flex-1 bg-transparent text-sm font-semibold outline-none"
            />
          </div>
          <button onClick={initiate} disabled={loading} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <>Send verification code <ArrowRight className="h-4 w-4" /></>}
          </button>
        </>
      ) : (
        <>
          <p className="mt-2 text-sm font-medium text-zinc-500">Enter the 6-digit code{masked ? ` sent to ${masked}` : ''}.</p>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            inputMode="numeric"
            placeholder="••••••"
            className="mt-5 w-full rounded-xl border border-zinc-200 bg-zinc-50 px-4 py-3 text-center text-2xl font-black tracking-[0.5em] outline-none focus:border-emerald-500"
          />
          <button onClick={verify} disabled={loading || code.length !== 6} className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-bold text-white hover:bg-emerald-700 disabled:opacity-60">
            {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Verify & claim'}
          </button>
          <button onClick={() => setStep('start')} className="mt-3 w-full text-center text-xs font-semibold text-zinc-500 hover:text-zinc-800">
            Use a different number
          </button>
        </>
      )}
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-zinc-50 px-4 py-10">
      <div className="mx-auto max-w-md rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm">{children}</div>
    </div>
  );
}
