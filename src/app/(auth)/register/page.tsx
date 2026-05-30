'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, Phone, Lock, Eye, EyeOff, User } from 'lucide-react';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function RegisterPage() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // Onboarding state
  const [mode, setMode] = useState<'register' | 'onboard'>('register');
  const [onboardingToken, setOnboardingToken] = useState('');
  const [isOnboardingFromGoogle, setIsOnboardingFromGoogle] = useState(false);
  const [onboardingPhone, setOnboardingPhone] = useState('');
  const [address, setAddress] = useState('');

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('Please fill in all fields');

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/register', { name, email, password });
      const { token, user } = response.data?.data || response.data;
      setAuth(token, user);
      toast.success('Account created successfully!');
      // New users (no name set by backend yet) → onboarding wizard
      // Email register always sends name, so go straight to profile
      router.push('/profile');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Try again.');
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
      return toast.error('Invalid onboarding state');
    }
    
    setLoading(true);
    try {
      const payload: any = { onboardingToken, address };
      if (isOnboardingFromGoogle) {
        payload.phoneNumber = onboardingPhone;
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
          toast.success('Account created successfully!');
          
          if (!user?.name) {
            router.push('/onboarding');
          } else {
            router.push('/');
          }
        }
      } catch (error: any) {
        toast.error(error.response?.data?.message || 'Google Registration failed');
      } finally {
        setLoading(false);
      }
    },
    onError: () => toast.error('Google Registration was canceled or failed')
  });

  const handleGoogleLogin = () => {
    googleLogin();
  };

  return (
    <div className="w-full flex flex-col">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Create an account
        </h1>
        <p className="text-muted-foreground text-sm">
          Join thousands of users on HyperLocal Go
        </p>
      </div>

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
          Sign up with Google
        </Button>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground font-medium">Or continue with email</span>
          </div>
        </div>
      </div>

      {mode === 'register' && (
        <form onSubmit={handleRegister} className="space-y-5">
          <div className="space-y-1">
            <label className="text-sm font-medium">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="John Doe"
                className="h-12 pl-10 bg-muted/30 focus-visible:bg-background"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>
          </div>

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
            <label className="text-sm font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="Create a strong password"
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

          <Button type="submit" className="w-full h-12 text-base font-medium mt-2" disabled={loading}>
            {loading ? 'Creating account...' : 'Create account'}
          </Button>
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
                <Input className="h-12 bg-muted/30 focus-visible:bg-background" type="email" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Set Password *</label>
                <Input className="h-12 bg-muted/30 focus-visible:bg-background" type="password" value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
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

      {mode === 'register' && (
        <div className="mt-8 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="font-semibold text-primary hover:underline">
            Log in
          </Link>
        </div>
      )}
    </div>
  );
}
