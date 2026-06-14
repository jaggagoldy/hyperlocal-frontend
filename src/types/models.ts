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

export type BusinessType =
  | 'FOOD_BEVERAGE'
  | 'SALON_BEAUTY'
  | 'DOCTOR_CLINIC'
  | 'TUTOR_ACADEMY'
  | 'HOME_SERVICES'
  | 'REPAIRS_SERVICES'
  | 'RETAIL'
  | 'HOME_ESSENTIALS'
  | 'CAB_TRANSPORT'
  | string; // allow backend to pass new types without breaking the client

export interface BusinessProfile {
  id: string;
  businessName: string;
  slug: string;
  businessType: BusinessType;
  localityName: string;
  chowkLandmark?: string;
  landmark?: string;
  pincode: string;
  status: string;
  membershipTier: string;
  rating: number;
  isOnline: boolean;
  isStreetVendor: boolean;
  isFeatured?: boolean;
  idVerified?: boolean;
  themeFlavor?: string;
  phoneNumber?: string;
  description?: string;
  openingTime?: string;
  closingTime?: string;
  timeAvailability?: string;
  workingDays?: string;
  operatingHours?: Record<string, { open: string; close: string }> | null;
  latitude?: number;
  longitude?: number;
  metaData?: Record<string, any>; // Flexible configuration store
  city?: City;
  media?: Media[];
  reviews?: Review[];
  categories?: { category: Category }[];
  catalogItems?: CatalogItem[];
  catalog?: any[]; // Injected by WorkspaceBuilder for live preview
  user?: { phoneNumber?: string; name?: string };
  connectionMode?: 'DIRECT' | 'REQUIRE_APPROVAL'; // Matchmaking Engine — Phase 1
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
  businessProfileId?: string;
  categoryId: string;
  title: string;
  description?: string;
  price?: number;
  unit?: string;
  mediaUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  category?: Category;
  vendor?: any;
  variants?: { id: string; name: string; priceAdd: number }[] | null;
  metaData?: Record<string, any>;
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
