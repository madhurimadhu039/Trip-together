import React, { useState, useMemo } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  ExternalLink,
  CheckCircle2,
  Calendar,
  Search,
  SlidersHorizontal,
  Star,
  Users,
  Bed,
  Wifi,
  Sparkles,
  ArrowRight,
  X,
  ShieldCheck,
  Clock,
  Info,
  ChevronRight,
  Compass,
  Bookmark,
} from 'lucide-react';
import type { TripParams, HotelOption, HotelRoomType, SavedBookingItem } from '../types';
import { ALL_HOTELS, HOTEL_DESTINATIONS, HotelDestinationMeta } from '../data/hotelsData';

interface HotelsSectionProps {
  tripParams?: TripParams;
  setTripParams?: React.Dispatch<React.SetStateAction<TripParams>>;
  hotels?: HotelOption[];
  hotelImageUrl?: string;
  onShortlistBooking?: (item: Omit<SavedBookingItem, 'id' | 'addedAt'>) => void;
  onNavigateHome?: () => void;
}

export const HotelsSection: React.FC<HotelsSectionProps> = ({
  tripParams,
  setTripParams,
  hotels = ALL_HOTELS,
  onShortlistBooking,
  onNavigateHome,
}) => {
  // Active Destination Tab: 'all' or specific destination id
  const [selectedDestination, setSelectedDestination] = useState<
    'all' | 'tirupati' | 'manali' | 'kerala' | 'jaipur' | 'varanasi'
  >('all');

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'recommended' | 'price_low' | 'price_high' | 'rating'>(
    'recommended'
  );
  const [acOnly, setAcOnly] = useState(false);

  // Active Hotel for Room Details Modal
  const [activeHotelModal, setActiveHotelModal] = useState<HotelOption | null>(null);
  const [selectedRoomId, setSelectedRoomId] = useState<string | null>(null);
  const [bookingToast, setBookingToast] = useState<string | null>(null);

  // Ensure we use the full hotel list across all 5 destinations
  const hotelList = useMemo(() => {
    return hotels && hotels.length > 0 ? hotels : ALL_HOTELS;
  }, [hotels]);

  // Unique categories for filter pills
  const categories = useMemo(() => {
    const set = new Set<string>();
    hotelList.forEach((h) => {
      if (h.propertyCategory) set.add(h.propertyCategory);
    });
    return Array.from(set);
  }, [hotelList]);

  // Filter & Sort Logic
  const filteredHotels = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();

    return hotelList.filter((hotel) => {
      // 1. Destination Filter
      if (selectedDestination !== 'all') {
        const destMatch =
          hotel.destinationSlug === selectedDestination ||
          hotel.destination?.toLowerCase().includes(selectedDestination);
        if (!destMatch) return false;
      }

      // 2. Category Filter
      if (selectedCategory !== 'all') {
        if (hotel.propertyCategory !== selectedCategory) return false;
      }

      // 3. AC Only Filter
      if (acOnly && !hotel.isAcAvailable) return false;

      // 4. Text Search
      if (q) {
        const inName = hotel.name.toLowerCase().includes(q);
        const inDest = (hotel.destination || '').toLowerCase().includes(q);
        const inLoc = hotel.locationArea.toLowerCase().includes(q);
        const inDesc = (hotel.shortDescription || '').toLowerCase().includes(q);
        const inAmenities = hotel.amenities.some((a) => a.toLowerCase().includes(q));
        const inRooms = hotel.roomTypes.some((r) => r.name.toLowerCase().includes(q));

        if (!inName && !inDest && !inLoc && !inDesc && !inAmenities && !inRooms) {
          return false;
        }
      }

      return true;
    });
  }, [hotelList, selectedDestination, selectedCategory, acOnly, searchQuery]);

  // Sorted Hotels
  const sortedHotels = useMemo(() => {
    const list = [...filteredHotels];
    if (sortBy === 'price_low') {
      list.sort((a, b) => a.basePricePerRoomPerNight - b.basePricePerRoomPerNight);
    } else if (sortBy === 'price_high') {
      list.sort((a, b) => b.basePricePerRoomPerNight - a.basePricePerRoomPerNight);
    } else if (sortBy === 'rating') {
      list.sort((a, b) => b.guestRating - a.guestRating);
    }
    return list;
  }, [filteredHotels, sortBy]);

  // Group hotels by destination for organized multi-destination view
  const hotelsByDestination = useMemo(() => {
    const map: Record<string, HotelOption[]> = {
      tirupati: [],
      manali: [],
      kerala: [],
      jaipur: [],
      varanasi: [],
    };

    sortedHotels.forEach((h) => {
      const slug = h.destinationSlug || h.destination?.toLowerCase() || '';
      if (slug.includes('tirupati')) map.tirupati.push(h);
      else if (slug.includes('manali')) map.manali.push(h);
      else if (slug.includes('kerala')) map.kerala.push(h);
      else if (slug.includes('jaipur')) map.jaipur.push(h);
      else if (slug.includes('varanasi')) map.varanasi.push(h);
    });

    return map;
  }, [sortedHotels]);

  // Handle saving room/hotel to ledger
  const handleShortlistRoom = (hotel: HotelOption, room: HotelRoomType) => {
    if (onShortlistBooking) {
      onShortlistBooking({
        category: 'Accommodation',
        title: `${hotel.name} — ${room.name}`,
        provider: hotel.name,
        status: 'Estimated',
        totalFamilyCost:
          room.pricePerNight * (tripParams?.rooms || 1) * (tripParams?.nights || 2),
        officialUrl: hotel.officialBookingUrl,
        notes: `Check-in: ${hotel.checkInTime} · Check-out: ${hotel.checkOutTime} · ₹${room.pricePerNight.toLocaleString('en-IN')}/night`,
      });
    }

    setBookingToast(`✓ Saved ${room.name} at ${hotel.name} to your trip budget!`);
    setTimeout(() => setBookingToast(null), 3500);
  };

  const handleOpenModal = (hotel: HotelOption) => {
    setActiveHotelModal(hotel);
    setSelectedRoomId(hotel.roomTypes[0]?.id || hotel.roomTypes[0]?.name || null);
  };

  const handleClearFilters = () => {
    setSelectedDestination('all');
    setSelectedCategory('all');
    setSearchQuery('');
    setAcOnly(false);
    setSortBy('recommended');
  };

  return (
    <div className="space-y-10">
      {/* =========================================================================
          PAGE HEADER
          ========================================================================= */}
      <div className="pb-6 border-b border-stone-200">
        {onNavigateHome && (
          <button
            type="button"
            onClick={onNavigateHome}
            className="text-xs font-semibold text-[#0D9488] hover:underline mb-2 inline-flex items-center gap-1 cursor-pointer"
          >
            ← Back to Home
          </button>
        )}
        <div className="flex items-center gap-2 mb-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-[#0D9488] border border-emerald-200/80 text-[11px] font-bold uppercase tracking-wider">
            <Building2 className="w-3.5 h-3.5" />
            Verified Stays & Hotels
          </span>
          <span className="text-xs text-stone-400">•</span>
          <span className="text-xs text-stone-500 font-medium">
            5 Iconic Destinations · 20 Verified Accommodations
          </span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif-display">
          Hotels & Stays Discovery
        </h1>
        <p className="text-xs sm:text-sm text-stone-600 max-w-3xl mt-1.5 leading-relaxed">
          Discover verified hotels, official state tourism board retreats, and heritage havelis across 
          <strong> Tirupati, Manali, Kerala, Jaipur, and Varanasi</strong>. Inspect room types, transparent 
          per-night tariffs, and reserve directly with certified properties.
        </p>
      </div>

      {/* Toast Notification */}
      {bookingToast && (
        <div className="fixed bottom-6 right-6 z-50 p-4 bg-[#0F1E36] text-white text-xs font-semibold rounded-2xl shadow-2xl flex items-center gap-3 animate-in fade-in slide-in-from-bottom duration-200">
          <CheckCircle2 className="w-4 h-4 text-teal-300 shrink-0" />
          <span>{bookingToast}</span>
          <button
            type="button"
            onClick={() => setBookingToast(null)}
            className="text-stone-400 hover:text-white ml-2 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* =========================================================================
          DESTINATION NAVIGATION TABS & SEARCH CONTROLS
          ========================================================================= */}
      <div className="bg-white border border-stone-200/90 rounded-3xl p-5 sm:p-6 shadow-xs space-y-5">
        {/* Top Destination Filter Tabs */}
        <div>
          <label className="text-[11px] font-bold uppercase tracking-wider text-stone-500 block mb-2.5">
            Browse by Destination:
          </label>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => setSelectedDestination('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                selectedDestination === 'all'
                  ? 'bg-[#0F1E36] text-white shadow-xs'
                  : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
              }`}
            >
              <span>All 5 Destinations</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  selectedDestination === 'all'
                    ? 'bg-white/20 text-white'
                    : 'bg-stone-200 text-stone-600'
                }`}
              >
                {hotelList.length}
              </span>
            </button>

            {HOTEL_DESTINATIONS.map((dest) => {
              const count = hotelList.filter(
                (h) => h.destinationSlug === dest.id || h.destination?.toLowerCase().includes(dest.id)
              ).length;
              const isSelected = selectedDestination === dest.id;

              return (
                <button
                  key={dest.id}
                  type="button"
                  onClick={() => setSelectedDestination(dest.id)}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 ${
                    isSelected
                      ? 'bg-[#0D9488] text-white shadow-xs'
                      : 'bg-stone-100 text-slate-700 hover:bg-stone-200'
                  }`}
                >
                  <MapPin className="w-3.5 h-3.5" />
                  <span>{dest.name} Hotels</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                      isSelected ? 'bg-white/20 text-white' : 'bg-stone-200 text-stone-600'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Search Bar & Secondary Filters */}
        <div className="pt-4 border-t border-stone-100 grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
          {/* Search Input */}
          <div className="md:col-span-5 relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search hotel name, location area, or amenities..."
              className="w-full pl-10 pr-9 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-slate-900 placeholder:text-stone-400 placeholder:font-normal focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488] transition-all"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-600 cursor-pointer"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          {/* Property Category Filter */}
          <div className="md:col-span-3">
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488] cursor-pointer"
            >
              <option value="all">All Property Categories</option>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Sort By */}
          <div className="md:col-span-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="w-full py-2.5 px-3 bg-stone-50 border border-stone-200 rounded-xl text-xs font-semibold text-slate-800 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488] cursor-pointer"
            >
              <option value="recommended">Featured Recommended</option>
              <option value="price_low">Tariff: Low to High</option>
              <option value="price_high">Tariff: High to Low</option>
              <option value="rating">Top Guest Rating</option>
            </select>
          </div>

          {/* AC Filter Toggle */}
          <div className="md:col-span-2 flex items-center justify-start md:justify-end">
            <label className="inline-flex items-center gap-2 cursor-pointer text-xs font-bold text-slate-700 select-none">
              <input
                type="checkbox"
                checked={acOnly}
                onChange={(e) => setAcOnly(e.target.checked)}
                className="w-4 h-4 rounded text-[#0D9488] focus:ring-[#0D9488] accent-[#0D9488] cursor-pointer"
              />
              <span>100% AC Stays</span>
            </label>
          </div>
        </div>
      </div>

      {/* Active Filter Summary Info */}
      {(searchQuery || selectedCategory !== 'all' || acOnly || selectedDestination !== 'all') && (
        <div className="flex flex-wrap items-center justify-between gap-2 px-4 py-2.5 bg-stone-100 rounded-xl text-xs text-slate-700">
          <div className="flex items-center gap-2">
            <span className="font-semibold">Showing {sortedHotels.length} hotels matching:</span>
            {selectedDestination !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 font-bold capitalize">
                {selectedDestination}
              </span>
            )}
            {searchQuery && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 font-medium">
                &ldquo;{searchQuery}&rdquo;
              </span>
            )}
            {selectedCategory !== 'all' && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 font-medium">
                {selectedCategory}
              </span>
            )}
            {acOnly && (
              <span className="px-2 py-0.5 rounded-md bg-white border border-stone-200 font-medium">
                AC Only
              </span>
            )}
          </div>
          <button
            type="button"
            onClick={handleClearFilters}
            className="text-[#0D9488] font-bold hover:underline cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      )}

      {/* =========================================================================
          HOTEL LISTINGS: ORGANIZED BY DESTINATION OR FILTERED VIEW
          ========================================================================= */}
      {sortedHotels.length === 0 ? (
        /* Empty State */
        <div className="bg-white rounded-3xl border border-stone-200 p-12 text-center max-w-lg mx-auto space-y-4 shadow-xs">
          <div className="w-14 h-14 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Building2 className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-slate-900">No hotels match your filters</h3>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              We couldn&apos;t find any verified hotels matching your current search criteria. Try clearing 
              your search query or switching destinations.
            </p>
          </div>
          <button
            type="button"
            onClick={handleClearFilters}
            className="px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-bold transition-all cursor-pointer shadow-xs"
          >
            Show All 20 Hotels
          </button>
        </div>
      ) : selectedDestination === 'all' && !searchQuery && selectedCategory === 'all' && !acOnly ? (
        /* Multi-Destination Grouped View (All 5 Destinations Organized in Distinct Sections) */
        <div className="space-y-14">
          {HOTEL_DESTINATIONS.map((dest) => {
            const destHotels = hotelsByDestination[dest.id] || [];
            if (destHotels.length === 0) return null;

            return (
              <section key={dest.id} className="space-y-6">
                {/* Destination Section Banner */}
                <div className="bg-gradient-to-r from-stone-900 via-slate-900 to-[#0F1E36] rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-md">
                  <div className="relative z-10 max-w-2xl space-y-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-300 text-[10px] font-bold uppercase tracking-wider border border-teal-400/30">
                        {dest.badge}
                      </span>
                      <span className="text-stone-400 text-xs">•</span>
                      <span className="text-xs text-stone-300">{dest.state}</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold font-serif-display text-white">
                      {dest.name} Hotels
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-300 leading-relaxed">
                      {dest.description}
                    </p>
                  </div>
                  {/* Subtle destination badge right */}
                  <div className="hidden lg:block absolute right-8 top-1/2 -translate-y-1/2 text-right">
                    <button
                      type="button"
                      onClick={() => setSelectedDestination(dest.id)}
                      className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold backdrop-blur-xs transition-colors border border-white/20 inline-flex items-center gap-2 cursor-pointer"
                    >
                      <span>Filter {dest.name} Only</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                {/* Hotels Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {destHotels.map((hotel) => (
                    <HotelCard
                      key={hotel.id}
                      hotel={hotel}
                      onViewRooms={() => handleOpenModal(hotel)}
                    />
                  ))}
                </div>
              </section>
            );
          })}
        </div>
      ) : (
        /* Filtered List View (Single Destination or Search Results Grid) */
        <div className="space-y-6">
          <div className="flex items-center justify-between pb-2 border-b border-stone-200">
            <h2 className="text-xl font-bold text-slate-900 font-serif-display">
              {selectedDestination !== 'all'
                ? `${selectedDestination.charAt(0).toUpperCase() + selectedDestination.slice(1)} Hotels`
                : 'Search Results'}
              <span className="text-xs text-stone-500 font-normal ml-2">
                ({sortedHotels.length} verified properties)
              </span>
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {sortedHotels.map((hotel) => (
              <HotelCard
                key={hotel.id}
                hotel={hotel}
                onViewRooms={() => handleOpenModal(hotel)}
              />
            ))}
          </div>
        </div>
      )}

      {/* =========================================================================
          ROOM DETAILS MODAL (Dedicated Room View for Selected Hotel)
          ========================================================================= */}
      {activeHotelModal && (
        <HotelRoomDetailModal
          hotel={activeHotelModal}
          selectedRoomId={selectedRoomId}
          onSelectRoomId={setSelectedRoomId}
          onClose={() => setActiveHotelModal(null)}
          onShortlistRoom={handleShortlistRoom}
          tripParams={tripParams}
        />
      )}
    </div>
  );
};

/**
 * Individual Hotel Card Component
 */
const HotelCard: React.FC<{
  hotel: HotelOption;
  onViewRooms: () => void;
}> = ({ hotel, onViewRooms }) => {
  return (
    <div
      onClick={onViewRooms}
      className="group bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer focus-within:ring-2 focus-within:ring-[#0D9488]"
      role="button"
      tabIndex={0}
      onKeyDown={(e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          onViewRooms();
        }
      }}
      aria-label={`View rooms for ${hotel.name}`}
    >
      {/* Hotel Image with Badges */}
      <div className="relative h-48 overflow-hidden bg-stone-100">
        <img
          src={hotel.image}
          alt={hotel.name}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />

        {/* Top Destination & Category Badge */}
        <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-1 pointer-events-none">
          <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-slate-900 text-[11px] font-bold shadow-xs">
            {hotel.destination}
          </span>
          <span className="px-2 py-0.5 rounded-full bg-slate-900/80 backdrop-blur-xs text-teal-300 text-[10px] font-semibold border border-white/10">
            {hotel.propertyCategory}
          </span>
        </div>

        {/* Bottom Rating Pill */}
        <div className="absolute bottom-3 left-3 flex items-center gap-1.5 px-2 py-0.5 rounded-lg bg-black/60 backdrop-blur-xs text-white text-[11px] font-bold">
          <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
          <span>{hotel.guestRating.toFixed(1)}</span>
          <span className="text-[10px] font-normal text-stone-300">({hotel.reviewCount})</span>
        </div>
      </div>

      {/* Hotel Content */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-2">
          <h3 className="text-base font-bold text-slate-900 group-hover:text-[#0D9488] font-serif-display transition-colors line-clamp-2 leading-snug">
            {hotel.name}
          </h3>

          <p className="text-xs text-stone-500 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
            <span className="truncate">{hotel.locationArea}</span>
          </p>

          <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
            {hotel.shortDescription}
          </p>

          {/* Amenities Pills */}
          <div className="pt-1 flex flex-wrap gap-1.5">
            {hotel.amenities.slice(0, 3).map((amenity, idx) => (
              <span
                key={idx}
                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-slate-700"
              >
                {amenity}
              </span>
            ))}
            {hotel.amenities.length > 3 && (
              <span className="text-[10px] text-stone-400 font-medium self-center">
                +{hotel.amenities.length - 3} more
              </span>
            )}
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-stone-100 space-y-3">
          <div className="flex items-baseline justify-between">
            <div>
              <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider block">
                Starting from
              </span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-lg font-bold text-slate-900 font-mono-num">
                  ₹{hotel.basePricePerRoomPerNight.toLocaleString('en-IN')}
                </span>
                <span className="text-[11px] text-stone-500">/ room / night</span>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#0D9488] bg-teal-50 px-2 py-1 rounded-md border border-teal-100">
              {hotel.roomTypes.length} Room Types
            </span>
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onViewRooms();
            }}
            className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-100 group-hover:bg-[#0F1E36] text-slate-800 group-hover:text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs"
          >
            <span>View Rooms & Details</span>
            <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
          </button>
        </div>
      </div>
    </div>
  );
};

/**
 * Dedicated Room Details Modal Component
 */
const HotelRoomDetailModal: React.FC<{
  hotel: HotelOption;
  selectedRoomId: string | null;
  onSelectRoomId: (id: string) => void;
  onClose: () => void;
  onShortlistRoom: (hotel: HotelOption, room: HotelRoomType) => void;
  tripParams?: TripParams;
}> = ({
  hotel,
  selectedRoomId,
  onSelectRoomId,
  onClose,
  onShortlistRoom,
  tripParams,
}) => {
  // Currently inspected room
  const activeRoom = useMemo(() => {
    return (
      hotel.roomTypes.find((r) => (r.id || r.name) === selectedRoomId) || hotel.roomTypes[0]
    );
  }, [hotel, selectedRoomId]);

  const stayRooms = tripParams?.rooms || 1;
  const stayNights = tripParams?.nights || 2;
  const roomBaseTotal = activeRoom.pricePerNight * stayRooms * stayNights;
  const taxAmount = Math.round(roomBaseTotal * ((hotel.taxPercentage || 12) / 100));
  const totalWithTaxes = roomBaseTotal + taxAmount;

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl border border-stone-200 overflow-hidden relative animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Modal Top Bar */}
        <div className="p-5 sm:p-6 border-b border-stone-200 flex items-start justify-between bg-stone-50/70">
          <div className="space-y-1 pr-6">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-[#0D9488] text-white text-[10px] font-bold uppercase tracking-wider">
                {hotel.destination}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-stone-200 text-slate-800 text-[10px] font-bold">
                {hotel.propertyCategory}
              </span>
              <span className="inline-flex items-center gap-1 text-xs text-amber-600 font-bold">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {hotel.guestRating.toFixed(1)} ({hotel.reviewCount} reviews)
              </span>
            </div>
            <h2 className="text-xl sm:text-2xl font-bold text-slate-900 font-serif-display">
              {hotel.name}
            </h2>
            <p className="text-xs text-stone-500 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
              <span>{hotel.address}</span>
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close Room Details"
            className="w-9 h-9 rounded-full bg-white text-stone-500 hover:text-slate-900 hover:bg-stone-200 flex items-center justify-center transition-colors shadow-xs shrink-0 cursor-pointer border border-stone-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body: Scrollable Room Selection & Overview */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6 flex-1">
          {/* Hotel Description & Policy Strip */}
          <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200/80 space-y-3 text-xs">
            <p className="text-stone-700 leading-relaxed">{hotel.shortDescription}</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2 border-t border-stone-200/60 text-[11px]">
              <div className="flex items-center gap-1.5 text-stone-600">
                <Clock className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                <span>Check-in: <strong>{hotel.checkInTime}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-600">
                <Clock className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                <span>Check-out: <strong>{hotel.checkOutTime}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 text-stone-600">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Verification: <strong>{hotel.verificationBadge || 'Verified'}</strong></span>
              </div>
            </div>
          </div>

          {/* Room Selection Heading */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Select Available Room Type ({hotel.roomTypes.length} Available)
              </h3>
              <span className="text-[11px] text-stone-500">
                Click any room to inspect amenities & live pricing
              </span>
            </div>

            {/* Room Tabs Horizontal Selector */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {hotel.roomTypes.map((room) => {
                const isSelected = (room.id || room.name) === (activeRoom.id || activeRoom.name);

                return (
                  <div
                    key={room.id || room.name}
                    onClick={() => onSelectRoomId(room.id || room.name)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                      isSelected
                        ? 'border-[#0D9488] bg-teal-50/50 ring-2 ring-[#0D9488]/30 shadow-xs'
                        : 'border-stone-200 bg-white hover:border-stone-300'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[10px] font-bold text-teal-800 bg-teal-100/70 px-2 py-0.5 rounded-md">
                          {room.roomType || 'Standard'}
                        </span>
                        {room.isAc && (
                          <span className="text-[10px] font-medium text-slate-500">AC</span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 leading-snug line-clamp-1">
                        {room.name}
                      </h4>
                      <p className="text-[11px] text-stone-500 mt-0.5">
                        {room.bedConfiguration || 'Double Bed'} · Max {room.maxOccupancy} Guests
                      </p>
                    </div>

                    <div className="pt-2 border-t border-stone-100 flex items-baseline justify-between">
                      <span className="text-sm font-bold text-slate-900 font-mono-num">
                        ₹{room.pricePerNight.toLocaleString('en-IN')}
                      </span>
                      <span className="text-[10px] text-stone-500 font-medium">/ night</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active Room In-Depth Details Card */}
          {activeRoom && (
            <div className="border border-stone-200 rounded-3xl overflow-hidden bg-white shadow-xs">
              <div className="grid grid-cols-1 md:grid-cols-12 gap-0">
                {/* Room Image */}
                <div className="md:col-span-5 relative h-56 md:h-auto min-h-[200px] bg-stone-100">
                  <img
                    src={activeRoom.image || hotel.image}
                    alt={activeRoom.name}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute bottom-3 left-3 px-2.5 py-1 rounded-lg bg-black/70 backdrop-blur-xs text-white text-[11px] font-bold">
                    {activeRoom.roomType || 'Deluxe'}
                  </div>
                </div>

                {/* Room Features & Spec Breakdown */}
                <div className="md:col-span-7 p-5 sm:p-6 space-y-4 flex flex-col justify-between">
                  <div>
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="text-lg font-bold text-slate-900 font-serif-display">
                          {activeRoom.name}
                        </h4>
                        <p className="text-xs text-stone-500 mt-0.5">
                          {activeRoom.description || 'Spacious, sanitized room with dedicated hospitality.'}
                        </p>
                      </div>
                      <div className="text-right shrink-0">
                        <div className="text-xl font-bold text-slate-900 font-mono-num">
                          ₹{activeRoom.pricePerNight.toLocaleString('en-IN')}
                        </div>
                        <span className="text-[10px] text-stone-400 block">per night + taxes</span>
                      </div>
                    </div>

                    {/* Room Key Metrics */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 mt-4 pt-4 border-t border-stone-100 text-xs">
                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80">
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                          Occupancy
                        </span>
                        <div className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Users className="w-3.5 h-3.5 text-[#0D9488]" />
                          <span>Up to {activeRoom.maxOccupancy} Guests</span>
                        </div>
                      </div>

                      <div className="bg-stone-50 p-2.5 rounded-xl border border-stone-200/80">
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                          Beds
                        </span>
                        <div className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <Bed className="w-3.5 h-3.5 text-[#0D9488]" />
                          <span className="truncate">{activeRoom.bedConfiguration || '1 King Bed'}</span>
                        </div>
                      </div>

                      <div className="col-span-2 sm:col-span-1 bg-stone-50 p-2.5 rounded-xl border border-stone-200/80">
                        <span className="text-[10px] text-stone-400 font-bold uppercase tracking-wider block">
                          Air Conditioning
                        </span>
                        <div className="font-bold text-slate-800 flex items-center gap-1 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                          <span>{activeRoom.isAc ? 'Included (AC)' : 'Air-Cooled'}</span>
                        </div>
                      </div>
                    </div>

                    {/* Room Facilities List */}
                    <div className="mt-4">
                      <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
                        Room Amenities & Inclusions:
                      </span>
                      <div className="flex flex-wrap gap-1.5">
                        {(activeRoom.facilities || [
                          'Attached Bathroom',
                          '24/7 Hot Water',
                          'High-Speed Wi-Fi',
                          'LED Television',
                          'Fresh Linens',
                        ]).map((fac, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 text-[11px] px-2.5 py-1 rounded-lg bg-stone-100 text-slate-700 font-medium"
                          >
                            <CheckCircle2 className="w-3 h-3 text-[#0D9488]" />
                            <span>{fac}</span>
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Calculated Stay Estimate for Trip Planning */}
                  <div className="bg-teal-50/70 border border-teal-200/90 rounded-2xl p-3.5 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <span className="font-bold text-slate-900 block">
                        Estimated Family Stay ({stayRooms} Room · {stayNights} Nights):
                      </span>
                      <span className="text-stone-500 text-[11px]">
                        Base ₹{roomBaseTotal.toLocaleString('en-IN')} + {hotel.taxPercentage || 12}% GST (₹{taxAmount.toLocaleString('en-IN')})
                      </span>
                    </div>
                    <div className="text-right font-mono-num font-bold text-base text-[#0D4A42]">
                      ₹{totalWithTaxes.toLocaleString('en-IN')}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Policies & Transparency Note */}
          <div className="text-[11px] text-stone-500 bg-stone-50 p-3.5 rounded-xl border border-stone-200 space-y-1">
            <div>
              <strong>Cancellation Policy:</strong> {hotel.cancellationPolicy}
            </div>
            <div>
              <strong>Booking Transparency Note:</strong> Room rates and live inventory are verified with 
              property management. Confirm exact check-in counters and photo identification upon arrival.
            </div>
          </div>
        </div>

        {/* Modal Footer with Real Booking & Save Buttons */}
        <div className="p-4 sm:p-5 border-t border-stone-200 bg-stone-50/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="text-xs text-stone-500">
            Selected: <strong className="text-slate-800">{activeRoom.name}</strong> at {hotel.name}
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            {/* Save to Ledger Button */}
            <button
              type="button"
              onClick={() => onShortlistRoom(hotel, activeRoom)}
              className="px-4 py-2.5 rounded-xl border border-[#0D4A42] text-[#0D4A42] hover:bg-[#0D4A42] hover:text-white text-xs font-bold transition-colors inline-flex items-center gap-1.5 cursor-pointer shadow-2xs"
            >
              <Bookmark className="w-3.5 h-3.5" />
              <span>Add to Trip Budget Ledger</span>
            </button>

            {/* Official Hotel Direct Booking Button */}
            <a
              href={hotel.officialBookingUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-bold transition-all inline-flex items-center gap-2 cursor-pointer shadow-xs hover:shadow-md"
            >
              <span>Book on Official Hotel Portal</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};
