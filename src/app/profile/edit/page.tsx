'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Mail, Phone, Save, Calendar } from 'lucide-react';
import { toast } from 'sonner';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { InputOTP, InputOTPGroup, InputOTPSlot } from '@/components/ui/input-otp';
import { CheckCircle2, AlertCircle } from 'lucide-react';
import { auth } from '@/lib/firebase';
import { RecaptchaVerifier, signInWithPhoneNumber, ConfirmationResult } from 'firebase/auth';

export default function EditProfilePage() {
  const router = useRouter();
  const { user, setAuth, token } = useAuthStore();
  const [name, setName] = useState(user?.name || '');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [gender, setGender] = useState('');
  const [loading, setLoading] = useState(false);

  // Phone Verification States
  const [phoneToVerify, setPhoneToVerify] = useState(user?.phoneNumber || '');
  const [verifyMode, setVerifyMode] = useState<'idle' | 'otp'>('idle');
  const [otp, setOtp] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [confirmationResult, setConfirmationResult] = useState<ConfirmationResult | null>(null);
  const recaptchaRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (user?.name) setName(user.name);
    if (user?.dateOfBirth) {
      setDateOfBirth(user.dateOfBirth.split('T')[0]);
    }
    if (user?.gender) setGender(user.gender);
    if (user?.phoneNumber && !phoneToVerify) setPhoneToVerify(user.phoneNumber);
  }, [user]);

  // Recaptcha for inline verify
  useEffect(() => {
    if (user?.isPhoneVerified) return; // Only init if needed
    if (!recaptchaRef.current) return;
    try {
      (window as any).recaptchaVerifierProfile = new RecaptchaVerifier(auth, recaptchaRef.current, {
        size: 'invisible',
      });
    } catch (e) {
      console.error('Failed to init recaptcha', e);
    }
    return () => {
      if ((window as any).recaptchaVerifierProfile) {
        try {
          (window as any).recaptchaVerifierProfile.clear();
        } catch (e) {}
        (window as any).recaptchaVerifierProfile = null;
      }
    };
  }, [user?.isPhoneVerified]);

  const handleRequestOtp = async () => {
    if (phoneToVerify.length !== 10) {
      return toast.error('Please enter a valid 10-digit mobile number.');
    }
    setIsVerifying(true);
    try {
      const formattedPhone = `+91${phoneToVerify}`;
      const confirmation = await signInWithPhoneNumber(auth, formattedPhone, (window as any).recaptchaVerifierProfile);
      setConfirmationResult(confirmation);
      toast.success('OTP sent successfully!');
      setVerifyMode('otp');
    } catch (error: any) {
      console.error(error);
      toast.error('Failed to send OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (otp.length !== 6) return toast.error('Please enter a 6-digit OTP.');
    if (!confirmationResult) return toast.error('OTP session expired. Please request again.');
    
    setIsVerifying(true);
    try {
      const result = await confirmationResult.confirm(otp);
      const idToken = await result.user.getIdToken();
      
      const res = await apiClient.post('/auth/verify-profile-phone', { idToken });
      const updatedUser = res.data?.data?.user;
      
      if (token && updatedUser) {
        setAuth(token, updatedUser);
      }
      toast.success('Phone number verified successfully!');
      setVerifyMode('idle');
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Invalid OTP. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

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

            {/* Phone (read-only if verified, editable if unverified) */}
            <div className="space-y-1.5">
              <label className="text-sm font-semibold text-zinc-700 flex justify-between">
                <span>Phone Number</span>
                {user?.isPhoneVerified ? (
                  <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                    <CheckCircle2 className="w-3 h-3" /> Verified
                  </span>
                ) : (
                  <span className="flex items-center gap-1 text-xs text-amber-600 font-medium">
                    <AlertCircle className="w-3 h-3" /> Verification Required
                  </span>
                )}
              </label>

              {user?.isPhoneVerified ? (
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    type="tel"
                    className="h-12 pl-10 bg-zinc-100 text-zinc-500 cursor-not-allowed border-zinc-200"
                    value={user?.phoneNumber || 'Not set'}
                    disabled
                  />
                </div>
              ) : (
                <div className="space-y-4 p-4 border border-amber-200 bg-amber-50/50 rounded-xl">
                  {verifyMode === 'idle' ? (
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                        <span className="absolute left-9 top-1/2 -translate-y-1/2 text-sm text-zinc-500 font-medium border-r pr-2 border-zinc-200">
                          +91
                        </span>
                        <Input
                          type="tel"
                          maxLength={10}
                          placeholder="10-digit mobile number"
                          className="h-12 pl-[4.5rem] bg-white"
                          value={phoneToVerify}
                          onChange={(e) => setPhoneToVerify(e.target.value.replace(/\D/g, ''))}
                        />
                      </div>
                      <Button 
                        type="button" 
                        onClick={handleRequestOtp} 
                        disabled={isVerifying || phoneToVerify.length !== 10}
                        className="h-12"
                      >
                        {isVerifying ? 'Wait...' : 'Verify'}
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-sm text-zinc-600">Enter the 6-digit OTP sent to +91 {phoneToVerify}</p>
                      <div className="flex gap-2">
                        <div className="flex-1">
                          <InputOTP
                            maxLength={6}
                            value={otp}
                            onChange={setOtp}
                            containerClassName="justify-center gap-2"
                          >
                            <InputOTPGroup className="gap-2">
                              {[...Array(6)].map((_, i) => (
                                <InputOTPSlot 
                                  key={i} 
                                  index={i} 
                                  className="w-10 h-12 text-lg rounded-md border-zinc-200 bg-white" 
                                />
                              ))}
                            </InputOTPGroup>
                          </InputOTP>
                        </div>
                        <Button 
                          type="button" 
                          onClick={handleVerifyOtp} 
                          disabled={isVerifying || otp.length !== 6}
                          className="h-12"
                        >
                          {isVerifying ? 'Verifying...' : 'Submit'}
                        </Button>
                      </div>
                      <button 
                        type="button"
                        onClick={() => { setVerifyMode('idle'); setOtp(''); }}
                        className="text-xs font-medium text-muted-foreground hover:text-zinc-800"
                      >
                        Change Number
                      </button>
                    </div>
                  )}
                  <div ref={recaptchaRef}></div>
                </div>
              )}
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
