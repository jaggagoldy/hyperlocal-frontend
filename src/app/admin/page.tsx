'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import apiClient from '@/lib/api-client';
import { SearchDeficitList } from '@/components/admin/SearchDeficitList';
import { Users, Eye, PhoneCall, MessageCircle } from 'lucide-react';

import { DashboardMetrics } from '@/types/models';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const res = await apiClient.get('/admin/metrics/dashboard');
        setMetrics(res.data?.data || { totalVendors: 0, profileViews: 0, callClicks: 0, whatsappClicks: 0 });
      } catch (err) {
        console.error(err);
        setMetrics({ totalVendors: 0, profileViews: 0, callClicks: 0, whatsappClicks: 0 });
      } finally {
        setLoading(false);
      }
    };
    fetchMetrics();
  }, []);

  if (loading) return (
    <div className="p-8 flex justify-center">
      <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
    </div>
  );

  if (!metrics) return (
    <div className="p-8 flex justify-center text-muted-foreground">
      Failed to load dashboard metrics.
    </div>
  );

  const cards = [
    { title: 'Total Vendors', value: metrics.totalVendors, icon: Users, color: 'text-blue-500' },
    { title: 'Profile Views', value: metrics.profileViews, icon: Eye, color: 'text-purple-500' },
    { title: 'Call Clicks', value: metrics.callClicks, icon: PhoneCall, color: 'text-green-500' },
    { title: 'WhatsApp Clicks', value: metrics.whatsappClicks, icon: MessageCircle, color: 'text-emerald-500' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Metrics Dashboard</h1>
        <p className="text-muted-foreground mt-1 text-sm md:text-base">Platform overview and hyper-local search intelligence.</p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-4">
        {cards.map((card, i) => (
          <Card key={i} className="border-border shadow-sm">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs md:text-sm font-medium">{card.title}</CardTitle>
              <card.icon className={`h-4 w-4 md:h-5 md:w-5 ${card.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-xl md:text-2xl font-bold">{card.value.toLocaleString()}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid gap-4 grid-cols-1 md:grid-cols-2 lg:grid-cols-7">
        <div className="lg:col-span-4">
          <SearchDeficitList />
        </div>
      </div>
    </div>
  );
}
