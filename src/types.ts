export type NavSection =
  | 'dashboard'
  | 'transport'
  | 'hotels'
  | 'packages'
  | 'builder'
  | 'tracking'
  | 'chat'
  | 'checklist'
  | 'budget';

export interface TripParams {
  origin: string;
  destination: string;
  travelDate: string;
  urgency: 'today' | 'tomorrow' | 'scheduled';
  travellers: number;
  adults: number;
  children: number;
  seniors: number;
  nights: number;
  rooms: number;
  totalBudget: number;
  hotelBudgetAmount: number;
  hotelBudgetMode: 'per_room_per_night' | 'total_stay';
  preferredTransport: 'all' | 'train' | 'bus' | 'flight' | 'combo';
  packagePreference: 'custom' | 'package' | 'compare_both';
}

export interface TrainClassFare {
  classCode: 'SL' | '3E' | '3A' | '2A' | '1A' | 'CC' | '2S';
  className: string;
  farePerPerson: number;
  availabilityStatus: string;
  notes: string;
}

export interface TrainOption {
  id: string;
  trainNumber: string;
  trainName: string;
  departureStation: string;
  departureCode: string;
  arrivalStation: string;
  arrivalCode: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  durationFormatted: string;
  runningDays: string[];
  intermediateStops: string[];
  classes: TrainClassFare[];
  runningStatusNote: string;
  officialBookingUrl: string;
  sourceName: string;
  dataMode: 'LIVE_API' | 'REFERENCE_SCHEDULE';
  lastUpdated: string;
}

export interface BusOption {
  id: string;
  operator: string;
  operatorType: 'Government RTC' | 'Verified Private';
  busType: string;
  isAc: boolean;
  seatingType: 'Sleeper' | 'Seater' | 'Semi-Sleeper' | 'Sleeper + Seater';
  boardingPoint: string;
  droppingPoint: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  durationFormatted: string;
  farePerPerson: number;
  taxesAndTollFeePerPerson: number;
  seatStatusNote: string;
  amenities: string[];
  cancellationPolicy: string;
  officialBookingUrl: string;
  sourceName: string;
  dataMode: 'LIVE_API' | 'REFERENCE_SCHEDULE';
  lastUpdated: string;
}

export interface FlightOption {
  id: string;
  airline: string;
  flightNumbers: string;
  routeType: 'Direct' | 'Connecting' | 'Rail + Flight Combo' | 'Road + Flight Combo';
  originAirportOrStation: string;
  viaHub: string;
  destinationAirport: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  durationFormatted: string;
  baseFarePerPerson: number;
  airportTransferCostTotal: number;
  baggageAllowance: string;
  additionalFeesNote: string;
  officialBookingUrl: string;
  sourceName: string;
  dataMode: 'LIVE_API' | 'REFERENCE_SCHEDULE';
  lastUpdated: string;
}

export interface RankedTransportSummary {
  id: string;
  mode: 'Train' | 'Bus' | 'Flight';
  title: string;
  subtitle: string;
  departureTime: string;
  arrivalTime: string;
  durationMinutes: number;
  durationFormatted: string;
  perPersonCost: number;
  extraTransferOrFeeTotal: number;
  totalFamilyCost: number;
  convenienceScore: number;
  badge?: 'Cheapest' | 'Fastest' | 'Best Value';
  officialBookingUrl: string;
  sourceName: string;
  dataMode: 'LIVE_API' | 'REFERENCE_SCHEDULE';
}

export interface HotelRoomType {
  name: string;
  maxOccupancy: number;
  isAc: boolean;
  pricePerNight: number;
}

export interface HotelOption {
  id: string;
  name: string;
  propertyCategory: 'TTD Choultry' | 'APTDC Haritha' | 'Verified Budget Hotel' | 'Verified Family Comfort' | 'Premium Family Hotel';
  locationArea: 'Tirupati Downhill (Near Railway Station)' | 'Alipiri Footpath Base' | 'Kapila Theertham Road' | 'Tirumala Hilltop';
  address: string;
  coordinates: { lat: number; lng: number };
  distanceToTtdTempleKm: number;
  distanceToAlipiriKm: number;
  distanceToRailwayStationKm: number;
  distanceToBusStandKm: number;
  roomTypes: HotelRoomType[];
  basePricePerRoomPerNight: number;
  taxPercentage: number;
  isAcAvailable: boolean;
  isFamilyFriendly: boolean;
  guestRating: number;
  reviewCount: number;
  amenities: string[];
  publicPhone: string | null;
  phoneVerified: boolean;
  officialBookingUrl: string;
  checkInTime: string;
  checkOutTime: string;
  cancellationPolicy: string;
  sourceName: string;
  verificationStatus: 'OFFICIAL_PORTAL_VERIFIED' | 'PUBLIC_DIRECTORY_VERIFIED';
  lastVerified: string;
}

