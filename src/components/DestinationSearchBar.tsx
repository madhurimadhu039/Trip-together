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
  placeholder = 'Where do you want to go?',
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

  // Handle debounced search when user types
  useEffect(() => {
    if (!cleanQuery) {
      setRecommendations([]);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    // Immediately compute synchronous results from verified catalog
    const immediateMatches = getRecommendedDestinations(cleanQuery, 8);
    setRecommendations(immediateMatches);

    // Asynchronously verify against API with debouncing to avoid excessive calls
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
        // Fallback gracefully to local matches if server or network error occurs
        if (!isCancelled) {
          setRecommendations(immediateMatches);
        }
      } finally {
        if (!isCancelled) {
          setIsLoading(false);
        }
      }
    }, 150);

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

    // If user modifies text, clear any previously selected destination
    if (currentSelected && newVal.trim().toLowerCase() !== currentSelected.name.toLowerCase()) {
      setCurrentSelected(null);
      onClearDestination?.();
    }

    // Suggestions should only open when user starts typing a non-empty query
    if (newVal.trim().length > 0) {
      setIsOpen(true);
    } else {
      setIsOpen(false);
      setRecommendations([]);
      setCurrentSelected(null);
      onClearDestination?.();
    }
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

  const handleClear = () => {
    onChange('');
    setCurrentSelected(null);
    onClearDestination?.();
    setRecommendations([]);
    setIsOpen(false);
    setActiveIndex(-1);
    inputRef.current?.focus();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    // Arrow down
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (!isOpen) {
        if (cleanQuery.length > 0) setIsOpen(true);
        return;
      }
      if (recommendations.length > 0) {
        setActiveIndex((prev) => (prev < recommendations.length - 1 ? prev + 1 : 0));
      }
      return;
    }

    // Arrow up
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (!isOpen) {
        if (cleanQuery.length > 0) setIsOpen(true);
        return;
      }
      if (recommendations.length > 0) {
        setActiveIndex((prev) => (prev > 0 ? prev - 1 : recommendations.length - 1));
      }
      return;
    }

    // Enter key
    if (e.key === 'Enter') {
      if (isOpen && activeIndex >= 0 && recommendations[activeIndex]) {
        e.preventDefault();
        handleSelect(recommendations[activeIndex]);
      } else {
        setIsOpen(false);
        const trimmed = value.trim();
        const effectiveDest =
          currentSelected && currentSelected.name.toLowerCase() === trimmed.toLowerCase()
            ? currentSelected
            : null;
        onSubmit(trimmed, effectiveDest);
      }
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
    if (isOpen && activeIndex >= 0 && recommendations[activeIndex]) {
      handleSelect(recommendations[activeIndex]);
    } else {
      setIsOpen(false);
      const trimmed = value.trim();
      const effectiveDest =
        currentSelected && currentSelected.name.toLowerCase() === trimmed.toLowerCase()
          ? currentSelected
          : null;
      onSubmit(trimmed, effectiveDest);
    }
  };

  // Helper to highlight matching text in suggestion name
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
          onChange={handleInputChange}
          onFocus={() => {
            // Only show suggestions dropdown on focus if the user has already entered a query
            if (value.trim().length > 0) {
              setIsOpen(true);
            }
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen && cleanQuery.length > 0}
          aria-autocomplete="list"
          aria-controls={listboxId}
          aria-activedescendant={
            activeIndex >= 0 && recommendations[activeIndex]
              ? `dest-option-${recommendations[activeIndex].id}`
              : undefined
          }
          className="flex-1 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-stone-400 bg-transparent focus:outline-none min-w-0"
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
          className={`font-bold tracking-wider text-white bg-[#1E332A] hover:bg-[#14241D] rounded-full transition-all whitespace-nowrap shrink-0 cursor-pointer shadow-sm active:scale-95 ${
            variant === 'hero'
              ? 'px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-xs'
              : 'px-5 py-2 text-xs'
          }`}
        >
          SEARCH
        </button>
      </form>

      {/* Autocomplete & Suggestions Popover Dropdown - ONLY appears when user has entered a valid search query */}
      {isOpen && cleanQuery.length > 0 && (
        <div
          id={listboxId}
          role="listbox"
          className="absolute left-0 right-0 top-full mt-2.5 z-50 bg-white/98 backdrop-blur-xl rounded-2xl shadow-2xl border border-stone-200/90 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200 text-left"
          style={{ maxHeight: 'min(520px, 80vh)' }}
        >
          {/* Popover Header */}
          <div className="bg-gradient-to-r from-stone-50 via-amber-50/40 to-stone-50 px-4 py-2.5 border-b border-stone-200/80 flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-stone-800">
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>
                Matching Destinations for{' '}
                <span className="text-[#1E332A] font-bold">"{cleanQuery}"</span>
              </span>
            </div>

            <div className="flex items-center gap-2">
              {isLoading && (
                <div className="flex items-center gap-1 text-[11px] text-amber-800 font-medium">
                  <Loader2 className="w-3 h-3 animate-spin" />
                  <span>Searching...</span>
                </div>
              )}
              <span className="text-[11px] text-stone-500 font-medium">
                {recommendations.length} {recommendations.length === 1 ? 'destination' : 'destinations'} found
              </span>
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
                      // Prevent input blur before selection completes
                      e.preventDefault();
                      handleSelect(dest);
                    }}
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
                          • {dest.state}, {dest.country || 'India'}
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
            ) : !isLoading ? (
              <div className="px-6 py-8 text-center space-y-2">
                <Compass className="w-8 h-8 mx-auto text-stone-300" />
                <p className="text-sm font-semibold text-slate-800">
                  No destinations found matching "{cleanQuery}"
                </p>
                <p className="text-xs text-stone-500 max-w-sm mx-auto">
                  We couldn't find any destination matching your search. You can still press <kbd className="px-1.5 py-0.5 bg-stone-100 rounded text-stone-700 font-mono text-[11px]">Enter</kbd> to search trains, buses, and hotels for "{cleanQuery}".
                </p>
              </div>
            ) : null}
          </div>

          {/* Popover Footer Info */}
          <div className="px-4 py-2 bg-stone-50/90 border-t border-stone-200/80 flex items-center justify-between text-[11px] text-stone-500">
            <span>
              💡 Select any destination to auto-plan trains, buses & budget stays
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
