'use client';

import { useEnquiryStore } from '@/store/useEnquiryStore';
import Link from 'next/link';
import { ArrowLeft, MessageSquare, Clock, MapPin, Building, ShieldCheck, Zap } from 'lucide-react';
import Image from 'next/image';

export default function MyEnquiriesPage() {
  const { enquiries } = useEnquiryStore();

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

        {enquiries.length === 0 ? (
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
            {enquiries.sort((a, b) => b.timestamp - a.timestamp).map((enquiry) => (
              <div 
                key={`${enquiry.catalogItemId}-${enquiry.timestamp}`}
                className="bg-white rounded-2xl p-4 sm:p-6 border border-zinc-200 shadow-sm flex flex-col sm:flex-row gap-6 hover:border-primary/20 transition-colors"
              >
                {/* Media */}
                <div className="w-full sm:w-48 h-32 relative rounded-xl bg-zinc-100 overflow-hidden flex-shrink-0">
                  {enquiry.mediaUrl ? (
                    <Image 
                      src={enquiry.mediaUrl} 
                      alt={enquiry.title || 'Service'} 
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
                      <h3 className="font-bold text-lg text-zinc-900">{enquiry.title || 'Unknown Service'}</h3>
                      <span className="flex-shrink-0 inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 text-[10px] font-black uppercase tracking-wider border border-amber-200/50">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    </div>
                    
                    <div className="flex items-center gap-2 text-sm font-semibold text-zinc-700 mb-1">
                      <Building className="w-4 h-4 text-zinc-400" />
                      {enquiry.vendorName || 'Unknown Vendor'}
                    </div>
                    
                    <div className="text-xs text-zinc-500 font-medium flex items-center gap-1.5 mt-3">
                      Requested on {new Date(enquiry.timestamp).toLocaleDateString()} at {new Date(enquiry.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-100 flex flex-col sm:flex-row gap-3">
                    <button className="flex-1 px-4 py-2 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-bold border border-emerald-200 hover:bg-emerald-100 transition-colors flex items-center justify-center gap-2">
                      <Zap className="w-3.5 h-3.5" />
                      Upgrade to unlock WhatsApp
                    </button>
                    <Link
                      href="/explore"
                      className="flex-1 px-4 py-2 bg-zinc-50 text-zinc-700 rounded-lg text-xs font-bold border border-zinc-200 hover:bg-zinc-100 transition-colors flex items-center justify-center text-center"
                    >
                      Browse Services
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
