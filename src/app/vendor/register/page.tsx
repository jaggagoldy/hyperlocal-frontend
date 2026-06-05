'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Briefcase, MapPin, ShieldCheck, Check, ArrowLeft, ArrowRight,
  Store, User, ChevronDown, AlertCircle
} from 'lucide-react';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';
import { useVendorRegistrationStore } from '@/store/vendorRegistrationStore';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

// ─── Types ────────────────────────────────────────────────────────────────────
interface Category { id: string; name: string; slug: string; }
interface City { id: string; name: string; slug: string; }

// Removed local FormData type as it's defined in the store

const STEPS = [
  { num: 1, label: 'Business', icon: Briefcase },
  { num: 2, label: 'Location', icon: MapPin },
  { num: 3, label: 'Verify', icon: ShieldCheck },
];

const ID_TYPES = ['Aadhaar', 'PAN', 'GST', 'Driving Licence'];

// ─── Main Component ───────────────────────────────────────────────────────────
export default function VendorRegisterPage() {
  const router = useRouter();
  const { user, token, setAuth } = useAuthStore();
  const { step, setStep, form, setFormField, customCategory, setCustomCategory, reset } = useVendorRegistrationStore();
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [cities, setCities] = useState<City[]>([]);

  // Onboarding URL params parsing
  const [onboardingToken, setOnboardingToken] = useState<string | null>(null);
  const [isGoogle, setIsGoogle] = useState(false);
  
  // Onboarding user details
  const [personalName, setPersonalName] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [personalPassword, setPersonalPassword] = useState('');
  const [personalPhone, setPersonalPhone] = useState('');
  const [personalGender, setPersonalGender] = useState('');
  const [personalDob, setPersonalDob] = useState('');

  // Extract query params safely on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('onboardingToken');
      const google = urlParams.get('isGoogle') === 'true';
      if (token) setOnboardingToken(token);
      setIsGoogle(google);
    }
  }, []);

  // Load categories & cities on mount
  useEffect(() => {
    const load = async () => {
      try {
        const [catRes, cityRes] = await Promise.all([
          apiClient.get('/search/categories'),
          apiClient.get('/search/cities'),
        ]);
        setCategories(catRes.data?.data || []);
        setCities(cityRes.data?.data || []);
      } catch {
        // fallback to defaults if API fails
        setCategories([
          { id: 'plumber', name: 'Plumber', slug: 'plumber' },
          { id: 'electrician', name: 'Electrician', slug: 'electrician' },
          { id: 'ac-repair', name: 'AC Repair', slug: 'ac-repair' },
          { id: 'carpenter', name: 'Carpenter', slug: 'carpenter' },
          { id: 'painter', name: 'Painter', slug: 'painter' },
        ]);
        setCities([
          { id: 'dadri', name: 'Dadri', slug: 'dadri' },
          { id: 'greater-noida', name: 'Greater Noida', slug: 'greater-noida' },
        ]);
      }
    };
    load();
  }, []);

  const set = (field: Parameters<typeof setFormField>[0], value: string) =>
    setFormField(field, value);

  const progress = (step / 3) * 100;

  // ── Validation ──
  const isPersonalValid = onboardingToken 
    ? (isGoogle ? (!!personalPhone && !!personalGender && !!personalDob) : (!!personalName && !!personalEmail && !!personalPassword && !!personalGender && !!personalDob))
    : true;

  const step1Valid = form.businessName.trim() && form.categoryId && form.businessType && (form.categoryId !== 'other' || customCategory.trim()) && form.locationType && isPersonalValid;
  const step2Valid = form.cityName && form.localityName.trim() && form.pincode.length === 6;

  // ── Submit ──
  const handleSubmit = async (withVerification: boolean) => {
    setLoading(true);
    try {
      let currentToken = token;
      let currentUser = user;

      // 1. If we have an onboardingToken, register the user FIRST
      if (onboardingToken && !token) {
        const onboardPayload: any = {
          onboardingToken,
          address: `${form.localityName}, ${form.cityName}, ${form.pincode}`,
          gender: personalGender,
          dateOfBirth: personalDob,
        };
        
        if (isGoogle) {
          onboardPayload.phoneNumber = personalPhone;
        } else {
          onboardPayload.name = personalName;
          onboardPayload.email = personalEmail;
          onboardPayload.password = personalPassword;
        }

        const onboardRes = await apiClient.post('/auth/onboard', onboardPayload);
        currentToken = onboardRes.data?.data?.token || onboardRes.data?.token;
        currentUser = onboardRes.data?.data?.user || onboardRes.data?.user;
        
        // Temporarily set auth so the next API call includes the JWT
        if (currentToken && currentUser) {
          setAuth(currentToken, currentUser);
          apiClient.defaults.headers.common['Authorization'] = `Bearer ${currentToken}`;
        }
      }

      // Build a unique registration number (business + timestamp)
      const registrationNumber = `${form.businessName.replace(/\s+/g, '').toUpperCase().slice(0, 6)}-${Date.now()}`;

      const payload: Record<string, any> = {
        businessName: form.businessName.trim(),
        registrationNumber,
        localityName: form.localityName.trim(),
        pincode: form.pincode,
        cityName: form.cityName,
        locationType: form.locationType,
        businessType: form.businessType,
        categoryIds: form.categoryId === 'other' ? [] : [form.categoryId],
        requestedCategory: form.categoryId === 'other' ? customCategory.trim() : null,
      };

      if (withVerification && form.idType && form.idNumber) {
        payload.idType = form.idType;
        payload.idNumber = form.idNumber.trim();
      }

      await apiClient.post('/vendors/register', payload);

      // Update user role in store so Navbar reacts immediately
      if (currentToken && currentUser) {
        setAuth(currentToken, { ...currentUser, role: 'vendor' });
      }

      toast.success('Welcome to NearByBazar Pro! 🎉', {
        description: 'Your vendor profile is now live.',
        duration: 5000,
      });
      reset(); // clear state on success
      router.push('/vendor-dashboard');
    } catch (error: any) {
      const msg = error.response?.data?.message || 'Registration failed. Please try again.';
      toast.error(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-50 flex flex-col">
      {/* Gradient strip */}
      <div className="h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500" />

      {/* Progress header */}
      <div className="bg-white border-b border-zinc-100 px-6 py-4 sticky top-0 z-10">
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-3">
            {STEPS.map((s, i) => (
              <div key={s.num} className="flex items-center gap-2 flex-1">
                <div className="flex flex-col items-center gap-1">
                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-300 ${
                    s.num < step
                      ? 'bg-emerald-500 text-white shadow-sm shadow-emerald-200'
                      : s.num === step
                      ? 'bg-primary text-white shadow-sm shadow-primary/30'
                      : 'bg-zinc-100 text-zinc-400'
                  }`}>
                    {s.num < step ? <Check className="w-4 h-4" /> : <s.icon className="w-4 h-4" />}
                  </div>
                  <span className={`text-[10px] font-bold tracking-wide ${
                    s.num === step ? 'text-primary' : s.num < step ? 'text-emerald-600' : 'text-zinc-400'
                  }`}>
                    {s.label}
                  </span>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`flex-1 h-0.5 mx-2 rounded-full mb-5 transition-all ${s.num < step ? 'bg-emerald-400' : 'bg-zinc-200'}`} />
                )}
              </div>
            ))}
          </div>
          <div className="h-1 bg-zinc-100 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 flex items-start justify-center px-4 py-10">
        <div className="w-full max-w-lg">

          {/* ─── STEP 1: Business Profile ─── */}
          {step === 1 && (
            <div className="space-y-8">
              <div>
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <Briefcase className="w-6 h-6 text-primary" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 mb-1">Your Business Profile</h1>
                <p className="text-zinc-500 text-sm">Tell customers what you offer and how you work.</p>
              </div>

              <div className="space-y-5">
                {/* Conditionally ask for Personal Details if onboarding new user */}
                {onboardingToken && (
                  <div className="p-4 bg-muted/30 rounded-xl space-y-4 mb-4 border border-zinc-100">
                    <h3 className="text-sm font-bold text-zinc-900">Personal Details</h3>
                    
                    {!isGoogle && (
                      <>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-600 uppercase">Your Full Name</label>
                          <Input className="h-11 bg-white" value={personalName} onChange={e => setPersonalName(e.target.value)} required />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-600 uppercase">Email Address</label>
                          <Input className="h-11 bg-white" type="email" value={personalEmail} onChange={e => setPersonalEmail(e.target.value)} required />
                        </div>
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-600 uppercase">Set Password</label>
                          <Input className="h-11 bg-white" type="password" value={personalPassword} onChange={e => setPersonalPassword(e.target.value)} required minLength={6} />
                        </div>
                      </>
                    )}

                    {isGoogle && (
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-600 uppercase">Phone Number</label>
                        <Input className="h-11 bg-white" type="tel" value={personalPhone} onChange={e => setPersonalPhone(e.target.value)} placeholder="+91" required pattern="^[6-9]\d{9}$" />
                      </div>
                    )}

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-600 uppercase">Gender</label>
                        <div className="relative">
                          <select 
                            className="w-full h-11 px-3 rounded-lg border border-zinc-200 bg-white text-sm focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none"
                            value={personalGender}
                            onChange={(e) => setPersonalGender(e.target.value)}
                            required
                          >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-600 uppercase">Date of Birth</label>
                        <Input 
                          className="h-11 bg-white" 
                          type="date" 
                          value={personalDob} 
                          onChange={e => setPersonalDob(e.target.value)} 
                          max={new Date().toISOString().split('T')[0]}
                          required 
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Business Name */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700">Business / Professional Name</label>
                  <Input
                    placeholder="e.g. Ramesh Electricals, Sharma Plumbing..."
                    className="h-12 bg-white rounded-xl border-zinc-200 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                    value={form.businessName}
                    onChange={(e) => set('businessName', e.target.value)}
                  />
                </div>

                {/* Category */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700">Your Service Category</label>
                  <div className="relative">
                    <select
                      className="w-full h-12 px-4 pr-10 rounded-xl border border-zinc-200 text-sm bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none font-medium"
                      value={form.categoryId}
                      onChange={(e) => set('categoryId', e.target.value)}
                    >
                      <option value="">Select a category...</option>
                      {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>{cat.name}</option>
                      ))}
                      <option value="other">Other (Custom Category)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                {/* Business Type */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700">Business Model</label>
                  <div className="relative">
                    <select
                      className="w-full h-12 px-4 pr-10 rounded-xl border border-zinc-200 text-sm bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none font-medium"
                      value={form.businessType}
                      onChange={(e) => set('businessType', e.target.value)}
                    >
                      <option value="">Select how you operate...</option>
                      <option value="RESTAURANT">Restaurant</option>
                      <option value="CLOUD_KITCHEN">Cloud Kitchen</option>
                      <option value="STREET_VENDOR">Street Food / Kiosk</option>
                      <option value="CHEF">Personal Chef / Catering</option>
                      <option value="SALON">Salon / Spa</option>
                      <option value="EVENT_SERVICE">Event Service</option>
                      <option value="HOME_MAINTENANCE">Home Maintenance (Electrician, Plumber)</option>
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                {/* Custom Category input */}
                {form.categoryId === 'other' && (
                  <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1 duration-200">
                    <label className="text-sm font-semibold text-zinc-700">Please specify your service type</label>
                    <Input
                      placeholder="e.g. Tuition, Kitchen Help, Pet Care..."
                      className="h-12 bg-white rounded-xl border-zinc-200 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                      value={customCategory}
                      onChange={(e) => setCustomCategory(e.target.value)}
                    />
                    {customCategory.length > 2 && categories.find(c => c.name.toLowerCase().includes(customCategory.toLowerCase()) || customCategory.toLowerCase().includes(c.name.toLowerCase())) && (
                      <div className="mt-2 text-sm bg-primary/5 text-primary p-3 rounded-xl flex justify-between items-center border border-primary/20">
                         <span>Did you mean <strong>{categories.find(c => c.name.toLowerCase().includes(customCategory.toLowerCase()) || customCategory.toLowerCase().includes(c.name.toLowerCase()))?.name}</strong>?</span>
                         <Button type="button" size="sm" className="h-8 text-xs font-bold" onClick={() => {
                           const matched = categories.find(c => c.name.toLowerCase().includes(customCategory.toLowerCase()) || customCategory.toLowerCase().includes(c.name.toLowerCase()));
                           if (matched) set('categoryId', matched.id);
                           setCustomCategory('');
                         }}>Use This</Button>
                      </div>
                    )}
                  </div>
                )}

                {/* Business Type */}
                <div className="space-y-2">
                  <label className="text-sm font-semibold text-zinc-700">How do you work?</label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { value: 'Freelancer', icon: User, title: 'Independent Pro', desc: 'I come to the client' },
                      { value: 'Shop', icon: Store, title: 'Shop / Studio', desc: 'I have a fixed location' },
                    ].map((opt) => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => set('locationType', opt.value)}
                        className={`p-4 rounded-xl border-2 text-left transition-all ${
                          form.locationType === opt.value
                            ? 'border-primary bg-primary/5 shadow-sm'
                            : 'border-zinc-200 bg-white hover:border-zinc-300'
                        }`}
                      >
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center mb-2 ${
                          form.locationType === opt.value ? 'bg-primary text-white' : 'bg-zinc-100 text-zinc-500'
                        }`}>
                          <opt.icon className="w-4 h-4" />
                        </div>
                        <p className={`text-sm font-bold ${form.locationType === opt.value ? 'text-primary' : 'text-zinc-800'}`}>
                          {opt.title}
                        </p>
                        <p className="text-xs text-zinc-500 mt-0.5">{opt.desc}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              <Button
                onClick={() => setStep(2)}
                disabled={!step1Valid}
                className="w-full h-12 text-base font-semibold gap-2 rounded-xl"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* ─── STEP 2: Location ─── */}
          {step === 2 && (
            <div className="space-y-8">
              <div>
                <button
                  onClick={() => setStep(1)}
                  className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="w-12 h-12 rounded-xl bg-emerald-50 flex items-center justify-center mb-4">
                  <MapPin className="w-6 h-6 text-emerald-600" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 mb-1">Service Location</h1>
                <p className="text-zinc-500 text-sm">Help customers in your area find you easily.</p>
              </div>

              <div className="space-y-5">
                {/* City */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700">City</label>
                  <div className="relative">
                    <select
                      className="w-full h-12 px-4 pr-10 rounded-xl border border-zinc-200 text-sm bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none font-medium"
                      value={form.cityName}
                      onChange={(e) => set('cityName', e.target.value)}
                    >
                      <option value="">Select your city...</option>
                      {cities.map((c) => (
                        <option key={c.id} value={c.name}>{c.name}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                {/* Area / Locality */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700">Area / Locality</label>
                  <Input
                    placeholder="e.g. Sector 62, Alpha 1, Surajpur..."
                    className="h-12 bg-white rounded-xl border-zinc-200 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                    value={form.localityName}
                    onChange={(e) => set('localityName', e.target.value)}
                  />
                </div>

                {/* Pincode */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700">Pincode</label>
                  <Input
                    placeholder="6-digit pincode"
                    type="tel"
                    maxLength={6}
                    className="h-12 bg-white rounded-xl border-zinc-200 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                    value={form.pincode}
                    onChange={(e) => set('pincode', e.target.value.replace(/\D/g, '').slice(0, 6))}
                  />
                </div>
              </div>

              <Button
                onClick={() => setStep(3)}
                disabled={!step2Valid}
                className="w-full h-12 text-base font-semibold gap-2 rounded-xl"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </Button>
            </div>
          )}

          {/* ─── STEP 3: Verification ─── */}
          {step === 3 && (
            <div className="space-y-8">
              <div>
                <button
                  onClick={() => setStep(2)}
                  className="flex items-center gap-1.5 text-sm text-zinc-400 hover:text-zinc-600 mb-4 transition-colors"
                >
                  <ArrowLeft className="w-4 h-4" /> Back
                </button>
                <div className="w-12 h-12 rounded-xl bg-amber-50 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6 text-amber-600" />
                </div>
                <h1 className="text-2xl font-bold text-zinc-900 mb-1">Get Verified</h1>
                <p className="text-zinc-500 text-sm">
                  Verified pros get a <span className="font-semibold text-emerald-600">✓ Verified badge</span> and rank higher in search results.
                </p>
              </div>

              {/* Verification psychological incentive */}
              <div className="grid grid-cols-2 gap-3 mb-2">
                <div className="border border-zinc-200 bg-zinc-50 rounded-xl p-3 opacity-60 grayscale flex flex-col items-center text-center">
                  <div className="w-10 h-10 bg-zinc-200 rounded-full mb-2"></div>
                  <div className="text-xs font-bold text-zinc-500 mb-1">Standard Profile</div>
                  <div className="text-[10px] text-zinc-400">Average visibility</div>
                </div>
                <div className="border border-emerald-200 bg-emerald-50 rounded-xl p-3 flex flex-col items-center text-center shadow-xs ring-1 ring-emerald-500/20">
                  <div className="w-10 h-10 bg-emerald-100 rounded-full mb-2 flex items-center justify-center">
                    <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                    Verified Profile <Check className="w-3 h-3" />
                  </div>
                  <div className="text-[10px] font-bold text-emerald-600/80">Gets 3x more leads!</div>
                </div>
              </div>
              <p className="text-[10px] text-center text-zinc-400 font-medium pb-2">You can also skip this and verify your identity later from your dashboard.</p>

              <div className="space-y-5">
                {/* ID Type */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700">
                    ID Type
                    <span className="ml-1.5 text-xs font-normal text-zinc-400">Optional</span>
                  </label>
                  <div className="relative">
                    <select
                      className="w-full h-12 px-4 pr-10 rounded-xl border border-zinc-200 text-sm bg-white text-zinc-800 focus:outline-none focus:ring-1 focus:ring-primary focus:border-primary appearance-none font-medium"
                      value={form.idType}
                      onChange={(e) => set('idType', e.target.value)}
                    >
                      <option value="">Select ID type...</option>
                      {ID_TYPES.map((t) => (
                        <option key={t} value={t}>{t}</option>
                      ))}
                    </select>
                    <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-400 pointer-events-none" />
                  </div>
                </div>

                {/* ID Number */}
                <div className="space-y-1.5">
                  <label className="text-sm font-semibold text-zinc-700">
                    ID Number
                    <span className="ml-1.5 text-xs font-normal text-zinc-400">Optional</span>
                  </label>
                  <Input
                    placeholder="Enter your ID number..."
                    className="h-12 bg-white rounded-xl border-zinc-200 focus-visible:border-primary focus-visible:ring-1 focus-visible:ring-primary"
                    value={form.idNumber}
                    onChange={(e) => set('idNumber', e.target.value)}
                    disabled={!form.idType}
                  />
                </div>
              </div>

              {/* Submit buttons */}
              <div className="space-y-3">
                <Button
                  onClick={() => handleSubmit(true)}
                  disabled={loading || !form.idType || !form.idNumber.trim()}
                  className="w-full h-12 text-base font-semibold rounded-xl gap-2"
                >
                  {loading ? 'Submitting...' : (
                    <><ShieldCheck className="w-4 h-4" /> Submit with Verification</>
                  )}
                </Button>

                <button
                  type="button"
                  onClick={() => handleSubmit(false)}
                  disabled={loading}
                  className="w-full py-3 text-sm text-zinc-400 hover:text-zinc-700 font-medium transition-colors disabled:opacity-50"
                >
                  {loading ? '...' : 'Skip verification & submit profile →'}
                </button>
              </div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
