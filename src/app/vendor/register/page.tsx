'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { ChevronRight, ArrowLeft, CheckCircle2, Store, Utensils, Car, Scissors, Home, UploadCloud, Smartphone, Plus, Trash2, PartyPopper, Tags, Briefcase, Stethoscope, Plane, Heart, Dumbbell, GraduationCap, Truck, Wrench, Key, Banknote, Bed, Building, Search, X, Check } from 'lucide-react';

const IconMap: any = { Utensils, Car, Scissors, Home, Briefcase, Stethoscope, Plane, Heart, Dumbbell, GraduationCap, Truck, Wrench, Key, Banknote, Bed, Building };

// Layout Imports for Live Preview
import { getTemplateComponent, getTemplatesForFamily, getDefaultTemplateId } from '@/lib/templateRegistry';
import WorkspaceBuilder from '@/components/vendor/WorkspaceBuilder';
import { useRegions, districtsForState } from '@/lib/useRegions';

type BusinessType = 'FOOD_BEVERAGE' | 'CAB_TRANSPORT' | 'SALON_BEAUTY' | 'HOME_ESSENTIALS' | '';

// Verticals whose storefront is built via the full WorkspaceBuilder takeover.
// Everyone else (service/listing verticals) uses the inline template → details →
// services → review flow below.
const BUILDER_VERTICALS = ['FOOD_BEVERAGE', 'RETAIL'];

// Friendly copy for each booking/fulfilment mode exposed by a vertical's
// `bookingModes` (from GET /verticals). Drives the fulfilment step for services.
const BOOKING_MODE_LABELS: Record<string, { title: string; desc: string }> = {
  DIRECT_BOOK: { title: 'Instant Booking', desc: 'Customers book a slot or service directly — no approval needed.' },
  REQUEST_TO_BOOK: { title: 'Request to Book', desc: 'Customers send a request; you confirm before it’s locked in. Contact stays hidden until you accept.' },
  ORDER: { title: 'Direct Order', desc: 'Customers place orders directly from your menu.' },
  CART: { title: 'Add to Cart', desc: 'Customers add items to a cart and check out.' },
};

// Booking modes map onto the legacy connectionMode the backend also stores.
const bookingToConnection = (mode: string) => (mode === 'DIRECT_BOOK' ? 'DIRECT' : 'REQUIRE_APPROVAL');

