import React, { useState, useEffect } from 'react';
import {
  ShieldAlert,
  Users,
  Compass,
  Package,
  Award,
  Wallet,
  CheckCircle2,
  XCircle,
  Clock,
  Eye,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  Filter,
  FileText,
  AlertCircle,
  Check,
  ChevronDown,
} from 'lucide-react';
import type {
  AdminOverviewStats,
  DestinationItem,
  PackageItem,
  LocalGuideItem,
  BookingRecordItem,
  GuideEnquiryItem,
  ContactTicketItem,
  PlatformReviewItem,
} from '../types';

interface AdminDashboardSectionProps {
  onBackToPlatform: () => void;
}

export const AdminDashboardSection: React.FC<AdminDashboardSectionProps> = ({
  onBackToPlatform,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'verifications' | 'destinations' | 'packages' | 'bookings' | 'enquiries' | 'reviews' | 'logs'
  >('overview');

  const [stats, setStats] = useState<AdminOverviewStats | null>(null);
  const [guides, setGuides] = useState<LocalGuideItem[]>([]);
  const [destinations, setDestinations] = useState<DestinationItem[]>([]);
  const [packages, setPackages] = useState<PackageItem[]>([]);
  const [bookings, setBookings] = useState<BookingRecordItem[]>([]);
  const [enquiries, setEnquiries] = useState<GuideEnquiryItem[]>([]);
  const [tickets, setTickets] = useState<ContactTicketItem[]>([]);
  const [reviews, setReviews] = useState<PlatformReviewItem[]>([]);
  const [logs, setLogs] = useState<{ id: string; action: string; actor: string; timestamp: string }[]>([]);

  const [loading, setLoading] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  // New Destination Form
  const [showAddDestModal, setShowAddDestModal] = useState<boolean>(false);
  const [newDestName, setNewDestName] = useState('');
  const [newDestState, setNewDestState] = useState('');
  const [newDestCategory, setNewDestCategory] = useState<'Pilgrimage' | 'Hill Station' | 'Coastal & Beach' | 'Heritage & Culture' | 'Nature & Wildlife' | 'Adventure'>('Hill Station');
  const [newDestBudget, setNewDestBudget] = useState('₹1,500 – ₹4,000');
  const [newDestBestSeason, setNewDestBestSeason] = useState('Oct – Mar');
  const [newDestImage, setNewDestImage] = useState('https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1200&q=80');
  const [newDestDesc, setNewDestDesc] = useState('');

  // New Package Form
  const [showAddPkgModal, setShowAddPkgModal] = useState<boolean>(false);
  const [newPkgTitle, setNewPkgTitle] = useState('');
  const [newPkgDest, setNewPkgDest] = useState('');
  const [newPkgDuration, setNewPkgDuration] = useState('3 Days / 2 Nights');
  const [newPkgPrice, setNewPkgPrice] = useState<number>(5500);
  const [newPkgCategory, setNewPkgCategory] = useState('Pilgrimage');
  const [newPkgImage, setNewPkgImage] = useState('https://images.unsplash.com/photo-1582510003544-4d00b7f74220?auto=format&fit=crop&w=800&q=80');
  const [newPkgHighlights, setNewPkgHighlights] = useState('Comfort Family Stay, Guided Darshan, AC Transfers');

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      // 1. Stats
      try {
        const resStats = await fetch('/api/admin/overview');
        if (resStats.ok) setStats(await resStats.json());
      } catch {}

      // 2. Guides
      try {
        const resGuides = await fetch('/api/guides');
        if (resGuides.ok) {
          const d = await resGuides.json();
          setGuides(d.guides || []);
        }
      } catch {}

      // 3. Destinations
      try {
        const resDest = await fetch('/api/destinations');
        if (resDest.ok) {
          const d = await resDest.json();
          setDestinations(d.destinations || []);
        }
      } catch {}

      // 4. Packages
      try {
        const resPkg = await fetch('/api/packages');
        if (resPkg.ok) {
          const d = await resPkg.json();
          setPackages(d.packages || []);
        }
      } catch {}

      // 5. Bookings
      try {
        const resBk = await fetch('/api/bookings');
        if (resBk.ok) {
          const d = await resBk.json();
          setBookings(d.bookings || []);
        }
      } catch {}

      // 6. Enquiries & Tickets
      try {
        const resEnq = await fetch('/api/admin/enquiries');
        if (resEnq.ok) {
          const d = await resEnq.json();
          setEnquiries(d.enquiries || []);
        }
      } catch {}

      try {
        const resTkt = await fetch('/api/admin/tickets');
        if (resTkt.ok) {
          const d = await resTkt.json();
          setTickets(d.tickets || []);
        }
      } catch {}

      // 7. Reviews
      try {
        const resRev = await fetch('/api/reviews');
        if (resRev.ok) {
          const d = await resRev.json();
          setReviews(d.reviews || []);
        }
      } catch {}

      // 8. Logs
      try {
        const resLogs = await fetch('/api/admin/logs');
        if (resLogs.ok) {
          const d = await resLogs.json();
          setLogs(d.logs || []);
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleVerifyGuide = async (guideId: string, status: 'verified' | 'rejected') => {
    try {
      const res = await fetch(`/api/admin/guides/${guideId}/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setGuides((prev) =>
          prev.map((g) => (g.id === guideId ? { ...g, verificationStatus: status } : g))
        );
        showToast(`✓ Guide status updated to ${status}`);
        fetchAdminData();
      }
    } catch {
      showToast('Error updating guide verification.');
    }
  };

  const handleUpdateBookingStatus = async (
    bookingId: string,
    status: 'confirmed' | 'pending' | 'cancelled'
  ) => {
    try {
      const res = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (res.ok) {
        setBookings((prev) =>
          prev.map((b) => (b.id === bookingId ? { ...b, status } : b))
        );
        showToast(`✓ Booking status updated to ${status}`);
        fetchAdminData();
      }
    } catch {
      showToast('Error updating booking status.');
    }
  };

  const handleDeleteDestination = async (destId: string, name: string) => {
    if (!window.confirm(`Delete destination "${name}"?`)) return;
    try {
      const res = await fetch(`/api/destinations/${destId}`, { method: 'DELETE' });
      if (res.ok) {
        setDestinations((prev) => prev.filter((d) => d.id !== destId));
        showToast(`✓ Removed destination "${name}"`);
      }
    } catch {
      showToast('Error deleting destination.');
    }
  };

  const handleCreateDestination = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDestName.trim() || !newDestState.trim()) return;

    try {
      const res = await fetch('/api/destinations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newDestName.trim(),
          fullName: `${newDestName.trim()}, ${newDestState.trim()}`,
          state: newDestState.trim(),
          country: 'India',
          category: newDestCategory,
          badge: 'Featured Destination',
          image: newDestImage.trim(),
          description: newDestDesc.trim() || `Explore the scenic beauty and cultural richness of ${newDestName}.`,
          popularAttractions: ['City Center', 'Heritage Landmark', 'Local Viewpoint'],
          bestSeason: newDestBestSeason,
          approxNightBudget: newDestBudget,
          published: true,
          featured: true,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        setDestinations((prev) => [d.destination, ...prev]);
        setShowAddDestModal(false);
        setNewDestName('');
        setNewDestState('');
        setNewDestDesc('');
        showToast('✓ Successfully added new destination!');
      }
    } catch {
      showToast('Error adding destination.');
    }
  };

  const handleDeletePackage = async (pkgId: string, title: string) => {
    if (!window.confirm(`Delete package "${title}"?`)) return;
    try {
      const res = await fetch(`/api/packages/${pkgId}`, { method: 'DELETE' });
      if (res.ok) {
        setPackages((prev) => prev.filter((p) => p.id !== pkgId));
        showToast(`✓ Removed package "${title}"`);
      }
    } catch {
      showToast('Error deleting package.');
    }
  };

  const handleCreatePackage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPkgTitle.trim() || !newPkgDest.trim()) return;

    try {
      const res = await fetch('/api/packages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: newPkgTitle.trim(),
          destination: newPkgDest.trim(),
          destinationId: `dest-${newPkgDest.toLowerCase().replace(/\s+/g, '-')}`,
          duration: newPkgDuration,
          days: 3,
          nights: 2,
          pricePerPerson: Number(newPkgPrice) || 4500,
          category: newPkgCategory,
          coverImage: newPkgImage.trim(),
          highlights: newPkgHighlights.split(',').map((h) => h.trim()),
          inclusions: ['Sanitized Hotel Stay', 'Breakfast', 'Sightseeing Transfers', 'Tour Facilitator'],
          exclusions: ['Train / Flight Tickets', 'Personal shopping'],
          dayByDayItinerary: [
            { day: 1, title: 'Arrival & Check-in', desc: 'Pick up and check in at hotel with evening orientation.' },
            { day: 2, title: 'Full Day Sightseeing', desc: 'Guided exploration of primary attractions.' },
            { day: 3, title: 'Farewell & Departure', desc: 'Morning leisure and departure transit.' },
          ],
          providerName: 'Trip Together Verified Partner',
          cancellationPolicy: 'Free cancellation up to 48 hours prior to start.',
          published: true,
          featured: true,
        }),
      });

      if (res.ok) {
        const d = await res.json();
        setPackages((prev) => [d.package, ...prev]);
        setShowAddPkgModal(false);
        setNewPkgTitle('');
        setNewPkgDest('');
        showToast('✓ Successfully added tour package!');
      }
    } catch {
      showToast('Error adding tour package.');
    }
  };

  const pendingGuides = guides.filter((g) => g.verificationStatus === 'pending');

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#0F1E36] text-white text-xs font-semibold rounded-2xl shadow-xl border border-teal-500/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Admin Top Header Banner */}
      <div className="bg-gradient-to-r from-[#0F1E36] via-[#1E3A8A] to-[#0D9488] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-white/15 flex items-center justify-center text-teal-300 font-bold border border-white/20">
              <ShieldAlert className="w-8 h-8" />
            </div>
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-red-500/20 text-red-200 text-xs font-bold border border-red-400/30 mb-1">
                <span>Secure Administrative Console</span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-bold font-serif-display">Platform Operations & Control</h1>
              <p className="text-xs text-stone-200 mt-0.5">
                Manage live destinations, packages, guide verification reviews, bookings, and customer tickets.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={fetchAdminData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh Records</span>
            </button>
            <button
              type="button"
              onClick={onBackToPlatform}
              className="px-4 py-2 rounded-xl bg-white text-slate-900 text-xs font-bold hover:bg-stone-100 transition-colors cursor-pointer shadow-sm"
            >
              ← Back to Website
            </button>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200">
        <button
          type="button"
          onClick={() => setActiveTab('overview')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'overview' ? 'bg-[#0F1E36] text-white shadow-sm' : 'text-slate-600 hover:bg-stone-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Platform Overview</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('verifications')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'verifications' ? 'bg-[#0F1E36] text-white shadow-sm' : 'text-slate-600 hover:bg-stone-100'
          }`}
        >
          <Award className="w-4 h-4" />
          <span>Guide Verifications ({pendingGuides.length} Pending)</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('destinations')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'destinations' ? 'bg-[#0F1E36] text-white shadow-sm' : 'text-slate-600 hover:bg-stone-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>Destinations ({destinations.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('packages')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'packages' ? 'bg-[#0F1E36] text-white shadow-sm' : 'text-slate-600 hover:bg-stone-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Packages ({packages.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'bookings' ? 'bg-[#0F1E36] text-white shadow-sm' : 'text-slate-600 hover:bg-stone-100'
          }`}
        >
          <Wallet className="w-4 h-4" />
          <span>Bookings ({bookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('enquiries')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'enquiries' ? 'bg-[#0F1E36] text-white shadow-sm' : 'text-slate-600 hover:bg-stone-100'
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Tickets & Enquiries</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('logs')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'logs' ? 'bg-[#0F1E36] text-white shadow-sm' : 'text-slate-600 hover:bg-stone-100'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>Audit Logs ({logs.length})</span>
        </button>
      </div>

      {/* Tab: Overview */}
      {activeTab === 'overview' && stats && (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-1">
              <span className="text-xs text-stone-500 font-semibold uppercase">Total Users</span>
              <div className="text-2xl font-bold text-slate-900 font-mono-num">{stats.totalUsers}</div>
              <span className="text-[11px] text-teal-700">Registered Accounts</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-1">
              <span className="text-xs text-stone-500 font-semibold uppercase">Destinations</span>
              <div className="text-2xl font-bold text-slate-900 font-mono-num">{stats.totalDestinations}</div>
              <span className="text-[11px] text-teal-700">Published Circuits</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-1">
              <span className="text-xs text-stone-500 font-semibold uppercase">Tour Packages</span>
              <div className="text-2xl font-bold text-slate-900 font-mono-num">{stats.totalPackages}</div>
              <span className="text-[11px] text-teal-700">Active Offerings</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-1">
              <span className="text-xs text-stone-500 font-semibold uppercase">Local Guides</span>
              <div className="text-2xl font-bold text-slate-900 font-mono-num">{stats.totalGuides}</div>
              <span className="text-[11px] text-emerald-700 font-semibold">
                {stats.verifiedGuides} Verified · {stats.pendingGuideVerifications} Pending
              </span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-1">
              <span className="text-xs text-stone-500 font-semibold uppercase">Total Bookings</span>
              <div className="text-2xl font-bold text-slate-900 font-mono-num">{stats.totalBookings}</div>
              <span className="text-[11px] text-blue-700">{stats.activeBookings} Confirmed</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-1">
              <span className="text-xs text-stone-500 font-semibold uppercase">Total Revenue</span>
              <div className="text-2xl font-bold text-slate-900 font-mono-num">
                ₹{stats.totalRevenue.toLocaleString('en-IN')}
              </div>
              <span className="text-[11px] text-emerald-700">Confirmed Tariffs</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-1">
              <span className="text-xs text-stone-500 font-semibold uppercase">Guide Inquiries</span>
              <div className="text-2xl font-bold text-slate-900 font-mono-num">{stats.totalEnquiries}</div>
              <span className="text-[11px] text-stone-400">Direct Customer Leads</span>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-stone-200/90 shadow-xs space-y-1">
              <span className="text-xs text-stone-500 font-semibold uppercase">Reviews Moderated</span>
              <div className="text-2xl font-bold text-slate-900 font-mono-num">{stats.totalReviews}</div>
              <span className="text-[11px] text-teal-700">Verified Feedback</span>
            </div>
          </div>
        </div>
      )}

      {/* Tab: Guide Verifications */}
      {activeTab === 'verifications' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 font-serif-display">
              Pending Guide Verification Queue
            </h2>
            <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800">
              {pendingGuides.length} Requiring Moderation
            </span>
          </div>

          {pendingGuides.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200/90 space-y-2">
              <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
              <h3 className="text-base font-bold text-slate-900">All Guide Applications Processed</h3>
              <p className="text-xs text-stone-500">
                No guides are currently awaiting identity or credential verification.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {pendingGuides.map((g) => (
                <div
                  key={g.id}
                  className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="flex items-start gap-4">
                    <img
                      src={g.avatar}
                      alt={g.name}
                      className="w-14 h-14 rounded-full object-cover border border-stone-200 shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-slate-900">{g.name}</h3>
                        <span className="px-2 py-0.5 rounded-md bg-amber-50 text-amber-800 text-[11px] font-bold">
                          Pending Review
                        </span>
                      </div>
                      <div className="text-xs text-stone-600 flex items-center gap-3 flex-wrap">
                        <span>Location: <strong>{g.serviceLocation}</strong></span>
                        <span>Experience: <strong>{g.experienceYears} Years</strong></span>
                        <span>Daily Rate: <strong>₹{g.dailyRate}</strong></span>
                        <span>Phone: <strong>{g.phone || 'N/A'}</strong></span>
                      </div>
                      <div className="text-xs text-stone-500">
                        Verification Reference: <strong className="text-slate-800">{g.verificationDoc || 'Govt ID Submitted'}</strong>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      type="button"
                      onClick={() => handleVerifyGuide(g.id, 'verified')}
                      className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition-colors cursor-pointer"
                    >
                      <Check className="w-4 h-4" />
                      <span>Approve & Verify</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => handleVerifyGuide(g.id, 'rejected')}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold transition-colors cursor-pointer"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Reject</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Destinations */}
      {activeTab === 'destinations' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 font-serif-display">
              Destination Management ({destinations.length})
            </h2>
            <button
              type="button"
              onClick={() => setShowAddDestModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add New Destination</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {destinations.map((d) => (
              <div
                key={d.id}
                className="bg-white rounded-2xl border border-stone-200/90 overflow-hidden shadow-xs flex flex-col justify-between"
              >
                <div className="relative h-40 overflow-hidden">
                  <img src={d.image} alt={d.name} className="w-full h-full object-cover" />
                  <span className="absolute top-2.5 left-2.5 px-2.5 py-0.5 rounded-full bg-slate-900/70 text-white text-[11px] font-semibold backdrop-blur-xs">
                    {d.category}
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">{d.name}</h3>
                      <p className="text-xs text-stone-500">{d.state}, {d.country}</p>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-800 text-[11px] font-bold">
                      Published
                    </span>
                  </div>
                  <p className="text-xs text-stone-600 line-clamp-2">{d.description}</p>
                  <div className="pt-2 border-t border-stone-100 flex items-center justify-between text-xs">
                    <span className="text-stone-500 font-mono-num">{d.approxNightBudget}</span>
                    <button
                      type="button"
                      onClick={() => handleDeleteDestination(d.id, d.name)}
                      className="text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Packages */}
      {activeTab === 'packages' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 font-serif-display">
              Tour Packages ({packages.length})
            </h2>
            <button
              type="button"
              onClick={() => setShowAddPkgModal(true)}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-xs font-bold transition-colors cursor-pointer shadow-xs"
            >
              <Plus className="w-4 h-4" />
              <span>Add Tour Package</span>
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {packages.map((p) => (
              <div
                key={p.id}
                className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col justify-between space-y-3"
              >
                <div className="flex items-start gap-4">
                  <img
                    src={p.coverImage}
                    alt={p.title}
                    className="w-24 h-24 rounded-xl object-cover shrink-0"
                  />
                  <div className="space-y-1">
                    <span className="text-[11px] font-bold text-[#0D9488] uppercase">{p.duration}</span>
                    <h3 className="text-base font-bold text-slate-900">{p.title}</h3>
                    <p className="text-xs text-stone-500">{p.destination}</p>
                    <div className="font-mono-num font-bold text-slate-900 text-sm">
                      ₹{p.pricePerPerson.toLocaleString('en-IN')}{' '}
                      <span className="text-xs font-normal text-stone-500">/ person</span>
                    </div>
                  </div>
                </div>
                <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                  <span className="text-xs text-stone-500">Provider: {p.providerName}</span>
                  <button
                    type="button"
                    onClick={() => handleDeletePackage(p.id, p.title)}
                    className="text-xs text-rose-600 hover:text-rose-800 font-semibold cursor-pointer"
                  >
                    Delete Package
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab: Bookings */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 font-serif-display">
              Customer Bookings ({bookings.length})
            </h2>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-10 text-center border border-stone-200/90">
              <p className="text-xs text-stone-500">No customer bookings submitted yet.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono-num font-bold text-xs text-[#0D9488] bg-teal-50 px-2 py-0.5 rounded-md">
                        {b.bookingRef}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{b.packageTitle}</h3>
                    </div>
                    <div className="text-xs text-stone-600 flex items-center gap-3 flex-wrap">
                      <span>Customer: <strong>{b.customerName}</strong> ({b.customerEmail})</span>
                      <span>Date: <strong>{b.travelDate}</strong></span>
                      <span>Travellers: <strong>{b.totalTravellers}</strong></span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 shrink-0">
                    <div className="text-right">
                      <div className="text-sm font-bold text-slate-900 font-mono-num">
                        ₹{b.totalAmount.toLocaleString('en-IN')}
                      </div>
                      <span className="text-[10px] text-stone-400">Total Charged</span>
                    </div>

                    <select
                      value={b.status}
                      onChange={(e) =>
                        handleUpdateBookingStatus(b.id, e.target.value as any)
                      }
                      className="px-3 py-1.5 rounded-xl border border-stone-200 text-xs font-semibold text-slate-900 bg-stone-50 cursor-pointer"
                    >
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab: Tickets & Enquiries */}
      {activeTab === 'enquiries' && (
        <div className="space-y-6">
          <div className="space-y-3">
            <h2 className="text-lg font-bold text-slate-900 font-serif-display">
              Support Desk Tickets ({tickets.length})
            </h2>
            {tickets.length === 0 ? (
              <p className="text-xs text-stone-400">No support tickets.</p>
            ) : (
              <div className="space-y-3">
                {tickets.map((t) => (
                  <div key={t.id} className="bg-white rounded-2xl border border-stone-200/90 p-4 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono-num font-bold text-[#0D9488]">{t.ticketRef}</span>
                      <span className="font-semibold text-slate-500">{t.category}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-900">{t.subject}</h4>
                    <p className="text-xs text-stone-600">{t.message}</p>
                    <div className="text-[11px] text-stone-400 flex justify-between pt-2 border-t border-stone-100">
                      <span>From: {t.name} ({t.email})</span>
                      <span>{new Date(t.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3 pt-4 border-t border-stone-200">
            <h2 className="text-lg font-bold text-slate-900 font-serif-display">
              Local Guide Inquiries ({enquiries.length})
            </h2>
            {enquiries.length === 0 ? (
              <p className="text-xs text-stone-400">No guide inquiries.</p>
            ) : (
              <div className="space-y-3">
                {enquiries.map((e) => (
                  <div key={e.id} className="bg-white rounded-2xl border border-stone-200/90 p-4 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-mono-num font-bold text-[#0D9488]">{e.enquiryRef}</span>
                      <span className="font-semibold text-slate-700">Guide: {e.guideName}</span>
                    </div>
                    <p className="text-xs text-stone-600">{e.message}</p>
                    <div className="text-[11px] text-stone-400 flex justify-between pt-2 border-t border-stone-100">
                      <span>Sender: {e.senderName} ({e.senderEmail}) · Travel: {e.requestedDate}</span>
                      <span className="capitalize font-semibold text-emerald-800">{e.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab: Audit Logs */}
      {activeTab === 'logs' && (
        <div className="space-y-4">
          <h2 className="text-xl font-bold text-slate-900 font-serif-display">
            Administrative Audit Trail
          </h2>
          <div className="bg-white rounded-2xl border border-stone-200/90 p-4 space-y-2">
            {logs.length === 0 ? (
              <p className="text-xs text-stone-400">No audit logs recorded.</p>
            ) : (
              logs.map((log) => (
                <div key={log.id} className="p-3 bg-stone-50 rounded-xl flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-slate-900 block">{log.action}</span>
                    <span className="text-stone-500">Actor: {log.actor}</span>
                  </div>
                  <span className="text-[11px] text-stone-400 font-mono-num">
                    {new Date(log.timestamp).toLocaleString()}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* Add Destination Modal */}
      {showAddDestModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add New Destination</h3>
            <form onSubmit={handleCreateDestination} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Destination Name (e.g. Hampi)"
                value={newDestName}
                onChange={(e) => setNewDestName(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
              <input
                type="text"
                required
                placeholder="State (e.g. Karnataka)"
                value={newDestState}
                onChange={(e) => setNewDestState(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
              <select
                value={newDestCategory}
                onChange={(e) => setNewDestCategory(e.target.value as any)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              >
                <option value="Pilgrimage">Pilgrimage</option>
                <option value="Hill Station">Hill Station</option>
                <option value="Coastal & Beach">Coastal & Beach</option>
                <option value="Heritage & Culture">Heritage & Culture</option>
                <option value="Nature & Wildlife">Nature & Wildlife</option>
                <option value="Adventure">Adventure</option>
              </select>
              <textarea
                placeholder="Short description..."
                value={newDestDesc}
                onChange={(e) => setNewDestDesc(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddDestModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0F1E36] text-white"
                >
                  Publish Destination
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Package Modal */}
      {showAddPkgModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 w-full max-w-lg shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900">Add Tour Package</h3>
            <form onSubmit={handleCreatePackage} className="space-y-3">
              <input
                type="text"
                required
                placeholder="Package Title"
                value={newPkgTitle}
                onChange={(e) => setNewPkgTitle(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
              <input
                type="text"
                required
                placeholder="Destination (e.g. Hampi, Karnataka)"
                value={newPkgDest}
                onChange={(e) => setNewPkgDest(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
              <div className="grid grid-cols-2 gap-2">
                <input
                  type="text"
                  placeholder="Duration (e.g. 3 Days / 2 Nights)"
                  value={newPkgDuration}
                  onChange={(e) => setNewPkgDuration(e.target.value)}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
                />
                <input
                  type="number"
                  placeholder="Price / Person"
                  value={newPkgPrice}
                  onChange={(e) => setNewPkgPrice(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs font-mono-num"
                />
              </div>
              <input
                type="text"
                placeholder="Highlights (comma separated)"
                value={newPkgHighlights}
                onChange={(e) => setNewPkgHighlights(e.target.value)}
                className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs"
              />
              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddPkgModal(false)}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-stone-200"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-xs font-bold rounded-xl bg-[#0F1E36] text-white"
                >
                  Publish Package
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
