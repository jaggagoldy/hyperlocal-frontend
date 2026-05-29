'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Mail, Phone, Lock, Eye, EyeOff, Sparkles, ArrowLeft } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';

type LoginMode = 'email' | 'phone' | 'otp';

export default function VendorLoginPage() {
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [mode, setMode] = useState<LoginMode>('email');
  const [loading, setLoading] = useState(false);

  // Email/password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [sessionToken, setSessionToken] = useState('');

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
      router.push('/vendor-dashboard');
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

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) return toast.error('Please enter a valid 10-digit mobile number.');
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/otp/request', { phoneNumber });
      const token = response.data?.data?.sessionToken || response.data?.sessionToken;
      if (token) setSessionToken(token);
      toast.success('OTP sent! Use 111111 in dev mode.');
      setMode('otp');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Please enter a 6-digit OTP.');
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/otp/verify', {
        phoneNumber,
        otpCode: otp,
        sessionToken,
        context: 'vendor',
      });
      const { token, user, isNewUser, onboardingToken } = response.data?.data || response.data;

      if (isNewUser) {
        // New phone → redirect to vendor registration with the onboarding token
        toast.success('Number verified! Complete your vendor registration.');
        router.push(`/vendor/register?onboardingToken=${onboardingToken}`);
      } else {
        setAuth(token, user, 'vendor');
        toast.success('Welcome back, Pro! 🔧');
        router.push('/vendor-dashboard');
      }
    } catch (error: any) {
      const code = error.response?.data?.code;
      if (code === 'NO_VENDOR_PROFILE') {
        toast.error(
          'This number is a Consumer-only account. Register as a Pro to access this portal.',
          { duration: 6000 }
        );
      } else {
        toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    toast.info('Google Login for Pro Dashboard coming soon!');
  };

  return (
    <div className="flex min-h-screen bg-background">

      {/* ─── LEFT PANE: MARKETING ─── */}
      <div className="hidden lg:flex w-1/2 relative bg-zinc-900 overflow-hidden flex-col justify-between p-12">
        {/* Gradient background */}
        <div className="absolute inset-0 opacity-40">
          <div className="absolute -top-[20%] -left-[10%] w-[70%] h-[70%] rounded-full bg-gradient-to-br from-indigo-600 to-violet-600 blur-[120px]" />
          <div className="absolute top-[40%] -right-[20%] w-[80%] h-[80%] rounded-full bg-gradient-to-tl from-primary to-purple-500 blur-[120px]" />
        </div>
        <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" />

        {/* Top: back link */}
        <div className="relative z-10">
          <Link href="/" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition-colors">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-semibold text-lg tracking-tight">HyperLocal Go</span>
          </Link>
        </div>

        {/* Center: copy */}
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
          <span className="font-semibold tracking-tight">HyperLocal Go</span>
        </Link>

        <div className="w-full max-w-sm mx-auto flex flex-col">

          {/* User / Pro Tab Switcher */}
          <div className="flex bg-muted/50 p-1 rounded-xl mb-8 w-full">
            <button
              onClick={() => router.push('/login')}
              className="flex-1 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground transition-all"
            >
              User
            </button>
            <button className="flex-1 py-2.5 text-sm font-bold rounded-lg bg-background shadow-sm text-foreground transition-all">
              Pro
            </button>
          </div>

          {/* Heading */}
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
              {mode === 'otp' ? 'Verify your number' : 'Welcome back'}
            </h1>
            <p className="text-muted-foreground text-sm">
              {mode === 'otp'
                ? `We sent a 6-digit code to +91 ${phoneNumber}`
                : 'Enter your Pro credentials to access your dashboard.'}
            </p>
          </div>

          {/* Google + Divider — shown on email/phone modes */}
          {mode !== 'otp' && (
            <div className="space-y-4 mb-6">
              <Button
                variant="outline"
                className="w-full h-12 text-base font-medium relative hover:bg-muted/50"
                onClick={handleGoogleLogin}
              >
                <svg className="w-5 h-5 absolute left-4" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
                  <path d="M1 1h22v22H1z" fill="none" />
                </svg>
                Continue with Google
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t border-border" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-background px-2 text-muted-foreground font-medium">Or continue with</span>
                </div>
              </div>
            </div>
          )}

          {/* ── EMAIL + PASSWORD MODE ── */}
          {mode === 'email' && (
            <form onSubmit={handleEmailLogin} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium">Email address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="vendor@example.com"
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

              <Button
                type="button"
                variant="ghost"
                className="w-full h-12 text-muted-foreground hover:text-foreground"
                onClick={() => setMode('phone')}
              >
                <Phone className="w-4 h-4 mr-2" />
                Login with Mobile Number
              </Button>
            </form>
          )}

          {/* ── PHONE / OTP REQUEST MODE ── */}
          {mode === 'phone' && (
            <form onSubmit={handleRequestOtp} className="space-y-5">
              <div className="space-y-1">
                <label className="text-sm font-medium">Mobile Number</label>
                <div className="relative flex items-center">
                  <span className="absolute left-4 text-muted-foreground font-medium">+91</span>
                  <Input
                    type="tel"
                    placeholder="99999 99999"
                    className="h-12 pl-12 text-base bg-muted/30 focus-visible:bg-background"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                    required
                    autoFocus
                  />
                </div>
              </div>

              <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading || phoneNumber.length !== 10}>
                {loading ? 'Sending code...' : 'Send OTP'}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="w-full h-12 text-muted-foreground hover:text-foreground"
                onClick={() => setMode('email')}
              >
                <Mail className="w-4 h-4 mr-2" />
                Login with Email instead
              </Button>
            </form>
          )}

          {/* ── OTP VERIFY MODE ── */}
          {mode === 'otp' && (
            <form onSubmit={handleVerifyOtp} className="space-y-6 flex flex-col items-center">
              <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={loading} autoFocus>
                <InputOTPGroup className="gap-2">
                  {[...Array(6)].map((_, i) => (
                    <InputOTPSlot
                      key={i}
                      index={i}
                      className="h-12 w-12 sm:h-14 sm:w-14 text-xl rounded-xl border border-input bg-muted/30"
                    />
                  ))}
                </InputOTPGroup>
              </InputOTP>

              <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading || otp.length !== 6}>
                {loading ? 'Verifying...' : 'Verify & Login'}
              </Button>

              <button
                type="button"
                onClick={() => { setMode('phone'); setOtp(''); }}
                className="text-primary text-sm font-semibold hover:underline"
              >
                Change mobile number
              </button>
            </form>
          )}

          {/* Bottom: Sign up link → vendor registration */}
          <div className="mt-8 text-center text-sm text-muted-foreground">
            Don&apos;t have an account?{' '}
            <Link href="/vendor/register" className="font-semibold text-primary hover:underline">
              Sign up
            </Link>
          </div>

        </div>
      </div>
    </div>
  );
}
