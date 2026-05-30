'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff, ChevronLeft, Phone } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { useGoogleLogin } from '@react-oauth/google';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';
import { useMediaQuery } from '@/hooks/useMediaQuery';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
} from '@/components/ui/drawer';
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from '@/components/ui/input-otp';

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

type AuthMode = 'identifier' | 'login' | 'verify' | 'onboard';

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { setAuth } = useAuthStore();
  const recaptchaRef = useRef<HTMLDivElement>(null);
  
  // State
  const [mode, setMode] = useState<'email' | 'phone' | 'otp' | 'onboard'>('email');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Email/password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  // OTP state
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

  useEffect(() => {
    if (!isOpen || !recaptchaRef.current) return;
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
  }, [isOpen]);

  const resetState = () => {
    setMode('email');
    setEmail('');
    setPassword('');
    setShowPassword(false);
    setPhoneNumber('');
    setOtp('');
    setConfirmationResult(null);
    setName('');
    setOnboardingEmail('');
    setOnboardingPassword('');
    setAddress('');
    setOnboardingToken('');
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return toast.error('Please fill in all fields.');
    setLoading(true);
    try {
      const response = await apiClient.post('/auth/login', {
        identifier: email,
        password,
        context: 'customer',
      });
      const { token, user } = response.data?.data || response.data;
      setAuth(token, user);
      toast.success('Successfully logged in!');
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) return toast.error('Please enter a valid 10-digit mobile number.');
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
        context: 'customer',
      });
      const { token, user, isNewUser, onboardingToken: newToken } = response.data?.data || response.data;

      if (isNewUser) {
        setOnboardingToken(newToken);
        setIsOnboardingFromGoogle(false);
        setMode('onboard');
        toast.success('Phone verified. Please complete your profile.');
      } else if (!user?.name) {
        toast.success('Successfully logged in! Redirecting to setup...');
        handleClose();
        router.push('/onboarding');
      } else {
        setAuth(token, user);
        toast.success('Successfully logged in!');
        handleClose();
        if (onSuccess) onSuccess();
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
      const payload: any = {
        onboardingToken,
        address,
      };
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
      handleClose();
      if (onSuccess) onSuccess();
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
          handleClose();
          if (onSuccess) onSuccess();
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

  const content = (
    <div className="flex flex-col w-full">
      <div ref={recaptchaRef}></div>
      {/* Google + Divider — hidden in OTP & Onboard modes */}
      {(mode === 'email' || mode === 'phone') && (
        <div className="space-y-4 mb-6">
          <Button
            variant="outline"
            className="w-full h-11 text-sm font-medium relative hover:bg-muted/50 rounded-xl"
            onClick={handleGoogleLogin}
          >
            <svg className="w-4 h-4 absolute left-4" viewBox="0 0 24 24">
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
            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-wider">
              <span className="bg-background px-2 text-muted-foreground">Or</span>
            </div>
          </div>
        </div>
      )}

      {/* Email Mode */}
      {mode === 'email' && (
        <form onSubmit={handleEmailLogin} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="email"
                placeholder="you@example.com"
                className="h-11 pl-9 bg-muted/30 focus-visible:bg-background rounded-xl text-sm"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
          </div>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Password</label>
            </div>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type={showPassword ? 'text' : 'password'}
                placeholder="••••••••"
                className="h-11 pl-9 pr-9 bg-muted/30 focus-visible:bg-background rounded-xl text-sm"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
              <button
                type="button"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>

          <Button type="submit" className="w-full h-11 text-sm font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20" disabled={loading}>
            {loading ? 'Logging in...' : 'Log in'}
          </Button>

          <Button 
            type="button" 
            variant="ghost" 
            className="w-full h-11 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setMode('phone')}
          >
            <Phone className="w-3.5 h-3.5 mr-1.5" />
            Login with Mobile Number instead
          </Button>
        </form>
      )}

      {/* Phone Mode */}
      {mode === 'phone' && (
        <form onSubmit={handleRequestOtp} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Mobile Number</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted-foreground font-bold text-sm">+91</span>
              <Input
                type="tel"
                placeholder="99999 99999"
                className="h-11 pl-11 text-sm bg-muted/30 focus-visible:bg-background rounded-xl"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                required
              />
            </div>
          </div>

          <Button type="submit" className="w-full h-11 text-sm font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20" disabled={loading || phoneNumber.length !== 10}>
            {loading ? 'Sending code...' : 'Send OTP'}
          </Button>

          <Button 
            type="button" 
            variant="ghost" 
            className="w-full h-11 text-xs text-muted-foreground hover:text-foreground"
            onClick={() => setMode('email')}
          >
            <Mail className="w-3.5 h-3.5 mr-1.5" />
            Login with Email instead
          </Button>
        </form>
      )}

      {/* OTP Mode */}
      {mode === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-5 flex flex-col items-center">
          <div className="w-full flex justify-between items-center px-1 mb-2">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">6-Digit OTP</label>
            <button 
              type="button" 
              onClick={() => { setMode('phone'); setOtp(''); }}
              className="text-primary text-xs font-bold hover:underline"
            >
              Change number
            </button>
          </div>
          <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={loading} autoFocus>
            <InputOTPGroup className="gap-1.5 sm:gap-2">
              {[...Array(6)].map((_, i) => (
                <InputOTPSlot key={i} index={i} className="h-10 w-10 sm:h-12 sm:w-12 text-lg rounded-xl border border-input bg-muted/30" />
              ))}
            </InputOTPGroup>
          </InputOTP>

          <Button type="submit" className="w-full h-11 text-sm font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 mt-2" disabled={loading || otp.length !== 6}>
            {loading ? 'Verifying...' : 'Verify & Login'}
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
                <Input className="h-10 bg-muted/30 rounded-xl" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email *</label>
                <Input className="h-10 bg-muted/30 rounded-xl" type="email" value={onboardingEmail} onChange={e => setOnboardingEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Set Password *</label>
                <Input className="h-10 bg-muted/30 rounded-xl" type="password" value={onboardingPassword} onChange={e => setOnboardingPassword(e.target.value)} required minLength={6} />
              </div>
            </>
          )}

          {isOnboardingFromGoogle && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Phone Number *</label>
              <Input className="h-10 bg-muted/30 rounded-xl" type="tel" placeholder="+91" value={onboardingPhone} onChange={e => setOnboardingPhone(e.target.value)} required pattern="^[6-9]\d{9}$" title="Enter a valid 10-digit Indian phone number" />
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Complete Address *</label>
            <Input className="h-10 bg-muted/30 rounded-xl" value={address} onChange={e => setAddress(e.target.value)} required />
          </div>
          <Button type="submit" className="w-full h-11 text-sm font-bold rounded-xl bg-primary hover:bg-primary/90 text-white shadow-lg shadow-primary/20 mt-2" disabled={loading}>
            {loading ? 'Creating Account...' : 'Complete Profile'}
          </Button>
        </form>
      )}
      
      {(mode === 'email' || mode === 'phone') && (
        <div className="mt-6 text-center text-xs text-muted-foreground font-medium">
          Don't have an account?{' '}
          <button onClick={() => { handleClose(); router.push('/register'); }} className="text-primary font-bold hover:underline">
            Sign up
          </button>
        </div>
      )}
    </div>
  );

  const title = 
    mode === 'email' || mode === 'phone' ? 'Welcome to HyperLocal' : 
    mode === 'otp' ? 'Verify your number' : 
    'Complete your profile';
    
  const description = 
    mode === 'email' || mode === 'phone' ? 'Log in or create an account to view vendor details.' :
    mode === 'otp' ? `We sent a 6-digit code to +91 ${phoneNumber}` :
    'We need a few more details to set up your account.';

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={(open) => !open && handleClose()}>
        <DialogContent className="sm:max-w-[400px] p-6 max-h-[90vh] overflow-y-auto rounded-3xl">
          <DialogHeader className="mb-2">
            <DialogTitle className="text-2xl font-black tracking-tight text-center">{title}</DialogTitle>
            <DialogDescription className="text-center font-medium">{description}</DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            {content}
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={(open) => !open && handleClose()}>
      <DrawerContent className="rounded-t-3xl">
        <div className="mx-auto w-full max-w-sm max-h-[90vh] overflow-y-auto pb-4">
          <DrawerHeader className="text-center mb-2 mt-2">
            <DrawerTitle className="text-2xl font-black tracking-tight">{title}</DrawerTitle>
            <DrawerDescription className="font-medium">{description}</DrawerDescription>
          </DrawerHeader>
          <div className="px-6 pb-8">
            {content}
          </div>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
