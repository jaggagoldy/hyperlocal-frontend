'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, Save, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setAuth, token } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.dateOfBirth) {
      setDateOfBirth(user.dateOfBirth.split('T')[0]);
    }
    if (user?.gender) setGender(user.gender);
  }, [user]);

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return toast.error('Name cannot be empty.');
    setLoading(true);
    try {
      const res = await apiClient.put('/users/me', { 
        name: name.trim(),
        dateOfBirth: dateOfBirth || null,
        gender: gender || null
      });
      const updatedUser = res.data?.data || res.data;
      if (token) setAuth(token, { ...user!, ...updatedUser });
      toast.success('Profile updated successfully!');
      router.push('/profile');
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Failed to update profile.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-muted/20 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6">
        {/* Header */}
        <button
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Profile
        </button>

        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-8">
          <h1 className="text-2xl font-bold text-zinc-900 mb-1">Edit Profile</h1>
          <p className="text-zinc-500 text-sm mb-8">Update your personal information</p>

          <form onSubmit={handleSave} className="space-y-6">
            {/* Name */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700">Full Name</label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Your full name"
                  className="h-12 pl-10 bg-zinc-50 focus-visible:bg-white"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>
            </div>

            {/* Date of Birth */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700">Date of Birth</label>
              <div className="relative">
                <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="date"
                  className="h-12 pl-10 bg-zinc-50 focus-visible:bg-white text-zinc-800"
                  value={dateOfBirth}
                  onChange={(e) => setDateOfBirth(e.target.value)}
                />
              </div>
            </div>

            {/* Gender */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                className="flex h-12 w-full rounded-md border border-zinc-200 bg-zinc-50 px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 focus-visible:bg-white text-zinc-800"
              >
                <option value="">Select Gender</option>
                <option value="Male">Male</option>
                <option value="Female">Female</option>
                <option value="Other">Other</option>
                <option value="Prefer not to say">Prefer not to say</option>
              </select>
            </div>

            {/* Email (read-only) */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700">
                Email Address
                <span className="ml-2 text-xs font-normal text-zinc-400">(cannot be changed)</span>
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="email"
                  className="h-12 pl-10 bg-zinc-100 text-zinc-500 cursor-not-allowed"
                  value={user?.email || 'Not set'}
                  disabled
                />
              </div>
            </div>

            {/* Phone (read-only) */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700">
                Phone Number
                <span className="ml-2 text-xs font-normal text-zinc-400">(cannot be changed)</span>
              </label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  type="tel"
                  className="h-12 pl-10 bg-zinc-100 text-zinc-500 cursor-not-allowed"
                  value={user?.phoneNumber || 'Not set'}
                  disabled
                />
              </div>
            </div>

            <Button
              type="submit"
              className="w-full h-12 text-base font-semibold gap-2"
              disabled={loading || !name.trim()}
            >
              {loading ? (
                'Saving...'
              ) : (
                <>
                  <Save className="w-4 h-4" />
                  Save Changes
                </>
              )}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
