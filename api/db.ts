import fs from 'fs';
import path from 'path';

export interface UserRecord {
  id: string;
  name: string;
  email: string;
  password?: string;
  role: 'traveler' | 'guide' | 'admin';
  phone?: string;
  avatar?: string;
  createdAt: string;
}

export interface DestinationRecord {
  id: string;
  name: string;
  fullName: string;
  state: string;
  country: string;
  category: 'Pilgrimage' | 'Hill Station' | 'Coastal & Beach' | 'Heritage & Culture' | 'Nature & Wildlife' | 'Adventure';
  badge: string;
  image: string;
  description: string;
  popularAttractions: string[];
  bestSeason: string;
  approxNightBudget: string;
  published: boolean;
  featured: boolean;
}

export interface TourPackageRecord {
  id: string;
  title: string;
  destination: string;
  destinationId: string;
  duration: string;
  days: number;
  nights: number;
  pricePerPerson: number;
  originalPrice?: number;
  category: string;
  coverImage: string;
  highlights: string[];
  inclusions: string[];
  exclusions: string[];
  dayByDayItinerary: { day: number; title: string; desc: string }[];
  providerName: string;
  cancellationPolicy: string;
  published: boolean;
  featured: boolean;
}

export interface LocalGuideRecord {
  id: string;
  name: string;
  serviceLocation: string;
  state: string;
  languages: string[];
  specialties: string[];
  experienceYears: number;
  dailyRate: number;
  hourlyRate?: number;
  avatar: string;
  bio: string;
  verificationStatus: 'verified' | 'pending' | 'rejected';
  verificationDoc?: string;
  rating: number;
  reviewCount: number;
  phone?: string;
  email?: string;
  availability: 'Available Today' | 'Available from Tomorrow' | 'Booking on Request';
}

export interface BookingRecord {
  id: string;
  bookingRef: string;
  packageId?: string;
  packageTitle: string;
  destination: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  travelDate: string;
  adults: number;
  children: number;
  seniors: number;
  totalTravellers: number;
  totalAmount: number;
  specialRequests?: string;
  status: 'confirmed' | 'pending' | 'cancelled';
  createdAt: string;
}

export interface GuideEnquiryRecord {
  id: string;
  enquiryRef: string;
  guideId: string;
  guideName: string;
  senderName: string;
  senderEmail: string;
  senderPhone: string;
  requestedDate: string;
  groupSize: number;
  message: string;
  status: 'pending' | 'replied' | 'closed';
  replyMessage?: string;
  repliedAt?: string;
  createdAt: string;
}

export interface ReviewRecord {
  id: string;
  authorName: string;
  location: string;
  targetType: 'destination' | 'package' | 'guide' | 'platform';
  targetTitle: string;
  rating: number;
  comment: string;
  date: string;
  status: 'approved' | 'pending';
}

export interface ContactTicketRecord {
  id: string;
  ticketRef: string;
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
  status: 'open' | 'resolved';
  createdAt: string;
}

export interface SavedTripRecord {
  id: string;
  userId: string;
  title: string;
  destination: string;
  travelDate: string;
  travellers: number;
  budget: number;
  itinerary: any[];
  notes?: string;
  updatedAt: string;
}

export interface PlatformDb {
  users: UserRecord[];
  destinations: DestinationRecord[];
  packages: TourPackageRecord[];
  guides: LocalGuideRecord[];
  bookings: BookingRecord[];
  guideEnquiries: GuideEnquiryRecord[];
  reviews: ReviewRecord[];
  contactTickets: ContactTicketRecord[];
  savedTrips: SavedTripRecord[];
  auditLogs: { id: string; action: string; actor: string; timestamp: string; details?: string }[];
}

const DB_DIR = path.resolve(process.cwd(), 'api', 'data');
const DB_PATH = path.join(DB_DIR, 'store.json');

