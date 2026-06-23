/**
 * CATEGORY_TAXONOMY_SCHEMA defines the specific tags and expertise filters
 * that apply to different business categories.
 * This powers the 'Expertise & Tags' tab in the dynamic Workspace Builder.
 */

export interface TaxonomyField {
  id: string;
  label: string;
  type: 'single_select' | 'multi_select' | 'boolean';
  options: string[];
}

export const CATEGORY_TAXONOMY_SCHEMA: Record<string, TaxonomyField[]> = {
  'restaurant-cafe': [
    { id: 'cuisines', label: 'Cuisine Types', type: 'multi_select', options: ['North Indian', 'South Indian', 'Chinese', 'Italian', 'Continental', 'Fast Food', 'Beverages', 'Desserts'] },
    { id: 'dietary', label: 'Dietary', type: 'multi_select', options: ['Pure Veg', 'Non Veg', 'Vegan', 'Jain Options'] },
    { id: 'facilities', label: 'Facilities', type: 'multi_select', options: ['Dine-In', 'Takeaway', 'AC Seating', 'Outdoor Seating'] }
  ],
  'retail-grocery': [
    { id: 'product_types', label: 'Product Categories', type: 'multi_select', options: ['Fresh Produce', 'Dairy & Bakery', 'Snacks & Beverages', 'Personal Care', 'Home Essentials'] },
    { id: 'delivery', label: 'Delivery Options', type: 'multi_select', options: ['Click & Collect', 'Home Delivery'] }
  ],
  'salon-beauty': [
    { id: 'gender', label: 'Caters To', type: 'single_select', options: ['Unisex', 'Female Only', 'Male Only'] },
    { id: 'expertise', label: 'Services Offered', type: 'multi_select', options: ['Haircut & Styling', 'Coloring', 'Facial & Skin', 'Manicure/Pedicure', 'Bridal Makeup', 'Massage'] }
  ],
  'doctors': [
    { id: 'speciality', label: 'Speciality', type: 'multi_select', options: ['Dentist', 'Pediatrician', 'Gynecologist', 'Orthopedic', 'General Physician', 'Dermatologist', 'Cardiologist'] },
    { id: 'consultation', label: 'Consultation Mode', type: 'multi_select', options: ['In-Clinic', 'Video Consult'] }
  ],
  'education': [
    { id: 'subjects', label: 'Subjects Taught', type: 'multi_select', options: ['Maths', 'Science', 'English', 'Physics', 'Chemistry', 'Computer Science'] },
    { id: 'grades', label: 'Classes/Grades', type: 'multi_select', options: ['1st to 5th', '6th to 8th', '9th to 10th', '11th to 12th', 'College/Degree'] },
    { id: 'mode', label: 'Teaching Mode', type: 'multi_select', options: ['Home Tuition', 'Online', 'At Center'] }
  ],
  'home-services': [
    { id: 'services', label: 'Services', type: 'multi_select', options: ['Deep Cleaning', 'Pest Control', 'Sofa Cleaning', 'Bathroom Cleaning', 'Car Wash'] }
  ],
  'repairs-services': [
    { id: 'services', label: 'Repairs & Installations', type: 'multi_select', options: ['AC Repair', 'RO Water Purifier', 'Washing Machine', 'Refrigerator', 'Electrician', 'Plumber', 'Carpenter'] }
  ],
  'wedding-planning': [
    { id: 'services', label: 'Services Provided', type: 'multi_select', options: ['Full Planning', 'Catering', 'Photography', 'Decoration', 'Makeup', 'Entertainment'] }
  ],
  'real-estate': [
    { id: 'property_type', label: 'Property Types', type: 'multi_select', options: ['Residential', 'Commercial', 'Plots/Land', 'PG/Co-living'] },
    { id: 'transaction_type', label: 'Deals In', type: 'multi_select', options: ['Rentals', 'Buy/Sell'] }
  ]
};

export const getTaxonomyForCategory = (categorySlug: string): TaxonomyField[] => {
  let slug = categorySlug || '';
  
  // Normalize category slugs / map aliases
  const foodSlugs = ['restaurant', 'cafe', 'cloud-kitchen', 'street-food', 'bakery', 'mithai', 'tiffin', 'food-dining', 'food-beverage', 'restaurant-cafe'];
  if (foodSlugs.includes(slug)) {
    slug = 'restaurant-cafe';
  }

  const retailSlugs = ['kirana', 'supermarket', 'dairy', 'retail-grocery', 'retail-shop', 'fashion', 'electronics', 'optical', 'gift-shop', 'mobile-electronics', 'apparel', 'footwear', 'jewellery', 'hardware', 'stationery'];
  if (retailSlugs.includes(slug)) {
    slug = 'retail-grocery';
  }

  const salonSlugs = ['haircut', 'massage', 'bridal-makeup', 'nails', 'salon-beauty', 'salon-spa', 'salon', 'salon-booking'];
  if (salonSlugs.includes(slug)) {
    slug = 'salon-beauty';
  }

  const healthSlugs = ['pharmacy', 'general-physician', 'dentist', 'diagnostic-lab', 'hospital', 'vet', 'doctors', 'health-medical', 'doctors-clinics', 'clinic', 'doctor'];
  if (healthSlugs.includes(slug)) {
    slug = 'doctors';
  }

  const repairSlugs = ['ac-repair', 'ro-repair', 'electrician', 'plumber', 'carpenter', 'repairs-services', 'repairs-plumbers'];
  if (repairSlugs.includes(slug)) {
    slug = 'repairs-services';
  }

  const homeSlugs = ['cleaning', 'pest-control', 'home-services'];
  if (homeSlugs.includes(slug)) {
    slug = 'home-services';
  }

  const eduSlugs = ['ca-accountant', 'lawyer', 'insurance-advisor', 'consultant', 'architect', 'it-services', 'education', 'education-tutors', 'tutor'];
  if (eduSlugs.includes(slug)) {
    slug = 'education';
  }

  return CATEGORY_TAXONOMY_SCHEMA[slug] || [];
};
