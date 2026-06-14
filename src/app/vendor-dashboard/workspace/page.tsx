'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import { 
  Store, ArrowRight, Clock, Star, MapPin, 
  Eye, MessageCircle, ShoppingBag, Edit3, Settings, Filter, X
} from 'lucide-react';
import { toast } from 'sonner';

export default function ActiveBusinessDashboard() {
  const router = useRouter();
  const { user, activeBusinessId } = useAuthStore();
  const [activeBusiness, setActiveBusinessData] = useState<any>(null);
  const [recentItems, setRecentItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dateFilter, setDateFilter] = useState('All Time');
  const [showCampaignModal, setShowCampaignModal] = useState(false);
  const [stats, setStats] = useState({ leads: 0, orders: 0, profileViews: 0 });

  useEffect(() => {
    if (!activeBusinessId) {
      router.push('/vendor-dashboard');
      return;
    }
    fetchDashboardData();
  }, [activeBusinessId]);

  const fetchDashboardData = async () => {
    try {
      setIsLoading(true);
      const bizRes = await apiClient.get('/business/me/list');
      const myBizList = bizRes.data?.data || [];
      const currentBiz = myBizList.find((b: any) => b.id === activeBusinessId);
      
      if (currentBiz) {
        setActiveBusinessData(currentBiz);
        
        // Fetch leads
        const leadsRes = await apiClient.get('/leads', {
          headers: { 'x-business-id': activeBusinessId }
        }).catch(() => ({ data: { data: [] } }));
        const leads = leadsRes.data?.data || [];

        // Fetch orders
        const ordersRes = await apiClient.get('/orders/vendor', {
          headers: { 'x-business-id': activeBusinessId }
        }).catch(() => ({ data: { data: [] } }));
        const orders = ordersRes.data?.data || [];

        // Fetch dashboard metrics
        const dashboardRes = await apiClient.get('/business/me/dashboard', {
          headers: { 'x-business-id': activeBusinessId }
        }).catch(() => null);
        const analytics = dashboardRes?.data?.data?.analytics;
        const profileViews = analytics?.profileViews || 0;

        // Combine and sort
        const combined = [
          ...leads.map((l: any) => ({ ...l, _type: 'LEAD' })),
          ...orders.map((o: any) => ({ ...o, _type: 'ORDER' }))
        ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
        
        setRecentItems(combined.slice(0, 5));
        setStats({ leads: leads.length, orders: orders.length, profileViews });
      } else {
        router.push('/vendor-dashboard');
      }
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return <div className="animate-pulse h-96 bg-white rounded-2xl border border-zinc-200"></div>;
  }

  if (!activeBusiness) return null;

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      
      {/* ─── WELCOME HEADER ─── */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">
            {activeBusiness.businessName} Dashboard
          </h1>
          <p className="text-sm font-medium text-zinc-500 mt-1 flex items-center gap-1.5">
            <MapPin className="w-4 h-4" /> {activeBusiness.localityName || activeBusiness.cityName || 'Location not set'} • {activeBusiness.businessType.replace('_', ' ')}
          </p>
        </div>
        <div className="flex items-center gap-3">
           <div className="relative">
             <select 
               value={dateFilter}
               onChange={(e) => setDateFilter(e.target.value)}
               className="appearance-none bg-white border border-zinc-200 text-zinc-700 font-bold py-2.5 pl-4 pr-10 rounded-xl focus:outline-none focus:ring-2 focus:ring-emerald-500 cursor-pointer shadow-sm"
             >
               <option>All Time</option>
               <option>Last 7 Days</option>
               <option>Last 30 Days</option>
               <option>Custom Range</option>
             </select>
             <Filter className="w-4 h-4 text-zinc-400 absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none" />
           </div>
           <button 
             onClick={() => router.push('/vendor-dashboard/workspace/management/catalog')}
             className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-2.5 px-6 rounded-xl transition-colors shadow-sm"
           >
             Manage Catalog
           </button>
        </div>
      </div>

      {/* ─── STATS CARDS ─── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
            <Eye className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Profile Views</p>
            <h3 className="text-2xl font-black text-zinc-900">{stats.profileViews.toLocaleString()}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
            <MessageCircle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Leads</p>
            <h3 className="text-2xl font-black text-zinc-900">{stats.leads}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <ShoppingBag className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Total Orders</p>
            <h3 className="text-2xl font-black text-zinc-900">{stats.orders}</h3>
          </div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm flex items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center shrink-0">
            <Star className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-zinc-500 uppercase tracking-wider">Avg Rating</p>
            <h3 className="text-2xl font-black text-zinc-900">{activeBusiness.rating ? activeBusiness.rating.toFixed(1) : '4.8'}</h3>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* ─── LEFT COLUMN: RECENT LEADS & ORDERS ─── */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden flex flex-col h-full min-h-[400px]">
            <div className="p-5 border-b border-zinc-100 flex items-center justify-between">
              <h2 className="text-lg font-bold text-zinc-800 flex items-center gap-2">
                <Clock className="w-5 h-5 text-emerald-600" /> Recent Inquiries & Orders
              </h2>
              <button 
                onClick={() => router.push(activeBusiness.businessType === 'FOOD' ? '/vendor-dashboard/workspace/management/orders' : '/vendor-dashboard/workspace/management/leads')}
                className="text-sm font-bold text-emerald-600 hover:text-emerald-700"
              >
                View All
              </button>
            </div>
            
            <div className="p-0 flex-1 flex flex-col">
              {recentItems.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-center p-12">
                  <Star className="w-10 h-10 text-zinc-200 mb-3" />
                  <h3 className="text-zinc-900 font-bold mb-1">No Activity Yet</h3>
                  <p className="text-sm font-medium text-zinc-500">When customers inquire or order, they will appear here.</p>
                </div>
              ) : (
                <div className="divide-y divide-zinc-100">
                  {recentItems.map((item) => {
                    const isOrder = item._type === 'ORDER';
                    const route = isOrder ? '/vendor-dashboard/workspace/management/orders' : '/vendor-dashboard/workspace/management/leads';
                    
                    return (
                      <div key={item.id} className="flex items-center gap-4 p-5 hover:bg-zinc-50 transition-colors cursor-pointer" onClick={() => router.push(route)}>
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center flex-shrink-0 ${isOrder ? 'bg-amber-50 text-amber-600' : 'bg-emerald-50 text-emerald-600'}`}>
                          {isOrder ? <ShoppingBag className="w-5 h-5" /> : <MessageCircle className="w-5 h-5" />}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex justify-between items-start mb-1">
                            <h4 className="font-bold text-zinc-900 truncate pr-4">{item.customerName}</h4>
                            <span className={`text-[10px] font-bold px-2 py-1 rounded-md uppercase tracking-wider ${
                              item.status === 'NEW' || item.status === 'PENDING' ? 'text-rose-700 bg-rose-50' : 
                              item.status === 'CONTACTED' || item.status === 'CONFIRMED' ? 'text-blue-700 bg-blue-50' :
                              'text-emerald-700 bg-emerald-50'
                            }`}>
                              {item.status}
                            </span>
                          </div>
                          <div className="flex items-center gap-4 text-xs font-medium text-zinc-500">
                            {isOrder ? (
                              <span className="flex items-center gap-1.5"><Store className="w-3 h-3" /> {item.items?.length || 0} Items • ₹{item.totalValue}</span>
                            ) : (
                              <span className="flex items-center gap-1.5"><Store className="w-3 h-3" /> {item.catalogItem?.title || 'General Booking'}</span>
                            )}
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ─── RIGHT COLUMN: QUICK ACTIONS ─── */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm p-5">
            <h3 className="font-bold text-zinc-800 mb-4">Quick Actions</h3>
            <div className="space-y-3">
              <button 
                onClick={() => router.push('/vendor-dashboard/workspace/management/catalog')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 group-hover:text-emerald-700">Manage Catalog</h4>
                  <p className="text-xs font-medium text-zinc-500">Add or edit your services & pricing.</p>
                </div>
              </button>

              <button 
                onClick={() => router.push('/vendor-dashboard/workspace/settings')}
                className="w-full flex items-center gap-3 p-3 rounded-xl border border-zinc-200 hover:border-emerald-500 hover:bg-emerald-50 transition-all text-left group"
              >
                <div className="w-10 h-10 rounded-lg bg-zinc-100 text-zinc-600 flex items-center justify-center shrink-0 group-hover:bg-emerald-100 group-hover:text-emerald-600 transition-colors">
                  <Settings className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-zinc-900 group-hover:text-emerald-700">Business Settings</h4>
                  <p className="text-xs font-medium text-zinc-500">Update hours, location, and photos.</p>
                </div>
              </button>
            </div>
          </div>

          <div className="bg-emerald-600 rounded-2xl shadow-lg p-6 text-white relative overflow-hidden">
             <div className="absolute top-0 right-0 p-4 opacity-10">
                <Star className="w-24 h-24" />
             </div>
             <h3 className="text-xl font-black mb-2 relative z-10">Boost Your Visibility</h3>
             <p className="text-sm text-emerald-100 font-medium mb-4 relative z-10">Run targeted WhatsApp & SMS broadcasts to local customers.</p>
             <button 
               onClick={() => setShowCampaignModal(true)}
               className="bg-white text-emerald-700 font-bold py-2.5 px-5 rounded-lg w-full shadow-sm hover:bg-emerald-50 transition-colors relative z-10"
             >
               Start Campaign
             </button>
          </div>
        </div>

      </div>

      {/* Placeholder Campaign Modal */}
      {showCampaignModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-zinc-900/40 backdrop-blur-sm">
          <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-200">
            <div className="p-6 text-center space-y-4">
              <div className="w-16 h-16 bg-emerald-100 rounded-2xl flex items-center justify-center mx-auto mb-2 text-emerald-600">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h2 className="text-2xl font-black text-zinc-900">Broadcast Campaigns</h2>
              <p className="text-zinc-500 font-medium">
                The ability to launch direct WhatsApp, SMS, and RCS broadcast campaigns to your customers is coming in Phase 2!
              </p>
              <button 
                onClick={() => setShowCampaignModal(false)}
                className="mt-4 w-full bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 rounded-xl transition-colors"
              >
                Got it
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
