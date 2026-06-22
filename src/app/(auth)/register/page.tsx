'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { Mail, Phone, Lock, Eye, EyeOff, User } from 'lucide-react';
import { toast } from 'sonner';

import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export function RegisterForm() {
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { setAuth } = useAuthStore();

  const [role, setRole] = useState<'customer' | 'vendor'>(
    redirect === '/vendor/register' || redirect?.includes('/vendor/register') ? 'vendor' : 'customer'
  );

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return toast.error('Please fill in all fields');
    if (role === 'vendor') {
      if (!phoneNumber) return toast.error('Please enter your mobile number');
      if (!/^[6-9]\d{9}$/.test(phoneNumber)) {
        return toast.error('Please enter a valid 10-digit Indian mobile number');
      }
    }

    setLoading(true);
    try {
      const payload: any = { name, email, password, role };
      if (role === 'vendor') {
        payload.phoneNumber = phoneNumber;
      }
      const response = await apiClient.post('/auth/register', payload);
      const { token, user } = response.data?.data || response.data;
      setAuth(token, user, role === 'vendor' ? 'vendor' : 'customer');
      toast.success('Account created successfully!');
      if (role === 'vendor') {
        router.push('/vendor/register');
      } else if (redirect) {
        router.push(redirect);
      } else {
        router.push('/profile');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full flex flex-col">
      {/* User / Pro Tab Switcher */}
      <div className="flex bg-muted/50 p-1 rounded-xl mb-8 w-full">
        <button 
          type="button"
          onClick={() => setRole('customer')}
          className={`flex-1 py-2.5 text-sm rounded-lg transition-all font-bold ${role === 'customer' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          User
        </button>
        <button 
          type="button"
          onClick={() => setRole('vendor')}
          className={`flex-1 py-2.5 text-sm rounded-lg transition-all font-bold ${role === 'vendor' ? 'bg-background shadow-sm text-foreground' : 'text-muted-foreground hover:text-foreground'}`}
        >
          Pro
        </button>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight text-foreground mb-2">
          {role === 'vendor' ? 'Create your Pro Account' : 'Create an account'}
        </h1>
        <p className="text-muted-foreground text-sm">
          {role === 'vendor' ? 'Become a service provider on NearByBazar' : 'Join thousands of users on NearByBazar'}
        </p>
      </div>

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

        {role === 'vendor' && (
          <div className="space-y-1">
            <label className="text-sm font-medium">Mobile Number</label>
            <div className="relative flex items-center">
              <span className="absolute left-3 text-muted-foreground font-bold text-sm">+91</span>
              <Input
                type="tel"
                placeholder="9999999999"
                className="h-12 pl-12 bg-muted/30 focus-visible:bg-background"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value.replace(/[^0-9]/g, '').slice(0, 10))}
                required
              />
            </div>
          </div>
        )}
        
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
              minLength={6}
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

      <div className="mt-8 text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link 
          href={redirect ? `/login?redirect=${encodeURIComponent(redirect)}` : '/login'} 
          className="font-semibold text-primary hover:underline"
        >
          Log in
        </Link>
      </div>
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<div className="flex items-center justify-center min-h-[300px] text-zinc-500 font-medium">Loading...</div>}>
      <RegisterForm />
    </Suspense>
  );
}
