'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { useAuthStore } from '@/store/authStore';
import apiClient from '@/lib/api-client';
import { CatalogItem } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { Loader2, X, ShieldCheck, MapPin, Star, BadgeCheck, Phone, CheckCircle2, Flag, Ban, Clock } from 'lucide-react';
import Image from 'next/image';
import { SaveProButton } from '@/components/shared/SaveProButton';
import { AuthModal } from '@/components/shared/AuthModal';

interface ServiceSidebarProps {
  item: CatalogItem;
  vendorName: string;
}

export function ServiceSidebar({ item, vendorName }: ServiceSidebarProps) {
  const { user } = useAuthStore();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [requirement, setRequirement] = useState('');

  const hasEnquiredRecently = false;
  const canEnquire = (id: string) => true;

  const handleOpen = () => {
    if (!user) {
      setIsAuthModalOpen(true);
      return;
    }
    setIsSuccess(false);
    setIsOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error('Name and Phone are required');
      return;
    }

    if (!canEnquire(item.id)) {
      toast.error('You have already enquired for this service recently.');
      return;
    }

    try {
      setIsSubmitting(true);
      await apiClient.post('/catalog/enquire', {
        catalogItemId: item.id,
        customerName: name,
        customerPhone: phone,
        customerRequirement: requirement,
      });

      setIsSuccess(true);
    } catch (error: any) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to send inquiry');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Intercept Auth */}
      <AuthModal 
        isOpen={isAuthModalOpen} 
        onClose={() => setIsAuthModalOpen(false)} 
        onSuccess={() => {
          setIsAuthModalOpen(false);
          setIsSuccess(false);
          setIsOpen(true);
        }} 
      />

      <Button 
        className="w-full h-11 text-xs font-bold rounded-xl"
        onClick={handleOpen}
      >
        View Details
      </Button>

      {isOpen && mounted && createPortal(
        <div className="fixed inset-0 z-[100] flex justify-end">
          {/* Backdrop */}
          <div 
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          
          {/* Sidebar */}
          <div className="relative w-full max-w-md h-full bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
            {/* Header / Close Button */}
            <div className="flex items-center justify-between p-4 border-b border-zinc-100 bg-zinc-50">
              <h2 className="text-sm font-black text-zinc-900 tracking-tight">Service Details</h2>
              <button 
                onClick={() => setIsOpen(false)}
                className="p-2 bg-white rounded-full text-zinc-500 hover:text-zinc-900 shadow-sm border border-zinc-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Content Scrollable */}
            <div className="flex-1 overflow-y-auto p-0">
              {/* Image Hero */}
              <div className="w-full h-56 relative bg-zinc-100">
                <div className="absolute top-4 right-4 z-10">
                  <SaveProButton item={item} />
                </div>
                {item.mediaUrl ? (
                  <Image src={item.mediaUrl} alt={item.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-zinc-50">
                    <ShieldCheck className="w-12 h-12 text-zinc-300" />
                  </div>
                )}
                {item.price && (
                  <div className="absolute bottom-4 left-4 bg-zinc-900/90 text-white px-3 py-1.5 rounded-lg text-sm font-black shadow-lg">
                    ₹{item.price}
                  </div>
                )}
              </div>

              <div className="p-6 space-y-6">
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="bg-emerald-50 text-emerald-700 text-[10px] font-black uppercase px-2 py-0.5 rounded border border-emerald-100 flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3" />
                      Verified Service
                    </span>
                    <span className="bg-primary/10 text-primary text-[10px] font-black uppercase px-2 py-0.5 rounded border border-primary/20">
                      Local Vendor
                    </span>
                  </div>
                  <h1 className="text-xl font-black text-zinc-900 leading-tight">
                    {item.title}
                  </h1>
                  <p className="text-sm text-zinc-500 font-medium leading-relaxed">
                    {item.description || 'No description provided by the vendor.'}
                  </p>
                </div>

                <div className="p-4 bg-zinc-50 border border-zinc-100 rounded-2xl flex items-center gap-4">
                  <div className="w-12 h-12 bg-white rounded-xl shadow-sm border border-zinc-200 flex items-center justify-center font-black text-primary text-lg">
                    {vendorName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="text-sm font-extrabold text-zinc-900 flex items-center gap-1">
                      {vendorName}
                      <BadgeCheck className="w-4 h-4 text-emerald-500" />
                    </h4>
                    <p className="text-xs text-zinc-500 font-medium">Independent Professional</p>
                  </div>
                </div>

                <hr className="border-zinc-100" />

                {isSuccess || hasEnquiredRecently ? (
                  <div className="flex flex-col items-center justify-center py-6 text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-2">
                      {hasEnquiredRecently && !isSuccess ? <Clock className="w-8 h-8" /> : <CheckCircle2 className="w-8 h-8" />}
                    </div>
                    <h3 className="text-lg font-black text-zinc-900">
                      {hasEnquiredRecently && !isSuccess ? 'Already Requested' : 'Enquiry Sent Successfully!'}
                    </h3>
                    <p className="text-xs text-zinc-500 font-medium max-w-[280px]">
                      {hasEnquiredRecently && !isSuccess 
                        ? `You have already sent a request to ${vendorName} recently. Please wait a few hours before requesting again to prevent spam.`
                        : `Your request has been sent to ${vendorName}. They will contact you within a few hours.`}
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1">
                      <Label htmlFor="name" className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Your Name *</Label>
                      <Input 
                        id="name" 
                        value={name} 
                        onChange={(e) => setName(e.target.value)} 
                        placeholder="e.g. Rahul Sharma" 
                        required
                        className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                      />
                    </div>
                    
                    <div className="space-y-1">
                      <Label htmlFor="phone" className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Mobile Number *</Label>
                      <Input 
                        id="phone" 
                        value={phone} 
                        onChange={(e) => setPhone(e.target.value)} 
                        placeholder="e.g. 9876543210" 
                        required
                        maxLength={10}
                        className="h-12 rounded-xl bg-zinc-50 border-zinc-200"
                      />
                    </div>

                    <div className="space-y-1">
                      <Label htmlFor="requirement" className="text-xs font-bold text-zinc-600 uppercase tracking-wider">Additional Requirements (Optional)</Label>
                      <Textarea 
                        id="requirement" 
                        value={requirement} 
                        onChange={(e) => setRequirement(e.target.value)} 
                        placeholder="e.g. Need it done by Sunday morning..."
                        className="min-h-[100px] rounded-xl bg-zinc-50 border-zinc-200 p-4"
                      />
                    </div>

                    <Button type="submit" className="w-full h-14 rounded-xl text-sm font-black mt-4 shadow-lg shadow-primary/20" disabled={isSubmitting}>
                      {isSubmitting ? (
                        <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
                      ) : 'Enquire Now'}
                    </Button>
                    <p className="text-[10px] text-zinc-400 text-center font-medium px-4">
                      By enquiring, your details will be securely shared with {vendorName} via WhatsApp.
                    </p>
                  </form>
                )}

                {/* Upsell to Paid Plan */}
                <div className="mt-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/50 rounded-2xl p-5 relative overflow-hidden">
                  <div className="absolute -right-4 -top-4 w-24 h-24 bg-amber-200/40 rounded-full blur-2xl" />
                  <div className="relative z-10 flex flex-col gap-2">
                    <div className="flex items-center gap-2">
                      <span className="bg-amber-200/50 text-amber-800 text-[9px] font-black uppercase px-2 py-0.5 rounded shadow-sm">
                        Pro Feature
                      </span>
                    </div>
                    <h4 className="text-sm font-extrabold text-amber-900 leading-tight">
                      Want to skip the wait?
                    </h4>
                    <p className="text-xs text-amber-800/80 font-medium leading-relaxed">
                      Upgrade to a Paid Plan to instantly unlock {vendorName}'s direct WhatsApp and phone number.
                    </p>
                    <Button variant="outline" className="mt-2 w-full h-10 bg-white border-amber-200 text-amber-700 hover:bg-amber-50 hover:text-amber-800 font-bold text-xs shadow-sm">
                      <Phone className="w-3.5 h-3.5 mr-2" />
                      Unlock Contact Details
                    </Button>
                  </div>
                </div>

                {/* Report / Block Actions */}
                <div className="flex justify-center items-center gap-6 pt-4 border-t border-zinc-100">
                  <button 
                    onClick={() => toast.success("Vendor has been reported. Our team will review this.")}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 hover:text-rose-500 transition-colors"
                  >
                    <Flag className="w-3 h-3" />
                    Report Spam
                  </button>
                  <button 
                    onClick={() => toast.success("Vendor has been blocked. You will not see their services.")}
                    className="flex items-center gap-1.5 text-[10px] font-bold text-zinc-400 hover:text-zinc-800 transition-colors"
                  >
                    <Ban className="w-3 h-3" />
                    Block Vendor
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      , document.body)}
    </>
  );
}
