import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface EnquiryRecord {
  catalogItemId: string;
  timestamp: number;
  title: string;
  vendorName: string;
  mediaUrl?: string | null;
}

interface EnquiryStore {
  enquiries: EnquiryRecord[];
  recordEnquiry: (catalogItemId: string, metadata: { title: string, vendorName: string, mediaUrl?: string | null }) => void;
  canEnquire: (catalogItemId: string) => boolean;
}

const COOLDOWN_MS = 12 * 60 * 60 * 1000; // 12 hours

export const useEnquiryStore = create<EnquiryStore>()(
  persist(
    (set, get) => ({
      enquiries: [],
      
      recordEnquiry: (catalogItemId, metadata) => {
        set((state) => {
          // Remove old records for this item
          const filtered = state.enquiries.filter((e) => e.catalogItemId !== catalogItemId);
          return {
            enquiries: [
              { catalogItemId, timestamp: Date.now(), ...metadata },
              ...filtered
            ]
          };
        });
      },

      canEnquire: (catalogItemId) => {
        const { enquiries } = get();
        const record = enquiries.find((e) => e.catalogItemId === catalogItemId);
        if (!record) return true;
        
        const timePassed = Date.now() - record.timestamp;
        return timePassed > COOLDOWN_MS;
      }
    }),
    {
      name: 'hyperlocal-enquiries',
    }
  )
);
