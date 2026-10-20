import React, { useState } from 'react';
import {
  X,
  Calendar,
  Users,
  Mail,
  Phone,
  User,
  ShieldCheck,
  CheckCircle2,
  FileText,
  AlertCircle,
  Loader2,
  ArrowRight,
} from 'lucide-react';
import type { PackageItem, BookingSubmission } from '../types';

interface BookingEnquiryModalProps {
  packageItem: PackageItem | null;
  defaultEmail?: string;
  defaultName?: string;
  onClose: () => void;
  onSuccess: (bookingRef: string, packageTitle: string) => void;
}

export const BookingEnquiryModal: React.FC<BookingEnquiryModalProps> = ({
  packageItem,
  defaultEmail = '',
  defaultName = '',
  onClose,
  onSuccess,
}) => {
  if (!packageItem) return null;

  const [customerName, setCustomerName] = useState(defaultName || '');
  const [customerEmail, setCustomerEmail] = useState(defaultEmail || '');
  const [customerPhone, setCustomerPhone] = useState('');
  const [travelDate, setTravelDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 7);
    return d.toISOString().split('T')[0];
  });
  const [adults, setAdults] = useState<number>(2);
  const [children, setChildren] = useState<number>(0);
  const [seniors, setSeniors] = useState<number>(0);
  const [specialRequests, setSpecialRequests] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedBooking, setConfirmedBooking] = useState<{ bookingRef: string } | null>(null);

  const totalTravellers = adults + children + seniors;
  const baseRate = packageItem.pricePerPerson;
  // Children pay 75%, Seniors get 5% comfort concession
  const adultsTotal = adults * baseRate;
  const childrenTotal = children * Math.round(baseRate * 0.75);
  const seniorsTotal = seniors * Math.round(baseRate * 0.95);
  const subtotal = adultsTotal + childrenTotal + seniorsTotal;
  const gst = Math.round(subtotal * 0.05); // 5% GST for tour packages
  const grandTotal = subtotal + gst;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerName.trim()) {
      setError('Please provide your full contact name.');
      return;
    }
    if (!customerEmail.trim() || !customerEmail.includes('@')) {
      setError('Please provide a valid email address.');
      return;
    }
    if (!customerPhone.trim() || customerPhone.length < 8) {
      setError('Please provide a valid phone number for coordination.');
      return;
    }
    if (!travelDate) {
      setError('Please choose your preferred travel departure date.');
      return;
    }

    setSubmitting(true);
    setError(null);

    const submission: BookingSubmission = {
      packageId: packageItem.id,
      packageTitle: packageItem.title,
      destination: packageItem.destination,
      customerName: customerName.trim(),
      customerEmail: customerEmail.trim().toLowerCase(),
      customerPhone: customerPhone.trim(),
      travelDate,
      adults,
      children,
      seniors,
      totalTravellers,
      totalAmount: grandTotal,
      specialRequests: specialRequests.trim(),
    };

    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(submission),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to submit booking');
      }

      setConfirmedBooking(data.booking);
      onSuccess(data.booking.bookingRef, packageItem.title);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Server error occurred while creating booking');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200/90 w-full max-w-xl max-h-[92vh] flex flex-col overflow-hidden">
        {/* Modal Header */}
        <div className="p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div>
            <span className="text-[11px] font-semibold text-emerald-800 uppercase tracking-wider">
              Package Reservation & Inquiry
            </span>
            <h3 className="text-base sm:text-lg font-bold text-slate-900 line-clamp-1">
              {packageItem.title}
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedBooking ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div>
              <h4 className="text-xl font-bold text-slate-900">Booking Request Confirmed!</h4>
              <p className="text-xs text-stone-600 mt-1">
                Your reference code is:
              </p>
              <div className="mt-2 inline-block px-4 py-1.5 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 font-mono text-sm font-bold tracking-wider">
                {confirmedBooking.bookingRef}
              </div>
            </div>
            <p className="text-xs text-stone-500 max-w-md mx-auto leading-relaxed">
              We have dispatched this booking request to <span className="font-semibold text-slate-800">{packageItem.providerName}</span>. A dedicated coordinator will reach out via email (<span className="text-slate-800">{customerEmail}</span>) within 4 business hours to finalize pickup and vouchers.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-4 px-6 py-2.5 rounded-xl bg-[#0D4A42] hover:bg-[#09352F] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Done & Return to Trip
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 sm:p-6 overflow-y-auto space-y-5">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            {/* Travel Date & Travelers Count */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Preferred Travel Date *
                </label>
                <div className="relative">
                  <Calendar className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={travelDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setTravelDate(e.target.value)}
                    required
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D4A42]/20"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-800 mb-1">
                  Duration & Destination
                </label>
                <div className="py-2 px-3 bg-stone-100 rounded-xl text-xs font-medium text-slate-700 truncate">
                  {packageItem.duration} · {packageItem.destination}
                </div>
              </div>
            </div>

            {/* Travelers Breakdown */}
            <div>
              <label className="block text-xs font-semibold text-slate-800 mb-1.5 flex items-center justify-between">
                <span>Number of Travellers</span>
                <span className="text-[11px] font-normal text-stone-500">Total: {totalTravellers} people</span>
              </label>

              <div className="grid grid-cols-3 gap-3">
                <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-center">
                  <span className="text-[11px] font-medium text-stone-500 block">Adults</span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setAdults(Math.max(1, adults - 1))}
                      className="w-6 h-6 rounded-md bg-white border border-stone-300 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-slate-900 w-4">{adults}</span>
                    <button
                      type="button"
                      onClick={() => setAdults(adults + 1)}
                      className="w-6 h-6 rounded-md bg-white border border-stone-300 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-center">
                  <span className="text-[11px] font-medium text-stone-500 block">Children</span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setChildren(Math.max(0, children - 1))}
                      className="w-6 h-6 rounded-md bg-white border border-stone-300 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-slate-900 w-4">{children}</span>
                    <button
                      type="button"
                      onClick={() => setChildren(children + 1)}
                      className="w-6 h-6 rounded-md bg-white border border-stone-300 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>

                <div className="p-2.5 bg-stone-50 border border-stone-200 rounded-xl text-center">
                  <span className="text-[11px] font-medium text-stone-500 block">Seniors (60+)</span>
                  <div className="flex items-center justify-center gap-2 mt-1">
                    <button
                      type="button"
                      onClick={() => setSeniors(Math.max(0, seniors - 1))}
                      className="w-6 h-6 rounded-md bg-white border border-stone-300 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      -
                    </button>
                    <span className="text-xs font-bold text-slate-900 w-4">{seniors}</span>
                    <button
                      type="button"
                      onClick={() => setSeniors(seniors + 1)}
                      className="w-6 h-6 rounded-md bg-white border border-stone-300 text-xs font-bold text-slate-700 cursor-pointer"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Customer Contact Details */}
            <div className="space-y-3 pt-2 border-t border-stone-100">
              <h4 className="text-xs font-bold text-stone-400 uppercase tracking-wider">
                Lead Passenger Contact Info
              </h4>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Full Name *</label>
                <div className="relative">
                  <User className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="e.g. Ramesh Rao"
                    required
                    className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D4A42]/20"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Address *</label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="email"
                      value={customerEmail}
                      onChange={(e) => setCustomerEmail(e.target.value)}
                      placeholder="name@email.com"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D4A42]/20"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <div className="relative">
                    <Phone className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="+91 98765 43210"
                      required
                      className="w-full pl-9 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D4A42]/20"
                    />
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">
                  Special Requests / Pickup Notes (Optional)
                </label>
                <textarea
                  value={specialRequests}
                  onChange={(e) => setSpecialRequests(e.target.value)}
                  placeholder="Need wheelchair assistance for elderly parent, ground floor rooms, dietary preferences..."
                  rows={2}
                  className="w-full px-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-2 focus:ring-[#0D4A42]/20 resize-none"
                />
              </div>
            </div>

            {/* Transparent Pricing Summary */}
            <div className="p-3.5 rounded-xl bg-stone-50 border border-stone-200 text-xs space-y-1.5">
              <div className="flex justify-between text-stone-600">
                <span>Base Package ({adults} Adults × ₹{baseRate.toLocaleString('en-IN')})</span>
                <span>₹{adultsTotal.toLocaleString('en-IN')}</span>
              </div>
              {children > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Children ({children} × ₹{Math.round(baseRate * 0.75).toLocaleString('en-IN')})</span>
                  <span>₹{childrenTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              {seniors > 0 && (
                <div className="flex justify-between text-stone-600">
                  <span>Seniors ({seniors} × ₹{Math.round(baseRate * 0.95).toLocaleString('en-IN')})</span>
                  <span>₹{seniorsTotal.toLocaleString('en-IN')}</span>
                </div>
              )}
              <div className="flex justify-between text-stone-600">
                <span>GST (5% Tourism Service Surcharge)</span>
                <span>₹{gst.toLocaleString('en-IN')}</span>
              </div>
              <div className="pt-2 border-t border-stone-200 flex justify-between font-bold text-slate-900 text-sm">
                <span>Estimated Total</span>
                <span className="text-[#0D4A42]">₹{grandTotal.toLocaleString('en-IN')}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="pt-2 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-slate-900 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={submitting}
                className="inline-flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#0D4A42] hover:bg-[#09352F] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Submitting Booking...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4 text-emerald-300" />
                    <span>Confirm Booking Request (₹{grandTotal.toLocaleString('en-IN')})</span>
                  </>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
