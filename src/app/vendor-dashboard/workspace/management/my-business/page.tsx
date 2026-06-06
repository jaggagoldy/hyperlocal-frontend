'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { ChevronRight, ArrowLeft, CheckCircle2, Phone, Utensils, Car, Scissors, Home, UploadCloud } from 'lucide-react';

// Layout Imports for Live Preview
import CabTransportLayout from '@/components/vendor/CabTransportLayout';
import FoodLayout from '@/components/vendor/FoodLayout';
import HomeServicesLayout from '@/components/vendor/HomeServicesLayout';

type BusinessType = 'FOOD_BEVERAGE' | 'CAB_TRANSPORT' | 'SALON_BEAUTY' | 'HOME_SERVICES' | '';

export default function MyBusinessWizardPage() {
  const router = useRouter();
  const { user, setActiveBusiness } = useAuthStore();
  
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [form, setForm] = useState({
    businessType: '' as BusinessType,
    businessName: '',
    city: '',
    address: '',
    description: '',
    
    // CAB_TRANSPORT Fields
    model: '',
    vehicleType: 'Sedan',
    ac: true,
    seats: 4,
    
    // FOOD_BEVERAGE Fields
    cuisineType: '',
    isPureVeg: false,
    fssai: '',
    
    // SALON_BEAUTY / HOME_SERVICES Fields
    experience: '',
    certifications: '',
    services: [] as string[]
  });

  const updateForm = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!form.businessType) return toast.error('Please select a business category');
      if (!form.businessName) return toast.error('Please enter a business name');
      if (!form.city) return toast.error('Please enter your city');
    }
    setStep(2);
  };

  const handleRegister = async () => {
    try {
      setIsSubmitting(true);
      
      // Map specialized fields strictly into the validated metaData JSON blob shape
      let metaData: any = {};
      
      if (form.businessType === 'CAB_TRANSPORT') {
        metaData = {
          model: form.model,
          vehicleType: form.vehicleType,
          ac: form.ac,
          seats: Number(form.seats)
        };
      } else if (form.businessType === 'FOOD_BEVERAGE') {
        metaData = {
          cuisineType: form.cuisineType,
          isPureVeg: form.isPureVeg,
          fssai: form.fssai
        };
      } else {
        metaData = {
          experience: form.experience,
          certifications: form.certifications,
          services: form.services
        };
      }

      const payload = {
        businessName: form.businessName,
        businessType: form.businessType,
        localityName: form.address,
        city: form.city,
        description: form.description,
        pincode: '000000', // Default
        locationType: 'Freelancer',
        timeAvailability: '9 AM - 6 PM',
        workingDays: 'Monday - Saturday',
        metaData
      };

      const res = await apiClient.post('/business/register', payload);
      toast.success('Business Created Successfully!');
      
      // Dispatch active business and route home
      setActiveBusiness(res.data?.data?.id);
      router.push('/vendor-dashboard/workspace');
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to register business');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Mock Business Object for Preview
  const previewBusiness: any = {
    businessName: form.businessName || 'Your Business Name',
    localityName: form.address || 'Your Business Address',
    city: form.city || 'City',
    description: form.description || 'Welcome to our business!',
    businessType: form.businessType || 'FOOD_BEVERAGE',
    isOnline: true,
    membershipTier: 'Pro',
    user: { phoneNumber: user?.phoneNumber || '9999999999' },
    metaData: {
      model: form.model,
      vehicleType: form.vehicleType,
      ac: form.ac,
      seats: form.seats,
      cuisineType: form.cuisineType,
      isPureVeg: form.isPureVeg,
      experience: form.experience,
    },
    // Mock Catalog items for preview so layouts don't crash
    catalogItems: form.businessType === 'FOOD_BEVERAGE' 
      ? [
          { id: '1', title: 'Example Dish 1', price: 299, variants: form.isPureVeg ? ['veg'] : ['veg', 'non-veg'], category: { name: 'Starters' } },
          { id: '2', title: 'Example Dish 2', price: 149, variants: form.isPureVeg ? ['veg'] : ['veg'], category: { name: 'Main Course' } }
        ]
      : form.businessType === 'CAB_TRANSPORT'
      ? [{ id: '1', title: form.model || 'Cab Booking', price: 500, category: { name: 'Transport' } }]
      : [{ id: '1', title: 'Example Service', price: 499, category: { name: 'Services' } }]
  };

  return (
    <div className="max-w-7xl mx-auto md:grid md:grid-cols-12 md:gap-8">
      
      {/* ─── LEFT SIDE (FORM) ─── */}
      <div className="md:col-span-7 bg-white rounded-2xl border border-zinc-200 shadow-sm p-6 lg:p-10 mb-8 md:mb-0">
        
        {/* Stepper Header */}
        <div className="flex items-center gap-4 border-b border-zinc-100 pb-6 mb-8">
          <div className="flex flex-col items-start relative w-1/2">
            <span className={`text-[10px] font-black uppercase tracking-wider ${step >= 1 ? 'text-[#1D4ED8]' : 'text-zinc-400'}`}>Step 1</span>
            <span className={`text-sm font-bold ${step >= 1 ? 'text-zinc-900' : 'text-zinc-500'}`}>Category & Core</span>
            <div className={`absolute -bottom-[25px] left-0 h-1 w-full rounded-full transition-all ${step >= 1 ? 'bg-[#1D4ED8]' : 'bg-transparent'}`}></div>
          </div>
          <ChevronRight className="w-4 h-4 text-zinc-300" />
          <div className="flex flex-col items-start relative w-1/2 pl-4">
            <span className={`text-[10px] font-black uppercase tracking-wider ${step >= 2 ? 'text-[#1D4ED8]' : 'text-zinc-400'}`}>Step 2</span>
            <span className={`text-sm font-bold ${step >= 2 ? 'text-zinc-900' : 'text-zinc-500'}`}>Dynamic Customization</span>
            <div className={`absolute -bottom-[25px] left-0 h-1 w-full rounded-full transition-all ${step >= 2 ? 'bg-[#1D4ED8]' : 'bg-transparent'}`}></div>
          </div>
        </div>

        <div className="space-y-8">
          
          {step === 1 && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
              
              <div>
                <h2 className="text-xl font-black text-zinc-900 mb-4">Select Business Category *</h2>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'FOOD_BEVERAGE', label: 'Restaurant / Cafe', icon: Utensils },
                    { id: 'CAB_TRANSPORT', label: 'Cab & Transport', icon: Car },
                    { id: 'SALON_BEAUTY', label: 'Salon & Beauty', icon: Scissors },
                    { id: 'HOME_SERVICES', label: 'Home Services', icon: Home },
                  ].map(cat => {
                    const Icon = cat.icon;
                    const isActive = form.businessType === cat.id;
                    return (
                      <button 
                        key={cat.id} 
                        onClick={() => updateForm('businessType', cat.id)}
                        className={`flex flex-col items-center justify-center p-4 rounded-xl border-2 transition-all ${
                          isActive ? 'border-[#1D4ED8] bg-blue-50/50' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'
                        }`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 ${isActive ? 'bg-[#1D4ED8] text-white' : 'bg-zinc-100 text-zinc-500'}`}>
                          <Icon className="w-5 h-5" />
                        </div>
                        <span className={`text-xs font-bold ${isActive ? 'text-[#1D4ED8]' : 'text-zinc-700'}`}>{cat.label}</span>
                      </button>
                    )
                  })}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Business Name *</label>
                  <input 
                    type="text" 
                    value={form.businessName}
                    onChange={(e) => updateForm('businessName', e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] outline-none transition-all text-sm font-semibold"
                    placeholder="e.g. Royal Tandoor Kitchen"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">City *</label>
                    <input 
                      type="text" 
                      value={form.city}
                      onChange={(e) => updateForm('city', e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] outline-none transition-all text-sm font-semibold"
                      placeholder="e.g. New Delhi"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Detailed Address</label>
                    <input 
                      type="text" 
                      value={form.address}
                      onChange={(e) => updateForm('address', e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] outline-none transition-all text-sm font-semibold"
                      placeholder="Shop No. 8, Ground Floor..."
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Description</label>
                  <textarea 
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-[#1D4ED8] focus:ring-1 focus:ring-[#1D4ED8] outline-none transition-all text-sm font-semibold resize-none"
                    placeholder="Tell your customers about your business..."
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={nextStep}
                  className="bg-[#1D4ED8] hover:bg-blue-800 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  Continue to Customization <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {step === 2 && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
              
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep(1)} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-black text-zinc-900">Custom Setup</h2>
                  <p className="text-xs text-zinc-500 font-medium mt-1">Configure options for {form.businessType}</p>
                </div>
              </div>

              {/* POLYMORPHIC FIELDS */}
              <div className="bg-zinc-50/50 p-5 rounded-2xl border border-zinc-200">
                
                {form.businessType === 'CAB_TRANSPORT' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700">Vehicle Model</label>
                      <input 
                        type="text" 
                        value={form.model}
                        onChange={(e) => updateForm('model', e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-[#1D4ED8] outline-none transition-all text-sm font-semibold"
                        placeholder="e.g. Maruti Swift Dzire"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700">Vehicle Type</label>
                        <select 
                          value={form.vehicleType}
                          onChange={(e) => updateForm('vehicleType', e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-[#1D4ED8] outline-none transition-all text-sm font-semibold"
                        >
                          <option value="Hatchback">Hatchback</option>
                          <option value="Sedan">Sedan</option>
                          <option value="SUV">SUV</option>
                          <option value="Auto">Auto Rickshaw</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700">Seat Capacity</label>
                        <input 
                          type="number" 
                          value={form.seats}
                          onChange={(e) => updateForm('seats', e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-[#1D4ED8] outline-none transition-all text-sm font-semibold"
                        />
                      </div>
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center gap-3 p-3 bg-white border border-zinc-200 rounded-xl cursor-pointer hover:border-zinc-300">
                        <input 
                          type="checkbox" 
                          checked={form.ac}
                          onChange={(e) => updateForm('ac', e.target.checked)}
                          className="w-5 h-5 rounded border-zinc-300 text-[#1D4ED8] focus:ring-[#1D4ED8]"
                        />
                        <span className="text-sm font-bold text-zinc-800">Has Air Conditioning (AC)</span>
                      </label>
                    </div>
                  </div>
                )}

                {form.businessType === 'FOOD_BEVERAGE' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700">Cuisine Focus (Optional)</label>
                      <input 
                        type="text" 
                        value={form.cuisineType}
                        onChange={(e) => updateForm('cuisineType', e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-[#1D4ED8] outline-none transition-all text-sm font-semibold"
                        placeholder="e.g. North Indian, Chinese"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700">FSSAI License Number</label>
                      <input 
                        type="text" 
                        value={form.fssai}
                        onChange={(e) => updateForm('fssai', e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-[#1D4ED8] outline-none transition-all text-sm font-semibold"
                        placeholder="Registration Number"
                      />
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center justify-between p-4 bg-white border border-emerald-200 rounded-xl cursor-pointer hover:border-emerald-300 shadow-sm">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 border-2 border-green-600 flex items-center justify-center p-[2px] rounded-sm">
                            <span className="w-2.5 h-2.5 bg-green-600 rounded-full"></span>
                          </span>
                          <div>
                            <span className="text-sm font-bold text-emerald-900 block">Pure Veg Restaurant</span>
                            <span className="text-xs font-medium text-emerald-600/80 block mt-0.5">Show only vegetarian options to customers</span>
                          </div>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={form.isPureVeg}
                          onChange={(e) => updateForm('isPureVeg', e.target.checked)}
                          className="w-5 h-5 rounded border-emerald-300 text-emerald-600 focus:ring-emerald-600"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {(form.businessType === 'SALON_BEAUTY' || form.businessType === 'HOME_SERVICES') && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700">Years of Experience</label>
                        <input 
                          type="number" 
                          value={form.experience}
                          onChange={(e) => updateForm('experience', e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-[#1D4ED8] outline-none transition-all text-sm font-semibold"
                          placeholder="e.g. 5"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700">Certifications (Optional)</label>
                        <input 
                          type="text" 
                          value={form.certifications}
                          onChange={(e) => updateForm('certifications', e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-[#1D4ED8] outline-none transition-all text-sm font-semibold"
                          placeholder="e.g. L'Oreal Expert"
                        />
                      </div>
                    </div>
                  </div>
                )}

              </div>

              <div className="pt-6 flex justify-between">
                <button 
                  onClick={() => router.push('/vendor-dashboard/workspace')}
                  className="text-zinc-500 font-bold px-4 hover:text-zinc-800"
                >
                  Cancel
                </button>
                <button 
                  onClick={handleRegister}
                  disabled={isSubmitting}
                  className="bg-zinc-900 hover:bg-black disabled:bg-zinc-400 text-white px-10 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center gap-2"
                >
                  {isSubmitting ? 'Registering...' : 'Create Business Space'}
                  {!isSubmitting && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                </button>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* ─── RIGHT SIDE (LIVE PREVIEW FRAME) ─── */}
      <div className="hidden md:block md:col-span-5 relative">
        <div className="sticky top-24 h-[750px] w-full max-w-[375px] mx-auto bg-zinc-950 rounded-[40px] border-[12px] border-zinc-900 shadow-2xl overflow-hidden flex flex-col relative">
          
          {/* iOS Dynamic Island Notch */}
          <div className="absolute top-0 inset-x-0 h-6 flex justify-center z-50">
            <div className="w-32 h-6 bg-zinc-900 rounded-b-3xl"></div>
          </div>
          
          {/* Screen Content Wrapper */}
          <div className="flex-1 w-full h-full overflow-y-auto bg-white scrollbar-hide pointer-events-none pb-20">
            {!form.businessType ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-50">
                <div className="w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                  <Phone className="w-8 h-8 text-[#1D4ED8]" />
                </div>
                <h3 className="text-lg font-black text-zinc-900">Live Preview</h3>
                <p className="text-sm font-medium text-zinc-500 mt-2">Select a business category to see how your native app interface will look to customers.</p>
              </div>
            ) : (
              <div className="scale-[0.9] origin-top h-full w-full">
                {form.businessType === 'CAB_TRANSPORT' && <CabTransportLayout business={previewBusiness} theme="trust-utility" />}
                {form.businessType === 'FOOD_BEVERAGE' && <FoodLayout business={previewBusiness} theme="playful-vibrant" />}
                {(form.businessType === 'SALON_BEAUTY' || form.businessType === 'HOME_SERVICES') && <HomeServicesLayout business={previewBusiness} theme="premium-elegant" />}
              </div>
            )}
          </div>

          {/* iOS Home Indicator */}
          <div className="absolute bottom-1 inset-x-0 h-5 flex justify-center items-center z-50 bg-zinc-950/20 backdrop-blur-sm pt-2">
            <div className="w-32 h-1 bg-white/50 rounded-full"></div>
          </div>

        </div>

        {/* Live Indicator Badge */}
        <div className="absolute top-28 -right-4 bg-emerald-500 text-white text-[10px] font-black px-3 py-1.5 rounded-full shadow-lg border-2 border-white flex items-center gap-1.5 animate-bounce">
          <span className="w-2 h-2 rounded-full bg-white animate-pulse"></span> LIVE PREVIEW
        </div>

      </div>

    </div>
  );
}
