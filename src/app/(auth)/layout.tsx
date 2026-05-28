import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen bg-background">
      {/* Left Pane - Marketing Visual (Hidden on Mobile) */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-900 overflow-hidden flex-col justify-between p-12">
        {/* Abstract Gradient Background */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-purple-600 to-fuchsia-600 blur-[120px]" />
          <div className="absolute top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tl from-rose-500 to-orange-500 blur-[120px]" />
        </div>
        
        {/* Glassmorphism Overlay */}
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

        {/* Content */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold text-lg tracking-tight">HyperLocal Go</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <h1 className="text-5xl font-bold tracking-tight text-white leading-[1.1]">
            Your city's best services, instantly.
          </h1>
          <p className="text-lg text-white/70 leading-relaxed font-medium">
            Join thousands of users finding verified professionals for home repairs, events, and personal care within minutes.
          </p>
          
          <div className="flex items-center gap-4 pt-8">
            <div className="flex -space-x-3">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="w-10 h-10 rounded-full border-2 border-zinc-900 bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-xs font-bold text-white shadow-sm">
                  {['JD', 'AM', 'SK', 'RK'][i-1]}
                </div>
              ))}
            </div>
            <div className="text-sm font-medium text-white/80">
              <span className="text-white font-bold">10k+</span> users onboarded
            </div>
          </div>
        </div>
      </div>

      {/* Right Pane - Auth Form */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 relative">
        <Link href="/" className="lg:hidden absolute top-6 left-6 inline-flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold tracking-tight">HyperLocal Go</span>
        </Link>
        
        <div className="w-full max-w-sm mx-auto">
          {children}
        </div>
      </div>
    </div>
  );
}
