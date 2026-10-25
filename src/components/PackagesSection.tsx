import React, { useState, useMemo } from 'react';
import {
  Search,
  MapPin,
  Clock,
  ArrowRight,
  Sparkles,
  X,
  PackageCheck,
  CheckCircle2,
} from 'lucide-react';
import type { DestinationItem, PackageItem } from '../types';

export interface PackagesSectionProps {
  destinations: DestinationItem[];
  packages: PackageItem[];
  onSelectPackage: (pkg: PackageItem) => void;
  onSelectDestination?: (dest: DestinationItem) => void;
  onNavigateHome: () => void;
}

export const PackagesSection: React.FC<PackagesSectionProps> = ({
  destinations,
  packages,
  onSelectPackage,
  onSelectDestination,
  onNavigateHome,
}) => {
  const [searchQuery, setSearchQuery] = useState('');

  // Pair each destination with its configured package if available
  const destinationPackages = useMemo(() => {
    return destinations.map((dest) => {
      const matchedPkg = packages.find(
        (p) =>
          p.destinationId === dest.id ||
          p.destination.toLowerCase().includes(dest.name.toLowerCase()) ||
          dest.name.toLowerCase().includes(p.destination.toLowerCase())
      );

      return {
        destination: dest,
        packageItem: matchedPkg || null,
      };
    });
  }, [destinations, packages]);

  // Case-insensitive, partial-text destination search filter
  const filteredItems = useMemo(() => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return destinationPackages;

    return destinationPackages.filter(({ destination, packageItem }) => {
      const matchDestName = destination.name.toLowerCase().includes(q);
      const matchState = destination.state.toLowerCase().includes(q);
      const matchFullName = destination.fullName.toLowerCase().includes(q);
      const matchTitle = packageItem?.title.toLowerCase().includes(q) || false;
      return matchDestName || matchState || matchFullName || matchTitle;
    });
  }, [destinationPackages, searchQuery]);

  const handleCardClick = (dest: DestinationItem, pkg: PackageItem | null) => {
    if (pkg) {
      onSelectPackage(pkg);
    } else if (onSelectDestination) {
      onSelectDestination(dest);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header & Navigation */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-2 border-b border-stone-200">
        <div>
          <button
            type="button"
            onClick={onNavigateHome}
            className="text-xs font-semibold text-[#0D9488] hover:underline mb-2 inline-flex items-center gap-1 cursor-pointer"
          >
            ← Back to Home
          </button>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-emerald-50 text-[#0D9488] border border-emerald-200/80 text-[11px] font-bold uppercase tracking-wider">
              <PackageCheck className="w-3.5 h-3.5" />
              Verified Itineraries
            </span>
            <span className="text-xs text-stone-400">•</span>
            <span className="text-xs text-stone-500 font-medium">
              {destinations.length} Destinations Available
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif-display">
            Tours & Tour Packages
          </h1>
          <p className="text-xs sm:text-sm text-stone-600 max-w-2xl mt-1 leading-relaxed">
            Curated, all-inclusive journeys across every destination from Explore Destinations. 
            Enjoy transparent day-by-day itineraries, certified local guidance, and zero hidden tariffs.
          </p>
        </div>

        {/* Live Search Input */}
        <div className="w-full md:w-80 lg:w-96 shrink-0">
          <label htmlFor="package-search" className="sr-only">
            Search packages by destination
          </label>
          <div className="relative">
            <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="package-search"
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by destination or state..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-stone-300 rounded-xl text-xs sm:text-sm text-slate-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0D9488] focus:border-transparent transition-all shadow-xs"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-stone-700 p-0.5 cursor-pointer"
                aria-label="Clear search"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
          <div className="flex items-center justify-between text-[11px] text-stone-500 mt-1.5 px-1">
            <span>
              {searchQuery.trim()
                ? `Showing ${filteredItems.length} matching package${filteredItems.length === 1 ? '' : 's'}`
                : `Showing all ${filteredItems.length} destination packages`}
            </span>
            {searchQuery.trim() && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="text-[#0D9488] hover:underline font-semibold cursor-pointer"
              >
                Reset
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Package Cards Grid */}
      {filteredItems.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredItems.map(({ destination: dest, packageItem: pkg }) => {
            const cardTitle = pkg ? pkg.title : `${dest.name} Discovery Package`;
            const durationText = pkg?.duration || null;
            const priceText =
              pkg && typeof pkg.pricePerPerson === 'number' && pkg.pricePerPerson > 0
                ? pkg.pricePerPerson
                : null;
            const highlights = pkg?.highlights?.slice(0, 2) || dest.popularAttractions?.slice(0, 2) || [];

            return (
              <div
                key={dest.id}
                onClick={() => handleCardClick(dest, pkg)}
                className="group bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer focus-within:ring-2 focus-within:ring-[#0D9488]"
                role="button"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    handleCardClick(dest, pkg);
                  }
                }}
                aria-label={`View tour package details for ${cardTitle}`}
              >
                {/* Image Container with Badges */}
                <div className="relative h-52 sm:h-56 overflow-hidden bg-stone-100">
                  <img
                    src={dest.image}
                    alt={`${dest.name} - ${cardTitle}`}
                    loading="lazy"
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-950/70 via-transparent to-transparent opacity-70 group-hover:opacity-40 transition-opacity" />

                  {/* Top Floating Badges */}
                  <div className="absolute top-3 left-3 right-3 flex items-center justify-between gap-2 pointer-events-none">
                    {durationText ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-semibold shadow-xs">
                        <Clock className="w-3 h-3 text-emerald-400" />
                        <span>{durationText}</span>
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-900/85 backdrop-blur-xs text-white text-[11px] font-semibold shadow-xs">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        <span>{dest.category}</span>
                      </span>
                    )}

                    <span className="px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-xs text-slate-800 text-[11px] font-bold shadow-xs truncate max-w-[140px]">
                      {dest.name}
                    </span>
                  </div>

                  {/* Bottom overlay for destination label */}
                  <div className="absolute bottom-3 left-3 right-3 text-white pointer-events-none">
                    <p className="text-xs font-semibold flex items-center gap-1 drop-shadow-md">
                      <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span className="truncate">{dest.state}, {dest.country}</span>
                    </p>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#0D9488] font-serif-display transition-colors line-clamp-2 leading-snug">
                      {cardTitle}
                    </h2>
                    <p className="text-xs text-stone-600 line-clamp-2 leading-relaxed">
                      {dest.description}
                    </p>

                    {/* Highlights Pills */}
                    {highlights.length > 0 && (
                      <div className="pt-1 flex flex-wrap gap-1.5">
                        {highlights.map((h, idx) => (
                          <span
                            key={idx}
                            className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md bg-stone-100 text-slate-700 text-[11px] font-medium truncate max-w-full"
                          >
                            <CheckCircle2 className="w-3 h-3 text-[#0D9488] shrink-0" />
                            <span className="truncate">{h}</span>
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Price & Action Row */}
                  <div className="pt-3 border-t border-stone-100 space-y-3">
                    {priceText ? (
                      <div className="flex items-baseline justify-between">
                        <div>
                          <span className="text-[10px] text-stone-400 font-medium uppercase tracking-wider block">
                            Starting from
                          </span>
                          <div className="flex items-baseline gap-1.5">
                            <span className="text-lg font-bold text-slate-900">
                              ₹{priceText.toLocaleString('en-IN')}
                            </span>
                            <span className="text-[11px] text-stone-500 font-normal">/ person</span>
                          </div>
                        </div>
                        {pkg?.originalPrice && (
                          <span className="text-xs text-stone-400 line-through">
                            ₹{pkg.originalPrice.toLocaleString('en-IN')}
                          </span>
                        )}
                      </div>
                    ) : (
                      <div className="text-xs text-stone-500 font-medium italic">
                        Custom itinerary & guide available
                      </div>
                    )}

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCardClick(dest, pkg);
                      }}
                      className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-100 group-hover:bg-[#0F1E36] text-slate-800 group-hover:text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs"
                    >
                      <span>View Tour Details</span>
                      <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        /* Empty State when Search Query has no matches */
        <div className="bg-white rounded-3xl border border-stone-200/90 p-12 text-center space-y-4 max-w-md mx-auto my-8 shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto">
            <Search className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold text-slate-900">
              No tour packages found
            </h3>
            <p className="text-xs text-stone-500 mt-1">
              We couldn&apos;t find any destination packages matching &ldquo;{searchQuery}&rdquo;.
            </p>
          </div>
          <button
            type="button"
            onClick={() => setSearchQuery('')}
            className="px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs inline-flex items-center gap-1.5"
          >
            <X className="w-3.5 h-3.5" />
            <span>Clear Search</span>
          </button>
        </div>
      )}
    </div>
  );
};
