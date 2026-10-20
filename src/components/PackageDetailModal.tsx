import React from 'react';
import {
  X,
  Calendar,
  Clock,
  MapPin,
  Check,
  Ban,
  ShieldAlert,
  Building2,
  Users,
  Compass,
  ArrowRight,
  Sparkles,
} from 'lucide-react';
import type { PackageItem } from '../types';

interface PackageDetailModalProps {
  packageItem: PackageItem | null;
  onClose: () => void;
  onBookPackage: (pkg: PackageItem) => void;
}

export const PackageDetailModal: React.FC<PackageDetailModalProps> = ({
  packageItem,
  onClose,
  onBookPackage,
}) => {
  if (!packageItem) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200/90 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Cover Image & Header */}
        <div className="relative h-52 sm:h-64 w-full overflow-hidden shrink-0">
          <img
            src={packageItem.coverImage}
            alt={packageItem.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/85 via-slate-900/40 to-transparent" />

          {/* Close button */}
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-black/40 hover:bg-black/70 text-white backdrop-blur-xs transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Badge & Title */}
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <div className="flex items-center gap-2 mb-1.5 flex-wrap">
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500 text-white text-[11px] font-semibold">
                {packageItem.duration}
              </span>
              <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-xs text-white text-[11px] font-medium">
                {packageItem.category}
              </span>
            </div>
            <h2 className="text-xl sm:text-3xl font-bold font-serif-display drop-shadow-xs">
              {packageItem.title}
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 flex items-center gap-1.5 mt-0.5">
              <MapPin className="w-3.5 h-3.5 text-emerald-400" />
              <span>{packageItem.destination}</span>
            </p>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-5 sm:p-6 overflow-y-auto space-y-6">
          {/* Price & Provider Box */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 p-4 rounded-xl bg-emerald-50/70 border border-emerald-200/70">
            <div>
              <div className="text-xs text-emerald-800 font-medium">Verified Package Tariff</div>
              <div className="text-2xl font-bold text-slate-900 flex items-baseline gap-2">
                ₹{packageItem.pricePerPerson.toLocaleString('en-IN')}
                <span className="text-xs text-stone-500 font-normal">per adult (twin sharing)</span>
                {packageItem.originalPrice && (
                  <span className="text-xs text-stone-400 line-through">
                    ₹{packageItem.originalPrice.toLocaleString('en-IN')}
                  </span>
                )}
              </div>
              <p className="text-[11px] text-emerald-800 mt-0.5">
                Organised by: <span className="font-semibold">{packageItem.providerName}</span>
              </p>
            </div>

            <button
              type="button"
              onClick={() => {
                onClose();
                onBookPackage(packageItem);
              }}
              className="w-full sm:w-auto px-5 py-2.5 rounded-xl bg-[#0D4A42] hover:bg-[#09352F] text-white text-xs font-semibold shadow-xs transition-colors shrink-0 flex items-center justify-center gap-1.5 cursor-pointer"
            >
              <span>Book / Enquire Now</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          {/* Highlights */}
          {packageItem.highlights.length > 0 && (
            <div>
              <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2.5">
                Package Highlights
              </h3>
              <div className="flex flex-wrap gap-2">
                {packageItem.highlights.map((h, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-stone-100 text-slate-800 text-xs font-medium"
                  >
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{h}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Day-by-Day Itinerary */}
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-3">
              Detailed Day-by-Day Itinerary
            </h3>
            <div className="space-y-3">
              {packageItem.dayByDayItinerary.map((item) => (
                <div
                  key={item.day}
                  className="p-3.5 rounded-xl border border-stone-200/80 bg-stone-50/50 flex items-start gap-3"
                >
                  <div className="w-7 h-7 rounded-full bg-[#0D4A42] text-white text-xs font-bold flex items-center justify-center shrink-0 mt-0.5">
                    {item.day}
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-bold text-slate-900">{item.title}</h4>
                    <p className="text-xs text-stone-600 mt-1 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Inclusions & Exclusions */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-xl border border-emerald-200/80 bg-emerald-50/30">
              <h4 className="text-xs font-bold text-emerald-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Check className="w-4 h-4 text-emerald-600" /> Inclusions
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {packageItem.inclusions.map((inc, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-emerald-600 font-bold">•</span>
                    <span>{inc}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-4 rounded-xl border border-rose-200/80 bg-rose-50/30">
              <h4 className="text-xs font-bold text-rose-900 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Ban className="w-4 h-4 text-rose-600" /> Exclusions
              </h4>
              <ul className="space-y-1.5 text-xs text-slate-700">
                {packageItem.exclusions.map((exc, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <span className="text-rose-500 font-bold">•</span>
                    <span>{exc}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Cancellation Policy */}
          <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs text-stone-600">
            <span className="font-bold text-slate-800 block mb-0.5 flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-stone-500" /> Cancellation & Refund Terms:
            </span>
            <span>{packageItem.cancellationPolicy}</span>
          </div>
        </div>

        {/* Modal Footer */}
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
              onBookPackage(packageItem);
            }}
            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0D4A42] hover:bg-[#09352F] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <span>Book / Enquire This Package</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