// Initial seed data
const INITIAL_DESTINATIONS: DestinationRecord[] = [
  {
    id: 'dest-tirupati',
    name: 'Tirupati',
    fullName: 'Tirupati, Andhra Pradesh',
    state: 'Andhra Pradesh',
    country: 'India',
    category: 'Pilgrimage',
    badge: 'Top Sacred Pilgrimage',
    image: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=1200&q=80',
    description: 'Home of the legendary Lord Sri Venkateswara Swami temple perched high in the sacred Seshachalam Seven Hills.',
    popularAttractions: ['Tirumala Venkateswara Temple', 'Padmavathi Temple', 'Kapila Theertham', 'Chandragiri Fort'],
    bestSeason: 'Sep – Mar',
    approxNightBudget: '₹800 – ₹2,500',
    published: true,
    featured: true,
  },
  {
    id: 'dest-goa',
    name: 'Goa',
    fullName: 'Goa, Coastal Gateway',
    state: 'Goa',
    country: 'India',
    category: 'Coastal & Beach',
    badge: 'Beach & Portuguese Heritage',
    image: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=1200&q=80',
    description: 'Golden palm-fringed coastlines, colonial architecture, vibrant street markets, and tranquil beachside family resorts.',
    popularAttractions: ['Baga Beach', 'Basilica of Bom Jesus', 'Fort Aguada', 'Dudhsagar Falls'],
    bestSeason: 'Nov – Mar',
    approxNightBudget: '₹2,000 – ₹6,500',
    published: true,
    featured: true,
  },
  {
    id: 'dest-jaipur',
    name: 'Jaipur',
    fullName: 'Jaipur, Rajasthan',
    state: 'Rajasthan',
    country: 'India',
    category: 'Heritage & Culture',
    badge: 'Pink City of Palaces',
    image: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=1200&q=80',
    description: 'Majestic desert fortresses, royal Rajput palaces, handloom bazaars, and rich culinary feasts.',
    popularAttractions: ['Amber Palace', 'Hawa Mahal', 'City Palace', 'Nahargarh Fort'],
    bestSeason: 'Oct – Mar',
    approxNightBudget: '₹1,800 – ₹5,000',
    published: true,
    featured: true,
  },
  {
    id: 'dest-manali',
    name: 'Manali',
    fullName: 'Manali, Himachal Pradesh',
    state: 'Himachal Pradesh',
    country: 'India',
    category: 'Hill Station',
    badge: 'Himalayan Snow Valley',
    image: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=1200&q=80',
    description: 'Snow-capped Himalayan peaks, pine forests along the Beas River, thrilling ski slopes, and apple orchards.',
    popularAttractions: ['Solang Valley', 'Rohtang Pass', 'Hadimba Temple', 'Old Manali'],
    bestSeason: 'Mar – Jun & Oct – Feb',
    approxNightBudget: '₹1,500 – ₹4,500',
    published: true,
    featured: true,
  },
  {
    id: 'dest-kerala',
    name: 'Kerala Backwaters & Munnar',
    fullName: 'Alleppey & Munnar, Kerala',
    state: 'Kerala',
    country: 'India',
    category: 'Nature & Wildlife',
    badge: "God's Own Country",
    image: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=1200&q=80',
    description: 'Emerald tea gardens in misty hills, serene backwater houseboat cruises, and authentic Ayurvedic wellness.',
    popularAttractions: ['Alleppey Houseboats', 'Munnar Tea Gardens', 'Eravikulam Park', 'Mattupetty Dam'],
    bestSeason: 'Sep – Mar',
    approxNightBudget: '₹2,200 – ₹6,000',
    published: true,
    featured: true,
  },
  {
    id: 'dest-varanasi',
    name: 'Varanasi',
    fullName: 'Varanasi, Uttar Pradesh',
    state: 'Uttar Pradesh',
    country: 'India',
    category: 'Pilgrimage',
    badge: 'Ancient Spiritual Capital',
    image: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=1200&q=80',
    description: 'World-famous Ganga Aarti at Dashashwamedh Ghat, spiritual sunrise boat rides, and sacred Kashi Vishwanath.',
    popularAttractions: ['Kashi Vishwanath Corridor', 'Dashashwamedh Ghat', 'Sarnath', 'Assi Ghat'],
    bestSeason: 'Oct – Mar',
    approxNightBudget: '₹1,200 – ₹3,500',
    published: true,
    featured: true,
  },
  {
    id: 'dest-ladakh',
    name: 'Leh Ladakh',
    fullName: 'Leh, Ladakh',
    state: 'Ladakh',
    country: 'India',
    category: 'Adventure',
    badge: 'High-Altitude Wonder',
    image: 'https://images.unsplash.com/photo-1581793745862-99fde7fa73d2?auto=format&fit=crop&w=1200&q=80',
    description: 'Surreal crystal lakes, Buddhist monasteries perched on cliffs, and high-altitude mountain passes.',
    popularAttractions: ['Pangong Tso', 'Nubra Valley', 'Khardung La', 'Thiksey Monastery'],
    bestSeason: 'May – Sep',
    approxNightBudget: '₹2,500 – ₹7,000',
    published: true,
    featured: true,
  },
  {
    id: 'dest-ooty',
    name: 'Ooty & Coonoor',
    fullName: 'Ooty, Nilgiris, Tamil Nadu',
    state: 'Tamil Nadu',
    country: 'India',
    category: 'Hill Station',
    badge: 'Queen of Hill Stations',
    image: 'https://images.unsplash.com/photo-1589182373726-e4f658ab50f0?auto=format&fit=crop&w=1200&q=80',
    description: 'UNESCO heritage toy train, blooming rose gardens, panoramic viewpoints, and fragrant Nilgiri tea estates.',
    popularAttractions: ['Nilgiri Mountain Railway', 'Botanical Gardens', 'Doddabetta Peak', 'Pykara Lake'],
    bestSeason: 'Oct – Jun',
    approxNightBudget: '₹1,500 – ₹4,000',
    published: true,
    featured: true,
  },
];

