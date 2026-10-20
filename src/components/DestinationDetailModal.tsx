import React, { useState } from 'react';
import {
  X,
  MapPin,
  Calendar,
  Sparkles,
  Compass,
  CheckCircle2,
  Users,
  Package,
  ArrowRight,
  ShieldCheck,
  Star,
  ExternalLink,
} from 'lucide-react';
import type { DestinationItem, PackageItem, LocalGuideItem } from '../types';

interface DestinationDetailModalProps {
  destination: DestinationItem | null;
  packages: PackageItem[];
  guides: LocalGuideItem[];
  onClose: () => void;
  onSelectPackage: (pkg: PackageItem) => void;
  onSelectGuide: (guide: LocalGuideItem) => void;
  onPlanTripToDestination: (destName: string) => void;
}

export const DestinationDetailModal: React.FC<DestinationDetailModalProps> = ({
  destination,
  packages,
  guides,
  onClose,
  onSelectPackage,
  onSelectGuide,
  onPlanTripToDestination,
}) => {
  if (!destination) return null;

  const relevantPackages = packages.filter(
    (p) =>
      p.destinationId === destination.id ||
      p.destination.toLowerCase().includes(destination.name.toLowerCase())
  );

  const relevantGuides = guides.filter(
    (g) =>
      g.serviceLocation.toLowerCase().includes(destination.name.toLowerCase()) ||
      g.state.toLowerCase() === destination.state.toLowerCase()
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200/90 w-full max-w-4xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Hero Image Header */}
        <div className="relative h-56 sm:h-72 w-full overflow-hidden shrink-0">
          <img
            src={destination.image}
            alt={destination.name}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/35 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Category Badge & Title */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/90 text-white text-[11px] font-semibold tracking-wide uppercase">
                {destination.category}
              </span>
              {destination.badge && (
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/90 text-white text-[11px] font-semibold">
                  {destination.badge}
                </span>
              )}
            </div>
            <h2 className="text-2xl sm:text-4xl font-bold font-serif-display drop-shadow-xs">
              {destination.name}
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{destination.fullName}</span>
            </p>
          </div>
        </div>

        {/* Scrollable Body Content */}
        <div className="p-5 sm:p-7 overflow-y-auto space-y-6">
          {/* Quick Info Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200/80 text-xs">
            <div>
              <span className="text-stone-400 font-medium block">Best Time to Visit</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3.5 h-3.5 text-stone-500" /> {destination.bestSeason}
              </span>
            </div>
            <div>
              <span className="text-stone-400 font-medium block">Estimated Stay Budget</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{destination.approxNightBudget} / night</span>
            </div>
            <div className="col-span-2 sm:col-span-1">
              <span className="text-stone-400 font-medium block">State / Region</span>
              <span className="font-semibold text-slate-800 mt-0.5 block">{destination.state}, {destination.country}</span>
            </div>
          </div>

          {/* Description */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-stone-400 mb-2">
              About This Destination
            </h3>
            <p className="text-sm text-stone-700 leading-relaxed">{destination.description}</p>
          </div>

          {/* Key Attractions */}
          <div>
            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-stone-400 mb-2.5">
              Top Attractions & Highlights
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
              {destination.popularAttractions.map((attraction, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 p-2.5 rounded-lg bg-stone-50 border border-stone-200/60 text-xs font-medium text-slate-800"
                >
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{attraction}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Available Tour Packages for this Destination */}
          {relevantPackages.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-stone-400">
                  Featured Packages in {destination.name}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {relevantPackages.map((pkg) => (
                  <div
                    key={pkg.id}
                    className="p-3.5 rounded-xl border border-stone-200 bg-white hover:border-emerald-500/40 hover:shadow-xs transition-all flex flex-col justify-between"
                  >
                    <div>
                      <div className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">
                        {pkg.duration}
                      </div>
                      <h4 className="text-sm font-bold text-slate-900 mt-0.5 line-clamp-1">{pkg.title}</h4>
                      <div className="mt-2 text-xs font-bold text-slate-900">
                        ₹{pkg.pricePerPerson.toLocaleString('en-IN')}
                        <span className="text-[11px] text-stone-400 font-normal"> / person</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectPackage(pkg);
                      }}
                      className="mt-3 w-full py-1.5 rounded-lg bg-stone-100 hover:bg-[#0D4A42] hover:text-white text-slate-700 text-xs font-semibold transition-colors cursor-pointer"
                    >
                      View Package Details →
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Local Guides in this region */}
          {relevantGuides.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider text-stone-400">
                  Available Local Guides in {destination.name}
                </h3>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {relevantGuides.map((guide) => (
                  <div
                    key={guide.id}
                    className="flex items-center gap-3 p-3 rounded-xl border border-stone-200 bg-white"
                  >
                    <img
                      src={guide.avatar}
                      alt={guide.name}
                      className="w-11 h-11 rounded-full object-cover shrink-0"
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="text-xs font-bold text-slate-900 truncate">{guide.name}</span>
                        {guide.verificationStatus === 'verified' && (
                          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline shrink-0" />
                        )}
                      </div>
                      <div className="text-[11px] text-stone-500 truncate">{guide.languages.join(', ')}</div>
                      <div className="text-[11px] font-semibold text-slate-800">
                        ₹{guide.dailyRate.toLocaleString('en-IN')}/day
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        onClose();
                        onSelectGuide(guide);
                      }}
                      className="px-2.5 py-1 text-xs font-semibold text-[#0D4A42] hover:bg-emerald-50 rounded-lg cursor-pointer"
                    >
                      Profile
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer with Primary Plan CTA */}
        <div className="p-4 bg-stone-50 border-t border-stone-200/80 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-slate-900 cursor-pointer"
          >
            Close
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onPlanTripToDestination(destination.name);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D4A42] hover:bg-[#09352F] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <Compass className="w-4 h-4 text-emerald-300" />
            <span>Plan Itinerary to {destination.name}</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
