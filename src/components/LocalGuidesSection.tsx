import React, { useState } from 'react';
import {
  ShieldCheck,
  Star,
  MapPin,
  Languages,
  Calendar,
  MessageCircle,
  UserCheck,
  Sparkles,
  ArrowRight,
  Clock,
  Award,
  Search,
  Filter,
} from 'lucide-react';
import type { LocalGuideItem } from '../types';

interface LocalGuidesSectionProps {
  guides: LocalGuideItem[];
  onSelectGuide: (guide: LocalGuideItem) => void;
  onContactGuide: (guide: LocalGuideItem) => void;
  onRegisterAsGuide: () => void;
}

export const LocalGuidesSection: React.FC<LocalGuidesSectionProps> = ({
  guides,
  onSelectGuide,
  onContactGuide,
  onRegisterAsGuide,
}) => {
  const [selectedLocation, setSelectedLocation] = useState<string>('all');
  const [verifiedOnly, setVerifiedOnly] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');

  const locations = ['all', ...Array.from(new Set(guides.map((g) => g.serviceLocation.split('&')[0].trim())))];

  let filteredGuides = guides;

  if (selectedLocation !== 'all') {
    filteredGuides = filteredGuides.filter((g) =>
      g.serviceLocation.toLowerCase().includes(selectedLocation.toLowerCase()) ||
      g.state.toLowerCase().includes(selectedLocation.toLowerCase())
    );
  }

  if (verifiedOnly) {
    filteredGuides = filteredGuides.filter((g) => g.verificationStatus === 'verified');
  }

  if (searchQuery.trim()) {
    const q = searchQuery.toLowerCase().trim();
    filteredGuides = filteredGuides.filter(
      (g) =>
        g.name.toLowerCase().includes(q) ||
        g.serviceLocation.toLowerCase().includes(q) ||
        g.languages.some((l) => l.toLowerCase().includes(q)) ||
        g.specialties.some((s) => s.toLowerCase().includes(q))
    );
  }

  return (
    <section id="local-guides" className="space-y-8 scroll-mt-24">
      {/* Header with Title and Registration Action */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[#0D4A42] text-xs font-semibold mb-2">
            <UserCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified Local Guides · Pan-India & Regional</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif-display tracking-tight">
            Connect with Trusted Local Guides
          </h2>
          <p className="text-sm text-stone-600 max-w-2xl mt-1 leading-relaxed">
            Discover regional experts, certified historians, and licensed trip leads who make your travel authentic, safe, and rich in local culture.
          </p>
        </div>

        <button
          type="button"
          onClick={onRegisterAsGuide}
          className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-white border border-[#0D4A42]/30 text-[#0D4A42] hover:bg-[#0D4A42] hover:text-white transition-all text-xs font-semibold shadow-xs shrink-0 self-start sm:self-auto cursor-pointer"
        >
          <Award className="w-4 h-4 text-amber-500" />
          <span>Become a Local Guide</span>
          <ArrowRight className="w-3.5 h-3.5 ml-0.5" />
        </button>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-4 border border-stone-200/90 shadow-xs flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search guides by name, city, specialty, or language..."
            className="w-full pl-10 pr-4 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D4A42]/20 focus:bg-white transition-all"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto pb-1 md:pb-0 scrollbar-none">
          <span className="text-xs text-stone-500 font-medium whitespace-nowrap flex items-center gap-1">
            <Filter className="w-3.5 h-3.5" /> Location:
          </span>
          <select
            value={selectedLocation}
            onChange={(e) => setSelectedLocation(e.target.value)}
            className="text-xs bg-stone-50 border border-stone-200 rounded-lg px-2.5 py-1.5 font-medium text-slate-700 focus:outline-none focus:ring-1 focus:ring-[#0D4A42]"
          >
            <option value="all">All Locations</option>
            {locations.filter((l) => l !== 'all').map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>

          <label className="inline-flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer whitespace-nowrap ml-2 bg-stone-50 px-2.5 py-1.5 rounded-lg border border-stone-200">
            <input
              type="checkbox"
              checked={verifiedOnly}
              onChange={(e) => setVerifiedOnly(e.target.checked)}
              className="rounded text-[#0D4A42] focus:ring-[#0D4A42]"
            />
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
            <span>Verified only</span>
          </label>
        </div>
      </div>

      {/* Guide Cards Grid */}
      {filteredGuides.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-stone-300 p-8">
          <UserCheck className="w-10 h-10 text-stone-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No guides matching your criteria</h3>
          <p className="text-xs text-stone-500 mt-1">Try clearing your filters or search keywords.</p>
          <button
            type="button"
            onClick={() => {
              setSelectedLocation('all');
              setVerifiedOnly(false);
              setSearchQuery('');
            }}
            className="mt-4 px-4 py-2 bg-stone-100 hover:bg-stone-200 rounded-xl text-xs font-semibold text-slate-700 cursor-pointer"
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredGuides.map((guide) => (
            <div
              key={guide.id}
              className="bg-white rounded-2xl border border-stone-200/90 hover:border-emerald-500/40 hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden group"
            >
              <div className="p-5">
                {/* Header: Avatar, Name, Location & Verification Badge */}
                <div className="flex items-start gap-4">
                  <img
                    src={guide.avatar}
                    alt={guide.name}
                    className="w-14 h-14 rounded-full object-cover border-2 border-white shadow-xs shrink-0 group-hover:scale-105 transition-transform"
                    loading="lazy"
                  />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-base font-bold text-slate-900 truncate">{guide.name}</h3>
                      {guide.verificationStatus === 'verified' && (
                        <span title="Verified by Trip Together Platform" className="shrink-0">
                          <ShieldCheck className="w-4 h-4 text-emerald-600 inline" />
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-stone-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                      <span className="truncate">{guide.serviceLocation}</span>
                    </p>

                    <div className="flex items-center gap-2 mt-1.5 text-xs">
                      <div className="inline-flex items-center gap-1 text-amber-600 font-semibold">
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        <span>{guide.rating.toFixed(1)}</span>
                      </div>
                      <span className="text-stone-300">·</span>
                      <span className="text-stone-500">{guide.reviewCount} reviews</span>
                      <span className="text-stone-300">·</span>
                      <span className="text-stone-600 font-medium">{guide.experienceYears}y exp</span>
                    </div>
                  </div>
                </div>

                {/* Bio snippet */}
                <p className="text-xs text-stone-600 mt-3.5 line-clamp-2 leading-relaxed">
                  {guide.bio}
                </p>

                {/* Specialties Tags */}
                <div className="mt-3.5 flex flex-wrap gap-1.5">
                  {guide.specialties.slice(0, 3).map((spec, idx) => (
                    <span
                      key={idx}
                      className="text-[11px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 font-medium"
                    >
                      {spec}
                    </span>
                  ))}
                  {guide.specialties.length > 3 && (
                    <span className="text-[11px] px-1.5 py-0.5 rounded-md text-stone-400">
                      +{guide.specialties.length - 3}
                    </span>
                  )}
                </div>

                {/* Languages */}
                <div className="mt-3 flex items-center gap-1.5 text-[11px] text-stone-500">
                  <Languages className="w-3.5 h-3.5 text-stone-400 shrink-0" />
                  <span className="truncate">{guide.languages.join(', ')}</span>
                </div>
              </div>

              {/* Card Footer: Pricing & Action Buttons */}
              <div className="p-4 bg-stone-50/70 border-t border-stone-100 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs text-stone-500 font-medium">Daily Rate</div>
                  <div className="text-base font-bold text-slate-900">
                    ₹{guide.dailyRate.toLocaleString('en-IN')}
                    <span className="text-[11px] text-stone-400 font-normal"> / day</span>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => onSelectGuide(guide)}
                    className="px-3 py-1.5 text-xs font-semibold text-stone-700 hover:text-slate-900 hover:bg-stone-200/80 rounded-lg transition-colors cursor-pointer"
                  >
                    View Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => onContactGuide(guide)}
                    className="px-3.5 py-1.5 text-xs font-semibold rounded-lg bg-[#0D4A42] hover:bg-[#09352F] text-white shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>Contact</span>
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
