'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import { toast } from 'sonner';
import { Loader2, ExternalLink, Calendar, MapPin, Receipt, CheckCircle2, Clock, XCircle, FileText, LayoutGrid, List, Phone, MessageCircle } from 'lucide-react';
import { useMemo } from 'react';
// ChatInterface deferred to Phase 2

export default function VendorOrdersPage() {
  const { activeBusinessId } = useAuthStore();
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [dateFilter, setDateFilter] = useState('ALL');

  const [rejectModalOpen, setRejectModalOpen] = useState(false);
  const [rejectingOrderId, setRejectingOrderId] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');

  const filteredOrders = useMemo(() => {
    let result = [...orders];

    if (statusFilter !== 'ALL') {
      result = result.filter(o => o.status === statusFilter);
    }

    if (dateFilter !== 'ALL') {
      const now = new Date();
      const orderDate = (o: any) => new Date(o.createdAt);
      
      if (dateFilter === 'TODAY') {
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        result = result.filter(o => orderDate(o) >= today);
      } else if (dateFilter === 'YESTERDAY') {
        const yesterday = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 1);
        const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        result = result.filter(o => orderDate(o) >= yesterday && orderDate(o) < today);
      } else if (dateFilter === '7DAYS') {
        const last7 = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        result = result.filter(o => orderDate(o) >= last7);
      } else if (dateFilter === '30DAYS') {
        const last30 = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        result = result.filter(o => orderDate(o) >= last30);
      }
    }

    return result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }, [orders, statusFilter, dateFilter]);

  useEffect(() => {
    if (!activeBusinessId) return;
    fetchOrders();
  }, [activeBusinessId]);

  const fetchOrders = async () => {
    try {
      setIsLoading(true);
      const res = await apiClient.get('/orders/vendor', {
        headers: { 'x-business-id': activeBusinessId }
      });
      setOrders(res.data?.data || []);
    } catch (error) {
      console.error('Failed to fetch orders:', error);
      toast.error('Could not load orders.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (orderId: string, newStatus: string, reason?: string) => {
    try {
      await apiClient.patch(`/orders/vendor/${orderId}`, { status: newStatus, rejectionReason: reason }, {
        headers: { 'x-business-id': activeBusinessId }
      });
      toast.success(`Order marked as ${newStatus}`);
      fetchOrders();
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to update status');
    }
  };

  const initiateReject = (orderId: string) => {
    setRejectingOrderId(orderId);
    setRejectionReason('');
    setRejectModalOpen(true);
  };

  const confirmReject = () => {
    if (!rejectionReason) return toast.error('Please select a rejection reason');
    handleUpdateStatus(rejectingOrderId, 'REJECTED', rejectionReason);
    setRejectModalOpen(false);
  };

  const openWhatsApp = (phone: string, customerName: string, items: any[]) => {
    let itemList = items.map(i => `${i.quantity}x ${i.catalogItem?.title}`).join(', ');
    const text = `Hi ${customerName}, this is regarding your order for: ${itemList}. We wanted to confirm your location for delivery.`;
    window.open(`https://wa.me/91${phone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  if (isLoading) {
    return <div className="flex items-center justify-center min-h-[50vh]"><Loader2 className="w-8 h-8 text-emerald-500 animate-spin" /></div>;
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-black text-zinc-900 tracking-tight">Orders Manager</h1>
          <p className="text-sm font-medium text-zinc-500 mt-1">Manage incoming food and supermarket cart orders.</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-2">
          <select 
            value={statusFilter} 
            onChange={e => setStatusFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-bold text-zinc-700 outline-none hover:border-zinc-300 transition-colors"
          >
            <option value="ALL">All Status</option>
            <option value="PENDING">Pending</option>
            <option value="CONFIRMED">In Progress</option>
            <option value="COMPLETED">Completed</option>
            <option value="CANCELLED">Rejected</option>
          </select>

          <select 
            value={dateFilter} 
            onChange={e => setDateFilter(e.target.value)}
            className="px-3 py-2 bg-white border border-zinc-200 rounded-lg text-sm font-bold text-zinc-700 outline-none hover:border-zinc-300 transition-colors"
          >
            <option value="ALL">All Time</option>
            <option value="TODAY">Today</option>
            <option value="YESTERDAY">Yesterday</option>
            <option value="7DAYS">Last 7 Days</option>
            <option value="30DAYS">Last 30 Days</option>
          </select>

          <div className="flex items-center bg-zinc-100 p-1 rounded-lg border border-zinc-200 ml-1">
            <button 
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'grid' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button 
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-white shadow-sm text-zinc-900' : 'text-zinc-500 hover:text-zinc-700'}`}
            >
              <List className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {orders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-4 border border-zinc-100">
            <Receipt className="w-8 h-8 text-zinc-400" />
          </div>
          <h3 className="text-xl font-bold text-zinc-900">No Orders Yet</h3>
          <p className="text-zinc-500 mt-2 font-medium max-w-sm mx-auto">
            When customers add multiple items to their cart and checkout, they will appear here as order tickets.
          </p>
        </div>
      ) : filteredOrders.length === 0 ? (
        <div className="bg-white rounded-2xl border border-zinc-200 p-12 text-center shadow-sm">
          <h3 className="text-xl font-bold text-zinc-900">No matching orders</h3>
          <p className="text-zinc-500 mt-2 font-medium max-w-sm mx-auto">
            Try adjusting your filters to see more results.
          </p>
        </div>
      ) : (
        <>
          {viewMode === 'list' ? (
            <div className="bg-white rounded-2xl border border-zinc-200 shadow-sm overflow-x-auto">
              <table className="w-full text-left text-sm whitespace-nowrap">
                 <thead className="bg-zinc-50 border-b border-zinc-100 text-xs font-bold text-zinc-500 uppercase tracking-wider">
                   <tr>
                     <th className="px-6 py-4">Customer</th>
                     <th className="px-6 py-4">Date & Time</th>
                     <th className="px-6 py-4">Items</th>
                     <th className="px-6 py-4">Total</th>
                     <th className="px-6 py-4">Status</th>
                     <th className="px-6 py-4 text-right">Actions</th>
                   </tr>
                 </thead>
                 <tbody className="divide-y divide-zinc-100">
                   {filteredOrders.map(order => (
                      <tr key={order.id} className="hover:bg-zinc-50">
                        <td className="px-6 py-4 font-bold text-zinc-900">
                          {order.customerName}
                          <div className="text-xs font-medium text-zinc-500 mt-0.5">{order.customerPhone}</div>
                        </td>
                        <td className="px-6 py-4 text-xs text-zinc-500 font-medium">
                          {new Date(order.createdAt).toLocaleDateString()}
                          <div className="mt-0.5">{new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</div>
                        </td>
                        <td className="px-6 py-4 text-sm font-bold text-zinc-700">
                           {order.items.length} items
                           <div className="text-xs font-medium text-zinc-400 truncate max-w-[200px] mt-0.5">
                             {order.items.map((i:any)=>i.catalogItem?.title).join(', ')}
                           </div>
                        </td>
                        <td className="px-6 py-4 font-black text-emerald-600 text-base">₹{order.totalValue}</td>
                        <td className="px-6 py-4">
                          <span className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider ${
                            order.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                            order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                            order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                            'bg-red-100 text-red-800'
                          }`}>{order.status === 'CONFIRMED' ? 'IN PROGRESS' : order.status}</span>
                        </td>
                        <td className="px-6 py-4 text-right space-x-2">
                           {order.status === 'PENDING' && (
                             <div className="flex gap-2">
                               <button onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')} className="px-3 py-1.5 text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors rounded-lg">Accept</button>
                               <button onClick={() => initiateReject(order.id)} className="px-3 py-1.5 text-xs font-bold bg-white hover:bg-red-50 border border-red-200 transition-colors text-red-600 rounded-lg">Reject</button>
                             </div>
                           )}
                           {order.status === 'CONFIRMED' && (
                             <div className="flex gap-2">
                               <button onClick={() => handleUpdateStatus(order.id, 'COMPLETED')} className="px-3 py-1.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 transition-colors text-white rounded-lg">Complete</button>
                             </div>
                           )}
                           {order.status !== 'PENDING' && order.status !== 'REJECTED' && (
                             <button onClick={() => openWhatsApp(order.customerPhone, order.customerName, order.items)} className="px-3 py-1.5 text-xs font-bold bg-white border border-zinc-200 text-zinc-700 rounded-lg hover:bg-zinc-100 transition-colors inline-block mt-2">
                               <ExternalLink className="w-3.5 h-3.5 inline" /> WA
                             </button>
                           )}
                        </td>
                      </tr>
                   ))}
                 </tbody>
              </table>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredOrders.map((order) => (
                <div key={order.id} className="bg-white rounded-2xl border border-zinc-200 shadow-sm flex flex-col hover:border-emerald-200 transition-colors">
                  <div className="p-4 flex justify-between items-start border-b border-zinc-100">
                    <div>
                      <h3 className="font-bold text-zinc-900">{order.customerName}</h3>
                      <div className="text-xs text-zinc-500 flex items-center gap-1 mt-1 font-medium">
                        <Clock className="w-3.5 h-3.5" /> 
                        {new Date(order.createdAt).toLocaleDateString()} • {new Date(order.createdAt).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                      </div>
                    </div>
                    <div className="text-right flex flex-col items-end">
                      <span className={`px-2 py-1 rounded text-[9px] font-black uppercase tracking-wider ${
                          order.status === 'PENDING' ? 'bg-amber-100 text-amber-800' :
                          order.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-800' :
                          order.status === 'COMPLETED' ? 'bg-emerald-100 text-emerald-800' :
                          'bg-red-100 text-red-800'
                      }`}>{order.status === 'CONFIRMED' ? 'IN PROGRESS' : order.status}</span>
                      <div className="font-black text-emerald-600 mt-1.5 text-lg">₹{order.totalValue}</div>
                    </div>
                  </div>
                  
                  <div className="p-4 flex-1">
                    <p className="text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">{order.items.length} Items</p>
                    <div className="space-y-1.5 mb-4">
                       {order.items.map((item:any) => (
                         <div key={item.id} className="flex justify-between text-sm font-bold text-zinc-700">
                           <span className="truncate pr-2">{item.quantity}x {item.catalogItem?.title || 'Item'}</span>
                           <span className="shrink-0 text-zinc-400">₹{item.priceAtTimeOfOrder * item.quantity}</span>
                         </div>
                       ))}
                    </div>
                    {order.serviceLocation && (
                      <div className="text-xs bg-zinc-50 p-2.5 rounded-lg border border-zinc-100 text-zinc-600 flex gap-2 items-start font-medium">
                        <MapPin className="w-4 h-4 shrink-0 text-zinc-400 mt-0.5" />
                        <span className="line-clamp-2 leading-relaxed">{order.serviceLocation}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 border-t border-zinc-100 bg-zinc-50 flex flex-col gap-2 rounded-b-2xl">
                     {order.status === 'PENDING' ? (
                       <div className="flex flex-col gap-2 w-full">
                         <div className="flex gap-2 w-full">
                           <button onClick={() => handleUpdateStatus(order.id, 'CONFIRMED')} className="flex-1 py-2.5 text-xs font-bold bg-blue-600 hover:bg-blue-700 transition-colors text-white rounded-lg">Accept</button>
                           <button onClick={() => initiateReject(order.id)} className="flex-1 py-2.5 text-xs font-bold bg-white hover:bg-red-50 transition-colors border border-red-200 text-red-600 rounded-lg">Reject</button>
                         </div>
                       </div>
                     ) : (
                       <div className="w-full space-y-2">
                         {order.status === 'CONFIRMED' && (
                           <button onClick={() => handleUpdateStatus(order.id, 'COMPLETED')} className="w-full py-2.5 text-xs font-bold bg-emerald-600 hover:bg-emerald-700 transition-colors text-white rounded-lg">Mark Completed</button>
                         )}
                         {order.status !== 'REJECTED' && (
                           <div className="grid grid-cols-2 gap-2">
                             <button onClick={() => window.open(`tel:${order.customerPhone}`)} className="w-full py-2 flex justify-center items-center bg-zinc-800 text-white hover:bg-zinc-700 transition-colors rounded-lg">
                               <Phone className="w-4 h-4" />
                             </button>
                             <button onClick={() => openWhatsApp(order.customerPhone, order.customerName, order.items)} className="w-full py-2 flex justify-center items-center bg-green-500 hover:bg-green-600 transition-colors text-white rounded-lg">
                               <MessageCircle className="w-4 h-4" />
                             </button>
                           </div>
                         )}
                       </div>
                     )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Rejection Modal */}
      {rejectModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-2xl p-6 shadow-2xl">
            <h3 className="text-xl font-bold text-zinc-900 mb-2">Reject Request</h3>
            <p className="text-zinc-500 text-sm mb-4">Please select a reason for rejecting this request. The customer will be notified.</p>
            
            <select 
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="w-full p-3 border border-zinc-300 rounded-xl mb-6 text-sm font-medium focus:border-red-500 focus:outline-none"
            >
              <option value="" disabled>Select a reason...</option>
              <option value="Item Out of Stock">Item Out of Stock</option>
              <option value="Kitchen Closed">Kitchen Closed</option>
              <option value="Delivery Unavailable">Delivery Unavailable</option>
              <option value="Fully Booked">Fully Booked / No Time Slots</option>
              <option value="Out of Service Area">Out of Service Area</option>
              <option value="Other">Other</option>
            </select>

            <div className="flex gap-3">
              <button 
                onClick={() => setRejectModalOpen(false)}
                className="flex-1 py-3 bg-zinc-100 text-zinc-700 font-bold rounded-xl hover:bg-zinc-200 transition-colors"
              >
                Cancel
              </button>
              <button 
                onClick={confirmReject}
                className="flex-1 py-3 bg-red-600 text-white font-bold rounded-xl hover:bg-red-700 transition-colors"
              >
                Confirm Reject
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Chat Interface — Deferred to Phase 2 */}
    </div>
  );
}
