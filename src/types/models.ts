export interface City {
  id: string;
  name: string;
  slug: string;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
}

export interface Review {
  id: string;
  rating: number;
  content: string;
  authorName: string;
  createdAt: string;
}

export interface Media {
  id: string;
  type: string; // 'shop_photo', 'rate_card', 'verification_doc'
  secureUrl: string;
}

export interface Vendor {
  id: string;
  businessName: string;
  slug: string;
  localityName: string;
  chowkLandmark?: string;
  pincode: string;
  status: string;
  membershipTier: string;
  rating: number;
  phoneNumber?: string;
  description?: string;
  openingTime?: string;
  closingTime?: string;
  city?: City;
  media?: Media[];
  reviews?: Review[];
}

export interface DashboardMetrics {
  totalVendors: number;
  profileViews: number;
  callClicks: number;
  whatsappClicks: number;
}

export interface SearchDeficit {
  citySlug: string;
  categorySlug: string;
  query: string | null;
  failedCount: number;
}

export interface CatalogItem {
  id: string;
  vendorId: string;
  categoryId: string;
  title: string;
  description?: string;
  price?: number;
  mediaUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  vendor?: any;
}

export interface Lead {
  id: string;
  catalogItemId: string;
  vendorId: string;
  customerName: string;
  customerPhone: string;
  customerRequirement?: string;
  status: 'NEW' | 'CONTACTED' | 'CONVERTED' | 'REJECTED';
  createdAt: string;
  updatedAt: string;
  catalogItem?: {
    title: string;
    price?: number;
  };
}
