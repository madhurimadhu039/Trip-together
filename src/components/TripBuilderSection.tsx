import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Calendar,
  MapPin,
  Users,
  Wallet,
  IndianRupee,
  Car,
  Bus,
  Train,
  Plane,
  Building2,
  Home,
  Plus,
  Trash2,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Clock,
  Printer,
  RotateCcw,
  Edit3,
  ExternalLink,
  ShieldCheck,
  Compass,
  X,
} from 'lucide-react';
import type {
  TripParams,
  ItineraryDay,
  ItineraryActivity,
  SavedBookingItem,
} from '../types';
import {
  POPULAR_DESTINATIONS,
  PopularDestination,
  getRecommendedDestinations,
} from '../data/popularDestinations';

// Major Indian city coordinates for realistic route distance calculations
const CITY_COORDINATES: Record<string, { lat: number; lng: number }> = {
  tirupati: { lat: 13.6288, lng: 79.4192 },
  kakinada: { lat: 16.9891, lng: 82.2475 },
  hyderabad: { lat: 17.385, lng: 78.4867 },
  bangalore: { lat: 12.9716, lng: 77.5946 },
  bengaluru: { lat: 12.9716, lng: 77.5946 },
  chennai: { lat: 13.0827, lng: 80.2707 },
  mumbai: { lat: 19.076, lng: 72.8777 },
  delhi: { lat: 28.6139, lng: 77.209 },
  'new delhi': { lat: 28.6139, lng: 77.209 },
  kolkata: { lat: 22.5726, lng: 88.3639 },
  goa: { lat: 15.2993, lng: 74.124 },
  jaipur: { lat: 26.9124, lng: 75.7873 },
  manali: { lat: 32.2396, lng: 77.1887 },
  varanasi: { lat: 25.3176, lng: 82.9739 },
  ladakh: { lat: 34.1526, lng: 77.5771 },
  leh: { lat: 34.1526, lng: 77.5771 },
  'leh ladakh': { lat: 34.1526, lng: 77.5771 },
  ooty: { lat: 11.4102, lng: 76.695 },
  coonoor: { lat: 11.353, lng: 76.7959 },
  kochi: { lat: 9.9312, lng: 76.2673 },
  kerala: { lat: 9.9312, lng: 76.2673 },
  munnar: { lat: 10.0889, lng: 77.0595 },
  alleppey: { lat: 9.4981, lng: 76.3388 },
  visakhapatnam: { lat: 17.6868, lng: 83.2185 },
  vizag: { lat: 17.6868, lng: 83.2185 },
  vijayawada: { lat: 16.5062, lng: 80.648 },
  coimbatore: { lat: 11.0168, lng: 76.9558 },
  pune: { lat: 18.5204, lng: 73.8567 },
  ahmedabad: { lat: 23.0225, lng: 72.5714 },
  mysore: { lat: 12.2958, lng: 76.6394 },
  mysuru: { lat: 12.2958, lng: 76.6394 },
  madurai: { lat: 9.9252, lng: 78.1198 },
  rameswaram: { lat: 9.2876, lng: 79.3129 },
  amritsar: { lat: 31.634, lng: 74.8723 },
  agra: { lat: 27.1767, lng: 78.0081 },
  shimla: { lat: 31.1048, lng: 77.1734 },
  rishikesh: { lat: 30.0869, lng: 78.2676 },
  haridwar: { lat: 29.9457, lng: 78.1642 },
  darjeeling: { lat: 27.041, lng: 88.2663 },
  pondicherry: { lat: 11.9416, lng: 79.8083 },
  udaipur: { lat: 24.5854, lng: 73.7125 },
};

function getCityCoordinate(name: string): { lat: number; lng: number } | null {
  const clean = (name || '').trim().toLowerCase();
  if (!clean) return null;
  for (const [key, coord] of Object.entries(CITY_COORDINATES)) {
    if (clean.includes(key) || key.includes(clean)) {
      return coord;
    }
  }
  return null;
}

