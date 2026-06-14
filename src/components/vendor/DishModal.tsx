'use client';

import { useState, useEffect } from 'react';
import { X, UploadCloud, Plus, Trash2 } from 'lucide-react';

interface DishModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (dish: any, file?: File | null) => void;
  availableCategories?: string[];
  editItem?: any | null;
  isRetail?: boolean;
  isService?: boolean;
}

export default function DishModal({ isOpen, onClose, onSave, availableCategories = ['Mains', 'Starters', 'Breads', 'Desserts', 'Beverages'], editItem, isRetail = false, isService = false }: DishModalProps) {
  const [name, setName] = useState('');
  const [price, setPrice] = useState('');
  const [photoUrl, setPhotoUrl] = useState('');
  const [dietary, setDietary] = useState('veg'); // veg, non-veg, vegan, egg
  const [categories, setCategories] = useState<string[]>([availableCategories[0]]);
  const [isCategoryOpen, setIsCategoryOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Variants State
  const [hasVariants, setHasVariants] = useState(false);
  const [variants, setVariants] = useState<{name: string, price: string}[]>([{ name: 'Half', price: '' }, { name: 'Full', price: '' }]);

  useEffect(() => {
    if (isOpen && editItem) {
      setName(editItem.title || '');
      setPrice(editItem.price ? editItem.price.toString() : '');
      setPhotoUrl(editItem.mediaUrl || '');
      if (editItem.foodCategory) {
        setCategories(Array.isArray(editItem.foodCategory) ? editItem.foodCategory : [editItem.foodCategory]);
      } else {
        setCategories([availableCategories[0]]);
      }
      setDietary(editItem.metaData?.dietaryType || (editItem.metaData?.isVeg ? 'veg' : 'non-veg'));
      
      if (editItem.variants && editItem.variants.length > 0) {
        setHasVariants(true);
        setVariants(editItem.variants.map((v: any) => ({ name: v.name, price: v.price.toString() })));
      } else {
        setHasVariants(false);
        setVariants([{ name: 'Half', price: '' }, { name: 'Full', price: '' }]);
      }
    } else if (isOpen) {
      // Reset State
      setName('');
      setPrice('');
      setPhotoUrl('');
      setDietary('veg');
      setCategories([availableCategories[0]]);
      setIsCategoryOpen(false);
      setSelectedFile(null);
      setHasVariants(false);
      setVariants([{ name: 'Half', price: '' }, { name: 'Full', price: '' }]);
    }
  }, [isOpen, editItem, availableCategories]);

  if (!isOpen) return null;

  const handleSave = () => {
    if (!name) return;
    
    let finalPrice = price;
    let finalVariants = null;

    if (hasVariants && variants.length > 0) {
      const validVariants = variants.filter(v => v.name && v.price);
      if (validVariants.length > 0) {
        finalVariants = validVariants.map((v, i) => ({
          id: `var-${Date.now()}-${i}`,
          name: v.name,
          price: Number(v.price)
        }));
        finalPrice = validVariants[0].price; // Default price to first variant
      }
    }

    if (!finalPrice && !hasVariants) return;

    onSave({
      id: editItem ? editItem.id : Date.now().toString(),
      title: name,
      price: Number(finalPrice),
      description: editItem ? editItem.description : '',
      // Only use a food photo fallback for food businesses; services/retail get no default image
      mediaUrl: photoUrl || (isService || isRetail ? '' : 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?auto=format&fit=crop&w=800&q=80'),
      foodCategory: categories,
      metaData: { isVeg: dietary === 'veg' || dietary === 'vegan', dietaryType: dietary },
      variants: finalVariants,
      isActive: editItem ? editItem.isActive : true
    }, selectedFile);

    onClose();
  };

  const addVariant = () => setVariants([...variants, { name: '', price: '' }]);
  const removeVariant = (index: number) => setVariants(variants.filter((_, i) => i !== index));
  const updateVariant = (index: number, field: 'name' | 'price', value: string) => {
    const newVars = [...variants];
    newVars[index][field] = value;
    setVariants(newVars);
  };

  const toggleCategory = (cat: string) => {
    if (categories.includes(cat)) {
      if (categories.length > 1) {
        setCategories(categories.filter(c => c !== cat));
      }
    } else {
      setCategories([...categories, cat]);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPhotoUrl(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-3xl w-full max-w-lg max-h-[90vh] overflow-hidden shadow-2xl animate-in zoom-in-95 fade-in flex flex-col">
        <div className="flex items-center justify-between p-6 border-b border-zinc-100 shrink-0">
          <h2 className="text-xl font-black text-zinc-900">{editItem ? (isService ? 'Edit Service' : (isRetail ? 'Edit Product' : 'Edit Dish')) : (isService ? 'Add Service Package' : (isRetail ? 'Add Product' : 'Add Menu Item'))}</h2>
          <button onClick={onClose} className="p-2 bg-zinc-100 hover:bg-zinc-200 rounded-full transition-colors">
            <X className="w-5 h-5 text-zinc-600" />
          </button>
        </div>
        
        <div className="p-6 space-y-5 overflow-y-auto">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5 col-span-2 md:col-span-1">
              <div className="flex justify-between items-center">
                 <label className="text-xs font-bold text-zinc-700">{isService ? 'Service Name *' : (isRetail ? 'Product Name *' : 'Dish Name *')}</label>
                 <span className="text-[10px] font-bold text-zinc-400">{name.length}/40</span>
              </div>
              <input 
                type="text" 
                maxLength={40}
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder={isService ? "e.g., Deep Tissue Massage" : (isRetail ? "e.g., Premium Gift Basket" : "e.g., High-Protein Egg Curry")}
                className="w-full h-11 px-4 rounded-xl border border-zinc-200 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 outline-none transition-all text-sm font-semibold"
              />
            </div>
            <div className="space-y-1.5 col-span-2 md:col-span-1 relative">
              <label className="text-xs font-bold text-zinc-700">Categories</label>
              <div 
                className="w-full min-h-[44px] px-3 py-2 rounded-xl border border-zinc-200 focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500 bg-white cursor-pointer flex flex-wrap gap-1 items-center"
                onClick={() => setIsCategoryOpen(!isCategoryOpen)}
              >
                {categories.length === 0 ? <span className="text-sm text-zinc-400">Select categories...</span> : 
                  categories.map(c => (
                    <span key={c} className="text-[11px] font-bold bg-emerald-50 text-emerald-700 px-2 py-1 rounded-md border border-emerald-100 whitespace-nowrap">{c}</span>
                  ))
                }
              </div>
              
              {isCategoryOpen && (
                <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-zinc-200 rounded-xl shadow-xl z-50 max-h-48 overflow-y-auto p-1.5">
                  {availableCategories.map(cat => (
                    <label key={cat} className="flex items-center gap-3 p-2.5 hover:bg-zinc-50 rounded-lg cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={categories.includes(cat)}
                        onChange={() => toggleCategory(cat)}
                        className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 border-zinc-300"
                      />
                      <span className="text-sm font-semibold text-zinc-700">{cat}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 p-4 bg-zinc-50 rounded-2xl border border-zinc-200">
             <div className="flex items-center justify-between">
                <label className="text-sm font-bold text-zinc-900">{isService ? 'Has Multiple Options / Durations?' : 'Has Portions / Variants?'}</label>
                <input type="checkbox" checked={hasVariants} onChange={e => setHasVariants(e.target.checked)} className="w-4 h-4 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer" />
             </div>
             
             {!hasVariants ? (
                <div className="space-y-1.5 pt-2">
                  <label className="text-xs font-bold text-zinc-700">Standard Price (₹) *</label>
                  <input 
                    type="number" 
                    value={price}
                    onChange={e => setPrice(e.target.value)}
                    placeholder="299"
                    className="w-full h-11 px-4 rounded-xl border border-zinc-200 focus:border-emerald-500 outline-none transition-all text-sm font-semibold bg-white"
                  />
                </div>
             ) : (
                <div className="space-y-3 pt-2">
                  {variants.map((v, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <input 
                        type="text" 
                        maxLength={15}
                        value={v.name}
                        onChange={e => updateVariant(idx, 'name', e.target.value)}
                        placeholder={isService ? "Option (e.g. 60 Mins)" : "Portion (e.g. Half)"}
                        className="flex-1 h-11 px-3 rounded-xl border border-zinc-200 text-sm font-semibold bg-white"
                      />
                      <input 
                        type="number" 
                        value={v.price}
                        onChange={e => updateVariant(idx, 'price', e.target.value)}
                        placeholder="Price (₹)"
                        className="w-24 h-11 px-3 rounded-xl border border-zinc-200 text-sm font-semibold bg-white"
                      />
                      <button onClick={() => removeVariant(idx)} className="p-2 text-rose-500 hover:bg-rose-100 rounded-lg">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                  <button onClick={addVariant} className="text-xs font-bold text-emerald-600 flex items-center gap-1 hover:underline">
                    <Plus className="w-3 h-3" /> Add Variant
                  </button>
                </div>
             )}
          </div>

          {!isRetail && !isService && (
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-zinc-700">Dietary Type</label>
              <div className="grid grid-cols-4 gap-2">
                {[
                  { id: 'veg', label: 'Pure Veg', color: 'text-green-700 bg-green-50 border-green-200' },
                  { id: 'non-veg', label: 'Non-Veg', color: 'text-red-700 bg-red-50 border-red-200' },
                  { id: 'vegan', label: 'Vegan', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
                  { id: 'egg', label: 'Contains Egg', color: 'text-yellow-700 bg-yellow-50 border-yellow-200' }
                ].map(type => (
                  <button
                    key={type.id}
                    onClick={() => setDietary(type.id)}
                    className={`py-2 rounded-xl border text-xs font-bold transition-all ${dietary === type.id ? type.color + ' border-2 shadow-sm' : 'border-zinc-200 text-zinc-500 bg-white hover:bg-zinc-50'}`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div className="space-y-1.5">
            <label className="text-xs font-bold text-zinc-700">{isService ? 'Service Photo URL' : (isRetail ? 'Product Photo URL' : 'Dish Photo URL')}</label>
            <div className="flex gap-2">
              <input 
                type="text" 
                value={photoUrl}
                onChange={e => setPhotoUrl(e.target.value)}
                placeholder="https://..."
                className="flex-1 h-11 px-4 rounded-xl border border-zinc-200 focus:border-emerald-500 outline-none text-sm"
              />
              <div className="relative">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" />
                <button className="h-11 px-4 bg-zinc-100 hover:bg-zinc-200 rounded-xl text-zinc-600 font-bold transition-colors flex items-center justify-center">
                  <UploadCloud className="w-5 h-5" />
                </button>
              </div>
            </div>
            {photoUrl && (
               <div className="mt-2 w-full h-32 rounded-xl overflow-hidden border border-zinc-200">
                  <img src={photoUrl} className="w-full h-full object-cover" alt="Preview" />
               </div>
            )}
          </div>
        </div>

        <div className="p-6 bg-zinc-50 border-t border-zinc-100 flex justify-end gap-3 shrink-0">
          <button onClick={onClose} className="px-6 py-2.5 rounded-xl font-bold text-zinc-600 hover:bg-zinc-200 transition-colors">
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={!name || (!hasVariants && !price) || (hasVariants && variants.filter(v => v.name && v.price).length === 0)}
            className="px-8 py-2.5 rounded-xl font-bold text-white bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 transition-colors shadow-md"
          >
            {editItem ? 'Save Changes' : (isService ? 'Add Service' : (isRetail ? 'Add Product' : 'Add Dish'))}
          </button>
        </div>
      </div>
    </div>
  );
}
