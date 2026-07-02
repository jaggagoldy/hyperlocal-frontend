'use client';

import React, { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';

/* ─── field styles ─── */
const inputWrap = 'relative';
const inputCls: React.CSSProperties = {
  width: '100%',
  height: 48,
  background: 'rgba(255,255,255,.04)',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'rgba(255,255,255,.1)',
  borderRadius: 12,
  paddingLeft: 44,
  paddingRight: 44,
  fontSize: 14,
  color: '#fff',
  outline: 'none',
  transition: 'border-color .15s',
};
const iconCls = 'absolute left-3.5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-500';
const labelCls = 'block text-xs font-bold mb-1.5 text-slate-400';

export function LoginForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { setAuth } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        identifier: email,
        password,
        context: 'customer',
      });
      const { token, user } = response.data?.data || response.data;
      setAuth(token, user);
      if (user?.role !== 'vendor' && user?.role !== 'admin' && !localStorage.getItem('tutorial_seen')) {
        localStorage.setItem('nbb_show_onboarding', '1');
      }
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

  const focused = (field: string): React.CSSProperties =>
    focusedField === field
      ? { ...inputCls, borderColor: 'rgba(16,185,129,.5)', background: 'rgba(16,185,129,.04)' }
      : inputCls;

  return (
    <div className="w-full flex flex-col">
      {/* User / Pro tab switcher */}
      <div
        className="flex p-1 rounded-xl mb-8"
        style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.06)' }}
      >
        <button
          type="button"
          className="flex-1 py-2.5 text-sm font-black rounded-lg transition-all"
          style={{ background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.25)', color: '#34d399' }}
        >
          User
        </button>
        <button
          type="button"
          onClick={() => router.push(redirect ? `/vendor/login?redirect=${encodeURIComponent(redirect)}` : '/vendor/login')}
          className="flex-1 py-2.5 text-sm font-bold rounded-lg transition-all"
          style={{ color: '#475569' }}
        >
          Pro
        </button>
      </div>

      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1.5">Welcome back 👋</h1>
        <p className="text-sm font-medium" style={{ color: '#475569' }}>
          Sign in to continue to NearByBazar
        </p>
      </div>

      <form onSubmit={handleEmailLogin} className="space-y-5">
        <div>
          <label className={labelCls}>Email or Mobile Number</label>
          <div className={inputWrap}>
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
            <input
              type="text"
              placeholder="you@example.com or 9999999999"
              style={focused('email')}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className={labelCls} style={{ margin: 0 }}>Password</label>
            <Link href="/forgot-password" className="text-xs font-semibold" style={{ color: '#34d399' }}>
              Forgot password?
            </Link>
          </div>
          <div className={inputWrap}>
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              style={focused('password')}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
            <button
              type="button"
              className="absolute right-3.5 top-1/2 -translate-y-1/2 p-0.5"
              style={{ color: '#475569' }}
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full h-12 rounded-xl text-sm font-black text-white transition-all active:scale-[0.98] disabled:opacity-60"
          style={{ background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 8px 24px rgba(16,185,129,.3)' }}
        >
          {loading ? 'Signing in…' : 'Log in'}
        </button>
      </form>

      <div className="mt-8 text-center text-sm" style={{ color: '#475569' }}>
        Don&apos;t have an account?{' '}
        <Link
          href={redirect ? `/register?redirect=${encodeURIComponent(redirect)}` : '/register'}
          className="font-bold"
          style={{ color: '#34d399' }}
        >
          Sign up
        </Link>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[300px] text-slate-500 font-medium">Loading…</div>}>
      <LoginForm />
    </Suspense>
  );
}
