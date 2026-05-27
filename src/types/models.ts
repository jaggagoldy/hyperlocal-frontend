export interface City {
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
