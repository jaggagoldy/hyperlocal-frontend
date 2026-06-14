'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { Store, ArrowLeft, LayoutTemplate, Smartphone } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { TEMPLATE_METADATA } from '@/lib/templateRegistry';

export default function AppearanceSettings() {
  const router = useRouter();
  const { activeBusinessId } = useAuthStore();
  
  const [activeBusiness, setActiveBusiness] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (activeBusinessId) {
      apiClient.get(`/business/${activeBusinessId}`).then(res => {
        setActiveBusiness(res.data.data);
      }).finally(() => {
        setIsLoading(false);
      });
    } else {
      setIsLoading(false);
    }
  }, [activeBusinessId]);

  const [selectedTheme, setSelectedTheme] = useState('food-classic');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (activeBusiness?.themeFlavor) {
      setSelectedTheme(activeBusiness.themeFlavor);
    }
  }, [activeBusiness]);

  // Fallback map to show options based on archetype. 
  // For MVP, we're assuming the user has a FOOD_BEVERAGE business, or we can just offer the food templates for all for demo.
  const templates = TEMPLATE_METADATA.filter(t => t.archetype === activeBusiness.businessType || activeBusiness.businessType === 'FOOD_BEVERAGE'); // Fallback if businessType mismatch

  const handleSave = async () => {
    if (!activeBusiness) return;
    try {
      setIsSaving(true);
      await apiClient.patch('/business/update', { themeFlavor: selectedTheme }, {
        headers: { 'x-business-id': activeBusiness.id }
      });
      toast.success("Storefront template updated!");
    } catch (error) {
      console.error(error);
      toast.error("Failed to update template.");
    } finally {
      setIsSaving(false);
    }
  };

  if (!activeBusiness) return <div className="p-10">Loading...</div>;

  return (
    <div className="p-6 md:p-10 max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4">
      <div className="flex items-center gap-4">
        <button onClick={() => router.back()} className="p-2 hover:bg-zinc-100 rounded-xl transition-colors">
          <ArrowLeft className="w-5 h-5" />
        </button>
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Storefront Appearance</h1>
          <p className="text-zinc-500 font-medium">Customize how your business looks to customers.</p>
        </div>
      </div>

      <div className="bg-white rounded-3xl p-8 border border-zinc-200 shadow-sm space-y-6">
        <div>
          <h3 className="text-lg font-bold text-zinc-900 mb-4">Select Template</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {templates.map(template => {
              const Icon = template.icon;
              const isActive = selectedTheme === template.id;
              
              return (
                <button
                  key={template.id}
                  onClick={() => setSelectedTheme(template.id)}
                  className={`text-left p-6 rounded-2xl border-2 transition-all duration-200 ${
                    isActive 
                      ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-4 ring-indigo-600/10' 
                      : 'border-zinc-200 hover:border-indigo-300 hover:bg-zinc-50'
                  }`}
                >
                  <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 border ${template.color}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <h4 className={`text-lg font-bold mb-2 ${isActive ? 'text-indigo-900' : 'text-zinc-900'}`}>
                    {template.name}
                  </h4>
                  <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                    {template.description}
                  </p>
                </button>
              )
            })}
          </div>
        </div>

        <div className="pt-8 border-t border-zinc-100 flex justify-end gap-4">
          <button 
            onClick={() => router.back()} 
            className="px-6 py-3 font-bold text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={isSaving || selectedTheme === activeBusiness.themeFlavor}
            className="px-8 py-3 font-bold text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-zinc-400 rounded-xl transition-all shadow-md shadow-indigo-600/20"
          >
            {isSaving ? 'Saving...' : 'Apply Template'}
          </button>
        </div>
      </div>
    </div>
  );
}
