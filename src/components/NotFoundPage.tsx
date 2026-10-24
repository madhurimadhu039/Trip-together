import React from 'react';
import { Compass, Home, Search, Package, MapPin, ArrowRight, HelpCircle } from 'lucide-react';

interface NotFoundPageProps {
  onNavigateHome?: () => void;
  onExploreDestinations?: () => void;
  onViewPackages?: () => void;
  onContactUs?: () => void;
}

export const NotFoundPage: React.FC<NotFoundPageProps> = ({
  onNavigateHome,
  onExploreDestinations,
  onViewPackages,
  onContactUs,
}) => {
  return (
    <div className="min-h-[70vh] max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-16 flex flex-col items-center justify-center text-center">
      {/* 404 Visual Badge */}
      <div className="relative mb-6">
        <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-3xl bg-gradient-to-br from-[#0F1E36] via-[#1E3A8A] to-[#0D9488] flex items-center justify-center shadow-xl border border-white/20 mx-auto text-white">
          <Compass className="w-12 h-12 sm:w-14 sm:h-14 text-teal-300 animate-pulse" />
        </div>
        <span className="absolute -bottom-3 -right-2 px-3 py-1 rounded-full bg-rose-500 text-white font-mono-num font-bold text-xs shadow-md">
          404 Error
        </span>
      </div>

      {/* Main Heading */}
      <h1 className="text-3xl sm:text-5xl font-bold text-slate-900 font-serif-display tracking-tight max-w-xl">
        Page Not Found
      </h1>

      <p className="text-sm sm:text-base text-stone-600 max-w-lg mt-3 leading-relaxed">
        We couldn't find the page you're looking for. It may have been moved, renamed, or doesn't exist on Trip Together.
      </p>

      {/* Primary Action Buttons */}
      <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-4 mt-8">
        <button
          type="button"
          onClick={onNavigateHome}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer hover:scale-102"
        >
          <Home className="w-4 h-4 text-teal-300" />
          <span>Back to Home</span>
        </button>

        <button
          type="button"
          onClick={onExploreDestinations}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer hover:scale-102"
        >
          <Search className="w-4 h-4" />
          <span>Explore Destinations</span>
        </button>

        <button
          type="button"
          onClick={onViewPackages}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-slate-800 text-xs sm:text-sm font-bold transition-all shadow-xs cursor-pointer"
        >
          <Package className="w-4 h-4 text-[#0D9488]" />
          <span>Tour Packages</span>
        </button>
      </div>

      {/* Quick Navigation Suggestions */}
      <div className="mt-14 pt-10 border-t border-stone-200 w-full max-w-2xl">
        <h2 className="text-xs font-bold uppercase tracking-wider text-stone-400 mb-4">
          Popular Links on Trip Together
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-left">
          <button
            type="button"
            onClick={onExploreDestinations}
            className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-[#0D9488] hover:shadow-sm transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[#0D9488] mb-1">
              <MapPin className="w-4 h-4" />
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="text-xs font-bold text-slate-900">Destinations</div>
            <div className="text-[11px] text-stone-500">Curated Indian cities & circuits</div>
          </button>

          <button
            type="button"
            onClick={onViewPackages}
            className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-[#0D9488] hover:shadow-sm transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[#0D9488] mb-1">
              <Package className="w-4 h-4" />
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="text-xs font-bold text-slate-900">Tour Packages</div>
            <div className="text-[11px] text-stone-500">Transparent family itineraries</div>
          </button>

          <button
            type="button"
            onClick={onContactUs}
            className="p-4 rounded-2xl bg-white border border-stone-200/90 hover:border-[#0D9488] hover:shadow-sm transition-all group cursor-pointer"
          >
            <div className="flex items-center justify-between text-[#0D9488] mb-1">
              <HelpCircle className="w-4 h-4" />
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
            </div>
            <div className="text-xs font-bold text-slate-900">Contact Support</div>
            <div className="text-[11px] text-stone-500">We're here to help you</div>
          </button>
        </div>
      </div>
    </div>
  );
};
