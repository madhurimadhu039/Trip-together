import React from 'react';
import {
  X,
  MapPin,
  Star,
  Languages,
  ShieldCheck,
  Award,
  Calendar,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  Sparkles,
} from 'lucide-react';
import type { LocalGuideItem } from '../types';

interface GuideProfileModalProps {
  guide: LocalGuideItem | null;
  onClose: () => void;
  onContactGuide: (guide: LocalGuideItem) => void;
}

export const GuideProfileModal: React.FC<GuideProfileModalProps> = ({
  guide,
  onClose,
  onContactGuide,
}) => {
  if (!guide) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200/90 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative p-6 bg-gradient-to-br from-[#0D4A42] to-[#14B8A6] text-white">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white backdrop-blur-xs transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-4">
            <img
              src={guide.avatar}
              alt={guide.name}
              className="w-18 h-18 rounded-full object-cover border-3 border-white shadow-md shrink-0"
            />
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-bold font-serif-display">{guide.name}</h2>
                {guide.verificationStatus === 'verified' && (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-white/20 text-white text-[11px] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-300" />
                    <span>Verified</span>
                  </span>
                )}
              </div>
              <p className="text-xs text-emerald-100 flex items-center gap-1.5 mt-1">
                <MapPin className="w-3.5 h-3.5 text-emerald-300" />
                <span>{guide.serviceLocation}, {guide.state}</span>
              </p>
              <div className="flex items-center gap-2 mt-2 text-xs">
                <div className="inline-flex items-center gap-1 bg-amber-400 text-slate-900 px-2 py-0.5 rounded-md font-bold">
                  <Star className="w-3 h-3 fill-slate-900 text-slate-900" />
                  <span>{guide.rating.toFixed(1)}</span>
                </div>
                <span className="text-emerald-100">{guide.reviewCount} customer reviews</span>
                <span className="text-emerald-200">·</span>
                <span className="text-emerald-100">{guide.experienceYears} Years Experience</span>
              </div>
            </div>
          </div>
        </div>

        {/* Scrollable Body */}
        <div className="p-6 overflow-y-auto space-y-5">
          {/* Availability & Rate banner */}
          <div className="grid grid-cols-2 gap-3 p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs">
            <div>
              <span className="text-stone-400 block font-medium">Standard Daily Tariff</span>
              <span className="text-base font-bold text-slate-900 block mt-0.5">
                ₹{guide.dailyRate.toLocaleString('en-IN')}
                <span className="text-xs text-stone-500 font-normal"> / full day</span>
              </span>
            </div>
            <div>
              <span className="text-stone-400 block font-medium">Current Status</span>
              <span className="text-xs font-bold text-emerald-700 block mt-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 inline-block animate-pulse" />
                {guide.availability}
              </span>
            </div>
          </div>

          {/* About & Bio */}
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">
              About the Guide
            </h3>
            <p className="text-xs sm:text-sm text-stone-700 leading-relaxed">{guide.bio}</p>
          </div>

          {/* Specialties */}
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-2">
              Areas of Expertise
            </h3>
            <div className="flex flex-wrap gap-1.5">
              {guide.specialties.map((spec, i) => (
                <span
                  key={i}
                  className="px-2.5 py-1 rounded-lg bg-emerald-50 text-[#0D4A42] text-xs font-semibold border border-emerald-200/60"
                >
                  {spec}
                </span>
              ))}
            </div>
          </div>

          {/* Languages */}
          <div>
            <h3 className="text-xs font-bold text-stone-400 uppercase tracking-wider mb-1.5">
              Languages Spoken
            </h3>
            <p className="text-xs text-slate-800 font-medium">{guide.languages.join(' · ')}</p>
          </div>

          {/* Trust Statement */}
          <div className="p-3 rounded-xl bg-amber-50/70 border border-amber-200/80 text-xs text-amber-900 flex items-start gap-2">
            <ShieldCheck className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" />
            <span className="leading-relaxed">
              Guides on Trip Together undergo identity verification and adhere to regional tourism facilitation guidelines. Direct billing and schedule terms are coordinated transparently with no middleman commission.
            </span>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 bg-stone-50 border-t border-stone-100 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-slate-900 cursor-pointer"
          >
            Back
          </button>
          <button
            type="button"
            onClick={() => {
              onClose();
              onContactGuide(guide);
            }}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D4A42] hover:bg-[#09352F] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
          >
            <MessageCircle className="w-4 h-4" />
            <span>Contact & Book {guide.name}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
