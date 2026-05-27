'use client';

import { useEffect, useState, useCallback } from 'react';
import { Search, MapPin, X } from 'lucide-react';
import { useSearchStore } from '@/store/searchStore';
import { useDebounce } from '@/hooks/useDebounce';
import { VendorCard } from '@/components/shared/VendorCard';
import apiClient from '@/lib/api-client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

const CATEGORIES = [
  { id: 'electrician', label: 'Electrician', icon: '⚡' },
  { id: 'plumber', label: 'Plumber', icon: '🚰' },
  { id: 'ac-repair', label: 'AC Repair', icon: '❄️' },
  { id: 'carpenter', label: 'Carpenter', icon: '🔨' },
  { id: 'ro-repair', label: 'RO Repair', icon: '💧' },
  { id: 'painter', label: 'Painter', icon: '🎨' },
];

import { Vendor } from '@/types/models';

export default function ExplorePage() {
  const { selectedCity, selectedCategory, searchQuery, page, setCity, setCategory, setSearchQuery, setPage } = useSearchStore();
  const [localQuery, setLocalQuery] = useState(searchQuery);
  const debouncedQuery = useDebounce(localQuery, 500);
  
  const [vendors, setVendors] = useState<Vendor[]>([]);
  const [loading, setLoading] = useState(true);
  const [hasMore, setHasMore] = useState(false);

  useEffect(() => {
    setSearchQuery(debouncedQuery);
  }, [debouncedQuery, setSearchQuery]);

  const fetchVendors = useCallback(async (reset = false) => {
    try {
      setLoading(true);
      const res = await apiClient.get(`/search/explore/${selectedCity}/${selectedCategory}`, {
        params: { query: debouncedQuery, page: reset ? 1 : page, limit: 10 }
      });
      
      const newVendors = res.data?.data || [];
      setVendors(prev => reset ? newVendors : [...prev, ...newVendors]);
      setHasMore(newVendors.length === 10);
    } catch (error) {
      console.error('Failed to fetch vendors', error);
      if (reset) setVendors([]);
    } finally {
      setLoading(false);
    }
  }, [selectedCity, selectedCategory, debouncedQuery, page]);

  // Refetch when filters change
  useEffect(() => {
    fetchVendors(true);
  }, [selectedCity, selectedCategory, debouncedQuery, fetchVendors]);

  // Load more trigger
  useEffect(() => {
    if (page > 1) fetchVendors(false);
  }, [page, fetchVendors]);

  return (
    <div className="flex flex-col min-h-screen bg-background pb-24">
      {/* Sticky Header */}
      <header className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3 space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5 text-primary font-semibold">
            <MapPin className="w-5 h-5" />
            <select 
              className="bg-transparent outline-none appearance-none font-bold text-lg"
              value={selectedCity}
              onChange={(e) => setCity(e.target.value)}
            >
              <option value="dadri">Dadri</option>
              <option value="noida">Noida</option>
            </select>
          </div>
        </div>

        {/* Search Input */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input 
            type="text"
            placeholder="Search locality or pincode..."
            className="h-12 pl-10 pr-10 text-base rounded-xl bg-muted/50 border-transparent focus-visible:ring-1 focus-visible:ring-primary focus-visible:bg-background"
            value={localQuery}
            onChange={(e) => setLocalQuery(e.target.value)}
          />
          {localQuery && (
            <button 
              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground p-1"
              onClick={() => setLocalQuery('')}
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>

        {/* Category Carousel */}
        <div className="flex overflow-x-auto gap-3 pb-1 hide-scrollbar -mx-4 px-4">
          {CATEGORIES.map(cat => (
            <button
              key={cat.id}
              onClick={() => setCategory(cat.id)}
              className={`flex flex-col items-center flex-shrink-0 gap-1.5 p-2 rounded-xl transition-colors min-w-[72px]
                ${selectedCategory === cat.id ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted'}`}
            >
              <span className="text-2xl">{cat.icon}</span>
              <span className="text-[11px] font-medium">{cat.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 flex flex-col gap-4">
        {loading && page === 1 ? (
          // Skeleton Loading
          [...Array(4)].map((_, i) => (
            <div key={i} className="bg-card border border-border rounded-xl p-4 shadow-sm h-36 animate-pulse flex flex-col gap-3">
              <div className="h-6 bg-muted rounded w-3/4"></div>
              <div className="h-4 bg-muted rounded w-1/2"></div>
              <div className="mt-auto flex gap-3">
                <div className="h-12 bg-muted rounded flex-1"></div>
                <div className="h-12 bg-muted rounded flex-1"></div>
              </div>
            </div>
          ))
        ) : vendors.length === 0 ? (
          // Empty State
          <div className="flex flex-col items-center justify-center py-20 text-center px-4">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
              <Search className="w-8 h-8 text-muted-foreground" />
            </div>
            <h3 className="text-xl font-bold mb-2">No Vendors Found</h3>
            <p className="text-muted-foreground text-sm">
              We couldn't find any {CATEGORIES.find(c => c.id === selectedCategory)?.label} near you. Try a different locality.
            </p>
          </div>
        ) : (
          // Vendor List
          <>
            {vendors.map((vendor, i) => (
              <VendorCard key={`${vendor.id}-${i}`} vendor={vendor} />
            ))}
            
            {/* Load More */}
            {hasMore && (
              <Button 
                variant="outline" 
                className="w-full h-12 mt-2 font-semibold" 
                onClick={() => setPage(page + 1)}
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More'}
              </Button>
            )}
          </>
        )}
      </main>

      <style jsx global>{`
        .hide-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .hide-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  );
}
