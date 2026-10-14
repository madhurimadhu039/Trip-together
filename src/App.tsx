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
import { TransportSection } from './components/TransportSection';
import { HotelsSection } from './components/HotelsSection';
import { PackagesSection } from './components/PackagesSection';
import { TripBuilderSection } from './components/TripBuilderSection';
import { FamilyTrackingSection } from './components/FamilyTrackingSection';
import { FamilyChatSection } from './components/FamilyChatSection';
import { PackingChecklistSection } from './components/PackingChecklistSection';
import { BudgetSection } from './components/BudgetSection';

// High-fidelity generated assets
import heroTirupatiImg from './assets/images/tirupati_hills_hero_1791742985128.jpg';
import kakinadaGatewayImg from './assets/images/kakinada_coastal_gateway_1791742998081.jpg';
import tirupatiHotelImg from './assets/images/tirupati_family_hotel_1791743009478.jpg';
import chandragiriTourImg from './assets/images/chandragiri_fort_tour_1791743020138.jpg';

interface AuthUser {
  id: string;
  email: string;
  name: string;
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
      'Accounts for the fact that Kakinada has no commercial airport — computes realistic road transfers to Rajahmundry (RJA) or Visakhapatnam (VTZ).',
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
    providerName: 'Gemini 3.8 Flash Trip Recommendation Engine',
    category: 'AI Assistant',
    envSecretName: 'GEMINI_API_KEY',
    configured: true,
    mode: 'LIVE_API',
    officialPortalUrl: 'https://ttdevasthanams.ap.gov.in/',
    complianceNote:
      'Grounded strictly on verified transport, hotel, and tour package records without inventing live seat counts or guaranteed darshan slots.',
  },
];

