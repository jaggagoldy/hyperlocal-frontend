'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Lock, Eye, EyeOff, ShieldCheck } from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function SecurityPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [form, setForm] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const handleChange = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.newPassword !== form.confirmPassword) {
      return toast.error('New passwords do not match.');
    }
    if (form.newPassword.length < 8) {
      return toast.error('New password must be at least 8 characters.');
    }
    setLoading(true);
    try {
      await apiClient.post('/users/change-password', {
        currentPassword: form.currentPassword,
        newPassword: form.newPassword,
      });
      toast.success('Password changed successfully!');
      setForm({ currentPassword: '', newPassword: '', confirmPassword: '' });
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to change password.');
    } finally {
      setLoading(false);
    }
  };

  const PasswordInput = ({
    label, value, field, show, onToggle, placeholder
  }: {
    label: string; value: string; field: string;
    show: boolean; onToggle: () => void; placeholder: string;
  }) => (
    <div className="space-y-1.5">
      <label className="text-sm font-semibold text-zinc-700">{label}</label>
      <div className="relative">
        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          type={show ? 'text' : 'password'}
          placeholder={placeholder}
          className="h-12 pl-10 pr-10 bg-zinc-50 focus-visible:bg-white"
          value={value}
          onChange={(e) => handleChange(field, e.target.value)}
          required
        />
        <button
          type="button"
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground p-1"
          onClick={onToggle}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        <button
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8 mb-4">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5 text-emerald-600" />
            </div>
            <h1 className="text-2xl font-bold text-zinc-900">Security</h1>
          </div>
          <p className="text-zinc-500 text-sm mb-8 ml-[52px]">Manage your password and account safety</p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <PasswordInput
              label="Current Password"
              value={form.currentPassword}
              field="currentPassword"
              show={showCurrent}
              onToggle={() => setShowCurrent(!showCurrent)}
              placeholder="Your current password"
            />
            <PasswordInput
              label="New Password"
              value={form.newPassword}
              field="newPassword"
              show={showNew}
              onToggle={() => setShowNew(!showNew)}
              placeholder="Min. 8 characters"
            />
            <PasswordInput
              label="Confirm New Password"
              value={form.confirmPassword}
              field="confirmPassword"
              show={showConfirm}
              onToggle={() => setShowConfirm(!showConfirm)}
              placeholder="Repeat new password"
            />

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold"
              disabled={loading || !form.currentPassword || !form.newPassword || !form.confirmPassword}
            >
              {loading ? 'Updating...' : 'Update Password'}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
