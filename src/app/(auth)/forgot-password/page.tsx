'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Phone, ArrowLeft, MessageSquare } from 'lucide-react';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [phoneNumber, setPhoneNumber] = useState('');

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!phoneNumber) return toast.error('Please enter your phone number');
    if (!/^[6-9]\d{9}$/.test(phoneNumber)) return toast.error('Please enter a valid 10-digit mobile number');

    setLoading(true);
    try {
      await apiClient.post('/auth/forgot-password', { phoneNumber });
      toast.success('OTP sent via WhatsApp!');
      router.push(`/reset-password?phone=${phoneNumber}`);
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to send OTP.');
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
          Enter your registered mobile number and we'll send a 6-digit OTP via WhatsApp to reset your password.
        </p>
      </div>

      <form onSubmit={handleResetPassword} className="space-y-6">
        <div className="space-y-1">
          <label className="text-sm font-medium">Mobile Number</label>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              type="tel"
              placeholder="9876543210"
              maxLength={10}
              className="h-12 pl-10 bg-muted/30 focus-visible:bg-background"
              value={phoneNumber}
              onChange={(e) => setPhoneNumber(e.target.value.replace(/\D/g, ''))}
              required
            />
          </div>
        </div>

        <Button type="submit" className="w-full h-12 text-base font-bold bg-[#25D366] hover:bg-[#128C7E] text-white" disabled={loading || phoneNumber.length !== 10}>
          {loading ? 'Sending OTP...' : (
             <>
               <MessageSquare className="w-4 h-4 mr-2" />
               Send OTP via WhatsApp
             </>
          )}
        </Button>
      </form>
    </div>
  );
}
