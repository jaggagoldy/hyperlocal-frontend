'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Phone, Lock, Eye, EyeOff, User } from 'lucide-react';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';

const inputBase: React.CSSProperties = {
  width: '100%',
  height: 48,
  background: 'rgba(255,255,255,.04)',
  borderWidth: 1,
  borderStyle: 'solid',
  borderColor: 'rgba(255,255,255,.1)',
  borderRadius: 12,
  paddingLeft: 44,
  paddingRight: 16,
  fontSize: 14,
  color: '#fff',
  outline: 'none',
  transition: 'border-color .15s',
};

const inputFocused: React.CSSProperties = {
  ...inputBase,
  borderColor: 'rgba(16,185,129,.5)',
  background: 'rgba(16,185,129,.04)',
};

const inputVendor: React.CSSProperties = {
  ...inputBase,
  borderColor: 'rgba(245,158,11,.2)',
  background: 'rgba(245,158,11,.03)',
};

const inputVendorFocused: React.CSSProperties = {
  ...inputVendor,
  borderColor: 'rgba(245,158,11,.5)',
  background: 'rgba(245,158,11,.06)',
};

const labelCls = 'block text-xs font-bold mb-1.5 text-slate-400';

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { setAuth } = useAuthStore();

  const [role, setRole] = useState<'customer' | 'vendor'>(
    redirect === '/vendor/register' || redirect?.includes('/vendor/register') ? 'vendor' : 'customer'
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('Please fill in all fields');
    if (role === 'vendor') {
      if (!phoneNumber) return toast.error('Please enter your mobile number');
      if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
        return toast.error('Please enter a valid 10-digit Indian mobile number');
      }
    }

    setLoading(true);
    try {
      const payload: any = { name, email, password, role };
      if (role === 'vendor') payload.phoneNumber = phoneNumber;

      const response = await apiClient.post('/auth/register', payload);
      const { token, user } = response.data?.data || response.data;
      setAuth(token, user, role === 'vendor' ? 'vendor' : 'customer');
      toast.success('Account created successfully!');
      if (role === 'vendor') {
        router.push('/vendor/register');
      } else if (redirect) {
        router.push(redirect);
      } else {
        router.push('/profile');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  const isVendor = role === 'vendor';

  const f = (field: string): React.CSSProperties => {
    const isFocused = focusedField === field;
    if (field === 'phone') return isFocused ? inputVendorFocused : inputVendor;
    return isFocused ? inputFocused : inputBase;
  };

  return (
    <div className="w-full flex flex-col">
      {/* User / Pro tab switcher */}
      <div
        className="flex p-1 rounded-xl mb-7"
        style={{ background: 'rgba(255,255,255,.05)', border: '1px solid rgba(255,255,255,.06)' }}
      >
        <button
          type="button"
          onClick={() => setRole('customer')}
          className="flex-1 py-2.5 text-sm font-black rounded-lg transition-all"
          style={
            !isVendor
              ? { background: 'rgba(16,185,129,.15)', border: '1px solid rgba(16,185,129,.25)', color: '#34d399' }
              : { color: '#475569' }
          }
        >
          User
        </button>
        <button
          type="button"
          onClick={() => setRole('vendor')}
          className="flex-1 py-2.5 text-sm font-black rounded-lg transition-all"
          style={
            isVendor
              ? { background: 'rgba(245,158,11,.12)', border: '1px solid rgba(245,158,11,.25)', color: '#f59e0b' }
              : { color: '#475569' }
          }
        >
          Pro
        </button>
      </div>

      <div className="mb-7">
        <h1 className="text-2xl font-black text-white mb-1.5">
          {isVendor ? 'Create your Pro account 🚀' : 'Create an account ✨'}
        </h1>
        <p className="text-sm font-medium" style={{ color: '#475569' }}>
          {isVendor
            ? 'Become a service provider on NearByBazar'
            : 'Join thousands of users on NearByBazar'}
        </p>
      </div>

      <form onSubmit={handleRegister} className="space-y-4">
        <div>
          <label className={labelCls}>Full Name</label>
          <div className="relative">
            <User className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
            <input
              type="text"
              placeholder="John Doe"
              style={f('name')}
              onFocus={() => setFocusedField('name')}
              onBlur={() => setFocusedField(null)}
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
        </div>

        <div>
          <label className={labelCls}>Email address</label>
          <div className="relative">
            <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
            <input
              type="email"
              placeholder="you@example.com"
              style={f('email')}
              onFocus={() => setFocusedField('email')}
              onBlur={() => setFocusedField(null)}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
        </div>

        {isVendor && (
          <div>
            <label className="block text-xs font-bold mb-1.5 flex items-center gap-1.5" style={{ color: '#f59e0b' }}>
              Mobile Number
              <span className="text-[9px] font-black px-1.5 py-0.5 rounded-full" style={{ background: 'rgba(245,158,11,.12)', color: '#f59e0b' }}>
                PRO ONLY
              </span>
            </label>
            <div className="relative flex items-center">
              <span className="absolute left-3.5 text-sm font-black" style={{ color: '#64748b' }}>+91</span>
              <input
                type="tel"
                placeholder="9999999999"
                style={{ ...f('phone'), paddingLeft: 52 }}
                onFocus={() => setFocusedField('phone')}
                onBlur={() => setFocusedField(null)}
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                required={isVendor}
              />
            </div>
          </div>
        )}

        <div>
          <label className={labelCls}>Password</label>
          <div className="relative">
            <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4" style={{ color: '#475569' }} />
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Create a strong password"
              style={{ ...f('password'), paddingRight: 44 }}
              onFocus={() => setFocusedField('password')}
              onBlur={() => setFocusedField(null)}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
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
          className="w-full h-12 rounded-xl text-sm font-black text-white mt-2 transition-all active:scale-[0.98] disabled:opacity-60"
          style={
            isVendor
              ? { background: 'linear-gradient(135deg,#f59e0b,#d97706)', boxShadow: '0 8px 24px rgba(245,158,11,.3)' }
              : { background: 'linear-gradient(135deg,#10b981,#059669)', boxShadow: '0 8px 24px rgba(16,185,129,.3)' }
          }
        >
          {loading ? 'Creating account…' : isVendor ? 'Create Pro Account' : 'Create account'}
        </button>
      </form>

      <div className="mt-7 text-center text-sm" style={{ color: '#475569' }}>
        Already have an account?{' '}
        <Link
          href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'}
          className="font-bold"
          style={{ color: '#34d399' }}
        >
          Log in
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[300px] text-slate-500 font-medium">Loading…</div>}>
      <RegisterForm />
    </Suspense>
  );
}
