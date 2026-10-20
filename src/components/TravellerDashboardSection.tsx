import React, { useState, useEffect } from 'react';
import {
  UserCircle,
  MapPin,
  Calendar,
  Wallet,
  Clock,
  Compass,
  Package,
  Heart,
  Share2,
  Trash2,
  ExternalLink,
  CheckCircle2,
  AlertCircle,
  MessageCircle,
  UserCheck,
  ChevronRight,
  ArrowRight,
  RefreshCw,
  Edit3,
} from 'lucide-react';
import type {
  SavedTripRecord,
  BookingRecordItem,
  GuideEnquiryItem,
  PopularDestination,
  PackageItem,
  DestinationItem,
} from '../types';

interface TravellerDashboardSectionProps {
  user: { id: string; name: string; email: string; role?: string };
  onOpenTrip: (trip: SavedTripRecord) => void;
  onExploreDestination: (destName: string) => void;
  onBookPackage: (packageTitle: string) => void;
  onNavigate: (section: any) => void;
  wishlistDestinations?: string[];
  wishlistPackages?: string[];
  onToggleWishlistDest?: (id: string) => void;
  onToggleWishlistPkg?: (id: string) => void;
}

export const TravellerDashboardSection: React.FC<TravellerDashboardSectionProps> = ({
  user,
  onOpenTrip,
  onExploreDestination,
  onBookPackage,
  onNavigate,
  wishlistDestinations = [],
  wishlistPackages = [],
  onToggleWishlistDest,
  onToggleWishlistPkg,
}) => {
  const [activeTab, setActiveTab] = useState<'trips' | 'bookings' | 'enquiries' | 'wishlist' | 'profile'>('trips');
  const [savedTrips, setSavedTrips] = useState<SavedTripRecord[]>([]);
  const [bookings, setBookings] = useState<BookingRecordItem[]>([]);
  const [enquiries, setEnquiries] = useState<GuideEnquiryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3500);
  };

  const loadUserData = async () => {
    setLoading(true);
    try {
      // 1. Fetch saved trips
      try {
        const resTrips = await fetch(`/api/trips?userId=${encodeURIComponent(user.id)}`);
        if (resTrips.ok) {
          const data = await resTrips.json();
          setSavedTrips(data.trips || []);
        }
      } catch {}

      // 2. Fetch bookings
      try {
        const resBookings = await fetch(`/api/bookings?email=${encodeURIComponent(user.email)}`);
        if (resBookings.ok) {
          const data = await resBookings.json();
          setBookings(data.bookings || []);
        }
      } catch {}

      // 3. Fetch guide enquiries
      try {
        const resEnq = await fetch('/api/admin/enquiries');
        if (resEnq.ok) {
          const data = await resEnq.json();
          const userEnquiries = (data.enquiries || []).filter(
            (e: GuideEnquiryItem) => e.senderEmail.toLowerCase() === user.email.toLowerCase()
          );
          setEnquiries(userEnquiries);
        }
      } catch {}
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user.id, user.email]);

  const handleDeleteTrip = async (tripId: string, title: string) => {
    if (!window.confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      const res = await fetch(`/api/trips/${tripId}`, { method: 'DELETE' });
      if (res.ok) {
        setSavedTrips((prev) => prev.filter((t) => t.id !== tripId));
        showToast(`✓ Removed saved trip "${title}"`);
      }
    } catch {
      showToast('Failed to delete trip. Please try again.');
    }
  };

  const handleShareTrip = (trip: SavedTripRecord) => {
    const shareUrl = `${window.location.origin}/?dest=${encodeURIComponent(trip.destination)}&tripId=${trip.id}`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(shareUrl);
      showToast('✓ Shareable trip link copied to clipboard!');
    } else {
      showToast(`Share Link: ${shareUrl}`);
    }
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-200">
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 px-4 py-3 bg-[#0F1E36] text-white text-xs font-semibold rounded-2xl shadow-xl border border-teal-500/30 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-teal-400" />
          <span>{toastMsg}</span>
        </div>
      )}

      {/* Hero Header Card */}
      <div className="bg-gradient-to-r from-[#0F1E36] via-[#1E3A8A] to-[#0D9488] rounded-3xl p-6 sm:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 rounded-2xl bg-white/15 flex items-center justify-center text-teal-300 font-bold text-2xl border border-white/20 shadow-md">
              <UserCircle className="w-10 h-10" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <h1 className="text-2xl sm:text-3xl font-bold font-serif-display">{user.name}</h1>
                <span className="px-2.5 py-0.5 rounded-full bg-teal-400/20 text-teal-200 text-xs font-bold border border-teal-300/30 capitalize">
                  {user.role || 'Verified Traveller'}
                </span>
              </div>
              <p className="text-xs text-stone-200 mt-1">{user.email}</p>
              <div className="flex items-center gap-4 text-xs text-stone-300 mt-2 font-mono-num">
                <span>{savedTrips.length} Saved Trips</span>
                <span>•</span>
                <span>{bookings.length} Bookings</span>
                <span>•</span>
                <span>{enquiries.length} Guide Inquiries</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={loadUserData}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold backdrop-blur-xs transition-colors cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
              <span>Refresh</span>
            </button>
            <button
              type="button"
              onClick={() => onNavigate('builder')}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#0D9488] hover:bg-[#0f766e] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
            >
              <Compass className="w-4 h-4" />
              <span>Plan a New Trip</span>
            </button>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-stone-200">
        <button
          type="button"
          onClick={() => setActiveTab('trips')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'trips'
              ? 'bg-[#0F1E36] text-white shadow-sm'
              : 'text-slate-600 hover:bg-stone-100'
          }`}
        >
          <Compass className="w-4 h-4" />
          <span>My Saved Trips ({savedTrips.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('bookings')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'bookings'
              ? 'bg-[#0F1E36] text-white shadow-sm'
              : 'text-slate-600 hover:bg-stone-100'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>Booking History ({bookings.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('enquiries')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'enquiries'
              ? 'bg-[#0F1E36] text-white shadow-sm'
              : 'text-slate-600 hover:bg-stone-100'
          }`}
        >
          <MessageCircle className="w-4 h-4" />
          <span>Guide Inquiries ({enquiries.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('wishlist')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'wishlist'
              ? 'bg-[#0F1E36] text-white shadow-sm'
              : 'text-slate-600 hover:bg-stone-100'
          }`}
        >
          <Heart className="w-4 h-4" />
          <span>Wishlist ({wishlistDestinations.length + wishlistPackages.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab('profile')}
          className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-colors whitespace-nowrap cursor-pointer ${
            activeTab === 'profile'
              ? 'bg-[#0F1E36] text-white shadow-sm'
              : 'text-slate-600 hover:bg-stone-100'
          }`}
        >
          <UserCircle className="w-4 h-4" />
          <span>Profile & Settings</span>
        </button>
      </div>

      {/* Tab 1: Saved Trips */}
      {activeTab === 'trips' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 font-serif-display">
              Saved Itineraries & Trips
            </h2>
            <p className="text-xs text-stone-500">
              Reopen, customize, and share itineraries anytime
            </p>
          </div>

          {savedTrips.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/90 shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D9488] flex items-center justify-center mx-auto">
                <Compass className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Saved Trips Yet</h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
                Generate a custom day-by-day travel plan with our AI trip planner and click "Save Trip" to keep it here.
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => onNavigate('builder')}
                  className="px-6 py-2.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Open Trip Planner
                </button>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {savedTrips.map((trip) => (
                <div
                  key={trip.id}
                  className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs hover:shadow-md transition-shadow flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-1.5 text-xs text-[#0D9488] font-semibold">
                          <MapPin className="w-3.5 h-3.5 shrink-0" />
                          <span>{trip.destination}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-900 mt-1">{trip.title}</h3>
                      </div>
                      <span className="px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 text-[11px] font-mono-num shrink-0">
                        {trip.travellers} Pax
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-xs text-stone-600 pt-2 border-t border-stone-100 font-mono-num">
                      <div>
                        <span className="text-[11px] text-stone-400 block">Travel Date</span>
                        <span className="font-semibold text-slate-800">{trip.travelDate}</span>
                      </div>
                      <div>
                        <span className="text-[11px] text-stone-400 block">Estimated Budget</span>
                        <span className="font-semibold text-[#0D9488]">
                          ₹{(trip.budget || 25000).toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>

                    {trip.notes && (
                      <p className="text-xs text-stone-500 italic line-clamp-2">
                        "{trip.notes}"
                      </p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-stone-100 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1">
                      <button
                        type="button"
                        onClick={() => handleShareTrip(trip)}
                        title="Copy Share Link"
                        className="p-2 rounded-lg text-stone-600 hover:text-slate-900 hover:bg-stone-100 transition-colors cursor-pointer"
                      >
                        <Share2 className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteTrip(trip.id, trip.title)}
                        title="Delete Trip"
                        className="p-2 rounded-lg text-rose-500 hover:text-rose-700 hover:bg-rose-50 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>

                    <button
                      type="button"
                      onClick={() => onOpenTrip(trip)}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-xs font-semibold transition-colors cursor-pointer"
                    >
                      <span>Open Planner</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 2: Booking History */}
      {activeTab === 'bookings' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 font-serif-display">
              Tour Package Bookings & Enquiries
            </h2>
            <p className="text-xs text-stone-500">
              Direct booking references recorded in our platform database
            </p>
          </div>

          {bookings.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/90 shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D9488] flex items-center justify-center mx-auto">
                <Package className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Bookings Found</h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
                You haven't submitted any package booking requests yet. Browse our verified tour packages and book seamlessly.
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => onNavigate('packages')}
                  className="px-6 py-2.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Browse Tour Packages
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {bookings.map((b) => (
                <div
                  key={b.id}
                  className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-mono-num font-bold text-xs text-[#0D9488] bg-teal-50 px-2.5 py-0.5 rounded-md">
                        {b.bookingRef}
                      </span>
                      <span
                        className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                          b.status === 'confirmed'
                            ? 'bg-emerald-100 text-emerald-800'
                            : b.status === 'cancelled'
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {b.status}
                      </span>
                      <span className="text-xs text-stone-400">
                        Submitted: {new Date(b.createdAt).toLocaleDateString()}
                      </span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{b.packageTitle}</h3>
                    <div className="text-xs text-stone-600 flex items-center gap-4 flex-wrap">
                      <span>Destination: <strong>{b.destination}</strong></span>
                      <span>Travel Date: <strong>{b.travelDate}</strong></span>
                      <span>Travellers: <strong>{b.totalTravellers} ({b.adults} Adults, {b.children} Children, {b.seniors} Seniors)</strong></span>
                    </div>
                  </div>

                  <div className="text-left md:text-right shrink-0">
                    <div className="text-[11px] text-stone-500 uppercase tracking-wider font-semibold">Total Amount</div>
                    <div className="text-xl font-bold text-slate-900 font-mono-num">
                      ₹{b.totalAmount.toLocaleString('en-IN')}
                    </div>
                    <span className="text-[11px] text-emerald-700">Verified Platform Tariff</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 3: Guide Inquiries */}
      {activeTab === 'enquiries' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 font-serif-display">
              Local Guide Inquiries
            </h2>
            <p className="text-xs text-stone-500">
              Direct communications with verified local tour guides
            </p>
          </div>

          {enquiries.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/90 shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-teal-50 text-[#0D9488] flex items-center justify-center mx-auto">
                <MessageCircle className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">No Guide Inquiries</h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
                Connect directly with certified local guides to arrange custom walks, temple facilitation, or private transport.
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => onNavigate('guides')}
                  className="px-6 py-2.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Explore Local Guides
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {enquiries.map((enq) => (
                <div
                  key={enq.id}
                  className="bg-white rounded-2xl border border-stone-200/90 p-5 shadow-xs space-y-3"
                >
                  <div className="flex items-center justify-between gap-3 flex-wrap">
                    <div className="flex items-center gap-2">
                      <span className="font-mono-num font-bold text-xs text-[#0D9488] bg-teal-50 px-2.5 py-0.5 rounded-md">
                        {enq.enquiryRef}
                      </span>
                      <span className="font-bold text-slate-900 text-sm">
                        To Guide: {enq.guideName}
                      </span>
                    </div>
                    <span
                      className={`text-[11px] font-bold uppercase px-2.5 py-0.5 rounded-full ${
                        enq.status === 'replied'
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {enq.status === 'replied' ? '✓ Replied by Guide' : 'Pending Guide Response'}
                    </span>
                  </div>

                  <div className="text-xs text-stone-600 flex items-center gap-4 flex-wrap">
                    <span>Requested Date: <strong>{enq.requestedDate}</strong></span>
                    <span>Group Size: <strong>{enq.groupSize} Persons</strong></span>
                    <span>Sent: {new Date(enq.createdAt).toLocaleDateString()}</span>
                  </div>

                  <div className="p-3 bg-stone-50 rounded-xl text-xs text-slate-700">
                    <span className="font-bold text-stone-500 block mb-1">Your Inquiry:</span>
                    <p>{enq.message}</p>
                  </div>

                  {enq.replyMessage && (
                    <div className="p-3.5 bg-emerald-50/80 border border-emerald-200 rounded-xl text-xs text-emerald-950 space-y-1">
                      <div className="font-bold flex items-center gap-1.5 text-emerald-900">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Guide Reply ({new Date(enq.repliedAt || '').toLocaleDateString()}):</span>
                      </div>
                      <p className="leading-relaxed">{enq.replyMessage}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Tab 4: Wishlist */}
      {activeTab === 'wishlist' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-slate-900 font-serif-display">
              Saved Wishlist
            </h2>
            <p className="text-xs text-stone-500">
              Destinations & tour packages you have favorited
            </p>
          </div>

          {wishlistDestinations.length === 0 && wishlistPackages.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border border-stone-200/90 shadow-xs space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center mx-auto">
                <Heart className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900">Your Wishlist is Empty</h3>
              <p className="text-xs sm:text-sm text-stone-500 max-w-sm mx-auto">
                Click the heart icon on any destination or tour package card across the platform to save it to your wishlist.
              </p>
              <div>
                <button
                  type="button"
                  onClick={() => onNavigate('dashboard')}
                  className="px-6 py-2.5 rounded-xl bg-[#0F1E36] hover:bg-[#1E3A8A] text-white text-xs font-bold transition-all shadow-md cursor-pointer"
                >
                  Explore Destinations
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {wishlistDestinations.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
                    Favorite Destinations ({wishlistDestinations.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {wishlistDestinations.map((d) => (
                      <div
                        key={d}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-slate-800 shadow-xs"
                      >
                        <MapPin className="w-3.5 h-3.5 text-[#0D9488]" />
                        <span>{d}</span>
                        <button
                          type="button"
                          onClick={() => onExploreDestination(d)}
                          className="text-[#0D9488] hover:underline ml-1"
                        >
                          Explore →
                        </button>
                        {onToggleWishlistDest && (
                          <button
                            type="button"
                            onClick={() => onToggleWishlistDest(d)}
                            className="text-stone-400 hover:text-rose-500 ml-1"
                            title="Remove from wishlist"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {wishlistPackages.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
                    Favorite Packages ({wishlistPackages.length})
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {wishlistPackages.map((p) => (
                      <div
                        key={p}
                        className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-white border border-stone-200 text-xs font-semibold text-slate-800 shadow-xs"
                      >
                        <Package className="w-3.5 h-3.5 text-amber-600" />
                        <span>{p}</span>
                        <button
                          type="button"
                          onClick={() => onBookPackage(p)}
                          className="text-[#0D9488] hover:underline ml-1"
                        >
                          Book →
                        </button>
                        {onToggleWishlistPkg && (
                          <button
                            type="button"
                            onClick={() => onToggleWishlistPkg(p)}
                            className="text-stone-400 hover:text-rose-500 ml-1"
                            title="Remove from wishlist"
                          >
                            ×
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Tab 5: Profile & Settings */}
      {activeTab === 'profile' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-stone-200/90 shadow-xs max-w-2xl space-y-6">
          <h2 className="text-xl font-bold text-slate-900 font-serif-display">
            Account Information
          </h2>

          <div className="space-y-4 text-xs text-slate-700">
            <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-stone-500">Full Name</span>
                <span className="font-bold text-slate-900">{user.name}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-stone-500">Email Address</span>
                <span className="font-bold text-slate-900">{user.email}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-stone-500">Account Role</span>
                <span className="font-bold text-teal-800 capitalize">{user.role || 'Traveler'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-stone-500">Authentication</span>
                <span className="font-semibold text-emerald-700">Verified Session</span>
              </div>
            </div>

            <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl text-xs text-teal-950 space-y-1">
              <div className="font-bold flex items-center gap-1.5 text-teal-900">
                <CheckCircle2 className="w-4 h-4 text-teal-600" />
                <span>Account Protection Guarantee</span>
              </div>
              <p className="text-teal-800 leading-relaxed">
                Your email and saved itineraries are strictly encrypted and never sold to third-party telemarketers.
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