function haversineKm(c1: { lat: number; lng: number }, c2: { lat: number; lng: number }): number {
  const R = 6371;
  const dLat = ((c2.lat - c1.lat) * Math.PI) / 180;
  const dLng = ((c2.lng - c1.lng) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((c1.lat * Math.PI) / 180) *
      Math.cos((c2.lat * Math.PI) / 180) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Math.round(R * c);
}

function calculateRouteDistance(origin: string, destination: string): number | null {
  const c1 = getCityCoordinate(origin);
  const c2 = getCityCoordinate(destination);
  if (c1 && c2) {
    const raw = haversineKm(c1, c2);
    return Math.max(30, Math.round(raw * 1.22));
  }
  return null;
}

/**
 * Autocomplete Location Input Component
 */
const AutocompleteLocationInput: React.FC<{
  label: string;
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  id: string;
  hasError?: boolean;
  errorMessage?: string;
}> = ({ label, value, onChange, placeholder, id, hasError, errorMessage }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [suggestions, setSuggestions] = useState<PopularDestination[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (value && value.trim().length >= 1) {
      const results = getRecommendedDestinations(value, 5);
      setSuggestions(results);
    } else {
      setSuggestions([]);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative w-full">
      <label htmlFor={id} className="block text-xs font-bold text-slate-700 mb-1.5">
        {label} <span className="text-rose-500">*</span>
      </label>
      <div className="relative">
        <MapPin className="w-4 h-4 text-[#0D9488] absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        <input
          id={id}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={placeholder}
          className={`w-full pl-10 pr-4 py-2.5 rounded-xl text-sm text-slate-900 transition-all ${
            hasError
              ? 'bg-rose-50/40 border border-rose-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20'
              : 'bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]'
          }`}
        />
      </div>
      {errorMessage && (
        <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
          <AlertCircle className="w-3 h-3 shrink-0" />
          <span>{errorMessage}</span>
        </p>
      )}

      {isOpen && suggestions.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-1 bg-white border border-stone-200 rounded-2xl shadow-xl z-50 overflow-hidden">
          {suggestions.map((dest) => (
            <button
              key={dest.id}
              type="button"
              onClick={() => {
                onChange(dest.name);
                setIsOpen(false);
              }}
              className="w-full px-4 py-2 text-left text-xs text-slate-800 hover:bg-teal-50 flex items-center justify-between border-b border-stone-100 last:border-b-0 cursor-pointer"
            >
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#0D9488]" />
                <span className="font-semibold">{dest.fullName}</span>
              </div>
              <span className="text-[10px] text-stone-400">{dest.category}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export interface TripBuilderSectionProps {
  tripParams: TripParams;
  setTripParams?: React.Dispatch<React.SetStateAction<TripParams>>;
  itineraryDays: ItineraryDay[];
  setItineraryDays: React.Dispatch<React.SetStateAction<ItineraryDay[]>>;
  onShortlistBooking?: (item: Omit<SavedBookingItem, 'id' | 'addedAt'>) => void;
  userId?: string;
  onNavigateHotels?: () => void;
}

export const TripBuilderSection: React.FC<TripBuilderSectionProps> = ({
  tripParams,
  setTripParams,
  itineraryDays,
  setItineraryDays,
  onShortlistBooking,
  userId = 'usr-1',
  onNavigateHotels,
}) => {
  // Today's date in YYYY-MM-DD
  const todayStr = useMemo(() => new Date().toISOString().split('T')[0], []);

  // Form Fields
  const [pickup, setPickup] = useState(tripParams.origin || '');
  const [destination, setDestination] = useState(tripParams.destination || '');
  const [departureDate, setDepartureDate] = useState(tripParams.travelDate || todayStr);

  // Calculate return date default based on nights
  const defaultReturnDate = useMemo(() => {
    try {
      const d = new Date(departureDate || todayStr);
      d.setDate(d.getDate() + (tripParams.nights || 2));
      return d.toISOString().split('T')[0];
    } catch {
      return '';
    }
  }, [departureDate, tripParams.nights]);

  const [returnDate, setReturnDate] = useState(defaultReturnDate);
  const [travellers, setTravellers] = useState(tripParams.travellers || 2);

  // Transportation choice: Car, Bus, Train, Flight
  const [transportMode, setTransportMode] = useState<'Car' | 'Bus' | 'Train' | 'Flight'>('Train');

  // Accommodation preference: Hotel or Homestay
  const [accommodationType, setAccommodationType] = useState<'Hotel' | 'Homestay'>('Hotel');
  const [hotelBudgetPerNight, setHotelBudgetPerNight] = useState(tripParams.hotelBudgetAmount || 2000);

  // Places to Visit
  const [selectedAttractions, setSelectedAttractions] = useState<string[]>([]);
  const [customAttractionInput, setCustomAttractionInput] = useState('');

  // Budget Summary
  const [totalBudget, setTotalBudget] = useState(tripParams.totalBudget || 25000);
  const [dailyFoodEstimate, setDailyFoodEstimate] = useState(500);

  // Validation & UI State
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [attractionError, setAttractionError] = useState<string | null>(null);
  const [planGenerated, setPlanGenerated] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const itineraryRef = useRef<HTMLDivElement>(null);
  const prevDestinationRef = useRef<string>(destination);

  // Sync to parent tripParams when inputs change
  useEffect(() => {
    if (setTripParams) {
      setTripParams((prev) => ({
        ...prev,
        origin: pickup,
        destination: destination,
        travelDate: departureDate,
        travellers,
        hotelBudgetAmount: hotelBudgetPerNight,
        totalBudget,
      }));
    }
  }, [pickup, destination, departureDate, travellers, hotelBudgetPerNight, totalBudget, setTripParams]);

  // Compute nights between departure and return date
  const calculatedNights = useMemo(() => {
    if (!departureDate || !returnDate) return tripParams.nights || 2;
    const dep = new Date(departureDate);
    const ret = new Date(returnDate);
    const diffTime = ret.getTime() - dep.getTime();
    const diffDays = Math.round(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : 1;
  }, [departureDate, returnDate, tripParams.nights]);

  // Sync nights to tripParams
  useEffect(() => {
    if (setTripParams) {
      setTripParams((prev) => ({ ...prev, nights: calculatedNights }));
    }
  }, [calculatedNights, setTripParams]);

  // Destination matched popular attractions
  const availableAttractions = useMemo(() => {
    if (!destination.trim()) return [];
    const cleanDest = destination.trim().toLowerCase();
    const match = POPULAR_DESTINATIONS.find(
      (d) =>
        d.name.toLowerCase().includes(cleanDest) ||
        cleanDest.includes(d.name.toLowerCase()) ||
        d.aliases?.some((a) => a.toLowerCase() === cleanDest)
    );

    if (match && match.popularAttractions) {
      return match.popularAttractions
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    return [
      `${destination} Central Landmark`,
      `${destination} Old Town & Heritage Walk`,
      `${destination} Local Handicrafts Bazaar`,
      `${destination} Sunset Viewpoint`,
    ];
  }, [destination]);

  // Only pre-populate suggested attractions when destination changes to a new non-empty destination
  useEffect(() => {
    const cleanDest = destination.trim().toLowerCase();
    const prevClean = prevDestinationRef.current.trim().toLowerCase();
    if (cleanDest && cleanDest !== prevClean && availableAttractions.length > 0) {
      setSelectedAttractions(availableAttractions.slice(0, 3));
    }
    prevDestinationRef.current = destination;
  }, [destination, availableAttractions]);

  // Corridor route metrics calculation
  const distanceKm = useMemo(() => {
    return calculateRouteDistance(pickup, destination);
  }, [pickup, destination]);

  // Estimated Travel Time & Transit Costs per mode
  const transportMetrics = useMemo(() => {
    if (!distanceKm) return null;

    if (transportMode === 'Car') {
      const hours = Math.floor(distanceKm / 60);
      const mins = Math.round(((distanceKm % 60) / 60) * 60);
      const timeStr = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim() : `${mins}m`;
      const oneWayFuelToll = Math.round(distanceKm * 13);
      const roundTripTotal = oneWayFuelToll * 2;
      return {
        distanceKm,
        travelTime: timeStr,
        costDescription: `Fuel & toll est. ~₹${oneWayFuelToll.toLocaleString('en-IN')} one-way (~₹${roundTripTotal.toLocaleString('en-IN')} round-trip for car)`,
        totalGroupCost: roundTripTotal,
      };
    }

    if (transportMode === 'Bus') {
      const hours = Math.floor(distanceKm / 48);
      const mins = Math.round(((distanceKm % 48) / 48) * 60);
      const timeStr = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim() : `${mins}m`;
      const farePerPax = Math.max(350, Math.round(distanceKm * 1.6));
      const roundTripTotal = farePerPax * 2 * travellers;
      return {
        distanceKm,
        travelTime: timeStr,
        costDescription: `~₹${farePerPax.toLocaleString('en-IN')}/person one-way (~₹${roundTripTotal.toLocaleString('en-IN')} total round-trip for ${travellers} pax)`,
        totalGroupCost: roundTripTotal,
      };
    }

    if (transportMode === 'Train') {
      const hours = Math.floor(distanceKm / 58);
      const mins = Math.round(((distanceKm % 58) / 58) * 60);
      const timeStr = hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ''}`.trim() : `${mins}m`;
      const farePerPax = Math.max(240, Math.round(distanceKm * 0.9));
      const roundTripTotal = farePerPax * 2 * travellers;
      return {
        distanceKm,
        travelTime: timeStr,
        costDescription: `SL/3A rail ~₹${farePerPax.toLocaleString('en-IN')}/person one-way (~₹${roundTripTotal.toLocaleString('en-IN')} total round-trip for ${travellers} pax)`,
        totalGroupCost: roundTripTotal,
      };
    }

    // Flight
    if (distanceKm < 320) {
      return {
        distanceKm,
        travelTime: 'Short distance corridor',
        costDescription: 'Direct commercial flight not recommended for this distance; rail or road preferred.',
        totalGroupCost: 0,
        isWarning: true,
      };
    }
    const flightTime = Math.max(1, Math.floor(distanceKm / 520));
    const farePerPax = Math.max(3200, Math.round(distanceKm * 3.8));
    const roundTripTotal = farePerPax * 2 * travellers;
    return {
      distanceKm,
      travelTime: `~${flightTime}h 15m flight + airport transfer`,
      costDescription: `Economy airfare est. ~₹${farePerPax.toLocaleString('en-IN')}/person one-way (~₹${roundTripTotal.toLocaleString('en-IN')} total round-trip for ${travellers} pax)`,
      totalGroupCost: roundTripTotal,
    };
  }, [distanceKm, transportMode, travellers]);

  // Add custom attraction handler — handles input, duplicates, empty entries
  const handleAddCustomAttraction = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const trimmed = customAttractionInput.trim();
    if (!trimmed) {
      setAttractionError('Please enter a place or attraction name to add.');
      return;
    }
    if (selectedAttractions.some((p) => p.toLowerCase() === trimmed.toLowerCase())) {
      setAttractionError(`"${trimmed}" is already in your selected places list.`);
      return;
    }
    setSelectedAttractions((prev) => [...prev, trimmed]);
    setCustomAttractionInput('');
    setAttractionError(null);
  };

  // Remove attraction handler
  const handleRemoveAttraction = (placeName: string) => {
    setSelectedAttractions((prev) => prev.filter((p) => p !== placeName));
  };

  // Toggle available attraction
  const handleToggleAttraction = (placeName: string) => {
    if (selectedAttractions.includes(placeName)) {
      setSelectedAttractions((prev) => prev.filter((p) => p !== placeName));
    } else {
      setSelectedAttractions((prev) => [...prev, placeName]);
    }
  };

  // Calculate Budget Items (live updates when places or selections change)
  const transportationExpense = transportMetrics?.totalGroupCost || 0;
  const accommodationExpense = calculatedNights * hotelBudgetPerNight;
  const foodExpense = calculatedNights * travellers * dailyFoodEstimate;
  const sightseeingExpense = selectedAttractions.length * 250 * travellers;
  const totalEstimatedCost =
    transportationExpense + accommodationExpense + foodExpense + sightseeingExpense;
  const remainingBudget = totalBudget - totalEstimatedCost;

  // Generate Itinerary Handler — validates required fields and distributes all places
  const handleGeneratePlan = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    const errors: string[] = [];
    const newFieldErrors: Record<string, string> = {};

    const cleanPickup = pickup.trim();
    const cleanDestination = destination.trim();

    if (!cleanPickup) {
      errors.push('Please enter a pickup location.');
      newFieldErrors.pickup = 'Pickup location is required.';
    }
    if (!cleanDestination) {
      errors.push('Please enter a destination.');
      newFieldErrors.destination = 'Destination is required.';
    }
    if (!departureDate) {
      errors.push('Please select a departure date.');
      newFieldErrors.departureDate = 'Departure date is required.';
    } else if (departureDate < todayStr) {
      errors.push('Departure date cannot be in the past.');
      newFieldErrors.departureDate = 'Departure date cannot be in the past.';
    }

    if (!returnDate) {
      errors.push('Please select a return date.');
      newFieldErrors.returnDate = 'Return date is required.';
    } else if (departureDate && returnDate < departureDate) {
      errors.push('Return date cannot be earlier than departure date.');
      newFieldErrors.returnDate = 'Return date cannot be earlier than departure date.';
    }

    if (!travellers || travellers < 1) {
      errors.push('Number of travellers must be at least 1.');
      newFieldErrors.travellers = 'Traveller count must be at least 1.';
    }

    setFieldErrors(newFieldErrors);

    if (errors.length > 0) {
      setValidationErrors(errors);
      setPlanGenerated(false);
      setTimeout(() => {
        const errorCard =
          document.getElementById('planner-validation-banner') ||
          document.getElementById('pickup-location');
        errorCard?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }, 50);
      return;
    }

    setValidationErrors([]);
    setFieldErrors({});

    // Generate day-by-day itinerary incorporating actual user selections
    const totalDays = calculatedNights + 1;
    const days: ItineraryDay[] = [];
    const attractionsPool = [...selectedAttractions];
    const totalSelected = selectedAttractions.length;

    for (let dayNum = 1; dayNum <= totalDays; dayNum++) {
      const curDate = new Date(departureDate);
      curDate.setDate(curDate.getDate() + (dayNum - 1));
      const dateLabel = curDate.toLocaleDateString('en-IN', {
        weekday: 'short',
        day: 'numeric',
        month: 'short',
      });

      const dayActivities: ItineraryActivity[] = [];

      if (dayNum === 1) {
        // Day 1: Departure & Arrival
        dayActivities.push({
          id: `act-${dayNum}-1`,
          timeSlot: '08:00 AM',
          placeName: `Departure from ${cleanPickup}`,
          category: 'Transit',
          description: `Begin journey from ${cleanPickup} to ${cleanDestination} via selected ${transportMode}.`,
          distanceFromPrevKm: 0,
          travelTimeMinutes: 60,
          localTransportMode: transportMode,
          estimatedTransportCostFamily: Math.round(transportationExpense / 2),
          estimatedFoodOrTicketCostFamily: travellers * 150,
          verifiedNotes: 'Keep government ID proofs and booking confirmations handy.',
        });

        dayActivities.push({
          id: `act-${dayNum}-2`,
          timeSlot: '02:00 PM',
          placeName: `Check-in at ${cleanDestination} ${accommodationType}`,
          category: 'Check-in / Check-out',
          description: `Arrive in ${cleanDestination}, complete check-in at ${accommodationType}, refresh and unpack.`,
          distanceFromPrevKm: 5,
          travelTimeMinutes: 20,
          localTransportMode: 'Auto / Cab',
          estimatedTransportCostFamily: 200,
          estimatedFoodOrTicketCostFamily: 0,
          verifiedNotes: `Standard check-in time: 12:00 PM – 02:00 PM. Budget: ₹${hotelBudgetPerNight.toLocaleString('en-IN')}/night.`,
        });

        // Evening attraction on Day 1 if available
        const eveningPlace =
          attractionsPool.length > 0
            ? attractionsPool.shift()!
            : totalSelected === 0
            ? `${cleanDestination} Central Promenade`
            : null;
        if (eveningPlace) {
          dayActivities.push({
            id: `act-${dayNum}-3`,
            timeSlot: '05:30 PM',
            placeName: eveningPlace,
            category: 'Heritage & Sightseeing',
            description: `Evening exploration, sightseeing, and sunset stroll at ${eveningPlace}.`,
            distanceFromPrevKm: 4,
            travelTimeMinutes: 25,
            localTransportMode: 'Local Transit',
            estimatedTransportCostFamily: 150,
            estimatedFoodOrTicketCostFamily: travellers * 200,
            verifiedNotes: 'Comfortable walking shoes recommended.',
          });
        }
      } else if (dayNum === totalDays) {
        // Final Day: Morning Sightseeing, Check-out & Return Journey
        const morningPlace = attractionsPool.length > 0 ? attractionsPool.shift()! : null;
        if (morningPlace) {
          dayActivities.push({
            id: `act-${dayNum}-1`,
            timeSlot: '09:00 AM',
            placeName: morningPlace,
            category: 'Heritage & Sightseeing',
            description: `Morning visit to ${morningPlace} and local handicraft souvenir shopping.`,
            distanceFromPrevKm: 3,
            travelTimeMinutes: 15,
            localTransportMode: 'Local Transit',
            estimatedTransportCostFamily: 120,
            estimatedFoodOrTicketCostFamily: travellers * 250,
            verifiedNotes: 'Morning hours offer great photo opportunities and fewer crowds.',
          });
        }

        dayActivities.push({
          id: `act-${dayNum}-2`,
          timeSlot: '12:00 PM',
          placeName: `Check-out from ${cleanDestination} ${accommodationType}`,
          category: 'Check-in / Check-out',
          description: `Pack bags, settle accommodation room bills, and prepare for return transit.`,
          distanceFromPrevKm: 4,
          travelTimeMinutes: 20,
          localTransportMode: 'Cab / Auto',
          estimatedTransportCostFamily: 200,
          estimatedFoodOrTicketCostFamily: travellers * 200,
          verifiedNotes: 'Standard check-out is 11:00 AM or 12:00 PM.',
        });

        dayActivities.push({
          id: `act-${dayNum}-3`,
          timeSlot: '04:00 PM',
          placeName: `Return Journey to ${cleanPickup}`,
          category: 'Transit',
          description: `Depart ${cleanDestination} for return travel back to ${cleanPickup} via ${transportMode}.`,
          distanceFromPrevKm: distanceKm || 150,
          travelTimeMinutes: 120,
          localTransportMode: transportMode,
          estimatedTransportCostFamily: Math.round(transportationExpense / 2),
          estimatedFoodOrTicketCostFamily: travellers * 150,
          verifiedNotes: 'Safely conclude memorable journey.',
        });
      } else {
        // Middle Days: Visit selected attractions
        const morningPlace =
          attractionsPool.length > 0 ? attractionsPool.shift()! : `${cleanDestination} Landmark`;
        const eveningPlace =
          attractionsPool.length > 0 ? attractionsPool.shift()! : `${cleanDestination} Cultural Center`;

        dayActivities.push({
          id: `act-${dayNum}-1`,
          timeSlot: '09:30 AM',
          placeName: morningPlace,
          category: 'Heritage & Sightseeing',
          description: `Guided visit to ${morningPlace}. Explore architecture, heritage, and key attractions.`,
          distanceFromPrevKm: 6,
          travelTimeMinutes: 25,
          localTransportMode: 'Local Auto / Cab',
          estimatedTransportCostFamily: 180,
          estimatedFoodOrTicketCostFamily: travellers * 200,
          verifiedNotes: 'Carry water bottle and verify entrance timings.',
        });

        dayActivities.push({
          id: `act-${dayNum}-2`,
          timeSlot: '01:00 PM',
          placeName: `Traditional Lunch in ${cleanDestination}`,
          category: 'Meals & Rest',
          description: `Enjoy authentic regional cuisine, refreshments, and family rest window.`,
          distanceFromPrevKm: 2,
          travelTimeMinutes: 10,
          localTransportMode: 'Walking',
          estimatedTransportCostFamily: 0,
          estimatedFoodOrTicketCostFamily: travellers * 250,
          verifiedNotes: 'Clean, family-friendly verified restaurant.',
        });

        // If user added more places, add an afternoon visit
        if (attractionsPool.length > totalDays - dayNum) {
          const afternoonPlace = attractionsPool.shift()!;
          dayActivities.push({
            id: `act-${dayNum}-extra`,
            timeSlot: '03:15 PM',
            placeName: afternoonPlace,
            category: 'Heritage & Sightseeing',
            description: `Afternoon tour and discovery at ${afternoonPlace}.`,
            distanceFromPrevKm: 4,
            travelTimeMinutes: 20,
            localTransportMode: 'Auto / Cab',
            estimatedTransportCostFamily: 120,
            estimatedFoodOrTicketCostFamily: travellers * 150,
            verifiedNotes: 'Scenic photo spot.',
          });
        }

        dayActivities.push({
          id: `act-${dayNum}-3`,
          timeSlot: '05:30 PM',
          placeName: eveningPlace,
          category: 'Heritage & Sightseeing',
          description: `Relaxing sunset visit to ${eveningPlace} followed by local market exploration.`,
          distanceFromPrevKm: 5,
          travelTimeMinutes: 20,
          localTransportMode: 'Local Transit',
          estimatedTransportCostFamily: 150,
          estimatedFoodOrTicketCostFamily: travellers * 150,
          verifiedNotes: 'Best light for photography in late afternoon.',
        });
      }

      days.push({
        dayNumber: dayNum,
        dateLabel,
        title:
          dayNum === 1
            ? `Arrival & Journey to ${cleanDestination}`
            : dayNum === totalDays
            ? `Farewell & Return to ${cleanPickup}`
            : `Exploring ${cleanDestination} Highlights`,
        accommodationName: `${cleanDestination} ${accommodationType} (Budget ~₹${hotelBudgetPerNight.toLocaleString('en-IN')}/night)`,
        accommodationNightCostTotal: dayNum === totalDays ? 0 : hotelBudgetPerNight,
        activities: dayActivities,
      });
    }

    // Ensure any remaining attractions in the pool are included in the itinerary
    while (attractionsPool.length > 0) {
      const extraPlace = attractionsPool.shift()!;
      const targetDay = days.length > 2 ? days[1] : days[0];
      targetDay.activities.splice(targetDay.activities.length - 1, 0, {
        id: `act-extra-${Date.now()}-${attractionsPool.length}`,
        timeSlot: '04:15 PM',
        placeName: extraPlace,
        category: 'Heritage & Sightseeing',
        description: `Explore ${extraPlace} and surrounding local highlights.`,
        distanceFromPrevKm: 3,
        travelTimeMinutes: 15,
        localTransportMode: 'Local Transit',
        estimatedTransportCostFamily: 100,
        estimatedFoodOrTicketCostFamily: travellers * 150,
        verifiedNotes: 'Custom attraction added to trip itinerary.',
      });
    }

    setItineraryDays(days);
    setPlanGenerated(true);
    setToastMessage(`Trip plan for ${cleanPickup} ➔ ${cleanDestination} generated!`);
    setTimeout(() => setToastMessage(null), 3000);

    setTimeout(() => {
      itineraryRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, 150);
  };

  // Reset Plan Handler — clears fields, preferences, attractions, itinerary, and errors
  const handleResetPlan = () => {
    // If a plan was already generated and details exist, confirm with user
    if (planGenerated && (pickup || destination || selectedAttractions.length > 0)) {
      const proceed = window.confirm(
        'Reset this trip plan? All entered details and the generated itinerary will be cleared.'
      );
      if (!proceed) return;
    }

    setPickup('');
    setDestination('');
    setDepartureDate(todayStr);
    const d = new Date(todayStr);
    d.setDate(d.getDate() + 2);
    setReturnDate(d.toISOString().split('T')[0]);
    setTravellers(2);
    setTransportMode('Train');
    setAccommodationType('Hotel');
    setHotelBudgetPerNight(2000);
    setSelectedAttractions([]);
    setCustomAttractionInput('');
    setAttractionError(null);
    setTotalBudget(25000);
    setValidationErrors([]);
    setFieldErrors({});
    setPlanGenerated(false);
    setItineraryDays([]);

    if (setTripParams) {
      setTripParams({
        origin: '',
        destination: '',
        travelDate: todayStr,
        urgency: 'scheduled',
        travellers: 2,
        adults: 2,
        children: 0,
        seniors: 0,
        nights: 2,
        rooms: 1,
        totalBudget: 25000,
        hotelBudgetAmount: 2000,
        hotelBudgetMode: 'per_room_per_night',
        preferredTransport: 'all',
        packagePreference: 'compare_both',
      });
    }

    try {
      localStorage.removeItem('triptogether_itinerary_v1');
    } catch {}

    setToastMessage('Trip planner reset successfully. Ready to plan a new trip!');
    setTimeout(() => setToastMessage(null), 3000);
  };

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#0F1E36] text-white text-xs font-semibold rounded-2xl shadow-2xl border border-teal-500/30 flex items-center gap-2 animate-in fade-in">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* =========================================================================
          SECTION 1: PLAN YOUR TRIP (Compact Introduction)
          ========================================================================= */}
      <div className="pb-4 border-b border-stone-200">
        <div className="flex items-center gap-2 mb-1.5">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-[#0D9488] border border-emerald-200/80 text-[11px] font-bold uppercase tracking-wider">
            <Compass className="w-3.5 h-3.5" />
            Trip Planner
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif-display">
          Plan Your Trip
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 mt-1">
          Customize your journey, manage your budget, and create your travel itinerary.
        </p>
      </div>

      {/* Validation Alert */}
      {validationErrors.length > 0 && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1 animate-in fade-in">
          <div className="flex items-center gap-2 font-bold text-rose-900">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>Please complete required trip details:</span>
          </div>
          <ul className="list-disc list-inside pl-2 space-y-0.5 text-rose-700">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* =========================================================================
          SECTION 2: TRIP DETAILS (Pickup, Destination, Dates, Travellers)
          ========================================================================= */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif-display flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[#0D9488]" />
            Trip Details
          </h2>
          <span className="text-[11px] text-stone-400">Step 1 of 4</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Pickup Location */}
          <AutocompleteLocationInput
            id="pickup-location"
            label="Pickup Location"
            value={pickup}
            onChange={(val) => {
              setPickup(val);
              setValidationErrors([]);
              setFieldErrors((prev) => ({ ...prev, pickup: '' }));
            }}
            placeholder="Enter pickup location"
            hasError={!!fieldErrors.pickup}
            errorMessage={fieldErrors.pickup}
          />

          {/* Destination */}
          <AutocompleteLocationInput
            id="destination-location"
            label="Destination"
            value={destination}
            onChange={(val) => {
              setDestination(val);
              setValidationErrors([]);
              setFieldErrors((prev) => ({ ...prev, destination: '' }));
            }}
            placeholder="Enter destination"
            hasError={!!fieldErrors.destination}
            errorMessage={fieldErrors.destination}
          />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {/* Departure Date */}
          <div>
            <label htmlFor="dep-date" className="block text-xs font-bold text-slate-700 mb-1.5">
              Departure Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="dep-date"
                type="date"
                min={todayStr}
                value={departureDate}
                onChange={(e) => {
                  setDepartureDate(e.target.value);
                  if (returnDate && e.target.value > returnDate) {
                    setReturnDate(e.target.value);
                  }
                  setValidationErrors([]);
                  setFieldErrors((prev) => ({ ...prev, departureDate: '' }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-900 transition-all cursor-pointer ${
                  fieldErrors.departureDate
                    ? 'bg-rose-50/40 border border-rose-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20'
                    : 'bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]'
                }`}
              />
            </div>
            {fieldErrors.departureDate && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.departureDate}</span>
              </p>
            )}
          </div>

          {/* Return Date */}
          <div>
            <label htmlFor="ret-date" className="block text-xs font-bold text-slate-700 mb-1.5">
              Return Date <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <input
                id="ret-date"
                type="date"
                min={departureDate || todayStr}
                value={returnDate}
                onChange={(e) => {
                  setReturnDate(e.target.value);
                  setValidationErrors([]);
                  setFieldErrors((prev) => ({ ...prev, returnDate: '' }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-900 transition-all cursor-pointer ${
                  fieldErrors.returnDate
                    ? 'bg-rose-50/40 border border-rose-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20'
                    : 'bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]'
                }`}
              />
            </div>
            {fieldErrors.returnDate && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.returnDate}</span>
              </p>
            )}
          </div>

          {/* Number of Travellers */}
          <div>
            <label htmlFor="traveller-count" className="block text-xs font-bold text-slate-700 mb-1.5">
              Number of Travellers <span className="text-rose-500">*</span>
            </label>
            <div className="flex items-center gap-2">
              <select
                id="traveller-count"
                value={travellers}
                onChange={(e) => {
                  setTravellers(Number(e.target.value));
                  setFieldErrors((prev) => ({ ...prev, travellers: '' }));
                }}
                className={`w-full px-3.5 py-2.5 rounded-xl text-sm text-slate-900 transition-all cursor-pointer ${
                  fieldErrors.travellers
                    ? 'bg-rose-50/40 border border-rose-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20'
                    : 'bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]'
                }`}
              >
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 15, 20].map((num) => (
                  <option key={num} value={num}>
                    {num} {num === 1 ? 'Traveller (Solo)' : num <= 4 ? 'Travellers (Family)' : 'Travellers (Group)'}
                  </option>
                ))}
              </select>
            </div>
            {fieldErrors.travellers && (
              <p className="text-[11px] text-rose-600 mt-1 font-medium flex items-center gap-1">
                <AlertCircle className="w-3 h-3 shrink-0" />
                <span>{fieldErrors.travellers}</span>
              </p>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 3: TRANSPORTATION AND ACCOMMODATION
          ========================================================================= */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif-display flex items-center gap-2">
            <Train className="w-4 h-4 text-[#0D9488]" />
            Transportation & Accommodation
          </h2>
          <span className="text-[11px] text-stone-400">Step 2 of 4</span>
        </div>

        {/* Transportation Choice */}
        <div>
          <label className="block text-xs font-bold text-slate-700 mb-2">
            Transportation Choice
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {[
              { id: 'Train', label: 'Train', icon: Train, desc: 'Express / Rail' },
              { id: 'Bus', label: 'Bus', icon: Bus, desc: 'Intercity Coach' },
              { id: 'Car', label: 'Car', icon: Car, desc: 'Private Cab / Drive' },
              { id: 'Flight', label: 'Flight', icon: Plane, desc: 'Domestic Air' },
            ].map((mode) => {
              const Icon = mode.icon;
              const isSelected = transportMode === mode.id;
              return (
                <button
                  key={mode.id}
                  type="button"
                  onClick={() => setTransportMode(mode.id as any)}
                  className={`p-3 rounded-xl border text-left transition-all cursor-pointer flex flex-col justify-between ${
                    isSelected
                      ? 'border-[#0D9488] bg-teal-50/60 ring-2 ring-[#0D9488]/20 shadow-xs'
                      : 'border-stone-200 bg-white hover:bg-stone-50'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Icon className={`w-4 h-4 ${isSelected ? 'text-[#0D9488]' : 'text-stone-500'}`} />
                    {isSelected && (
                      <span className="w-2 h-2 rounded-full bg-[#0D9488]" />
                    )}
                  </div>
                  <div className="mt-2">
                    <div className="text-xs font-bold text-slate-900">{mode.label}</div>
                    <div className="text-[10px] text-stone-500">{mode.desc}</div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Distance, Travel Time & Cost Indicator */}
          <div className="mt-3.5 p-3.5 bg-stone-50 rounded-xl border border-stone-200 text-xs">
            {pickup && destination && transportMetrics ? (
              <div className="space-y-1">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="font-bold text-slate-900">
                    Route Corridor: ~{transportMetrics.distanceKm} km
                  </span>
                  <span className="text-stone-400">•</span>
                  <span className="text-stone-700">
                    Estimated Transit Time: <strong>{transportMetrics.travelTime}</strong>
                  </span>
                </div>
                <div className="text-[11px] text-stone-600">
                  {transportMetrics.costDescription}
                </div>
              </div>
            ) : pickup && destination ? (
              <div className="text-stone-500 italic">
                Route distance estimate unavailable for custom locality; check official carrier schedules.
              </div>
            ) : (
              <div className="text-stone-400 italic">
                Enter pickup location and destination above to view travel time and distance estimates.
              </div>
            )}
          </div>
        </div>

        {/* Accommodation Choice & Budget per Night */}
        <div className="pt-2 border-t border-stone-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Preference: Hotel or Homestay */}
            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Accommodation Preference
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'Hotel', label: 'Hotel', icon: Building2 },
                  { id: 'Homestay', label: 'Homestay', icon: Home },
                ].map((stay) => {
                  const Icon = stay.icon;
                  const isSelected = accommodationType === stay.id;
                  return (
                    <button
                      key={stay.id}
                      type="button"
                      onClick={() => setAccommodationType(stay.id as any)}
                      className={`p-2.5 rounded-xl border flex items-center justify-center gap-2 text-xs font-bold transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0D9488] bg-teal-50 text-[#0D9488]'
                          : 'border-stone-200 bg-white text-stone-700 hover:bg-stone-50'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                      <span>{stay.label}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Accommodation Budget Per Night */}
            <div>
              <label htmlFor="hotel-budget-input" className="block text-xs font-bold text-slate-700 mb-1.5">
                Accommodation Budget Per Night (₹)
              </label>
              <div className="relative">
                <IndianRupee className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  id="hotel-budget-input"
                  type="number"
                  min={500}
                  step={200}
                  value={hotelBudgetPerNight}
                  onChange={(e) => setHotelBudgetPerNight(Math.max(0, Number(e.target.value)))}
                  className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-semibold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-all"
                />
              </div>
            </div>
          </div>

          {/* Link to Explore Hotels Page */}
          <div className="mt-4 flex items-center justify-between bg-teal-50/50 p-3 rounded-xl border border-teal-200/60">
            <div className="text-xs text-stone-700">
              Looking for verified hotels in Tirupati, Manali, Kerala, Jaipur, or Varanasi?
            </div>
            {onNavigateHotels ? (
              <button
                type="button"
                onClick={onNavigateHotels}
                className="text-xs font-bold text-[#0D9488] hover:text-[#0f766e] hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Explore Hotels & Rooms</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            ) : (
              <a
                href="#hotels"
                className="text-xs font-bold text-[#0D9488] hover:text-[#0f766e] hover:underline inline-flex items-center gap-1 cursor-pointer shrink-0"
              >
                <span>Explore Hotels & Rooms</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            )}
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 4: PLACES TO VISIT
          ========================================================================= */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif-display flex items-center gap-2">
              <Compass className="w-4 h-4 text-[#0D9488]" />
              Places to Visit
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Select key landmarks or add custom attractions to include in your itinerary.
            </p>
          </div>
          <span className="text-[11px] text-stone-400">Step 3 of 4</span>
        </div>

        {/* Popular Destination Suggestions */}
        {availableAttractions.length > 0 && (
          <div>
            <div className="text-xs font-bold text-slate-700 mb-2">
              Popular Attractions for {destination || 'Selected Destination'}
            </div>
            <div className="flex flex-wrap gap-2">
              {availableAttractions.map((place) => {
                const isSelected = selectedAttractions.includes(place);
                return (
                  <button
                    key={place}
                    type="button"
                    onClick={() => handleToggleAttraction(place)}
                    className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                      isSelected
                        ? 'bg-[#0D9488] text-white shadow-xs'
                        : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
                    }`}
                  >
                    <span>{isSelected ? '✓' : '+'}</span>
                    <span>{place}</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Add Custom Place Input */}
        <div className="space-y-1.5 pt-1">
          <form onSubmit={handleAddCustomAttraction} className="flex gap-2">
            <input
              id="custom-place-input"
              type="text"
              value={customAttractionInput}
              onChange={(e) => {
                setCustomAttractionInput(e.target.value);
                if (attractionError) setAttractionError(null);
              }}
              placeholder="Enter place or attraction name (e.g. Amber Fort, Baga Beach, City Palace)..."
              className={`flex-1 px-3.5 py-2 rounded-xl text-xs text-slate-900 transition-all ${
                attractionError
                  ? 'bg-rose-50/30 border border-rose-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-rose-500/20'
                  : 'bg-stone-50 border border-stone-200 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]'
              }`}
            />
            <button
              type="submit"
              id="add-place-btn"
              className="px-4 py-2 bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-xl transition-all cursor-pointer shrink-0 shadow-xs flex items-center gap-1.5 active:scale-95"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Place</span>
            </button>
          </form>
          {attractionError && (
            <p className="text-[11px] text-rose-600 font-medium flex items-center gap-1 animate-in fade-in">
              <AlertCircle className="w-3.5 h-3.5 shrink-0" />
              <span>{attractionError}</span>
            </p>
          )}
        </div>

        {/* Selected Attractions Display */}
        <div className="pt-2 border-t border-stone-100">
          <div className="text-xs font-bold text-slate-700 mb-2">
            Selected Attractions ({selectedAttractions.length})
          </div>
          {selectedAttractions.length > 0 ? (
            <div className="flex flex-wrap gap-2">
              {selectedAttractions.map((place) => (
                <span
                  key={place}
                  className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-teal-50 border border-teal-200 text-[#0D4A42] text-xs font-medium"
                >
                  <span>{place}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveAttraction(place)}
                    aria-label={`Remove ${place}`}
                    className="hover:text-rose-600 cursor-pointer"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </span>
              ))}
            </div>
          ) : (
            <div className="text-xs text-stone-400 italic">
              No attractions selected yet. Select from popular places above or type a custom attraction.
            </div>
          )}
        </div>
      </div>

      {/* =========================================================================
          SECTION 5: BUDGET SUMMARY
          ========================================================================= */}
      <div className="bg-white border border-stone-200 rounded-2xl p-5 sm:p-6 shadow-xs space-y-5">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 font-serif-display flex items-center gap-2">
              <Wallet className="w-4 h-4 text-[#0D9488]" />
              Budget Summary
            </h2>
            <p className="text-xs text-stone-500 mt-0.5">
              Live cost calculations based on your selected journey details.
            </p>
          </div>
          <span className="text-[11px] text-stone-400">Step 4 of 4</span>
        </div>

        {/* Total Budget Input */}
        <div>
          <label htmlFor="total-trip-budget" className="block text-xs font-bold text-slate-700 mb-1.5">
            Your Total Trip Budget (₹)
          </label>
          <div className="relative max-w-xs">
            <IndianRupee className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              id="total-trip-budget"
              type="number"
              min={1000}
              step={1000}
              value={totalBudget}
              onChange={(e) => setTotalBudget(Math.max(0, Number(e.target.value)))}
              className="w-full pl-9 pr-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-sm font-bold text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488] transition-all"
            />
          </div>
        </div>

        {/* Itemized Expenses Breakdown */}
        <div className="bg-stone-50 rounded-xl p-4 border border-stone-200 space-y-2.5 text-xs">
          <div className="flex justify-between items-center text-slate-700">
            <span>
              Transportation Expenses ({transportMode} round-trip):
            </span>
            <span className="font-bold text-slate-900">
              {transportationExpense > 0
                ? `₹${transportationExpense.toLocaleString('en-IN')}`
                : 'Estimate unavailable'}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-700">
            <span>
              Accommodation Expenses ({calculatedNights} nights × ₹{hotelBudgetPerNight.toLocaleString('en-IN')}/night):
            </span>
            <span className="font-bold text-slate-900">
              ₹{accommodationExpense.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-700">
            <span>
              Food & Meals ({calculatedNights} nights × {travellers} pax × ₹{dailyFoodEstimate}/day):
            </span>
            <span className="font-bold text-slate-900">
              ₹{foodExpense.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-700">
            <span>
              Sightseeing & Activities ({selectedAttractions.length} places × {travellers} pax):
            </span>
            <span className="font-bold text-slate-900">
              ₹{sightseeingExpense.toLocaleString('en-IN')}
            </span>
          </div>

          <div className="pt-2 border-t border-stone-200 flex justify-between items-baseline font-bold">
            <span className="text-slate-900">Total Estimated Trip Cost:</span>
            <span className="text-base text-slate-900">
              ₹{totalEstimatedCost.toLocaleString('en-IN')}
            </span>
          </div>

          {/* Remaining Budget Status */}
          <div
            className={`pt-2 border-t border-dashed border-stone-200 flex justify-between items-center font-bold ${
              remainingBudget >= 0 ? 'text-emerald-700' : 'text-rose-700'
            }`}
          >
            <span>Remaining Budget:</span>
            <span className="text-sm">
              {remainingBudget >= 0
                ? `₹${remainingBudget.toLocaleString('en-IN')} (Within Budget)`
                : `Exceeds Budget by ₹${Math.abs(remainingBudget).toLocaleString('en-IN')}`}
            </span>
          </div>
        </div>
      </div>

      {/* =========================================================================
          SECTION 6: GENERATE MY PLAN (Action Buttons & Resulting Itinerary)
          ========================================================================= */}
      <div className="space-y-6">
        {/* Validation Errors banner above the button */}
        {validationErrors.length > 0 && (
          <div
            id="planner-validation-banner"
            className="p-4 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-800 space-y-1.5 animate-in fade-in max-w-xl mx-auto"
          >
            <div className="flex items-center gap-2 font-bold text-rose-900">
              <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
              <span>Please complete required trip details before generating plan:</span>
            </div>
            <ul className="list-disc list-inside pl-2 space-y-0.5 text-rose-700">
              {validationErrors.map((err, i) => (
                <li key={i}>{err}</li>
              ))}
            </ul>
          </div>
        )}

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
          {/* Primary Action Button */}
          <button
            type="button"
            id="generate-plan-btn"
            onClick={handleGeneratePlan}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#0D9488] hover:bg-[#0f766e] text-white text-sm font-bold rounded-2xl shadow-md hover:shadow-lg transition-all cursor-pointer flex items-center justify-center gap-2 active:scale-98"
          >
            <Sparkles className="w-4 h-4 text-teal-200" />
            <span>Generate My Plan</span>
          </button>

          {/* Reset Button */}
          <button
            type="button"
            id="reset-plan-btn"
            onClick={handleResetPlan}
            className="w-full sm:w-auto px-6 py-3.5 bg-white border border-stone-300 hover:bg-stone-100 text-slate-700 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center justify-center gap-1.5 active:scale-98"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset Plan</span>
          </button>
        </div>

        {/* Resulting Itinerary Display */}
        {planGenerated && itineraryDays.length > 0 && (
          <div ref={itineraryRef} className="space-y-6 pt-4 animate-in fade-in duration-300">
            {/* Itinerary Summary Header Card */}
            <div className="bg-gradient-to-br from-[#0F1E36] to-[#0D4A42] text-white p-6 rounded-3xl shadow-lg space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
                <div>
                  <div className="text-xs text-teal-300 font-bold uppercase tracking-wider">
                    Generated Travel Plan
                  </div>
                  <h3 className="text-xl sm:text-2xl font-bold font-serif-display mt-0.5">
                    {pickup} ➔ {destination}
                  </h3>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-xs font-bold text-white transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <Printer className="w-3.5 h-3.5" />
                    <span>Print Itinerary</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                <div className="bg-white/10 p-3 rounded-2xl">
                  <div className="text-stone-300 text-[10px]">Travel Dates</div>
                  <div className="font-bold mt-0.5">{departureDate} – {returnDate}</div>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl">
                  <div className="text-stone-300 text-[10px]">Travellers & Stay</div>
                  <div className="font-bold mt-0.5">{travellers} Pax · {calculatedNights} Nights</div>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl">
                  <div className="text-stone-300 text-[10px]">Transit & Stay Mode</div>
                  <div className="font-bold mt-0.5">{transportMode} · {accommodationType}</div>
                </div>
                <div className="bg-white/10 p-3 rounded-2xl">
                  <div className="text-stone-300 text-[10px]">Estimated Cost</div>
                  <div className="font-bold mt-0.5">₹{totalEstimatedCost.toLocaleString('en-IN')}</div>
                </div>
              </div>
            </div>

            {/* Day-by-Day Cards */}
            <div className="space-y-4">
              {itineraryDays.map((day) => (
                <div
                  key={day.dayNumber}
                  className="bg-white border border-stone-200 rounded-2xl p-5 shadow-xs space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full bg-[#0D9488] text-white text-xs font-bold flex items-center justify-center">
                        {day.dayNumber}
                      </span>
                      <h4 className="text-sm font-bold text-slate-900">
                        Day {day.dayNumber}: {day.title}
                      </h4>
                    </div>
                    <span className="text-xs text-stone-500 font-medium">
                      {day.dateLabel}
                    </span>
                  </div>

                  {/* Day Activities */}
                  <div className="space-y-2.5">
                    {day.activities.map((act) => (
                      <div
                        key={act.id}
                        className="p-3 bg-stone-50 rounded-xl border border-stone-100 flex items-start justify-between gap-3 text-xs"
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-mono-num font-bold text-[#0D9488]">
                              {act.timeSlot}
                            </span>
                            <span className="font-bold text-slate-900">
                              {act.placeName}
                            </span>
                            <span className="text-[10px] bg-stone-200 text-stone-700 px-2 py-0.5 rounded-md">
                              {act.category}
                            </span>
                          </div>
                          <p className="text-stone-600 leading-relaxed">
                            {act.description}
                          </p>
                          {act.verifiedNotes && (
                            <div className="text-[11px] text-stone-400 italic">
                              Note: {act.verifiedNotes}
                            </div>
                          )}
                        </div>

                        <div className="text-right shrink-0">
                          <div className="font-bold text-slate-900 font-mono-num">
                            ₹{(act.estimatedTransportCostFamily + act.estimatedFoodOrTicketCostFamily).toLocaleString('en-IN')}
                          </div>
                          <div className="text-[10px] text-stone-400">est. costs</div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Day Footer Note */}
                  <div className="pt-2 text-[11px] text-stone-500 flex items-center justify-between">
                    <span>Stay: <strong>{day.accommodationName}</strong></span>
                    <span>Night Tariff: ₹{day.accommodationNightCostTotal.toLocaleString('en-IN')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
