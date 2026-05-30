'use client';

import { useState } from 'react';
import { useAuthStore } from '@/store/authStore';
import { useRouter } from 'next/navigation';
import apiClient from '@/lib/api-client';
import { CatalogItem } from '@/types/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer';
import { toast } from 'sonner';
import { Loader2 } from 'lucide-react';

interface EnquiryDrawerProps {
  item: CatalogItem;
  vendorName: string;
}

export function EnquiryDrawer({ item, vendorName }: EnquiryDrawerProps) {
  const { user } = useAuthStore();
  const router = useRouter();
  
  const [isOpen, setIsOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [name, setName] = useState(user?.name || '');
  const [phone, setPhone] = useState(user?.phoneNumber || '');
  const [requirement, setRequirement] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) {
      toast.error('Name and Phone are required');
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

      toast.success('Inquiry sent! The vendor has been alerted via WhatsApp.');
      setIsOpen(false);
      setRequirement('');
    } catch (error: any) {
      console.error(error);
      const errData = error.response?.data;
      if (errData?.code === 'PHONE_NOT_VERIFIED') {
        toast.error('Verification Required: Please verify your phone number to continue.', {
          action: {
            label: 'Verify Now',
            onClick: () => router.push('/profile/edit')
          },
          duration: 10000
        });
        setIsOpen(false);
      } else if (error.response?.status === 401) {
        toast.error('Please log in to send an inquiry.');
      } else {
        toast.error(errData?.message || 'Failed to send inquiry');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Drawer open={isOpen} onOpenChange={setIsOpen}>
      <DrawerTrigger asChild>
        <Button className="w-full">Enquire Now</Button>
      </DrawerTrigger>
      <DrawerContent>
        <div className="mx-auto w-full max-w-sm">
          <DrawerHeader>
            <DrawerTitle>Enquire about {item.title}</DrawerTitle>
            <DrawerDescription>
              Your request will be sent directly to {vendorName}. They will contact you shortly.
            </DrawerDescription>
          </DrawerHeader>
          <form onSubmit={handleSubmit} className="p-4 pb-0 space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Your Name *</Label>
              <Input 
                id="name" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                placeholder="e.g. Rahul Sharma" 
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="phone">Mobile Number *</Label>
              <Input 
                id="phone" 
                value={phone} 
                onChange={(e) => setPhone(e.target.value)} 
                placeholder="e.g. 9876543210" 
                required
                maxLength={10}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="requirement">Any specific requirements?</Label>
              <Textarea 
                id="requirement" 
                value={requirement} 
                onChange={(e) => setRequirement(e.target.value)} 
                placeholder="e.g. Need it done by Sunday morning..." 
              />
            </div>

            <Button type="submit" className="w-full mt-4" disabled={isSubmitting}>
              {isSubmitting ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending...</>
              ) : 'Send Inquiry'}
            </Button>
          </form>
          <DrawerFooter>
            <DrawerClose asChild>
              <Button variant="outline">Cancel</Button>
            </DrawerClose>
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
}
