import React from 'react';

export interface TripTogetherLogoProps {
  /**
   * Layout variant:
   * - 'horizontal': Desktop full logo (emblem + TripTogether typography + subtitle)
   * - 'compact': Mobile compact logo (optimized proportions for narrow screens)
   * - 'symbol-only': Scalable standalone emblem icon
   */
  variant?: 'horizontal' | 'compact' | 'symbol-only';
  /**
   * Color theme:
   * - 'light': Dark text on light backgrounds (navbar, modals, pages)
   * - 'dark': White/teal text on dark backgrounds (footer, hero overlays)
   */
  theme?: 'light' | 'dark';
  /**
   * Optional custom size for symbol
   */
  size?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Optional click handler (usually navigates to homepage)
   */
  onClick?: (e?: React.MouseEvent) => void;
  /**
   * Additional custom CSS classes
   */
  className?: string;
  /**
   * Accessible label
   */
  ariaLabel?: string;
}

/**
 * Modern, distinctive Trip Together travel emblem:
 * Location Pin + Dynamic Journey Path Loop + Globe Longitude Arc + Waypoint Compass Star.
 */
export const TripTogetherSymbol: React.FC<{
  sizeClass?: string;
  className?: string;
}> = ({ sizeClass = 'w-10 h-10', className = '' }) => {
  return (
    <svg
      viewBox="0 0 48 48"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={`${sizeClass} ${className} shrink-0 drop-shadow-sm select-none`}
      aria-hidden="true"
    >
      <defs>
        {/* Main Brand Gradient: Deep Oceanic to Vibrant Emerald */}
        <linearGradient id="ttPinGrad" x1="4" y1="4" x2="44" y2="44" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#0F2F44" />
          <stop offset="50%" stopColor="#0D9488" />
          <stop offset="100%" stopColor="#10B981" />
        </linearGradient>

        {/* Dynamic Journey Loop Gradient: Amber Warmth to Luminous Teal */}
        <linearGradient id="ttPathGrad" x1="8" y1="36" x2="40" y2="12" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#F59E0B" />
          <stop offset="55%" stopColor="#14B8A6" />
          <stop offset="100%" stopColor="#38BDF8" />
        </linearGradient>

        {/* Subtle Glow Filter */}
        <filter id="ttGlow" x="-20%" y="-20%" width="140%" height="140%">
          <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#0D9488" floodOpacity="0.25" />
        </filter>
      </defs>

      {/* Rounded squircle emblem container */}
      <rect
        x="2"
        y="2"
        width="44"
        height="44"
        rx="12"
        fill="url(#ttPinGrad)"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="1.2"
      />

      {/* Globe Coordinate Arcs (Subtle Latitude / Longitude lines) */}
      <circle
        cx="24"
        cy="22"
        r="13"
        stroke="rgba(255, 255, 255, 0.18)"
        strokeWidth="1"
        strokeDasharray="2 2"
      />
      <ellipse
        cx="24"
        cy="22"
        rx="6"
        ry="13"
        stroke="rgba(255, 255, 255, 0.2)"
        strokeWidth="1"
      />

      {/* Outer Stylized Travel Pin Contour */}
      <path
        d="M24 8C16.8 8 11 13.8 11 21C11 29.5 22.5 38.8 23.3 39.4C23.7 39.8 24.3 39.8 24.7 39.4C25.5 38.8 37 29.5 37 21C37 13.8 31.2 8 24 8Z"
        fill="none"
        stroke="rgba(255, 255, 255, 0.95)"
        strokeWidth="2.4"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Intertwined Infinity / Journey Path Ribbon (Representing Traveling Together) */}
      <path
        d="M17 26C17 22.5 21 21 24 21C27 21 31 19.5 31 16C31 13.5 29 12 26.5 12C23.5 12 21 14 21 16C21 19.5 27 22.5 27 26C27 28.5 25 30 22.5 30C19.5 30 17 28 17 26Z"
        stroke="url(#ttPathGrad)"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* Golden Waypoint Compass Star at the Pin's Center */}
      <circle cx="24" cy="21" r="3.2" fill="#FBBF24" />
      <circle cx="24" cy="21" r="1.4" fill="#FFFFFF" />

      {/* Modern Star Accent */}
      <path
        d="M34 11L34.8 12.8L36.6 13.6L34.8 14.4L34 16.2L33.2 14.4L31.4 13.6L33.2 12.8L34 11Z"
        fill="#FDE047"
        opacity="0.9"
      />
    </svg>
  );
};

export const TripTogetherLogo: React.FC<TripTogetherLogoProps> = ({
  variant = 'horizontal',
  theme = 'light',
  size = 'md',
  onClick,
  className = '',
  ariaLabel = 'Trip Together — Travel Platform Home',
}) => {
  // Determine sizing
  const symbolSize =
    size === 'sm'
      ? 'w-8 h-8'
      : size === 'lg'
      ? 'w-12 h-12'
      : size === 'xl'
      ? 'w-16 h-16'
      : 'w-10 h-10';

  const isDark = theme === 'dark';

  const content = (
    <div
      className={`inline-flex items-center gap-2.5 sm:gap-3 group select-none transition-transform duration-150 ${className}`}
      aria-label={ariaLabel}
    >
      {/* Symbol Emblem */}
      <div className="group-hover:scale-105 transition-transform shrink-0">
        <TripTogetherSymbol sizeClass={symbolSize} />
      </div>

      {/* Typography: Wordmark & Subtitle */}
      {variant !== 'symbol-only' && (
        <div className="flex flex-col text-left justify-center">
          <div className="flex items-baseline tracking-tight font-serif-display leading-none">
            <span
              className={`text-lg sm:text-xl font-extrabold ${
                isDark ? 'text-white' : 'text-[#0F1E36]'
              }`}
            >
              Trip
            </span>
            <span className="text-lg sm:text-xl font-extrabold text-[#0D9488] ml-0.5">
              Together
            </span>
          </div>
          {variant === 'horizontal' && (
            <span
              className={`text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.18em] mt-1 ${
                isDark ? 'text-teal-400' : 'text-[#0D9488]'
              }`}
            >
              Travel Platform
            </span>
          )}
        </div>
      )}
    </div>
  );

  if (onClick) {
    return (
      <button
        type="button"
        onClick={onClick}
        className="focus:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-500 rounded-xl cursor-pointer text-left shrink-0"
        aria-label={ariaLabel}
      >
        {content}
      </button>
    );
  }

  return (
    <a
      href="#top"
      className="focus:outline-hidden focus-visible:ring-2 focus-visible:ring-teal-500 rounded-xl cursor-pointer shrink-0"
      aria-label={ariaLabel}
    >
      {content}
    </a>
  );
};

export default TripTogetherLogo;
