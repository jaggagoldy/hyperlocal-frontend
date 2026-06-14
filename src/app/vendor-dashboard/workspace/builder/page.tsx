'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { Loader2, Store, ArrowRight } from 'lucide-react';
import WorkspaceBuilder from '@/components/vendor/WorkspaceBuilder';

export default function AppBuilderEditPage() {
  const { activeBusinessId } = useAuthStore();
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(true);
  const [businessData, setBusinessData] = useState<any>(null);

  useEffect(() => {
    if (!activeBusinessId) return;
    
    const fetchBusinessData = async () => {
      try {
        setIsLoading(true);
        const bizRes = await apiClient.get('/business/me/list');
        const activeBiz = bizRes.data.data.find((b: any) => b.id === activeBusinessId);
        
        if (activeBiz) {
          const catRes = await apiClient.get(`/catalog/business/${activeBusinessId}`);
          // Intercept corrupt businessType from DB
          if (activeBiz.businessName && activeBiz.businessName.includes('Rajesh Dhaba') && activeBiz.businessType === 'SERVICE') {
            activeBiz.businessType = 'FOOD_BEVERAGE';
            if (activeBiz.themeFlavor === 'service-classic') {
              activeBiz.themeFlavor = 'food-classic';
            }
          }

          activeBiz.catalogItems = catRes.data.data.map((item: any) => ({
            ...item,
            title: item.title || item.name || '',
            name: item.name || item.title || '',
            mediaUrl: item.mediaUrl || item.imageUrl || '',
            imageUrl: item.imageUrl || item.mediaUrl || '',
          }));
          setBusinessData(activeBiz);
        } else {
          toast.error('Active storefront not found.');
        }
      } catch (error) {
        console.error(error);
        toast.error('Failed to load business data');
      } finally {
        setIsLoading(false);
      }
    };

    fetchBusinessData();
  }, [activeBusinessId]);

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

  return (
    <div className="w-full h-full relative">
      <WorkspaceBuilder 
        mode="edit" 
        initialData={businessData} 
        onSuccess={() => {
          router.push('/vendor-dashboard/workspace/management/catalog');
        }}
        onExit={() => {
          router.push('/vendor-dashboard/workspace/management/catalog');
        }}
      />
    </div>
  );
}
