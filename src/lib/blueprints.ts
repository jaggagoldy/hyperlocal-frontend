export type ModuleConfig = {
  commerce: boolean;
  scheduling: boolean;
  leadGen: boolean;
  estimation: boolean;
};

/**
 * Maps business archetypes/categories to their underlying Capability Blueprint.
 * This determines which tabs render in the vendor dashboard and which CTA renders for consumers.
 */
export const getBlueprintForArchetype = (archetype: string): ModuleConfig => {
  // Normalize string for safety
  const type = archetype?.toUpperCase() || 'DEFAULT';

  switch (type) {
    case 'FOOD_BEVERAGE':
    case 'RESTAURANT':
    case 'RETAIL':
    case 'GROCERY':
    case 'FOOD':
    case 'CAFE':
    case 'RESTAURANT_CAFE':
    case 'RESTAURANT / CAFE':
      return { commerce: true, scheduling: false, leadGen: false, estimation: false };
      
    case 'SERVICE_BOOKING':
    case 'DOCTOR':
    case 'SALON_BEAUTY':
    case 'GYM':
    case 'TUTOR':
      return { commerce: false, scheduling: true, leadGen: false, estimation: false };
      
    case 'SERVICE_LEADGEN':
    case 'REAL_ESTATE':
    case 'INFLUENCER':
    case 'PG_HOSTEL':
    case 'HOME_ESSENTIALS':
    case 'REPAIR_SERVICE':
    case 'PLUMBER':
    case 'ELECTRICIAN':
      return { commerce: false, scheduling: false, leadGen: true, estimation: true };
      
    default:
      // A safe default fallback: basic catalog and enquiry form
      return { commerce: false, scheduling: false, leadGen: true, estimation: false };
  }
};
