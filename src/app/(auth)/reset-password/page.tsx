'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { Lock, ArrowLeft, KeyRound, Mail } from 'lucide-react';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const queryEmail = searchParams.get('email') || '';
  const queryToken = searchParams.get('token') || '';

  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState(queryEmail);
  const [token, setToken] = useState(queryToken);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleReset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Email address is required');
    if (!token) return toast.error('Reset token is required');
    if (newPassword.length < 6) return toast.error('Password must be at least 6 characters');
    if (newPassword !== confirmPassword) return toast.error('Passwords do not match');

    setLoading(true);
    try {
      await apiClient.post('/auth/reset-password', {
        email,
        token,
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
          Please enter your email, reset token, and your new password.
        </p>
      </div>

      <form onSubmit={handleReset} className="space-y-5">
        <div className="space-y-1">
          <label className="text-sm font-medium">Email Address</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="email"
              placeholder="you@example.com"
              className="h-12 pl-10 bg-muted/30 focus-visible:bg-background"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={!!queryEmail}
              required
            />
          </div>
        </div>

        <div className="space-y-1">
          <label className="text-sm font-medium">Reset Token</label>
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Enter your reset token"
              className="h-12 pl-10 bg-muted/30 focus-visible:bg-background"
              value={token}
              onChange={(e) => setToken(e.target.value)}
              disabled={!!queryToken}
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

        <div className="space-y-1">
          <label className="text-sm font-medium">Confirm New Password</label>
          <div className="relative">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="password"
              placeholder="••••••••"
              className="h-12 pl-10 bg-muted/30 focus-visible:bg-background"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-bold mt-2" disabled={loading}>
          {loading ? 'Resetting...' : 'Reset Password'}
        </Button>
      </form>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[300px] text-zinc-500 font-medium">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
