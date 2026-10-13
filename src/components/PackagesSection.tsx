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
} from 'lucide-react';
import type {
  TripParams,
  TourPackageOption,
  ProviderAdapterStatus,
  SavedBookingItem,
} from '../types';

interface PackagesSectionProps {
  tripParams: TripParams;
  packages: TourPackageOption[];
  providerAdapters: ProviderAdapterStatus[];
  tourImageUrl: string;
  onShortlistBooking: (item: Omit<SavedBookingItem, 'id' | 'addedAt'>) => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  tripParams,
  packages,
  providerAdapters,
  tourImageUrl,
  onShortlistBooking,
}) => {
  const [durationFilter, setDurationFilter] = useState<'all' | 1 | 2 | 3>('all');
  const [addedPackageKey, setAddedPackageKey] = useState<string | null>(null);

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
              className="bg-white border border-slate-200 rounded-xl p-6 flex flex-col justify-between"
            >
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-500">
                        {pkg.providerType} · {pkg.durationLabel} · Ex-{pkg.startingCity}
                      </div>
                      <h3 className="text-xl font-bold text-slate-900 mt-1">{pkg.packageTitle}</h3>
                      <p className="text-xs font-medium text-slate-700 mt-0.5">
                        Provider: {pkg.providerName} · Last checked {pkg.lastChecked}
                      </p>
                    </div>
                  </div>

                  {/* Inclusions & Exclusions */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-3 border-t border-slate-100 text-xs">
                    <div>
                      <span className="font-bold text-emerald-800 block mb-1.5">
                        Included Services:
                      </span>
                      <ul className="space-y-1 text-slate-700">
                        {pkg.inclusions.map((inc) => (
                          <li key={inc} className="flex items-start gap-1.5">
                            <Check className="w-3.5 h-3.5 text-emerald-700 shrink-0 mt-0.5" />
                            <span>{inc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <div>
                      <span className="font-bold text-rose-800 block mb-1.5">
                        Excluded / Extra Conditions:
                      </span>
                      <ul className="space-y-1 text-slate-600">
                        {pkg.exclusions.map((exc) => (
                          <li key={exc} className="flex items-start gap-1.5">
                            <X className="w-3.5 h-3.5 text-rose-600 shrink-0 mt-0.5" />
                            <span>{exc}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Hotel, Transport, Darshan & Cancellation Terms */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
                    <div>
                      <strong>Hotel Category:</strong> {pkg.hotelCategory}
                    </div>
                    <div>
                      <strong>Transport Details:</strong> {pkg.transportDetails}
                    </div>
                    <div className="sm:col-span-2">
                      <strong>Darshan Arrangement Policy:</strong>{' '}
                      <span className={pkg.darshanConfirmedInTerms ? 'text-emerald-800' : 'text-amber-800'}>
                        {pkg.darshanDetails}
                      </span>
                    </div>
                    <div className="sm:col-span-2">
                      <strong>Cancellation / Refund Terms:</strong> {pkg.cancellationTerms}
                    </div>
                    <div>
                      <strong>Verified Public Enquiry Phone:</strong>{' '}
                      {pkg.publicContactPhone ? (
                        <span className="font-mono-num font-semibold text-slate-900">
                          {pkg.publicContactPhone} (Official Toll-Free)
                        </span>
                      ) : (
                        'Not publicly verified'
                      )}
                    </div>
                    <div>
                      <strong>Source URL:</strong>{' '}
                      <a
                        href={pkg.sourceUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="underline text-[#0D4A42]"
                      >
                        {pkg.sourceUrl}
                      </a>
                    </div>
                  </div>
                </div>

                {/* Right Column: Visual + Family Price Breakdown */}
                <div className="bg-slate-50 border border-slate-200 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <img
                      src={tourImageUrl}
                      alt={pkg.packageTitle}
                      referrerPolicy="no-referrer"
                      className="w-full h-36 object-cover rounded-lg border border-slate-200 mb-4"
                    />
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
                        className={`w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-semibold rounded-lg transition-colors whitespace-nowrap shrink-0 ${
                          addedPackageKey === pkg.id
                            ? 'bg-emerald-800 text-white'
                            : 'text-white bg-[#0D4A42] hover:bg-[#09352f]'
                        }`}
                      >
                        <Plus className="w-3.5 h-3.5" />
                        {addedPackageKey === pkg.id
                          ? '✓ Added to Trip Budget!'
                          : 'Add Package to Trip Budget'}
                      </button>
                      <a
                        href={pkg.officialPackageUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="w-full inline-flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
                      >
                        View Official Package Portal
                        <ExternalLink className="w-3.5 h-3.5" />
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
