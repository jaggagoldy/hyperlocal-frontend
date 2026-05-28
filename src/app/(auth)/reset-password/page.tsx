'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, KeyRound } from 'lucide-react';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultPhone = searchParams.get('phone') || '';
  
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState(defaultPhone);
  const [otpCode, setOtpCode] = useState('');
  const [newPassword, setNewPassword] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return toast.error('Phone number is required');
    if (!otpCode || otpCode.length !== 6) return toast.error('Please enter the 6-digit OTP');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');

    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        phoneNumber,
        otpCode,
        newPassword
      });
      toast.success('Password reset successful! You can now log in.');
      router.push('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to reset password.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      <div className="mb-8">
        <Link href="/login" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-6 transition-colors">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to login
        </Link>
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          Set New Password
        </h1>
        <p className="text-muted-foreground text-sm">
          Please enter the OTP sent to your WhatsApp and your new password.
        </p>
      </div>

      <form onSubmit={handleReset} className="space-y-6">
        {/* Hidden Phone Field for submission context */}
        <input type="hidden" value={phoneNumber} />

        <div className="space-y-1">
          <label className="text-sm font-medium">WhatsApp OTP</label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="tel"
              inputMode="numeric"
              pattern="[0-9]*"
              placeholder="123456"
              maxLength={6}
              className="h-12 pl-10 bg-muted/30 focus-visible:bg-background tracking-widest font-mono text-center"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="password"
              placeholder="••••••••"
              className="h-12 pl-10 bg-muted/30 focus-visible:bg-background"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-bold" disabled={loading || otpCode.length !== 6 || newPassword.length < 6}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
