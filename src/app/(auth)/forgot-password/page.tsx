'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Mail, ArrowLeft, Send } from 'lucide-react';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return toast.error('Please enter your email address');

    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { email });
      toast.success('If an account exists, a reset link has been sent!');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send reset email.');
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
          Forgot password?
        </h1>
        <p className="text-muted-foreground text-sm">
          Enter your registered email address and we'll send a password reset link to your inbox.
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-6">
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
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-bold" disabled={loading || !email}>
          {loading ? 'Sending link...' : (
             <>
               <Send className="w-4 h-4 mr-2" />
               Send Reset Link
             </>
          )}
        </Button>
      </form>
    </div>
  );
}
