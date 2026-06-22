'use client';

import React, { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Mail, Lock, Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function VendorLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { setAuth } = useAuthStore();

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields.');
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        identifier: email,
        password,
        context: 'vendor',
      });
      const { token, user } = response.data?.data || response.data;
      setAuth(token, user, 'vendor');
      toast.success('Welcome back, Pro! 🔧');
      if (redirect) {
        router.push(redirect);
      } else {
        router.push('/vendor-dashboard');
      }
    } catch (error: any) {
      const code = error.response?.data?.code;
      if (code === 'NO_VENDOR_PROFILE') {
        toast.error(
          'This email is registered as a Consumer account. Register as a Pro to access this portal.',
          { duration: 6000 }
        );
      } else {
        toast.error(error.response?.data?.message || 'Invalid email or password.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen bg-background w-full">
      {/* ─── LEFT PANE: MARKETING ─── */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-900 overflow-hidden flex-col justify-between p-12">
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 blur-[120px]" />
          <div className="absolute top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tl from-primary to-purple-500 blur-[120px]" />
        </div>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold text-lg tracking-tight">NearByBazar</span>
          </Link>
        </div>

        <div className="relative z-10 space-y-6 max-w-lg">
          <div className="w-12 h-12 bg-gradient-to-br from-primary to-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-primary/25">
            <Sparkles className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-5xl font-bold tracking-tight text-white leading-[1.1]">
            Your Business,<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-indigo-300">Supercharged.</span>
          </h1>
          <p className="text-lg text-white/70 leading-relaxed font-medium">
            Manage your leads, track revenue, and grow your local service business with zero commission fees.
          </p>

          <div className="flex items-center gap-6 pt-4 text-sm font-bold text-zinc-400">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500" /> 0% Commission
            </div>
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-400" /> Direct WhatsApp Leads
            </div>
          </div>
        </div>

        <div className="relative z-10 h-6" />
      </div>

      {/* ─── RIGHT PANE: AUTH FORM ─── */}
      <div className="flex-1 flex flex-col items-center justify-center p-6 sm:p-12 lg:p-24 relative">
        <Link href="/" className="lg:hidden absolute top-6 left-6 inline-flex items-center gap-2 text-foreground/80 hover:text-foreground transition-colors">
          <ArrowLeft className="w-5 h-5" />
          <span className="font-semibold tracking-tight">NearByBazar</span>
        </Link>

        <div className="w-full max-w-sm mx-auto flex flex-col">
          {/* User / Pro Tab Switcher */}
          <div className="flex bg-muted/50 p-1 rounded-xl mb-8 w-full">
            <button
              type="button"
              onClick={() => router.push(redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login')}
              className="flex-1 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground transition-all"
            >
              User
            </button>
            <button className="flex-1 py-2.5 text-sm font-bold rounded-lg bg-background shadow-sm text-foreground transition-all">
              Pro
            </button>
          </div>

          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              Welcome back
            </h1>
            <p className="text-muted-foreground text-sm">
              Enter your Pro credentials to access your dashboard.
            </p>
          </div>

          <form onSubmit={handleEmailLogin} className="space-y-5">
            <div className="space-y-1">
              <label className="text-sm font-medium">Email or Mobile Number</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="vendor@example.com or 9999999999"
                  className="h-12 pl-10 bg-muted/30 focus-visible:bg-background"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoFocus
                />
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Password</label>
                <Link href="/forgot-password" className="text-xs font-semibold text-primary hover:underline">
                  Forgot password?
                </Link>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                <Input
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  className="h-12 pl-10 pr-10 bg-muted/30 focus-visible:bg-background"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading}>
              {loading ? 'Logging in...' : 'Log in'}
            </Button>
          </form>

          {/* Bottom: Sign up link → vendor registration */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link
              href={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register?redirect=/vendor/register'}
              className="font-semibold text-primary hover:underline"
            >
              Sign up
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VendorLoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[300px] text-zinc-500 font-medium">Loading...</div>}>
      <VendorLoginForm />
    </Suspense>
  );
}
