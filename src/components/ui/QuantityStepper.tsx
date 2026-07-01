'use client';

interface QuantityStepperProps {
  qty: number;
  onInc: () => void;
  onDec: () => void;
  min?: number;
}

export function QuantityStepper({ qty, onInc, onDec, min = 0 }: QuantityStepperProps) {
  return (
    <div className="inline-flex items-center gap-1 bg-emerald-600 rounded-full h-8 px-1 min-w-[88px] justify-between">
      <button
        onClick={onDec}
        disabled={qty <= min}
        aria-label="Remove one"
        className="w-6 h-6 rounded-full flex items-center justify-center text-white font-black text-base leading-none disabled:opacity-40 active:scale-90 transition-transform"
      >
        −
      </button>
      <span className="text-white font-black text-sm w-5 text-center">{qty}</span>
      <button
        onClick={onInc}
        aria-label="Add one"
        className="w-6 h-6 rounded-full flex items-center justify-center text-white font-black text-base leading-none active:scale-90 transition-transform"
      >
        +
      </button>
    </div>
  );
}