export default function VendorRegisterPage() {
  const [verticals, setVerticals] = useState<any[]>([]);
  const [selectedVertical, setSelectedVertical] = useState<any | null>(null);
  const regionStates = useRegions();
  const router = useRouter();
  
  const { user, setActiveBusiness, setAuth, token, isAuthenticated } = useAuthStore();
  
  // Onboarding user details
  const [onboardingToken, setOnboardingToken] = useState<string | null>(null);
  const [isGoogle, setIsGoogle] = useState(false);
  const [personalName, setPersonalName] = useState('');
  const [personalEmail, setPersonalEmail] = useState('');
  const [personalPassword, setPersonalPassword] = useState('');
  const [personalPhone, setPersonalPhone] = useState('');
  const [personalGender, setPersonalGender] = useState('');
  const [personalDob, setPersonalDob] = useState('');

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login?redirect=/vendor/register');
      return;
    }

    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const token = urlParams.get('onboardingToken');
      const google = urlParams.get('isGoogle') === 'true';
      if (token) setOnboardingToken(token);
      setIsGoogle(google);
    }
    apiClient.get('/verticals').then(res => setVerticals(res.data.data || [])).catch(console.error);
  }, [isAuthenticated, router]);

  
  const [step, setStep] = useState(1);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [temporaryServices, setTemporaryServices] = useState<any[]>([]);
  
  // Step 3 Service Inputs
  const [serviceCategory, setServiceCategory] = useState(''); // predefined dropdown for food/salon/home
  const [customCategory, setCustomCategory] = useState(''); // When "Other" is selected
  const [customTitle, setCustomTitle] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceIsVeg, setServiceIsVeg] = useState(true);
  const [serviceImage, setServiceImage] = useState('');
  
  // Variant Pricing State
  const [isVariantPricing, setIsVariantPricing] = useState(false);
  const [tempVariants, setTempVariants] = useState<{id: string, name: string, price: string}[]>([]);

  const FOOD_CATEGORIES = ['Starters', 'Main Course', 'Breads', 'Desserts', 'Beverages', 'Snacks', 'Thalis', 'Other'];
  const HOME_CATEGORIES = ['Plumbing', 'Electrical', 'Painting', 'RO Repair', 'Carpentry', 'Cleaning', 'Pest Control', 'Appliance Repair', 'Other'];
  const SALON_CATEGORIES = ['Hair Cut', 'Shaving & Beard', 'Facial', 'Massage', 'Manicure & Pedicure', 'Makeup', 'Other'];

  const [form, setForm] = useState({
    businessType: '',
    subcategorySlug: '',
    bookingMode: '',
    templateFamily: '',
    categorySlug: '',
    selectedTemplateId: '',
    selectedCategoryId: '',
    businessName: '',
    state: '',
    district: '',
    city: '',
    address: '',
    description: '',
    
    // CAB_TRANSPORT Fields
    brand: 'Maruti Suzuki',
    model: '',
    vehicleNumberPlate: '',
    fuelType: 'Petrol',
    vehicleType: 'Sedan',
    ac: true,
    seats: 4,
    
    // FOOD_BEVERAGE Fields
    cuisineType: '',
    isPureVeg: false,
    fssai: '',
    
    // SALON_BEAUTY / HOME_ESSENTIALS Fields
    experience: '',
    certifications: '',

    // IMAGE FIELD
    image: '',
    
    // CONNECTION MODE
    connectionMode: 'REQUIRE_APPROVAL',
  });

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>, isService = false) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const url = URL.createObjectURL(file);
      if (isService) {
        setServiceImage(url);
      } else {
        setImageFile(file);
        updateForm('image', url);
      }
    }
  };

  const updateForm = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const applyVariantPreset = (preset: 'half-full' | 'quarter-half-full' | 'weight') => {
    if (preset === 'half-full') {
      setTempVariants([{id: '1', name: 'Half', price: ''}, {id: '2', name: 'Full', price: ''}]);
    } else if (preset === 'quarter-half-full') {
      setTempVariants([{id: '1', name: 'Quarter', price: ''}, {id: '2', name: 'Half', price: ''}, {id: '3', name: 'Full', price: ''}]);
    } else if (preset === 'weight') {
      setTempVariants([{id: '1', name: '250g', price: ''}, {id: '2', name: '500g', price: ''}, {id: '3', name: '1kg', price: ''}]);
    }
  };

  const addEmptyVariant = () => {
    setTempVariants(prev => [...prev, {id: Date.now().toString(), name: '', price: ''}]);
  };

  const removeVariant = (id: string) => {
    setTempVariants(prev => prev.filter(v => v.id !== id));
  };

  const updateVariant = (id: string, field: 'name' | 'price', value: string) => {
    setTempVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
  };

  const handleAddTempService = () => {
    if (!customTitle) return toast.error('Please provide a service title');
    
    if (form.businessType !== 'CAB_TRANSPORT' && !serviceCategory) {
      return toast.error('Please select a category for the service');
    }

    if (serviceCategory === 'Other' && !customCategory) {
      return toast.error('Please specify a custom category name');
    }

    let finalVariants: any[] = [];
    if (isVariantPricing) {
      finalVariants = tempVariants.filter(v => v.name.trim() && v.price.trim()).map(v => ({
        name: v.name,
        price: Number(v.price)
      }));
      if (finalVariants.length === 0) return toast.error('Please add at least one valid portion with a price');
    }

    setTemporaryServices(prev => [...prev, {
      id: Date.now().toString(),
      title: customTitle,
      price: isVariantPricing ? undefined : (servicePrice ? Number(servicePrice) : undefined),
      variants: finalVariants.length > 0 ? finalVariants : undefined,
      description: serviceDesc || undefined,
      foodCategory: serviceCategory === 'Other' ? customCategory : serviceCategory,
      isVeg: form.businessType === 'FOOD_BEVERAGE' ? serviceIsVeg : undefined,
      image: serviceImage || undefined
    }]);

    // Reset inputs but keep category for quick multiple adds
    setCustomTitle('');
    setServicePrice('');
    setServiceDesc('');
    setServiceImage('');
    setCustomCategory('');
    setIsVariantPricing(false);
    setTempVariants([]);
  };

  const handleRemoveTempService = (id: string) => {
    setTemporaryServices(prev => prev.filter(s => s.id !== id));
  };

  const nextStep = () => {
    if (step === 1) {
      if (!form.businessType) return toast.error('Please select a business category');
      if (!form.subcategorySlug) return toast.error('Please choose your business type');
      if (!form.businessName) return toast.error('Please enter a business name');
      if (!form.state) return toast.error('Please select your state');
      if (!form.district) return toast.error('Please select your district');
      // Food/Retail hand off to the WorkspaceBuilder takeover (rendered when step >= 2).
      // Service verticals walk the inline template → details → services → review flow,
      // so they get the storefront template picker at step 2 first.
      if (BUILDER_VERTICALS.includes(form.businessType)) {
        setStep(3);
      } else {
        setStep(2);
      }
    } else if (step === 2) {
      if (!form.selectedTemplateId) return toast.error('Please pick a storefront design');
      setStep(3);
    } else if (step === 3) {
      setStep(4);
    } else if (step === 4) {
      setStep(5);
    }
  };


  const handleRegister = async () => {
    try {
      setIsSubmitting(true);
      
      let metaData: any = {};

      
      if (form.businessType === 'CAB_TRANSPORT') {
        metaData = {
          brand: form.brand,
          model: form.model,
          vehicleNumberPlate: form.vehicleNumberPlate,
          fuelType: form.fuelType,
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
        };
      }

      const payload = {
        businessName: form.businessName,
        businessType: form.businessType,
        subcategorySlug: form.subcategorySlug,
        bookingMode: form.bookingMode,
        localityName: form.address,
        state: form.state,
        district: form.district,
        cityName: form.district,
        description: form.description,
        pincode: '000000',
        locationType: 'Freelancer',
        timeAvailability: '9 AM - 6 PM',
        workingDays: 'Monday - Saturday',
        connectionMode: form.businessType === 'FOOD_BEVERAGE' ? 'REQUIRE_APPROVAL' : form.connectionMode,
        metaData,
        categoryIds: form.selectedCategoryId ? [form.selectedCategoryId] : [],
        themeFlavor: form.selectedTemplateId,
        imageUrl: form.image ? 'https://dummyimage.com/600x400/10b981/fff&text=Storefront' : undefined,
        services: form.businessType !== 'CAB_TRANSPORT' ? temporaryServices.map(s => ({
          title: s.title,
          price: s.price,
          description: s.description,
          foodCategory: s.foodCategory,
          isVeg: s.isVeg,
          variants: s.variants
        })) : []
      };

      const res = await apiClient.post('/business/register', payload);
      
      setActiveBusiness(res.data?.data?.id);
      
      setIsSuccess(true);
      
      setTimeout(() => {
        router.push('/vendor-dashboard');
      }, 3000);
      
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to register business');
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildPreviewCatalog = () => {
    if (form.businessType === 'CAB_TRANSPORT') {
      return [{ id: '1', title: form.model || 'Cab Booking', price: 500, category: { name: 'Transport' } }];
    }

    if (temporaryServices.length > 0) {
      return temporaryServices.map(s => ({
        id: s.id,
        title: s.title,
        price: s.price,
        description: s.description,
        variants: s.variants || (s.isVeg !== undefined ? (s.isVeg ? ['veg'] : ['veg', 'non-veg']) : []),
        category: { name: s.foodCategory || 'Services' },
        mediaUrl: s.image || undefined,
        media: s.image ? [{ type: 'catalog_image', secureUrl: s.image }] : [],
        metaData: { isNonVeg: s.isVeg === false }
      }));
    }

    if (form.businessType === 'FOOD_BEVERAGE') {
      return [
        { id: '1', title: 'Example Dish 1', price: 299, variants: form.isPureVeg ? ['veg'] : ['veg', 'non-veg'], category: { name: 'Starters' } },
        { id: '2', title: 'Example Dish 2', price: 149, variants: form.isPureVeg ? ['veg'] : ['veg'], category: { name: 'Main Course' } }
      ];
    }
    
    return [{ id: '1', title: 'Example Service', price: 499, category: { name: 'Services' } }];
  };

  const previewBusiness: any = {
    businessName: form.businessName || 'Your Business Name',
    localityName: form.address || 'Your Business Address',
    city: form.district || 'City',
    description: form.description || 'Welcome to our business!',
    businessType: form.businessType || 'FOOD_BEVERAGE',
    connectionMode: form.connectionMode || 'REQUIRE_APPROVAL',
    isOnline: true,
    membershipTier: 'Pro',
    user: { phoneNumber: user?.phoneNumber || '9999999999' },
    media: form.image ? [{ type: 'profile_image', secureUrl: form.image }] : [],
    metaData: {
      brand: form.brand,
      model: form.model,
      vehicleNumberPlate: form.vehicleNumberPlate,
      fuelType: form.fuelType,
      vehicleType: form.vehicleType,
      ac: form.ac,
      seats: form.seats,
      cuisineType: form.cuisineType,
      isPureVeg: form.isPureVeg,
      experience: form.experience,
    },
    catalogItems: buildPreviewCatalog(),
    catalog: buildPreviewCatalog()
  };

  return (
    <>
      {step >= 2 && BUILDER_VERTICALS.includes(form.businessType) && !isSuccess ? (
        <WorkspaceBuilder 
          initialData={form}
          onSuccess={() => {
            setIsSuccess(true);
            setStep(6);
            setTimeout(() => {
              router.push('/vendor-dashboard');
            }, 3000);
          }} 
        />
      ) : (
        <div className="max-w-[1400px] mx-auto md:grid md:grid-cols-12 md:gap-10 h-[calc(100vh-8rem)]">
      
      {/* ─── LEFT SIDE (FORM WIZARD) ─── */}
      <div className="md:col-span-7 lg:col-span-6 bg-white rounded-3xl border border-zinc-200 shadow-sm p-6 lg:p-10 mb-8 md:mb-0 h-full overflow-y-auto">
        
        {!isSuccess && (
          <div className="flex items-center gap-2 border-b border-zinc-100 pb-6 mb-8 overflow-x-auto scrollbar-hide">
            {[
              { num: 1, label: 'Core Info' },
              { num: 2, label: 'Details' },
              { num: 3, label: 'Catalog' },
              { num: 4, label: 'Publish' }
            ].map((s, i) => (
              <div key={s.num} className="flex items-center">
                <div className="flex flex-col items-start relative px-2">
                  <span className={`text-[10px] font-black uppercase tracking-wider ${step >= s.num ? 'text-emerald-600' : 'text-zinc-400'}`}>Step {s.num}</span>
                  <span className={`text-sm font-bold whitespace-nowrap ${step >= s.num ? 'text-zinc-900' : 'text-zinc-500'}`}>{s.label}</span>
                  <div className={`absolute -bottom-[25px] left-0 h-1 w-full rounded-full transition-all ${step >= s.num ? 'bg-emerald-500' : 'bg-transparent'}`}></div>
                </div>
                {i < 3 && <ChevronRight className="w-4 h-4 text-zinc-300 mx-2" />}
              </div>
            ))}
          </div>
        )}

        <div className="space-y-8">
          
          {step === 1 && !isSuccess && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
              
              
              {onboardingToken && (
                <div className="p-4 bg-zinc-50 rounded-xl space-y-4 mb-6 border border-zinc-200">
                  <h3 className="text-sm font-bold text-zinc-900">Personal Details</h3>
                  {!isGoogle && (
                    <>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-600 uppercase">Your Full Name</label>
                        <input className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm" value={personalName} onChange={e => setPersonalName(e.target.value)} required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-600 uppercase">Email Address</label>
                        <input className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm" type="email" value={personalEmail} onChange={e => setPersonalEmail(e.target.value)} required />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-600 uppercase">Secure Password</label>
                        <input className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm" type="password" value={personalPassword} onChange={e => setPersonalPassword(e.target.value)} required />
                      </div>
                    </>
                  )}
                  {isGoogle && (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-600 uppercase">Phone Number</label>
                      <input className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm" type="tel" value={personalPhone} onChange={e => setPersonalPhone(e.target.value)} required />
                    </div>
                  )}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-600 uppercase">Gender</label>
                      <select className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm" value={personalGender} onChange={e => setPersonalGender(e.target.value)} required>
                        <option value="" disabled>Select Gender</option>
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-600 uppercase">Date of Birth</label>
                      <input className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white text-sm" type="date" value={personalDob} onChange={e => setPersonalDob(e.target.value)} required />
                    </div>
                  </div>
                </div>
              )}
              
              <div className="space-y-6">
                {/* Stage 1: pick the vertical (category). Stage 2: pick the sub-category. */}
                {!selectedVertical ? (
                  <div>
                    <h2 className="text-2xl font-black text-zinc-900 mb-2">What kind of business?</h2>
                    <p className="text-sm text-zinc-500 font-medium mb-6">Choose your category. More categories are coming soon.</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {verticals.map((v: any) => {
                        const Icon = IconMap[v.icon] || Store;
                        const comingSoon = v.comingSoon;
                        return (
                          <button
                            key={v.key}
                            disabled={comingSoon}
                            onClick={() => {
                              if (comingSoon) return;
                              setSelectedVertical(v);
                              updateForm('businessType', v.key);
                              updateForm('templateFamily', v.templateFamily || '');
                              // Seed a polished default template so the live preview (and the
                              // pre-selected pick in step 2) looks good from the first moment.
                              updateForm('selectedTemplateId', getDefaultTemplateId(v.key, v.templateFamily));
                              const defaultMode = (v.bookingModes && v.bookingModes[0]) || '';
                              updateForm('bookingMode', defaultMode);
                              if (defaultMode) updateForm('connectionMode', bookingToConnection(defaultMode));
                            }}
                            className={`relative w-full flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 ${
                              comingSoon
                                ? 'bg-zinc-50 border-zinc-100 opacity-60 cursor-not-allowed'
                                : 'bg-white border-zinc-100 hover:border-emerald-300 hover:shadow-sm hover:bg-zinc-50'
                            }`}
                          >
                            {comingSoon && (
                              <span className="absolute top-2 right-2 text-[9px] font-black uppercase tracking-wider bg-zinc-200 text-zinc-500 px-2 py-0.5 rounded-full">Soon</span>
                            )}
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${comingSoon ? 'bg-zinc-100 text-zinc-400' : 'bg-emerald-50 text-emerald-600'}`}>
                              <Icon className="w-7 h-7" />
                            </div>
                            <div className="text-sm font-black text-center leading-tight text-zinc-900">{v.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                ) : (
                  <div>
                    <button
                      onClick={() => { setSelectedVertical(null); updateForm('subcategorySlug', ''); updateForm('categorySlug', ''); }}
                      className="flex items-center gap-1 text-sm font-bold text-zinc-500 hover:text-zinc-800 mb-4"
                    >
                      <ArrowLeft className="w-4 h-4" /> {selectedVertical.label}
                    </button>
                    <h2 className="text-2xl font-black text-zinc-900 mb-2">Choose your type</h2>
                    <p className="text-sm text-zinc-500 font-medium mb-6">Pick the option that best fits your business.</p>

                    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                      {(selectedVertical.subcategories || []).map((sub: any) => {
                        const Icon = IconMap[sub.icon] || Store;
                        const isSelected = form.subcategorySlug === sub.slug;
                        return (
                          <button
                            key={sub.slug}
                            onClick={() => {
                              updateForm('subcategorySlug', sub.slug);
                              updateForm('categorySlug', sub.slug);
                            }}
                            className={`w-full flex flex-col items-center justify-center p-6 rounded-2xl border-2 transition-all duration-200 ${
                              isSelected
                                ? 'bg-emerald-50 border-emerald-500 shadow-md transform scale-[1.02]'
                                : 'bg-white border-zinc-100 hover:border-emerald-200 hover:shadow-sm hover:bg-zinc-50'
                            }`}
                          >
                            <div className={`w-14 h-14 rounded-full flex items-center justify-center mb-4 ${isSelected ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/30' : 'bg-zinc-100 text-zinc-500'}`}>
                              <Icon className="w-7 h-7" />
                            </div>
                            <div className={`text-sm font-black text-center leading-tight ${isSelected ? 'text-emerald-900' : 'text-zinc-900'}`}>{sub.label}</div>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                )}
              </div>

              <div className="space-y-4 pt-4 border-t border-zinc-100">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Business Image</label>
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 rounded-xl cursor-pointer bg-zinc-50 hover:bg-zinc-100 transition-all overflow-hidden relative">
                    {form.image ? (
                      <img src={form.image} alt="Preview" className="w-full h-full object-cover" />
                    ) : (
                      <div className="flex flex-col items-center justify-center pt-5 pb-6">
                        <UploadCloud className="w-8 h-8 text-zinc-400 mb-2" />
                        <p className="text-sm font-semibold text-zinc-600"><span className="text-emerald-600">Click to upload</span> or drag and drop</p>
                      </div>
                    )}
                    <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, false)} />
                  </label>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Business Name *</label>
                  <input 
                    type="text" 
                    value={form.businessName}
                    onChange={(e) => updateForm('businessName', e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold"
                    placeholder="e.g. Royal Tandoor Kitchen"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">State *</label>
                    <select
                      value={form.state}
                      onChange={(e) => {
                        updateForm('state', e.target.value);
                        // Reset the district whenever the state changes.
                        updateForm('district', '');
                        updateForm('city', '');
                      }}
                      className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold"
                    >
                      <option value="" disabled>Select State</option>
                      {regionStates.map((s) => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">District *</label>
                    <select
                      value={form.district}
                      disabled={!form.state}
                      onChange={(e) => {
                        updateForm('district', e.target.value);
                        // City = district (no finer locality is captured here).
                        updateForm('city', e.target.value);
                      }}
                      className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>{form.state ? 'Select District' : 'Pick a state first'}</option>
                      {districtsForState(regionStates, form.state).map((d) => (
                        <option key={d.slug} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Detailed Address</label>
                  <input
                    type="text"
                    value={form.address}
                    onChange={(e) => updateForm('address', e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold"
                    placeholder="Shop No. 8, Ground Floor..."
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Description</label>
                  <textarea 
                    value={form.description}
                    onChange={(e) => updateForm('description', e.target.value)}
                    rows={3}
                    className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold resize-none"
                    placeholder="Tell your customers about your business..."
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-end">
                <button 
                  onClick={nextStep}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          
          {step === 2 && !isSuccess && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep(1)} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-black text-zinc-900">Storefront Design</h2>
                  <p className="text-xs text-zinc-500 font-medium mt-1">Select a visual template for your business.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {getTemplatesForFamily(form.templateFamily).map(template => {
                  const Icon = template.icon;
                  const isActive = form.selectedTemplateId === template.id;
                  
                  return (
                    <button
                      key={template.id}
                      onClick={() => updateForm('selectedTemplateId', template.id)}
                      className={`text-left p-5 rounded-2xl border-2 transition-all duration-200 ${
                        isActive 
                          ? 'border-emerald-600 bg-emerald-50/50 shadow-md ring-4 ring-emerald-600/10' 
                          : 'border-zinc-200 hover:border-emerald-300 hover:bg-zinc-50'
                      }`}
                    >
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 border ${template.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <h4 className={`text-md font-bold mb-1 ${isActive ? 'text-emerald-900' : 'text-zinc-900'}`}>
                        {template.name}
                      </h4>
                      <p className="text-xs text-zinc-500 font-medium leading-relaxed">
                        {template.description}
                      </p>
                    </button>
                  )
                })}
              </div>
              
              <div className="pt-4 flex justify-end border-t border-zinc-100">
                <button 
                  onClick={nextStep}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 3 && !isSuccess && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
              
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => {
                  const availableTemplates = getTemplatesForFamily(form.templateFamily);
                  if (availableTemplates.length <= 1) setStep(1); else setStep(2);
                }} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-black text-zinc-900">Storefront Details</h2>
                  <p className="text-xs text-zinc-500 font-medium mt-1">Configure options tailored for {form.businessType.replace('_', ' ')}</p>
                </div>
              </div>

              <div className="bg-zinc-50/50 p-5 rounded-2xl border border-zinc-200">
                {/* CAB TRANSPORT */}
                {form.businessType === 'CAB_TRANSPORT' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700">Vehicle Number Plate *</label>
                      <input 
                        type="text" 
                        value={form.vehicleNumberPlate}
                        onChange={(e) => updateForm('vehicleNumberPlate', e.target.value.toUpperCase())}
                        className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold uppercase"
                        placeholder="e.g. HR-20-XXXX"
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700">Brand</label>
                        <select 
                          value={form.brand}
                          onChange={(e) => {
                            updateForm('brand', e.target.value);
                            updateForm('model', '');
                          }}
                          className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold"
                        >
                          <option value="Maruti Suzuki">Maruti Suzuki</option>
                          <option value="Hyundai">Hyundai</option>
                          <option value="Tata">Tata</option>
                          <option value="Mahindra">Mahindra</option>
                          <option value="Toyota">Toyota</option>
                          <option value="Honda">Honda</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700">Model</label>
                        <select 
                          value={form.model}
                          onChange={(e) => updateForm('model', e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold"
                        >
                          <option value="">Select Model</option>
                          {form.brand === 'Maruti Suzuki' && <><option value="Swift">Swift</option><option value="Dzire">Dzire</option><option value="Ertiga">Ertiga</option><option value="Brezza">Brezza</option><option value="WagonR">WagonR</option></>}
                          {form.brand === 'Hyundai' && <><option value="i20">i20</option><option value="Creta">Creta</option><option value="Venue">Venue</option><option value="Verna">Verna</option><option value="Aura">Aura</option></>}
                          {form.brand === 'Tata' && <><option value="Tiago">Tiago</option><option value="Tigor">Tigor</option><option value="Nexon">Nexon</option><option value="Safari">Safari</option><option value="Harrier">Harrier</option></>}
                          {form.brand === 'Mahindra' && <><option value="Scorpio">Scorpio</option><option value="XUV700">XUV700</option><option value="Bolero">Bolero</option><option value="Thar">Thar</option><option value="XUV300">XUV300</option></>}
                          {form.brand === 'Toyota' && <><option value="Innova">Innova</option><option value="Fortuner">Fortuner</option><option value="Glanza">Glanza</option><option value="Camry">Camry</option></>}
                          {form.brand === 'Honda' && <><option value="City">City</option><option value="Amaze">Amaze</option><option value="Elevate">Elevate</option></>}
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700">Fuel Type</label>
                        <select 
                          value={form.fuelType}
                          onChange={(e) => updateForm('fuelType', e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold"
                        >
                          <option value="Petrol">Petrol</option>
                          <option value="Diesel">Diesel</option>
                          <option value="CNG">CNG</option>
                          <option value="EV">EV</option>
                        </select>
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700">Vehicle Type</label>
                        <select 
                          value={form.vehicleType}
                          onChange={(e) => updateForm('vehicleType', e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold"
                        >
                          <option value="Hatchback">Hatchback</option>
                          <option value="Sedan">Sedan</option>
                          <option value="SUV">SUV</option>
                          <option value="Auto">Auto Rickshaw</option>
                        </select>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700">Seat Capacity</label>
                        <input 
                          type="number" 
                          value={form.seats}
                          onChange={(e) => updateForm('seats', e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold"
                        />
                      </div>
                      <div className="pt-6">
                        <label className="flex items-center gap-3 p-2 border-zinc-200 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={form.ac}
                            onChange={(e) => updateForm('ac', e.target.checked)}
                            className="w-5 h-5 rounded border-zinc-300 text-emerald-600 focus:ring-emerald-600"
                          />
                          <span className="text-sm font-bold text-zinc-800">Has AC</span>
                        </label>
                      </div>
                    </div>
                  </div>
                )}

                {/* FOOD BEVERAGE */}
                {form.businessType === 'FOOD_BEVERAGE' && (
                  <div className="space-y-4">
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700">Cuisine Focus (Optional)</label>
                      <input 
                        type="text" 
                        value={form.cuisineType}
                        onChange={(e) => updateForm('cuisineType', e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold"
                        placeholder="e.g. North Indian, Chinese"
                      />
                    </div>

                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700">FSSAI License Number</label>
                      <input 
                        type="text" 
                        value={form.fssai}
                        onChange={(e) => updateForm('fssai', e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold"
                        placeholder="Registration Number"
                      />
                    </div>

                    <div className="pt-2">
                      <label className="flex items-center justify-between p-4 bg-white border border-green-200 rounded-xl cursor-pointer hover:border-green-400 shadow-sm transition-all">
                        <div className="flex items-center gap-3">
                          <span className="w-5 h-5 border-2 border-green-600 flex items-center justify-center p-[2px] rounded-sm">
                            <span className="w-2.5 h-2.5 bg-green-600 rounded-full"></span>
                          </span>
                          <div>
                            <span className="text-sm font-bold text-green-900 block">Pure Veg Restaurant</span>
                            <span className="text-xs font-medium text-green-700/80 block mt-0.5">Show only vegetarian options to customers</span>
                          </div>
                        </div>
                        <input 
                          type="checkbox" 
                          checked={form.isPureVeg}
                          onChange={(e) => updateForm('isPureVeg', e.target.checked)}
                          className="w-5 h-5 rounded border-green-300 text-green-600 focus:ring-green-600"
                        />
                      </label>
                    </div>
                  </div>
                )}

                {/* OTHERS */}
                {(form.businessType === 'SALON_BEAUTY' || form.businessType === 'HOME_ESSENTIALS') && (
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700">Years of Experience</label>
                        <input 
                          type="number" 
                          value={form.experience}
                          onChange={(e) => updateForm('experience', e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold"
                          placeholder="e.g. 5"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700">Certifications (Optional)</label>
                        <input 
                          type="text" 
                          value={form.certifications}
                          onChange={(e) => updateForm('certifications', e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold"
                          placeholder="e.g. L'Oreal Expert"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* FULFILMENT / BOOKING MODE (service verticals) — driven by the vertical's bookingModes */}
                {form.businessType !== 'FOOD_BEVERAGE' && (selectedVertical?.bookingModes?.length ?? 0) > 0 && (
                  <div className="space-y-4 pt-6 mt-6 border-t border-zinc-200">
                    <div>
                      <label className="block text-sm font-bold text-zinc-700 mb-2">How do customers book you?</label>
                      <p className="text-xs text-zinc-500 mb-4 font-medium">Choose how customers reach you for your services.</p>

                      <div className="space-y-3">
                        {selectedVertical.bookingModes.map((mode: string) => {
                          const copy = BOOKING_MODE_LABELS[mode] || { title: mode, desc: '' };
                          const isActive = form.bookingMode === mode;
                          return (
                            <label
                              key={mode}
                              className={`flex items-start gap-3 p-4 rounded-xl border cursor-pointer transition-colors ${isActive ? 'bg-emerald-50 border-emerald-300' : 'bg-white border-zinc-200 hover:bg-zinc-50'}`}
                            >
                              <input
                                type="radio"
                                name="bookingMode"
                                value={mode}
                                checked={isActive}
                                onChange={() => {
                                  updateForm('bookingMode', mode);
                                  updateForm('connectionMode', bookingToConnection(mode));
                                }}
                                className="mt-1 w-4 h-4 text-emerald-600 border-zinc-300 focus:ring-emerald-600"
                              />
                              <div>
                                <span className="text-sm font-bold text-zinc-900 block">{copy.title}</span>
                                <span className="text-xs font-medium text-zinc-500 block mt-0.5">{copy.desc}</span>
                              </div>
                            </label>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                )}

              </div>

              <div className="pt-6 flex justify-between">
                <button 
                  onClick={() => router.push('/vendor-dashboard')}
                  className="text-zinc-500 font-bold px-4 hover:text-zinc-800"
                >
                  Cancel
                </button>
                <button 
                  onClick={nextStep}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              </div>

            </div>
          )}

          {step === 4 && !isSuccess && (
            <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
              <div className="flex items-center gap-3 mb-6">
                <button onClick={() => setStep(3)} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-xl font-black text-zinc-900">Add Your Services</h2>
                  <p className="text-xs text-zinc-500 font-medium mt-1">List what you offer. You can add more later.</p>
                </div>
              </div>

              {form.businessType === 'CAB_TRANSPORT' ? (
                <div className="bg-zinc-50/50 p-8 text-center rounded-2xl border border-zinc-200 space-y-4">
                  <Car className="w-12 h-12 text-zinc-300 mx-auto" />
                  <p className="font-semibold text-zinc-700">Vehicle profiles do not require a service menu. Your base fare is implicitly set.</p>
                  <p className="text-sm text-zinc-500">Proceed to Final Review.</p>
                </div>
              ) : (
                <div className="bg-zinc-50/50 p-5 rounded-2xl border border-zinc-200 space-y-5">
                  
                    <div className="space-y-4">
                      <div className="space-y-1.5">
                        <label className="text-xs font-bold text-zinc-700">Service Category *</label>
                        <select 
                          value={serviceCategory}
                          onChange={(e) => setServiceCategory(e.target.value)}
                          className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold"
                        >
                          <option value="" disabled>Select Category</option>
                          {form.businessType === 'FOOD_BEVERAGE' && FOOD_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          {form.businessType === 'HOME_ESSENTIALS' && HOME_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                          {form.businessType === 'SALON_BEAUTY' && SALON_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                      
                      {serviceCategory === 'Other' && (
                        <div className="space-y-1.5">
                          <label className="text-xs font-bold text-zinc-700">Specify Category Name *</label>
                          <input 
                            type="text" 
                            value={customCategory}
                            onChange={(e) => setCustomCategory(e.target.value)}
                            className="w-full h-11 px-4 rounded-xl border border-emerald-300 bg-emerald-50 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold"
                            placeholder="e.g. Pet Grooming"
                          />
                        </div>
                      )}
                    </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">{form.businessType === 'FOOD_BEVERAGE' ? 'Dish Name *' : 'Service Name *'}</label>
                    <input 
                      type="text" 
                      value={customTitle}
                      onChange={(e) => setCustomTitle(e.target.value)}
                      className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold"
                      placeholder={form.businessType === 'FOOD_BEVERAGE' ? 'e.g. Margherita Pizza' : 'e.g. Deep Cleaning'}
                    />
                  </div>

                  {/* PRICING */}
                  {form.businessType === 'FOOD_BEVERAGE' ? (
                    <div className="bg-white p-4 rounded-xl border border-zinc-200">
                      <div className="flex items-center justify-between mb-4">
                         <label className="text-xs font-bold text-zinc-700">Pricing Mode</label>
                         <div className="flex bg-zinc-100 rounded-lg p-1">
                            <button 
                              className={`px-3 py-1 text-xs font-bold rounded-md transition-all ${!isVariantPricing ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
                              onClick={() => setIsVariantPricing(false)}
                            >
                              Single Price
                            </button>
                            <button 
                              className={`px-3 py-1 text-xs font-bold rounded-md transition-all flex items-center gap-1 ${isVariantPricing ? 'bg-white shadow-sm text-emerald-600' : 'text-zinc-500 hover:text-zinc-700'}`}
                              onClick={() => setIsVariantPricing(true)}
                            >
                              <Tags className="w-3 h-3" /> Portions / Variants
                            </button>
                         </div>
                      </div>

                      {!isVariantPricing ? (
                         <div className="space-y-1.5">
                           <label className="text-xs font-bold text-zinc-700">Fixed Price (₹)</label>
                           <input 
                             type="number" 
                             value={servicePrice}
                             onChange={(e) => setServicePrice(e.target.value)}
                             className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 outline-none transition-all text-sm font-semibold"
                             placeholder="e.g. 299"
                           />
                         </div>
                      ) : (
                         <div className="space-y-4">
                            <div className="flex flex-wrap gap-2">
                               <button onClick={() => applyVariantPreset('half-full')} className="px-3 py-1.5 text-[11px] font-bold bg-zinc-100 hover:bg-zinc-200 rounded-lg text-zinc-600">Half / Full</button>
                               <button onClick={() => applyVariantPreset('quarter-half-full')} className="px-3 py-1.5 text-[11px] font-bold bg-zinc-100 hover:bg-zinc-200 rounded-lg text-zinc-600">Quarter / Half / Full</button>
                               <button onClick={() => applyVariantPreset('weight')} className="px-3 py-1.5 text-[11px] font-bold bg-zinc-100 hover:bg-zinc-200 rounded-lg text-zinc-600">By Weight</button>
                            </div>
                            
                            <div className="space-y-2 border-l-2 border-emerald-500 pl-3">
                              {tempVariants.map((v, i) => (
                                 <div key={v.id} className="flex gap-2 items-center">
                                    <input 
                                      type="text" 
                                      value={v.name}
                                      onChange={(e) => updateVariant(v.id, 'name', e.target.value)}
                                      className="flex-1 h-9 px-3 text-sm rounded-lg border border-zinc-200 bg-zinc-50 outline-none focus:border-emerald-500" 
                                      placeholder="Portion Name" 
                                    />
                                    <input 
                                      type="number" 
                                      value={v.price}
                                      onChange={(e) => updateVariant(v.id, 'price', e.target.value)}
                                      className="w-24 h-9 px-3 text-sm rounded-lg border border-zinc-200 bg-zinc-50 outline-none focus:border-emerald-500" 
                                      placeholder="Price" 
                                    />
                                    <button onClick={() => removeVariant(v.id)} className="p-1 text-rose-500 hover:bg-rose-50 rounded">
                                       <Trash2 className="w-4 h-4" />
                                    </button>
                                 </div>
                              ))}
                              <button onClick={addEmptyVariant} className="text-xs font-bold text-emerald-600 hover:text-emerald-700 flex items-center gap-1 py-1">
                                 <Plus className="w-3 h-3" /> Add Custom Portion
                              </button>
                            </div>
                         </div>
                      )}
                    </div>
                  ) : (
                    <div className="space-y-1.5">
                      <label className="text-xs font-bold text-zinc-700">Service Price (₹)</label>
                      <input 
                        type="number" 
                        value={servicePrice}
                        onChange={(e) => setServicePrice(e.target.value)}
                        className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold"
                        placeholder="e.g. 499"
                      />
                    </div>
                  )}

                  <div className="grid grid-cols-2 gap-4">
                    {form.businessType === 'FOOD_BEVERAGE' && !form.isPureVeg && (
                      <div className="pt-6">
                        <label className="flex items-center gap-2 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={serviceIsVeg}
                            onChange={(e) => setServiceIsVeg(e.target.checked)}
                            className="w-5 h-5 rounded border-green-300 text-green-600 focus:ring-green-600"
                          />
                          <span className="text-sm font-bold text-green-800">Is Veg?</span>
                        </label>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-zinc-700">Photo (Optional)</label>
                    <div className="flex items-center gap-4">
                      {serviceImage && <img src={serviceImage} className="w-12 h-12 rounded-lg object-cover" alt="Preview" />}
                      <label className="flex-1 h-11 border border-zinc-200 bg-white rounded-xl flex items-center justify-center cursor-pointer hover:bg-zinc-50 transition-all text-sm font-semibold text-zinc-600">
                        Upload Photo
                        <input type="file" className="hidden" accept="image/*" onChange={(e) => handleImageChange(e, true)} />
                      </label>
                    </div>
                  </div>

                  <button 
                    onClick={handleAddTempService}
                    className="w-full bg-zinc-900 hover:bg-zinc-800 text-white px-4 py-3 rounded-xl font-bold transition-all shadow-sm flex items-center justify-center gap-2 mt-4"
                  >
                    <Plus className="w-4 h-4" /> Add to List
                  </button>
                </div>
              )}

              {/* Added Services List */}
              {temporaryServices.length > 0 && form.businessType !== 'CAB_TRANSPORT' && (
                <div className="space-y-3 pt-4">
                  <h3 className="text-sm font-bold text-zinc-900">Services Added ({temporaryServices.length})</h3>
                  {temporaryServices.map((svc) => (
                    <div key={svc.id} className="flex items-center gap-3 bg-white border border-zinc-200 p-3 rounded-xl shadow-sm">
                      {svc.image ? (
                        <img src={svc.image} className="w-12 h-12 rounded-lg object-cover" alt="" />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-zinc-100 flex items-center justify-center">
                          <Utensils className="w-5 h-5 text-zinc-400" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-zinc-800 text-sm truncate">{svc.title}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                          {svc.variants && svc.variants.length > 0 ? (
                            <span className="text-xs font-semibold text-blue-600">{svc.variants.length} Portions</span>
                          ) : (
                            svc.price && <span className="text-xs font-semibold text-emerald-600">₹{svc.price}</span>
                          )}
                          {svc.foodCategory && <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 text-zinc-500 rounded-full">{svc.foodCategory}</span>}
                        </div>
                      </div>
                      <button onClick={() => handleRemoveTempService(svc.id)} className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg shrink-0">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}

              <div className="pt-6 flex justify-between border-t border-zinc-100">
                <button 
                  onClick={() => router.push('/vendor-dashboard')}
                  className="text-zinc-500 font-bold px-4 hover:text-zinc-800"
                >
                  Cancel
                </button>
                <button 
                  onClick={nextStep}
                  className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-3 rounded-xl font-bold transition-all shadow-md shadow-emerald-600/20 flex items-center gap-2"
                >
                  Continue to Review <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          )}

          {step === 5 && !isSuccess && (
             <div className="animate-in fade-in slide-in-from-right-4 space-y-6">
                <div className="flex items-center gap-3 mb-6">
                  <button onClick={() => setStep(3)} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500">
                    <ArrowLeft className="w-5 h-5" />
                  </button>
                  <div>
                    <h2 className="text-xl font-black text-zinc-900">Review & Publish</h2>
                    <p className="text-xs text-zinc-500 font-medium mt-1">Verify your storefront in the Live Preview before launching.</p>
                  </div>
                </div>

                <div className="bg-emerald-50/50 border border-emerald-100 p-6 rounded-2xl text-center space-y-4">
                  <h3 className="font-bold text-emerald-900 text-lg">Ready to go live?</h3>
                  <p className="text-sm text-emerald-700 font-medium max-w-sm mx-auto">
                    Your {form.businessType.replace('_', ' ').toLowerCase()} storefront is looking great. Customers will see exactly what's on the right.
                  </p>
                </div>

                <div className="pt-6 flex justify-between border-t border-zinc-100">
                  <button 
                    onClick={() => router.push('/vendor-dashboard')}
                    className="text-zinc-500 font-bold px-4 hover:text-zinc-800"
                  >
                    Cancel
                  </button>
                  <button 
                    onClick={handleRegister}
                    disabled={isSubmitting}
                    className="bg-zinc-900 hover:bg-black disabled:bg-zinc-400 text-white px-10 py-3 rounded-xl font-bold transition-all shadow-md flex items-center gap-2"
                  >
                    {isSubmitting ? 'Publishing...' : 'Publish Storefront'}
                  </button>
                </div>
             </div>
          )}

          {isSuccess && (
            <div className="animate-in zoom-in-95 duration-500 flex flex-col items-center justify-center text-center h-full py-20 space-y-6">
              <div className="w-24 h-24 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
                <PartyPopper className="w-12 h-12 text-emerald-600" />
              </div>
              <div>
                <h2 className="text-3xl font-black text-zinc-900 mb-2">Storefront Published!</h2>
                <p className="text-zinc-500 font-medium">Your business is now live. Redirecting to your dashboard...</p>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ─── RIGHT SIDE (SLEEK FLOATING PREVIEW) ─── */}
      <div className="hidden lg:flex lg:col-span-6 h-full items-center justify-center relative overflow-hidden bg-zinc-50 rounded-3xl border border-zinc-200">
        
        {/* Responsive constraints instead of hardcoded transform scale */}
        <div 
          className="relative w-full max-w-[350px] aspect-[9/19.5] max-h-[75vh] mx-auto overflow-hidden rounded-[40px] border-8 border-neutral-800 shadow-2xl bg-white flex flex-col"
        >
          {/* Floating grabber pill — overlaid (not a flow row) so the storefront content
              fills the whole frame and its top corners are clipped by the rounded bezel. */}
          <div className="absolute top-2 left-1/2 -translate-x-1/2 w-12 h-1.5 bg-zinc-400/50 rounded-full z-50 pointer-events-none"></div>

          {/* Reactive Content Wrapper */}
          <div className="flex-1 w-full min-h-0 overflow-y-auto scrollbar-hide relative z-0">
            {!form.businessType ? (
              <div className="h-full flex flex-col items-center justify-center p-8 text-center bg-zinc-50">
                <div className="w-20 h-20 rounded-3xl bg-emerald-50 flex items-center justify-center mb-6 shadow-sm border border-emerald-100">
                  <Store className="w-10 h-10 text-emerald-500" />
                </div>
                <h3 className="text-xl font-black text-zinc-900">Your Storefront</h3>
                <p className="text-sm font-medium text-zinc-500 mt-2 leading-relaxed">
                  As you build your profile, you'll see a real-time preview of what your customers will see right here.
                </p>
              </div>
            ) : (
              <div className="w-full min-h-full bg-white">
                {(() => {
                  const PreviewTemplate = getTemplateComponent(form.selectedTemplateId, form.businessType);
                  return <PreviewTemplate business={previewBusiness as any} theme="trust-utility" />;
                })()}
              </div>
            )}
          </div>
        </div>

      </div>

    </div>
      )}
    </>
  );
}