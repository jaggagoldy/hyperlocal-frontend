'use client';

import { useEffect, useState } from 'react';
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card';
import apiClient from '@/lib/api-client';
import { AlertCircle } from 'lucide-react';

import { SearchDeficit } from '@/types/models';

export function SearchDeficitList() {
  const [deficits, setDeficits] = useState<SearchDeficit[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchDeficits = async () => {
      try {
        const res = await apiClient.get('/admin/metrics/search-deficits');
        setDeficits(res.data?.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchDeficits();
  }, []);

  return (
    <Card className="shadow-sm border-border">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <AlertCircle className="w-5 h-5 text-orange-500" />
          Search Deficit Engine
        </CardTitle>
        <CardDescription>
          Queries returning zero results. Grouped by neighborhood & category. Use this to recruit new vendors where demand exceeds supply.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="text-sm text-muted-foreground animate-pulse">Loading deficit intelligence...</div>
        ) : deficits.length === 0 ? (
          <div className="text-sm text-muted-foreground bg-muted/30 p-6 rounded-lg text-center font-medium">
            No search deficits found! Supply is fully meeting demand.
          </div>
        ) : (
          <ul className="space-y-3">
            {deficits.map((item, i) => (
              <li key={i} className="flex justify-between items-center p-3 sm:p-4 border border-border rounded-lg bg-background shadow-sm hover:shadow-md transition-shadow">
                <div>
                  <div className="font-bold text-sm sm:text-base capitalize">
                    {item.citySlug} - {item.categorySlug}
                  </div>
                  {item.query && <div className="text-xs sm:text-sm text-muted-foreground mt-0.5">Query: "{item.query}"</div>}
                </div>
                <div className="bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 font-bold px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap ml-2">
                  {item.failedCount} missed
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}
