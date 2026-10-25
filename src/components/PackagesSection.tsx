import React, { useMemo } from 'react';
import {
  MapPin,
  ArrowRight,
  PackageCheck,
} from 'lucide-react';
import type { DestinationItem, PackageItem } from '../types';
import { SEED_PACKAGES } from '../data/platformSeed';

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
  // Pair each destination with its configured package from props or SEED_PACKAGES
  const destinationPackages = useMemo(() => {
    return destinations.map((dest) => {
      const matchedPkg =
        packages.find(
          (p) =>
            p.destinationId === dest.id ||
            p.destination.toLowerCase().includes(dest.name.toLowerCase()) ||
            dest.name.toLowerCase().includes(p.destination.toLowerCase())
        ) ||
        SEED_PACKAGES.find(
          (p) =>
            p.destinationId === dest.id ||
            p.destination.toLowerCase().includes(dest.name.toLowerCase()) ||
            dest.name.toLowerCase().includes(p.destination.toLowerCase())
        ) ||
        null;

      return {
        destination: dest,
        packageItem: matchedPkg,
      };
    });
  }, [destinations, packages]);

  const handleCardClick = (dest: DestinationItem, pkg: PackageItem | null) => {
    const finalPkg =
      pkg ||
      SEED_PACKAGES.find(
        (p) =>
          p.destinationId === dest.id ||
          p.destination.toLowerCase().includes(dest.name.toLowerCase()) ||
          dest.name.toLowerCase().includes(p.destination.toLowerCase())
      );

    if (finalPkg) {
      onSelectPackage(finalPkg);
    } else if (onSelectDestination) {
      onSelectDestination(dest);
    }
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="pb-4 border-b border-stone-200">
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

      {/* Package Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {destinationPackages.map(({ destination: dest, packageItem: pkg }) => {
          const cardTitle = pkg ? pkg.title : `${dest.name} Tour Package`;
          const isLadakh = dest.id === 'dest-ladakh' || dest.name.toLowerCase().includes('ladakh');
          const isOoty = dest.id === 'dest-ooty' || dest.name.toLowerCase().includes('ooty');

          // Exact configured prices: Leh Ladakh = ₹16,500, Ooty & Coonoor = ₹5,900
          const priceText =
            pkg && typeof pkg.pricePerPerson === 'number' && pkg.pricePerPerson > 0
              ? pkg.pricePerPerson
              : isLadakh
              ? 16500
              : isOoty
              ? 5900
              : null;

          const originalPrice =
            pkg?.originalPrice ||
            (isLadakh ? 19800 : isOoty ? 7200 : undefined);

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
                <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                {/* Top Badge */}
                <div className="absolute top-3 right-3 pointer-events-none">
                  {/* Destination Name Badge */}
                  <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur-xs text-slate-800 text-[11px] font-bold shadow-xs">
                    {dest.name}
                  </span>
                </div>
              </div>

              {/* Card Content */}
              <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900 group-hover:text-[#0D9488] font-serif-display transition-colors line-clamp-2 leading-snug">
                    {cardTitle}
                  </h2>
                  <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-2">
                    <MapPin className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                    <span className="truncate">{dest.state}, {dest.country}</span>
                  </p>
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
                      {originalPrice && (
                        <span className="text-xs text-stone-400 line-through">
                          ₹{originalPrice.toLocaleString('en-IN')}
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
    </div>
  );
};
