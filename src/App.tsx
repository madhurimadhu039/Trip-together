import React, { useState, useEffect } from 'react';
import {
  Compass,
  Train,
  Building2,
  Package,
  Calendar,
  MapPin,
  MessageSquare,
  CheckSquare,
  Wallet,
  ArrowRight,
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Clock,
  Award,
  CheckCircle2,
  Search,
  Users,
  ChevronRight,
  ChevronDown,
  UserCircle,
  Lock,
  Mail,
  LogOut,
  X,
  Menu,
  Heart,
  Star,
  Eye,
  EyeOff,
  Filter,
  ShieldAlert,
  HelpCircle,
  Phone,
  Share2,
  Printer,
  Bookmark,
  AlertCircle,
} from 'lucide-react';
import type {
  NavSection,
  TripParams,
  ItineraryDay,
  FamilyMember,
  ChatMessage,
  ChecklistItem,
  SavedBookingItem,
  ProviderAdapterStatus,
  DestinationItem,
  PackageItem,
  LocalGuideItem,
  PlatformReviewItem,
  SavedTripRecord,
} from './types';
import {
  KAKINADA_TO_TIRUPATI_TRAINS,
  KAKINADA_TO_TIRUPATI_BUSES,
  KAKINADA_TO_TIRUPATI_FLIGHTS,
  TIRUPATI_HOTELS,
  TIRUPATI_PACKAGES,
  DEFAULT_ITINERARY_DAYS,
  INITIAL_FAMILY_MEMBERS,
  INITIAL_CHAT_MESSAGES,
  INITIAL_CHECKLIST_ITEMS,
  INITIAL_SAVED_BOOKINGS,
} from './data';
import {
  SEED_DESTINATIONS,
  SEED_PACKAGES,
  SEED_GUIDES,
  SEED_REVIEWS,
} from './data/platformSeed';
import { TransportSection } from './components/TransportSection';
import { HotelsSection } from './components/HotelsSection';
import { PackagesSection } from './components/PackagesSection';
import { TripBuilderSection } from './components/TripBuilderSection';
import { FamilyTrackingSection } from './components/FamilyTrackingSection';
import { FamilyChatSection } from './components/FamilyChatSection';
import { PackingChecklistSection } from './components/PackingChecklistSection';
import { BudgetSection } from './components/BudgetSection';
import { DestinationSearchBar } from './components/DestinationSearchBar';
import { LocalGuidesSection } from './components/LocalGuidesSection';
import { DestinationDetailModal } from './components/DestinationDetailModal';
import { PackageDetailModal } from './components/PackageDetailModal';
import { BookingEnquiryModal } from './components/BookingEnquiryModal';
import { ContactGuideModal } from './components/ContactGuideModal';
import { GuideProfileModal } from './components/GuideProfileModal';
import { GuideDashboardModal } from './components/GuideDashboardModal';
import { GuideRegisterModal } from './components/GuideRegisterModal';
import { ContactSupportModal } from './components/ContactSupportModal';
import { AboutUsModal } from './components/AboutUsModal';
import { WriteReviewModal } from './components/WriteReviewModal';
import { TravellerDashboardSection } from './components/TravellerDashboardSection';
import { AdminDashboardSection } from './components/AdminDashboardSection';
import { ContactPage } from './components/ContactPage';
import { PrivacyPolicyPage } from './components/PrivacyPolicyPage';
import { TermsPage } from './components/TermsPage';
import { HowItWorksPage } from './components/HowItWorksPage';
import { NotFoundPage } from './components/NotFoundPage';
import { TripTogetherLogo, TripTogetherSymbol } from './components/TripTogetherLogo';
import {
  getSectionFromCurrentUrl,
  getUrlForSection,
  updatePageTitle,
} from './utils/routing';
import type { PopularDestination } from './data/popularDestinations';

/**
 * Returns true when running on a static host (GitHub Pages, Vercel static export,
 * file://, etc.) where there is no Express /api server available.
 * On these hosts we rely entirely on seed/local data to avoid 404 console spam.
 */
const isStaticHost = (): boolean => {
  if (typeof window === 'undefined') return false;
  const { hostname, protocol } = window.location;
  // file:// protocol = opened directly as a file
  if (protocol === 'file:') return true;
  // GitHub Pages domains
  if (hostname.endsWith('.github.io')) return true;
  // Vercel preview/production domains (non-custom)
  if (hostname.endsWith('.vercel.app')) return true;
  // Netlify
  if (hostname.endsWith('.netlify.app')) return true;
  return false;
};

// High-fidelity assets
import heroTirupatiImg from './assets/images/tirupati_hills_hero_1791742985128.jpg';
import kakinadaGatewayImg from './assets/images/kakinada_coastal_gateway_1791742998081.jpg';
import tirupatiHotelImg from './assets/images/tirupati_family_hotel_1791743009478.jpg';
import chandragiriTourImg from './assets/images/chandragiri_fort_tour_1791743020138.jpg';

interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: 'traveler' | 'guide' | 'admin';
}

const FAMILY_DROPDOWN_ITEMS: {
  id: NavSection;
  label: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
}[] = [
  {
    id: 'tracking',
    label: 'Live Tracking',
    desc: 'Consent-based family GPS & route map',
    icon: MapPin,
  },
  {
    id: 'chat',
    label: 'Family Chat',
    desc: 'Private group messages & shared links',
    icon: MessageSquare,
  },
  {
    id: 'checklist',
    label: 'Packing Checklist',
    desc: 'Shared family items & quantity tracker',
    icon: CheckSquare,
  },
  {
    id: 'budget',
    label: 'My Bookings & Budget',
    desc: 'Shortlisted bookings & expense alerts',
    icon: Wallet,
  },
];

