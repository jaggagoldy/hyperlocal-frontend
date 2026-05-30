'use client';

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Phone, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

type LoginMode = 'email' | 'phone' | 'otp' | 'onboard';

export default function LoginPage() {
  const [mode, setMode] = useState<LoginMode>('email');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuthStore();
  const recaptchaRef = React.useRef<HTMLDivElement>(null);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  
  // Onboarding state
  const [onboardingToken, setOnboardingToken] = useState('');
  const [isOnboardingFromGoogle, setIsOnboardingFromGoogle] = useState(false);
  const [name, setName] = useState('');
  const [onboardingEmail, setOnboardingEmail] = useState('');
  const [onboardingPassword, setOnboardingPassword] = useState('');
  const [onboardingPhone, setOnboardingPhone] = useState('');
  const [address, setAddress] = useState('');

  React.useEffect(() => {
    if (!recaptchaRef.current) return;
    try {
      (window as any).recaptchaVerifier = new RecaptchaVerifier(auth, recaptchaRef.current, {
        size: 'invisible',
      });
    } catch (e) {
      console.error('Failed to init recaptcha', e);
    }
    return () => {
      if ((window as any).recaptchaVerifier) {
        try {
          (window as any).recaptchaVerifier.clear();
        } catch (e) {}
        (window as any).recaptchaVerifier = null;
      }
    };
  }, []);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields');

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', { email, password });
      const { token, user } = response.data?.data || response.data;
      setAuth(token, user);
      toast.success('Successfully logged in!');
      if (user?.role === 'vendor') {
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

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) {
      return toast.error('Please enter a valid 10-digit mobile number.');
    }
    
    setLoading(true);
    try {
      const formattedPhone = `+91${phoneNumber}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, (window as any).recaptchaVerifier);
      setConfirmationResult(confirmation);
      toast.success('OTP sent successfully!');
      setMode('otp');
    } catch (error: any) {
      console.error(error);
      toast.error(error.message || 'Failed to send OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) return toast.error('Please enter a 6-digit OTP.');
    if (!confirmationResult) return toast.error('OTP session expired. Please request again.');

    setLoading(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();

      const response = await apiClient.post('/auth/otp/verify', { 
        idToken,
        context: 'customer'
      });
      
      const { token, user, isNewUser, onboardingToken: newToken } = response.data?.data || response.data;
      
      if (isNewUser) {
        setOnboardingToken(newToken);
        setIsOnboardingFromGoogle(false);
        setMode('onboard');
        toast.success('Number verified! Please complete your profile.');
      } else if (!user?.name) {
        setAuth(token, user);
        toast.success('Successfully logged in! Redirecting to setup...');
        router.push('/onboarding');
      } else {
        setAuth(token, user);
        toast.success('Successfully logged in!');
        if (user.role === 'vendor') router.push('/vendor-dashboard');
        else router.push('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleOnboard = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isOnboardingFromGoogle) {
      if (!onboardingPhone || !address) {
        return toast.error('Please fill in your phone number and address.');
      }
    } else {
      if (!name || !onboardingEmail || !onboardingPassword || !address) {
        return toast.error('Please fill in all required fields.');
      }
    }
    
    setLoading(true);
    try {
      const payload: any = { onboardingToken, address };
      if (isOnboardingFromGoogle) {
        payload.phoneNumber = onboardingPhone;
      } else {
        payload.name = name;
        payload.email = onboardingEmail;
        payload.password = onboardingPassword;
      }

      const response = await apiClient.post('/auth/onboard', payload);
      const { token, user } = response.data?.data || response.data;
      setAuth(token, user);
      toast.success('Account created successfully!');
      router.push('/');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    flow: 'auth-code',
    onSuccess: async (codeResponse) => {
      setLoading(true);
      try {
        const response = await apiClient.post('/auth/google', {
          code: codeResponse.code,
          context: 'customer'
        });
        const responseData = response.data?.data || response.data;
        if (responseData.isNewUser) {
          setOnboardingToken(responseData.onboardingToken);
          setIsOnboardingFromGoogle(true);
          setMode('onboard');
          toast.success(responseData.message);
        } else {
          const { token, user } = responseData;
          useAuthStore.getState().setAuth(token, user);
          toast.success('Successfully logged in with Google!');
          
          if (!user?.name) {
            router.push('/onboarding');
          } else {
            router.push('/');
          }
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Google Login failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error('Google Login was canceled or failed')
  });

  const handleGoogleLogin = () => {
    googleLogin();
  };

  return (
    <div className="w-full flex flex-col">
      <div className="flex bg-muted/50 p-1 rounded-xl mb-8 w-full">
        <button 
          className="flex-1 py-2.5 text-sm font-bold rounded-lg bg-background shadow-sm text-foreground transition-all"
        >
          User
        </button>
        <button 
          onClick={() => router.push('/vendor/login')} 
          className="flex-1 py-2.5 text-sm font-medium rounded-lg text-muted-foreground hover:text-foreground transition-all"
        >
          Pro
        </button>
      </div>
      <div ref={recaptchaRef}></div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          {mode === 'otp' ? 'Verify your number' : 'Welcome back'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {mode === 'otp' 
            ? `We sent a 6-digit code to +91 ${phoneNumber}`
            : 'Enter your details to access your account'}
        </p>
      </div>

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

      {/* Email Login Mode */}
      {mode === 'email' && (
        <form onSubmit={handleEmailLogin} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
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

      {/* Phone Login Mode */}
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

      {/* OTP Verification Mode */}
      {mode === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-6 flex flex-col items-center">
          <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={loading} autoFocus>
            <InputOTPGroup className="gap-2">
              {[...Array(6)].map((_, i) => (
                <InputOTPSlot key={i} index={i} className="h-12 w-12 sm:h-14 sm:w-14 text-xl rounded-xl border border-input bg-muted/30" />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <Button type="submit" className="w-full h-12 text-base font-medium" disabled={loading || otp.length !== 6}>
            {loading ? 'Verifying...' : 'Verify & Login'}
          </Button>

          <button 
            type="button" 
            onClick={() => setMode('phone')} 
            className="text-primary text-sm font-semibold hover:underline"
          >
            Change mobile number
          </button>
        </form>
      )}

      {/* Onboard Mode */}
      {mode === 'onboard' && (
        <form onSubmit={handleOnboard} className="space-y-4">
          {!isOnboardingFromGoogle && (
            <>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Full Name *</label>
                <Input className="h-12 bg-muted/30 focus-visible:bg-background" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email *</label>
                <Input className="h-12 bg-muted/30 focus-visible:bg-background" type="email" value={onboardingEmail} onChange={e => setOnboardingEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Set Password *</label>
                <Input className="h-12 bg-muted/30 focus-visible:bg-background" type="password" value={onboardingPassword} onChange={e => setOnboardingPassword(e.target.value)} required minLength={6} />
              </div>
            </>
          )}

          {isOnboardingFromGoogle && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone Number *</label>
              <Input className="h-12 bg-muted/30 focus-visible:bg-background" type="tel" placeholder="+91" value={onboardingPhone} onChange={e => setOnboardingPhone(e.target.value)} required pattern="^[6-9]\d{9}$" title="Enter a valid 10-digit Indian phone number" />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Complete Address *</label>
            <Input className="h-12 bg-muted/30 focus-visible:bg-background" value={address} onChange={e => setAddress(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full h-12 text-base font-medium mt-2" disabled={loading}>
            {loading ? 'Creating Account...' : 'Complete Profile'}
          </Button>
        </form>
      )}

      {(mode === 'email' || mode === 'phone') && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Don't have an account?{' '}
          <Link href="/register" className="font-semibold text-primary hover:underline">
            Sign up
          </Link>
        </div>
      )}
    </div>
  );
}
