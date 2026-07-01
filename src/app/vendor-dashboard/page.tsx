'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';
import { Store, Car, Home, Scissors, Plus, ChevronRight, MapPin, Star, AlertCircle, Briefcase, Stethoscope, Plane, Heart, Dumbbell, GraduationCap, Truck, Wrench, Key, Banknote, Bed, Building, Utensils, LogOut, LayoutDashboard } from 'lucide-react';
import TierUpsell from '@/components/vendor-dashboard/TierUpsell';
import type { ListingTier } from '@/lib/directory';

const IconMap: Record<string, any> = { Utensils, Car, Scissors, Home, Briefcase, Stethoscope, Plane, Heart, Dumbbell, GraduationCap, Truck, Wrench, Key, Banknote, Bed, Building, Store };

interface BusinessProfile {
  id: string;
  businessName: string;
  businessType: string;
  status: string;
  rating: number;
  listingTier: ListingTier | null;
  city: { name: string } | null;
  localityName: string | null;
  categories: { category: { name: string, icon: string } }[];
}




export default function GlobalHubPage() {
  const [businesses, setBusinesses] = useState<BusinessProfile[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { setActiveBusiness, logout } = useAuthStore();

  const handleLogout = () => { logout(); router.push('/'); };

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
      <div className="flex h-screen w-full items-center justify-center" style={{ background: '#0d1117' }}>
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 bg-zinc-800 rounded-full mb-4" />
          <div className="h-4 w-32 bg-zinc-800 rounded mb-2" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ background: '#0d1117' }}>
      {/* Hub Header */}
      <header className="sticky top-0 z-40 border-b flex items-center justify-between px-4 sm:px-6 h-14"
        style={{ background: '#0d1117', borderColor: 'rgba(255,255,255,.07)' }}>
        <div className="flex items-center gap-2 cursor-pointer" onClick={() => router.push('/vendor-dashboard')}>
          <div className="w-7 h-7 bg-emerald-600 rounded-lg flex items-center justify-center">
            <span className="text-white font-black text-base leading-none">N</span>
          </div>
          <span className="font-black text-white text-base tracking-tight">NearByBazar</span>
          <span className="text-[11px] font-bold px-2 py-0.5 rounded-full ml-1"
            style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)', color: '#34d399' }}>
            Vendor Hub
          </span>
        </div>
        <button onClick={handleLogout}
          className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium transition-colors hover:bg-zinc-800"
          style={{ color: '#6b7280' }}>
          <LogOut className="w-4 h-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </header>

    <div className="max-w-6xl mx-auto p-4 sm:p-6 lg:p-8">
      <div className="mb-8">
        <h1 className="text-2xl font-black text-white mb-1">Your Businesses</h1>
        <p className="text-sm" style={{ color: '#6b7280' }}>Manage all your ventures from a single powerful dashboard.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">

        {/* Create New Business Card */}
        <div
          onClick={() => router.push('/vendor/register')}
          className="group cursor-pointer min-h-[220px] rounded-2xl flex flex-col items-center justify-center p-6 transition-all duration-300"
          style={{ border: '2px dashed rgba(255,255,255,.1)', background: 'transparent' }}
          onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(16,185,129,.4)')}
          onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.1)')}
        >
          <div className="w-14 h-14 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform"
            style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.2)' }}>
            <Plus className="w-7 h-7 text-emerald-400" />
          </div>
          <h3 className="text-base font-bold text-white">Add New Business</h3>
          <p className="text-sm text-center mt-1.5 max-w-[200px]" style={{ color: '#6b7280' }}>
            Launch a new service, restaurant, or cab fleet.
          </p>
        </div>

        {/* Existing Business Cards */}
        {businesses.map((business) => {
          const cat = business.categories?.[0]?.category;
          const Icon = cat?.icon ? (IconMap[cat.icon] || Store) : Store;
          const label = cat?.name || (business.businessType || '').replace(/_/g, ' ');
          const isActive = business.status === 'AVAILABLE' || business.status === 'ACTIVE' || business.status === 'available';

          return (
            <div
              key={business.id}
              onClick={() => handleLaunchWorkspace(business.id)}
              className="rounded-2xl transition-all duration-300 cursor-pointer overflow-hidden flex flex-col"
              style={{ background: 'rgba(255,255,255,.04)', border: '1px solid rgba(255,255,255,.08)' }}
              onMouseEnter={e => (e.currentTarget.style.borderColor = 'rgba(16,185,129,.25)')}
              onMouseLeave={e => (e.currentTarget.style.borderColor = 'rgba(255,255,255,.08)')}
            >
              <div className="p-5 flex-1">
                <div className="flex justify-between items-start mb-4">
                  <div className="p-3 rounded-xl" style={{ background: 'rgba(16,185,129,.1)', border: '1px solid rgba(16,185,129,.15)' }}>
                    <Icon className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div className="flex flex-col items-end gap-1.5">
                    <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wide ${
                      isActive
                        ? 'text-emerald-300'
                        : 'text-amber-300'
                    }`} style={{ background: isActive ? 'rgba(16,185,129,.1)' : 'rgba(245,158,11,.1)' }}>
                      {business.status?.toLowerCase() || 'active'}
                    </span>
                    <div className="flex items-center gap-1 text-sm font-bold" style={{ color: '#fbbf24' }}>
                      <Star className="w-3.5 h-3.5 fill-current" />
                      {business.rating ? business.rating.toFixed(1) : 'New'}
                    </div>
                  </div>
                </div>

                <h3 className="text-lg font-black text-white line-clamp-1 mb-1">
                  {business.businessName}
                </h3>
                <p className="text-xs font-medium mb-3 capitalize" style={{ color: '#6b7280' }}>{label}</p>

                {(business.localityName || business.city?.name) && (
                  <div className="flex items-center gap-1.5 text-xs" style={{ color: '#4b5563' }}>
                    <MapPin className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{business.localityName}{business.localityName && business.city?.name ? ', ' : ''}{business.city?.name}</span>
                  </div>
                )}
              </div>

              {/* Tier badge */}
              <div className="px-5 pb-4" onClick={(e) => e.stopPropagation()}>
                <TierUpsell
                  businessId={business.id}
                  businessType={business.businessType}
                  listingTier={business.listingTier ?? null}
                  onUpgraded={(tier) =>
                    setBusinesses((prev) => prev.map((b) => (b.id === business.id ? { ...b, listingTier: tier } : b)))
                  }
                />
              </div>

              <div className="px-5 py-3.5 border-t flex items-center justify-between"
                style={{ borderColor: 'rgba(255,255,255,.07)', background: 'rgba(255,255,255,.02)' }}>
                <span className="text-sm font-bold text-emerald-400">Open Workspace</span>
                <ChevronRight className="w-4 h-4 text-emerald-500 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          );
        })}

      </div>
    </div>
    </div>
  );
}
