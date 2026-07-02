'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Mail, Lock, Eye, EyeOff } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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

interface AuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export function AuthModal({ isOpen, onClose, onSuccess }: AuthModalProps) {
  const isDesktop = useMediaQuery('(min-width: 768px)');
  const { setAuth } = useAuthStore();
  
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  // Email/password state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const resetState = () => {
    setEmail('');
    setPassword('');
    setShowPassword(false);
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
      if (user?.role !== 'vendor' && user?.role !== 'admin' && !localStorage.getItem('tutorial_seen')) {
        localStorage.setItem('nbb_show_onboarding', '1');
      }
      toast.success('Successfully logged in!');
      handleClose();
      if (onSuccess) onSuccess();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const content = (
    <div className="flex flex-col w-full">
      <form onSubmit={handleEmailLogin} className="space-y-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Email or Mobile Number</label>
          <div className="relative">
            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="you@example.com or 9999999999"
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
      </form>
      
      <div className="mt-6 text-center text-xs text-muted-foreground font-medium">
        Don't have an account?{' '}
        <button onClick={() => { handleClose(); router.push('/register'); }} className="text-primary font-bold hover:underline">
          Sign up
        </button>
      </div>
    </div>
  );

  const title = 'Welcome to NearByBazar';
  const description = 'Log in or create an account to view vendor details.';

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
