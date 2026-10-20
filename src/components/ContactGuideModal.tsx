import React, { useState } from 'react';
import {
  X,
  Calendar,
  Users,
  Mail,
  Phone,
  User,
  MessageSquare,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ShieldCheck,
  Star,
} from 'lucide-react';
import type { LocalGuideItem } from '../types';

interface ContactGuideModalProps {
  guide: LocalGuideItem | null;
  defaultEmail?: string;
  defaultName?: string;
  onClose: () => void;
  onSuccess: (enquiryRef: string, guideName: string) => void;
}

export const ContactGuideModal: React.FC<ContactGuideModalProps> = ({
  guide,
  defaultEmail = '',
  defaultName = '',
  onClose,
  onSuccess,
}) => {
  if (!guide) return null;

  const [senderName, setSenderName] = useState(defaultName || '');
  const [senderEmail, setSenderEmail] = useState(defaultEmail || '');
  const [senderPhone, setSenderPhone] = useState('');
  const [requestedDate, setRequestedDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 5);
    return d.toISOString().split('T')[0];
  });
  const [groupSize, setGroupSize] = useState<number>(3);
  const [message, setMessage] = useState(
    `Hello ${guide.name}, I would like to check your availability for custom local guiding in ${guide.serviceLocation}. We are a group of ${groupSize}.`
  );
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [confirmedEnquiry, setConfirmedEnquiry] = useState<{ enquiryRef: string } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!senderName.trim() || !senderEmail.trim() || !requestedDate) {
      setError('Please provide your name, email, and requested travel date.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const res = await fetch(`/api/guides/${guide.id}/enquiry`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          senderName: senderName.trim(),
          senderEmail: senderEmail.trim().toLowerCase(),
          senderPhone: senderPhone.trim(),
          requestedDate,
          groupSize,
          message: message.trim(),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to send inquiry to guide');
      }

      setConfirmedEnquiry(data.enquiry);
      onSuccess(data.enquiry.enquiryRef, guide.name);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Server error occurred');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-stone-200/90 w-full max-w-lg max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="p-4 sm:p-5 border-b border-stone-100 flex items-center justify-between bg-stone-50/70">
          <div className="flex items-center gap-3">
            <img
              src={guide.avatar}
              alt={guide.name}
              className="w-10 h-10 rounded-full object-cover border border-stone-200 shrink-0"
            />
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="text-sm sm:text-base font-bold text-slate-900">{guide.name}</h3>
                {guide.verificationStatus === 'verified' && (
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 inline" />
                )}
              </div>
              <p className="text-[11px] text-stone-500">{guide.serviceLocation} · ₹{guide.dailyRate}/day</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-stone-200 text-stone-500 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedEnquiry ? (
          <div className="p-6 sm:p-8 text-center space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h4 className="text-lg font-bold text-slate-900">Inquiry Dispatched!</h4>
              <p className="text-xs text-stone-600 mt-1">
                Your direct enquiry reference:
              </p>
              <div className="mt-2 inline-block px-3.5 py-1 rounded-lg bg-emerald-50 border border-emerald-300 text-emerald-900 font-mono text-xs font-bold tracking-wider">
                {confirmedEnquiry.enquiryRef}
              </div>
            </div>
            <p className="text-xs text-stone-500 max-w-sm mx-auto leading-relaxed">
              We notified <span className="font-semibold text-slate-800">{guide.name}</span>. You can track this conversation in your Traveler Dashboard or wait for an email reply to <span className="text-slate-800">{senderEmail}</span>.
            </p>
            <button
              type="button"
              onClick={onClose}
              className="mt-2 px-5 py-2 rounded-xl bg-[#0D4A42] hover:bg-[#09352F] text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              Close
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4">
            {error && (
              <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Requested Date *</label>
                <div className="relative">
                  <Calendar className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="date"
                    value={requestedDate}
                    min={new Date().toISOString().split('T')[0]}
                    onChange={(e) => setRequestedDate(e.target.value)}
                    required
                    className="w-full pl-8 pr-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D4A42]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Group Size</label>
                <div className="relative">
                  <Users className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="number"
                    min={1}
                    max={25}
                    value={groupSize}
                    onChange={(e) => setGroupSize(Number(e.target.value))}
                    required
                    className="w-full pl-8 pr-2.5 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D4A42]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Your Full Name *</label>
              <div className="relative">
                <User className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={senderName}
                  onChange={(e) => setSenderName(e.target.value)}
                  placeholder="e.g. Madhuri Rao"
                  required
                  className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D4A42]"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Email Address *</label>
                <div className="relative">
                  <Mail className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    placeholder="you@email.com"
                    required
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D4A42]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-700 mb-1">Phone Number</label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    value={senderPhone}
                    onChange={(e) => setSenderPhone(e.target.value)}
                    placeholder="+91..."
                    className="w-full pl-8 pr-3 py-2 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D4A42]"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 mb-1">Your Message / Questions</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                rows={3}
                required
                className="w-full p-3 bg-stone-50 border border-stone-200 rounded-xl text-xs text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0D4A42] resize-none"
              />
            </div>

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
                className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0D4A42] hover:bg-[#09352F] text-white text-xs font-semibold shadow-xs transition-colors disabled:opacity-60 cursor-pointer"
              >
                {submitting ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Sending...</span>
                  </>
                ) : (
                  <>
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Send Inquiry</span>
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
