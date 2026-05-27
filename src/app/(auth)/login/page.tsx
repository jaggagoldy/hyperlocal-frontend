'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { toast } from 'sonner';

export default function LoginPage() {
  const [step, setStep] = useState<'phone' | 'otp'>('phone');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const { setAuth } = useAuthStore();

  const handleRequestOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phoneNumber.length !== 10) {
      toast.error('Please enter a valid 10-digit mobile number.');
      return;
    }
    
    setLoading(true);
    try {
      await apiClient.post('/auth/otp/request', { phoneNumber: `+91${phoneNumber}` });
      toast.success('OTP sent successfully!');
      setStep('otp');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otp.length !== 6) {
      toast.error('Please enter a 6-digit OTP.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.post('/auth/otp/verify', { 
        phoneNumber: `+91${phoneNumber}`, 
        otp 
      });
      
      const { token, user } = response.data;
      setAuth(token, user);
      toast.success('Successfully logged in!');
      router.push('/explore');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen px-6 py-12 bg-background">
      <div className="flex-1 flex flex-col justify-center max-w-sm mx-auto w-full pb-20">
        <h1 className="text-3xl font-bold mb-2 text-foreground">
          {step === 'phone' ? 'Welcome Back' : 'Verify OTP'}
        </h1>
        <p className="text-muted-foreground mb-8">
          {step === 'phone' 
            ? 'Enter your mobile number to login or sign up.' 
            : `We've sent a 6-digit code to +91 ${phoneNumber}`}
        </p>

        {step === 'phone' ? (
          <form onSubmit={handleRequestOtp} className="space-y-6">
            <div className="space-y-2">
              <label htmlFor="phone" className="text-sm font-medium">Mobile Number</label>
              <div className="flex relative items-center">
                <span className="absolute left-4 text-muted-foreground">+91</span>
                <Input
                  id="phone"
                  type="tel"
                  placeholder="9999999999"
                  className="h-12 pl-12 text-lg"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                />
              </div>
            </div>
            <Button type="submit" className="w-full h-12 text-lg" disabled={loading || phoneNumber.length !== 10}>
              {loading ? 'Sending...' : 'Continue'}
            </Button>
          </form>
        ) : (
          <form onSubmit={handleVerifyOtp} className="space-y-8 flex flex-col items-center">
            <InputOTP maxLength={6} value={otp} onChange={setOtp} disabled={loading}>
              <InputOTPGroup className="gap-1 sm:gap-2">
                {[...Array(6)].map((_, i) => (
                  <InputOTPSlot key={i} index={i} className="h-12 w-10 sm:h-14 sm:w-12 text-xl rounded-md border" />
                ))}
              </InputOTPGroup>
            </InputOTP>
            <Button type="submit" className="w-full h-12 text-lg" disabled={loading || otp.length !== 6}>
              {loading ? 'Verifying...' : 'Verify & Login'}
            </Button>
            <button 
              type="button" 
              onClick={() => setStep('phone')} 
              className="text-primary text-sm font-medium hover:underline"
            >
              Change mobile number
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
