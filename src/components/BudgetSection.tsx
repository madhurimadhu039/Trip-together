import React, { useState } from 'react';
import {
  Wallet,
  AlertTriangle,
  CheckCircle2,
  Trash2,
  ExternalLink,
  Plus,
  TrendingDown,
  Calendar,
} from 'lucide-react';
import type { TripParams, SavedBookingItem } from '../types';

interface BudgetSectionProps {
  tripParams: TripParams;
  setTripParams: React.Dispatch<React.SetStateAction<TripParams>>;
  savedBookings: SavedBookingItem[];
  setSavedBookings: React.Dispatch<React.SetStateAction<SavedBookingItem[]>>;
}

export const BudgetSection: React.FC<BudgetSectionProps> = ({
  tripParams,
  setTripParams,
  savedBookings,
  setSavedBookings,
}) => {
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<SavedBookingItem['category']>('Transport');
  const [newProvider, setNewProvider] = useState('Official Portal');
  const [newStatus, setNewStatus] = useState<SavedBookingItem['status']>('Estimated');
  const [newCost, setNewCost] = useState(1500);
  const [addedItemSuccess, setAddedItemSuccess] = useState<string | null>(null);
  const [budgetSuccessMsg, setBudgetSuccessMsg] = useState<string | null>(null);

  const totalPlannedExpense = savedBookings.reduce((s, b) => s + b.totalFamilyCost, 0);
  const confirmedExpense = savedBookings
    .filter((b) => b.status === 'Confirmed Reference')
    .reduce((s, b) => s + b.totalFamilyCost, 0);
  const shortlistedAndEstimated = totalPlannedExpense - confirmedExpense;
  const remainingBudget = tripParams.totalBudget - totalPlannedExpense;
  const perPersonPlanned =
    tripParams.travellers > 0 ? Math.round(totalPlannedExpense / tripParams.travellers) : 0;

  const isOverBudget = remainingBudget < 0;

  const categoryTotals: Record<SavedBookingItem['category'], number> = {
    Transport: 0,
    Accommodation: 0,
    'Tour Package': 0,
    'Local Transport & Meals': 0,
  };
  savedBookings.forEach((b) => {
    categoryTotals[b.category] = (categoryTotals[b.category] || 0) + b.totalFamilyCost;
  });

  const handleStatusChange = (id: string, status: SavedBookingItem['status']) => {
    setSavedBookings((prev) =>
      prev.map((b) => (b.id === id ? { ...b, status } : b))
    );
  };

  const handleDeleteBooking = (id: string) => {
    setSavedBookings((prev) => prev.filter((b) => b.id !== id));
  };

  const handleAddManualItem = (e: React.FormEvent) => {
    e.preventDefault();
    const finalTitle = newTitle.trim() || `Custom ${newCategory} Expense`;
    const costVal = Math.max(0, Number(newCost) || 0);
    const item: SavedBookingItem = {
      id: `bk-${Date.now()}`,
      category: newCategory,
      title: finalTitle,
      provider: newProvider.trim() || 'Family Budget Entry',
      status: newStatus,
      totalFamilyCost: costVal,
      officialUrl: 'https://ttdevasthanams.ap.gov.in/',
      notes: 'Custom family expense entry',
      addedAt: 'Just now',
    };
    setSavedBookings((prev) => [item, ...prev]);
    setNewTitle('');
    setAddedItemSuccess('✓ Added to Trip Budget!');
    setBudgetSuccessMsg(`✓ Added "${finalTitle}" (₹${costVal.toLocaleString('en-IN')}) to Trip Budget!`);
    setTimeout(() => {
      setAddedItemSuccess(null);
      setBudgetSuccessMsg(null);
    }, 3500);
  };

  // Actionable expense reduction presets
  const applyExpenseReduction = (mode: 'ttd_choultry' | 'sleeper_train') => {
    if (mode === 'ttd_choultry') {
      setSavedBookings((prev) =>
        prev.map((b) =>
          b.category === 'Accommodation'
            ? {
                ...b,
                title: `TTD Srinivasam Pilgrim Complex — ${tripParams.rooms} AC Rooms × ${tripParams.nights} Nights`,
                provider: 'TTD Official Portal (ttdevasthanams.ap.gov.in)',
                totalFamilyCost: 400 * tripParams.rooms * tripParams.nights,
                officialUrl: 'https://ttdevasthanams.ap.gov.in/',
                notes: 'Switched to ₹400/room/night TTD AC room (₹0 Tax)',
              }
            : b
        )
      );
    } else if (mode === 'sleeper_train') {
      setSavedBookings((prev) =>
        prev.map((b) =>
          b.category === 'Transport'
            ? {
                ...b,
                title: `Round-Trip Train 17488/17487 Tirumala Express (Sleeper Class - ${tripParams.travellers} Pax)`,
                provider: 'Indian Railways (IRCTC Official)',
                totalFamilyCost: 345 * tripParams.travellers * 2,
                officialUrl: 'https://www.irctc.co.in/nget/train-search',
                notes: 'Switched to Sleeper Class (₹345 × 2 ways × travellers)',
              }
            : b
        )
      );
    }
  };

  return (
    <div className="space-y-8">
      {/* Header & Instant Total Family Budget Recalculation */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <p className="text-xs text-slate-500">
              Financial Ledger & Shortlisted Bookings · Currency in Indian Rupees (₹)
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              My Bookings, Category Breakdown & Budget Alerts
            </h2>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg">
              <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
              <label className="text-xs font-semibold text-slate-700">
                Planned Date:
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
                className="text-xs font-bold text-slate-900 bg-white px-2 py-1 border border-slate-200 rounded cursor-pointer"
                title="Customize planned trip date"
              />
            </div>

            <div className="flex items-center gap-2">
              <label className="text-xs font-semibold text-slate-700">
                Total Family Budget (₹):
              </label>
              <input
                type="number"
                step={1000}
                min={2000}
                value={tripParams.totalBudget}
                onChange={(e) =>
                  setTripParams((prev) => ({
                    ...prev,
                    totalBudget: Math.max(1000, Number(e.target.value) || 1000),
                  }))
                }
                className="w-32 px-3 py-2 text-sm font-bold font-mono-num border border-slate-300 rounded-lg bg-slate-50 text-slate-900"
              />
            </div>
          </div>
        </div>

        {/* 4-Column Financial KPI Strip */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs text-slate-500">Total Family Budget Limit</span>
            <div className="text-2xl font-bold text-slate-900 font-mono-num mt-1">
              ₹{tripParams.totalBudget.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500">
              Target for {tripParams.travellers} travellers ({tripParams.nights} nights)
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs text-slate-500">Planned & Shortlisted Total</span>
            <div className="text-2xl font-bold text-slate-900 font-mono-num mt-1">
              ₹{totalPlannedExpense.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500 font-mono-num">
              Confirmed: ₹{confirmedExpense.toLocaleString('en-IN')} · Est: ₹{shortlistedAndEstimated.toLocaleString('en-IN')}
            </span>
          </div>

          <div
            className={`p-4 border rounded-xl ${
              isOverBudget
                ? 'bg-rose-50/70 border-rose-200 text-rose-900'
                : 'bg-emerald-50/70 border-emerald-200 text-emerald-900'
            }`}
          >
            <span className="text-xs font-medium">
              {isOverBudget ? 'Over Budget By' : 'Remaining Family Budget'}
            </span>
            <div className="text-2xl font-bold font-mono-num mt-1">
              {isOverBudget ? '-' : '+'}₹{Math.abs(remainingBudget).toLocaleString('en-IN')}
            </div>
            <span className="text-[11px]">
              {isOverBudget
                ? 'Action required: Review cost-reduction tips below'
                : 'Within healthy family spending threshold'}
            </span>
          </div>

          <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl">
            <span className="text-xs text-slate-500">Per-Person Cost ({tripParams.travellers} Pax)</span>
            <div className="text-2xl font-bold text-slate-900 font-mono-num mt-1">
              ₹{perPersonPlanned.toLocaleString('en-IN')}
            </div>
            <span className="text-[11px] text-slate-500">
              All-inclusive per family member
            </span>
          </div>
        </div>

        {/* Budget Alert & One-Click Expense Reduction Suggestions */}
        {isOverBudget && (
          <div className="mt-6 p-5 bg-amber-50 border border-amber-200 rounded-xl space-y-3">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-900">
              <AlertTriangle className="w-4 h-4 text-amber-700 shrink-0" />
              Budget Alert: Your shortlisted plan exceeds your ₹
              {tripParams.totalBudget.toLocaleString('en-IN')} family budget by ₹
              {Math.abs(remainingBudget).toLocaleString('en-IN')}.
            </div>
            <p className="text-xs text-amber-800">
              Apply one of these verified cost-saving adjustments to immediately bring the trip back within budget:
            </p>
            <div className="flex flex-wrap gap-3">
              <button
                type="button"
                onClick={() => applyExpenseReduction('ttd_choultry')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-950 bg-white border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap shrink-0"
              >
                <TrendingDown className="w-3.5 h-3.5" />
                Switch Stay to TTD Srinivasam AC Room (₹400/night)
              </button>
              <button
                type="button"
                onClick={() => applyExpenseReduction('sleeper_train')}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-amber-950 bg-white border border-amber-300 rounded-lg hover:bg-amber-100 transition-colors whitespace-nowrap shrink-0"
              >
                <TrendingDown className="w-3.5 h-3.5" />
                Switch Rail Class from 3A to Sleeper (₹345/person each way)
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Category Breakdown Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {(Object.keys(categoryTotals) as SavedBookingItem['category'][]).map((cat) => {
          const amt = categoryTotals[cat];
          const pct =
            totalPlannedExpense > 0 ? Math.round((amt / totalPlannedExpense) * 100) : 0;
          return (
            <div key={cat} className="bg-white border border-slate-200 rounded-xl p-5">
              <div className="text-xs text-slate-500">{cat}</div>
              <div className="text-lg font-bold text-slate-900 font-mono-num mt-1">
                ₹{amt.toLocaleString('en-IN')}
              </div>
              <div className="text-xs text-slate-500 mt-0.5 font-mono-num">
                {pct}% of planned spend
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Manual Expense / Booking Reference Form */}
      <div className="space-y-3">
        {budgetSuccessMsg && (
          <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{budgetSuccessMsg}</span>
            </div>
            <button
              type="button"
              onClick={() => setBudgetSuccessMsg(null)}
              className="text-emerald-900 hover:underline text-[11px]"
            >
              Dismiss
            </button>
          </div>
        )}
        <form
          onSubmit={handleAddManualItem}
          className="bg-white border border-slate-200 rounded-xl p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 items-end"
        >
          <div className="lg:col-span-2">
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Expense or Booking Description
            </label>
            <input
              type="text"
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="e.g. TTD ₹300 Special Entry Darshan (4 Tickets)"
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:outline-none focus:border-[#0D4A42]"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Category</label>
            <select
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value as SavedBookingItem['category'])}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg bg-white"
            >
              <option value="Transport">Transport</option>
              <option value="Accommodation">Accommodation</option>
              <option value="Tour Package">Tour Package</option>
              <option value="Local Transport & Meals">Local Transport & Meals</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">
              Total Family Cost (₹)
            </label>
            <input
              type="number"
              min={0}
              value={newCost}
              onChange={(e) => setNewCost(Number(e.target.value))}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono-num"
            />
          </div>

          <div>
            <button
              type="submit"
              className={`w-full inline-flex items-center justify-center gap-1.5 px-4 py-2.5 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs active:scale-95 ${
                addedItemSuccess
                  ? 'bg-emerald-700 text-white'
                  : 'text-white bg-[#0D4A42] hover:bg-[#09352f]'
              }`}
            >
              {addedItemSuccess ? (
                <>
                  <CheckCircle2 className="w-3.5 h-3.5 text-white" />
                  {addedItemSuccess}
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  Add to Trip Budget
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Saved Bookings & Ledger Table */}
      <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
          <h3 className="text-base font-bold text-slate-900">
            Shortlisted Bookings & Trip Expense Ledger ({savedBookings.length})
          </h3>
          <span className="text-xs text-slate-500">
            Click "Official Portal" to complete external ticket/room reservation
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-3 px-4">Item & Notes</th>
                <th className="py-3 px-4">Category</th>
                <th className="py-3 px-4">Provider</th>
                <th className="py-3 px-4">Booking Status</th>
                <th className="py-3 px-4 text-right">Total Cost (₹)</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {savedBookings.map((item) => (
                <tr key={item.id} className="hover:bg-slate-50/70">
                  <td className="py-3.5 px-4">
                    <div className="font-bold text-slate-900">{item.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5">{item.notes}</div>
                  </td>
                  <td className="py-3.5 px-4 text-slate-600">{item.category}</td>
                  <td className="py-3.5 px-4 text-slate-600">{item.provider}</td>
                  <td className="py-3.5 px-4">
                    <select
                      value={item.status}
                      onChange={(e) =>
                        handleStatusChange(item.id, e.target.value as SavedBookingItem['status'])
                      }
                      className="px-2.5 py-1 text-xs bg-white border border-slate-300 rounded-md font-medium"
                    >
                      <option value="Estimated">Estimated</option>
                      <option value="Shortlisted">Shortlisted</option>
                      <option value="Confirmed Reference">Confirmed Reference</option>
                    </select>
                  </td>
                  <td className="py-3.5 px-4 text-right font-mono-num font-bold text-slate-900">
                    ₹{item.totalFamilyCost.toLocaleString('en-IN')}
                  </td>
                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <a
                        href={item.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-medium text-[#0D4A42] border border-[#0D4A42] rounded-md hover:bg-emerald-50 whitespace-nowrap shrink-0"
                      >
                        Official Portal
                        <ExternalLink className="w-3 h-3" />
                      </a>
                      <button
                        type="button"
                        onClick={() => handleDeleteBooking(item.id)}
                        className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-md"
                        title="Remove from ledger"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
