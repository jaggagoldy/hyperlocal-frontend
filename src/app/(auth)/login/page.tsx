'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        identifier: email,
        password,
        context: 'customer'
      });
      const { token, user } = response.data?.data || response.data;
      setAuth(token, user);
      toast.success('Successfully logged in!');
      if (redirect) {
        router.push(redirect);
      } else if (user?.role === 'vendor') {
        router.push('/vendor-dashboard');
      } else {
        router.push('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* User / Pro Tab Switcher */}
      <div className="flex bg-muted/50 p-1 rounded-xl mb-8 w-full">
        <button 
          type="button"
          className="flex-1 py-2.5 text-sm font-bold rounded-lg bg-background shadow-sm text-foreground transition-all"
        >
          User
        </button>
        <button 
          type="button"
          onClick={() => router.push(redirect ? `/vendor/login?redirect=${encodeURIComponent(redirect)}` : '/vendor/login')} 
          className="flex-1 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground transition-all"
        >
          Pro
        </button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Welcome back
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your details to access your account
        </p>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-medium">Email or Mobile Number</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="you@example.com or 9999999999"
              className="h-12 pl-10 bg-muted/30 focus-visible:bg-background"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
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

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Don't have an account?{' '}
        <Link 
          href={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'} 
          className="font-semibold text-primary hover:underline"
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[300px] text-zinc-500 font-medium">Loading...</div>}>
      <LoginForm />
    </Suspense>
  );
}
