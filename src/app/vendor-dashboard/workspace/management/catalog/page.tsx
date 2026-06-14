'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { Store, PackagePlus, ArrowRight, Loader2, Plus, Tag, Tags, Trash2, ArrowLeft, Pencil, Image as ImageIcon, FileUp, X, Eye, EyeOff, Paintbrush } from 'lucide-react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';

import { getTemplateComponent } from '@/lib/templateRegistry';

export default function CatalogManagementPage() {
  const { activeBusinessId } = useAuthStore();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [businessData, setBusinessData] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  
  // Builder State
  const [isBuilderMode, setIsBuilderMode] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Form State
  const [serviceCategory, setServiceCategory] = useState('');
  const [customCategory, setCustomCategory] = useState('');
  const [customTitle, setCustomTitle] = useState('');
  const [servicePrice, setServicePrice] = useState('');
  const [serviceDesc, setServiceDesc] = useState('');
  const [serviceDietary, setServiceDietary] = useState('veg'); // veg, non-veg, vegan, egg
  const [editItemId, setEditItemId] = useState<string | null>(null);
  const [mediaFile, setMediaFile] = useState<File | null>(null);
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  
  // Variant Pricing State
  const [isVariantPricing, setIsVariantPricing] = useState(false);
  const [tempVariants, setTempVariants] = useState<{id: string, name: string, price: string}[]>([]);

  const FOOD_CATEGORIES = ['Starters', 'Main Course', 'Breads', 'Desserts', 'Beverages', 'Snacks', 'Thalis', 'Other'];
  const HOME_CATEGORIES = ['Plumbing', 'Electrical', 'Painting', 'RO Repair', 'Carpentry', 'Cleaning', 'Pest Control', 'Appliance Repair', 'Other'];
  const SALON_CATEGORIES = ['Hair Cut', 'Shaving & Beard', 'Facial', 'Massage', 'Manicure & Pedicure', 'Makeup', 'Other'];

  useEffect(() => {
    if (!activeBusinessId) return;
    
    const fetchCatalogData = async () => {
      try {
        setIsLoading(true);
        const bizRes = await apiClient.get('/business/me/list');
        const activeBiz = bizRes.data.data.find((b: any) => b.id === activeBusinessId);
        if (activeBiz) {
          setBusinessData(activeBiz);
        }

        const catRes = await apiClient.get(`/catalog/business/${activeBusinessId}`);
        setItems(catRes.data.data);
      } catch (error) {
        console.error(error);
        toast.error('Failed to load catalog items');
      } finally {
        setIsLoading(false);
      }
    };

    fetchCatalogData();
  }, [activeBusinessId]);

  const applyVariantPreset = (preset: 'half-full' | 'quarter-half-full' | 'weight') => {
    if (preset === 'half-full') setTempVariants([{id: '1', name: 'Half', price: ''}, {id: '2', name: 'Full', price: ''}]);
    else if (preset === 'quarter-half-full') setTempVariants([{id: '1', name: 'Quarter', price: ''}, {id: '2', name: 'Half', price: ''}, {id: '3', name: 'Full', price: ''}]);
    else if (preset === 'weight') setTempVariants([{id: '1', name: '250g', price: ''}, {id: '2', name: '500g', price: ''}, {id: '3', name: '1kg', price: ''}]);
  };

  const addEmptyVariant = () => setTempVariants(prev => [...prev, {id: Date.now().toString(), name: '', price: ''}]);
  const removeVariant = (id: string) => setTempVariants(prev => prev.filter(v => v.id !== id));
  const updateVariant = (id: string, field: 'name' | 'price', value: string) => setTempVariants(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));

  const handleEditClick = (item: any) => {
    setEditItemId(item.id);
    setCustomTitle(item.title || '');
    setServiceDesc(item.description || '');
    if (item.variants && item.variants.length > 0 && typeof item.variants[0] === 'object') {
      setIsVariantPricing(true);
      setTempVariants(item.variants.map((v: any, idx: number) => ({ id: String(idx), name: v.name, price: String(v.price) })));
      setServicePrice('');
    } else {
      setIsVariantPricing(false);
      setServicePrice(item.price ? String(item.price) : '');
      setTempVariants([]);
    }
    
    // Category mapping
    const catName = item.category?.name || item.foodCategory || '';
    if (FOOD_CATEGORIES.includes(catName) || HOME_CATEGORIES.includes(catName) || SALON_CATEGORIES.includes(catName)) {
      setServiceCategory(catName);
      setCustomCategory('');
    } else if (catName) {
      setServiceCategory('Other');
      setCustomCategory(catName);
    } else {
      setServiceCategory('');
    }

    if (item.metaData && item.metaData.dietaryType) {
      setServiceDietary(item.metaData.dietaryType);
    } else if (item.metaData && item.metaData.isNonVeg !== undefined) {
      setServiceDietary(!item.metaData.isNonVeg ? 'veg' : 'non-veg');
    } else if (item.metaData && item.metaData.isVeg !== undefined) {
      setServiceDietary(item.metaData.isVeg ? 'veg' : 'non-veg');
    } else {
      setServiceDietary('veg');
    }

    setMediaPreview(item.mediaUrl || null);
    setMediaFile(null);

    setIsBuilderMode(true);
  };

  const handleDeleteClick = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this service?')) return;
    try {
      await apiClient.delete(`/catalog/${id}`, { headers: { 'x-business-id': activeBusinessId } });
      toast.success('Service deleted successfully');
      setItems(prev => prev.filter(i => i.id !== id));
    } catch (error) {
      console.error(error);
      toast.error('Failed to delete service');
    }
  };

  const handleToggleVisibility = async (item: any) => {
    const newStatus = !item.isActive;
    try {
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isActive: newStatus } : i));
      const formData = new FormData();
      formData.append('isActive', String(newStatus));
      await apiClient.patch(`/catalog/${item.id}`, formData, { headers: { 'x-business-id': activeBusinessId } });
      toast.success(`Service ${newStatus ? 'shown' : 'hidden'} successfully`);
    } catch (error) {
      console.error(error);
      toast.error('Failed to update visibility');
      setItems(prev => prev.map(i => i.id === item.id ? { ...i, isActive: !newStatus } : i));
    }
  };

  const resetForm = () => {
    setCustomTitle(''); setServicePrice(''); setServiceDesc(''); setCustomCategory(''); setServiceCategory(''); setIsVariantPricing(false); setTempVariants([]); setEditItemId(null); setMediaFile(null); setMediaPreview(null);
  };

  const handleSaveService = async () => {
    if (!customTitle) return toast.error('Please provide a service title');
    if (businessData?.businessType !== 'CAB_TRANSPORT' && !serviceCategory) return toast.error('Please select a category for the service');
    if (serviceCategory === 'Other' && !customCategory) return toast.error('Please specify a custom category name');

    let finalVariants: any[] = [];
    if (isVariantPricing) {
      finalVariants = tempVariants.filter(v => v.name.trim() && v.price.trim()).map(v => ({
        name: v.name,
        price: Number(v.price)
      }));
      if (finalVariants.length === 0) return toast.error('Please add at least one valid portion with a price');
    }

    try {
      setIsSubmitting(true);
      const formData = new FormData();
      formData.append('title', customTitle);
      if (!isVariantPricing && servicePrice) formData.append('price', servicePrice);
      if (serviceDesc) formData.append('description', serviceDesc);
      formData.append('isActive', 'true');
      formData.append('isAvailable', 'true');
      if (finalVariants.length > 0) formData.append('variants', JSON.stringify(finalVariants));
      formData.append('foodCategory', serviceCategory === 'Other' ? customCategory : serviceCategory);
      if (businessData?.businessType === 'FOOD_BEVERAGE') {
        formData.append('isVeg', String(serviceDietary === 'veg' || serviceDietary === 'vegan'));
        formData.append('metaData', JSON.stringify({ dietaryType: serviceDietary }));
      }
      if (mediaFile) formData.append('media', mediaFile);

      if (editItemId) {
        await apiClient.patch(`/catalog/${editItemId}`, formData, { headers: { 'x-business-id': activeBusinessId } });
        toast.success('Service updated successfully');
      } else {
        await apiClient.post('/catalog', formData, { headers: { 'x-business-id': activeBusinessId } });
        toast.success('Service added successfully');
      }
      
      // Reset form & Exit Builder
      resetForm();
      setIsBuilderMode(false);
      
      // Refresh items
      const catRes = await apiClient.get(`/catalog/business/${activeBusinessId}`);
      setItems(catRes.data.data);

    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to save service');
    } finally {
      setIsSubmitting(false);
    }
  };

  const buildPreviewCatalog = () => {
    const activeItems = items.filter(i => i.isActive);
    const existingMapped = activeItems.map(i => ({
      ...i,
      category: i.category || { name: i.foodCategory || 'Services' },
      variants: i.variants && i.variants.length > 0 && typeof i.variants[0] === 'object' ? i.variants : (i.variants || []),
    }));

    if (!customTitle && !servicePrice && tempVariants.length === 0) return existingMapped;

    // Add the "Currently being edited" item to the top
    const tempItem = {
      id: 'preview-temp',
      title: customTitle || 'New Service',
      price: isVariantPricing ? undefined : (servicePrice ? Number(servicePrice) : 0),
      description: serviceDesc,
      variants: isVariantPricing ? tempVariants.filter(v => v.name).map(v => ({name: v.name, price: Number(v.price) || 0})) : (businessData?.businessType === 'FOOD_BEVERAGE' ? [serviceDietary] : []),
      category: { name: serviceCategory === 'Other' ? (customCategory || 'Custom') : (serviceCategory || 'New Category') },
      metaData: { isNonVeg: serviceDietary === 'non-veg', dietaryType: serviceDietary, isVeg: serviceDietary === 'veg' || serviceDietary === 'vegan' }
    };

    return [tempItem, ...existingMapped];
  };

  if (!activeBusinessId) {
    return (
      <div className="max-w-4xl mx-auto flex flex-col items-center justify-center min-h-[60vh] text-center space-y-4">
        <div className="w-20 h-20 bg-zinc-100 rounded-3xl flex items-center justify-center mb-4">
           <Store className="w-10 h-10 text-zinc-400" />
        </div>
        <h2 className="text-2xl font-black text-zinc-900">No Active Storefront Selected</h2>
        <button onClick={() => router.push('/vendor-dashboard')} className="mt-4 flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-sm">
          Go to Dashboard <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    );
  }

  if (isLoading || !businessData) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
      </div>
    );
  }

  const previewBiz = {
    ...businessData,
    catalogItems: buildPreviewCatalog()
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Catalog & Menu</h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">Manage the services you offer to customers.</p>
        </div>
        {!isBuilderMode && (
          <div className="flex items-center gap-3">
            <button 
              onClick={() => router.push('/vendor-dashboard/workspace/builder')}
              className="flex items-center gap-2 bg-white hover:bg-zinc-50 border border-zinc-200 text-zinc-700 px-5 py-2.5 rounded-xl font-bold transition-all shadow-sm"
            >
              <Paintbrush className="w-4 h-4 text-emerald-600" /> Edit Storefront App
            </button>
            <button 
              onClick={() => { resetForm(); setIsBuilderMode(true); }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2.5 rounded-xl font-bold transition-all shadow-md shadow-emerald-600/20"
            >
              <PackagePlus className="w-4 h-4" /> Add Service
            </button>
          </div>
        )}
      </div>

      <div className="bg-zinc-50 flex flex-col lg:flex-row w-full h-[calc(100vh-10rem)] rounded-3xl overflow-hidden shadow-sm border border-zinc-200">
        {/* LEFT SIDE (BUILDER OR LIST) */}
        <div className="w-full lg:w-[65%] xl:w-[70%] bg-white border-r border-zinc-200 h-full flex flex-col shadow-2xl z-10 overflow-hidden">
          {isBuilderMode ? (
            <>
              <div className="h-16 border-b border-zinc-100 flex items-center px-6 gap-4 shrink-0 bg-white">
                <button onClick={() => setIsBuilderMode(false)} className="p-2 hover:bg-zinc-100 rounded-lg text-zinc-500 transition-colors">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-black text-zinc-900">{editItemId ? 'Edit Service' : 'Add New Service'}</h2>
              </div>
              <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            
            {businessData.businessType !== 'CAB_TRANSPORT' && (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-zinc-700">Service Category *</label>
                  <select 
                    value={serviceCategory}
                    onChange={(e) => setServiceCategory(e.target.value)}
                    className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold"
                  >
                    <option value="" disabled>Select Category</option>
                    {businessData.businessType === 'FOOD_BEVERAGE' && FOOD_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    {businessData.businessType === 'HOME_ESSENTIALS' && HOME_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                    {businessData.businessType === 'SALON_BEAUTY' && SALON_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
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
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">{businessData.businessType === 'FOOD_BEVERAGE' ? 'Dish Name *' : 'Service Name *'}</label>
              <input 
                type="text" 
                value={customTitle}
                onChange={(e) => setCustomTitle(e.target.value)}
                className="w-full h-11 px-4 rounded-xl border border-zinc-200 bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold"
                placeholder={businessData.businessType === 'FOOD_BEVERAGE' ? 'e.g. Margherita Pizza' : 'e.g. Deep Cleaning'}
              />
            </div>

            {/* PRICING */}
            {businessData.businessType === 'FOOD_BEVERAGE' ? (
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
                        <Tags className="w-3 h-3" /> Portions
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
                        {tempVariants.map((v) => (
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

            {businessData.businessType === 'FOOD_BEVERAGE' && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-zinc-700">Dietary Type</label>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {[
                    { id: 'veg', label: 'Pure Veg', color: 'text-green-700 bg-green-50 border-green-200' },
                    { id: 'non-veg', label: 'Non-Veg', color: 'text-red-700 bg-red-50 border-red-200' },
                    { id: 'vegan', label: 'Vegan', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                    { id: 'egg', label: 'Contains Egg', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' }
                  ].map(type => (
                    <button
                      key={type.id}
                      onClick={() => setServiceDietary(type.id)}
                      type="button"
                      className={`py-2 rounded-xl border text-xs font-bold transition-all ${serviceDietary === type.id ? type.color + ' border-2 shadow-sm' : 'border-zinc-200 text-zinc-500 bg-white hover:bg-zinc-50'}`}
                    >
                      {type.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">Service Image</label>
              {mediaPreview ? (
                <div className="relative w-full h-40 rounded-xl overflow-hidden group border-2 border-zinc-200">
                  <img src={mediaPreview} alt="Preview" className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                    <button onClick={() => { setMediaPreview(null); setMediaFile(null); }} className="bg-rose-500 text-white p-2 rounded-full hover:bg-rose-600 transition-colors shadow-lg">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              ) : (
                <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-zinc-300 rounded-xl bg-zinc-50 hover:bg-zinc-100 transition-colors cursor-pointer group">
                  <div className="w-10 h-10 bg-white rounded-full shadow-sm flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <FileUp className="w-5 h-5 text-emerald-600" />
                  </div>
                  <span className="text-sm font-bold text-zinc-600">Upload Image</span>
                  <span className="text-xs text-zinc-400 mt-0.5">JPEG, PNG up to 5MB</span>
                  <input type="file" accept="image/jpeg, image/png, image/webp" className="hidden" onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) {
                      setMediaFile(file);
                      setMediaPreview(URL.createObjectURL(file));
                    }
                  }} />
                </label>
              )}
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">Description</label>
              <textarea 
                value={serviceDesc}
                onChange={(e) => setServiceDesc(e.target.value)}
                rows={3}
                className="w-full px-4 py-3 rounded-xl border border-zinc-200 bg-zinc-50 focus:bg-white focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold resize-none"
                placeholder="Describe this service/item..."
              />
            </div>

          </div>

          <div className="p-6 border-t border-zinc-100 bg-white shrink-0 flex gap-3">
             <button onClick={() => setIsBuilderMode(false)} className="flex-1 h-12 rounded-xl font-bold text-zinc-600 bg-zinc-100 hover:bg-zinc-200 transition-all">
               Cancel
             </button>
             <button onClick={handleSaveService} disabled={isSubmitting} className="flex-[2] h-12 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:bg-zinc-400 transition-all shadow-md shadow-emerald-600/20">
               {isSubmitting ? 'Saving...' : 'Save & Publish Service'}
             </button>
          </div>
          </>
        ) : (
          <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6">
            {items.length === 0 ? (
              <div className="bg-white border border-zinc-200 rounded-2xl p-8 flex flex-col items-center justify-center text-center shadow-sm h-64 mt-10">
                <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
                  <Tag className="w-8 h-8" />
                </div>
                <h3 className="text-lg font-black text-zinc-900 mb-2">No services added yet</h3>
                <p className="text-zinc-500 text-sm font-medium mb-6">Start building your catalog by adding your first service or product offering.</p>
                <button 
                  onClick={() => { resetForm(); setIsBuilderMode(true); }}
                  className="flex items-center gap-2 bg-zinc-900 hover:bg-zinc-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-sm"
                >
                  <Plus className="w-4 h-4" /> Build Your Catalog
                </button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map((item) => {
                  const hasVariants = item.variants && item.variants.length > 0 && typeof item.variants[0] === 'object';
                  return (
                    <div key={item.id} className={`bg-white border border-zinc-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-all flex flex-col h-full group ${!item.isActive ? 'opacity-60 grayscale-[0.5]' : ''}`}>
                       <div className="flex justify-between items-start mb-2">
                         <h3 className="font-bold text-zinc-900 text-sm pr-2 leading-tight">{item.title}</h3>
                         {hasVariants ? (
                           <span className="bg-emerald-50 text-emerald-700 font-black px-2 py-1 rounded border border-emerald-100 text-[10px] uppercase tracking-wider whitespace-nowrap shrink-0">
                             Custom
                           </span>
                         ) : item.price !== null && item.price !== undefined ? (
                           <span className="bg-emerald-50 text-emerald-700 font-black px-2 py-1 rounded border border-emerald-100 text-xs shrink-0">
                             ₹{item.price}
                           </span>
                         ) : null}
                       </div>
                       
                       {item.description && <p className="text-xs text-zinc-500 font-medium mb-3 flex-1 line-clamp-2">{item.description}</p>}
                       
                       <div className="pt-3 border-t border-zinc-100 mt-auto flex items-center justify-between text-[10px] font-bold text-zinc-400">
                          <div className="flex items-center gap-1.5">
                            <span className="bg-zinc-100 px-2 py-0.5 rounded text-zinc-600 truncate max-w-[80px]">{item.category?.name || item.foodCategory || 'General'}</span>
                          </div>
                          <div className="flex items-center gap-0.5">
                            <button onClick={() => handleToggleVisibility(item)} title={item.isActive ? 'Hide from store' : 'Show in store'} className={`p-1.5 rounded-lg transition-colors ${item.isActive ? 'text-emerald-500 hover:bg-emerald-50' : 'text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50'}`}>
                              {item.isActive ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
                            </button>
                            <button onClick={() => handleEditClick(item)} className="p-1.5 text-zinc-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors">
                              <Pencil className="w-3.5 h-3.5" />
                            </button>
                            <button onClick={() => handleDeleteClick(item.id)} className="p-1.5 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-colors">
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                       </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* RIGHT SIDE (LIVE PREVIEW) */}
      <div className="hidden lg:flex flex-1 bg-zinc-900 overflow-y-auto items-center justify-center p-8 relative">
        <div className="absolute top-6 right-6 flex items-center gap-2 px-4 py-2 bg-white/10 backdrop-blur-md rounded-full border border-white/20 text-white text-sm font-bold shadow-2xl z-50">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
          Live Customer Preview
        </div>
        
        <div className="w-[375px] h-[812px] bg-white rounded-[3rem] border-[8px] border-zinc-800 overflow-hidden shadow-2xl relative shrink-0 transform scale-[0.7] xl:scale-[0.85] 2xl:scale-[0.95] origin-center transition-transform">
          <div className="w-32 h-6 bg-zinc-800 absolute top-0 left-1/2 -translate-x-1/2 rounded-b-2xl z-50 flex items-center justify-center gap-2">
            <div className="w-12 h-1 bg-zinc-900 rounded-full"></div>
            <div className="w-2 h-2 rounded-full bg-zinc-900"></div>
          </div>
          <div className="h-full overflow-y-auto overflow-x-hidden scrollbar-hide relative z-40 bg-zinc-50">
            {(() => {
              const PreviewTemplate = getTemplateComponent(businessData?.themeFlavor, businessData?.businessType);
              return <PreviewTemplate business={previewBiz as any} theme="trust-utility" />;
            })()}
          </div>
        </div>
      </div>
    </div>
  </div>
  );
}
