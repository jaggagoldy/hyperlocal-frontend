import { useLanguageStore } from '@/store/languageStore';

export const TRANSLATIONS = {
  en: {
    // Navbar
    explore: 'Explore',
    profile: 'Profile',
    logout: 'Logout',
    login: 'Login',
    register: 'Register',
    customerMode: 'Customer Mode',
    proMode: 'Pro Mode',

    // Hero Section
    heroTitle: 'Support Local Businesses, Connect with Verified Pros',
    heroSubtitle: 'Direct connection with trusted local vendors and rentals in Haryana — Zero Brokerage, Zero Commission.',
    searchPlaceholder: 'Search services, car rentals, or shops...',
    popularCities: 'Popular Cities',

    // Verticals
    verticalsTitle: 'Browse Marketplace Categories',
    verticalsSubtitle: 'Choose from daily services, rentals, salons, or real estate',
    homeMaintenance: 'Home Maintenance',
    applianceRepair: 'Appliance Repair',
    carRental: 'Car & Travel',
    salonBooking: 'Salon & Beauty',
    realEstate: 'Real Estate',
    allServices: 'All Services',
    moreServices: 'More Categories',

    // Category Translations
    electrician: 'Electrician',
    plumber: 'Plumber',
    carpenter: 'Carpenter',
    painter: 'Painter',
    'ac-repair': 'AC Repair',
    'ro-repair': 'RO Repair',
    'car-rental-sub': 'Car Rental',
    'salon-booking-sub': 'Salon Booking',
    'real-estate-sub': 'Real Estate',

    // RFQ Form
    rfqTitle: 'What are you looking for?',
    rfqSubtitle: 'Post your requirement and get connected directly with local pros.',
    rfqPlaceholder: 'e.g., Need self-drive Scorpio for wedding, AC deep cleaning, rent shop in Fatehabad',
    rfqCategory: 'Select Category',
    rfqPhone: 'Phone Number',
    rfqLocation: 'Your Area / Locality',
    rfqSubmit: 'Post Requirement Now',
    rfqSuccess: 'Requirement posted successfully! Local pros will contact you shortly.',

    // Verified Pros section
    topRatedTitle: 'Verified Professionals in Your District',
    topRatedSubtitle: 'Handpicked, identity-verified service providers with high customer ratings.',
    verified: 'Verified',
    rating: 'Rating',
    bookPro: 'Direct Enquiry',

    // Value Prop Card
    valueTitle: 'Why Choose HyperLocal?',
    value1Title: 'Direct Connection',
    value1Desc: 'Connect with local vendors directly via WhatsApp or Phone Call.',
    value2Title: 'Zero Commission Fees',
    value2Desc: 'No high fees for small businesses. Keep 100% of what you earn.',
    value3Title: 'Haryana Focused',
    value3Desc: 'Custom-built for hometowns like Fatehabad, Hisar, Sirsa, and Gurgaon.',

    // Explore / Grid
    showingResults: 'Showing {count} results in {city}',
    noResults: 'No Items Found',
    noResultsDesc: "We couldn't find any results matching your search criteria.",
    comingSoonTitle: 'We are Coming Soon to {city}! 🚀',
    comingSoonDesc: 'HyperLocal is currently expanding. We are onboarding verified professionals in your area. We will be live here very soon!',
    getNotified: 'Get Notified When Live',
    getNotifiedDesc: 'Leave your contact info and be the first to know.',
    notifyMe: 'Notify Me',
    forPros: 'Earn with HyperLocal',
    areYouPro: 'Are you a Local Service Pro?',
    proDesc: 'Get leads directly from customers. Create your catalog, verify identity, and boost business.',
    joinProToday: 'Join as a Pro Today',
    loadMore: 'Load More Services',
    price: 'Price',

    // Vendor Dashboard
    dashboard: 'Dashboard',
    leads: 'Leads',
    services: 'Services',
    analytics: 'Analytics',
    settings: 'Settings',
  },
  hi: {
    // Navbar
    explore: 'खोजें',
    profile: 'प्रोफ़ाइल',
    logout: 'लॉगआउट',
    login: 'लॉगिन',
    register: 'रजिस्टर',
    customerMode: 'ग्राहक मोड',
    proMode: 'प्रो मोड',

    // Hero Section
    heroTitle: 'स्थानीय व्यवसायों का समर्थन करें, सत्यापित पेशेवरों से जुड़ें',
    heroSubtitle: 'हरियाणा में स्थानीय वेंडर्स और ग्राहकों को सीधे जोड़ें — जीरो ब्रोकरेज, कोई कमीशन नहीं।',
    searchPlaceholder: 'सेवाएं, कार किराए पर, या दुकानों की खोज करें...',
    popularCities: 'लोकप्रिय शहर',

    // Verticals
    verticalsTitle: 'मार्केटप्लेस श्रेणियों को देखें',
    verticalsSubtitle: 'दैनिक सेवाओं, किराये, सैलून या रियल एस्टेट में से चुनें',
    homeMaintenance: 'घर की मरम्मत',
    applianceRepair: 'बिजली के उपकरण',
    carRental: 'कार और यात्रा',
    salonBooking: 'सैलून और सौंदर्य',
    realEstate: 'संपत्ति और डीलर',
    allServices: 'सभी सेवाएँ',
    moreServices: 'अन्य श्रेणियां',

    // Category Translations
    electrician: 'बिजली मिस्त्री (इलेक्ट्रीशियन)',
    plumber: 'नलसाज (प्लंबर)',
    carpenter: 'बढ़ई (कारपेंटर)',
    painter: 'चित्रकार (पेंटर)',
    'ac-repair': 'एसी रिपेयर',
    'ro-repair': 'आर ओ रिपेयर',
    'car-rental-sub': 'कार किराये पर',
    'salon-booking-sub': 'सैलून बुकिंग',
    'real-estate-sub': 'संपत्ति / दुकान रेंट',

    // RFQ Form
    rfqTitle: 'आपको क्या चाहिए?',
    rfqSubtitle: 'अपनी आवश्यकता पोस्ट करें और सीधे स्थानीय पेशेवरों से जुड़ें।',
    rfqPlaceholder: 'उदा. शादी के लिए स्कॉर्पियो चाहिए, एसी डीप क्लीनिंग, फतेहाबाद में दुकान किराये पर चाहिए',
    rfqCategory: 'श्रेणी चुनें',
    rfqPhone: 'फोन नंबर',
    rfqLocation: 'आपका क्षेत्र / मोहल्ला',
    rfqSubmit: 'आवश्यकता पोस्ट करें',
    rfqSuccess: 'आवश्यकता सफलतापूर्वक पोस्ट हो गई! स्थानीय प्रो आपसे जल्द संपर्क करेंगे।',

    // Verified Pros section
    topRatedTitle: 'आपके जिले में सत्यापित पेशेवर',
    topRatedSubtitle: 'उच्च ग्राहक रेटिंग वाले चुनिंदा, पहचान-सत्यापित सेवा प्रदाता।',
    verified: 'सत्यापित',
    rating: 'रेटिंग',
    bookPro: 'सीधी पूछताछ',

    // Value Prop Card
    valueTitle: 'हाइपरलोकल क्यों चुनें?',
    value1Title: 'सीधा संपर्क',
    value1Desc: 'व्हाट्सएप या फोन कॉल के जरिए सीधे स्थानीय वेंडर्स से संपर्क करें।',
    value2Title: 'कोई कमीशन फीस नहीं',
    value2Desc: 'छोटे व्यवसायों के लिए कोई भारी फीस नहीं। जो कमाएं, 100% अपना रखें।',
    value3Title: 'हरियाणा पर केंद्रित',
    value3Desc: 'फतेहाबाद, हिसार, सिरसा और गुड़गांव जैसे गृह नगरों के लिए विशेष रूप से निर्मित।',

    // Explore / Grid
    showingResults: '{city} में {count} परिणाम दिख रहे हैं',
    noResults: 'कोई परिणाम नहीं मिला',
    noResultsDesc: 'हमें आपकी खोज के मानदंडों से मेल खाता कोई परिणाम नहीं मिला।',
    comingSoonTitle: 'हम जल्द ही {city} आ रहे हैं! 🚀',
    comingSoonDesc: 'हाइपरलोकल वर्तमान में विस्तार कर रहा है। हम आपके क्षेत्र में सत्यापित पेशेवरों को जोड़ रहे हैं। हम जल्द ही यहां लाइव होंगे!',
    getNotified: 'लाइव होने पर सूचना प्राप्त करें',
    getNotifiedDesc: 'अपनी संपर्क जानकारी छोड़ें और सबसे पहले जानें।',
    notifyMe: 'मुझे सूचित करें',
    forPros: 'हाइपरलोकल से कमाएं',
    areYouPro: 'क्या आप एक स्थानीय सर्विस प्रो हैं?',
    proDesc: 'ग्राहकों से सीधे लीड प्राप्त करें। अपनी कैटलॉग बनाएं, पहचान सत्यापित करें और व्यवसाय बढ़ाएं।',
    joinProToday: 'आज ही प्रो के रूप में जुड़ें',
    loadMore: 'और सेवाएँ लोड करें',
    price: 'कीमत',

    // Vendor Dashboard (Contextual / Hinglish for Tier 2/3)
    dashboard: 'डैशबोर्ड',
    leads: 'नए काम',
    services: 'आपकी सेवाएँ',
    analytics: 'एनालिटिक्स',
    settings: 'सेटिंग्स',
  }
};

export function useTranslation() {
  const { language } = useLanguageStore();
  
  const t = (key: keyof typeof TRANSLATIONS.en, dynamicValues?: Record<string, string | number>): string => {
    const langDict = TRANSLATIONS[language] || TRANSLATIONS.en;
    let text = langDict[key] || TRANSLATIONS.en[key] || String(key);
    
    if (dynamicValues) {
      Object.entries(dynamicValues).forEach(([k, v]) => {
        text = text.replace(`{${k}}`, String(v));
      });
    }
    
    return text;
  };

  return { t, language };
}
