import React from 'react';
import {
  X,
  ShieldCheck,
  Users,
  Award,
  Heart,
  MapPin,
  CheckCircle2,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { TripTogetherSymbol } from './TripTogetherLogo';

interface AboutUsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExploreDestinations: () => void;
}

export const AboutUsModal: React.FC<AboutUsModalProps> = ({
  isOpen,
  onClose,
  onExploreDestinations,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-3xl shadow-2xl border border-stone-200/90 w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="relative p-6 sm:p-8 bg-gradient-to-br from-[#0F1E36] via-[#1E3A8A] to-[#0D9488] text-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/10 hover:bg-white/20 text-white backdrop-blur-xs transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="max-w-xl">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-xs font-semibold mb-3">
              <TripTogetherSymbol sizeClass="w-4 h-4" />
              <span>Our Story & Mission</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold font-serif-display tracking-tight">
              Reimagining Meaningful Journeys, Together
            </h2>
            <p className="text-xs sm:text-sm text-stone-200 mt-2 leading-relaxed">
              Trip Together was built on a simple conviction: Family and group travel should be transparent, authentic, and stress-free.
            </p>
          </div>
        </div>

        {/* Scrollable Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-8">
          {/* Why We Exist */}
          <div className="space-y-3">
            <h3 className="text-lg font-bold text-slate-900 font-serif-display">
              Why We Built Trip Together
            </h3>
            <p className="text-xs sm:text-sm text-stone-600 leading-relaxed">
              Planning a trip with family members across multiple generations—from curious children to revered grandparents—often involves navigating confusing tariffs, predatory darshan package promises, conflicting transit timings, and scattered WhatsApp chats. Trip Together bridges these gaps into a single, cohesive travel platform.
            </p>
          </div>

          {/* 4 Core Pillars */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-teal-100 text-[#0D9488] flex items-center justify-center font-bold">
                <ShieldCheck className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Total Tariff Transparency</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                We never fabricate guaranteed darshan tokens or hidden fees. We distinguish between per-night hotel budgets and total-stay costs with verifiable public tariffs.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center font-bold">
                <Users className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Family-First Collaboration</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Collaborative packing checklists, private group messaging, consent-based route GPS, and custom senior citizen pacing built right into your itinerary.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-700 flex items-center justify-center font-bold">
                <Award className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Certified Local Guides</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Connect directly with background-checked local historians, regional storytellers, and licensed guides who turn sight-seeing into unforgettable cultural immersion.
              </p>
            </div>

            <div className="p-4 rounded-2xl bg-stone-50 border border-stone-200 space-y-2">
              <div className="w-8 h-8 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center font-bold">
                <Sparkles className="w-4 h-4" />
              </div>
              <h4 className="text-sm font-bold text-slate-900">Adaptive AI Intelligence</h4>
              <p className="text-xs text-stone-600 leading-relaxed">
                Smart itinerary generation grounded in real transport schedules, weather seasons, and customized budget allocations from pickup to destination.
              </p>
            </div>
          </div>

          {/* Platform Standards */}
          <div className="p-5 rounded-2xl bg-emerald-50/70 border border-emerald-200/80 space-y-2.5">
            <h4 className="text-sm font-bold text-emerald-950 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Our Verified Partner Pledge</span>
            </h4>
            <p className="text-xs text-emerald-900 leading-relaxed">
              Every tour package, hotel property, and transport option listed on Trip Together is checked against official tourism standards (APTDC, TTD, IRCTC, state tourism corporations) and verified directory records.
            </p>
          </div>

          {/* Footer CTAs */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-stone-200">
            <span className="text-xs text-stone-500">
              Trip Together · Empowering Indian & Global Travellers Since 2024
            </span>
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-slate-700 hover:bg-stone-100 transition-colors cursor-pointer"
              >
                Close
              </button>
              <button
                type="button"
                onClick={() => {
                  onClose();
                  onExploreDestinations();
                }}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
              >
                <span>Explore Destinations</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