const DEFAULT_PROVIDER_ADAPTERS: ProviderAdapterStatus[] = [
  {
    id: 'adapter-irctc',
    providerName: 'Indian Railways / IRCTC Rail Adapter',
    category: 'Rail',
    envSecretName: 'IRCTC_RAPIDAPI_KEY',
    configured: false,
    mode: 'REFERENCE_ADAPTER',
    officialPortalUrl: 'https://www.irctc.co.in/nget/train-search',
    complianceNote:
      'Respects CRIS/IRCTC terms; never scrapes CAPTCHA-protected PNR/availability endpoints. Links directly to official IRCTC portal.',
  },
  {
    id: 'adapter-apsrtc-redbus',
    providerName: 'APSRTC & Intercity Bus Adapter',
    category: 'Bus',
    envSecretName: 'REDBUS_PARTNER_API_KEY',
    configured: false,
    mode: 'REFERENCE_ADAPTER',
    officialPortalUrl: 'https://www.apsrtconline.in/',
    complianceNote:
      'Displays verified APSRTC tariff slabs and redirects to official APSRTC / redBus booking portals for real-time berth selection.',
  },
  {
    id: 'adapter-amadeus-flight',
    providerName: 'Amadeus Regional Flight & Multi-Modal Adapter',
    category: 'Flight',
    envSecretName: 'AMADEUS_CLIENT_ID',
    configured: false,
    mode: 'REFERENCE_ADAPTER',
    officialPortalUrl: 'https://www.goindigo.in/',
    complianceNote:
      'Accounts for realistic road transfers to regional airports (Rajahmundry/VTZ/Tirupati).',
  },
  {
    id: 'adapter-hotels-ttd-aptdc',
    providerName: 'TTD Devasthanams & APTDC Hospitality Adapter',
    category: 'Hotels',
    envSecretName: 'HOTELBEDS_API_KEY',
    configured: false,
    mode: 'REFERENCE_ADAPTER',
    officialPortalUrl: 'https://ttdevasthanams.ap.gov.in/',
    complianceNote:
      'Separates Official Portal Verified properties (TTD Srinivasam, Madhavam, APTDC Haritha) from Public Directory Verified hotels.',
  },
  {
    id: 'adapter-gemini-ai',
    providerName: 'Gemini Trip Recommendation Engine',
    category: 'AI Assistant',
    envSecretName: 'GEMINI_API_KEY',
    configured: true,
    mode: 'LIVE_API',
    officialPortalUrl: 'https://ai.google.dev/',
    complianceNote:
      'Grounded strictly on verified transport, hotel, and tour package records without inventing fake bookings.',
  },
];

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>(() => getSectionFromCurrentUrl());
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [familyDropdownOpen, setFamilyDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDestination, setSelectedDestination] = useState<PopularDestination | null>(null);
  const [destinationCategoryFilter, setDestinationCategoryFilter] = useState<string>('All');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);
  // See More / Show Less state
  const [showAllDestinations, setShowAllDestinations] = useState(false);
  const [showAllPackages, setShowAllPackages] = useState(false);
  const [showAllGuides, setShowAllGuides] = useState(false);
  const DESTINATIONS_INITIAL_COUNT = 8;
  const PACKAGES_INITIAL_COUNT = 3;
  const GUIDES_INITIAL_COUNT = 3;

  // Platform Data State
  const [destinations, setDestinations] = useState<DestinationItem[]>(SEED_DESTINATIONS);
  const [packages, setPackages] = useState<PackageItem[]>(SEED_PACKAGES);
  const [guides, setGuides] = useState<LocalGuideItem[]>(SEED_GUIDES);
  const [reviews, setReviews] = useState<PlatformReviewItem[]>(SEED_REVIEWS);

  // Wishlists
  const [wishlistDestinations, setWishlistDestinations] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('triptogether_wishlist_dest');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['Tirupati', 'Goa'];
  });

  const [wishlistPackages, setWishlistPackages] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('triptogether_wishlist_pkg');
      if (saved) return JSON.parse(saved);
    } catch {}
    return ['pkg-tirupati-darshan'];
  });

  // User Authentication State
  const [authUser, setAuthUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem('triptogether_auth_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: 'usr-1',
      name: 'Madhuri (Lead Organizer)',
      email: 'madhurimadhu039@gmail.com',
      role: 'traveler',
    };
  });
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authName, setAuthName] = useState<string>('');
  const [passwordVisible, setPasswordVisible] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState<boolean>(false);
  const [pendingSection, setPendingSection] = useState<NavSection | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);
  const [manageMembersModalOpen, setManageMembersModalOpen] = useState<boolean>(false);
  const [newMemberNameInput, setNewMemberNameInput] = useState<string>('');
  const [newMemberRoleInput, setNewMemberRoleInput] = useState<FamilyMember['role']>('Organizer');

  // Modals state
  const [activeDestinationModal, setActiveDestinationModal] = useState<DestinationItem | null>(null);
  const [activePackageModal, setActivePackageModal] = useState<PackageItem | null>(null);
  const [activeBookingModal, setActiveBookingModal] = useState<PackageItem | null>(null);
  const [activeGuideContactModal, setActiveGuideContactModal] = useState<LocalGuideItem | null>(null);
  const [activeGuideProfileModal, setActiveGuideProfileModal] = useState<LocalGuideItem | null>(null);
  const [guideDashboardModalOpen, setGuideDashboardModalOpen] = useState<boolean>(false);
  const [guideRegisterModalOpen, setGuideRegisterModalOpen] = useState<boolean>(false);
  const [contactModalOpen, setContactModalOpen] = useState<boolean>(false);
  const [aboutUsModalOpen, setAboutUsModalOpen] = useState<boolean>(false);
  const [writeReviewModalOpen, setWriteReviewModalOpen] = useState<boolean>(false);

  // Policy Modals state
  const [policyModal, setPolicyModal] = useState<'privacy' | 'terms' | 'cancellation' | null>(null);

  // Core editable Trip Parameters
  const [tripParams, setTripParams] = useState<TripParams>(() => {
    try {
      const saved = localStorage.getItem('triptogether_params_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      origin: 'Pickup Location',
      destination: 'Tirupati',
      travelDate: '2026-10-25',
      urgency: 'scheduled',
      travellers: 2,
      adults: 2,
      children: 0,
      seniors: 0,
      nights: 2,
      rooms: 1,
      totalBudget: 25000,
      hotelBudgetAmount: 2000,
      hotelBudgetMode: 'per_room_per_night',
      preferredTransport: 'all',
      packagePreference: 'compare_both',
    };
  });

  const [itineraryDays, setItineraryDays] = useState<ItineraryDay[]>(() => {
    try {
      const saved = localStorage.getItem('triptogether_itinerary_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return DEFAULT_ITINERARY_DAYS;
  });

  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>(() => {
    try {
      const saved = localStorage.getItem('triptogether_members_v2');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch {}
    return INITIAL_FAMILY_MEMBERS;
  });

  const [activeMemberId, setActiveMemberId] = useState<string>('mem-1');

  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(() => {
    try {
      const saved = localStorage.getItem('triptogether_chat_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CHAT_MESSAGES;
  });

  const [checklistItems, setChecklistItems] = useState<ChecklistItem[]>(() => {
    try {
      const saved = localStorage.getItem('triptogether_checklist_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_CHECKLIST_ITEMS;
  });

  const [savedBookings, setSavedBookings] = useState<SavedBookingItem[]>(() => {
    try {
      const saved = localStorage.getItem('triptogether_bookings_v1');
      if (saved) return JSON.parse(saved);
    } catch {}
    return INITIAL_SAVED_BOOKINGS;
  });

  const [providerAdapters, setProviderAdapters] = useState<ProviderAdapterStatus[]>(DEFAULT_PROVIDER_ADAPTERS);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Sync state to localStorage for persistence
  useEffect(() => {
    try {
      localStorage.setItem('triptogether_params_v2', JSON.stringify(tripParams));
    } catch {}
  }, [tripParams]);

  useEffect(() => {
    try {
      localStorage.setItem('triptogether_itinerary_v1', JSON.stringify(itineraryDays));
    } catch {}
  }, [itineraryDays]);

  useEffect(() => {
    try {
      localStorage.setItem('triptogether_members_v2', JSON.stringify(familyMembers));
    } catch {}
  }, [familyMembers]);

  useEffect(() => {
    try {
      localStorage.setItem('triptogether_chat_v1', JSON.stringify(chatMessages));
    } catch {}
  }, [chatMessages]);

  useEffect(() => {
    try {
      localStorage.setItem('triptogether_checklist_v1', JSON.stringify(checklistItems));
    } catch {}
  }, [checklistItems]);

  useEffect(() => {
    try {
      localStorage.setItem('triptogether_bookings_v1', JSON.stringify(savedBookings));
    } catch {}
  }, [savedBookings]);

  useEffect(() => {
    try {
      localStorage.setItem('triptogether_wishlist_dest', JSON.stringify(wishlistDestinations));
    } catch {}
  }, [wishlistDestinations]);

  useEffect(() => {
    try {
      localStorage.setItem('triptogether_wishlist_pkg', JSON.stringify(wishlistPackages));
    } catch {}
  }, [wishlistPackages]);

  useEffect(() => {
    try {
      if (authUser) {
        localStorage.setItem('triptogether_auth_v1', JSON.stringify(authUser));
      } else {
        localStorage.removeItem('triptogether_auth_v1');
      }
    } catch {}
  }, [authUser]);

  // Fetch dynamic database records on load.
  // On static hosts (GitHub Pages, Vercel static, Netlify) the Express /api
  // server is not available, so we skip all network calls and use seed data.
  const loadPlatformData = () => {
    if (isStaticHost()) {
      // Seed data is already the initial state — nothing to do.
      return;
    }

    // Destinations
    fetch('/api/destinations')
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((d) => {
        if (d?.destinations && Array.isArray(d.destinations) && d.destinations.length > 0) {
          setDestinations(d.destinations);
        }
      })
      .catch(() => {});

    // Packages
    fetch('/api/packages')
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((d) => {
        if (d?.packages && Array.isArray(d.packages) && d.packages.length > 0) {
          setPackages(d.packages);
        }
      })
      .catch(() => {});

    // Guides
    fetch('/api/guides')
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((d) => {
        if (d?.guides && Array.isArray(d.guides) && d.guides.length > 0) {
          setGuides(d.guides);
        }
      })
      .catch(() => {});

    // Reviews
    fetch('/api/reviews')
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((d) => {
        if (d?.reviews && Array.isArray(d.reviews) && d.reviews.length > 0) {
          setReviews(d.reviews);
        }
      })
      .catch(() => {});

    // Providers
    fetch('/api/providers/status')
      .then((r) => r.ok ? r.json() : Promise.reject(r.status))
      .then((data) => {
        if (data?.adapters && Array.isArray(data.adapters) && data.adapters.length > 0) {
          setProviderAdapters(data.adapters);
        }
      })
      .catch(() => {});
  };

  useEffect(() => {
    loadPlatformData();
  }, []);

  const handleToggleWishlistDest = (name: string) => {
    setWishlistDestinations((prev) => {
      const exists = prev.includes(name);
      const updated = exists ? prev.filter((d) => d !== name) : [...prev, name];
      setToastMessage(exists ? `Removed ${name} from Wishlist` : `✓ Added ${name} to Wishlist`);
      setTimeout(() => setToastMessage(null), 3000);
      return updated;
    });
  };

  const handleToggleWishlistPkg = (pkgId: string) => {
    setWishlistPackages((prev) => {
      const exists = prev.includes(pkgId);
      const updated = exists ? prev.filter((p) => p !== pkgId) : [...prev, pkgId];
      setToastMessage(exists ? 'Removed package from Wishlist' : '✓ Added package to Wishlist');
      setTimeout(() => setToastMessage(null), 3000);
      return updated;
    });
  };

  const handleShortlistBooking = (item: Omit<SavedBookingItem, 'id' | 'addedAt'>) => {
    const created: SavedBookingItem = {
      ...item,
      id: `bk-${Date.now()}`,
      addedAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setSavedBookings((prev) => [created, ...prev]);
    setToastMessage(
      `✓ Added "${item.title}" (₹${item.totalFamilyCost.toLocaleString('en-IN')}) to My Bookings & Trip Budget.`
    );
    setTimeout(() => setToastMessage(null), 4000);
  };

  useEffect(() => {
    const handlePopState = () => {
      const section = getSectionFromCurrentUrl();
      setActiveSection(section);
      updatePageTitle(section);
    };
    window.addEventListener('popstate', handlePopState);
    updatePageTitle(activeSection);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const openAuthPrompt = (mode: 'signin' | 'signup' = 'signin', targetSection?: NavSection) => {
    setAuthMode(mode);
    if (targetSection) {
      setPendingSection(targetSection);
    }
    setFamilyDropdownOpen(false);
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    setAuthError(null);
    setAuthModalOpen(true);
  };

  const navigateAndScroll = (section: NavSection) => {
    setActiveSection(section);
    setFamilyDropdownOpen(false);
    setMobileMenuOpen(false);
    setProfileMenuOpen(false);
    const targetUrl = getUrlForSection(section);
    if (typeof window !== 'undefined' && window.location.pathname !== targetUrl) {
      window.history.pushState({ section }, '', targetUrl);
    }
    updatePageTitle(section);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Helper to add, update or remove custom travel party members
  const handleUpdateMemberName = (id: string, newName: string) => {
    setFamilyMembers((prev) =>
      prev.map((m) => {
        if (m.id !== id) return m;
        const parts = newName.trim().split(' ');
        const initials =
          parts.length > 1
            ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
            : (newName.slice(0, 2) || 'TR').toUpperCase();
        return {
          ...m,
          name: newName,
          avatarInitials: initials,
        };
      })
    );
  };

  const handleUpdateMemberRole = (id: string, role: FamilyMember['role']) => {
    setFamilyMembers((prev) =>
      prev.map((m) => (m.id === id ? { ...m, role } : m))
    );
  };

  const handleAddCustomMember = (name: string, role: FamilyMember['role']) => {
    const cleanName = name.trim() || `Traveler ${familyMembers.length + 1}`;
    const parts = cleanName.split(' ');
    const initials =
      parts.length > 1
        ? `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
        : cleanName.slice(0, 2).toUpperCase();
    const newMem: FamilyMember = {
      id: `mem-${Date.now()}`,
      name: cleanName,
      role,
      email: `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '.')}@familytrip.in`,
      avatarInitials: initials,
      locationSharingConsent: true,
    };
    setFamilyMembers((prev) => {
      const updated = [...prev, newMem];
      setTripParams((p) => ({ ...p, travellers: updated.length }));
      return updated;
    });
    setToastMessage(`✓ Added traveler "${cleanName}" (${role})`);
    setTimeout(() => setToastMessage(null), 3000);
  };

  const handleRemoveCustomMember = (id: string) => {
    if (familyMembers.length <= 1) {
      setToastMessage('At least 1 traveler is required for the trip.');
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }
    setFamilyMembers((prev) => {
      const updated = prev.filter((m) => m.id !== id);
      setTripParams((p) => ({ ...p, travellers: updated.length }));
      return updated;
    });
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    const cleanEmail = authEmail.trim().toLowerCase();
    const cleanPassword = authPassword.trim();

    if (!cleanEmail || !cleanEmail.includes('@')) {
      setAuthError('Please enter a valid Email ID.');
      return;
    }
    if (!cleanPassword || cleanPassword.length < 4) {
      setAuthError('Please enter a password (at least 4 characters).');
      return;
    }

    setAuthSubmitting(true);
    try {
      // On static hosts the API server is unavailable; skip the network call
      // and fall straight through to the local fallback auth below.
      if (isStaticHost()) throw new Error('static-host');

      const response = await fetch('/api/auth/authenticate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          password: cleanPassword,
          name: authName.trim(),
          mode: authMode,
        }),
      });
      let data: any = null;
      try {
        data = await response.json();
      } catch {}

      if (!response.ok || !data?.user) {
        if ((response.status === 400 || response.status === 401) && data?.error) {
          setAuthError(data.error);
          setAuthSubmitting(false);
          return;
        }
        throw new Error(data?.error || `HTTP ${response.status}`);
      }

      const signedInUser: AuthUser = data.user;
      setAuthUser(signedInUser);
      setAuthModalOpen(false);
      setAuthPassword('');
      setToastMessage(`Welcome, ${signedInUser.name}! You are now signed in.`);
      setTimeout(() => setToastMessage(null), 4000);

      if (pendingSection) {
        setActiveSection(pendingSection);
        setPendingSection(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch {
      const fallbackName =
        authName.trim() ||
        cleanEmail
          .split('@')[0]
          .replace(/[._-]/g, ' ')
          .replace(/\b\w/g, (l) => l.toUpperCase());
      const signedInUser: AuthUser = {
        id: `usr-${Date.now()}`,
        email: cleanEmail,
        name: fallbackName,
        role: cleanEmail.includes('admin') ? 'admin' : 'traveler',
      };
      setAuthUser(signedInUser);
      setAuthModalOpen(false);
      setAuthPassword('');
      setToastMessage(`Welcome, ${signedInUser.name}! You are now signed in.`);
      setTimeout(() => setToastMessage(null), 4000);

      if (pendingSection) {
        setActiveSection(pendingSection);
        setPendingSection(null);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } finally {
      setAuthSubmitting(false);
    }
  };

  const handleSignOut = () => {
    setAuthUser(null);
    setProfileMenuOpen(false);
    setActiveSection('dashboard');
    setToastMessage('You have signed out of Trip Together.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Reopen a saved trip into active Trip Planner state
  const handleOpenSavedTrip = (trip: SavedTripRecord) => {
    setTripParams((prev) => ({
      ...prev,
      destination: trip.destination,
      travelDate: trip.travelDate || prev.travelDate,
      travellers: trip.travellers || prev.travellers,
      totalBudget: trip.budget || prev.totalBudget,
    }));
    if (trip.itinerary && Array.isArray(trip.itinerary) && trip.itinerary.length > 0) {
      setItineraryDays(trip.itinerary);
    }
    setToastMessage(`✓ Opened trip: ${trip.title}`);
    setTimeout(() => setToastMessage(null), 3500);
    navigateAndScroll('builder');
  };

  // Summary metrics
  const totalPlannedCost = savedBookings.reduce((s, b) => s + b.totalFamilyCost, 0);
  const totalRequiredUnits = checklistItems.reduce((s, i) => s + i.requiredQuantity, 0);
  const totalPackedUnits = checklistItems.reduce((s, i) => s + i.packedQuantity, 0);
  const packingProgressPct =
    totalRequiredUnits > 0 ? Math.round((totalPackedUnits / totalRequiredUnits) * 100) : 0;

  const isDropdownSectionActive =
    activeSection === 'tracking' ||
    activeSection === 'chat' ||
    activeSection === 'checklist' ||
    activeSection === 'budget';

  const handleSelectDestination = (dest: PopularDestination) => {
    setSelectedDestination(dest);
    setSearchQuery(dest.name);
    setTripParams((prev) => ({
      ...prev,
      destination: dest.fullName || dest.name,
      destinationId: dest.id,
      destinationDetails: dest,
    }));
    setToastMessage(`Exploring ${dest.name} (${dest.state}) — loading verified transport & hotels`);
    setTimeout(() => setToastMessage(null), 3500);
    navigateAndScroll('transport');
  };

  const handleClearDestination = () => {
    setSelectedDestination(null);
    setTripParams((prev) => ({
      ...prev,
      destinationId: undefined,
      destinationDetails: null,
    }));
  };

  const handleSearchQueryChange = (text: string) => {
    setSearchQuery(text);
    if (
      selectedDestination &&
      text.trim().toLowerCase() !== selectedDestination.name.toLowerCase()
    ) {
      setSelectedDestination(null);
      setTripParams((prev) => ({
        ...prev,
        destinationId: undefined,
        destinationDetails: null,
      }));
    }
  };

  const handleTopSearchSubmit = (
    selectedDestName?: string,
    explicitDest?: PopularDestination | null
  ) => {
    const raw = (selectedDestName !== undefined ? selectedDestName : searchQuery).trim();
    if (!raw) {
      navigateAndScroll('transport');
      return;
    }
    const q = raw.toLowerCase();

    // Preserve the exact query in the search bar
    setSearchQuery(raw);

    const activeDest =
      explicitDest ||
      (selectedDestination && selectedDestination.name.toLowerCase() === q
        ? selectedDestination
        : null);

    if (activeDest) {
      setTripParams((prev) => ({
        ...prev,
        destination: activeDest.fullName || activeDest.name,
        destinationId: activeDest.id,
        destinationDetails: activeDest,
      }));
    } else {
      setTripParams((prev) => ({
        ...prev,
        destination: raw,
        destinationId: undefined,
        destinationDetails: null,
      }));
    }

    if (
      q.includes('hotel') ||
      q.includes('room') ||
      q.includes('stay') ||
      q.includes('choultry')
    ) {
      setToastMessage(`Showing verified hotels & stays matching "${raw}"`);
      setTimeout(() => setToastMessage(null), 3500);
      navigateAndScroll('hotels');
    } else if (
      q.includes('package') ||
      q.includes('tour') ||
      q.includes('darshan')
    ) {
      setToastMessage(`Showing tour packages matching "${raw}"`);
      setTimeout(() => setToastMessage(null), 3500);
      navigateAndScroll('packages');
    } else if (
      q.includes('guide') ||
      q.includes('local')
    ) {
      setToastMessage(`Showing local guides matching "${raw}"`);
      setTimeout(() => setToastMessage(null), 3500);
      navigateAndScroll('guides');
    } else if (
      q.includes('itinerary') ||
      q.includes('plan') ||
      q.includes('day') ||
      q.includes('ai')
    ) {
      setToastMessage(`Opening Trip Planner for "${raw}"`);
      setTimeout(() => setToastMessage(null), 3500);
      navigateAndScroll('builder');
    } else {
      setToastMessage(`Searching transport options for "${raw}"`);
      setTimeout(() => setToastMessage(null), 3500);
      navigateAndScroll('transport');
    }
  };

  const filteredDestinations = destinations.filter((d) => {
    if (destinationCategoryFilter === 'All') return true;
    return d.category.toLowerCase() === destinationCategoryFilter.toLowerCase();
  });

  return (
    <div className="min-h-screen flex flex-col bg-[#F8FAFC] text-slate-900 selection:bg-[#0D9488] selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#0F1E36] text-white text-xs font-semibold rounded-2xl shadow-2xl border border-teal-500/30 flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <CheckCircle2 className="w-4 h-4 text-teal-400 shrink-0" />
          <span>{toastMessage}</span>
        </div>
      )}

      {/* TOP NAVIGATION BAR */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200/90 shadow-xs">
        <div className="max-w-[1440px] mx-auto px-4 sm:px-6 lg:px-10 py-3.5 flex items-center justify-between gap-4">
          {/* Brand Logo (Requirement 1 & 9) */}
          <div className="hidden sm:block">
            <TripTogetherLogo
              variant="horizontal"
              onClick={() => navigateAndScroll('dashboard')}
              ariaLabel="Trip Together Homepage"
            />
          </div>
          <div className="sm:hidden">
            <TripTogetherLogo
              variant="compact"
              onClick={() => navigateAndScroll('dashboard')}
              ariaLabel="Trip Together Homepage"
            />
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-6 text-xs sm:text-sm font-medium text-slate-600">
            <button
              type="button"
              onClick={() => navigateAndScroll('dashboard')}
              className={`hover:text-[#0D9488] transition-colors whitespace-nowrap cursor-pointer ${
                activeSection === 'dashboard'
                  ? 'text-[#0D9488] font-bold underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Home
            </button>

            <button
              type="button"
              onClick={() => navigateAndScroll('destinations')}
              className={`hover:text-[#0D9488] transition-colors whitespace-nowrap cursor-pointer ${
                activeSection === 'destinations'
                  ? 'text-[#0D9488] font-bold underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Explore Destinations
            </button>

            <button
              type="button"
              onClick={() => navigateAndScroll('packages')}
              className={`hover:text-[#0D9488] transition-colors whitespace-nowrap cursor-pointer ${
                activeSection === 'packages'
                  ? 'text-[#0D9488] font-bold underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Tour Packages
            </button>

            <button
              type="button"
              onClick={() => navigateAndScroll('guides')}
              className={`hover:text-[#0D9488] transition-colors whitespace-nowrap cursor-pointer ${
                activeSection === 'guides'
                  ? 'text-[#0D9488] font-bold underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Local Guides
            </button>

            <button
              type="button"
              onClick={() => navigateAndScroll('builder')}
              className={`hover:text-[#0D9488] transition-colors whitespace-nowrap cursor-pointer ${
                activeSection === 'builder'
                  ? 'text-[#0D9488] font-bold underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Trip Planner
            </button>

            <button
              type="button"
              onClick={() => navigateAndScroll('transport')}
              className={`hover:text-[#0D9488] transition-colors whitespace-nowrap cursor-pointer ${
                activeSection === 'transport'
                  ? 'text-[#0D9488] font-bold underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Transport
            </button>

            <button
              type="button"
              onClick={() => navigateAndScroll('hotels')}
              className={`hover:text-[#0D9488] transition-colors whitespace-nowrap cursor-pointer ${
                activeSection === 'hotels'
                  ? 'text-[#0D9488] font-bold underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Hotels
            </button>

            {/* Dropdown for Family Collaboration & Budget */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setFamilyDropdownOpen((prev) => !prev)}
                className={`inline-flex items-center gap-1.5 hover:text-[#0D9488] transition-colors whitespace-nowrap cursor-pointer ${
                  isDropdownSectionActive
                    ? 'text-[#0D9488] font-bold underline underline-offset-8 decoration-2'
                    : ''
                }`}
              >
                <span>Family & Budget</span>
                <ChevronDown
                  className={`w-3.5 h-3.5 transition-transform duration-150 ${
                    familyDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {familyDropdownOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setFamilyDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-stone-200/90 py-2 z-50 animate-in fade-in zoom-in-95 duration-150">
                    <div className="px-4 py-2 border-b border-stone-100 flex items-center justify-between text-[11px] text-stone-500 font-mono-num">
                      <span>Packing: {packingProgressPct}%</span>
                      <span>₹{totalPlannedCost.toLocaleString('en-IN')} Planned</span>
                    </div>
                    {FAMILY_DROPDOWN_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isActive = activeSection === item.id;
                      return (
                        <button
                          key={item.id}
                          type="button"
                          onClick={() => navigateAndScroll(item.id)}
                          className={`w-full px-4 py-2.5 text-left flex items-start gap-3 transition-colors cursor-pointer ${
                            isActive
                              ? 'bg-teal-50 text-[#0D9488] font-semibold'
                              : 'text-slate-700 hover:bg-stone-50'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-[#0D9488] mt-0.5 shrink-0" />
                          <div>
                            <div className="text-xs font-bold text-slate-900">{item.label}</div>
                            <div className="text-[11px] text-stone-500">{item.desc}</div>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            <button
              type="button"
              onClick={() => navigateAndScroll('how-it-works')}
              className={`hover:text-[#0D9488] transition-colors whitespace-nowrap cursor-pointer ${
                activeSection === 'how-it-works'
                  ? 'text-[#0D9488] font-bold underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              How It Works
            </button>

            <button
              type="button"
              onClick={() => navigateAndScroll('contact')}
              className={`hover:text-[#0D9488] transition-colors whitespace-nowrap cursor-pointer ${
                activeSection === 'contact'
                  ? 'text-[#0D9488] font-bold underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Contact
            </button>
          </nav>

          {/* Right Action Buttons */}
          <div className="flex items-center gap-3 shrink-0">
            {/* Plan a Trip CTA Button */}
            <button
              type="button"
              onClick={() => navigateAndScroll('builder')}
              className="hidden sm:inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-bold transition-all shadow-xs hover:shadow-md cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Plan a Trip</span>
            </button>

            {/* Unified Circular Profile Avatar Menu (Requirement 4) */}
            <div className="relative">
              <button
                type="button"
                onClick={() => setProfileMenuOpen((prev) => !prev)}
                aria-label={authUser ? `Account menu for ${authUser.name}` : 'Account menu - Sign in or register'}
                aria-expanded={profileMenuOpen}
                className={`relative w-10 h-10 rounded-full flex items-center justify-center transition-all cursor-pointer shadow-sm hover:shadow-md shrink-0 border ${
                  authUser
                    ? 'bg-gradient-to-br from-[#0D9488] to-[#0F1E36] text-white border-white/40 hover:ring-2 hover:ring-[#0D9488] hover:ring-offset-2'
                    : 'bg-stone-100 hover:bg-stone-200 border-stone-300 text-stone-700 hover:border-[#0D9488] hover:text-[#0D9488]'
                }`}
              >
                {authUser ? (
                  authUser.avatar ? (
                    <img
                      src={authUser.avatar}
                      alt={authUser.name}
                      className="w-full h-full rounded-full object-cover"
                    />
                  ) : (
                    <span className="font-bold text-xs">
                      {authUser.name.slice(0, 2).toUpperCase()}
                    </span>
                  )
                ) : (
                  <UserCircle className="w-6 h-6 text-stone-600 hover:text-[#0D9488]" />
                )}
                {authUser && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 bg-emerald-400 border-2 border-white rounded-full" />
                )}
              </button>

              {profileMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setProfileMenuOpen(false)}
                    aria-hidden="true"
                  />
                  <div className="absolute right-0 top-full mt-2 w-72 bg-white rounded-2xl shadow-xl border border-stone-200/90 py-3 px-4 z-50 space-y-3 animate-in fade-in zoom-in-95 duration-150">
                    {authUser ? (
                      <>
                        <div className="flex items-center gap-3 pb-3 border-b border-stone-100">
                          <div className="w-10 h-10 rounded-full bg-teal-100 text-[#0D9488] flex items-center justify-center font-bold text-sm shrink-0">
                            {authUser.avatar ? (
                              <img
                                src={authUser.avatar}
                                alt={authUser.name}
                                className="w-full h-full rounded-full object-cover"
                              />
                            ) : (
                              authUser.name.slice(0, 2).toUpperCase()
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="text-sm font-bold text-slate-900 truncate">
                              {authUser.name}
                            </div>
                            <div className="text-xs text-stone-500 truncate">{authUser.email}</div>
                            <span className="inline-block mt-0.5 text-[10px] font-bold uppercase tracking-wider text-teal-700 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
                              {authUser.role || 'Traveler'}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1">
                          <button
                            type="button"
                            onClick={() => {
                              setProfileMenuOpen(false);
                              navigateAndScroll('traveller-dashboard');
                            }}
                            className="w-full text-left text-xs font-semibold text-slate-700 hover:text-[#0D9488] hover:bg-stone-50 px-2 py-2 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <UserCircle className="w-4 h-4 text-[#0D9488]" />
                            <span>Traveller Dashboard</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setProfileMenuOpen(false);
                              navigateAndScroll('budget');
                            }}
                            className="w-full text-left text-xs font-semibold text-slate-700 hover:text-[#0D9488] hover:bg-stone-50 px-2 py-2 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <Wallet className="w-4 h-4 text-[#0D9488]" />
                            <span>My Bookings & Budget</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setProfileMenuOpen(false);
                              setGuideDashboardModalOpen(true);
                            }}
                            className="w-full text-left text-xs font-semibold text-slate-700 hover:text-[#0D9488] hover:bg-stone-50 px-2 py-2 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <Award className="w-4 h-4 text-amber-500" />
                            <span>Local Guide Portal</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setProfileMenuOpen(false);
                              navigateAndScroll('admin');
                            }}
                            className="w-full text-left text-xs font-semibold text-purple-700 hover:text-purple-900 hover:bg-purple-50 px-2 py-2 rounded-lg flex items-center gap-2.5 transition-colors cursor-pointer"
                          >
                            <ShieldAlert className="w-4 h-4 text-purple-600" />
                            <span>Admin Console</span>
                          </button>
                        </div>

                        <div className="pt-2 border-t border-stone-100">
                          <button
                            type="button"
                            onClick={handleSignOut}
                            className="w-full text-left text-xs font-bold text-rose-600 hover:text-rose-700 hover:bg-rose-50 px-2 py-2 rounded-lg flex items-center gap-2 transition-colors cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            <span>Sign Out</span>
                          </button>
                        </div>
                      </>
                    ) : (
                      <>
                        <div className="pb-3 border-b border-stone-100">
                          <div className="flex items-center gap-2.5 mb-1.5">
                            <div className="w-9 h-9 rounded-full bg-stone-100 text-stone-600 flex items-center justify-center">
                              <UserCircle className="w-6 h-6 text-stone-500" />
                            </div>
                            <div>
                              <div className="text-xs font-bold text-slate-900">Guest Traveler</div>
                              <div className="text-[11px] text-stone-500">Sign in to save trips & view bookings</div>
                            </div>
                          </div>
                        </div>

                        <div className="space-y-2 pt-1">
                          <button
                            type="button"
                            onClick={() => {
                              setProfileMenuOpen(false);
                              openAuthPrompt('signin');
                            }}
                            className="w-full py-2.5 px-4 text-xs font-bold text-white bg-[#0F1E36] hover:bg-[#1E3A8A] rounded-xl transition-all shadow-xs flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <UserCircle className="w-4 h-4 text-teal-300" />
                            <span>Sign In to Account</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setProfileMenuOpen(false);
                              openAuthPrompt('signup');
                            }}
                            className="w-full py-2.5 px-4 text-xs font-bold text-[#0D9488] bg-teal-50 hover:bg-teal-100 border border-teal-200 rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                          >
                            <Sparkles className="w-4 h-4 text-[#0D9488]" />
                            <span>Create New Account</span>
                          </button>
                        </div>

                        <div className="pt-2 border-t border-stone-100 text-[11px] text-stone-500 flex justify-between items-center">
                          <span>Local Guide?</span>
                          <button
                            type="button"
                            onClick={() => {
                              setProfileMenuOpen(false);
                              setGuideRegisterModalOpen(true);
                            }}
                            className="text-[#0D9488] font-bold hover:underline cursor-pointer"
                          >
                            Join as Guide →
                          </button>
                        </div>
                      </>
                    )}
                  </div>
                </>
              )}
            </div>

            {/* Mobile Hamburger Toggle (Requirement 7) — clearly visible with comfortable touch target */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              aria-expanded={mobileMenuOpen}
              className="lg:hidden w-11 h-11 rounded-xl bg-[#0F1E36] text-white hover:bg-[#1E3A8A] flex items-center justify-center transition-colors cursor-pointer shadow-sm shrink-0 border border-white/10 active:scale-95"
            >
              {mobileMenuOpen ? (
                <X className="w-5 h-5 text-teal-300" />
              ) : (
                <Menu className="w-5 h-5 text-teal-300" />
              )}
            </button>
          </div>
        </div>

        {/* Functional Mobile Navigation Drawer (Requirement 7) */}
        {mobileMenuOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            {/* Backdrop overlay — clicking closes the drawer */}
            <div
              className="fixed inset-0 bg-slate-900/50 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
              onClick={() => setMobileMenuOpen(false)}
              aria-hidden="true"
            />

            {/* Sliding Drawer Panel */}
            <div className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-white shadow-2xl flex flex-col z-50 animate-in slide-in-from-right duration-200 overflow-y-auto">
              {/* Drawer Top Header */}
              <div className="p-4 border-b border-stone-200 flex items-center justify-between bg-stone-50">
                <TripTogetherLogo
                  variant="compact"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    navigateAndScroll('dashboard');
                  }}
                  ariaLabel="Trip Together Homepage"
                />
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  aria-label="Close navigation menu"
                  className="p-2 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-stone-200 transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Account Section in Mobile Drawer */}
              <div className="p-4 border-b border-stone-100 bg-[#FAF9F6]">
                {authUser ? (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-10 h-10 rounded-full bg-teal-100 text-[#0D9488] flex items-center justify-center font-bold text-sm shrink-0">
                        {authUser.avatar ? (
                          <img
                            src={authUser.avatar}
                            alt={authUser.name}
                            className="w-full h-full rounded-full object-cover"
                          />
                        ) : (
                          authUser.name.slice(0, 2).toUpperCase()
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {authUser.name}
                        </div>
                        <div className="text-[11px] text-stone-500 truncate">{authUser.email}</div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        handleSignOut();
                        setMobileMenuOpen(false);
                      }}
                      className="text-xs font-bold text-rose-600 hover:underline cursor-pointer shrink-0 ml-2"
                    >
                      Sign Out
                    </button>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="text-[11px] text-stone-500 font-medium">
                      Sign in to manage bookings and family trips
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          openAuthPrompt('signin');
                        }}
                        className="flex-1 py-2 px-3 text-xs font-bold text-white bg-[#0F1E36] rounded-xl text-center cursor-pointer shadow-xs hover:bg-[#1E3A8A]"
                      >
                        Sign In
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMobileMenuOpen(false);
                          openAuthPrompt('signup');
                        }}
                        className="flex-1 py-2 px-3 text-xs font-bold text-[#0D9488] bg-teal-50 border border-teal-200 rounded-xl text-center cursor-pointer hover:bg-teal-100"
                      >
                        Sign Up
                      </button>
                    </div>
                  </div>
                )}
              </div>

              {/* Navigation links in Mobile Drawer */}
              <nav className="p-4 space-y-1 flex-1">
                {[
                  { id: 'dashboard', label: 'Home' },
                  { id: 'destinations', label: 'Explore Destinations' },
                  { id: 'packages', label: 'Tour Packages' },
                  { id: 'guides', label: 'Local Guides' },
                  { id: 'builder', label: 'Trip Planner' },
                  { id: 'transport', label: 'Find Transport' },
                  { id: 'hotels', label: 'Hotels & Rooms' },
                  { id: 'how-it-works', label: 'How It Works' },
                  { id: 'contact', label: 'Contact Us' },
                  { id: 'budget', label: 'My Bookings & Budget' },
                  { id: 'privacy', label: 'Privacy Policy' },
                  { id: 'terms', label: 'Terms & Conditions' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => navigateAndScroll(item.id as NavSection)}
                    className={`w-full text-left px-3.5 py-2.5 text-xs font-semibold rounded-xl flex items-center justify-between transition-colors cursor-pointer ${
                      activeSection === item.id
                        ? 'bg-teal-50 text-[#0D9488] font-bold'
                        : 'text-slate-700 hover:bg-stone-50'
                    }`}
                  >
                    <span>{item.label}</span>
                    <ChevronRight className="w-4 h-4 text-stone-400" />
                  </button>
                ))}
              </nav>

              {/* Mobile Drawer Footer CTA */}
              <div className="p-4 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => navigateAndScroll('builder')}
                  className="w-full py-3 px-4 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-bold transition-all shadow-md flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Sparkles className="w-4 h-4 text-teal-200" />
                  <span>Plan a Custom Trip</span>
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* MAIN VIEW SWITCHER */}
      <main className="flex-1">
        {/* HOMEPAGE VIEW */}
        {activeSection === 'dashboard' && (
          <div>
            {/* 1. HERO SECTION */}
            <section className="relative w-full min-h-[580px] lg:min-h-[640px] flex flex-col items-center justify-between text-center px-4 sm:px-6 pt-10 pb-16 overflow-visible">
              <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <img
                  src={heroTirupatiImg}
                  alt="Scenic Travel Hero"
                  referrerPolicy="no-referrer"
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-b from-[#0F1E36]/80 via-[#0F1E36]/60 to-[#0F1E36]/90" />
              </div>

              {/* Real-Time Destination Search Bar */}
              <div className="relative z-30 w-full max-w-2xl mx-auto">
                <DestinationSearchBar
                  value={searchQuery}
                  onChange={handleSearchQueryChange}
                  onSubmit={handleTopSearchSubmit}
                  onSelectDestination={handleSelectDestination}
                  onClearDestination={handleClearDestination}
                  selectedDestination={selectedDestination}
                  placeholder="Where do you want to go? Search cities, states, temples..."
                  variant="hero"
                />
              </div>

              {/* Hero Headline & Subtitle */}
              <div className="relative z-10 max-w-3xl mx-auto text-white space-y-5 my-auto pt-6">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.12] font-serif-display text-white">
                  Your Next Adventure Starts Here.
                </h1>

                <p className="text-sm sm:text-base text-stone-200 max-w-xl mx-auto leading-relaxed">
                  Discover incredible destinations, plan unforgettable journeys, and connect with trusted local guides.
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => navigateAndScroll('destinations')}
                    className="px-8 py-3.5 text-xs sm:text-sm font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-xl shadow-lg transition-all hover:scale-102 cursor-pointer"
                  >
                    Explore Destinations
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (searchQuery.trim()) {
                        handleTopSearchSubmit(searchQuery, selectedDestination);
                        navigateAndScroll('builder');
                      } else {
                        navigateAndScroll('builder');
                      }
                    }}
                    className="px-8 py-3.5 text-xs sm:text-sm font-bold text-slate-900 bg-white hover:bg-stone-100 rounded-xl shadow-lg transition-all hover:scale-102 cursor-pointer"
                  >
                    Plan My Trip
                  </button>
                </div>
              </div>
            </section>

            {/* Container Body */}
            <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-16 space-y-20">
              {/* POPULAR DESTINATIONS SECTION */}
              <section id="destinations-section" className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-teal-50 border border-teal-200 text-[#0D9488] text-xs font-semibold mb-2">
                      <Compass className="w-3.5 h-3.5" />
                      <span>Curated India &amp; Beyond</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif-display">
                      Popular Destinations
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600 max-w-xl mt-1">
                      Explore handpicked destinations with genuine travel insights, best visiting seasons, and certified local guides.
                    </p>
                  </div>

                  {/* Category Filter Pills */}
                  <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
                    {['All', 'Pilgrimage', 'Hill Station', 'Coastal & Beach', 'Heritage & Culture', 'Adventure'].map((cat) => (
                      <button
                        key={cat}
                        type="button"
                        onClick={() => { setDestinationCategoryFilter(cat); setShowAllDestinations(false); }}
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-colors whitespace-nowrap cursor-pointer ${
                          destinationCategoryFilter === cat
                            ? 'bg-[#0F1E36] text-white shadow-xs'
                            : 'bg-white border border-stone-200 text-slate-600 hover:bg-stone-50'
                        }`}
                      >
                        {cat}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Destinations Grid */}
                {(() => {
                  const visibleDests = showAllDestinations
                    ? filteredDestinations
                    : filteredDestinations.slice(0, DESTINATIONS_INITIAL_COUNT);
                  return (
                    <>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {visibleDests.map((dest) => (
                          <div
                            key={dest.id}
                            className="group bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                          >
                            <div className="relative h-52 sm:h-56 overflow-hidden bg-stone-100">
                              <img
                                src={dest.image}
                                alt={dest.name}
                                loading="lazy"
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                              />
                              <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                              <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-xs text-white text-[11px] font-semibold tracking-wide shadow-xs">
                                {dest.category}
                              </span>
                            </div>

                            <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                              <div>
                                <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#0D9488] font-serif-display transition-colors">
                                  {dest.name}
                                </h3>
                                <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-1.5">
                                  <MapPin className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                                  <span className="truncate">{dest.state}, {dest.country}</span>
                                </p>
                              </div>

                              <div className="space-y-3 pt-3 border-t border-stone-100">
                                <div className="flex items-center justify-between text-xs text-stone-500">
                                  <span>Best Season</span>
                                  <span className="font-semibold text-slate-800 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200/60 font-medium">
                                    {dest.bestSeason}
                                  </span>
                                </div>

                                <button
                                  type="button"
                                  onClick={() => setActiveDestinationModal(dest)}
                                  className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-100 group-hover:bg-[#0F1E36] text-slate-800 group-hover:text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs"
                                >
                                  <span>Explore Destination</span>
                                  <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* See More / Show Less / View All */}
                      <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                        {filteredDestinations.length > DESTINATIONS_INITIAL_COUNT && !showAllDestinations && (
                          <button
                            type="button"
                            onClick={() => setShowAllDestinations(true)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                          >
                            <ChevronDown className="w-4 h-4" />
                            See More ({filteredDestinations.length - DESTINATIONS_INITIAL_COUNT} more)
                          </button>
                        )}
                        {showAllDestinations && filteredDestinations.length > DESTINATIONS_INITIAL_COUNT && (
                          <button
                            type="button"
                            onClick={() => setShowAllDestinations(false)}
                            className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                          >
                            <ChevronDown className="w-4 h-4 rotate-180" />
                            Show Less
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => navigateAndScroll('destinations')}
                          className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0D9488] hover:underline cursor-pointer"
                        >
                          View All Destinations <ArrowRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </>
                  );
                })()}
              </section>

              {/* FEATURED TOUR PACKAGES SECTION */}
              <section id="packages-section" className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-semibold mb-2">
                      <Package className="w-3.5 h-3.5" />
                      <span>Verified Itineraries</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif-display">
                      Featured Tour Packages
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-600 max-w-xl mt-1">
                      All-inclusive family journeys with transparent day-by-day itineraries, verified accommodations, and guaranteed zero hidden tariffs.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => navigateAndScroll('packages')}
                    className="text-xs font-bold text-[#0D9488] hover:underline flex items-center gap-1 cursor-pointer shrink-0"
                  >
                    <span>View All Packages</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {(showAllPackages ? packages : packages.slice(0, PACKAGES_INITIAL_COUNT)).map((pkg) => (
                    <div
                      key={pkg.id}
                      className="bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                    >
                      <div className="relative h-52 overflow-hidden">
                        <img
                          src={pkg.coverImage}
                          alt={pkg.title}
                          className="w-full h-full object-cover"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />

                        <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-emerald-600 text-white text-[11px] font-bold">
                          {pkg.duration}
                        </span>

                        <button
                          type="button"
                          onClick={() => handleToggleWishlistPkg(pkg.id)}
                          aria-label={`Save ${pkg.title} to wishlist`}
                          className="absolute top-3 right-3 p-1.5 rounded-full bg-white/80 backdrop-blur-xs hover:bg-white text-rose-500 shadow-xs transition-colors cursor-pointer"
                        >
                          <Heart
                            className={`w-4 h-4 ${
                              wishlistPackages.includes(pkg.id)
                                ? 'fill-rose-500 text-rose-500'
                                : 'text-slate-400'
                            }`}
                          />
                        </button>

                        <div className="absolute bottom-3 left-3.5 right-3.5 text-white">
                          <span className="text-[11px] text-teal-300 font-semibold">{pkg.destination}</span>
                          <h3 className="text-base font-bold font-serif-display drop-shadow-sm leading-tight mt-0.5">
                            {pkg.title}
                          </h3>
                        </div>
                      </div>

                      <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                        <div className="space-y-2">
                          <span className="text-[11px] font-bold uppercase tracking-wider text-stone-400 block">
                            Key Highlights:
                          </span>
                          <div className="flex flex-wrap gap-1.5">
                            {pkg.highlights.slice(0, 3).map((h) => (
                              <span
                                key={h}
                                className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-700 text-[11px]"
                              >
                                {h}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-stone-100 flex items-center justify-between">
                          <div>
                            <span className="text-[11px] text-stone-400 block">Price Per Person</span>
                            <div className="text-xl font-bold text-slate-900 font-mono-num">
                              ₹{pkg.pricePerPerson.toLocaleString('en-IN')}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => setActivePackageModal(pkg)}
                              className="px-3 py-2 rounded-xl border border-stone-300 text-xs font-semibold text-slate-700 hover:bg-stone-50 transition-colors cursor-pointer"
                            >
                              Details
                            </button>
                            <button
                              type="button"
                              onClick={() => setActiveBookingModal(pkg)}
                              className="px-4 py-2 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-bold transition-all shadow-xs cursor-pointer"
                            >
                              Book Now
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* See More / Show Less / View All for Tour Packages (Requirement 3) */}
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
                  {packages.length > PACKAGES_INITIAL_COUNT && !showAllPackages && (
                    <button
                      type="button"
                      onClick={() => setShowAllPackages(true)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <ChevronDown className="w-4 h-4 text-[#0D9488]" />
                      <span>See More Packages ({packages.length - PACKAGES_INITIAL_COUNT} more)</span>
                    </button>
                  )}
                  {showAllPackages && packages.length > PACKAGES_INITIAL_COUNT && (
                    <button
                      type="button"
                      onClick={() => setShowAllPackages(false)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <ChevronDown className="w-4 h-4 rotate-180 text-[#0D9488]" />
                      <span>Show Less</span>
                    </button>
                  )}
                  <button
                    type="button"
                    onClick={() => navigateAndScroll('packages')}
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#0D9488] hover:underline cursor-pointer"
                  >
                    <span>View All Tour Packages</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </section>

              {/* LOCAL TOUR GUIDES SECTION — initial 3, with See More */}
              <section className="space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold mb-2">
                      <Award className="w-3.5 h-3.5" />
                      <span>Certified Professionals</span>
                    </div>
                    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif-display">Local Guides</h2>
                    <p className="text-xs sm:text-sm text-stone-600 max-w-xl mt-1">Connect with certified local guides who provide authentic cultural narration and senior citizen care.</p>
                  </div>
                  <button type="button" onClick={() => navigateAndScroll('guides')} className="text-xs font-bold text-[#0D9488] hover:underline flex items-center gap-1 cursor-pointer shrink-0">
                    <span>View All Guides</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
                <LocalGuidesSection
                  guides={showAllGuides ? guides : guides.slice(0, GUIDES_INITIAL_COUNT)}
                  onSelectGuide={(g) => setActiveGuideProfileModal(g)}
                  onContactGuide={(g) => setActiveGuideContactModal(g)}
                  onRegisterAsGuide={() => setGuideRegisterModalOpen(true)}
                />
                {guides.length > GUIDES_INITIAL_COUNT && (
                  <div className="flex justify-center">
                    <button
                      type="button"
                      onClick={() => setShowAllGuides((prev) => !prev)}
                      className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-white border border-stone-300 hover:bg-stone-50 text-slate-800 text-xs font-bold transition-colors cursor-pointer shadow-xs"
                    >
                      <ChevronDown className={`w-4 h-4 transition-transform ${showAllGuides ? 'rotate-180' : ''}`} />
                      {showAllGuides ? 'Show Less' : `See More Guides (${guides.length - GUIDES_INITIAL_COUNT} more)`}
                    </button>
                  </div>
                )}
              </section>

              {/* WHY CHOOSE TRIP TOGETHER */}
              <section className="space-y-8">
                <div className="text-center max-w-xl mx-auto space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5" />
                    <span>Platform Advantages</span>
                  </div>
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif-display">
                    Why Choose Trip Together?
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600">
                    Grounded in transparency, verified tariffs, and family-first accommodations
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl border border-stone-200/90 p-6 space-y-2.5 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center">
                      <Compass className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Flexible Destination Discovery</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Search and explore any city or regional circuit beyond fixed lists, with verified transit modes and live distance calculations.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-stone-200/90 p-6 space-y-2.5 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center">
                      <Wallet className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Transparent Package Pricing</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      No hidden markups or fabricated seat availability. We distinguish between per-night hotel budgets and total-stay calculations.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-stone-200/90 p-6 space-y-2.5 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center">
                      <Calendar className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Personalised Itinerary Planning</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Adaptive day-by-day scheduling with senior citizen rest windows, customized food stops, and instant PDF exports.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-stone-200/90 p-6 space-y-2.5 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center">
                      <Award className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Access to Verified Local Guides</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Connect with licensed regional experts who provide authentic cultural narration, queue facilitation, and senior citizen care.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-stone-200/90 p-6 space-y-2.5 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center">
                      <Users className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Convenient Trip Organisation</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Private group messaging, collaborative packing checklists, and opt-in location sharing keeping everyone synchronized.
                    </p>
                  </div>

                  <div className="bg-white rounded-2xl border border-stone-200/90 p-6 space-y-2.5 shadow-xs">
                    <div className="w-10 h-10 rounded-xl bg-teal-50 text-[#0D9488] flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <h3 className="text-base font-bold text-slate-900">Verified Providers</h3>
                    <p className="text-xs text-stone-600 leading-relaxed">
                      Cross-referenced against official state tourism guidelines and direct official portals without inventing false claims.
                    </p>
                  </div>
                </div>
              </section>

              {/* NEWSLETTER ALERT SUBSCRIPTION */}
              <section className="bg-gradient-to-r from-[#0F1E36] to-[#1E3A8A] rounded-3xl p-8 sm:p-10 text-white shadow-xl">
                <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                  <div className="text-center md:text-left space-y-1">
                    <h2 className="text-xl sm:text-2xl font-bold font-serif-display">
                      Stay Informed on Travel Alerts
                    </h2>
                    <p className="text-xs sm:text-sm text-stone-200">
                      Receive notifications for season quota releases, Tatkal reminders, and local festivals.
                    </p>
                  </div>

                  {newsletterSubscribed ? (
                    <div className="px-5 py-3 bg-teal-500/20 border border-teal-400/30 text-teal-200 text-xs font-semibold rounded-xl">
                      ✓ Subscribed! Alerts enabled for {newsletterEmail}
                    </div>
                  ) : (
                    <form
                      onSubmit={(e) => {
                        e.preventDefault();
                        if (newsletterEmail.trim() && newsletterEmail.includes('@')) {
                          setNewsletterSubscribed(true);
                        }
                      }}
                      className="flex w-full md:w-auto items-center gap-2"
                    >
                      <input
                        type="email"
                        required
                        value={newsletterEmail}
                        onChange={(e) => setNewsletterEmail(e.target.value)}
                        placeholder="Enter your family email..."
                        className="flex-1 md:w-64 px-4 py-2.5 text-xs bg-white text-slate-900 rounded-xl focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-6 py-2.5 text-xs font-bold text-white bg-[#0D9488] hover:bg-[#0f766e] rounded-xl transition-colors whitespace-nowrap cursor-pointer shadow-md"
                      >
                        Subscribe
                      </button>
                    </form>
                  )}
                </div>
              </section>
            </div>
          </div>
        )}

        {/* EXPLORE DESTINATIONS PAGE */}
        {activeSection === 'destinations' && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <button
                  type="button"
                  onClick={() => navigateAndScroll('dashboard')}
                  className="text-xs font-semibold text-[#0D9488] hover:underline mb-1 block cursor-pointer"
                >
                  ← Back to Home
                </button>
                <h1 className="text-3xl font-bold text-slate-900 font-serif-display">
                  Explore Destinations
                </h1>
                <p className="text-xs sm:text-sm text-stone-600 mt-1">
                  Discover verified pilgrimage circuits, hill retreats, coastal getaways, and heritage fortresses.
                </p>
              </div>

              <div className="flex items-center gap-2">
                {['All', 'Pilgrimage', 'Hill Station', 'Coastal & Beach', 'Heritage & Culture', 'Adventure'].map((cat) => (
                  <button
                    key={cat}
                    type="button"
                    onClick={() => setDestinationCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer ${
                      destinationCategoryFilter === cat
                        ? 'bg-[#0F1E36] text-white'
                        : 'bg-white border border-stone-200 text-slate-600 hover:bg-stone-50'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredDestinations.map((dest) => (
                <div
                  key={dest.id}
                  className="group bg-white rounded-3xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between"
                >
                  <div className="relative h-52 sm:h-56 overflow-hidden bg-stone-100">
                    <img
                      src={dest.image}
                      alt={dest.name}
                      loading="lazy"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent opacity-60 group-hover:opacity-30 transition-opacity" />

                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/75 backdrop-blur-xs text-white text-[11px] font-semibold tracking-wide shadow-xs">
                      {dest.category}
                    </span>
                  </div>

                  <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                    <div>
                      <h3 className="text-xl font-bold text-slate-900 group-hover:text-[#0D9488] font-serif-display transition-colors">
                        {dest.name}
                      </h3>
                      <p className="text-xs text-stone-500 flex items-center gap-1.5 mt-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
                        <span className="truncate">{dest.state}, {dest.country}</span>
                      </p>
                    </div>

                    <div className="space-y-3 pt-3 border-t border-stone-100">
                      <div className="flex items-center justify-between text-xs text-stone-500">
                        <span>Best Season</span>
                        <span className="font-semibold text-slate-800 bg-stone-50 px-2.5 py-1 rounded-lg border border-stone-200/60 font-medium">
                          {dest.bestSeason}
                        </span>
                      </div>

                      <button
                        type="button"
                        onClick={() => setActiveDestinationModal(dest)}
                        className="w-full inline-flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl bg-stone-100 group-hover:bg-[#0F1E36] text-slate-800 group-hover:text-white text-xs font-bold transition-all duration-200 cursor-pointer shadow-2xs"
                      >
                        <span>Explore Destination</span>
                        <ArrowRight className="w-3.5 h-3.5 transition-transform group-hover:translate-x-1" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* LOCAL GUIDES PAGE */}
        {activeSection === 'guides' && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
            <button
              type="button"
              onClick={() => navigateAndScroll('dashboard')}
              className="text-xs font-semibold text-[#0D9488] hover:underline block cursor-pointer"
            >
              ← Back to Home
            </button>
            <LocalGuidesSection
              guides={guides}
              onSelectGuide={(g) => setActiveGuideProfileModal(g)}
              onContactGuide={(g) => setActiveGuideContactModal(g)}
              onRegisterAsGuide={() => setGuideRegisterModalOpen(true)}
            />
          </div>
        )}

        {/* TOUR PACKAGES SECTION */}
        {activeSection === 'packages' && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
            <button
              type="button"
              onClick={() => navigateAndScroll('dashboard')}
              className="text-xs font-semibold text-[#0D9488] hover:underline block cursor-pointer"
            >
              ← Back to Home
            </button>
            <PackagesSection
              tripParams={tripParams}
              packages={TIRUPATI_PACKAGES}
              providerAdapters={providerAdapters}
              tourImageUrl={chandragiriTourImg}
              onShortlistBooking={handleShortlistBooking}
              onSelectPackage={(pkg) => setActivePackageModal(pkg)}
              onBookPackage={(pkg) => setActiveBookingModal(pkg)}
              onToggleWishlist={handleToggleWishlistPkg}
              wishlist={wishlistPackages}
            />
          </div>
        )}

        {/* TRIP PLANNER & ITINERARY BUILDER */}
        {activeSection === 'builder' && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
            <button
              type="button"
              onClick={() => navigateAndScroll('dashboard')}
              className="text-xs font-semibold text-[#0D9488] hover:underline block cursor-pointer"
            >
              ← Back to Home
            </button>
            <TripBuilderSection
              tripParams={tripParams}
              setTripParams={setTripParams}
              itineraryDays={itineraryDays}
              setItineraryDays={setItineraryDays}
              onShortlistBooking={handleShortlistBooking}
              userId={authUser?.id}
            />
          </div>
        )}

        {/* TRANSPORT SECTION */}
        {activeSection === 'transport' && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
            <button
              type="button"
              onClick={() => navigateAndScroll('dashboard')}
              className="text-xs font-semibold text-[#0D9488] hover:underline block cursor-pointer"
            >
              ← Back to Home
            </button>
            <TransportSection
              tripParams={tripParams}
              setTripParams={setTripParams}
              trains={KAKINADA_TO_TIRUPATI_TRAINS}
              buses={KAKINADA_TO_TIRUPATI_BUSES}
              flights={KAKINADA_TO_TIRUPATI_FLIGHTS}
              onShortlistBooking={handleShortlistBooking}
            />
          </div>
        )}

        {/* HOTELS SECTION */}
        {activeSection === 'hotels' && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
            <button
              type="button"
              onClick={() => navigateAndScroll('dashboard')}
              className="text-xs font-semibold text-[#0D9488] hover:underline block cursor-pointer"
            >
              ← Back to Home
            </button>
            <HotelsSection
              tripParams={tripParams}
              setTripParams={setTripParams}
              hotels={TIRUPATI_HOTELS}
              hotelImageUrl={tirupatiHotelImg}
              onShortlistBooking={handleShortlistBooking}
            />
          </div>
        )}

        {/* FAMILY LIVE TRACKING */}
        {activeSection === 'tracking' && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
            <button
              type="button"
              onClick={() => navigateAndScroll('dashboard')}
              className="text-xs font-semibold text-[#0D9488] hover:underline block cursor-pointer"
            >
              ← Back to Home
            </button>
            <FamilyTrackingSection
              tripParams={tripParams}
              members={familyMembers}
              setMembers={setFamilyMembers}
              activeMemberId={activeMemberId}
            />
          </div>
        )}

        {/* FAMILY GROUP CHAT */}
        {activeSection === 'chat' && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
            <button
              type="button"
              onClick={() => navigateAndScroll('dashboard')}
              className="text-xs font-semibold text-[#0D9488] hover:underline block cursor-pointer"
            >
              ← Back to Home
            </button>
            <FamilyChatSection
              messages={chatMessages}
              setMessages={setChatMessages}
              members={familyMembers}
              activeMemberId={activeMemberId}
              setActiveMemberId={setActiveMemberId}
              checklistItems={checklistItems}
              savedBookings={savedBookings}
            />
          </div>
        )}

        {/* PACKING CHECKLIST */}
        {activeSection === 'checklist' && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
            <button
              type="button"
              onClick={() => navigateAndScroll('dashboard')}
              className="text-xs font-semibold text-[#0D9488] hover:underline block cursor-pointer"
            >
              ← Back to Home
            </button>
            <PackingChecklistSection
              items={checklistItems}
              setItems={setChecklistItems}
              members={familyMembers}
              activeMemberId={activeMemberId}
            />
          </div>
        )}

        {/* MY BOOKINGS AND BUDGET */}
        {activeSection === 'budget' && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
            <button
              type="button"
              onClick={() => navigateAndScroll('dashboard')}
              className="text-xs font-semibold text-[#0D9488] hover:underline block cursor-pointer"
            >
              ← Back to Home
            </button>
            <BudgetSection
              tripParams={tripParams}
              setTripParams={setTripParams}
              savedBookings={savedBookings}
              setSavedBookings={setSavedBookings}
            />
          </div>
        )}

        {/* TRAVELLER DASHBOARD VIEW */}
        {activeSection === 'traveller-dashboard' && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
            <button
              type="button"
              onClick={() => navigateAndScroll('dashboard')}
              className="text-xs font-semibold text-[#0D9488] hover:underline block cursor-pointer"
            >
              ← Back to Home
            </button>
            <TravellerDashboardSection
              user={authUser || { id: 'usr-guest', name: 'Guest Traveler', email: 'guest@example.com' }}
              onOpenTrip={handleOpenSavedTrip}
              onExploreDestination={(destName) => {
                const found = destinations.find((d) => d.name.toLowerCase() === destName.toLowerCase());
                if (found) setActiveDestinationModal(found);
                else {
                  setTripParams((p) => ({ ...p, destination: destName }));
                  navigateAndScroll('transport');
                }
              }}
              onBookPackage={(pkgTitle) => {
                const found = packages.find((p) => p.title.toLowerCase().includes(pkgTitle.toLowerCase()));
                if (found) setActiveBookingModal(found);
                else navigateAndScroll('packages');
              }}
              onNavigate={navigateAndScroll}
              wishlistDestinations={wishlistDestinations}
              wishlistPackages={wishlistPackages}
              onToggleWishlistDest={handleToggleWishlistDest}
              onToggleWishlistPkg={handleToggleWishlistPkg}
            />
          </div>
        )}

        {/* ADMIN CONTROL PANEL VIEW */}
        {activeSection === 'admin' && (
          <div className="max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-10 py-10 space-y-8">
            <button
              type="button"
              onClick={() => navigateAndScroll('dashboard')}
              className="text-xs font-semibold text-[#0D9488] hover:underline block cursor-pointer"
            >
              ← Back to Website
            </button>
            <AdminDashboardSection
              onBackToPlatform={() => navigateAndScroll('dashboard')}
            />
          </div>
        )}
        {/* CONTACT US PAGE */}
        {activeSection === 'contact' && (
          <ContactPage
            defaultEmail={authUser?.email}
            defaultName={authUser?.name}
            onNavigateHome={() => navigateAndScroll('dashboard')}
          />
        )}

        {/* PRIVACY POLICY PAGE */}
        {activeSection === 'privacy' && (
          <PrivacyPolicyPage
            onNavigateHome={() => navigateAndScroll('dashboard')}
            onContactUs={() => navigateAndScroll('contact')}
          />
        )}

        {/* TERMS & CONDITIONS PAGE */}
        {activeSection === 'terms' && (
          <TermsPage
            onNavigateHome={() => navigateAndScroll('dashboard')}
            onContactUs={() => navigateAndScroll('contact')}
          />
        )}

        {/* HOW IT WORKS PAGE */}
        {activeSection === 'how-it-works' && (
          <HowItWorksPage
            onNavigateHome={() => navigateAndScroll('dashboard')}
            onExploreDestinations={() => navigateAndScroll('destinations')}
            onPlanTrip={() => navigateAndScroll('builder')}
            onViewPackages={() => navigateAndScroll('packages')}
            onFindGuides={() => navigateAndScroll('guides')}
          />
        )}

        {/* 404 NOT FOUND PAGE (Requirement 6 D) */}
        {activeSection === 'not-found' && (
          <NotFoundPage
            onNavigateHome={() => navigateAndScroll('dashboard')}
            onExploreDestinations={() => navigateAndScroll('destinations')}
            onViewPackages={() => navigateAndScroll('packages')}
            onContactUs={() => navigateAndScroll('contact')}
          />
        )}
      </main>

      {/* PROFESSIONAL FOOTER (Requirement 5) */}
      <footer className="bg-[#0F1E36] text-stone-300 pt-16 pb-10 px-4 sm:px-6 lg:px-10 border-t border-stone-800">
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 pb-12 border-b border-white/10">
          {/* Brand Column (Requirement 1 & 5) */}
          <div className="sm:col-span-2 lg:col-span-4 space-y-4">
            <TripTogetherLogo
              variant="horizontal"
              theme="dark"
              onClick={() => navigateAndScroll('dashboard')}
              ariaLabel="Trip Together Homepage"
            />
            <p className="text-xs text-stone-300 max-w-sm leading-relaxed">
              India's collaborative travel platform. Discover verified destinations, compare transparent rail and road tariffs, book certified local guides, and travel together with total trust.
            </p>
            <div className="text-xs text-stone-400 space-y-1.5 pt-1 font-mono-num">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Support: <a href="mailto:madhurimadhu039@gmail.com" className="text-teal-300 hover:underline">madhurimadhu039@gmail.com</a></span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-teal-400 shrink-0" />
                <span>Helpline: <span className="text-white">+91 1800-425-TRIP</span> (9AM–8PM IST)</span>
              </div>
            </div>
          </div>

          {/* Explore Column */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Explore</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button type="button" onClick={() => navigateAndScroll('destinations')} className="hover:text-white transition-colors cursor-pointer">
                  Destinations
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateAndScroll('packages')} className="hover:text-white transition-colors cursor-pointer">
                  Tour Packages
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateAndScroll('guides')} className="hover:text-white transition-colors cursor-pointer">
                  Local Guides
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateAndScroll('how-it-works')} className="hover:text-white transition-colors cursor-pointer">
                  How It Works
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateAndScroll('builder')} className="hover:text-white transition-colors cursor-pointer">
                  Trip Planner
                </button>
              </li>
            </ul>
          </div>

          {/* Support Column */}
          <div className="lg:col-span-2 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Support</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button type="button" onClick={() => navigateAndScroll('contact')} className="hover:text-white transition-colors cursor-pointer">
                  Contact Us
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setAboutUsModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">
                  About Us
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setContactModalOpen(true)} className="hover:text-white transition-colors cursor-pointer">
                  FAQs & Help Center
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setGuideRegisterModalOpen(true)} className="text-teal-300 hover:text-white transition-colors cursor-pointer font-semibold">
                  Become a Local Guide →
                </button>
              </li>
            </ul>
          </div>

          {/* Legal Column */}
          <div className="lg:col-span-3 space-y-3">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Legal</h3>
            <ul className="space-y-2 text-xs">
              <li>
                <button type="button" onClick={() => navigateAndScroll('privacy')} className="hover:text-white transition-colors cursor-pointer">
                  Privacy Policy
                </button>
              </li>
              <li>
                <button type="button" onClick={() => navigateAndScroll('terms')} className="hover:text-white transition-colors cursor-pointer">
                  Terms & Conditions
                </button>
              </li>
              <li>
                <button type="button" onClick={() => setPolicyModal('cancellation')} className="hover:text-white transition-colors cursor-pointer">
                  Booking & Refund Policy
                </button>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar: Copyright and Verified Portal Links */}
        <div className="max-w-[1280px] mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            © {new Date().getFullYear()} TripTogether Travel Platform. All rights reserved.
          </div>
          <div className="flex items-center gap-6">
            <a href="https://ttdevasthanams.ap.gov.in/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              TTD Portal
            </a>
            <a href="https://www.irctc.co.in/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              IRCTC Rail
            </a>
            <a href="https://www.apsrtconline.in/" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">
              APSRTC Bus
            </a>
          </div>
        </div>
      </footer>

      {/* ALL INTERACTIVE MODALS */}

      {/* 1. Destination Detail Modal */}
      {activeDestinationModal && (
        <DestinationDetailModal
          destination={activeDestinationModal}
          packages={packages}
          guides={guides}
          onClose={() => setActiveDestinationModal(null)}
          onSelectPackage={(pkg) => {
            setActiveDestinationModal(null);
            setActivePackageModal(pkg);
          }}
          onSelectGuide={(g) => {
            setActiveDestinationModal(null);
            setActiveGuideProfileModal(g);
          }}
          onPlanTripToDestination={(destName) => {
            setActiveDestinationModal(null);
            setTripParams((p) => ({ ...p, destination: destName }));
            navigateAndScroll('builder');
          }}
        />
      )}

      {/* 2. Package Detail Modal */}
      {activePackageModal && (
        <PackageDetailModal
          packageItem={activePackageModal}
          onClose={() => setActivePackageModal(null)}
          onBookPackage={(pkg) => {
            setActivePackageModal(null);
            setActiveBookingModal(pkg);
          }}
        />
      )}

      {/* 3. Booking / Enquiry Modal */}
      {activeBookingModal && (
        <BookingEnquiryModal
          packageItem={activeBookingModal}
          defaultEmail={authUser?.email}
          defaultName={authUser?.name}
          onClose={() => setActiveBookingModal(null)}
          onSuccess={(ref, title) => {
            setToastMessage(`✓ Booking confirmed for ${title}! Ref: ${ref}`);
            setTimeout(() => setToastMessage(null), 4500);
            loadPlatformData();
          }}
        />
      )}

      {/* 4. Contact Guide Modal */}
      {activeGuideContactModal && (
        <ContactGuideModal
          guide={activeGuideContactModal}
          defaultEmail={authUser?.email}
          defaultName={authUser?.name}
          onClose={() => setActiveGuideContactModal(null)}
          onSuccess={(ref, gName) => {
            setToastMessage(`✓ Inquiry sent to ${gName}! Ref: ${ref}`);
            setTimeout(() => setToastMessage(null), 4500);
            loadPlatformData();
          }}
        />
      )}

      {/* 5. Guide Profile Modal */}
      {activeGuideProfileModal && (
        <GuideProfileModal
          guide={activeGuideProfileModal}
          onClose={() => setActiveGuideProfileModal(null)}
          onContactGuide={(g) => {
            setActiveGuideProfileModal(null);
            setActiveGuideContactModal(g);
          }}
        />
      )}

      {/* 6. Guide Registration Modal */}
      <GuideRegisterModal
        isOpen={guideRegisterModalOpen}
        onClose={() => setGuideRegisterModalOpen(false)}
        defaultEmail={authUser?.email}
        defaultName={authUser?.name}
        onSuccess={(newGuide) => {
          setGuides((prev) => [newGuide, ...prev]);
          setToastMessage(`✓ Guide application submitted for ${newGuide.name}`);
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />

      {/* 7. Guide Dashboard Modal */}
      {guideDashboardModalOpen && (
        <GuideDashboardModal
          guide={guides[0] || null}
          onClose={() => setGuideDashboardModalOpen(false)}
          onUpdateGuide={(updated) => {
            setGuides((prev) => prev.map((g) => (g.id === updated.id ? updated : g)));
          }}
        />
      )}

      {/* 8. Contact Support Modal */}
      <ContactSupportModal
        isOpen={contactModalOpen}
        onClose={() => setContactModalOpen(false)}
        defaultEmail={authUser?.email}
        defaultName={authUser?.name}
      />

      {/* 9. About Us Modal */}
      <AboutUsModal
        isOpen={aboutUsModalOpen}
        onClose={() => setAboutUsModalOpen(false)}
        onExploreDestinations={() => navigateAndScroll('destinations')}
      />

      {/* 10. Write Review Modal */}
      <WriteReviewModal
        isOpen={writeReviewModalOpen}
        onClose={() => setWriteReviewModalOpen(false)}
        defaultName={authUser?.name}
        defaultEmail={authUser?.email}
        onSuccess={(newRev) => {
          setReviews((prev) => [newRev, ...prev]);
          setToastMessage('✓ Thank you for posting a verified review!');
          setTimeout(() => setToastMessage(null), 4000);
        }}
      />

      {/* 11. Manage Family Travelers Modal */}
      {manageMembersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-stone-200 space-y-6">
            <div className="flex items-center justify-between pb-3 border-b border-stone-100">
              <h3 className="text-lg font-bold text-slate-900 font-serif-display">
                Manage Participating Travelers
              </h3>
              <button
                type="button"
                onClick={() => setManageMembersModalOpen(false)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto">
              {familyMembers.map((m) => (
                <div
                  key={m.id}
                  className="p-3 bg-stone-50 border border-stone-200 rounded-xl flex items-center justify-between gap-3"
                >
                  <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[#0F1E36] text-white flex items-center justify-center text-xs font-bold">
                      {m.avatarInitials}
                    </div>
                    <div>
                      <input
                        type="text"
                        value={m.name}
                        onChange={(e) => handleUpdateMemberName(m.id, e.target.value)}
                        className="text-xs font-bold text-slate-900 bg-transparent border-b border-stone-300 focus:border-[#0D9488] focus:outline-none"
                      />
                      <span className="text-[10px] text-stone-400 block">{m.role}</span>
                    </div>
                  </div>

                  {familyMembers.length > 1 && (
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomMember(m.id)}
                      className="p-1.5 text-rose-500 hover:text-rose-700 cursor-pointer"
                      title="Remove traveler"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                </div>
              ))}
            </div>

            <div className="pt-2 border-t border-stone-100 space-y-3">
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="New Traveler Name..."
                  value={newMemberNameInput}
                  onChange={(e) => setNewMemberNameInput(e.target.value)}
                  className="flex-1 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (newMemberNameInput.trim()) {
                      handleAddCustomMember(newMemberNameInput, newMemberRoleInput);
                      setNewMemberNameInput('');
                    }
                  }}
                  className="px-4 py-2 bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-xs font-bold rounded-xl cursor-pointer"
                >
                  Add Traveler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 12. Authentication Modal */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div data-auth-modal className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-[#0F1E36] to-[#0D9488] text-white px-6 py-6 relative">
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                aria-label="Close Sign In Modal"
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <TripTogetherSymbol sizeClass="w-11 h-11" />
                <div>
                  <h3 className="text-xl font-bold font-serif-display">
                    {authMode === 'signin' && 'Sign In to TripTogether'}
                    {authMode === 'signup' && 'Create Your Account'}
                    {authMode === 'forgot' && 'Reset Your Password'}
                  </h3>
                  <p className="text-xs text-stone-200 mt-0.5">
                    {authMode === 'signin' && 'Access saved trips, bookings, and private family chat.'}
                    {authMode === 'signup' && 'Join thousands of families discovering authentic journeys.'}
                    {authMode === 'forgot' && 'Enter your registered email to reset your credentials.'}
                  </p>
                </div>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              {authError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-800 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{authError}</span>
                </div>
              )}

              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Your Full Name</label>
                  <input
                    type="text"
                    required
                    value={authName}
                    onChange={(e) => setAuthName(e.target.value)}
                    placeholder="e.g. Madhuri Rao"
                    className="w-full px-3.5 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Email ID *</label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="name@example.com"
                    className="w-full pl-9 pr-4 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  {authMode === 'forgot' ? 'New Password *' : 'Password *'}
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type={passwordVisible ? 'text' : 'password'}
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder="At least 4 characters"
                    className="w-full pl-9 pr-10 py-2.5 bg-stone-50 border border-stone-200 rounded-xl text-xs sm:text-sm text-slate-900 focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0D9488]/20 focus:border-[#0D9488]"
                  />
                  <button
                    type="button"
                    onClick={() => setPasswordVisible(!passwordVisible)}
                    aria-label={passwordVisible ? 'Hide password' : 'Show password'}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-stone-400 hover:text-slate-700 cursor-pointer"
                  >
                    {passwordVisible ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="submit"
                  disabled={authSubmitting}
                  className="w-full py-3 rounded-xl bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-xs sm:text-sm font-bold transition-all shadow-md cursor-pointer disabled:opacity-50"
                >
                  {authSubmitting
                    ? 'Validating...'
                    : authMode === 'signin'
                    ? 'Sign In to Account'
                    : authMode === 'signup'
                    ? 'Create Free Account'
                    : 'Reset Password'}
                </button>
              </div>

              {/* Mode Switchers */}
              <div className="pt-2 flex items-center justify-between text-xs text-stone-500 border-t border-stone-100">
                {authMode === 'signin' ? (
                  <>
                    <button
                      type="button"
                      onClick={() => setAuthMode('signup')}
                      className="text-[#0D9488] font-bold hover:underline cursor-pointer"
                    >
                      New user? Sign Up
                    </button>
                    <button
                      type="button"
                      onClick={() => setAuthMode('forgot')}
                      className="text-stone-500 hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </>
                ) : (
                  <button
                    type="button"
                    onClick={() => setAuthMode('signin')}
                    className="text-[#0D9488] font-bold hover:underline mx-auto cursor-pointer"
                  >
                    ← Back to Sign In
                  </button>
                )}
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 13. Policy Modals (Privacy / Terms / Cancellation) */}
      {policyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-2xl max-h-[85vh] overflow-y-auto shadow-2xl border border-stone-200 space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-stone-100">
              <h3 className="text-xl font-bold text-slate-900 font-serif-display capitalize">
                {policyModal === 'privacy' && 'Trip Together Privacy Policy'}
                {policyModal === 'terms' && 'Platform Terms & Conditions'}
                {policyModal === 'cancellation' && 'Booking & Cancellation Policy'}
              </h3>
              <button
                type="button"
                onClick={() => setPolicyModal(null)}
                className="p-1 rounded-full hover:bg-stone-100 text-stone-500 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="text-xs text-stone-600 space-y-3 leading-relaxed">
              {policyModal === 'privacy' && (
                <>
                  <p>
                    Trip Together is committed to safeguarding your family's personal information. We do not sell your email, phone numbers, or travel plans to third-party telemarketers.
                  </p>
                  <p>
                    <strong>Consent-Based Location Sharing:</strong> GPS coordinates are shared exclusively among family members who explicitly grant in-browser permission. No background location tracking takes place without your consent.
                  </p>
                  <p>
                    <strong>Verification Documents:</strong> All guide verification licenses and government credentials submitted for review are stored securely and never published publicly.
                  </p>
                </>
              )}

              {policyModal === 'terms' && (
                <>
                  <p>
                    By using Trip Together, you agree to discover, plan, and submit inquiries with genuine intent. Our platform provides verified travel schedules and public tariffs.
                  </p>
                  <p>
                    <strong>Government Portal Authority:</strong> Railway bookings and temple darshan tokens are governed by IRCTC and official devasthanams. Trip Together never guarantees darshan quotas beyond verified terms.
                  </p>
                </>
              )}

              {policyModal === 'cancellation' && (
                <>
                  <p>
                    <strong>Tour Packages:</strong> Most verified packages offer free cancellation up to 48 hours prior to journey date. Specific provider policies are displayed transparently on every package card.
                  </p>
                  <p>
                    <strong>Local Guiding:</strong> Guide bookings can be rescheduled or cancelled with 24 hours notice with full refund.
                  </p>
                </>
              )}
            </div>

            <div className="pt-3 border-t border-stone-100 flex justify-end">
              <button
                type="button"
                onClick={() => setPolicyModal(null)}
                className="px-5 py-2 rounded-xl bg-[#0F1E36] text-white text-xs font-bold cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
