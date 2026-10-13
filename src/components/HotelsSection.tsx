import React, { useState } from 'react';
import {
  Building2,
  MapPin,
  Phone,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  Plus,
  SlidersHorizontal,
  Calendar,
} from 'lucide-react';
import type { TripParams, HotelOption, SavedBookingItem } from '../types';

interface HotelsSectionProps {
  tripParams: TripParams;
  setTripParams: React.Dispatch<React.SetStateAction<TripParams>>;
  hotels: HotelOption[];
  hotelImageUrl: string;
  onShortlistBooking: (item: Omit<SavedBookingItem, 'id' | 'addedAt'>) => void;
}

export const HotelsSection: React.FC<HotelsSectionProps> = ({
  tripParams,
  setTripParams,
  hotels,
  hotelImageUrl,
  onShortlistBooking,
}) => {
  const [acFilter, setAcFilter] = useState<'all' | 'ac_only' | 'non_ac'>('all');
  const [proximitySort, setProximitySort] = useState<'price' | 'railway' | 'alipiri' | 'rating'>('price');
  const [selectedRoomIndex, setSelectedRoomIndex] = useState<Record<string, number>>({});
  const [addedHotelKey, setAddedHotelKey] = useState<string | null>(null);

  // Compute stay pricing for each hotel based on selected room type, nights, and rooms
  const evaluatedHotels = hotels.map((hotel) => {
    const rIdx = selectedRoomIndex[hotel.id] ?? 0;
    const room = hotel.roomTypes[rIdx] || hotel.roomTypes[0];
    const perRoomPerNight = room.pricePerNight;
    const baseStayTotal = perRoomPerNight * tripParams.rooms * tripParams.nights;
    const taxTotal = Math.round(baseStayTotal * (hotel.taxPercentage / 100));
    const grandTotalStay = baseStayTotal + taxTotal;

    const matchesBudget =
      tripParams.hotelBudgetMode === 'per_room_per_night'
        ? perRoomPerNight <= tripParams.hotelBudgetAmount
        : baseStayTotal <= tripParams.hotelBudgetAmount;

    const budgetDifference =
      tripParams.hotelBudgetMode === 'per_room_per_night'
        ? perRoomPerNight - tripParams.hotelBudgetAmount
        : baseStayTotal - tripParams.hotelBudgetAmount;

    return {
      hotel,
      selectedRoom: room,
      selectedRoomIdx: rIdx,
      perRoomPerNight,
      baseStayTotal,
      taxTotal,
      grandTotalStay,
      matchesBudget,
      budgetDifference,
    };
  });

  const filteredByAc = evaluatedHotels.filter((item) => {
    if (acFilter === 'ac_only') return item.selectedRoom.isAc;
    if (acFilter === 'non_ac') return !item.selectedRoom.isAc;
    return true;
  });

  const sortedHotels = [...filteredByAc].sort((a, b) => {
    if (proximitySort === 'railway') {
      return a.hotel.distanceToRailwayStationKm - b.hotel.distanceToRailwayStationKm;
    }
    if (proximitySort === 'alipiri') {
      return a.hotel.distanceToAlipiriKm - b.hotel.distanceToAlipiriKm;
    }
    if (proximitySort === 'rating') {
      return b.hotel.guestRating - a.hotel.guestRating;
    }
    return a.baseStayTotal - b.baseStayTotal;
  });

  const exactMatches = sortedHotels.filter((h) => h.matchesBudget);
  const closestAlternatives = sortedHotels.filter((h) => !h.matchesBudget);

  // Quick preset buttons to demonstrate the exact user requirement (3 nights @ ₹2,000/night vs ₹2,000 entire stay)
  const applyPresetScenario = (
    nights: number,
    rooms: number,
    amount: number,
    mode: 'per_room_per_night' | 'total_stay'
  ) => {
    setTripParams((prev) => ({
      ...prev,
      nights,
      rooms,
      hotelBudgetAmount: amount,
      hotelBudgetMode: mode,
    }));
  };

  const computeCheckoutDate = (checkin: string, nights: number) => {
    try {
      const d = new Date(checkin);
      if (!isNaN(d.getTime())) {
        d.setDate(d.getDate() + nights);
        return d.toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' });
      }
    } catch {}
    return '';
  };

  return (
    <div className="space-y-8">
      {/* Header & Strict Budget Mode Controls */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <p className="text-xs text-slate-500">
              Verified Accommodation Discovery · {tripParams.destination}
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Hotels, TTD Pilgrim Complexes & Family Rooms
            </h2>
          </div>

          {/* Quick Scenario Presets */}
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs text-slate-500">Test Budget Scenarios:</span>
            <button
              type="button"
              onClick={() => applyPresetScenario(3, 1, 2000, 'per_room_per_night')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              3 Nights · ₹2,000/Night (₹6,000 Stay)
            </button>
            <button
              type="button"
              onClick={() => applyPresetScenario(3, 1, 2000, 'total_stay')}
              className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              3 Nights · ₹2,000 Total Entire Stay
            </button>
          </div>
        </div>

        {/* Interactive Stay & Budget Controls */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1 flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-slate-500" />
              Planned Check-In Date
            </label>
            <input
              type="date"
              value={tripParams.travelDate}
              onChange={(e) => {
                if (e.target.value) {
                  setTripParams((prev) => ({
                    ...prev,
                    urgency: 'scheduled',
                    travelDate: e.target.value,
                  }));
                }
              }}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-semibold text-slate-800 bg-white cursor-pointer"
            />
            <span className="text-[10px] text-slate-500 mt-1 block">
              Checkout: {computeCheckoutDate(tripParams.travelDate, tripParams.nights)}
            </span>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Number of Nights
            </label>
            <input
              type="number"
              min={1}
              max={14}
              value={tripParams.nights}
              onChange={(e) =>
                setTripParams((prev) => ({
                  ...prev,
                  nights: Math.max(1, Number(e.target.value) || 1),
                }))
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-num"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Rooms Required ({tripParams.travellers} Guests)
            </label>
            <input
              type="number"
              min={1}
              max={6}
              value={tripParams.rooms}
              onChange={(e) =>
                setTripParams((prev) => ({
                  ...prev,
                  rooms: Math.max(1, Number(e.target.value) || 1),
                }))
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-num"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Hotel Budget Mode
            </label>
            <select
              value={tripParams.hotelBudgetMode}
              onChange={(e) =>
                setTripParams((prev) => ({
                  ...prev,
                  hotelBudgetMode: e.target.value as 'per_room_per_night' | 'total_stay',
                }))
              }
              className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white"
            >
              <option value="per_room_per_night">Per Room Per Night (₹)</option>
              <option value="total_stay">Total Stay Budget (All {tripParams.nights} Nights)</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              {tripParams.hotelBudgetMode === 'per_room_per_night'
                ? 'Max Budget / Room / Night (₹)'
                : `Max Total Stay (${tripParams.nights} Nights, ${tripParams.rooms} Rm)`}
            </label>
            <input
              type="number"
              step={100}
              min={200}
              value={tripParams.hotelBudgetAmount}
              onChange={(e) =>
                setTripParams((prev) => ({
                  ...prev,
                  hotelBudgetAmount: Math.max(200, Number(e.target.value) || 200),
                }))
              }
              className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg font-mono-num"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Sort By Proximity / Price
            </label>
            <select
              value={proximitySort}
              onChange={(e) => setProximitySort(e.target.value as any)}
              className="w-full px-3 py-2 text-xs font-medium border border-slate-300 rounded-lg bg-white"
            >
              <option value="price">Lowest Total Stay Cost</option>
              <option value="railway">Closest to Tirupati Railway Station</option>
              <option value="alipiri">Closest to Alipiri Footpath / Ghat Base</option>
              <option value="rating">Highest Family Guest Rating</option>
            </select>
          </div>
        </div>

        {/* Transparent Budget Math Banner */}
        <div className="mt-5 pt-4 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div className="text-slate-700">
            <strong>Active Budget Rule:</strong>{' '}
            {tripParams.hotelBudgetMode === 'per_room_per_night' ? (
              <span>
                Searching for rooms ≤{' '}
                <strong className="font-mono-num">
                  ₹{tripParams.hotelBudgetAmount.toLocaleString('en-IN')}
                </strong>{' '}
                per room/night → Max Base Cost for {tripParams.nights} night(s) × {tripParams.rooms} room(s) ={' '}
                <strong className="font-mono-num text-[#0D4A42]">
                  ₹
                  {(
                    tripParams.hotelBudgetAmount *
                    tripParams.nights *
                    tripParams.rooms
                  ).toLocaleString('en-IN')}
                </strong>{' '}
                before applicable taxes.
              </span>
            ) : (
              <span>
                Searching for properties whose <strong>entire {tripParams.nights}-night stay</strong> across{' '}
                {tripParams.rooms} room(s) is ≤{' '}
                <strong className="font-mono-num text-[#0D4A42]">
                  ₹{tripParams.hotelBudgetAmount.toLocaleString('en-IN')}
                </strong>{' '}
                total (~₹
                {Math.round(
                  tripParams.hotelBudgetAmount / (tripParams.nights * tripParams.rooms)
                ).toLocaleString('en-IN')}{' '}
                per room/night).
              </span>
            )}
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg shrink-0">
            <button
              type="button"
              onClick={() => setAcFilter('all')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
                acFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All Rooms
            </button>
            <button
              type="button"
              onClick={() => setAcFilter('ac_only')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
                acFilter === 'ac_only' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              AC Only
            </button>
            <button
              type="button"
              onClick={() => setAcFilter('non_ac')}
              className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 ${
                acFilter === 'non_ac' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              Non-AC Budget
            </button>
          </div>
        </div>
      </div>

      {/* Exact Matches Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">
            Properties Within Your Selected Budget ({exactMatches.length} Found)
          </h3>
          <span className="text-xs text-slate-500">
            Showing verified distances to Tirupati Railway Station, Bus Stand & Alipiri
          </span>
        </div>

        {exactMatches.length === 0 ? (
          <div className="bg-amber-50/70 border border-amber-200 rounded-xl p-6 text-xs text-amber-900 space-y-2">
            <div className="flex items-center gap-2 font-bold text-sm">
              <AlertCircle className="w-4 h-4 text-amber-700" />
              No rooms match this exact budget and filter combination
            </div>
            <p>
              For {tripParams.nights} nights and {tripParams.rooms} room(s) within your current limit, either switch room type to Non-AC at TTD Srinivasam (₹200/night = ₹600 for 3 nights) or review the closest verified alternatives below with exact price difference breakdowns.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {exactMatches.map(
              ({
                hotel,
                selectedRoom,
                selectedRoomIdx,
                perRoomPerNight,
                baseStayTotal,
                taxTotal,
                grandTotalStay,
              }) => (
                <div
                  key={hotel.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs text-slate-500">
                          {hotel.propertyCategory} · {hotel.locationArea} · Rating {hotel.guestRating}/5 ({hotel.reviewCount} reviews)
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mt-1">{hotel.name}</h4>
                        <p className="text-xs text-slate-600 mt-1">{hotel.address}</p>
                      </div>
                      <img
                        src={hotelImageUrl}
                        alt={hotel.name}
                        referrerPolicy="no-referrer"
                        className="w-24 h-16 object-cover rounded-lg border border-slate-200 shrink-0 hidden sm:block"
                      />
                    </div>

                    {/* Landmark Proximity Metrics */}
                    <div className="mt-4 grid grid-cols-3 gap-2 py-2.5 px-3 bg-slate-50 rounded-lg text-xs font-mono-num text-slate-700">
                      <div>
                        <span className="text-slate-500 block font-sans">Railway Stn</span>
                        {hotel.distanceToRailwayStationKm} km
                      </div>
                      <div>
                        <span className="text-slate-500 block font-sans">Alipiri Base</span>
                        {hotel.distanceToAlipiriKm} km
                      </div>
                      <div>
                        <span className="text-slate-500 block font-sans">TTD Hilltop</span>
                        {hotel.distanceToTtdTempleKm} km
                      </div>
                    </div>

                    {/* Room Type Selector */}
                    <div className="mt-4">
                      <span className="text-xs font-medium text-slate-700 block mb-1.5">
                        Available Room Types (Click to recalculate {tripParams.nights}-night stay):
                      </span>
                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                        {hotel.roomTypes.map((rm, idx) => (
                          <button
                            key={rm.name}
                            type="button"
                            onClick={() =>
                              setSelectedRoomIndex((prev) => ({ ...prev, [hotel.id]: idx }))
                            }
                            className={`p-2 rounded-lg border text-left transition-colors ${
                              selectedRoomIdx === idx
                                ? 'border-[#0D4A42] bg-emerald-50/60 text-slate-900'
                                : 'border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div className="text-xs font-semibold truncate">{rm.name}</div>
                            <div className="text-xs font-bold font-mono-num text-[#0D4A42] mt-0.5">
                              ₹{rm.pricePerNight.toLocaleString('en-IN')}/night
                            </div>
                            <div className="text-[11px] text-slate-500">
                              {rm.isAc ? 'AC' : 'Non-AC'} · Up to {rm.maxOccupancy} guests
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-600 space-y-1">
                      <div>
                        <strong>Amenities:</strong> {hotel.amenities.join(' · ')}
                      </div>
                      <div>
                        <strong>Check-in / Check-out:</strong> {hotel.checkInTime} / {hotel.checkOutTime}
                      </div>
                      <div>
                        <strong>Public Phone:</strong>{' '}
                        {hotel.publicPhone ? (
                          <span className="font-mono-num font-semibold text-emerald-800">
                            {hotel.publicPhone} (Official Government Toll-Free Verified)
                          </span>
                        ) : (
                          <span className="text-slate-500">
                            Unverified public phone omitted — use official booking link below
                          </span>
                        )}
                      </div>
                      <div>
                        <strong>Source:</strong> {hotel.sourceName} · Verified {hotel.lastVerified}
                      </div>
                    </div>
                  </div>

                  {/* Transparent Price Breakdown Footer */}
                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-500 font-mono-num">
                        ₹{perRoomPerNight.toLocaleString('en-IN')} × {tripParams.rooms} rm × {tripParams.nights} nights ={' '}
                        <strong className="text-slate-800">
                          ₹{baseStayTotal.toLocaleString('en-IN')}
                        </strong>{' '}
                        base
                        {taxTotal > 0 ? ` + ₹${taxTotal.toLocaleString('en-IN')} (${hotel.taxPercentage}% GST)` : ' (₹0 Tax)'}
                      </div>
                      <div className="text-xl font-bold text-slate-900 font-mono-num mt-0.5">
                        ₹{grandTotalStay.toLocaleString('en-IN')}{' '}
                        <span className="text-xs font-normal font-sans text-slate-500">
                          total for {tripParams.nights} night(s)
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          onShortlistBooking({
                            category: 'Accommodation',
                            title: `${hotel.name} — ${selectedRoom.name} (${tripParams.rooms} Rm × ${tripParams.nights} Nights)`,
                            provider: hotel.sourceName,
                            status: 'Shortlisted',
                            totalFamilyCost: grandTotalStay,
                            officialUrl: hotel.officialBookingUrl,
                            notes: `Base ₹${baseStayTotal.toLocaleString('en-IN')} + Tax ₹${taxTotal.toLocaleString('en-IN')}`,
                          });
                          setAddedHotelKey(hotel.id);
                          setTimeout(() => setAddedHotelKey(null), 2500);
                        }}
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                          addedHotelKey === hotel.id
                            ? 'bg-emerald-800 text-white'
                            : 'text-white bg-[#0D4A42] hover:bg-[#09352f]'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {addedHotelKey === hotel.id ? '✓ Added to Trip Budget!' : 'Add to Trip Budget'}
                      </button>
                      <a
                        href={hotel.officialBookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                      >
                        Official Website
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </div>

      {/* Closest Available Alternatives When Above Budget */}
      {closestAlternatives.length > 0 && (
        <div className="space-y-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Closest Available Alternatives Outside Current Budget ({closestAlternatives.length})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Transparently showing exact price difference above your selected{' '}
              {tripParams.hotelBudgetMode === 'per_room_per_night'
                ? `₹${tripParams.hotelBudgetAmount.toLocaleString('en-IN')}/night`
                : `₹${tripParams.hotelBudgetAmount.toLocaleString('en-IN')} total stay`}{' '}
              limit
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {closestAlternatives.map(
              ({
                hotel,
                selectedRoom,
                perRoomPerNight,
                baseStayTotal,
                taxTotal,
                grandTotalStay,
                budgetDifference,
              }) => (
                <div
                  key={hotel.id}
                  className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between opacity-95"
                >
                  <div>
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="text-xs text-amber-800 font-medium">
                          +₹{budgetDifference.toLocaleString('en-IN')} above{' '}
                          {tripParams.hotelBudgetMode === 'per_room_per_night'
                            ? 'per-night target'
                            : 'total stay target'}{' '}
                          · {hotel.locationArea}
                        </div>
                        <h4 className="text-base font-bold text-slate-900 mt-1">{hotel.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">
                          {selectedRoom.name} · {hotel.distanceToRailwayStationKm} km from Railway Station
                        </p>
                      </div>
                      <div className="text-right font-mono-num">
                        <div className="text-sm font-bold text-slate-900">
                          ₹{perRoomPerNight.toLocaleString('en-IN')}/night
                        </div>
                        <div className="text-xs text-slate-500">
                          Base stay: ₹{baseStayTotal.toLocaleString('en-IN')}
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between">
                    <span className="text-xs text-slate-600 font-mono-num">
                      Total w/ tax: <strong>₹{grandTotalStay.toLocaleString('en-IN')}</strong>
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          onShortlistBooking({
                            category: 'Accommodation',
                            title: `${hotel.name} — ${selectedRoom.name} (${tripParams.rooms} Rm × ${tripParams.nights} Nights)`,
                            provider: hotel.sourceName,
                            status: 'Shortlisted',
                            totalFamilyCost: grandTotalStay,
                            officialUrl: hotel.officialBookingUrl,
                            notes: `Base ₹${baseStayTotal.toLocaleString('en-IN')} + Tax ₹${taxTotal.toLocaleString('en-IN')}`,
                          })
                        }
                        className="px-3 py-1.5 text-xs font-medium text-[#0D4A42] border border-[#0D4A42] rounded-lg hover:bg-emerald-50 whitespace-nowrap shrink-0"
                      >
                        Shortlist Anyway
                      </button>
                      <a
                        href={hotel.officialBookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 whitespace-nowrap shrink-0"
                      >
                        Portal
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
};
