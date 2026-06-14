'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';
import { Store, Car, Home, Scissors, ChevronRight, Loader2, ArrowLeft, Building } from 'lucide-react';
import { toast } from 'sonner';

const BUSINESS_TYPES = [
  { id: 'FOOD_BEVERAGE', title: 'Food & Beverage', icon: Store, color: 'text-orange-500', bg: 'bg-orange-500/10' },
  { id: 'SALON_BEAUTY', title: 'Salon & Beauty', icon: Scissors, color: 'text-pink-500', bg: 'bg-pink-500/10' },
];

export default function AddBusinessWizard({ onClose, onSuccess }: { onClose: () => void, onSuccess: () => void }) {
  const [step, setStep] = useState<1 | 2>(1);
  const [businessType, setBusinessType] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useAuthStore();

  // Core Form State
  const [formData, setFormData] = useState({
    businessName: '',
    address: '',
    landmark: '',
    city: '',
    pincode: '',
    // Cab specific
    vehicleModel: '',
    vehicleType: 'SEDAN',
    acType: 'AC',
    seats: '4',
    // Food specific
    cuisineType: '',
    dietaryType: 'MIXED',
    fssai: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleNext = () => {
    if (!businessType) {
      toast.error('Please select a business type');
      return;
    }
    setStep(2);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Build MetaData based on business type
      let metaData = {};
      if (businessType === 'CAB_TRANSPORT') {
        metaData = {
          vehicleDetails: {
            model: formData.vehicleModel,
            type: formData.vehicleType,
            ac: formData.acType === 'AC',
            seats: parseInt(formData.seats, 10)
          }
        };
      } else if (businessType === 'FOOD_BEVERAGE') {
        metaData = {
          restaurantDetails: {
            cuisine: formData.cuisineType,
            dietary: formData.dietaryType,
            fssaiLicense: formData.fssai
          }
        };
      }

      const payload = {
        userId: user?.id,
        businessName: formData.businessName,
        businessType,
        address: formData.address,
        landmark: formData.landmark,
        city: formData.city,
        pincode: formData.pincode,
        metaData
      };

      // Since we renamed the register route in backend, ensure it exists or use standard create.
      // Wait, is there a '/api/v1/business/register'? The API routes for business creation usually lie in business.controller.js.
      // In the previous task, we refactored the backend. I'll assume POST /api/v1/business or /api/v1/business/register.
      // Let's use POST /api/v1/business
      await apiClient.post('/business', payload);
      
      toast.success('Business created successfully!');
      onSuccess();
    } catch (error: any) {
      // error is handled by apiClient interceptor normally, but we can stop loading
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 flex flex-col max-h-[90vh]">
        
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950">
          <div className="flex items-center gap-3">
            {step === 2 && (
              <button onClick={() => setStep(1)} className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors">
                <ArrowLeft className="w-5 h-5 text-slate-600 dark:text-slate-400" />
              </button>
            )}
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100">
              {step === 1 ? 'Choose Business Type' : 'Business Details'}
            </h2>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-2 text-2xl leading-none">&times;</button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          {step === 1 ? (
            <div className="space-y-4">
              <p className="text-slate-500 text-sm mb-6">Select the category that best describes your new business venture on Vendor OS.</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {BUSINESS_TYPES.map((type) => {
                  const Icon = type.icon;
                  const isSelected = businessType === type.id;
                  return (
                    <div 
                      key={type.id} 
                      onClick={() => setBusinessType(type.id)}
                      className={`cursor-pointer border rounded-xl p-4 flex flex-col items-start gap-3 transition-all duration-200 ${
                        isSelected 
                          ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-500/10 shadow-sm ring-1 ring-indigo-500' 
                          : 'border-slate-200 dark:border-slate-800 hover:border-indigo-300 dark:hover:border-indigo-700 hover:bg-slate-50 dark:hover:bg-slate-800/50'
                      }`}
                    >
                      <div className={`p-3 rounded-lg ${type.bg}`}>
                        <Icon className={`w-6 h-6 ${type.color}`} />
                      </div>
                      <span className={`font-semibold ${isSelected ? 'text-indigo-700 dark:text-indigo-300' : 'text-slate-700 dark:text-slate-300'}`}>
                        {type.title}
                      </span>
                    </div>
                  );
                })}
              </div>
              <div className="mt-8 flex justify-end">
                <button 
                  onClick={handleNext}
                  disabled={!businessType}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              
              <div className="space-y-4">
                <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-2">
                  <Building className="w-4 h-4 text-indigo-500" /> Core Information
                </h3>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Business Name *</label>
                  <input required name="businessName" value={formData.businessName} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700" placeholder="e.g. The Grand Kitchen" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">City *</label>
                    <input required name="city" value={formData.city} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700" placeholder="Mumbai" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Pincode *</label>
                    <input required name="pincode" value={formData.pincode} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700" placeholder="400001" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Complete Address *</label>
                  <input required name="address" value={formData.address} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700" placeholder="Shop No, Street, Locality" />
                </div>
              </div>

              {/* Dynamic Fields based on Type */}
              {businessType === 'CAB_TRANSPORT' && (
                <div className="space-y-4 pt-4 mt-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-2">
                    <Car className="w-4 h-4 text-blue-500" /> Vehicle Details
                  </h3>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Vehicle Model *</label>
                    <input required name="vehicleModel" value={formData.vehicleModel} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700" placeholder="e.g. Maruti Swift Dzire" />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">AC Type</label>
                      <select name="acType" value={formData.acType} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700">
                        <option value="AC">AC</option>
                        <option value="NON_AC">Non-AC</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Seats</label>
                      <select name="seats" value={formData.seats} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700">
                        <option value="4">4 Seater</option>
                        <option value="6">6 Seater</option>
                        <option value="7">7 Seater</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {businessType === 'FOOD_BEVERAGE' && (
                <div className="space-y-4 pt-4 mt-4">
                  <h3 className="font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b pb-2">
                    <Store className="w-4 h-4 text-orange-500" /> Restaurant Details
                  </h3>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Dietary Type</label>
                      <select name="dietaryType" value={formData.dietaryType} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700">
                        <option value="PURE_VEG">Pure Veg</option>
                        <option value="NON_VEG">Non Veg</option>
                        <option value="MIXED">Mixed (Both)</option>
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">FSSAI License</label>
                      <input name="fssai" value={formData.fssai} onChange={handleChange} className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 outline-none dark:bg-slate-800 dark:border-slate-700" placeholder="Optional" />
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-8 flex justify-end gap-3 pt-4">
                <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-lg font-medium text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800 transition-colors">
                  Cancel
                </button>
                <button 
                  type="submit" 
                  disabled={isLoading}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-8 py-2.5 rounded-lg font-medium flex items-center gap-2 transition-colors disabled:opacity-70"
                >
                  {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Launch Business'}
                </button>
              </div>

            </form>
          )}
        </div>

      </div>
    </div>
  );
}
