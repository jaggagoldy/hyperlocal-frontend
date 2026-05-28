'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { MapPin, User, ArrowRight, Check } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import { useOnboardingStore } from '@/store/onboardingStore';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

const CITIES = [
  { value: 'dadri', label: 'Dadri' },
  { value: 'greater-noida', label: 'Greater Noida' },
  { value: 'noida', label: 'Noida' },
  { value: 'delhi', label: 'Delhi' },
  { value: 'gurgaon', label: 'Gurgaon' },
  { value: 'faridabad', label: 'Faridabad' },
];

export default function OnboardingPage() {
  const router = useRouter();
  const { user, token, setAuth } = useAuthStore();
  const { markOnboarded } = useOnboardingStore();

  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);
  const [name, setName] = useState(user?.name || '');
  const [city, setCity] = useState('');
  const [area, setArea] = useState('');

  const progress = step === 1 ? 50 : 100;

  const handleStep1 = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Please enter your name.');
    setLoading(true);
    try {
      const res = await apiClient.put('/users/me', { name: name.trim() });
      const updatedUser = res.data?.data || res.data;
      if (token) setAuth(token, { ...user!, ...updatedUser, name: name.trim() });
      setStep(2);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = async () => {
    markOnboarded();
    router.push('/explore');
  };

  const handleSkip = () => {
    markOnboarded();
    router.push('/explore');
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Top gradient strip */}
      <div className="h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />

      {/* Progress bar */}
      <div className="bg-white border-b border-zinc-100 px-6 py-4">
        <div className="max-w-md mx-auto">
          <div className="flex items-center justify-between text-xs font-semibold text-zinc-400 mb-2">
            <span>Step {step} of 2</span>
            <span>{progress}% complete</span>
          </div>
          <div className="h-1.5 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex items-center justify-center px-6 py-12">
        <div className="w-full max-w-md">

          {/* Step indicators */}
          <div className="flex items-center gap-3 mb-10">
            {[1, 2].map((s) => (
              <div key={s} className="flex items-center gap-2">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  s < step
                    ? 'bg-emerald-500 text-white'
                    : s === step
                    ? 'bg-primary text-white'
                    : 'bg-zinc-200 text-zinc-400'
                }`}>
                  {s < step ? <Check className="w-3.5 h-3.5" /> : s}
                </div>
                {s < 2 && (
                  <div className={`h-0.5 w-12 rounded-full transition-all ${s < step ? 'bg-emerald-500' : 'bg-zinc-200'}`} />
                )}
              </div>
            ))}
          </div>

          {/* STEP 1: Name */}
          {step === 1 && (
            <form onSubmit={handleStep1} className="space-y-8">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-primary/10 flex items-center justify-center mb-5">
                  <User className="w-7 h-7 text-primary" />
                </div>
                <h1 className="text-3xl font-bold text-zinc-900 mb-2 leading-tight">
                  What should we call you?
                </h1>
                <p className="text-zinc-500 text-base leading-relaxed">
                  This is how your name will appear to service professionals you connect with.
                </p>
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-semibold text-zinc-700">Your full name</label>
                <Input
                  type="text"
                  placeholder="e.g. Rahul Sharma"
                  className="h-14 text-base bg-white border-zinc-200 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  autoFocus
                />
              </div>

              <Button
                type="submit"
                className="w-full h-13 text-base font-semibold gap-2 rounded-xl"
                style={{ height: '52px' }}
                disabled={loading || !name.trim()}
              >
                {loading ? 'Saving...' : (
                  <>
                    Continue
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </Button>
            </form>
          )}

          {/* STEP 2: Location */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 flex items-center justify-center mb-5">
                  <MapPin className="w-7 h-7 text-emerald-600" />
                </div>
                <h1 className="text-3xl font-bold text-zinc-900 mb-2 leading-tight">
                  Where are you located?
                </h1>
                <p className="text-zinc-500 text-base leading-relaxed">
                  We'll show you the best service professionals near you.
                </p>
              </div>

              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700">Your city</label>
                  <select
                    className="w-full h-14 px-4 rounded-xl border border-zinc-200 text-base bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary font-medium appearance-none"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                  >
                    <option value="">Select your city...</option>
                    {CITIES.map((c) => (
                      <option key={c.value} value={c.value}>{c.label}</option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700">
                    Area / Locality
                    <span className="ml-1 text-xs font-normal text-zinc-400">(optional)</span>
                  </label>
                  <Input
                    type="text"
                    placeholder="e.g. Sector 62, Alpha 1..."
                    className="h-14 text-base bg-white border-zinc-200 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary rounded-xl"
                    value={area}
                    onChange={(e) => setArea(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Button
                  onClick={handleFinish}
                  className="w-full h-[52px] text-base font-semibold gap-2 rounded-xl"
                  disabled={!city}
                >
                  Start Exploring
                  <ArrowRight className="w-4 h-4" />
                </Button>

                <button
                  type="button"
                  onClick={handleSkip}
                  className="w-full py-3 text-sm text-zinc-400 hover:text-zinc-600 font-medium transition-colors"
                >
                  Skip for now
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