const INITIAL_PACKAGES: TourPackageRecord[] = [
  {
    id: 'pkg-tirupati-darshan',
    title: 'Sacred Tirumala & Chandragiri Family Tour',
    destination: 'Tirupati, Andhra Pradesh',
    destinationId: 'dest-tirupati',
    duration: '3 Days / 2 Nights',
    days: 3,
    nights: 2,
    pricePerPerson: 4850,
    originalPrice: 5900,
    category: 'Pilgrimage',
    coverImage: 'https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80',
    highlights: ['Assured Darshan Guidance', 'AC AC Sedan Transfers', 'Sanitized Family Hotel', 'Chandragiri Sound & Light'],
    inclusions: ['2 Nights Hotel Stay (Twin Sharing)', 'Breakfast & Temple Prasadam Meals', 'AC Cab for Temple Transfers', 'Local Expert Tour Lead'],
    exclusions: ['Train / Flight Tickets to Tirupati', 'Special Entry Darshan Ticket Fees', 'Personal Expenses'],
    dayByDayItinerary: [
      { day: 1, title: 'Arrival & Foothill Exploration', desc: 'Pick up from Tirupati Station. Check in at hotel. Evening visit to Sri Govindaraja Swamy Temple and Alipiri Footstep gateway.' },
      { day: 2, title: 'Sacred Tirumala Temple Darshan', desc: 'Early morning scenic ascent by electric bus or AC cab. Lord Venkateswara Darshan with guide facilitation. Afternoon visit to Papavinasanam and Akasa Ganga.' },
      { day: 3, title: 'Chandragiri Fort & Heritage Farewell', desc: 'Morning visit to Sri Padmavathi Ammavari Temple at Tiruchanur. Afternoon exploration of Vijayanagara Fort at Chandragiri. Station transfer.' },
    ],
    providerName: 'Trip Together Verified Pilgrimage Partner',
    cancellationPolicy: 'Free cancellation up to 48 hours prior to journey. 50% refund within 24–48 hours.',
    published: true,
    featured: true,
  },
  {
    id: 'pkg-goa-coastal',
    title: 'Goa Coastal Sun, Spice & Heritage Retreat',
    destination: 'Goa, India',
    destinationId: 'dest-goa',
    duration: '4 Days / 3 Nights',
    days: 4,
    nights: 3,
    pricePerPerson: 9200,
    originalPrice: 11500,
    category: 'Coastal & Beach',
    coverImage: 'https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?auto=format&fit=crop&w=800&q=80',
    highlights: ['Beachfront Resort Stay', 'Mandovi Sunset Cruise', 'Portuguese Latin Quarter Walk', 'Spice Plantation Lunch'],
    inclusions: ['3 Nights 4-Star Resort with Pool', 'Daily Breakfast Buffet', 'Private AC Vehicle for 4 Days', 'Spice Plantation Tour with Traditional Buffet'],
    exclusions: ['Airfare', 'Water Sports charges', 'Alcoholic beverages'],
    dayByDayItinerary: [
      { day: 1, title: 'Goa Welcome & Sunset Beach Stroll', desc: 'Airport/Station reception and resort check-in. Evening at leisure on Calangute/Candolim beach with beachside sunset.' },
      { day: 2, title: 'Old Goa Churches & Latin Quarter Walk', desc: 'Explore UNESCO Basilica of Bom Jesus, Se Cathedral, followed by a guided architectural walking tour in Fontainhas, Panaji.' },
      { day: 3, title: 'Spice Plantation & Mandovi River Cruise', desc: 'Visit Sahakari Spice Farm for guided spice walk and Goan lunch. Evening 1-hour sunset cruise on Mandovi River with Goan folk performances.' },
      { day: 4, title: 'Fort Aguada & Coastal Souvenirs', desc: 'Morning visit to 17th-century Fort Aguada and lighthouse. Local handicraft shopping before airport drop.' },
    ],
    providerName: 'Goa Horizon Experiences',
    cancellationPolicy: 'Full refund if cancelled 7 days in advance. 70% refund up to 3 days in advance.',
    published: true,
    featured: true,
  },
  {
    id: 'pkg-jaipur-royals',
    title: 'Royal Rajasthan: Forts, Palaces & Bazaars',
    destination: 'Jaipur, Rajasthan',
    destinationId: 'dest-jaipur',
    duration: '4 Days / 3 Nights',
    days: 4,
    nights: 3,
    pricePerPerson: 8400,
    originalPrice: 10200,
    category: 'Heritage & Culture',
    coverImage: 'https://images.unsplash.com/photo-1477587458883-47145ed94245?auto=format&fit=crop&w=800&q=80',
    highlights: ['Amber Fort Guided Exploration', 'Hawa Mahal Photo Walk', 'Chokhi Dhani Cultural Dinner', 'Block Printing Workshop'],
    inclusions: ['3 Nights Heritage Haveli Stay', 'Breakfast & 1 Royal Rajput Dinner', 'Private Sightseeing Cab', 'Certified ASI Guide at Amber Fort'],
    exclusions: ['Monument Entry Tickets', 'Flight or Train travel to Jaipur'],
    dayByDayItinerary: [
      { day: 1, title: 'Arrival & Pink City Heart', desc: 'Check in at heritage stay. Visit Albert Hall Museum and evening shopping in Johari and Bapu Bazaars.' },
      { day: 2, title: 'Amber Fort, Jal Mahal & Nahargarh', desc: 'Ascend Amber Fort for royal palace chambers. Photography stop at Jal Mahal palace on the lake. Sunset at Nahargarh Fort overlooking the city.' },
      { day: 3, title: 'City Palace, Jantar Mantar & Hawa Mahal', desc: 'Detailed tour of royal City Palace and Jantar Mantar observatory. Evening cultural immersion and feast at Chokhi Dhani.' },
      { day: 4, title: 'Jaigarh Fort & Craft Departure', desc: 'Morning visit to Jaigarh Fort to see the world’s largest cannon on wheels. Farewell souvenir shopping and airport transfer.' },
    ],
    providerName: 'Rajputana Heritage Journeys',
    cancellationPolicy: 'Free cancellation up to 5 days prior to arrival.',
    published: true,
    featured: true,
  },
  {
    id: 'pkg-kerala-backwaters',
    title: 'Misty Munnar Tea Hills & Alleppey Houseboat',
    destination: 'Munnar & Alleppey, Kerala',
    destinationId: 'dest-kerala',
    duration: '5 Days / 4 Nights',
    days: 5,
    nights: 4,
    pricePerPerson: 12900,
    originalPrice: 15500,
    category: 'Nature & Wildlife',
    coverImage: 'https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?auto=format&fit=crop&w=800&q=80',
    highlights: ['Private Houseboat Overnight', 'Eravikulam Mountain Park', 'Tea Factory Tasting Tour', 'Cheeyappara Waterfalls'],
    inclusions: ['2 Nights Munnar Hill Resort', '1 Night Thekkady Spice Resort', '1 Night Private AC Houseboat with all meals', 'Dedicated AC Innova/Sedan'],
    exclusions: ['Airfare to Kochi', 'Personal Ayurvedic Spa Treatments'],
    dayByDayItinerary: [
      { day: 1, title: 'Kochi to Munnar Scenic Drive', desc: 'Scenic mountain climb via Valara and Cheeyappara waterfalls. Check in at Munnar hill resort amidst mist.' },
      { day: 2, title: 'Eravikulam & Munnar Tea Trails', desc: 'Visit Eravikulam National Park to spot Nilgiri Tahr. Afternoon tour of tea museum and tea leaf picking experience.' },
      { day: 3, title: 'Munnar to Thekkady Periyar Wildlife', desc: 'Drive through spice hills to Thekkady. Boat safari on Periyar Lake to view elephants and birdlife.' },
      { day: 4, title: 'Alleppey Backwaters Houseboat', desc: 'Board private deluxe houseboat at Alleppey. Cruise tranquil palm canals. Freshly prepared Kerala meals on board.' },
      { day: 5, title: 'Kochi Sightseeing & Drop-off', desc: 'Morning disembarkation, drive to Fort Kochi for Chinese fishing nets, followed by airport drop.' },
    ],
    providerName: 'Kerala Serenity Voyages',
    cancellationPolicy: 'Free cancellation up to 7 days prior to check-in.',
    published: true,
    featured: true,
  },
  {
    id: 'pkg-manali-snow',
    title: 'Manali, Solang Valley & Rohtang Alpine Escape',
    destination: 'Manali, Himachal Pradesh',
    destinationId: 'dest-manali',
    duration: '4 Days / 3 Nights',
    days: 4,
    nights: 3,
    pricePerPerson: 7900,
    originalPrice: 9800,
    category: 'Hill Station',
    coverImage: 'https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?auto=format&fit=crop&w=800&q=80',
    highlights: ['Solang Adventure Sports', 'Atal Tunnel Mountain Drive', 'Old Manali Cafe Crawl', 'Vashisht Hot Sulphur Springs'],
    inclusions: ['3 Nights Mountain View Resort', 'Breakfast and Dinner included', 'Dedicated 4x4 / AC Vehicle', 'Campfire evening with music'],
    exclusions: ['Adventure activities tickets (Paragliding, Skiing)', 'Rohtang Pass green permit fee'],
    dayByDayItinerary: [
      { day: 1, title: 'Arrival & Hadimba Temple Sanctuary', desc: 'Arrive in Manali. Check into valley hotel. Visit cedar-encircled Hadimba Temple, Tibetan Monastery, and Mall Road.' },
      { day: 2, title: 'Solang Valley & Atal Tunnel Marvel', desc: 'Full day adventure at Solang Valley. Drive through the historic 9.02 km Atal Tunnel into Lahaul Valley landscape.' },
      { day: 3, title: 'Naggar Castle & Vashisht Springs', desc: 'Explore 500-year-old Naggar Castle and Roerich art gallery. Relax at natural hot springs of Vashisht village.' },
      { day: 4, title: 'Old Manali Stroll & Departure', desc: 'Explore rustic wooden cafes of Old Manali and buy mountain honey and woollens before departure.' },
    ],
    providerName: 'Himalayan Highs Expeditions',
    cancellationPolicy: 'Free cancellation up to 5 days prior to arrival.',
    published: true,
    featured: true,
  },
  {
    id: 'pkg-varanasi-spirit',
    title: 'Timeless Kashi: Ganga Aarti & Sarnath Pilgrimage',
    destination: 'Varanasi, Uttar Pradesh',
    destinationId: 'dest-varanasi',
    duration: '3 Days / 2 Nights',
    days: 3,
    nights: 2,
    pricePerPerson: 5400,
    originalPrice: 6600,
    category: 'Pilgrimage',
    coverImage: 'https://images.unsplash.com/photo-1561361513-2d000a50f0dc?auto=format&fit=crop&w=800&q=80',
    highlights: ['VIP Boat for Ganga Aarti', 'Sunrise Boat Ride on Ganges', 'Guided Kashi Vishwanath Walk', 'Sarnath Buddhist Stupa'],
    inclusions: ['2 Nights Boutique Hotel near Ghats', 'Daily Vegetarian Breakfast', 'Private Boat for Evening Aarti', 'Knowledgeable Cultural Guide'],
    exclusions: ['Airfare/Train tickets', 'Personal donations and special pooja charges'],
    dayByDayItinerary: [
      { day: 1, title: 'Arrival & Mesmerising Ganga Aarti', desc: 'Airport/Station reception. Check in. Sunset private boat to witness the world-famous Maha Aarti at Dashashwamedh Ghat.' },
      { day: 2, title: 'Subah-e-Banaras & Kashi Corridor', desc: 'Dawn rowing boat past ancient bathing ghats. Visit Kashi Vishwanath Temple, Annapurna Temple, and narrow silk weaving alleys.' },
      { day: 3, title: 'Sarnath Enclave & Heritage Farewell', desc: 'Visit peaceful Sarnath where Lord Buddha preached his first sermon, Dhamek Stupa, and archaeological museum before departure.' },
    ],
    providerName: 'Banaras Sacred Heritage Walks',
    cancellationPolicy: 'Free cancellation up to 3 days before travel.',
    published: true,
    featured: true,
  },
];

