import type { NavSection } from '../types';

/**
 * Normalizes the base pathname for GitHub Pages repository deployments,
 * Vercel, or local development.
 */
export function getBasePath(): string {
  if (typeof window === 'undefined') return '';
  const pathname = window.location.pathname;
  if (pathname.startsWith('/Trip-together/docs')) {
    return '/Trip-together/docs';
  }
  if (pathname.startsWith('/Trip-together')) {
    return '/Trip-together';
  }
  return '';
}

const VALID_SECTIONS: Record<string, NavSection> = {
  '': 'dashboard',
  dashboard: 'dashboard',
  home: 'dashboard',
  destinations: 'destinations',
  packages: 'packages',
  guides: 'guides',
  builder: 'builder',
  plan: 'builder',
  planner: 'builder',
  transport: 'transport',
  hotels: 'hotels',
  tracking: 'tracking',
  chat: 'chat',
  checklist: 'checklist',
  budget: 'budget',
  'traveller-dashboard': 'traveller-dashboard',
  'guide-dashboard': 'guide-dashboard',
  admin: 'admin',
  contact: 'contact',
  'contact-us': 'contact',
  privacy: 'privacy',
  'privacy-policy': 'privacy',
  terms: 'terms',
  'terms-and-conditions': 'terms',
  'how-it-works': 'how-it-works',
};

/**
 * Resolves current URL pathname into a valid NavSection or 'not-found'.
 */
export function getSectionFromCurrentUrl(): NavSection {
  if (typeof window === 'undefined') return 'dashboard';
  const base = getBasePath();
  let path = window.location.pathname;

  if (base && path.startsWith(base)) {
    path = path.slice(base.length);
  }

  // Strip leading and trailing slashes
  const clean = path.replace(/^\/+/, '').replace(/\/+$/, '');
  const segments = clean.split('/');
  const slug = (segments[0] || '').toLowerCase();

  if (slug === '' || slug === 'index.html') {
    return 'dashboard';
  }

  if (slug in VALID_SECTIONS) {
    return VALID_SECTIONS[slug];
  }

  return 'not-found';
}

/**
 * Builds the canonical URL path for a given NavSection.
 */
export function getUrlForSection(section: NavSection): string {
  const base = getBasePath();
  if (section === 'dashboard' || section === 'home') {
    return base ? `${base}/` : '/';
  }
  return base ? `${base}/${section}` : `/${section}`;
}

/**
 * Updates document.title appropriately for the active section.
 */
export function updatePageTitle(section: NavSection): void {
  const titles: Record<NavSection, string> = {
    home: 'Trip Together | Explore More, Travel Together',
    dashboard: 'Trip Together | Explore More, Travel Together',
    destinations: 'Explore Popular Destinations | Trip Together',
    packages: 'Featured Tour Packages | Trip Together',
    guides: 'Verified Local Guides | Trip Together',
    planner: 'AI Trip Planner & Itinerary Builder | Trip Together',
    builder: 'AI Trip Planner & Itinerary Builder | Trip Together',
    transport: 'Compare Trains, Buses & Flights | Trip Together',
    hotels: 'Verified Stays & Hotels | Trip Together',
    tracking: 'Family Live Route GPS Tracking | Trip Together',
    chat: 'Private Family Trip Chat | Trip Together',
    checklist: 'Packing Checklist | Trip Together',
    budget: 'Trip Bookings & Expense Ledger | Trip Together',
    'traveller-dashboard': 'Traveller Dashboard | Trip Together',
    'guide-dashboard': 'Local Guide Dashboard | Trip Together',
    admin: 'Admin Console | Trip Together',
    contact: 'Contact Us | Trip Together',
    privacy: 'Privacy Policy | Trip Together',
    terms: 'Terms & Conditions | Trip Together',
    'how-it-works': 'How It Works | Trip Together',
    'not-found': '404 - Page Not Found | Trip Together',
  };

  if (typeof document !== 'undefined') {
    document.title = titles[section] || 'Trip Together | Explore More, Travel Together';
  }
}
