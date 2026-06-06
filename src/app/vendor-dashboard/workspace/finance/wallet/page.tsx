'use client';

import { useAuthStore } from '@/store/authStore';
import { BarChart3, TrendingUp, MessageSquare, PhoneCall, ExternalLink } from 'lucide-react';

export default function LeadAnalyticsPage() {
  const { user } = useAuthStore();

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      
      {/* ─── HEADER ─── */}
      <div>
        <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Lead Analytics</h1>
        <p className="text-sm font-medium text-zinc-500 mt-1">
          NearByBazar operates on a zero-commission model. Track your direct WhatsApp leads and estimated value here.
        </p>
      </div>

      {/* ─── STAT CARDS ─── */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-50 rounded-bl-full -z-10"></div>
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Estimated Value</h3>
             <div className="bg-emerald-100 p-2 rounded-xl text-emerald-600"><TrendingUp className="w-5 h-5" /></div>
          </div>
          <div className="text-4xl font-black text-zinc-900 mb-2">₹12,450</div>
          <p className="text-xs font-bold text-emerald-600 flex items-center gap-1">
             +15% from last week
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-50 rounded-bl-full -z-10"></div>
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">WhatsApp Clicks</h3>
             <div className="bg-blue-100 p-2 rounded-xl text-blue-600"><MessageSquare className="w-5 h-5" /></div>
          </div>
          <div className="text-4xl font-black text-zinc-900 mb-2">148</div>
          <p className="text-xs font-bold text-zinc-500 flex items-center gap-1">
             Direct negotiation leads
          </p>
        </div>

        <div className="bg-white rounded-2xl p-6 border border-zinc-200 shadow-sm relative overflow-hidden">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-50 rounded-bl-full -z-10"></div>
          <div className="flex items-center justify-between mb-4">
             <h3 className="text-sm font-bold text-zinc-500 uppercase tracking-wider">Phone Calls</h3>
             <div className="bg-purple-100 p-2 rounded-xl text-purple-600"><PhoneCall className="w-5 h-5" /></div>
          </div>
          <div className="text-4xl font-black text-zinc-900 mb-2">32</div>
          <p className="text-xs font-bold text-zinc-500 flex items-center gap-1">
             Direct customer calls
          </p>
        </div>
      </div>

      {/* ─── LEAD FEED / TABLE ─── */}
      <div className="bg-white border border-zinc-200 rounded-2xl shadow-sm overflow-hidden">
        <div className="p-6 border-b border-zinc-100 flex items-center justify-between">
           <h2 className="text-lg font-bold text-zinc-900 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-emerald-600" /> Recent Conversions
           </h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-zinc-50 text-xs uppercase tracking-wider font-bold text-zinc-500 border-b border-zinc-100">
                <th className="p-4">Customer</th>
                <th className="p-4">Channel</th>
                <th className="p-4">Estimated Value</th>
                <th className="p-4">Date</th>
                <th className="p-4">Action</th>
              </tr>
            </thead>
            <tbody className="text-sm font-medium text-zinc-800 divide-y divide-zinc-100">
              <tr className="hover:bg-zinc-50 transition-colors">
                <td className="p-4">Rahul Sharma</td>
                <td className="p-4"><span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-200">WhatsApp</span></td>
                <td className="p-4 font-bold">₹850</td>
                <td className="p-4 text-zinc-500">Today, 10:30 AM</td>
                <td className="p-4"><button className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 text-xs">View <ExternalLink className="w-3 h-3" /></button></td>
              </tr>
              <tr className="hover:bg-zinc-50 transition-colors">
                <td className="p-4">Priya Verma</td>
                <td className="p-4"><span className="bg-blue-50 text-blue-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-blue-200">Phone Call</span></td>
                <td className="p-4 font-bold">₹2,100</td>
                <td className="p-4 text-zinc-500">Yesterday</td>
                <td className="p-4"><button className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 text-xs">View <ExternalLink className="w-3 h-3" /></button></td>
              </tr>
              <tr className="hover:bg-zinc-50 transition-colors">
                <td className="p-4">Amit Singh</td>
                <td className="p-4"><span className="bg-emerald-50 text-emerald-700 px-2.5 py-1 rounded-lg text-xs font-bold border border-emerald-200">WhatsApp</span></td>
                <td className="p-4 font-bold">₹400</td>
                <td className="p-4 text-zinc-500">Jun 4, 2026</td>
                <td className="p-4"><button className="text-emerald-600 hover:text-emerald-700 font-bold flex items-center gap-1 text-xs">View <ExternalLink className="w-3 h-3" /></button></td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
