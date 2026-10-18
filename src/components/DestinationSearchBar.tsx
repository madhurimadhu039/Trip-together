import React, { useState, useRef, useEffect } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  X,
  Compass,
  Calendar,
  IndianRupee,
  Flame,
} from 'lucide-react';
import {
  PopularDestination,
  POPULAR_DESTINATIONS,
  getRecommendedDestinations,
} from '../data/popularDestinations';

interface DestinationSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (selectedDestination?: string) => void;
  placeholder?: string;
  className?: string;
  variant?: 'hero' | 'compact';
  onSelectDestination?: (destination: PopularDestination) => void;
}

export const DestinationSearchBar: React.FC<DestinationSearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = "Search trains, buses, Tirupati hotels, packages, or type 'Kakinada to Tirupati'...",
  className = '',
  variant = 'hero',
  onSelectDestination,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [selectedCategoryFilter, setSelectedCategoryFilter] = useState<string>('All');
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Compute recommendations based on input query
  const cleanQuery = value.trim();
  const rawRecommendations = getRecommendedDestinations(cleanQuery, 8);

  const recommendations =
    selectedCategoryFilter === 'All'
      ? rawRecommendations
      : rawRecommendations.filter(
          (d) => d.category.toLowerCase() === selectedCategoryFilter.toLowerCase()
        );

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Reset active keyboard index when query changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [value]);

  const handleSelect = (dest: PopularDestination) => {
    onChange(dest.name);
    setIsOpen(false);
    if (onSelectDestination) {
      onSelectDestination(dest);
    } else {
      onSubmit(dest.name);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (!isOpen && (e.key === 'ArrowDown' || e.key === 'ArrowUp')) {
      setIsOpen(true);
      return;
    }

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev < recommendations.length - 1 ? prev + 1 : 0
      );
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) =>
        prev > 0 ? prev - 1 : recommendations.length - 1
      );
    } else if (e.key === 'Enter') {
      if (isOpen && activeIndex >= 0 && recommendations[activeIndex]) {
        e.preventDefault();
        handleSelect(recommendations[activeIndex]);
      } else {
        setIsOpen(false);
        onSubmit();
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOpen && activeIndex >= 0 && recommendations[activeIndex]) {
      handleSelect(recommendations[activeIndex]);
    } else {
      setIsOpen(false);
      onSubmit();
    }
  };

  // Helper to highlight matching text
  const highlightMatch = (text: string, query: string) => {
    if (!query) return text;
    const cleanQ = query.trim().toLowerCase();
    const idx = text.toLowerCase().indexOf(cleanQ);
    if (idx === -1) return text;
    const before = text.substring(0, idx);
    const match = text.substring(idx, idx + cleanQ.length);
    const after = text.substring(idx + cleanQ.length);
    return (
      <>
        {before}
        <span className="bg-amber-200/90 text-emerald-950 font-bold px-0.5 rounded">
          {match}
        </span>
        {after}
      </>
    );
  };

  const categories = ['All', 'Pilgrimage', 'Coastal & Beach', 'Hill Station', 'Heritage & Culture'];

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form
        onSubmit={handleFormSubmit}
        className={`w-full flex items-center transition-all ${
          variant === 'hero'
            ? 'bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-white/40 p-1.5 pl-5 gap-3 ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-[#1E332A] focus-within:bg-white'
            : 'bg-white rounded-full shadow-md border border-stone-200 p-1 pl-4 gap-2 focus-within:ring-2 focus-within:ring-[#1E332A]'
        }`}
      >
        <Search
          className={`shrink-0 text-stone-400 transition-colors ${
            variant === 'hero' ? 'w-4 h-4 sm:w-5 sm:h-5' : 'w-4 h-4'
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={(e) => {
            onChange(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          className="flex-1 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-stone-400 bg-transparent focus:outline-none min-w-0"
        />

        {value && (
          <button
            type="button"
            onClick={() => {
              onChange('');
              inputRef.current?.focus();
            }}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="submit"
          className={`font-bold tracking-wider text-white bg-[#1E332A] hover:bg-[#14241D] rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-sm active:scale-95 ${
            variant === 'hero'
              ? 'px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-xs'
              : 'px-5 py-2 text-xs'
          }`}
        >
          SEARCH
        </button>
      </form>

      {/* Autocomplete & Recommendations Popover Dropdown */}
      {isOpen && (
        <div
          className="absolute left-0 right-0 top-full mt-2.5 z-50 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-200/90 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-left"
          style={{ maxHeight: 'min(520px, 80vh)' }}
        >
          {/* Popover Header */}
          <div className="bg-gradient-to-r from-stone-50 via-amber-50/40 to-stone-50 px-4 py-2.5 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
              {cleanQuery ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                  <span>
                    Recommended Places matching{' '}
                    <span className="text-[#1E332A] font-bold">"{cleanQuery}"</span>
                  </span>
                </>
              ) : (
                <>
                  <Flame className="w-3.5 h-3.5 text-orange-600" />
                  <span className="text-stone-900">
                    Famous & Popular Places to Visit
                  </span>
                </>
              )}
            </div>

            <span className="text-[11px] text-stone-500 font-medium">
              {recommendations.length} {recommendations.length === 1 ? 'place' : 'places'} found
            </span>
          </div>

          {/* Category Filter Pills (When search input is short or empty) */}
          {cleanQuery.length <= 2 && (
            <div className="px-4 py-2 bg-white border-b border-stone-100 flex items-center gap-1.5 overflow-x-auto no-scrollbar">
              <span className="text-[10px] uppercase tracking-wider text-stone-400 font-bold shrink-0 mr-1">
                Filter:
              </span>
              {categories.map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setSelectedCategoryFilter(cat)}
                  className={`text-[11px] px-2.5 py-0.5 rounded-full transition-colors whitespace-nowrap cursor-pointer shrink-0 font-medium ${
                    selectedCategoryFilter === cat
                      ? 'bg-[#1E332A] text-white font-semibold shadow-xs'
                      : 'bg-stone-100 hover:bg-stone-200 text-stone-600'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {/* List of Recommended Destinations */}
          <div className="divide-y divide-stone-100 max-h-[360px] overflow-y-auto overscroll-contain">
            {recommendations.length > 0 ? (
              recommendations.map((dest, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={dest.id}
                    type="button"
                    onClick={() => handleSelect(dest)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3.5 transition-all group cursor-pointer ${
                      isSelected
                        ? 'bg-amber-50/80'
                        : 'hover:bg-stone-50/90 bg-white'
                    }`}
                  >
                    {/* Location Icon Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-[#1E332A] text-white shadow-sm'
                          : 'bg-stone-100 text-stone-600 group-hover:bg-[#1E332A] group-hover:text-white'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-[#1E332A] transition-colors">
                          {highlightMatch(dest.name, cleanQuery)}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">
                          • {dest.state}
                        </span>

                        {dest.badge && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-amber-100/90 text-amber-900 border border-amber-200/60 shrink-0">
                            {dest.badge}
                          </span>
                        )}

                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 shrink-0">
                          {dest.category}
                        </span>
                      </div>

                      {/* Attractions & Highlights */}
                      <p className="text-xs text-stone-600 line-clamp-1 mb-1">
                        <span className="text-stone-400 font-medium">Attractions: </span>
                        {dest.popularAttractions}
                      </p>

                      {/* Season & Budget Metadata */}
                      <div className="flex items-center gap-3 text-[11px] text-stone-500">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-stone-400" />
                          Best: {dest.bestSeason}
                        </span>
                        <span className="flex items-center gap-1 font-mono-num">
                          <IndianRupee className="w-3 h-3 text-stone-400" />
                          Stay from {dest.approxNightBudget}/night
                        </span>
                      </div>
                    </div>

                    {/* Quick Selection Arrow */}
                    <div className="shrink-0 flex items-center self-center pl-2">
                      <span
                        className={`text-xs font-semibold flex items-center gap-1 px-2.5 py-1 rounded-full transition-all ${
                          isSelected
                            ? 'bg-[#1E332A] text-white'
                            : 'text-stone-400 group-hover:text-[#1E332A] group-hover:bg-stone-100'
                        }`}
                      >
                        Select
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })
            ) : (
              <div className="px-6 py-8 text-center space-y-2">
                <Compass className="w-8 h-8 mx-auto text-stone-300" />
                <p className="text-sm font-semibold text-slate-800">
                  No predefined destination matching "{cleanQuery}"
                </p>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  You can still press <kbd className="px-1.5 py-0.5 bg-stone-100 rounded text-stone-700 font-mono text-[11px]">Enter</kbd> to search trains, buses, and hotels for "{cleanQuery}".
                </p>
              </div>
            )}
          </div>

          {/* Popover Footer Info */}
          <div className="px-4 py-2 bg-stone-50/90 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500">
            <span>
              💡 Select any place to auto-plan trains, buses & budget stays
            </span>
            <span className="hidden sm:inline text-stone-400 font-mono">
              ↑↓ to navigate • ↵ to select
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
