import React, { useState, useRef, useEffect, useId } from 'react';
import {
  Search,
  MapPin,
  Sparkles,
  ArrowRight,
  X,
  Compass,
  Calendar,
  IndianRupee,
  Loader2,
  TrendingUp,
} from 'lucide-react';
import {
  PopularDestination,
  getRecommendedDestinations,
} from '../data/popularDestinations';

export interface DestinationSearchBarProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit: (selectedQuery?: string, selectedDestination?: PopularDestination | null) => void;
  placeholder?: string;
  className?: string;
  variant?: 'hero' | 'compact';
  onSelectDestination?: (destination: PopularDestination) => void;
  onClearDestination?: () => void;
  selectedDestination?: PopularDestination | null;
}

export const DestinationSearchBar: React.FC<DestinationSearchBarProps> = ({
  value,
  onChange,
  onSubmit,
  placeholder = 'Where do you want to go? (e.g. Bangalore, Goa, Jaipur, Paris...)',
  className = '',
  variant = 'hero',
  onSelectDestination,
  onClearDestination,
  selectedDestination,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [recommendations, setRecommendations] = useState<PopularDestination[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentSelected, setCurrentSelected] = useState<PopularDestination | null>(
    selectedDestination || null
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const listboxId = useId();

  // Sync with prop if passed
  useEffect(() => {
    if (selectedDestination !== undefined) {
      setCurrentSelected(selectedDestination);
    }
  }, [selectedDestination]);

  const cleanQuery = value.trim();

  // Update suggestions immediately as user types
  useEffect(() => {
    // 1. When input is empty, load default popular destinations
    if (!cleanQuery) {
      const defaultDestinations = getRecommendedDestinations('', 8);
      setRecommendations(defaultDestinations);
      setIsLoading(false);
      return;
    }

    // 2. Compute synchronous prefix matches immediately (case-insensitive startsWith)
    const immediateMatches = getRecommendedDestinations(cleanQuery, 8);
    setRecommendations(immediateMatches);

    // 3. Debounced verification against API endpoint
    setIsLoading(true);
    let isCancelled = false;

    const timer = setTimeout(async () => {
      try {
        const response = await fetch(
          `/api/destinations/search?q=${encodeURIComponent(cleanQuery)}`
        );
        if (response.ok && !isCancelled) {
          const data = await response.json();
          if (Array.isArray(data.destinations)) {
            setRecommendations(data.destinations);
          }
        }
      } catch {
        if (!isCancelled) {
          setRecommendations(immediateMatches);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }, 120);

    return () => {
      isCancelled = true;
      clearTimeout(timer);
    };
  }, [cleanQuery]);

  // Reset active keyboard index when query changes
  useEffect(() => {
    setActiveIndex(-1);
  }, [value]);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(e: MouseEvent | TouchEvent) {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        setActiveIndex(-1);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVal = e.target.value;
    onChange(newVal);

    // If user modifies text, reset previously selected destination so custom text is preserved
    if (currentSelected && newVal.trim().toLowerCase() !== currentSelected.name.toLowerCase()) {
      setCurrentSelected(null);
      onClearDestination?.();
    }

    setIsOpen(true);
  };

  const handleSelect = (dest: PopularDestination) => {
    setCurrentSelected(dest);
    onChange(dest.name);
    setIsOpen(false);
    setActiveIndex(-1);

    if (onSelectDestination) {
      onSelectDestination(dest);
    } else {
      onSubmit(dest.name, dest);
    }
  };

  const handleSubmitCustom = (customText: string) => {
    const trimmed = customText.trim();
    if (!trimmed) return;
    setIsOpen(false);
    setActiveIndex(-1);
    setCurrentSelected(null);
    onSubmit(trimmed, null);
  };

  const handleClear = () => {
    onChange('');
    setCurrentSelected(null);
    onClearDestination?.();
    const defaults = getRecommendedDestinations('', 8);
    setRecommendations(defaults);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const totalSelectable = recommendations.length + (cleanQuery.length > 0 ? 1 : 0);

    // Arrow down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      if (totalSelectable > 0) {
        setActiveIndex((prev) => (prev < totalSelectable - 1 ? prev + 1 : 0));
      }
      return;
    }

    // Arrow up
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        setIsOpen(true);
        return;
      }
      if (totalSelectable > 0) {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : totalSelectable - 1));
      }
      return;
    }

    // Enter key
    if (e.key === 'Enter') {
      e.preventDefault();
      // If user navigated to a specific recommendation
      if (isOpen && activeIndex >= 0 && activeIndex < recommendations.length) {
        handleSelect(recommendations[activeIndex]);
        return;
      }

      // If user navigated to the "Use custom destination" item
      if (isOpen && activeIndex === recommendations.length && cleanQuery.length > 0) {
        handleSubmitCustom(cleanQuery);
        return;
      }

      // Otherwise submit current input value directly as custom or matched destination
      setIsOpen(false);
      const trimmed = value.trim();
      const matched = recommendations.find(
        (r) => r.name.toLowerCase() === trimmed.toLowerCase()
      );
      const effectiveDest = matched || (currentSelected?.name.toLowerCase() === trimmed.toLowerCase() ? currentSelected : null);
      onSubmit(trimmed, effectiveDest);
      return;
    }

    // Escape key
    if (e.key === 'Escape') {
      e.preventDefault();
      setIsOpen(false);
      setActiveIndex(-1);
      return;
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isOpen && activeIndex >= 0 && activeIndex < recommendations.length) {
      handleSelect(recommendations[activeIndex]);
    } else {
      setIsOpen(false);
      const trimmed = value.trim();
      const matched = recommendations.find(
        (r) => r.name.toLowerCase() === trimmed.toLowerCase()
      );
      const effectiveDest = matched || (currentSelected?.name.toLowerCase() === trimmed.toLowerCase() ? currentSelected : null);
      onSubmit(trimmed, effectiveDest);
    }
  };

  // Helper to highlight matching prefix in suggestion name
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
        <span className="bg-teal-200/90 text-teal-950 font-bold px-0.5 rounded">
          {match}
        </span>
        {after}
      </>
    );
  };

  return (
    <div ref={containerRef} className={`relative w-full ${className}`}>
      <form
        onSubmit={handleFormSubmit}
        className={`w-full flex items-center transition-all ${
          variant === 'hero'
            ? 'bg-white/95 backdrop-blur-md rounded-full shadow-2xl border border-white/40 p-1.5 pl-5 gap-3 ring-1 ring-black/5 focus-within:ring-2 focus-within:ring-[#0D9488] focus-within:bg-white'
            : 'bg-white rounded-full shadow-md border border-stone-200 p-1 pl-4 gap-2 focus-within:ring-2 focus-within:ring-[#0D9488]'
        }`}
      >
        <Search
          className={`shrink-0 text-stone-400 transition-colors ${
            variant === 'hero' ? 'w-4 h-4 sm:w-5 sm:h-5 text-teal-600' : 'w-4 h-4'
          }`}
        />

        <input
          ref={inputRef}
          type="text"
          value={value}
          onChange={handleInputChange}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 && recommendations[activeIndex]
              ? `dest-option-${recommendations[activeIndex].id}`
              : undefined
          }
          className="flex-1 text-xs sm:text-sm font-semibold text-slate-900 placeholder:text-stone-400 bg-transparent focus:outline-none min-w-0"
        />

        {value && (
          <button
            type="button"
            onClick={handleClear}
            className="p-1 rounded-full text-stone-400 hover:text-stone-700 hover:bg-stone-100 transition-colors cursor-pointer shrink-0"
            title="Clear search"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}

        <button
          type="submit"
          className={`font-bold tracking-wider text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-sm active:scale-95 ${
            variant === 'hero'
              ? 'px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-xs'
              : 'px-5 py-2 text-xs'
          }`}
        >
          SEARCH
        </button>
      </form>

      {/* Autocomplete & Suggestions Popover Dropdown */}
      {isOpen && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2.5 z-50 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-200/90 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-left"
          style={{ maxHeight: 'min(520px, 80vh)' }}
        >
          {/* Popover Header */}
          <div className="bg-gradient-to-r from-stone-50 via-teal-50/40 to-stone-50 px-4 py-2.5 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
              {cleanQuery ? (
                <>
                  <Sparkles className="w-3.5 h-3.5 text-teal-600" />
                  <span>
                    Suggestions starting with{' '}
                    <span className="text-teal-900 font-bold">"{cleanQuery}"</span>
                  </span>
                </>
              ) : (
                <>
                  <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                  <span>Popular Trending Destinations</span>
                </>
              )}
            </div>

            <div className="flex items-center gap-2">
              {isLoading && cleanQuery && (
                <div className="flex items-center gap-1 text-[11px] text-teal-800 font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Searching...</span>
                </div>
              )}
              {cleanQuery && (
                <span className="text-[11px] text-stone-500 font-medium">
                  {recommendations.length} {recommendations.length === 1 ? 'result' : 'results'}
                </span>
              )}
            </div>
          </div>

          {/* List of Matching Destinations */}
          <div className="divide-y divide-stone-100 max-h-[360px] overflow-y-auto overscroll-contain">
            {recommendations.length > 0 ? (
              recommendations.map((dest, idx) => {
                const isSelected = idx === activeIndex;
                return (
                  <button
                    key={dest.id}
                    id={`dest-option-${dest.id}`}
                    role="option"
                    aria-selected={isSelected}
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSelect(dest);
                    }}
                    onClick={() => handleSelect(dest)}
                    onMouseEnter={() => setActiveIndex(idx)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-3.5 transition-all group cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/80'
                        : 'hover:bg-stone-50/90 bg-white'
                    }`}
                  >
                    {/* Location Icon Badge */}
                    <div
                      className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                        isSelected
                          ? 'bg-[#0D9488] text-white shadow-sm'
                          : 'bg-stone-100 text-stone-600 group-hover:bg-[#0D9488] group-hover:text-white'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>

                    {/* Content Details */}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-0.5">
                        <span className="text-sm font-bold text-slate-900 group-hover:text-teal-900 transition-colors">
                          {highlightMatch(dest.name, cleanQuery)}
                        </span>
                        <span className="text-xs text-stone-500 font-medium">
                          • {dest.state}, {dest.country || 'India'}
                        </span>

                        {dest.badge && (
                          <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-teal-50 text-teal-800 border border-teal-200/60 shrink-0">
                            {dest.badge}
                          </span>
                        )}

                        <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 shrink-0">
                          {dest.category}
                        </span>
                      </div>

                      {/* Attractions & Highlights */}
                      {dest.popularAttractions && (
                        <p className="text-xs text-stone-600 line-clamp-1 mb-1">
                          <span className="text-stone-400 font-medium">Attractions: </span>
                          {dest.popularAttractions}
                        </p>
                      )}

                      {/* Season & Budget Metadata */}
                      <div className="flex items-center gap-3 text-[11px] text-stone-500">
                        {dest.bestSeason && (
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3 text-stone-400" />
                            Best: {dest.bestSeason}
                          </span>
                        )}
                        {dest.approxNightBudget && (
                          <span className="flex items-center gap-1 font-mono-num">
                            <IndianRupee className="w-3 h-3 text-stone-400" />
                            Stay from {dest.approxNightBudget}/night
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Quick Selection Arrow */}
                    <div className="shrink-0 flex items-center self-center pl-2">
                      <span
                        className={`text-xs font-semibold flex items-center gap-1 px-2.5 py-1 rounded-full transition-all ${
                          isSelected
                            ? 'bg-[#0D9488] text-white'
                            : 'text-stone-400 group-hover:text-[#0D9488] group-hover:bg-teal-50'
                        }`}
                      >
                        Select
                        <ArrowRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })
            ) : !isLoading ? (
              <div className="p-6 text-center space-y-3">
                <Compass className="w-8 h-8 mx-auto text-teal-600" />
                <div>
                  <p className="text-sm font-bold text-slate-800">
                    No matching destinations. You can still use your custom destination.
                  </p>
                  <p className="text-xs text-stone-500 mt-1 max-w-sm mx-auto">
                    Type any city, town, state, or region worldwide to plan your trip.
                  </p>
                </div>
                {cleanQuery && (
                  <button
                    type="button"
                    onMouseDown={(e) => {
                      e.preventDefault();
                      handleSubmitCustom(cleanQuery);
                    }}
                    onClick={() => handleSubmitCustom(cleanQuery)}
                    className="w-full max-w-sm mx-auto px-4 py-2.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-xs font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer"
                  >
                    <MapPin className="w-3.5 h-3.5 text-teal-400" />
                    <span>Use "{cleanQuery}" as your custom destination</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            ) : null}

            {/* Custom Destination Fallback Option when user has typed something that isn't an exact match */}
            {cleanQuery && recommendations.length > 0 && !recommendations.some(r => r.name.toLowerCase() === cleanQuery.toLowerCase()) && (
              <button
                type="button"
                onMouseDown={(e) => {
                  e.preventDefault();
                  handleSubmitCustom(cleanQuery);
                }}
                onClick={() => handleSubmitCustom(cleanQuery)}
                onMouseEnter={() => setActiveIndex(recommendations.length)}
                className={`w-full text-left px-4 py-3 flex items-center justify-between gap-3 border-t border-stone-200/80 transition-all cursor-pointer ${
                  activeIndex === recommendations.length
                    ? 'bg-teal-100/70 text-teal-950 font-bold'
                    : 'bg-stone-50 hover:bg-stone-100 text-stone-700'
                }`}
              >
                <div className="flex items-center gap-2 text-xs">
                  <MapPin className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                  <span>
                    Can't find your place? Use <strong className="text-slate-900">"{cleanQuery}"</strong> as your custom destination
                  </span>
                </div>
                <span className="text-xs text-teal-700 font-semibold flex items-center gap-1 shrink-0">
                  Select <ArrowRight className="w-3 h-3" />
                </span>
              </button>
            )}
          </div>

          {/* Popover Footer Info */}
          <div className="px-4 py-2 bg-stone-50/90 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500">
            <span>
              💡 Type any custom destination or select from suggestions
            </span>
            <span className="hidden sm:inline text-stone-400 font-mono">
              ↑↓ to navigate • ↵ to select • Esc to close
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