const INITIAL_GUIDES: LocalGuideRecord[] = [
  {
    id: 'guide-1',
    name: 'Srinivasa Rao',
    serviceLocation: 'Tirupati & Chandragiri',
    state: 'Andhra Pradesh',
    languages: ['Telugu', 'English', 'Hindi', 'Tamil'],
    specialties: ['Tirumala Temple History', 'Vedic Darshan Protocol', 'Heritage Architecture', 'Senior Citizen Care'],
    experienceYears: 12,
    dailyRate: 1800,
    hourlyRate: 350,
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=400&q=80',
    bio: 'Born in Tirupati foothills with over 12 years guiding families through sacred rituals, darshan slot timing, and Vijayanagara history at Chandragiri Fort.',
    verificationStatus: 'verified',
    rating: 4.9,
    reviewCount: 84,
    phone: '+91 98480 23110',
    email: 'srinivasa.guide@triptogether.com',
    availability: 'Available Today',
  },
  {
    id: 'guide-2',
    name: 'Maria Fernandes',
    serviceLocation: 'North & South Goa',
    state: 'Goa',
    languages: ['English', 'Hindi', 'Konkani', 'Portuguese'],
    specialties: ['Colonial Indo-Portuguese Architecture', 'Local Goan Cuisine', 'Hidden Waterfalls', 'Walking Tours'],
    experienceYears: 9,
    dailyRate: 2500,
    hourlyRate: 500,
    avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&w=400&q=80',
    bio: 'Government-certified Goa tour ambassador specializing in Fontainhas Latin Quarter walks, organic spice plantations, and secluded coastal coves.',
    verificationStatus: 'verified',
    rating: 4.95,
    reviewCount: 112,
    phone: '+91 98221 44021',
    email: 'maria.goa@triptogether.com',
    availability: 'Available Today',
  },
  {
    id: 'guide-3',
    name: 'Vikram Singh Rathore',
    serviceLocation: 'Jaipur & Amber',
    state: 'Rajasthan',
    languages: ['Hindi', 'English', 'French', 'Marwari'],
    specialties: ['Rajput Dynastic History', 'Fort Architecture', 'Gemology & Block Printing', 'Royal Culinary Trails'],
    experienceYears: 15,
    dailyRate: 2800,
    hourlyRate: 550,
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=400&q=80',
    bio: 'Third-generation Jaipur historian and approved Ministry of Tourism guide. Passionate about narrating the untold legends of Amber and Nahargarh.',
    verificationStatus: 'verified',
    rating: 4.9,
    reviewCount: 96,
    phone: '+91 94140 12890',
    email: 'vikram.jaipur@triptogether.com',
    availability: 'Available from Tomorrow',
  },
  {
    id: 'guide-4',
    name: 'Ananya Sharma',
    serviceLocation: 'Varanasi & Sarnath',
    state: 'Uttar Pradesh',
    languages: ['Hindi', 'English', 'Bengali'],
    specialties: ['Ghats Mythology', 'Kashi Vishwanath Corridor', 'Silk Weaving Heritage', 'Classical Music Traditions'],
    experienceYears: 8,
    dailyRate: 2000,
    hourlyRate: 400,
    avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&w=400&q=80',
    bio: 'Philosophy graduate from Banaras Hindu University. Specializes in immersive dawn walking tours through ancient riverfront alleys and Sarnath monuments.',
    verificationStatus: 'verified',
    rating: 4.88,
    reviewCount: 71,
    phone: '+91 94500 88219',
    email: 'ananya.kashi@triptogether.com',
    availability: 'Available Today',
  },
  {
    id: 'guide-5',
    name: 'Tenzin Norbu',
    serviceLocation: 'Leh & Nubra Valley',
    state: 'Ladakh',
    languages: ['English', 'Hindi', 'Ladakhi', 'Tibetan'],
    specialties: ['Monastery Iconography', 'High Altitude Treks', 'Astronomy & Stargazing', 'Flora & Wildlife'],
    experienceYears: 11,
    dailyRate: 3200,
    hourlyRate: 600,
    avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=400&q=80',
    bio: 'Native Ladakhi trek leader and cultural guide certified by the Indian Mountaineering Foundation. Deep knowledge of Hemis, Thiksey, and Pangong routes.',
    verificationStatus: 'verified',
    rating: 5.0,
    reviewCount: 64,
    phone: '+91 94191 77301',
    email: 'tenzin.ladakh@triptogether.com',
    availability: 'Booking on Request',
  },
  {
    id: 'guide-6',
    name: 'Mathew Thomas',
    serviceLocation: 'Munnar & Alleppey',
    state: 'Kerala',
    languages: ['Malayalam', 'English', 'Tamil', 'Hindi'],
    specialties: ['Tea Plantation Botany', 'Backwater Village Life', 'Bird Watching', 'Spices & Ayurveda'],
    experienceYears: 10,
    dailyRate: 2200,
    hourlyRate: 450,
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=400&q=80',
    bio: 'Naturalist and licensed Kerala tourism guide. Enjoys taking families off the beaten path into tranquil canal villages and spice garden walks.',
    verificationStatus: 'verified',
    rating: 4.92,
    reviewCount: 88,
    phone: '+91 94470 55123',
    email: 'mathew.kerala@triptogether.com',
    availability: 'Available Today',
  },
  {
    id: 'guide-7',
    name: 'Sunil Thakur',
    serviceLocation: 'Manali & Rohtang',
    state: 'Himachal Pradesh',
    languages: ['Hindi', 'English', 'Punjabi'],
    specialties: ['Alpine Hiking Trails', 'Snow Photography', 'Local Himachali Lore', 'Adventure Safety'],
    experienceYears: 7,
    dailyRate: 2000,
    hourlyRate: 400,
    avatar: 'https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?auto=format&fit=crop&w=400&q=80',
    bio: 'Grown up in Solang Valley with unmatched familiarity with Himalayan weather, trail safety, and authentic local food stalls in Old Manali.',
    verificationStatus: 'pending',
    rating: 4.75,
    reviewCount: 29,
    phone: '+91 98050 44921',
    email: 'sunil.manali@triptogether.com',
    availability: 'Available Today',
  },
];

