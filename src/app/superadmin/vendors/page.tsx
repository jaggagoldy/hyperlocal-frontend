'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';

export default function VendorsPage() {
  const [vendors, setVendors] = useState<any[]>([]);

  const fetchVendors = async () => {

    try {
      const res = await apiClient.get('/superadmin/vendors');
      const data = res.data;
      if (data.status === 'success') {
        setVendors(data.data);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleToggleVerified = async (id: string, currentStatus: boolean) => {

    try {
      await apiClient.patch(`/superadmin/vendors/${id}/verify`, { idVerified: !currentStatus });
      fetchVendors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleFeatured = async (id: string, currentStatus: boolean) => {

    try {
      await apiClient.patch(`/superadmin/vendors/${id}/feature`, { isFeatured: !currentStatus });
      fetchVendors();
    } catch (err) {
      console.error(err);
    }
  };

  const handleSuspend = async (id: string, currentStatus: string) => {

    const newStatus = currentStatus === 'suspended' ? 'available' : 'suspended';

    try {
      await apiClient.patch(`/superadmin/vendors/${id}/suspend`, { status: newStatus });
      fetchVendors();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Vendors (KYC & Ads)</h1>
        <p className="text-gray-500 mt-2">Manage vendor verification, suspension, and featured placements.</p>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Business</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">KYC</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Featured</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {vendors.map((vendor) => (
              <tr key={vendor.id}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{vendor.businessName}</div>
                  <div className="text-sm text-gray-500">{vendor.localityName}, {vendor.pincode}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{vendor.user?.phoneNumber || 'N/A'}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vendor.status === 'suspended' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'}`}>
                    {vendor.status}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${vendor.idVerified ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                    {vendor.idVerified ? 'Verified' : 'Pending'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  {vendor.isFeatured ? (
                    <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                      Featured
                    </span>
                  ) : (
                    <span className="text-sm text-gray-500">-</span>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                  <button
                    onClick={() => handleToggleVerified(vendor.id, vendor.idVerified)}
                    className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded"
                  >
                    Toggle KYC
                  </button>
                  <button
                    onClick={() => handleToggleFeatured(vendor.id, vendor.isFeatured)}
                    className="text-blue-600 hover:text-blue-900 bg-blue-50 px-2 py-1 rounded"
                  >
                    Toggle Ad
                  </button>
                  <button
                    onClick={() => handleSuspend(vendor.id, vendor.status)}
                    className="text-red-600 hover:text-red-900 bg-red-50 px-2 py-1 rounded"
                  >
                    {vendor.status === 'suspended' ? 'Unsuspend' : 'Suspend'}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
