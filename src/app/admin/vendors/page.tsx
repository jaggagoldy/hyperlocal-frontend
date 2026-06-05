'use client';

import { useEffect, useState } from 'react';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import apiClient from '@/lib/api-client';

import { BusinessProfile } from '@/types/models';

export default function VendorModerationPage() {
  const [vendors, setVendors] = useState<BusinessProfile[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchVendors = async () => {
    try {
      const res = await apiClient.get('/admin/vendors');
      setVendors(res.data?.data || []);
    } catch (err) {
      console.error(err);
      toast.error('Failed to load vendors');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleUpdate = async (id: string, field: string, value: string) => {
    try {
      await apiClient.patch(`/admin/vendors/${id}`, { [field]: value });
      toast.success(`Vendor ${field} updated`);
      setVendors(prev => prev.map(v => v.id === id ? { ...v, [field]: value } : v));
    } catch (error) {
      toast.error(`Failed to update ${field}`);
    }
  };

  if (loading) return (
    <div className="p-8 flex justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Vendor Moderation</h1>
        <p className="text-muted-foreground mt-1">Manage vendor tiers and platform status.</p>
      </div>

      <div className="border border-border rounded-lg bg-card overflow-x-auto shadow-sm">
        <Table className="min-w-[600px]">
          <TableHeader>
            <TableRow>
              <TableHead>Business Name</TableHead>
              <TableHead>City</TableHead>
              <TableHead>Membership Tier</TableHead>
              <TableHead>Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {vendors.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-12 text-muted-foreground">
                  No vendors found on the platform.
                </TableCell>
              </TableRow>
            ) : (
              vendors.map((vendor) => (
                <TableRow key={vendor.id}>
                  <TableCell className="font-medium">{vendor.businessName}</TableCell>
                  <TableCell className="capitalize">{vendor.city?.name || vendor.localityName || 'Unknown'}</TableCell>
                  <TableCell>
                    <Select 
                      defaultValue={vendor.membershipTier} 
                      onValueChange={(val) => handleUpdate(vendor.id, 'membershipTier', val as string)}
                    >
                      <SelectTrigger className="w-[120px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Free">Free</SelectItem>
                        <SelectItem value="Starter">Starter</SelectItem>
                        <SelectItem value="Pro">Pro</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                  <TableCell>
                    <Select 
                      defaultValue={vendor.status} 
                      onValueChange={(val) => handleUpdate(vendor.id, 'status', val as string)}
                    >
                      <SelectTrigger className="w-[130px] h-9">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="available">Active</SelectItem>
                        <SelectItem value="suspended">Suspended</SelectItem>
                        <SelectItem value="closed">Rejected</SelectItem>
                      </SelectContent>
                    </Select>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