const INITIAL_REVIEWS: ReviewRecord[] = [
  {
    id: 'rev-1',
    authorName: 'Deepak & Meera Kulkarni',
    location: 'Bengaluru, Karnataka',
    targetType: 'package',
    targetTitle: 'Sacred Tirumala & Chandragiri Family Tour',
    rating: 5,
    comment: 'Planning a trip with elderly parents and two kids was stressful until we used Trip Together. The guide Srinivasa was respectful, patient, and made the temple darshan seamless.',
    date: '2026-10-14',
    status: 'approved',
  },
  {
    id: 'rev-2',
    authorName: 'Priya Sundaram',
    location: 'Chennai, Tamil Nadu',
    targetType: 'guide',
    targetTitle: 'Maria Fernandes (Goa)',
    rating: 5,
    comment: 'Maria was an exceptional guide in Goa! She took us through hidden historical lanes of Fontainhas and arranged an authentic Goan family meal that we will never forget.',
    date: '2026-10-11',
    status: 'approved',
  },
  {
    id: 'rev-3',
    authorName: 'Arjun Varma',
    location: 'Hyderabad, Telangana',
    targetType: 'platform',
    targetTitle: 'Trip Planner & Family Collaboration',
    rating: 5,
    comment: 'The live location tracking and shared packing checklist kept all 6 of our family members completely synchronized across the journey. Highly recommended platform!',
    date: '2026-10-08',
    status: 'approved',
  },
];

