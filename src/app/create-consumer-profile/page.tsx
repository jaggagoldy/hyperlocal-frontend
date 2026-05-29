'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

export default function CreateConsumerProfilePage() {
  const { user, setAuth, token } = useAuthStore();
  const router = useRouter();
  
  const [address, setAddress] = useState('');
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!user) {
      router.replace('/login');
    } else if (user.hasCustomerProfile) {
      router.replace('/explore');
    }
  }, [user, router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!address.trim()) {
      toast.error('Please fill in all required fields.');
      return;
    }

    setLoading(true);
    try {
      const response = await apiClient.put('/users/me', {
        address: address.trim(),
        hasCustomerProfile: true,
      });
      const updatedUser = response.data?.data;
      
      if (token) {
        setAuth(token, { ...user, ...updatedUser, hasCustomerProfile: true, activeContext: 'customer' });
      }
      
      toast.success('Account created successfully!');
      router.push('/explore');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to create account.');
    } finally {
      setLoading(false);
    }
  };

  if (!user) return null;

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-zinc-50 p-4">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border border-zinc-200 p-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">Create Consumer Account</h1>
          <p className="text-muted-foreground text-sm">Complete your profile to start hiring pros.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Complete Address *</label>
            <Input 
              className="h-12 bg-muted/30 focus-visible:bg-background" 
              value={address} 
              onChange={e => setAddress(e.target.value)} 
              required 
            />
          </div>
          
          <Button type="submit" className="w-full h-12 text-base font-medium mt-2" disabled={loading}>
            {loading ? 'Creating Account...' : 'Complete Profile'}
          </Button>
        </form>
      </div>
    </div>
  );
}
