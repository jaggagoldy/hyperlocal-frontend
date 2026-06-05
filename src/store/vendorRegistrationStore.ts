import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface VendorRegistrationFormData {
  businessName: string;
  categoryId: string;
  businessType: 'RESTAURANT' | 'STREET_VENDOR' | 'CLOUD_KITCHEN' | 'CHEF' | 'SALON' | 'EVENT_SERVICE' | 'HOME_MAINTENANCE' | '';
  locationType: 'Shop' | 'Freelancer' | '';
  cityName: string;
  localityName: string;
  pincode: string;
  idType: string;
  idNumber: string;
}

interface VendorRegistrationState {
  step: number;
  customCategory: string;
  form: VendorRegistrationFormData;
  setStep: (step: number) => void;
  setCustomCategory: (cat: string) => void;
  setFormField: (field: keyof VendorRegistrationFormData, value: string) => void;
  reset: () => void;
}

const initialState = {
  step: 1,
  customCategory: '',
  form: {
    businessName: '',
    categoryId: '',
    businessType: '' as const,
    locationType: '' as const,
    cityName: '',
    localityName: '',
    pincode: '',
    idType: '',
    idNumber: '',
  },
};

export const useVendorRegistrationStore = create<VendorRegistrationState>()(
  persist(
    (set) => ({
      ...initialState,
      setStep: (step) => set({ step }),
      setCustomCategory: (customCategory) => set({ customCategory }),
      setFormField: (field, value) =>
        set((state) => ({
          form: { ...state.form, [field]: value },
        })),
      reset: () => set(initialState),
    }),
    {
      name: 'vendor-registration-storage', // sessionStorage by default for short-lived persistence
      storage: createJSONStorage(() => sessionStorage),
    }
  )
);
