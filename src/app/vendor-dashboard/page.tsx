'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';
import { Store, Car, Home, Scissors, Plus, ChevronRight, MapPin, Star, AlertCircle, Briefcase, Stethoscope, Plane, Heart, Dumbbell, GraduationCap, Truck, Wrench, Key, Banknote, Bed, Building, Utensils } from 'lucide-react';

const IconMap: Record<string, any> = { Utensils, Car, Scissors, Home, Briefcase, Stethoscope, Plane, Heart, Dumbbell, GraduationCap, Truck, Wrench, Key, Banknote, Bed, Building, Store };

interface BusinessProfile {
  id: string;
  businessName: string;
  businessType: string;
  status: string;
  rating: number;
  city: { name: string } | null;
  localityName: string | null;
  categories: { category: { name: string, icon: string } }[];
}




export default function GlobalHubPage() {
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { setActiveBusiness } = useAuthStore();

  const fetchBusinesses = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/business/me/list');
      setBusinesses(res.data.data || []);
    } catch (error) {
      console.error('Failed to fetch businesses', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBusinesses();
  }, []);

  const handleLaunchWorkspace = (id: string) => {
    setActiveBusiness(id);
    router.push('/vendor-dashboard/workspace');
  };

  if (isLoading) {
    return (
      <div className="flex h-full items-center justify-center">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-slate-200 dark:bg-slate-800 rounded-full mb-4"></div>
          <div className="h-4 w-32 bg-slate-200 dark:bg-slate-800 rounded mb-2"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-slate-900 dark:text-slate-100 mb-2">Your Businesses</h1>
        <p className="text-slate-500 dark:text-slate-400">Manage all your ventures from a single powerful dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        
        {/* Create New Business Card */}
        <div 
          onClick={() => router.push('/vendor/register')}
          className="group cursor-pointer min-h-[220px] rounded-2xl border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-indigo-500 dark:hover:border-indigo-400 bg-transparent flex flex-col items-center justify-center p-6 transition-all duration-300 hover:bg-indigo-50/50 dark:hover:bg-indigo-500/5"
        >
          <div className="w-14 h-14 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
            <Plus className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Add New Business</h3>
          <p className="text-sm text-slate-500 text-center mt-2 max-w-[200px]">Launch a new service, restaurant, or cab fleet.</p>
        </div>

        {/* Existing Business Cards */}
        {businesses.map((business) => {
          const cat = business.categories?.[0]?.category;
          const Icon = cat?.icon ? (IconMap[cat.icon] || Store) : Store;
          const colorClass = 'text-indigo-500 bg-indigo-50 dark:bg-indigo-500/10';
          const label = cat?.name || business.businessType;
          
          return (
            <div 
              key={business.id}
              onClick={() => handleLaunchWorkspace(business.id)}
              className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm hover:shadow-xl hover:border-indigo-300 dark:hover:border-indigo-700 transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
            >
              <div className="p-6 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className={`p-3 rounded-xl ${colorClass}`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <div className="flex flex-col items-end">
                    <span className={`px-2.5 py-1 text-xs font-semibold rounded-full ${
                      business.status === 'AVAILABLE' || business.status === 'ACTIVE' 
                        ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-400' 
                        : 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400'
                    }`}>
                      {business.status}
                    </span>
                    <div className="flex items-center gap-1 mt-2 text-sm font-medium text-slate-600 dark:text-slate-400">
                      <Star className="w-4 h-4 text-amber-400 fill-current" />
                      {business.rating ? business.rating.toFixed(1) : 'New'}
                    </div>
                  </div>
                </div>
                
                <h3 className="text-xl font-bold text-slate-900 dark:text-white line-clamp-1 mb-1">
                  {business.businessName}
                </h3>
                <p className="text-sm font-medium text-slate-500 dark:text-slate-400 mb-3">{label}</p>
                
                {(business.localityName || business.city?.name) && (
                  <div className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                    <MapPin className="w-4 h-4 shrink-0" />
                    <span className="truncate">{business.localityName}{business.localityName && business.city?.name ? ', ' : ''}{business.city?.name}</span>
                  </div>
                )}
              </div>
              
              <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/50 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between group">
                <span className="text-sm font-semibold text-indigo-600 dark:text-indigo-400 group-hover:text-indigo-700 dark:group-hover:text-indigo-300">Open Workspace</span>
                <ChevronRight className="w-5 h-5 text-indigo-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}

      </div>
    </div>
  );
}
