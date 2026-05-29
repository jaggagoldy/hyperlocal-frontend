'use client';

import { useState, useEffect } from 'react';
import { X, ChevronRight, Sparkles, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TutorialModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [step, setStep] = useState(1);

  useEffect(() => {
    const hasSeenTutorial = localStorage.getItem('tutorial_seen');
    if (!hasSeenTutorial) {
      // Small delay to not immediately block the user
      const timer = setTimeout(() => setIsOpen(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsOpen(false);
    localStorage.setItem('tutorial_seen', 'true');
  };

  const handleNext = () => {
    if (step < 3) {
      setStep(step + 1);
    } else {
      handleClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in-0">
      <div className="bg-white rounded-3xl border border-zinc-200 max-w-sm w-full shadow-2xl overflow-hidden animate-in zoom-in-95">
        <div className="p-4 flex justify-end">
          <button onClick={handleClose} className="p-2 bg-zinc-50 rounded-full text-zinc-400 hover:text-zinc-600">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-8 pb-8 text-center space-y-6">
          {/* Step 1 */}
          {step === 1 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center">
                <MapPin className="w-10 h-10 text-primary" />
              </div>
              <div>
                <h3 className="text-xl font-black text-zinc-900">Welcome to HyperLocal!</h3>
                <p className="text-sm text-zinc-500 mt-2 font-medium">Find the best local professionals near you. Select your city to see tailored services.</p>
              </div>
            </div>
          )}

          {/* Step 2 */}
          {step === 2 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="w-20 h-20 mx-auto bg-amber-500/10 rounded-full flex items-center justify-center">
                <Search className="w-10 h-10 text-amber-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-zinc-900">Zero Commission Fees</h3>
                <p className="text-sm text-zinc-500 mt-2 font-medium">We don't charge any commission. You pay exactly what the service provider asks.</p>
              </div>
            </div>
          )}

          {/* Step 3 */}
          {step === 3 && (
            <div className="space-y-4 animate-in slide-in-from-right-4 duration-300">
              <div className="w-20 h-20 mx-auto bg-emerald-500/10 rounded-full flex items-center justify-center">
                <Sparkles className="w-10 h-10 text-emerald-500" />
              </div>
              <div>
                <h3 className="text-xl font-black text-zinc-900">Connect Instantly</h3>
                <p className="text-sm text-zinc-500 mt-2 font-medium">Browse catalogs, check verified badges, and connect directly via WhatsApp!</p>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between pt-4">
            <div className="flex gap-1.5">
              {[1, 2, 3].map(i => (
                <div key={i} className={`h-1.5 rounded-full transition-all ${step === i ? 'w-6 bg-primary' : 'w-2 bg-zinc-200'}`} />
              ))}
            </div>
            <Button onClick={handleNext} className="rounded-xl px-6 font-bold h-10">
              {step === 3 ? 'Get Started' : 'Next'} <ChevronRight className="w-4 h-4 ml-1" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
