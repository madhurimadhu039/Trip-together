import React, { useState } from 'react';
import {
  Package,
  ExternalLink,
  AlertTriangle,
  Check,
  X,
  Plus,
  Database,
  ShieldCheck,
  Eye,
  Heart,
  Calendar,
  ChevronDown,
} from 'lucide-react';
import type {
  TripParams,
  TourPackageOption,
  ProviderAdapterStatus,
  SavedBookingItem,
  PackageItem,
} from '../types';

interface PackagesSectionProps {
  tripParams: TripParams;
  packages: TourPackageOption[];
  providerAdapters: ProviderAdapterStatus[];
  tourImageUrl: string;
  onShortlistBooking: (item: Omit<SavedBookingItem, 'id' | 'addedAt'>) => void;
  onSelectPackage?: (pkg: any) => void;
  onBookPackage?: (pkg: any) => void;
  onToggleWishlist?: (pkgId: string) => void;
  wishlist?: string[];
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  tripParams,
  packages,
  providerAdapters,
  tourImageUrl,
  onShortlistBooking,
  onSelectPackage,
  onBookPackage,
  onToggleWishlist,
  wishlist = [],
}) => {
  const [durationFilter, setDurationFilter] = useState<'all' | 1 | 2 | 3>('all');
  const [addedPackageKey, setAddedPackageKey] = useState<string | null>(null);
  const [expandedPackageId, setExpandedPackageId] = useState<string | null>(null);

  const filteredPackages = packages.filter((pkg) => {
    if (durationFilter === 'all') return true;
    return pkg.durationDays === durationFilter;
  });

  return (
    <div className="space-y-8">
      {/* Header & Darshan Transparency Policy */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 pb-6 border-b border-slate-200">
          <div>
            <p className="text-xs text-slate-500">
              Authorized Tourism Corporations & Rail Packages · {tripParams.destination}
            </p>
            <h2 className="text-2xl font-bold text-slate-900 mt-1">
              Ready-Made Tour Packages & Provider Discovery
            </h2>
          </div>

          <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg w-fit">
            <button
              type="button"
              onClick={() => setDurationFilter('all')}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                durationFilter === 'all' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              All Durations ({packages.length})
            </button>
            <button
              type="button"
              onClick={() => setDurationFilter(1)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                durationFilter === 1 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              1-Day Darshan
            </button>
            <button
              type="button"
              onClick={() => setDurationFilter(2)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                durationFilter === 2 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              2-Day Transit
            </button>
            <button
              type="button"
              onClick={() => setDurationFilter(3)}
              className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 ${
                durationFilter === 3 ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600'
              }`}
            >
              3-Day Rail Tour
            </button>
          </div>
        </div>

        <div className="mt-4 flex items-start gap-2.5 text-xs text-slate-600">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <span>
            <strong>Strict TTD Darshan Verification Policy:</strong> No package is ever marked as guaranteeing Tirumala Darshan unless confirmed by the official provider's active quota terms. Third-party or urgent bookings within 7 days of travel do not carry pre-allotted ₹300 Special Entry Darshan tokens.
          </span>
        </div>
      </div>

      {/* Tour Package Cards */}
      <div className="grid grid-cols-1 gap-6">
        {filteredPackages.map((pkg) => {
          const adultAndSeniorCount = tripParams.adults + tripParams.seniors;
          const totalFamilyPackagePrice =
            pkg.pricePerAdult * adultAndSeniorCount + pkg.pricePerChild * tripParams.children;

          return (
            <div
              key={pkg.id}
              className="bg-white border border-stone-200/90 rounded-2xl p-5 sm:p-6 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  {/* Top Bar: Title, Provider, Duration */}
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-2.5 py-0.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold">
                          {pkg.durationLabel}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">
                          {pkg.providerType} · Ex-{pkg.startingCity}
                        </span>
                      </div>
                      <h3 className="text-lg sm:text-xl font-bold text-slate-900 font-serif-display mt-1">
                        {pkg.packageTitle}
                      </h3>
                      <p className="text-xs text-stone-600 mt-0.5">
                        Provided by <strong className="text-slate-800">{pkg.providerName}</strong> · Verified Tariff
                      </p>
                    </div>

                    {/* Quick Price on mobile */}
                    <div className="lg:hidden text-right">
                      <span className="text-[11px] text-stone-500 block">From</span>
                      <span className="text-lg font-bold text-[#0D9488] font-mono-num">
                        ₹{pkg.pricePerAdult.toLocaleString('en-IN')}<span className="text-xs text-stone-500 font-normal">/adult</span>
                      </span>
                    </div>
                  </div>

                  {/* Prioritized Key Highlights (3 concise tags) */}
                  <div className="space-y-1.5 pt-2 border-t border-stone-100">
                    <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                      Package Highlights
                    </span>
                    <div className="flex flex-wrap gap-2">
                      {pkg.inclusions.slice(0, 3).map((inc) => (
                        <span
                          key={inc}
                          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-teal-50/80 border border-teal-200/60 text-slate-800 text-xs font-medium"
                        >
                          <Check className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                          <span>{inc}</span>
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Key Details: Darshan & Hotel category */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-stone-600 pt-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-400 font-medium">Hotel:</span>
                      <span className="font-semibold text-slate-800">{pkg.hotelCategory}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-stone-400 font-medium">Darshan:</span>
                      <span className={`font-semibold ${pkg.darshanConfirmedInTerms ? 'text-emerald-700' : 'text-amber-700'}`}>
                        {pkg.darshanConfirmedInTerms ? 'Official Quota Terms' : 'Standard Queue Assistance'}
                      </span>
                    </div>
                  </div>

                  {/* Expandable Full Inclusions & Terms */}
                  <div className="pt-2">
                    <button
                      type="button"
                      onClick={() => setExpandedPackageId((prev) => (prev === pkg.id ? null : pkg.id))}
                      className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D9488] hover:underline cursor-pointer"
                    >
                      <ChevronDown
                        className={`w-4 h-4 transition-transform duration-200 ${
                          expandedPackageId === pkg.id ? 'rotate-180' : ''
                        }`}
                      />
                      <span>
                        {expandedPackageId === pkg.id
                          ? 'Hide Detailed Inclusions & Terms'
                          : 'Show Full Inclusions & Terms'}
                      </span>
                    </button>

                    {expandedPackageId === pkg.id && (
                      <div className="mt-3 p-4 rounded-xl bg-stone-50 border border-stone-200 space-y-3 animate-in fade-in duration-150 text-xs">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <span className="font-bold text-emerald-800 block mb-1">All Inclusions:</span>
                            <ul className="space-y-1 text-slate-700">
                              {pkg.inclusions.map((item) => (
                                <li key={item} className="flex items-start gap-1.5">
                                  <Check className="w-3 h-3 text-emerald-600 shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div>
                            <span className="font-bold text-rose-800 block mb-1">Exclusions / Conditions:</span>
                            <ul className="space-y-1 text-slate-600">
                              {pkg.exclusions.map((item) => (
                                <li key={item} className="flex items-start gap-1.5">
                                  <X className="w-3 h-3 text-rose-500 shrink-0 mt-0.5" />
                                  <span>{item}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>

                        <div className="pt-2 border-t border-stone-200 text-stone-600 space-y-1">
                          <div>
                            <strong>Cancellation Policy:</strong> {pkg.cancellationTerms}
                          </div>
                          <div>
                            <strong>Transport Details:</strong> {pkg.transportDetails}
                          </div>
                          {pkg.publicContactPhone && (
                            <div>
                              <strong>Enquiry Helpline:</strong>{' '}
                              <span className="font-mono-num font-semibold text-slate-900">
                                {pkg.publicContactPhone}
                              </span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Column: Visual + Family Price Breakdown */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="relative mb-3 overflow-hidden rounded-lg">
                      <img
                        src={tourImageUrl}
                        alt={pkg.packageTitle}
                        referrerPolicy="no-referrer"
                        className="w-full h-36 object-cover border border-slate-200"
                      />
                      {onToggleWishlist && (
                        <button
                          type="button"
                          onClick={() => onToggleWishlist(pkg.id)}
                          aria-label="Toggle package wishlist"
                          className="absolute top-2.5 right-2.5 p-1.5 rounded-full bg-white/80 backdrop-blur-xs text-rose-500 hover:bg-white shadow-xs transition-colors cursor-pointer"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              wishlist.includes(pkg.id) ? 'fill-rose-500 text-rose-500' : 'text-slate-400'
                            }`}
                          />
                        </button>
                      )}
                    </div>
                    <div className="space-y-1.5 text-xs">
                      <div className="flex justify-between text-slate-600">
                        <span>Adult / Senior Tariff ({adultAndSeniorCount} pax):</span>
                        <span className="font-mono-num font-semibold text-slate-900">
                          ₹{pkg.pricePerAdult.toLocaleString('en-IN')} × {adultAndSeniorCount}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-600">
                        <span>Child Tariff ({tripParams.children} child):</span>
                        <span className="font-mono-num font-semibold text-slate-900">
                          ₹{pkg.pricePerChild.toLocaleString('en-IN')} × {tripParams.children}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-slate-200">
                    <span className="text-xs text-slate-500">
                      Total Family Package Cost ({tripParams.travellers} Travellers)
                    </span>
                    <div className="text-2xl font-bold text-slate-900 font-mono-num mt-0.5">
                      ₹{totalFamilyPackagePrice.toLocaleString('en-IN')}
                    </div>

                    <div className="mt-4 flex flex-col gap-2">
                      {onBookPackage && (
                        <button
                          type="button"
                          onClick={() => {
                            const normalizedPkg: PackageItem = {
                              id: pkg.id,
                              title: pkg.packageTitle,
                              destination: tripParams.destination,
                              destinationId: 'dest-tirupati',
                              duration: pkg.durationLabel,
                              days: pkg.durationDays,
                              nights: Math.max(1, pkg.durationDays - 1),
                              pricePerPerson: pkg.pricePerAdult,
                              category: pkg.providerType,
                              coverImage: tourImageUrl,
                              highlights: pkg.inclusions.slice(0, 4),
                              inclusions: pkg.inclusions,
                              exclusions: pkg.exclusions,
                              dayByDayItinerary: [
                                { day: 1, title: 'Arrival & Tour Commencement', desc: pkg.transportDetails },
                                { day: 2, title: 'Sightseeing & Temple Darshan', desc: pkg.darshanDetails },
                                { day: 3, title: 'Farewell & Scheduled Departure', desc: 'Hotel checkout and scheduled return transfer.' },
                              ].slice(0, pkg.durationDays),
                              providerName: pkg.providerName,
                              cancellationPolicy: pkg.cancellationTerms,
                            };
                            onBookPackage(normalizedPkg);
                          }}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold text-white bg-[#0D4A42] hover:bg-[#09352f] rounded-lg transition-colors whitespace-nowrap shrink-0 shadow-sm cursor-pointer"
                        >
                          <Calendar className="w-3.5 h-3.5" />
                          <span>Book / Submit Enquiry</span>
                        </button>
                      )}

                      {onSelectPackage && (
                        <button
                          type="button"
                          onClick={() => {
                            const normalizedPkg: PackageItem = {
                              id: pkg.id,
                              title: pkg.packageTitle,
                              destination: tripParams.destination,
                              destinationId: 'dest-tirupati',
                              duration: pkg.durationLabel,
                              days: pkg.durationDays,
                              nights: Math.max(1, pkg.durationDays - 1),
                              pricePerPerson: pkg.pricePerAdult,
                              category: pkg.providerType,
                              coverImage: tourImageUrl,
                              highlights: pkg.inclusions.slice(0, 4),
                              inclusions: pkg.inclusions,
                              exclusions: pkg.exclusions,
                              dayByDayItinerary: [
                                { day: 1, title: 'Arrival & Tour Commencement', desc: pkg.transportDetails },
                                { day: 2, title: 'Sightseeing & Temple Darshan', desc: pkg.darshanDetails },
                                { day: 3, title: 'Farewell & Scheduled Departure', desc: 'Hotel checkout and scheduled return transfer.' },
                              ].slice(0, pkg.durationDays),
                              providerName: pkg.providerName,
                              cancellationPolicy: pkg.cancellationTerms,
                            };
                            onSelectPackage(normalizedPkg);
                          }}
                          className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold text-[#0D4A42] border border-[#0D4A42]/40 bg-teal-50/50 hover:bg-teal-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>View Full Itinerary Details</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => {
                          onShortlistBooking({
                            category: 'Tour Package',
                            title: `${pkg.packageTitle} (${tripParams.travellers} Pax)`,
                            provider: pkg.providerName,
                            status: 'Shortlisted',
                            totalFamilyCost: totalFamilyPackagePrice,
                            officialUrl: pkg.officialPackageUrl,
                            notes: `${pkg.durationLabel} · Adult ₹${pkg.pricePerAdult}, Child ₹${pkg.pricePerChild}`,
                          });
                          setAddedPackageKey(pkg.id);
                          setTimeout(() => setAddedPackageKey(null), 2500);
                        }}
                        className={`w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          addedPackageKey === pkg.id
                            ? 'bg-emerald-800 text-white'
                            : 'text-slate-700 bg-white border border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {addedPackageKey === pkg.id
                          ? '✓ Added to Ledger!'
                          : 'Add to Budget Ledger'}
                      </button>

                      <a
                        href={pkg.officialPackageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-1.5 text-[11px] font-medium text-slate-500 hover:text-slate-800 transition-colors whitespace-nowrap shrink-0"
                      >
                        <span>Official Portal Reference</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 6: Third-Party Provider Adapter & Normalization Registry */}
      <div className="bg-white border border-slate-200 rounded-xl p-6">
        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
          <div className="flex items-center gap-2.5">
            <Database className="w-5 h-5 text-[#0D4A42]" />
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Modular Provider Discovery & Compliance Architecture
              </h3>
              <p className="text-xs text-slate-500">
                Normalizes travel feeds across Rail, Bus, Flight, Hotel, and Tour Operators while strictly respecting robots.txt, rate limits, and CAPTCHA boundaries
              </p>
            </div>
          </div>
          <span className="text-xs text-slate-500 font-mono-num">
            {providerAdapters.length} Adapters Registered
          </span>
        </div>

        <div className="overflow-x-auto mt-4">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 font-semibold">
                <th className="py-2.5 px-3">Adapter Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Server Environment Key</th>
                <th className="py-2.5 px-3">Active Mode</th>
                <th className="py-2.5 px-3">Compliance & Normalization Policy</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-200">
              {providerAdapters.map((adapter) => (
                <tr key={adapter.id} className="hover:bg-slate-50/70">
                  <td className="py-3 px-3 font-semibold text-slate-900">
                    {adapter.providerName}
                  </td>
                  <td className="py-3 px-3 text-slate-600">{adapter.category}</td>
                  <td className="py-3 px-3 font-mono-num text-slate-700">
                    {adapter.envSecretName}
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={
                        adapter.configured
                          ? 'text-emerald-800 font-semibold'
                          : 'text-amber-800 font-medium'
                      }
                    >
                      {adapter.configured ? 'Live API Key Active' : 'Verified Reference Adapter'}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">{adapter.complianceNote}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