const INITIAL_USERS: UserRecord[] = [
  {
    id: 'usr-admin',
    name: 'Trip Together Admin',
    email: 'admin@triptogether.com',
    password: 'admin',
    role: 'admin',
    phone: '+91 90000 00001',
    createdAt: '2026-10-01T00:00:00.000Z',
  },
  {
    id: 'usr-madhuri',
    name: 'Madhuri (Lead Organizer)',
    email: 'madhurimadhu039@gmail.com',
    password: 'password123',
    role: 'traveler',
    phone: '+91 98490 12345',
    createdAt: '2026-10-05T10:00:00.000Z',
  },
  {
    id: 'usr-guide-1',
    name: 'Srinivasa Rao',
    email: 'srinivasa.guide@triptogether.com',
    password: 'password123',
    role: 'guide',
    phone: '+91 98480 23110',
    createdAt: '2026-10-06T12:00:00.000Z',
  },
];

export class Database {
  private data: PlatformDb;

  constructor() {
    this.data = this.load();
  }

  private load(): PlatformDb {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      if (fs.existsSync(DB_PATH)) {
        const raw = fs.readFileSync(DB_PATH, 'utf-8');
        const parsed = JSON.parse(raw);
        return {
          users: parsed.users || INITIAL_USERS,
          destinations: parsed.destinations || INITIAL_DESTINATIONS,
          packages: parsed.packages || INITIAL_PACKAGES,
          guides: parsed.guides || INITIAL_GUIDES,
          bookings: parsed.bookings || [],
          guideEnquiries: parsed.guideEnquiries || [],
          reviews: parsed.reviews || INITIAL_REVIEWS,
          contactTickets: parsed.contactTickets || [],
          savedTrips: parsed.savedTrips || [],
          auditLogs: parsed.auditLogs || [],
        };
      }
    } catch (err) {
      console.warn('Error reading store.json, falling back to seed:', err);
    }