export interface TourPackageOption {
  id: string;
  providerName: string;
  providerType: 'Government Tourism (APTDC)' | 'IRCTC Tourism' | 'State Transport (APSRTC)' | 'Authorized Tour Operator';
  packageTitle: string;
  durationDays: number;
  durationNights: number;
  durationLabel: string;
  startingCity: string;
  pricePerAdult: number;
  pricePerChild: number;
  inclusions: string[];
  exclusions: string[];
  hotelCategory: string;
  transportDetails: string;
  darshanDetails: string;
  darshanConfirmedInTerms: boolean;
  extraChargesAndConditions: string;
  cancellationTerms: string;
  publicContactPhone: string | null;
  phoneVerified: boolean;
  officialPackageUrl: string;
  sourceUrl: string;
  lastChecked: string;
  priceConsistencyStatus: 'VERIFIED_CONSISTENT' | 'SEASONAL_VARIATION_NOTE';
}

export interface ItineraryActivity {
  id: string;
  timeSlot: string;
  placeName: string;
  category: 'Transit' | 'Temple & Darshan' | 'Heritage & Sightseeing' | 'Meals & Rest' | 'Check-in / Check-out';
  description: string;
  distanceFromPrevKm: number;
  travelTimeMinutes: number;
  localTransportMode: string;
  estimatedTransportCostFamily: number;
  estimatedFoodOrTicketCostFamily: number;
  verifiedNotes: string;
}

export interface ItineraryDay {
  dayNumber: number;
  dateLabel: string;
  title: string;
  accommodationName: string;
  accommodationNightCostTotal: number;
  activities: ItineraryActivity[];
}

export interface AIRecommendationPlan {
  planName: string;
  combinationType: 'Bus + Budget Hotel' | 'Train + Budget Hotel' | 'Train + Ready-Made Package' | 'Custom Transport + Separate Stay';
  suitabilityReason: string;
  itemizedBudget: {
    transport: number;
    accommodation: number;
    localTravel: number;
    meals: number;
    ticketsAndActivities: number;
    taxesAndServiceFees: number;
    contingencyAllowance: number;
  };
  totalFamilyCost: number;
  perPersonCost: number;
  missingOrEstimatedNotes: string[];
  savingTips: string[];
}

export interface FamilyMember {
  id: string;
  name: string;
  role: 'Organizer' | 'Parent' | 'Grandparent' | 'Child' | 'Relative';
  email: string;
  avatarInitials: string;
  locationSharingConsent: boolean;
  lastLocation?: {
    lat: number;
    lng: number;
    accuracyMeters: number;
    placeLabel: string;
    updatedAt: string;
  };
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  senderRole: string;
  text: string;
  timestamp: string;
  attachmentType?: 'checklist_item' | 'booking_link' | 'trip_update';
  attachmentTitle?: string;
  attachmentUrl?: string;
}

export interface ChecklistItem {
  id: string;
  category:
    | 'Personal Hygiene'
    | 'Clothing'
    | 'Travel Documents'
    | 'Electronics'
    | 'Medicines & Essentials'
    | 'Children Items'
    | 'Darshan Essentials'
    | string;
  itemName: string;
  assignedToMemberId: string; // or 'all'
  assignedToName: string;
  requiredQuantity: number;
  packedQuantity: number;
  isPacked: boolean;
  packedByMemberName?: string;
  updatedAt: string;
}

export interface SavedBookingItem {
  id: string;
  category: 'Transport' | 'Accommodation' | 'Tour Package' | 'Local Transport & Meals';
  title: string;
  provider: string;
  status: 'Estimated' | 'Shortlisted' | 'Confirmed Reference';
  totalFamilyCost: number;
  officialUrl: string;
  notes: string;
  addedAt: string;
}

export interface ProviderAdapterStatus {
  id: string;
  providerName: string;
  category: 'Rail' | 'Bus' | 'Flight' | 'Hotels' | 'Tour Packages' | 'AI Assistant';
  envSecretName: string;
  configured: boolean;
  mode: 'LIVE_API' | 'REFERENCE_ADAPTER';
  officialPortalUrl: string;
  complianceNote: string;
}
