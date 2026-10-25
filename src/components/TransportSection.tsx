import React, { useState, useEffect } from 'react';
import {
  Train,
  Bus,
  Plane,
  ArrowUpDown,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  Clock,
  IndianRupee,
  Plus,
  Calendar,
} from 'lucide-react';
import type {
  TripParams,
  TrainOption,
  BusOption,
  FlightOption,
  RankedTransportSummary,
  SavedBookingItem,
} from '../types';
import {
  getLocalTodayDateString,
  getLocalTomorrowDateString,
  isPastDate,
  validateTravelDate,
  formatDisplayDate,
} from '../utils/dateUtils';

interface TransportSectionProps {
  tripParams: TripParams;
  setTripParams: React.Dispatch<React.SetStateAction<TripParams>>;
  trains: TrainOption[];
  buses: BusOption[];
  flights: FlightOption[];
  onShortlistBooking: (item: Omit<SavedBookingItem, 'id' | 'addedAt'>) => void;
}

export const TransportSection: React.FC<TransportSectionProps> = ({
  tripParams,
  setTripParams,
  trains,
  buses,
  flights,
  onShortlistBooking,
}) => {
  const [activeTab, setActiveTab] = useState<'all' | 'train' | 'bus' | 'flight'>('all');
  const [sortBy, setSortBy] = useState<'cheapest' | 'fastest' | 'earliest' | 'best_value'>('best_value');
  const [selectedTrainClasses, setSelectedTrainClasses] = useState<Record<string, string>>({
    'train-17488': '3A',
    'train-17250': '3A',
    'train-12764': '3A',
    'train-12863': 'SL',
  });
  const [roundTripCalc, setRoundTripCalc] = useState<boolean>(true);
  const [addedItemKey, setAddedItemKey] = useState<string | null>(null);

  // Dynamic local date anchor (updates automatically, never hardcoded)
  const todayStr = getLocalTodayDateString();

  // Date and Budget feedback and anti-duplicate processing states
  const [dateError, setDateError] = useState<string | null>(null);
  const [customBudgetInput, setCustomBudgetInput] = useState<string>('');
  const [budgetError, setBudgetError] = useState<string | null>(null);
  const [budgetSuccess, setBudgetSuccess] = useState<string | null>(null);
  const [processingKeys, setProcessingKeys] = useState<Record<string, boolean>>({});

  // Auto-validate and sanitize planned travel date on load or when tripParams updates
  useEffect(() => {
    if (tripParams.travelDate && isPastDate(tripParams.travelDate)) {
      const today = getLocalTodayDateString();
      setTripParams((prev) => ({
        ...prev,
        travelDate: today,
        urgency: prev.urgency === 'scheduled' ? 'scheduled' : 'today',
      }));
      setDateError(
        `Previously saved planned travel date was in the past. Date has been automatically updated to today (${today}).`
      );
    }
  }, [tripParams.travelDate]);

  /**
   * Unified, validated Budget Addition Handler.
   * - Prevents duplicate clicks / double-submit
   * - Validates Planned Date is not in the past
   * - Validates numeric amount > 0
   * - Immediately updates trip's totalBudget in tripParams
   * - Persists and reflects consistently
   */
  const handleAddBudgetAmount = (
    rawAmount: number | string,
    key: string,
    bookingItem?: Omit<SavedBookingItem, 'id' | 'addedAt'>
  ) => {
    // 1. Prevent accidental duplicate additions caused by double-clicking or repeated handlers
    if (processingKeys[key]) return;

    // 2. Validate Planned Date before saving or adding booking
    if (isPastDate(tripParams.travelDate)) {
      setDateError(
        `Cannot add transport booking for a past date (${tripParams.travelDate}). Please select today (${todayStr}) or a future date.`
      );
      return;
    }

    // 3. Validate budget amount: prevent invalid, empty, negative, or non-numeric input
    const amount = Number(rawAmount);
    if (isNaN(amount) || !isFinite(amount) || amount <= 0) {
      setBudgetError('Invalid budget amount. Please enter a valid positive number greater than ₹0.');
      return;
    }

    const roundedAmount = Math.round(amount);

    // Lock key to prevent rapid duplicate double-clicks
    setProcessingKeys((prev) => ({ ...prev, [key]: true }));
    setBudgetError(null);
    setDateError(null);

    // 4. Update the displayed Total Amount immediately after budget is added
    const previousBudget = Number(tripParams.totalBudget) || 0;
    const newTotal = previousBudget + roundedAmount;

    setTripParams((prev) => ({
      ...prev,
      totalBudget: (Number(prev.totalBudget) || 0) + roundedAmount,
    }));

    // 5. Shortlist transport item so it appears in bookings & expense breakdown
    if (bookingItem) {
      onShortlistBooking({
        ...bookingItem,
        totalFamilyCost: roundedAmount,
      });
    }

    setAddedItemKey(key);
    setBudgetSuccess(
      `✓ Added ₹${roundedAmount.toLocaleString('en-IN')} to Trip Total Budget. Updated Total Amount: ₹${newTotal.toLocaleString('en-IN')}`
    );

    setTimeout(() => {
      setAddedItemKey(null);
      setBudgetSuccess(null);
      setProcessingKeys((prev) => ({ ...prev, [key]: false }));
    }, 2500);
  };

  const handleUseInBudget = (
    key: string,
    item: Omit<SavedBookingItem, 'id' | 'addedAt'>
  ) => {
    handleAddBudgetAmount(item.totalFamilyCost, key, item);
  };

  const handleCustomBudgetSubmit = () => {
    const raw = customBudgetInput.trim();
    if (!raw) {
      setBudgetError('Please enter a budget amount to add.');
      return;
    }
    const num = Number(raw);
    if (isNaN(num) || !isFinite(num) || num <= 0) {
      setBudgetError('Invalid amount. Please enter a positive number greater than ₹0.');
      return;
    }
    handleAddBudgetAmount(num, 'custom-budget-entry');
    setCustomBudgetInput('');
  };

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    if (!val) return;
    if (isPastDate(val)) {
      setDateError(
        `Planned travel date cannot be in the past (${val}). Please select today (${todayStr}) or a future date.`
      );
      return;
    }
    setDateError(null);
    setTripParams((prev) => ({
      ...prev,
      urgency: 'scheduled',
      travelDate: val,
    }));
  };

  const multiplier = roundTripCalc ? 2 : 1;

  // Build normalized comparison items across Train, Bus, and Flight
  const rankedOptions: RankedTransportSummary[] = [
    ...trains.map((t) => {
      const chosenClassCode = selectedTrainClasses[t.id] || t.classes[0].classCode;
      const cls = t.classes.find((c) => c.classCode === chosenClassCode) || t.classes[0];
      const feederPerPerson = t.departureCode === 'RJY' ? 120 : t.departureCode === 'SLO' ? 40 : 0;
      const perPersonOneWay = cls.farePerPerson;
      const extraTotal = feederPerPerson * tripParams.travellers * multiplier;
      const totalFamilyCost =
        perPersonOneWay * tripParams.travellers * multiplier + extraTotal;

      return {
        id: `rank-${t.id}`,
        mode: 'Train' as const,
        title: `${t.trainNumber} ${t.trainName} (${cls.classCode})`,
        subtitle: `${t.departureStation} → ${t.arrivalStation}`,
        departureTime: t.departureTime,
        arrivalTime: t.arrivalTime,
        durationMinutes: t.durationMinutes,
        durationFormatted: t.durationFormatted,
        perPersonCost: perPersonOneWay * multiplier,
        extraTransferOrFeeTotal: extraTotal,
        totalFamilyCost,
        convenienceScore: t.departureCode === 'CCT' ? 96 : 88,
        officialBookingUrl: t.officialBookingUrl,
        sourceName: t.sourceName,
        dataMode: t.dataMode,
      };
    }),
    ...buses.map((b) => {
      const perPersonOneWay = b.farePerPerson + b.taxesAndTollFeePerPerson;
      const totalFamilyCost = perPersonOneWay * tripParams.travellers * multiplier;
      return {
        id: `rank-${b.id}`,
        mode: 'Bus' as const,
        title: `${b.operator.split('(')[0].trim()} — ${b.busType}`,
        subtitle: `${b.boardingPoint} → ${b.droppingPoint}`,
        departureTime: b.departureTime,
        arrivalTime: b.arrivalTime,
        durationMinutes: b.durationMinutes,
        durationFormatted: b.durationFormatted,
        perPersonCost: b.farePerPerson * multiplier,
        extraTransferOrFeeTotal: b.taxesAndTollFeePerPerson * tripParams.travellers * multiplier,
        totalFamilyCost,
        convenienceScore: b.isAc ? 84 : 74,
        officialBookingUrl: b.officialBookingUrl,
        sourceName: b.sourceName,
        dataMode: b.dataMode,
      };
    }),
    ...flights.map((f) => {
      const totalFamilyCost =
        f.baseFarePerPerson * tripParams.travellers * multiplier +
        f.airportTransferCostTotal * multiplier;
      return {
        id: `rank-${f.id}`,
        mode: 'Flight' as const,
        title: `${f.airline} (${f.routeType})`,
        subtitle: `${f.originAirportOrStation} → ${f.destinationAirport}`,
        departureTime: f.departureTime,
        arrivalTime: f.arrivalTime,
        durationMinutes: f.durationMinutes + 90,
        durationFormatted: f.durationFormatted,
        perPersonCost: f.baseFarePerPerson * multiplier,
        extraTransferOrFeeTotal: f.airportTransferCostTotal * multiplier,
        totalFamilyCost,
        convenienceScore: 76,
        officialBookingUrl: f.officialBookingUrl,
        sourceName: f.sourceName,
        dataMode: f.dataMode,
      };
    }),
  ];

  const cheapestOption = [...rankedOptions].sort((a, b) => a.totalFamilyCost - b.totalFamilyCost)[0];
  const fastestOption = [...rankedOptions].sort((a, b) => a.durationMinutes - b.durationMinutes)[0];
  const bestValueOption = [...rankedOptions].sort(
    (a, b) => a.totalFamilyCost / a.convenienceScore - b.totalFamilyCost / b.convenienceScore
  )[0];

  const sortedComparison = [...rankedOptions].sort((a, b) => {
    if (sortBy === 'cheapest') return a.totalFamilyCost - b.totalFamilyCost;
    if (sortBy === 'fastest') return a.durationMinutes - b.durationMinutes;
    if (sortBy === 'earliest') return a.departureTime.localeCompare(b.departureTime);
    return a.totalFamilyCost / a.convenienceScore - b.totalFamilyCost / b.convenienceScore;
  });

  const handleUrgentDateSwitch = (urgency: 'today' | 'tomorrow' | 'scheduled') => {
    if (urgency === 'today') {
      const today = getLocalTodayDateString();
      setTripParams((prev) => ({
        ...prev,
        urgency,
        travelDate: today,
      }));
      setDateError(null);
    } else if (urgency === 'tomorrow') {
      const tomorrow = getLocalTomorrowDateString();
      setTripParams((prev) => ({
        ...prev,
        urgency,
        travelDate: tomorrow,
      }));
      setDateError(null);
    } else {
      setTripParams((prev) => ({
        ...prev,
        urgency: 'scheduled',
      }));
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Urgent Date Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <p className="text-xs text-slate-500">
              Smart Multi-Modal Corridor · Customized Route & Date
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Find Transport: {tripParams.origin && tripParams.destination ? `${tripParams.origin} ➔ ${tripParams.destination}` : 'Customized Route'}
            </h2>
          </div>

          {/* Interactive Pickup to Destination & Planned Date Route Customizer */}
          <div className="w-full lg:w-auto flex flex-wrap items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-2">
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Pickup:</span>
              <input
                type="text"
                value={tripParams.origin}
                onChange={(e) => setTripParams((p) => ({ ...p, origin: e.target.value }))}
                placeholder="Enter pickup location"
                className="w-28 sm:w-36 text-xs font-semibold text-slate-900 focus:outline-none"
              />
            </div>
            <button
              type="button"
              onClick={() =>
                setTripParams((p) => ({
                  ...p,
                  origin: p.destination,
                  destination: p.origin,
                }))
              }
              title="Swap Pickup and Destination"
              className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-200 rounded-lg transition-colors text-xs font-bold cursor-pointer"
            >
              ⇄
            </button>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Destination:</span>
              <input
                type="text"
                value={tripParams.destination}
                onChange={(e) => setTripParams((p) => ({ ...p, destination: e.target.value }))}
                placeholder="Enter destination"
                className="w-28 sm:w-36 text-xs font-semibold text-slate-900 focus:outline-none"
              />
            </div>
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-white border border-slate-200 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-[#0D4A42] shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Planned Date:</span>
              <input
                type="date"
                min={todayStr}
                value={tripParams.travelDate}
                onChange={handleDateChange}
                className="text-xs font-semibold text-slate-900 focus:outline-none cursor-pointer"
                title="Customize planned travel date (past dates disabled)"
              />
            </div>
            {/* Displayed Total Trip Budget in Header */}
            <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 border border-emerald-200 rounded-lg">
              <IndianRupee className="w-3.5 h-3.5 text-[#0D4A42] shrink-0" />
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Total Budget:</span>
              <span className="text-xs font-bold font-mono-num text-emerald-950">
                ₹{tripParams.totalBudget.toLocaleString('en-IN')}
              </span>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {/* Urgency & Customizable Planned Date Segmented Control */}
            <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => handleUrgentDateSwitch('today')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  tripParams.urgency === 'today'
                    ? 'bg-[#0D4A42] text-white shadow-xs font-semibold'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
                title={`Select Today (${todayStr})`}
              >
                Urgent: Today
              </button>
              <button
                type="button"
                onClick={() => handleUrgentDateSwitch('tomorrow')}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                  tripParams.urgency === 'tomorrow'
                    ? 'bg-[#0D4A42] text-white shadow-xs font-semibold'
                    : 'text-slate-700 hover:text-slate-900'
                }`}
                title="Select Tomorrow (Tatkal)"
              >
                Tomorrow (Tatkal)
              </button>

              {/* Customizable Planned Date with date picker (past dates disabled) */}
              <div
                className={`flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-md transition-all shrink-0 ${
                  tripParams.urgency === 'scheduled'
                    ? 'bg-[#0D4A42] text-white shadow-xs'
                    : 'bg-white text-slate-800 border border-slate-200 hover:bg-slate-50'
                }`}
              >
                <button
                  type="button"
                  onClick={() => handleUrgentDateSwitch('scheduled')}
                  className="flex items-center gap-1 font-semibold cursor-pointer"
                >
                  <Calendar className={`w-3.5 h-3.5 shrink-0 ${tripParams.urgency === 'scheduled' ? 'text-amber-300' : 'text-[#0D4A42]'}`} />
                  <span className="whitespace-nowrap">Planned Date:</span>
                </button>
                <input
                  type="date"
                  min={todayStr}
                  value={tripParams.travelDate}
                  onChange={handleDateChange}
                  title="Customize Planned Travel Date (past dates disabled)"
                  className={`text-xs font-semibold rounded px-1.5 py-0.5 focus:outline-none cursor-pointer ${
                    tripParams.urgency === 'scheduled'
                      ? 'bg-white/20 text-white border border-white/30 [color-scheme:dark]'
                      : 'bg-slate-100 text-slate-900 border border-slate-200'
                  }`}
                />
              </div>
            </div>

            {/* One-Way vs Round-Trip Toggle */}
            <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg">
              <button
                type="button"
                onClick={() => setRoundTripCalc(false)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  !roundTripCalc ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                One-Way ({tripParams.travellers} Pax)
              </button>
              <button
                type="button"
                onClick={() => setRoundTripCalc(true)}
                className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                  roundTripCalc ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
                }`}
              >
                Round-Trip (Onward + Return)
              </button>
            </div>
          </div>
        </div>

        {/* Validation Feedback Banners */}
        {dateError && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-900">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-600" />
            <span>{dateError}</span>
          </div>
        )}
        {budgetError && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-xs text-red-900">
            <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-red-500" />
            <span>{budgetError}</span>
          </div>
        )}
        {budgetSuccess && (
          <div className="mt-3 flex items-start gap-2 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-xs text-emerald-900">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
            <span>{budgetSuccess}</span>
          </div>
        )}

        {/* Data Honesty & Urgent Travel Guidance */}
        <div className="mt-4 flex flex-col md:flex-row md:items-center justify-between gap-4 text-xs text-slate-600">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
            <span>
              <strong>Verified Reference Schedule Mode:</strong> Live IRCTC PNR/seat availability and private bus dynamic inventory require personal logins or partner tokens. Fares shown below are official published reference tariffs for {tripParams.travellers} travellers. Never rely on guessed seat counts—click any official portal link to verify real-time seats.
            </span>
          </div>
          {tripParams.urgency !== 'scheduled' && (
            <span className="text-amber-800 font-medium whitespace-nowrap shrink-0">
              Urgent travel tip: IRCTC Tatkal opens at 10:00 AM (AC) & 11:00 AM (SL) 1 day prior.
            </span>
          )}
        </div>
      </div>

      {/* Cheapest, Fastest, Best-Value Highlight Strip */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {cheapestOption && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-emerald-800">
                Lowest Total Family Cost · {cheapestOption.mode}
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">{cheapestOption.title}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {cheapestOption.departureTime} → {cheapestOption.arrivalTime} · {cheapestOption.durationFormatted}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500">
                  {roundTripCalc ? 'Round-trip' : 'One-way'} ({tripParams.travellers} pax)
                </span>
                <div className="text-xl font-bold text-slate-900 font-mono-num">
                  ₹{cheapestOption.totalFamilyCost.toLocaleString('en-IN')}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleUseInBudget('rank-cheapest', {
                    category: 'Transport',
                    title: `${cheapestOption.title} (${roundTripCalc ? 'Round-Trip' : 'One-Way'}, ${tripParams.travellers} Pax)`,
                    provider: cheapestOption.sourceName,
                    status: 'Shortlisted',
                    totalFamilyCost: cheapestOption.totalFamilyCost,
                    officialUrl: cheapestOption.officialBookingUrl,
                    notes: `${cheapestOption.departureTime} → ${cheapestOption.arrivalTime}`,
                  })
                }
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  addedItemKey === 'rank-cheapest'
                    ? 'bg-emerald-800 text-white'
                    : 'text-[#0D4A42] border border-[#0D4A42] hover:bg-[#0D4A42] hover:text-white'
                }`}
              >
                {addedItemKey === 'rank-cheapest' ? '✓ Added to Budget!' : 'Use in Trip Budget'}
              </button>
            </div>
          </div>
        )}

        {fastestOption && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-sky-800">
                Shortest Total Journey Time · {fastestOption.mode}
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">{fastestOption.title}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {fastestOption.departureTime} → {fastestOption.arrivalTime} · {fastestOption.durationFormatted}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500">
                  Incl. ₹{fastestOption.extraTransferOrFeeTotal.toLocaleString('en-IN')} airport/station transfers
                </span>
                <div className="text-xl font-bold text-slate-900 font-mono-num">
                  ₹{fastestOption.totalFamilyCost.toLocaleString('en-IN')}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleUseInBudget('rank-fastest', {
                    category: 'Transport',
                    title: `${fastestOption.title} (${roundTripCalc ? 'Round-Trip' : 'One-Way'}, ${tripParams.travellers} Pax)`,
                    provider: fastestOption.sourceName,
                    status: 'Shortlisted',
                    totalFamilyCost: fastestOption.totalFamilyCost,
                    officialUrl: fastestOption.officialBookingUrl,
                    notes: `Fastest option including ₹${fastestOption.extraTransferOrFeeTotal} transfers`,
                  })
                }
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  addedItemKey === 'rank-fastest'
                    ? 'bg-emerald-800 text-white'
                    : 'text-[#0D4A42] border border-[#0D4A42] hover:bg-[#0D4A42] hover:text-white'
                }`}
              >
                {addedItemKey === 'rank-fastest' ? '✓ Added to Budget!' : 'Use in Trip Budget'}
              </button>
            </div>
          </div>
        )}

        {bestValueOption && (
          <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
            <div>
              <div className="text-xs font-semibold text-amber-800">
                Best Balance of Price & Family Convenience · {bestValueOption.mode}
              </div>
              <h3 className="text-base font-bold text-slate-900 mt-1">{bestValueOption.title}</h3>
              <p className="text-xs text-slate-500 mt-1">
                {bestValueOption.departureTime} → {bestValueOption.arrivalTime} · {bestValueOption.durationFormatted}
              </p>
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-baseline justify-between">
              <div>
                <span className="text-xs text-slate-500">
                  Direct route · {roundTripCalc ? 'Round-trip' : 'One-way'}
                </span>
                <div className="text-xl font-bold text-slate-900 font-mono-num">
                  ₹{bestValueOption.totalFamilyCost.toLocaleString('en-IN')}
                </div>
              </div>
              <button
                type="button"
                onClick={() =>
                  handleUseInBudget('rank-bestvalue', {
                    category: 'Transport',
                    title: `${bestValueOption.title} (${roundTripCalc ? 'Round-Trip' : 'One-Way'}, ${tripParams.travellers} Pax)`,
                    provider: bestValueOption.sourceName,
                    status: 'Shortlisted',
                    totalFamilyCost: bestValueOption.totalFamilyCost,
                    officialUrl: bestValueOption.officialBookingUrl,
                    notes: 'Best balance of family comfort and direct boarding',
                  })
                }
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                  addedItemKey === 'rank-bestvalue'
                    ? 'bg-emerald-800 text-white'
                    : 'text-[#0D4A42] border border-[#0D4A42] hover:bg-[#0D4A42] hover:text-white'
                }`}
              >
                {addedItemKey === 'rank-bestvalue' ? '✓ Added to Budget!' : 'Use in Trip Budget'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Mode Filter Tabs & Ranking Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-1 p-1 bg-slate-200/70 rounded-lg w-fit">
          <button
            type="button"
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Modes ({trains.length + buses.length + flights.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('train')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'train' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Train className="w-3.5 h-3.5" />
            Trains ({trains.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('bus')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'bus' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Bus className="w-3.5 h-3.5" />
            Buses ({buses.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('flight')}
            className={`flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
              activeTab === 'flight' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            Flights & Combos ({flights.length})
          </button>
        </div>

        <div className="flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-500" />
          <span className="text-xs text-slate-600">Rank comparison by:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="text-xs font-medium bg-white border border-slate-300 rounded-lg px-3 py-1.5 text-slate-800"
          >
            <option value="best_value">Best Balance of Price & Convenience</option>
            <option value="cheapest">Lowest Total Family Cost</option>
            <option value="fastest">Shortest Total Journey Time</option>
            <option value="earliest">Earliest Available Departure</option>
          </select>
        </div>
      </div>

      {/* Unified Side-by-Side Comparison Matrix */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Complete Multi-Modal Cost Matrix ({tripParams.travellers} Travellers · {roundTripCalc ? 'Round-Trip' : 'One-Way'})
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Includes base fares plus known station/airport feeder transfers and highway toll fees
            </p>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 bg-slate-50 border border-slate-200 rounded-lg text-xs font-mono-num text-slate-700">
            <Calendar className="w-3.5 h-3.5 text-[#0D4A42] shrink-0" />
            <span className="font-semibold text-slate-500">Travel Date:</span>
            <input
              type="date"
              min={todayStr}
              value={tripParams.travelDate}
              onChange={handleDateChange}
              className="font-bold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
              title="Customize Travel Date (past dates disabled)"
            />
          </div>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-xs font-semibold text-slate-600">
                <th className="py-3 px-4">Mode & Service</th>
                <th className="py-3 px-4">Corridor & Boarding</th>
                <th className="py-3 px-4">Schedule & Duration</th>
                <th className="py-3 px-4 text-right">Per Person</th>
                <th className="py-3 px-4 text-right">Transfers / Tolls</th>
                <th className="py-3 px-4 text-right">Total Family ({tripParams.travellers} Pax)</th>
                <th className="py-3 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200 text-xs">
              {sortedComparison.map((row) => (
                <tr key={row.id} className="hover:bg-slate-50/80 transition-colors">
                  <td className="py-3.5 px-4 font-semibold text-slate-900">
                    <div>{row.title}</div>
                    <div className="text-[11px] font-normal text-slate-500 mt-0.5">
                      {row.mode} · {row.dataMode === 'LIVE_API' ? 'Live API' : 'Reference Tariff'}
                    </div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{row.subtitle}</td>
                  <td className="py-3.5 px-4 font-mono-num text-slate-800">
                    <div>
                      {row.departureTime} → {row.arrivalTime}
                    </div>
                    <div className="text-slate-500">{row.durationFormatted}</div>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-num text-slate-800">
                    ₹{row.perPersonCost.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-num text-slate-600">
                    {row.extraTransferOrFeeTotal > 0
                      ? `₹${row.extraTransferOrFeeTotal.toLocaleString('en-IN')}`
                      : '₹0'}
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-num font-bold text-slate-900">
                    ₹{row.totalFamilyCost.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleUseInBudget(`table-${row.id}`, {
                            category: 'Transport',
                            title: `${row.title} (${roundTripCalc ? 'Round-Trip' : 'One-Way'})`,
                            provider: row.sourceName,
                            status: 'Shortlisted',
                            totalFamilyCost: row.totalFamilyCost,
                            officialUrl: row.officialBookingUrl,
                            notes: `${row.subtitle} · ${row.departureTime}`,
                          })
                        }
                        className={`px-2.5 py-1 text-xs font-medium rounded-md whitespace-nowrap shrink-0 transition-colors ${
                          addedItemKey === `table-${row.id}`
                            ? 'bg-emerald-700 text-white'
                            : 'text-[#0D4A42] bg-emerald-50 hover:bg-emerald-100'
                        }`}
                      >
                        {addedItemKey === `table-${row.id}` ? '✓ Added!' : '+ Budget'}
                      </button>
                      <a
                        href={row.officialBookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-slate-700 border border-slate-300 rounded-md hover:bg-slate-100 whitespace-nowrap shrink-0"
                      >
                        Portal
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detailed Train Cards */}
      {(activeTab === 'all' || activeTab === 'train') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-bold text-slate-900">
              01. Train Search — Kakinada (CCT) / Samalkot (SLO) to Tirupati (TPTY)
            </h3>
            <a
              href="https://enquiry.indianrail.gov.in/mntes/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs font-medium text-[#0D4A42] hover:underline inline-flex items-center gap-1"
            >
              Check Live Train Running Status (Official NTES)
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {trains.map((train) => {
              const selectedCode = selectedTrainClasses[train.id] || train.classes[0].classCode;
              const selectedClass =
                train.classes.find((c) => c.classCode === selectedCode) || train.classes[0];
              const totalFamilyTrain =
                selectedClass.farePerPerson * tripParams.travellers * multiplier;

              return (
                <div
                  key={train.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs text-slate-500">
                          Train #{train.trainNumber} · Runs: {train.runningDays.join(', ')} · Last updated {train.lastUpdated}
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mt-1">{train.trainName}</h4>
                      </div>
                      <span className="text-xs font-mono-num text-slate-600">
                        {train.durationFormatted}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 py-3 border-y border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-500">Departure</span>
                        <div className="font-bold text-slate-900 font-mono-num mt-0.5">
                          {train.departureTime} · {train.departureStation}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500">Arrival</span>
                        <div className="font-bold text-slate-900 font-mono-num mt-0.5">
                          {train.arrivalTime} · {train.arrivalStation}
                        </div>
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 mt-3">
                      <strong>Intermediate Stops:</strong> {train.intermediateStops.join(' → ')}
                    </p>

                    {/* Class Selector Buttons */}
                    <div className="mt-4">
                      <span className="text-xs font-medium text-slate-700 block mb-2">
                        Select Class to Compare Family Fare:
                      </span>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {train.classes.map((cls) => (
                          <button
                            key={cls.classCode}
                            type="button"
                            onClick={() =>
                              setSelectedTrainClasses((prev) => ({
                                ...prev,
                                [train.id]: cls.classCode,
                              }))
                            }
                            className={`p-2.5 rounded-lg border text-left transition-colors ${
                              selectedCode === cls.classCode
                                ? 'border-[#0D4A42] bg-emerald-50/60 text-slate-900'
                                : 'border-slate-200 hover:border-slate-300 text-slate-700'
                            }`}
                          >
                            <div className="text-xs font-bold">{cls.className}</div>
                            <div className="text-sm font-bold font-mono-num text-[#0D4A42] mt-0.5">
                              ₹{cls.farePerPerson}/pax
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">
                              {cls.availabilityStatus}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>

                    <p className="text-xs text-slate-500 mt-3">{train.runningStatusNote}</p>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-slate-500">
                        Total for {tripParams.travellers} travellers ({roundTripCalc ? 'Round-Trip' : 'One-Way'} {selectedClass.classCode})
                      </span>
                      <div className="text-xl font-bold text-slate-900 font-mono-num">
                        ₹{totalFamilyTrain.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleUseInBudget(`train-${train.id}`, {
                            category: 'Transport',
                            title: `${train.trainNumber} ${train.trainName} (${selectedClass.classCode}, ${roundTripCalc ? 'Round-Trip' : 'One-Way'})`,
                            provider: 'Indian Railways (IRCTC)',
                            status: 'Shortlisted',
                            totalFamilyCost: totalFamilyTrain,
                            officialUrl: train.officialBookingUrl,
                            notes: `${train.departureStation} (${train.departureTime}) to ${train.arrivalStation} (${train.arrivalTime})`,
                          })
                        }
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                          addedItemKey === `train-${train.id}`
                            ? 'bg-emerald-800 text-white'
                            : 'text-white bg-[#0D4A42] hover:bg-[#09352f]'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {addedItemKey === `train-${train.id}`
                          ? '✓ Added to Budget!'
                          : 'Add to Trip Budget'}
                      </button>
                      <a
                        href={train.officialBookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                      >
                        Book on IRCTC
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Bus Cards */}
      {(activeTab === 'all' || activeTab === 'bus') && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">
            02. Bus Search — APSRTC Official & Intercity Sleeper Coaches
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {buses.map((bus) => {
              const totalBusFamily =
                (bus.farePerPerson + bus.taxesAndTollFeePerPerson) *
                tripParams.travellers *
                multiplier;
              return (
                <div
                  key={bus.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs text-slate-500">
                          {bus.operatorType} · {bus.isAc ? 'AC Coach' : 'Non-AC Coach'} · {bus.seatingType}
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mt-1">{bus.busType}</h4>
                        <p className="text-xs text-slate-600 mt-0.5">{bus.operator}</p>
                      </div>
                      <span className="text-xs font-mono-num text-slate-600">
                        {bus.durationFormatted}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 py-3 border-y border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-500">Boarding Point</span>
                        <div className="font-bold text-slate-900 mt-0.5">
                          {bus.departureTime} · {bus.boardingPoint}
                        </div>
                      </div>
                      <div>
                        <span className="text-slate-500">Dropping Point</span>
                        <div className="font-bold text-slate-900 mt-0.5">
                          {bus.arrivalTime} · {bus.droppingPoint}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-600 space-y-1.5">
                      <div>
                        <strong>Amenities:</strong> {bus.amenities.join(' · ')}
                      </div>
                      <div>
                        <strong>Seat & Tariff Status:</strong> {bus.seatStatusNote}
                      </div>
                      <div>
                        <strong>Cancellation Terms:</strong> {bus.cancellationPolicy}
                      </div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-slate-500">
                        ₹{bus.farePerPerson} + ₹{bus.taxesAndTollFeePerPerson} toll/pax · {roundTripCalc ? 'Round-Trip' : 'One-Way'}
                      </span>
                      <div className="text-xl font-bold text-slate-900 font-mono-num">
                        ₹{totalBusFamily.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleUseInBudget(`bus-${bus.id}`, {
                            category: 'Transport',
                            title: `${bus.busType} (${roundTripCalc ? 'Round-Trip' : 'One-Way'}, ${tripParams.travellers} Pax)`,
                            provider: bus.operator,
                            status: 'Shortlisted',
                            totalFamilyCost: totalBusFamily,
                            officialUrl: bus.officialBookingUrl,
                            notes: `${bus.boardingPoint} to ${bus.droppingPoint}`,
                          })
                        }
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                          addedItemKey === `bus-${bus.id}`
                            ? 'bg-emerald-800 text-white'
                            : 'text-white bg-[#0D4A42] hover:bg-[#09352f]'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {addedItemKey === `bus-${bus.id}`
                          ? '✓ Added to Budget!'
                          : 'Add to Trip Budget'}
                      </button>
                      <a
                        href={bus.officialBookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                      >
                        Official Portal
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Detailed Flight & Multi-Modal Cards */}
      {(activeTab === 'all' || activeTab === 'flight') && (
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-slate-900">
            03. Flights & Connecting Air Routes (Including Airport Transfer Expenses)
          </h3>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {flights.map((flight) => {
              const totalFlightFamily =
                flight.baseFarePerPerson * tripParams.travellers * multiplier +
                flight.airportTransferCostTotal * multiplier;
              return (
                <div
                  key={flight.id}
                  className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="text-xs text-slate-500">
                          {flight.routeType} · {flight.flightNumbers}
                        </div>
                        <h4 className="text-lg font-bold text-slate-900 mt-1">{flight.airline}</h4>
                      </div>
                      <span className="text-xs font-mono-num text-slate-600">
                        {flight.durationFormatted}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-4 py-3 border-y border-slate-100 text-xs">
                      <div>
                        <span className="text-slate-500">Origin & Hub</span>
                        <div className="font-bold text-slate-900 mt-0.5">
                          {flight.departureTime} · {flight.originAirportOrStation}
                        </div>
                        <div className="text-slate-500 mt-0.5">Via {flight.viaHub}</div>
                      </div>
                      <div>
                        <span className="text-slate-500">Destination Airport</span>
                        <div className="font-bold text-slate-900 mt-0.5">
                          {flight.arrivalTime} · {flight.destinationAirport}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 text-xs text-slate-600 space-y-1.5">
                      <div>
                        <strong>Baggage Allowance:</strong> {flight.baggageAllowance}
                      </div>
                      <div>
                        <strong>Airport Transfer Breakdown:</strong> ₹{flight.airportTransferCostTotal.toLocaleString('en-IN')} each way for family cab (Kakinada → RJA/VTZ + TIR Airport → Tirupati City).
                      </div>
                      <div className="text-amber-800">{flight.additionalFeesNote}</div>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
                    <div>
                      <span className="text-xs text-slate-500">
                        Total incl. airport cabs ({roundTripCalc ? 'Round-Trip' : 'One-Way'}, {tripParams.travellers} pax)
                      </span>
                      <div className="text-xl font-bold text-slate-900 font-mono-num">
                        ₹{totalFlightFamily.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          handleUseInBudget(`flight-${flight.id}`, {
                            category: 'Transport',
                            title: `${flight.airline} ${flight.flightNumbers} (${roundTripCalc ? 'Round-Trip' : 'One-Way'})`,
                            provider: flight.airline,
                            status: 'Shortlisted',
                            totalFamilyCost: totalFlightFamily,
                            officialUrl: flight.officialBookingUrl,
                            notes: `Includes ₹${flight.airportTransferCostTotal * multiplier} airport transfers`,
                          })
                        }
                        className={`inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                          addedItemKey === `flight-${flight.id}`
                            ? 'bg-emerald-800 text-white'
                            : 'text-white bg-[#0D4A42] hover:bg-[#09352f]'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {addedItemKey === `flight-${flight.id}`
                          ? '✓ Added to Budget!'
                          : 'Add to Trip Budget'}
                      </button>
                      <a
                        href={flight.officialBookingUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-slate-700 border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                      >
                        Airline Website
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