    const initial: PlatformDb = {
      users: INITIAL_USERS,
      destinations: INITIAL_DESTINATIONS,
      packages: INITIAL_PACKAGES,
      guides: INITIAL_GUIDES,
      bookings: [],
      guideEnquiries: [],
      reviews: INITIAL_REVIEWS,
      contactTickets: [],
      savedTrips: [],
      auditLogs: [
        {
          id: `log-${Date.now()}`,
          action: 'Platform Database Initialized',
          actor: 'System',
          timestamp: new Date().toISOString(),
        },
      ],
    };
    this.save(initial);
    return initial;
  }

  private save(data?: PlatformDb) {
    try {
      if (!fs.existsSync(DB_DIR)) {
        fs.mkdirSync(DB_DIR, { recursive: true });
      }
      fs.writeFileSync(DB_PATH, JSON.stringify(data || this.data, null, 2), 'utf-8');
    } catch (err) {
      console.warn('Error saving store.json:', err);
    }
  }

  // --- Users ---
  getUsers(): UserRecord[] {
    return this.data.users;
  }

  getUserByEmail(email: string): UserRecord | undefined {
    return this.data.users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
  }

  getUserById(id: string): UserRecord | undefined {
    return this.data.users.find((u) => u.id === id);
  }

  saveUser(user: UserRecord): UserRecord {
    const idx = this.data.users.findIndex((u) => u.id === user.id || u.email.toLowerCase() === user.email.toLowerCase());
    if (idx >= 0) {
      this.data.users[idx] = { ...this.data.users[idx], ...user };
    } else {
      this.data.users.push(user);
    }
    this.save();
    return user;
  }

  // --- Destinations ---
  getDestinations(): DestinationRecord[] {
    return this.data.destinations;
  }

  getDestinationById(id: string): DestinationRecord | undefined {
    return this.data.destinations.find((d) => d.id === id);
  }

  saveDestination(dest: DestinationRecord): DestinationRecord {
    const idx = this.data.destinations.findIndex((d) => d.id === dest.id);
    if (idx >= 0) {
      this.data.destinations[idx] = dest;
    } else {
      this.data.destinations.push(dest);
    }
    this.logAction(`Updated Destination: ${dest.name}`, 'Admin');
    this.save();
    return dest;
  }

  deleteDestination(id: string): boolean {
    const idx = this.data.destinations.findIndex((d) => d.id === id);
    if (idx >= 0) {
      const name = this.data.destinations[idx].name;
      this.data.destinations.splice(idx, 1);
      this.logAction(`Deleted Destination: ${name}`, 'Admin');
      this.save();
      return true;
    }
    return false;
  }

  // --- Tour Packages ---
  getPackages(): TourPackageRecord[] {
    return this.data.packages;
  }

  getPackageById(id: string): TourPackageRecord | undefined {
    return this.data.packages.find((p) => p.id === id);
  }

  savePackage(pkg: TourPackageRecord): TourPackageRecord {
    const idx = this.data.packages.findIndex((p) => p.id === pkg.id);
    if (idx >= 0) {
      this.data.packages[idx] = pkg;
    } else {
      this.data.packages.push(pkg);
    }
    this.logAction(`Saved Package: ${pkg.title}`, 'Admin');
    this.save();
    return pkg;
  }

  deletePackage(id: string): boolean {
    const idx = this.data.packages.findIndex((p) => p.id === id);
    if (idx >= 0) {
      const title = this.data.packages[idx].title;
      this.data.packages.splice(idx, 1);
      this.logAction(`Deleted Package: ${title}`, 'Admin');
      this.save();
      return true;
    }
    return false;
  }

  // --- Guides ---
  getGuides(): LocalGuideRecord[] {
    return this.data.guides;
  }

  getGuideById(id: string): LocalGuideRecord | undefined {
    return this.data.guides.find((g) => g.id === id);
  }

  saveGuide(guide: LocalGuideRecord): LocalGuideRecord {
    const idx = this.data.guides.findIndex((g) => g.id === guide.id);
    if (idx >= 0) {
      this.data.guides[idx] = guide;
    } else {
      this.data.guides.push(guide);
    }
    this.logAction(`Saved Local Guide: ${guide.name}`, 'System');
    this.save();
    return guide;
  }

  updateGuideVerification(id: string, status: 'verified' | 'rejected' | 'pending'): boolean {
    const guide = this.getGuideById(id);
    if (guide) {
      guide.verificationStatus = status;
      this.logAction(`Updated verification for guide ${guide.name} to ${status}`, 'Admin');
      this.save();
      return true;
    }
    return false;
  }

  // --- Bookings ---
  getBookings(): BookingRecord[] {
    return this.data.bookings;
  }

  createBooking(booking: Omit<BookingRecord, 'id' | 'bookingRef' | 'createdAt'>): BookingRecord {
    const newBooking: BookingRecord = {
      ...booking,
      id: `bk-${Date.now()}`,
      bookingRef: `TT-BK-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      createdAt: new Date().toISOString(),
    };
    this.data.bookings.unshift(newBooking);
    this.logAction(`New Booking created: ${newBooking.bookingRef} for ${newBooking.customerName}`, 'Customer');
    this.save();
    return newBooking;
  }

  updateBookingStatus(id: string, status: 'confirmed' | 'pending' | 'cancelled'): boolean {
    const bk = this.data.bookings.find((b) => b.id === id || b.bookingRef === id);
    if (bk) {
      bk.status = status;
      this.logAction(`Updated Booking ${bk.bookingRef} status to ${status}`, 'Admin');
      this.save();
      return true;
    }
    return false;
  }

  // --- Guide Enquiries ---
  getGuideEnquiries(guideId?: string): GuideEnquiryRecord[] {
    if (guideId) {
      return this.data.guideEnquiries.filter((e) => e.guideId === guideId);
    }
    return this.data.guideEnquiries;
  }

  createGuideEnquiry(enquiry: Omit<GuideEnquiryRecord, 'id' | 'enquiryRef' | 'createdAt' | 'status'>): GuideEnquiryRecord {
    const newEnquiry: GuideEnquiryRecord = {
      ...enquiry,
      id: `enq-${Date.now()}`,
      enquiryRef: `TT-ENQ-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    this.data.guideEnquiries.unshift(newEnquiry);
    this.logAction(`New Guide Enquiry: ${newEnquiry.enquiryRef} to ${newEnquiry.guideName}`, 'Customer');
    this.save();
    return newEnquiry;
  }

  replyGuideEnquiry(id: string, reply: string): boolean {
    const enq = this.data.guideEnquiries.find((e) => e.id === id || e.enquiryRef === id);
    if (enq) {
      enq.replyMessage = reply;
      enq.repliedAt = new Date().toISOString();
      enq.status = 'replied';
      this.logAction(`Replied to Enquiry: ${enq.enquiryRef}`, 'Guide');
      this.save();
      return true;
    }
    return false;
  }

  // --- Reviews ---
  getReviews(): ReviewRecord[] {
    return this.data.reviews;
  }

  addReview(review: Omit<ReviewRecord, 'id' | 'date' | 'status'>): ReviewRecord {
    const newReview: ReviewRecord = {
      ...review,
      id: `rev-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      status: 'approved', // auto-approve for seamless testing, with admin toggle
    };
    this.data.reviews.unshift(newReview);
    this.logAction(`New Review submitted by ${newReview.authorName}`, 'Customer');
    this.save();
    return newReview;
  }

  moderateReview(id: string, status: 'approved' | 'pending'): boolean {
    const rev = this.data.reviews.find((r) => r.id === id);
    if (rev) {
      rev.status = status;
      this.logAction(`Moderated Review ${id} to ${status}`, 'Admin');
      this.save();
      return true;
    }
    return false;
  }

  // --- Contact Tickets ---
  getContactTickets(): ContactTicketRecord[] {
    return this.data.contactTickets;
  }

  createContactTicket(ticket: Omit<ContactTicketRecord, 'id' | 'ticketRef' | 'createdAt' | 'status'>): ContactTicketRecord {
    const newTicket: ContactTicketRecord = {
      ...ticket,
      id: `tkt-${Date.now()}`,
      ticketRef: `TT-SUP-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      status: 'open',
      createdAt: new Date().toISOString(),
    };
    this.data.contactTickets.unshift(newTicket);
    this.logAction(`Support Ticket opened: ${newTicket.ticketRef}`, 'Customer');
    this.save();
    return newTicket;
  }

  // --- Saved Trips ---
  getSavedTrips(userId?: string): SavedTripRecord[] {
    if (userId) {
      return this.data.savedTrips.filter((t) => t.userId === userId);
    }
    return this.data.savedTrips;
  }

  getSavedTripById(id: string): SavedTripRecord | undefined {
    return this.data.savedTrips.find((t) => t.id === id);
  }

  saveTrip(trip: SavedTripRecord): SavedTripRecord {
    const idx = this.data.savedTrips.findIndex((t) => t.id === trip.id);
    if (idx >= 0) {
      this.data.savedTrips[idx] = trip;
    } else {
      this.data.savedTrips.unshift(trip);
    }
    this.save();
    return trip;
  }

  deleteSavedTrip(id: string): boolean {
    const idx = this.data.savedTrips.findIndex((t) => t.id === id);
    if (idx >= 0) {
      this.data.savedTrips.splice(idx, 1);
      this.save();
      return true;
    }
    return false;
  }

  // --- Audit Logs ---
  getAuditLogs() {
    return this.data.auditLogs;
  }

  logAction(action: string, actor: string, details?: string) {
    this.data.auditLogs.unshift({
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      action,
      actor,
      details,
      timestamp: new Date().toISOString(),
    });
    if (this.data.auditLogs.length > 100) {
      this.data.auditLogs.pop();
    }
  }

  // --- Platform Stats Overview ---
  getOverviewStats() {
    const totalRevenue = this.data.bookings
      .filter((b) => b.status === 'confirmed')
      .reduce((sum, b) => sum + (b.totalAmount || 0), 0);

    return {
      totalUsers: this.data.users.length,
      totalDestinations: this.data.destinations.length,
      totalPackages: this.data.packages.length,
      totalGuides: this.data.guides.length,
      verifiedGuides: this.data.guides.filter((g) => g.verificationStatus === 'verified').length,
      pendingGuideVerifications: this.data.guides.filter((g) => g.verificationStatus === 'pending').length,
      totalBookings: this.data.bookings.length,
      activeBookings: this.data.bookings.filter((b) => b.status === 'confirmed').length,
      totalEnquiries: this.data.guideEnquiries.length,
      totalReviews: this.data.reviews.length,
      totalRevenue,
      serverTime: new Date().toISOString(),
    };
  }
}

export const db = new Database();