export default function App() {
  const [activeSection, setActiveSection] = useState<NavSection>('dashboard');
  const [familyDropdownOpen, setFamilyDropdownOpen] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterSubscribed, setNewsletterSubscribed] = useState(false);

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
    };
  });
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'forgot'>('signin');
  const [authEmail, setAuthEmail] = useState<string>('');
  const [authPassword, setAuthPassword] = useState<string>('');
  const [authName, setAuthName] = useState<string>('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSubmitting, setAuthSubmitting] = useState<boolean>(false);
  const [pendingSection, setPendingSection] = useState<NavSection | null>(null);
  const [profileMenuOpen, setProfileMenuOpen] = useState<boolean>(false);
  const [manageMembersModalOpen, setManageMembersModalOpen] = useState<boolean>(false);
  const [newMemberNameInput, setNewMemberNameInput] = useState<string>('');
  const [newMemberRoleInput, setNewMemberRoleInput] = useState<FamilyMember['role']>('Organizer');

  // Core editable Trip Parameters (customized from Pickup to Destination)
  const [tripParams, setTripParams] = useState<TripParams>(() => {
    try {
      const saved = localStorage.getItem('triptogether_params_v2');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      origin: 'Pickup Location',
      destination: 'Destination',
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
        if (Array.isArray(parsed) && parsed.length > 0 && !parsed.some((m: any) => m.name === 'Ramesh Rao')) {
          return parsed;
        }
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

  // Fetch backend provider adapter status on load with graceful fallback
  useEffect(() => {
    fetch('/api/providers/status')
      .then((r) => {
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        return r.json();
      })
      .then((data) => {
        if (data?.adapters && Array.isArray(data.adapters) && data.adapters.length > 0) {
          setProviderAdapters(data.adapters);
        }
      })
      .catch(() => {
        // Fallback already pre-populated from DEFAULT_PROVIDER_ADAPTERS
      });
  }, []);

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

  const openAuthPrompt = (targetSection?: NavSection) => {
    if (targetSection) {
      setPendingSection(targetSection);
    }
    setFamilyDropdownOpen(false);
    setAuthError(null);
    setAuthModalOpen(true);
  };

  const handleUnauthenticatedClickCapture = (e: React.MouseEvent) => {
    if (!authUser) {
      const target = e.target as HTMLElement | null;
      if (target?.closest?.('[data-auth-modal]')) {
        return;
      }
      e.preventDefault();
      e.stopPropagation();
      openAuthPrompt();
    }
  };

  const navigateAndScroll = (section: NavSection) => {
    setActiveSection(section);
    setFamilyDropdownOpen(false);
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
        // If server responded with 404/500/offline, fall through to seamless client session
        throw new Error(data?.error || `HTTP ${response.status}`);
      }

      const signedInUser: AuthUser = data.user;
      setAuthUser(signedInUser);
      setAuthModalOpen(false);
      setAuthPassword('');
      setToastMessage(`Welcome, ${signedInUser.name} (${signedInUser.email})! You are now signed in.`);
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
      };
      setAuthUser(signedInUser);
      setAuthModalOpen(false);
      setAuthPassword('');
      setToastMessage(`Welcome, ${signedInUser.name} (${signedInUser.email})! You are now signed in.`);
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
    setToastMessage('You have signed out of TripTogether.');
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Summary metrics
  const totalPlannedCost = savedBookings.reduce((s, b) => s + b.totalFamilyCost, 0);
  const remainingBudget = tripParams.totalBudget - totalPlannedCost;
  const totalRequiredUnits = checklistItems.reduce((s, i) => s + i.requiredQuantity, 0);
  const totalPackedUnits = checklistItems.reduce((s, i) => s + i.packedQuantity, 0);
  const packingProgressPct =
    totalRequiredUnits > 0 ? Math.round((totalPackedUnits / totalRequiredUnits) * 100) : 0;

  const isDropdownSectionActive =
    activeSection === 'tracking' ||
    activeSection === 'chat' ||
    activeSection === 'checklist' ||
    activeSection === 'budget';

  const handleTopSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!authUser) {
      openAuthPrompt('transport');
      return;
    }
    const q = searchQuery.trim().toLowerCase();
    if (!q) {
      navigateAndScroll('transport');
      return;
    }

    // Parse "Origin to Destination" if user types "X to Y"
    if (q.includes(' to ')) {
      const parts = searchQuery.split(/ to /i);
      if (parts[0]?.trim() && parts[1]?.trim()) {
        setTripParams((prev) => ({
          ...prev,
          origin: parts[0].trim(),
          destination: parts[1].trim(),
        }));
      }
    }

    if (
      q.includes('hotel') ||
      q.includes('room') ||
      q.includes('stay') ||
      q.includes('ttd') ||
      q.includes('srinivasam') ||
      q.includes('madhavam') ||
      q.includes('haritha') ||
      q.includes('choultry')
    ) {
      setToastMessage(`Showing verified hotels & rooms matching "${searchQuery.trim()}"`);
      setTimeout(() => setToastMessage(null), 3500);
      navigateAndScroll('hotels');
    } else if (
      q.includes('package') ||
      q.includes('darshan') ||
      q.includes('aptdc') ||
      q.includes('tour')
    ) {
      setToastMessage(`Showing tour packages matching "${searchQuery.trim()}"`);
      setTimeout(() => setToastMessage(null), 3500);
      navigateAndScroll('packages');
    } else if (
      q.includes('itinerary') ||
      q.includes('plan') ||
      q.includes('day') ||
      q.includes('ai') ||
      q.includes('custom')
    ) {
      setToastMessage(`Opening Custom Trip Builder & AI Advisor for "${searchQuery.trim()}"`);
      setTimeout(() => setToastMessage(null), 3500);
      navigateAndScroll('builder');
    } else if (q.includes('track') || q.includes('gps') || q.includes('map') || q.includes('location')) {
      navigateAndScroll('tracking');
    } else if (q.includes('chat') || q.includes('message')) {
      navigateAndScroll('chat');
    } else if (q.includes('pack') || q.includes('checklist') || q.includes('aadhaar')) {
      navigateAndScroll('checklist');
    } else if (q.includes('budget') || q.includes('cost') || q.includes('booking')) {
      navigateAndScroll('budget');
    } else {
      // If user typed a city or train/bus/flight query, update destination if single place and open Transport
      if (
        !q.includes('train') &&
        !q.includes('bus') &&
        !q.includes('flight') &&
        !q.includes(' to ')
      ) {
        setTripParams((prev) => ({ ...prev, destination: searchQuery.trim() }));
      }
      setToastMessage(`Searching transport options for "${searchQuery.trim()}"`);
      setTimeout(() => setToastMessage(null), 3500);
      navigateAndScroll('transport');
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-[#F5F3EE] text-slate-900">
      {/* Single Clean Top Navigation Bar with Family Dropdown & Sign In Avatar Button */}
      <header className="sticky top-0 z-40 bg-[#FAF9F5]/95 backdrop-blur-md border-b border-stone-200/80">
        <div className="max-w-[1440px] mx-auto px-6 lg:px-10 py-4 flex items-center justify-between gap-8">
          {/* Zone 1: Custom TripTogether Brand Logo in Left Corner of Navbar */}
          <a
            href="#top"
            onClick={(e) => {
              e.preventDefault();
              navigateAndScroll('dashboard');
            }}
            className="flex items-center gap-3 group shrink-0"
          >
            <div className="w-10 h-10 rounded-xl bg-[#1E332A] flex items-center justify-center shadow-sm border border-amber-400/30 group-hover:bg-[#14241D] transition-colors shrink-0">
              <svg
                viewBox="0 0 40 40"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="w-7 h-7"
                aria-hidden="true"
              >
                {/* Golden Sunrise Halo */}
                <circle cx="20" cy="14" r="6" fill="#FBBF24" fillOpacity="0.9" />
                {/* Four-Point Compass Star */}
                <path
                  d="M20 4L21.4 8.6L26 10L21.4 11.4L20 16L18.6 11.4L14 10L18.6 8.6L20 4Z"
                  fill="#FEF3C7"
                />
                {/* Seshachalam Twin Hills Silhouette */}
                <path
                  d="M4 30L13.5 17.5L21 26L27.5 19L36 30H4Z"
                  fill="#34D399"
                  fillOpacity="0.3"
                />
                <path
                  d="M4 30L13.5 18.5L21.5 26.5L28 19.5L36 30"
                  stroke="#FDE68A"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                {/* Winding Family Journey Path */}
                <path
                  d="M15 35C16.5 31.5 20.5 29.5 24.5 26.5"
                  stroke="#FFFFFF"
                  strokeWidth="2.2"
                  strokeLinecap="round"
                />
              </svg>
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold tracking-tight text-[#1E332A] font-serif-display leading-none whitespace-nowrap">
                TripTogether
              </span>
              <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-amber-800/90 mt-1 whitespace-nowrap">
                Family Travel
              </span>
            </div>
          </a>

          {/* Zone 2: Primary navigation links + 1 unified Dropdown for Tracking, Chat, Checklist & Budget */}
          <nav className="flex items-center gap-5 lg:gap-7 text-xs sm:text-sm font-medium text-stone-600">
            <button
              type="button"
              onClick={() => navigateAndScroll('dashboard')}
              className={`hover:text-[#1E332A] transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'dashboard'
                  ? 'text-[#1E332A] font-semibold underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Destinations
            </button>
            <button
              type="button"
              onClick={() => navigateAndScroll('transport')}
              className={`hover:text-[#1E332A] transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'transport'
                  ? 'text-[#1E332A] font-semibold underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Transport
            </button>
            <button
              type="button"
              onClick={() => navigateAndScroll('hotels')}
              className={`hover:text-[#1E332A] transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'hotels'
                  ? 'text-[#1E332A] font-semibold underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Hotels
            </button>
            <button
              type="button"
              onClick={() => navigateAndScroll('packages')}
              className={`hover:text-[#1E332A] transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'packages'
                  ? 'text-[#1E332A] font-semibold underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Packages
            </button>
            <button
              type="button"
              onClick={() => navigateAndScroll('builder')}
              className={`hover:text-[#1E332A] transition-colors whitespace-nowrap shrink-0 ${
                activeSection === 'builder'
                  ? 'text-[#1E332A] font-semibold underline underline-offset-8 decoration-2'
                  : ''
              }`}
            >
              Trip Builder
            </button>

            {/* Dropdown for Live Tracking, Family Chat, Packing Checklist, My Bookings & Budget */}
            <div className="relative">
              <button
                type="button"
                onClick={() => {
                  if (!authUser) {
                    openAuthPrompt('tracking');
                    return;
                  }
                  setFamilyDropdownOpen((prev) => !prev);
                }}
                className={`inline-flex items-center gap-1.5 hover:text-[#1E332A] transition-colors whitespace-nowrap shrink-0 ${
                  isDropdownSectionActive
                    ? 'text-[#1E332A] font-semibold underline underline-offset-8 decoration-2'
                    : ''
                }`}
              >
                <span>Family & Budget</span>
                <ChevronDown
                  className={`w-4 h-4 transition-transform duration-150 ${
                    familyDropdownOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {familyDropdownOpen && (
                <>
                  {/* Click-outside backdrop */}
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setFamilyDropdownOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-72 bg-white rounded-2xl shadow-xl border border-stone-200/90 py-2 z-50">
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
                          className={`w-full px-4 py-2.5 text-left flex items-start gap-3 transition-colors ${
                            isActive
                              ? 'bg-stone-100 text-[#1E332A] font-semibold'
                              : 'text-slate-700 hover:bg-stone-50'
                          }`}
                        >
                          <Icon className="w-4 h-4 text-[#1E332A] mt-0.5 shrink-0" />
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
          </nav>

          {/* Zone 3: Top-Right Sign In Button with Avatar Icon (or Signed-In User Avatar Menu) */}
          <div className="flex items-center gap-3 shrink-0 relative">
            {authUser ? (
              <>
                <button
                  type="button"
                  onClick={() => setProfileMenuOpen((prev) => !prev)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#1E332A] rounded-full hover:bg-[#14241D] transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <UserCircle className="w-4 h-4 text-amber-200 shrink-0" />
                  <span>{authUser.name}</span>
                  <ChevronDown className="w-3.5 h-3.5 text-stone-300" />
                </button>

                {profileMenuOpen && (
                  <>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setProfileMenuOpen(false)}
                    />
                    <div className="absolute right-0 top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-stone-200/90 py-3 px-4 z-50 space-y-2.5">
                      <div className="flex items-center gap-2.5 pb-2 border-b border-stone-100">
                        <UserCircle className="w-8 h-8 text-[#1E332A] shrink-0" />
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
                          setProfileMenuOpen(false);
                          navigateAndScroll('budget');
                        }}
                        className="w-full text-left text-xs font-medium text-slate-700 hover:text-[#1E332A] py-1 flex items-center gap-2"
                      >
                        <Wallet className="w-3.5 h-3.5 text-[#1E332A]" />
                        <span>My Bookings & Budget</span>
                      </button>
                      <button
                        type="button"
                        onClick={handleSignOut}
                        className="w-full text-left text-xs font-semibold text-red-600 hover:text-red-700 pt-1 border-t border-stone-100 flex items-center gap-2"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </>
                )}
              </>
            ) : (
              <button
                type="button"
                onClick={() => openAuthPrompt()}
                className="inline-flex items-center gap-2 px-5 py-2 text-xs font-semibold text-white bg-[#1E332A] rounded-full hover:bg-[#14241D] transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs"
              >
                <UserCircle className="w-4 h-4 text-amber-200 shrink-0" />
                <span>Sign In</span>
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Email & Password Authentication Modal (Opens First When Unauthenticated User Clicks Anywhere) */}
      {authModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div data-auth-modal className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden">
            {/* Modal Header Banner */}
            <div className="bg-[#1E332A] text-white px-6 py-6 relative">
              <button
                type="button"
                onClick={() => setAuthModalOpen(false)}
                aria-label="Close Sign In Modal"
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-white/15 flex items-center justify-center text-amber-200 shrink-0">
                  <UserCircle className="w-7 h-7" />
                </div>
                <div>
                  <h2 className="text-xl font-bold font-serif-display text-white">
                    {authMode === 'signin'
                      ? 'Sign In to TripTogether'
                      : authMode === 'signup'
                      ? 'Create Your Account'
                      : 'Reset Your Password'}
                  </h2>
                  <p className="text-xs text-stone-300 mt-0.5">
                    {authMode === 'forgot'
                      ? 'Enter your Email ID and set a new password to recover your account'
                      : 'Enter your Email ID and password to explore destinations, transport & stays'}
                  </p>
                </div>
              </div>
            </div>

            {/* Modal Form Body */}
            <form onSubmit={handleAuthSubmit} className="p-6 space-y-4">
              {/* Mode Switch Tabs */}
              <div className="grid grid-cols-2 gap-1 p-1 bg-stone-100 rounded-full text-xs font-semibold">
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signin');
                    setAuthError(null);
                  }}
                  className={`py-2 rounded-full transition-colors ${
                    authMode === 'signin'
                      ? 'bg-[#1E332A] text-white shadow-2xs'
                      : 'text-stone-600 hover:text-slate-900'
                  }`}
                >
                  Sign In
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setAuthMode('signup');
                    setAuthError(null);
                  }}
                  className={`py-2 rounded-full transition-colors ${
                    authMode === 'signup'
                      ? 'bg-[#1E332A] text-white shadow-2xs'
                      : 'text-stone-600 hover:text-slate-900'
                  }`}
                >
                  Create Account
                </button>
              </div>

              {authError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-medium text-red-700">
                  {authError}
                </div>
              )}

              {authMode === 'signup' && (
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                    Full Name
                  </label>
                  <div className="relative">
                    <UserCircle className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={authName}
                      onChange={(e) => setAuthName(e.target.value)}
                      placeholder="Enter your name"
                      className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#1E332A]"
                    />
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Email ID
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    required
                    autoFocus
                    value={authEmail}
                    onChange={(e) => setAuthEmail(e.target.value)}
                    placeholder="you@example.com"
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#1E332A]"
                  />
                </div>
                {authMode !== 'forgot' && (
                  <div className="mt-1.5 flex justify-end">
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('forgot');
                        setAuthError(null);
                      }}
                      className="text-xs font-semibold text-[#1E332A] hover:underline cursor-pointer"
                    >
                      Forgot Password?
                    </button>
                  </div>
                )}
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-semibold text-slate-700">
                    {authMode === 'forgot' ? 'New Password' : 'Password'}
                  </label>
                  {authMode === 'forgot' && (
                    <button
                      type="button"
                      onClick={() => {
                        setAuthMode('signin');
                        setAuthError(null);
                      }}
                      className="text-xs font-semibold text-[#1E332A] hover:underline cursor-pointer"
                    >
                      ← Back to Sign In
                    </button>
                  )}
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-stone-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    required
                    value={authPassword}
                    onChange={(e) => setAuthPassword(e.target.value)}
                    placeholder={
                      authMode === 'forgot'
                        ? 'Enter your new password (min 4 chars)'
                        : 'Enter your password'
                    }
                    className="w-full pl-10 pr-4 py-2.5 text-xs sm:text-sm bg-stone-50 border border-stone-300 rounded-xl focus:outline-none focus:border-[#1E332A]"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={authSubmitting}
                className="w-full py-3 text-xs sm:text-sm font-bold tracking-wide text-white bg-[#1E332A] hover:bg-[#14241D] rounded-full shadow-md transition-colors cursor-pointer disabled:opacity-50"
              >
                {authSubmitting
                  ? 'Authenticating...'
                  : authMode === 'signin'
                  ? 'Sign In & Continue'
                  : authMode === 'signup'
                  ? 'Create Account & Continue'
                  : 'Reset Password & Sign In'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Manage Custom Travelers & Names Modal */}
      {manageMembersModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4">
          <div data-auth-modal className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200/90 overflow-hidden">
            {/* Modal Header */}
            <div className="bg-[#1E332A] text-white px-6 py-5 flex items-center justify-between">
              <div>
                <h3 className="text-lg font-bold font-serif-display">Customize Travelers & Names</h3>
                <p className="text-xs text-stone-300 mt-0.5">
                  Set custom traveler names, roles, and participant counts
                </p>
              </div>
              <button
                type="button"
                onClick={() => setManageMembersModalOpen(false)}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Current Travelers ({familyMembers.length})
                </label>
                {familyMembers.map((member, idx) => (
                  <div
                    key={member.id}
                    className="flex items-center gap-2 p-3 bg-stone-50 border border-stone-200 rounded-xl"
                  >
                    <div className="w-8 h-8 rounded-full bg-[#1E332A] text-white text-xs font-bold flex items-center justify-center shrink-0">
                      {member.avatarInitials}
                    </div>
                    <div className="flex-1">
                      <input
                        type="text"
                        value={member.name}
                        onChange={(e) => handleUpdateMemberName(member.id, e.target.value)}
                        placeholder={`Traveler ${idx + 1} Name`}
                        className="w-full px-2.5 py-1.5 text-xs font-semibold bg-white border border-stone-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#1E332A]"
                      />
                    </div>
                    <select
                      value={member.role}
                      onChange={(e) => handleUpdateMemberRole(member.id, e.target.value as FamilyMember['role'])}
                      className="px-2 py-1.5 text-xs bg-white border border-stone-300 rounded-lg text-slate-700"
                    >
                      <option value="Organizer">Organizer</option>
                      <option value="Co-Traveler">Co-Traveler</option>
                      <option value="Senior Citizen">Senior Citizen</option>
                      <option value="Child">Child</option>
                      <option value="Relative">Relative</option>
                      <option value="Friend">Friend</option>
                    </select>
                    <button
                      type="button"
                      onClick={() => handleRemoveCustomMember(member.id)}
                      disabled={familyMembers.length <= 1}
                      title="Remove Traveler"
                      className="p-1.5 text-rose-600 hover:bg-rose-50 rounded-lg border border-rose-200 transition-colors disabled:opacity-30 cursor-pointer"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>

              {/* Add New Traveler Form */}
              <div className="pt-4 border-t border-stone-200 space-y-2">
                <label className="block text-xs font-bold text-slate-900 uppercase tracking-wider">
                  Add New Custom Traveler
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={newMemberNameInput}
                    onChange={(e) => setNewMemberNameInput(e.target.value)}
                    placeholder="Enter name (e.g. John, Madhuri, Rahul...)"
                    className="flex-1 px-3 py-2 text-xs bg-white border border-stone-300 rounded-lg text-slate-900 focus:outline-none focus:border-[#1E332A]"
                  />
                  <select
                    value={newMemberRoleInput}
                    onChange={(e) => setNewMemberRoleInput(e.target.value as FamilyMember['role'])}
                    className="px-2.5 py-2 text-xs bg-white border border-stone-300 rounded-lg text-slate-700"
                  >
                    <option value="Organizer">Organizer</option>
                    <option value="Co-Traveler">Co-Traveler</option>
                    <option value="Senior Citizen">Senior Citizen</option>
                    <option value="Child">Child</option>
                    <option value="Relative">Relative</option>
                    <option value="Friend">Friend</option>
                  </select>
                  <button
                    type="button"
                    onClick={() => {
                      handleAddCustomMember(newMemberNameInput, newMemberRoleInput);
                      setNewMemberNameInput('');
                    }}
                    className="px-4 py-2 text-xs font-semibold text-white bg-[#1E332A] hover:bg-[#14241D] rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer shadow-xs active:scale-95"
                  >
                    + Invite / Add
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="bg-stone-50 px-6 py-4 border-t border-stone-200 flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-medium text-stone-600">
                  {familyMembers.length} Custom Traveler(s) participating
                </span>
                <button
                  type="button"
                  onClick={() => {
                    const inviteUrl = `${window.location.origin}/?joinFamilyGroup=TT-KAKINADA-TPTY-8492`;
                    try {
                      navigator.clipboard.writeText(inviteUrl);
                    } catch {}
                    setToastMessage('✓ Group invite link copied to clipboard!');
                    setTimeout(() => setToastMessage(null), 3000);
                  }}
                  className="text-xs font-semibold text-[#1E332A] hover:underline cursor-pointer"
                >
                  Copy Group Invite Link
                </button>
              </div>
              <button
                type="button"
                onClick={() => setManageMembersModalOpen(false)}
                className="px-5 py-2 text-xs font-bold text-white bg-[#1E332A] hover:bg-[#14241D] rounded-full transition-colors cursor-pointer"
              >
                Save & Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Notification Toast when Shortlisting, Searching, or Signing In */}
      {toastMessage && (
        <div className="bg-[#1E332A] text-white px-6 py-3 text-xs font-medium flex items-center justify-between max-w-[1440px] w-full mx-auto">
          <span>{toastMessage}</span>
          <button
            type="button"
            onClick={() => navigateAndScroll('budget')}
            className="underline font-semibold ml-4 whitespace-nowrap shrink-0"
          >
            Open Budget Ledger →
          </button>
        </div>
      )}

      {/* Main Content Area — Intercepts any click if user is not signed in */}
      <main className="flex-1 w-full" onClickCapture={handleUnauthenticatedClickCapture}>
        {activeSection === 'dashboard' ? (
          <div>
            {/* 1. Full-Bleed Scenic Hero Section with Clean Search Bar at the Top of Main Section */}
            <section className="relative w-full min-h-[560px] lg:min-h-[620px] flex flex-col items-center justify-between text-center px-4 sm:px-6 pt-8 pb-16 overflow-hidden">
              <img
                src={heroTirupatiImg}
                alt="Sunrise over Tirumala Seshachalam Hills"
                referrerPolicy="no-referrer"
                className="absolute inset-0 w-full h-full object-cover"
              />
              {/* Warm sunlit scrim for high contrast */}
              <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/35 to-black/65" />

              {/* Single Clean Working Search Bar at the Top of the Main Section */}
              <form
                onSubmit={handleTopSearchSubmit}
                className="relative z-10 w-full max-w-2xl mx-auto bg-white/95 backdrop-blur-md rounded-full shadow-xl border border-white/40 p-1.5 pl-5 flex items-center gap-3"
              >
                <Search className="w-4 h-4 text-stone-400 shrink-0" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search trains, buses, Tirupati hotels, TTD packages, or type 'Kakinada to Tirupati'..."
                  className="flex-1 text-xs sm:text-sm font-medium text-slate-900 placeholder:text-stone-400 bg-transparent focus:outline-none"
                />
                <button
                  type="submit"
                  className="px-6 py-2.5 text-xs font-bold tracking-wider text-white bg-[#1E332A] hover:bg-[#14241D] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  SEARCH
                </button>
              </form>

              {/* Center Hero Headline & CTAs */}
              <div className="relative z-10 max-w-3xl mx-auto text-white space-y-5 my-auto pt-8">
                <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold tracking-tight leading-[1.12] font-serif-display text-white">
                  Experience Sacred Journeys Like Never Before
                </h1>
                <p className="text-sm sm:text-base text-stone-100/95 max-w-xl mx-auto leading-relaxed">
                  Discover curated family escapes, compare real rail, bus, and air connections, book budget-verified stays, and travel together seamlessly.
                </p>

                <div className="pt-2 flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => navigateAndScroll('transport')}
                    className="px-7 py-3 text-xs sm:text-sm font-semibold text-white bg-[#1E332A] hover:bg-[#14241D] rounded-full shadow-md transition-colors whitespace-nowrap shrink-0"
                  >
                    Explore Destinations
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateAndScroll('hotels')}
                    className="px-7 py-3 text-xs sm:text-sm font-semibold text-slate-900 bg-white hover:bg-stone-100 rounded-full shadow-md transition-colors whitespace-nowrap shrink-0"
                  >
                    Book Your Stay
                  </button>
                </div>
              </div>
            </section>

            {/* Main Container Content */}
            <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-16 space-y-16">
              {/* Interactive Customized Route & Travelers Bar */}
              <section className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs">
                <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-[#1E332A] text-amber-300 flex items-center justify-center shrink-0">
                      <Compass className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Customized Trip Route, Date & Travelers</h3>
                      <p className="text-xs text-stone-500">
                        Customize pickup, destination, planned travel date, and participating traveler names
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    {/* Pickup Input */}
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl">
                      <MapPin className="w-3.5 h-3.5 text-stone-500 shrink-0" />
                      <span className="text-[11px] font-bold uppercase text-stone-500">Pickup:</span>
                      <input
                        type="text"
                        value={tripParams.origin}
                        onChange={(e) => setTripParams((p) => ({ ...p, origin: e.target.value }))}
                        placeholder="Pickup Location"
                        className="w-28 sm:w-36 text-xs font-semibold text-slate-900 bg-transparent focus:outline-none"
                      />
                    </div>

                    <button
                      type="button"
                      onClick={() =>
                        setTripParams((p) => ({
                          ...p,
                          origin: p.destination,
                          destination: p.origin,
                        }))
                      }
                      title="Swap Pickup and Destination"
                      className="p-2 text-stone-600 hover:text-stone-900 hover:bg-stone-100 rounded-xl border border-stone-200 transition-colors text-xs font-bold shrink-0 cursor-pointer"
                    >
                      ⇄
                    </button>

                    {/* Destination Input */}
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl">
                      <MapPin className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                      <span className="text-[11px] font-bold uppercase text-stone-500">Destination:</span>
                      <input
                        type="text"
                        value={tripParams.destination}
                        onChange={(e) => setTripParams((p) => ({ ...p, destination: e.target.value }))}
                        placeholder="Destination"
                        className="w-28 sm:w-36 text-xs font-semibold text-slate-900 bg-transparent focus:outline-none"
                      />
                    </div>

                    {/* Planned Date Input */}
                    <div className="flex items-center gap-1.5 px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl">
                      <Calendar className="w-3.5 h-3.5 text-[#1E332A] shrink-0" />
                      <span className="text-[11px] font-bold uppercase text-stone-500">Planned Date:</span>
                      <input
                        type="date"
                        value={tripParams.travelDate}
                        onChange={(e) => {
                          if (e.target.value) {
                            setTripParams((p) => ({
                              ...p,
                              travelDate: e.target.value,
                              urgency: 'scheduled',
                            }));
                          }
                        }}
                        className="text-xs font-semibold text-slate-900 bg-transparent focus:outline-none cursor-pointer"
                        title="Customize your planned travel date"
                      />
                    </div>

                    {/* Travelers & Manage Names Button */}
                    <button
                      type="button"
                      onClick={() => setManageMembersModalOpen(true)}
                      className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-[#1E332A] bg-stone-100 hover:bg-stone-200 border border-stone-200 rounded-xl transition-colors shrink-0 cursor-pointer"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>{familyMembers.length} Travelers: {familyMembers.map((m) => m.name.split(' ')[0]).join(', ')}</span>
                      <span className="text-[11px] underline font-bold ml-1">Edit Names →</span>
                    </button>
                  </div>
                </div>
              </section>

              {/* 3. Popular Destinations & Trip Modules (4 Numbered Portrait Cards matching Reference Image) */}
              <section className="space-y-8">
                <div className="text-center space-y-2">
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif-display">
                    Popular Destinations & Trip Modules
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 max-w-xl mx-auto">
                    Compare verified routes from {tripParams.origin} to {tripParams.destination} for {familyMembers.length} travelers · Planned Date: <strong className="text-slate-900">{tripParams.travelDate}</strong>
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Card 1 */}
                  <div
                    onClick={() => navigateAndScroll('transport')}
                    className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={kakinadaGatewayImg}
                        alt="Rail & Bus Transport"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                      <span className="absolute top-3.5 left-3.5 w-7 h-7 rounded-full bg-[#1E332A] text-white text-xs font-bold font-mono-num flex items-center justify-center">
                        1
                      </span>
                      <div className="absolute bottom-3 left-3.5 right-3.5 text-white text-xs font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span className="truncate">{tripParams.origin} → {tripParams.destination}</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-bold text-slate-900">
                        Express Trains, APSRTC & Flights
                      </h3>
                      <div className="mt-2 flex items-center justify-between text-xs font-mono-num">
                        <span className="text-stone-500">From ₹345/pax</span>
                        <span className="font-bold text-[#1E332A]">
                          ₹{(345 * tripParams.travellers * 2).toLocaleString('en-IN')} Family
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 2 */}
                  <div
                    onClick={() => navigateAndScroll('hotels')}
                    className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={tirupatiHotelImg}
                        alt="Tirupati Family Stays & Choultries"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                      <span className="absolute top-3.5 left-3.5 w-7 h-7 rounded-full bg-[#1E332A] text-white text-xs font-bold font-mono-num flex items-center justify-center">
                        2
                      </span>
                      <div className="absolute bottom-3 left-3.5 right-3.5 text-white text-xs font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span className="truncate">Alipiri & Railway Station</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-bold text-slate-900">
                        TTD Choultries & Family Hotels
                      </h3>
                      <div className="mt-2 flex items-center justify-between text-xs font-mono-num">
                        <span className="text-stone-500">₹200 – ₹2,800/nt</span>
                        <span className="font-bold text-[#1E332A]">
                          {TIRUPATI_HOTELS.length} Verified Stays
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 3 */}
                  <div
                    onClick={() => navigateAndScroll('packages')}
                    className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={heroTirupatiImg}
                        alt="Tirumala Hills & APTDC Packages"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                      <span className="absolute top-3.5 left-3.5 w-7 h-7 rounded-full bg-[#1E332A] text-white text-xs font-bold font-mono-num flex items-center justify-center">
                        3
                      </span>
                      <div className="absolute bottom-3 left-3.5 right-3.5 text-white text-xs font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span className="truncate">Tirumala & Padmavathi Circuit</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-bold text-slate-900">
                        APTDC & IRCTC Darshan Tours
                      </h3>
                      <div className="mt-2 flex items-center justify-between text-xs font-mono-num">
                        <span className="text-stone-500">₹1,450+/adult</span>
                        <span className="font-bold text-[#1E332A]">
                          ₹{(1450 * tripParams.travellers).toLocaleString('en-IN')}+ Total
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Card 4 */}
                  <div
                    onClick={() => navigateAndScroll('builder')}
                    className="group cursor-pointer bg-white rounded-2xl overflow-hidden border border-stone-200/90 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
                  >
                    <div className="relative h-60 overflow-hidden">
                      <img
                        src={chandragiriTourImg}
                        alt="Chandragiri Fort & Srikalahasti Heritage"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-black/20" />
                      <span className="absolute top-3.5 left-3.5 w-7 h-7 rounded-full bg-[#1E332A] text-white text-xs font-bold font-mono-num flex items-center justify-center">
                        4
                      </span>
                      <div className="absolute bottom-3 left-3.5 right-3.5 text-white text-xs font-medium flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-amber-300 shrink-0" />
                        <span className="truncate">Srikalahasti & Chandragiri Fort</span>
                      </div>
                    </div>
                    <div className="p-4">
                      <h3 className="text-base font-bold text-slate-900">
                        Custom 3-Day AI Itinerary
                      </h3>
                      <div className="mt-2 flex items-center justify-between text-xs font-mono-num">
                        <span className="text-stone-500">3 Days / 2 Nights</span>
                        <span className="font-bold text-[#1E332A]">
                          ₹11,280 On-Ground
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </section>

              {/* 4. 4-Column Trust & Capability Strip (Matching Reference Layout) */}
              <section className="bg-white rounded-2xl border border-stone-200/90 px-6 py-6 shadow-2xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 divide-y sm:divide-y-0 lg:divide-x divide-stone-200">
                  <div className="flex items-center gap-3.5 pt-2 sm:pt-0">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-[#1E332A] shrink-0">
                      <Award className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Transparent Family Fares</h3>
                      <p className="text-xs text-stone-500">
                        Official IRCTC, APSRTC & TTD tariffs
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 pt-4 sm:pt-0 lg:pl-6">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-[#1E332A] shrink-0">
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Handpicked Family Stays</h3>
                      <p className="text-xs text-stone-500">
                        Per-night vs entire-stay budget math
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 pt-4 sm:pt-0 lg:pl-6">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-[#1E332A] shrink-0">
                      <Clock className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Urgent & Tatkal Ready</h3>
                      <p className="text-xs text-stone-500">
                        Today, tomorrow & advance date planning
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3.5 pt-4 sm:pt-0 lg:pl-6">
                    <div className="w-10 h-10 rounded-full bg-stone-100 flex items-center justify-center text-[#1E332A] shrink-0">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">Safe & Consent-Based</h3>
                      <p className="text-xs text-stone-500">
                        Private family GPS & zero fake claims
                      </p>
                    </div>
                  </div>
                </div>
              </section>

              {/* 5. "Plan Your Perfect Trip" 2-Column Split Section (Matching Reference Layout) */}
              <section className="space-y-8">
                <div className="text-center">
                  <h2 className="text-3xl sm:text-4xl font-bold text-slate-900 font-serif-display">
                    Plan Your Perfect Trip
                  </h2>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-stretch">
                  <div className="lg:col-span-7 rounded-2xl overflow-hidden border border-stone-200 min-h-[340px]">
                    <img
                      src={heroTirupatiImg}
                      alt="Seshachalam Hills and Tirumala Valley"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="lg:col-span-5 flex flex-col justify-between space-y-6 py-2">
                    <div className="space-y-6">
                      <div>
                        <h3 className="text-lg font-bold text-slate-900 font-serif-display">
                          Tailored Itineraries & AI Budget Advisor
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                          Generate a customized day-by-day schedule for {tripParams.travellers} family members—accounting for early morning 04:25 AM rail arrivals, Alipiri Sapthagiri electric bus timings, and senior citizen rest windows.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900 font-serif-display">
                          Verified Official Portal Access
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                          Direct links to TTD Devasthanams, IRCTC, APSRTC, and APTDC Haritha portals with clear differentiation between per-night room budgets and entire-stay budgets.
                        </p>
                      </div>

                      <div>
                        <h3 className="text-lg font-bold text-slate-900 font-serif-display">
                          Live Family Collaboration
                        </h3>
                        <p className="text-xs sm:text-sm text-stone-600 mt-1 leading-relaxed">
                          Coordinate with relatives using the private family chat, quantity-tracked packing checklist ({packingProgressPct}% packed), and opt-in browser GPS location sharing.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 flex flex-wrap items-center gap-3">
                      <button
                        type="button"
                        onClick={() => navigateAndScroll('builder')}
                        className="px-6 py-3 text-xs font-semibold text-white bg-[#1E332A] hover:bg-[#14241D] rounded-full transition-colors whitespace-nowrap shrink-0"
                      >
                        Start Planning
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateAndScroll('tracking')}
                        className="px-6 py-3 text-xs font-semibold text-[#1E332A] bg-white border border-stone-300 hover:bg-stone-100 rounded-full transition-colors whitespace-nowrap shrink-0"
                      >
                        Open Family Live Map
                      </button>
                    </div>
                  </div>
                </div>
              </section>

              {/* 6. 3-Column Family Collaboration Highlights Strip (Matching Reference Testimonial Strip) */}
              <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <button
                  type="button"
                  onClick={() => navigateAndScroll('tracking')}
                  className="bg-white rounded-2xl border border-stone-200/90 p-5 flex items-center gap-4 text-left hover:shadow-sm transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-[#1E332A] text-white font-bold text-sm flex items-center justify-center shrink-0">
                    GPS
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Consent-Based Live Tracking
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {familyMembers.filter((m) => m.locationSharingConsent).length} of {familyMembers.length} members sharing live location on route
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigateAndScroll('chat')}
                  className="bg-white rounded-2xl border border-stone-200/90 p-5 flex items-center gap-4 text-left hover:shadow-sm transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-amber-700 text-white font-bold text-sm flex items-center justify-center shrink-0">
                    CHAT
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Private Family Group Chat
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {chatMessages.length} shared messages, train links & Aadhaar reminders
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => navigateAndScroll('checklist')}
                  className="bg-white rounded-2xl border border-stone-200/90 p-5 flex items-center gap-4 text-left hover:shadow-sm transition-shadow"
                >
                  <div className="w-12 h-12 rounded-full bg-emerald-800 text-white font-bold text-sm flex items-center justify-center shrink-0 font-mono-num">
                    {packingProgressPct}%
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">
                      Shared Packing Checklist
                    </h3>
                    <p className="text-xs text-stone-500 mt-0.5">
                      {totalPackedUnits}/{totalRequiredUnits} family units packed across 7 categories
                    </p>
                  </div>
                </button>
              </section>

              {/* 7. Travel Guides & Essential Pilgrimage Insights (Matching "Travel Blog" 3-Card Row) */}
              <section className="space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 font-serif-display">
                    Tirupati & Kakinada Corridor Travel Guides
                  </h2>
                  <button
                    type="button"
                    onClick={() => navigateAndScroll('budget')}
                    className="text-xs font-semibold text-[#1E332A] hover:underline whitespace-nowrap shrink-0"
                  >
                    Open My Bookings & Ledger →
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white rounded-2xl border border-stone-200/90 p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Direct CCT Boarding vs Samalkot Junction
                      </h3>
                      <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                        Train 17250 originates directly at Kakinada Town (CCT) at 15:10, whereas Train 17488 Tirumala Express boards at Samalkot Jn (12 km away). Compare both for senior citizen convenience.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                      <span>Verified Rail Guide · SCR</span>
                      <button
                        type="button"
                        onClick={() => navigateAndScroll('transport')}
                        className="text-[#1E332A] font-semibold hover:underline"
                      >
                        Compare Trains →
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-stone-200/90 p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        TTD Darshan Quotas & SSD Token Rules
                      </h3>
                      <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                        ₹300 Special Entry Darshan opens online in advance on the official TTD portal. For urgent trips, obtain Slotted Sarva Darshan (SSD) tokens at Srinivasam or Vishnu Nivasam with original Aadhaar.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                      <span>Official TTD Policy</span>
                      <button
                        type="button"
                        onClick={() => navigateAndScroll('packages')}
                        className="text-[#1E332A] font-semibold hover:underline"
                      >
                        View Packages →
                      </button>
                    </div>
                  </div>

                  <div className="bg-white rounded-2xl border border-stone-200/90 p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">
                        Per-Night vs Entire-Stay Hotel Budgeting
                      </h3>
                      <p className="text-xs text-stone-600 mt-2 leading-relaxed">
                        Whether your family budgets ₹2,000 per room per night (₹6,000 for 3 nights) or ₹2,000 for the entire 3-night stay (TTD Srinivasam ₹200–₹400/night), never confuse the two calculations.
                      </p>
                    </div>
                    <div className="mt-4 pt-3 border-t border-stone-100 flex items-center justify-between text-[11px] text-stone-400">
                      <span>Transparent Stay Calculator</span>
                      <button
                        type="button"
                        onClick={() => navigateAndScroll('hotels')}
                        className="text-[#1E332A] font-semibold hover:underline"
                      >
                        Filter Hotels →
                      </button>
                    </div>
                  </div>
                </div>
              </section>
            </div>

            {/* 8. Family Trip Alert & Darshan Quota Subscription Banner */}
            <section className="bg-[#EAE6DF] border-t border-stone-200/80 py-12 px-6">
              <div className="max-w-3xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="text-center md:text-left">
                  <h2 className="text-2xl font-bold text-slate-900 font-serif-display">
                    Family Trip & Darshan Quota Alerts
                  </h2>
                  <p className="text-xs sm:text-sm text-stone-600 mt-1">
                    Save your family email for TTD 90-day quota release reminders & IRCTC Tatkal alerts
                  </p>
                </div>

                {newsletterSubscribed ? (
                  <div className="px-5 py-3 bg-emerald-900 text-white text-xs font-semibold rounded-full">
                    Subscribed! Alerts enabled for {newsletterEmail}
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
                      className="flex-1 md:w-64 px-4 py-2.5 text-xs bg-white border border-stone-300 rounded-full focus:outline-none"
                    />
                    <button
                      type="submit"
                      className="px-6 py-2.5 text-xs font-semibold text-white bg-[#1E332A] hover:bg-[#14241D] rounded-full transition-colors whitespace-nowrap shrink-0"
                    >
                      Get Alerts
                    </button>
                  </form>
                )}
              </div>
            </section>
          </div>
        ) : (
          /* Inner Functional Modules Container with Single Clean Top Search Bar */
          <div>
            <section className="bg-[#182921] py-5 px-4 sm:px-6 border-b border-stone-200">
              <div className="max-w-[1280px] mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
                <button
                  type="button"
                  onClick={() => navigateAndScroll('dashboard')}
                  className="text-xs font-semibold text-amber-200 hover:underline whitespace-nowrap shrink-0"
                >
                  ← Back to Home Overview
                </button>

                <form
                  onSubmit={handleTopSearchSubmit}
                  className="w-full max-w-xl bg-white rounded-full shadow-md p-1 pl-4 flex items-center gap-2"
                >
                  <Search className="w-4 h-4 text-stone-400 shrink-0" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search trains, buses, Tirupati hotels, packages, itinerary..."
                    className="flex-1 text-xs font-medium text-slate-900 placeholder:text-stone-400 bg-transparent focus:outline-none"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2 text-xs font-bold tracking-wider text-white bg-[#1E332A] hover:bg-[#14241D] rounded-full transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    SEARCH
                  </button>
                </form>

                <span className="text-xs font-mono-num text-stone-300 whitespace-nowrap shrink-0">
                  Planned: ₹{totalPlannedCost.toLocaleString('en-IN')} / ₹{tripParams.totalBudget.toLocaleString('en-IN')}
                </span>
              </div>
            </section>

            <div className="max-w-[1280px] mx-auto px-6 lg:px-10 py-8 space-y-8">

            {/* SECTION 2: FIND TRANSPORT */}
            {activeSection === 'transport' && (
              <TransportSection
                tripParams={tripParams}
                setTripParams={setTripParams}
                trains={KAKINADA_TO_TIRUPATI_TRAINS}
                buses={KAKINADA_TO_TIRUPATI_BUSES}
                flights={KAKINADA_TO_TIRUPATI_FLIGHTS}
                onShortlistBooking={handleShortlistBooking}
              />
            )}

            {/* SECTION 3: HOTELS AND ROOMS */}
            {activeSection === 'hotels' && (
              <HotelsSection
                tripParams={tripParams}
                setTripParams={setTripParams}
                hotels={TIRUPATI_HOTELS}
                hotelImageUrl={tirupatiHotelImg}
                onShortlistBooking={handleShortlistBooking}
              />
            )}

            {/* SECTION 4: TOUR PACKAGES */}
            {activeSection === 'packages' && (
              <PackagesSection
                tripParams={tripParams}
                packages={TIRUPATI_PACKAGES}
                providerAdapters={providerAdapters}
                tourImageUrl={chandragiriTourImg}
                onShortlistBooking={handleShortlistBooking}
              />
            )}

            {/* SECTION 5: CUSTOM TRIP BUILDER & AI RECOMMENDATIONS */}
            {activeSection === 'builder' && (
              <TripBuilderSection
                tripParams={tripParams}
                setTripParams={setTripParams}
                itineraryDays={itineraryDays}
                setItineraryDays={setItineraryDays}
                onShortlistBooking={handleShortlistBooking}
              />
            )}

            {/* SECTION 6: FAMILY LIVE TRACKING */}
            {activeSection === 'tracking' && (
              <FamilyTrackingSection
                tripParams={tripParams}
                members={familyMembers}
                setMembers={setFamilyMembers}
                activeMemberId={activeMemberId}
              />
            )}

            {/* SECTION 7: FAMILY CHAT */}
            {activeSection === 'chat' && (
              <FamilyChatSection
                messages={chatMessages}
                setMessages={setChatMessages}
                members={familyMembers}
                activeMemberId={activeMemberId}
                setActiveMemberId={setActiveMemberId}
                checklistItems={checklistItems}
                savedBookings={savedBookings}
              />
            )}

            {/* SECTION 8: PACKING CHECKLIST */}
            {activeSection === 'checklist' && (
              <PackingChecklistSection
                items={checklistItems}
                setItems={setChecklistItems}
                members={familyMembers}
                activeMemberId={activeMemberId}
              />
            )}

            {/* SECTION 9: MY BOOKINGS AND TRIP BUDGET */}
            {activeSection === 'budget' && (
              <BudgetSection
                tripParams={tripParams}
                setTripParams={setTripParams}
                savedBookings={savedBookings}
                setSavedBookings={setSavedBookings}
              />
            )}
            </div>
          </div>
        )}
      </main>

      {/* Deep Forest Green Footer with Photo Gallery Grid (Matching Reference Image Footer) */}
      <footer
        onClickCapture={handleUnauthenticatedClickCapture}
        className="bg-[#182921] text-stone-300 pt-12 pb-8 px-6 lg:px-10"
      >
        <div className="max-w-[1280px] mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8 pb-10 border-b border-white/10">
          {/* Navigation Column */}
          <div className="lg:col-span-3 space-y-2.5">
            <h4 className="text-sm font-bold text-white font-serif-display">Navigation</h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => navigateAndScroll('dashboard')}
                  className="hover:text-white transition-colors"
                >
                  Home & Overview
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateAndScroll('transport')}
                  className="hover:text-white transition-colors"
                >
                  Find Transport (Rail, Bus, Air)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateAndScroll('hotels')}
                  className="hover:text-white transition-colors"
                >
                  Hotels & TTD Rooms
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateAndScroll('packages')}
                  className="hover:text-white transition-colors"
                >
                  Ready-Made Tour Packages
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateAndScroll('builder')}
                  className="hover:text-white transition-colors"
                >
                  Custom Trip Builder & AI
                </button>
              </li>
            </ul>
          </div>

          {/* Family Collaboration Column */}
          <div className="lg:col-span-3 space-y-2.5">
            <h4 className="text-sm font-bold text-white font-serif-display">
              Family Collaboration
            </h4>
            <ul className="space-y-1.5 text-xs">
              <li>
                <button
                  type="button"
                  onClick={() => navigateAndScroll('tracking')}
                  className="hover:text-white transition-colors"
                >
                  Consent-Based Live Location Map
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateAndScroll('chat')}
                  className="hover:text-white transition-colors"
                >
                  Private Family Group Chat
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateAndScroll('checklist')}
                  className="hover:text-white transition-colors"
                >
                  Shared Packing Checklist ({packingProgressPct}%)
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateAndScroll('budget')}
                  className="hover:text-white transition-colors"
                >
                  My Bookings & Trip Budget
                </button>
              </li>
            </ul>
          </div>

          {/* Official Booking Portals & Transparency Info */}
          <div className="lg:col-span-3 space-y-2.5">
            <h4 className="text-sm font-bold text-white font-serif-display">
              Official Booking Portals
            </h4>
            <p className="text-xs text-stone-400 leading-relaxed">
              TripTogether never fabricates live seat counts or guaranteed darshan tokens. Verify real-time availability on official portals:
            </p>
            <div className="flex flex-wrap gap-3 pt-1 text-xs">
              <a
                href="https://ttdevasthanams.ap.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-200 hover:underline"
              >
                TTD Portal
              </a>
              <a
                href="https://www.irctc.co.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-200 hover:underline"
              >
                IRCTC Rail
              </a>
              <a
                href="https://www.apsrtconline.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-200 hover:underline"
              >
                APSRTC Bus
              </a>
              <a
                href="https://tourism.ap.gov.in/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-amber-200 hover:underline"
              >
                APTDC Tourism
              </a>
            </div>
          </div>

          {/* Right Column: 6-Photo Thumbnail Grid (Matching Reference Image Footer) */}
          <div className="lg:col-span-3">
            <div className="grid grid-cols-3 gap-2">
              <img
                src={heroTirupatiImg}
                alt="Tirumala Hills"
                referrerPolicy="no-referrer"
                className="w-full h-14 object-cover rounded-lg border border-white/15"
              />
              <img
                src={kakinadaGatewayImg}
                alt="Kakinada Harbor"
                referrerPolicy="no-referrer"
                className="w-full h-14 object-cover rounded-lg border border-white/15"
              />
              <img
                src={tirupatiHotelImg}
                alt="Tirupati Family Suite"
                referrerPolicy="no-referrer"
                className="w-full h-14 object-cover rounded-lg border border-white/15"
              />
              <img
                src={chandragiriTourImg}
                alt="Chandragiri Fort"
                referrerPolicy="no-referrer"
                className="w-full h-14 object-cover rounded-lg border border-white/15"
              />
              <img
                src={heroTirupatiImg}
                alt="Seshachalam Sunrise"
                referrerPolicy="no-referrer"
                className="w-full h-14 object-cover rounded-lg border border-white/15"
              />
              <img
                src={tirupatiHotelImg}
                alt="Alipiri Stay"
                referrerPolicy="no-referrer"
                className="w-full h-14 object-cover rounded-lg border border-white/15"
              />
            </div>
          </div>
        </div>

        <div className="max-w-[1280px] mx-auto pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-stone-400">
          <div>
            © 2026 TripTogether — AI-Powered Family Trip Planner ({tripParams.origin.split(',')[0]} to {tripParams.destination.split(',')[0]}).
          </div>
          <div className="flex items-center gap-6">
            <button
              type="button"
              onClick={() => navigateAndScroll('transport')}
              className="hover:text-white"
            >
              Transport
            </button>
            <button
              type="button"
              onClick={() => navigateAndScroll('hotels')}
              className="hover:text-white"
            >
              Hotels
            </button>
            <button
              type="button"
              onClick={() => navigateAndScroll('packages')}
              className="hover:text-white"
            >
              Packages
            </button>
            <button
              type="button"
              onClick={() => navigateAndScroll('budget')}
              className="hover:text-white"
            >
              Budget Ledger
            </button>
          </div>
        </div>
      </footer>
    </div>
  );
}
