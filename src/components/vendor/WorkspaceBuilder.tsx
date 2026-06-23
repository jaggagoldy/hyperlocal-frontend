'use client';

import { useState, useMemo, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ChevronDown, ChevronUp, Check, Plus, Trash2, MapPin, Store, Palette, Utensils, Image as ImageIcon, Tag, Tags, Upload, Edit, GripVertical, ChevronRight, ChevronLeft, Menu, Briefcase, FileText, X } from 'lucide-react';
import { TEMPLATE_METADATA, getTemplateComponent, getTemplateArchetype } from '@/lib/templateRegistry';
import { getBlueprintForArchetype } from '@/lib/blueprints';
import { getTaxonomyForCategory } from '@/lib/taxonomy';
import DishModal from './DishModal';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { useCartStore } from '@/store/useCartStore';
import { useRegions, districtsForState } from '@/lib/useRegions';

interface WorkspaceBuilderProps {
  onSuccess: () => void;
  initialData?: any;
  mode?: 'create' | 'edit';
  onExit?: () => void;
}


const LivePreviewRenderer = ({ themeId, currentArchetype, business }: { themeId: string, currentArchetype: string, business: any }) => {
  const Comp = getTemplateComponent(themeId, currentArchetype) as React.FC<any>;
  return <Comp business={business} />;
};

