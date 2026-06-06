'use client';

import Link from 'next/link';
import { ArrowLeft, MessageSquare, Clock, MapPin, Building, ShieldCheck, Phone, X } from 'lucide-react';
import Image from 'next/image';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';
import { useAuthStore } from '@/store/authStore';

export default function MyEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { user } = useAuthStore();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const res = await apiClient.get('/orders/my-orders');
        setEnquiries(res.data.data);
      } catch (err) {
        console.error('Failed to fetch orders', err);
      } finally {
        setIsLoading(false);
      }
    };
    if (user) fetchOrders();
    else setIsLoading(false);
  }, [user]);

  const openWhatsApp = (phone: string, businessName: string) => {
    const formattedPhone = phone.startsWith('+') ? phone.replace('+', '') : (phone.length === 10 ? `91${phone}` : phone);
    const text = `Hi ${businessName}, I'm following up on my booking request from NearByBazar. Could you please share further details?`;
    window.open(`https://wa.me/${formattedPhone}?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <div className="min-h-screen bg-muted/20 pb-12">
      {/* Header */}
      <div className="bg-white border-b border-zinc-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center h-16">
            <Link 
              href="/profile"
              className="flex items-center text-sm font-semibold text-zinc-500 hover:text-zinc-900 transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Back to Profile
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center">
            <MessageSquare className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-black text-zinc-900 tracking-tight">My Enquiries</h1>
            <p className="text-sm text-zinc-500 font-medium mt-1">Track the services you have recently requested</p>
          </div>
        </div>

        {isLoading ? (
          <div className="flex justify-center py-12">
            <div className="w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
          </div>
        ) : enquiries.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-zinc-200 shadow-sm flex flex-col items-center">
            <div className="w-20 h-20 bg-zinc-50 rounded-full flex items-center justify-center mb-4">
              <MessageSquare className="w-8 h-8 text-zinc-300" />
            </div>
            <h3 className="text-lg font-bold text-zinc-900 mb-2">No enquiries yet</h3>
            <p className="text-zinc-500 text-sm max-w-sm mb-6">
              When you enquire about a service from a local vendor, it will appear here.
            </p>
            <Link
              href="/explore"
              className="inline-flex items-center justify-center px-6 py-3 bg-primary text-white font-bold text-sm rounded-xl hover:bg-primary/90 transition-colors"
            >
              Explore Services
            </Link>
          </div>
        ) : (
          <div className="grid gap-4">
            {enquiries.map((enquiry) => {
              // FIX F5: was `enquiry.vendor` — correct relation name is `businessProfile`
              const vendor = enquiry.businessProfile || {};
              const firstItem = enquiry.items?.[0]?.catalogItem || {};
              const vendorPhone = vendor.user?.phoneNumber;
              
              return (
              <div 
                key={enquiry.id}
                className="bg-white rounded-2xl p-4 sm:p-6 border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-6 hover:border-primary/20 transition-colors"
              >
                {/* Media */}
                <div className="w-full sm:w-48 h-32 relative rounded-xl bg-zinc-100 overflow-hidden flex-shrink-0">
                  {firstItem.mediaUrl || vendor.media?.[0]?.secureUrl ? (
                    <Image 
                      src={firstItem.mediaUrl || vendor.media?.[0]?.secureUrl} 
                      alt={firstItem.title || vendor.businessName || 'Service'} 
                      fill 
                      className="object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <ShieldCheck className="w-8 h-8 text-zinc-300" />
                    </div>
                  )}
                </div>

                {/* Details */}
                <div className="flex-1 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-4 mb-2">
                      <h3 className="font-bold text-lg text-zinc-900">
                        {enquiry.orderType === 'TRANSACTIONAL' ? `Order from ${vendor.businessName}` : (firstItem.title || 'Booking Request')}
                      </h3>
                      <span className={`flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        enquiry.status === 'PENDING' ? 'bg-amber-50 text-amber-700 border-amber-200/50' :
                        enquiry.status === 'CONFIRMED' ? 'bg-emerald-50 text-emerald-700 border-emerald-200/50' :
                        enquiry.status === 'COMPLETED' ? 'bg-blue-50 text-blue-700 border-blue-200/50' :
                        'bg-rose-50 text-rose-700 border-rose-200/50'
                      }`}>
                        <Clock className="w-3 h-3" />
                        {enquiry.status === 'CONFIRMED' ? 'ACCEPTED' : enquiry.status}
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 mb-1">
                      <Building className="w-4 h-4 text-zinc-400" />
                      {vendor.businessName || 'Unknown Vendor'}
                    </div>
                    
                    <div className="text-xs text-zinc-500 font-medium flex items-center gap-1.5 mt-3">
                      Requested on {new Date(enquiry.createdAt).toLocaleDateString()} at {new Date(enquiry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                    <div className="text-sm font-bold mt-2">
                      Total: ₹{enquiry.totalValue} ({enquiry.items?.length || 0} items)
                    </div>

                    {/* FIX F6: Show rejection reason clearly */}
                    {enquiry.status === 'REJECTED' && enquiry.rejectionReason && (
                      <div className="mt-3 flex items-start gap-2 p-3 bg-rose-50 border border-rose-200 rounded-xl">
                        <X className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                        <div>
                          <p className="text-xs font-bold text-rose-700 uppercase tracking-wider mb-0.5">Request Declined</p>
                          <p className="text-sm text-rose-600 font-medium">{enquiry.rejectionReason}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* FIX: 2-Way Connect UI (Post-Acceptance) — no chat button per Phase 2 deferral */}
                  <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row gap-3">
                    {enquiry.status === 'CONFIRMED' && vendorPhone ? (
                      <>
                        <a
                          href={`tel:${vendorPhone}`}
                          className="flex-1 px-4 py-2.5 bg-zinc-900 text-white rounded-xl text-sm font-bold border border-zinc-700 hover:bg-zinc-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <Phone className="w-4 h-4" />
                          Call Vendor
                        </a>
                        <button
                          onClick={() => openWhatsApp(vendorPhone, vendor.businessName || 'Vendor')}
                          className="flex-1 px-4 py-2.5 bg-green-600 text-white rounded-xl text-sm font-bold hover:bg-green-700 transition-colors flex items-center justify-center gap-2"
                        >
                          <MessageSquare className="w-4 h-4" />
                          WhatsApp Vendor
                        </button>
                      </>
                    ) : enquiry.status === 'PENDING' ? (
                      <div className="flex-1 px-4 py-2.5 bg-amber-50 text-amber-700 rounded-xl text-sm font-semibold border border-amber-200 text-center">
                        ⏳ Awaiting vendor response...
                      </div>
                    ) : enquiry.status === 'REJECTED' ? (
                      <Link
                        href="/explore"
                        className="flex-1 px-4 py-2.5 bg-zinc-50 text-zinc-700 rounded-xl text-sm font-bold border border-zinc-200 hover:bg-zinc-100 transition-colors flex items-center justify-center text-center"
                      >
                        Find Another Vendor
                      </Link>
                    ) : null}
                  </div>
                </div>
              </div>
            )})}
          </div>
        )}
      </div>
    </div>
  );
}
