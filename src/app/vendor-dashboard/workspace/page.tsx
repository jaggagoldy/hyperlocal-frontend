'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import { 
  PlayCircle, PlusCircle, Building2, CreditCard, Tag, 
  Copy, BarChart3, Users, Calendar, MessageSquare, ShoppingBag, Store, QrCode
} from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';

export default function WorkspaceOverviewPage() {
  const { user, activeBusinessId } = useAuthStore();
  const router = useRouter();
  
  const [vendor, setVendor] = useState<any>(null);
  const [stats, setStats] = useState<any>({
    totalBusiness: 0,
    totalStaff: 0,
    totalAppointments: 0,
    totalEnquiry: 0
  });

  useEffect(() => {
    if (activeBusinessId) {
      fetchDashboardData();
    }
  }, [activeBusinessId]);

  const fetchDashboardData = async () => {
    try {
      // The API uses x-business-id interceptor based on activeBusinessId
      const res = await apiClient.get('/business/me/dashboard');
      const data = res.data?.data;
      if (data?.business) {
        setVendor(data.business);
        setStats({
          totalBusiness: data.businessesCount || 1, // Will need actual multi-business count API, mocking for now
          totalStaff: 0,
          totalAppointments: data.leads?.filter((l:any) => l.status === 'CONVERTED').length || 0,
          totalEnquiry: data.leads?.length || 0
        });
      }
    } catch (error) {
      console.error(error);
    }
  };

  const copyLink = () => {
    navigator.clipboard.writeText(`https://hyperlocal.com/vendor/${vendor?.slug || activeBusinessId}`);
    toast.success('Business link copied!');
  };

  if (!vendor) return <div className="animate-pulse h-96 bg-white rounded-2xl"></div>;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      
      {/* ─── WELCOME HEADER ─── */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
        <div>
          <h1 className="text-2xl font-black text-zinc-800 tracking-tight">
            Welcome back, {user?.name?.split(' ')[0] || 'Vendor'}! 👋
          </h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">Here's what's new with your business today.</p>
        </div>
        <div className="flex gap-3">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-bold text-zinc-700 hover:bg-zinc-50 shadow-sm">
            <PlayCircle className="w-4 h-4 text-zinc-500" /> View Tutorials
          </button>
          <button 
            onClick={() => router.push('/vendor-dashboard/workspace/management/my-business')}
            className="flex items-center gap-2 px-4 py-2 bg-[#1D4ED8] rounded-lg text-sm font-bold text-white shadow-sm hover:bg-blue-800 transition-colors"
          >
            <PlusCircle className="w-4 h-4" /> Create Business
          </button>
        </div>
      </div>

      {/* ─── QUICK ACTIONS ─── */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <h2 className="text-lg font-bold text-zinc-800">Quick Actions</h2>
          <span className="text-[9px] bg-zinc-200/80 text-zinc-500 px-2 py-0.5 rounded-full font-bold uppercase tracking-wider">Most Used</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
          <button onClick={() => router.push('/vendor-dashboard/workspace/management/my-business')} className="bg-white hover:bg-zinc-50 transition-colors border border-zinc-200 rounded-xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm h-28">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
              <Store className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-xs font-bold text-zinc-600">Add Business</span>
          </button>
          <button onClick={() => router.push('/vendor-dashboard/workspace/management/my-business')} className="bg-white hover:bg-zinc-50 transition-colors border border-zinc-200 rounded-xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm h-28">
            <div className="w-10 h-10 rounded-full bg-rose-100 flex items-center justify-center">
              <Building2 className="w-5 h-5 text-rose-600" />
            </div>
            <span className="text-xs font-bold text-zinc-600">My Business</span>
          </button>
          <button onClick={() => router.push('/vendor-dashboard/workspace/management/subscriptions')} className="bg-white hover:bg-zinc-50 transition-colors border border-zinc-200 rounded-xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm h-28">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-xs font-bold text-zinc-600">Plans</span>
          </button>
          <button onClick={() => router.push('/vendor-dashboard/workspace/management/offerings')} className="bg-white hover:bg-zinc-50 transition-colors border border-zinc-200 rounded-xl p-4 flex flex-col items-center justify-center gap-3 shadow-sm h-28">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center">
              <Tag className="w-5 h-5 text-emerald-600" />
            </div>
            <span className="text-xs font-bold text-zinc-600">Offerings</span>
          </button>
        </div>
      </div>

      {/* ─── SUMMARY CARDS ROW ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Business Summary & QR */}
        <div className="lg:col-span-1 bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm relative overflow-hidden flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -z-10 opacity-50"></div>
          <div>
            <h3 className="font-black text-lg text-zinc-900">{user?.name || 'Vendor'}</h3>
            <p className="text-sm font-medium text-zinc-500 mt-1 mb-4 leading-relaxed max-w-[200px]">
              Scan the QR code to install the app on your iPhone or Android smartphone.
            </p>
          </div>
          
          <div className="flex items-center gap-3 mt-4">
            <button className="flex-1 bg-[#1D4ED8] hover:bg-blue-800 text-white px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm">
              Business Link
            </button>
            <button onClick={copyLink} className="bg-white border border-zinc-200 hover:bg-zinc-50 text-zinc-700 px-4 py-2.5 rounded-lg text-sm font-bold flex items-center justify-center gap-2 shadow-sm">
              <Copy className="w-4 h-4" /> Copy
            </button>
          </div>

          <div className="absolute right-4 top-4 text-center">
            <div className="bg-white p-1 rounded-xl shadow-sm border border-zinc-100">
               {/* Mock QR Code Image */}
               <div className="w-20 h-20 bg-zinc-900 rounded-lg flex items-center justify-center overflow-hidden">
                 <QrCode className="w-16 h-16 text-white" />
               </div>
            </div>
            <a href="#" className="text-[10px] font-bold text-blue-600 mt-1 block hover:underline">Download QR</a>
          </div>
        </div>

        {/* 4 Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard title="Total Business" value={stats.totalBusiness} icon={<ShoppingBag className="w-4 h-4 text-emerald-500" />} />
          <StatCard title="Total Staff" value={stats.totalStaff} icon={<Users className="w-4 h-4 text-blue-500" />} />
          <StatCard title="Total Appointments" value={stats.totalAppointments} icon={<Calendar className="w-4 h-4 text-purple-500" />} />
          <StatCard title="Total Enquiry" value={stats.totalEnquiry} icon={<MessageSquare className="w-4 h-4 text-blue-500" />} />
        </div>
      </div>

      {/* ─── CHARTS ROW ─── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 pt-2">
        <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm h-64 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-zinc-800">Appointments</h3>
            <span className="text-xs text-zinc-500 font-medium">Last 7 Days</span>
          </div>
          <div className="flex-1 flex items-center justify-center border-b border-l border-zinc-200 relative">
             <BarChart3 className="w-10 h-10 text-zinc-200 absolute" />
             <p className="text-xs text-zinc-400 font-bold z-10 bg-white px-2">Chart Data Loading...</p>
             {/* Mock chart axes */}
             <div className="absolute left-0 top-0 bottom-0 w-1 flex flex-col justify-between -ml-4 py-2">
               <span className="text-[10px] text-zinc-400">5</span>
               <span className="text-[10px] text-zinc-400">4</span>
             </div>
          </div>
        </div>
        
        <div className="bg-white rounded-2xl p-5 border border-zinc-200 shadow-sm h-64 flex flex-col">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-zinc-800">Visitor</h3>
            <span className="text-xs text-zinc-500 font-medium">Current</span>
          </div>
          <div className="flex-1 flex items-end gap-4 border-b border-l border-zinc-200 relative p-4">
            <div className="w-12 bg-blue-500 h-[80%] rounded-t-sm"></div>
            {/* Mock chart axes */}
            <div className="absolute left-0 top-0 bottom-0 w-1 flex flex-col justify-between -ml-6 py-2">
               <span className="text-[10px] text-zinc-400">100</span>
               <span className="text-[10px] text-zinc-400">80</span>
             </div>
          </div>
        </div>
      </div>

    </div>
  );
}

function StatCard({ title, value, icon }: { title: string, value: string | number, icon: React.ReactNode }) {
  return (
    <div className="bg-white rounded-2xl p-4 border border-zinc-200 shadow-sm flex flex-col justify-between h-full">
      <div className="flex justify-between items-start">
        <h4 className="text-[11px] font-bold text-zinc-500 uppercase tracking-wide">{title}</h4>
        <div className="bg-zinc-50 p-1.5 rounded-lg">{icon}</div>
      </div>
      <div className="mt-4 flex items-end gap-2">
        <span className="text-3xl font-black text-zinc-800">{value}</span>
        {/* Placeholder delta */}
        {value === 0 ? <span className="text-[10px] text-emerald-500 font-bold bg-emerald-50 px-1.5 py-0.5 rounded-md mb-1">0 %</span> : null}
      </div>
    </div>
  );
}
