'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { Loader2, MessageCircle, Phone, Search, Filter, Store, ArrowRight, User as UserIcon, Tag, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useRouter } from 'next/navigation';

export default function LeadsPage() {
  const router = useRouter();
  const { activeBusinessId } = useAuthStore();
  
  const [leads, setLeads] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('ALL'); // ALL, NEW, CONTACTED, CONVERTED
  
  useEffect(() => {
    if (!activeBusinessId) return;
    
    const fetchLeads = async () => {
      try {
        setIsLoading(true);
        // We pass the activeBusinessId in headers per the new backend logic
        const response = await apiClient.get('/leads', {
          headers: {
            'x-business-id': activeBusinessId
          }
        });
        setLeads(response.data.data || []);
      } catch (error: any) {
        console.error(error);
        toast.error('Failed to fetch leads');
      } finally {
        setIsLoading(false);
      }
    };

    fetchLeads();
  }, [activeBusinessId]);

  const handleStatusChange = async (leadId: string, newStatus: string) => {
    // Optimistic update
    const previousLeads = [...leads];
    setLeads(leads.map(l => l.id === leadId ? { ...l, status: newStatus } : l));
    
    try {
      await apiClient.patch(`/leads/${leadId}/status`, { status: newStatus }, {
        headers: { 'x-business-id': activeBusinessId }
      });
      toast.success('Status updated');
    } catch (error) {
      console.error(error);
      toast.error('Failed to update status');
      setLeads(previousLeads);
    }
  };

  const getWhatsappUrl = (lead: any) => {
    const itemName = lead.catalogItem?.title || 'your inquiry';
    const text = encodeURIComponent(`Hi ${lead.customerName}, I saw your inquiry for ${itemName} on NearByBazar.`);
    return `https://wa.me/91${lead.customerPhone}?text=${text}`;
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

  const filteredLeads = leads.filter(l => filter === 'ALL' ? true : l.status === filter);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-20">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Leads & Enquiries</h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">Manage all customer inquiries and bookings in one place.</p>
        </div>
        
        <div className="flex bg-white rounded-xl border border-zinc-200 p-1 shadow-sm shrink-0">
          {['ALL', 'NEW', 'CONTACTED', 'CONVERTED'].map((status) => (
            <button
              key={status}
              onClick={() => setFilter(status)}
              className={`px-4 py-2 rounded-lg text-sm font-bold transition-all ${
                filter === status 
                  ? 'bg-emerald-50 text-emerald-700 shadow-sm' 
                  : 'text-zinc-500 hover:text-zinc-800 hover:bg-zinc-50'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 flex flex-col items-center justify-center text-center shadow-sm">
          <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-full flex items-center justify-center mb-4">
            <MessageCircle className="w-8 h-8" />
          </div>
          <h3 className="text-xl font-black text-zinc-900 mb-2">No leads yet</h3>
          <p className="text-zinc-500 font-medium max-w-sm">When customers book or inquire about your services, they will appear here.</p>
        </div>
      ) : filteredLeads.length === 0 ? (
        <div className="bg-white border border-zinc-200 rounded-2xl p-12 text-center shadow-sm">
          <p className="text-zinc-500 font-bold">No leads found for status: {filter}</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-zinc-50/50 border-b border-zinc-200">
                  <th className="p-5 text-xs font-black text-zinc-400 uppercase tracking-wider">Customer</th>
                  <th className="p-5 text-xs font-black text-zinc-400 uppercase tracking-wider">Inquiry For</th>
                  <th className="p-5 text-xs font-black text-zinc-400 uppercase tracking-wider">Time</th>
                  <th className="p-5 text-xs font-black text-zinc-400 uppercase tracking-wider">Status</th>
                  <th className="p-5 text-xs font-black text-zinc-400 uppercase tracking-wider text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100">
                {filteredLeads.map((lead) => (
                  <tr key={lead.id} className="hover:bg-zinc-50/50 transition-colors">
                    <td className="p-5">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center shrink-0">
                           <span className="text-emerald-700 font-bold">{lead.customerName?.charAt(0) || 'C'}</span>
                        </div>
                        <div>
                          <p className="font-bold text-zinc-900">{lead.customerName}</p>
                          <p className="text-xs font-medium text-zinc-500 flex items-center gap-1"><Phone className="w-3 h-3" /> {lead.customerPhone}</p>
                        </div>
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700">
                        <Tag className="w-4 h-4 text-zinc-400" />
                        {lead.catalogItem?.title || 'General Booking'}
                      </div>
                    </td>
                    <td className="p-5">
                      <div className="flex items-center gap-2 text-sm font-medium text-zinc-500">
                        <Clock className="w-4 h-4 text-zinc-400" />
                        {formatDistanceToNow(new Date(lead.createdAt), { addSuffix: true })}
                      </div>
                    </td>
                    <td className="p-5">
                      <select
                        value={lead.status}
                        onChange={(e) => handleStatusChange(lead.id, e.target.value)}
                        className={`text-xs font-bold px-3 py-1.5 rounded-lg border-2 outline-none cursor-pointer transition-colors ${
                          lead.status === 'NEW' ? 'border-rose-200 bg-rose-50 text-rose-700 focus:border-rose-500' :
                          lead.status === 'CONTACTED' ? 'border-blue-200 bg-blue-50 text-blue-700 focus:border-blue-500' :
                          'border-emerald-200 bg-emerald-50 text-emerald-700 focus:border-emerald-500'
                        }`}
                      >
                        <option value="NEW">New</option>
                        <option value="CONTACTED">Contacted</option>
                        <option value="CONVERTED">Converted</option>
                        <option value="REJECTED">Rejected</option>
                      </select>
                    </td>
                    <td className="p-5 text-right">
                      <a 
                        href={getWhatsappUrl(lead)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-[#25D366] hover:bg-[#1ebd5a] text-white transition-colors shadow-sm shadow-[#25D366]/20"
                        title="Message on WhatsApp"
                      >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.072.045.419-.099.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-5.824 4.74-10.563 10.567-10.564 5.823 0 10.564 4.745 10.564 10.568 0 5.822-4.74 10.565-10.564 10.565z"/></svg>
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
