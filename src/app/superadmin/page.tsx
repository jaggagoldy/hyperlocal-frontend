'use client';

import { useEffect, useState } from 'react';
import apiClient from '@/lib/api-client';

export default function SuperadminDashboard() {
  const [metrics, setMetrics] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, analyticsRes] = await Promise.all([
          apiClient.get('/superadmin/metrics'),
          apiClient.get('/superadmin/analytics/categories')
        ]);

        const metricsData = metricsRes.data;
        const analyticsData = analyticsRes.data;

        if (metricsData.status === 'success') setMetrics(metricsData.data);
        if (analyticsData.status === 'success') setAnalytics(analyticsData.data);
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      }
    };

    fetchData();
  }, []);

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-500 mt-2">High-level metrics and platform health.</p>
      </div>

      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Total Active Vendors</h3>
            <p className="text-4xl font-bold text-slate-900 mt-2">{metrics.activeVendors}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Total Consumers</h3>
            <p className="text-4xl font-bold text-slate-900 mt-2">{metrics.totalConsumers}</p>
          </div>
          <div className="bg-white p-6 rounded-lg shadow border border-gray-200">
            <h3 className="text-sm font-medium text-gray-500 uppercase">Leads This Week</h3>
            <p className="text-4xl font-bold text-green-600 mt-2">{metrics.leadsThisWeek}</p>
          </div>
        </div>
      )}

      {analytics && (
        <div>
          <h2 className="text-2xl font-bold text-gray-900 mb-4">Category Performance</h2>
          <div className="bg-white rounded-lg shadow overflow-hidden border border-gray-200">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Registered Vendors</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Catalog Items</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {analytics.categories.map((cat: any) => (
                  <tr key={cat.id}>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{cat.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat._count?.vendors || 0}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{cat._count?.catalogItems || 0}</td>
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