export default function WorkspaceBuilder({ onSuccess, initialData, mode = 'create', onExit }: WorkspaceBuilderProps) {
  const router = useRouter();
  const moduleConfig = getBlueprintForArchetype(initialData?.businessType);
  const isRetail = initialData?.businessType === 'RETAIL';
  const isService = moduleConfig.scheduling || moduleConfig.leadGen;
  const [activeTabId, setActiveTabId] = useState<string>('profile');
  
  // Profile State
  const [name, setName] = useState(initialData?.businessName || '');
  const [address, setAddress] = useState(initialData?.address || initialData?.localityName || '');
  // Location: State + District (canonical PB/HR). In create mode these arrive as
  // strings on initialData; in edit mode the business carries a `city` object.
  const regionStates = useRegions();
  const [stateName, setStateName] = useState<string>(initialData?.state || initialData?.city?.state || '');
  const [district, setDistrict] = useState<string>(initialData?.district || initialData?.city?.district || '');
  const [pincode, setPincode] = useState(initialData?.pincode || '');
  const [description, setDescription] = useState(initialData?.description || '');
  const [dineIn, setDineIn] = useState(true);
  const [isPureVeg, setIsPureVeg] = useState(initialData?.isPureVeg || false);
  const [experience, setExperience] = useState(initialData?.metaData?.experience || '');
  
  const [displayName, setDisplayName] = useState(initialData?.metaData?.displayName || '');
  const [tagline, setTagline] = useState(initialData?.metaData?.tagline || '');
  const [aboutText, setAboutText] = useState(initialData?.metaData?.aboutText || '');
  const [contactPhone, setContactPhone] = useState(initialData?.metaData?.contactPhone || '');
  const [contactEmail, setContactEmail] = useState(initialData?.metaData?.contactEmail || '');
  const [enableServiceSelection, setEnableServiceSelection] = useState(initialData?.metaData?.enableServiceSelection ?? true);
  const defaultTheme = isRetail ? 'retail-classic' : (isService ? 'service-classic' : 'food-immersive');
  const [themeId, setThemeId] = useState(initialData?.themeFlavor || defaultTheme);
  
  // Category/Taxonomy State
  const getCategorySlugFromBusinessType = (type: string) => {
    switch (type) {
      case 'SALON_BEAUTY': return 'salon-beauty';
      case 'DOCTOR_CLINIC': return 'doctors';
      case 'TUTOR_ACADEMY': return 'education';
      case 'HOME_SERVICES': return 'home-services';
      case 'REPAIRS_SERVICES': return 'repairs-services';
      case 'RETAIL': return 'retail-grocery';
      case 'SERVICE_BOOKING': return 'salon-beauty';
      case 'SERVICE_LEADGEN': return 'home-services';
      case 'FOOD_BEVERAGE':
      default: return 'restaurant-cafe';
    }
  };
  const categorySlug = initialData?.categorySlug 
    || initialData?.categories?.[0]?.category?.slug 
    || getCategorySlugFromBusinessType(initialData?.businessType);
  const taxonomySchema = useMemo(() => getTaxonomyForCategory(categorySlug), [categorySlug]);
  const [taxonomySelections, setTaxonomySelections] = useState<Record<string, any>>(initialData?.metaData?.taxonomy || {});

  const toggleTaxonomyMulti = (fieldId: string, option: string) => {
    setTaxonomySelections(prev => {
      const current = prev[fieldId] || [];
      const updated = current.includes(option) 
        ? current.filter((item: string) => item !== option)
        : [...current, option];
      return { ...prev, [fieldId]: updated };
    });
  };

  const setTaxonomySingle = (fieldId: string, option: string) => {
    setTaxonomySelections(prev => ({ ...prev, [fieldId]: option }));
  };

  const [customTags, setCustomTags] = useState<string[]>(initialData?.metaData?.customTags || []);
  const [customTagInput, setCustomTagInput] = useState('');
  
  const addCustomTag = () => {
    if (customTagInput.trim() && !customTags.includes(customTagInput.trim())) {
      setCustomTags([...customTags, customTagInput.trim()]);
      setCustomTagInput('');
    }
  };

  // Menu State
  const [catalog, setCatalog] = useState<any[]>(initialData?.catalogItems || []);
  const [deletedCatalogIds, setDeletedCatalogIds] = useState<string[]>([]);

  const handleDeleteItem = (id: string) => {
    if (mode === 'edit' && !id.match(/^\d+$/)) {
      setDeletedCatalogIds(prev => [...prev, id]);
    }
    setCatalog(catalog.filter(c => c.id !== id));
  };
  const [isDishModalOpen, setIsDishModalOpen] = useState(false);
  const [editItem, setEditItem] = useState<any | null>(null);
  const [menuViewMode, setMenuViewMode] = useState<'list' | 'grid'>('list');

  // Drag and Drop State
  const [draggedItemId, setDraggedItemId] = useState<string | null>(null);

  // Offers State
  const [offers, setOffers] = useState<{code: string, discount: string, title: string}[]>([
    { code: 'WELCOME50', discount: '50% OFF', title: 'Welcome to our restaurant!' }
  ]);
  const [offerCode, setOfferCode] = useState('');
  const [offerDiscount, setOfferDiscount] = useState('');
  const [offerTitle, setOfferTitle] = useState('');

  // Media State
  const [bannerUrl, setBannerUrl] = useState('');
  const [logoUrl, setLogoUrl] = useState('');

  const [isPublishing, setIsPublishing] = useState(false);
  const clearCart = useCartStore((state: any) => state.clearCart);

  useEffect(() => {
    clearCart();
  }, [clearCart]);

  const handlePublish = async () => {
    if (!name || !address || !stateName || !district) return toast.error('Name, Address, State, and District are required!');
    
    try {
      setIsPublishing(true);
      
      const bizPayload = {
        businessType: initialData?.businessType || 'FOOD_BEVERAGE',
        subcategorySlug: initialData?.subcategorySlug,
        bookingMode: initialData?.bookingMode,
        businessName: name,
        localityName: address,
        state: stateName,
        district: district,
        cityName: district,
        pincode: pincode || '000000',
        description: description,
        themeFlavor: themeId,
        categoryIds: initialData?.categoryIds || (initialData?.categories ? initialData.categories.map((c: any) => c.categoryId || c.category?.id).filter(Boolean) : (initialData?.selectedCategoryId ? [initialData.selectedCategoryId] : [])),
        locationType: 'Commercial',
        timeAvailability: '9 AM - 10 PM',
        workingDays: 'Monday - Sunday',
        connectionMode: 'REQUIRE_APPROVAL',
        metaData: {
          taxonomy: taxonomySelections,
          customTags,
          isDineInAvailable: dineIn,
          isPureVeg,
          logoUrl,
          offers,
          displayName,
          tagline,
          aboutText,
          contactPhone,
          contactEmail,
          enableServiceSelection
        }
      };
      if (mode === 'edit') {
        await apiClient.patch('/business/update', bizPayload);
        
        // Sync catalog deletions
        for (const id of deletedCatalogIds) {
          await apiClient.delete(`/catalog/${id}`);
        }

        // Sync catalog additions/updates
        for (const item of catalog) {
          const formData = new FormData();
          formData.append('title', item.title);
          formData.append('price', item.price.toString());
          formData.append('description', item.description || '');
          formData.append('foodCategory', Array.isArray(item.foodCategory) ? item.foodCategory.join(', ') : (item.foodCategory || 'Main Course'));
          formData.append('isActive', String(item.isActive));
          formData.append('isAvailable', 'true');
          formData.append('isVeg', String(item.metaData?.isVeg ?? true));
          if (item.file) {
            formData.append('media', item.file);
          } else if (item.mediaUrl) {
            formData.append('mediaUrl', item.mediaUrl);
          }
          
          if (item.id && !item.id.match(/^\d+$/)) {
            // Existing item: PATCH
            await apiClient.patch(`/catalog/${item.id}`, formData);
          } else {
            // New item: POST
            await apiClient.post('/catalog', formData);
          }
        }

        toast.success('Storefront App Updated!');
        if (onExit) onExit();
        else onSuccess();
      } else {
        const bizRes = await apiClient.post('/business/register', bizPayload);
        const newBizId = bizRes.data.data.id;

        for (const item of catalog) {
          const formData = new FormData();
          formData.append('title', item.title);
          formData.append('price', item.price.toString());
          formData.append('description', item.description || '');
          formData.append('foodCategory', Array.isArray(item.foodCategory) ? item.foodCategory.join(', ') : (item.foodCategory || 'Main Course'));
          formData.append('isActive', String(item.isActive));
          formData.append('isAvailable', 'true');
          formData.append('isVeg', String(item.metaData?.isVeg ?? true));
          if (item.file) {
            formData.append('media', item.file);
          } else if (item.mediaUrl) {
            formData.append('mediaUrl', item.mediaUrl);
          }
          
          await apiClient.post('/catalog', formData, {
            headers: { 'x-business-id': newBizId }
          });
        }

        toast.success('Storefront App Built & Published!');
        onSuccess();
      }

    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || error.message || 'Failed to publish storefront app.');
    } finally {
      setIsPublishing(false);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, setter: (val: string) => void) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setter(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };


  const addOffer = () => {
    if (!offerCode || !offerTitle) return;
    setOffers([...offers, { code: offerCode, discount: offerDiscount, title: offerTitle }]);
    setOfferCode('');
    setOfferDiscount('');
    setOfferTitle('');
  };

  const toggleAvailability = (id: string) => {
    setCatalog(catalog.map(item => item.id === id ? { ...item, isActive: !item.isActive } : item));
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedItemId(id);
    if (e.dataTransfer) {
      e.dataTransfer.effectAllowed = 'move';
      e.dataTransfer.setData('text/html', e.currentTarget as any);
    }
  };

  const handleDragOver = (e: React.DragEvent, id: string) => {
    e.preventDefault();
    if (!draggedItemId || draggedItemId === id) return;

    const draggedIdx = catalog.findIndex(c => c.id === draggedItemId);
    const targetIdx = catalog.findIndex(c => c.id === id);

    if (draggedIdx === -1 || targetIdx === -1) return;

    const newCatalog = [...catalog];
    const [draggedItem] = newCatalog.splice(draggedIdx, 1);
    newCatalog.splice(targetIdx, 0, draggedItem);
    setCatalog(newCatalog);
  };

  const handleDragEnd = () => {
    setDraggedItemId(null);
  };

  const getDefaultPreviewName = () => {
    const bType = initialData?.businessType;
    if (bType === 'SALON_BEAUTY') return 'City Hair Salon';
    if (bType === 'DOCTOR_CLINIC') return 'Dr. Sharma Clinic';
    if (bType === 'TUTOR_ACADEMY') return 'Academic Excellence';
    if (isRetail) return 'Your Store';
    if (isService) return 'Your Business';
    return 'Your Restaurant';
  };

  const previewCatalog = catalog.length > 0 ? catalog.filter((c: any) => c.isActive !== false).map(c => ({
    ...c,
    // Map list editor field names to schema models
    title: c.title,
    price: c.price,
    description: c.description,
    mediaUrl: c.mediaUrl
  })) : (() => {
    const bType = initialData?.businessType;
    if (isRetail) return [
      { id: '1', title: 'Premium Wireless Headphones', price: 2999, isActive: true, foodCategory: 'Electronics' },
      { id: '2', title: 'Classic Leather Wallet', price: 899, isActive: true, foodCategory: 'Accessories' }
    ];
    if (bType === 'SALON_BEAUTY') return [
      { id: '1', title: 'Haircut & Styling', price: 499, isActive: true, description: '45 min session' },
      { id: '2', title: 'Deep Conditioning', price: 799, isActive: true, description: '60 min treatment' },
      { id: '3', title: 'Manicure & Pedicure', price: 999, isActive: true, description: 'Nail care combo' }
    ];
    if (bType === 'DOCTOR_CLINIC') return [
      { id: '1', title: 'General Consultation', price: 500, isActive: true, description: '20 min in-clinic' },
      { id: '2', title: 'Video Consultation', price: 300, isActive: true, description: '15 min online' },
      { id: '3', title: 'Follow-up Visit', price: 200, isActive: true, description: '10 min review' }
    ];
    if (bType === 'TUTOR_ACADEMY') return [
      { id: '1', title: 'Mathematics (Class 10)', price: 1200, isActive: true, description: 'Monthly batch' },
      { id: '2', title: 'Physics Crash Course', price: 2500, isActive: true, description: '30-hour program' },
      { id: '3', title: 'Exam Preparation', price: 3500, isActive: true, description: 'Full syllabus coverage' }
    ];
    if (isService) return [
      { id: '1', title: 'Basic Package', price: 999, isActive: true, description: 'Standard service' },
      { id: '2', title: 'Premium Package', price: 1999, isActive: true, description: 'Priority + extras' }
    ];
    // FOOD_BEVERAGE default
    return [
      { id: '1', title: 'High-Protein Egg Curry', price: 250, isActive: true, metaData: { isVeg: false, dietaryType: 'egg' }, variants: [{id: 'v1', name: 'Half', price: 150}, {id: 'v2', name: 'Full', price: 250}] },
      { id: '2', title: 'Garlic Naan', price: 50, isActive: true, metaData: { isVeg: true, dietaryType: 'veg' } }
    ];
  })();

  const previewBusiness = {
    businessName: name || getDefaultPreviewName(),
    address: address || '123 Main Street',
    description: description || '',
    themeFlavor: themeId,
    businessType: initialData?.businessType || 'FOOD_BEVERAGE',
    metaData: {
      taxonomy: taxonomySelections,
      customTags,
      isDineInAvailable: dineIn,
      isPureVeg,
      bannerUrl,
      logoUrl,
      offers,
      displayName: displayName || name,
      tagline,
      aboutText,
      contactPhone,
      contactEmail,
      enableServiceSelection
    },
    catalog: previewCatalog,
    catalogItems: previewCatalog
  };

  const currentArchetype = getTemplateArchetype(initialData?.businessType);
  const templates = TEMPLATE_METADATA.filter(t => t.archetype === currentArchetype);

  const activeTabs = useMemo(() => {
    let tabs = [];
    const baseTabs = [
      { id: 'profile', icon: Store, title: 'Profile Details', desc: 'Name, address & description' },
      { id: 'contact', icon: MapPin, title: 'Contact Info', desc: 'Phone, Email & Website' },
      { id: 'theme', icon: Palette, title: 'Theme & Styling', desc: 'Colors & layouts' }
    ];

    if (currentArchetype === 'FOOD_BEVERAGE') {
      tabs = [
        ...baseTabs,
        { id: 'menu', icon: Menu, title: 'Menu Setup', desc: 'Dishes, prices & variants' },
        { id: 'taxonomy', icon: Tags, title: 'Category Tags', desc: 'Cuisines, Pure Veg, etc.' },
        { id: 'offers', icon: Tag, title: 'Offers & Coupons', desc: 'Discounts & promos' }
      ];
    } else if (currentArchetype === 'RETAIL') {
      tabs = [
        ...baseTabs,
        { id: 'menu', icon: Store, title: 'Inventory', desc: 'Products & stock' },
        { id: 'taxonomy', icon: Tags, title: 'Tags & Attributes', desc: 'Product categories' },
        { id: 'offers', icon: Tag, title: 'Offers & Coupons', desc: 'Discounts & promos' }
      ];
    } else if (moduleConfig.scheduling) { // SERVICE_BOOKING
      tabs = [
        ...baseTabs,
        { id: 'taxonomy', icon: Briefcase, title: 'Expertise & Tags', desc: 'Specialties & categories' },
        { id: 'services', icon: Menu, title: 'Service Menu', desc: 'Services & durations' },
        { id: 'availability', icon: MapPin, title: 'Availability & Slots', desc: 'Working hours & calendar' }
      ];
    } else if (moduleConfig.leadGen) { // SERVICE_LEADGEN & GENERIC
      tabs = [
        ...baseTabs,
        { id: 'taxonomy', icon: Briefcase, title: 'Expertise & Tags', desc: 'Specialties & skills' },
        { id: 'services', icon: ImageIcon, title: 'Portfolio & Estimates', desc: 'Past work & starting prices' },
        { id: 'enquiry_form', icon: FileText, title: 'Enquiry Form Setup', desc: 'What to ask customers' }
      ];
    } else {
      tabs = [...baseTabs];
    }

    return tabs;
  }, [currentArchetype, moduleConfig]);

  const currentTabIndex = activeTabs.findIndex(t => t.id === activeTabId);
  const currentTab = activeTabs[currentTabIndex];
  const nextTab = activeTabs[currentTabIndex + 1];
  const prevTab = activeTabs[currentTabIndex - 1];

  const handleNext = () => {
    if (nextTab) setActiveTabId(nextTab.id);
  };

  const handleBack = () => {
    if (prevTab) setActiveTabId(prevTab.id);
  };

  return (
    <div className="fixed inset-0 z-[100] bg-zinc-50 flex overflow-hidden">
      
      {/* 1. LEFT COLUMN: SIDEBAR */}
      <div className="w-72 bg-white border-r border-zinc-200 flex flex-col shadow-[4px_0_24px_rgba(0,0,0,0.02)] z-20 shrink-0">
        <div className="p-6 border-b border-zinc-100 mb-2 flex items-center justify-between">
          <h1 className="text-xl font-black text-zinc-900 tracking-tight">App Builder</h1>
          {onExit && (
            <button 
              onClick={onExit}
              className="p-2 text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-xl transition-all"
              title="Exit Builder"
            >
              <Trash2 className="w-5 h-5 hidden" />
              <div className="text-xs font-bold bg-zinc-100 text-zinc-600 px-2 py-1 rounded-lg">Exit</div>
            </button>
          )}
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {activeTabs.map((tab, idx) => {
            const isActive = activeTabId === tab.id;
            const isCompleted = currentTabIndex > idx;
            return (
              <button 
                key={tab.id}
                onClick={() => setActiveTabId(tab.id)}
                className={`w-full flex items-center gap-4 p-3 rounded-2xl transition-all text-left group ${isActive ? 'bg-blue-50/80 ring-1 ring-blue-100' : 'hover:bg-zinc-50'}`}
              >
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 shadow-sm ${isActive ? 'bg-blue-600 text-white shadow-blue-600/20' : isCompleted ? 'bg-emerald-100 text-emerald-600 border border-emerald-200' : 'bg-white text-zinc-400 border border-zinc-200 group-hover:bg-zinc-50 group-hover:text-zinc-600'}`}>
                  {isCompleted && !isActive ? <Check className="w-5 h-5" /> : <tab.icon className="w-5 h-5" />}
                </div>
                <div>
                  <p className={`text-[15px] font-bold ${isActive ? 'text-blue-900' : 'text-zinc-700'}`}>{tab.title}</p>
                  <p className={`text-[11px] font-medium leading-snug mt-0.5 ${isActive ? 'text-blue-600' : 'text-zinc-400'}`}>{tab.desc}</p>
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* 2. CENTER COLUMN: EDITOR */}
      <div className="flex-1 flex flex-col h-full bg-zinc-50/50 relative overflow-hidden">
        <div className="px-10 py-6 border-b border-zinc-200 bg-white/80 backdrop-blur-xl flex justify-between items-center sticky top-0 z-10">
            <div>
              <h2 className="text-2xl font-black text-zinc-900">{currentTab?.title}</h2>
              <p className="text-zinc-500 font-medium text-sm mt-1">{currentTab?.desc}</p>
            </div>
            <button 
              onClick={handlePublish}
              disabled={isPublishing}
              className="px-6 py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold transition-all shadow-md disabled:opacity-50 flex items-center gap-2"
            >
              {isPublishing ? 'Publishing...' : 'Publish App'} <Check className="w-4 h-4" />
            </button>
        </div>
        
        <div className="flex-1 overflow-y-auto px-10 pt-8 pb-32">
          <div className="max-w-4xl mx-auto space-y-8 animate-in slide-in-from-bottom-4 fade-in duration-300">
            
            {activeTabId === 'profile' && (
              <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
                <div className="flex gap-6 mb-8">
                  <div className="flex-1 space-y-2">
                    <label className="block text-sm font-bold text-zinc-700">Logo Image</label>
                    <div className="relative group cursor-pointer h-32 rounded-2xl border-2 border-dashed border-zinc-200 hover:border-blue-500 bg-zinc-50 flex items-center justify-center overflow-hidden transition-all">
                      {logoUrl ? <img src={logoUrl} alt="Logo" className="w-full h-full object-contain p-2" /> : <div className="text-center"><ImageIcon className="w-6 h-6 mx-auto text-zinc-400 mb-2" /><span className="text-xs font-bold text-zinc-500">Upload Logo</span></div>}
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, setLogoUrl)} />
                    </div>
                  </div>
                  <div className="flex-[2] space-y-2">
                    <label className="block text-sm font-bold text-zinc-700">Banner Image</label>
                    <div className="relative group cursor-pointer h-32 rounded-2xl border-2 border-dashed border-zinc-200 hover:border-blue-500 bg-zinc-50 flex items-center justify-center overflow-hidden transition-all">
                      {bannerUrl ? <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" /> : <div className="text-center"><Upload className="w-6 h-6 mx-auto text-zinc-400 mb-2" /><span className="text-xs font-bold text-zinc-500">Upload Banner (Landscape)</span></div>}
                      <input type="file" accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" onChange={(e) => handleFileUpload(e, setBannerUrl)} />
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Business Name <span className="text-red-500">*</span></label>
                  <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. The Spicy Kitchen" className="w-full px-5 py-4 rounded-2xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium text-base" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Display Name (Owner/Brand) <span className="text-red-500">*</span></label>
                  <input type="text" value={displayName} onChange={e => setDisplayName(e.target.value)} placeholder="e.g. Dr. Sarah Johnson" className="w-full px-5 py-4 rounded-2xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium text-base" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Tagline / Slogan</label>
                  <input type="text" value={tagline} onChange={e => setTagline(e.target.value)} placeholder="e.g. Master Stylist & Owner" className="w-full px-5 py-4 rounded-2xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium text-base" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">About Text</label>
                  <textarea value={aboutText} onChange={e => setAboutText(e.target.value)} rows={4} placeholder="Detailed about section..." className="w-full px-5 py-4 rounded-2xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium text-base resize-none"></textarea>
                </div>
                
                {/* Legacy Profile Fields Below */}
                <hr className="border-zinc-100" />
                <h4 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Location Details</h4>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Detailed Address <span className="text-red-500">*</span></label>
                  <input type="text" value={address} onChange={e => setAddress(e.target.value)} placeholder="e.g. 123 Food Street, Downtown" className="w-full px-5 py-4 rounded-2xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium text-base" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">State <span className="text-red-500">*</span></label>
                    <select
                      value={stateName}
                      onChange={e => { setStateName(e.target.value); setDistrict(''); }}
                      className="w-full px-5 py-4 rounded-2xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium text-base"
                    >
                      <option value="" disabled>Select State</option>
                      {regionStates.map((s) => (
                        <option key={s.name} value={s.name}>{s.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-bold text-zinc-700 mb-2">District <span className="text-red-500">*</span></label>
                    <select
                      value={district}
                      disabled={!stateName}
                      onChange={e => setDistrict(e.target.value)}
                      className="w-full px-5 py-4 rounded-2xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium text-base disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      <option value="" disabled>{stateName ? 'Select District' : 'Pick a state first'}</option>
                      {districtsForState(regionStates, stateName).map((d) => (
                        <option key={d.slug} value={d.name}>{d.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Pincode</label>
                  <input type="text" value={pincode} onChange={e => setPincode(e.target.value)} placeholder="e.g. 110001" className="w-full px-5 py-4 rounded-2xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium text-base" />
                </div>
              </div>
            )}
            
            {activeTabId === 'contact' && (
              <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Contact Phone</label>
                  <input type="text" value={contactPhone} onChange={e => setContactPhone(e.target.value)} placeholder="+1 234 567 8900" className="w-full px-5 py-4 rounded-2xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium text-base" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-zinc-700 mb-2">Contact Email</label>
                  <input type="email" value={contactEmail} onChange={e => setContactEmail(e.target.value)} placeholder="hello@example.com" className="w-full px-5 py-4 rounded-2xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all font-medium text-base" />
                </div>
              </div>
            )}

            {activeTabId === 'theme' && (
              <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {templates.map(t => {
                    const isActive = themeId === t.id;
                    return (
                      <button 
                        key={t.id}
                        onClick={() => setThemeId(t.id)}
                        className={`p-6 rounded-3xl border-2 text-left transition-all relative ${isActive ? 'border-blue-600 bg-blue-50/30 shadow-[0_8px_30px_rgba(37,99,235,0.1)] scale-[1.02]' : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50'}`}
                      >
                        {isActive && <div className="absolute top-4 right-4 w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center shadow-md"><Check className="w-3 h-3 text-white" /></div>}
                        <div className={`w-16 h-12 rounded-xl mb-6 ${t.color} border shadow-inner`}></div>
                        <h4 className={`text-base font-black mb-1 ${isActive ? 'text-blue-900' : 'text-zinc-900'}`}>{t.name}</h4>
                        <p className="text-xs font-medium text-zinc-500 line-clamp-2">Premium app template optimized for conversions.</p>
                      </button>
                    )
                  })}
                </div>
              </div>
            )}

            {activeTabId === 'taxonomy' && (
              <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-8">
                 {currentArchetype === 'FOOD_BEVERAGE' && (
                   <div className="flex flex-col gap-4 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                     <label className="flex items-center gap-4 cursor-pointer">
                        <input type="checkbox" checked={dineIn} onChange={e => setDineIn(e.target.checked)} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                        <span className="text-base font-bold text-zinc-900">Enable Dine-In Orders</span>
                     </label>
                     <label className="flex items-center gap-4 cursor-pointer">
                        <input type="checkbox" checked={isPureVeg} onChange={e => setIsPureVeg(e.target.checked)} className="w-5 h-5 rounded text-green-600 focus:ring-green-500" />
                        <span className="text-base font-bold text-green-700 bg-green-100 px-3 py-1 rounded-lg">Pure Veg Restaurant</span>
                     </label>
                   </div>
                 )}
                 {currentArchetype === 'RETAIL' && (
                   <div className="flex flex-col gap-4 bg-zinc-50 p-6 rounded-2xl border border-zinc-100">
                     <label className="flex items-center gap-4 cursor-pointer">
                        <input type="checkbox" checked={dineIn} onChange={e => setDineIn(e.target.checked)} className="w-5 h-5 rounded text-blue-600 focus:ring-blue-500" />
                        <span className="text-base font-bold text-zinc-900">Offer Click & Collect (Store Pickup)</span>
                     </label>
                   </div>
                 )}
                 {taxonomySchema.map(field => (
                   <div key={field.id} className="pt-6 first:pt-0 first:border-0 border-t border-zinc-100">
                     <h3 className="text-sm font-bold text-zinc-700 mb-4 uppercase tracking-wider">{field.label}</h3>
                     <div className="flex flex-wrap gap-3">
                       {field.options.map(option => {
                         const currentVal = taxonomySelections[field.id];
                         const isSel = field.type === 'multi_select' 
                           ? (currentVal || []).includes(option)
                           : currentVal === option;

                         return (
                           <button 
                             key={option}
                             onClick={() => field.type === 'multi_select' ? toggleTaxonomyMulti(field.id, option) : setTaxonomySingle(field.id, option)}
                             className={`px-5 py-3 rounded-xl text-sm font-bold border-2 transition-all flex items-center gap-2 ${isSel ? 'border-blue-600 bg-blue-50 text-blue-700 shadow-sm' : 'border-zinc-200 text-zinc-500 hover:border-zinc-300 hover:bg-zinc-50'}`}
                           >
                             {isSel && <Check className="w-4 h-4" />}
                             {option}
                           </button>
                         )
                       })}
                     </div>
                   </div>
                 ))}

                 {taxonomySchema.length === 0 && currentArchetype !== 'FOOD_BEVERAGE' && currentArchetype !== 'RETAIL' && (
                   <div className="text-center py-8">
                     <Tags className="w-12 h-12 text-zinc-300 mx-auto mb-4" />
                     <p className="text-zinc-500 font-bold">No predefined tags for this category.</p>
                     <p className="text-zinc-400 text-sm mt-1">You can add custom tags below.</p>
                   </div>
                 )}

                 <div className="pt-6 border-t border-zinc-100">
                   <h3 className="text-sm font-bold text-zinc-700 mb-3 uppercase tracking-wider">Add Custom Tags</h3>
                   <div className="flex flex-wrap gap-2 mb-4">
                     {customTags.map((tag, idx) => (
                       <span key={idx} className="px-3 py-1.5 bg-zinc-100 border border-zinc-200 text-zinc-700 rounded-lg text-xs font-bold flex items-center gap-2">
                         {tag}
                         <button onClick={() => setCustomTags(customTags.filter((_, i) => i !== idx))} className="hover:text-rose-500">
                           <X className="w-3 h-3" />
                         </button>
                       </span>
                     ))}
                   </div>
                   <div className="flex gap-3">
                     <input type="text" maxLength={20} value={customTagInput} onChange={e => setCustomTagInput(e.target.value)} placeholder="Type a custom tag" className="flex-1 h-12 px-5 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none text-sm font-semibold" />
                     <button onClick={addCustomTag} className="h-12 px-8 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold transition-colors shadow-md">
                       Add
                     </button>
                   </div>
                 </div>
              </div>
            )}

            {activeTabId === 'enquiry_form' && (
              <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-xl font-black text-zinc-900 mb-2">Enquiry Form Setup</h3>
                  <p className="text-zinc-500 text-sm mb-6">Choose what information clients must provide when requesting a quote or booking.</p>
                  
                  <div className="space-y-4">
                    <label className="flex items-center justify-between p-4 border border-zinc-200 rounded-xl bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-colors">
                      <div>
                        <div className="font-bold text-zinc-900">Require Photo Upload</div>
                        <div className="text-xs text-zinc-500">Clients must upload a photo of the issue (e.g. broken pipe)</div>
                      </div>
                      <input type="checkbox" className="w-5 h-5 rounded text-blue-600" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between p-4 border border-zinc-200 rounded-xl bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-colors">
                      <div>
                        <div className="font-bold text-zinc-900">Require Detailed Address</div>
                        <div className="text-xs text-zinc-500">Ask for full address instead of just locality</div>
                      </div>
                      <input type="checkbox" className="w-5 h-5 rounded text-blue-600" defaultChecked />
                    </label>
                    <label className="flex items-center justify-between p-4 border border-zinc-200 rounded-xl bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-colors">
                      <div>
                        <div className="font-bold text-zinc-900">Require Preferred Date/Time</div>
                        <div className="text-xs text-zinc-500">Ask when they need the service done</div>
                      </div>
                      <input type="checkbox" className="w-5 h-5 rounded text-blue-600" defaultChecked />
                    </label>
                    
                    <label className="flex items-center justify-between p-4 border border-zinc-200 rounded-xl bg-zinc-50 cursor-pointer hover:bg-zinc-100 transition-colors mt-6">
                      <div>
                        <div className="font-bold text-zinc-900">Enable Service Selection</div>
                        <div className="text-xs text-zinc-500">Customers must select a service/treatment from the catalog before enquiring</div>
                      </div>
                      <input type="checkbox" checked={enableServiceSelection} onChange={e => setEnableServiceSelection(e.target.checked)} className="w-5 h-5 rounded text-blue-600" />
                    </label>
                  </div>
                </div>
              </div>
            )}



            {['menu', 'services'].includes(activeTabId) && (
              <div className="space-y-6">
                <div className="flex justify-end">
                   <button 
                     onClick={() => { setEditItem(null); setIsDishModalOpen(true); }}
                     className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-[0_8px_20px_rgba(37,99,235,0.2)] flex items-center gap-2 hover:-translate-y-0.5"
                   >
                     <Plus className="w-5 h-5" /> {isService ? 'Add Service Package' : (isRetail ? 'Add New Product' : 'Add New Dish')}
                   </button>
                </div>
                
                {catalog.length === 0 ? (
                  <div className="bg-white border-2 border-dashed border-zinc-200 rounded-3xl p-16 text-center flex flex-col items-center">
                    <div className="w-20 h-20 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                      <Menu className="w-10 h-10" />
                    </div>
                    <h3 className="text-2xl font-black text-zinc-900 mb-2">{isService ? 'Your service list is empty' : (isRetail ? 'Your inventory is empty' : 'Your menu is empty')}</h3>
                    <p className="text-zinc-500 mb-8 max-w-sm text-base">{isService ? 'Start building your professional profile by adding your first service package.' : (isRetail ? 'Start building your store by adding your first product.' : 'Start building your catalog by adding your first delicious dish.')}</p>
                    <button 
                      onClick={() => { setEditItem(null); setIsDishModalOpen(true); }}
                      className="px-8 py-4 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold transition-all shadow-xl flex items-center gap-2 text-lg hover:-translate-y-1"
                    >
                      <Plus className="w-6 h-6" /> {isService ? 'Add First Service' : (isRetail ? 'Add First Product' : 'Add First Dish')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex justify-between items-center bg-white p-2 rounded-2xl border border-zinc-200 shadow-sm">
                      <div className="pl-4">
                        <span className="text-sm font-bold text-zinc-500">{catalog.length} Items Configured</span>
                      </div>
                      <div className="flex gap-1 bg-zinc-100/50 p-1 rounded-xl">
                        <button onClick={() => setMenuViewMode('list')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${menuViewMode === 'list' ? 'bg-white shadow-sm text-zinc-900 border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'}`}>List View</button>
                        <button onClick={() => setMenuViewMode('grid')} className={`px-4 py-2 rounded-lg font-bold text-sm transition-all ${menuViewMode === 'grid' ? 'bg-white shadow-sm text-zinc-900 border border-zinc-200/50' : 'text-zinc-500 hover:text-zinc-700 hover:bg-zinc-100'}`}>Grid View</button>
                      </div>
                    </div>
                    
                    {menuViewMode === 'list' ? (
                      <div className="space-y-3">
                         {catalog.map(item => (
                            <div 
                              key={item.id}
                              draggable
                              onDragStart={(e) => handleDragStart(e, item.id)}
                              onDragOver={(e) => handleDragOver(e, item.id)}
                              onDragEnd={handleDragEnd}
                              className={`bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between group transition-all ${draggedItemId === item.id ? 'opacity-50 scale-[0.99] border-dashed border-emerald-500 bg-emerald-50/50' : 'hover:border-emerald-500/30 hover:shadow-md cursor-grab'}`}
                            >
                               <div className="flex items-center gap-4 flex-1 min-w-0">
                                  <div className="text-zinc-300 group-hover:text-zinc-500 transition-colors shrink-0">
                                    <GripVertical className="w-6 h-6" />
                                  </div>
                                  <div className="shrink-0 w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm flex items-center justify-center">
                                    {item.mediaUrl ? (
                                      <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <ImageIcon className="w-6 h-6 text-zinc-400" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0 pr-4">
                                     <h4 className={`text-base font-bold flex items-start gap-2 ${item.isActive ? 'text-zinc-900' : 'text-zinc-400 line-through'}`}>
                                        {!isRetail && !isService && (item.metaData?.isVeg ? <span className="w-3 h-3 rounded-[3px] bg-green-500 shadow-[0_0_0_1px_rgba(34,197,94,0.2)] mt-1.5 shrink-0"></span> : <span className="w-3 h-3 rounded-[3px] bg-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.2)] mt-1.5 shrink-0"></span>)}
                                        <span className="break-all leading-tight min-w-0">{item.title}</span>
                                     </h4>
                                     <div className="flex flex-wrap gap-1.5 mt-2">
                                        <span className="font-black text-zinc-900 bg-zinc-100 px-2 py-0.5 rounded text-xs">₹{item.price}</span>
                                        {(Array.isArray(item.foodCategory) ? item.foodCategory : [item.foodCategory || 'Mains']).map((cat: string, i: number) => (
                                          <span key={i} className="px-2 py-0.5 bg-emerald-50 border border-emerald-100 text-emerald-700 text-[10px] font-bold rounded uppercase tracking-wider">{cat}</span>
                                        ))}
                                        {item.variants && item.variants.length > 0 && (
                                          <span className="px-2 py-0.5 bg-blue-50 border border-blue-100 text-blue-700 text-[10px] font-bold rounded uppercase tracking-wider">+{item.variants.length} Variants</span>
                                        )}
                                     </div>
                                  </div>
                               </div>
                               
                               <div className="flex items-center gap-4 shrink-0 mt-4 md:mt-0 w-full md:w-auto justify-end border-t md:border-t-0 border-zinc-100 pt-4 md:pt-0">
                                  <label className="inline-flex items-center cursor-pointer mr-2">
                                    <div className="relative">
                                      <input type="checkbox" className="sr-only" checked={item.isActive} onChange={() => toggleAvailability(item.id)} />
                                      <div className={`block w-12 h-7 rounded-full transition-colors ${item.isActive ? 'bg-emerald-500' : 'bg-zinc-300'}`}></div>
                                      <div className={`absolute left-1 top-1 bg-white w-5 h-5 rounded-full transition-transform shadow-sm ${item.isActive ? 'transform translate-x-5' : ''}`}></div>
                                    </div>
                                  </label>
                                  
                                  <div className="flex items-center gap-1 bg-zinc-50 rounded-xl p-1 border border-zinc-200">
                                    <button 
                                      onClick={() => { setEditItem(item); setIsDishModalOpen(true); }} 
                                      className="p-2 text-zinc-500 hover:text-blue-600 hover:bg-white rounded-lg transition-all shadow-sm"
                                    >
                                      <Edit className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleDeleteItem(item.id)} 
                                      className="p-2 text-zinc-500 hover:text-rose-500 hover:bg-white rounded-lg transition-all shadow-sm"
                                    >
                                      <Trash2 className="w-4 h-4" />
                                    </button>
                                  </div>
                               </div>
                            </div>
                         ))}
                      </div>
                    ) : (
                      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                         {catalog.map(item => (
                            <div 
                              key={item.id}
                              className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-4 flex flex-col group transition-all hover:border-emerald-500/30 hover:shadow-md relative"
                            >
                               <div className="flex justify-between items-start mb-4">
                                  <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-200 shadow-sm flex items-center justify-center shrink-0">
                                    {item.mediaUrl ? (
                                      <img src={item.mediaUrl} alt={item.title} className="w-full h-full object-cover" />
                                    ) : (
                                      <ImageIcon className="w-6 h-6 text-zinc-400" />
                                    )}
                                  </div>
                                  <label className="inline-flex items-center cursor-pointer">
                                    <div className="relative">
                                      <input type="checkbox" className="sr-only" checked={item.isActive} onChange={() => toggleAvailability(item.id)} />
                                      <div className={`block w-10 h-6 rounded-full transition-colors ${item.isActive ? 'bg-emerald-500' : 'bg-zinc-300'}`}></div>
                                      <div className={`absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform shadow-sm ${item.isActive ? 'transform translate-x-4' : ''}`}></div>
                                    </div>
                                  </label>
                               </div>
                               
                               <div className="flex-1">
                                 <h4 className={`text-base font-bold flex items-start gap-2 mb-2 ${item.isActive ? 'text-zinc-900' : 'text-zinc-400 line-through'}`}>
                                    {!isRetail && !isService && (item.metaData?.isVeg ? <span className="w-3 h-3 rounded-[3px] bg-green-500 shadow-[0_0_0_1px_rgba(34,197,94,0.2)] mt-1.5 shrink-0"></span> : <span className="w-3 h-3 rounded-[3px] bg-red-500 shadow-[0_0_0_1px_rgba(239,68,68,0.2)] mt-1.5 shrink-0"></span>)}
                                    <span className="leading-tight break-all min-w-0">{item.title}</span>
                                 </h4>
                                 <div className="font-black text-lg text-zinc-900 mb-3">₹{item.price}</div>
                                 
                                 <div className="flex flex-wrap gap-1.5 mb-4">
                                    {(Array.isArray(item.foodCategory) ? item.foodCategory : [item.foodCategory || 'Mains']).map((cat: string, i: number) => (
                                      <span key={i} className="px-2 py-0.5 bg-zinc-100 border border-zinc-200 text-zinc-600 text-[10px] font-bold rounded uppercase tracking-wider">{cat}</span>
                                    ))}
                                 </div>
                               </div>
                               
                               <div className="flex items-center gap-2 pt-4 border-t border-zinc-100 mt-auto">
                                 <button 
                                   onClick={() => { setEditItem(item); setIsDishModalOpen(true); }} 
                                   className="flex-1 py-2 text-zinc-600 hover:text-blue-600 bg-zinc-50 hover:bg-blue-50 border border-zinc-200 rounded-xl font-bold text-sm transition-colors flex justify-center items-center gap-2"
                                 >
                                   <Edit className="w-4 h-4" /> Edit
                                 </button>
                                 <button 
                                   onClick={() => handleDeleteItem(item.id)} 
                                   className="p-2 text-zinc-400 hover:text-rose-500 bg-zinc-50 hover:bg-rose-50 border border-zinc-200 rounded-xl transition-colors flex justify-center items-center"
                                 >
                                   <Trash2 className="w-4 h-4" />
                                 </button>
                               </div>
                            </div>
                         ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {activeTabId === 'availability' && (
              <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-6">
                <div>
                  <h3 className="text-lg font-black text-zinc-900 mb-2">Working Hours</h3>
                  <p className="text-zinc-500 text-sm mb-6">Define your standard availability for bookings.</p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">Start Time</label>
                      <select className="w-full px-5 py-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none font-bold">
                        <option>09:00 AM</option>
                        <option>10:00 AM</option>
                        <option>11:00 AM</option>
                      </select>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-zinc-700 uppercase tracking-wider">End Time</label>
                      <select className="w-full px-5 py-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none font-bold">
                        <option>05:00 PM</option>
                        <option>06:00 PM</option>
                        <option>07:00 PM</option>
                        <option>08:00 PM</option>
                      </select>
                    </div>
                  </div>
                </div>
                
                <div className="pt-6 border-t border-zinc-100">
                  <h3 className="text-lg font-black text-zinc-900 mb-2">Slot Duration</h3>
                  <p className="text-zinc-500 text-sm mb-4">How long does a typical appointment/service take?</p>
                  <select className="w-full px-5 py-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-blue-600 outline-none font-bold">
                    <option>15 Minutes</option>
                    <option>30 Minutes</option>
                    <option>45 Minutes</option>
                    <option>60 Minutes</option>
                    <option>90 Minutes</option>
                    <option>120 Minutes</option>
                  </select>
                </div>
              </div>
            )}

            {activeTabId === 'offers' && (
              <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm space-y-8">
                 {offers.length > 0 && (
                   <div className="grid grid-cols-1 gap-4">
                     {offers.map((offer, idx) => (
                       <div key={idx} className="flex items-center justify-between p-6 border-2 border-dashed border-emerald-200 bg-emerald-50/50 rounded-2xl">
                          <div>
                            <div className="flex items-center gap-3 mb-1">
                               <Tag className="w-5 h-5 text-emerald-500" />
                               <h4 className="font-black text-emerald-900 text-lg">{offer.code}</h4>
                            </div>
                            <p className="text-sm font-bold text-emerald-600/80">{offer.title}</p>
                          </div>
                          <div className="flex items-center gap-6">
                             <span className="text-xl font-black text-emerald-600">{offer.discount}</span>
                             <button onClick={() => setOffers(offers.filter((_, i) => i !== idx))} className="p-3 text-rose-500 hover:bg-rose-100 rounded-xl transition-colors">
                               <Trash2 className="w-5 h-5" />
                             </button>
                          </div>
                       </div>
                     ))}
                   </div>
                 )}
                 
                 <div className="pt-6 border-t border-zinc-100">
                    <h3 className="text-lg font-black text-zinc-900 mb-4">Create New Promo</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                       <div>
                         <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Promo Code</label>
                         <input type="text" maxLength={15} value={offerCode} onChange={e => setOfferCode(e.target.value.toUpperCase())} placeholder="e.g. WELCOME50" className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold" />
                       </div>
                       <div>
                         <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Discount Text</label>
                         <input type="text" maxLength={10} value={offerDiscount} onChange={e => setOfferDiscount(e.target.value)} placeholder="e.g. 50% Off" className="w-full h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold" />
                       </div>
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-zinc-500 mb-1.5 uppercase tracking-wider">Description</label>
                      <div className="flex gap-3">
                        <input type="text" maxLength={30} value={offerTitle} onChange={e => setOfferTitle(e.target.value)} placeholder="e.g. Welcome to our restaurant!" className="flex-1 h-12 px-4 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:ring-2 focus:ring-emerald-500 outline-none text-sm font-bold" />
                        <button onClick={addOffer} className="h-12 px-8 bg-zinc-900 hover:bg-zinc-800 text-white rounded-xl font-bold transition-colors flex items-center gap-2">
                          <Plus className="w-4 h-4"/> Add Offer
                        </button>
                      </div>
                    </div>
                 </div>
              </div>
            )}

            {activeTabId === 'media' && (
              <div className="bg-white p-8 rounded-3xl border border-zinc-200 shadow-sm">
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                   <div className="space-y-4">
                     <div>
                       <h3 className="text-lg font-black text-zinc-900">Banner Image</h3>
                       <p className="text-sm font-medium text-zinc-500">Recommended size: 520x320px</p>
                     </div>
                     {bannerUrl ? (
                       <div className="relative w-full h-48 rounded-2xl border-2 border-dashed border-zinc-200 overflow-hidden group">
                         <img src={bannerUrl} alt="Banner" className="w-full h-full object-cover" />
                         <button onClick={() => setBannerUrl('')} className="absolute inset-0 bg-black/60 backdrop-blur-sm text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           <Trash2 className="w-6 h-6" /> Remove Banner
                         </button>
                       </div>
                     ) : (
                       <div className="relative">
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setBannerUrl)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          <button className="w-full h-48 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 rounded-2xl font-bold text-base transition-colors flex flex-col items-center justify-center gap-3 border-2 border-zinc-200 border-dashed">
                            <Upload className="w-8 h-8 text-zinc-400" /> Click or drag to upload Banner
                          </button>
                       </div>
                     )}
                   </div>
                   
                   <div className="space-y-4">
                     <div>
                       <h3 className="text-lg font-black text-zinc-900">Logo Image</h3>
                       <p className="text-sm font-medium text-zinc-500">Recommended size: 150x150px square</p>
                     </div>
                     {logoUrl ? (
                       <div className="relative w-full h-48 rounded-2xl border-2 border-dashed border-zinc-200 overflow-hidden group flex items-center justify-center bg-zinc-50">
                         <img src={logoUrl} alt="Logo" className="w-32 h-32 object-cover rounded-xl shadow-md" />
                         <button onClick={() => setLogoUrl('')} className="absolute inset-0 bg-black/60 backdrop-blur-sm text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                           <Trash2 className="w-6 h-6" /> Remove Logo
                         </button>
                       </div>
                     ) : (
                       <div className="relative">
                          <input type="file" accept="image/*" onChange={(e) => handleFileUpload(e, setLogoUrl)} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                          <button className="w-full h-48 bg-zinc-50 hover:bg-zinc-100 text-zinc-500 rounded-2xl font-bold text-base transition-colors flex flex-col items-center justify-center gap-3 border-2 border-zinc-200 border-dashed">
                            <Upload className="w-8 h-8 text-zinc-400" /> Click or drag to upload Logo
                          </button>
                       </div>
                     )}
                   </div>
                 </div>
              </div>
            )}

          </div>
        </div>
        
        {/* WIZARD FOOTER */}
        <div className="absolute bottom-0 left-0 right-0 px-10 py-5 bg-white/80 backdrop-blur-xl border-t border-zinc-200 shadow-[0_-10px_40px_rgba(0,0,0,0.03)] z-10 flex justify-between items-center">
          {prevTab ? (
             <button onClick={handleBack} className="px-6 py-3 font-bold text-zinc-500 hover:text-zinc-900 transition-colors flex items-center gap-2">
                <ChevronLeft className="w-5 h-5" /> Back
             </button>
          ) : <div></div>}
          
          {nextTab ? (
            <button onClick={handleNext} className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold transition-all shadow-[0_8px_20px_rgba(37,99,235,0.2)] hover:shadow-[0_12px_25px_rgba(37,99,235,0.3)] flex items-center gap-2 hover:-translate-y-0.5">
               Next Step: {nextTab.title} <ChevronRight className="w-5 h-5" />
            </button>
          ) : (
            <button onClick={handlePublish} disabled={isPublishing} className="px-8 py-3 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold transition-all shadow-[0_8px_20px_rgba(16,185,129,0.2)] flex items-center gap-2 disabled:opacity-50">
               {isPublishing ? 'Publishing...' : 'Publish App'} <Check className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {/* 3. RIGHT COLUMN: LIVE PREVIEW */}
      <div className="hidden lg:flex w-[380px] xl:w-[450px] bg-zinc-900 items-center justify-center relative overflow-hidden shadow-[-20px_0_40px_rgba(0,0,0,0.15)] z-30 shrink-0">
        
        {/* Background Blob/Decoration */}
        <div className="absolute top-[-10%] right-[-10%] w-[500px] h-[500px] bg-blue-500/20 rounded-full blur-[100px] pointer-events-none"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-[500px] h-[500px] bg-orange-500/10 rounded-full blur-[100px] pointer-events-none"></div>

        <div className="absolute top-8 left-8 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-sm font-bold shadow-2xl z-50">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          LIVE PREVIEW
        </div>

        <div className="w-[375px] h-[812px] bg-white rounded-[3rem] border-[8px] border-zinc-800 overflow-hidden shadow-2xl relative shrink-0 transform scale-[0.75] xl:scale-[0.85] origin-center transition-all duration-500">
          
          {/* Dynamic Island Mockup */}
          <div className="w-32 h-7 bg-zinc-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-3xl z-50 flex items-center justify-center gap-2">
             <div className="w-10 h-1 bg-zinc-900 rounded-full"></div>
             <div className="w-2 h-2 rounded-full bg-zinc-900"></div>
          </div>

          <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide relative z-40 bg-zinc-50">
             <LivePreviewRenderer themeId={themeId} currentArchetype={currentArchetype} business={previewBusiness} />
          </div>
        </div>
      </div>

      <DishModal 
        isOpen={isDishModalOpen}
        onClose={() => setIsDishModalOpen(false)}
        onSave={(dish, file) => {
          if (editItem) {
            setCatalog(catalog.map(c => c.id === dish.id ? { ...dish, file } : c));
          } else {
            setCatalog([...catalog, { ...dish, file }]);
          }
          setEditItem(null);
        }}
        availableCategories={(() => {
          const categoryKeys = ['cuisines', 'product_types', 'expertise', 'speciality', 'subjects', 'services', 'property_type'];
          const selectedCategories: string[] = [];
          categoryKeys.forEach(key => {
            if (Array.isArray(taxonomySelections[key])) {
              selectedCategories.push(...taxonomySelections[key]);
            }
          });
          const allOptions = [...selectedCategories, ...customTags];
          return allOptions.length > 0 ? allOptions : [isService ? 'General' : (isRetail ? 'General' : 'Mains')];
        })()}
        editItem={editItem}
        isRetail={isRetail}
        isService={isService}
      />
    </div>
  );
}
